import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const findByEmailSchema = z.object({
  email: z.string().email(),
});

export const recoveryRouter = createTRPCRouter({
  findByEmail: publicProcedure
    .input(findByEmailSchema)
    .query(async ({ input, ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          email: input.email,
        },
        select: {
          email: true,
        },
      });

      if(!user){
        throw new Error("User not found");
      }

      return user;
    })
})