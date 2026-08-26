// Util export CSV: pemisah ';' (Excel locale Indonesia) + BOM UTF-8.
export function csvEscape(value: string | number): string {
  const s = String(value);
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function csvBody(rows: (string | number)[][]): string {
  return (
    '\uFEFF' + rows.map((r) => r.map(csvEscape).join(';')).join('\r\n')
  );
}

export function csvResponse(rows: (string | number)[][], filename: string): Response {
  return new Response(csvBody(rows), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

// Tanggal & waktu WIB format dd/MM/yyyy + HH.mm agar diparsel Excel locale ID.
export function formatWIB(d: Date): { tanggal: string; waktu: string } {
  const parts = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const get = (t: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === t)?.value ?? '';
  return {
    tanggal: `${get('day')}/${get('month')}/${get('year')}`,
    waktu: `${get('hour')}.${get('minute')}`,
  };
}
