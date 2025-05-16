import { WishlistItem } from "../models/WishlistItem";

interface Contributor {
  username: string; 
  amount: number;
  timestamp: Date;
  message?: string;
}

interface DbWishlistItem {
  id: number;
  name: string;
  description: string;
  retailerId: number | null;
  eventId: number;
  price: number | null;
  imagesUrl: string | null;
  retailerUrl: string | null;
  isCustom: boolean;
  quantityRequested?: number | null;
  quantityFulfilled?: number | null;
}

interface DbContribution {
  id: number;
  contributorUsername: string; 
  articleId: number;
  cashAmount: number | null;
  createdAt: Date;
  message?: string;
}

export class WishlistMapper {
  static toDomainWishlistItem(dbItem: DbWishlistItem, dbContributions: DbContribution[] = []): WishlistItem {
    const item = new WishlistItem(
      dbItem.id.toString(),
      dbItem.retailerId?.toString() ?? "", 
      dbItem.name || "",
      dbItem.description || "",
      dbItem.quantityRequested ?? 1,
      dbItem.price?.valueOf() ?? 0,
      dbItem.eventId.toString(),
      (dbItem.quantityFulfilled ?? 0) >= (dbItem.quantityRequested ?? 1),
      dbItem.imagesUrl ?? undefined,
      dbItem.retailerUrl ?? undefined,
      dbItem.isCustom
    );
    
    // add contributions if available
    dbContributions.forEach(contribution => {
      item.contribute(
        contribution.contributorUsername, 
        contribution.cashAmount?.valueOf() ?? 0, 
        contribution.message
      );
    });
    
    return item;
  }

  static toDbWishlistItem(domainItem: WishlistItem): {
    dbItem: Partial<DbWishlistItem>,
    dbContributions: Partial<DbContribution>[]
  } {
    const contributors = domainItem.getContributors();
    
    const dbContributions: Partial<DbContribution>[] = contributors.map(contributor => ({
      contributorUsername: contributor.username,
      articleId: parseInt(domainItem.getItemId()),
      cashAmount: contributor.amount,
      createdAt: contributor.timestamp,
      message: contributor.message
    }));
    
    return {
      dbItem: {
        id: parseInt(domainItem.getItemId()),
        retailerId: parseInt(domainItem.getRetailerId()) || null,
        name: domainItem.getName(),
        description: domainItem.getDescription(),
        quantityRequested: domainItem.getQuantity(),
        price: domainItem.getPrice(),
        eventId: parseInt(domainItem.getEventId()),
        isCustom: domainItem.isCustomItem(),
        imagesUrl: domainItem.getImageUrl(),
        retailerUrl: domainItem.getRetailerUrl(),
      },
      dbContributions
    };
  }

  static toDomainWishlistItems(dbItems: DbWishlistItem[], dbContributionsMap: Record<number, DbContribution[]> = {}): WishlistItem[] {
    return dbItems.map(item => {
      const contributions = dbContributionsMap[item.id] || [];
      return this.toDomainWishlistItem(item, contributions);
    });
  }
}
