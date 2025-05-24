import { db as prisma } from "~/server/db";
import type { Event } from "@prisma/client";
import { StatusType } from "@prisma/client";

export class EventEntity {
  private data: Event;

  constructor(event: Event) {
    this.data = event;
  }
/*  Depricated
  static async publishEvent(eventId: number): Promise<void> {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new Error("Event not found");
    // Logic to make event visible, if needed
  }
*/
  async addGuest(guestId: string): Promise<void> {
    await prisma.invitation.create({
      data: {
        eventId: this.data.id,
        guestUsername: guestId,
        status: StatusType.PENDING,
        
      },
    });
  }

  get raw(): Event {
    return this.data;
  }
}
