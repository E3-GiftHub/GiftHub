import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import * as bcrypt from "bcrypt";

const updatePasswordSchema = z
  .object({
    token: z.string(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export const updatePasswordRouter = createTRPCRouter({
  update: publicProcedure
    .input(updatePasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db.user.findFirst({
        where: {
          emailToken: input.token,
        },
      });

      if (!user?.emailToken || !user.tokenExpires) {
        console.error(
          "Password reset attempt: Invalid token or no user found for token.",
          { token: input.token, userExists: !!user },
        );
        throw new Error("Invalid or expired password reset link.");
      }

      if (user.tokenExpires < new Date()) {
        console.error(
          "Password reset attempt: Token expired for user:",
          user.email,
        );
        await ctx.db.user.update({
          where: { email: user.email! }, // <-- ADDED '!' HERE
          data: { emailToken: null, tokenExpires: null },
        });
        throw new Error(
          "Password reset link has expired. Please request a new one.",
        ); // Corrected new Error
      }

      const hashPasswd = await bcrypt.hash(input.password, 10);
      await ctx.db.user.update({
        where: { email: user.email! },
        data: {
          password: hashPasswd,
          emailToken: null,
          tokenExpires: null,
        },
      });
      return {
        success: true,
      };
    }),

  updateLogged: publicProcedure
    .input(
      z.object({ username: z.string(), pass: z.string(), word: z.string() }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db.user.findFirst({
        where: {
          username: input.username,
        },
        select: { username: true },
      });

      if (!user) throw new Error("Invalid session.");
      if (input.pass !== input.word) throw new Error("Password missmatch.");

      const hashPasswd = await bcrypt.hash(input.pass, 10);
      await ctx.db.user.update({
        where: { username: input.username },
        data: {
          password: hashPasswd,
        },
      });
      return {
        success: true,
      };
    }),
});
