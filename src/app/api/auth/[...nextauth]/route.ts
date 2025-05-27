// import { handlers } from "~/server/auth";
// import NextAuth from "next-auth";
// import { options } from "./options";
// import { db } from "~/server/db";
// import * as bcrypt from "bcrypt";
// import CredentialsProvider from "next-auth/providers/credentials";
//
//
// export const {
//   handlers: {GET, POST},
//   auth,
//   signIn,
//   signOut,
// } = NextAuth({
//   providers: [
//     CredentialsProvider({
//       name: "credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials): Promise<any> {
//         if(!credentials?.email || !credentials?.password){
//           return null;
//         }
//
//         const user = await db.user.findFirst({
//           where: {
//             email: credentials.email as string,
//           },
//         });
//
//         if(!user?.password){
//           return null;
//         }
//
//         const passwordMatch = await bcrypt.compare(
//           credentials.password as string,
//           user.password
//         )
//
//         if(!passwordMatch){
//           return null;
//         }
//
//         return {
//           id: user.id,
//           name: user.username,
//           email: user.email
//         };
//       },
//     }),
//   ],
//
//   callbacks:{
//     async jwt({token, user}){
//       if(user){
//         token.id = user.id;
//         token.name = user.name;
//           token.email = user.email;
//       }
//       return token;
//     },
//
//     async session({session, token}){
//       if(token){
//         session.user.id = token.id as string;
//         session.user.name = token.name!;
//         session.user.email = token.email!;
//       }
//
//       return session;
//     },
//   },
//
//   pages:{
//     signIn: "/login",
//   },
//   secret: process.env.AUTH_SECRET,
// });


// src/app/api/auth/[...nextauth]/route.ts

// Import the handlers from your central NextAuth configuration file
// `~/server/auth` should resolve to `src/server/auth/index.ts`
import { handlers } from "~/server/auth";

// Export only the GET and POST handlers for Next.js to use for this route
export const GET = handlers.GET;
export const POST = handlers.POST;