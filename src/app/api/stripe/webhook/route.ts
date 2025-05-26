// src/app/api/stripe/webhook/route.ts
import { db } from "@/server/db";
import { stripe } from "@/server/stripe";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers"; // Import corect
import type Stripe from "stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) { // Funcția este deja async, deci putem folosi await
  const rawBody = await req.text();
  
  // --- AICI ESTE MODIFICAREA ---
  const headerPayload = await headers(); // Așteaptă rezolvarea Promise-ului
  const sig = headerPayload.get("stripe-signature"); // Acum poți apela .get()

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret) { // sig ar putea fi null dacă header-ul lipsește
      console.error("❌ Stripe signature or webhook secret is missing.");
      return NextResponse.json({ error: "Webhook signature or secret not configured." }, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    console.log("✅ Stripe event received:", event.type);
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // ... restul logicii tale pentru switch (event.type) ...
  switch (event.type) {
    case "checkout.session.completed":
      const sessionCompleted = event.data.object as Stripe.Checkout.Session;
      console.log(`💸 Payment successful for Stripe Checkout Session: ${sessionCompleted.id}`);
      
      try {
        const linkUpdate = await db.stripeLink.update({
          where: { checkoutSessionId: sessionCompleted.id },
          data: { active: false },
        });
        if (linkUpdate) {
            console.log(`StripeLink for session ${sessionCompleted.id} marked as inactive.`);
        } else {
            console.warn(`No StripeLink found for session ${sessionCompleted.id} to mark as inactive.`);
        }

        const metadata = sessionCompleted.metadata;
        if (
          metadata &&
          metadata.eventId &&
          metadata.articleId &&
          metadata.creatorUsername &&
          metadata.originalAmount 
        ) {
          const amount = parseFloat(metadata.originalAmount);
          if (isNaN(amount)) {
            console.error("❌ Invalid amount in metadata for session:", sessionCompleted.id);
          } else {
            await db.contribution.create({
              data: {
                contributorUsername: metadata.creatorUsername,
                eventId: parseInt(metadata.eventId),
                articleId: parseInt(metadata.articleId),
                cashAmount: amount, 
              },
            });
            console.log(`🎉 Contribution recorded for event ${metadata.eventId}, article ${metadata.articleId}, amount ${amount}`);
          }
        } else {
          console.warn(
            `⚠️ Missing or incomplete metadata for session ${sessionCompleted.id}. Cannot create full Contribution record.`
          );
        }
      } catch (dbError: any) {
        console.error(`❌ Database error handling checkout.session.completed for ${sessionCompleted.id}:`, dbError.message);
        return NextResponse.json({ error: "Database processing failed during session completion." }, { status: 500 });
      }
      break;

    case "checkout.session.expired":
      const sessionExpired = event.data.object as Stripe.Checkout.Session;
      console.log(`⏳ Checkout session expired: ${sessionExpired.id}`);
      try {
        const linkUpdate = await db.stripeLink.update({
          where: { checkoutSessionId: sessionExpired.id },
          data: { active: false },
        });
        if (linkUpdate) {
            console.log(`StripeLink for session ${sessionExpired.id} marked as inactive due to session expiry.`);
        } else {
            console.warn(`No StripeLink found for expired session ${sessionExpired.id} to mark as inactive.`);
        }
      } catch (dbError: any) {
        console.error(`❌ Database error handling checkout.session.expired for ${sessionExpired.id}:`, dbError.message);
        return NextResponse.json({ error: "Database processing failed for expired session." }, { status: 500 });
      }
      break;

    default:
      console.log(`🤷 Unhandled event type in Stripe webhook: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}