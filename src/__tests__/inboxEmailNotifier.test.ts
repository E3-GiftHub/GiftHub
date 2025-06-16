// Test for inbox email notifier functions

// Mock environment variables
jest.mock("~/env.js", () => ({
  env: {
    SMTP_HOST: "test-smtp.example.com",
    SMTP_PORT: "587",
    SMTP_USER: "test@example.com",
    SMTP_PASS: "test-password",
    SMTP_FROM: "test@example.com",
    AUTH_URL: "https://test-app.com",
    DATABASE_URL: "test-database-url",
    NEXTAUTH_SECRET: "test-secret",
    NEXTAUTH_URL: "https://test-app.com",
  }
}));

// Mock the inbox email notification function
jest.mock("../server/services/InboxEmailNotifications", () => ({
  sendInboxNotificationEmail: jest.fn(),
}));

// Mock Prisma database
jest.mock("../server/db", () => ({
  db: {
    user: {
      findUnique: jest.fn(),
    },
    event: {
      findUnique: jest.fn(),
    },
  },
}));

// Import the functions after mocking
import {
  notifyEventOwnerOfContribution,
  notifyEventOwnerOfPurchase,
  notifyUserOfNewInvitation,
  notifyEventOwnerOfInvitationResponse,
} from "../server/api/routers/inboxEmailNotifier";

import { sendInboxNotificationEmail } from "../server/services/InboxEmailNotifications";
import { db } from "../server/db";

const mockSendInboxNotificationEmail = sendInboxNotificationEmail as jest.MockedFunction<typeof sendInboxNotificationEmail>;
const mockUserFindUnique = db.user.findUnique as jest.MockedFunction<typeof db.user.findUnique>;
const mockEventFindUnique = db.event.findUnique as jest.MockedFunction<typeof db.event.findUnique>;

