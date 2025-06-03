import UserProfileUI from "~/components/ui/UserProfile/UserProfileUI";
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('UserProfileUI', () => {
  const pushMock = jest.fn();
  const mockRouter = { push: pushMock };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    pushMock.mockClear();
  });

  it('renders user data correctly', () => {
    render(
      <UserProfileUI
        username="john_doe"
        fname="John"
        lname="Doe"
        email="john@example.com"
        iban="DE89 3704 0044 0532 0130 00"
        avatarUrl="/avatar.jpg"
      />
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('john_doe');
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('DE89 3704 0044 0532 0130 00')).toBeInTheDocument();
    expect(screen.getByAltText('')).toHaveAttribute('src', '/avatar.jpg');
  });

  it('calls onEdit prop when Edit info button is clicked', () => {
    const onEdit = jest.fn();
    render(<UserProfileUI onEdit={onEdit} />);

    const editButton = screen.getByRole('button', { name: /edit info/i });
    fireEvent.click(editButton);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('navigates to /editprofile when onEdit not provided', async () => {
    render(<UserProfileUI />);

    const editButton = screen.getByRole('button', { name: /edit info/i });
    fireEvent.click(editButton);
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/editprofile'));
  });

  it('calls onDelete prop when Delete account button is clicked', () => {
    const onDelete = jest.fn();
    render(<UserProfileUI onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('navigates to / when onDelete not provided', async () => {
    render(<UserProfileUI />);

    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    fireEvent.click(deleteButton);
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/'));
  });

  it('displays loading placeholders when loading is true', () => {
    render(<UserProfileUI username="john" fname="John" lname="Doe" email="john@example.com" iban="IBAN" loading />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.textContent).toBe('\u00A0');
    const nameFields = screen.getAllByText('\u00A0');
    expect(nameFields.length).toBeGreaterThanOrEqual(3);
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => expect(btn).toBeDisabled());
  });

  it('calls onPhotoChange when a file is selected', async () => {
    const onPhotoChange = jest.fn();
    render(<UserProfileUI onPhotoChange={onPhotoChange} />);
    screen.getByLabelText('Edit avatar', { selector: 'button' });
// simulate click to open file input
    const file = new File(['(⌐□_□)'], 'avatar.png', { type: 'image/png' });
    const fileInput = screen.getByTestId('file-input');

    Object.defineProperty(fileInput, 'files', { value: [file] });
    fireEvent.change(fileInput);

    await waitFor(() => expect(onPhotoChange).toHaveBeenCalledWith(file));
  });
});
