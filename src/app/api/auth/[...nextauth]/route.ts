import { handlers } from "~/server/auth";
import NextAuth from "next-auth";
import { options } from "./options";
import { db } from "~/server/db";
import * as bcrypt from "bcrypt";
import CredentialsProvider from "next-auth/providers/credentials";


export const {
  handlers: {GET, POST},
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<any> {
        if(!credentials?.email || !credentials?.password){
          return null;
        }

        const user = await db.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });

        if(!user || !user.password){
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if(!passwordMatch){
          return null;
        }

        return {
          id: user.id,
          name: user.username,
          email: user.email
        };
      },
    }),
  ],

  callbacks:{
    async jwt({token, user}){
      if(user){
        token.id = user.id;
        token.name = user.name;
          token.email = user.email;
      }
      return token;
    },

    async session({session, token}){
      if(token){
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }

      return session;
    },
  },

  pages:{
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET,
});
