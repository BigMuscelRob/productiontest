import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";

export type UserRole = "admin" | "player";

interface DbUser {
  id: string;
  name: string;
  username: string;
  password_hash: string;
  role: UserRole;
  must_change_password: boolean;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Benutzername", type: "text" },
        password: { label: "Passwort", type: "password" },
      },
      authorize: async (credentials) => {
         if (!credentials?.username || !credentials?.password) return null;

                const rows = await sql`
                  SELECT id, name, username, password_hash, role, must_change_password
                  FROM users
                  WHERE username = ${credentials.username as string}
                  LIMIT 1
                `;
        
                if (rows.length === 0) return null;
        
                const user = rows[0] as DbUser;
                const valid = await bcrypt.compare(
                  credentials.password as string,
                  user.password_hash
                );
                if (!valid) return null;
        
                return {
                  id: user.id,
                  name: user.name,
                  email: user.username, // re-used as unique identifier
                  role: user.role,
                  mustChangePassword: user.must_change_password,
                };
            }
    })
  ]
});
