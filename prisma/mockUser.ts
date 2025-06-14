import type { User } from "@prisma/client";

export const mockUser: Omit<User, "createdAt" | "updatedAt"> = {
  username: "john_doe",
  email: "user@example.com",
  fname: "John",
  lname: "Doe",
  password: "supersecret123",
  stripeConnectId: "DE89370400440532013000",
  pictureUrl: "UserImages/default_pfp.svg",
  pictureKey: "secretKeyNoOneKnowsAboutIt",
  emailVerified: null,
  id: null,
  emailToken: null,
  tokenExpires: null,
};
