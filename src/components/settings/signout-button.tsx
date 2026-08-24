'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="mt-3 w-full rounded-md border border-foreground/30 px-3 py-2 text-sm hover:bg-muted sm:w-auto"
    >
      Keluar
    </button>
  );
}
