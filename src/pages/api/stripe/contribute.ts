// File: /pages/api/stripe/contribute.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "app/api/auth/[...nextauth]";

import { createCheckoutLink } from "@/server/services/payment";

type Data = { url: string } | { error: string };

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // 1) Verify user session (server‐side)
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
        return res
            .status(401)
            .json({ error: "Authentication required to create a checkout link." });
    }
    const purchaserUsername = session.user.id as string;

    // 2) Parse & validate body
    const { id, idType, amount, isContribute } = req.body as {
        id: number;
        idType: "eventArticle" | "event";
        amount: number;
        isContribute: boolean;
    };

    if (
        typeof id !== "number" ||
        (idType !== "eventArticle" && idType !== "event") ||
        typeof amount !== "number" ||
        typeof isContribute !== "boolean"
    ) {
        return res.status(400).json({ error: "Invalid request body." });
    }

    try {
        // 3) Create Stripe checkout link
        const { url } = await createCheckoutLink(
            id,
            idType,
            amount,
            isContribute,
            purchaserUsername
        );
        return res.status(200).json({ url });
    } catch (err: any) {
        console.error("Error in createCheckoutLink:", err);
        return res
            .status(500)
            .json({ error: err.message || "Internal server error." });
    }
}
