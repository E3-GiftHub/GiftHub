import type { NextApiRequest, NextApiResponse } from "next";
import { db as prisma } from "~/server/db";
import { StatusType } from "@prisma/client"; // <-- corect

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const eventId = Number(req.query.eventId);
    if (!eventId) return res.status(400).json({ error: "Missing eventId" });
    const guests = await prisma.invitation.findMany({
      where: { eventId, status: StatusType.ACCEPTED }, // <-- corect
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
    return res.status(200).json(guests);
  }
  res.status(405).end();
}