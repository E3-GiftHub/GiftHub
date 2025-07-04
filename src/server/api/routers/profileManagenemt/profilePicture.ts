import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const profilePictureRouter = createTRPCRouter({
  upload: protectedProcedure
    .input(
      z.object({
        key: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!input.key.includes(ctx.session.user.name!)) {
        throw new Error("Unauthorized file access");
      }

      const fileUrl = `${process.env.AUTH_URL}/api/uploadthing/${input.key}`;

      await ctx.db.user.update({
        where: {
          username: ctx.session.user.name!,
        },
        data: {
          pictureUrl: fileUrl,
        },
      });

      return {
        success: true,
        url: fileUrl,
      };
    }),
  delete: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: {
        username: ctx.session.user.name!,
      },
      select: {
        pictureUrl: true,
      },
    });

    if (!user?.pictureUrl) {
      throw new Error("No profile picture to delete");
    }

    try {
      await ctx.db.user.update({
        where: {
          username: ctx.session.user.name!,
        },
        data: {
          pictureUrl: null,
        },
      });

      return {
        success: true,
      };
    } catch (e) {
      alert("Failed to delete profile picture");
    }
  }),
});
