import { PriorityType } from "@prisma/client";

/*
export enum PriorityType {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}
*/
export interface WishlistItemDTO {
  itemIdentifier: string;
  name: string;
  description?: string;
  price?: number;
  quantity: number;
  isReserved: boolean;
  contributedAmount: number;
  priority?: PriorityType;
}
export class WishlistDTO {
  constructor(
    public wishlistIdentifier: string,
    public eventIdentifier: string,
    public items: WishlistItemDTO[],
    public createdAt: Date,
    public updatedAt?: Date
  ) {}
}
