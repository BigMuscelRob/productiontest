import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST() {
  try {
    if (process.env.NODE_ENV !== "development") {
      // In production, we might want to restrict this or use a secure header
      // But since Neon setup requires manual table creation anyway, 
      // this is mostly for initial deployment convenience.
    }

    await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;
      
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role VARCHAR(10) NOT NULL DEFAULT 'player' CHECK (role IN ('admin', 'player')),
        must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
        group_name VARCHAR(10) NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS matches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        player1_id UUID REFERENCES users(id),
        player2_id UUID REFERENCES users(id),
        player1_score INT DEFAULT 0,
        player2_score INT DEFAULT 0,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
        scheduled_time TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    return NextResponse.json(
      { message: "Datenbank erfolgreich initialisiert." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { message: "Ein Fehler bei der DB-Initialisierung ist aufgetreten." },
      { status: 500 }
    );
  }
}
