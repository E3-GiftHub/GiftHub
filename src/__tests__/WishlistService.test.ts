import { WishlistService } from "~/services/WishlistService";
import { WishlistDTO, WishlistItemDTO } from "~/services/WishlistDTO";

describe("WishlistService", () => {
  let wishlistService: WishlistService;

  beforeEach(() => {
    wishlistService = new WishlistService();
  });

  describe("createWishlist", () => {
    it("should create a new wishlist successfully", () => {
      const eventIdentifier = "event123";

      const result = wishlistService.createWishlist(eventIdentifier);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.eventIdentifier).toBe(eventIdentifier);
      expect(result.data?.items).toHaveLength(0);
    });

    it("should handle errors when creating a wishlist", () => {
      // Mock the crypto.randomUUID function
      const mockRandomUUID = jest.spyOn(global.crypto, "randomUUID").mockImplementationOnce(() => {
        throw new Error("Test error");
      });

      const result = wishlistService.createWishlist("event-123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Test error");

      // Restore original implementation
      mockRandomUUID.mockRestore();
    });
  });

  describe("addItem", () => {
    it("should add an item to an existing wishlist", () => {
      const eventIdentifier = "event123";
      const createResult = wishlistService.createWishlist(eventIdentifier);
      const wishlistIdentifier = createResult.data!.wishlistIdentifier;

      const newItem: WishlistItemDTO = {
        itemIdentifier: "item1",
        name: "Test Item",
        quantity: 1,
      };

      const addItemResult = wishlistService.addItem(wishlistIdentifier, newItem);

      expect(addItemResult.success).toBe(true);
      expect(addItemResult.data?.items).toHaveLength(1);
      expect(addItemResult.data?.items[0].itemIdentifier).toBe("item1");
    });

    it("should handle adding an item to a non-existing wishlist", () => {
      const newItem: WishlistItemDTO = {
        itemIdentifier: "item1",
        name: "Test Item",
        quantity: 1,
      };

      const result = wishlistService.addItem("non-existing-id", newItem);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Wishlist not found.");
    });
  });

  describe("removeItem", () => {
    it("should remove an item from a wishlist", () => {
      const eventIdentifier = "event123";
      const createResult = wishlistService.createWishlist(eventIdentifier);
      const wishlistIdentifier = createResult.data!.wishlistIdentifier;

      const newItem: WishlistItemDTO = {
        itemIdentifier: "item1",
        name: "Test Item",
        quantity: 1,
      };

      wishlistService.addItem(wishlistIdentifier, newItem);

      const removeItemResult = wishlistService.removeItem(wishlistIdentifier, "item1");

      expect(removeItemResult.success).toBe(true);
      expect(removeItemResult.data?.items).toHaveLength(0);
    });

    it("should handle removing an item from a non-existing wishlist", () => {
      const result = wishlistService.removeItem("non-existing-id", "item1");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Wishlist not found.");
    });
  });

  describe("getWishlist", () => {
    it("should retrieve an existing wishlist", () => {
      const eventIdentifier = "event123";
      const createResult = wishlistService.createWishlist(eventIdentifier);
      const wishlistIdentifier = createResult.data!.wishlistIdentifier;

      const result = wishlistService.getWishlist(wishlistIdentifier);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.wishlistIdentifier).toBe(wishlistIdentifier);
    });

    it("should handle retrieving a non-existing wishlist", () => {
      const result = wishlistService.getWishlist("non-existing-id");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Wishlist not found.");
    });
  });

  describe("deleteWishlist", () => {
    it("should delete an existing wishlist", () => {
      const eventIdentifier = "event123";
      const createResult = wishlistService.createWishlist(eventIdentifier);
      const wishlistIdentifier = createResult.data!.wishlistIdentifier;

      const deleteResult = wishlistService.deleteWishlist(wishlistIdentifier);

      expect(deleteResult.success).toBe(true);
    });

    it("should handle deleting a non-existing wishlist", () => {
      const result = wishlistService.deleteWishlist("non-existing-id");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Wishlist not found.");
    });
  });
});
