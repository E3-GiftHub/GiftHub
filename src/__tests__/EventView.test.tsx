import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EventView from '../components/EventView';
import type { EventViewProps } from '~/models/EventData';
import '@testing-library/jest-dom';

// Mock CSS modules
jest.mock('../styles/EventView.module.css', () => ({
  container: 'container',
  content: 'content',
  header: 'header',
  title: 'title',
  reportButton: 'reportButton',
  icon: 'icon',
  mainGrid: 'mainGrid',
  leftColumn: 'leftColumn',
  eventCard: 'eventCard',
  eventImage: 'eventImage',
  infoGrid: 'infoGrid',
  infoCard: 'infoCard',
  infoLabel: 'infoLabel',
  infoValue: 'infoValue',
  descriptionCard: 'descriptionCard',
  descriptionTitle: 'descriptionTitle',
  descriptionText: 'descriptionText',
  actionButtons: 'actionButtons',
  wishlistButton: 'wishlistButton',
  contributeButton: 'contributeButton',
  mediaCardButton: 'mediaCardButton',
  rightColumn: 'rightColumn',
  guestCard: 'guestCard',
  plannerSection: 'plannerSection',
  plannerTitleSection: 'plannerTitleSection',
  sectionTitle: 'sectionTitle',
  guestCount: 'guestCount',
  plannerCard: 'plannerCard',
  plannerImage: 'plannerImage',
  plannerName: 'plannerName',
  plannerRole: 'plannerRole',
  guestsList: 'guestsList',
  guestItem: 'guestItem',
  guestImage: 'guestImage',
  guestName: 'guestName',
  modal: 'modal',
  modalContent: 'modalContent',
  modalTitle: 'modalTitle',
  modalDescription: 'modalDescription',
  modalTextarea: 'modalTextarea',
  modalButtons: 'modalButtons',
  modalButtonSecondary: 'modalButtonSecondary',
  modalButtonPrimary: 'modalButtonPrimary',
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Clock: () => <div data-testid="clock-icon" />,
  MapPin: () => <div data-testid="mappin-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Flag: () => <div data-testid="flag-icon" />,
}));

