import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const itemRouter = createTRPCRouter({
  // Get all items for a given event, with mark and contribution info for the current user
  getAll: publicProcedure
    .input(z.object({ eventId: z.number(), username: z.string() }))
    .query(async ({ input }) => {
      // Get all items for the event
      const eventArticles = await db.eventArticle.findMany({
        where: { eventId: input.eventId },
        include: { item: true },
      });

      // For each item, get mark for user and sum of contributions
      const items = await Promise.all(
        eventArticles.map(async (ea: typeof eventArticles[number]) => {
          // Check if the user marked as bought (external)
          const mark = await db.mark.findFirst({
            where: {
              eventId: input.eventId,
              articleId: ea.itemId,
              markerUsername: input.username,
            },
          });
          // Check if the user has contributed (in Contribution table)
          const hasContributed = await db.contribution.findFirst({
            where: {
              eventId: input.eventId,
              articleId: ea.itemId,
              contributorUsername: input.username,
            },
          });

          // Get contribution sum
          const contributionSum = await db.contribution.aggregate({
            where: {
              eventId: input.eventId,
              articleId: ea.itemId,
            },
            _sum: { cashAmount: true },
          });

          // Determine state based on mark type
          let state: "none" | "external" | "contributing" = "none";
          if (mark?.type === "PURCHASED") {
            state = "external";
          } else if (hasContributed) {
            state = "contributing";
          }

          return {
            id: ea.itemId,
            nume: ea.item?.name ?? "",
            pret: ea.item?.price?.toString() ?? "",
            state,
            contribution: {
              current: Number(contributionSum._sum.cashAmount ?? 0),
              total: Number(ea.item?.price ?? 0),
            },
          };
        })
      );
      return items;
    }),

  // Mark/unmark an item for a user
  setMark: publicProcedure
    .input(
      z.object({
        eventId: z.number(),
        articleId: z.number(),
        username: z.string(),
        type: z.enum(["contributing", "external", "none"]),
        amount: z.number().optional(), // Only for contributions
      })
    )
    .mutation(async ({ input }) => {
      if (input.type === "none") {
        // Remove mark and contributions for this user
        await db.mark.deleteMany({
          where: {
            eventId: input.eventId,
            articleId: input.articleId,
            markerUsername: input.username,
          },
        });
        await db.contribution.deleteMany({
          where: {
            eventId: input.eventId,
            articleId: input.articleId,
            contributorUsername: input.username,
          },
        });
      } else if (input.type === "external") {
        // First, delete any existing mark for this item (from any user)
        await db.mark.deleteMany({
          where: {
            eventId: input.eventId,
            articleId: input.articleId,
          },
        });
        // Then create a new mark for the current user
        await db.mark.create({
          data: {
            eventId: input.eventId,
            articleId: input.articleId,
            markerUsername: input.username,
            type: "PURCHASED",
          },
        });
      } else if (input.type === "contributing" && input.amount && input.amount > 0) {
        // Add a contribution (not a mark)
        await db.contribution.create({
          data: {
            eventId: input.eventId,
            articleId: input.articleId,
            contributorUsername: input.username,
            cashAmount: input.amount,
          },
        });
      }
      return { success: true };
    }),
});

export default itemRouter;