import { db } from "~/server/db";
import { stripCurrency } from "~/utils/stripCurrency";
import type { NextApiRequest, NextApiResponse } from "next";
import type { WishlistInputItem } from "~/models/WishlistInputItem";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body as WishlistInputItem;
  const { name, description, photo, key, price, retailer } = body;

  try {
    const existingItem = await db.item.findFirst({
      where: {
        name: name,
        description: description,
        imagesUrl: photo,
      },
    });

    if (existingItem) {
      console.log("📦 Existing item reused:", existingItem.id);
      return res.status(200).json({ itemId: existingItem.id });
    }

    const newItem = await db.item.create({
      data: {
        name: name,
        description: description,
        imagesUrl: photo,
        imagesKey: key,
        price: stripCurrency(price),
        retailerId: retailer,
      },
    });

    console.log("✅ Item created:", newItem);
    return res.status(200).json({ itemId: newItem.id });
  } catch (error) {
    console.error("❌ Failed to create item:", error);
    return res.status(500).json({ error: "Database insert failed" });
  }
}
