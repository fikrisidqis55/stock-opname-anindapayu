import { rotasiPasswordOwner } from '@/server/services/rotasiPassword';

export const dynamic = 'force-dynamic';

// Dipanggil Vercel Cron tiap 00:05 WIB (schedule UTC di vercel.json).
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get('authorization');
  if (!secret || header !== `Bearer ${secret}`) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  await rotasiPasswordOwner();
  return Response.json({ ok: true });
}
