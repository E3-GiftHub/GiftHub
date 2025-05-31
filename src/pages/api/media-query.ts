import type { NextApiRequest, NextApiResponse } from "next";
import { db as prisma } from "~/server/db";

// in app invitation - NOT link
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const eventId = Number(req.query.eventId);
  if (!eventId) return res.status(400).json({ error: "Missing parameters" });

  const media = await prisma.media.findMany({
    where: {
      eventId: eventId,
    },
    select: {
      id: true,
      uploaderUsername: true,
      url: true,
      caption: true,
      mediaType: true,
      fileType: true,
      fileSize: true,
      createdAt: true,
    },
  });

  return res.status(200).json(media);
}
