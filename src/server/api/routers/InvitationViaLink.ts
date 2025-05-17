import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { nanoid } from "nanoid";
import { db as prisma } from "~/server/db"

export const invitationViaLinkRouter = createTRPCRouter({

	createLink: protectedProcedure
	.input(z.object({ eventId: z.string() }))
	.mutation(async ({ ctx, input }) => {

	const existing = await prisma.eventInvitationToken.findUnique({
		where: { eventId: input.eventId },
		select: { token: true },
	});

	if (existing) return existing.token;	


	const token = nanoid(12); 
	const invitation = await prisma.eventInvitationToken.create({
		data: {
		 eventId: input.eventId,
		 token: token,
		},
	});

	return { token };
    }),
	



});
