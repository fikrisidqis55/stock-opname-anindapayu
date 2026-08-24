import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { NewSessionForm } from '@/components/opname/new-session-form';
import { formatRupiah, formatTanggal } from '@/lib/format';
import { listOpnameSessions } from '@/server/repositories/opname';

export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, string> = {
  counting: 'Berjalan',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

function statusBadgeClass(status: string) {
  if (status === 'counting') return 'bg-soga/10 text-soga';
  if (status === 'completed') return 'bg-pencil-green/10 text-pencil-green';
  return 'bg-muted text-muted-foreground';
}

export default async function OpnamePage() {
  const sessions = await listOpnameSessions();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Stock Opname</h1>
      <NewSessionForm />

      {sessions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Belum ada sesi opname. Buat sesi untuk mulai menghitung fisik.
        </p>
      ) : (
        <div className="rounded-lg border">
          <Table className="sm:min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Mulai</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden sm:table-cell">Selisih (pcs)</TableHead>
                <TableHead className="hidden sm:table-cell">Nilai selisih</TableHead>
                <TableHead className="sticky right-0 border-l border-border bg-background">
                  <span className="sr-only">Aksi</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Link
                      href={`/opname/${s.id}`}
                      className="font-medium hover:underline"
                    >
                      {s.label}
                    </Link>
                    <span className="block text-xs text-muted-foreground sm:hidden">
                      {STATUS_LABEL[s.status] ?? s.status}
                      {s.status === 'completed' ? ` · selisih ${s.totalDiffQty} pcs` : ''}
                    </span>
                  </TableCell>
                  <TableCell>{formatTanggal(s.startedAt)}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge className={statusBadgeClass(s.status)}>
                      {STATUS_LABEL[s.status] ?? s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {s.status === 'completed' ? s.totalDiffQty : '—'}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {s.status === 'completed' ? formatRupiah(s.totalDiffValue) : '—'}
                  </TableCell>
                  <TableCell className="sticky right-0 border-l border-border bg-background group-hover:bg-muted">
                    <Button
                      variant="outline"
                      size="sm"
                      render={<Link href={`/opname/${s.id}`} />}
                    >
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
