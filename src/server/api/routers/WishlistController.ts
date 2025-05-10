import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc"; 
import { WishlistService } from "../../../services/WishlistService";

const wishlistService = new WishlistService();

export const wishlistRouter = createTRPCRouter({
  createWishlist: publicProcedure
    .input(z.object({ eventIdentifier: z.string() }))
    .mutation(async ({ input }) => {
      const result = await wishlistService.createWishlist(input.eventIdentifier);
      if (!result.success) {
        throw new Error(result.error ?? "Could not create wishlist");
      }
      return { success: true, data: result.data };
    }),

  getWishlist: publicProcedure
    .input(z.object({ wishlistIdentifier: z.string() }))
    .query(async ({ input }) => {
      const result = await wishlistService.getWishlist(input.wishlistIdentifier);
      if (!result.success) {
        throw new Error(result.error ?? "Wishlist not found");
      }
      return { success: true, data: result.data };
    }),

  addItem: publicProcedure
    .input(
      z.object({
        wishlistIdentifier: z.string(),
        item: z.object({
          itemIdentifier: z.string(),
          name: z.string(),
          description: z.string().optional(),
          price: z.number().optional(),
          quantity: z.number().min(1),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const result = await wishlistService.addItem(input.wishlistIdentifier, {
        ...input.item,
        isReserved: false,
        contributedAmount: 0,
      });
      if (!result.success) {
        throw new Error(result.error ?? "Could not add item");
      }
      return { success: true, data: result.data };
    }),

  removeItem: publicProcedure
    .input(
      z.object({
        wishlistIdentifier: z.string(),
        itemIdentifier: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await wishlistService.removeItem(
        input.wishlistIdentifier,
        input.itemIdentifier
      );
      if (!result.success) {
        throw new Error(result.error ?? "Could not remove item");
      }
      return { success: true, data: result.data };
    }),

  deleteWishlist: publicProcedure
    .input(z.object({ wishlistIdentifier: z.string() }))
    .mutation(async ({ input }) => {
      const result = await wishlistService.deleteWishlist(input.wishlistIdentifier);
      if (!result.success) {
        throw new Error(result.error ?? "Could not delete wishlist");
      }
      return { success: true };
    }),
});