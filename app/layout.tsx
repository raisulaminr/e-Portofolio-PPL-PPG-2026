import type { Metadata } from 'next';
import { Chewy, JetBrains_Mono, Patrick_Hand } from 'next/font/google';
import KanvasLatar from '@/components/KanvasLatar';
import SiteHeader from '@/components/SiteHeader';
import { getProfil } from '@/lib/queries';
import './globals.css';

// Footer & metadata membaca profil dari database → render per request
// (sama seperti halaman publik lain) supaya perubahan nama/prodi/LPTK di admin
// langsung tampil tanpa deploy ulang.
export const dynamic = 'force-dynamic';

// Tipografi DESIGN.md: Chewy untuk judul, Patrick Hand untuk body,
// JetBrains Mono untuk label teknis.
const chewy = Chewy({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-chewy',
  display: 'swap',
});

const patrickHand = Patrick_Hand({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-patrick',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'e-Portofolio PPG 2026 · Raisul Amin R, S.Kom.',
    template: '%s | e-Portofolio PPG 2026',
  },
  description:
    'E-portofolio PPL PPG 2026: menyatukan tagihan Topik 3, UTS, dan UAS dalam satu situs, berpusat pada siklus praktik mengajar mandiri di SMA Negeri 22 Makassar.',
};

// Dijalankan sebelum cat pertama supaya tema pilihan pengunjung tidak berkedip.
// Default gelap (DESIGN.md); kelas .dark hanya dilepas kalau pengunjung memilih terang.
const SKRIP_TEMA = `(function(){try{if(localStorage.getItem('tema')==='terang'){document.documentElement.classList.remove('dark');}}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const profil = await getProfil();

  // Nama · prodi · LPTK dari tabel profil, dengan cadangan teks lama kalau kolomnya kosong.
  const kaki = [
    profil?.nama || 'Raisul Amin R, S.Kom.',
    profil?.program_studi || 'Pendidikan Informatika',
    profil?.lptk || 'Universitas Islam Makassar',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <html
      lang="id"
      className={`dark ${chewy.variable} ${patrickHand.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <script dangerouslySetInnerHTML={{ __html: SKRIP_TEMA }} />
        <KanvasLatar />
        {/* Konten dinaikkan ke atas lapisan kanvas lewat stacking context sendiri. */}
        <div className="relative z-10 flex min-h-screen flex-1 flex-col">
          <SiteHeader />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-10 pb-16 sm:px-6 sm:pt-14 sm:pb-24">
            {children}
          </main>
          <footer className="border-t border-border bg-surface">
            <div className="mx-auto max-w-6xl px-4 py-8 font-mono text-xs uppercase leading-[1.2] tracking-wide text-muted sm:px-6">
              E-PORTOFOLIO PPL PPG 2026 · {kaki}
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}