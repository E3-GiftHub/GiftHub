// src/server/api/routers/user.ts
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  getSelf: protectedProcedure.query(async ({ ctx }) => {
    // PENTRU WISHLIST SA VEDEM DACA USERUL E INVITAT LA UN EVENT :DDDDDDD
    const username = (ctx.session.user as any).username;
    if (!username) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Username not found in session." });
    }

    const user = await ctx.db.user.findUnique({
      where: { username },
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
        message: "User not found with the provided username from session.",
      });
    }
    return user;
  }),
});
