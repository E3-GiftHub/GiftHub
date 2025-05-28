import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError }                  from "uploadthing/server";
import { PrismaClient }                      from "@prisma/client";
import { z }                                 from "zod";

const prisma = new PrismaClient();
const auth   = (req: Request) => ({ id: "user1" }); // fake auth

// ─── 1. Definești forma de „input” și „output” pentru fiecare routeSlug ───
export type OurFileRouter = {
  imageUploader: {
    input:  { eventId: number };
    output: { uploadedBy: string };
  };
};

// ─── 2. Creezi helper-ul, injectând tipul definit ───
const f = createUploadthing<OurFileRouter>();

// ─── 3. Construiești router-ul pur și simplu, apoi îl satisfaci cu FileRouter ───
export const ourFileRouter = {
  imageUploader: f(
    { image: { maxFileSize: "4MB", maxFileCount: 1 } }
  )
    // validez input-ul cu Zod:
    .input(z.object({ eventId: z.number() }))
    .middleware(async ({ req, input }) => {
      const user = auth(req);
      if (!user) throw new UploadThingError("Unauthorized");

      // la acest punct, `input.eventId` e garantat de Zod
      return { userId: user.id, eventId: input.eventId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // metadata.userId + metadata.eventId sunt aici tipizate
      await prisma.media.create({
        data: {
          uploaderUsername: metadata.userId,
          eventId:           metadata.eventId,
          url:               file.ufsUrl,
          caption:           "",
          mediaType:         file.type,
          fileType:          file.name.split(".").pop() || "unknown",
          fileSize:          file.size,
        },
      });
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;
