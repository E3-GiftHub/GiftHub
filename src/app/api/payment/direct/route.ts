// src/app/api/payment/direct/route.ts
import { stripe } from "@/server/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Direct Payment",
            },
            unit_amount: 10000, // 100 EUR in cents
          },
          quantity: 1,
        },
      ],
        success_url: `${process.env.DOMAIN_URL}/PaymentSuccessPage`,
        cancel_url: `${process.env.DOMAIN_URL}/PaymentFailurePage`,

    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return new NextResponse("Failed to create checkout session", { status: 500 });
  }
}
