import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const calendarRouter = createTRPCRouter({
  getEventsByMonth: publicProcedure
    .input(
      z.object({
        month: z.number().min(1).max(12),
        year: z
          .number()
          .min(2000)
          .max(2100)
          .optional()
          .default(() => new Date().getFullYear()),
        username: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { month, year } = input;

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const invitations = await ctx.db.invitation.findMany({
        where: {
          guestUsername: input.username,
          event: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
        include: {
          event: true,
        },
      });

      const events = invitations
        .filter((inv) => inv.event !== null)
        .map((invitation) => invitation.event);

      return events;
    }),
});
