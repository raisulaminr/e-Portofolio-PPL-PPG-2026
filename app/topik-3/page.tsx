import type { Metadata } from 'next';
import Link from 'next/link';
import FadeIn from '@/components/FadeIn';
import KartuKategori from '@/components/KartuKategori';
import Lencana from '@/components/Lencana';
import Panel from '@/components/Panel';
import Tombol from '@/components/Tombol';
import { KATEGORI_TOPIK3 } from '@/lib/kategori';
import { getAnalisisList } from '@/lib/queries';

// Konten berubah dari admin panel tanpa deploy ulang → render per request.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Topik 3',
  description:
    'Enam kategori analisis reflektif artefak pembelajaran: perencanaan, materi, media, video, kegiatan nonmengajar, dan instrumen penilaian.',
};

export default async function Topik3Page() {
  const daftarAnalisis = await getAnalisisList();
  const kategoriTerisi = new Set(daftarAnalisis.map((analisis) => analisis.kategori));
  const jumlahTerisi = KATEGORI_TOPIK3.filter((kategori) => kategoriTerisi.has(kategori.slug)).length;

  return (
    <div className="space-y-16">
      <FadeIn>
        {/* Sinyal pertama modul: badge, judul uppercase, ringkas deskripsi. */}
        <section className="pt-4 pb-2 sm:pt-10">
          <Lencana>Topik 3</Lencana>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-normal uppercase leading-[1.04] tracking-normal text-foreground sm:text-5xl lg:text-[4rem]">
            Analisis Reflektif Artefak Pembelajaran
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-[1.6] text-muted sm:text-lg">
            Enam kategori analisis, masing-masing berisi artefak terpilih beserta narasi analisis reflektif,
            bukan sekadar lampiran mentah.
          </p>
          <p className="mt-4 font-mono text-xs leading-[1.2] tracking-wide text-muted uppercase">
            {jumlahTerisi}/{KATEGORI_TOPIK3.length} kategori terisi
          </p>
        </section>
      </FadeIn>

      <FadeIn delay={0.05}>
        <section>
          <h2 className="text-xl font-medium text-foreground sm:text-2xl">Enam Kategori Analisis</h2>
          <p className="mt-2 text-base leading-[1.6] text-muted">
            Buka satu kategori untuk membaca artefaknya beserta narasi analisisnya.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {KATEGORI_TOPIK3.map((kategori) => (
              <KartuKategori
                key={kategori.slug}
                kategori={kategori}
                terisi={kategoriTerisi.has(kategori.slug)}
                warnaIndex={kategori.nomor - 1}
              />
            ))}
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Panel judul="Terpisah dari UTS dan UAS" deskripsi="Model hubungan antar-fase (PRD bagian 5).">
          <ul className="space-y-3 text-sm leading-[1.6] text-muted">
            <li className="flex gap-3 rounded-card border border-border bg-surface-muted px-4 py-3">
              <span className="font-mono text-xs leading-[1.2] font-semibold text-accent-teks">01</span>
              <span>
                Topik 3 menganalisis artefak dari praktik mengajar terbimbing (sesi terbimbing sebelum
                modul UTS), bukan dari siklus yang dipakai UTS/UAS.
              </span>
            </li>
            <li className="flex gap-3 rounded-card border border-border bg-surface-muted px-4 py-3">
              <span className="font-mono text-xs leading-[1.2] font-semibold text-accent-teks">02</span>
              <span>
                Kelima kategori artefaknya (RPP, materi, media, video, instrumen penilaian) diisi lewat
                admin terbimbing; kategori nonmengajar tetap dari kegiatan_nonmengajar.
              </span>
            </li>
            <li className="flex gap-3 rounded-card border border-border bg-surface-muted px-4 py-3">
              <span className="font-mono text-xs leading-[1.2] font-semibold text-accent-teks">03</span>
              <span>
                UTS dan UAS masing-masing membaca siklusnya sendiri. Mengisi salah satunya tidak
                mengubah isi Topik 3.
              </span>
            </li>
          </ul>
        </Panel>
      </FadeIn>

      <FadeIn delay={0.15}>
        <div className="flex flex-wrap items-center gap-3">
          <Tombol href="/uts" varian="utama">
            Lanjut ke Modul UTS
          </Tombol>
          <Tombol href="/" varian="garis">
            Kembali ke Beranda
          </Tombol>
          <Link
            href="/admin"
            className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Kelola analisis (admin)
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
