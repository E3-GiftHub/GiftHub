import { createTRPCRouter, publicProcedure } from "../trpc";

export const invitesNotificationRouter = createTRPCRouter({
    getUserInvitations: publicProcedure.query(async ({ ctx }) => {
        const userIdentifier = "user1"; // Hardcoded user for now

        // Fetch invitations with status PENDING for user1
        const invitations = await ctx.db.invitation.findMany({
            where: {
                guestUsername: userIdentifier,
                status: "PENDING",
            },
            include: {
                event: {
                    select: {
                        description: true,
                        createdByUsername: true,
                        pictureUrl: true,
                    },
                },
            },
        });

        // Fetch event creators' details
        const creatorUsernames = invitations.map((inv) => inv.event?.createdByUsername);
        const creators = await ctx.db.user.findMany({
            where: {
                username: { in: creatorUsernames },
            },
            select: {
                username: true,
                fname: true,
                lname: true,
            },
        });

        // Map creator details for quick lookup
        const creatorMap = creators.reduce((map, creator) => {
            map[creator.username] = {
                fname: creator.fname ?? "", // Default to an empty string if null
                lname: creator.lname ?? "", // Default to an empty string if null
            };
            return map;
        }, {} as Record<string, { fname: string; lname: string }>);

        // Format the response
        return invitations.map((inv) => ({
            id: inv.id,
            description: inv.event?.description ?? "",
            type: "invitation",
            link: `/invite#${inv.id}`,
            firstName: creatorMap[inv.event?.createdByUsername ?? ""]?.fname ?? "",
            lastName: creatorMap[inv.event?.createdByUsername ?? ""]?.lname ?? "",
            profilePicture: inv.event?.pictureUrl ?? "",
            createdAt: inv.createdAt,
        }));
    }),
});