// File: /src/pages/api/webhooks/stripe.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { buffer } from "micro";
import Stripe from "stripe";
import { db as prisma } from "@/server/db";
import { Prisma } from "@prisma/client";

// Import your ContributionsTransfer service
import { processEventItemContributions } from "@/server/services/ContributionsTransfer";

// Helper type for Stripe webhook events
type StripeWebhookEvent = Stripe.Event;

// Helper for type checking errors
function isStripeError(err: unknown): err is Error & { type: string } {
  return err instanceof Error && "type" in err;
}

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
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  // 1. Read raw request body into a Buffer
  let buf: Buffer;
  try {
    buf = await buffer(req);
  } catch (err: unknown) {
    console.error("Error reading raw body:", err instanceof Error ? err.message : err);
    return res.status(400).json({ received: false });
  }

  // 2. Verify Stripe signature header
  const sig = req.headers["stripe-signature"];
  if (!sig) {
    console.error("Missing stripe-signature header");
    return res.status(400).json({ received: false });
  }

  // 3. Parse & verify the event
  let event: StripeWebhookEvent;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: unknown) {
    if (isStripeError(err)) {
      console.error("Webhook signature verification failed:", err.message);
    } else {
      console.error("Unknown error during webhook verification:", err);
    }
    return res.status(400).json({ received: false });
  }

  // 4. Handle relevant event types
  const eventType = event.type;
  switch (eventType) {
    // ────── When a Checkout Session completes (i.e. Payment Link was paid) ──────
    case "checkout.session.completed": {
      const session: Stripe.Checkout.Session = event.data.object;
      if (!('payment_link' in session)) {
        console.error("Missing payment_link in session data");
        break;
      }
      const paymentLinkId = session.payment_link as string | undefined;

      console.log("🔔 checkout.session.completed for Payment Link:", paymentLinkId);

      // 4a. Update StripeLink.status → "ACCEPTED"
      if (paymentLinkId) {
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
      }

      // 4b. Insert a Contribution record if this was a contribution flow
      //    (i.e. metadata.isContribute === "true")
      const md = session.metadata ?? {};
      const isContribute = md.isContribute === "true";
      const rawEventArticleId = md.eventArticleId;
      const rawEventId = md.eventId;
      const rawItemId = md.itemId;
      const purchaserUsername = md.purchaserUsername as string | undefined;
      const rawAmountRON = md.amountRON;

      const eventArticleId = rawEventArticleId
        ? parseInt(rawEventArticleId, 10)
        : undefined;
      const itemId = rawItemId ? parseInt(rawItemId, 10) : undefined;
      const amountRON = rawAmountRON ? parseFloat(rawAmountRON) : undefined;

      // Determine eventId (either directly or via lookup)
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

      if (isContribute && eventArticleId && amountRON !== undefined && purchaserUsername) {
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

          // sends email notification to event owner about the contribution
          if (eventId && eventArticleId) {
            const { notifyEventOwnerOfContribution } = await import("@/server/api/routers/inboxEmailNotifier");
            
            // gets the item name for the notification
            const eventArticle = await prisma.eventArticle.findUnique({
              where: { id: eventArticleId },
              include: { item: { select: { name: true } } },
            });

            if (eventArticle?.item?.name) {
              await notifyEventOwnerOfContribution(
                eventId,
                purchaserUsername,
                eventArticle.item.name,
                amountRON,
                "RON"
              );
            }
          }
        } catch (dbErr) {
          console.error("Prisma error creating Contribution:", dbErr);
        }
      }

      // 4b2. Send payment confirmation email to the purchaser
      if (purchaserUsername && eventId && amountRON !== undefined) {
        try {
          const { notifyUserOfPaymentConfirmation } = await import("@/server/api/routers/inboxEmailNotifier");
          
          // Get item name for the notification
          let itemName = "an item";
          if (eventArticleId) {
            const eventArticle = await prisma.eventArticle.findUnique({
              where: { id: eventArticleId },
              include: { item: { select: { name: true } } },
            });
            itemName = eventArticle?.item?.name ?? "an item";
          }

          await notifyUserOfPaymentConfirmation(
            purchaserUsername,
            eventId,
            itemName,
            `${amountRON} RON`,
            session.id, // Use session ID as transaction ID
            session.payment_method_types?.[0],
            "RON"
          );
        } catch (notificationErr) {
          console.error("Failed to send payment confirmation notification:", notificationErr);
        }
      }

      // 4c. Deactivate (archive) the Payment Link in Stripe
      if (paymentLinkId) {
        try {
          await stripe.paymentLinks.update(paymentLinkId, { active: false });
        } catch (stripeErr) {
          console.error(
            "Stripe error deactivating link on checkout.session.completed:",
            stripeErr
          );
        }
      }

      // 4d. Call processEventItemContributions (only if we have an eventId)
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
          "checkout.session.completed arrived without a resolvable eventId; skipping processEventItemContributions."
        );
      }

      break;
    }

    // ────── When a Checkout Session expires (i.e. Payment Link expired) ──────
    case "checkout.session.expired": {
      const session: Stripe.Checkout.Session = event.data.object;
      if (!('payment_link' in session)) {
        console.error("Missing payment_link in session data");
        break;
      }
      const paymentLinkId = session.payment_link as string | undefined;

      console.log("🔔 checkout.session.expired for Payment Link:", paymentLinkId);

      // 4e. Update StripeLink.status → "EXPIRED"
      if (paymentLinkId) {
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
      }

      // 4f. Deactivate the link in Stripe (in case it’s still active)
      if (paymentLinkId) {
        try {
          await stripe.paymentLinks.update(paymentLinkId, { active: false });
        } catch (stripeErr) {
          console.error(
            "Stripe error deactivating link on checkout.session.expired:",
            stripeErr
          );
        }
      }

      // 4g. Determine eventId (similar fallback logic)
      const md = session.metadata ?? {};
      const rawEventArticleId = md.eventArticleId;
      const rawEventId = md.eventId;

      let eventId: number | undefined;
      if (rawEventId) {
        eventId = parseInt(rawEventId, 10);
      } else if (rawEventArticleId) {
        const evtArticleId = parseInt(rawEventArticleId, 10);
        try {
          const evtArticle = await prisma.eventArticle.findUnique({
            where: { id: evtArticleId },
            select: { eventId: true },
          });
          if (evtArticle) {
            eventId = evtArticle.eventId;
          } else {
            console.warn(
              `Could not find EventArticle with ID ${evtArticleId} to resolve eventId.`
            );
          }
        } catch (lookupErr) {
          console.error(
            `Prisma error looking up eventId from EventArticle ${evtArticleId}:`,
            lookupErr
          );
        }
      }

      // 4h. Call processEventItemContributions (optional: maybe you still want to process any existing contributions)
      if (eventId !== undefined) {
        try {
          console.log(
            `Calling processEventItemContributions (post-expiration) for event ID: ${eventId}`
          );
          await processEventItemContributions(eventId);
          console.log(
            `Finished processEventItemContributions (post-expiration) for event ID: ${eventId}`
          );
        } catch (procErr) {
          console.error(
            `Error in processEventItemContributions for event ID ${eventId}:`,
            procErr
          );
        }
      } else {
        console.warn(
          "checkout.session.expired arrived without a resolvable eventId; skipping processEventItemContributions."
        );
      }

      break;
    }

    // ────── All other event types ──────
    default:
      console.log(`⚪️  Unhandled event type: ${eventType}`);
  }

  // 5. Acknowledge receipt
  res.status(200).json({ received: true });
}
