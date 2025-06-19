import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import crypto from "crypto";
import { TRPCError } from "@trpc/server";
import { sendEmail } from "~/server/email";
import { EMAIL_CONFIG } from "~/server/config/email";

export const emailVerificationRouter = createTRPCRouter({
  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db.user.findFirst({
        where: {
          emailToken: input.token,
        },
        select: {
          username: true,
          email: true,
          emailVerified: true,
          emailToken: true,
          tokenExpires: true,
        },
      });

      if (!user?.emailToken || !user.tokenExpires) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "INVALID_TOKEN",
        });
      }

      if (user.tokenExpires < new Date()) {
        // Clean up expired token
        await ctx.db.user.update({
          where: { username: user.username },
          data: { emailToken: null, tokenExpires: null },
        });

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "EXPIRED_TOKEN",
        });
      }

      if (user.emailVerified) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ALREADY_VERIFIED",
        });
      }

      // Mark user as verified
      await ctx.db.user.update({
        where: { username: user.username },
        data: {
          emailVerified: new Date(),
          emailToken: null,
          tokenExpires: null,
        },
      });

      // Send welcome email after successful verification
      try {
        const logoUrl = `${EMAIL_CONFIG.APP_URL}/logo.png`;
        const appUrl = EMAIL_CONFIG.APP_URL;

        await sendEmail({
          to: user.email!,
          subject: "Welcome to GiftHub! 🎁",
          html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to GiftHub</title>
  <style type="text/css">
    table { border-collapse: collapse; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #a078e4 0%, #8d80ec 57%, #738bf8 100%); padding: 40px; text-align: center;">
              <img src="${logoUrl}" alt="GiftHub Logo" style="height: 170px; width: auto; max-width: 300px;" />
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; line-height: 1.3; text-align: center;">
                      🎉 Welcome to GiftHub!
                    </h2>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
                      Your email has been successfully verified! You can now create events, manage wishlists, and share special moments with your friends and family.
                    </p>
                    
                    <!-- Action Button -->
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 30px auto; width: 100%;">
                      <tr>
                        <td style="text-align: center;">
                          <a href="${appUrl}/home" style="display: inline-block; padding: 16px 32px; background-color: #8d80ec; background: linear-gradient(135deg, #a078e4 0%, #8d80ec 57%, #738bf8 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center; min-width: 120px;">
                            Start Using GiftHub
                          </a>
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
                      Welcome to the GiftHub community!
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
🎉 Welcome to GiftHub!

Your email has been successfully verified! You can now create events, manage wishlists, and share special moments with your friends and family.

Start using GiftHub: ${appUrl}/home

Visit GiftHub: ${appUrl}
          `.trim(),
        });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }

      return {
        success: true,
        message: "EMAIL_VERIFIED",
      };
    }),

  resendVerification: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
        select: {
          username: true,
          email: true,
          emailVerified: true,
          emailToken: true,
          tokenExpires: true,
        },
      });

      if (!user) {
        // Don't reveal if email exists or not for security
        return {
          success: true,
          message: "VERIFICATION_SENT",
        };
      }

      if (user.emailVerified) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "ALREADY_VERIFIED",
        });
      }

      // Rate limiting: Only allow resend if there's no existing token or it was created more than 5 minutes ago
      // Check if user already has a valid token that was recently generated
      if (user.emailToken && user.tokenExpires && user.tokenExpires > fiveMinutesAgo) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Please wait 5 minutes before requesting another verification email.",
        });
      }

      // Generate new verification token
      const token = crypto.randomBytes(32).toString("hex");
      const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await ctx.db.user.update({
        where: { email: input.email },
        data: {
          emailToken: token,
          tokenExpires,
        },
      });

      // Send verification email
      const verificationLink = `${EMAIL_CONFIG.APP_URL}/verify-email?token=${token}`;
      const logoUrl = `${EMAIL_CONFIG.APP_URL}/logo.png`;
      const appUrl = EMAIL_CONFIG.APP_URL;

      try {
        await sendEmail({
          to: input.email,
          subject: "Verify your GiftHub email address",
          html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your GiftHub email</title>
  <style type="text/css">
    table { border-collapse: collapse; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #a078e4 0%, #8d80ec 57%, #738bf8 100%); padding: 40px; text-align: center;">
              <img src="${logoUrl}" alt="GiftHub Logo" style="height: 170px; width: auto; max-width: 300px;" />
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; line-height: 1.3; text-align: center;">
                      Verify your email address
                    </h2>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
                      Please click the button below to verify your email address and complete your GiftHub account setup.
                    </p>
                    
                    <!-- Action Button -->
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 30px auto; width: 100%;">
                      <tr>
                        <td style="text-align: center;">
                          <a href="${verificationLink}" style="display: inline-block; padding: 16px 32px; background-color: #8d80ec; background: linear-gradient(135deg, #a078e4 0%, #8d80ec 57%, #738bf8 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center; min-width: 120px;">
                            Verify Email Address
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Security Notice -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #fef3c7; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #f59e0b;">
                      <tr>
                        <td>
                          <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500; text-align: center;">
                            ⚠️ This link will expire in 24 hours for security reasons.
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0; text-align: center;">
                      If you didn't create a GiftHub account, you can safely ignore this email.
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
                      You're receiving this because you signed up for GiftHub.
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
Verify your GiftHub email address

Please verify your email address to complete your GiftHub account setup.

Verification link: ${verificationLink}

⚠️ This link will expire in 24 hours for security reasons.

If you didn't create a GiftHub account, you can safely ignore this email.

Visit GiftHub: ${appUrl}
          `.trim(),
        });

        return {
          success: true,
          message: "VERIFICATION_SENT",
        };
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "EMAIL_SEND_FAILED",
        });
      }
    }),
});
