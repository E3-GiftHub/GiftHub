import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const upcomingEventsRouter = createTRPCRouter({
  getUpcomingEvents: publicProcedure.query(async ({ ctx }) => {

    /*
// Enable this once session handling is ready
if (!ctx.session) {
  throw new TRPCError({
    code: "UNAUTHORIZED",
    message: "You must be logged in",
  });
}
*/


    // alegem userul care participa la evenimentul cel mai recent
    const mostRecentEvent = await ctx.db.event.findFirst({
      orderBy: { date: "desc" },
      include: {
        invitations: true,
      }
    });

    if (!mostRecentEvent) {
      return [];
    }

    let userIdentifier = mostRecentEvent.createdByUsername;

    const acceptedInvitation = mostRecentEvent.invitations.find(
        inv => inv.status === "ACCEPTED"
    );

    if (acceptedInvitation) {
      userIdentifier = acceptedInvitation.guestUsername;
    }

    if (!userIdentifier) {
      return [];
    }

    const today = new Date();

    ///////

    const userEvents = await ctx.db.event.findMany({
      where: {
        OR: [
          { createdByUsername: userIdentifier },
          {
            invitations: {
              some: {
                guestUsername: userIdentifier,
                status: "ACCEPTED"
              }
            }
          }
        ],
        NOT: { id: mostRecentEvent.id },
        date: { gte: today }
      },
      orderBy: { date: "asc" },
      take: 3,
      select: {
        id: true,
        pictureUrl: true,
        title: true,
        description: true,
        location: true,
        date: true,
      },
    });

    return userEvents.map((event) => ({
      id: event.id,
      photo: event.pictureUrl,
      title: event.title,
      description: event.description,
      location: event.location,
      date: event.date,
    }));
  }),
});