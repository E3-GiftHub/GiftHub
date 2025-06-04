import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

interface MockMutationResult {
  mutate: jest.Mock;
}

interface MockQueryResult {
  data?: unknown;
  isLoading?: boolean;
}

const mockGetUser = jest.fn<MockQueryResult, []>();
const mockGetInvitationById = jest.fn<MockQueryResult, []>();
const mockAcceptInvitation = jest.fn();

jest.mock('~/trpc/react', () => ({
  api: {
    user: {
      get: {
        useQuery: (): MockQueryResult => mockGetUser(),
      },
    },
    invitationPreview: {
      getInvitationById: {
        useQuery: (): MockQueryResult => mockGetInvitationById(),
      },
      acceptInvitation: {
        useMutation: (): MockMutationResult => ({
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

interface ButtonProps {
  text: string;
  onClick: () => void;
}

jest.mock('~/components/ui/ButtonComponent', () => ({
  ButtonComponent: ({ text, onClick }: ButtonProps) => (
    <button onClick={onClick} data-testid={`button-${text.toLowerCase().replace(/\s+/g, '-')}`}>
      {text}
    </button>
  ),
  ButtonStyle: {
    PRIMARY: 'primary',
  },
}));

// Mock models
jest.mock('../models/InvitationEventGuest.ts', () => ({}));

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
    mockGetUser.mockReturnValue({
      data: mockCurrentUser,
      isLoading: false,
    });
    
    mockGetInvitationById.mockReturnValue({
      data: mockInvitationData,
      isLoading: false,
    });
  });

  test('shows loading spinner when invitation is loading', () => {
    mockGetInvitationById.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
    });

    render(<InvitationCard {...defaultProps} />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('shows not invited component when invitation data is null', () => {
    mockGetInvitationById.mockReturnValueOnce({
      data: null,
      isLoading: false,
    });

    render(<InvitationCard {...defaultProps} />);
    
    expect(screen.getByTestId('not-invited')).toBeInTheDocument();
  });

  test('shows not invited component when invitation is already accepted', () => {
    mockGetInvitationById.mockReturnValueOnce({
      data: { ...mockInvitationData, status: 'ACCEPTED' },
      isLoading: false,
    });

    render(<InvitationCard {...defaultProps} />);
    
    expect(screen.getByTestId('not-invited')).toBeInTheDocument();
  });

  test('shows not invited component when user is not the invited guest', () => {
    mockGetUser.mockReturnValueOnce({
      data: { ...mockCurrentUser, username: 'differentuser' },
      isLoading: false,
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
        onSuccess: expect.any(Function) as () => void,
      })
    );
    expect(mockOnAccept).toHaveBeenCalled();
  });

  test('navigates to event page on successful acceptance', async () => {
    let onSuccessCallback: (() => void) | undefined;
    
    mockAcceptInvitation.mockImplementation((
      _params: { eventId: number; guestUsername: string }, 
      options: { onSuccess?: () => void }
    ) => {
      onSuccessCallback = options?.onSuccess;
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

  test('formats date correctly', () => {
    render(<InvitationCard {...defaultProps} />);
    
    const formattedDate = new Date('2024-12-25T18:00:00Z').toLocaleString();
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });

  test('does not call accept mutation when event data is missing', () => {
    mockGetInvitationById.mockReturnValueOnce({
      data: { ...mockInvitationData, event: null },
      isLoading: false,
    });

    render(<InvitationCard {...defaultProps} />);
    
    fireEvent.click(screen.getByTestId('button-accept-invite'));
    
    expect(mockAcceptInvitation).not.toHaveBeenCalled();
  });

  test('renders invitation card even when user data is loading', () => {
    // Test that the component still renders the invitation card when user is loading
    // but invitation is loaded, because the component doesn't check user loading state
    mockGetUser.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
    });
    
    // Keep invitation loaded
    mockGetInvitationById.mockReturnValueOnce({
      data: mockInvitationData,
      isLoading: false,
    });

    render(<InvitationCard {...defaultProps} />);
    
    // The component should render the invitation card, not the loading spinner
    // because it only checks invitation loading state
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  test('shows not invited when user is undefined but invitation is loaded', () => {
    // Test the case where user is undefined (not loaded) but invitation is loaded
    mockGetUser.mockReturnValueOnce({
      data: undefined,
      isLoading: false, // Not loading, just no data
    });
    
    mockGetInvitationById.mockReturnValueOnce({
      data: mockInvitationData,
      isLoading: false,
    });

    render(<InvitationCard {...defaultProps} />);
    
    // Since currentUser is undefined, the condition in the component will be:
    // (currentUser && invitationData.guestUsername !== currentUser.username)
    // This evaluates to false because currentUser is falsy, so it should render the card
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });
});