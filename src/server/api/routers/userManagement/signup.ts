import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import * as bcrypt from "bcrypt";
import {TRPCError} from "@trpc/server";



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
      const {email, password} = input;

      if(input.password !== input.confirmPassword){
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Passwords don't match",
        });
      }


      const existingUser = await ctx.db.user.findFirst({
        where: {
          OR: [
            { email: email }
          ],
        },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already exists",
        });
      }

      const hashPasswd = await bcrypt.hash(password, 10);

      await ctx.db.user.create({
        data:{
          email,
          password: hashPasswd,
          fname: null,
          lname: null,
          iban: null,
          pictureUrl: "/UserImages/default_pgp.svg",
        },
      });

      return{
        success: true,
      }
    })
})