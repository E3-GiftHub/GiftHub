import { PriorityType } from "@prisma/client";
type ItemState = "none" | "contributing" | "external";

export interface TrendingItem {
  id: number;
  nume: string;
  pret: string;
  state: ItemState;
  imageUrl?: string;
  transferCompleted?: boolean;
  contribution?: {
    current: number;
    total: number;
  };
  userHasContributed?: boolean;
  userContributionAmount?: number;

  //! new added
  desc: string | null;
  note: string | null;
  priority: PriorityType | null;
}

export interface WishlistProps {
  contribution: (articleId: number) => void;
  eventId?: string | string[];
}
