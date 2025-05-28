import { invitationRouter } from "./routers/InvitationRouter";
import { wishlistRouter } from "./routers/WishlistController"
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { calendarRouter } from "./routers/calendarRouter";
import { upcomingEventsRouter } from "~/server/api/routers/eventPreviewRouter";
import { invitationsRouter } from "~/server/api/routers/invitationPreviewRouter";
import { eventRouter } from "~/server/api/routers/EventController";
import { contributionsRouter } from "~/server/api/routers/ContributionsRouter";
// import { purchasedItemsRouter } from "~/server/api/routers/purchasedContributionRouter";
import { invitesNotificationRouter } from "~/server/api/routers/invitesNotificationRouter";
import { guestRouter } from "~/server/api/routers/GuestRouter";
import { ebayRouter } from "~/server/api/routers/EbayRouter"
import { mediaRouter } from "~/server/api/routers/mediaRouter"

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  //post: postRouter,
  wishlist: wishlistRouter,
  invitation: invitationRouter,
  calendar: calendarRouter,
  eventPreview: upcomingEventsRouter,
  invitationPreview: invitationsRouter,
  contributions: contributionsRouter,
  purchasedItems: contributionsRouter,
  invitationsNotification: invitesNotificationRouter,
  ebay: ebayRouter,
  media: mediaRouter,
  event: eventRouter,
  guest: guestRouter,
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
//export const createCaller = createCallerFactory<AppRouter>(appRouter);
export const createCaller = appRouter.createCaller;
