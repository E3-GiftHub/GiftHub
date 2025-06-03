type ItemState = 'none' | 'contributing' | 'external';

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
}

export interface WishlistProps {
  contribution: () => void;
  eventId?: string | string[];
}