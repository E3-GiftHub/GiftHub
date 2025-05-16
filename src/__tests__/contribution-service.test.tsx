import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContributionService } from '~/services/ContributionService';
import { db } from '~/server/db';
import { EventManagementException } from '~/services/EventManagementException';

// Mock Prisma client
vi.mock('~/server/db', () => ({
  db: {
    itemCatalogue: {
      findUnique: vi.fn(),
    },
    eventArticle: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    contribution: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('ContributionService', () => {
  let contributionService: ContributionService;

  beforeEach(() => {
    contributionService = new ContributionService();
    vi.clearAllMocks();
  });

  describe('createContribution', () => {
    it('should successfully create a contribution', async () => {
      // Arrange
      const contributionId = '123';
      const contributorUsername = 'user123';
      const eventId = '456';
      const articleId = '789';
      const amount = 100;
      const date = new Date();
      const message = 'Congratulations!';

      // Set up the mock data
      const mockItem = {
        id: 789,
        name: 'Test Item',
        price: { toNumber: () => 200 },
      };

      const mockEventItem = {
        eventId: 456,
        itemId: 789,
        quantityRequested: 1,
        quantityFulfilled: 0,
      };

      const mockContribution = {
        id: 123,
        contributorUsername,
        eventId: 456,
        articleId: 789,
        cashAmount: { toNumber: () => amount },
        createdAt: date,
        updatedAt: date,
      };

      // Set up the mock implementations
      vi.mocked(db.itemCatalogue.findUnique).mockResolvedValue(mockItem as any);
      vi.mocked(db.eventArticle.findFirst).mockResolvedValue(mockEventItem as any);
      vi.mocked(db.contribution.create).mockResolvedValue(mockContribution as any);

      // Act
      const result = await contributionService.createContribution(
        contributionId,
        contributorUsername,
        eventId,
        articleId,
        amount,
        date,
        message
      );

      // Assert
      expect(db.itemCatalogue.findUnique).toHaveBeenCalledWith({
        where: { id: 789 },
      });
      expect(db.eventArticle.findFirst).toHaveBeenCalledWith({
        where: { itemId: 789, eventId: 456 },
      });
      expect(db.contribution.create).toHaveBeenCalledWith({
        data: {
          id: 123,
          contributorUsername,
          eventId: 456,
          articleId: 789,
          cashAmount: amount,
          createdAt: date,
          updatedAt: date,
        },
      });
      expect(result).toEqual({
        id: contributionId,
        contributorUsername,
        eventId,
        articleId,
        amount,
        createdAt: date,
        message,
      });
    });

    it('should throw an error if the wishlist item is not found', async () => {
      // Arrange
      vi.mocked(db.itemCatalogue.findUnique).mockResolvedValue(null);

      // Act & Assert
      await expect(
        contributionService.createContribution(
          '123',
          'user123',
          '456',
          '789',
          100
        )
      ).rejects.toThrow(new EventManagementException('Wishlist item not found'));
    });
  });

  describe('processContribution', () => {
    it('should mark an item as fulfilled when total contributions reach the price', async () => {
      // Arrange
      const contributionId = '123';
      const articleId = '789';
      
      const mockContribution = {
        id: 123,
        contributorUsername: 'user123',
        eventId: 456,
        articleId: 789,
        cashAmount: { toNumber: () => 100 },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockContributions = [
        mockContribution,
        {
          id: 124,
          contributorUsername: 'user124',
          eventId: 456,
          articleId: 789,
          cashAmount: { toNumber: () => 100 },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockItem = {
        id: 789,
        name: 'Test Item',
        price: { toNumber: () => 200 },
      };

      const mockEventItem = {
        eventId: 456,
        itemId: 789,
        quantityRequested: 1,
        quantityFulfilled: 0,
      };

      vi.mocked(db.contribution.findUnique).mockResolvedValue(mockContribution as any);
      vi.mocked(db.contribution.findMany).mockResolvedValue(mockContributions as any);
      vi.mocked(db.itemCatalogue.findUnique).mockResolvedValue(mockItem as any);
      vi.mocked(db.eventArticle.findFirst).mockResolvedValue(mockEventItem as any);
      vi.mocked(db.eventArticle.update).mockResolvedValue({ ...mockEventItem, quantityFulfilled: 1 } as any);

      // Act
      const result = await contributionService.processContribution(contributionId, articleId);

      // Assert
      expect(db.eventArticle.update).toHaveBeenCalledWith({
        where: {
          eventId_itemId: {
            eventId: 456,
            itemId: 789,
          },
        },
        data: {
          quantityFulfilled: 1,
        },
      });
      expect(result).toEqual({
        contributionId,
        articleId,
        totalContributed: 200,
        isFulfilled: true,
      });
    });

    it('should throw an error if the contribution is not found', async () => {
      // Arrange
      vi.mocked(db.contribution.findUnique).mockResolvedValue(null);

      // Act & Assert
      await expect(
        contributionService.processContribution('123', '789')
      ).rejects.toThrow(new EventManagementException('Contribution not found'));
    });
  });

  describe('getContributionsForItem', () => {
    it('should return all contributions for a specific item', async () => {
      // Arrange
      const articleId = '789';
      const mockContributions = [
        {
          id: 123,
          contributorUsername: 'user123',
          cashAmount: { toNumber: () => 100 },
          createdAt: new Date(),
          updatedAt: new Date(),
          guest: {
            username: 'user123',
            fname: 'John',
            lname: 'Doe',
            pictureUrl: 'http://example.com/pic.jpg',
          },
        },
        {
          id: 124,
          contributorUsername: 'user124',
          cashAmount: { toNumber: () => 50 },
          createdAt: new Date(),
          updatedAt: new Date(),
          guest: {
            username: 'user124',
            fname: 'Jane',
            lname: 'Smith',
            pictureUrl: 'http://example.com/pic2.jpg',
          },
        },
      ];

      vi.mocked(db.contribution.findMany).mockResolvedValue(mockContributions as any);

      // Act
      const result = await contributionService.getContributionsForItem(articleId);

      // Assert
      expect(db.contribution.findMany).toHaveBeenCalledWith({
        where: { articleId: 789 },
        include: {
          guest: {
            select: {
              username: true,
              fname: true,
              lname: true,
              pictureUrl: true,
            },
          },
        },
      });

      expect(result).toEqual([
        {
          id: '123',
          contributorUsername: 'user123',
          contributorName: 'John Doe',
          contributorPicture: 'http://example.com/pic.jpg',
          amount: 100,
          createdAt: mockContributions[0].createdAt,
          updatedAt: mockContributions[0].updatedAt,
        },
        {
          id: '124',
          contributorUsername: 'user124',
          contributorName: 'Jane Smith',
          contributorPicture: 'http://example.com/pic2.jpg',
          amount: 50,
          createdAt: mockContributions[1].createdAt,
          updatedAt: mockContributions[1].updatedAt,
        },
      ]);
    });
  });
});