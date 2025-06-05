import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ResetPasswordFormLogged from "~/components/ui/Account/ResetPasswordFormLogged";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import "@testing-library/jest-dom";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

jest.mock("~/trpc/react", () => ({
  api: {
    auth: {
      update: {
        updateLogged: {
          useMutation: jest.fn(),
        },
      },
    },
  },
}));

describe("ResetPasswordFormLogged", () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: "testuser" } },
    });

    (api.auth.update.updateLogged.useMutation as jest.Mock).mockImplementation(
      ({ onSuccess, onError }) => ({
        mutate: jest.fn((data) => {
          if (data.pass !== data.word) {
            onError(new Error("Passwords don't match"));
          } else {
            onSuccess({});
          }
        }),
        isPending: false,
      }),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("toggles password visibility", () => {
    render(<ResetPasswordFormLogged />);

    const toggleButtons = screen.getAllByRole("button", {
      name: /show password/i,
    });

    expect(toggleButtons).toHaveLength(2);
    if (toggleButtons[0] && toggleButtons[1]) {
      fireEvent.click(toggleButtons[0]);
      fireEvent.click(toggleButtons[1]);
    }
  });
});
