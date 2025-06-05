// pages/api/stripe/create-express-login.ts

import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { db as prisma } from "~/server/db";

// Initialize Stripe with your secret key and the desired API version:
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1) Only allow GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 2) Grab `username` from query
  const username = String(req.query.username || "");
  if (!username) {
    return res.status(400).json({ error: "Missing `username` parameter" });
  }

  // 3) Lookup user in the database to get their stripeConnectId
  let user;
  try {
    user = await prisma.user.findUnique({
      where: { username },
      select: { stripeConnectId: true },
    });
  } catch (dbErr) {
    console.error("Prisma lookup error:", dbErr);
    return res.status(500).json({ error: "Database lookup failed." });
  }

  if (!user || !user.stripeConnectId) {
    return res
      .status(404)
      .json({ error: "No Stripe Connect account found for this user." });
  }

  const accountId = user.stripeConnectId;
  console.log("📦 Found stripeConnectId:", accountId);

  // 4) Retrieve the Stripe Account to see if onboarding is complete
  let stripeAccount: Stripe.Response<Stripe.Account>;
  try {
    stripeAccount = await stripe.accounts.retrieve(accountId);
  } catch (retrieveErr: any) {
    console.error("Error retrieving Stripe account:", {
      message: retrieveErr.message,
      type: retrieveErr.type,
      code: retrieveErr.code,
      raw: retrieveErr.raw,
    });
    return res.status(500).json({
      error: "Connected account retrieval failed. Check that `stripeConnectId` is valid.",
    });
  }

  console.log("⚙️  Retrieved Stripe account:", {
    id: stripeAccount.id,
    type: stripeAccount.type,
    charges_enabled: stripeAccount.charges_enabled,
    payouts_enabled: stripeAccount.payouts_enabled,
  });

  // Derive your origin (NEXTAUTH_URL or fallback to request headers)
  const origin =
    process.env.NEXTAUTH_URL ??
    `${req.headers["x-forwarded-proto"]}://${req.headers.host}`;

  // 5) If onboarding is NOT complete (charges_enabled or payouts_enabled is false),
  //    issue an Account Link for onboarding.
  if (!stripeAccount.charges_enabled || !stripeAccount.payouts_enabled) {
    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        type: "account_onboarding",
        refresh_url: `${origin}/profile`,
        return_url: `${origin}/profile`,
      });

      console.log("🔗 Created Account Link (onboarding):", accountLink.url);
      return res.redirect(accountLink.url);
    } catch (accountLinkErr: any) {
      console.error("Error creating Stripe Account Link (onboarding):", {
        message: accountLinkErr.message,
        type: accountLinkErr.type,
        code: accountLinkErr.code,
        raw: accountLinkErr.raw,
      });
      return res.status(500).json({
        error: "Unable to create Stripe Account Link for onboarding. Check server logs.",
      });
    }
  }

  // 6) If onboarding IS complete, create a one-time login link (dashboard)
  try {
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    console.log("🔐 Created Login Link (dashboard):", loginLink.url);
    return res.redirect(loginLink.url);
  } catch (loginErr: any) {
    console.error("Error creating Stripe login link:", {
      message: loginErr.message,
      type: loginErr.type,
      code: loginErr.code,
      raw: loginErr.raw,
    });
    return res.status(500).json({
      error: "Unable to create Stripe login link. Check server logs for details.",
    });
  }
}
