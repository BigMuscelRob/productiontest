import type { NextAuthConfig } from "next-auth";
export type UserRole = "admin" | "player";

const authConfig = {
    providers: [],
    callbacks: {
      async jwt({ token, user, trigger, session }) {
        if (user) {
          token.id = user.id;
          token.role = (user as { role: UserRole }).role;
          token.mustChangePassword = (
            user as { mustChangePassword: boolean }
          ).mustChangePassword;
        }
        // Update mustChangePassword flag on change
        if (trigger === "update" && session && session.mustChangePassword !== undefined) {
             token.mustChangePassword = session.mustChangePassword;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id as string;
          (session.user as { role: UserRole }).role = token.role as UserRole;
          (session.user as { mustChangePassword: boolean }).mustChangePassword =
            token.mustChangePassword as boolean;
        }
        return session;
      },
      authorized({ auth, request: { nextUrl } }) {
        const isLoggedIn = !!auth?.user;
        const mustChangePassword = (auth?.user as any)?.mustChangePassword;
        const isAdmin = (auth?.user as any)?.role === "admin";
        
        const isPasswortAendernRoute = nextUrl.pathname.startsWith('/passwort-aendern');
        const isAdminRoute = nextUrl.pathname.startsWith('/admin');
        const isLoginRoute = nextUrl.pathname === '/login';

        // Force password change
        if (isLoggedIn && mustChangePassword && !isPasswortAendernRoute && !isLoginRoute) {
          return Response.redirect(new URL('/passwort-aendern', nextUrl));
        }

        // Prevent players from accessing admin routes
        if (isAdminRoute && !isAdmin) {
          return Response.redirect(new URL('/', nextUrl));
        }

        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
    session: {
      strategy: "jwt",
    },
  } satisfies NextAuthConfig;

export default authConfig;
