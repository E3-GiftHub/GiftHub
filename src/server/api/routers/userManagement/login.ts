import {z} from "zod";
import {createTRPCRouter, publicProcedure} from "~/server/api/trpc";
import * as bcrypt from "bcrypt";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginRouter = createTRPCRouter({
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({input, ctx}) => {
        const {email, password} = input;

        const user = await ctx.db.user.findFirst({
          where: {
            email: email,
          },
        });

        if(!user){
          throw new Error("User not found");
        }

        const passwordMatch = await bcrypt.compare(password, user.password!);

        if(!passwordMatch){
          throw new Error("Passwords don't match");
        }

        const { password:_, ...userWithoutPassword } = user;
        return userWithoutPassword;
    })
})