import type { Metadata } from 'next';
import Link from 'next/link';
import FadeIn from '@/components/FadeIn';
import KartuFoto from '@/components/KartuFoto';
import Lencana from '@/components/Lencana';
import Tombol from '@/components/Tombol';
import { getProfil } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Profil Mahasiswa',
  description:
    'Profil mahasiswa PPL PPG: program studi, LPTK, sekolah PPL, tentang saya, dan filosofi mengajar.',
};

export default async function ProfilPage() {
  const profil = await getProfil();

  if (!profil) {
    return (
      <div className="rounded-card border border-dashed border-border bg-surface px-5 py-8 text-sm text-muted">
Data profil belum diisi.
      </div>
    );
  }

  // Ditampilkan sebagai bagian terstruktur supaya dosen penguji bisa menemukan
  // info spesifik (LPTK, sekolah PPL) tanpa membaca narasi utuh — PRD bagian 4.2.
  const identitas = [
    { label: 'Program Studi (PPG)', nilai: profil.program_studi },
    { label: 'LPTK', nilai: profil.lptk },
    { label: 'Sekolah PPL', nilai: profil.sekolah_ppl },
    { label: 'Mata Pelajaran', nilai: profil.mapel },
    { label: 'Kelas / Fase', nilai: profil.kelas_fase },
    { label: 'Kontak', nilai: profil.kontak ? profil.kontak.replace(/\n+/g, ' · ') : null },
  ].filter((item) => item.nilai);

  return (
    <div className="space-y-20">
      <FadeIn>
        <section className="grid items-center gap-10 pt-4 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-14">
          <div className="text-center lg:text-left">
            <Lencana>Profil Mahasiswa</Lencana>
            <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-display font-normal uppercase leading-[1.04] tracking-normal sm:text-5xl lg:mx-0 lg:text-[4rem]">
              <span className="block text-foreground">{profil.nama ?? '-'}</span>
              {profil.program_studi ? (
                <span className="block text-muted">{profil.program_studi}</span>
              ) : null}
            </h1>
            {profil.identitas_profesional ? (
              <p className="mx-auto mt-6 max-w-xl text-base leading-[1.6] text-muted sm:text-lg lg:mx-0">
                {profil.identitas_profesional}
              </p>
            ) : null}
          </div>

          {/* Foto profil transparan yang sama seperti di Beranda. */}
          <KartuFoto nama={profil.nama ?? '-'} />
        </section>
      </FadeIn>

      <FadeIn delay={0.05}>
        <section className="rounded-card border border-border bg-surface p-6 shadow-card">
          <h2 className="text-xl font-medium text-foreground sm:text-2xl">Identitas Akademik</h2>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {identitas.map((item) => (
              <div key={item.label} className="rounded-card border border-border bg-surface-muted px-4 py-3">
                <dt className="font-mono text-xs leading-[1.2] font-semibold tracking-wide text-muted uppercase">
                  {item.label}
                </dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{item.nilai}</dd>
              </div>
            ))}
          </dl>
        </section>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section className="rounded-card border border-border bg-surface p-6 shadow-card">
          <h2 className="text-xl font-medium text-foreground sm:text-2xl">Tentang Saya</h2>
          <div className="mt-4 space-y-4 text-base leading-[1.6] text-muted">
            {(profil.tentang_saya ?? 'Belum diisi.').split('\n').map((paragraf, index) => (
              <p key={index}>{paragraf}</p>
            ))}
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.15}>
        <section className="rounded-card border border-border bg-surface p-6 shadow-card">
          <h2 className="text-xl font-medium text-foreground sm:text-2xl">
            Filosofi Hidup / Mengajar
          </h2>
          <div className="mt-4 space-y-4 text-base leading-[1.6] text-muted">
            {(profil.filosofi_hidup ?? 'Belum diisi.').split('\n').map((paragraf, index) => (
              <p key={index}>{paragraf}</p>
            ))}
          </div>
          {profil.identitas_profesional ? (
            <blockquote className="mt-6 border-l-2 border-primary pl-4 text-base font-medium text-foreground italic">
              “{profil.identitas_profesional}”
            </blockquote>
          ) : null}
        </section>
      </FadeIn>

      <FadeIn delay={0.2}>
        <div className="flex flex-wrap gap-3">
          <Tombol href="/topik-3" varian="utama">
            Lanjut ke Modul Topik 3
          </Tombol>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Kembali ke Beranda
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
