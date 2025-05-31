import React from "react";
import type { GuestHeader } from "~/models/GuestHeader";
import { render, screen, fireEvent } from "@testing-library/react";
import GuestListModal from "../components/GuestListModal";
import "@testing-library/jest-dom";

describe("GuestListModal", () => {
  const guests = [
    {
      username: "alice_dotnet",
      fname: "Alice",
      lname: "Rodles",
      pictureUrl:
        "https://www.songhall.org/images/made/images/uploads/exhibits/Michael_Jackson_656_656_85_s_c1.jpg",
    },
    {
      username: "bobby",
      fname: "Bob",
      lname: "Coconut",
      pictureUrl:
        "https://ew.com/thmb/QhZ-3KjfMzncBdys9wcTrpSNSXs=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/bob-the-builder-c9d2b762fc6640ec837dbc9828de1f76.jpg",
    },
    {
      username: "fumez_cox_ro",
      fname: "Charlie",
      lname: "haha_real_name",
      pictureUrl:
        "https://upload.wikimedia.org/wikipedia/en/b/b3/Robert_Johnson.png",
    },
  ] as GuestHeader[];

  const onClose = jest.fn();
  const onRemoveGuest = jest.fn();
  const onAddGuest = jest.fn();
  const onSave = jest.fn();

  const renderLoadedModal = () => {
    render(
      <GuestListModal
        loading={false}
        eventId={4}
        guests={guests}
        onClose={onClose}
        onRemoveGuest={onRemoveGuest}
        onAddGuest={onAddGuest}
        onSave={onSave}
        onBack={jest.fn()}
      />,
    );
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders all guest names after loading", () => {
    renderLoadedModal();
    guests.forEach((guest) => {
      expect(screen.getByText(`aka. ${guest.username}`)).toBeInTheDocument();
    });
  });

  test("calls onRemoveGuest when Remove button is clicked", () => {
    renderLoadedModal();
    const removeButtons = screen.getAllByText("Remove");
    const bobRemoveButton = removeButtons[1];

    if (!bobRemoveButton) {
      throw new Error("Bob's remove button not found");
    }

    fireEvent.click(bobRemoveButton);
    expect(onRemoveGuest).toHaveBeenCalledWith("bobby");
  });

  test("calls onClose when ← Back is clicked", () => {
    renderLoadedModal();
    fireEvent.click(screen.getByText("← Back"));
    expect(onClose).toHaveBeenCalled();
  });

  test("calls onAddGuest when Add Guest is clicked", () => {
    renderLoadedModal();
    fireEvent.click(screen.getByText("Add Guest"));
    expect(onAddGuest).toHaveBeenCalled();
  });

  test("calls onSave when Save Changes is clicked", () => {
    renderLoadedModal();
    fireEvent.click(screen.getByText("Save Changes"));
    expect(onSave).toHaveBeenCalled();
  });

  test("displays loading message when loading is true", () => {
    render(
      <GuestListModal
        loading={true}
        eventId={4}
        guests={guests}
        onClose={onClose}
        onRemoveGuest={onRemoveGuest}
        onAddGuest={onAddGuest}
        onSave={onSave}
        onBack={jest.fn()}
      />,
    );

    expect(screen.getByText("Loading guests...")).toBeInTheDocument();
  });
});
