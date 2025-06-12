import { PriorityTypeEnum } from "~/models/PriorityTypeEnum";

export type WishlistInputItem = {
  name: string;
  description: string;
  photo: string;
  price: string;
  quantity: number;
  priority: PriorityTypeEnum;
  note: string;
};
