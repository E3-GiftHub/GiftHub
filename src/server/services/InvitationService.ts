// InvitationService.ts

// InvitationService.ts
import type { InvitationDTO } from "./InvitationDTO";

export class InvitationService {
  private invitations = new Map<string, InvitationDTO>();

  /**
   * List all invitations for an event.
   */
  listInvitations(
    eventIdentifier: string
  ): { success: true; data: InvitationDTO[] } {
    const data = Array.from(this.invitations.values())
      .filter((inv) => inv.eventIdentifier === eventIdentifier);
    return { success: true, data };
  }

  /**
   * Remove a guest's invitation from an event.
   */
  removeInvitation(
    eventIdentifier: string,
    guestIdentifier: string
  ): { success: boolean; error?: string } {
    // Find the matching invitation
    const entry = Array.from(this.invitations.entries())
      .find(([_, inv]) =>
        inv.eventIdentifier === eventIdentifier &&
        inv.guestIdentifier === guestIdentifier
      );

    if (!entry) {
      return { success: false, error: "Invitation not found." };
    }

    this.invitations.delete(entry[0]);
    return { success: true };
  }

  /**
   * (Helper) Create a new invitation.
   * In a real app, you'd call this when sending invites.
   */
  createInvitation(data: Omit<InvitationDTO, "invitationId" | "createdAt">) {
    const invitationId = crypto.randomUUID();
    const inv: InvitationDTO = {
      invitationId,
      ...data,
      status: "pending",
      createdAt: new Date(),
    };
    this.invitations.set(invitationId, inv);
    return { success: true, data: inv };
  }
}
