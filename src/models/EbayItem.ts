export interface EbayItem {
  itemId: string;
  itemWebUrl: string;
  title: string;
  shortDescription?: string;

  image?: {
    imageUrl: string;
  };
  price?: {
    value?: string;
    currency?: string;
  };
}
