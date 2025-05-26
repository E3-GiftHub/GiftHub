// src/server/api/routers/stripeRouter.ts
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"; // Asigură-te că publicProcedure este importat dacă păstrezi helloStripe
import { z } from "zod";
import { stripe } from "../../stripe"; // Calea către instanța ta Stripe SDK
import { TRPCError } from "@trpc/server";
import Stripe from "stripe"; // Tipurile Stripe

export const stripeRouter = createTRPCRouter({
  // Procedura ta existentă createExpressAccount
  createExpressAccount: protectedProcedure
    .input(z.object({
      country: z.string(),
      email: z.string().email(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Logica ta originală pentru createExpressAccount
      const account = await stripe.accounts.create({
        type: "express",
        country: input.country,
        email: input.email,
        metadata: { userId: ctx.session.user.id }, // Presupunând că ctx.session.user.id este câmpul corect
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      await ctx.db.user.update({
        where: { id: ctx.session.user.id }, // Presupunând că ctx.session.user.id este câmpul corect
        data: { stripeAccountId: account.id },
      });
      return { accountId: account.id };
    }),

  // ✨ VERSIUNEA ORIGINALĂ COMPLETĂ a createDashboardLoginLink ✨
  createDashboardLoginLink: protectedProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.session.user.id; // protectedProcedure asigură că session.user.id există

      const user = await ctx.db.user.findUnique({
        where: { id: userId }, // Presupunând că ctx.session.user.id este câmpul corect
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found.",
        });
      }

      if (!user.stripeAccountId) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Stripe account not configured for this user.",
        });
      }

      try {
        const loginLink = await stripe.accounts.createLoginLink(
          user.stripeAccountId
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

  // Procedura de test helloStripe (o poți șterge dacă nu mai este necesară)
  helloStripe: publicProcedure.query(() => {
    console.log(">>> [TEST] Backend: stripeRouter.helloStripe a fost apelat!");
    return "Mesaj de test din helloStripe!";
  }),
});