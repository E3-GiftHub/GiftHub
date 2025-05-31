// src/server/api/routers/stripeRouter.ts
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { stripe } from "../../stripe";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";

export const stripeRouter = createTRPCRouter({

  createDashboardLoginLink: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Presupunem că ctx.session.user.id conține username-ul utilizatorului.
      if (!ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User identifier not found in session." });
      }
      const userIdentifier = ctx.session.user.id;

      const user = await ctx.db.user.findUnique({
        where: { username: userIdentifier }, // Corectat: id -> username
        select: { stripeConnectId: true }, // Selectăm doar câmpul necesar
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found.",
        });
      }

      if (!user.stripeConnectId) { // Corectat: stripeAccountId -> stripeConnectId
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Stripe account not configured for this user.",
        });
      }

      try {
        const loginLink = await stripe.accounts.createLoginLink(
          user.stripeConnectId // Corectat: stripeAccountId -> stripeConnectId
        );
        return { url: loginLink.url };
      } catch (error) {
        console.error("Stripe createLoginLink error:", error);
        let errorMessage = "Failed to create Stripe dashboard link.";
        if (error instanceof Stripe.errors.StripeError) {
            errorMessage = error.message;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: errorMessage,
          cause: error,
        });
      }
    }),

  helloStripe: publicProcedure.query(() => {
    console.log(">>> [TEST] Backend: stripeRouter.helloStripe a fost apelat!");
    return "Mesaj de test din helloStripe!";
  }),
});
