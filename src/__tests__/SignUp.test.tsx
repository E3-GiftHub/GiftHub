import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SignupForm from "~/components/ui/Account/SignUpForm";
import '@testing-library/jest-dom';

describe('SignupForm', () =>{

  test('renders headings and input fields', () => {
  render(<SignupForm />);

  expect(screen.getByText(/welcome to gifthub!/i)).toBeInTheDocument();
  expect(screen.getByText(/create your account/i)).toBeInTheDocument();
  expect(screen.getAllByPlaceholderText(/e.g. John99/i).length).toBeGreaterThan(0);
  expect(screen.getByPlaceholderText(/e.g. John99@gmail.com/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/confirm your password/i)).toBeInTheDocument();
});



test('renders sign up and log in buttons', () => {
    render(<SignupForm />);

    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  test('toggles password visibility for password input', () => {
    render(<SignupForm />);

    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const toggleButton = screen.getAllByRole('button', {
      name: /show password/i,
    })[0];

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(toggleButton!);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton!);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('toggles password visibility for confirm password input', () => {
    render(<SignupForm />);

    const confirmPasswordInput = screen.getByPlaceholderText(/confirm your password/i);

    const toggleButtons = screen.getAllByRole('button', { name: /show password/i });

    const confirmToggleButton = toggleButtons[1];

    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    // @ts-ignore
    fireEvent.click(confirmToggleButton);
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');

    // @ts-ignore
    fireEvent.click(confirmToggleButton);
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });


});
