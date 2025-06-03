import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

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
