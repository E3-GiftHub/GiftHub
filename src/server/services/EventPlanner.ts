import { db as prisma } from "~/server/db";
import { EventEntity } from "./Event";
import { Status } from "@prisma/client";
import { generateToken } from "~/utils/token";
import { EventManagementException } from "./EventManagementException";

export class EventPlanner {
  async createEvent(data: {
    title: string;
    description: string;
    date: Date;
    time: Date;
    location: string;
    createdBy: string;
  }): Promise<EventEntity> {
    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        date: data.date,
        time: data.time,
        token: generateToken(),
        createdByUsername: data.createdBy,
      },
    });

    return new EventEntity(event);
  }

  async removeEvent(eventId: number): Promise<void> {
    await prisma.event.delete({ where: { id: eventId } });
  }

  async sendInvitation(eventId: number, guestUsername: string): Promise<void> {
    const exists = await prisma.user.findUnique({ 
      where: { username: guestUsername } 
    });
    
    if (!exists) throw new EventManagementException("Guest does not exist");

    await prisma.invitation.create({
      data: {
        eventId: eventId,
        guestUsername: guestUsername,
        status: Status.PENDING,
      },
    });
  }

  async getEventGuests(eventId: number) {
    return await prisma.invitation.findMany({
      where: { eventId: eventId },
      include: { guest: true },
    });
  }
}