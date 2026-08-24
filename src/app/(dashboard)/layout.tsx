import { redirect } from 'next/navigation';
import { AppNav, AppTopBar } from '@/components/layout/app-nav';
import { SwRegister } from '@/components/layout/sw-register';
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
    <div className="flex min-h-dvh flex-col">
      <AppTopBar />
      <div className="flex flex-1">
        <AppNav />
        <main className="w-full flex-1 p-4 pb-20 md:pb-4">{children}</main>
      </div>
      <Toaster position="top-center" />
      <SwRegister />
    </div>
  );
}
