import { db } from "@/server/db";
import { NextResponse } from "next/server";

const GOAL = 1000; // Adjust as needed

export async function GET() {
  try {
    const result = await db.contribution.aggregate({
      _sum: {
        cashAmount: true,
      },
    });

    // Decimal support: convert to number or fallback to 0
    const total = result._sum.cashAmount
      ? Number(result._sum.cashAmount)
      : 0;

    return NextResponse.json({
      total,
      goal: GOAL,
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return new NextResponse("Failed to fetch progress", { status: 500 });
  }
}
