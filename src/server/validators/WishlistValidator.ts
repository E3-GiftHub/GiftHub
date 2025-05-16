import { z } from "zod";
import { TRPCError } from "@trpc/server";

export class WishlistValidator {
  private static wishlistSchema = z.object({
    eventId: z.string().min(1, "Event ID is required"),
    username: z.string().min(1, "Username is required"), // Changed from userId to username
  });

  private static wishlistItemSchema = z.object({
    retailerId: z.string().nullable(), // Changed from partnerId to retailerId, made nullable
    eventId: z.string().min(1, "Event ID is required"),
    name: z.string().min(1, "Item name is required"),
    description: z.string(),
    quantity: z.number().int().positive("Quantity must be a positive integer"),
    price: z.number().nonnegative("Price must be zero or positive"),
    imageUrl: z.string().url("Invalid image URL").optional(),
    retailerUrl: z.string().url("Invalid retailer URL").optional(), // Changed from productUrl
    isCustom: z.boolean().optional().default(false), // Added to match database
  });

  private static wishlistItemUpdateSchema = z.object({
    itemId: z.string().min(1, "Item ID is required"),
    quantity: z.number().int().positive("Quantity must be a positive integer").optional(),
    price: z.number().nonnegative("Price must be zero or positive").optional(),
    fulfilled: z.boolean().optional(),
    name: z.string().min(1, "Item name is required").optional(),
    description: z.string().optional(),
    imageUrl: z.string().url("Invalid image URL").optional(),
    retailerUrl: z.string().url("Invalid retailer URL").optional(), // Changed from productUrl
    isCustom: z.boolean().optional(),
  });

  private static contributionSchema = z.object({
    wishlistItemId: z.string().min(1, "Wishlist item ID is required"),
    username: z.string().min(1, "Username is required"), // Changed from userId
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

  public static validateWishlistItemUpdate(data: unknown) {
    try {
      return this.wishlistItemUpdateSchema.parse(data);
    } catch (error) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid wishlist item update data",
        cause: error,
      });
    }
  }

  public static validateWishlistItemUpdateSafe(data: unknown) {
    return this.wishlistItemUpdateSchema.safeParse(data);
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
