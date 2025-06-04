import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockGetSelf = jest.fn();
const mockGetInvitationById = jest.fn();
const mockAcceptInvitation = jest.fn();

jest.mock('~/trpc/react', () => ({
  api: {
    user: {
      getSelf: {
        useQuery: () => mockGetSelf(),
      },
    },
    invitationPreview: {
      getInvitationById: {
        useQuery: () => mockGetInvitationById(),
      },
      acceptInvitation: {
        useMutation: () => ({
          mutate: mockAcceptInvitation,
        }),
      },
    },
  },
}));

jest.mock('../styles/invitationcard.module.css', () => ({
  envelope: 'envelope',
  envelopeBack: 'envelopeBack',
  card: 'card',
  cardContent: 'cardContent',
  title: 'title',
  details: 'details',
  detailItem: 'detailItem',
  icon: 'icon',
  description: 'description',
  actions: 'actions',
  flap: 'flap',
  flapTop: 'flapTop',
  flapLeft: 'flapLeft',
  flapRight: 'flapRight',
}));


jest.mock('~/components/notinvited', () => {
  return function MockNotInvited() {
    return <div data-testid="not-invited">Not Invited Component</div>;
  };
});

jest.mock('~/components/loadingspinner', () => {
  return function MockLoadingSpinner() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

jest.mock('~/components/ui/ButtonComponent', () => ({
  ButtonComponent: ({ text, onClick }: any) => (
    <button onClick={onClick} data-testid={`button-${text.toLowerCase().replace(/\s+/g, '-')}`}>
      {text}
    </button>
  ),
  ButtonStyle: {
    PRIMARY: 'primary',
  },
}));

// Mock models
jest.mock('../models/InvitationEventGuest.ts', () => {});

// Import the component after mocks
import InvitationCard from '~/components/InvitationCard';

describe('InvitationCard', () => {
  const mockInvitationData = {
    id: 1,
    status: 'PENDING',
    guestUsername: 'testuser',
    event: {
      id: 123,
      title: 'Test Event',
      date: new Date('2024-12-25T18:00:00Z'),
      location: 'Test Location',
      description: 'Test Description',
    },
  };

  const mockCurrentUser = {
    id: 1,
    username: 'testuser',
  };

  const defaultProps = {
    invitationId: 1,
    onAccept: jest.fn(),
    onDecline: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks
    mockGetSelf.mockReturnValue({
      data: mockCurrentUser,
    });
    
    mockGetInvitationById.mockReturnValue({
      data: mockInvitationData,
      isLoading: false,
    });
  });

  test('shows loading spinner when invitation is loading', () => {
    mockGetInvitationById.mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<InvitationCard {...defaultProps} />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('shows not invited component when invitation data is null', () => {
    mockGetInvitationById.mockReturnValue({
      data: null,
      isLoading: false,
    });

    render(<InvitationCard {...defaultProps} />);
    
    expect(screen.getByTestId('not-invited')).toBeInTheDocument();
  });

  test('shows not invited component when invitation is already accepted', () => {
    mockGetInvitationById.mockReturnValue({
      data: { ...mockInvitationData, status: 'ACCEPTED' },
      isLoading: false,
    });

    render(<InvitationCard {...defaultProps} />);
    
    expect(screen.getByTestId('not-invited')).toBeInTheDocument();
  });

  test('shows not invited component when user is not the invited guest', () => {
    mockGetSelf.mockReturnValue({
      data: { ...mockCurrentUser, username: 'differentuser' },
    });

    render(<InvitationCard {...defaultProps} />);
    
    expect(screen.getByTestId('not-invited')).toBeInTheDocument();
  });

  test('renders invitation card with event details', () => {
    render(<InvitationCard {...defaultProps} />);
    
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('📅')).toBeInTheDocument();
    expect(screen.getByText('📍')).toBeInTheDocument();
  });

  test('renders accept and decline buttons', () => {
    render(<InvitationCard {...defaultProps} />);
    
    expect(screen.getByTestId('button-accept-invite')).toBeInTheDocument();
    expect(screen.getByTestId('button-decline-invite')).toBeInTheDocument();
  });

  test('calls onDecline when decline button is clicked', () => {
    const mockOnDecline = jest.fn();
    
    render(<InvitationCard {...defaultProps} onDecline={mockOnDecline} />);
    
    fireEvent.click(screen.getByTestId('button-decline-invite'));
    
    expect(mockOnDecline).toHaveBeenCalled();
  });

  test('calls accept invitation mutation when accept button is clicked', () => {
    const mockOnAccept = jest.fn();
    
    render(<InvitationCard {...defaultProps} onAccept={mockOnAccept} />);
    
    fireEvent.click(screen.getByTestId('button-accept-invite'));
    
    expect(mockAcceptInvitation).toHaveBeenCalledWith(
      { eventId: 123, guestUsername: 'testuser' },
      expect.objectContaining({
        onSuccess: expect.any(Function),
      })
    );
    expect(mockOnAccept).toHaveBeenCalled();
  });

  test('navigates to event page on successful acceptance', async () => {
    let onSuccessCallback: (() => void) | undefined;
    
    mockAcceptInvitation.mockImplementation((_, { onSuccess }) => {
      onSuccessCallback = onSuccess;
    });

    render(<InvitationCard {...defaultProps} />);
    
    fireEvent.click(screen.getByTestId('button-accept-invite'));
    
    // Simulate successful mutation
    if (onSuccessCallback) {
      onSuccessCallback();
    }

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/event?id=123');
    });
  });

  test('shows loading text when event is loading', () => {
    mockGetInvitationById.mockReturnValue({
      data: mockInvitationData,
      isLoading: true,
    });

    render(<InvitationCard {...defaultProps} />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('formats date correctly', () => {
    render(<InvitationCard {...defaultProps} />);
    
    const formattedDate = new Date('2024-12-25T18:00:00Z').toLocaleString();
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });

  test('does not call accept mutation when event data is missing', () => {
    mockGetInvitationById.mockReturnValue({
      data: { ...mockInvitationData, event: null },
      isLoading: false,
    });

    render(<InvitationCard {...defaultProps} />);
    
    fireEvent.click(screen.getByTestId('button-accept-invite'));
    
    expect(mockAcceptInvitation).not.toHaveBeenCalled();
  });
});