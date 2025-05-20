// src/app/api/stripe/webhook/route.ts

import { db } from "@/server/db";
import { stripe } from "@/server/stripe";
import { NextResponse } from "next/server";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature") || "";

  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    console.log("✅ Stripe event received:", event.type);
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    const amount = session.amount_total
      ? session.amount_total / 100
      : 0;

    try {
      await db.contribution.create({
        data: {
          contributorUsername: "Guest",
          eventId: 43858,
          articleId: 1,
          cashAmount: amount,
        },
      });

      console.log("💸 Contribution recorded:", amount);
    } catch (err) {
      console.error("❌ Failed to record contribution:", err);
    }
  }

  return NextResponse.json({ received: true });
}

// This is necessary for raw body handling
export const config = {
  api: {
    bodyParser: false,
  },
};
