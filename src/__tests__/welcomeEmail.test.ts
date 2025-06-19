// Test for welcome email functionality

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
  },
}));

import { notifyUserOfWelcome, notifyUserOfAccountDeletion } from "../server/api/routers/inboxEmailNotifier";
import { sendInboxNotificationEmail } from "../server/services/InboxEmailNotifications";
import { db } from "../server/db";

const mockSendInboxNotificationEmail = sendInboxNotificationEmail as jest.MockedFunction<typeof sendInboxNotificationEmail>;
const mockUserFindUnique = db.user.findUnique as jest.MockedFunction<typeof db.user.findUnique>;

describe("Welcome Email Notification", () => {
  beforeEach(() => {
    (jest.clearAllMocks as () => void)();
  });

  describe("notifyUserOfWelcome", () => {
    it("should send welcome email to new user", async () => {
      // Mock user data
      mockUserFindUnique.mockResolvedValue({
        username: "newuser",
        fname: "John",
        lname: "Doe",
        id: "1",
        password: "hashedpassword",
        stripeConnectId: null,
        emailToken: null,
        tokenExpires: null,
        pictureUrl: "/UserImages/default_pfp.svg",
        pictureKey: null,
        emailVerified: null,
        email: "newuser@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await notifyUserOfWelcome("newuser");

      expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: { username: "newuser" },
        select: {
          fname: true,
          lname: true,
          username: true,
        },
      });

      expect(mockSendInboxNotificationEmail).toHaveBeenCalledWith({
        recipientUsername: "newuser",
        type: "welcome",
      });
    });

    it("should handle case when user is not found", async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      mockUserFindUnique.mockResolvedValue(null);

      await notifyUserOfWelcome("nonexistentuser");

      expect(mockSendInboxNotificationEmail).not.toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith("User nonexistentuser not found for welcome notification");
    });

    it("should handle errors gracefully", async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockUserFindUnique.mockRejectedValue(new Error("Database error"));

      await notifyUserOfWelcome("testuser");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to send welcome notification:",
        expect.any(Error)
      );
    });
  });

  describe("Account Deletion Email", () => {
    it("should send account deletion email when user exists", async () => {
      // Mock the select with just the fields we need for account deletion
      (mockUserFindUnique as jest.Mock).mockImplementationOnce((args) => {
        if (args.select?.email && args.select?.fname && args.select?.lname) {
          return Promise.resolve({
            email: "testuser@example.com",
            fname: "John",
            lname: "Doe",
          });
        }
        return Promise.resolve(null);
      });

      await notifyUserOfAccountDeletion("testuser");

      expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: { username: "testuser" },
        select: {
          email: true,
          fname: true,
          lname: true,
        },
      });

      expect(mockSendInboxNotificationEmail).toHaveBeenCalledWith({
        recipientUsername: "testuser",
        type: "account_deleted",
      });
    });

    it("should handle case when user is not found for account deletion", async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      mockUserFindUnique.mockResolvedValueOnce(null);

      await notifyUserOfAccountDeletion("nonexistentuser");

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "No email found for user nonexistentuser or user not found"
      );
      expect(mockSendInboxNotificationEmail).not.toHaveBeenCalled();
      
      consoleLogSpy.mockRestore();
    });

    it("should handle email sending errors gracefully for account deletion", async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock the select with just the fields we need for account deletion
      (mockUserFindUnique as jest.Mock).mockImplementationOnce((args) => {
        if (args.select?.email && args.select?.fname && args.select?.lname) {
          return Promise.resolve({
            email: "testuser@example.com",
            fname: "John",
            lname: "Doe",
          });
        }
        return Promise.resolve(null);
      });

      mockSendInboxNotificationEmail.mockRejectedValueOnce(new Error("Email service down"));

      await expect(notifyUserOfAccountDeletion("testuser")).resolves.not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to send account deletion notification to testuser:",
        expect.any(Error)
      );
      
      consoleErrorSpy.mockRestore();
    });
  });
});
