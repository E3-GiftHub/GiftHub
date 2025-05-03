import { EventEntity } from "~/services/Event";
import { Status } from "@prisma/client";
import { db as prisma } from "~/server/db";

jest.mock("~/server/db", () => ({
  db: {
    event: {
      findUnique: jest.fn(),
    },
    invitation: {
      create: jest.fn(),
    },
  },
}));

describe("EventEntity", () => {
  const mockEvent = {
    id: BigInt(1),
    name: "Birthday",
    description: "Party",
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: "user1",
    location: "Somewhere",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("publishEvent", () => {
    it("should not throw if event is found", async () => {
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(mockEvent);

      await expect(EventEntity.publishEvent(BigInt(1))).resolves.not.toThrow();
      expect(prisma.event.findUnique).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
      });
    });

    it("should throw if event is not found", async () => {
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(EventEntity.publishEvent(BigInt(1))).rejects.toThrow("Event not found");
    });
  });

  describe("addGuest", () => {
    it("should call prisma.invitation.create with correct data", async () => {
      const entity = new EventEntity(mockEvent as any);
      const guestId = "guest1";

      await entity.addGuest(guestId);

      expect(prisma.invitation.create).toHaveBeenCalledWith({
        data: {
          eventId: mockEvent.id,
          guestId: guestId,
          status: Status.PENDING,
        },
      });
    });
  });

  describe("raw getter", () => {
    it("should return raw event data", () => {
      const entity = new EventEntity(mockEvent as any);
      expect(entity.raw).toEqual(mockEvent);
    });
  });
});
