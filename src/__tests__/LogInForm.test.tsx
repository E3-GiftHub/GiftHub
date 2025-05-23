import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from '~/components/ui/Account/LogInForm';
import { useRouter } from 'next/router';
import { api } from '~/trpc/react';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock trpc
jest.mock('~/trpc/react', () => ({
  api: {
    auth: {
      login: {
        login: {
          useMutation: jest.fn(() => ({
            mutate: jest.fn(),
            isPending: false,
            error: null,
          })),
        },
      },
    },
  },
}));

describe('LoginForm Component', () => {
  const mockPush = jest.fn();
  const mockMutate = jest.fn();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup router mock
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // Setup the mock implementation
    (api.auth.login.login.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    });
  });

  it('renders the login form with all elements', () => {
    render(<LoginForm />);

    expect(screen.getByText('Welcome back!')).toBeInTheDocument();
    expect(screen.getByText('Log in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log in/i })).toBeInTheDocument();
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign up/i })).toBeInTheDocument();
  });

  it('validates email field', async () => {
    render(<LoginForm />);

    // Test empty email
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Log in/i }));

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    // Test invalid email format
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'invalid-email' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Log in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('validates password field', async () => {
    render(<LoginForm />);

    // Fill valid email
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });

    // Test empty password
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Log in/i }));

    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('submits the form with valid data', async () => {
    render(<LoginForm />);

    const email = 'test@example.com';
    const password = 'validpassword123';

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: email },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: password },
    });
    fireEvent.click(screen.getByRole('button', { name: /Log in/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        email,
        password,
      });
    });
  });

  it('handles user not found error', async () => {
    (api.auth.login.login.useMutation as jest.Mock).mockReturnValueOnce({
      mutate: mockMutate,
      isPending: false,
      error: { message: 'User not found' },
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'nonexistent@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'validpassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Log in/i }));

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });

  it('handles incorrect password error', async () => {
    (api.auth.login.login.useMutation as jest.Mock).mockReturnValueOnce({
      mutate: mockMutate,
      isPending: false,
      error: { message: 'Passwords don\'t match' },
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Log in/i }));

    await waitFor(() => {
      expect(screen.getByText('Passwords don\'t match')).toBeInTheDocument();
    });
  });

  it('handles unexpected errors', async () => {
    (api.auth.login.login.useMutation as jest.Mock).mockReturnValueOnce({
      mutate: mockMutate,
      isPending: false,
      error: { message: 'Something went wrong' },
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'validpassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Log in/i }));

    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    (api.auth.login.login.useMutation as jest.Mock).mockReturnValueOnce({
      mutate: mockMutate,
      isPending: true,
      error: null,
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'validpassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Log in/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Loading.../i })).toBeInTheDocument();
    });
  });

  it('redirects to home page on successful login', async () => {
    render(<LoginForm />);

    mockMutate.mockImplementationOnce((data, { onSuccess }) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      onSuccess();
    });

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'validpassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Log in/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/home');
    });
  });

  it('toggles password visibility', async () => {
    render(<LoginForm />);

    const passwordInput = screen.getByLabelText('Password');
    const toggleButton = screen.getByRole('img', { name: /toggle visibility/i });

    // Default state should be password
    expect((passwordInput as HTMLInputElement).type).toBe('password');

    // Click to show password
    fireEvent.click(toggleButton);
    expect((passwordInput as HTMLInputElement).type).toBe('text');

    // Click to hide password again
    fireEvent.click(toggleButton);
    expect((passwordInput as HTMLInputElement).type).toBe('password');
  });
});