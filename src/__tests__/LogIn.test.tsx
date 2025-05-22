import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LogInForm from "~/components/ui/Account/LogInForm";
import '@testing-library/jest-dom';

describe('LogInForm', () => {
  test('renders login headings and input fields', () => {
    render(<LogInForm />);

    expect(screen.getByText(/welcome back!/i)).toBeInTheDocument();
    expect(screen.getByText(/log in to your account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. John99@gmail.com/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
  });

  test('renders forgot password and remember me options', () => {
    render(<LogInForm />);

    expect(screen.getByText(/forgot password\?/i)).toBeInTheDocument();
    expect(screen.getByText(/remember me/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  test('renders log in and sign up buttons', () => {
    render(<LogInForm />);

    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  test('toggles password visibility', () => {
    render(<LogInForm />);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const toggleButton = screen.getByRole('button', {
      name: /show password/i,
    });

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
