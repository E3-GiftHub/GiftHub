/*
import { createUploadthing, type FileRouter } from "uploadthing/next";
import getServerSession from "next-auth";
import prisma from "@prisma/client";
import { authOptions } from "~/server/auth";

const f = createUploadthing();

export const ourFileRouter = {
  eventMediaUploader: f({
    image: { maxFileSize: "4MB" },
    video: { maxFileSize: "16MB" },
  })
    .middleware(async () => {
      const session = await getServerSession(authOptions);
      if (!session) throw new Error("Unauthorized");
      return { username: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { username } = metadata;

      // Save to Prisma
      await prisma.media.create({
        data: {
          uploaderUsername: username,
          eventId: 123, // <-- dynamically replace
          url: file.ufsUrl,
          fileType: file.type,
          mediaType: file.type.startsWith("image") ? "image" : "video",
        },
      });
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
*/
