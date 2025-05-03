import { InvitationEntity } from "~/services/Invitation";
import { db as prisma } from "~/server/db";

jest.mock("~/server/db", () => ({
  db: {
    invitation: {
      findMany: jest.fn(),
    },
  },
}));

describe("InvitationEntity", () => {
  const mockInvitation = {
    id: BigInt(1),
    eventId: BigInt(123),
    guestId: "guest123",
    status: "PENDING",
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-02T00:00:00Z"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getByEvent", () => {
    it("should return an array of InvitationEntity instances", async () => {
      (prisma.invitation.findMany as jest.Mock).mockResolvedValue([mockInvitation]);

      const result = await InvitationEntity.getByEvent(BigInt(123));

      expect(prisma.invitation.findMany).toHaveBeenCalledWith({
        where: { eventId: BigInt(123) },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(InvitationEntity);
      expect(result[0].raw).toEqual(mockInvitation);
    });
  });

  describe("getters", () => {
    const entity = new InvitationEntity(mockInvitation as any);

    it("status should return invitation status", () => {
      expect(entity.status).toBe("PENDING");
    });

    it("invitedAt should return createdAt date", () => {
      expect(entity.invitedAt).toEqual(new Date("2024-01-01T00:00:00Z"));
    });

    it("raw should return the raw invitation object", () => {
      expect(entity.raw).toEqual(mockInvitation);
    });
  });
});
