import type { NextApiRequest, NextApiResponse } from "next";
import { db as prisma } from "~/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const username = String(req.query.username);
  if (!username) return res.status(400).json({ error: "Missing parameters" });

  const stripeAccount = await prisma.user.findUnique({
    where: {
      username: username,
    },
    select: { stripeConnectId: true },
  });

  if (stripeAccount?.stripeConnectId) return res.status(200).json("true");
  return res.status(200).json("false");
}
