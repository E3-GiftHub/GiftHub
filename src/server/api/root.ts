import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { calendarRouter } from "./routers/calendarRouter";
import { upcomingEventsRouter } from "~/server/api/routers/eventPreviewRouter";
import { invitationsRouter } from "~/server/api/routers/invitationPreviewRouter";
import { contributionsRouter } from "~/server/api/routers/ContributionsRouter";
// import { purchasedItemsRouter } from "~/server/api/routers/purchasedContributionRouter";
import {invitesNotificationRouter} from "~/server/api/routers/invitesNotificationRouter";

import { loginRouter } from "~/server/api/routers/userManagement/login";
import { signupRouter } from "~/server/api/routers/userManagement/signup";
import { recoveryRouter } from "~/server/api/routers/userManagement/findByEmail";
import { updatePasswordRouter } from "~/server/api/routers/userManagement/updatePassword";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  calendar: calendarRouter,
  eventPreview: upcomingEventsRouter,
  invitationPreview: invitationsRouter,
  auth: createTRPCRouter({
    login: loginRouter,
    signup: signupRouter,
    findByEmail: recoveryRouter,
    update: updatePasswordRouter,
  }),
  contributions: contributionsRouter,
  purchasedItems: contributionsRouter,
 invitationsNotification: invitesNotificationRouter,

});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
