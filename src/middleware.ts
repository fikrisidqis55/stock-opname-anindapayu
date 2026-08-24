export { auth as middleware } from '@/server/auth';

export const config = {
  matcher: [
    '/((?!api/auth|api/cron|_next/static|_next/image|favicon.ico|icons|LogoAnindaPayu.png|manifest.webmanifest|sw.js|\.well-known).*)',
  ],
};
