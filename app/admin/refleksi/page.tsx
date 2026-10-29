import type { Metadata } from 'next';
import Link from 'next/link';
import FormRefleksi from '@/components/FormRefleksi';
import Lencana from '@/components/Lencana';
import Panel from '@/components/Panel';
import { getRefleksi } from '@/lib/queries';

// Selalu baca data terbaru setelah form disimpan.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin — Refleksi',
  robots: { index: false, follow: false },
};

/**
 * Form modul Refleksi (PRD.md bagian 4.7) — tabel single row (id = 1), jadi
 * halamannya tanpa segmen [id]. Terpisah dari Profil karena rubrik LMS menilai
 * Refleksi sebagai kriteria tersendiri.
 */
export default async function AdminRefleksiPage() {
  const refleksi = await getRefleksi();

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
          <Lencana>Admin · Refleksi</Lencana>
        </div>

        <h1 className="mt-6 max-w-3xl text-3xl font-display font-normal uppercase leading-[1.04] tracking-normal text-foreground sm:text-4xl">
          Modul Refleksi
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-[1.6] text-muted">
          Model guru yang dituju, filosofi mengajar, dan refleksi akhir (kekuatan, kelemahan, rencana
          tindak lanjut). Tampil di halaman publik /refleksi.
        </p>
      </section>

      {!refleksi ? (
        <Panel className="border-warning/40">
          <p className="text-sm leading-[1.6] text-warning">
            Refleksi belum ada di database. Mengisi form ini akan membuat barisnya — isinya langsung bisa
            dipakai di halaman publik.
          </p>
        </Panel>
      ) : null}

      <Panel>
        <FormRefleksi refleksi={refleksi} />
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
          href="/refleksi"
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
