import { db as prisma } from "~/server/db";
import type { Invitations } from "@prisma/client";

export class InvitationEntity {
  private data: Invitations;

  constructor(invite: Invitations) {
    this.data = invite;
  }

  static async getByEvent(eventId: string): Promise<InvitationEntity[]> {
    const invites = await prisma.invitations.findMany({
      where: { event_id: eventId },
    });
    return invites.map(i => new InvitationEntity(i));
  }

  get status(): string {
    return this.data.status;
  }

  get invitedAt(): Date {
    return this.data.invited_at;
  }

  get raw(): Invitations {
    return this.data;
  }
}
