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

      if (!user?.id) {
        return {
          success: true,
          message: "If that email exists, a reset link has been sent.",
        };
      }

      const token = crypto.randomBytes(32).toString("hex");
      const tokenExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

      try {
        await ctx.db.user.update({
          where: { id: user.id },
          data: {
            emailToken: token,
            tokenExpires,
          },
        });
        console.log("User token updated successfully for user:", user.id); // Log 4
      } catch (dbError) {
        console.error("Database update failed:", dbError); // Log 5
        // Consider returning an error message to the frontend here if you want to explicitly handle DB errors
        throw new Error("Failed to update user record for password reset.");
      }

      const resetLink = `https://your-app.com/reset-password?token=${token}`;

      try {
        await sendEmail({
          to: input.email,
          subject: "Reset your GiftHub password",
          html: `
            <p>You requested a password reset.</p>
            <p><a href="${resetLink}">Click here to reset your password</a></p>
            <p>This link expires in 1 hour.</p>
          `,
          text: `Reset your password using this link: ${resetLink}`,
        });
        console.log("Email sent successfully to:", input.email); // Log 7
      } catch (emailError) {
        console.error("Failed to send email to:", input.email, "Error:", emailError); // Log 8
        // IMPORTANT: If email sending fails, you might still want to return the success message to the user
        // to avoid revealing if an email is registered or not. However, you need to log this error!
        // In a real application, you might use a dedicated error tracking service here.
      }


    return {
        success: true,
        message: "If that email exists, a reset link has been sent.",
      };
    }),
});