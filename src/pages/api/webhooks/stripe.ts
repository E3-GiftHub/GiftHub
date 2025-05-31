// File: /src/pages/api/webhooks/stripe.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { buffer } from "micro";
import Stripe from "stripe";
import { db as prisma } from "@/server/db";
import { Prisma } from "@prisma/client";

// Import your ContributionsTransfer service
import { processEventItemContributions } from "@/server/services/ContributionsTransfer";

// 1. Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-05-28.basil",
});

// 2. Grab your webhook signing secret from environment
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// 3. Disable Next.js’s built-in bodyParser, so we can get raw request body
export const config = {
    api: {
        bodyParser: false,
    },
};

type ResponseData = {
    received: boolean;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    // Only allow POST
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).end("Method Not Allowed");
    }

    // 1. Read raw request body into a Buffer
    let buf: Buffer;
    try {
        buf = await buffer(req);
    } catch (err: any) {
        console.error("Error reading raw body:", err);
        return res.status(400).json({ received: false });
    }

    // 2. Verify Stripe signature header
    const sig = req.headers["stripe-signature"];
    if (!sig) {
        console.error("Missing stripe-signature header");
        return res.status(400).json({ received: false });
    }

    // 3. Parse & verify the event
    let event: any;
    try {
        event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err: any) {
        console.error("⚠️  Webhook signature verification failed:", err.message);
        return res.status(400).json({ received: false });
    }

    // 4. Handle relevant event types
    switch (event.type as string) {
        // ────── When a Payment Link is paid ──────
        case "payment.link.paid": {
            const paymentLinkObj = event.data.object as Stripe.PaymentLink;
            const paymentLinkId = paymentLinkObj.id;
            console.log("🔔 payment.link.paid for Payment Link:", paymentLinkId);

            // 4a. Update StripeLink.status → "ACCEPTED"
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
            }

            // 4b. Insert a Contribution record if this was a contribution flow
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
            // We intentionally do NOT parse rawEventId here, we'll handle fallback logic below
            const itemId = rawItemId ? parseInt(rawItemId, 10) : undefined;
            const amountRON = rawAmountRON ? parseFloat(rawAmountRON) : undefined;

            if (isContribute && eventArticleId && amountRON !== undefined) {
                try {
                    await prisma.contribution.create({
                        data: {
                            guestUsername: purchaserUsername,
                            // We’ll fill eventId below (after fallback resolution)
                            eventId: rawEventId ? parseInt(rawEventId, 10) : null,
                            articleId: eventArticleId,
                            itemId: itemId ?? null,
                            cashAmount: new Prisma.Decimal(amountRON.toString()),
                            currency: "ron",
                        },
                    });
                } catch (dbErr) {
                    console.error("Prisma error creating Contribution:", dbErr);
                }
            }

            // 4c. Deactivate (archive) the Payment Link in Stripe
            try {
                await stripe.paymentLinks.update(paymentLinkId, { active: false });
            } catch (stripeErr) {
                console.error(
                    "Stripe error deactivating link on payment.link.paid:",
                    stripeErr
                );
            }

            // 4d. Ensure we always have an eventId before calling processEventItemContributions
            let eventId: number | undefined;
            if (rawEventId) {
                eventId = parseInt(rawEventId, 10);
            } else if (eventArticleId) {
                // Fallback: look up eventId from EventArticle table
                try {
                    const evtArticle = await prisma.eventArticle.findUnique({
                        where: { id: eventArticleId },
                        select: { eventId: true },
                    });
                    if (evtArticle) {
                        eventId = evtArticle.eventId;
                    } else {
                        console.warn(
                            `Could not find EventArticle with ID ${eventArticleId} to resolve eventId.`
                        );
                    }
                } catch (lookupErr) {
                    console.error(
                        `Prisma error looking up eventId from EventArticle ${eventArticleId}:`,
                        lookupErr
                    );
                }
            }

            if (eventId !== undefined) {
                try {
                    console.log(
                        `Calling processEventItemContributions for event ID: ${eventId}`
                    );
                    await processEventItemContributions(eventId);
                    console.log(
                        `Finished processEventItemContributions for event ID: ${eventId}`
                    );
                } catch (procErr) {
                    console.error(
                        `Error in processEventItemContributions for event ID ${eventId}:`,
                        procErr
                    );
                    // Do NOT rethrow, so we still return 200 to Stripe.
                }
            } else {
                console.warn(
                    "payment.link.paid webhook arrived without a resolvable eventId; skipping processEventItemContributions."
                );
            }

            break;
        }

        // ────── When a Payment Link expires ──────
        case "payment.link.expired": {
            const paymentLinkObj = event.data.object as Stripe.PaymentLink;
            const paymentLinkId = paymentLinkObj.id;
            console.log("🔔 payment.link.expired for Payment Link:", paymentLinkId);

            // 4e. Update StripeLink.status → "EXPIRED"
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

            // 4f. Deactivate the link in Stripe (in case it’s still active)
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

        // ────── All other event types ──────
        default:
            console.log(`⚪️  Unhandled event type: ${event.type}`);
    }

    // 5. Acknowledge receipt
    res.status(200).json({ received: true });
}
