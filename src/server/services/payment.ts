// File: /src/server/payments.ts

import { stripe } from "@/server/stripe";
import { db as prisma } from "@/server/db";
import type { StatusPayment } from "@prisma/client";
import Stripe from "stripe";
import { Prisma } from "@prisma/client"; // ← for Decimal

/**
 * Creates a Stripe Payment Link for either:
 *   • A “contribution” (idType = "eventArticle"): funds stay in the platform’s Stripe account.
 *   • A “direct purchase” (idType = "event"): funds are forwarded to the event planner’s Connect account.
 *
 * If there is already a StripeLink in our database with status = "PENDING",
 * the same amount, made by the same user, and for the same event/article,
 * this function immediately returns that existing link URL instead of creating a new one.
 *
 * @param id            – Either an EventArticle ID or an Event ID, depending on idType
 * @param idType        – "eventArticle" or "event"
 * @param amountRON     – The amount in whole RON (integer). E.g. 50 means 50.00 RON.
 *                        Stripe expects `unit_amount` in bani (1 RON = 100 bani), so we multiply by 100.
 * @param isContribute  – If true (only allowed when idType="eventArticle"), money remains in platform.
 *                        If false, for idType="event" the money goes to the event planner’s Connect account.
 * @param userId        – The purchaser’s username (to save into `StripeLink.guestUsername`).
 *
 * @returns An object containing:
 *    • url                 — the Stripe-hosted payment link URL
 *    • stripePaymentLinkId — Stripe’s generated `payment_link` ID (used as the primary key in our DB)
 *    • amountInBani        — The computed integer in bani (`amountRON * 100`), as a BigInt
 *    • currency            — Always `"ron"` (must be lowercase ISO)
 */
