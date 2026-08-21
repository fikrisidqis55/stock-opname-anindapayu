import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
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
  if (status === 'counting') return 'bg-yellow-100 text-yellow-900';
  if (status === 'completed') return 'bg-green-100 text-green-900';
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Mulai</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Selisih (pcs)</TableHead>
                <TableHead>Nilai selisih</TableHead>
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
                  </TableCell>
                  <TableCell>{formatTanggal(s.startedAt)}</TableCell>
                  <TableCell>
                    <Badge className={statusBadgeClass(s.status)}>
                      {STATUS_LABEL[s.status] ?? s.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {s.status === 'completed' ? s.totalDiffQty : '—'}
                  </TableCell>
                  <TableCell>
                    {s.status === 'completed' ? formatRupiah(s.totalDiffValue) : '—'}
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
