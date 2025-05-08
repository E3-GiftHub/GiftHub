import { createTRPCRouter, publicProcedure } from "../trpc";

export const invitationsRouter = createTRPCRouter({
    getRecentInvitations: publicProcedure
        .query(async () => {
            // Mock data for the 3 most recent invitations
            return [
              {
                id: 101,
                title: "Iz ma birthday",
                description: "Bring gifts.",
                photo: "https://m.media-amazon.com/images/I/81DXhu6ONML.jpg",
                location: "Cluj-Napoca",
                date: "2025-05-10",
              },
              {
                id: 102,
                title: "Professional yapping session",
                description: "Learn to yap from the best.",
                photo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9m2_03gJhMH66iD9uC2rQ9eBgZJ8M9D85rQ&s",
                location: "Remote",
                date: "2025-06-15",
              },
              {
                id: 103,
                title: "Team Offsite Retreat",
                description: "All-hands no feet planning for annual retreat.",
                photo: "https://img.freepik.com/free-photo/people-celebrating-party_53876-14410.jpg",
                location: "Sibiu",
                date: "2025-07-01",
              },
              {
                id: 101,
                title: "Iz ma birthday",
                description: "Bring gifts.",
                photo: "https://m.media-amazon.com/images/I/81DXhu6ONML.jpg",
                location: "Cluj-Napoca",
                date: "2025-05-10",
              },
              {
                id: 102,
                title: "Professional yapping session",
                description: "Learn to yap from the best.",
                photo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9m2_03gJhMH66iD9uC2rQ9eBgZJ8M9D85rQ&s",
                location: "Remote",
                date: "2025-06-15",
              },
              {
                id: 103,
                title: "Team Offsite Retreat",
                description: "All-hands no feet planning for annual retreat.",
                photo: "https://img.freepik.com/free-photo/people-celebrating-party_53876-14410.jpg",
                location: "Sibiu",
                date: "2025-07-01",
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
