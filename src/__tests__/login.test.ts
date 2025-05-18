import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { loginRouter } from "~/server/api/routers/userManagement/login";
import * as bcrypt from "bcrypt";
import { mockDeep } from "jest-mock-extended";
import type { PrismaClient, User } from "@prisma/client";
import { TRPCError } from "@trpc/server";

// Mock the bcrypt module
jest.mock("bcrypt");
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock the database
const prismaMock = mockDeep<PrismaClient>();

describe("loginRouter", () => {
  const caller = loginRouter.createCaller({
    db: prismaMock,
    headers: new Headers(),
    session: null
  });

  const testUser: User = {
    id: "1",
    email: "test@example.com",
    password: "hashedpassword", // This would be a bcrypt hash in real scenario
    fname: "Test",
    lname: "User",
    iban: "1234567890",
    pictureUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    username: "",
    emailVerified: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    //prismaMock.user.findFirst = jest.fn();
    //mockedBcrypt.compare = jest.fn();
  });

  describe("login", () => {
    it("should return user without password when credentials are valid", async () => {
      // Arrange
      prismaMock.user.findFirst.mockResolvedValue(testUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const input = {
        email: "test@example.com",
        password: "correctpassword",
      };

      // Act
      const result = await caller.login(input);

      // Assert
      expect(result).toEqual({
        id: testUser.id,
        email: testUser.email,
        fname: testUser.fname,
        lname: testUser.lname,
        emailVerified: testUser.emailVerified,
        iban: testUser.iban,
        pictureUrl: testUser.pictureUrl,
        username: testUser.username,
        createdAt: testUser.createdAt,
        updatedAt: testUser.updatedAt,
      });
      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: { email: input.email },
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        input.password,
        testUser.password
      );
    });

    it("should throw error when user is not found", async () => {
      // Arrange
      prismaMock.user.findFirst.mockResolvedValue(null);

      const input = {
        email: "nonexistent@example.com",
        password: "anypassword",
      };

      // Act & Assert
      await expect(caller.login(input)).rejects.toThrow("User not found");
      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: { email: input.email },
      });
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
    });

    it("should throw error when password doesn't match", async () => {
      // Arrange
      prismaMock.user.findFirst.mockResolvedValue(testUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const input = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      // Act & Assert
      await expect(caller.login(input)).rejects.toThrow("Passwords don't match");
      expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
        where: { email: input.email },
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        input.password,
        testUser.password
      );
    });

    it("should handle unexpected errors", async () => {
      // Arrange
      prismaMock.user.findFirst.mockRejectedValue(new Error("Database error"));

      const input = {
        email: "test@example.com",
        password: "anypassword",
      };

      // Act & Assert
      await expect(caller.login(input)).rejects.toThrow("Database error");
    });
  });
});