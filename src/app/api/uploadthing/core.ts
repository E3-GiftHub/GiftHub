import { createFileRoute } from "uploadthing/server";
import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { getSession } from "next-auth/react";

const f = createFileRoute();

//const auth = (req : NextApiRequest) => getServerAuthSession({req});

export const ourFileRouter = {
  profilePicture: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .middleware(({ req }) => {
      const session = getSession(req);

      if (!session) {
        throw new Error("Unauthorized");
      }

      return {
        userId: session.user.id,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("File uploaded:", metadata, file);
    }),
} satisfies OurFileRouter;

export type OurFileRouter = typeof ourFileRouter;