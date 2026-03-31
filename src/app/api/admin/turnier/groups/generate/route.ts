import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST() {
  try {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Fetch all players
    const players = await sql`SELECT id FROM users WHERE role = 'player'`;
    const totalPlayers = players.length;

    if (totalPlayers < 2) {
      return NextResponse.json({ message: "Mindestens 2 Spieler erforderlich" }, { status: 400 });
    }

    // Shuffle players
    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [players[i], players[j]] = [players[j], players[i]];
    }

    // Determine number of groups (optimal size: 3-4)
    // 2-4 -> 1, 5-8 -> 2, 9-12 -> 3, etc.
    const numGroups = Math.max(1, Math.ceil(totalPlayers / 4));
    const GROUP_NAMES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    // Assign groups
    for (let i = 0; i < totalPlayers; i++) {
      const groupName = GROUP_NAMES[i % numGroups];
      await sql`UPDATE users SET group_name = ${groupName} WHERE id = ${players[i].id}`;
    }

    return NextResponse.json({ message: "Gruppen erfolgreich generiert!" });
  } catch (err: any) {
    return NextResponse.json({ message: "Fehler beim Generieren der Gruppen", error: err.message }, { status: 500 });
  }
}
