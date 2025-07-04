import { createUploadthing, type FileRouter } from "uploadthing/next";
import { db as prisma } from "~/server/db";
import { utapi } from "~/server/uploadthing";
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
  articlePfpUploader: {
    input: { key: string }; // old key
    output: { url: string; key: string };
  };
};

const f = createUploadthing<OurFileRouter>();

//! client ensures auth
export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "32MB", maxFileCount: 5 } })
    .input(
      z.object({
        username: z.string(),
        eventId: z.number(),
        caption: z.string(),
      }),
    )
    .middleware(async ({ input }) => {
      if (!input.username || "" === input.username) {
        throw new Error("UploadThingError: invalid session");
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
          caption: metadata.caption,
          url: file.ufsUrl,
          key: file.key,
          mediaType: "image",
          fileType: file.type,
          fileSize: file.size,
        },
      });
      return { url: file.ufsUrl };
    }),

  eventPfpUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .input(z.object({ username: z.string(), eventId: z.number() }))
    .middleware(async ({ input }) => {
      if (!input.username || "" === input.username) {
        throw new Error("UploadThingError: invalid session");
      }

      const event = await prisma.event.findUnique({
        where: { id: input.eventId },
        select: { createdByUsername: true },
      });

      if (!event || event.createdByUsername !== input.username) {
        throw new Error("UploadThingError: unauthorized user");
      }

      return { eventId: input.eventId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // delete old picture
      const picture = await prisma.event.findUnique({
        where: { id: metadata.eventId },
        select: { pictureKey: true },
      });

      // do not throw, compatibility issues
      if (!picture) console.log("UploadThingError: Event not found");
      else {
        const { pictureKey } = picture;
        if (pictureKey) await utapi.deleteFiles(pictureKey);
      }

      await prisma.event.update({
        where: { id: metadata.eventId },
        data: { pictureUrl: file.ufsUrl, pictureKey: file.key },
      });

      return { url: file.ufsUrl };
    }),

  // pass to this the username from the session! the same is assumed above
  profilePfpUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .input(z.object({ username: z.string() }))
    .middleware(async ({ input }) => {
      if (!input.username || "" === input.username) {
        throw new Error("UploadThingError: invalid session");
      }

      const user = await prisma.user.findUnique({
        where: { username: input.username },
        select: { username: true },
      });

      if (!user) {
        throw new Error("UploadThingError: not existing user");
      }

      return { username: input.username };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // delete old picture
      const picture = await prisma.user.findUnique({
        where: { username: metadata.username },
        select: { pictureKey: true },
      });

      // do not throw, compatibility issues
      if (!picture) console.log("UploadThingError: User not found");
      else {
        const { pictureKey } = picture;
        if (pictureKey) await utapi.deleteFiles(pictureKey);
      }

      await prisma.user.update({
        where: { username: metadata.username },
        data: { pictureUrl: file.ufsUrl, pictureKey: file.key },
      });
      return { url: file.ufsUrl };
    }),

  // no database manipulation here, see CustomWishlistModal.tsx
  articlePfpUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .input(z.object({ key: z.string() }))
    .middleware(async ({ input }) => {
      if (!input.key || "" === input.key) {
        console.log("warning - articlePfpUploader: key is null");
        return input;
      }

      const res = await utapi.deleteFiles(input.key);
      if (false === res.success)
        console.log("warning - articlePfpUploader: invalid key");

      return input;
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl, key: file.key };
    }),
} satisfies FileRouter;
