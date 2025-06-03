// File: /pages/api/stripe/contribute.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createCheckoutLink } from "@/server/services/payment";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Data = { url: string } | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    userId,
    articleId,
    eventId,
    amount,
  } = req.body as {
    userId: string;
    articleId?: number;
    eventId?: number;
    amount: number;
  };

  if (
    typeof userId !== "string" ||
    typeof amount !== "number" ||
    ((articleId === undefined && eventId === undefined) ||
    (articleId !== undefined && typeof articleId !== "number") ||
    (eventId !== undefined && typeof eventId !== "number"))
  ) {
    return res.status(400).json({ error: "Invalid request body." });
  }

  const purchaserUsername = userId;

  try {
    if (articleId !== undefined) {
      const eventArticle = await prisma.eventArticle.findUnique({
        where: { id: articleId },
        select: { id: true },
      });

      if (!eventArticle) {
        return res
          .status(400)
          .json({ error: `EventArticle with id=${articleId} not found.` });
      }

      const { url } = await createCheckoutLink(
        eventArticle.id,
        "eventArticle",
        amount,
        true,
        purchaserUsername,
      );

      return res.status(200).json({ url });
    } else {
      const evtId = eventId!;
      const eventRow = await prisma.event.findUnique({
        where: { id: evtId },
        select: {
          id: true,
          createdByUsername: true,
          user: { select: { stripeConnectId: true } },
        },
      });
      if (!eventRow) {
        return res.status(400).json({ error: `Event with id=${evtId} not found.` });
      }
      if (!eventRow.user.stripeConnectId) {
        return res
          .status(400)
          .json({ error: `Event planner "${eventRow.createdByUsername}" does not have a Connect account.` });
      }

      const { url } = await createCheckoutLink(
        evtId,
        "event",
        amount,
        false,
        purchaserUsername,
      );

      return res.status(200).json({ url });
    }  } catch (err) {
    console.error("Error in createCheckoutLink:", err);
    const statusCode = err instanceof Error && err.message.includes("not found") ? 404 : 500;
    const errorMessage = err instanceof Error ? err.message : "Internal server error";
    return res.status(statusCode).json({ error: errorMessage });
  }
}
