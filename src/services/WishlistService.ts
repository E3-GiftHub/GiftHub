// src/services/WishlistService.ts

import { db as prisma } from "~/server/db";
import { WishlistDTO } from "./WishlistDTO";
import type { WishlistItemDTO } from "./WishlistDTO";
import { PriorityType } from "@prisma/client";

export class WishlistService {
  /**
   * Fetch the wishlist (all EventArticle rows) for a given event.
   */
  static async getByEvent(eventId: number): Promise<WishlistDTO> {
    const entries = await prisma.eventArticle.findMany({
      where: { eventId },
      include: { item: true },
    });

    interface EventArticleWithItem {
      itemId: number;
      quantityRequested: number;
      quantityFulfilled: number;
      priority?: PriorityType;
      item: {
      name: string | null;
      description: string | null;
      price: number | null;
      };
    }

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

    return new WishlistDTO(
      eventId.toString(),
      eventId.toString(),
      items,
      entries[0]?.createdAt ?? new Date(),
      entries[0]?.updatedAt ?? undefined
    );
  }

  /**
   * Add a new item to the wishlist (creates an EventArticle row).
   */
  static async addItem(params: {
    eventId: number;
    itemId: number;
    quantityRequested: number;
    priority?: PriorityType;
  }): Promise<WishlistItemDTO> {
    const record = await prisma.eventArticle.create({
      data: {
        eventId: params.eventId,
        itemId: params.itemId,
        quantityRequested: params.quantityRequested,
        quantityFulfilled: 0,
        priority: params.priority ?? PriorityType.LOW,
      },
    });

    return {
      itemIdentifier: record.itemId.toString(),
      name: "", // you may fetch item details separately if needed
      description: undefined,
      price: undefined,
      quantity: record.quantityRequested ?? 0,
      isReserved: false,
      contributedAmount: 0,
      priority: record.priority ?? undefined,
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
        eventId_itemId: {
          eventId: params.eventId,
          itemId: params.itemId,
        },
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
