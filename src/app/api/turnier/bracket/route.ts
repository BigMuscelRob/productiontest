import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const matches = await sql`
      SELECT 
        m.id, 
        m.phase, 
        m.bracket_position,
        m.player1_id,
        m.player2_id,
        m.player1_score,
        m.player2_score,
        m.status,
        u1.name as player1_name,
        u2.name as player2_name
      FROM matches m
      LEFT JOIN users u1 ON m.player1_id = u1.id
      LEFT JOIN users u2 ON m.player2_id = u2.id
      WHERE m.phase IS NOT NULL
      ORDER BY 
        CASE m.phase
          WHEN 'sechzehntelfinale' THEN 1
          WHEN 'achtelfinale' THEN 2
          WHEN 'viertelfinale' THEN 3
          WHEN 'halbfinale' THEN 4
          WHEN 'finale' THEN 5
          ELSE 99
        END ASC,
        m.bracket_position ASC
    `;

    return NextResponse.json({ matches }, { status: 200 });
  } catch (error) {
    console.error("Get Bracket Error:", error);
    return NextResponse.json({ message: "Server-Fehler." }, { status: 500 });
  }
}
