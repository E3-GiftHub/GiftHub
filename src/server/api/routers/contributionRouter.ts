import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ContributionService } from "../../../services/ContributionService";

const contributionService = new ContributionService();

export const contributionRouter = createTRPCRouter({
  createContribution: protectedProcedure
    .input(
      z.object({
        contributionId: z.string().uuid(),
        guestId: z.string().uuid(),
        wishlistItemId: z.string().uuid(),
        amount: z.number().positive(),
        date: z.date().optional().default(() => new Date()),
        message: z.string().optional()
      })
    )
    .mutation(async ({ input, ctx }) => {
      const senderId = ctx.session.user.id;
      const result = await contributionService.createContribution(
        input.contributionId,
        senderId,
        input.guestId,
        input.wishlistItemId,
        input.amount,
        input.date,
        input.message
      );
      return { success: true, data: result };
    }),

  processContribution: protectedProcedure
    .input(z.object({ 
      contributionId: z.string().uuid(), 
      wishlistItemId: z.string().uuid() 
    }))
    .mutation(async ({ input }) => {
      return contributionService.processContribution(
        input.contributionId,
        input.wishlistItemId
      );
    }),

  manageContribution: protectedProcedure
    .input(z.object({ 
      contributionId: z.string().uuid(),
      action: z.enum(['approve', 'reject', 'refund'])
    }))
    .mutation(async ({ input }) => {
      return contributionService.manageContribution(
        input.contributionId,
        input.action
      );
    }),

  getContributionsForItem: protectedProcedure
    .input(z.object({ itemId: z.string().uuid() }))
    .query(async ({ input }) => {
      const contributions = await contributionService.getContributionsForItem(input.itemId);
      return { success: true, data: contributions };
    })
});