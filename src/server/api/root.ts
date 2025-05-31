import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { calendarRouter } from "./routers/calendarRouter";
import { upcomingEventsRouter } from "~/server/api/routers/eventPreviewRouter";
import { invitationsRouter } from "~/server/api/routers/invitationPreviewRouter";
import { itemRouter } from "./routers/itemRouter";
import { eventRouter } from "./routers/eventRouter";
import { contributionsRouter } from "~/server/api/routers/ContributionsRouter";
// import { purchasedItemsRouter } from "~/server/api/routers/purchasedContributionRouter";
import { invitesNotificationRouter } from "~/server/api/routers/invitesNotificationRouter";

import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

import { calendarRouter } from "./routers/calendarRouter";

import { upcomingEventsRouter } from "~/server/api/routers/eventPreviewRouter";

import { invitationsRouter } from "~/server/api/routers/invitationPreviewRouter";

import { stripeRouter } from "~/server/api/routers/stripeRouter";

import { userRouter } from "~/server/api/routers/userRouter"; // presupunând că fișierul se numește userRouter.ts și este în același director 'routers'

/**

 * This is the primary router for your server.

 *

 * All routers added in /api/routers should be manually added here.

 */

export const appRouter = createTRPCRouter({
  auth: authRouter,
  calendar: calendarRouter,
  eventPreview: upcomingEventsRouter,
  invitationPreview: invitationsRouter,
  item: itemRouter,
  event: eventRouter,
  contributions: contributionsRouter,
  purchasedItems: contributionsRouter,
  invitationsNotification: invitesNotificationRouter,
  stripe: stripeRouter,
  user: userRouter,
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
