import { sendEmail } from '~/server/email';
import nodemailer from 'nodemailer';

// Mock nodemailer module
jest.mock('nodemailer');
const mockNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;

// Create a mutable mock for env - initialize inline in jest.mock
jest.mock('~/env.js', () => ({
  env: {
    SMTP_HOST: 'smtp.test.com',
    SMTP_PORT: '587',
    SMTP_USER: 'test@example.com',
    SMTP_PASS: 'testpass',
    SMTP_FROM: 'noreply@example.com',
    NODE_ENV: 'test',
  },
}));

// Import the mocked env to modify it in tests
import { env } from '~/env.js';
const mockEnv = env as jest.Mocked<typeof env>;

describe('Email Service', () => {
  let mockSendMail: jest.Mock;
  let mockClose: jest.Mock;
  let mockCreateTransport: jest.Mock;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Reset mockEnv to default values
    Object.assign(mockEnv, {
      SMTP_HOST: 'smtp.test.com',
      SMTP_PORT: '587',
      SMTP_USER: 'test@example.com',
      SMTP_PASS: 'testpass',
      SMTP_FROM: 'noreply@example.com',
      NODE_ENV: 'test',
    });

    // Create mock functions
    mockSendMail = jest.fn();
    mockClose = jest.fn();
    mockCreateTransport = jest.fn();

    // Setup the default mock implementation
    mockCreateTransport.mockReturnValue({
      sendMail: mockSendMail,
      close: mockClose,
    });

    mockNodemailer.createTransport = mockCreateTransport;
  });

  describe('sendEmail function', () => {
    it('should send email successfully with all options', async () => {
      // Arrange
      const mockMessageId = 'test-message-id-123';
      mockSendMail.mockResolvedValue({ messageId: mockMessageId });

      const emailOptions = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<h1>Test HTML</h1>',
        text: 'Test plain text',
      };

      // Act
      const result = await sendEmail(emailOptions);

      // Assert
      expect(result.success).toBe(true);
      expect(result.messageId).toBe(mockMessageId);
      expect(mockCreateTransport).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<h1>Test HTML</h1>',
        text: 'Test plain text',
      });
      expect(mockClose).toHaveBeenCalledTimes(1);
    });

    it('should send email with only required fields', async () => {
      // Arrange
      const mockMessageId = 'test-message-id-456';
      mockSendMail.mockResolvedValue({ messageId: mockMessageId });

      const emailOptions = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
      };

      // Act
      const result = await sendEmail(emailOptions);

      // Assert
      expect(result.success).toBe(true);
      expect(result.messageId).toBe(mockMessageId);
      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
      });
    });

    it('should use SMTP_USER as fallback when SMTP_FROM is not available', async () => {
      // Arrange - modify mockEnv to simulate missing SMTP_FROM
      (mockEnv as any).SMTP_FROM = undefined;
      (mockEnv as any).SMTP_USER = 'fallback@example.com';

      const mockMessageId = 'test-message-id-789';
      mockSendMail.mockResolvedValue({ messageId: mockMessageId });

      const emailOptions = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        text: 'Test content',
      };

      // Act
      const result = await sendEmail(emailOptions);

      // Assert
      expect(result.success).toBe(true);
      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'fallback@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        text: 'Test content',
      });
    });

    it('should handle email sending errors gracefully', async () => {
      // Arrange
      const errorMessage = 'SMTP connection failed';
      mockSendMail.mockRejectedValue(new Error(errorMessage));

      const emailOptions = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        text: 'Test content',
      };

      // Spy on console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const result = await sendEmail(emailOptions);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(errorMessage);
      expect(mockClose).toHaveBeenCalledTimes(1); // Should still close connection
      
      // Cleanup
      consoleSpy.mockRestore();
    });

    it('should handle non-Error exceptions', async () => {
      // Arrange
      const errorString = 'String error message';
      mockSendMail.mockRejectedValue(errorString);

      const emailOptions = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        text: 'Test content',
      };

      // Spy on console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      const result = await sendEmail(emailOptions);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe(errorString);
      expect(mockClose).toHaveBeenCalledTimes(1);
      
      // Cleanup
      consoleSpy.mockRestore();
    });

    it('should create transporter with correct SSL configuration for port 465', async () => {
      // Arrange - modify mockEnv for SSL configuration
      (mockEnv as any).SMTP_HOST = 'smtp.ssl.com';
      (mockEnv as any).SMTP_PORT = '465';
      (mockEnv as any).NODE_ENV = 'production';

      mockSendMail.mockResolvedValue({ messageId: 'test-id' });

      // Act
      await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
      });

      // Assert
      expect(mockCreateTransport).toHaveBeenCalledWith({
        host: 'smtp.ssl.com',
        port: 465,
        secure: true,
        auth: {
          user: 'test@example.com',
          pass: 'testpass',
        },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000,
      });
    });

    it('should create transporter with TLS settings for development', async () => {
      // Arrange - modify mockEnv for development
      (mockEnv as any).SMTP_HOST = 'smtp.dev.com';
      (mockEnv as any).SMTP_PORT = '587';
      (mockEnv as any).NODE_ENV = 'development';

      mockSendMail.mockResolvedValue({ messageId: 'test-id' });

      // Act
      await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
      });

      // Assert
      expect(mockCreateTransport).toHaveBeenCalledWith({
        host: 'smtp.dev.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@example.com',
          pass: 'testpass',
        },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000,
      });
    });

    it('should always close transporter connection', async () => {
      // Arrange
      mockSendMail.mockResolvedValue({ messageId: 'test-id' });

      // Act
      await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        text: 'Test content',
      });

      // Assert
      expect(mockClose).toHaveBeenCalledTimes(1);
    });

    it('should close transporter connection even when sendMail fails', async () => {
      // Arrange
      mockSendMail.mockRejectedValue(new Error('Send failed'));

      // Spy on console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        text: 'Test content',
      });

      // Assert
      expect(mockClose).toHaveBeenCalledTimes(1);
      
      // Cleanup
      consoleSpy.mockRestore();
    });
  });

  describe('createTransporter configuration', () => {
    it('should configure transporter with non-SSL port correctly', async () => {
      // Arrange
      mockSendMail.mockResolvedValue({ messageId: 'test-id' });

      // Act
      await sendEmail({
        to: 'test@example.com',
        subject: 'Test',
      });

      // Assert
      expect(mockCreateTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          port: 587,
          secure: false,
          connectionTimeout: 30000,
          greetingTimeout: 30000,
          socketTimeout: 30000,
        })
      );
    });
  });
});