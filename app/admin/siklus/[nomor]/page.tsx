import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import FormSiklus from '@/components/FormSiklus';
import Lencana from '@/components/Lencana';
import Panel from '@/components/Panel';
import Tombol from '@/components/Tombol';
import { SIKLUS_TOTAL, getSiklusByNomor } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin — Form Siklus',
  robots: { index: false, follow: false },
};

/**
 * Form satu siklus. Kuncinya `nomor_siklus` (1–2), bukan id baris, karena
 * siklus 2 belum tentu sudah punya baris — menyimpan akan membuatnya.
 * URL-nya tetap sesuai peta route /admin/siklus/[id] di TECH-SPEC bagian 2.
 */
export default async function AdminSiklusPage({ params }: { params: Promise<{ nomor: string }> }) {
  const { nomor } = await params;
  const nomorSiklus = Number(nomor);

  if (!Number.isInteger(nomorSiklus) || nomorSiklus < 1 || nomorSiklus > SIKLUS_TOTAL) {
    notFound();
  }

  const siklus = await getSiklusByNomor(nomorSiklus);
  const modul = nomorSiklus === 1 ? 'UTS' : 'UAS';

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
          <Lencana>
            Admin · Siklus {nomorSiklus} · {modul}
          </Lencana>
        </div>

        <h1 className="mt-6 max-w-3xl text-3xl font-display font-normal uppercase leading-[1.04] tracking-normal text-foreground sm:text-4xl">
          {siklus?.judul_topik || `Siklus ${nomorSiklus} — data lengkap`}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-[1.6] text-muted">
          Semua artefak di sini milik entitas siklus yang sama — sekali diisi, tampil di halaman UTS (siklus
          1) atau UAS (siklus 2 yang ditandai sebagai produk UAS), sesuai PRD.md bagian 5.
        </p>
        <div className="mt-6">
          <Tombol href={`/admin/siklus/${nomorSiklus}/analisis`} varian="garis">
            Isi analisis artefak (lima komponen)
          </Tombol>
        </div>
      </section>

      {!siklus ? (
        <Panel className="border-warning/40">
          <p className="text-sm leading-[1.6] text-warning">
            Siklus {nomorSiklus} belum ada di database. Mengisi form ini akan membuat barisnya.
            {nomorSiklus > 1
              ? ' Centang "Jadikan produk UAS" di bawah supaya siklus ini tampil di halaman UAS.'
              : ''}
          </p>
        </Panel>
      ) : null}

      <Panel>
        <FormSiklus nomorSiklus={nomorSiklus} modul={modul} siklus={siklus} />
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
          href={nomorSiklus === 1 ? '/uts' : '/uas'}
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
