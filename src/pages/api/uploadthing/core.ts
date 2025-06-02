import {createRouteHandler} from "uploadthing/next";
import {aFileRouter} from "~/server/uploadthing";

export const{GET, POST} = createRouteHandler({
  router: aFileRouter,
})