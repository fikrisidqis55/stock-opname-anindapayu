import { notFound } from 'next/navigation';
import { CountSheet } from '@/components/opname/count-sheet';
import { getSessionDetail } from '@/server/repositories/opname';

export const dynamic = 'force-dynamic';

export default async function OpnameSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getSessionDetail(id);
  if (!detail) notFound();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{detail.session.label}</h1>
        <p className="text-sm text-muted-foreground capitalize">
          Status: {detail.session.status}
        </p>
      </div>
      <CountSheet
        sessionId={detail.session.id}
        status={detail.session.status}
        items={detail.items}
      />
    </div>
  );
}
