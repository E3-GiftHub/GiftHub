import type{ NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Simulate logged-in user (replace with real auth later)
  const fakeUserId = "clv8xyz123abc456"; // Replace with session later

  if (!fakeUserId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  try {
    const user = await db.user.findUnique({
      where: { id: fakeUserId },
      select: {
        email: true,
        name: true,
        image: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Safely combine fname and lname into a full name if needed
    const fullName = `${user.name}`; // or whatever you use to combine fname and lname

    return res.status(200).json({
      email: user.email,
      name: fullName,
      image: user.image as string,
    });
  } catch (error) {
    // Handle the error more safely, with type assertion if needed
    if (error instanceof Error) {
      console.error("Error fetching user profile:", error.message);
      return res.status(500).json({ error: error.message });
    }

    // Catch any other errors that are not instances of Error
    console.error("Unexpected error during user profile fetch:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
