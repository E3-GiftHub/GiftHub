// pages/api/stripe/create-login.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

interface StripeError {
  message: string;
  type?: string;
  code?: string;
}

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil', // Ensure this is your desired API version
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET (or you can switch to POST if you prefer).
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 1) Get the session (NextAuth) - Remove the { req } parameter
  const session = await getSession();
  // Fix line 27: Use optional chain instead of && operator
  if (!session?.user?.name) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  // Fix line 31: Remove unnecessary type assertion
  const username = session.user.name;

  try {
    // 2) Look up the user in Prisma to find stripeConnectId
    const user = await prisma.user.findUnique({
      where: { username },
      select: { stripeConnectId: true },
    });

    // Fix line 40: Use optional chain instead of && operator
    if (!user?.stripeConnectId) {
      return res
        .status(400)
        .json({ error: "No Stripe Connect account found for this user." });
    }

    // 3) Create a one‐time login link for that connected account
    //    If you'd like to redirect back to your own dashboard after login,
    //    you can add a `redirect_url` parameter here (optional).
    const loginLink = await stripe.accounts.createLoginLink(
      user.stripeConnectId,
      {
        // Optional: you can force Stripe to redirect back to your site:
        // redirect_url: `${process.env.NEXTAUTH_URL}/some‐dashboard‐route`
      }
    );

    // 4) Return the URL to the frontend
    return res.status(200).json({ url: loginLink.url });
  } catch (err: unknown) { // Fix line 59: Replace any with unknown
    const error = err as StripeError;
    console.error("Error creating Stripe login link:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
