import { DefaultSession, DefaultJWT } from "next-auth";

type UserRole = "admin" | "player";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      mustChangePassword: boolean;
    };
  }

  interface User {
    role: UserRole;
    mustChangePassword: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: UserRole;
    mustChangePassword: boolean;
  }
}
