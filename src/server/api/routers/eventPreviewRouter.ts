import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const upcomingEventsRouter = createTRPCRouter({
  getUpcomingEvents: publicProcedure.query(async ({ ctx }) => {
    // alegem userul care participa la evenimentul cel mai recent
    const today = new Date();
    const userIdentifier = ctx.session!.user!.name!;

    const userEvents = await ctx.db.event.findMany({
      where: {
        createdByUsername: userIdentifier,
      },
      orderBy: { date: "desc" },
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
