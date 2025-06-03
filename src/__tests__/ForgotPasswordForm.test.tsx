import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import ForgotPasswordForm from "~/components/ui/Account/ForgotPasswordForm";
import { jest } from '@jest/globals';

// Mock Link
jest.mock('next/link', () => {
  const Link = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  Link.displayName = 'MockNextLink';
  return Link;
});


// Define mutate options type
type MutateOptions = {
  onSuccess?: (data: { message: string }) => void;
  onError?: (err: { message: string }) => void;
};

// Create mock mutate function (typed)
const mutateMock = jest.fn<() => void>();



// Mock useMutation hook
const mockUseMutation = jest.fn(() => ({
  mutate: mutateMock,
  isPending: false,
  error: null,
}));

// Mock TRPC
jest.mock('~/trpc/react', () => ({
  api: {
    auth: {
      resetRequest: {
        requestReset: {
          useMutation: () => mockUseMutation(),
        },
      },
    },
  },
}));

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fillEmail = (email: string) => {
    fireEvent.change(screen.getByPlaceholderText(/john99@gmail\.com/i), {
      target: { value: email },
    });
  };

  const submitForm = () => {
    fireEvent.submit(screen.getByTestId("forgot-password-form"));
  };

  test("renders all elements correctly", () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByRole('heading', { name: /forgot password/i })).toBeInTheDocument();
    expect(screen.getByText(/we'll send you the instructions/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/john99@gmail\.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  test("shows error when email is empty", async () => {
    render(<ForgotPasswordForm />);
    submitForm();
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/email address is required/i);
    });
  });

  test("shows error for invalid email format", async () => {
    render(<ForgotPasswordForm />);
    fillEmail("invalidemail");
    submitForm();
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/invalid email address format/i);
    });
  });

test("submits form with valid email", async () => {
  render(<ForgotPasswordForm />);
  fillEmail("test@example.com");
  submitForm();

  await waitFor(() => {
    expect(mutateMock).toHaveBeenCalledWith({ email: "test@example.com" });
  });
});






  test("displays loading state on submit", () => {
    mockUseMutation.mockReturnValue({
      mutate: mutateMock,
      isPending: true,
      error: null,
    });

    render(<ForgotPasswordForm />);
    expect(screen.getByRole('button', { name: /sending/i })).toBeInTheDocument();
  });
});
