import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { oldPassword, newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { message: "Das neue Passwort muss mindestens 6 Zeichen lang sein." },
        { status: 400 }
      );
    }

    // Fetch current user
    const users = await sql`
      SELECT password_hash FROM users WHERE id = ${session.user.id}
    `;

    if (users.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // Check old password if provided (optional if forced reset, but good practice)
    if (oldPassword) {
      const valid = await bcrypt.compare(oldPassword, user.password_hash);
      if (!valid) {
         return NextResponse.json({ message: "Das alte Passwort ist falsch." }, { status: 400 });
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update DB
    await sql`
      UPDATE users 
      SET password_hash = ${hashedPassword}, must_change_password = FALSE
      WHERE id = ${session.user.id}
    `;

    return NextResponse.json({ message: "Passwort erfolgreich geändert." });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { message: "Ein Fehler ist aufgetreten." },
      { status: 500 }
    );
  }
}
