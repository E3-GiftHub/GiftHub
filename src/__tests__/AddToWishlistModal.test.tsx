import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AddToWishlistModal from "../components/AddToWishlistModal";
describe("AddToWishlistModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onAddToWishlist: jest.fn(),
    itemName: "Test Item",
    itemPhoto: "/test.jpg",
    itemPrice: "$19.99",
    itemDescription: "A great item to add to wishlist!",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("does not render when isOpen is false", () => {
    render(<AddToWishlistModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText("Add to Wishlist")).not.toBeInTheDocument();
  });

  test("renders modal with item details", () => {
    render(<AddToWishlistModal {...defaultProps} />);

    // Titlu (h2)
    expect(
      screen.getByRole("heading", { name: "Add to Wishlist" }),
    ).toBeInTheDocument();

    // Buton (verificat separat dacă vrei)
    expect(
      screen.getByRole("button", { name: "Add to Wishlist" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Test Item")).toBeInTheDocument();
    expect(screen.getByText("$19.99")).toBeInTheDocument();
    expect(
      screen.getByText("A great item to add to wishlist!"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Quantity:")).toBeInTheDocument();
  });

  test("calls onClose when Cancel is clicked", () => {
    render(<AddToWishlistModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  test("calls onAddToWishlist with correct values", () => {
    render(<AddToWishlistModal {...defaultProps} />);
    const el = screen.getByLabelText("Quantity:");
    if (!(el instanceof HTMLInputElement)) {
      throw new Error("Expected input element");
    }
    const quantityInput = el;

    fireEvent.change(quantityInput, { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "Add to Wishlist" }));

    expect(defaultProps.onAddToWishlist).toHaveBeenCalledWith({
      description: "A great item to add to wishlist!",
      name: "Test Item",
      note: "",
      photo: "/test.jpg",
      price: "$19.99",
      key: null,
      quantity: 3,
      priority: 1,
      retailer: 1,
    });
  });
});
