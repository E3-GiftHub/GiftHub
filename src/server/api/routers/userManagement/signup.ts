import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import * as bcrypt from "bcrypt";
import crypto from "crypto";
import { TRPCError } from "@trpc/server";
import { sendEmail } from "~/server/email";
import { EMAIL_CONFIG } from "~/server/config/email";

const signupSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
});

export const signupRouter = createTRPCRouter({
  signup: publicProcedure
    .input(signupSchema)
    .mutation(async ({ input, ctx }) => {
      if (input.password !== input.confirmPassword) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Passwords don't match",
        });
      }

      const existingUser = await ctx.db.user.findFirst({
        where: {
          OR: [
            { username: input.username },
            { email: input.email }
          ],
        },
      });

      if (existingUser) {
        if (existingUser.username === input.username) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Username already exists",
          });
        }
        if (existingUser.email === input.email) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email already exists",
          });
        }
      }

      const hashPasswd = await bcrypt.hash(input.password, 10);

      // Generate secure email verification token
      const emailToken = crypto.randomBytes(32).toString("hex");
      const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await ctx.db.user.create({
        data: {
          id: input.username,
          username: input.username,
          email: input.email,
          password: hashPasswd,
          fname: null,
          lname: null,
          stripeConnectId: null,
          pictureUrl: "/UserImages/default_pfp.svg",
          emailToken,
          tokenExpires,
          emailVerified: null, // Will be set when email is verified
        },
      });

      // Send email verification instead of welcome email
      let emailSent = false;
      try {
        const verificationLink = `${EMAIL_CONFIG.APP_URL}/verify-email?token=${emailToken}`;
        const logoUrl = `${EMAIL_CONFIG.APP_URL}/logo.png`;
        const appUrl = EMAIL_CONFIG.APP_URL;

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
                      Welcome to GiftHub! 🎁
                    </h2>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
                      Thank you for signing up! Please verify your email address to complete your account setup and start using GiftHub.
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
                      If you didn't create this account, you can safely ignore this email.
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
Welcome to GiftHub! 🎁

Thank you for signing up! Please verify your email address to complete your account setup and start using GiftHub.

Verification link: ${verificationLink}

⚠️ This link will expire in 24 hours for security reasons.

If you didn't create this account, you can safely ignore this email.

Visit GiftHub: ${appUrl}
          `.trim(),
        });

        emailSent = true;
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        emailSent = false;
      }

      return {
        success: true,
        emailSent,
        message: emailSent 
          ? "Account created successfully. Please check your email to verify your account." 
          : "Account created but verification email could not be sent. Please try resending verification.",
      };
    }),
});
