import type { User } from '@prisma/client';

export const mockUser: Omit<User, "createdAt" | "updatedAt"> = {
  username: "john_doe",
  email: "user@example.com",
  fname: "John",
  lname: "Doe",
  password: "supersecret123",
  iban: "DE89370400440532013000",
  pictureUrl: "UserImages/default_pfp.svg",
  emailVerified: null,
  id: null,
};
