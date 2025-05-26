// @ts-expect-errors sa ma fut pe el
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "~/server/db";
import * as bcrypt from "bcrypt";
import { type User } from "@prisma/client";

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // @ts-expect-errors nush ce plm
      async authorize(credentials): Promise<User | null> {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required");
          }

          // @ts-expect-error plm ba vedem
          const user = await db.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            throw new Error("User not found");
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          if (!isValid) {
            throw new Error("Invalid password");
          }

          // Return user without sensitive data
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword as User;
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Only runs on sign in
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        token.sub = user.id; // Store user ID in JWT
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        token.email = user.email;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        token.username = user.username;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return token;
    },
    // @ts-expect-error Pizda Masii
    async session({ session, token }) {
      // Send properties to the client
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (session.user && token.sub) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        session.user.id = token.sub;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        session.user.email = token.email as string;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        session.user.username = token.username as string;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt", // Explicitly set strategy
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET,
};