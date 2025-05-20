import { z } from "zod";
import { db as prisma } from "~/server/db"
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc"; // Adjust path as needed
import { EventPlanner } from "../../../services/EventPlanner";
import { EventEntity } from "../../../services/Event";
import { Status } from "@prisma/client";

const eventPlanner = new EventPlanner();

export const eventRouter = createTRPCRouter({
  createEvent: publicProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string(),
        date: z.date(),
        time: z.date(),
        location: z.string().min(1, "Location is required"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const event = await eventPlanner.createEvent({
          ...input,
          //createdBy: ctx.session.user.id,
	  createdBy: "Nescafe",
	  id: 1,
        });
        return { success: true, data: event.raw };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to create event");
      }
    }),

  getEvent: publicProcedure
    .input(z.object({ eventId: z.string().or(z.number()).transform(val => BigInt(val)) }))
    .query(async ({ input }) => {
      try {
        const event = await prisma.event.findUnique({
          where: { id: input.eventId },
          include: {
            invitations: true,
          },
        });
        
        if (!event) {
          throw new Error("Event not found");
        }
        
        return { success: true, data: event };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to retrieve event");
      }
    }),

  publishEvent: publicProcedure
    .input(z.object({ eventId: z.string().or(z.number()).transform(val => BigInt(val)) }))
    .mutation(async ({ input }) => {
      try {
        await EventEntity.publishEvent(input.eventId);
        return { success: true };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to publish event");
      }
    }),

  removeEvent: publicProcedure
    .input(z.object({ eventId: z.string().or(z.number()).transform(val => BigInt(val)) }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Optional: Add check if user is event creator
        const event = await prisma.event.findUnique({ where: { id: input.eventId } });
        if (event?.createdBy !== ctx.session.user.id) throw new Error("Not authorized");
        
        await eventPlanner.removeEvent(input.eventId);
        return { success: true };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to remove event");
      }
    }),

  sendInvitation: publicProcedure
    .input(
      z.object({
        eventId: z.string().or(z.number()).transform(val => BigInt(val)),
        guestId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await eventPlanner.sendInvitation(input.eventId, input.guestId);
        return { success: true };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to send invitation");
      }
    }),

  getEventAnalytics: publicProcedure
    .input(z.object({ eventId: z.string().or(z.number()).transform(val => BigInt(val)) }))
    .query(async ({ input }) => {
      try {
        const analytics = await eventPlanner.viewAnalytics(input.eventId);
        return { success: true, data: analytics };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to get event analytics");
      }
    }),

  getEventWishlist: publicProcedure
    .input(z.object({ eventId: z.string().or(z.number()).transform(val => BigInt(val)) }))
    .query(async ({ input }) => {
      try {
        const wishlist = await eventPlanner.manageWishlist(input.eventId);
        return { success: true, data: wishlist };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to get event wishlist");
      }
    }),

  getEventGallery: publicProcedure
    .input(z.object({ eventId: z.string().or(z.number()).transform(val => BigInt(val)) }))
    .query(async ({ input }) => {
      try {
        const gallery = await eventPlanner.manageGallery(input.eventId);
        return { success: true, data: gallery };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to get event gallery");
      }
    }),

  getEventContributions: publicProcedure
    .input(z.object({ eventId: z.string().or(z.number()).transform(val => BigInt(val)) }))
    .query(async ({ input }) => {
      try {
        const contributions = await eventPlanner.receiveContribution(input.eventId);
        return { success: true, data: contributions };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to get event contributions");
      }
    }),

  getUserEvents: publicProcedure
    .query(async ({ ctx }) => {
      try {
        const events = await prisma.event.findMany({
          where: { createdBy: ctx.session.user.id },
          orderBy: { date: 'asc' }
        });
        return { success: true, data: events };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to get user events");
      }
    }),

  getInvitedEvents: publicProcedure
    .query(async ({ ctx }) => {
      try {
        const invitations = await prisma.invitation.findMany({
          where: { guestId: ctx.session.user.id },
          include: { event: true }
        });
        return { success: true, data: invitations };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to get invited events");
      }
    }),

  respondToInvitation: publicProcedure
    .input(
      z.object({
        invitationId: z.string().or(z.number()).transform(val => BigInt(val)),
        status: z.nativeEnum(Status)
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const invitation = await prisma.invitation.findUnique({
          where: { id: input.invitationId }
        });
        
        if (!invitation) {
          throw new Error("Invitation not found");
        }
        
        if (invitation.guestId !== ctx.session.user.id) {
          throw new Error("Not authorized to respond to this invitation");
        }
        
        await prisma.invitation.update({
          where: { id: input.invitationId },
          data: { status: input.status }
        });
        
        return { success: true };
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Failed to respond to invitation");
      }
    }),
});

