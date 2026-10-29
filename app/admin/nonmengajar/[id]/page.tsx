import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import FormKegiatan from '@/components/FormKegiatan';
import Lencana from '@/components/Lencana';
import Panel from '@/components/Panel';
import { getKegiatanById } from '@/lib/queries';
import { formatTanggal } from '@/lib/tanggal';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin — Ubah Kegiatan Nonmengajar',
};

export default async function AdminKegiatanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const nomorId = Number(id);

  if (!Number.isInteger(nomorId) || nomorId < 1) notFound();

  const kegiatan = await getKegiatanById(nomorId);
  if (!kegiatan) notFound();

  return (
    <div className="space-y-12">
      <section className="pt-4 sm:pt-10">
        <Link
          href="/admin/nonmengajar"
          className="group inline-flex items-center gap-2 font-mono text-xs leading-[1.2] tracking-wide text-muted uppercase transition-colors hover:text-foreground"
        >
          <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">
            ←
          </span>
          Daftar kegiatan
        </Link>

        <div className="mt-6">
          <Lencana>Admin · Nonmengajar</Lencana>
        </div>

        <h1 className="mt-6 max-w-3xl text-3xl font-display font-normal uppercase leading-[1.04] tracking-normal text-foreground sm:text-4xl">
          {kegiatan.nama_kegiatan}
        </h1>
        {kegiatan.tanggal ? (
          <p className="mt-4 font-mono text-xs leading-[1.2] tracking-wide text-muted uppercase">
            {formatTanggal(kegiatan.tanggal)}
          </p>
        ) : null}
      </section>

      <Panel>
        <FormKegiatan kegiatan={kegiatan} />
      </Panel>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/nonmengajar"
          className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">
            ←
          </span>
          Kembali ke daftar kegiatan
        </Link>
        <Link
          href="/topik-3/nonmengajar"
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
