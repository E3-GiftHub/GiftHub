import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

const getUserInput = z.object({
  username: z.string(),
});

// Input schema for updateUser mutation
const updateUserInput = z.object({
  fname: z.string().optional(),
  lname: z.string().optional(),
  email: z.string().email().optional(),
  iban: z.string().optional(),
  pictureUrl: z.string().url().optional(),
});

export const userRouter = createTRPCRouter({
  // Get a user by username
  getUser: protectedProcedure
    .input(getUserInput)
    .query(async ({ ctx, input }) => {
      console.log("[getUser] Session:", ctx.session);
      console.log("[getUser] Input username:", input.username);

      const user = await ctx.db.user.findUnique({
        where: { username: input.username },
        select: {
          username: true,
          email: true,
          id: true,
          fname: true,
          lname: true,
          iban: true,
          pictureUrl: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      console.log("[getUser] Found user:", user);
      return user;
    }),

  // Get current logged in user by username from session
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    console.log("[getCurrentUser] Session:", ctx.session);

    const username = ctx.session?.user?.id; // id now holds the username

    if (!username) {
      console.warn("[getCurrentUser] No username found in session");
      return null;
    }

    const user = await ctx.db.user.findUnique({
      where: { username },
      select: {
        username: true,
        email: true,
        id: true,
        fname: true,
        lname: true,
        iban: true,
        pictureUrl: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log("[getCurrentUser] Found user:", user);
    return user;
  }),

  // Delete user by username from session
  deleteUser: protectedProcedure.mutation(async ({ ctx }) => {
    const username = ctx.session?.user?.id; // id now holds the username

    if (!username) {
      throw new Error("Not authenticated");
    }

    console.log("[deleteUser] Deleting user:", username);

    try {
      await ctx.db.user.delete({
        where: { username },
      });
      console.log("[deleteUser] User deleted successfully");
      return { success: true };
    } catch (error) {
      console.error("[deleteUser] Error deleting user:", error);
      throw new Error("Failed to delete user");
    }
  }),

  // New mutation: Update user info by username from session
  updateUser: protectedProcedure
    .input(updateUserInput)
    .mutation(async ({ ctx, input }) => {
      const username = ctx.session?.user?.id;

      if (!username) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      // Check for unique email if updating email
      if (input.email) {
        const existingUserWithEmail = await ctx.db.user.findUnique({
          where: { email: input.email },
        });
        if (existingUserWithEmail && existingUserWithEmail.username !== username) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email is already in use",
          });
        }
      }

      try {
        const updatedUser = await ctx.db.user.update({
          where: { username },
          data: {
            fname: input.fname,
            lname: input.lname,
            email: input.email,
            iban: input.iban,
            pictureUrl: input.pictureUrl,
          },
        });
        console.log("[updateUser] User updated:", updatedUser);
        return updatedUser;
      } catch (error) {
        console.error("[updateUser] Error updating user:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user",
        });
      }
    }),
});
