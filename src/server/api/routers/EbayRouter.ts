import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { searchEbayProducts } from "~/server/services/EbayApi";

export const ebayRouter = createTRPCRouter({
  search: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      const products = await searchEbayProducts(input.query);
      return products;
    }),
});
