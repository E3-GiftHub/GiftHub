import { db as prisma } from "~/server/db";
import { EventEntity } from "~/services/Event";
import { EventManagementException } from "~/services/EventManagementException";
import { Status } from "@prisma/client"


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
        //createdByUsername: data.createdBy,
	user: {
        connect: { username: data.createdBy },
	},
      },
    });

    return new EventEntity(event);
  }

  async removeEvent(eventId: number): Promise<void> {
    await prisma.event.delete({ where: { id: eventId } });
  }

  async sendInvitation(eventId: number, guestId: string): Promise<void> {
    const exists = await prisma.user.findUnique({ where: { username: guestId } });
    if (!exists) throw new EventManagementException("Guest does not exist");

    await prisma.invitation.create({
      data: {
        eventId: eventId,
        guestUsername: guestId,
        status: Status.PENDING,
        createdAt: new Date(),
	//guest:{ connect: { username: guestId }},
	//event:{ connect: { id: eventId } },
      },
    });
  }
/* Depricated
  async manageWishlist(eventId: number) {
    const wishlist = await prisma.eventItem.findMany({
      where: { eventId: eventId },
      include: { item: true },
    });
    return wishlist;
  }

  async viewAnalytics(eventId: number) {
    const inviteCount = await prisma.invitation.count({ where: { eventId: eventId } });
    const accepted = await prisma.invitation.count({
      where: { eventId: eventId, status: Status.ACCEPTED },
    });
    const declined = await prisma.invitation.count({
      where: { eventId: eventId, status: Status.REJECTED },
    });

    return {
      inviteCount,
      accepted,
      declined,
    };
  }

  async manageGallery(eventId: number) {
    return await prisma.media.findMany({ where: { eventId: eventId } });
  }

  async receiveContribution(eventId: number) {
    return await prisma.contribution.findMany({ where: { eventId: eventId } });
  }
*/

}
