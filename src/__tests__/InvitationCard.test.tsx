import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockReload = jest.fn();

// Complete NextRouter mock
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    reload: mockReload,
    pathname: '/',
    route: '/',
    asPath: '/',
    query: {},
    isReady: true,
    isFallback: false,
    basePath: '',
    locale: undefined,
    locales: undefined,
    defaultLocale: undefined,
    isLocaleDomain: false,
    isPreview: false,
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    beforePopState: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
  }),
}));

interface MockMutationResult {
  mutate: jest.Mock;
  status?: string;
}

interface MockQueryResult {
  data?: unknown;
  isLoading?: boolean;
}

interface InvitationMutationParams {
  eventId: number;
  guestUsername: string;
}

interface MutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const mockGetUser = jest.fn<MockQueryResult, []>();
const mockGetInvitationById = jest.fn<MockQueryResult, []>();
const mockAcceptInvitation = jest.fn();
const mockDeclineInvitation = jest.fn();

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
          status: 'idle',
        }),
      },
      declineInvitation: {
        useMutation: (): MockMutationResult => ({
          mutate: mockDeclineInvitation,
          status: 'idle',
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
  const MockNotInvited = () => <div data-testid="not-invited">Not Invited Component</div>;
  MockNotInvited.displayName = 'NotInvited';
  return MockNotInvited;
});

jest.mock('~/components/loadingspinner', () => {
  const MockLoadingSpinner = () => <div data-testid="loading-spinner">Loading...</div>;
  MockLoadingSpinner.displayName = 'LoadingSpinner';
  return MockLoadingSpinner;
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

  test('decline button exists and can be clicked', () => {
    render(<InvitationCard {...defaultProps} />);
    
    const declineButton = screen.getByTestId('button-decline-invite');
    expect(declineButton).toBeInTheDocument();
    
    // Just test that clicking doesn't throw an error
    fireEvent.click(declineButton);
  });

  test('calls accept invitation mutation when accept button is clicked', () => {
    render(<InvitationCard {...defaultProps} />);
    
    fireEvent.click(screen.getByTestId('button-accept-invite'));
    
    expect(mockAcceptInvitation).toHaveBeenCalled();
  });

  test('navigates to event page on successful acceptance', async () => {
    let onSuccessCallback: (() => void) | undefined;
    
    mockAcceptInvitation.mockImplementation((
      params: InvitationMutationParams, 
      options: MutationOptions
    ) => {
      onSuccessCallback = options?.onSuccess;
    });

    render(<InvitationCard {...defaultProps} />);
    
    fireEvent.click(screen.getByTestId('button-accept-invite'));
    
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
    mockGetUser.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
    });
    
    mockGetInvitationById.mockReturnValueOnce({
      data: mockInvitationData,
      isLoading: false,
    });

    render(<InvitationCard {...defaultProps} />);
    
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  test('shows invitation card when user is undefined but invitation is loaded', () => {
    mockGetUser.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
    });
    
    mockGetInvitationById.mockReturnValueOnce({
      data: mockInvitationData,
      isLoading: false,
    });

    render(<InvitationCard {...defaultProps} />);
    
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  test('calls decline invitation mutation when decline button is clicked', () => {
    // Mock window.confirm to return true
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);

    render(<InvitationCard {...defaultProps} />);
    
    fireEvent.click(screen.getByTestId('button-decline-invite'));
    
    expect(mockDeclineInvitation).toHaveBeenCalled();

    // Restore original confirm
    window.confirm = originalConfirm;
  });

  test('does not call decline mutation when user cancels confirmation', () => {
    // Mock window.confirm to return false
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => false);

    render(<InvitationCard {...defaultProps} />);
    
    fireEvent.click(screen.getByTestId('button-decline-invite'));
    
    expect(mockDeclineInvitation).not.toHaveBeenCalled();

    // Restore original confirm
    window.confirm = originalConfirm;
  });
});