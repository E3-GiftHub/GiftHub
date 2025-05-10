// src/server/api/root.ts

import { createTRPCRouter, createCallerFactory } from "./trpc";
import { postRouter } from "./routers/post";
import { invitationRouter } from "./routers/InvitationRouter";
import { wishlistRouter } from "./routers/WishlistController";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  wishlist: wishlistRouter,
  invitation: invitationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? inferred Post[]
 */
export const createCaller = createCallerFactory<AppRouter>(appRouter);
