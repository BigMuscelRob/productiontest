import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const players = await sql`
      SELECT id, name, username, group_name 
      FROM users 
      WHERE role = 'player' 
      ORDER BY group_name ASC NULLS LAST, name ASC
    `;

    return NextResponse.json({ players });
  } catch (err: any) {
    return NextResponse.json({ message: "Fehler beim Laden der Gruppen", error: err.message }, { status: 500 });
  }
}
