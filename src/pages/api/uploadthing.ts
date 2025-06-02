import {createRouteHandler} from "uploadthing/next";
import {aFileRouter} from "~/server/api/uploadthing";

export const{GET, POST} = createRouteHandler({
  router: aFileRouter,
  config: {
    callbackUrl: `${process.env.AUTH_URL}/api/uploadthing`,
    logLevel: "Debug",
  }
})