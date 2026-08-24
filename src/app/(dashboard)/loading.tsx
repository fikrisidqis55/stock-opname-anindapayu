// Skeleton "halaman buku" saat pindah halaman (Suspense App Router).
export default function DashboardLoading() {
  return (
    <div role="status" aria-label="Memuat halaman" className="space-y-4">
      <div className="h-8 w-44 animate-pulse rounded-md bg-muted" />
      <div className="rule-double" aria-hidden />
      <div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rule-row flex items-center justify-between py-3.5">
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
      <span className="sr-only">Memuat…</span>
    </div>
  );
}
