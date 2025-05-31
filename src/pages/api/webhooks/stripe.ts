// File: /src/pages/api/webhooks/stripe.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { buffer } from "micro";
import Stripe from "stripe";
import { db as prisma } from "@/server/db";
import { Prisma } from "@prisma/client"; // ← for Prisma.Decimal

// 1. Initialize Stripe with your secret key (same API version you use elsewhere)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-05-28.basil",
});

// 2. Pull in your webhook signing secret from .env
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// 3. Disable Next.js’s bodyParser so we can get the raw request body
export const config = {
    api: {
        bodyParser: false,
    },
};

type ResponseData = {
    received: boolean;
};

/**
 * Webhook handler for Stripe Payment Link events:
 *   • payment.link.paid
 *   • payment.link.expired
 *
 * On `payment.link.paid`:
 *   1. Update StripeLink.status → "ACCEPTED"
 *   2. If metadata.isContribute === "true" && metadata.eventArticleId exists:
 *        • Insert a new row into `Contribution`
 *   3. Deactivate (archive) the Payment Link in Stripe
 *
 * On `payment.link.expired`:
 *   1. Update StripeLink.status → "EXPIRED"
 *   2. Deactivate the Payment Link in Stripe
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    // Only allow POST
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).end("Method Not Allowed");
    }

    // 1. Read raw request body as Buffer
    let buf: Buffer;
    try {
        buf = await buffer(req);
    } catch (err: any) {
        console.error("Error reading raw body:", err);
        return res.status(400).json({ received: false });
    }

    // 2. Verify the Stripe signature header
    const sig = req.headers["stripe-signature"];
    if (!sig) {
        console.error("Missing stripe-signature header");
        return res.status(400).json({ received: false });
    }

    // 3. Attempt to construct the Event object
    let event: any; // <-- loosened typing so TS won’t complain about event.type
    try {
        event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err: any) {
        console.error("⚠️  Webhook signature verification failed:", err.message);
        return res.status(400).json({ received: false });
    }

    // 4. Handle the event by type
    switch (event.type as string) {
        // ────── When a Payment Link is paid ──────
        case "payment.link.paid": {
            // 4a. `event.data.object` is a Stripe.PaymentLink
            const paymentLinkObj = event.data.object as Stripe.PaymentLink;
            const paymentLinkId = paymentLinkObj.id; // e.g. "plink_1AbCdEfGhIJKLmNoPqRsTuVw"
            console.log("🔔 payment.link.paid for Payment Link:", paymentLinkId);

            // 4b. Update our StripeLink row → status = "ACCEPTED"
            try {
                await prisma.stripeLink.updateMany({
                    where: {
                        stripePaymentLinkId: paymentLinkId,
                        status: "PENDING",
                    },
                    data: {
                        status: "ACCEPTED",
                        updatedAt: new Date(),
                    },
                });
            } catch (dbErr) {
                console.error("Prisma error updating StripeLink to ACCEPTED:", dbErr);
                // We do NOT return 500 here; we want to reply 200 to Stripe so it stops retrying
            }

            // 4c. Check metadata to decide if we must create a Contribution
            const md = paymentLinkObj.metadata;
            const isContribute = md.isContribute === "true";
            const rawEventArticleId = md.eventArticleId;
            const rawEventId = md.eventId;
            const rawItemId = md.itemId;
            const purchaserUsername = md.purchaserUsername!;
            const rawAmountRON = md.amountRON;

            const eventArticleId = rawEventArticleId
                ? parseInt(rawEventArticleId, 10)
                : undefined;
            const eventId = rawEventId ? parseInt(rawEventId, 10) : undefined;
            const itemId = rawItemId ? parseInt(rawItemId, 10) : undefined;
            const amountRON = rawAmountRON
                ? parseFloat(rawAmountRON)
                : undefined;

            if (isContribute && eventArticleId && amountRON !== undefined) {
                try {
                    await prisma.contribution.create({
                        data: {
                            guestUsername: purchaserUsername,
                            eventId: eventId ?? null,
                            articleId: eventArticleId,
                            itemId: itemId ?? null,
                            cashAmount: new Prisma.Decimal(amountRON.toString()),
                            currency: "ron",
                        },
                    });
                } catch (dbErr) {
                    console.error("Prisma error creating Contribution:", dbErr);
                    // Again: do not abort the webhook, just log
                }
            }

            // 4d. Deactivate (archive) the Payment Link in Stripe
            //      so it can’t be used again.
            try {
                await stripe.paymentLinks.update(paymentLinkId, { active: false });
            } catch (stripeErr) {
                console.error(
                    "Stripe error deactivating link on payment.link.paid:",
                    stripeErr
                );
            }

            break;
        }

        // ────── When a Payment Link expires ──────
        case "payment.link.expired": {
            const paymentLinkObj = event.data.object as Stripe.PaymentLink;
            const paymentLinkId = paymentLinkObj.id; // e.g. "plink_1AbCdEfGhIJKLmNoPqRsTuVw"
            console.log("🔔 payment.link.expired for Payment Link:", paymentLinkId);

            // 4e. Update our StripeLink row → status = "EXPIRED"
            try {
                await prisma.stripeLink.updateMany({
                    where: {
                        stripePaymentLinkId: paymentLinkId,
                        status: "PENDING",
                    },
                    data: {
                        status: "EXPIRED",
                        updatedAt: new Date(),
                    },
                });
            } catch (dbErr) {
                console.error("Prisma error updating StripeLink to EXPIRED:", dbErr);
            }

            // 4f. Deactivate (archive) the link in Stripe, if not already gone
            try {
                await stripe.paymentLinks.update(paymentLinkId, { active: false });
            } catch (stripeErr) {
                console.error(
                    "Stripe error deactivating link on payment.link.expired:",
                    stripeErr
                );
            }

            break;
        }

        // ────── All other event types we don’t care about ──────
        default:
            console.log(`⚪️  Unhandled event type: ${event.type}`);
    }

    // 5. Return 200 to acknowledge receipt
    res.status(200).json({ received: true });
}
