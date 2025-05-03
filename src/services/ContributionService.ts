import { TRPCError } from "@trpc/server";

interface Contribution {
  contributionId: string;
  senderId: string;
  guestId: string;
  wishlistItemId: string;
  amount: number;
  date: Date;
  message?: string;
}



export class ContributionService {
  public async createContribution(
    contributionId: string,
    senderId: string,
    guestId: string,
    wishlistItemId: string,
    amount: number,
    date: Date,
    message?: string 
  ): Promise<Contribution> {
    try {
      if (!contributionId || !senderId || !guestId || !wishlistItemId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Missing required fields for contribution"
        });
      }
      if (amount <= 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Contribution amount must be positive"
        });
      }

      // Checks if wishlist item exists
      // const wishlistItem = await db.wishlistItem.findUnique({ where: { id: wishlistItemId } });
      // if (!wishlistItem) {
      //   throw new TRPCError({
      //     code: "NOT_FOUND",
      //     message: "Wishlist item not found"
      //   });
      // }

      // !!For now, returns the contribution object
      return {
        contributionId,
        senderId,
        guestId,
        wishlistItemId,
        amount,
        date,
        message
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create contribution",
        cause: error
      });
    }
  }

  public async getContributionsForItem(
    itemId: string
  ): Promise<Contribution[]> {
    try {
      if (!itemId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Item ID is required"
        });
      }
      return [];
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch contributions",
        cause: error
      });
    }
  }

  public async getGuestContributions(guestId: string): Promise<Contribution[]> {
    try {
      if (!guestId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Guest ID is required"
        });
      }
      
      return [];
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch guest contributions",
        cause: error
      });
    }
  }

  public async processContribution(
    contributionId: string, 
    wishlistItemId: string
  ): Promise<{ success: boolean }> {
    try {
      if (!contributionId || !wishlistItemId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Contribution ID and Wishlist Item ID are required"
        });
      }
      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to process contribution",
        cause: error
      });
    }
  }

  public async manageContribution(
    contributionId: string,
    action: 'approve' | 'reject' | 'refund'
  ): Promise<{ success: boolean }> {
    try {
      if (!contributionId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Contribution ID is required"
        });
      }
      
      switch(action) {
        case 'approve':
          // Implement approve logic
          console.info(`Approving contribution ${contributionId}`);
          break;
        case 'reject':
          // Implement reject logic
          console.info(`Rejecting contribution ${contributionId}`);
          break;
        case 'refund':
          // Implement refund logic
          console.info(`Refunding contribution ${contributionId}`);
          break;
      }
      
      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to manage contribution",
        cause: error
      });
    }
  }
}
