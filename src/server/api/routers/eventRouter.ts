import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import formatField from "~/utils/formatField";

export const eventRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      // Fetch event info with planner (creator) and accepted guests only
      const event = await ctx.db.event.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          date: true,
          pictureUrl: true,
          createdByUsername: true,
          user: {
            // planner info
            select: {
              username: true,
              fname: true,
              lname: true,
              pictureUrl: true,
            },
          },
          invitations: {
            where: { status: "ACCEPTED" },
            select: {
              guest: {
                select: {
                  username: true,
                  fname: true,
                  lname: true,
                  pictureUrl: true,
                },
              },
            },
          },
        },
      });

      if (!event) return null;

      // Map accepted guests
      const guests = event.invitations.map((inv) => ({
        id: inv.guest.username,
        name: `${formatField(inv.guest.fname)} ${formatField(inv.guest.lname)}`.trim(),
        profilePicture: inv.guest.pictureUrl ?? "/api/placeholder/40/40",
        role: "guest" as const,
      }));

      const planner = {
        id: event.user?.username ?? "",
        name: `${event.user?.fname ?? "Event"} ${event.user?.lname ?? "Planner"}`.trim(),
        profilePicture: event.user?.pictureUrl ?? "/api/placeholder/40/40",
        role: "planner" as const,
      };

      return {
        id: event.id,
        title: event.title ?? "",
        description: event.description ?? "",
        location: event.location ?? "",
        date: String(event.date),
        pictureUrl: event.pictureUrl ?? "/api/placeholder/300/200",
        planner,
        guests,
      };
    }),
});
