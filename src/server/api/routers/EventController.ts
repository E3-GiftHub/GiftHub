import { z } from "zod";
import { db as prisma } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { EventPlanner } from "~/server/services/EventPlanner";
import { EventEntity } from "~/server/services/Event";
import { StatusType } from "@prisma/client";
import type { User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
const eventPlanner = new EventPlanner();

const handle = async <T>(fn: () => Promise<T>) => {
  try {
    return { success: true, data: await fn() };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Unexpected error",
    );
  }
};

export const eventRouter = createTRPCRouter({
  createEvent: publicProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string(),
        date: z.date(),
        time: z.date(),
        location: z.string().min(1, "Location is required"),
      }),
    )
     .mutation(({ input, ctx }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });

      return handle(() =>
        eventPlanner
          .createEvent({
            ...input,
            createdBy: userId,
          })
          .then((event) => event.raw)
      );
    }),

  getEventID: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(({ input }) =>
      handle(() =>
        prisma.event.findUniqueOrThrow({
          where: { id: input.eventId },
        }),
      ),
    ),
  getEventToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(({ input }) =>
      handle(() =>
        prisma.event.findUniqueOrThrow({
          where: { token: input.token },
        }),
      ),
    ),
  /*  Depricated
  publishEvent: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .mutation(({ input }) =>
      handle(() => EventEntity.publishEvent(input.eventId).then(() => undefined))
    ),
*/
  removeEvent: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });

      return handle(async () => {
        const event = await prisma.event.findUnique({
          where: { id: input.eventId },
        });

        if (!event || event.createdByUsername !== userId) {
          throw new Error("Not authorized to remove this event");
        }

        await eventPlanner.removeEvent(input.eventId);
      });
    }),

  sendInvitation: publicProcedure
    .input(z.object({ eventId: z.number(), guestId: z.string() }))
    .mutation(({ input }) =>
      handle(() => eventPlanner.sendInvitation(input.eventId, input.guestId)),
    ),

  /*

  getEventAnalytics: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(({ input }) =>
      handle(() => eventPlanner.viewAnalytics(input.eventId))
    ),




  getEventWishlist: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(({ input }) =>
      handle(() => eventPlanner.manageWishlist(input.eventId))
    ),

  getEventGallery: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(({ input }) =>
      handle(() => eventPlanner.manageGallery(input.eventId))
    ),

  getEventContributions: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(({ input }) =>
      handle(() => eventPlanner.receiveContribution(input.eventId))
    ),

*/

   getUserEvents: publicProcedure.query(({ ctx }) => {
    const userId = ctx.session?.user?.id;
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });

    return handle(() =>
      prisma.event.findMany({
        where: { createdByUsername: userId },
        orderBy: { date: "asc" },
      })
    );
  }),

  getInvitedEvents: publicProcedure.query(({ ctx }) => {
    const userId = ctx.session?.user?.id;
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });

    return handle(() =>
      prisma.invitation.findMany({
        where: { guestUsername: userId },
        include: { event: true },
      })
    );
  }),
    respondToInvitation: publicProcedure
    .input(z.object({
      invitationId: z.number(),
      status: z.nativeEnum(StatusType),
    }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });

      return handle(async () => {
        const invitation = await prisma.invitation.findUnique({
          where: { id: input.invitationId },
        });

        if (!invitation) {
          throw new Error("Invitation not found");
        }

        if (invitation.guestUsername !== userId) {
          throw new Error("Not authorized to respond to this invitation");
        }

        await prisma.invitation.update({
          where: { id: input.invitationId },
          data: { status: input.status },
        });
      });
    }),
});
