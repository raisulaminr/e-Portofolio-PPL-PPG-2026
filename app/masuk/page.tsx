import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import FadeIn from '@/components/FadeIn';
import FormMasuk from '@/components/FormMasuk';
import Lencana from '@/components/Lencana';
import Panel from '@/components/Panel';
import { sesiAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Masuk Admin',
  robots: { index: false, follow: false },
};

export default async function MasukPage() {
  // Sudah login? Tidak perlu melihat form lagi.
  const sesi = await sesiAdmin();
  if (sesi) redirect('/admin');

  return (
    <div className="space-y-12">
      <FadeIn>
        <section className="pt-4 sm:pt-10">
          <Lencana>Admin</Lencana>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-normal uppercase leading-[1.04] tracking-normal text-foreground sm:text-5xl">
            Masuk Panel Admin
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-[1.6] text-muted sm:text-lg">
            Halaman ini hanya untuk pemilik portofolio. Pengunjung, yaitu dosen pembimbing dan guru pamong,
            tidak perlu login untuk membaca seluruh isi situs.
          </p>
        </section>
      </FadeIn>

      <FadeIn delay={0.05}>
        <Panel className="max-w-xl">
          <FormMasuk />
        </Panel>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Link
          href="/"
          className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">
            ←
          </span>
          Kembali ke halaman publik
        </Link>
      </FadeIn>
    </div>
  );
}
