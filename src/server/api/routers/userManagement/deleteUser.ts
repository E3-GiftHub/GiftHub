import { protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { TRPCError } from "@trpc/server";

export const deleteAccount = protectedProcedure.mutation(async ({ ctx }) => {
  const username = ctx.session.user?.id; // id now stores username

  if (!username) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User not authenticated",
    });
  }

  // Fetch user by username directly (no need to get username from id)
  const user = await db.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  try {
    await db.user.delete({
      where: { username },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Could not delete user.",
    });
  }
});
