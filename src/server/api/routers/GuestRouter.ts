import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db as prisma } from "~/server/db";
import { StatusType } from "@prisma/client";

export const guestRouter = createTRPCRouter({
  getGuestsForEvent: publicProcedure
    .input(
      z.object({
        eventId: z.number(),
        status: z.nativeEnum(StatusType).optional(),
      })
    )
    .query(async ({ input }) => {
      const guests = await prisma.invitation.findMany({
        where: {
          eventId: input.eventId,
          ...(input.status ? { status: input.status } : {}),
        },
        include: {
          guest: {
            select: {
              username: true,
              fname: true,
              lname: true,
              email: true,
              pictureUrl: true,
            },
          },
        },
      });
      return guests;
    }),

  addGuestToEvent: publicProcedure
    .input(
      z.object({
        eventId: z.number(),
        guestUsername: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const existing = await prisma.invitation.findFirst({
        where: {
          eventId: input.eventId,
          guestUsername: input.guestUsername,
        },
      });
      if (existing) {
        throw new Error("Invitation already exists for this guest and event.");
      }
      const invitation = await prisma.invitation.create({
        data: {
          eventId: input.eventId,
          guestUsername: input.guestUsername,
          status: StatusType.PENDING,
        },
      });
      return invitation;
    }),

  // ==== aici adaugi procedura de REMOVE ====
  removeGuestFromEvent: publicProcedure
    .input(
      z.object({
        eventId: z.number(),
        guestUsername: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { count } = await prisma.invitation.deleteMany({
        where: {
          eventId: input.eventId,
          guestUsername: input.guestUsername,
        },
      });
      if (count === 0) {
        throw new Error(
          `No invitation found for user "${input.guestUsername}" on event ${input.eventId}`
        );
      }
      return { removedCount: count };
    }),
});
