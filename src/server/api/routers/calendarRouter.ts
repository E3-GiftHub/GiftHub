import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const calendarRouter = createTRPCRouter({
    getEventsByMonth: publicProcedure
        .input(
            z.object({
                month: z.number().min(1).max(12),
                year: z.number().min(2000).max(2100).optional().default(() => new Date().getFullYear())
            })
        )
        .query(async ({ ctx, input }) => {
            const { month, year } = input;


            /*
            if (!ctx.session) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You must be logged in",
                });
            }
                

            const currentUser = ctx.session.user;
            const userIdentifier = currentUser.id;

            */

            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);

            const userIdentifier = "user1"; 

            const invitations = await ctx.db.invitation.findMany({
            where: {
                guestUsername: userIdentifier,
                event: {
                date: {
                    gte: startDate,
                    lte: endDate,
                }
                }
            },
            include: {
                event: true,
            },
            });

            const events = invitations
            .filter(inv => inv.event !== null)
            .map(invitation => invitation.event);

            return events;

        }),
});