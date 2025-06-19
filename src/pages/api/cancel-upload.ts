import type { NextApiRequest, NextApiResponse } from "next";
import { utapi } from "~/server/uploadthing";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { key } = req.body as { key: string };
  await utapi.deleteFiles(key);

  return res.status(200).json({ error: "No error" });
}
