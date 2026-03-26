import NextAuth from 'next-auth';
import authConfig from './lib/auth.config';

const { auth } = NextAuth(authConfig);

export function proxy(req: any) {
  return auth(req);
}

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'], // Don't run middleware on API routes or static files
};