describe("Inbox Email Notifier Functions", () => {
  beforeEach(() => {
    (jest.clearAllMocks as () => void)();
  });

  describe("notifyEventOwnerOfContribution", () => {
    it("should notify event owner of a new contribution", async () => {
      // Mock event data
      mockEventFindUnique.mockResolvedValue({
        id: 1,
        title: "Birthday Party",
        description: "My 30th birthday",
        location: "My house",
        date: new Date(),
        time: null,
        pictureUrl: null,
        token: "abc123",
        createdByUsername: "eventowner",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock contributor data
      mockUserFindUnique.mockResolvedValue({
        username: "contributor",
        email: "contributor@example.com",
        fname: "Jane",
        lname: "Smith",
        id: "2",
        password: null,
        stripeConnectId: null,
        emailToken: null,
        tokenExpires: null,
        pictureUrl: null,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await notifyEventOwnerOfContribution(
        1,
        "contributor",
        "Gift Card",
        50,
        "RON"
      );

      expect(mockEventFindUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          createdByUsername: true,
          title: true,
          id: true,
        },
      });

      expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: { username: "contributor" },
        select: { fname: true, lname: true },
      });

      expect(mockSendInboxNotificationEmail).toHaveBeenCalledWith({
        recipientUsername: "eventowner",
        type: "contribution",
        eventTitle: "Birthday Party",
        eventId: 1,
        actorName: "Jane Smith",
        amount: "50 RON",
        itemName: "Gift Card",
      });
    });

    it("should handle missing event gracefully", async () => {
      mockEventFindUnique.mockResolvedValue(null);
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      await notifyEventOwnerOfContribution(
        999,
        "contributor",
        "Gift Card",
        50,
        "RON"
      );

      expect(consoleLogSpy).toHaveBeenCalledWith("Event 999 not found for contribution notification");
      expect(mockSendInboxNotificationEmail).not.toHaveBeenCalled();
    });

    it("should use username as fallback when user has no name", async () => {
      mockEventFindUnique.mockResolvedValue({
        id: 1,
        title: "Birthday Party",
        description: "My 30th birthday",
        location: "My house",
        date: new Date(),
        time: null,
        pictureUrl: null,
        token: "abc123",
        createdByUsername: "eventowner",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockUserFindUnique.mockResolvedValue({
        username: "contributor",
        email: "contributor@example.com",
        fname: null,
        lname: null,
        id: "2",
        password: null,
        stripeConnectId: null,
        emailToken: null,
        tokenExpires: null,
        pictureUrl: null,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await notifyEventOwnerOfContribution(
        1,
        "contributor",
        "Gift Card",
        50,
        "RON"
      );

      expect(mockSendInboxNotificationEmail).toHaveBeenCalledWith({
        recipientUsername: "eventowner",
        type: "contribution",
        eventTitle: "Birthday Party",
        eventId: 1,
        actorName: "contributor",
        amount: "50 RON",
        itemName: "Gift Card",
      });
    });
  });

  describe("notifyEventOwnerOfPurchase", () => {
    it("should notify event owner of an item purchase", async () => {
      mockEventFindUnique.mockResolvedValue({
        id: 2,
        title: "Wedding",
        description: "Our special day",
        location: "Beach Resort",
        date: new Date(),
        time: null,
        pictureUrl: null,
        token: "def456",
        createdByUsername: "bridegroom",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockUserFindUnique.mockResolvedValue({
        username: "buyer",
        email: "buyer@example.com",
        fname: "Bob",
        lname: "Johnson",
        id: "3",
        password: null,
        stripeConnectId: null,
        emailToken: null,
        tokenExpires: null,
        pictureUrl: null,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await notifyEventOwnerOfPurchase(2, "buyer", "Coffee Maker");

      expect(mockSendInboxNotificationEmail).toHaveBeenCalledWith({
        recipientUsername: "bridegroom",
        type: "purchase",
        eventTitle: "Wedding",
        eventId: 2,
        actorName: "Bob Johnson",
        itemName: "Coffee Maker",
      });
    });
  });

  describe("notifyUserOfNewInvitation", () => {
    it("should notify user of a new invitation", async () => {
      mockUserFindUnique.mockResolvedValue({
        username: "host",
        email: "host@example.com",
        fname: "Alice",
        lname: "Brown",
        id: "4",
        password: null,
        stripeConnectId: null,
        emailToken: null,
        tokenExpires: null,
        pictureUrl: null,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await notifyUserOfNewInvitation(
        "guest",
        "host",
        "Graduation Party",
        3
      );

      expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: { username: "host" },
        select: { fname: true, lname: true },
      });

      expect(mockSendInboxNotificationEmail).toHaveBeenCalledWith({
        recipientUsername: "guest",
        type: "invitation_received",
        eventTitle: "Graduation Party",
        eventId: 3,
        actorName: "Alice Brown",
      });
    });
  });

  describe("notifyEventOwnerOfInvitationResponse", () => {
    it("should notify event owner when invitation is accepted", async () => {
      mockEventFindUnique.mockResolvedValue({
        id: 4,
        title: "House Warming",
        description: "New home celebration",
        location: "New House",
        date: new Date(),
        time: null,
        pictureUrl: null,
        token: "ghi789",
        createdByUsername: "homeowner",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockUserFindUnique.mockResolvedValue({
        username: "guest",
        email: "guest@example.com",
        fname: "Charlie",
        lname: "Wilson",
        id: "5",
        password: null,
        stripeConnectId: null,
        emailToken: null,
        tokenExpires: null,
        pictureUrl: null,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await notifyEventOwnerOfInvitationResponse(4, "guest", "ACCEPTED");

      expect(mockSendInboxNotificationEmail).toHaveBeenCalledWith({
        recipientUsername: "homeowner",
        type: "invitation_accepted",
        eventTitle: "House Warming",
        eventId: 4,
        actorName: "Charlie Wilson",
      });
    });

    it("should notify event owner when invitation is declined", async () => {
      mockEventFindUnique.mockResolvedValue({
        id: 5,
        title: "Birthday Bash",
        description: "Big birthday celebration",
        location: "Party Hall",
        date: new Date(),
        time: null,
        pictureUrl: null,
        token: "jkl012",
        createdByUsername: "birthdayhost",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockUserFindUnique.mockResolvedValue({
        username: "decliner",
        email: "decliner@example.com",
        fname: "David",
        lname: "Miller",
        id: "6",
        password: null,
        stripeConnectId: null,
        emailToken: null,
        tokenExpires: null,
        pictureUrl: null,
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await notifyEventOwnerOfInvitationResponse(5, "decliner", "DECLINED");

      expect(mockSendInboxNotificationEmail).toHaveBeenCalledWith({
        recipientUsername: "birthdayhost",
        type: "invitation_declined",
        eventTitle: "Birthday Bash",
        eventId: 5,
        actorName: "David Miller",
      });
    });

    it("should handle errors gracefully", async () => {
      mockEventFindUnique.mockRejectedValue(new Error("Database error"));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await notifyEventOwnerOfInvitationResponse(999, "guest", "ACCEPTED");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to notify event owner of invitation response:",
        expect.any(Error)
      );
      expect(mockSendInboxNotificationEmail).not.toHaveBeenCalled();
    });
  });
});
