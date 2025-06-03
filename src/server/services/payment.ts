// File: /server/services/payment.ts
import { stripe } from "@/server/stripe";
import { db as prisma } from "@/server/db";
import type { StatusPayment } from "@prisma/client";
import Stripe from "stripe";
import { Prisma } from "@prisma/client";

type StripeError = Stripe.errors.StripeError;

function isStripeError(error: unknown): error is StripeError {
  return (
    error instanceof Error &&
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    typeof (error as { type: unknown }).type === 'string'
  );
}

export async function createCheckoutLink(
  id: number,
  idType: "eventArticle" | "event",
  amountRON: number,
  isContribute: boolean,
  userId: string
): Promise<{
  url: string;
  stripePaymentLinkId: string;
  amountInBani: bigint;
  currency: string;
}> {
  if (!Number.isInteger(amountRON) || amountRON <= 0) {
    throw new Error(`Invalid amountRON: must be a positive integer, got ${amountRON}.`);
  }
  const amountInBani = BigInt(amountRON * 100);
  const currency = "ron";

  let itemId: number | null = null;
  let eventId: number;
  let articleId: number | null = null;
  let plannerUsername: string;
  let plannerStripeId: string | null;

  if (idType === "eventArticle") {
    const eventArticle = await prisma.eventArticle.findFirst({
      where: { id: id },
      select: {
        id: true,
        item: { select: { id: true } },
        event: {
          select: {
            id: true,
            createdByUsername: true,
            user: { select: { stripeConnectId: true } },
          },
        },
      },
    });
    if (!eventArticle) {
      throw new Error(`EventArticle with id=${id} not found.`);
    }

    articleId = eventArticle.id;
    itemId = eventArticle.item.id;
    eventId = eventArticle.event.id;
    plannerUsername = eventArticle.event.createdByUsername;
    plannerStripeId = eventArticle.event.user.stripeConnectId;

    if (!isContribute) {
      throw new Error(`Contributions must have isContribute = true.`);
    }
  } else {
    const eventRow = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        createdByUsername: true,
        user: { select: { stripeConnectId: true } },
      },
    });
    if (!eventRow) {
      throw new Error(`Event with id=${id} not found.`);
    }
    articleId = null;
    itemId = null;
    eventId = eventRow.id;
    plannerUsername = eventRow.createdByUsername;
    plannerStripeId = eventRow.user.stripeConnectId;

    if (isContribute) {
      throw new Error(`Direct event purchases must have isContribute = false.`);
    }
  }

  let transferDestination: string | undefined = undefined;
  if (!isContribute) {
    if (!plannerStripeId) {
      throw new Error(
        `Event planner "${plannerUsername}" does not have a Stripe Connect ID.`
      );
    }
    transferDestination = plannerStripeId;
  }

  const existingLink = await prisma.stripeLink.findFirst({
    where: {
      guestUsername: userId,
      amount: new Prisma.Decimal(amountRON.toString()),
      status: "PENDING",
      eventId: eventId,
      articleId: articleId,
    },
    select: {
      paymentLinkUrl: true,
      stripePaymentLinkId: true,
    },
  });
  if (existingLink) {
    return {
      url: existingLink.paymentLinkUrl,
      stripePaymentLinkId: existingLink.stripePaymentLinkId,
      amountInBani,
      currency,
    };
  }

  let price: Stripe.Price;
  try {
    price = await stripe.prices.create({
      unit_amount: Number(amountInBani),
      currency,
      product_data: {
        name:
          idType === "eventArticle"
            ? `Item #${itemId} – Event #${eventId}`
            : `Event #${eventId} – Planner: ${plannerUsername}`,
      },
    });
  } catch (priceErr) {
    console.error("Stripe Price creation error:", priceErr);
    if (isStripeError(priceErr)) {
      throw new Error(`Stripe error: ${priceErr.message}`);
    }
    throw new Error("Failed to create Stripe Price");
  }

  const paymentLinkParams: Stripe.PaymentLinkCreateParams = {
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    ...(transferDestination
      ? {
          transfer_data: {
            destination: transferDestination,
          },
        }
      : {}),
    metadata: {
      eventId: eventId.toString(),
      ...(idType === "eventArticle"
        ? { eventArticleId: articleId!.toString() }
        : {}),
      ...(itemId !== null ? { itemId: itemId.toString() } : {}),
      purchaserUsername: userId,
      isContribute: isContribute ? "true" : "false",
      amountRON: amountRON.toString(),
    },
  };

  let link: Stripe.PaymentLink;
  try {
    link = await stripe.paymentLinks.create(paymentLinkParams);
  } catch (stripeErr) {
    console.error("Stripe PaymentLink creation error:", stripeErr);
    if (isStripeError(stripeErr)) {
      throw new Error(`Stripe error: ${stripeErr.message}`);
    }
    throw new Error("Failed to create Stripe Payment Link");
  }

  try {
    await prisma.stripeLink.create({
      data: {
        id: link.id,
        guestUsername: userId,
        eventId: eventId,
        articleId: articleId,
        itemId: itemId,
        stripePaymentLinkId: link.id,
        paymentLinkUrl: link.url ?? "",
        amount: new Prisma.Decimal(amountRON.toString()),
        currency,
        status: "PENDING" as StatusPayment,
      },
    });
  } catch (prismaErr) {
    console.error("Prisma stripeLink.create error:", prismaErr);
    if (prismaErr instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error(`Database error: ${prismaErr.message}`);
    }
    throw new Error("Failed to save payment link in database");
  }

  return {
    url: link.url ?? "",
    stripePaymentLinkId: link.id,
    amountInBani,
    currency,
  };
}
