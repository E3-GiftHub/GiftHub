import { db } from "~/server/db";
import type { NextApiRequest, NextApiResponse } from "next";


// 1. Define a type for incoming data
interface ItemRequestBody {
  id?: number;
  name: string;
  description?: string;
  imagesUrl?: string;
  price?: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 2. Safely cast the body to the defined type
  const body = req.body as ItemRequestBody;

  const { name, description, imagesUrl, price } = body;

  try {
    // 3. Check for existing item
    const existingItem = await db.item.findFirst({
      where: {
        name,
        price,
        description,
      },
    });

    if (existingItem) {
      console.log("📦 Existing item reused:", existingItem.id);
      return res.status(200).json({ itemId: existingItem.id });
    }

    // 4. Create new item
    const newItem = await db.item.create({
      data: {
        name,
        description,
        imagesUrl,
        price,
      },
    });

    console.log("✅ Item created:", newItem);
    return res.status(200).json({ itemId: newItem.id });
  } catch (error) {
    console.error("❌ Failed to create item:", error);
    return res.status(500).json({ error: "Database insert failed" });
  }
}
