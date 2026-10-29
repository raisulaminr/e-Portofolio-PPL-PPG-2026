import type { Metadata } from 'next';
import Link from 'next/link';
import BelumDiisi from '@/components/BelumDiisi';
import FadeIn from '@/components/FadeIn';
import Lencana from '@/components/Lencana';
import MenuArtefakSiklus from '@/components/MenuArtefakSiklus';
import Panel from '@/components/Panel';
import Tombol from '@/components/Tombol';
import { getSiklusByNomor } from '@/lib/queries';
import { ARTEFAK_SIKLUS, jumlahArtefakTerisi } from '@/lib/siklus';

// Data siklus diisi dari admin panel tanpa deploy ulang → render per request.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'UTS',
  description:
    'UTS, tujuh artefak lengkap: rancangan pembelajaran, materi, media, contoh hasil kerja siswa, video praktik mengajar mandiri, instrumen penilaian, dan penilaian Guru Pamong.',
};

export default async function UtsPage() {
  // PRD.md bagian 4.4 & 5: halaman ini tidak punya data sendiri, hanya
  // menampilkan ulang entitas siklus nomor 1 — kini lewat menu artefak, satu
  // halaman per artefak, sama seperti pola /topik-3.
  const siklus = await getSiklusByNomor(1);

  return (
    <div className="space-y-16">
      <FadeIn>
        <section className="pt-4 pb-2 sm:pt-10">
          <Lencana>UTS</Lencana>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-normal uppercase leading-[1.04] tracking-normal text-foreground sm:text-5xl lg:text-[4rem]">
            {siklus?.judul_topik ?? 'Rancangan & Video Praktik Mengajar'}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-[1.6] text-muted sm:text-lg">
            Rancangan pembelajaran lengkap beserta video pelaksanaan praktik
            mengajar mandiri. Tidak ada data yang diinput ulang di halaman ini.
          </p>
          {siklus ? (
            <p className="mt-4 font-mono text-xs leading-[1.2] tracking-wide text-muted uppercase">
              {jumlahArtefakTerisi(siklus)}/{ARTEFAK_SIKLUS.length} artefak terisi
            </p>
          ) : null}
        </section>
      </FadeIn>

      <FadeIn delay={0.05}>
        {siklus ? (
          <section>
            <h2 className="text-xl font-medium text-foreground sm:text-2xl">Tujuh Artefak UTS</h2>
            <p className="mt-2 text-base leading-[1.6] text-muted">
              Buka satu artefak untuk melihat lampirannya beserta analisis lima komponennya.
            </p>

            <MenuArtefakSiklus siklus={siklus} dasar="/uts" />
          </section>
        ) : (
          <BelumDiisi pesan="Data modul UTS belum tersedia." />
        )}
      </FadeIn>

      {siklus ? (
        <FadeIn delay={0.1}>
          <Panel judul="Catatan Reflektif" deskripsi="Refleksi guru setelah siklus ini selesai.">
            {siklus.catatan_reflektif ? (
              <div className="space-y-4 text-base leading-[1.6] text-muted">
                {siklus.catatan_reflektif.split('\n').map((paragraf, index) => (
                  <p key={index}>{paragraf}</p>
                ))}
              </div>
            ) : (
              <BelumDiisi pesan="Catatan reflektif siklus ini belum ditulis." />
            )}
          </Panel>
        </FadeIn>
      ) : null}

      <FadeIn delay={0.15}>
        <nav aria-label="Navigasi modul" className="flex flex-wrap items-center gap-3">
          <Tombol href="/uas" varian="utama">
            Lanjut ke Modul UAS
          </Tombol>
          <Tombol href="/topik-3" varian="garis">
            Analisis Topik 3
          </Tombol>
          <Link
            href="/"
            className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Kembali ke Beranda
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </nav>
      </FadeIn>
    </div>
  );
}
