import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ContributionService } from "~/server/services/ContributionService";
import { TRPCError } from "@trpc/server";

export const contributionRouter = createTRPCRouter({
  createContribution: protectedProcedure
    .input(
      z.object({
        contributionId: z.string(),
        eventId: z.string(),
        articleId: z.string(),
        amount: z.number(),
        date: z.date().optional(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const contributionService = new ContributionService();
       const userId = ctx.session?.user?.id;
      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Missing user ID in session." });
      }
      try {
        const result = await contributionService.createContribution(
          input.contributionId,
           userId,
          input.eventId,
          input.articleId,
          input.amount,
          input.date,
          input.message
        );
        
        return { success: true, data: result };
      } catch (error) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : "Unknown error" 
        };
      }
    }),

  processContribution: protectedProcedure
    .input(
      z.object({
        contributionId: z.string(),
        articleId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const contributionService = new ContributionService();
      
      return contributionService.processContribution(
        input.contributionId,
        input.articleId
      );
    }),

  manageContribution: protectedProcedure
    .input(
      z.object({
        contributionId: z.string(),
        action: z.enum(['approve', 'reject', 'refund']),
      })
    )
    .mutation(async ({ input }) => {
      const contributionService = new ContributionService();
      
      return contributionService.manageContribution(
        input.contributionId,
        input.action
      );
    }),

  getContributionsForItem: protectedProcedure
    .input(
      z.object({
        articleId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const contributionService = new ContributionService();
      
      const contributions = await contributionService.getContributionsForItem(
        input.articleId
      );
      
      return { success: true, data: contributions };
    }),
});