import { loginRouter } from "~/server/api/routers/userManagement/login";
import { signupRouter } from "~/server/api/routers/userManagement/signup";
import { recoveryRouter } from "~/server/api/routers/userManagement/findByEmail";
import { updatePasswordRouter } from "~/server/api/routers/userManagement/updatePassword";
import {requestResetRouter} from "~/server/api/routers/userManagement/requestReset";

import { createTRPCRouter } from "~/server/api/trpc";

export const authRouter = createTRPCRouter({
  login: loginRouter,
  signup: signupRouter,
  findByEmail: recoveryRouter,
  update: updatePasswordRouter,
  resetRequest: requestResetRouter,
});
