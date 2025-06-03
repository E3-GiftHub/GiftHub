// File: /pages/api/stripe/details.ts
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

  const badRequest = (msg: string) => res.status(400).json({ error: msg });

  if (typeof articleid === "string") {
    const articleId = parseInt(articleid, 10);
    if (isNaN(articleId)) {
      return badRequest("Invalid articleid");
    }

    try {
      const article = await prisma.eventArticle.findUnique({
        where: { id: articleId },
        include: {
          item: {
            select: {
              name: true,
              price: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              createdByUsername: true,
              user: {
                select: {
                  fname: true,
                  lname: true,
                  username: true,
                },
              },
            },
          },
          contributions: {
            select: { cashAmount: true },
          },
        },
      });

      if (!article) {
        return res.status(404).json({ error: "EventArticle not found" });
      }

      const contribSum = article.contributions.reduce(
        (sum, c) => sum + Number(c.cashAmount),
        0
      );

      const itemPrice =
        article.item.price !== null
          ? parseFloat(article.item.price.toString())
          : undefined;

      const plannerUser = article.event.user;
      const plannerName =
        plannerUser.fname && plannerUser.lname
          ? `${plannerUser.fname} ${plannerUser.lname}`
          : plannerUser.username;

      return res.status(200).json({        itemName: article.item.name ?? undefined,
        itemPrice,
        alreadyContributed: contribSum,
        parentEventId: article.event.id,
        eventName: article.event.title ?? undefined,
        eventPlanner: plannerName,
      });
    } catch (e) {
      console.error("Error fetching EventArticle details:", e);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  if (typeof eventid === "string") {
    const eventId = parseInt(eventid, 10);
    if (isNaN(eventId)) {
      return badRequest("Invalid eventid");
    }

    try {
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

      const plannerName =
        event.user.fname && event.user.lname
          ? `${event.user.fname} ${event.user.lname}`
          : event.user.username;      return res.status(200).json({
        eventName: event.title ?? undefined,
        eventPlanner: plannerName,
      });
    } catch (e) {
      console.error("Error fetching Event details:", e);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return badRequest("Missing or invalid query parameter (articleid or eventid)");
}
