import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const username = String(req.query.username);
  if (!username) return res.status(400).json({ error: "Missing parameters" });

  const user = await db.user.findUnique({
    where: { username: username },
    select: {
      username: true,
      email: true,
      fname: true,
      lname: true,
      pictureUrl: true,
    },
  });

  if (!user) return res.status(404).json({ error: "User not found" });

  return res.status(200).json({
    username: user.username,
    email: user.email,
    fname: user.fname,
    lname: user.lname,
    pictureUrl: user.pictureUrl,
  });
}