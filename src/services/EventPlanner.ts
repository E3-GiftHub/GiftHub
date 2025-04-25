import { db as prisma } from "~/server/db";
import { EventEntity } from "./Event";
import { InvitationEntity } from "./Invitation";
import { EventManagementException } from "./EventManagementException";

export class EventPlanner {
  async createEvent(data: {
    title: string;
    description: string;
    date: Date;
    time: Date;
    location: string;
    createdBy: string;
    wishlistEnabled?: boolean;
    galleryEnabled?: boolean;
    moderationEnabled?: boolean;
  }): Promise<EventEntity> {
    const event = await prisma.events.create({
      data: {
        event_id: crypto.randomUUID(),
        created_by: data.createdBy,
        created_at: new Date(),
        title: data.title,
        description: data.description,
        event_date: data.date,
        event_time: data.time,
        location: data.location,
        wishlist_enabled: data.wishlistEnabled ?? false,
        gallery_enabled: data.galleryEnabled ?? false,
        gallery_moderation_enabled: data.moderationEnabled ?? false,
      },
    });

    return new EventEntity(event);
  }

  async removeEvent(eventId: string): Promise<void> {
    await prisma.events.delete({ where: { event_id: eventId } });
  }

  async sendInvitation(eventId: string, guestEmail: string): Promise<void> {
    const exists = await prisma.users.findUnique({ where: { email_address: guestEmail } });
    if (!exists) throw new EventManagementException("Guest does not exist");

    await prisma.invitations.create({
      data: {
        invitation_id: crypto.randomUUID(),
        event_id: eventId,
        guest_email: guestEmail,
        invited_at: new Date(),
        status: "pending",
      },
    });
  }

  async manageWishlist(eventId: string) {
    const wishlist = await prisma.eventItems.findMany({
      where: { event_id: eventId },
      include: { item: true },
    });
    return wishlist;
  }

  async viewAnalytics(eventId: string) {
    const inviteCount = await prisma.invitations.count({ where: { event_id: eventId } });
    const accepted = await prisma.invitations.count({
      where: { event_id: eventId, status: "accepted" },
    });
    const declined = await prisma.invitations.count({
      where: { event_id: eventId, status: "declined" },
    });

    return {
      totalInvites: inviteCount,
      accepted,
      declined,
    };
  }

  async manageGallery(eventId: string) {
    return await prisma.mediaItems.findMany({ where: { event_id: eventId } });
  }

  async receiveContribution(eventId: string) {
    return await prisma.contributions.findMany({ where: { event_id: eventId } });
  }
}
