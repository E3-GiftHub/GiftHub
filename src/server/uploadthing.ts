import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getSession } from "next-auth/react";
import { db } from "~/server/db";

const f = createUploadthing();

export const aFileRouter = {
  profilePicture: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .middleware(async (req) => {
      const session = await getSession({ req });

      if (!session || !session.user) {
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
        }
      });
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof aFileRouter;