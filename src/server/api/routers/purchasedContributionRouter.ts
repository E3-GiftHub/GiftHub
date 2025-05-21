import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { MarkType } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const purchasedItemsRouter = createTRPCRouter({
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
                guest: { select: { fname: true, lname: true, username: true } },
                event: { select: { title: true, id: true } },
                item: { select: { name: true, price: true } },
            },
        });

        return purchasedItems.map((mark, index) => ({
            text: `${mark.guest.fname} bought an item from your wishlist`,
            type: "event",
            link: `/event${mark.event.id}#`,
            firstName: mark.guest.fname,
            lastName: mark.guest.lname,
            profilePicture: "databasepic/profilepic.png",
            notificationDate: mark.createdAt.toISOString(),
        }));
    }),
});