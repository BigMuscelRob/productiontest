import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST() {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch all users in groups
    const players = await sql`
      SELECT id, name, group_name 
      FROM users 
      WHERE group_name IS NOT NULL 
      ORDER BY group_name ASC, name ASC
    ` as { id: string, name: string, group_name: string }[];

    if (players.length === 0) {
      return NextResponse.json({ message: "Keine Spieler in Gruppen gefunden." }, { status: 400 });
    }

    // 2. Select top 2 per group
    const grouped = players.reduce((acc, p) => {
      if (!acc[p.group_name]) acc[p.group_name] = [];
      acc[p.group_name].push(p);
      return acc;
    }, {} as Record<string, typeof players>);

    const bracketPlayers: typeof players = [];
    Object.values(grouped).forEach(groupPlayers => {
      // take top 2
      bracketPlayers.push(...groupPlayers.slice(0, 2));
    });

    const totalPlayers = bracketPlayers.length;
    if (totalPlayers === 0) {
        return NextResponse.json({ message: "Keine Spieler für das Bracket gefunden." }, { status: 400 });
    }

    // Determine the bracket size (1, 2, 4, 8, 16 matches for start phase)
    // totalPlayers = e.g. 16 -> startMatchesCount = 8.
    // If totalPlayers = 8 -> startMatchesCount = 4
    let startMatchesCount = 1;
    while (startMatchesCount * 2 < totalPlayers) {
      startMatchesCount *= 2;
    }

    let phases = [];
    let current = startMatchesCount;
    while(current >= 1) {
      if (current === 16) phases.push('sechzehntelfinale');
      else if (current === 8) phases.push('achtelfinale');
      else if (current === 4) phases.push('viertelfinale');
      else if (current === 2) phases.push('halbfinale');
      else if (current === 1) phases.push('finale');
      else phases.push(`round_of_${current * 2}`);
      current = current / 2;
    }

    // Delete existing bracket
    await sql`DELETE FROM matches WHERE phase IS NOT NULL`;

    // 4. Generate pairs
    const startPhaseName = phases[0];
    
    // We linearly map players into the matches for the start phase.
    for (let i = 0; i < startMatchesCount; i++) {
        const p1 = bracketPlayers[i * 2] || null;
        const p2 = bracketPlayers[i * 2 + 1] || null;
        
        await sql`
          INSERT INTO matches (player1_id, player2_id, phase, bracket_position)
          VALUES (${p1?.id || null}, ${p2?.id || null}, ${startPhaseName}, ${i + 1})
        `;
    }

    // Generate upcoming phases empty
    for (let i = 1; i < phases.length; i++) {
      const phaseName = phases[i];
      const matchCountForPhase = startMatchesCount / Math.pow(2, i);
      for (let j = 1; j <= matchCountForPhase; j++) {
        await sql`
          INSERT INTO matches (phase, bracket_position)
          VALUES (${phaseName}, ${j})
        `;
      }
    }

    return NextResponse.json({ message: "K.O. Phase erfolgreich generiert!" }, { status: 200 });

  } catch (error) {
    console.error("Generate Bracket Error:", error);
    return NextResponse.json({ message: "Server-Fehler." }, { status: 500 });
  }
}
