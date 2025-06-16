import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import crypto from "crypto";
import { sendEmail } from "~/server/email";

export const requestResetRouter = createTRPCRouter({
  requestReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        console.log("Email not registered:", input.email);
        return {
          success: true,
          message: "If the email is registered, you'll receive an email.",
        };
      }
      const token = crypto.randomBytes(32).toString("hex");
      const tokenExpires = new Date(Date.now() + 1000 * 60 * 60);

      await ctx.db.user.update({
        where: { email: input.email },
        data: {
          emailToken: token,
          tokenExpires,
        },
      });

      const resetLink = `${EMAIL_CONFIG.APP_URL}/password-reset?token=${token}`;
      console.log("Generated reset link:", resetLink);

      const logoUrl = `${EMAIL_CONFIG.APP_URL}/logo.png`;
      const appUrl = EMAIL_CONFIG.APP_URL;

      await sendEmail({
        to: input.email,
        subject: "Reset your GiftHub password",
        html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset your GiftHub password</title>
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
                          Password Reset Request 🔒
                        </h2>
                        
                        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
                          You requested a password reset for your GiftHub account. Click the button below to set a new password.
                        </p>
                        
                        <!-- Action Button -->
                        <table cellpadding="0" cellspacing="0" border="0" style="margin: 30px auto; width: 100%;">
                          <tr>
                            <td style="text-align: center;">
                              <a href="${resetLink}" style="display: inline-block; padding: 16px 32px; background-color: #8d80ec; background: linear-gradient(135deg, #a078e4 0%, #8d80ec 57%, #738bf8 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center; min-width: 200px;">
                                Reset Your Password
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Security Notice -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #fef3c7; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #f59e0b;">
                          <tr>
                            <td>
                              <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500; text-align: center;">
                                ⚠️ This link will expire in 1 hour for security reasons.
                              </p>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0; text-align: center;">
                          If you didn't request this password reset, you can safely ignore this email. Your password will not be changed.
                        </p>
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
        `,
        text: `
🔒 Reset your GiftHub password

You requested a password reset for your GiftHub account.

Reset your password: ${resetLink}

⚠️ This link will expire in 1 hour for security reasons.

If you didn't request this password reset, you can safely ignore this email.

Visit GiftHub: ${appUrl}
        `.trim(),
      });

      return {
        success: true,
        message: "If the email is registered, you'll receive an email.",
      };
    }),
});
