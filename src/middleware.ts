export { auth as middleware } from '@/server/auth';

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|icons|manifest.webmanifest|sw.js).*)',
  ],
};
