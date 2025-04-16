import { WishlistItem } from "../models/WishlistItem";

interface Contributor {
  userId: string;
  amount: number;
  timestamp: Date;
  message?: string;
}

interface DbWishlistItem {
  itemId: string;
  partnerId: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  eventId: string;
  fulfilled: boolean;
  imageUrl?: string;
  productUrl?: string;
}

interface DbContribution {
  contributionId: string;
  wishlistItemId: string;
  userId: string;
  amount: number;
  timestamp: Date;
  message?: string;
}

export class WishlistMapper {
  static toDomainWishlistItem(dbItem: DbWishlistItem, dbContributions: DbContribution[] = []): WishlistItem {
    const item = new WishlistItem(
      dbItem.itemId,
      dbItem.partnerId,
      dbItem.name,
      dbItem.description,
      dbItem.quantity,
      dbItem.price,
      dbItem.eventId,
      dbItem.fulfilled,
      dbItem.imageUrl,
      dbItem.productUrl
    );
    
    // add contributions if available
    dbContributions.forEach(contribution => {
      item.contribute(contribution.userId, contribution.amount, contribution.message);
    });
    
    return item;
  }

  static toDbWishlistItem(domainItem: WishlistItem): {
    dbItem: DbWishlistItem,
    dbContributions: DbContribution[]
  } {
    const contributors = domainItem.getContributors();
    
    const dbContributions: DbContribution[] = contributors.map(contributor => ({
      contributionId: `contribution-${contributor.userId}-${contributor.timestamp.getTime()}`, // Placeholder ID
      wishlistItemId: domainItem.getItemId(),
      userId: contributor.userId,
      amount: contributor.amount,
      timestamp: contributor.timestamp,
      message: contributor.message
    }));
    
    return {
      dbItem: {
        itemId: domainItem.getItemId(),
        partnerId: domainItem.getPartnerId(),
        name: domainItem.getName(),
        description: domainItem.getDescription(),
        quantity: domainItem.getQuantity(),
        price: domainItem.getPrice(),
        eventId: domainItem.getEventId(),
        fulfilled: domainItem.isFulfilled(),
        imageUrl: domainItem.getImageUrl(),
        productUrl: domainItem.getProductUrl(),
      },
      dbContributions
    };
  }

  static toDomainWishlistItems(dbItems: DbWishlistItem[], dbContributionsMap: Record<string, DbContribution[]> = {}): WishlistItem[] {
    return dbItems.map(item => {
      const contributions = dbContributionsMap[item.itemId] || [];
      return this.toDomainWishlistItem(item, contributions);
    });
  }
}
