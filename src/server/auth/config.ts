import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "~/server/db";
import * as bcrypt from "bcrypt";

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "jsmith@example.com",
        },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        // validation on credentials object
        if (!credentials?.email || !credentials?.password) {
          console.error("Authorize: Missing email or password in credentials");
          return null; // Indicates failed authorization
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await db.user.findFirst({
          where: {
            email: email,
          },
          select: {
            id: true,
            username: true,
            email: true,
            password: true,
          },
        });

        if (!user) {
          console.error(`Authorize: No user found with email: ${email}`);
          return null;
        }

        const isAlreadyHashed =
          password.startsWith("$2b$") || password.startsWith("$2a$");
        if (isAlreadyHashed) {
          if (password === user.password) {
            console.log("Password is already hashed");

            return {
              id: user.username,
              name: user.username,
              email: user.email,
            };
          }

          console.log("Hash mismatch for user");
          return null;
        }

        if (!user.password) {
          console.error(
            `Authorize: User ${email} found but has no password set (e.g., OAuth user)`,
          );
          return null;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          console.error(`Authorize: Password does not match for user ${email}`);
          return null;
        }

        // If everything is okay, return the user object.
        // This object will be available in the `user` property of the `jwt` callback.
        console.log(`Authorize: Successfully authenticated user ${email}`);
        return {
          id: user.username,
          name: user.username,
          email: user.email,
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // The 'user' object is passed from the `authorize` callback on initial sign-in.
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      // `account` and `profile` are available when using OAuth providers
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.name = token.name!;
        session.user.email = token.email!;
      }

      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      },
    },
  },
  pages: {
    signIn: "/login",
    // signOut: '/auth/signout', // (Optional) Custom sign-out page
    // error: '/auth/error', // (Optional) Error page (e.g., for OAuth errors)
    // verifyRequest: '/auth/verify-request', // (Optional) Used for E-mail provider
    // newUser: '/auth/new-user' // (Optional) New user page (e.g., after OAuth first sign-up)
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
  },

  secret: process.env.AUTH_SECRET,
  trustHost: true,

  debug: process.env.NODE_ENV === "development",
};