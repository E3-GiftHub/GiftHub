import { db as prisma } from "~/server/db";
import type { Invitation } from "@prisma/client";



export class InvitationEntity {
  private data: Invitation;

  constructor(invite: Invitation) {
    this.data = invite;
  }

  static async getByEvent(eventId: bigint): Promise<InvitationEntity[]> {
    const invites = await prisma.invitation.findMany({
      where: { eventId: eventId },
    });
    return invites.map(i => new InvitationEntity(i));
  }

  get status(): string {
    return this.data.status;
  }

  get invitedAt(): Date {
    return this.data.createdAt;
  }

  get raw(): Invitation {
    return this.data;
  }
}
