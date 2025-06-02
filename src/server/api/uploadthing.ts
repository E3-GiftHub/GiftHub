import { createUploadthing, type FileRouter } from "uploadthing/next";
import { db } from "~/server/db";
import { auth } from "~/server/auth";

const f = createUploadthing();

//const auth = (req : NextApiRequest) => getServerAuthSession({req});

export const aFileRouter = {
  profilePicture: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .middleware(async (req) => {
      const session =  await auth();

      if (!session?.user) {
        throw new Error("Unauthorized");
      }

      return {
        userId: session.user.id,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db.user.update({
        where: {
          username: metadata.userId,
        },
        data: {
          pictureUrl: file.url,
        },
      });
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof aFileRouter;