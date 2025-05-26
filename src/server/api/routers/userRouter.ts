// src/server/api/routers/user.ts
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  getSelf: protectedProcedure.query(async ({ ctx }) => {
    // IMPORTANT: Ajustați clauza 'where' dacă ctx.session.user.id corespunde câmpului 'username' în loc de 'id'
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id }, // Presupune că ctx.session.user.id este User.id
      select: {
        stripeAccountId: true,
        // Puteți selecta și alte câmpuri dacă sunt necesare în altă parte
        // id: true,
        // username: true,
      },
    });

    if (!user) {
      // Acest caz nu ar trebui să apară dacă utilizatorul este autentificat,
      // dar este o măsură de siguranță.
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
    }
    return user; // Returnează { stripeAccountId: string | null }
  }),
});