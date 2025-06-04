import { z } from "zod";
import { db } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    console.log(ctx.session.user.name);

    const user = await db.user.findUnique({
      where: {
        username: ctx.session.user.name!,
      },
      select: {
        username: true,
        fname: true,
        lname: true,
        id: true,
        password: true,
        email: true,
        pictureUrl: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }),

  update: protectedProcedure
    .input(
      z.object({
        fname: z.string().optional(),
        lname: z.string().optional(),
        username: z.string().optional(),
        email: z.string().email(),
      }),
    )

    .mutation(async ({ input, ctx }) => {
      return db.user.update({
        where: {
          username: ctx.session.user.name!,
        },
        data: {
          fname: input.fname!,
          lname: input.lname!,
          //id: input.username!,
          username: input.username!,
          email: input.email,
        },
      });
    }),

  delete: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await db.user.delete({
      where: {
        username: ctx.session.user.name!,
      },
    });
    return {
      success: true,
    };
  }),
});