import { z } from "zod";
import { db as prisma } from "~/server/db";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { EventPlanner } from "~/server/services/EventPlanner";
import { StatusType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { utapi } from "@/server/uploadthing";
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

export const eventPlannerRouter = createTRPCRouter({
  createEvent: publicProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string(),
        date: z.date(),
        location: z.string().min(1, "Location is required"),
      }),
    )
    .mutation(({ input, ctx }) => {
      const user = ctx.session?.user?.name;
      if (!user)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });

      return handle(() =>
        eventPlanner
          .createEvent({
            ...input,
            createdBy: user,
          })
          .then((event) => event.raw),
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
        prisma.event.findFirstOrThrow({
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
      const userId = ctx.session?.user?.name;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const event = await prisma.event.findUnique({
        where: { id: input.eventId },
      });

      if (!event || event.createdByUsername !== userId) {
        return {
          success: false,
          message: "Not authorized to delete this event.",
        };
      }

      const hasLockedArticles = await prisma.eventArticle.findFirst({
        where: {
          eventId: input.eventId,
          OR: [
            { marks: { some: { type: "PURCHASED" } } },
            { contributions: { some: {} } },
          ],
        },
      });

      if (hasLockedArticles) {
        return {
          success: false,
          message:
            "Cannot delete event: items are purchased or contributed to.",
        };
      }

      // all good now delete pfp, media, articles
      if (event.pictureKey) await utapi.deleteFiles(event.pictureKey);

      const media = await prisma.media.findMany({
        where: { eventId: event.id },
        select: { key: true },
      });

      // only uploadthing deletion because we have cascade constraints
      for (const photo of media) {
        if (!photo?.key) continue;
        await utapi.deleteFiles(photo.key);
      }

      // manually delete custom items created
      const customs = await prisma.eventArticle.findMany({
        where: { eventId: event.id },
        include: {
          item: { select: { id: true, imagesKey: true } },
        },
      });

      // only if imagesKey is NOT NULL => custom item => delete it
      for (const art of customs) {
        if (!art?.item?.imagesKey) continue;
        await prisma.eventArticle.delete({ where: { id: art.id } });
        await utapi.deleteFiles(art.item.imagesKey);
        await prisma.item.delete({ where: { id: art.item.id } });
      }

      await prisma.event.delete({
        where: { id: input.eventId },
      });

      return {
        success: true,
        message: "Event deleted successfully.",
      };
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
    const userId = ctx.session?.user?.name;
    if (!userId)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });

    return handle(() =>
      prisma.event.findMany({
        where: { createdByUsername: userId },
        orderBy: { date: "asc" },
      }),
    );
  }),

  getInvitedEvents: publicProcedure.query(({ ctx }) => {
    const userId = ctx.session?.user?.name;
    if (!userId)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });

    return handle(() =>
      prisma.invitation.findMany({
        where: { guestUsername: userId },
        include: { event: true },
      }),
    );
  }),
  respondToInvitation: publicProcedure
    .input(
      z.object({
        invitationId: z.number(),
        status: z.nativeEnum(StatusType),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session?.user?.name;
      if (!userId)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });

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

  updateEvent: publicProcedure
    .input(
      z.object({
        eventId: z.number(),
        title: z.string().nullable(),
        description: z.string().nullable(),
        date: z.date(),
        location: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { eventId, title, description, date, location } = input;
      return ctx.db.event.update({
        where: { id: eventId },
        data: {
          title,
          description,
          date: date,
          location,
        },
      });
    }),
});
