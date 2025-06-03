import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { MarkType } from "@prisma/client";

export const contributionsRouter = createTRPCRouter({
  getContributionsForUserEvents: publicProcedure.query(async ({ ctx }) => {
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

    const currentUsername = "user1";

    const contributions = await ctx.db.contribution.findMany({
      where: {
        event: {
          createdByUsername: currentUsername,
        },
      },
      include: {
        guest: { select: { fname: true, lname: true, username: true, pictureUrl: true } },
        event: { select: { title: true, id: true } },
        item: { select: { name: true } },
      },
    });

    return contributions.map((contribution) => ({
      text: contribution.cashAmount
        ? `${contribution.guest.fname} contributed ${contribution.cashAmount.toString()} lei to your gift`
        : `${contribution.guest.fname} contributed an unspecified amount to your gift`,
      type: "event",
      link: `/event?id=${contribution.event?.id}`,
      firstName: contribution.guest.fname,
      lastName: contribution.guest.lname,
      profilePicture: contribution.guest.pictureUrl ?? "",
      notificationDate: contribution.createdAt.toISOString(),
    }));
  }),

  getPurchasedItemsForUserEvents: publicProcedure.query(async ({ ctx }) => {
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

    const currentUsername = "user1";

    const purchasedItems = await ctx.db.mark.findMany({
      where: {
        event: {
          createdByUsername: currentUsername,
        },
        type: MarkType.PURCHASED,
      },
      include: {
        guest: { select: { fname: true, lname: true, username: true, pictureUrl: true } },
        event: { select: { title: true, id: true } },
        item: { select: { name: true, price: true } },
      },
    });

    return purchasedItems.map((mark) => ({
      text: `${mark.guest.fname} bought an item from your wishlist`,
      type: "event",
      link: `/event?id=${mark.event?.id}`,
      firstName: mark.guest.fname,
      lastName: mark.guest.lname,
      profilePicture: mark.guest.pictureUrl ?? "",
      notificationDate: mark.createdAt.toISOString(),
    }));
  }),
});
