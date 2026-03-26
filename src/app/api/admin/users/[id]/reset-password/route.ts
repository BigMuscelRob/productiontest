import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Generate random 8 character string for temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    await sql`
      UPDATE users 
      SET password_hash = ${hashedPassword}, must_change_password = TRUE
      WHERE id = ${id}
    `;

    return NextResponse.json({ 
        message: "Passwort erfolgreich zurückgesetzt.",
        tempPassword 
    });
  } catch (error) {
    console.error("Admin reset password error:", error);
    return NextResponse.json(
      { message: "Ein Fehler ist aufgetreten." },
      { status: 500 }
    );
  }
}
