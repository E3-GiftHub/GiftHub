import {z} from "zod";
import {createTRPCRouter, publicProcedure} from "~/server/api/trpc";
import * as bcrypt from "bcrypt";
import {TRPCError} from "@trpc/server";
//import {serialize} from "cookie";
//import {randomUUID} from "crypto"
//import jwt from "jsonwebtoken";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean().default(false),
});

export const loginRouter = createTRPCRouter({
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({input, ctx}) => {
        const {email, password, rememberMe} = input;

        const user = await ctx.db.user.findFirst({
          where: {
            email: input.email,
          },
          select: {
            username: true,
            email: true,
            password: true,
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



        const sessionToken = `${email}:${user.username}`;
        //const expiresIn = rememberMe ? "30d" : "1h";
        const expires = new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 : 0));

        await ctx.db.session.create({
          data: {
            sessionToken,
            expires,
            user:
              {
                connect:
                  {
                    email: user.email!,
                  }
              }
          }
        });

        return {
          success: true,
          sessionToken,
          expires: expires.toISOString(),
        };
    }),

})