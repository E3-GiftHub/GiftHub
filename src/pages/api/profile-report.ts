import type { NextApiRequest, NextApiResponse } from "next";
import { db as prisma } from "~/server/db";

type RequestBodyRePf = {
  reporter: string;
  userId: string;
  reason: string;
  description: string;
};

// allow description to be null
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { reporter, userId, reason, description } = req.body as RequestBodyRePf;
  if (
    "" === reporter ||
    typeof reporter !== "string" ||
    typeof userId !== "string" ||
    typeof reason !== "string"
  )
    return res.status(400).json({ error: "Invalid request body" });

  await prisma.userReport.create({
    data: {
      reportedByUsername: reporter,
      reportedUsername: userId,
      reason: reason,
      description: description,
    },
  });

  return res.status(200).json({ error: "No error" });
}