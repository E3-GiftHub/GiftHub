// src/pages/api/item-create.ts
import { db } from "~/server/db"; // or wherever your prisma instance is
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("Incoming body:", req.body); // debug

    const { id, ...safeData } = req.body;
    try{
        const existingItem = await db.item.findFirst({
        where: {
            name : safeData.name,
            price: safeData.price,
            description: safeData.description,
            },
         });

    if (existingItem) {
      console.log("📦 Existing item reused:", existingItem.id);
      return res.status(200).json({ itemId: existingItem.id });
    }

        const newItem = await db.item.create({
        data: {
            name: safeData.name,
            description: safeData.description,
            imagesUrl: safeData.imagesUrl,
            price: safeData.price,
            },
        });

    console.log("✅ Item created:", newItem);
    return res.status(200).json({ itemId: newItem.id });
  } catch (error) {
    console.error("❌ Failed to create item:", error);
    return res.status(500).json({ error: "Database insert failed" });
  }
}
