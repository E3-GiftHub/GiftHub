import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InboxNotification from '../components/ui/InboxNotification';
import type { InboxNotificationResponse } from '~/models/InboxNotificationResponse';
import '@testing-library/jest-dom';

// Mock CSS modules
jest.mock('../../styles/InboxNotification.module.css', () => ({
  'notification-container': 'notification-container',
  'notification-info': 'notification-info',
  'notification-icon': 'notification-icon',
  'notification-text': 'notification-text',
  'notification-options': 'notification-options',
  'notification-options-row': 'notification-options-row',
}));

describe('InboxNotification', () => {
  const mockOnClick = jest.fn();

  const mockDataWithProfilePic: InboxNotificationResponse = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    profilePicture: 'https://example.com/profile.jpg',
    text: 'You have a new message',
    notificationDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    type: 'event',
    link: '/event?id=1',
  };

  const mockDataWithoutProfilePic: InboxNotificationResponse = {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    profilePicture: undefined,
    text: 'Your gift was delivered',
    notificationDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    type: 'invitation',
    link: '/event-invitation?id=2',
  };

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  test('renders notification with profile picture', () => {
    render(<InboxNotification data={mockDataWithProfilePic} onClick={mockOnClick} />);
    
    const container = screen.getByTestId('notification-container');
    expect(container).toBeInTheDocument();
    
    const profileImage = screen.getByRole('img', { name: 'John Doe' });
    expect(profileImage).toBeInTheDocument();
    expect(profileImage).toHaveAttribute('src', 'https://example.com/profile.jpg');
    expect(profileImage).toHaveAttribute('alt', 'John Doe');
    
    expect(screen.getByText('You have a new message')).toBeInTheDocument();
  });

  test('renders notification with initials when no profile picture', () => {
    render(<InboxNotification data={mockDataWithoutProfilePic} onClick={mockOnClick} />);
    
    const initialsElement = screen.getByText('JS');
    expect(initialsElement).toBeInTheDocument();
    
    expect(screen.getByText('Your gift was delivered')).toBeInTheDocument();
    
    // Should not render an image
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  test('calls onClick handler when notification is clicked', () => {
    render(<InboxNotification data={mockDataWithProfilePic} onClick={mockOnClick} />);
    
    const button = screen.getByTestId('notification-container');
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test('displays correct time difference in hours', () => {
    render(<InboxNotification data={mockDataWithProfilePic} onClick={mockOnClick} />);
    
    expect(screen.getByText('2h')).toBeInTheDocument();
  });

  test('displays correct time difference for different hours', () => {
    render(<InboxNotification data={mockDataWithoutProfilePic} onClick={mockOnClick} />);
    
    expect(screen.getByText('5h')).toBeInTheDocument();
  });

  test('handles edge case with very recent notification', () => {
    const recentData: InboxNotificationResponse = {
      ...mockDataWithProfilePic,
      notificationDate: new Date().toISOString(), // Current time
    };
    
    render(<InboxNotification data={recentData} onClick={mockOnClick} />);
    
    expect(screen.getByText('0h')).toBeInTheDocument();
  });

  test('generates correct initials for different names', () => {
    const customData: InboxNotificationResponse = {
      ...mockDataWithoutProfilePic,
      firstName: 'alice',
      lastName: 'wonderland',
    };
    
    render(<InboxNotification data={customData} onClick={mockOnClick} />);
    
    expect(screen.getByText('AW')).toBeInTheDocument();
  });

  test('renders as a button element', () => {
    render(<InboxNotification data={mockDataWithProfilePic} onClick={mockOnClick} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-testid', 'notification-container');
  });
});