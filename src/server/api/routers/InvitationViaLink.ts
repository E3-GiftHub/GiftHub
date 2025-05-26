import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { nanoid } from "nanoid";
import { db as prisma } from "~/server/db";
import { TRPCError } from "@trpc/server";

export const invitationViaLinkRouter = createTRPCRouter({
  createLink: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session || !ctx.session.user)
        throw new TRPCError({ code: "UNAUTHORIZED" });

      const existing = await prisma.event.findUnique({
        where: { id: input.eventId },
        select: { token: true },
      });

      if (existing) return existing.token;

      const token = nanoid(12);
      const invitation = await prisma.event.update({
        where: { id: input.eventId },
        data: {
          token: token,
        },
      });

      return { token };
    }),
});
