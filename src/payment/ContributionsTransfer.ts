import { db as prisma } from '~/server/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil', // Asigură-te că aceasta este versiunea API dorită
});

export async function fulfillItemContributionIfReady(eventId: number, itemId: number): Promise<boolean> {
  // 1. Agregă suma totală a contribuțiilor pentru articolul și evenimentul specificate.
  const totalContributionsAggregation = await prisma.contribution.aggregate({
    _sum: {
      cashAmount: true,
    },
    where: {
      eventId,
      articleId: itemId,
    },
  });

  // totalContributionsAggregation._sum.cashAmount este de tip Prisma.Decimal | null
  const contributedDecimalOrNull = totalContributionsAggregation._sum.cashAmount;

  // Convertește suma contribuțiilor în tipul number, gestionând cazul null.
  let numericContributedAmount: number;
  if (contributedDecimalOrNull === null) {
    numericContributedAmount = 0;
  } else {
    // Asigură-te că contributedDecimalOrNull este un obiect Decimal înainte de a apela toNumber()
    if (typeof contributedDecimalOrNull === 'object' && contributedDecimalOrNull !== null && 'toNumber' in contributedDecimalOrNull) {
        numericContributedAmount = contributedDecimalOrNull.toNumber();
    } else if (typeof contributedDecimalOrNull === 'number') { // În caz că e deja number (puțin probabil din aggregate)
        numericContributedAmount = contributedDecimalOrNull;
    }
    else {
        // Acest caz nu ar trebui să apară dacă schema și datele sunt corecte
        console.error("Unexpected type for contributedDecimalOrNull:", contributedDecimalOrNull);
        numericContributedAmount = 0;
    }
  }

  // 2. Obține detalii despre articol, în special prețul.
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: { price: true },
  });

  if (!item || item.price === null || item.price === undefined) {
    console.error(`Item with ID ${itemId} not found or price is missing.`);
    throw new Error('Item not found or price missing');
  }

  // item.price este de tip Prisma.Decimal. Convertește-l în number.
  const price = item.price.toNumber();
  const priceCents = Math.round(price * 100); // Prețul în cenți pentru Stripe.

  // 3. Verifică balanța disponibilă a platformei (opțional, dar o bună practică).
  const balance = await stripe.balance.retrieve();
  const availableBalanceEntry = balance.available.find(b => b.currency === 'ron');
  const platformAvailableCents = availableBalanceEntry?.amount ?? 0;

  if (platformAvailableCents < priceCents) {
    console.error(
      `Insufficient platform funds: need ${priceCents} bani (RON) but only ${platformAvailableCents} bani (RON) available on the platform's Stripe account.`
    );
    throw new Error(
      `Insufficient platform funds: need ${priceCents} bani but only ${platformAvailableCents} bani available.`
    );
  }

  // 4. Obține ID-ul contului Stripe Connect al planificatorului evenimentului.
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      user: { // Aceasta este relația definită în modelul Event către User.
        select: {
          stripeConnectId: true, // Acesta este câmpul din modelul User.
        },
      },
    },
  });

  // Verifică dacă evenimentul și utilizatorul asociat au fost găsiți și au ID-ul Stripe.
  const plannerStripeConnectId = event?.user?.stripeConnectId;

  if (!plannerStripeConnectId) {
    console.error(`Event planner for event ID ${eventId} (or the event itself) not found, or planner does not have a Stripe Connect account ID.`);
    throw new Error('Event planner does not have a Stripe account ID or event/user not found');
  }

  // 5. Verifică dacă contul Stripe al planificatorului are plățile activate.
  const plannerAccount = await stripe.accounts.retrieve(plannerStripeConnectId);
  if (!plannerAccount.payouts_enabled) {
    console.error(`Payouts are disabled for the event planner's Stripe account (ID: ${plannerStripeConnectId}).`);
    throw new Error('Event planner has payouts disabled');
  }

  // 6. Verifică dacă suma contribuțiilor acoperă prețul articolului.
  if (numericContributedAmount >= price) {
    try {
      // 7. Dacă da, transferă fondurile.
      await stripe.transfers.create({
        amount: priceCents,
        currency: 'ron',
        destination: plannerStripeConnectId,
        transfer_group: `event_${eventId}_item_${itemId}`,
        description: `Payment for item ${itemId} (event ${eventId})`,
        metadata: {
            eventId: eventId.toString(),
            itemId: itemId.toString(),
            contributedAmount: numericContributedAmount.toString(),
            price: price.toString(),
        }
      }, {
        idempotencyKey: `transfer_event_${eventId}_item_${itemId}_${Date.now()}`, // Cheie unică pentru a preveni duplicatele
      });

      console.log(`Successfully transferred ${priceCents / 100} RON to planner ${plannerStripeConnectId} for event ${eventId}, item ${itemId}.`);
      return true;
    } catch (error) {
      console.error(`Stripe transfer failed for event ${eventId}, item ${itemId} to planner ${plannerStripeConnectId}:`, error);
      // Poți arunca o eroare mai specifică sau gestiona cazul în funcție de cerințele aplicației
      throw new Error('Stripe transfer failed.');
    }
  }

  console.log(`Not enough funds contributed yet for item ${itemId} in event ${eventId}. Needed: ${price}, Contributed: ${numericContributedAmount}`);
  return false;
}
