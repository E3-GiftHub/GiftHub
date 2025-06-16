// src/services/WishlistService.ts

import { db as prisma } from "~/server/db";
import { WishlistDTO } from "./WishlistDTO";
import type { WishlistItemDTO } from "./WishlistDTO";
import type { PriorityType } from "@prisma/client";

export class WishlistService {
  /**
   * Fetch the wishlist (all EventArticle rows) for a given event.
   */

  async createWishlist(eventIdentifier: string) {
    return { success: true, data: { wishlistIdentifier: eventIdentifier } };
  }

  async getWishlist(wishlistIdentifier: string) {
    // Implement your wishlist retrieval logic here
    return { success: true, data: { wishlistIdentifier } };
  }

  static async getByEvent(eventId: number): Promise<WishlistDTO> {
    const entries = await prisma.eventArticle.findMany({
      where: { eventId },
      include: { item: true },
    });

    interface EventArticleWithItem {
      itemId: number;
      quantityRequested: number | null;
      quantityFulfilled: number | null;
      priority?: PriorityType | null;
      item: {
        name: string | null;
        description: string | null;
        price: number | null;
      };
    }
    /*  Old version
    const items: WishlistItemDTO[] = entries.map((ea: EventArticleWithItem) => ({
      itemIdentifier: ea.itemId.toString(),
      name: ea.item.name ?? "",
      description: ea.item.description ?? undefined,
      price: ea.item.price ? Number(ea.item.price) : undefined,
      quantity: ea.quantityRequested ?? 0,
      isReserved: ea.quantityRequested === 0 && ea.quantityFulfilled === 0,
      contributedAmount: ea.quantityFulfilled ?? 0,
      priority: ea.priority ?? undefined,
    }));
*/

    // todo delete this harcoded values
    const items: WishlistItemDTO[] = entries.map((ea) => ({
      itemIdentifier: ea.itemId.toString(),
      name: ea?.item?.name ?? "",
      description: ea?.item?.description ?? undefined,
      price: ea?.item?.price ? ea.item.price.toNumber() : undefined,
      quantity: 1, // todo delete this property
      isReserved: true,
      contributedAmount: 1,
      priority: ea?.priority ?? undefined,
    }));

    return new WishlistDTO(
      eventId.toString(),
      eventId.toString(),
      items,
      entries[0]?.createdAt ?? new Date(),
      entries[0]?.updatedAt ?? undefined,
    );
  }

  /**
   * Add a new item to the wishlist (creates an EventArticle row).
   */
  static async addItem(params: {
    eventId: number;
    itemId: number;
    quantityRequested: number;
    priority: PriorityType | null;
    note: string | null;
  }): Promise<WishlistItemDTO> {
    const record = await prisma.eventArticle.create({
      data: {
        eventId: params.eventId,
        itemId: params.itemId,
        priority: params.priority,
        userNote: params.note,
      },
      include: {
        item: {
          select: { name: true }
        }
      }
    });

    // Send notification to guests about new item added
    try {
      const { notifyGuestsOfNewItem } = await import("@/server/api/routers/inboxEmailNotifier");
      
      const event = await prisma.event.findUnique({
        where: { id: params.eventId },
        select: { createdByUsername: true }
      });
      
      if (event?.createdByUsername && record.item?.name) {
        await notifyGuestsOfNewItem(
          params.eventId,
          event.createdByUsername,
          record.item.name
        );
      }
    } catch (error) {
      console.error('Failed to send new item notification:', error);
    }

    return {
      itemIdentifier: record.itemId.toString(),
      name: "", // you may fetch item details separately if needed
      description: undefined,
      price: undefined,
      isReserved: false,
      contributedAmount: 0,
      priority: record.priority ?? undefined,
      quantity: 1, // delete this
    };
  }

  /**
   * Remove a specific item from the wishlist.
   */
  static async removeItem(params: {
    eventId: number;
    itemId: number;
  }): Promise<void> {
    await prisma.eventArticle.delete({
      where: {
        id: params.itemId,
        eventId: params.eventId,
      },
    });
  }

  /**
   * Delete the entire wishlist for an event.
   */
  static async deleteWishlist(eventId: number): Promise<void> {
    await prisma.eventArticle.deleteMany({
      where: { eventId },
    });
  }
}
