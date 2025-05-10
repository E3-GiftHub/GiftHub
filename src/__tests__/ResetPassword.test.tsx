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

    const passwordInput = screen.getByPlaceholderText('Enter your password') as HTMLInputElement;
    const confirmInput = screen.getByPlaceholderText('Confirm your password') as HTMLInputElement;

    expect(passwordInput.type).toBe('password');
    fireEvent.click(passwordToggle!);
    expect(passwordInput.type).toBe('text');

    expect(confirmInput.type).toBe('password');
    fireEvent.click(confirmToggle!);
    expect(confirmInput.type).toBe('text');
  });
});
