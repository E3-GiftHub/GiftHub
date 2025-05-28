import { stripe } from "@/server/stripe";
import { db as prisma } from "@/server/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import type Stripe from "stripe";

const DEFAULT_CURRENCY = "eur";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount,
      eventId,
      articleId,
    } = body;

    const currency = DEFAULT_CURRENCY; 

    const authSession = await auth();
    if (!authSession?.user?.id) {
      return NextResponse.json(
        { message: "User not authenticated." },
        { status: 401 }
      );
    }
    const authenticatedUserUsername = authSession.user.id;

    if (!amount || typeof amount !== "number" || amount <= 0.5) {
      return NextResponse.json(
        { message: "Invalid amount. Minimum 0.50 might be required." },
        { status: 400 }
      );
    }
    if (!eventId || typeof eventId !== "number" || eventId <= 0) {
      return NextResponse.json(
        { message: "Invalid or missing eventId." },
        { status: 400 }
      );
    }
    if (!articleId || typeof articleId !== "number" || articleId <= 0) {
      return NextResponse.json(
        { message: "Invalid or missing articleId." },
        { status: 400 }
      );
    }

    const amountInCents = Math.round(amount * 100);

    const existingPendingLink = await prisma.stripeLink.findFirst({
      where: {
        creatorUsername: authenticatedUserUsername,
        eventId: eventId,
        articleId: articleId,
        amount: amount,
        currency: currency,
        status: "pending",
      },
      select: {
        paymentLinkUrl: true,
      },
    });

    if (existingPendingLink?.paymentLinkUrl) {
      return NextResponse.json({ url: existingPendingLink.paymentLinkUrl });
    }

    const eventData = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        user: {
          select: {
            stripeConnectId: true,
          },
        },
      },
    });

    const plannerStripeConnectId = eventData?.user?.stripeConnectId;

    if (!plannerStripeConnectId) {
      return NextResponse.json(
        {
          message:
            "Event planner's Stripe account not configured or event/user not found.",
        },
        { status: 500 }
      );
    }
    
     try {
        const plannerAccount = await stripe.accounts.retrieve(plannerStripeConnectId);
        if (!plannerAccount.charges_enabled || 
            (plannerAccount.capabilities?.card_payments !== 'active' && 
             plannerAccount.capabilities?.transfers !== 'active')) {
             return NextResponse.json({ message: 'Event planner cannot receive payments at this time. Please contact them.' }, { status: 400 });
        }
     } catch(accError: any) {
        return NextResponse.json({ message: "Could not verify event planner's payment readiness. Please try again later." }, { status: 500 });
     }

    let itemName = `Contribution for Event #${eventId}, Article #${articleId}`;
    let itemImageUrl: string | undefined = undefined;
    try {
      const itemDetails = await prisma.item.findUnique({
        where: { id: articleId },
        select: { name: true, imagesUrl: true },
      });
      if (itemDetails?.name) {
        itemName = `Contribution for: ${itemDetails.name} (Event #${eventId})`;
      }
      if (itemDetails?.imagesUrl) {
        const firstImage = itemDetails.imagesUrl.split(",")[0]?.trim();
        if (firstImage) itemImageUrl = firstImage;
      }
    } catch (e) {
      // Log warning if needed, but continue
    }

    const priceCreateParams: Stripe.PriceCreateParams = {
        currency: currency,
        unit_amount: amountInCents,
        product_data: { 
          name: itemName,
          ...(itemImageUrl && { images: [itemImageUrl] }),
        },
      };
    const stripePrice = await stripe.prices.create(priceCreateParams);

    const paymentLinkCreateParams: Stripe.PaymentLinkCreateParams = {
      line_items: [
        {
          price: stripePrice.id,
          quantity: 1,
        },
      ],
      metadata: {
        eventId: String(eventId),
        articleId: String(articleId),
        creatorUsername: authenticatedUserUsername,
        originalAmount: String(amount),
        currency: currency,
      },
      transfer_data: {
        destination: plannerStripeConnectId,
      },
      after_completion: {
        type: "redirect",
        redirect: {
          url: `${process.env.DOMAIN_URL}/PaymentSuccessPage?eventId=${eventId}&articleId=${articleId}&amount=${amount}`,
        },
      },
    };

    const stripePaymentLinkObject = await stripe.paymentLinks.create(
      paymentLinkCreateParams
    );

    if (!stripePaymentLinkObject.url || !stripePaymentLinkObject.id) {
      throw new Error("Stripe Payment Link URL or ID missing after creation.");
    }

    await prisma.stripeLink.create({
      data: {
        stripePaymentLinkId: stripePaymentLinkObject.id,
        paymentLinkUrl: stripePaymentLinkObject.url,
        amount: amount,
        currency: currency,
        status: "pending",
        eventId: eventId,
        articleId: articleId, 
        creatorUsername: authenticatedUserUsername,
      },
    });

    return NextResponse.json({ url: stripePaymentLinkObject.url });

  } catch (err: any) {
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred during payment link creation.";
     if (err.type === 'StripeInvalidRequestError' && err.param === 'transfer_data[destination]') {
         return NextResponse.json(
           { message: "There was an issue with the event planner's payment account. They may not be set up to receive funds yet. Please try again later or contact the event planner.", error: errorMessage },
           { status: 400 }
         );
    }
    return NextResponse.json(
      { message: "Payment Link creation failed. Please try again.", error: errorMessage },
      { status: 500 }
    );
  }
}