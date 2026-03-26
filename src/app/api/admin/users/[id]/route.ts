import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { UserRole } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    // Check if user is logged in and is an admin
    if (!session?.user) {
      return NextResponse.json({ message: "Nicht autorisiert" }, { status: 401 });
    }

    if ((session.user as { role: UserRole }).role !== "admin") {
      return NextResponse.json(
        { message: "Nur Administratoren dürfen diese Aktion ausführen." },
        { status: 403 }
      );
    }

    // Resolving params in Next.js 15+ needs to be awaited
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Keine Benutzer-ID angegeben." },
        { status: 400 }
      );
    }

    // Prevent deleting the own admin account
    if (session.user.id === id) {
       return NextResponse.json(
        { message: "Du kannst dich nicht selbst löschen." },
        { status: 403 }
      );
    }

    await sql`
      DELETE FROM users
      WHERE id = ${id}
    `;

    return NextResponse.json(
      { message: "Benutzer erfolgreich gelöscht." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete User Error:", error);
    return NextResponse.json(
      { message: "Ein Fehler ist beim Löschen aufgetreten." },
      { status: 500 }
    );
  }
}
