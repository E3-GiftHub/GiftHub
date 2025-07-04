import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import EditUserProfileUI from "~/components/ui/UserProfile/EditUserProfileUI";

// Define expected type for props (or use a utility interface if available)
interface UploadButtonProps {
  onClientUploadComplete?: (files: { url: string }[]) => void;
}

jest.mock("~/utils/uploadthing", () => ({
  UploadButton: ({ onClientUploadComplete }: UploadButtonProps) => {
    return (
      <button
        aria-label="upload-mock"
        onClick={() => {
          onClientUploadComplete?.([{ url: "http://mock.url/avatar.png" }]);
        }}
      >
        MockUpload
      </button>
    );
  },
}));

describe("EditUserProfileUI", () => {
  const mockOnSave = jest.fn();
  const mockOnResetPassword = jest.fn();
  const mockOnPhotoChange = jest.fn();

  const defaultProps = {
    username: "testuser",
    fname: "Test",
    lname: "User",
    email: "test@example.com",
    avatarUrl: "http://example.com/avatar.jpg",
    onSave: mockOnSave,
    onResetPassword: mockOnResetPassword,
    onPhotoChange: mockOnPhotoChange,
    loading: false,
    disableUsernameEditing: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with correct initial values", () => {
    render(<EditUserProfileUI {...defaultProps} />);
    expect(screen.getByDisplayValue("testuser")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test")).toBeInTheDocument();
    expect(screen.getByDisplayValue("User")).toBeInTheDocument();
    expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
  });

  it("allows user to change inputs and triggers onSave", () => {
    render(<EditUserProfileUI {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText("username..."), {
      target: { value: "newuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("FirstName..."), {
      target: { value: "New" },
    });
    fireEvent.change(screen.getByPlaceholderText("LastName..."), {
      target: { value: "Name" },
    });
    fireEvent.change(screen.getByPlaceholderText("yourNewEmail@..com."), {
      target: { value: "new@email.com" },
    });

    fireEvent.click(screen.getByText("Save changes"));

    expect(mockOnSave).toHaveBeenCalledWith(
      "New",
      "Name",
      "newuser",
      "new@email.com",
    );
  });

  it("displays email validation error for invalid input", () => {
    render(<EditUserProfileUI {...defaultProps} />);
    const emailInput = screen.getByPlaceholderText("yourNewEmail@..com.");

    fireEvent.change(emailInput, { target: { value: "invalidemail" } });

    expect(
      screen.getByText("Please enter a valid email address"),
    ).toBeInTheDocument();
    expect(screen.getByText("Save changes")).toBeDisabled();
  });

  it("calls onResetPassword when reset button is clicked", () => {
    render(<EditUserProfileUI {...defaultProps} />);
    fireEvent.click(screen.getByText("Reset Password"));
    expect(mockOnResetPassword).toHaveBeenCalled();
  });

  it("disables inputs when loading", () => {
    render(<EditUserProfileUI {...defaultProps} loading={true} />);
    expect(screen.getByPlaceholderText("username...")).toBeDisabled();
    expect(screen.getByPlaceholderText("yourNewEmail@..com.")).toBeDisabled();
  });

  it("disables username editing when disableUsernameEditing is true", () => {
    render(
      <EditUserProfileUI
        {...defaultProps}
        disableUsernameEditing={true}
        loading={false}
      />,
    );
    expect(screen.getByPlaceholderText("username...")).toBeDisabled();
  });
});
