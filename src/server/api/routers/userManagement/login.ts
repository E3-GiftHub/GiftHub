import {z} from "zod";
import {createTRPCRouter, publicProcedure} from "~/server/api/trpc";
import {TRPCError} from "@trpc/server";
import {signIn} from "next-auth/react";

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

       const result = await signIn("credentials", {
         email,
         password,
         redirect: false,
       });

       if(!result?.ok){
         throw new TRPCError({
           code: "BAD_REQUEST",
           message: "Invalid credentials",
           }
         );
       }

       return {
         success: true,
       }
    }),
})