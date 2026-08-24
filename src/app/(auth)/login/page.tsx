'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await signIn('credentials', {
      email: String(form.get('email')),
      password: String(form.get('password')),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError('Email atau password salah. Periksa lagi lalu coba masuk.');
      return;
    }
    router.push('/');
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm border border-border bg-card p-6"
      >
        <header className="text-center">
          <Image
            src="/LogoAnindaPayu.png"
            alt="Logo Aninda Payu"
            width={72}
            height={72}
            priority
            className="mx-auto size-16 rounded-full object-cover"
          />
          <h1 className="mt-3 border-b-0 pb-0 font-heading text-2xl font-bold">Aninda Payu</h1>
          <div className="rule-double mt-2" aria-hidden />
          <p className="mt-3 text-sm text-muted-foreground">
            Masuk untuk mengelola stok batik
          </p>
        </header>
        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="nama@toko.batik"
              className="h-10 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="h-10 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
            />
          </div>
          {error && <p className="text-sm text-pencil">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="h-10 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-indigo-deep disabled:opacity-50"
          >
            {loading ? 'Memproses…' : 'Masuk'}
          </button>
        </div>
      </form>
    </main>
  );
}
