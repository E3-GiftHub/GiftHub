import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const calendarRouter = createTRPCRouter({
    getEventsByMonth: publicProcedure
        .input(
            z.object({
                month: z.number().min(1).max(12),
            })
        )
        .query(async ({ ctx, input }) => {
            const { month } = input;

            // date mock pt testare
            return [
                {
                    id: 1,
                    title: "eveniment 1",
                    description: "descriere test",
                    date: new Date(2025, month - 1, 15),
                    location: "loc 1"
                },
                {
                    id: 2,
                    title: "eveniment 2",
                    description: "descriere",
                    date: new Date(2025, month - 1, 22),
                    location: "loc 2"
                }
            ];


            /*
            if (!ctx.session) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "You must be logged in",
                });
            }

            const currentUser = ctx.session.user;
            const userIdentifier = currentUser.id;

            const startDate = new Date(month - 1, 1);
            const endDate = new Date(month, 0);

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

            const events = invitations.map(invitation => invitation.event);
            return events;
            */
        }),
});