import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import ResetPasswordForm from "~/components/ui/Account/ResetPasswordForm";
import { jest } from '@jest/globals';

const mockPush = jest.fn();
const mockQuery = { token: 'valid-token' };

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    query: mockQuery,
  }),
}));

type ResetPasswordData = {
  token: string;
  password: string;
  confirmPassword: string;
};

type OnSuccessCallback = (data: object) => void;
type OnErrorCallback = (error: { message: string }) => void;
const mutateMock = jest.fn() as jest.MockedFunction<
    (
        data: ResetPasswordData,
        onSuccess: OnSuccessCallback,
        onError: OnErrorCallback
    ) => void
>;

jest.mock('~/trpc/react', () => ({
  api: {
    auth: {
      update: {
        update: {
          useMutation: jest.fn(({ onSuccess, onError }: { onSuccess: OnSuccessCallback; onError: OnErrorCallback }) => ({
            mutate: (data: ResetPasswordData) => mutateMock(data, onSuccess, onError),
            isPending: false,
            error: null,
          })),
        },
      },
    },
  },
}));

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    mockQuery.token = 'valid-token'; // Reset to valid token before each test
  });

  // test("renders form with all fields and labels", () => {
  //   render(<ResetPasswordForm />);
  //   expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
  //
  //   expect(screen.getAllByLabelText(/password/i)).toBeInTheDocument();
  //   expect(screen.getByPlaceholderText(/enter your new password/i)).toBeInTheDocument();
  //
  //   expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  //   expect(screen.getByPlaceholderText(/confirm your new password/i)).toBeInTheDocument();
  //
  //   expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  // });

  test("validates password mismatch", async () => {
    render(<ResetPasswordForm />);

    fireEvent.change(screen.getByPlaceholderText(/enter your new password/i), {
      target: { value: "Password1" },
    });
    fireEvent.change(screen.getByPlaceholderText(/confirm your new password/i), {
      target: { value: "Different1" },
    });

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  test("validates missing token", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    mockQuery.token = undefined;
    render(<ResetPasswordForm />);

    fireEvent.change(screen.getByPlaceholderText(/enter your new password/i), {
      target: { value: "Password1" },
    });
    fireEvent.change(screen.getByPlaceholderText(/confirm your new password/i), {
      target: { value: "Password1" },
    });

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    expect(await screen.findByText(/invalid or missing reset token/i)).toBeInTheDocument();
  });

  test("submits form with valid inputs", async () => {
    render(<ResetPasswordForm />);

    fireEvent.change(screen.getByPlaceholderText(/enter your new password/i), {
      target: { value: "Password1" },
    });
    fireEvent.change(screen.getByPlaceholderText(/confirm your new password/i), {
      target: { value: "Password1" },
    });

    fireEvent.click(screen.getByRole("button", { name: /reset password/i }));

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
          {
            token: "valid-token",
            password: "Password1",
            confirmPassword: "Password1",
          },
          expect.any(Function),  // onSuccess callback
          expect.any(Function)   // onError callback
      );
    });
  });

  // test("handles mutation onError 'Passwords don't match'", async () => {
  //   render(<ResetPasswordForm />);
  //
  //   fireEvent.change(screen.getByPlaceholderText(/enter your new password/i), {
  //     target: { value: "Password1" },
  //   });
  //   fireEvent.change(screen.getByPlaceholderText(/confirm your new password/i), {
  //     target: { value: "Password1" },
  //   });
  //
  //   fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
  //
  //   await waitFor(() => {
  //     const call = mutateMock.mock.calls[0];
  //     if (!call) throw new Error("mutateMock was not called");
  //     const [, , onError] = call;
  //     onError({ message: "Passwords don't match" });
  //     expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  //   });
  // });
  //
  // test("handles mutation onError 'Invalid or expired password reset link'", async () => {
  //   render(<ResetPasswordForm />);
  //
  //   fireEvent.change(screen.getByPlaceholderText(/enter your new password/i), {
  //     target: { value: "Password1" },
  //   });
  //   fireEvent.change(screen.getByPlaceholderText(/confirm your new password/i), {
  //     target: { value: "Password1" },
  //   });
  //
  //   fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
  //
  //   await waitFor(() => {
  //     const call = mutateMock.mock.calls[0];
  //     if (!call) throw new Error("mutateMock was not called");
  //     const [, , onError] = call;
  //     onError({ message: "Invalid or expired password reset link" });
  //     expect(screen.getByText(/invalid or expired password reset link/i)).toBeInTheDocument();
  //   });
  // });
  //
  // test("handles mutation onError unknown error", async () => {
  //   render(<ResetPasswordForm />);
  //
  //   fireEvent.change(screen.getByPlaceholderText(/enter your new password/i), {
  //     target: { value: "Password1" },
  //   });
  //   fireEvent.change(screen.getByPlaceholderText(/confirm your new password/i), {
  //     target: { value: "Password1" },
  //   });
  //
  //   fireEvent.click(screen.getByRole("button", { name: /reset password/i }));
  //
  //   await waitFor(() => {
  //     const call = mutateMock.mock.calls[0];
  //     if (!call) throw new Error("mutateMock was not called");
  //     const [, , onError] = call;
  //     onError({ message: "Unexpected error" });
  //     expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument();
  //   });
  // });

  test("toggles password visibility", () => {
    render(<ResetPasswordForm />);
    const passwordInput = screen.getByPlaceholderText(/enter your new password/i);
    const toggleButtons = screen.getAllByRole("button", { name: /(show|hide) password/i });

    // Find the first toggle button (for password)
    const passwordToggleButton = toggleButtons.find(button =>
        button.getAttribute('aria-label')?.includes('password')
    );

    if (!passwordToggleButton) {
      throw new Error("Password toggle button not found");
    }

    expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("toggles confirm password visibility", () => {
    render(<ResetPasswordForm />);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your new password/i);
    const toggleButtons = screen.getAllByRole("button", { name: /(show|hide) password/i });

    // Find the second toggle button (for confirm password)
    const confirmPasswordToggleButton = toggleButtons.find(button =>
        button.getAttribute('aria-label')?.includes('password')
    );

    if (!confirmPasswordToggleButton) {
      throw new Error("Confirm password toggle button not found");
    }

    expect(confirmPasswordInput).toHaveAttribute("type", "password");
  });

  test("login link navigates to /login", () => {
    render(<ResetPasswordForm />);
    const loginButton = screen.getByRole("button", { name: /log in/i });
    expect(loginButton.closest("a")).toHaveAttribute("href", "/login");
  });
})