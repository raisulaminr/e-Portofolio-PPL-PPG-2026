import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import FormAnalisis from '@/components/FormAnalisis';
import Lencana from '@/components/Lencana';
import Panel from '@/components/Panel';
import { getDefinisiKategori } from '@/lib/kategori';
import { getAnalisisByKategori } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin — Form Analisis',
  robots: { index: false, follow: false },
};

export default async function AdminAnalisisPage({
  params,
}: {
  params: Promise<{ kategori: string }>;
}) {
  const { kategori } = await params;
  const definisi = getDefinisiKategori(kategori);
  if (!definisi) notFound();

  const analisis = await getAnalisisByKategori(definisi.slug);

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
          <Lencana>Admin · Kategori {String(definisi.nomor).padStart(2, '0')}</Lencana>
        </div>

        <h1 className="mt-6 max-w-3xl text-3xl font-display font-normal uppercase leading-[1.04] tracking-normal text-foreground sm:text-4xl">
          {definisi.judul}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-[1.6] text-muted">{definisi.ringkasan}</p>
      </section>

      <Panel>
        <FormAnalisis
          kategori={definisi}
          nilaiAwal={{
            konteks: analisis?.konteks ?? '',
            tujuan: analisis?.tujuan ?? '',
            kelebihan: analisis?.kelebihan ?? '',
            kekurangan: analisis?.kekurangan ?? '',
            kajian_teori: analisis?.kajian_teori ?? '',
          }}
          sudahAda={Boolean(analisis)}
        />
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
          href={`/topik-3/${definisi.slug}`}
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
