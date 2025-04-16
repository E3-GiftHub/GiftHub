import { z } from "zod";
import { TRPCError } from "@trpc/server";

export class WishlistValidator {
  private static wishlistSchema = z.object({
    eventId: z.string().uuid("Invalid event ID format"),
    userId: z.string().uuid("Invalid user ID format"),
  });

  private static wishlistItemSchema = z.object({
    partnerId: z.string().uuid("Invalid partner ID format"),
    eventId: z.string().uuid("Invalid event ID format"),
    name: z.string().min(1, "Item name is required"),
    description: z.string(),
    quantity: z.number().int().positive("Quantity must be a positive integer"),
    price: z.number().positive("Price must be greater than 0"),
    imageUrl: z.string().url("Invalid image URL").optional(),
    productUrl: z.string().url("Invalid product URL").optional(),
  });

  private static contributionSchema = z.object({
    wishlistItemId: z.string().uuid("Invalid wishlist item ID format"),
    userId: z.string().uuid("Invalid user ID format"),
    amount: z.number().positive("Contribution amount must be greater than 0"),
    message: z.string().max(500, "Message can't exceed 500 characters").optional(),
  });

  public static validateWishlist(data: unknown) {
    try {
      return this.wishlistSchema.parse(data);
    } catch (error) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid wishlist data",
        cause: error,
      });
    }
  }

  public static validateWishlistSafe(data: unknown) {
    return this.wishlistSchema.safeParse(data);
  }

  public static validateWishlistItem(data: unknown) {
    try {
      return this.wishlistItemSchema.parse(data);
    } catch (error) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid wishlist item data",
        cause: error,
      });
    }
  }

  public static validateWishlistItemSafe(data: unknown) {
    return this.wishlistItemSchema.safeParse(data);
  }

  public static validateContribution(data: unknown) {
    try {
      return this.contributionSchema.parse(data);
    } catch (error) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid contribution data",
        cause: error,
      });
    }
  }

  public static validateContributionSafe(data: unknown) {
    return this.contributionSchema.safeParse(data);
  }
}
