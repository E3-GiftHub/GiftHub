import type { NextApiRequest, NextApiResponse } from "next";
import { db as prisma } from "~/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const username = String(req.query.username);
  const eventId = Number(req.query.eventId);
  if (!username || !eventId)
    return res.status(400).json({ error: "Missing parameters" });

  await prisma.invitation.deleteMany({
    where: { guestUsername: username, eventId: eventId },
  });

  return res.status(200).json({ error: "No error" });
}
