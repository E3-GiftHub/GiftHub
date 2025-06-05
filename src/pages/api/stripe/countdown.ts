import type { NextApiRequest, NextApiResponse } from "next";
import { db as prisma } from "~/server/db";
import { endOfEventTransfer } from "~/server/services/ContributionsTransfer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // the comments will tell the page source of this parameters
  const eventId = Number(req.query.eventId); // event-view, event
  const invitationId = Number(req.query.invitationId); // event-invitation
  const articleId = Number(req.query.invitationId); // payment
  if (!eventId && !invitationId && !articleId)
    return res.status(400).json({ error: "Missing parameters" });

  let termination: Date | null = null;

  //! query the database depending on the source
  if (eventId) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { date: true },
    });
    termination = event?.date ?? null;
  } else if (invitationId) {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      select: {
        event: {
          select: {
            date: true,
          },
        },
      },
    });
    termination = invitation?.event?.date ?? null;
  } else {
    const article = await prisma.eventArticle.findUnique({
      where: { id: articleId },
      select: {
        event: {
          select: {
            date: true,
          },
        },
      },
    });
    termination = article?.event?.date ?? null;
  }

  if (!termination)
    return res.status(404).json({ error: "Invalid parameters: object" });

  const now = new Date();
  const miliseconds = termination.getTime() - now.getTime();
  if (miliseconds > 0)
    return res.status(200).json({ error: "No error - wait more" });

  //! big call
  await endOfEventTransfer(eventId);
  return res
    .status(200)
    .json({ error: "No error - event termination started" });
}
