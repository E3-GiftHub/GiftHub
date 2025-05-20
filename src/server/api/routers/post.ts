import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.create({
        data: {
          name: input.name,
<<<<<<< HEAD
          createdBy: { connect: { id: ctx.session.user.id } },
=======
          createdBy: { connect: { username: ctx.session.user.id } },
>>>>>>> c7a2cee4c9484c93229f27457d6e4d4b873f250c
        },
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
<<<<<<< HEAD
      where: { createdBy: { id: ctx.session.user.id } },
=======
      where: { createdBy:  { username: ctx.session.user.id } },
>>>>>>> c7a2cee4c9484c93229f27457d6e4d4b873f250c
    });

    return post ?? null;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
