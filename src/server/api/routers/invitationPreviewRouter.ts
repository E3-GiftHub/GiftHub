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


    const userIdentifier = ctx.session!.user!.name!;

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
  getInvitationForUserEvent: publicProcedure.input(z.object({ eventId: z.number(), guestUsername: z.string() })).query(async ({ ctx, input }) => {
    const invitation = await ctx.db.invitation.findFirst({
      where: {
        eventId: input.eventId,
        guestUsername: input.guestUsername,
      },
      select: {
        status: true,
      },
    });
    return invitation; // null if not found, otherwise { status: ... }
  }),
});