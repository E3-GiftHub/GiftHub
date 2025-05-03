interface Contributor {
  userId: string;
  amount: number;
  timestamp: Date;
  message?: string;
}

export class WishlistItem {
  private itemId: string;
  private partnerId: string;
  private name: string;
  private description: string;
  private quantity: number;
  private price: number;
  private fulfilled: boolean;
  private totalContributions: number = 0;
  private contributors: Contributor[] = [];
  private eventId: string; 
  private imageUrl?: string;
  private productUrl?: string;

  constructor(
    itemId: string,
    partnerId: string,
    name: string,
    description: string,
    quantity: number,
    price: number,
    eventId: string,
    fulfilled: boolean = false,
    imageUrl?: string,
    productUrl?: string
  ) {
    this.itemId = itemId;
    this.partnerId = partnerId;
    this.name = name;
    this.description = description;
    this.quantity = quantity;
    this.price = price;
    this.fulfilled = fulfilled;
    this.eventId = eventId;
    this.imageUrl = imageUrl;
    this.productUrl = productUrl;
  }

  public reserve(userId: string, expiresAt: Date): void {
    // todo: reservation logic with expiration to prevent multiple people from purchasing the same item simultaneously
  }

  public contribute(userId: string, amount: number, message?: string): void {
    if (amount <= 0) {
      throw new Error("Contribution amount must be positive");
    }
    
    this.totalContributions += amount;
    
    this.contributors.push({
      userId,
      amount,
      timestamp: new Date(),
      message
    });
    
    this.checkFulfillment();
  }

  private checkFulfillment(): void {
    if (this.totalContributions >= this.getTotalPrice()) {
      this.fulfilled = true;
    }
  }

  public getTotalPrice(): number {
    return this.price * this.quantity;
  }

  public getPercentageFunded(): number {
    return Math.min(100, (this.totalContributions / this.getTotalPrice()) * 100);
  }

  public getAmountRemaining(): number {
    return Math.max(0, this.getTotalPrice() - this.totalContributions);
  }

  public getContributors(): Contributor[] {
    return [...this.contributors];
  }

  public getItemId(): string {
    return this.itemId;
  }

  public getPartnerId(): string {
    return this.partnerId;
  }

  public getName(): string {
    return this.name;
  }

  public getDescription(): string {
    return this.description;
  }

  public getQuantity(): number {
    return this.quantity;
  }

  public getPrice(): number {
    return this.price;
  }

  public getEventId(): string {
    return this.eventId;
  }

  public isFulfilled(): boolean {
    return this.fulfilled;
  }

  public getTotalContributions(): number {
    return this.totalContributions;
  }

  public getImageUrl(): string | undefined {
    return this.imageUrl;
  }

  public getProductUrl(): string | undefined {
    return this.productUrl;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public setDescription(description: string): void {
    this.description = description;
  }

  public setQuantity(quantity: number): void {
    this.quantity = quantity;
    this.checkFulfillment();
  }

  public setPrice(price: number): void {
    this.price = price;
    this.checkFulfillment();
  }

  public setFulfilled(fulfilled: boolean): void {
    this.fulfilled = fulfilled;
  }

  public setImageUrl(imageUrl?: string): void {
    this.imageUrl = imageUrl;
  }

  public setProductUrl(productUrl?: string): void {
    this.productUrl = productUrl;
  }
}
