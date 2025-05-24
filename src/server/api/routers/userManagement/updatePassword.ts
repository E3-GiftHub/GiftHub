import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import * as bcrypt from "bcrypt";

const updatePasswordSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  message: "PASSWORDS DON'T MATCH",
  path: ["confirmPassword"],
});


export const updatePasswordRouter = createTRPCRouter({
  update: publicProcedure
    .input(updatePasswordSchema)
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.db.user.findUnique({
        where:{
          email: input.email,
        }
      })

      if(!user){
        throw new Error("User not found");
      }

      const hashPasswd = await bcrypt.hash(input.password, 10);

      const updatedUser = await ctx.db.user.update({
        where:{email: input.email},
        data: {password: hashPasswd},
      });

      return{
        success: true,
      };
    }),
});