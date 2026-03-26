import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, username, password } = await req.json();

    if (!name || !username || !password) {
      return NextResponse.json(
        { message: "Bitte alle Felder ausfüllen." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Das Passwort muss mindestens 6 Zeichen lang sein." },
        { status: 400 }
      );
    }

    // Check if username exists
    const existing = await sql`
      SELECT id FROM users WHERE username = ${username}
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "Dieser Benutzername ist bereits vergeben." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user
    await sql`
      INSERT INTO users (name, username, password_hash, role)
      VALUES (${name}, ${username}, ${hashedPassword}, 'player')
    `;

    return NextResponse.json(
      { message: "Erfolgreich registriert." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Ein Fehler ist aufgetreten." },
      { status: 500 }
    );
  }
}
