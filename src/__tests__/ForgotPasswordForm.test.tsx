import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ForgotPasswordForm from "~/components/ui/Account/ForgotPasswordForm";
import '@testing-library/jest-dom';

describe('ForgotPasswordForm', () => {
  test('renders forgot password heading and email input', () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByText(/forgot password\?/i)).toBeInTheDocument();
    expect(screen.getByText(/we'll send you the instructions shortly\./i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. John99@gmail\.com/i)).toBeInTheDocument();
  });

  test('renders confirm button and back to login option', () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });


  test('should navigate to login page', () => {
    render(<ForgotPasswordForm />);

    const loginButton = screen.getByRole('button', { name: /log in/i });

    fireEvent.click(loginButton);

    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });
});