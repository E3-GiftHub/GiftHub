import { db as prisma } from "~/server/db";
import { EventEntity } from "./Event";
import { StatusType } from "@prisma/client";
//import { generateToken } from "~/utils/token";
import type { User } from "@prisma/client";
import { EventManagementException } from "./EventManagementException";
import { nanoid } from "nanoid";
import { stripe } from "@/server/stripe";

export class EventPlanner {
  async createEvent(data: {
    title: string;
    description: string;
    date: Date;
    location: string;
    createdBy: string;
  }): Promise<EventEntity> {
    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        date: data.date,
        token: nanoid(12),
        createdByUsername: data.createdBy,
        /*
	user: {
          connect: { username: data.createdBy },
          //connectOrCreate: {
            //where: { username: data.createdBy },
            //create: { username: data.createdBy },
          //},
        },
	*/
      },
    });
    const user = await prisma.user.findUnique({
      where: { username: data.createdBy },
    });

    if (!user) {
          throw new EventManagementException(
            `User with username '${data.createdBy}' not found.`
          );
        }    let userWithStripe: User = user;
    
        if (!userWithStripe.stripeConnectId) {
          const userEmailForStripe = userWithStripe.email ?? undefined;
    
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

    return new EventEntity(event);
  }

  async removeEvent(eventId: number): Promise<void> {
    await prisma.event.delete({ where: { id: eventId } });
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
