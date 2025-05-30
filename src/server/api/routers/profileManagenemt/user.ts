import {z} from "zod";
import {db} from "~/server/db";
import {protectedProcedure, createTRPCRouter} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  get: protectedProcedure
    .query(async ({ctx}) => {
      const user = await db.user.findUnique({
        where: {
          username: ctx.session!.user!.id,
        },
        select: {
          username: true,
          fname: true,
          lname: true,
          id: true,
          email: true,
          //iban: true,
          pictureUrl: true,
        },
      });

      if(!user){
        throw new Error("User not found");
      }
      return user;
    }),

  update: protectedProcedure
    .input(z.object({
      fname: z.string().optional(),
      lname: z.string().optional(),
      username: z.string().optional(),
      email: z.string().email(),
      iban: z.string().optional()
    }))

    .mutation(async ({input, ctx}) => {
      const updatedUser = await db.user.update({
        where: {
          username: ctx.session!.user!.id,
        },
        data: {
          fname: input.fname!,
          lname: input.lname!,
          id: input.username!,
          email: input.email,
          //iban: input.iban!,
        }
      });
      return updatedUser;
    }),

  delete: protectedProcedure
    .mutation(async ({ctx}) => {
      const user = await db.user.delete({
        where: {
          username: ctx.session!.user!.id,
        },
      });
      return {
        success: true,
      };
    })
})