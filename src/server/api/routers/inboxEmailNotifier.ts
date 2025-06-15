import { sendInboxNotificationEmail } from "../../services/InboxEmailNotifications";
import { db as prisma } from "~/server/db";

/**
 * Send email notification when someone contributes to an event
 */
export async function notifyEventOwnerOfContribution(
  eventId: number,
  contributorUsername: string,
  itemName: string,
  amount: number,
  currency: string
) {
  console.log(`Starting contribution notification for event ${eventId}, contributor: ${contributorUsername}, item: ${itemName}, amount: ${amount} ${currency}`);
  
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { 
        createdByUsername: true, 
        title: true,
        id: true 
      },
    });

    if (!event) {
      console.log(`Event ${eventId} not found for contribution notification`);
      return;
    }

    console.log(`Found event: ${event.title}, owner: ${event.createdByUsername}`);

    const contributor = await prisma.user.findUnique({
      where: { username: contributorUsername },
      select: { fname: true, lname: true },
    });

    const contributorName = contributor?.fname 
      ? `${contributor.fname} ${contributor.lname ?? ''}`
      : contributorUsername;

    console.log(`Sending email notification to ${event.createdByUsername} about contribution from ${contributorName}`);

    await sendInboxNotificationEmail({
      recipientUsername: event.createdByUsername,
      type: 'contribution',
      eventTitle: event.title ?? 'Untitled Event',
      eventId: event.id,
      actorName: contributorName,
      amount: `${amount} ${currency}`,
      itemName: itemName,
    });

    console.log(`Email notification sent successfully for contribution`);
  } catch (error) {
    console.error('Failed to notify event owner of contribution:', error);
  }
}

/**
 * Send email notification when someone marks an item as purchased
 */
export async function notifyEventOwnerOfPurchase(
  eventId: number,
  purchaserUsername: string,
  itemName: string
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { 
        createdByUsername: true, 
        title: true,
        id: true 
      },
    });

    if (!event) return;

    const purchaser = await prisma.user.findUnique({
      where: { username: purchaserUsername },
      select: { fname: true, lname: true },
    });

    const purchaserName = purchaser?.fname 
      ? `${purchaser.fname} ${purchaser.lname ?? ''}`
      : purchaserUsername;

    await sendInboxNotificationEmail({
      recipientUsername: event.createdByUsername,
      type: 'purchase',
      eventTitle: event.title ?? 'Untitled Event',
      eventId: event.id,
      actorName: purchaserName,
      itemName: itemName,
    });
  } catch (error) {
    console.error('Failed to notify event owner of purchase:', error);
  }
}

/**
 * Send email notification when someone accepts/declines an invitation
 */
export async function notifyEventOwnerOfInvitationResponse(
  eventId: number,
  guestUsername: string,
  status: 'ACCEPTED' | 'DECLINED'
) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { 
        createdByUsername: true, 
        title: true,
        id: true 
      },
    });

    if (!event) return;

    const guest = await prisma.user.findUnique({
      where: { username: guestUsername },
      select: { fname: true, lname: true },
    });

    const guestName = guest?.fname 
      ? `${guest.fname} ${guest.lname ?? ''}`
      : guestUsername;

    const notificationType = status === 'ACCEPTED' ? 'invitation_accepted' : 'invitation_declined';

    await sendInboxNotificationEmail({
      recipientUsername: event.createdByUsername,
      type: notificationType,
      eventTitle: event.title ?? 'Untitled Event',
      eventId: event.id,
      actorName: guestName,
    });
  } catch (error) {
    console.error('Failed to notify event owner of invitation response:', error);
  }
}

/**
 * Send email notification when someone receives a new invitation
 */
export async function notifyUserOfNewInvitation(
  guestUsername: string,
  hostUsername: string,
  eventTitle: string,
  eventId: number
) {
  try {
    const host = await prisma.user.findUnique({
      where: { username: hostUsername },
      select: { fname: true, lname: true },
    });

    const hostName = host?.fname 
      ? `${host.fname} ${host.lname ?? ''}`
      : hostUsername;

    await sendInboxNotificationEmail({
      recipientUsername: guestUsername,
      type: 'invitation_received',
      eventTitle: eventTitle,
      eventId: eventId,
      actorName: hostName,
    });
  } catch (error) {
    console.error('Failed to notify user of new invitation:', error);
  }
}