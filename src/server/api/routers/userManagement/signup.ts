import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import * as bcrypt from "bcrypt";



const signupSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});



export const signupRouter = createTRPCRouter({
  signup: publicProcedure
    .input(signupSchema)
    .mutation(async ({ input, ctx }) => {
      const {email, password} = input;


      const existingUser = await ctx.db.user.findFirst({
        where: {
          OR: [
            { email: email }
          ],
        },
      });

      if (existingUser) {
        throw new Error("User already exists");
      }

      const hashPasswd = await bcrypt.hash(password, 10);

      const newUser = await ctx.db.user.create({
        data:{
          email,
          password: hashPasswd,
          fname: null,
          lname: null,
          iban: null,
          picture: null,
        },
      });

      return{
        success: true,
      }
    })
})