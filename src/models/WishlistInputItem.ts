import { PriorityTypeEnum } from "~/models/PriorityTypeEnum";

export type WishlistInputItem = {
  //! item properties
  name: string;
  description: string;
  photo: string;
  key: string | null; // null => NOT custom
  price: string;
  retailer: number | null; // null => custom;

  //! article properties
  quantity: number;
  priority: PriorityTypeEnum;
  note: string;
};
