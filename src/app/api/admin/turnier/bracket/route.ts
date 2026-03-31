import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { matchId, player1Id, player2Id } = await req.json();

    if (!matchId) {
      return NextResponse.json({ message: "Fehlende Match-ID" }, { status: 400 });
    }

    await sql`
      UPDATE matches 
      SET 
        player1_id = ${player1Id || null},
        player2_id = ${player2Id || null}
      WHERE id = ${matchId} AND phase IS NOT NULL
    `;

    return NextResponse.json({ message: "Match erfolgreich aktualisiert" }, { status: 200 });
  } catch (error) {
    console.error("Update Bracket Match Error:", error);
    return NextResponse.json({ message: "Server-Fehler." }, { status: 500 });
  }
}
