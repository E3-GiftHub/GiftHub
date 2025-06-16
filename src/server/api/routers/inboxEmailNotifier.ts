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
  console.log(`Starting purchase notification for event ${eventId}, purchaser: ${purchaserUsername}, item: ${itemName}`);
  
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
      console.log(`Event ${eventId} not found for purchase notification`);
      return;
    }

    console.log(`Found event: ${event.title}, owner: ${event.createdByUsername}`);

    const purchaser = await prisma.user.findUnique({
      where: { username: purchaserUsername },
      select: { fname: true, lname: true },
    });

    const purchaserName = purchaser?.fname 
      ? `${purchaser.fname} ${purchaser.lname ?? ''}`
      : purchaserUsername;

    console.log(`Sending email notification to ${event.createdByUsername} about purchase from ${purchaserName}`);

    await sendInboxNotificationEmail({
      recipientUsername: event.createdByUsername,
      type: 'purchase',
      eventTitle: event.title ?? 'Untitled Event',
      eventId: event.id,
      actorName: purchaserName,
      itemName: itemName,
    });

    console.log(`Email notification sent successfully for purchase`);
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

/**
 * Send email notification when someone logs into the user's account
 */
export async function notifyUserOfLogin(
  username: string,
  loginTimestamp: string,
  ipAddress?: string,
  userAgent?: string,
  location?: string
) {
  console.log(`Starting login notification for user: ${username}, timestamp: ${loginTimestamp}`);
  
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { 
        fname: true, 
        lname: true,
        username: true 
      },
    });

    if (!user) {
      console.log(`User ${username} not found for login notification`);
      return;
    }

    console.log(`Sending login alert email to ${username}`);

    await sendInboxNotificationEmail({
      recipientUsername: username,
      type: 'login_alert',
      loginInfo: {
        timestamp: loginTimestamp,
        ipAddress,
        userAgent,
        location,
      },
    });

    console.log(`Login alert email sent successfully to ${username}`);
  } catch (error) {
    console.error('Failed to notify user of login:', error);
  }
}

/**
 * Send email notification when an item reaches its funding goal
 */
export async function notifyOwnerOfItemGoalReached(
  eventId: number,
  itemName: string,
  goalAmount: string,
  contributors: number
) {
  console.log(`Starting item goal reached notification for event ${eventId}, item: ${itemName}`);
  
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
      console.log(`Event ${eventId} not found for item goal notification`);
      return;
    }

    console.log(`Sending item goal reached notification to ${event.createdByUsername}`);

    await sendInboxNotificationEmail({
      recipientUsername: event.createdByUsername,
      type: 'item_goal_reached',
      eventTitle: event.title ?? 'Untitled Event',
      eventId: event.id,
      itemName,
      itemInfo: {
        goalAmount,
        contributors,
      },
    });

    console.log(`Item goal reached email sent successfully`);
  } catch (error) {
    console.error('Failed to send item goal reached notification:', error);
  }
}

/**
 * Send email notification for payment confirmation
 */
export async function notifyUserOfPaymentConfirmation(
  username: string,
  eventId: number,
  itemName: string,
  amount: string,
  transactionId: string,
  paymentMethod?: string,
  currency = 'RON'
) {
  console.log(`Starting payment confirmation notification for user: ${username}, transaction: ${transactionId}`);
  
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { 
        title: true,
        id: true 
      },
    });

    if (!event) {
      console.log(`Event ${eventId} not found for payment confirmation`);
      return;
    }

    console.log(`Sending payment confirmation to ${username}`);

    await sendInboxNotificationEmail({
      recipientUsername: username,
      type: 'payment_confirmation',
      eventTitle: event.title ?? 'Untitled Event',
      eventId: event.id,
      itemName,
      amount,
      paymentInfo: {
        transactionId,
        paymentMethod,
        currency,
      },
    });

    console.log(`Payment confirmation email sent successfully to ${username}`);
  } catch (error) {
    console.error('Failed to send payment confirmation notification:', error);
  }
}

/**
 * Send email notification when a new item is added to an event
 */
export async function notifyGuestsOfNewItem(
  eventId: number,
  adderUsername: string,
  itemName: string
) {
  console.log(`Starting new item notification for event ${eventId}, item: ${itemName}`);
  
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { 
        title: true,
        id: true,
        invitations: {
          where: { status: 'ACCEPTED' },
          select: { guestUsername: true }
        }
      },
    });

    if (!event) {
      console.log(`Event ${eventId} not found for new item notification`);
      return;
    }

    const adder = await prisma.user.findUnique({
      where: { username: adderUsername },
      select: { fname: true, lname: true },
    });

    const adderName = adder?.fname 
      ? `${adder.fname} ${adder.lname ?? ''}`.trim()
      : adderUsername;

    console.log(`Sending new item notifications to ${event.invitations.length} guests`);

    // Send notification to all accepted guests
    const notifications = event.invitations.map(invitation => 
      sendInboxNotificationEmail({
        recipientUsername: invitation.guestUsername,
        type: 'new_item_added',
        eventTitle: event.title ?? 'Untitled Event',
        eventId: event.id,
        actorName: adderName,
        itemName,
      })
    );

    await Promise.all(notifications);

    console.log(`New item notifications sent successfully to all guests`);
  } catch (error) {
    console.error('Failed to send new item notifications:', error);
  }
}

/**
 * Send welcome email when a new user signs up
 */
export async function notifyUserOfWelcome(
  username: string
) {
  console.log(`Starting welcome notification for new user: ${username}`);
  
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { 
        fname: true, 
        lname: true,
        username: true 
      },
    });

    if (!user) {
      console.log(`User ${username} not found for welcome notification`);
      return;
    }

    console.log(`Sending welcome email to ${username}`);

    await sendInboxNotificationEmail({
      recipientUsername: username,
      type: 'welcome',
    });

    console.log(`Welcome email sent successfully to ${username}`);
  } catch (error) {
    console.error('Failed to send welcome notification:', error);
  }
}

/**
 * Sends an account deletion notification email to a user before their account is deleted
 */
export async function notifyUserOfAccountDeletion(username: string) {
  try {
    console.log(`Starting account deletion notification for user: ${username}`);

    // Get user data first (before deletion)
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        email: true,
        fname: true,
        lname: true,
      },
    });

    if (!user?.email) {
      console.log(`No email found for user ${username} or user not found`);
      return;
    }

    console.log(`Sending account deletion email to ${username}`);

    // Send account deletion notification email
    await sendInboxNotificationEmail({
      recipientUsername: username,
      type: 'account_deleted',
    });

    console.log(`Account deletion email sent successfully to ${username}`);
  } catch (error) {
    console.error(`Failed to send account deletion notification to ${username}:`, error);
  }
}