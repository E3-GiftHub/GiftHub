import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const f = createUploadthing();

//TODO: luam username din sesiune
const auth = (req: Request) => ({ id: "user1" }); // Fake auth function

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const user = await auth(req);

      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.ufsUrl);

      try {
        await prisma.media.create({
          data: {
            uploaderUsername: metadata.userId,
            //TODO: luam id event din url
            eventId: 11, //metadata.eventId,
            url: file.ufsUrl,
            caption: "",
            mediaType: file.type,
            fileType: file.name.split(".").pop() || "unknown",
            fileSize: file.size,
          },
        });

        console.log("✅ Media entry saved in DB.");
      } catch (err) {
        console.error("❌ Error saving media to DB:", err);
        throw new UploadThingError("Database insert failed");
      }

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
