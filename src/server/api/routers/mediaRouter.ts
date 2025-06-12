import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { utapi } from "@/server/uploadthing";

export const mediaRouter = createTRPCRouter({
  getMediaByEvent: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.media.findMany({
        where: {
          eventId: input.eventId,
        },
        select: {
          id: true,
          url: true,
          caption: true,
        },
      });
    }),

  removeMedia: publicProcedure
    .input(z.object({ mediaId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const media = await ctx.db.media.findUnique({
          where: { id: input.mediaId },
          select: { key: true },
        });

        if (!media) return { success: false, message: "Media not found." };

        // first delete on their server
        const { key } = media;
        const result = await utapi.deleteFiles(key);
        if (!result.success)
          return {
            success: false,
            message: "Media can not be removed from uploadthing.",
          };

        // second delete on ours
        await ctx.db.media.delete({
          where: { id: input.mediaId },
        });

        return { success: true, message: "Media removed successfully." };
      } catch (err) {
        console.error("❌ Error deleting media:", err);
        return { success: false, message: "Failed to delete media." };
      }
    }),
});
