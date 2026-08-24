import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CategoryManager } from '@/components/settings/category-manager';
import { SignOutButton } from '@/components/settings/signout-button';
import { auth } from '@/server/auth';
import { listCategories } from '@/server/repositories/categories';

export const dynamic = 'force-dynamic';

export default async function PengaturanPage() {
  const [session, items] = await Promise.all([auth(), listCategories()]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pengaturan</h1>

      <Card>
        <CardHeader>
          <CardTitle>Kategori Babaran</CardTitle>
          <CardDescription>
            Tambah atau ubah nama kategori jenis babaran batik.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryManager items={items} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Akun</CardTitle>
          <CardDescription>Akun pemilik yang sedang masuk.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Email:</span>{' '}
            {session?.user?.email ?? '-'}
          </p>
          <p>
            <span className="text-muted-foreground">Peran:</span> Owner
          </p>
          <SignOutButton />
        </CardContent>
      </Card>
    </div>
  );
}
