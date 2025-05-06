import { createTRPCRouter, publicProcedure } from "../trpc";

export const invitationsRouter = createTRPCRouter({
    getRecentInvitations: publicProcedure
        .query(async () => {
            // Mock data for the 3 most recent invitations
            return [
                {
                    id: 101,
                    title: "Iz ma birthday",
                    description: "Bring gifts."
                },
                {
                    id: 102,
                    title: "Professional yapping session",
                    description: "Learn to yap from the best."
                },
                {
                    id: 103,
                    title: "Team Offsite Retreat",
                    description: "All-hands no feet planning for annual retreat."
                }
            ];

            /*
            // Real DB logic (when you have access) might look like:
            if (!ctx.session) {
              throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in" });
            }
            const userId = ctx.session.user.id;
            const invitations = await ctx.db.invitation.findMany({
              where: { userId },
              orderBy: { createdAt: "desc" },
              take: 3,
            });
            return invitations.map(inv => ({
              id: inv.id,
              title: inv.eventTitle,
              description: inv.eventDescription,
            }));
            */
        }),
});
