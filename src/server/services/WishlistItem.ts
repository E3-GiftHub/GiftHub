export interface Contributor {
  username: string;
  amount: number;
  timestamp: Date;
  message?: string;
}

export class WishlistItem {
  private itemId: string;
  private retailerId: string;
  private name: string;
  private description: string;
  private quantity: number;
  private price: number;
  private eventId: string;
  private fulfilled: boolean;
  private imageUrl?: string; 
  private retailerUrl?: string; 
  private isCustom: boolean;
  private contributors: Contributor[] = [];
  private totalContributed: number = 0;

  constructor(
    itemId: string,
    retailerId: string,
    name: string,
    description: string,
    quantity: number,
    price: number,
    eventId: string,
    fulfilled: boolean = false,
    imageUrl?: string,
    retailerUrl?: string,
    isCustom: boolean = false
  ) {
    this.itemId = itemId;
    this.retailerId = retailerId;
    this.name = name;
    this.description = description;
    this.quantity = quantity;
    this.price = price;
    this.eventId = eventId;
    this.fulfilled = fulfilled;
    this.imageUrl = imageUrl;
    this.retailerUrl = retailerUrl;
    this.isCustom = isCustom;
  }

  // Getters
  getItemId(): string {
    return this.itemId;
  }

  getRetailerId(): string {
    return this.retailerId;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }

  getQuantity(): number {
    return this.quantity;
  }

  getPrice(): number {
    return this.price;
  }

  getEventId(): string {
    return this.eventId;
  }

  isFulfilled(): boolean {
    return this.fulfilled;
  }

  getImageUrl(): string | undefined {
    return this.imageUrl;
  }

  getRetailerUrl(): string | undefined {
    return this.retailerUrl;
  }

  isCustomItem(): boolean { 
    return this.isCustom;
  }

  getTotalContributed(): number {
    return this.totalContributed;
  }

  getRemainingAmount(): number {
    const totalPrice = this.price * this.quantity;
    return Math.max(0, totalPrice - this.totalContributed);
  }

  getContributors(): Contributor[] {
    return [...this.contributors];
  }

  // Methods
  contribute(username: string, amount: number, message?: string): boolean {
    if (this.fulfilled) {
      return false;
    }

    const remainingAmount = this.getRemainingAmount();
    if (amount > remainingAmount) {
      amount = remainingAmount; 
    }

    this.contributors.push({
      username,
      amount,
      timestamp: new Date(),
      message
    });

    this.totalContributed += amount;


    const totalPrice = this.price * this.quantity;
    if (this.totalContributed >= totalPrice) {
      this.fulfilled = true;
    }

    return true;
  }

  setFulfilled(fulfilled: boolean): void {
    this.fulfilled = fulfilled;
  }

  updateQuantity(quantity: number): boolean {
    if (quantity < 1) return false;
    this.quantity = quantity;
    return true;
  }
}
