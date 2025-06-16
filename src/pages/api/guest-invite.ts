import type { NextApiRequest, NextApiResponse } from "next";
import { db as prisma } from "~/server/db";

// in app invitation - NOT link
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const username = String(req.query.username);
  const eventId = Number(req.query.eventId);
  if (!username || !eventId)
    return res.status(400).json({ error: "Missing parameters" });

  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
    select: { username: true },
  });

  if (user === null)
    return res.status(404).json({ error: "No User found with this username" });

  // user exists, check if there is an invitation for him
  const invitation = await prisma.invitation.findFirst({ where: { guestUsername: username, eventId: eventId } });
  if (invitation)
    return res.status(404).json({ error: "User already invited" });

  // create invite
  await prisma.invitation.create({
    data: { guestUsername: username, eventId: eventId },
  });

  return res.status(200).json({ error: "No error" });
}
