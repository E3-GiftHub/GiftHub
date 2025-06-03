import { db as prisma } from '@/server/db';
import Stripe from 'stripe';
// Prisma.Decimal is not explicitly used in function signatures here but useful for type awareness
// import { Prisma } from '@prisma/client';

// Initialize Stripe client
// Ensure STRIPE_SECRET_KEY is set in your environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil', // Ensure this is your desired API version
});

/**
 * Processes contributions for all items in a given event.
 * If an item's total contributions meet its price and a transfer hasn't been made,
 * it transfers the item's full price to the event planner's Stripe Connect account
 * and marks the EventArticle as transferCompleted.
 *
 * @param eventId The ID of the event to process.
 * @returns Promise<void>
 */
export async function processEventItemContributions(eventId: number): Promise<void> {
  console.log(`Starting to process individual item contributions (full price fulfillment) for event ID: ${eventId}`);

  const eventData = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      createdByUsername: true,
      user: { select: { stripeConnectId: true } },
    },
  });
  if (!eventData?.user) {
    console.error(`Event ID ${eventId} or planner not found for item price processing.`);
    throw new Error('Event or event planner not found for item price processing.');
  }
  const plannerStripeConnectId = eventData.user.stripeConnectId;
  if (!plannerStripeConnectId) {
    console.error(`Planner for event ID ${eventId} (user: ${eventData.createdByUsername}) lacks Stripe Connect ID. Cannot process item prices.`);
    return;
  }

  try {
    const plannerAccount = await stripe.accounts.retrieve(plannerStripeConnectId);
    if (!plannerAccount.payouts_enabled) {
      console.error(`Planner ${plannerStripeConnectId} payouts disabled for event ${eventId}. Cannot process item prices.`);
      return;
    }
    console.log(`Planner ${plannerStripeConnectId} for event ${eventId} has payouts enabled for item price processing.`);
  } catch (error) {
    console.error(`Failed to verify planner's Stripe account ${plannerStripeConnectId} for item price processing:`, error);
    throw new Error("Failed to verify planner's Stripe account for item price processing.");
  }

  const eventArticles = await prisma.eventArticle.findMany({
    where: { eventId: eventId, transferCompleted: false },
    include: { item: { select: { id: true, price: true, name: true } } },
  });

  if (!eventArticles.length) {
    console.log(`No pending articles for full price fulfillment in event ID ${eventId}.`);
    return;
  }
  console.log(`Found ${eventArticles.length} articles to check for full price fulfillment in event ${eventId}.`);

  let platformAvailableCents = 0;
  try {
    const balance = await stripe.balance.retrieve();
    const availableBalanceEntry = balance.available.find(b => b.currency.toLowerCase() === 'ron');
    platformAvailableCents = availableBalanceEntry?.amount ?? 0;
  } catch (balanceError) {
    console.error("Failed to retrieve platform Stripe balance for item price processing:", balanceError);
  }

  for (const eventArticle of eventArticles) {
    const articleId = eventArticle.id;
    const itemDetails = eventArticle.item;    if (!itemDetails?.price) {
      console.warn(`Skipping article ${articleId} (Item: ${itemDetails?.id}, Name: ${itemDetails?.name ?? 'N/A'}) for event ${eventId} (item price processing): Item or price missing.`);
      continue;
    }
    const itemPriceNumber = itemDetails.price.toNumber();
    if (itemPriceNumber <= 0) {
      console.log(`Skipping article ${articleId} (Item: ${itemDetails.id}, Name: ${itemDetails.name}) for event ${eventId} (item price processing): Price is ${itemPriceNumber} RON. Marking completed as no transfer needed.`);
      // If price is 0 or less, it's fulfilled without payment.
      await prisma.eventArticle.update({
        where: { id: articleId },
        data: { transferCompleted: true },
      });
      continue;
    }
    const itemPriceCents = Math.round(itemPriceNumber * 100);

    const totalContributionsAggregation = await prisma.contribution.aggregate({
      _sum: { cashAmount: true },
      where: { articleId: articleId },
    });
    const contributedDecimalOrNull = totalContributionsAggregation._sum.cashAmount;
    let numericContributedAmount = 0;
    if (contributedDecimalOrNull) {
      numericContributedAmount = typeof contributedDecimalOrNull === 'number' ? contributedDecimalOrNull : contributedDecimalOrNull.toNumber();
    }

    console.log(`Article ${articleId} (Item: ${itemDetails.name}, Price: ${itemPriceNumber} RON) (item price processing): Contributed: ${numericContributedAmount} RON.`);

    if (numericContributedAmount >= itemPriceNumber) {
      console.log(`Article ${articleId} is fully funded for item price. Attempting transfer of item price.`);
      if (platformAvailableCents < itemPriceCents) {
        console.error(`Insufficient platform funds for article ${articleId} (item price processing): Need ${itemPriceCents}, have ${platformAvailableCents}.`);
        continue;
      }
      try {
        const idempotencyKey = `transfer_fullprice_event_${eventId}_article_${articleId}`;
        await stripe.transfers.create({
          amount: itemPriceCents, // Transfer the ITEM'S PRICE
          currency: 'ron',
          destination: plannerStripeConnectId,
          transfer_group: `EVENT#${eventId}_ARTICLE_FULLPRICE#${articleId}`,
          description: `Full payment for item '${itemDetails.name ?? itemDetails.id}' (Article ID: ${articleId}, Event ID: ${eventId})`,
          metadata: { eventId: eventId.toString(), articleId: articleId.toString(), itemId: itemDetails.id.toString(), type: "full_price_fulfillment" },
        }, { idempotencyKey });
        console.log(`Successfully transferred ${itemPriceCents / 100} RON (full item price) to planner ${plannerStripeConnectId} for article ${articleId}.`);
        await prisma.eventArticle.update({
          where: { id: articleId },
          data: { transferCompleted: true },
        });
        console.log(`Marked article ${articleId} as transferCompleted (item price processing).`);
      } catch (error) {
        console.error(`Stripe transfer for full item price failed for article ${articleId}:`, error);
      }
    } else {
      console.log(`Not enough funds for full item price for article ${articleId}. Needed: ${itemPriceNumber}, Contributed: ${numericContributedAmount}.`);
    }
  }
  console.log(`Finished processing individual item contributions (full price fulfillment) for event ID: ${eventId}`);
}


