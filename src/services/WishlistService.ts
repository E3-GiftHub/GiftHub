// WishlistService.ts

import { WishlistDTO } from "./WishlistDTO";
import type { WishlistItemDTO } from "./WishlistDTO";

export class WishlistService {
  // In a real app, replace with database calls
  private wishlistStore = new Map<string, WishlistDTO>();

  createWishlist(eventIdentifier: string): { success: boolean; data?: WishlistDTO; error?: string } {
    try {
      const wishlistIdentifier = crypto.randomUUID();
      const newWishlist = new WishlistDTO(
        wishlistIdentifier,
        eventIdentifier,
        [],
        new Date()
      );
      this.wishlistStore.set(wishlistIdentifier, newWishlist);
      return { success: true, data: newWishlist };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  addItem(
    wishlistIdentifier: string,
    newItem: WishlistItemDTO
  ): { success: boolean; data?: WishlistDTO; error?: string } {
    try {
      const wishlist = this.wishlistStore.get(wishlistIdentifier);
      if (!wishlist) {
        return { success: false, error: "Wishlist not found." };
      }
      wishlist.items.push(newItem);
      wishlist.updatedAt = new Date();
      return { success: true, data: wishlist };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  removeItem(
    wishlistIdentifier: string,
    itemIdentifier: string
  ): { success: boolean; data?: WishlistDTO; error?: string } {
    try {
      const wishlist = this.wishlistStore.get(wishlistIdentifier);
      if (!wishlist) {
        return { success: false, error: "Wishlist not found." };
      }
      wishlist.items = wishlist.items.filter(
        (it) => it.itemIdentifier !== itemIdentifier
      );
      wishlist.updatedAt = new Date();
      return { success: true, data: wishlist };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  getWishlist(
    wishlistIdentifier: string
  ): { success: boolean; data?: WishlistDTO; error?: string } {
    const wishlist = this.wishlistStore.get(wishlistIdentifier);
    if (!wishlist) {
      return { success: false, error: "Wishlist not found." };
    }
    return { success: true, data: wishlist };
  }

  deleteWishlist(
    wishlistIdentifier: string
  ): { success: boolean; error?: string } {
    if (!this.wishlistStore.has(wishlistIdentifier)) {
      return { success: false, error: "Wishlist not found." };
    }
    this.wishlistStore.delete(wishlistIdentifier);
    return { success: true };
  }
}
