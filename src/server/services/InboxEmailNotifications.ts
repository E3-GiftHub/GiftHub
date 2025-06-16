import { sendEmail } from "~/server/email";
import { db as prisma } from "~/server/db";
import { getEmailUrls } from "~/server/config/email";

interface NotificationEmailData {
  recipientUsername: string;
  type: 'contribution' | 'purchase' | 'invitation_received' | 'invitation_accepted' | 'invitation_declined' | 'login_alert' | 'item_goal_reached' | 'payment_confirmation' | 'new_item_added' | 'welcome' | 'account_deleted';
  eventTitle?: string;
  eventId?: number;
  actorName?: string;
  amount?: string;
  itemName?: string;
  loginInfo?: {
    timestamp: string;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
  };
  paymentInfo?: {
    transactionId: string;
    paymentMethod?: string;
    currency: string;
  };
  itemInfo?: {
    goalAmount?: string;
    currentAmount?: string;
    contributors?: number;
    imageUrl?: string;
  };
}

/**
 * Sends an email notification to a user when they receive a new inbox notification
 */
export async function sendInboxNotificationEmail(data: NotificationEmailData) {
  try {
    const recipient = await prisma.user.findUnique({
      where: { username: data.recipientUsername },
      select: {
        email: true,
        fname: true,
        lname: true,
      },
    });

    if (!recipient?.email) {
      console.log(`No email found for user ${data.recipientUsername}`);
      return;
    }

    const { subject, html, text } = generateEmailContent(data, recipient.fname);
    
    await sendEmail({
      to: recipient.email,
      subject,
      html,
      text,
    });

    console.log(`Inbox notification email sent to ${recipient.email} for ${data.type}`);
  } catch (error) {
    console.error('Failed to send inbox notification email:', error);
  }
}

