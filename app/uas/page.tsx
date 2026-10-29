import type { Metadata } from 'next';
import Link from 'next/link';
import BelumDiisi from '@/components/BelumDiisi';
import FadeIn from '@/components/FadeIn';
import Lencana from '@/components/Lencana';
import MenuArtefakSiklus from '@/components/MenuArtefakSiklus';
import Panel from '@/components/Panel';
import Tombol from '@/components/Tombol';
import { getSiklusUasPilihan } from '@/lib/queries';
import { ARTEFAK_SIKLUS, jumlahArtefakTerisi } from '@/lib/siklus';

// Data siklus diisi dari admin panel tanpa deploy ulang → render per request.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'UAS',
  description:
    'UAS, satu siklus terbaik dari rentang 2–4: rancangan pembelajaran, materi, media, contoh hasil kerja siswa, video praktik mengajar mandiri, instrumen penilaian, dan penilaian Guru Pamong.',
};

export default async function UasPage() {
  // PRD.md bagian 4.5 & 5: UAS bukan tiga paket terpisah — halaman ini hanya
  // menarik SATU baris siklus yang ditandai `is_uas_pilihan = 1` (kini hanya ada
  // siklus 1 untuk UTS dan siklus 2 untuk UAS), lalu menampilkannya lewat menu
  // artefak yang sama dengan halaman UTS.
  const siklus = await getSiklusUasPilihan();

  return (
    <div className="space-y-16">
      <FadeIn>
        <section className="pt-4 pb-2 sm:pt-10">
          <Lencana>UAS · Siklus Terbaik (2–4)</Lencana>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-normal uppercase leading-[1.04] tracking-normal text-foreground sm:text-5xl lg:text-[4rem]">
            {siklus?.judul_topik ?? 'Siklus Terbaik (2–4) · Produk UAS'}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-[1.6] text-muted sm:text-lg">
            Satu rancangan pembelajaran (siklus terbaik dari rentang 2–4) beserta video pelaksanaan
            praktik mengajar mandiri; tidak ada data yang diinput ulang di halaman ini.
          </p>
          {siklus ? (
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs leading-[1.2] tracking-wide text-muted uppercase">
              <span>Siklus Terbaik (2–4) · Produk UAS</span>
              <span>{jumlahArtefakTerisi(siklus)}/{ARTEFAK_SIKLUS.length} artefak terisi</span>
            </div>
          ) : null}
        </section>
      </FadeIn>

      <FadeIn delay={0.05}>
        {siklus ? (
          <section>
            <h2 className="text-xl font-medium text-foreground sm:text-2xl">Tujuh Artefak UAS</h2>
            <p className="mt-2 text-base leading-[1.6] text-muted">
              Buka satu artefak untuk melihat lampirannya beserta analisis lima komponennya.
            </p>

            <MenuArtefakSiklus siklus={siklus} dasar="/uas" />
          </section>
        ) : (
          <BelumDiisi pesan="Belum ada produk UAS yang ditandai untuk ditampilkan." />
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
          <Tombol href="/uts" varian="garis">
            Lihat Modul UTS
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