describe('EventView', () => {
  const mockOnContribute = jest.fn();
  const mockOnViewWishlist = jest.fn();
  const mockOnMediaView = jest.fn();
  const mockOnReport = jest.fn();
  const mockOnViewProfile = jest.fn();

  const mockEventData = {
    id: 'event-123',
    title: 'Birthday Party',
    picture: 'https://example.com/event.jpg',
    date: '2024-12-25',
    location: 'Test Location',
    description: 'A fun birthday party for everyone!',
    planner: {
      id: 'planner-1',
      name: 'John Doe',
      profilePicture: 'https://example.com/planner.jpg',
      role: 'planner' as const, // Change from 'organizer' to 'planner'
    },
    guests: [
      {
        id: 'guest-1',
        name: 'Jane Smith',
        profilePicture: 'https://example.com/guest1.jpg',
        role: 'guest' as const, // Add 'as const' to ensure literal type
      },
      {
        id: 'guest-2',
        name: 'Bob Johnson',
        profilePicture: 'https://example.com/guest2.jpg',
        role: 'guest' as const, // Add 'as const' to ensure literal type
      },
    ],
  };

  const defaultProps: EventViewProps = {
    eventData: mockEventData,
    onContribute: mockOnContribute,
    onViewWishlist: mockOnViewWishlist,
    onMediaView: mockOnMediaView,
    onReport: mockOnReport,
    onViewProfile: mockOnViewProfile,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders event title and basic information', () => {
    render(<EventView {...defaultProps} />);
    
    expect(screen.getByText('Birthday Party')).toBeInTheDocument();
    expect(screen.getByText('2024-12-25')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('A fun birthday party for everyone!')).toBeInTheDocument();
  });

  test('renders event image with correct alt text', () => {
    render(<EventView {...defaultProps} />);
    
    const eventImage = screen.getByRole('img', { name: 'Birthday Party' });
    expect(eventImage).toBeInTheDocument();
    expect(eventImage).toHaveAttribute('src', 'https://example.com/event.jpg');
  });

  test('renders planner information', () => {
    render(<EventView {...defaultProps} />);
    
    expect(screen.getByText('Event Planner')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Organizer')).toBeInTheDocument();
    
    const plannerImage = screen.getByRole('img', { name: 'John Doe' });
    expect(plannerImage).toHaveAttribute('src', 'https://example.com/planner.jpg');
  });

  test('renders guest list correctly', () => {
    render(<EventView {...defaultProps} />);
    
    expect(screen.getByText('Guests')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    
    const guestImage1 = screen.getByRole('img', { name: 'Jane Smith' });
    expect(guestImage1).toHaveAttribute('src', 'https://example.com/guest1.jpg');
    
    const guestImage2 = screen.getByRole('img', { name: 'Bob Johnson' });
    expect(guestImage2).toHaveAttribute('src', 'https://example.com/guest2.jpg');
  });

  test('displays correct guest count including planner', () => {
    render(<EventView {...defaultProps} />);
    
    // Should show 3 (2 guests + 1 planner)
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('renders all action buttons', () => {
    render(<EventView {...defaultProps} />);
    
    expect(screen.getByText('View Wishlist')).toBeInTheDocument();
    expect(screen.getByText('Contribute')).toBeInTheDocument();
    expect(screen.getByText('Media')).toBeInTheDocument();
  });

  test('calls onViewWishlist when wishlist button is clicked', () => {
    render(<EventView {...defaultProps} />);
    
    fireEvent.click(screen.getByText('View Wishlist'));
    expect(mockOnViewWishlist).toHaveBeenCalledTimes(1);
  });

  test('calls onContribute when contribute button is clicked', () => {
    render(<EventView {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Contribute'));
    expect(mockOnContribute).toHaveBeenCalledTimes(1);
  });

  test('calls onMediaView when media button is clicked', () => {
    render(<EventView {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Media'));
    expect(mockOnMediaView).toHaveBeenCalledTimes(1);
  });

  test('calls onViewProfile when planner is clicked', () => {
    render(<EventView {...defaultProps} />);
    
    const plannerButton = screen.getByText('John Doe').closest('button');
    fireEvent.click(plannerButton!);
    
    expect(mockOnViewProfile).toHaveBeenCalledWith('planner-1');
  });

  test('calls onViewProfile when guest is clicked', () => {
    render(<EventView {...defaultProps} />);
    
    const guestButton = screen.getByText('Jane Smith').closest('button');
    fireEvent.click(guestButton!);
    
    expect(mockOnViewProfile).toHaveBeenCalledWith('guest-1');
  });

  test('opens report modal when report button is clicked', () => {
    render(<EventView {...defaultProps} />);
    
    const reportButton = screen.getByTitle('Report Event');
    fireEvent.click(reportButton);
    
    expect(screen.getByText('Report Event')).toBeInTheDocument();
    expect(screen.getByText("Please let us know why you're reporting this event")).toBeInTheDocument();
  });

  test('report modal is not visible initially', () => {
    render(<EventView {...defaultProps} />);
    
    expect(screen.queryByText('Report Event')).not.toBeInTheDocument();
  });

  test('closes report modal when cancel is clicked', () => {
    render(<EventView {...defaultProps} />);
    
    // Open modal
    const reportButton = screen.getByTitle('Report Event');
    fireEvent.click(reportButton);
    
    // Close modal
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(screen.queryByText('Report Event')).not.toBeInTheDocument();
  });

  test('calls onReport when report is submitted with valid reason', () => {
    render(<EventView {...defaultProps} />);
    
    // Open modal
    const reportButton = screen.getByTitle('Report Event');
    fireEvent.click(reportButton);
    
    // Enter reason
    const textarea = screen.getByPlaceholderText('Describe the issue...');
    fireEvent.change(textarea, { target: { value: 'Inappropriate content' } });
    
    // Submit report
    fireEvent.click(screen.getByText('Report'));
    
    expect(mockOnReport).toHaveBeenCalledWith('Inappropriate content');
    expect(screen.queryByText('Report Event')).not.toBeInTheDocument();
  });

  test('does not call onReport when submitting empty reason', () => {
    render(<EventView {...defaultProps} />);
    
    // Open modal
    const reportButton = screen.getByTitle('Report Event');
    fireEvent.click(reportButton);
    
    // Submit without entering reason
    fireEvent.click(screen.getByText('Report'));
    
    expect(mockOnReport).not.toHaveBeenCalled();
    expect(screen.getByText('Report Event')).toBeInTheDocument(); // Modal stays open
  });

  test('does not call onReport when submitting whitespace-only reason', () => {
    render(<EventView {...defaultProps} />);
    
    // Open modal
    const reportButton = screen.getByTitle('Report Event');
    fireEvent.click(reportButton);
    
    // Enter only whitespace
    const textarea = screen.getByPlaceholderText('Describe the issue...');
    fireEvent.change(textarea, { target: { value: '   ' } });
    
    // Submit report
    fireEvent.click(screen.getByText('Report'));
    
    expect(mockOnReport).not.toHaveBeenCalled();
    expect(screen.getByText('Report Event')).toBeInTheDocument(); // Modal stays open
  });

  test('clears textarea after successful report submission', () => {
    render(<EventView {...defaultProps} />);
    
    // Open modal
    const reportButton = screen.getByTitle('Report Event');
    fireEvent.click(reportButton);
    
    // Enter reason
    const textarea = screen.getByPlaceholderText('Describe the issue...');
    fireEvent.change(textarea, { target: { value: 'Test reason' } });
    
    // Submit report
    fireEvent.click(screen.getByText('Report'));
    
    // Reopen modal to check if textarea is cleared
    fireEvent.click(reportButton);
    const newTextarea = screen.getByPlaceholderText('Describe the issue...');
    expect(newTextarea).toHaveValue('');
  });

  test('renders all required icons', () => {
    render(<EventView {...defaultProps} />);
    
    expect(screen.getByTestId('clock-icon')).toBeInTheDocument();
    expect(screen.getByTestId('mappin-icon')).toBeInTheDocument();
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    expect(screen.getByTestId('flag-icon')).toBeInTheDocument();
  });

  test('renders Date and Location labels', () => {
    render(<EventView {...defaultProps} />);
    
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  test('handles optional onReport prop', () => {
    const propsWithoutOnReport = {
      ...defaultProps,
      onReport: undefined,
    };
    
    render(<EventView {...propsWithoutOnReport} />);
    
    // Open modal
    const reportButton = screen.getByTitle('Report Event');
    fireEvent.click(reportButton);
    
    // Enter reason and submit - should not crash
    const textarea = screen.getByPlaceholderText('Describe the issue...');
    fireEvent.change(textarea, { target: { value: 'Test reason' } });
    fireEvent.click(screen.getByText('Report'));
    
    // Modal should close without error
    expect(screen.queryByText('Report Event')).not.toBeInTheDocument();
  });

  test('handles optional onViewProfile prop', () => {
    const propsWithoutOnViewProfile = {
      ...defaultProps,
      onViewProfile: undefined,
    };
    
    render(<EventView {...propsWithoutOnViewProfile} />);
    
    // Should render without errors
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    
    // Clicking should not crash
    const plannerButton = screen.getByText('John Doe').closest('button');
    fireEvent.click(plannerButton!);
    
    const guestButton = screen.getByText('Jane Smith').closest('button');
    fireEvent.click(guestButton!);
  });
});