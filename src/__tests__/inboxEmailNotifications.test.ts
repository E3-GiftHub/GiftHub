// Test for inbox email notification utilities

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

// Mock email service
jest.mock("../server/email", () => ({
  sendEmail: jest.fn(),
}));

// Mock Prisma database
jest.mock("../server/db", () => ({
  db: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

import { sendInboxNotificationEmail } from "../server/services/InboxEmailNotifications";
import { sendEmail } from "../server/email";
import { db } from "../server/db";

const mockSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;
const mockUserFindUnique = db.user.findUnique as jest.MockedFunction<typeof db.user.findUnique>;

describe("sendInboxNotificationEmail", () => {
  beforeEach(() => {
    (jest.clearAllMocks as () => void)();
    process.env.AUTH_URL = "https://test-app.com";
  });

  afterEach(() => {
    delete process.env.AUTH_URL;
  });

  it("should send contribution notification email successfully", async () => {
    // Mock user data
    mockUserFindUnique.mockResolvedValue({
      username: "testuser",
      email: "test@example.com",
      fname: "John",
      lname: "Doe",
      id: "1",
      password: null,
      stripeConnectId: null,
      emailToken: null,
      tokenExpires: null,
      pictureUrl: null,
      pictureKey: null,
      emailVerified: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockSendEmail.mockResolvedValue({
      success: true,
      messageId: "test-message-id",
    } as const);

    await sendInboxNotificationEmail({
      recipientUsername: "testuser",
      type: "contribution",
      eventTitle: "Birthday Party",
      eventId: 1,
      actorName: "Jane Smith",
      amount: "50 RON",
      itemName: "Gift Card",
    });

    expect(mockUserFindUnique).toHaveBeenCalledWith({
      where: { username: "testuser" },
      select: {
        email: true,
        fname: true,
        lname: true,
      },
    });

    expect(mockSendEmail).toHaveBeenCalledWith({
      to: "test@example.com",
      subject: "New contribution to your event \"Birthday Party\"",
      html: expect.stringContaining("Jane Smith contributed 50 RON to Gift Card"),
      text: expect.stringContaining("Jane Smith contributed 50 RON to Gift Card"),
    });
  });

  it("should send purchase notification email successfully", async () => {
    mockUserFindUnique.mockResolvedValue({
      username: "testuser",
      email: "test@example.com",
      fname: "John",
      lname: "Doe",
      id: "1",
      password: null,
      stripeConnectId: null,
      emailToken: null,
      tokenExpires: null,
      pictureUrl: null,
      pictureKey: null,
      emailVerified: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockSendEmail.mockResolvedValue({
      success: true,
      messageId: "test-message-id",
    } as const);

    await sendInboxNotificationEmail({
      recipientUsername: "testuser",
      type: "purchase",
      eventTitle: "Wedding",
      eventId: 2,
      actorName: "Bob Johnson",
      itemName: "Coffee Maker",
    });

    expect(mockSendEmail).toHaveBeenCalledWith({
      to: "test@example.com",
      subject: "Item purchased for your event \"Wedding\"",
      html: expect.stringContaining("Bob Johnson purchased Coffee Maker"),
      text: expect.stringContaining("Bob Johnson purchased Coffee Maker"),
    });
  });

  it("should send invitation received notification email successfully", async () => {
    mockUserFindUnique.mockResolvedValue({
      username: "guestuser",
      email: "guest@example.com",
      fname: "Alice",
      lname: "Brown",
      id: "2",
      password: null,
      stripeConnectId: null,
      emailToken: null,
      tokenExpires: null,
      pictureUrl: null,
      pictureKey: null,
      emailVerified: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockSendEmail.mockResolvedValue({
      success: true,
      messageId: "test-message-id",
    } as const);

    await sendInboxNotificationEmail({
      recipientUsername: "guestuser",
      type: "invitation_received",
      eventTitle: "Graduation Party",
      eventId: 3,
      actorName: "Charlie Wilson",
    });

    expect(mockSendEmail).toHaveBeenCalledWith({
      to: "guest@example.com",
      subject: "You've been invited to \"Graduation Party\"",
      html: expect.stringContaining("Charlie Wilson has invited you to their event"),
      text: expect.stringContaining("Charlie Wilson has invited you to their event"),
    });
  });

  it("should handle invitation accepted notification", async () => {
    mockUserFindUnique.mockResolvedValue({
      username: "hostuser",
      email: "host@example.com",
      fname: "David",
      lname: "Lee",
      id: "3",
      password: null,
      stripeConnectId: null,
      emailToken: null,
      tokenExpires: null,
      pictureUrl: null,
      pictureKey: null,
      emailVerified: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockSendEmail.mockResolvedValue({
      success: true,
      messageId: "test-message-id",
    } as const);

    await sendInboxNotificationEmail({
      recipientUsername: "hostuser",
      type: "invitation_accepted",
      eventTitle: "House Warming",
      eventId: 4,
      actorName: "Emma Davis",
    });

    expect(mockSendEmail).toHaveBeenCalledWith({
      to: "host@example.com",
      subject: "Emma Davis accepted your invitation",
      html: expect.stringContaining("Emma Davis has accepted your invitation"),
      text: expect.stringContaining("Emma Davis has accepted your invitation"),
    });
  });

  it("should handle invitation declined notification", async () => {
    mockUserFindUnique.mockResolvedValue({
      username: "hostuser",
      email: "host@example.com",
      fname: "David",
      lname: "Lee",
      id: "3",
      password: null,
      stripeConnectId: null,
      emailToken: null,
      tokenExpires: null,
      pictureUrl: null,
      pictureKey: null,
      emailVerified: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockSendEmail.mockResolvedValue({
      success: true,
      messageId: "test-message-id",
    } as const);

    await sendInboxNotificationEmail({
      recipientUsername: "hostuser",
      type: "invitation_declined",
      eventTitle: "Birthday Bash",
      eventId: 5,
      actorName: "Frank Miller",
    });

    expect(mockSendEmail).toHaveBeenCalledWith({
      to: "host@example.com",
      subject: "Frank Miller declined your invitation",
      html: expect.stringContaining("Frank Miller has declined your invitation"),
      text: expect.stringContaining("Frank Miller has declined your invitation"),
    });
  });

  it("should skip sending email if user has no email address", async () => {
    mockUserFindUnique.mockResolvedValue({
      username: "testuser",
      email: null, // No email
      fname: "John",
      lname: "Doe",
      id: "1",
      password: null,
      stripeConnectId: null,
      emailToken: null,
      tokenExpires: null,
      pictureUrl: null,
      pictureKey: null,
      emailVerified: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    await sendInboxNotificationEmail({
      recipientUsername: "testuser",
      type: "contribution",
      eventTitle: "Birthday Party",
      eventId: 1,
      actorName: "Jane Smith",
      amount: "50 RON",
      itemName: "Gift Card",
    });

    expect(mockSendEmail).not.toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith("No email found for user testuser");
  });

  it("should skip sending email if user is not found", async () => {
    mockUserFindUnique.mockResolvedValue(null);
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    await sendInboxNotificationEmail({
      recipientUsername: "nonexistentuser",
      type: "contribution",
      eventTitle: "Birthday Party",
      eventId: 1,
      actorName: "Jane Smith",
      amount: "50 RON",
      itemName: "Gift Card",
    });

    expect(mockSendEmail).not.toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith("No email found for user nonexistentuser");
  });

  it("should handle email sending errors gracefully", async () => {
    mockUserFindUnique.mockResolvedValue({
      username: "testuser",
      email: "test@example.com",
      fname: "John",
      lname: "Doe",
      id: "1",
      password: null,
      stripeConnectId: null,
      emailToken: null,
      tokenExpires: null,
      pictureUrl: null,
      pictureKey: null,
      emailVerified: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockSendEmail.mockRejectedValue(new Error("Email service unavailable"));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Should not throw an error
    await expect(
      sendInboxNotificationEmail({
        recipientUsername: "testuser",
        type: "contribution",
        eventTitle: "Birthday Party",
        eventId: 1,
        actorName: "Jane Smith",
        amount: "50 RON",
        itemName: "Gift Card",
      })
    ).resolves.not.toThrow();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to send inbox notification email:",
      expect.any(Error)
    );
  });

  it("should generate correct email content with proper formatting", async () => {
    mockUserFindUnique.mockResolvedValue({
      username: "testuser",
      email: "test@example.com",
      fname: "John",
      lname: "Doe",
      id: "1",
      password: null,
      stripeConnectId: null,
      emailToken: null,
      tokenExpires: null,
      pictureUrl: null,
      pictureKey: null,
      emailVerified: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockSendEmail.mockResolvedValue({
      success: true,
      messageId: "test-message-id",
    } as const);

    await sendInboxNotificationEmail({
      recipientUsername: "testuser",
      type: "contribution",
      eventTitle: "Birthday Party",
      eventId: 1,
      actorName: "Jane Smith",
      amount: "50 RON",
      itemName: "Gift Card",
    });

    const emailCall = mockSendEmail.mock.calls[0]?.[0];
    
    // Check HTML content structure
    expect(emailCall?.html).toContain("Hi John!");
    expect(emailCall?.html).toContain("View Inbox");
    expect(emailCall?.html).toContain("View Contribution");
    expect(emailCall?.html).toContain("https://gifthub-five.vercel.app/inbox");
    expect(emailCall?.html).toContain("https://gifthub-five.vercel.app/wishlist-view?eventId=1");

    // Check text content
    expect(emailCall?.text).toContain("Hi John!");
    expect(emailCall?.text).toContain("Jane Smith contributed 50 RON to Gift Card");
    expect(emailCall?.text).toContain("View your inbox: https://gifthub-five.vercel.app/inbox");
    expect(emailCall?.text).toContain("View Contribution: https://gifthub-five.vercel.app/wishlist-view?eventId=1");
  });

  it('should generate login alert email with profile edit URL', async () => {
    const mockUser = {
      username: "alice",
      email: 'user@example.com',
      fname: 'Alice',
      lname: 'Smith',
      id: "2",
      password: null,
      stripeConnectId: null,
      emailToken: null,
      tokenExpires: null,
      pictureUrl: null,
      pictureKey: null,
      emailVerified: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUserFindUnique.mockResolvedValue(mockUser);

    await sendInboxNotificationEmail({
      recipientUsername: 'alice',
      type: 'login_alert',
      actorName: 'System',
      eventTitle: '',
      amount: '',
      itemName: '',
      loginInfo: {
        timestamp: '2023-12-01 10:30:00',
        ipAddress: '192.168.1.1',
        userAgent: 'Chrome/91.0',
      },
    });

    expect(mockSendEmail).toHaveBeenCalledTimes(1);

    const emailCall = mockSendEmail.mock.calls[0]?.[0];
    
    // Check that the email contains the profile edit URL
    expect(emailCall?.html).toContain("Hi Alice!");
    expect(emailCall?.html).toContain("New login to your GiftHub account");
    expect(emailCall?.html).toContain("Secure Account");
    expect(emailCall?.html).toContain("https://gifthub-five.vercel.app/inbox");
    expect(emailCall?.html).toContain("https://gifthub-five.vercel.app/profile-edit");

    // Check text content
    expect(emailCall?.text).toContain("Hi Alice!");
    expect(emailCall?.text).toContain("Someone just logged into your GiftHub account");
    expect(emailCall?.text).toContain("View your inbox: https://gifthub-five.vercel.app/inbox");
    expect(emailCall?.text).toContain("Secure Account: https://gifthub-five.vercel.app/profile-edit");
  });

  it('should generate welcome email with app URL', async () => {
    const mockUser = {
      username: "newuser",
      email: 'newuser@example.com',
      fname: 'Alice',
      lname: 'Smith',
      id: "3",
      password: null,
      stripeConnectId: null,
      emailToken: null,
      tokenExpires: null,
      pictureUrl: null,
      pictureKey: null,
      emailVerified: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUserFindUnique.mockResolvedValue(mockUser);

    await sendInboxNotificationEmail({
      recipientUsername: 'newuser',
      type: 'welcome',
    });

    expect(mockSendEmail).toHaveBeenCalledTimes(1);

    const emailCall = mockSendEmail.mock.calls[0]?.[0];
    
    // Check that the email contains welcome content
    expect(emailCall?.html).toContain("Hi Alice!");
    expect(emailCall?.html).toContain("Welcome to GiftHub!");
    expect(emailCall?.html).toContain("We're excited to have you join our community");
    expect(emailCall?.html).toContain("Go to GiftHub");
    expect(emailCall?.html).toContain("https://gifthub-five.vercel.app");
    // Welcome email should NOT contain inbox URL since it only has one button
    expect(emailCall?.html).not.toContain("https://gifthub-five.vercel.app/inbox");

    // Check text content
    expect(emailCall?.text).toContain("Hi Alice!");
    expect(emailCall?.text).toContain("Welcome to GiftHub!");
    expect(emailCall?.text).toContain("We're excited to have you join our community");
    expect(emailCall?.text).toContain("Visit GiftHub: https://gifthub-five.vercel.app");

    // Check subject
    expect(emailCall?.subject).toContain("Welcome to GiftHub!");
  });
});
