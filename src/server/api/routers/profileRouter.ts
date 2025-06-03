import {createTRPCRouter} from "~/server/api/trpc";
import {userRouter} from "~/server/api/routers/profileManagenemt/user"
import { profilePictureRouter } from "~/server/api/routers/profileManagenemt/profilePicture";

export const profileRouter = createTRPCRouter({
  user: userRouter,
  profilePicture: profilePictureRouter
});