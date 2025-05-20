import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { stripe } from "../../stripe";

export const stripeRouter = createTRPCRouter({
    createExpressAccount: protectedProcedure
        .input(z.object({
            country: z.string(),        // e.g. "US"
            email:   z.string().email(),
        }))
        .mutation(async ({ input, ctx }) => {
            // 1️⃣ Create the Connect account
            const account = await stripe.accounts.create({
                type: "express",
                country: input.country,
                email: input.email,
                metadata: { userId: ctx.session.user.id },
                capabilities: {
                    card_payments: { requested: true },
                    transfers:     { requested: true },
                },
            });

            // 2️⃣ Persist the account ID on your User model
            await ctx.db.user.update({
                where: { id: ctx.session.user.id },
                data:  { stripeAccountId: account.id },
            });

            return { accountId: account.id };
        }),
});
