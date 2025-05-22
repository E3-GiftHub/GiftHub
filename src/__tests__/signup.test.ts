import { appRouter } from '~/server/api/root';
import * as bcrypt from 'bcrypt';
import type {PrismaClient} from "@prisma/client";

// Mock the database methods
const mockDb: Partial<PrismaClient> = {
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  $on: jest.fn(),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $use: jest.fn(),
  $transaction: jest.fn(),
  $executeRaw: jest.fn(),
  $queryRaw: jest.fn(),
  $queryRawUnsafe: jest.fn(),
  $executeRawUnsafe: jest.fn(),
  $extends: jest.fn(),
} as unknown as PrismaClient;

interface MockUserModel{
  findFirst: jest.Mock;
  create: jest.Mock;
}

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
      db: mockDb as PrismaClient,
      headers: new Headers(),
      session: null,
    });
  };

  describe('input validation', () => {
    it('should reject when passwords do not match', async () => {
      const caller = createCaller();

      const input = {
        username: 'testuser',
        email: 'test@exampmockDb.user.createle.com',
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
      const userMock = mockDb.user as unknown as MockUserModel;
      userMock.findFirst.mockResolvedValue(null);
      userMock.create.mockResolvedValue({
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
      expect(userMock.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: 'test@example.com' }],
        },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(userMock.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: 'hashedPassword123',
          fname: null,
          lname: null,
          iban: null,
          pictureUrl: "/UserImages/default_pgp.svg",
        },
      });
    });

    it('should throw error when user already exists', async () => {
      const userMock = mockDb.user as unknown as MockUserModel;
      userMock.findFirst.mockResolvedValue({
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
      expect(userMock.create).not.toHaveBeenCalled();
    });
  });
});