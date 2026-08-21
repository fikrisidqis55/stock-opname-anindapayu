'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

const MENU = [
  { href: '/stok', label: 'Stok' },
  { href: '/transaksi', label: 'Transaksi' },
  { href: '/opname', label: 'Opname' },
  { href: '/laporan', label: 'Laporan' },
  { href: '/pengaturan', label: 'Pengaturan' },
] as const;

export function AppNav() {
  const pathname = usePathname();
  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden w-52 shrink-0 border-r p-4 md:block">
        <p className="mb-4 text-lg font-bold">Aninda Payu</p>
        <nav className="space-y-1">
          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className={`block rounded-md px-3 py-2 text-sm ${
                pathname.startsWith(m.href)
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              {m.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="mt-6 w-full rounded-md border px-3 py-2 text-sm"
        >
          Keluar
        </button>
      </aside>
      {/* Bottom nav mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-background md:hidden">
        {MENU.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className={`flex-1 py-3 text-center text-xs ${
              pathname.startsWith(m.href)
                ? 'font-bold text-primary'
                : 'text-muted-foreground'
            }`}
          >
            {m.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
