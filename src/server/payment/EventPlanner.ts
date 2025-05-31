import { db as prisma } from "@/server/db";
import { EventEntity } from "./Event";
import { EventManagementException } from "./EventManagementException";
import type { User } from "@prisma/client";
import { StatusType } from "@prisma/client";
import { stripe } from "@/server/stripe";

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
    });

    if (!user) {
      throw new EventManagementException(
        `User with username '${data.createdBy}' not found.`
      );
    }

    let userWithStripe: User = user;

    if (!userWithStripe.stripeConnectId) {
      const userEmailForStripe = userWithStripe.email ? userWithStripe.email : undefined;

      const accountObject = await stripe.accounts.create({
        type: "express",
        country: "RO",
        email: userEmailForStripe,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      userWithStripe = await prisma.user.update({
        where: { username: userWithStripe.username },
        data: { stripeConnectId: accountObject.id },
      });
    }

    const eventRecord = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        date: data.date,
        time: data.time,
        createdByUsername: data.createdBy,
      },
    });

    return new EventEntity(eventRecord);
  }

  async removeEvent(eventId: number): Promise<void> {
    await prisma.event.delete({ where: { id: eventId } });
  }

  async sendInvitation(eventId: number, guestUsername: string): Promise<void> {
    const guestExists = await prisma.user.findUnique({
      where: { username: guestUsername },
    });

    if (!guestExists) {
      throw new EventManagementException(
        `Guest with username '${guestUsername}' does not exist.`
      );
    }

    const eventExists = await prisma.event.findUnique({
        where: { id: eventId }
    });

    if (!eventExists) {
        throw new EventManagementException(`Event with ID ${eventId} does not exist.`);
    }

    await prisma.invitation.create({
      data: {
        eventId: eventId,
        guestUsername: guestUsername,
        status: StatusType.PENDING,
      },
    });
  }

  async manageWishlist(eventId: number) {
    const wishlist = await prisma.eventArticle.findMany({
        where: { eventId: eventId },
        include: { item: true },
    });
    return wishlist;
  }

  async viewAnalytics(eventId: number) {
    const inviteCount = await prisma.invitation.count({
      where: { eventId: eventId },
    });
    const acceptedCount = await prisma.invitation.count({
      where: { eventId: eventId, status: StatusType.ACCEPTED },
    });

    return {
      inviteCount,
      accepted: acceptedCount,
    };
  }

  async manageGallery(eventId: number) {
    return await prisma.media.findMany({ where: { eventId: eventId } });
  }

  async receiveContribution(eventId: number) {
    return await prisma.contribution.findMany({
      where: { eventId: eventId },
    });
  }
}