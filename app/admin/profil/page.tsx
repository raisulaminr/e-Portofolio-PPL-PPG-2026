import type { Metadata } from 'next';
import Link from 'next/link';
import FadeIn from '@/components/FadeIn';
import FormProfil from '@/components/FormProfil';
import Lencana from '@/components/Lencana';
import Panel from '@/components/Panel';
import { getProfil } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin — Profil Mahasiswa',
};

export default async function AdminProfilPage() {
  const profil = await getProfil();

  return (
    <div className="space-y-12">
      <FadeIn>
        <section className="pt-4 sm:pt-10">
          <Lencana>Admin · Profil</Lencana>
          <h1 className="mt-6 max-w-3xl text-3xl font-display font-normal uppercase leading-[1.04] tracking-normal text-foreground sm:text-4xl">
            Profil Mahasiswa
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-[1.6] text-muted">
            Field-field ini ditampilkan sebagai bagian terstruktur di halaman Profil, supaya dosen penguji bisa
            langsung menemukan info spesifik tanpa membaca narasi utuh (PRD bagian 4.2).
          </p>
        </section>
      </FadeIn>

      {!profil ? (
        <Panel className="border-warning/40">
          <p className="text-sm leading-[1.6] text-warning">
            Belum ada baris profil di database. Menyimpan form ini akan membuatnya.
          </p>
        </Panel>
      ) : null}

      <Panel>
        <FormProfil profil={profil} />
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
          href="/profil"
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
