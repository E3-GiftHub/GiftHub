// src/server/api/routers/user.ts
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import type { User } from "next-auth";

interface CustomUser extends User {
  username: string;
}

export const userRouter = createTRPCRouter({
  getSelf: protectedProcedure.query(async ({ ctx }) => {
    // PENTRU WISHLIST SA VEDEM DACA USERUL E INVITAT LA UN EVENT :DDDDDDD
    const user = ctx.session.user as CustomUser;
    if (!user?.username) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Username not found in session." });
    }

    const dbUser = await ctx.db.user.findUnique({
      where: { username: user.username },
      select: {
        stripeConnectId: true,
        username: true,
        email: true,
      },
    });

    if (!dbUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found with the provided username from session.",
      });
    }
    return dbUser;
  }),
});