/**
 * At the end of an event, iterates through all EventArticles that are not yet marked
 * 'transferCompleted'. For each such article, it sums its total collected contributions
 * and transfers that specific amount to the event planner.
 * This acts as a final sweep for any remaining funds on partially funded items or
 * items that failed prior full-price transfer attempts.
 *
 * @param eventId The ID of the event.
 * @returns Promise<void>
 */
export async function endOfEventTransfer(eventId: number): Promise<void> {
  console.log(`Starting end-of-event remaining contributions transfer process for event ID: ${eventId}`);

  // 1. Fetch event planner's Stripe Connect ID.
  const eventData = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      createdByUsername: true,
      user: {
        select: {
          stripeConnectId: true,
        },
      },
    },
  });
  if (!eventData?.user) {
    console.error(`Event with ID ${eventId} or its planner not found for end-of-event transfer.`);
    // If event/planner not found, cannot proceed.
    throw new Error('Event or event planner not found for end-of-event transfer.');
  }

  const plannerStripeConnectId = eventData.user.stripeConnectId;

  if (!plannerStripeConnectId) {
    console.error(`Event planner (user: ${eventData.createdByUsername}) for event ID ${eventId} does not have a Stripe Connect account ID. Cannot perform end-of-event transfers.`);
    // If no Stripe ID, log and exit as no transfers can be made.
    return;
  }

  // 2. Check planner's Stripe account status (payouts enabled).
  try {
    const plannerAccount = await stripe.accounts.retrieve(plannerStripeConnectId);
    if (!plannerAccount.payouts_enabled) {
      console.error(`Payouts are disabled for the event planner's Stripe account (ID: ${plannerStripeConnectId}) for event ${eventId} (end-of-event transfer). No transfers will be attempted.`);
      return; // Cannot proceed if payouts are disabled.
    }
    console.log(`Event planner ${plannerStripeConnectId} for event ${eventId} has payouts enabled for end-of-event transfer.`);
  } catch (error) {
    console.error(`Failed to retrieve or verify planner's Stripe account ${plannerStripeConnectId} for event ${eventId} (end-of-event transfer):`, error);
    // If account check fails, cannot proceed.
    throw new Error("Failed to verify event planner's Stripe account status for end-of-event transfer.");
  }

  // 3. Get all event articles for the event that haven't had their transfer completed yet.
  const articlesToProcess = await prisma.eventArticle.findMany({
    where: {
      eventId: eventId,
      transferCompleted: false, // Only process items not yet finalized
    },
    select: { // Select only what's needed
      id: true,
      item: { select: { name: true, id: true } } // For logging/metadata
    }
  });

  if (!articlesToProcess.length) {
    console.log(`No articles found requiring end-of-event remaining contribution transfer for event ID ${eventId}. All items already marked transferCompleted.`);
    return;
  }
  console.log(`Found ${articlesToProcess.length} articles to process for remaining contributions in event ${eventId}.`);

  let platformAvailableCents = 0; // Check once, though individual small transfers might be fine.
  try {
    const balance = await stripe.balance.retrieve();
    const availableBalanceEntry = balance.available.find(b => b.currency.toLowerCase() === 'ron');
    platformAvailableCents = availableBalanceEntry?.amount ?? 0;
  } catch (balanceError) {
    console.error("Failed to retrieve platform Stripe balance for end-of-event processing:", balanceError);
    // Potentially critical, decide if to proceed or throw. For now, log.
  }

  // 4. Iterate over each article to transfer its specific collected contributions.
  for (const article of articlesToProcess) {
    const articleId = article.id;
    const itemName = article.item?.name ?? `Item ID ${article.item?.id ?? 'N/A'}`;

    // 4a. Aggregate total contributions for THIS specific article.
    const contributionsAggregation = await prisma.contribution.aggregate({
      _sum: {
        cashAmount: true,
      },
      where: {
        articleId: articleId,
      },
    });

    const collectedDecimalOrNull = contributionsAggregation._sum.cashAmount;
    let numericCollectedAmount = 0;

    if (collectedDecimalOrNull) {
      numericCollectedAmount = typeof collectedDecimalOrNull === 'number' ? collectedDecimalOrNull : collectedDecimalOrNull.toNumber();
    }

    console.log(`Article ID ${articleId} ('${itemName}') for event ${eventId} (end-of-event): Total collected contributions = ${numericCollectedAmount} RON.`);

    if (numericCollectedAmount > 0) {
      const amountToTransferCents = Math.round(numericCollectedAmount * 100);

      if (platformAvailableCents < amountToTransferCents) {
        console.warn(`Insufficient platform funds (need ${amountToTransferCents}, have ${platformAvailableCents}) for article ${articleId} ('${itemName}') in event ${eventId}. Skipping this transfer.`);
        // Optionally, you could reduce platformAvailableCents if you don't re-fetch it, but it's safer to be conservative.
        continue; // Skip to next article
      }

      try {
        // Use a unique idempotency key for this specific transfer attempt.
        const idempotencyKey = `transfer_remaining_event_${eventId}_article_${articleId}`;

        await stripe.transfers.create({
          amount: amountToTransferCents,
          currency: 'ron', // Assuming RON
          destination: plannerStripeConnectId,
          transfer_group: `EVENT#${eventId}_ARTICLE_REMAINING#${articleId}`,
          description: `Transfer of collected contributions for article '${itemName}' (ID: ${articleId}, Event ID: ${eventId})`,
          metadata: {
            eventId: eventId.toString(),
            articleId: articleId.toString(),
            itemId: article.item?.id?.toString() || 'N/A',
            type: 'remaining_contribution_transfer',
          },
        }, {
          idempotencyKey: idempotencyKey,
        });

        console.log(`Successfully transferred ${amountToTransferCents / 100} RON (collected contributions) to planner ${plannerStripeConnectId} for article ${articleId} ('${itemName}', Event ID ${eventId}).`);

        // Mark this article as transferCompleted.
        await prisma.eventArticle.update({
          where: { id: articleId },
          data: { transferCompleted: true },
        });
        console.log(`Marked article ID ${articleId} ('${itemName}') as transferCompleted (end-of-event).`);

        // Deduct from local cache of platform balance to avoid overdrawing in the same run if not re-fetching balance
        platformAvailableCents -= amountToTransferCents;


      } catch (error) {
        console.error(`Stripe transfer of remaining contributions failed for article ${articleId} ('${itemName}', Event ID ${eventId}) to planner ${plannerStripeConnectId}:`, error);
        // Do NOT mark as transferCompleted if transfer fails, so it can be retried.
      }
    } else {
      // No positive contributions found for this article. Mark as completed.
      console.log(`No positive contributions to transfer for article ID ${articleId} ('${itemName}', Event ID ${eventId}). Marking as transferCompleted.`);
      await prisma.eventArticle.update({
        where: { id: articleId },
        data: { transferCompleted: true },
      });
    }
  }
  console.log(`Finished end-of-event remaining contributions transfer process for event ID: ${eventId}`);
}

// Example Usage (ensure this is called from an async context or handled appropriately):
// async function runEventProcessing(eventIdToProcess: number) {
//   try {
//     // Stage 1: Attempt to fulfill items at their full price
//     await processEventItemContributions(eventIdToProcess);
//     console.log("Finished Stage 1: Individual item full price contributions processing.");

//     // Stage 2: At event end, sweep up any remaining contributions from items not fully covered
//     await endOfEventTransfer(eventIdToProcess);
//     console.log("Finished Stage 2: End of event remaining contributions transfer process.");

//   } catch (err) {
//     console.error(`Error during event processing for event ${eventIdToProcess}:`, err);
//   }
// }

// runEventProcessing(1); // Replace 1 with an actual event ID
