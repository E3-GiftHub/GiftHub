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

    const resetLink = `https://gifthub-five.vercel.app//reset-password?token=${token}`;
    console.log("Generated reset link:", resetLink);

    await sendEmail({
        to: input.email,
        subject: "Reset your GiftHub password",
        html: `
      <div style="font-family: Heebo, sans-serif; font-size: 14px; color: #333; line-height: 1.6;">
        <p style="margin-bottom: 15px;">You requested a password reset for your GiftHub account.</p>
        <p style="margin-bottom: 20px;">To reset your password, please click the link below:</p>
        <p style="margin-bottom: 20px;">
          <a
            href="${resetLink}"
            style="
                margin-bottom: 0;
                margin-top: 0;
                padding: 0.8em 1.2em;
                background: radial-gradient(circle at bottom right, #a078e4 0%, #8d80ec 57%, #738bf8 100%);
                width: 11em;
                height: 3em;
                border-radius: 10px;
                outline: none;
                border: none;
                color: white;
                font-size: 1.1em;
                font-weight: 600;
                transition: transform 0.1s ease;
                overflow: hidden;
                box-shadow: 0 0 15px rgba(208, 195, 254, 0.5);
                box-sizing: border-box;
                text-decoration: none;
            "
          >
            Reset Your Password
          </a>
        </p>
        <p style="font-size: 12px; color: #777; margin-top: 20px;">
          This link will expire in 1 hour.
        </p>
      </div>
    `,
      text: `Reset your password using this link: ${resetLink}`,
    });

    return {
        success: true,
        message: "If the email is registered, you'll receive an email.",
      };
    }),
});