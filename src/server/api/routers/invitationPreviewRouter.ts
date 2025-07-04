import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const invitationsRouter = createTRPCRouter({
  getRecentInvitations: publicProcedure
    .input(
      z.object({
        month: z.number().min(1).max(12),
        year: z.number().min(1900),
      }),
    )
    .query(async ({ ctx, input }) => {
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
  acceptInvitation: publicProcedure
    .input(z.object({ eventId: z.number(), guestUsername: z.string() }))
    .mutation(async ({ ctx, input }) => {
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
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      // sends email notification to event owner about invitation acceptance
      try {
        const { notifyEventOwnerOfInvitationResponse } = await import("@/server/api/routers/inboxEmailNotifier");
        await notifyEventOwnerOfInvitationResponse(
          input.eventId,
          input.guestUsername,
          "ACCEPTED"
        );
      } catch (emailError) {
        console.error("Failed to send acceptance notification email:", emailError);
      }

      return { success: true };
    }),


declineInvitation: publicProcedure
  .input(z.object({ 
    eventId: z.number(), 
    guestUsername: z.string() 
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      // Verifică dacă invitația există
      const invitation = await ctx.db.invitation.findFirst({
        where: {
          eventId: input.eventId,
          guestUsername: input.guestUsername,
        },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      // Verifică dacă invitația este în status PENDING (nu a fost deja acceptată)
      if (invitation.status === "ACCEPTED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot decline an already accepted invitation",
        });
      }

      // Șterge invitația din baza de date
      await ctx.db.invitation.delete({
        where: {
          id: invitation.id,
        },
      });

      // sends email notification to event owner about invitation decline
      try {
        const { notifyEventOwnerOfInvitationResponse } = await import("@/server/api/routers/inboxEmailNotifier");
        await notifyEventOwnerOfInvitationResponse(
          input.eventId,
          input.guestUsername,
          "DECLINED"
        );
      } catch (emailError) {
        console.error("Failed to send decline notification email:", emailError);
      }

      return { 
        success: true, 
        message: "Invitation declined successfully" 
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      
      console.error("Error declining invitation:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to decline invitation",
      });
    }
  }),

  getInvitationForUserEvent: publicProcedure
    .input(z.object({ eventId: z.number(), guestUsername: z.string() }))
    .query(async ({ ctx, input }) => {
      const invitation = await ctx.db.invitation.findFirst({
        where: {
          eventId: input.eventId,
          guestUsername: input.guestUsername,
        },
        select: {
          status: true,
        },
      });
      return invitation; // v a returna null (undefined) daca nu exista invitatie :(
    }),

  getPlanner: publicProcedure
    .input(z.object({ eventId: z.number(), guestUsername: z.string() }))
    .query(async ({ ctx, input }) => {
      const plannerUsername = await ctx.db.event.findUnique({
        where: { id: input.eventId },
        select: { createdByUsername: true },
      });
      return plannerUsername;
    }),

  getInvitationById: publicProcedure
    .input(z.object({ invitationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const invitation = await ctx.db.invitation.findUnique({
        where: { id: input.invitationId },
        include: { event: true },
      });
      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }
      return invitation;
    }),
});
