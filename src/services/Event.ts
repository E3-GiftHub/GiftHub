import { db as prisma } from "~/server/db";
import type { Event } from "@prisma/client";
import { Status } from "@prisma/client"

export class EventEntity {
  private data: Event;

  constructor(event: Event) {
    this.data = event;
  }

  static async publishEvent(eventId: bigint): Promise<void> {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new Error("Event not found");
    // Logic to make event visible, if needed
  }

  async addGuest(guestId: string): Promise<void> {
    await prisma.invitation.create({
      data: {
        eventId: this.data.id,
        guestId: guestId,
        status: Status.PENDING,
        
      },
    });
  }

  get raw(): Event {
    return this.data;
  }
}
