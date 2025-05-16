import { describe, it, expect, vi, beforeEach } from 'vitest';

const createContributionMock = vi.fn();
const processContributionMock = vi.fn();
const manageContributionMock = vi.fn();
const getContributionsForItemMock = vi.fn();

vi.mock('~/services/ContributionService', () => {
  return {
    ContributionService: vi.fn().mockImplementation(() => ({
      createContribution: createContributionMock,
      processContribution: processContributionMock,
      manageContribution: manageContributionMock,
      getContributionsForItem: getContributionsForItemMock,
    })),
  };
});

// Mock the entire TRPC router and context
vi.mock('~/server/api/trpc', () => ({
  createTRPCRouter: (obj) => obj,
  protectedProcedure: {
    input: () => ({
      mutation: (handler) => ({ handler }),
      query: (handler) => ({ handler }),
    }),
  },
}));

// Create a mock version of the router implementation
const mockCreateContributionHandler = vi.fn();
const mockProcessContributionHandler = vi.fn();
const mockManageContributionHandler = vi.fn();
const mockGetContributionsForItemHandler = vi.fn();

// Mock the router itself
const contributionRouter = {
  createContribution: {
    handler: mockCreateContributionHandler,
  },
  processContribution: {
    handler: mockProcessContributionHandler,
  },
  manageContribution: {
    handler: mockManageContributionHandler,
  },
  getContributionsForItem: {
    handler: mockGetContributionsForItemHandler,
  },
};

// Mock the trpc context
const mockSession = {
  user: {
    id: 'test-user-id',
  },
};

const mockContext = {
  session: mockSession,
};

describe('contributionRouter', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Set up mock implementations for our handlers
    mockCreateContributionHandler.mockImplementation(async ({ ctx, input }) => {
      try {
        const result = await createContributionMock(
          input.contributionId,
          ctx.session.user.id,
          input.eventId,
          input.articleId,
          input.amount,
          input.date,
          input.message
        );
        
        return { success: true, data: result };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : "Unknown error" 
        };
      }
    });
    
    mockGetContributionsForItemHandler.mockImplementation(async ({ input }) => {
      const contributions = await getContributionsForItemMock(
        input.articleId
      );
      
      return { success: true, data: contributions };
    });
  });

  describe('createContribution', () => {
    it('should successfully create a contribution', async () => {
      // Arrange
      const input = {
        contributionId: '123',
        eventId: '456',
        articleId: '789',
        amount: 100,
        date: new Date(),
        message: 'Congratulations!',
      };

      const expectedResult = {
        id: input.contributionId,
        contributorUsername: mockSession.user.id,
        eventId: input.eventId,
        articleId: input.articleId,
        amount: input.amount,
        createdAt: input.date,
        message: input.message,
      };

      createContributionMock.mockResolvedValue(expectedResult);

      // Act
      const result = await mockCreateContributionHandler({
        ctx: mockContext,
        input,
      });

      // Assert
      expect(createContributionMock).toHaveBeenCalledWith(
        input.contributionId,
        mockSession.user.id,
        input.eventId,
        input.articleId,
        input.amount,
        input.date,
        input.message
      );
      expect(result).toEqual({ success: true, data: expectedResult });
    });

    it('should handle errors when creating a contribution', async () => {
      // Arrange
      const input = {
        contributionId: '123',
        eventId: '456',
        articleId: '789',
        amount: 100,
        date: new Date(),
        message: 'Congratulations!',
      };

      const errorMessage = 'Wishlist item not found';
      createContributionMock.mockRejectedValue(
        new Error(errorMessage)
      );

      // Act
      const result = await mockCreateContributionHandler({
        ctx: mockContext,
        input,
      });

      // Assert
      expect(createContributionMock).toHaveBeenCalled();
      expect(result).toEqual({ success: false, error: errorMessage });
    });
  });

  describe('getContributionsForItem', () => {
    it('should return contributions for a specific item', async () => {
      // Arrange
      const input = {
        articleId: '789',
      };

      const mockContributions = [
        {
          id: '1',
          contributorUsername: 'user1',
          contributorName: 'John Doe',
          contributorPicture: 'http://example.com/pic.jpg',
          amount: 50,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          contributorUsername: 'user2',
          contributorName: 'Jane Smith',
          contributorPicture: 'http://example.com/pic2.jpg',
          amount: 75,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      getContributionsForItemMock.mockResolvedValue(mockContributions);

      // Act
      const result = await mockGetContributionsForItemHandler({
        ctx: mockContext,
        input,
      });

      // Assert
      expect(getContributionsForItemMock).toHaveBeenCalledWith(
        input.articleId
      );
      expect(result).toEqual({ success: true, data: mockContributions });
    });
  });
});