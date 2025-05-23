import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const eventRouter = createTRPCRouter({
  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
    const event = await ctx.db.event.findUnique({
      where: { id: input.id },
      select: { id: true, title: true, description: true, location: true, date: true },
    });
    if (!event) return null;
    return event;
  }),
});
