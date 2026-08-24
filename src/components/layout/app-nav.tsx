'use client';

import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLedgerIcon } from '@/components/ui/icons';

const MENU = [
  { href: '/stok', label: 'Stok' },
  { href: '/transaksi', label: 'Transaksi' },
  { href: '/opname', label: 'Opname' },
  { href: '/laporan', label: 'Laporan' },
  { href: '/pengaturan', label: 'Pengaturan' },
] as const;

const TOP_LEVEL = ['/', ...MENU.map((m) => m.href)];

function parentOf(pathname: string): string {
  const hit = MENU.find((m) => pathname.startsWith(m.href));
  return hit?.href ?? '/';
}

export function AppTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const deep = !TOP_LEVEL.includes(pathname);
  return (
    <header className="sticky top-0 z-40 flex items-center gap-1.5 border-b border-border bg-background px-3 py-2 md:hidden">
      {deep && (
        <button
          type="button"
          aria-label="Kembali"
          onClick={() =>
            window.history.length > 1 ? router.back() : router.push(parentOf(pathname))
          }
          className="-ml-1 rounded-md p-1 text-foreground hover:bg-muted"
        >
          <ArrowLedgerIcon className="size-5 rotate-180" />
        </button>
      )}
      <Link
        href="/"
        aria-label="Ke beranda"
        className="flex items-center gap-2 font-heading text-base font-bold hover:text-primary"
      >
        <Image
          src="/LogoAnindaPayu.png"
          alt=""
          width={28}
          height={28}
          className="size-7 rounded-full object-cover"
        />
        Aninda Payu
      </Link>
    </header>
  );
}

export function AppNav() {
  const pathname = usePathname();
  return (
    <>
      {/* Sidebar desktop: indeks buku */}
      <aside className="hidden w-56 shrink-0 border-r border-border p-5 md:block">
        <Link
          href="/"
          aria-label="Ke beranda"
          className="flex items-center gap-2.5 font-heading text-xl font-bold hover:text-primary"
        >
          <Image
            src="/LogoAnindaPayu.png"
            alt=""
            width={36}
            height={36}
            className="size-9 rounded-full object-cover"
          />
          Aninda Payu
        </Link>
        <div className="rule-double mt-2 mb-5" aria-hidden />
        <nav className="space-y-0.5">
          {MENU.map((m) => {
            const active = pathname.startsWith(m.href);
            return (
              <Link
                key={m.href}
                href={m.href}
                aria-current={active ? 'page' : undefined}
                className={`block px-1 py-2 text-sm ${
                  active
                    ? 'font-semibold text-primary'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <span
                  className={
                    active
                      ? 'underline decoration-soga decoration-2 underline-offset-8'
                      : undefined
                  }
                >
                  {m.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="mt-6 w-full rounded-md border border-foreground/30 px-3 py-2 text-sm hover:bg-muted"
        >
          Keluar
        </button>
      </aside>
      {/* Bottom nav mobile: kaki buku dengan garis tinta */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t-2 border-indigo-deep bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
        {MENU.map((m) => {
          const active = pathname.startsWith(m.href);
          return (
            <Link
              key={m.href}
              href={m.href}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center justify-center gap-1.5 py-3 text-xs ${
                active ? 'font-semibold text-primary' : 'text-muted-foreground'
              }`}
            >
              {m.label}
              <span
                aria-hidden
                className={`h-0.5 w-8 ${active ? 'bg-soga' : 'bg-transparent'}`}
              />
            </Link>
          );
        })}
      </nav>
    </>
  );
}
