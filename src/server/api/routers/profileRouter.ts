import {createTRPCRouter} from "~/server/api/trpc";
import {userRouter} from "~/server/api/routers/profileManagenemt/user"

export const profileRouter = createTRPCRouter({
  user: userRouter,
});