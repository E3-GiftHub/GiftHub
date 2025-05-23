import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const invitationsRouter = createTRPCRouter({
  getRecentInvitations: publicProcedure.input(
      z.object({
        month: z.number().min(1).max(12),
        year: z.number().min(1900),
      })
    ).query(async ({ ctx, input }) => {
      const { month, year } = input;
    /*
    // Enable this once session handling is ready
    if (!ctx.session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in",
      });
    }
    */

    const allUsers = await ctx.db.user.findMany({
      select: { username: true },
    });

    if (!allUsers.length) {
      return [];
    }

// Alege un utilizator random
    const randomIndex = Math.floor(Math.random() * allUsers.length);
    const userIdentifier = allUsers[randomIndex]?.username;

    if (!userIdentifier) {
      return [];
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const invitations = await ctx.db.invitation.findMany({
      where: {
        guestUsername: userIdentifier,
        event: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
      },
      orderBy: {
        event: {
        date: "asc",
        },
     },
      include: {
        event: true,
      },
    });

    return invitations
        .filter((inv) => inv.event !== null)
        .map((inv) => {
          const event = inv.event;
          return {
            id: event.id,
            title: event.title,
            description: event.description,
            photo: event.pictureUrl,
            location: event.location,
            date: event.date,
          };
        });
  }),
  acceptInvitation: publicProcedure.input(z.object({ eventId: z.number(), guestUsername: z.string() })).mutation(async ({ ctx, input }) => {
    const invitation = await ctx.db.invitation.updateMany({
      where: {
        eventId: input.eventId,
        guestUsername: input.guestUsername,
      },
      data: {
        status: "ACCEPTED",
        repliedAt: new Date(),
      },
    });
    if (invitation.count === 0) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Invitation not found" });
    }
    return { success: true };
  }),
});