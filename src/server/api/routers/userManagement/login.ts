import {z} from "zod";
import {createTRPCRouter, publicProcedure} from "~/server/api/trpc";
import * as bcrypt from "bcrypt";
import {TRPCError} from "@trpc/server";
import {serialize} from "cookie";



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

      const session = await ctx.db.session.create({
        data: {
          sessionToken: user.email!,
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          user:{
            connect:{
              id: user.id!,
            }
          }
        }
      })

      const { password:_, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        sessionToken: session.sessionToken,
      };
    })
})