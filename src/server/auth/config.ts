import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "~/server/db"; // Your Prisma client or DB utility
import * as bcrypt from "bcrypt";

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials", // Can be any name, used on the default sign-in page
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "jsmith@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      // @ts-expect-error nush boss e greu
      async authorize(credentials) {
        // Basic validation on credentials object
        if (!credentials?.email || !credentials?.password) {
          console.error("Authorize: Missing email or password in credentials");
          return null; // Indicates failed authorization
        }

        // Ensure email and password are strings
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
          id: user.id,
          name: user.username, // Or user.name, adjust based on your User model
          email: user.email,
          username: user.username, // <-- Add this line
        };
      },
    }),
    // Add other providers here if needed (e.g., Google, GitHub)
  ],
  callbacks: {
    async jwt({ token, user }) {
      // The 'user' object is passed from the `authorize` callback on initial sign-in.
      if (user) {
        token.id = user.id; // Add the user ID to the JWT
        // Use user['username'] to avoid TS error, since we know it's present from authorize
        //token.username = user.username;
      }
      // `account` and `profile` are available when using OAuth providers
      return token;
    },
    async session({ session, token }) {
      // The `token` object is the JWT returned from the `jwt` callback.
      // We want to make the user ID (and any other custom claims from the token)
      // available on the `session.user` object.
      if (session.user && token.id) {
        session.user.id = token.id as string;
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
    signIn: "/login", // Path to your custom login page
    // signOut: '/auth/signout', // (Optional) Custom sign-out page
    // error: '/auth/error', // (Optional) Error page (e.g., for OAuth errors)
    // verifyRequest: '/auth/verify-request', // (Optional) Used for E-mail provider
    // newUser: '/auth/new-user' // (Optional) New user page (e.g., after OAuth first sign-up)
  },
  session: {
    strategy: "jwt", // Recommended strategy, especially with Credentials provider
    maxAge: 60 * 60, // 30 days (Optional)
    // updateAge: 24 * 60 * 60, // 24 hours (Optional)
  },

  // The secret is used to sign and encrypt JWTs, and for CSRF protection.
  // Ensure this is set in your environment variables for production.
  secret: process.env.AUTH_SECRET,

  trustHost: true,

  // For NextAuth.js v5 (now officially Auth.js) when deploying to some platforms (like Vercel)
  // or when using a reverse proxy, you might need to set `trustHost`.
  // trustHost: true, // Be mindful of security implications if your proxy setup isn't secure.

  // You can add debug messages in development
  debug: process.env.NODE_ENV === "development",
};
