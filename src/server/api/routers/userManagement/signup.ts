import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import * as bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";

const signupSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
});

export const signupRouter = createTRPCRouter({
  signup: publicProcedure
    .input(signupSchema)
    .mutation(async ({ input, ctx }) => {
      if (input.password !== input.confirmPassword) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Passwords don't match",
        });
      }

      const existingUser = await ctx.db.user.findFirst({
        where: {
          OR: [{ username: input.username }],
        },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already exists",
        });
      }

      const hashPasswd = await bcrypt.hash(input.password, 10);

      await ctx.db.user.create({
        data: {
          id: input.username,
          username: input.username,
          email: input.email,
          password: hashPasswd,
          fname: null,
          lname: null,
          stripeConnectId: null,
          pictureUrl: "/UserImages/default_pfp.svg",
        },
      });

      // Send welcome email to new user
      try {
        const { notifyUserOfWelcome } = await import("@/server/api/routers/inboxEmailNotifier");
        await notifyUserOfWelcome(input.username);
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }

      return {
        success: true,
      };
    }),
});
