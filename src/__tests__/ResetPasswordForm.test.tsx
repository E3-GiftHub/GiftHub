import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ResetPasswordForm from '~/components/ui/Account/ResetPasswordForm';

describe('ResetPasswordForm', () => {
  test('renders form with correct headings and elements', () => {
    render(<ResetPasswordForm />);
    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();

    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  test('toggles password visibility for both fields', () => {
    render(<ResetPasswordForm />);

    const passwordToggle = screen.getAllByRole('button', {
      name: /password/i,
    })[0];
    const confirmToggle = screen.getAllByRole('button', {
      name: /password/i,
    })[1];

    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const confirmInput = screen.getByPlaceholderText('Confirm your password');

    expect(passwordInput).toHaveAttribute('type', 'password');
    fireEvent.click(passwordToggle!);
    expect(passwordInput).toHaveAttribute('type', 'text');

    expect(confirmInput).toHaveAttribute('type', 'password');
    fireEvent.click(confirmToggle!);
    expect(confirmInput).toHaveAttribute('type', 'text');
  });
});