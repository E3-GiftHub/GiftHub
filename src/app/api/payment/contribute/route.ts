// src/app/api/payment/contribute/route.ts
import { stripe } from "@/server/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    if (!amount || typeof amount !== "number" || amount < 1) {
      return new NextResponse("Invalid amount", { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Contribution",
            },
            unit_amount: amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.DOMAIN_URL}/PaymentSuccessPage`,
      cancel_url: `${process.env.DOMAIN_URL}/PaymentFailurePage`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Contribution checkout error:", err);
    return new NextResponse("Checkout session creation failed", { status: 500 });
  }
}
