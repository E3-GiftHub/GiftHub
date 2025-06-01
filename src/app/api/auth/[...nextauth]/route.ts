import { handlers } from "~/server/auth";

// Export only the GET and POST handlers for Next.js to use for this route
export const GET = handlers.GET;
export const POST = handlers.POST;
