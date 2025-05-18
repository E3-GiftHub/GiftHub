import { appRouter } from '~/server/api/root';
import { createTRPCMsw } from 'msw-trpc';
import { setupServer } from 'msw/node';
import * as bcrypt from 'bcrypt';

// Mock the database methods
const mockDb = {
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
};

// Mock bcrypt.hash
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword123'),
}));

describe('signupRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createCaller = () => {
    return appRouter.createCaller({
      db: mockDb,
      session: null,
    });
  };

  describe('input validation', () => {
    it('should reject when passwords do not match', async () => {
      const caller = createCaller();

      const input = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'differentpassword',
      };

      await expect(caller.auth.signup.signup(input)).rejects.toThrow(
        "Passwords don't match"
      );
    });

    it('should reject when password is too short', async () => {
      const caller = createCaller();

      const input = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'short',
        confirmPassword: 'short',
      };

      await expect(caller.auth.signup.signup(input)).rejects.toThrow();
    });

    it('should reject when email is invalid', async () => {
      const caller = createCaller();

      const input = {
        username: 'testuser',
        email: 'not-an-email',
        password: 'password123',
        confirmPassword: 'password123',
      };

      await expect(caller.auth.signup.signup(input)).rejects.toThrow();
    });

    it('should reject when username is too short', async () => {
      const caller = createCaller();

      const input = {
        username: 'ab',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      await expect(caller.auth.signup.signup(input)).rejects.toThrow();
    });
  });

  describe('user creation', () => {
    it('should create a new user with hashed password', async () => {
      mockDb.user.findFirst.mockResolvedValue(null);
      mockDb.user.create.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword123',
      });

      const caller = createCaller();

      const input = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const result = await caller.auth.signup.signup(input);

      expect(result).toEqual({ success: true });
      expect(mockDb.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: 'test@example.com' }],
        },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockDb.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: 'hashedPassword123',
          fname: null,
          lname: null,
          iban: null,
          pictureUrl: null,
        },
      });
    });

    it('should throw error when user already exists', async () => {
      mockDb.user.findFirst.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
      });

      const caller = createCaller();

      const input = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      await expect(caller.auth.signup.signup(input)).rejects.toThrow(
        'User already exists'
      );
      expect(mockDb.user.create).not.toHaveBeenCalled();
    });
  });
});