import { createTRPCRouter, publicProcedure } from "../trpc";

export const upcomingEventsRouter = createTRPCRouter({
  getUpcomingEvents: publicProcedure.query(async () => {
    // Mock data for the 3 upcoming events
    return [
      {
        id: 201,
        photo:
          "https://media.istockphoto.com/id/1196023167/ro/fotografie/smartphone-%C3%AEn-m%C3%A2n%C4%83-la-un-concert-lumin%C4%83-mov-de-pe-scen%C4%83.webp?s=2048x2048&w=is&k=20&c=vutPOuZGeXZeyPOwLY6Hed7JJ4UCFgELj3NISTBfPlc=",
        title: "Spring Concert",
        description: "Enjoy an evening of classical music under the stars.",
        location: "Iasi",
        date: "2025-05-12T14:30:00Z",
      },
      {
        id: 202,
        photo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRE1lhtjix9KC0H4J0XCFqN2G0pjqeQP4Jp1g&s",
        title: "Art Gallery Opening",
        description:
          "Join us for the unveiling of our new modern art exhibition.",
        location: "Iasi",
        date: "2025-05-12T14:30:00Z",
      },
      {
        id: 203,
        photo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRju--Tsq4lcquiQwPDBvVFOv9QnSFoE-0B0A&s",
        title: "Ziua Izabelei",
        description:
          "Network with fellow developers and hear the latest in web tech.",
        location: "Iasi",
        date: "2025-05-12T14:30:00Z",
      },
      {
        id: 201,
        photo:
          "https://media.istockphoto.com/id/1196023167/ro/fotografie/smartphone-%C3%AEn-m%C3%A2n%C4%83-la-un-concert-lumin%C4%83-mov-de-pe-scen%C4%83.webp?s=2048x2048&w=is&k=20&c=vutPOuZGeXZeyPOwLY6Hed7JJ4UCFgELj3NISTBfPlc=",
        title: "Spring Concert",
        description: "Enjoy an evening of classical music under the stars.",
        location: "Iasi",
        date: "2025-05-12T14:30:00Z",
      },
      {
        id: 202,
        photo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRE1lhtjix9KC0H4J0XCFqN2G0pjqeQP4Jp1g&s",
        title: "Art Gallery Opening",
        description:
          "Join us for the unveiling of our new modern art exhibition.",
        location: "Iasi",
        date: "2025-05-12T14:30:00Z",
      },
      {
        id: 203,
        photo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRju--Tsq4lcquiQwPDBvVFOv9QnSFoE-0B0A&s",
        title: "Ziua Izabelei",
        description:
          "Network with fellow developers and hear the latest in web tech.",
        location: "Iasi",
        date: "2025-05-12T14:30:00Z",
      },
    ];

    /*
      // When connected to your DB, you could do something like:
      if (!ctx.session) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in" });
      }
      const userId = ctx.session.user.id;
      const now = new Date();
      const events = await ctx.db.event.findMany({
        where: { date: { gte: now } },
        orderBy: { date: "asc" },
        take: 3,
      });
      return events.map(evt => ({
        id: evt.id,
        photo: evt.photoUrl,
        title: evt.name,
        description: evt.shortDescription,
      }));
      */
  }),
});
