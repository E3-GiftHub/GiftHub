import{initTRPC} from "@trpc/server";
import {loginRouter} from "~/server/api/routers/userManagement/login";
import { db } from "~/server/db";
import bcrypt from "bcrypt";
import type {inferAsyncReturnType} from "@trpc/server";
import type {CreateNextContextOptions} from "@trpc/server/adapters/next";

jest.mock("bcrypt");
jest.mock('~/server/db');

describe("login", () => {
  const createTestContext = () => ({
    headers: new Headers(),
    db,
    session: null,
  });

  type Context = inferAsyncReturnType<typeof createTestContext>;

  const t = initTRPC.context<Context>().create();
  const caller = loginRouter.createCaller(createTestContext());

  const mockUser = {
    id: 1,
    email: "test@example.org",
    password: "hashedpassword",
    fname: "John",
    lname: "Doe",
    iban: "1234567890",
    picture: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  })

  it("returns a session when the user is authenticated", async () => {
    (db.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await caller.login({
      email: 'test@example.org',
      password: 'correctpassword',
    });

    expect(result).toEqual({
      email: 'test@example.org',
      fname: 'John',
      lname: 'Doe',
      iban: '1234567890',
      picture: null,
      }
    );
    expect(bcrypt.compare).toHaveBeenCalledWith('correctpassword', 'hashedpassword');
  });

  it("returns null when the user doesn't exist", async () => {
    (db.user.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(
      caller.login(
        {
        email: 'nonexistentusr@example.org',
        password: 'apassword',
      })
    ).rejects.toThrow('User not found');
  })

  it('returns null when the password is incorrect', async () => {
    (db.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      caller.login({
        email: 'test@example.org',
        password: 'wrongpassword',
      })
    ).rejects.toThrow("Passwords don't match");
  });

  it('returns null when the invalid email format', async () => {
    await expect(
      caller.login({
        email: 'invalid@email',
        password: 'password',
      })
    ).rejects.toThrow();
  });

  it('returns null when the password is short', async () => {
    await expect(
      caller.login({
        email: 'test@example.org',
        password: 'pw',
      })
    ).rejects.toThrow();
  });
})
