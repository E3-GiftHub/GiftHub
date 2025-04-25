import { db as prisma } from "~/server/db";
import type { Events, Users } from "@prisma/client";

export class EventEntity {
  private data: Events;

  constructor(event: Events) {
    this.data = event;
  }

  static async publishEvent(eventId: string): Promise<void> {
    const event = await prisma.events.findUnique({ where: { event_id: eventId } });
    if (!event) throw new Error("Event not found");
    // Logic to make event visible, if needed
  }

  async addGuest(userEmail: string): Promise<void> {
    await prisma.invitations.create({
      data: {
        event_id: this.data.event_id,
        guest_email: userEmail,
        status: "pending",
        invited_at: new Date(),
      },
    });
  }

  get raw(): Events {
    return this.data;
  }
}
