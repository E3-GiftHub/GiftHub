import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CustomWishlistModal from "~/components/CustomWishlistModal";
import { PriorityTypeEnum } from "~/models/PriorityTypeEnum";
import type { WishlistInputItem } from "~/models/WishlistInputItem";

describe("CustomWishlistModal", () => {
  const mockOnAddToWishlist = jest.fn();
  const mockOnClose = jest.fn();

  const renderComponent = () =>
    render(
      <CustomWishlistModal
        onAddToWishlist={mockOnAddToWishlist}
        onClose={mockOnClose}
      />,
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all input fields and buttons", () => {
    renderComponent();

    expect(screen.getByLabelText(/Add the name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Add the description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Price:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Add a note/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Quantity:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Priority:/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Add to Wishlist/i }),
    ).toBeInTheDocument();
  });

  it("calls onClose with key on Cancel", () => {
    renderComponent();

    const cancelButton = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledWith(null);
  });

  it("calls onAddToWishlist with correct data", () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/Add the name/i), {
      target: { value: "Test Item" },
    });

    fireEvent.change(screen.getByLabelText(/Add the description/i), {
      target: { value: "A useful item" },
    });

    fireEvent.change(screen.getByLabelText(/Price:/i), {
      target: { value: "49.99" },
    });

    fireEvent.change(screen.getByLabelText(/Add a note/i), {
      target: { value: "Please consider buying this" },
    });

    fireEvent.change(screen.getByLabelText(/Quantity:/i), {
      target: { value: "2" },
    });

    fireEvent.change(screen.getByLabelText(/Priority:/i), {
      target: { value: String(PriorityTypeEnum.HIGH) },
    });

    const addButton = screen.getByRole("button", { name: /Add to Wishlist/i });
    fireEvent.click(addButton);

    expect(mockOnAddToWishlist).toHaveBeenCalledWith(
      expect.objectContaining<WishlistInputItem>({
        name: "Test Item",
        description: "A useful item",
        photo: "/UserImages/default_pfp.svg",
        key: null,
        price: "49.99",
        quantity: 2,
        priority: PriorityTypeEnum.HIGH,
        note: "Please consider buying this",
        retailer: null,
      }),
    );

    expect(mockOnClose).toHaveBeenCalledWith(null);
  });

  it("treats empty strings as null values in submission", () => {
    renderComponent();

    const addButton = screen.getByRole("button", { name: /Add to Wishlist/i });
    fireEvent.click(addButton);

    expect(mockOnAddToWishlist).toHaveBeenCalledWith(
      expect.objectContaining<WishlistInputItem>({
        name: null,
        description: null,
        photo: "/UserImages/default_pfp.svg",
        key: null,
        price: null,
        retailer: null,

        quantity: 1,
        note: null,
        priority: null,
      }),
    );
  });
});
