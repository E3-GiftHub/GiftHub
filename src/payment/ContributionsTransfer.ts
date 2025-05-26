import { db as prisma } from '~/server/db'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function fulfillItemContributionIfReady(eventId: number, itemId: number): Promise<boolean> {
  // 1. Get the total contributions for that item/event
  const totalContributions = await prisma.contribution.aggregate({
    _sum: {
      cashAmount: true,
    },
    where: {
      eventId,
      articleId: itemId,
    },
  })

  const contributedAmount = totalContributions._sum.cashAmount ?? 0

  // 2. Get the item price and event planner's stripeAccountId
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: { price: true },
  })

  if (!item || !item.price) {
    throw new Error('Item not found or price missing')
  }

  const price = item.price.toNumber();
  const priceCents = Math.round(price * 100);

  const balance = await stripe.balance.retrieve();
  const avail = balance.available.find(b => b.currency === 'ron');
  const pending = balance.pending.find(b => b.currency === 'ron');
  console.log("available: ", avail, ".Pending: ", pending);
  const availableCents  = avail?.amount ?? 0;

  if (availableCents < priceCents) {
    throw new Error(
      `Insufficient platform funds: need ${priceCents} bani but only ${availableCents} bani available.`
    )
  }

  // 3. Get the planner's Stripe account via event
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      user: {
        select: { stripeAccountId: true },
      },
    },
  })

  const plannerStripeId = event?.user?.stripeAccountId

  if (!plannerStripeId) {
    throw new Error('Event planner does not have a Stripe account')
  }

  const account = await stripe.accounts.retrieve(plannerStripeId)
  if (!account.payouts_enabled) {
    throw new Error('Event planner has payouts disabled')
  }

  // 3. Check if the contributions cover the price
  if (contributedAmount >= price.toNumber()) {
    // 4. Transfer funds from platform to planner
    await stripe.transfers.create({
      amount: Math.round(price.toNumber() * 100), // convert to cents
      currency: 'ron',
      destination: plannerStripeId,
      transfer_group: `event_${eventId}_item_${itemId}`,
    },
      {
      idempotency_key: `transfer_event_${eventId}_item_${itemId}`,
      }
    )

    return true // transfer done
  }

  return false // not enough funds yet
}
