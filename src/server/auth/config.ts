import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

import { db } from "~/server/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    username?: string | null;
  }
}

export const authConfig = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    session: ({ session, user }) => {
      if (typeof user.id === "string") {
        session.user.id = user.id;
      } else {
        console.error("User ID is undefined in session callback. User data:", user);
      }

      if (typeof user.username === "string" || user.username === null) {
        session.user.username = user.username;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;