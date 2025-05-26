import { handlers } from "~/server/auth";
import NextAuth from "next-auth";
import { options } from "./options";

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const handler = NextAuth(options);

export { handler as GET, handlers as POST };
