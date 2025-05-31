import { db } from "@/server/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventIdString = searchParams.get("eventId");

    if (!eventIdString) {
      return NextResponse.json(
        { message: "Parametrul eventId este obligatoriu în query string." },
        { status: 400 }
      );
    }

    const eventId = parseInt(eventIdString, 10);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { message: "eventId trebuie să fie un număr întreg valid." },
        { status: 400 }
      );
    }

    const totalAggregation = await db.contribution.aggregate({
      _sum: {
        cashAmount: true,
      },
      where: {
        eventId: eventId,
      },
    });

    const total = totalAggregation._sum.cashAmount
      ? Number(totalAggregation._sum.cashAmount)
      : 0;

    const eventArticles = await db.eventArticle.findMany({
      where: {
        eventId: eventId,
      },
      include: {
        item: {
          select: {
            price: true,
          },
        },
      },
    });

    let calculatedGoal = 0;
    if (eventArticles) {
      for (const article of eventArticles) {
        if (
          article.item &&
          article.item.price != null &&
          article.quantityRequested != null
        ) {
          calculatedGoal += Number(article.quantityRequested) * Number(article.item.price);
        }
      }
    }

    return NextResponse.json({
      total: total,
      goal: calculatedGoal,
    });

  } catch (error) {
    const eventIdForError = request.nextUrl.searchParams.get("eventId") || "necunoscut";
    console.error(
      `Eroare server în /api/payment/progress pentru eventId '${eventIdForError}':`, 
      error
    );
    
    const errorMessage = error instanceof Error ? error.message : "A apărut o eroare server necunoscută.";
    return NextResponse.json(
      { message: "A eșuat preluarea progresului plății din cauza unei erori pe server.", error: errorMessage },
      { status: 500 }
    );
  }
}