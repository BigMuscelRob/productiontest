import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const matchId = resolvedParams.id;

    const matches = await sql`
      SELECT 
        m.*, 
        p1.name as player1_name, p1.username as player1_username,
        p2.name as player2_name, p2.username as player2_username
      FROM matches m
      LEFT JOIN users p1 ON m.player1_id = p1.id
      LEFT JOIN users p2 ON m.player2_id = p2.id
      WHERE m.id = ${matchId}
    `;

    if (matches.length === 0) {
      return NextResponse.json({ message: "Match nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json({ match: matches[0] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching match:", error);
    return NextResponse.json({ message: "Fehler beim Laden des Matches" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Nicht autorisiert" }, { status: 401 });
    }

    const resolvedParams = await params;
    const matchId = resolvedParams.id;
    const { p1Sets, p2Sets } = await req.json();

    if (p1Sets === undefined || p2Sets === undefined) {
      return NextResponse.json({ message: "Ungültige Daten" }, { status: 400 });
    }

    const matchCheck = await sql`SELECT player1_id, player2_id FROM matches WHERE id = ${matchId}`;
    if (matchCheck.length === 0) {
      return NextResponse.json({ message: "Match nicht gefunden" }, { status: 404 });
    }

    const isParticipant = session.user.id === matchCheck[0].player1_id || session.user.id === matchCheck[0].player2_id;
    const isAdmin = session.user.role === 'admin';

    if (!isParticipant && !isAdmin) {
      return NextResponse.json({ message: "Du bist nur berechtigt, eigene Matches zu speichern." }, { status: 403 });
    }

    const updatedMatch = await sql`
      UPDATE matches
      SET status = 'completed', player1_score = ${p1Sets}, player2_score = ${p2Sets}
      WHERE id = ${matchId}
      RETURNING *;
    `;

    if (updatedMatch.length === 0) {
      return NextResponse.json({ message: "Match konnte nicht aktualisiert werden." }, { status: 400 });
    }

    return NextResponse.json({ message: "Match erfolgreich beendet.", match: updatedMatch[0] }, { status: 200 });
  } catch (error) {
    console.error("Error finishing match:", error);
    return NextResponse.json({ message: "Fehler beim Beenden des Matches." }, { status: 500 });
  }
}
