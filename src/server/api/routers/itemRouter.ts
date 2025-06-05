import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { TRPCError } from "@trpc/server";

export const itemRouter = createTRPCRouter({
  // Get all items for a given event, with mark and contribution info for the current user
  getAll: publicProcedure
  .input(z.object({ eventId: z.number(), username: z.string() }))
  .query(async ({ input }) => {
    // Get all items for the event with their relationships
    const eventArticles = await db.eventArticle.findMany({
      where: { eventId: input.eventId },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            price: true,
            imagesUrl: true,
          },
        },
        marks: {
          where: {
            markerUsername: input.username,
          },
        },
        
        contributions: {
          where: {
            guestUsername: input.username,
          },
        },
      
        _count: {
          select: {
            contributions: true, 
          },
        },
      },
    });

    
    const allContributions = await db.contribution.groupBy({
      by: ['articleId'],
      where: { eventId: input.eventId },
      _sum: { cashAmount: true },
    });

    
    const contributionMap = new Map(
      allContributions.map(c => [c.articleId, Number(c._sum.cashAmount ?? 0)])
    );

  
    const items = eventArticles.map((ea) => {
    
      const totalContributionAmount = contributionMap.get(ea.id) ?? 0;
      
    
      let state: "none" | "external" | "contributing" = "none";
      
      // If marked as purchased by current user, show as external
      if (ea.marks.some(m => m.type === "PURCHASED")) {
        state = "external";
      } 
      // If anyone has contributed to this item, show as contributing
      else if (totalContributionAmount > 0) {
        state = "contributing";
      }
      // If current user has contributions but total is 0 (edge case), show contributing
      else if (ea.contributions.length > 0) {
        state = "contributing";
      }

      return {
        id: ea.id,
        itemId: ea.itemId,
        nume: ea.item?.name ?? "",
        pret: ea.item?.price?.toString() ?? "",
        state,
        imageUrl: ea.item?.imagesUrl ?? undefined,
        transferCompleted: ea.transferCompleted ?? false,
        contribution: {
          current: totalContributionAmount, // Total from all users
          total: Number(ea.item?.price ?? 0),
        },
        
        userHasContributed: ea.contributions.length > 0,
        userContributionAmount: ea.contributions.reduce((sum, c) => sum + Number(c.cashAmount), 0),
      };
    });

    return items;
  }),

  deleteItem: publicProcedure
  .input(z.object({ itemId: z.number(), eventId: z.number() }))
  .mutation(async ({ input, ctx }) => {
    const username = ctx.session?.user?.name;

    const event = await ctx.db.event.findUnique({
      where: { id: input.eventId },
    });

    if (!event || event.createdByUsername !== username) {
      return { success: false, message: "Not authorized." };
    }

    
    const eventArticle = await ctx.db.eventArticle.findFirst({
      where: {
        itemId: input.itemId,
        eventId: input.eventId,
      },
    });

    if (!eventArticle) {
      return {
        success: false,
        message: "No matching EventArticle found.",
      };
    }


    const hasMarks = await ctx.db.mark.findFirst({
      where: { articleId: eventArticle.id },
    });

    if (hasMarks) {
      return {
        success: false,
        message: "Cannot delete item that has marks.",
      };
    }

    
    const hasContributions = await ctx.db.contribution.findFirst({
      where: { articleId: eventArticle.id },
    });

    if (hasContributions) {
      return {
        success: false,
        message: "Cannot delete item that has contributions.",
      };
    }


    await ctx.db.eventArticle.delete({
      where: { id: eventArticle.id },
    });

    return {
      success: true,
      message: "Item deleted successfully.",
    };
  }),



  // Mark/unmark an item for a user
  setMark: publicProcedure
    .input(
      z.object({
        eventId: z.number(),
        articleId: z.number(), // This is now the EventArticle id, not the itemId
        username: z.string(),
        type: z.enum(["contributing", "external", "none"]),
        amount: z.number().optional(), // Only for contributions
      }),
    )
    .mutation(async ({ input }) => {
      try {
        
        const articleData = await db.eventArticle.findUnique({
          where: {
            id: input.articleId, // Using id instead of compound key
          },
          include: {
            event: true,
            item: true,
          },
        });

        if (!articleData) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Item not found in this event",
          });
        }

        if (articleData.eventId !== input.eventId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Article does not belong to this event",
          });
        }

        // Check if user is event creator or invited guest
        const isEventCreator = articleData.event.createdByUsername === input.username;
        const invitation = await db.invitation.findFirst({
          where: {
            eventId: input.eventId,
            guestUsername: input.username,
            status: "ACCEPTED",
          },
        });

        if (!invitation && !isEventCreator) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to mark this item",
          });
        }

        // Check if item is already purchased by someone else
        if (input.type !== "external") {
          const existingPurchaseMark = await db.mark.findFirst({
            where: {
              articleId: input.articleId, // Using EventArticle id
              type: "PURCHASED",
            },
          });

          if (existingPurchaseMark && existingPurchaseMark.markerUsername !== input.username) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "This item has already been marked as purchased by someone else",
            });
          }
        }

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
              guestUsername: input.username,
            },
          });
        } else if (input.type === "external") {
          // First, delete any existing mark for this item (from any user)
          await db.mark.deleteMany({
            where: {
              articleId: input.articleId, // Using EventArticle id
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
          // Validate contribution amount
          const totalContributions = await db.contribution.aggregate({
            where: {
              articleId: input.articleId, // Using EventArticle id
            },
            _sum: { cashAmount: true },
          });

          const currentContributions = totalContributions._sum.cashAmount ?? 0;
          const itemPrice = Number(articleData.item.price);
          const newTotal = Number(currentContributions) + input.amount;

          if (newTotal > itemPrice) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Total contributions would exceed the item's price",
            });
          }

          // Add a contribution
          await db.contribution.create({
            data: {
              guestUsername: input.username,
              eventId: input.eventId,
              articleId: input.articleId,
              cashAmount: input.amount,
              currency: "RON", // todo delete this hardcode
            },
          });
        }
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        // Log unexpected errors but don't expose internal details
        console.error("Error in setMark mutation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
        });
      }
    }),
});

export default itemRouter;
