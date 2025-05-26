// app/api/payment/progress/route.ts (sau calea ta specifică)

import { db } from "@/server/db"; // Clientul tău Prisma
import { NextRequest, NextResponse } from "next/server"; // Folosim NextRequest pentru acces facil la URL

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

    // --- CALCULAREA TOTALULUI PENTRU eventId SPECIFIC ---
    const totalAggregation = await db.contribution.aggregate({
      _sum: {
        cashAmount: true,
      },
      where: {
        eventId: eventId, // Filtrează contribuțiile pentru eventId-ul specificat
      },
    });

    // Convertește Decimal în Number sau 0 dacă nu există contribuții
    const total = totalAggregation._sum.cashAmount
      ? Number(totalAggregation._sum.cashAmount)
      : 0;

    // --- CALCULAREA GOAL-ULUI PENTRU eventId SPECIFIC ---
    const eventArticles = await db.eventArticle.findMany({
      where: {
        eventId: eventId, // Găsește articolele pentru eventId-ul specificat
      },
      include: {
        item: { // 'item' este numele relației către ItemCatalogue în modelul EventArticle
          select: {
            price: true, // Selectează doar câmpul 'price' din ItemCatalogue
          },
        },
      },
    });

    let calculatedGoal = 0;
    if (eventArticles) {
      for (const article of eventArticles) {
        // Verifică dacă articolul, prețul și cantitatea solicitată sunt definite
        if (
          article.item &&
          article.item.price != null && // Prețul poate fi Decimal? deci verificăm null
          article.quantityRequested != null // Cantitatea poate fi Int? deci verificăm null
        ) {
          // Prisma returnează Decimal ca un tip special; convertim la Number pentru calcule
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
    console.error(`Eroare la preluarea progresului pentru eventId ${eventIdForError}:`, error);
    
    const errorMessage = error instanceof Error ? error.message : "A apărut o eroare necunoscută.";
    return NextResponse.json(
      { message: "A eșuat preluarea progresului plății.", error: errorMessage },
      { status: 500 }
    );
  }
}