function generateEmailContent(data: NotificationEmailData, recipientFirstName?: string | null) {
  const firstName = recipientFirstName ?? 'there';
  
  const useWishlistView = ['contribution', 'purchase', 'item_goal_reached', 'new_item_added'].includes(data.type);

  const useProfileEdit = data.type === 'login_alert';
  
  const { app: appUrl, inbox: inboxUrl, event: eventUrl, logo: logoUrl } = getEmailUrls(data.eventId, useWishlistView, useProfileEdit);

  let subject: string;
  let mainMessage: string;
  let actionText: string;

  switch (data.type) {
    case 'contribution':
      subject = `New contribution to your event "${data.eventTitle}"`;
      mainMessage = `${data.actorName} contributed ${data.amount} to ${data.itemName ?? 'an item'} for your event "${data.eventTitle}".`;
      actionText = 'View Contribution';
      break;
    
    case 'purchase':
      subject = `Item purchased for your event "${data.eventTitle}"`;
      mainMessage = `${data.actorName} purchased ${data.itemName ?? 'an item'} from your wishlist for "${data.eventTitle}".`;
      actionText = 'View Purchase';
      break;
    
    case 'invitation_received':
      subject = `You've been invited to "${data.eventTitle}"`;
      mainMessage = `${data.actorName} has invited you to their event "${data.eventTitle}".`;
      actionText = 'View Invitation';
      break;
    
    case 'invitation_accepted':
      subject = `${data.actorName} accepted your invitation`;
      mainMessage = `${data.actorName} has accepted your invitation to "${data.eventTitle}".`;
      actionText = 'View Event';
      break;
    
    case 'invitation_declined':
      subject = `${data.actorName} declined your invitation`;
      mainMessage = `${data.actorName} has declined your invitation to "${data.eventTitle}".`;
      actionText = 'View Event';
      break;
    
    case 'login_alert':
      subject = `New login to your GiftHub account`;
      mainMessage = `Someone just logged into your GiftHub account at ${data.loginInfo?.timestamp}. If this wasn't you, please secure your account immediately.`;
      actionText = 'Secure Account';
      break;
    
    case 'item_goal_reached':
      subject = `🎉 Goal reached for "${data.itemName}" in "${data.eventTitle}"!`;
      mainMessage = `Great news! The item "${data.itemName}" has reached its funding goal of ${data.itemInfo?.goalAmount}. Thanks to ${data.itemInfo?.contributors} generous contributor${(data.itemInfo?.contributors ?? 0) > 1 ? 's' : ''}!`;
      actionText = 'View Item';
      break;
    
    case 'payment_confirmation':
      subject = `Payment confirmed for "${data.eventTitle}"`;
      mainMessage = `Your ${data.paymentInfo?.paymentMethod ? data.paymentInfo.paymentMethod + ' ' : ''}payment of ${data.amount} for "${data.itemName}" has been successfully processed. Transaction ID: ${data.paymentInfo?.transactionId}`;
      actionText = 'View Details';
      break;
    
    case 'new_item_added':
      subject = `New item added to "${data.eventTitle}"`;
      mainMessage = `${data.actorName} has added a new item "${data.itemName}" to the wishlist for "${data.eventTitle}". Check it out and consider contributing!`;
      actionText = 'View Item';
      break;
    
    case 'welcome':
      subject = `Welcome to GiftHub! 🎁`;
      mainMessage = `Welcome to GiftHub! We're excited to have you join our community. You can now create events, manage wishlists, and share special moments with your friends and family.`;
      actionText = 'Explore GiftHub';
      break;
    
    case 'account_deleted':
      subject = `Your GiftHub account has been deleted`;
      mainMessage = `Your GiftHub account has been successfully deleted. We're sorry to see you go! If you change your mind, you can always create a new account to rejoin our community.`;
      actionText = 'Create New Account';
      break;
    
    default:
      subject = `New activity on GiftHub`;
      mainMessage = `You have new activity related to "${data.eventTitle}".`;
      actionText = 'View Activity';
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <!--[if mso]>
      <style type="text/css">
        table { border-collapse: collapse; }
      </style>
      <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);">
              <!-- Header with Logo -->
              <tr>
                <td style="background: linear-gradient(135deg, #a078e4 0%, #8d80ec 57%, #738bf8 100%); padding: 40px; text-align: center;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="text-align: center;">
                        <img src="${logoUrl}" alt="GiftHub Logo" style="height: 170px; width: auto; max-width: 300px;" />
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Main Content -->
              <tr>
                <td style="padding: 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td>
                        <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; line-height: 1.3; text-align: center;">
                          Hi ${firstName}! 👋
                        </h2>
                        
                        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
                          ${mainMessage}
                        </p>
                        
                        <!-- Action Buttons -->
                        <table cellpadding="0" cellspacing="0" border="0" style="margin: 30px auto; width: 100%;">
                          <tr>
                            <td style="text-align: center;">
                              ${data.type === 'welcome' ? `
                                <a href="${appUrl}" style="display: inline-block; padding: 16px 32px; background-color: #8d80ec; background: linear-gradient(135deg, #a078e4 0%, #8d80ec 57%, #738bf8 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center; min-width: 120px;">
                                  Go to GiftHub
                                </a>
                              ` : data.type === 'account_deleted' ? `
                                <a href="${appUrl}" style="display: inline-block; padding: 16px 32px; background-color: #8d80ec; background: linear-gradient(135deg, #a078e4 0%, #8d80ec 57%, #738bf8 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center; min-width: 120px;">
                                  ${actionText}
                                </a>
                              ` : `
                              <table cellpadding="0" cellspacing="0" border="0" style="display: inline-block;">
                                <tr>
                                  <td style="padding-right: 15px;">
                                    <a href="${inboxUrl}" style="display: inline-block; padding: 16px 32px; background-color: #8d80ec; background: linear-gradient(135deg, #a078e4 0%, #8d80ec 57%, #738bf8 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center; min-width: 120px; vertical-align: middle;">
                                      View Inbox
                                    </a>
                                  </td>
                                  <td>
                                    <a href="${eventUrl}" style="display: inline-block; padding: 16px 32px; background: #f8f9fa; color: #370062; text-decoration: none; border-radius: 8px; border: 2px solid #e5e7eb; font-weight: 600; font-size: 16px; text-align: center; min-width: 120px; vertical-align: middle;">
                                      ${actionText}
                                    </a>
                                  </td>
                                </tr>
                              </table>
                              `}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background: #f8f9fa; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="text-align: center;">
                        <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0; line-height: 1.5;">
                          You're receiving this because you're part of the GiftHub community.
                        </p>
                        <p style="margin: 0;">
                          <a href="${appUrl}" style="color: #8d80ec; text-decoration: none; font-weight: 500; font-size: 14px;">
                            Visit GiftHub
                          </a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
${subject}

Hi ${firstName}!

${mainMessage}

${data.type === 'welcome' || data.type === 'account_deleted' ? `
🎁 ${data.type === 'welcome' ? 'Go to GiftHub' : actionText}: ${appUrl}
` : `
📧 View your inbox: ${inboxUrl}
🎯 ${actionText}: ${eventUrl}

Event: ${data.eventTitle}
`}
---
You're receiving this because you're part of the GiftHub community.
Visit GiftHub: ${appUrl}
  `.trim();

  return { subject, html, text };
}
