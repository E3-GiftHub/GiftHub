import type { NextApiRequest, NextApiResponse } from "next";
import { db as prisma } from "~/server/db";

// in app invitation - NOT link
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { username, eventId, reason } = req.body ?? {};
  if (
    "" === username ||
    typeof username !== "string" ||
    typeof eventId !== "number" ||
    typeof reason !== "string"
  )
    return res.status(400).json({ error: "Invalid request body" });

  await prisma.eventReport.create({
    data: {
      reportedByUsername: username,
      reportedId: eventId,
      reason: reason,
    },
  });

  return res.status(200).json({ error: "No error" });
}
