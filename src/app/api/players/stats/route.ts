import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const stats = await sql`
      SELECT 
        u.id, 
        u.name, 
        u.username,
        u.group_name,
        COUNT(m.id)::int as games_played,
        SUM(CASE 
              WHEN (m.player1_id = u.id AND m.player1_score > m.player2_score) THEN 1 
              WHEN (m.player2_id = u.id AND m.player2_score > m.player1_score) THEN 1 
              ELSE 0 
            END)::int as games_won,
        SUM(CASE WHEN m.player1_id = u.id THEN m.player1_score ELSE 0 END)::int +
        SUM(CASE WHEN m.player2_id = u.id THEN m.player2_score ELSE 0 END)::int as total_points_scored,
        SUM(CASE WHEN m.player1_id = u.id THEN m.player2_score ELSE 0 END)::int +
        SUM(CASE WHEN m.player2_id = u.id THEN m.player1_score ELSE 0 END)::int as total_points_conceded
      FROM users u
      LEFT JOIN matches m ON (m.player1_id = u.id OR m.player2_id = u.id) AND m.status = 'completed'
      WHERE u.role = 'player'
      GROUP BY u.id, u.name, u.username, u.group_name
      ORDER BY games_won DESC, total_points_scored DESC, games_played ASC;
    `;

    return NextResponse.json({ stats }, { status: 200 });
  } catch (error) {
    console.error("Error fetching player stats:", error);
    return NextResponse.json({ message: "Fehler beim Laden der Spieler-Statistiken." }, { status: 500 });
  }
}
