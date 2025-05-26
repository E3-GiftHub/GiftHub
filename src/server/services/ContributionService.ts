import { db } from "~/server/db";
import { EventManagementException } from "./EventManagementException";

export class ContributionService {
  /**
   * Create a new contribution for a wishlist item
   */
  async createContribution(
    contributionId: string,
    contributorUsername: string,
    eventId: string,
    articleId: string,
    amount: number,
    date: Date = new Date(),
    message?: string,
  ) {
    const itemIdInt = parseInt(articleId);
    const eventIdInt = parseInt(eventId);

    // Fetch the wishlist item
    const dbItem = await db.item.findUnique({
      where: { id: itemIdInt },
    });

    if (!dbItem) {
      throw new EventManagementException("Wishlist item not found");
    }

    // Fetch the event item to get event details
    const eventItem = await db.eventArticle.findFirst({
      where: {
        itemId: itemIdInt,
        eventId: eventIdInt,
      },
    });

    if (!eventItem) {
      throw new EventManagementException("Event item association not found");
    }

    // Create the contribution
    const contribution = await db.contribution.create({
      data: {
        id: parseInt(contributionId),
        contributorUsername,
        eventId: eventIdInt,
        articleId: itemIdInt,
        cashAmount: amount,
        createdAt: date,
        updatedAt: date,
      },
    });

    return {
      id: contribution.id.toString(),
      contributorUsername: contribution.contributorUsername,
      eventId: contribution.eventId.toString(),
      articleId: contribution.articleId.toString(),
      amount: contribution.cashAmount?.toNumber() || 0,
      createdAt: contribution.createdAt,
      message,
    };
  }

  /**
   * Process a contribution for a wishlist item
   */
  async processContribution(contributionId: string, articleId: string) {
    const contribIdInt = parseInt(contributionId);
    const itemIdInt = parseInt(articleId);

    // Fetch the contribution
    const contribution = await db.contribution.findUnique({
      where: { id: contribIdInt },
    });

    if (!contribution) {
      throw new EventManagementException("Contribution not found");
    }

    // Fetch all contributions for this item to calculate total
    const contributions = await db.contribution.findMany({
      where: { articleId: itemIdInt },
    });

    // Calculate total contributed amount
    const totalContributed = contributions.reduce((total, contrib) => {
      return total + (contrib.cashAmount?.toNumber() || 0);
    }, 0);

    // Fetch the item
    const item = await db.item.findUnique({
      where: { id: itemIdInt },
    });

    if (!item) {
      throw new EventManagementException("Item not found");
    }

    // Get event item to find quantity
    const eventItem = await db.eventArticle.findFirst({
      where: {
        itemId: itemIdInt,
        eventId: contribution.eventId,
      },
    });

    if (!eventItem) {
      throw new EventManagementException("Event item not found");
    }

    const totalPrice =
      (item.price?.toNumber() || 0) * (eventItem.quantityRequested || 1);
    const isFulfilled = totalContributed >= totalPrice;

    // Update the event item fulfillment status if needed
    if (
      isFulfilled &&
      eventItem.quantityFulfilled !== eventItem.quantityRequested
    ) {
      await db.eventArticle.update({
        where: {
          eventId_itemId: {
            eventId: eventItem.eventId,
            itemId: itemIdInt,
          },
        },
        data: {
          quantityFulfilled: eventItem.quantityRequested,
        },
      });
    }

    return {
      contributionId,
      articleId,
      totalContributed,
      isFulfilled,
    };
  }

  /**
   * Manage a contribution (approve, reject, refund)
   */
  async manageContribution(
    contributionId: string,
    action: "approve" | "reject" | "refund",
  ) {
    const contribIdInt = parseInt(contributionId);

    const contribution = await db.contribution.findUnique({
      where: { id: contribIdInt },
    });

    if (!contribution) {
      throw new EventManagementException("Contribution not found");
    }

    switch (action) {
      case "approve":
        // Logic for approving a contribution
        return await db.contribution.update({
          where: { id: contribIdInt },
          data: { updatedAt: new Date() },
        });

      case "reject":
        // Logic for rejecting a contribution
        return await db.contribution.delete({
          where: { id: contribIdInt },
        });

      case "refund":
        // Logic for refunding a contribution
        return await db.contribution.delete({
          where: { id: contribIdInt },
        });

      default:
        throw new EventManagementException("Invalid action specified");
    }
  }

  /**
   * Get all contributions for a specific wishlist item
   */
  async getContributionsForItem(articleId: string) {
    const itemIdInt = parseInt(articleId);

    const contributions = await db.contribution.findMany({
      where: { articleId: itemIdInt },
      include: {
        guest: {
          select: {
            username: true,
            fname: true,
            lname: true,
            pictureUrl: true,
          },
        },
      },
    });

    return contributions.map((contribution) => ({
      id: contribution.id.toString(),
      contributorUsername: contribution.contributorUsername,
      contributorName:
        `${contribution.guest.fname ?? ""} ${contribution.guest.lname || ""}`.trim(),
      contributorPicture: contribution.guest.pictureUrl,
      amount: contribution.cashAmount?.toNumber() ?? 0,
      createdAt: contribution.createdAt,
      updatedAt: contribution.updatedAt,
    }));
  }
}
