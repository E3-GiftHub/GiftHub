// File: /src/server/payments.ts

import { stripe } from "@/server/stripe";
import { db as prisma } from "@/server/db";
import type { StatusPayment } from "@prisma/client";
import Stripe from "stripe";

/**
 * Creates a Stripe Payment Link for either:
 *   • A “contribution” (isContribute = true): funds stay in the platform’s Stripe account.
 *   • A “direct purchase” (isContribute = false): funds are forwarded to the event planner’s Stripe Connect account.
 *
 * @param itemId       – The ID of the Item being “purchased” or “contributed toward”
 * @param isContribute – If true, money remains in platform; if false, money goes to the event planner’s Connect ID
 * @param amountRON    – The amount in whole RON (integer). E.g. 50 means 50.00 RON.
 *                       Stripe expects “unit_amount” in bani (1 RON = 100 bani), so we multiply by 100.
 * @param userId       – The purchaser’s username (to save into `StripeLink.guestUsername`).
 *
 * @returns An object containing:
 *    • url                  — the Stripe-hosted payment link URL
 *    • stripePaymentLinkId  — Stripe’s generated “payment_link” ID (used as the primary key in our DB)
 *    • amountInBani         — The computed integer in bani (amountRON * 100), as a BigInt
 *    • currency             — Always `"ron"` (must be lowercase ISO)
 */
export async function createCheckoutLink(
    itemId: number,
    isContribute: boolean,
    amountRON: number,
    userId: string
): Promise<{
    url: string;
    stripePaymentLinkId: string;
    amountInBani: bigint;
    currency: string;
}> {
    //
    // 1. Validate `Item` existence and fetch its EventArticle→Event→User.stripeConnectId
    //
    const item = await prisma.item.findUnique({
        where: { id: itemId },
        include: {
            // We only need the first EventArticle (wishlist entry) tied to this Item
            eventOccurences: {
                take: 1,
                select: {
                    id: true,
                    event: {
                        select: {
                            id: true,
                            createdByUsername: true,
                            user: {
                                select: {
                                    stripeConnectId: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!item) {
        throw new Error(`Item with id=${itemId} not found.`);
    }

    const eventOcc = item.eventOccurences[0];
    if (!eventOcc) {
        throw new Error(`Item ${itemId} is not tied to any event.`);
    }

    //
    // 2. Convert the given amount (whole RON) to bani (Stripe’s smallest currency unit)
    //    - Ensure `amountRON` is a positive integer.
    //
    if (!Number.isInteger(amountRON) || amountRON <= 0) {
        throw new Error(`Invalid amountRON: must be a positive integer, got ${amountRON}.`);
    }
    const amountInBani = BigInt(amountRON * 100); // e.g. 50 RON → 5000 bani
    const currency = "ron"; // Stripe expects lowercase ISO currency code

    //
    // 3. If isContribute = false, extract the event planner’s Stripe Connect ID
    //
    let transferDestination: string | undefined = undefined;
    if (!isContribute) {
        const plannerStripeId = eventOcc.event.user.stripeConnectId;
        if (!plannerStripeId) {
            throw new Error(
                `Event planner "${eventOcc.event.createdByUsername}" does not have a Stripe Connect ID.`
            );
        }
        transferDestination = plannerStripeId;
    }

    //
    // 4. Create a Price object on Stripe for this exact amount and product description.
    //
    let price: Stripe.Price;
    try {
        price = await stripe.prices.create({
            unit_amount: Number(amountInBani), // in bani (e.g. 5000 for 50.00 RON)
            currency,                 // "ron"
            product_data: {
                name: `Item #${itemId} – Event #${eventOcc.event.id}`,
            },
        });
    } catch (priceErr: any) {
        console.error("Stripe Price creation error:", priceErr);
        throw new Error(
            `Failed to create Stripe Price: ${priceErr.message || priceErr.toString()}`
        );
    }

    //
    // 5. Build the Stripe PaymentLink parameters using the created Price ID.
    //
    const paymentLinkParams: Stripe.PaymentLinkCreateParams = {
        line_items: [
            {
                price: price.id, // reference the pre-created Price
                quantity: 1,
            },
        ],
        // Include `transfer_data` at the top level (Connect only) if isContribute = false
        ...(transferDestination
            ? {
                transfer_data: {
                    destination: transferDestination,
                },
            }
            : {}),
        // Metadata so you can reconcile on webhook events
        metadata: {
            itemId: itemId.toString(),
            eventArticleId: eventOcc.id.toString(),
            purchaserUsername: userId,
            isContribute: isContribute ? "true" : "false",
            amountRON: amountRON.toString(),
        },
    };

    //
    // 6. Call Stripe to create the Payment Link
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
    // 7. Persist a new row in our own `StripeLink` table
    //    Use `link.id` (e.g. "plink_1AbCdEfGhIjKlMnOp") as the PK, store the URL, etc.
    //
    try {
        await prisma.stripeLink.create({
            data: {
                id: link.id,                        // Stripe’s generated payment_link ID
                guestUsername: userId,              // who is purchasing
                eventId: eventOcc.event.id,         // which event this is for
                articleId: eventOcc.id,             // which wishlist entry
                itemId: item.id,                    // which item
                stripePaymentLinkId: link.id,       // duplicate of `id`, but matching your schema
                paymentLinkUrl: link.url ?? "",     // the hosted URL to redirect the user
                amount: amountRON.toString(),       // store "50" (RON) in your DB
                currency,                           // "ron"
                status: "PENDING" as StatusPayment, // initial status
            },
        });
    } catch (prismaErr: any) {
        console.error("Prisma stripeLink.create error:", prismaErr);
        // Ideally, you might want to delete the Stripe PaymentLink if your DB write fails,
        // so you don’t orphan a link. But at minimum, surface an error to the caller:
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
