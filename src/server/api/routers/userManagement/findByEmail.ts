import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const findByEmailSchema = z.object({
  email: z.string().email(),
});

export const recoveryRouter = createTRPCRouter({
  findByEmail: publicProcedure
    .input(findByEmailSchema)
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          email: input.email,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return {
        success: true,
      };
    }),
});
