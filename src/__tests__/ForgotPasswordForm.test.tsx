// src/__tests__/ForgotPasswordForm.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import ForgotPasswordForm from "~/components/ui/Account/ForgotPasswordForm"; // Adjust import path if necessary
import { api } from '~/trpc/react';
import { jest } from '@jest/globals'; // Explicitly import jest from @jest/globals

// Mock Next.js useRouter
const mockRouterQuery: Record<string, string | string[] | undefined> = {};
const mockPush = jest.fn(); // Mock the push function for navigation
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    query: mockRouterQuery, // Keep query mock for consistency, even if not used by ForgotPasswordForm
  })),
}));

// --- External state variables for controlling useMutation mock ---
let mockIsPending = false;
let mockError: { message: string } | null = null;
let mockData: { message: string } | null = null;

// Mock the `mutate` function. It will just capture its arguments.
// We'll control the success/error/pending state via the external variables.
const mockMutate = jest.fn();

// Mock tRPC's api.auth.resetRequest.requestReset.useMutation
jest.mock('~/trpc/react', () => ({
  api: {
    auth: {
      resetRequest: {
        requestReset: {
          useMutation: jest.fn(() => ({ // Updated useMutation mock to use external variables
            mutate: mockMutate,
            isPending: mockIsPending,
            error: mockError,
            data: mockData,
          })),
        },
      },
    },
  },
}));

describe("ForgotPasswordForm", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.useFakeTimers(); // Enable fake timers (good practice, even if not strictly needed for setTimeout in this specific component)
    jest.clearAllMocks(); // Clear calls to mockMutate, mockPush, etc.
    mockPush.mockClear(); // Clear specific mock calls
    // Reset external state for useMutation
    mockIsPending = false;
    mockError = null;
    mockData = null;

    // Reset the useMutation mock to its initial (not pending) state for each test
    (api.auth.resetRequest.requestReset.useMutation as jest.Mock).mockImplementation(() => ({
      mutate: mockMutate,
      isPending: mockIsPending,
      error: mockError,
      data: mockData,
    }));
  });

  afterEach(() => {
    jest.runOnlyPendingTimers(); // Run any remaining timers
    jest.useRealTimers();       // Restore real timers
  });

  // Test 1: Renders correctly with initial elements
  test("renders the forgot password form correctly", () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByRole('heading', { name: /forgot password\?/i })).toBeInTheDocument();
    expect(screen.getByText(/we'll send you the instructions shortly\./i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
  });

  /*test('displays "Email address is required" when email field is empty', async () => {
    render(<ForgotPasswordForm />);
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    await waitFor(() => {
      expect(screen.getByText(/email address is required/i)).toBeInTheDocument();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  // Test 3: Validates invalid email format
  test('displays "Invalid email address format" for an invalid email', async () => {
    // See IMPORTANT NOTE in the previous test about component's validation logic.
    render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      // Ensure the error message is in the DOM
      expect(screen.getByText(/invalid email address format/i)).toBeInTheDocument();
    });
    expect(mockMutate).not.toHaveBeenCalled(); // Mutation should not be called on validation failure
  });

  // Test 4: Successfully submits with a valid email and displays success message
  test('successfully submits with a valid email and shows success message', async () => {
    const { rerender } = render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    // Assert that the mutation was called with the correct data
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith(
      { email: 'test@example.com' }
    );*/

    // Simulate success state change after mutation call
    mockIsPending = false;
    mockData = { message: "If that email exists, a reset link has been sent." }; // This must match the success message your component expects from data.message
  
    // Wait for the success message to appear
    // Ensure no error messages are present
    expect(screen.queryByText(/email address is required/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/invalid email address format/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/an unexpected error occurred/i)).not.toBeInTheDocument();
  });

  // Test 5: Handles server-side error and displays generic error message
  test('handles server-side error and displays generic error message', async () => {
    const { rerender } = render(<ForgotPasswordForm />);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'test@error.com' } });
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    expect(mockMutate).toHaveBeenCalledTimes(1);

    // Simulate error state change after mutation call
    mockIsPending = false;
    mockError = { message: "Some internal server error from API" }; // Simulate any error message from the API
    // IMPORTANT: Ensure your ForgotPasswordForm's onError handler maps ANY unknown error message
    // (not 'Passwords don't match' or 'Invalid or expired password reset link' if applicable)
    // to "An unexpected error occurred. Please try again."

    // Re-render the component to reflect the new state returned by useMutation
    rerender(<ForgotPasswordForm />);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/an unexpected error occurred\. please try again\./i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/if that email exists/i)).not.toBeInTheDocument();
  });

  // Test 6: Shows loading state on button during submission
  test("submit button shows 'Sending...' when isPending is true", async () => {
    // Set pending state before initial render for this specific test
    mockIsPending = true;

    const { rerender } = render(<ForgotPasswordForm />);

    const confirmButton = screen.getByRole('button', { name: /sending.../i });
    expect(confirmButton).toBeDisabled(); // Button should be disabled when pending
    expect(confirmButton).toHaveTextContent('Sending...'); // Text should be "Sending..."

    // Simulate the mutation completing (e.g., successful)
    mockIsPending = false;
    mockData = { message: "Success" }; // Provide some data to transition from pending
    rerender(<ForgotPasswordForm />); // Re-render to update the button state

    await waitFor(() => {
      expect(confirmButton).not.toBeDisabled(); // Button should no longer be disabled
      expect(confirmButton).toHaveTextContent('Confirm'); // Text should revert to original
    });
  });

  // Test 7: "Back to Log in" link navigates correctly
  test('navigates to login page when "Back to Log in" button is clicked', () => {
    render(<ForgotPasswordForm />);
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(mockPush).toHaveBeenCalledWith('/login');
  });