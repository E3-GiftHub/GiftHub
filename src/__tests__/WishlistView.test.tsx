import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WishlistView from '../components/WishlistView';
import '@testing-library/jest-dom';

jest.mock('../styles/wishlistcomponent.module.css', () => ({
  container: 'container',
  wishlistContainer: 'wishlistContainer',
  title: 'title',
  itemsContainer: 'itemsContainer',
  itemsGrid: 'itemsGrid',
  itemCard: 'itemCard',
  itemImage: 'itemImage',
  actualItemImage: 'actualItemImage',
  contributionOverlay: 'contributionOverlay',
  contributionText: 'contributionText',
  contributionProgress: 'contributionProgress',
  contributionBar: 'contributionBar',
  contributionAmount: 'contributionAmount',
  itemDetails: 'itemDetails',
  itemName: 'itemName',
  itemPrice: 'itemPrice',
  buttonsContainer: 'buttonsContainer',
  actionButtonsRow: 'actionButtonsRow',
  contributeButton: 'contributeButton',
  externalButton: 'externalButton',
  buttonPressed: 'buttonPressed',
  loadingContainer: 'loadingContainer',
  spinner: 'spinner',
  deleteButton: 'deleteButton',
}));

// Mock Next.js router
const mockPush = jest.fn();
const mockRouter = {
  isReady: true,
  query: { eventId: '123' },
  push: mockPush,
};

jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

// Mock TRPC API
const mockRefetch = jest.fn();
const mockSetMark = jest.fn();
const mockDeleteItem = jest.fn();

// Updated mock structure to match the component
jest.mock('~/trpc/react', () => ({
  api: {
    user: {
      get: { // Changed from getSelf to get
        useQuery: jest.fn(),
      },
    },
    item: {
      getAll: {
        useQuery: jest.fn(),
      },
      setMark: {
        useMutation: jest.fn(),
      },
      deleteItem: { // Added missing deleteItem mock
        useMutation: jest.fn(),
      },
    },
    event: {
      getById: {
        useQuery: jest.fn(),
      },
    },
    invitationPreview: {
      getInvitationForUserEvent: {
        useQuery: jest.fn(),
      },
      getPlanner: { // Added missing getPlanner mock
        useQuery: jest.fn(),
      },
    },
  },
}));

// Mock NotInvited component
jest.mock('~/components/notinvited', () => {
  return function MockNotInvited() {
    return <div data-testid="not-invited">Not Invited Component</div>;
  };
});

import { api } from '~/trpc/react';

const mockApiUser = api.user.get.useQuery as jest.Mock;
const mockApiItem = api.item.getAll.useQuery as jest.Mock;
const mockApiEvent = api.event.getById.useQuery as jest.Mock;
const mockApiInvitation = api.invitationPreview.getInvitationForUserEvent.useQuery as jest.Mock;
const mockApiPlanner = api.invitationPreview.getPlanner.useQuery as jest.Mock;
const mockApiSetMark = api.item.setMark.useMutation as jest.Mock;
const mockApiDeleteItem = api.item.deleteItem.useMutation as jest.Mock;

interface MockRouter {
  isReady: boolean;
  query: Record<string, string | string[] | undefined>;
  push: jest.Mock;
}

