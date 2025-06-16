import { stripe } from "@/server/stripe";
import { db as prisma } from "@/server/db";
import type { StatusPayment } from "@prisma/client";
import type Stripe from "stripe";
import { Prisma } from "@prisma/client";

export async function createCheckoutLink(
  id: number,
  idType: "eventArticle" | "event",
  amountRON: number,
  isContribute: boolean,
  userId: string,
): Promise<{
  url: string;
  stripePaymentLinkId: string;
  amountInBani: bigint;
  currency: string;
}> {
  //
  // ─── 1) Validate amountRON as a positive number with ≤ 2 decimal places ───────────
  //
  function hasAtMostTwoDecimals(n: number): boolean {
    // Multiply by 100, round, then compare to see if difference is within JS epsilon.
    const scaled = n * 100;
    return Math.abs(scaled - Math.round(scaled)) < Number.EPSILON;
  }

  if (
    typeof amountRON !== "number" ||
    !Number.isFinite(amountRON) ||
    amountRON <= 0 ||
    !hasAtMostTwoDecimals(amountRON)
  ) {
    throw new Error(
      `Invalid amountRON: must be a positive number with at most two decimals, got ${amountRON}.`,
    );
  }

  // Convert to bani (integer) by rounding—now guaranteed to be an exact integer
  const bani = Math.round(amountRON * 100); // e.g. 10.01 → 1001
  const amountInBani = BigInt(bani);
  const currency = "ron";

  //
  // ─── 2) Prepare variables for “eventArticle” vs. “event” logic ───────────────────────
  //
  let itemId: number | null = null;
  let eventId: number;
  let articleId: number | null = null;

  let plannerUsername: string;
  let plannerFirstName: string;
  let plannerLastName: string;
  let plannerStripeId: string | null;

  // We will build “productParams” once we know idType
  let productParams: Stripe.ProductCreateParams;

  if (idType === "eventArticle") {
    //
    // ─── EVENT ARTICLE PATH (Contributions) ────────────────────────────────────────────
    //
    const eventArticle = await prisma.eventArticle.findFirst({
      where: { id },
      select: {
        id: true,
        item: {
          select: {
            id: true,
            name: true,
            imagesUrl: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            createdByUsername: true,
            user: {
              select: {
                stripeConnectId: true,
                fname: true,
                lname: true,
              },
            },
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
    plannerFirstName = eventArticle.event.user.fname ?? "";
    plannerLastName = eventArticle.event.user.lname ?? "";
    plannerStripeId = eventArticle.event.user.stripeConnectId;

    // Build exactly the same fields as before for contributions:
    const itemName = eventArticle.item.name ?? "Untitled Item";
    const eventTitle = eventArticle.event.title ?? "Untitled Event";
    
    // Helper function to validate URL
    const isValidUrl = (urlString: string): boolean => {
      try {
        const url = new URL(urlString);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    };

    // Get a valid image URL or omit images entirely if none available
    const fallbackImageUrl = "https://a57.foxnews.com/static.foxnews.com/foxnews.com/content/uploads/2025/05/1440/810/michael-jordan.jpg?ve=1&tl=1";
    const rawImageUrl = eventArticle.item.imagesUrl?.trim();
    
    let imageUrl: string | null = null;
    if (rawImageUrl && isValidUrl(rawImageUrl)) {
      imageUrl = rawImageUrl;
    } else if (isValidUrl(fallbackImageUrl)) {
      imageUrl = fallbackImageUrl;
    }

    const plannerFullName =
      `${plannerFirstName} ${plannerLastName}`.trim() || plannerUsername;

    const descriptionText = [
      `Item: ${itemName}`,
      `Event: ${eventTitle}`,
      `Event Planner: ${plannerFullName}`,
    ].join("\n\n\n");

    if (!isContribute) {
      throw new Error(
        `Contributions must have isContribute = true for eventArticle.`,
      );
    }

    productParams = {
      name: itemName,
      description: descriptionText,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    };
  } else {
    //
    // ─── DIRECT EVENT PURCHASE PATH ──────────────────────────────────────────────────
    //
    const eventRow = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        createdByUsername: true,
        user: {
          select: {
            stripeConnectId: true,
            fname: true,
            lname: true,
          },
        },
      },
    });
    if (!eventRow) {
      throw new Error(`Event with id=${id} not found.`);
    }

    articleId = null;
    itemId = null;
    eventId = eventRow.id;

    plannerUsername = eventRow.createdByUsername;
    plannerFirstName = eventRow.user.fname ?? "";
    plannerLastName = eventRow.user.lname ?? "";
    plannerStripeId = eventRow.user.stripeConnectId;

    const eventName = eventRow.title ?? "Untitled Event";
    const plannerFullName =
      `${plannerFirstName} ${plannerLastName}`.trim() || plannerUsername;

    if (isContribute) {
      throw new Error(`Direct event purchases must have isContribute = false.`);
    }

    // Build only “name” = “{Planner Full Name} – {Event Name}”
    productParams = {
      name: `${plannerFullName} – ${eventName}`,
      // no images, no description
    };
  }

  //
  // ─── 3) If direct purchase, route funds to planner’s Connect account ───────────────
  //
  let transferDestination: string | undefined = undefined;
  if (!isContribute) {
    if (!plannerStripeId) {
      throw new Error(
        `Event planner "${plannerUsername}" does not have a Stripe Connect ID.`,
      );
    }
    transferDestination = plannerStripeId;
  }

  //
  // ─── 4) Check for existing PENDING link (same user, same amount, same event/article) ──
  //
  const existingLink = await prisma.stripeLink.findFirst({
    where: {
      guestUsername: userId,
      amount: new Prisma.Decimal(amountRON.toFixed(2)),
      status: "PENDING",
      eventId,
      articleId,
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

  //
  // ─── 5) CREATE THE STRIPE PRODUCT ─────────────────────────────────────────────────────
  //
  let product: Stripe.Product;
  try {
    product = await stripe.products.create(productParams);
  } catch (prodErr: unknown) {
    console.error("Stripe Product creation error:", prodErr);
    console.error("Product params that caused the error:", JSON.stringify(productParams, null, 2));
    const errorMessage =
      prodErr instanceof Error ? prodErr.message : String(prodErr);
    throw new Error(`Failed to create Stripe Product: ${errorMessage}`);
  }

  //
  // ─── 6) CREATE THE PRICE FOR THAT PRODUCT ───────────────────────────────────────────
  //
  let price: Stripe.Price;
  try {
    price = await stripe.prices.create({
      unit_amount: Number(amountInBani), // stripe expects a number here
      currency,
      product: product.id,
    });
  } catch (priceErr: unknown) {
    console.error("Stripe Price creation error:", priceErr);
    const errorMessage =
      priceErr instanceof Error ? priceErr.message : String(priceErr);
    throw new Error(`Failed to create Stripe Price: ${errorMessage}`);
  }

  //
  // ─── 7) BUILD SUCCESS URL ────────────────────────────────────────────────────────────
  //
  const rawBase = process.env.NEXT_PUBLIC_BASE_URL;
  if (!rawBase) {
    throw new Error(
      "Environment variable NEXT_PUBLIC_BASE_URL is not set. Include full URL, e.g. http://localhost:3000.",
    );
  }
  let normalizedBase = rawBase;
  if (!/^https?:\/\//i.test(normalizedBase)) {
    normalizedBase = `http://${normalizedBase}`;
  }
  const successUrl =
    `${normalizedBase}/payment-success?` +
    `idType=${encodeURIComponent(idType)}&id=${eventId}`;

  //
  // ─── 8) CREATE THE PAYMENT LINK ─────────────────────────────────────────────────────
  //
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
      amountRON: amountRON.toFixed(2),
      idType,
      id: eventId.toString(),
    },
    after_completion: {
      type: "redirect",
      redirect: { url: successUrl },
    },
  };

  let link: Stripe.PaymentLink;
  try {
    link = await stripe.paymentLinks.create(paymentLinkParams);
  } catch (stripeErr: unknown) {
    console.error("Stripe PaymentLink creation error:", stripeErr);
    const errorMessage =
      stripeErr instanceof Error ? stripeErr.message : String(stripeErr);
    throw new Error(`Failed to create Stripe Payment Link: ${errorMessage}`);
  }

  //
  // ─── 9) PERSIST A NEW StripeLink RECORD IN OUR DATABASE ─────────────────────────────
  //
  try {
    await prisma.stripeLink.create({
      data: {
        id: link.id,
        guestUsername: userId,
        eventId,
        articleId,
        itemId,
        stripePaymentLinkId: link.id,
        paymentLinkUrl: link.url ?? "",
        amount: new Prisma.Decimal(amountRON.toFixed(2)),
        currency,
        status: "PENDING" as StatusPayment,
      },
    });
  } catch (prismaErr: unknown) {
    console.error("Prisma stripeLink.create error:", prismaErr);
    const errorMessage =
      prismaErr instanceof Error ? prismaErr.message : String(prismaErr);
    throw new Error(`Failed to save StripeLink in database: ${errorMessage}`);
  }

  //
  // ─── 10) RETURN THE PAYMENT LINK URL + ID ────────────────────────────────────────────
  //
  return {
    url: link.url ?? "",
    stripePaymentLinkId: link.id,
    amountInBani,
    currency,
  };
}
