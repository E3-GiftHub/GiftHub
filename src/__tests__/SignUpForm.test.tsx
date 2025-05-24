import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import SignUpForm from "~/components/ui/Account/SignUpForm";
import { api } from '~/trpc/react';
import { jest } from '@jest/globals';

const mockPush = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

type FormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type OnSuccessCallback = () => void;
type OnErrorCallback = (error: { message: string }) => void;
const mutateMock = jest.fn() as jest.MockedFunction<
  (
    data: FormData,
    onSuccess: OnSuccessCallback,
    onError: OnErrorCallback
  ) => void
>;

jest.mock('~/trpc/react', () => ({
  api: {
    auth: {
      signup: {
        signup: {
          useMutation: jest.fn(({ onSuccess, onError }: { onSuccess: OnSuccessCallback; onError: OnErrorCallback }) => ({
            mutate: (data: FormData) => mutateMock(data, onSuccess, onError),
            isPending: false,
            error: null,
          })),
        },
      },
    },
  },
}));

describe("SignUpForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
  });

  test("renders form with all fields and labels", () => {
    render(<SignUpForm />);
    expect(screen.getByText(/create your account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/confirm your password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  test("validates empty fields on submit", async () => {
    render(<SignUpForm />);
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/a password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/confirm password is required/i)).toBeInTheDocument();
    });
  });

  test("validates invalid email and password format", async () => {
    render(<SignUpForm />);
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "u" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "bademail" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: "pass" },
    });
    fireEvent.change(screen.getByPlaceholderText(/confirm your password/i), {
      target: { value: "" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/confirm password is required/i)).toBeInTheDocument();
    });
  });

  test("submits form with valid inputs", async () => {
    render(<SignUpForm />);
    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: "User123" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: "Password1" },
    });
    fireEvent.change(screen.getByPlaceholderText(/confirm your password/i), {
      target: { value: "Password1" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        {
          username: "User123",
          email: "user@example.com",
          password: "Password1",
          confirmPassword: "Password1",
        },
        expect.any(Function),  // onSuccess callback
        expect.any(Function)   // onError callback
      );
    });
  });

  test("handles mutation onSuccess by redirecting to /login", async () => {
    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "User123" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: "Password1" } });
    fireEvent.change(screen.getByPlaceholderText(/confirm your password/i), { target: { value: "Password1" } });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalled();
      const call = mutateMock.mock.calls[0];
      if (!call) throw new Error("mutateMock was not called");
      const [, onSuccess] = call;
      onSuccess();
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  test("handles mutation onError 'User already exists'", async () => {
    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "User123" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: "Password1" } });
    fireEvent.change(screen.getByPlaceholderText(/confirm your password/i), { target: { value: "Password1" } });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      const call = mutateMock.mock.calls[0];
      if (!call) throw new Error("mutateMock was not called");
      const [, , onError] = call;
      onError({ message: "User already exists" });
      expect(screen.getByText(/user already exists/i)).toBeInTheDocument();
    });
  });

  test("handles mutation onError 'Passwords don't match'", async () => {
    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "User123" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: "Password1" } });
    fireEvent.change(screen.getByPlaceholderText(/confirm your password/i), { target: { value: "DifferentPass1" } });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      const call = mutateMock.mock.calls[0];
      if (!call) throw new Error("mutateMock was not called");
      const [, , onError] = call;
      onError({ message: "Passwords don't match" });
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
    });
  });

  test("handles mutation onError unknown error", async () => {
    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "User123" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { value: "Password1" } });
    fireEvent.change(screen.getByPlaceholderText(/confirm your password/i), { target: { value: "Password1" } });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      const call = mutateMock.mock.calls[0];
      if (!call) throw new Error("mutateMock was not called");
      const [, , onError] = call;
      onError({ message: "Unexpected error" });
      expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument();
    });
  });

  test("toggles password visibility", () => {
      render(<SignUpForm />);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const toggleButtons = screen.getAllByRole("button", { name: /password/i });
      if (!toggleButtons[0]) throw new Error("Toggle button not found");

      expect(passwordInput).toHaveAttribute("type", "password");
      fireEvent.click(toggleButtons[0]);
      expect(passwordInput).toHaveAttribute("type", "text");
      fireEvent.click(toggleButtons[0]);
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    test("toggles confirm password visibility", () => {
      render(<SignUpForm />);
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);
      const toggleButtons = screen.getAllByRole("button", { name: /password/i });
      if (!toggleButtons[1]) throw new Error("Toggle button not found");

      expect(confirmPasswordInput).toHaveAttribute("type", "password");
      fireEvent.click(toggleButtons[1]);
      expect(confirmPasswordInput).toHaveAttribute("type", "text");
      fireEvent.click(toggleButtons[1]);
      expect(confirmPasswordInput).toHaveAttribute("type", "password");
    });

    test("submit button shows 'Signing up...' when isPending is true", () => {
      const mockedUseMutation = api.auth.signup.signup.useMutation as jest.Mock;

      mockedUseMutation.mockReturnValue({
        mutate: mutateMock,
        isPending: true,
        error: null,
      });

      render(<SignUpForm />);

      const submitButton = screen.getByRole("button", { name: /signing up.../i });
      expect(submitButton).toBeInTheDocument();
    });

    test("login link navigates to /login", () => {
      render(<SignUpForm />);
      const loginButton = screen.getByRole("button", { name: /log in/i });
      expect(loginButton.closest("a")).toHaveAttribute("href", "/login");
    });
})