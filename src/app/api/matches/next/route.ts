import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const nextMatches = await sql`
      SELECT 
        m.*, 
        p1.name as player1_name, p1.username as player1_username,
        p2.name as player2_name, p2.username as player2_username
      FROM matches m
      LEFT JOIN users p1 ON m.player1_id = p1.id
      LEFT JOIN users p2 ON m.player2_id = p2.id
      WHERE m.status = 'pending'
      ORDER BY m.scheduled_time ASC NULLS LAST, m.created_at ASC
      LIMIT 1;
    `;

    if (nextMatches.length === 0) {
      return NextResponse.json({ match: null }, { status: 200 });
    }

    return NextResponse.json({ match: nextMatches[0] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching next match:", error);
    return NextResponse.json({ message: "Fehler beim Laden des nächsten Matches." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Nicht autorisiert." }, { status: 401 });
    }

    const { matchId } = await req.json();

    if (!matchId) {
      return NextResponse.json({ message: "Match ID fehlt." }, { status: 400 });
    }

    const matchCheck = await sql`SELECT player1_id, player2_id FROM matches WHERE id = ${matchId}`;
    if (matchCheck.length === 0) {
      return NextResponse.json({ message: "Match nicht gefunden." }, { status: 404 });
    }

    const isParticipant = session.user.id === matchCheck[0].player1_id || session.user.id === matchCheck[0].player2_id;
    const isAdmin = session.user.role === 'admin';

    if (!isParticipant && !isAdmin) {
      return NextResponse.json({ message: "Du bist nicht berechtigt, dieses Match zu starten." }, { status: 403 });
    }

    const updatedMatch = await sql`
      UPDATE matches
      SET status = 'in_progress'
      WHERE id = ${matchId} AND status = 'pending'
      RETURNING *;
    `;

    if (updatedMatch.length === 0) {
      return NextResponse.json({ message: "Match konnte nicht gestartet werden." }, { status: 400 });
    }

    return NextResponse.json({ message: "Match gestartet.", match: updatedMatch[0] }, { status: 200 });
  } catch (error) {
    console.error("Error starting match:", error);
    return NextResponse.json({ message: "Fehler beim Starten des Matches." }, { status: 500 });
  }
}
