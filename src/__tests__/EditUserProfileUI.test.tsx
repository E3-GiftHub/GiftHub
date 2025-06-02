import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditUserProfileUI from '~/components/ui/UserProfile/EditUserProfileUI';

describe('EditUserProfileUI', () => {
  const mockOnSave = jest.fn();
  const mockOnResetPassword = jest.fn();
  const defaultProps = {
    username: 'testuser',
    fname: 'First',
    lname: 'Last',
    email: 'test@example.com',
    IBAN: 'DE1234567890',
    avatarUrl: '/avatar.jpg',
    onSave: mockOnSave,
    onResetPassword: mockOnResetPassword,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with initial values', () => {
    render(<EditUserProfileUI {...defaultProps} />);

    expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    expect(screen.getByDisplayValue('First')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Last')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('DE1234567890')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', '/avatar.jpg');
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });

  test('updates username input correctly', () => {
    render(<EditUserProfileUI {...defaultProps} />);
    const usernameInput = screen.getByDisplayValue('testuser');
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    expect(usernameInput).toHaveValue('newuser');
  });

  test('validates email input and shows error message', () => {
    render(<EditUserProfileUI {...defaultProps} />);
    const emailInput = screen.getByDisplayValue('test@example.com');

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();

    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
  });

  test('disables save button when email is invalid', () => {
    render(<EditUserProfileUI {...defaultProps} />);
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    const emailInput = screen.getByDisplayValue('test@example.com');

    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    expect(saveButton).toBeDisabled();
  });

  test('calls onSave with correct values when save is clicked', () => {
    render(<EditUserProfileUI {...defaultProps} />);

    fireEvent.change(screen.getByDisplayValue('testuser'), { target: { value: 'newuser' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    expect(mockOnSave).toHaveBeenCalledWith('First', 'Last', 'newuser', 'test@example.com', 'DE1234567890');
  });

  test('does not call onSave when email is invalid', () => {
    render(<EditUserProfileUI {...defaultProps} />);
    const emailInput = screen.getByDisplayValue('test@example.com');

    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  test('calls onResetPassword when reset password button is clicked', () => {
    render(<EditUserProfileUI {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
    expect(mockOnResetPassword).toHaveBeenCalled();
  });

  test('shows loading state correctly', () => {
    render(<EditUserProfileUI {...defaultProps} loading />);
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => expect(input).toBeDisabled());

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => expect(button).toBeDisabled());
  });

  test('updates input values when props change', () => {
    const { rerender } = render(<EditUserProfileUI {...defaultProps} />);
    rerender(
      <EditUserProfileUI
        {...defaultProps}
        username="newusername"
        fname="NewFirst"
        lname="NewLast"
        email="new@example.com"
        IBAN="FR0987654321"
      />
    );

    expect(screen.getByDisplayValue('newusername')).toBeInTheDocument();
    expect(screen.getByDisplayValue('NewFirst')).toBeInTheDocument();
    expect(screen.getByDisplayValue('NewLast')).toBeInTheDocument();
    expect(screen.getByDisplayValue('new@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('FR0987654321')).toBeInTheDocument();
  });

  test('handles empty initial values', () => {
    render(<EditUserProfileUI />);
    expect(screen.getByRole('textbox', { name: /username/i })).toHaveValue('');
    expect(screen.getByRole('textbox', { name: /email/i })).toHaveValue('');
  });
});