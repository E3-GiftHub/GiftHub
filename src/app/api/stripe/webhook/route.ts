// src/app/api/stripe/webhook/route.ts
import { db as prisma } from "@/server/db";
import { stripe } from "@/server/stripe";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers"; // Import corect
import type Stripe from "stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const headerPayload = headers(); // Corectat: FĂRĂ await
  const sig = (await headerPayload).get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret) {
      console.error("❌ Stripe signature or webhook secret is missing.");
      return NextResponse.json(
        { error: "Webhook signature or secret not configured." },
        { status: 400 }
      );
    }
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

  // Extrage ID-ul Payment Link-ului corect, indiferent dacă e string sau obiect expandat
  let paymentLinkIdString: string | null = null;
  if (session.payment_link) {
    if (typeof session.payment_link === 'string') {
      paymentLinkIdString = session.payment_link;
    } else {
      // Dacă session.payment_link este un obiect Stripe.PaymentLink expandat
      paymentLinkIdString = session.payment_link.id;
    }
  }
  
  console.log(
    `✅ Stripe event: ${event.type}, CS_ID: ${checkoutSessionId}, PL_ID: ${paymentLinkIdString || 'N/A'}, Event_Stripe_ID: ${event.id}`
  );


  switch (event.type) {
    case "checkout.session.completed":
      try {
        if (paymentLinkIdString) {
          const updatedLink = await prisma.stripeLink.updateMany({
            where: { 
              stripePaymentLinkId: paymentLinkIdString, // Folosește ID-ul string
              status: "pending",
            },
            data: { 
              status: "completed",
            },
          });

          if (updatedLink.count > 0) {
            console.log(`StripeLink ${paymentLinkIdString} status updated to 'completed'.`);
            try {
              await stripe.paymentLinks.update(paymentLinkIdString, { // Folosește ID-ul string
                active: false,
              });
              console.log(`Stripe Payment Link ${paymentLinkIdString} deactivated on Stripe.`);
            } catch (stripeErr: any) {
              console.error(`⚠️ Error deactivating PL ${paymentLinkIdString} on Stripe:`, stripeErr.message);
            }
          } else {
            console.warn(`⚠️ No 'pending' StripeLink found for PL_ID ${paymentLinkIdString} to complete.`);
          }
        } else {
            console.warn(`🏁 CS ${checkoutSessionId} completed, but no Payment Link ID associated.`);
        }

        const metadata = session.metadata;
        if (
          metadata &&
          metadata.eventId &&
          metadata.articleId &&
          metadata.creatorUsername &&
          metadata.originalAmount &&
          metadata.currency &&
          paymentLinkIdString // Asigură-te că avem ID-ul PL pentru a crea contribuția
        ) {
          const amount = parseFloat(metadata.originalAmount);
          if (isNaN(amount)) {
            console.error("❌ Invalid 'originalAmount' in metadata for CS:", checkoutSessionId);
          } else {
            const existingContribution = await prisma.contribution.findFirst({
                where: {
                    stripePaymentLinkId: paymentLinkIdString, 
                }
            });

            if (!existingContribution) {
                await prisma.contribution.create({
                  data: {
                    contributorUsername: metadata.creatorUsername,
                    eventId: parseInt(metadata.eventId),
                    articleId: parseInt(metadata.articleId),
                    cashAmount: amount,
                    currency: metadata.currency,
                    stripePaymentLinkId: paymentLinkIdString, // Folosește ID-ul string
                  },
                });
                console.log(`🎉 Contribution recorded for PL_ID ${paymentLinkIdString}.`);
            } else {
                console.log(`💾 Contribution for PL_ID ${paymentLinkIdString} already exists.`);
            }
          }
        } else {
          console.warn(`⚠️ Missing metadata or PL_ID for CS ${checkoutSessionId}. Cannot create Contribution.`);
        }
      } catch (dbError: any) {
        console.error(`❌ DB error on checkout.session.completed for CS ${checkoutSessionId} (PL: ${paymentLinkIdString}):`, dbError.message);
        return NextResponse.json(
          { error: "DB processing failed (completion)." },
          { status: 500 }
        );
      }
      break;

    case "checkout.session.expired":
      try {
        if (paymentLinkIdString) {
          const updatedLink = await prisma.stripeLink.updateMany({
            where: { 
                stripePaymentLinkId: paymentLinkIdString, // Folosește ID-ul string
                status: "pending",
            },
            data: { 
                status: "expired",
            },
          });

          if (updatedLink.count > 0) {
            console.log(`StripeLink ${paymentLinkIdString} status updated to 'expired'.`);
            try {
              await stripe.paymentLinks.update(paymentLinkIdString, { // Folosește ID-ul string
                active: false,
              });
              console.log(`Stripe PL ${paymentLinkIdString} deactivated on Stripe (expiration).`);
            } catch (stripeErr: any) {
              console.error(`⚠️ Error deactivating PL ${paymentLinkIdString} (expiration):`, stripeErr.message);
            }
          } else {
            console.warn(`⚠️ No 'pending' StripeLink for PL_ID ${paymentLinkIdString} to expire.`);
          }
        } else {
            console.warn(`🏁 CS ${checkoutSessionId} expired, but no Payment Link ID associated.`);
        }
      } catch (dbError: any) {
        console.error(`❌ DB error on checkout.session.expired for CS ${checkoutSessionId} (PL: ${paymentLinkIdString}):`, dbError.message);
        return NextResponse.json(
          { error: "DB processing failed (expiration)." },
          { status: 500 }
        );
      }
      break;

    default:
      console.log(`🤷 Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}