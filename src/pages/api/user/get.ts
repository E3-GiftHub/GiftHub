import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.query;

  // Check if 'username' exists in the query and is a valid string
  if (!username || typeof username !== "string") {
    console.error("Invalid or missing username in query:", username);
    return res.status(400).json({ error: "Missing or invalid username" });
  }

  try {
    console.log("Fetching user with username:", username);  // Added log for better tracking

    // Query the user from the database using Prisma
    const user = await prisma.user.findUnique({
      where: { username },
    });

    // If user not found, return a 404 error
    if (!user) {
      console.warn("User not found for username:", username);
      return res.status(404).json({ error: "User not found" });
    }

    // Return the user data if found
    console.log("User fetched successfully:", user);
    return res.status(200).json(user);
  } catch (error) {
    // Log the error for debugging
    console.error("Error fetching user from the database:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  } finally {
    // Disconnect the Prisma client
    await prisma.$disconnect();
  }
}
