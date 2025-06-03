import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { db as prisma } from "~/server/db";
import { z } from "zod";

export type OurFileRouter = {
  imageUploader: {
    input: { username: string; eventId: number; caption: string };
    output: { url: string };
  };
  eventPfpUploader: {
    input: { username: string; eventId: number };
    output: { url: string };
  };
  profilePfpUploader: {
    input: { username: string };
    output: { url: string };
  };
};

const f = createUploadthing<OurFileRouter>();

//! client ensures auth
export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .input(
      z.object({
        username: z.string(),
        eventId: z.number(),
        caption: z.string(),
      }),
    )
    .middleware(async ({ input }) => {
      if (!input.username || "" === input.username) {
        throw new UploadThingError("invalid session");
      }

      return {
        username: input.username,
        eventId: input.eventId,
        caption: input.caption,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.media.create({
        data: {
          uploaderUsername: metadata.username,
          eventId: metadata.eventId,
          url: file.ufsUrl,
          caption: metadata.caption,
          mediaType: "image",
          fileType: file.type,
          fileSize: file.size,
        },
      });
      return { url: file.ufsUrl };
    }),

  eventPfpUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .input(z.object({ username: z.string(), eventId: z.number() }))
    .middleware(async ({ input }) => {
      if (!input.username || "" === input.username) {
        throw new UploadThingError("invalid session");
      }

      const event = await prisma.event.findUnique({
        where: { id: input.eventId },
        select: { createdByUsername: true },
      });

      if (!event || event.createdByUsername !== input.username) {
        throw new UploadThingError("unauthorized user");
      }

      return { eventId: input.eventId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.event.update({
        where: { id: metadata.eventId },
        data: { pictureUrl: file.ufsUrl },
      });
      return { url: file.ufsUrl };
    }),

  // pass to this the username from the session! the same is assumed above
  profilePfpUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .input(z.object({ username: z.string() }))
    .middleware(async ({ input }) => {
      if (!input.username || "" === input.username) {
        throw new UploadThingError("invalid session");
      }

      const user = await prisma.user.findUnique({
        where: { username: input.username },
        select: { username: true },
      });

      if (!user) {
        throw new UploadThingError("not existing user");
      }

      return { username: input.username };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.user.update({
        where: { username: metadata.username },
        data: { pictureUrl: file.ufsUrl },
      });
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;
