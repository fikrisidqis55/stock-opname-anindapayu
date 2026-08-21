import { redirect } from 'next/navigation';
import { AppNav } from '@/components/layout/app-nav';
import { Toaster } from '@/components/ui/sonner';
import { auth } from '@/server/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className="flex min-h-dvh">
      <AppNav />
      <main className="w-full flex-1 p-4 pb-20 md:pb-4">{children}</main>
      <Toaster richColors position="top-center" />
    </div>
  );
}
