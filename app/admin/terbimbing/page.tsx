import type { Metadata } from 'next';
import Link from 'next/link';
import FormTerbimbing from '@/components/FormTerbimbing';
import Lencana from '@/components/Lencana';
import Panel from '@/components/Panel';
import { KATEGORI_TOPIK3 } from '@/lib/kategori';
import { getTerbimbing } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin — Praktik Mengajar Terbimbing',
  robots: { index: false, follow: false },
};

/**
 * Form entitas praktik mengajar terbimbing — sumber artefak lima kategori
 * Topik 3. Satu baris saja (id = 1), jadi halamannya tanpa segmen [id].
 */
export default async function AdminTerbimbingPage() {
  const terbimbing = await getTerbimbing();
  const kategoriTerbimbing = KATEGORI_TOPIK3.filter((kategori) => kategori.sumber === 'terbimbing');

  return (
    <div className="space-y-12">
      <section className="pt-4 sm:pt-10">
        <Link
          href="/admin"
          className="group inline-flex items-center gap-2 font-mono text-xs leading-[1.2] tracking-wide text-muted uppercase transition-colors hover:text-foreground"
        >
          <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">
            ←
          </span>
          Dashboard admin
        </Link>

        <div className="mt-6">
          <Lencana>Admin · Praktik Mengajar Terbimbing</Lencana>
        </div>

        <h1 className="mt-6 max-w-3xl text-3xl font-display font-normal uppercase leading-[1.04] tracking-normal text-foreground sm:text-4xl">
          Artefak Praktik Mengajar Terbimbing
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-[1.6] text-muted">
          Sesi terbimbing sebelum siklus 1. Artefak di sini menjadi bahan analisis lima kategori Topik 3
          dan terpisah dari siklus UTS/UAS (PRD.md bagian 5).
        </p>
      </section>

      {!terbimbing ? (
        <Panel className="border-warning/40">
          <p className="text-sm leading-[1.6] text-warning">
            Belum ada data praktik mengajar terbimbing. Mengisi form ini akan membuat barisnya — artefaknya
            langsung bisa dipakai di halaman Topik 3.
          </p>
        </Panel>
      ) : null}

      <Panel>
        <FormTerbimbing terbimbing={terbimbing} />
      </Panel>

      <Panel judul="Dipakai oleh kategori" deskripsi="Lima kategori Topik 3 membaca artefak di atas.">
        <ul className="space-y-2 text-sm leading-[1.6] text-muted">
          {kategoriTerbimbing.map((kategori) => (
            <li key={kategori.slug} className="flex flex-wrap items-center gap-x-3">
              <span className="font-mono text-xs leading-[1.2] font-semibold tracking-wide text-accent-teks uppercase">
                {String(kategori.nomor).padStart(2, '0')}
              </span>
              <span className="text-foreground">{kategori.judul}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-[1.6] text-muted">
          Kategori keenam (nonmengajar) dikelola terpisah di{' '}
          <Link href="/admin/nonmengajar" className="font-medium text-accent-teks hover:opacity-80">
            /admin/nonmengajar
          </Link>
          .
        </p>
      </Panel>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin"
          className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">
            ←
          </span>
          Kembali ke dashboard
        </Link>
        <Link
          href="/topik-3"
          className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          Lihat hasil di halaman publik
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            ↗
          </span>
        </Link>
      </div>
    </div>
  );
}
