//import { renderHook } from '@testing-library/react-hooks';
import { initTRPC } from '@trpc/server';
//import { z } from 'zod';
import * as bcrypt from 'bcrypt';
import { signupRouter } from '~/server/api/routers/userManagement/signup';

// Mock the database and bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Setup a test tRPC router
const t = initTRPC.create();
const testRouter = t.router({
  signup: signupRouter.signup,
});

// Helper function to call the procedure
const caller = testRouter.createCaller({
  db: {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
});

describe('signupRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedBcrypt.hash.mockResolvedValue('hashed_password' as never);
  });

  describe('input validation', () => {
    it('should reject if username is too short', async () => {
      await expect(
        caller.signup({
          username: 'ab',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        })
      ).rejects.toThrow();
    });

    it('should reject if email is invalid', async () => {
      await expect(
        caller.signup({
          username: 'testuser',
          email: 'not-an-email',
          password: 'password123',
          confirmPassword: 'password123',
        })
      ).rejects.toThrow();
    });

    it('should reject if password is too short', async () => {
      await expect(
        caller.signup({
          username: 'testuser',
          email: 'test@example.com',
          password: 'short',
          confirmPassword: 'short',
        })
      ).rejects.toThrow();
    });

    it('should reject if passwords do not match', async () => {
      await expect(
        caller.signup({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'different123',
        })
      ).rejects.toThrow("Passwords don't match");
    });
  });

  describe('user creation', () => {
    it('should reject if user already exists', async () => {
      // Mock that user exists
      (caller as any).ctx.db.user.findFirst.mockResolvedValueOnce({
        email: 'test@example.com',
      });

      await expect(
        caller.signup({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        })
      ).rejects.toThrow('User already exists');
    });

    it('should hash the password before storing', async () => {
      (caller as any).ctx.db.user.findFirst.mockResolvedValueOnce(null);
      (caller as any).ctx.db.user.create.mockResolvedValueOnce({
        email: 'test@example.com',
        password: 'hashed_password',
      });

      const result = await caller.signup({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(result).toEqual({ success: true });
    });

    it('should create a new user with hashed password', async () => {
      (caller as any).ctx.db.user.findFirst.mockResolvedValueOnce(null);
      (caller as any).ctx.db.user.create.mockResolvedValueOnce({
        email: 'test@example.com',
        password: 'hashed_password',
        fname: null,
        lname: null,
        iban: null,
        pictureUrl: null,
      });

      const result = await caller.signup({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      expect((caller as any).ctx.db.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: 'hashed_password',
          fname: null,
          lname: null,
          iban: null,
          pictureUrl: null,
        },
      });
      expect(result).toEqual({ success: true });
    });

    it('should handle database errors', async () => {
      (caller as any).ctx.db.user.findFirst.mockResolvedValueOnce(null);
      (caller as any).ctx.db.user.create.mockRejectedValueOnce(
        new Error('Database error')
      );

      await expect(
        caller.signup({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        })
      ).rejects.toThrow('Database error');
    });
  });
});