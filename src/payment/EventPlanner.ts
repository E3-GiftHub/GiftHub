import { db as prisma } from "~/server/db";
import { EventEntity } from "./Event";
import { InvitationEntity } from "./Invitation";
import { EventManagementException } from "./EventManagementException";
import { Status } from "@prisma/client"
import { stripe } from "~/server/stripe";


export class EventPlanner {
  async createEvent(data: {
    title: string;
    description: string;
    date: Date;
    time: Date;
    location: string;
    createdBy: string;
  }): Promise<EventEntity> {
    const user = await prisma.user.findUnique({
      where: { username: data.createdBy },
    })

    if (!user.stripeAccountId) {
      const accountObject = await stripe.accounts.create(
          {
            type: 'express',
            country: 'RO',
            email: user.email,

            capabilities: {
              card_payments: { requested: true },
              transfers: { requested: true },
            },
          }
      );

      user = await prisma.user.update({
        where: { username: user.username },
        data:  { stripeAccountId: accountObject.id },
      })
    }

    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        date: data.date,
        time: data.time,
        createdBy: data.createdBy,
      },
    });

    return new EventEntity(event);
  }

  async removeEvent(eventId: bigint): Promise<void> {
    await prisma.event.delete({ where: { id: eventId } });
  }

  async sendInvitation(eventId: bigint, guestId: string): Promise<void> {
    const exists = await prisma.user.findUnique({ where: { id: guestId } });
    if (!exists) throw new EventManagementException("Guest does not exist");

    await prisma.invitation.create({
      data: {
        eventId: eventId,
        guestId: guestId,
        status: Status.PENDING,
        createdAt: new Date(),
      },
    });
  }

  async manageWishlist(eventId: bigint) {
    const wishlist = await prisma.eventItem.findMany({
      where: { eventId: eventId },
      include: { item: true },
    });
    return wishlist;
  }

  async viewAnalytics(eventId: bigint) {
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

  async manageGallery(eventId: bigint) {
    return await prisma.media.findMany({ where: { eventId: eventId } });
  }

  async receiveContribution(eventId: bigint) {
    return await prisma.contribution.findMany({ where: { eventId: eventId } });
  }
}
