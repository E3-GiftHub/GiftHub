import { stripe } from "@/server/stripe";
import { db } from "@/server/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount,
      eventId,
      articleId
    } = body;

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "User not authenticated." }, { status: 401 });
    }

    const creatorUsername = session.user.username;
    const creatorId = session.user.id;

    if (!creatorUsername) {
      console.warn(`Username is missing for authenticated user with ID: ${creatorId}. Proceeding with ID as primary identifier.`);
    }

    if (!amount || typeof amount !== "number" || amount <= 0.50) {
      return NextResponse.json({ message: "Invalid amount. Minimum 0.50 EUR might be required." }, { status: 400 });
    }
    if (!eventId || typeof eventId !== "number" || eventId <= 0) {
      return NextResponse.json({ message: "Invalid or missing eventId." }, { status: 400 });
    }
    if (!articleId || typeof articleId !== "number" || articleId <= 0) {
      return NextResponse.json({ message: "Invalid or missing articleId." }, { status: 400 });
    }

    let itemName = "Event Contribution";
    let itemImageUrl: string | undefined = undefined;
    try {
      const item = await db.itemCatalogue.findUnique({
        where: { id: articleId },
        select: { name: true, imagesUrl: true }
      });
      if (item && item.name) itemName = item.name;
      if (item && item.imagesUrl) {
        const firstImage = item.imagesUrl.split(',')[0]?.trim();
        if (firstImage) itemImageUrl = firstImage;
      }
    } catch (e) {
      console.warn("Could not fetch item name/image for Stripe session:", e);
    }

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Contribution for: ${itemName} (Event ${eventId})`,
              ...(itemImageUrl && { images: [itemImageUrl] }),
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        eventId: String(eventId),
        articleId: String(articleId),
        creatorId: creatorId,
        creatorUsername: creatorUsername || null,
        originalAmount: String(amount)
      },
      success_url: `${process.env.DOMAIN_URL}/PaymentSuccessPage?session_id={CHECKOUT_SESSION_ID}&eventId=${eventId}`,
      cancel_url: `${process.env.DOMAIN_URL}/PaymentFailurePage?eventId=${eventId}&payment_cancelled=true`,
    });

    if (!stripeCheckoutSession.url || !stripeCheckoutSession.id) {
        throw new Error("Stripe session URL or ID missing after creation.");
    }

    await db.stripeLink.create({
      data: {
        checkoutSessionId: stripeCheckoutSession.id,
        checkoutUrl: stripeCheckoutSession.url,
        amount: amount,
        active: true,
        eventId: eventId,
        articleId: articleId,
        creatorId: creatorId,
      }
    });

    return NextResponse.json({ url: stripeCheckoutSession.url });

  } catch (err: any) {
    console.error("Contribution checkout error:", err);
    if (err.name === 'AuthError' || err.type === 'CredentialsSignin' || err.type === 'OAuthAccountNotLinked') {
        return NextResponse.json(
            { message: "Authentication error: " + err.message, error: err.cause?.message || err.message },
            { status: 401 }
        );
    }
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json(
        { message: "Checkout session creation failed", error: errorMessage },
        { status: 500 }
    );
  }
}