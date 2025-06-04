import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useRouter } from "next/router";
import UserProfileUI from "~/components/ui/UserProfile/UserProfileUI";

// Mock next/router
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("UserProfileUI", () => {
  const pushMock = jest.fn();
  const mockRouter = { push: pushMock };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    pushMock.mockClear();
  });

  const defaultProps = {
    username: "john_doe",
    fname: "John",
    lname: "Doe",
    email: "john@example.com",
    avatarUrl: "/avatar.jpg",
  };

  it("renders user data correctly", () => {
    render(<UserProfileUI {...defaultProps} />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "john_doe",
    );
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByAltText("")).toHaveAttribute("src", "/avatar.jpg");
  });

  it("calls onEdit prop when Edit info button is clicked", () => {
    const onEdit = jest.fn();
    render(<UserProfileUI {...defaultProps} onEdit={onEdit} />);

    const editButton = screen.getByRole("button", { name: /edit info/i });
    fireEvent.click(editButton);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("navigates to /editprofile when onEdit is not provided", async () => {
    render(<UserProfileUI {...defaultProps} />);

    const editButton = screen.getByRole("button", { name: /edit info/i });
    fireEvent.click(editButton);
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/editprofile"));
  });

  it("calls onDelete prop when Delete account button is clicked", () => {
    const onDelete = jest.fn();
    render(<UserProfileUI {...defaultProps} onDelete={onDelete} />);

    const deleteButton = screen.getByRole("button", {
      name: /delete account/i,
    });
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("navigates to / when onDelete is not provided", async () => {
    render(<UserProfileUI {...defaultProps} />);

    const deleteButton = screen.getByRole("button", {
      name: /delete account/i,
    });
    fireEvent.click(deleteButton);
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/"));
  });

  it("displays loading placeholders when loading is true", () => {
    render(<UserProfileUI {...defaultProps} loading />);

    // Heading is a non-breaking space
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "\u00A0",
    );

    // There should be several text placeholders
    const nameFields = screen.getAllByText("\u00A0");
    expect(nameFields.length).toBeGreaterThanOrEqual(3);

    // Buttons should be disabled
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });
});
