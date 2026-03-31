import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { userId, newGroupName } = await req.json();

    if (!userId || !newGroupName) {
      return NextResponse.json({ message: "Fehlende Parameter" }, { status: 400 });
    }

    // Input validation for safety (only allow A-Z)
    if (!/^[A-Z]$/.test(newGroupName)) {
      return NextResponse.json({ message: "Ungültiger Gruppenname" }, { status: 400 });
    }

    await sql`UPDATE users SET group_name = ${newGroupName} WHERE id = ${userId} AND role = 'player'`;

    return NextResponse.json({ message: "Spieler erfolgreich verschoben!" });
  } catch (err: any) {
    return NextResponse.json({ message: "Fehler beim Verschieben", error: err.message }, { status: 500 });
  }
}
