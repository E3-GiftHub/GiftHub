// src/app/api/stripe/webhook/route.ts
import { db as prisma } from "@/server/db";
import { stripe } from "@/server/stripe";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers"; // Import corect
import type Stripe from "stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const headerPayload = await headers();
  const sig = headerPayload.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret) {
      console.error("❌ Stripe signature or webhook secret is missing.");
      return NextResponse.json(
          { error: "Webhook signature or secret not configured." },
          { status: 400 }
      );
    }
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
    );
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const checkoutSessionId = session.id;

  let paymentLinkIdString: string | null = null;
  if (session.payment_link) {
    // Extract Payment Link ID (can be a string or an expanded object)
    paymentLinkIdString = typeof session.payment_link === 'string'
        ? session.payment_link
        : session.payment_link.id;
  }

  console.log(
      `✅ Stripe event: ${event.type}, CS_ID: ${checkoutSessionId}, PL_ID: ${paymentLinkIdString || 'N/A'}, Event_Stripe_ID: ${event.id}`
  );

  switch (event.type) {
    case "checkout.session.completed":
      try {
        if (paymentLinkIdString) {
          // Update internal StripeLink status to 'ACCEPTED'
          const updatedLink = await prisma.stripeLink.updateMany({
            where: {
              stripePaymentLinkId: paymentLinkIdString,
              status: "PENDING", // Only update if it was pending
            },
            data: {
              status: "ACCEPTED",
            },
          });

          if (updatedLink.count > 0) {
            console.log(`StripeLink ${paymentLinkIdString} status updated to 'completed'.`);
            // Deactivate the Payment Link on Stripe's side
            try {
              await stripe.paymentLinks.update(paymentLinkIdString, {
                active: false,
              });
              console.log(`Stripe Payment Link ${paymentLinkIdString} deactivated on Stripe.`);
            } catch (stripeErr: any) {
              console.error(`⚠️ Error deactivating PL ${paymentLinkIdString} on Stripe:`, stripeErr.message);
              // Non-fatal for webhook processing, log and continue
            }
          } else {
            console.warn(`⚠️ No 'pending' StripeLink found for PL_ID ${paymentLinkIdString} to complete, or it was already processed.`);
          }
        } else {
          console.warn(`🏁 CS ${checkoutSessionId} completed, but no Payment Link ID associated.`);
        }

        const metadata = session.metadata;
        // Check if metadata required for contribution exists
        if (
            metadata &&
            metadata.eventId &&
            metadata.articleId &&
            metadata.creatorUsername && // This is the contributor's username
            metadata.originalAmount &&
            metadata.currency &&
            paymentLinkIdString // Ensure we are processing a payment-link related session
        ) {
          const amount = parseFloat(metadata.originalAmount);
          if (isNaN(amount)) {
            console.error("❌ Invalid 'originalAmount' in metadata for CS:", checkoutSessionId);
          } else {
            // Idempotency check: See if a contribution based on metadata already exists
            const existingContribution = await prisma.contribution.findFirst({
              where: {
                guestUsername: metadata.creatorUsername, // Use 'guestUsername' as per your Contribution schema
                eventId: parseInt(metadata.eventId),
                articleId: parseInt(metadata.articleId),
                // Optional: You could also match 'cashAmount' and 'currency' for stricter idempotency,
                // but this might be problematic if amounts can slightly differ or for retries.
              }
            });

            if (!existingContribution) {
              // Create a new contribution record
              await prisma.contribution.create({
                data: {
                  guestUsername: metadata.creatorUsername, // Field in Contribution model
                  eventId: parseInt(metadata.eventId),
                  articleId: parseInt(metadata.articleId),
                  cashAmount: amount,
                  currency: metadata.currency,
                  // 'stripePaymentLinkId' is NOT stored on the Contribution model directly
                },
              });
              console.log(`🎉 Contribution recorded based on metadata for payment associated with PL_ID ${paymentLinkIdString}.`);
            } else {
              console.log(`💾 Contribution based on metadata (guest: ${metadata.creatorUsername}, event: ${metadata.eventId}, article: ${metadata.articleId}) already exists. Payment PL_ID: ${paymentLinkIdString}.`);
            }
          }
        } else {
          console.warn(`⚠️ Missing essential metadata or Payment Link ID for CS ${checkoutSessionId}. Cannot create Contribution.`);
        }
      } catch (dbError: any) {
        console.error(`❌ DB error on checkout.session.completed for CS ${checkoutSessionId} (PL: ${paymentLinkIdString}):`, dbError.message);
        return NextResponse.json(
            { error: "Database processing failed during completion." },
            { status: 500 } // Internal Server Error
        );
      }
      break;

    case "checkout.session.expired":
      try {
        if (paymentLinkIdString) {
          // Update internal StripeLink status to 'EXPIRED'
          const updatedLink = await prisma.stripeLink.updateMany({
            where: {
              stripePaymentLinkId: paymentLinkIdString,
              status: "PENDING", // Only expire if it was pending
            },
            data: {
              status: "EXPIRED",
            },
          });

          if (updatedLink.count > 0) {
            console.log(`StripeLink ${paymentLinkIdString} status updated to 'expired'.`);
            // Deactivate the Payment Link on Stripe's side
            try {
              await stripe.paymentLinks.update(paymentLinkIdString, {
                active: false,
              });
              console.log(`Stripe Payment Link ${paymentLinkIdString} deactivated on Stripe (expiration).`);
            } catch (stripeErr: any) {
              console.error(`⚠️ Error deactivating PL ${paymentLinkIdString} on Stripe (expiration):`, stripeErr.message);
            }
          } else {
            console.warn(`⚠️ No 'pending' StripeLink found for PL_ID ${paymentLinkIdString} to expire, or it was already processed.`);
          }
        } else {
          console.warn(`🏁 CS ${checkoutSessionId} expired, but no Payment Link ID associated.`);
        }
      } catch (dbError: any) {
        console.error(`❌ DB error on checkout.session.expired for CS ${checkoutSessionId} (PL: ${paymentLinkIdString}):`, dbError.message);
        return NextResponse.json(
            { error: "Database processing failed during expiration." },
            { status: 500 } // Internal Server Error
        );
      }
      break;

    default:
      // Acknowledge other event types if necessary, or log them
      console.log(`🤷 Unhandled event type: ${event.type}`);
  }

  // Acknowledge receipt of the webhook event
  return NextResponse.json({ received: true });
}