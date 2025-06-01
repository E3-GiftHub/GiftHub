import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import ResetPasswordForm from "~/components/ui/Account/ResetPasswordForm"; // Adjust import path
import { jest } from '@jest/globals'; // Explicitly import jest from @jest/globals

// --- Mocking next/router ---
let mockRouterQuery: Record<string, string | string[] | undefined> = {};
const mockPush = jest.fn();

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    query: mockRouterQuery, // Make query controllable
  })),
}));

// --- External state variables for controlling useMutation mock ---
let mockIsPending = false;
let mockError: { message: string } | null = null;
let mockData: { message: string } | null = null;

// Mock the `mutate` function. It will just capture its arguments.
const mockMutate = jest.fn();

// --- Mock tRPC's api.auth.update.update.useMutation ---
jest.mock('~/trpc/react', () => ({
  api: {
    auth: {
      update: { // This is the new path for update router
        update: { // This is the new path for update procedure
          useMutation: jest.fn(() => ({
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

// Import the actual tRPC api to reset its mock between tests
import { api } from '~/trpc/react';

describe("ResetPasswordForm", () => {
  // Use fake timers to control setTimeout
  beforeEach(() => {
    jest.useFakeTimers(); // Enable fake timers
    jest.clearAllMocks();
    mockPush.mockClear();
    // Reset external state for useMutation
    mockIsPending = false;
    mockError = null;
    mockData = null;
    // Reset router query for each test unless specifically set
    mockRouterQuery = { token: 'valid-test-token' }; // Default to a valid token for most tests

    // Ensure the useMutation mock reflects the initial state
    (api.auth.update.update.useMutation as jest.Mock).mockImplementation(() => ({
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
  test("renders the reset password form correctly", () => {
    render(<ResetPasswordForm />);

    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your new password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/confirm your new password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
  });

  // Test 2: Validates empty password fields on submit
  /*test('displays "Password is required" for empty password fields', async () => {
    render(<ResetPasswordForm />);

    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText(/^password is required$/i)).toBeInTheDocument(); // Finds the first occurrence
    // For confirm password, it reuses the same message so the selector can be tricky if they are styled identically.
    // We can be more specific or rely on the single match.
    // If the span for confirmPassword uses errors.password, it's the same text.
    // We can check if the form overall has 2 error messages for password.
    expect(screen.getAllByText(/^password is required$/i).length).toBe(2);
    expect(mockMutate).not.toHaveBeenCalled();
  });*/

  // Test 3: Validates password strength (too short)
  test('displays "Password must be at least 8 characters" for short password', async () => {
    render(<ResetPasswordForm />);

    const passwordInput = screen.getByPlaceholderText(/enter your new password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your new password/i);

    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  // Test 4: Validates password strength (missing digit)
  test('displays "Password must contain at least one digit" for missing digit', async () => {
    render(<ResetPasswordForm />);

    const passwordInput = screen.getByPlaceholderText(/enter your new password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your new password/i);

    fireEvent.change(passwordInput, { target: { value: 'NoDigitsHere' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NoDigitsHere' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText(/password must contain at least one digit/i)).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  // Test 5: Validates password strength (missing lowercase)
  test('displays "Password must contain at least one lowercase letter" for missing lowercase', async () => {
    render(<ResetPasswordForm />);

    const passwordInput = screen.getByPlaceholderText(/enter your new password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your new password/i);

    fireEvent.change(passwordInput, { target: { value: 'UPPERCASE1' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'UPPERCASE1' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText(/password must contain at least one lowercase letter/i)).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  // Test 6: Validates password strength (missing uppercase)
  test('displays "Password must contain at least one uppercase letter" for missing uppercase', async () => {
    render(<ResetPasswordForm />);

    const passwordInput = screen.getByPlaceholderText(/enter your new password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your new password/i);

    fireEvent.change(passwordInput, { target: { value: 'lowercase1' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'lowercase1' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText(/password must contain at least one uppercase letter/i)).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  // Test 7: Validates password mismatch
  /*test('displays "Passwords do not match" when passwords mismatch', async () => {
    render(<ResetPasswordForm />);

    const passwordInput = screen.getByPlaceholderText(/enter your new password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your new password/i);

    fireEvent.change(passwordInput, { target: { value: 'ValidPass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'MismatchPass123' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });*/

  // Test 8: Validates missing/invalid token
  test('displays "Invalid or missing reset token" if token is missing/invalid', async () => {
    mockRouterQuery = {}; // Simulate no token in query
    render(<ResetPasswordForm />);

    // Fill valid passwords to bypass password validation
    const passwordInput = screen.getByPlaceholderText(/enter your new password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your new password/i);
    fireEvent.change(passwordInput, { target: { value: 'ValidPass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'ValidPass123' } });

    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(await screen.findByText(/invalid or missing reset token\. please use the link from your email\./i)).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });


  // Test 9: Successfully submits with valid inputs and displays success message
  /*test('successfully submits with valid inputs and redirects to login', async () => {
    const { rerender } = render(<ResetPasswordForm />);

    const passwordInput = screen.getByPlaceholderText(/enter your new password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your new password/i);

    fireEvent.change(passwordInput, { target: { value: 'ValidPass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'ValidPass123' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    // Assert that the mutate function was called with the correct data
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith({
      token: 'valid-test-token',
      password: 'ValidPass123',
      confirmPassword: 'ValidPass123',
    });*/

    // Simulate success state change after mutation call
    mockIsPending = false;
    mockData = { message: "Your password has been successfully reset!" }; // Component uses a fixed message on success

    // Advance timers to trigger the redirection
    jest.advanceTimersByTime(3000); // Advance by 3 seconds
    expect(mockPush).toHaveBeenCalledWith('/login');

    // Ensure no error messages are present
    expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/an unexpected error occurred/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/invalid or missing reset token/i)).not.toBeInTheDocument();
  });

  // Test 10: Handles server-side error "Passwords don't match"
  /*test('handles server-side error "Passwords don\'t match" and displays message', async () => {
    const { rerender } = render(<ResetPasswordForm />);

    const passwordInput = screen.getByPlaceholderText(/enter your new password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your new password/i);

    fireEvent.change(passwordInput, { target: { value: 'Pass1234' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Pass1234' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(mockMutate).toHaveBeenCalledTimes(1);

    // Simulate error state change after mutation call
    mockIsPending = false;
    mockError = { message: "Passwords don't match" }; // Specific error message from server
    rerender(<ResetPasswordForm />);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/your password has been successfully reset/i)).not.toBeInTheDocument();
  });*/

  // Test 11: Handles server-side error "Invalid or expired password reset link"
 /*test('handles server-side error "Invalid or expired password reset link" and displays message', async () => {
    const { rerender } = render(<ResetPasswordForm />);

    const passwordInput = screen.getByPlaceholderText(/enter your new password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your new password/i);

    fireEvent.change(passwordInput, { target: { value: 'Pass1234' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Pass1234' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(mockMutate).toHaveBeenCalledTimes(1);

    // Simulate error state change after mutation call
    mockIsPending = false;
    mockError = { message: "Invalid or expired password reset link" }; // Specific error message from server
    rerender(<ResetPasswordForm />);

    await waitFor(() => {
      expect(screen.getByText(/invalid or expired password reset link/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/your password has been successfully reset/i)).not.toBeInTheDocument();
  });*/

  // Test 12: Handles generic server error
  /*test('handles generic server error and displays message', async () => {
    const { rerender } = render(<ResetPasswordForm />);

    const passwordInput = screen.getByPlaceholderText(/enter your new password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your new password/i);

    fireEvent.change(passwordInput, { target: { value: 'Pass1234' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Pass1234' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(mockMutate).toHaveBeenCalledTimes(1);

    // Simulate generic error state change after mutation call
    mockIsPending = false;
    mockError = { message: "Something went wrong on the server" }; // Generic error message
    rerender(<ResetPasswordForm />);

    await waitFor(() => {
      expect(screen.getByText(/an unexpected error occurred\. please try again\./i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/your password has been successfully reset/i)).not.toBeInTheDocument();
  });*/

  // Test 13: Shows loading state on button during submission
  test("submit button shows 'Resetting...' when isPending is true", async () => {
    // Set pending state before initial render for this specific test
    mockIsPending = true;

    const { rerender } = render(<ResetPasswordForm />);

    const confirmButton = screen.getByRole('button', { name: /resetting.../i });
    expect(confirmButton).toBeDisabled(); // Button should be disabled
    expect(confirmButton).toHaveTextContent('Resetting...'); // Text should be "Resetting..."

    // Simulate the mutation completing (e.g., successful)
    mockIsPending = false;
    mockData = { message: "Success" };
    rerender(<ResetPasswordForm />); // Re-render to update the button state

    await waitFor(() => {
      expect(confirmButton).not.toBeDisabled();
      expect(confirmButton).toHaveTextContent('Reset password'); // Text should revert
    });
  });

  // Test 14: Toggles password visibility
  test("toggles password visibility", () => {
    render(<ResetPasswordForm />);
    const passwordInput = screen.getByPlaceholderText(/enter your new password/i);
    // Get the first toggle button for the main password input
    const toggleButton = screen.getAllByRole("button", { name: /password/i })[0];

    expect(passwordInput).toHaveAttribute("type", "password");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  // Test 15: Toggles confirm password visibility
  test("toggles confirm password visibility", () => {
    render(<ResetPasswordForm />);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your new password/i);
    // Get the second toggle button for the confirm password input
    const toggleButton = screen.getAllByRole("button", { name: /password/i })[1];

    expect(confirmPasswordInput).toHaveAttribute("type", "password");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    fireEvent.click(toggleButton);
    expect(confirmPasswordInput).toHaveAttribute("type", "text");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    fireEvent.click(toggleButton);
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
  });

  // Test 16: "Back to Log in" link navigates correctly
  test('navigates to login page when "Back to Log in" button is clicked', () => {
    render(<ResetPasswordForm />);

    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    expect(mockPush).toHaveBeenCalledWith('/login');
  });