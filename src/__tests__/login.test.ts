import { createTRPCContext } from "~/server/api/trpc";
import { appRouter } from "~/server/api/root";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import * as bcrypt from "bcrypt";

// Mock the database and bcrypt
jest.mock("bcrypt");

const mockUser = {
  id: "1",
  email: "test@example.com",
  password: "hashedpassword",
  name: "Test User",
  fname: "Test",
  lname: "User",
  iban: "1234567890",
  picture: "https://example.com/test.jpg",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const createMockContext = () => {
  return {
    db: {
      user: {
        findFirst: jest.fn(),
      },
    },
  };
};

describe("loginRouter", () => {
  let ctx: ReturnType<typeof createMockContext>;
  const caller = appRouter.createCaller({} as any);

  beforeEach(() => {
    ctx = createMockContext();
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should successfully login with valid credentials", async () => {
      // Mock database response
      ctx.db.user.findFirst.mockResolvedValue(mockUser);

      // Mock bcrypt.compare to return true
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const input = {
        email: "test@example.com",
        password: "correctpassword",
      };

      const result = await caller.auth.login.login(input);

      expect(ctx.db.user.findFirst).toHaveBeenCalledWith({
        where: { email: input.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(input.password, mockUser.password);
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it("should throw error when user is not found", async () => {
      ctx.db.user.findFirst.mockResolvedValue(null);

      const input = {
        email: "nonexistent@example.com",
        password: "anypassword",
      };

      await expect(caller.auth.login.login(input)).rejects.toThrow("User not found");
      expect(ctx.db.user.findFirst).toHaveBeenCalledWith({
        where: { email: input.email },
      });
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it("should throw error when password doesn't match", async () => {
      ctx.db.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const input = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      await expect(caller.auth.login.login(input)).rejects.toThrow("Passwords don't match");
      expect(bcrypt.compare).toHaveBeenCalledWith(input.password, mockUser.password);
    });

    it("should validate email format", async () => {
      const input = {
        email: "invalid-email",
        password: "anypassword",
      };

      await expect(caller.auth.login.login(input)).rejects.toThrow();
    });

    it("should require password", async () => {
      const input = {
        email: "test@example.com",
        password: "",
      };

      await expect(caller.auth.login.login(input)).rejects.toThrow();
    });
  });
});