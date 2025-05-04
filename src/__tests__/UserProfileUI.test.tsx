import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserProfileUI from "~/components/ui/UserProfile/UserProfileUI";
import '@testing-library/jest-dom';

// Mock next/image to simplify tests
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ComponentPropsWithoutRef<'img'>) => (
    <img {...props} />
  ),
}));

// Mock CSS Module classes
jest.mock('~/styles/UserProfile/UserProfile.module.css', () => ({
  __esModule: true,
  default: {
    pageWrapper: 'pageWrapper',
    profileCard: 'profileCard',
    avatarSection: 'avatarSection',
    avatarWrapper: 'avatarWrapper',
    avatarCircle: 'avatarCircle',
    avatarImage: 'avatarImage',
    editAvatarButton: 'editAvatarButton',
    userInfo: 'userInfo',
    username: 'username',
    email: 'email',
    buttonContainer: 'buttonContainer',
    button: 'button',
    icon: 'icon',
    loading: 'loading',
  },
}));

describe('UserProfileUI', () => {
  it('renders default username and email when not provided', () => {
    render(<UserProfileUI />);
    expect(screen.getByText('Username Placeholder')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  it('displays provided username and email', () => {
    const username = 'JohnDoe';
    const email = 'john@doe.com';
    render(<UserProfileUI username={username} email={email} />);
    expect(screen.getByText(username)).toBeInTheDocument();
    expect(screen.getByText(email)).toBeInTheDocument();
  });

  it('shows loading state when loading is true', () => {
    render(<UserProfileUI loading={true} />);

    // Check username and email elements
    const usernameElement = screen.getByRole('heading', { level: 2 });
    const emailElement = screen.getByTestId('user-email'); // Assume email has data-testid="user-email"

    // expect(usernameElement).toHaveClass(styles.loading);
    // expect(usernameElement).toHaveTextContent('\u00A0'); // Non-breaking space
    // expect(emailElement).toHaveClass(styles.loading);
    // expect(emailElement).toHaveTextContent('\u00A0');

    // Check buttons are disabled
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => expect(button).toBeDisabled());
  });

  it('displays avatar image when avatarUrl is provided', () => {
    const avatarUrl = '/test-avatar.jpg';
    render(<UserProfileUI avatarUrl={avatarUrl} />);
    const avatarImage = screen.getByAltText('User avatar');
    expect(avatarImage).toHaveAttribute('src', avatarUrl);
  });

  it('does not display avatar image when avatarUrl is missing', () => {
    render(<UserProfileUI />);
    const avatarImage = screen.queryByAltText('User avatar');
    expect(avatarImage).not.toBeInTheDocument();
  });

  it('triggers onEdit and onDelete when buttons are clicked', () => {
    const onEditMock = jest.fn();
    const onDeleteMock = jest.fn();
    render(<UserProfileUI onEdit={onEditMock} onDelete={onDeleteMock} />);

    fireEvent.click(screen.getByText('Edit info'));
    fireEvent.click(screen.getByText('Delete account'));

    expect(onEditMock).toHaveBeenCalledTimes(1);
    expect(onDeleteMock).toHaveBeenCalledTimes(1);
  });

  it('disables buttons during loading', () => {
    render(<UserProfileUI loading={true} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => expect(button).toBeDisabled());
  });

  it('triggers onEdit when avatar edit button is clicked', () => {
    const onEditMock = jest.fn();
    render(<UserProfileUI onEdit={onEditMock} />);
    const editAvatarButton = screen.getByLabelText('Edit avatar');
    fireEvent.click(editAvatarButton);
    expect(onEditMock).toHaveBeenCalledTimes(1);
  });

  it('ProfileButton shows loader and hides content when loading', () => {
    render(<UserProfileUI loading={true} />);
    expect(screen.queryByText('Edit info')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete account')).not.toBeInTheDocument();
  });
});