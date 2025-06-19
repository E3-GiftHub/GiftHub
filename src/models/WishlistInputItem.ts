import { PriorityTypeEnum } from "~/models/PriorityTypeEnum";

export type WishlistInputItem = {
  //! item properties
  name: string | null;
  description: string | null;
  photo: string;
  key: string | null; // null => NOT custom
  price: string | null;
  retailer: number | null; // null => custom;

  //! article properties
  quantity: number;
  priority: PriorityTypeEnum | null;
  note: string | null;
};
