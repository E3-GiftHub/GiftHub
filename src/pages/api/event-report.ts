import type { NextApiRequest, NextApiResponse } from "next";
import { db as prisma } from "~/server/db";

// in app invitation - NOT link
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const username = String(req.query.username);
  const eventId = Number(req.query.eventId);
  if (!eventId) return res.status(400).json({ error: "Missing parameters" });

  await prisma.eventReport.create({
    data: {
      reportedByUsername: username,
      reportedId: eventId,
      reason: "reason",
    },
  });

  return res.status(200).json({ error: "No error" });
}
