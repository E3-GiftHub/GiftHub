import { invitationRouter } from "./routers/InvitationRouter";
import { wishlistRouter } from "./routers/WishlistController"
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { calendarRouter } from "./routers/calendarRouter";
import { upcomingEventsRouter } from "~/server/api/routers/eventPreviewRouter";
import { invitationsRouter } from "~/server/api/routers/invitationPreviewRouter";
import { eventPlannerRouter } from "~/server/api/routers/EventController";
import { itemRouter } from "./routers/itemRouter";
import { eventRouter } from "./routers/eventRouter";
import { contributionsRouter } from "~/server/api/routers/ContributionsRouter";
// import { purchasedItemsRouter } from "~/server/api/routers/purchasedContributionRouter";
import { invitesNotificationRouter } from "~/server/api/routers/invitesNotificationRouter";
import { emailRouter } from "~/server/api/routers/emailRouter";

import { guestRouter } from "~/server/api/routers/GuestRouter";
import { ebayRouter } from "~/server/api/routers/EbayRouter"
import { mediaRouter } from "~/server/api/routers/mediaRouter";
import { userRouter } from "./routers/profileManagenemt/user";
import { authRouter } from "~/server/api/routers/authRouter";
import { profileRouter } from "~/server/api/routers/profileRouter";

export const appRouter = createTRPCRouter({
  //post: postRouter,
  auth: authRouter,
  wishlist: wishlistRouter,
  invitation: invitationRouter,
  profile: profileRouter,
  calendar: calendarRouter,
  eventPreview: upcomingEventsRouter,
  invitationPreview: invitationsRouter,
  item: itemRouter,
  event: eventRouter,
  contributions: contributionsRouter,
  purchasedItems: contributionsRouter,
  invitationsNotification: invitesNotificationRouter,
  ebay: ebayRouter,
  media: mediaRouter,
  eventPlanner: eventPlannerRouter,
  guest: guestRouter,
  user: userRouter,
  email: emailRouter,

});

// export type definition of API

export type AppRouter = typeof appRouter;

/**

 * Create a server-side caller for the tRPC API.

 * @example

 * const trpc = createCaller(createContext);

 * const res = await trpc.post.all();

 * ^? Post[]

 */

export const createCaller = createCallerFactory(appRouter);