export async function createCheckoutLink(
    id: number,
    idType: "eventArticle" | "event",
    amountRON: number,
    isContribute: boolean,
    userId: string
): Promise<{
    url: string;
    stripePaymentLinkId: string;
    amountInBani: bigint;
    currency: string;
}> {
    //
    // 1. Validate `amountRON` and compute `amountInBani`
    //
    if (!Number.isInteger(amountRON) || amountRON <= 0) {
        throw new Error(`Invalid amountRON: must be a positive integer, got ${amountRON}.`);
    }
    const amountInBani = BigInt(amountRON * 100); // e.g. 50 RON → 5000 bani
    const currency = "ron"; // Stripe requires lowercase ISO code

    //
    // 2. Branch based on idType
    //
    // We'll prepare:
    //   • itemId: either a real Item ID (if idType="eventArticle") or null (if idType="event")
    //   • eventId: always the Event ID we end up charging against
    //   • articleId: the EventArticle ID if idType="eventArticle", or null if idType="event"
    //   • plannerUsername & plannerStripeId
    //
    let itemId: number | null = null;
    let eventId: number;
    let articleId: number | null = null;
    let plannerUsername: string;
    let plannerStripeId: string | null;

    if (idType === "eventArticle") {
        // ── Fetch the EventArticle row ──
        const eventArticle = await prisma.eventArticle.findUnique({
            where: { id },
            select: {
                id: true,
                item: { select: { id: true } }, // linked Item
                event: {
                    select: {
                        id: true,
                        createdByUsername: true,
                        user: { select: { stripeConnectId: true } },
                    },
                },
            },
        });
        if (!eventArticle) {
            throw new Error(`EventArticle with id=${id} not found.`);
        }
        // Set fields:
        articleId = eventArticle.id;
        itemId = eventArticle.item.id;
        eventId = eventArticle.event.id;
        plannerUsername = eventArticle.event.createdByUsername;
        plannerStripeId = eventArticle.event.user.stripeConnectId;
        // For a “contribution” (idType="eventArticle"), we force isContribute = true:
        if (!isContribute) {
            throw new Error(`Contributions (idType="eventArticle") must have isContribute = true.`);
        }
    } else {
        // idType === "event"
        // ── Fetch the Event row ──
        const eventRow = await prisma.event.findUnique({
            where: { id },
            select: {
                id: true,
                createdByUsername: true,
                user: { select: { stripeConnectId: true } },
            },
        });
        if (!eventRow) {
            throw new Error(`Event with id=${id} not found.`);
        }
        // Set fields:
        articleId = null;
        itemId = null; // no wishlist entry in “event” flow
        eventId = eventRow.id;
        plannerUsername = eventRow.createdByUsername;
        plannerStripeId = eventRow.user.stripeConnectId;
        // For a direct purchase of an Event, isContribute must be false:
        if (isContribute) {
            throw new Error(`Direct event purchases (idType="event") must have isContribute = false.`);
        }
    }

    //
    // 3. If isContribute = false, ensure plannerStripeId exists (so we can transfer funds)
    //
    let transferDestination: string | undefined = undefined;
    if (!isContribute) {
        if (!plannerStripeId) {
            throw new Error(
                `Event planner "${plannerUsername}" does not have a Stripe Connect ID.`
            );
        }
        transferDestination = plannerStripeId;
    }

    //
    // 4. CHECK FOR AN EXISTING PENDING LINK
    //    If one already exists with the same guestUsername, amount, eventId, & articleId,
    //    return it immediately rather than creating a new one.
    //
    const existingLink = await prisma.stripeLink.findFirst({
        where: {
            guestUsername: userId,
            amount: new Prisma.Decimal(amountRON.toString()),
            status: "PENDING",
            eventId: eventId,
            articleId: articleId,
        },
        select: {
            paymentLinkUrl: true,
            stripePaymentLinkId: true,
        },
    });

    if (existingLink) {
        // Return the existing “PENDING” link
        return {
            url: existingLink.paymentLinkUrl,
            stripePaymentLinkId: existingLink.stripePaymentLinkId,
            amountInBani,
            currency,
        };
    }

    //
    // 5. Create a Stripe Price object
    //    • If idType="eventArticle", product name = "Item #<itemId> – Event #<eventId>"
    //    • If idType="event",       product name = "Event #<eventId> – Planner: <plannerUsername>"
    //
    let price: Stripe.Price;
    try {
        price = await stripe.prices.create({
            unit_amount: Number(amountInBani),
            currency,
            product_data: {
                name:
                    idType === "eventArticle"
                        ? `Item #${itemId} – Event #${eventId}`
                        : `Event #${eventId} – Planner: ${plannerUsername}`,
            },
        });
    } catch (priceErr: any) {
        console.error("Stripe Price creation error:", priceErr);
        throw new Error(
            `Failed to create Stripe Price: ${priceErr.message || priceErr.toString()}`
        );
    }

    //
    // 6. Build the Stripe PaymentLink parameters
    //
    const paymentLinkParams: Stripe.PaymentLinkCreateParams = {
        line_items: [
            {
                price: price.id,
                quantity: 1,
            },
        ],
        // Only include transfer_data if isContribute = false (direct event purchase)
        ...(transferDestination
            ? {
                transfer_data: {
                    destination: transferDestination,
                },
            }
            : {}),
        metadata: {
            // Always include eventId
            eventId: eventId.toString(),
            // If this was a contribution, also include eventArticleId
            ...(idType === "eventArticle"
                ? { eventArticleId: articleId!.toString() }
                : {}),
            // Include itemId if not null
            ...(itemId !== null ? { itemId: itemId.toString() } : {}),
            // Always include purchaserUsername, isContribute, and amountRON
            purchaserUsername: userId,
            isContribute: isContribute ? "true" : "false",
            amountRON: amountRON.toString(),
        },
    };

    //
    // 7. Call Stripe to create the Payment Link
    //
    let link: Stripe.PaymentLink;
    try {
        link = await stripe.paymentLinks.create(paymentLinkParams);
    } catch (stripeErr: any) {
        console.error("Stripe PaymentLink creation error:", stripeErr);
        throw new Error(
            `Failed to create Stripe Payment Link: ${stripeErr.message || stripeErr.toString()}`
        );
    }

    //
    // 8. Persist a new row in our `StripeLink` table
    //
    try {
        await prisma.stripeLink.create({
            data: {
                id: link.id,                         // Stripe’s generated payment_link ID
                guestUsername: userId,               // who is purchasing
                eventId: eventId,                    // which event this is for
                articleId: articleId,                // null if idType="event"
                itemId: itemId,                      // null if idType="event"
                stripePaymentLinkId: link.id,        // duplicate of `id`, matching your schema
                paymentLinkUrl: link.url ?? "",      // the hosted URL to redirect the user
                amount: new Prisma.Decimal(amountRON.toString()), // store e.g. "50" (RON) in your DB
                currency,                            // "ron"
                status: "PENDING" as StatusPayment,  // initial status
            },
        });
    } catch (prismaErr: any) {
        console.error("Prisma stripeLink.create error:", prismaErr);
        // Optionally: roll back the Stripe PaymentLink if you want to avoid orphaned links
        throw new Error(
            `Failed to save StripeLink in database: ${prismaErr.message || prismaErr.toString()}`
        );
    }

    return {
        url: link.url ?? "",
        stripePaymentLinkId: link.id,
        amountInBani,
        currency,
    };
}
