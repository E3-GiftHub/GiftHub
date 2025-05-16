// /pages/api/user/delete.ts
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

interface DeleteRequestBody {
  username: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username } = req.body as DeleteRequestBody;

  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "Invalid username" });
  }

  try {
    console.log(`Deleting user with username: ${username}`);

    // Delete the user from the database
    const user = await prisma.user.delete({
      where: { username },
    });

    return res.status(200).json({ message: "Account deleted successfully", user });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ error: "Failed to delete account" });
  } finally {
    await prisma.$disconnect();
  }
}
