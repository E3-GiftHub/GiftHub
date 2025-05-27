import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import GuestListModal from "../components/GuestListModal";
import '@testing-library/jest-dom';

describe("GuestListModal", () => {
  const guests = ["Alice", "Bob", "Charlie"];
  const onClose = jest.fn();
  const onRemoveGuest = jest.fn();
  const onAddGuest = jest.fn();
  const onSave = jest.fn();

  beforeEach(() => {
    render(
      <GuestListModal
        guests={guests}
        onClose={onClose}
        onRemoveGuest={onRemoveGuest}
        onAddGuest={onAddGuest}
        onSave={onSave}
        onBack={jest.fn()} // dacă onBack e cerut, altfel îl poți scoate
      />
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders all guest names", () => {
    guests.forEach((guest) => {
      expect(screen.getByText(guest)).toBeInTheDocument();
    });
  });

  test("calls onRemoveGuest when ✕ button is clicked", () => {
    const removeButtons = screen.getAllByText("✕");
    fireEvent.click(removeButtons[1]); // Bob
    expect(onRemoveGuest).toHaveBeenCalledWith(1);
  });

  test("calls onClose when ← Back is clicked", () => {
    fireEvent.click(screen.getByText("← Back"));
    expect(onClose).toHaveBeenCalled();
  });

  test("calls onAddGuest when Add Guest is clicked", () => {
    fireEvent.click(screen.getByText("Add Guest"));
    expect(onAddGuest).toHaveBeenCalled();
  });

  test("calls onSave when Save Changes is clicked", () => {
    fireEvent.click(screen.getByText("Save Changes"));
    expect(onSave).toHaveBeenCalled();
  });
});
