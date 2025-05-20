import { EventPlanner } from "~/services/EventPlanner";
import { EventEntity } from "~/services/Event";
import { EventManagementException } from "~/services/EventManagementException";
import { Status } from "@prisma/client";
import { db as prisma } from "~/server/db";

// Mock the Prisma client
jest.mock("~/server/db", () => ({
  db: {
    event: {
      create: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    invitation: {
      create: jest.fn(),
      count: jest.fn(),
    },
    eventItem: {
      findMany: jest.fn(),
    },
    media: {
      findMany: jest.fn(),
    },
    contribution: {
      findMany: jest.fn(),
    },
  },
}));

describe("EventPlanner", () => {
  const eventData = {
    title: "Birthday Party",
    description: "A fun birthday event",
    date: new Date("2024-05-01"),
    time: new Date("2024-05-01T18:00:00Z"),
    location: "123 Party Street",
    createdBy: "user1",
  };

  const mockEvent = {
    id: BigInt(1),
    title: "Birthday Party",
    description: "A fun birthday event",
    location: "123 Party Street",
    date: new Date("2024-05-01"),
    time: new Date("2024-05-01T18:00:00Z"),
    createdBy: "user1",
  };

  const planner = new EventPlanner();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createEvent", () => {
    it("should create an event and return an EventEntity", async () => {
      (prisma.event.create as jest.Mock).mockResolvedValue(mockEvent);

      const result = await planner.createEvent(eventData);

      expect(prisma.event.create).toHaveBeenCalledWith({
        data: eventData,
      });
      expect(result).toBeInstanceOf(EventEntity);
      expect(result.raw).toEqual(mockEvent);
    });
  });

  describe("removeEvent", () => {
    it("should remove the event", async () => {
      (prisma.event.delete as jest.Mock).mockResolvedValue(mockEvent);

      await expect(planner.removeEvent(BigInt(1))).resolves.not.toThrow();
      expect(prisma.event.delete).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
      });
    });
  });

  describe("sendInvitation", () => {
    it("should send an invitation if guest exists", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "guest1" });
      (prisma.invitation.create as jest.Mock).mockResolvedValue({});

      await expect(planner.sendInvitation(BigInt(1), "guest1")).resolves.not.toThrow();
      expect(prisma.invitation.create).toHaveBeenCalledWith({
        data: {
          eventId: BigInt(1),
          guestId: "guest1",
          status: Status.PENDING,
          createdAt: expect.any(Date),
        },
      });
    });

    it("should throw an error if guest does not exist", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(planner.sendInvitation(BigInt(1), "guest1")).rejects.toThrowError(
        new EventManagementException("Guest does not exist")
      );
    });
  });

  describe("manageWishlist", () => {
    it("should return wishlist items", async () => {
      const mockWishlist = [{ id: BigInt(1), item: { name: "Gift 1" } }];
      (prisma.eventItem.findMany as jest.Mock).mockResolvedValue(mockWishlist);

      const result = await planner.manageWishlist(BigInt(1));

      expect(result).toEqual(mockWishlist);
    });
  });

  describe("viewAnalytics", () => {
    it("should return analytics data", async () => {
      (prisma.invitation.count as jest.Mock).mockResolvedValueOnce(10); // for total count
      (prisma.invitation.count as jest.Mock).mockResolvedValueOnce(5);  // for accepted
      (prisma.invitation.count as jest.Mock).mockResolvedValueOnce(3);  // for declined

      const result = await planner.viewAnalytics(BigInt(1));

      expect(result).toEqual({
        inviteCount: 10,
        accepted: 5,
        declined: 3,
      });
    });
  });

  describe("manageGallery", () => {
    it("should return gallery media", async () => {
      const mockGallery = [{ id: BigInt(1), url: "image1.jpg" }];
      (prisma.media.findMany as jest.Mock).mockResolvedValue(mockGallery);

      const result = await planner.manageGallery(BigInt(1));

      expect(result).toEqual(mockGallery);
    });
  });

  describe("receiveContribution", () => {
    it("should return contributions", async () => {
      const mockContributions = [{ id: BigInt(1), amount: 100 }];
      (prisma.contribution.findMany as jest.Mock).mockResolvedValue(mockContributions);

      const result = await planner.receiveContribution(BigInt(1));

      expect(result).toEqual(mockContributions);
    });
  });
});
