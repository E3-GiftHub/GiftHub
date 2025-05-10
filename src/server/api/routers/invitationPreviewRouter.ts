import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const invitationsRouter = createTRPCRouter({
  getRecentInvitations: publicProcedure.query(async ({ ctx }) => {
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

    const invitations = await ctx.db.invitation.findMany({
      where: {
        guestUsername: userIdentifier,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
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
});