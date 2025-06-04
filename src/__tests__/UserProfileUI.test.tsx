import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UserProfileUI from "~/components/ui/UserProfile/UserProfileUI";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import { api } from "~/trpc/react";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next-auth/react", () => ({
  signOut: jest.fn(),
}));

jest.mock("~/trpc/react", () => ({
  api: {
    profile: {
      user: {
        delete: {
          useMutation: jest.fn(() => ({
            mutateAsync: jest.fn(),
          })),
        },
      },
    },
  },
}));

describe("UserProfileUI", () => {
  const defaultProps = {
    username: "johndoe",
    fname: "John",
    lname: "Doe",
    email: "john@example.com",
    avatarUrl: "/avatar.png",
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    window.confirm = jest.fn().mockReturnValue(true);
  });

  it("renders user information correctly", () => {
    render(<UserProfileUI {...defaultProps} />);

    expect(screen.getByText("johndoe")).toBeInTheDocument();
    expect(screen.getByText("Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("triggers onEdit prop if provided", () => {
    const onEdit = jest.fn();
    render(<UserProfileUI {...defaultProps} onEdit={onEdit} />);
    const editButton = screen.getByText(/Edit info/i);
    fireEvent.click(editButton);
    expect(onEdit).toHaveBeenCalled();
  });

  it("redirects to /profile-edit if onEdit is not provided", async () => {
    const pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    render(<UserProfileUI {...defaultProps} />);
    fireEvent.click(screen.getByText(/Edit info/i));
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/profile-edit");
    });
  });

  it("calls delete mutation and signOut on delete", async () => {
    const mutateAsyncMock = jest.fn().mockResolvedValue({});
    (api.profile.user.delete.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: mutateAsyncMock,
    });

    render(<UserProfileUI {...defaultProps} />);
    fireEvent.click(screen.getByText(/Delete account/i));

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalled();
      expect(signOut).toHaveBeenCalledWith({ redirectTo: "/" });
    });
  });

  it("does not delete if user cancels confirmation", async () => {
    (window.confirm as jest.Mock).mockReturnValue(false);
    const mutateAsyncMock = jest.fn();
    (api.profile.user.delete.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: mutateAsyncMock,
    });

    render(<UserProfileUI {...defaultProps} />);
    fireEvent.click(screen.getByText(/Delete account/i));

    await waitFor(() => {
      expect(mutateAsyncMock).not.toHaveBeenCalled();
    });
  });
});
