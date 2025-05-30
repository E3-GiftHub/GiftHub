import type { NextApiRequest, NextApiResponse } from "next";
import { db as prisma } from "~/server/db";
import { StatusType } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method != "GET") return res.status(405).end();

  const eventId = Number(req.query.eventId);
  if (!eventId) return res.status(400).json({ error: "Missing eventId" });

  const invitations = await prisma.invitation.findMany({
    where: { eventId: eventId, status: StatusType.ACCEPTED },
    include: {
      guest: {
        select: {
          username: true,
          fname: true,
          lname: true,
          email: true,
          pictureUrl: true,
        },
      },
    },
  });

  return res.status(200).json(invitations.map((invite) => invite.guest));
}
