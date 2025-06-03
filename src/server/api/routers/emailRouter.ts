import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { sendEmail } from "~/server/email";

export const emailRouter = createTRPCRouter({
    send: publicProcedure
        .input(z.object({
            to: z.string().email(),
            subject: z.string().min(1),
            html: z.string().optional(),
            text: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
            if (!input.html && !input.text) {
                throw new Error("Trebuie să specifici html sau text");
            }

            const result = await sendEmail(input);

            if (!result.success) {
                throw new Error("Eroare la trimiterea email-ului");
            }

            return {
                success: true,
                messageId: result.messageId,
                message: "Email trimis cu succes"
            };
        }),
});