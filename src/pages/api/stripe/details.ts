import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface PaymentDetails {
  itemName?: string;
  itemPrice?: number;
  alreadyContributed?: number;
  parentEventId?: number;
  eventName?: string;
  eventPlanner?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaymentDetails | { error: string }>,
) {
  const { articleid, eventid } = req.query;

  // Helper to send a 400 Bad Request
  const badRequest = (msg: string) => res.status(400).json({ error: msg });

  // If “articleid” is provided, return details for an EventArticle
  if (typeof articleid === "string") {
    const articleId = parseInt(articleid, 10);
    if (isNaN(articleId)) {
      return badRequest("Invalid articleid");
    }

    try {
      // 1) Fetch the EventArticle, include its Item to get price/name
      const article = await prisma.eventArticle.findUnique({
        where: { id: articleId },
        include: {
          item: true, // to read item.name / item.price
        },
      });

      if (!article) {
        return res.status(404).json({ error: "EventArticle not found" });
      }

      // 2) Sum up all past contributions for this article
      const contribSum = await prisma.contribution.aggregate({
        where: { articleId: articleId },
        _sum: { cashAmount: true },
      });

      // Convert Prisma Decimal (or null) into a regular number
      const alreadyContributed =
        contribSum._sum.cashAmount !== null
          ? parseFloat(contribSum._sum.cashAmount.toString())
          : 0;

      // If item.price is null, set itemPrice to undefined; otherwise convert Decimal → number
      const itemPrice =
        article.item.price !== null
          ? parseFloat(article.item.price.toString())
          : undefined;

      const remaining =
        itemPrice !== undefined
          ? Math.max(itemPrice - alreadyContributed, 0)
          : undefined;

      return res.status(200).json({
        itemName: article.item.name || undefined,
        itemPrice,
        alreadyContributed,
        parentEventId: article.eventId,
        // eventName & eventPlanner are not needed here
      });
    } catch (e) {
      console.error("Error fetching EventArticle details:", e);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // If “eventid” is provided, return basic Event info
  if (typeof eventid === "string") {
    const eventId = parseInt(eventid, 10);
    if (isNaN(eventId)) {
      return badRequest("Invalid eventid");
    }

    try {
      // 1) Fetch the Event and include its creator’s User record
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          user: {
            select: {
              username: true,
              fname: true,
              lname: true,
            },
          },
        },
      });

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Build a “planner” string: prefer “First Last” if available, otherwise use username
      const plannerName =
        event.user.fname && event.user.lname
          ? `${event.user.fname} ${event.user.lname}`
          : event.user.username;

      return res.status(200).json({
        eventName: event.title || undefined,
        eventPlanner: plannerName,
        // itemName / itemPrice / alreadyContributed / parentEventId are not needed here
      });
    } catch (e) {
      console.error("Error fetching Event details:", e);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // If neither query parameter is present, return 400
  return badRequest(
    "Missing or invalid query parameter (articleid or eventid)",
  );
}
