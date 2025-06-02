// src/server/api/routers/user.ts
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  getSelf: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User identifier not found in session." });
    }

    const user = await ctx.db.user.findUnique({
      where: { username: ctx.session.user.id },
      select: {
        stripeConnectId: true,
        //id: true,
        username: true,
        email: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found with the provided identifier from session.",
      });
    }
    return user;
  }),
});