describe('WishlistView', () => {
  const mockContribution = jest.fn();

  const defaultProps = {
    contribution: mockContribution,
    eventId: '123',
  };

  const mockCurrentUser = {
    username: 'testuser',
  };

  const mockEventData = {
    id: 123,
    title: 'Test Event',
  };

  const mockPlannerData = {
    createdByUsername: 'planner',
  };

  const mockTrendingItems = [
    {
      id: 1,
      nume: 'Test Item 1',
      pret: 100,
      imageUrl: 'https://example.com/item1.jpg',
      state: 'none',
      transferCompleted: false,
      contribution: null,
    },
    {
      id: 2,
      nume: 'Test Item 2',
      pret: 200,
      imageUrl: 'https://example.com/item2.jpg',
      state: 'contributing',
      transferCompleted: false,
      contribution: {
        current: 150,
        total: 200,
      },
    },
    {
      id: 3,
      nume: 'Test Item 3',
      pret: 50,
      imageUrl: 'https://example.com/item3.jpg',
      state: 'external',
      transferCompleted: true,
      contribution: null,
    },
  ];

  const mockInvitationData = {
    status: 'ACCEPTED',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (mockRouter as MockRouter).isReady = true;
    (mockRouter as MockRouter).query = { eventId: '123' };

    mockApiUser.mockReturnValue({
      data: mockCurrentUser,
      isLoading: false,
    });

    mockApiItem.mockReturnValue({
      data: mockTrendingItems,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });

    mockApiEvent.mockReturnValue({
      data: mockEventData,
      isLoading: false,
    });

    mockApiInvitation.mockReturnValue({
      data: mockInvitationData,
      isLoading: false,
    });

    mockApiPlanner.mockReturnValue({
      data: mockPlannerData,
      isLoading: false,
    });

    mockApiSetMark.mockReturnValue({
      mutate: mockSetMark,
      status: 'idle',
    });

    mockApiDeleteItem.mockReturnValue({
      mutate: mockDeleteItem,
    });
  });

  test('renders loading spinner when router is not ready', () => {
    (mockRouter as MockRouter).isReady = false;

    render(<WishlistView {...defaultProps} />);

    const loadingContainer = document.querySelector('.loadingContainer');
    expect(loadingContainer).toBeInTheDocument();
  });

  test('renders loading spinner when user is loading', () => {
    mockApiUser.mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<WishlistView {...defaultProps} />);

    const loadingContainer = document.querySelector('.loadingContainer');
    expect(loadingContainer).toBeInTheDocument();
  });

  test('renders loading spinner when items are loading', () => {
    mockApiItem.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      refetch: mockRefetch,
    });

    render(<WishlistView {...defaultProps} />);

    const loadingContainer = document.querySelector('.loadingContainer');
    expect(loadingContainer).toBeInTheDocument();
  });

  test('renders "No event ID provided" when eventId is missing from both props and router', () => {
    (mockRouter as MockRouter).query = {}; 
    (mockRouter as MockRouter).isReady = true;
    
    const propsWithoutEventId = { contribution: mockContribution };
    render(<WishlistView {...propsWithoutEventId} eventId="" />);

    expect(screen.getByText('No event ID provided')).toBeInTheDocument();
  });

  test('renders "Event not found" when event data is null and not loading', () => {
    mockApiEvent.mockReturnValue({
      data: null,
      isLoading: false,
    });

    render(<WishlistView {...defaultProps} />);

    expect(screen.getByText('Event not found')).toBeInTheDocument();
  });

  test('renders NotInvited component when user is not invited', () => {
    mockApiInvitation.mockReturnValue({
      data: { status: 'PENDING' },
      isLoading: false,
    });

    render(<WishlistView {...defaultProps} />);

    expect(screen.getByTestId('not-invited')).toBeInTheDocument();
  });

  test('renders NotInvited component when invitation data is null and user is not planner', () => {
    mockApiInvitation.mockReturnValue({
      data: null,
      isLoading: false,
    });

    // User is not the planner
    mockApiPlanner.mockReturnValue({
      data: { createdByUsername: 'differentuser' },
      isLoading: false,
    });

    render(<WishlistView {...defaultProps} />);

    expect(screen.getByTestId('not-invited')).toBeInTheDocument();
  });

  test('renders "Failed to load items" when there is an error', () => {
    mockApiItem.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });

    render(<WishlistView {...defaultProps} />);

    expect(screen.getByText('Failed to load items.')).toBeInTheDocument();
  });

  test('renders wishlist with event title', () => {
    render(<WishlistView {...defaultProps} />);

    expect(screen.getByText('Wishlist View for Test Event')).toBeInTheDocument();
  });

  test('renders wishlist with eventId when event is loading', () => {
    mockApiEvent.mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<WishlistView {...defaultProps} />);

    const loadingContainer = document.querySelector('.loadingContainer');
    expect(loadingContainer).toBeInTheDocument();
  });

  test('renders all items in the grid', () => {
    render(<WishlistView {...defaultProps} />);

    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    expect(screen.getByText('Test Item 3')).toBeInTheDocument();
  });

  test('displays item images with correct alt text', () => {
    render(<WishlistView {...defaultProps} />);

    const image1 = screen.getByRole('img', { name: 'Test Item 1' });
    expect(image1).toBeInTheDocument();

    const image2 = screen.getByRole('img', { name: 'Test Item 2' });
    expect(image2).toBeInTheDocument();

    const image3 = screen.getByRole('img', { name: 'Test Item 3' });
    expect(image3).toBeInTheDocument();
  });

  test('displays contribution overlay for items with contributions', () => {
    render(<WishlistView {...defaultProps} />);

    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  test('displays item prices correctly', () => {
    render(<WishlistView {...defaultProps} />);

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  test('renders contribute buttons for all items', () => {
    render(<WishlistView {...defaultProps} />);

    const contributeButtons = screen.getAllByText('Contribute');
    expect(contributeButtons).toHaveLength(3);
  });

  test('renders mark bought buttons for all items', () => {
    render(<WishlistView {...defaultProps} />);

    const markBoughtButtons = screen.getAllByText('Mark Bought');
    const boughtButtons = screen.getAllByText('Bought');
    
    expect(markBoughtButtons).toHaveLength(2);
    expect(boughtButtons).toHaveLength(1);
  });

  test('calls contribution function when contribute button is clicked', () => {
    // Use a single item to avoid multiple button issue
    const singleItem = [
      {
        id: 1,
        nume: 'Test Item 1',
        pret: 100,
        imageUrl: 'https://example.com/item1.jpg',
        state: 'none',
        transferCompleted: false,
        contribution: null,
      },
    ];

    mockApiItem.mockReturnValue({
      data: singleItem,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });

    render(<WishlistView {...defaultProps} />);

    const contributeButton = screen.getByText('Contribute');
    fireEvent.click(contributeButton);
    expect(mockContribution).toHaveBeenCalledWith(1);
  });

  test('calls setMark mutation when mark bought button is clicked', () => {
    // Use a single item to avoid multiple button issue
    const singleItem = [
      {
        id: 1,
        nume: 'Test Item 1',
        pret: 100,
        imageUrl: 'https://example.com/item1.jpg',
        state: 'none',
        transferCompleted: false,
        contribution: null,
      },
    ];

    mockApiItem.mockReturnValue({
      data: singleItem,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });

    render(<WishlistView {...defaultProps} />);

    const markBoughtButton = screen.getByText('Mark Bought');
    fireEvent.click(markBoughtButton);

    expect(mockSetMark).toHaveBeenCalledWith(
      {
        eventId: 123,
        articleId: 1,
        username: 'testuser',
        type: 'external',
      },
      expect.objectContaining({
        onError: expect.any(Function) as () => void,
      })
    );
  });

  test('toggles item state when mark bought button is clicked for already marked item', () => {
    render(<WishlistView {...defaultProps} />);

    const boughtButton = screen.getByText('Bought');
    fireEvent.click(boughtButton);

    expect(mockSetMark).toHaveBeenCalledWith(
      {
        eventId: 123,
        articleId: 3,
        username: 'testuser',
        type: 'none',
      },
      expect.objectContaining({
        onError: expect.any(Function) as () => void,
      })
    );
  });

  test('handles array eventId from router query', () => {
    (mockRouter as MockRouter).query = { eventId: ['123', '456'] };

    render(<WishlistView contribution={mockContribution} />);

    expect(screen.getByText('Wishlist View for Test Event')).toBeInTheDocument();
  });

  test('adds transferCompleted property to items that lack it', () => {
    const itemsWithoutTransferCompleted = [
      {
        id: 1,
        nume: 'Test Item',
        pret: 100,
        imageUrl: 'https://example.com/item.jpg',
        state: 'none',
        contribution: null,
      },
    ];

    mockApiItem.mockReturnValue({
      data: itemsWithoutTransferCompleted,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });

    render(<WishlistView {...defaultProps} />);

    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  test('shows delete button for planner', () => {
    // Make current user the planner
    mockApiPlanner.mockReturnValue({
      data: { createdByUsername: 'testuser' },
      isLoading: false,
    });

    render(<WishlistView {...defaultProps} />);

    const deleteButtons = screen.getAllByText('❌');
    expect(deleteButtons).toHaveLength(3); // One for each item
  });

  test('does not show delete button for non-planner', () => {
    // Make current user NOT the planner
    mockApiPlanner.mockReturnValue({
      data: { createdByUsername: 'differentuser' },
      isLoading: false,
    });

    render(<WishlistView {...defaultProps} />);

    const deleteButtons = screen.queryAllByText('❌');
    expect(deleteButtons).toHaveLength(0);
  });

  test('allows planner to access wishlist when invitation is null', () => {
    // User is the planner
    mockApiPlanner.mockReturnValue({
      data: { createdByUsername: 'testuser' },
      isLoading: false,
    });

    // No invitation data (null)
    mockApiInvitation.mockReturnValue({
      data: null,
      isLoading: false,
    });

    render(<WishlistView {...defaultProps} />);

    // Should render the wishlist, not NotInvited
    expect(screen.getByText('Wishlist View for Test Event')).toBeInTheDocument();
    expect(screen.queryByTestId('not-invited')).not.toBeInTheDocument();
  });

  test('calls contribution function for specific item using container query', () => {
    render(<WishlistView {...defaultProps} />);

    // Find the first item card and click its contribute button
    const itemCards = screen.getAllByText('Test Item 1')[0]?.closest('.itemCard');
    expect(itemCards).toBeInTheDocument();
    
    if (itemCards) {
      const contributeButton = itemCards.querySelector('.contributeButton');
      expect(contributeButton).toBeInTheDocument();
      
      if (contributeButton) {
        fireEvent.click(contributeButton);
        expect(mockContribution).toHaveBeenCalledWith(1);
      }
    }
  });

  test('calls setMark mutation for specific item using container query', () => {
    render(<WishlistView {...defaultProps} />);

    // Find the first item card and click its mark bought button
    const itemCards = screen.getAllByText('Test Item 1')[0]?.closest('.itemCard');
    expect(itemCards).toBeInTheDocument();
    
    if (itemCards) {
      const markBoughtButton = itemCards.querySelector('.externalButton');
      expect(markBoughtButton).toBeInTheDocument();
      
      if (markBoughtButton) {
        fireEvent.click(markBoughtButton);
        expect(mockSetMark).toHaveBeenCalledWith(
          {
            eventId: 123,
            articleId: 1,
            username: 'testuser',
            type: 'external',
          },
          expect.objectContaining({
            onError: expect.any(Function) as () => void,
          })
        );
      }
    }
  });
});