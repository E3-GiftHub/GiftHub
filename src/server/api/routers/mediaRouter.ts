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
        },
      });
    }),
});
