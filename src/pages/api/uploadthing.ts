import {createRouteHandler} from "uploadthing/next";
import {aFileRouter} from "~/app/api/uploadthing/core";

export const{GET, POST} = createRouteHandler({
  router: aFileRouter,
  config: {
    callbackUrl: `${process.env.AUTH_URL}/api/uploadthing`,
    logLevel: "Debug",
  }
})