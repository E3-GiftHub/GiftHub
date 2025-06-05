import type { NextApiRequest, NextApiResponse } from "next";
import { db as prisma } from "~/server/db";
import { endOfEventTransfer } from "~/server/services/ContributionsTransfer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const eventId = Number(req.query.eventId);
  const invitationId = Number(req.query.invitationId);
  if (!eventId && !invitationId)
    return res.status(400).json({ error: "Missing parameters" });

  const termination: { date: Date | null } | null = eventId
    ? await prisma.event.findUnique({
        where: { id: eventId },
        select: { date: true },
      })
    : ((
        await prisma.invitation.findUnique({
          where: { id: invitationId },
          select: {
            event: {
              select: {
                date: true,
              },
            },
          },
        })
      )?.event ?? null);

  if (!termination)
    return res.status(404).json({ error: "Invalid parameters: object" });
  if (!termination.date)
    return res.status(404).json({ error: "Invalid parameters: date" });

  const now = new Date();
  const miliseconds = termination.date.getTime() - now.getTime();
  if (miliseconds > 0)
    return res.status(200).json({ error: "No error - wait more" });

  //! big call
  await endOfEventTransfer(eventId);
  return res
    .status(200)
    .json({ error: "No error - event termination started" });
}
