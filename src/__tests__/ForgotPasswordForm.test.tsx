import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import ForgotPasswordForm from "~/components/ui/Account/ForgotPasswordForm";
import { api } from '~/trpc/react';
import { jest } from '@jest/globals';

// Mock router
const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock TRPC mutation
const mutateMock = jest.fn();
jest.mock('~/trpc/react', () => ({
  api: {
    auth: {
      resetRequest: {
        requestReset: {
          useMutation: jest.fn(() => ({
            mutate: mutateMock,
            isPending: false,
            error: null,
          })),
        },
      },
    },
  },
}));

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders form correctly", () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByRole('heading', { name: /forgot password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/john99@gmail\.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  test("shows error for empty email", async () => {
    render(<ForgotPasswordForm />);

    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(screen.getByText(/email address is required/i)).toBeInTheDocument();
    });
  });

  test("shows error for invalid email format", async () => {
    render(<ForgotPasswordForm />);

    fireEvent.change(screen.getByPlaceholderText(/john99@gmail\.com/i), {
      target: { value: 'invalid' }
    });
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email address format/i)).toBeInTheDocument();
    });
  });

  test("submits valid form", async () => {
    render(<ForgotPasswordForm />);

    fireEvent.change(screen.getByPlaceholderText(/john99@gmail\.com/i), {
      target: { value: 'valid@example.com' }
    });
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        { email: 'valid@example.com' },
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  test("shows success message on mutation success", async () => {
    mutateMock.mockImplementation((_, { onSuccess }) => {
      onSuccess({ message: 'Reset email sent' });
    });

    render(<ForgotPasswordForm />);

    fireEvent.change(screen.getByPlaceholderText(/john99@gmail\.com/i), {
      target: { value: 'valid@example.com' }
    });
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(screen.getByText(/reset email sent/i)).toBeInTheDocument();
    });
  });

  test("shows error message on mutation failure", async () => {
    // @ts-expect-error
    mutateMock.mockImplementation((_, { onError }) => {
      onError({ message: 'User not found' });
    });

    render(<ForgotPasswordForm />);

    fireEvent.change(screen.getByPlaceholderText(/john99@gmail\.com/i), {
      target: { value: 'valid@example.com' }
    });
    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => {
      expect(screen.getByText(/user not found/i)).toBeInTheDocument();
    });
  });

  test("shows loading state during submission", () => {
    (api.auth.resetRequest.requestReset.useMutation as jest.Mock).mockReturnValue({
      mutate: mutateMock,
      isPending: true,
      error: null,
    });

    render(<ForgotPasswordForm />);
    expect(screen.getByRole('button', { name: /sending/i })).toBeInTheDocument();
  });
});