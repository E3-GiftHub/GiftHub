// InvitationRouter.ts

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { InvitationService } from "../../../services/InvitationService"; 
export interface InvitationDTO {
    eventIdentifier: string;
    guestIdentifier: string;
}

const invitationService = new InvitationService();

export const invitationRouter = createTRPCRouter({
  /**
   * GET /invitations?eventIdentifier=...
   */
  listInvitations: publicProcedure
    .input(z.object({ eventIdentifier: z.string() }))
    .query(({ input }: { input: { eventIdentifier: string } }) => {
      const result = invitationService.listInvitations(input.eventIdentifier);
      return { success: true, data: result.data as InvitationDTO[] };
    }),

  /**
   * DELETE /invitations
   * Body: { eventIdentifier, guestIdentifier }
   */
  removeInvitation: publicProcedure
    .input(z.object({
      eventIdentifier: z.string(),
      guestIdentifier: z.string(),
    }))
    .mutation(({ input }: { input: { eventIdentifier: string, guestIdentifier: string } }) => {
      const result = invitationService.removeInvitation(
        input.eventIdentifier,
        input.guestIdentifier
      );
      if (!result.success) {
        throw new Error(result.error);
      }
      return { success: true };
    }),
});
