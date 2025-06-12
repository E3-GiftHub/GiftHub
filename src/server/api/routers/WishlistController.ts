import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { WishlistService } from "../../services/WishlistService";
import { PriorityType } from "@prisma/client";

const wishlistService = new WishlistService();

export const wishlistRouter = createTRPCRouter({
  createWishlist: publicProcedure
    .input(z.object({ eventIdentifier: z.string() }))
    .mutation(async ({ input }) => {
      const result = await wishlistService.createWishlist(
        input.eventIdentifier,
      );
      if (!result.success) {
        throw new Error("Could not create wishlist");
      }
      return { success: true, data: result.data };
    }),

  getWishlist: publicProcedure
    .input(z.object({ wishlistIdentifier: z.string() }))
    .query(async ({ input }) => {
      const result = await wishlistService.getWishlist(
        input.wishlistIdentifier,
      );
      if (!result.success) {
        throw new Error("Wishlist not found");
      }
      return { success: true, data: result.data };
    }),

  addItem: publicProcedure
    .input(
      z.object({
        eventId: z.number(), // update to match the expected param in `addItem`
        item: z.object({
          itemId: z.number(),
          quantity: z.number().min(1),
          priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
          note: z.string(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await WishlistService.addItem({
        eventId: input.eventId,
        itemId: input.item.itemId,
        quantityRequested: input.item.quantity,
        priority: input.item.priority,
        note: input.item.note,
      });

      return { success: true, data: result };
    }),

  removeItem: publicProcedure
    .input(
      z.object({
        eventId: z.number(),
        itemId: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      await WishlistService.removeItem({
        eventId: input.eventId,
        itemId: input.itemId,
      });
      return { success: true };
    }),

  deleteWishlist: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .mutation(async ({ input }) => {
      await WishlistService.deleteWishlist(input.eventId);
      return { success: true };
    }),
});
