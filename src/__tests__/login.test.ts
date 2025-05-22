import { createTRPCContext } from "~/server/api/trpc";
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";
import { TRPCError } from "@trpc/server";
import * as bcrypt from "bcrypt";
import { type inferProcedureInput } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";
import type { Session } from "next-auth";

// Mock the database and bcrypt
jest.mock("~/server/db", () => ({
  db: {
    user: {
      findFirst: jest.fn(),
    },
    session: {
      create: jest.fn(),
    },
  },
}));

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));

describe("loginRouter", () => {

  let caller: ReturnType<typeof appRouter.createCaller>;

  const mockContext = {
    headers: new Headers(),
    db: db as unknown as PrismaClient,
    session: null as unknown as Session,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    caller = appRouter.createCaller(mockContext);
  });

  describe("login mutation", () => {
    const validInput = {
      email: "test@example.com",
      password: "password123",
      rememberMe: false,
    };

    const mockUser = {
      username: "testuser",
      email: "test@example.com",
      password: "hashedpassword",
    };

    it("should successfully login with correct credentials", async () => {
      // Mock database response
      (db.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (db.session.create as jest.Mock).mockResolvedValue({
        sessionToken: "token",
        expires: new Date(),
      });

      type Input = inferProcedureInput<typeof appRouter.auth.login.login>;
      const input: Input = validInput;

      const result = await caller.auth.login.login(input);

      expect(result).toEqual({
        success: true,
        sessionToken: "test@example.com",
        expires: expect.any(String),
      });
      expect(db.user.findFirst).toHaveBeenCalledWith({
        where: { email: validInput.email },
        select: { username: true, email: true, password: true },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        validInput.password,
        mockUser.password
      );
    });

    it("should throw NOT_FOUND error when user doesn't exist", async () => {
      (db.user.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(caller.auth.login.login(validInput)).rejects.toThrow(TRPCError);
      await expect(caller.auth.login.login(validInput)).rejects.toMatchObject({
        code: "NOT_FOUND",
        message: "User not found",
      });
    });

    it("should throw BAD_REQUEST error when user has no password", async () => {
      (db.user.findFirst as jest.Mock).mockResolvedValue({
        ...mockUser,
        password: null,
      });

      await expect(caller.auth.login.login(validInput)).rejects.toThrow(TRPCError);
      await expect(caller.auth.login.login(validInput)).rejects.toMatchObject({
        code: "BAD_REQUEST",
        message: "User has no password",
      });
    });

    it("should throw UNAUTHORIZED error when password doesn't match", async () => {
      (db.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(caller.auth.login.login(validInput)).rejects.toThrow(TRPCError);
      await expect(caller.auth.login.login(validInput)).rejects.toMatchObject({
        code: "UNAUTHORIZED",
        message: "Passwords don't match",
      });
    });

    it("should set longer expiration when rememberMe is true", async () => {
      (db.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (db.session.create as jest.Mock).mockImplementation(({ data }) =>
        Promise.resolve(data)
      );

      const result = await caller.auth.login.login({
        ...validInput,
        rememberMe: true,
      });

      const expiresDate = new Date(result.expires);
      const now = new Date();
      const thirtyDaysFromNow = new Date(
        now.getTime() + 1000 * 60 * 60 * 24 * 30
      );

      // Check if expiration is roughly 30 days from now (with some tolerance)
      expect(expiresDate.getTime()).toBeGreaterThan(
        thirtyDaysFromNow.getTime() - 1000
      );
      expect(expiresDate.getTime()).toBeLessThan(
        thirtyDaysFromNow.getTime() + 1000
      );
    });

    it("should create a session with correct data", async () => {
      (db.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (db.session.create as jest.Mock).mockImplementation(({ data }) =>
        Promise.resolve(data)
      );

      await caller.auth.login.login(validInput);

      expect(db.session.create).toHaveBeenCalled();
      const sessionData = (db.session.create as jest.Mock).mock.calls[0][0]
        .data;

      expect(sessionData.user).toEqual({
        connect: { username: mockUser.username },
      });
      expect(sessionData.sessionToken).toContain(validInput.email);
      expect(sessionData.expires).toBeInstanceOf(Date);
    });
  });
});