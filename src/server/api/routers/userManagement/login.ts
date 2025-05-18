import {z} from "zod";
import {createTRPCRouter, publicProcedure} from "~/server/api/trpc";
import * as bcrypt from "bcrypt";
import {TRPCError} from "@trpc/server";



const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password must not be empty!")
});

export const loginRouter = createTRPCRouter({

  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({input, ctx}) => {
        const {email, password} = input;

        const user = await ctx.db.user.findFirst({
          where: {
            email: input.email,
          },
        });

        if(!user){
          throw new TRPCError({
              code: "NOT_FOUND",
              message: "User not found",
          });
        }

        if(!user.password){
          throw new TRPCError({
              code: "BAD_REQUEST",
              message: "User has no password",
          });
        }




        const passwordMatch = await bcrypt.compare(password, user.password);

        if(!passwordMatch){
          throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Passwords don't match",
          });
        }

      const { password:_, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
      };
    })
})