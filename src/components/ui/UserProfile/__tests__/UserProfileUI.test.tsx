import { render, screen, fireEvent } from '@testing-library/react';
import UserProfileUI from '../UserProfileUI';
import '@testing-library/jest-dom';

describe('UserProfileUI', () => {
  const mockUsername = 'TestUser';
  const mockEmail = 'test@example.com';
  const mockAvatar = '/test-avatar.jpg';
  const mockOnDelete = jest.fn();
  const mockOnEdit = jest.fn();

  it('renders with default props', () => {
    render(<UserProfileUI />);
    expect(screen.getByText('Username Placeholder')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  it('displays provided user information', () => {
    render(
      <UserProfileUI
        username={mockUsername}
        email={mockEmail}
        avatarUrl={mockAvatar}
      />
    );

    expect(screen.getByText(mockUsername)).toBeInTheDocument();
    expect(screen.getByText(mockEmail)).toBeInTheDocument();
    expect(screen.getByAltText('User avatar')).toHaveAttribute('src', mockAvatar);
  });

  it('shows loading state', () => {
    render(<UserProfileUI loading={true} />);

    // Check for loading skeletons
    expect(screen.getByTestId('username-loading')).toHaveClass('loading');
    expect(screen.getByTestId('email-loading')).toHaveClass('loading');
    expect(screen.getAllByRole('button')[0]).toHaveClass('loading');
  });

  it('triggers callbacks when buttons clicked', () => {
    render(
      <UserProfileUI
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    fireEvent.click(screen.getByText('Delete account'));
    expect(mockOnDelete).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Edit info'));
    expect(mockOnEdit).toHaveBeenCalled();
  });

  it('disables buttons when loading', () => {
    render(<UserProfileUI loading={true} />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });
});