import type { Metadata } from "next";
import { Bricolage_Grotesque, Public_Sans } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Public_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: 'Aninda Payu', template: '%s · Aninda Payu' },
  description: 'Aplikasi stock opname batik Aninda Payu',
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/*
          DIRECTION CONTRACT — dunia visual "Buku Kas"
          (disetujui user; build path comp-first; comp patokan: .impeccable/mocks/comp-1-buku-kas.png)
          THESIS: pembukuan stok toko batik sebagai buku kas kertas — angka yang dipercaya, ditulis dengan tinta.
          OWN WORLD: kertas #F4F1E9, tinta #1C2B36, ruling biru #B9CFDF, indigo #24518E,
          soga #9C4A1F, pensil merah #B3372B; Bricolage Grotesque (display) + Public Sans (body);
          radius ≤4px; nol bayangan, nol gradien, nol glass; border 1px.
          STORY: buka buku → baca ringkasan hari → pilih aksi dari indeks → catat → tutup dengan laporan.
          FIRST VIEWPORT: kepala buku "Aninda Payu" bergaris ganda, tabel ringkasan ber-ruling
          dengan total bergaris pensil merah ganda, indeks aksi cepat, stok menipis ditulis pensil merah.
          FORM: input numerik cepat satu tangan, tombol persegi tinta indigo, label menyebut aksinya.
          FINISH: selection/caret/scrollbar/focus bertema, angka tabular, ikon SVG authored (bukan lucide).
        */}
        {children}
      </body>
    </html>
  );
}
