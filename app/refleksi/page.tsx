import type { Metadata } from 'next';
import Link from 'next/link';
import BelumDiisi from '@/components/BelumDiisi';
import FadeIn from '@/components/FadeIn';
import Lencana from '@/components/Lencana';
import Panel from '@/components/Panel';
import Tombol from '@/components/Tombol';
import { getRefleksi } from '@/lib/queries';

// Konten diisi dari admin panel tanpa deploy ulang → render per request.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Refleksi',
  description:
    'Refleksi PPL: model guru yang dituju, filosofi mengajar, dan refleksi akhir beserta kekuatan, kelemahan, dan rencana tindak lanjut.',
};

const LABEL = 'font-mono text-xs leading-[1.2] font-semibold tracking-wide text-muted uppercase';

/** Pecah teks per baris baru menjadi paragraf. */
function Paragraf({ teks }: { teks: string }) {
  return (
    <div className="space-y-4 text-base leading-[1.6] text-muted">
      {teks.split('\n').map((baris, index) => (
        <p key={index}>{baris}</p>
      ))}
    </div>
  );
}

export default async function RefleksiPage() {
  const refleksi = await getRefleksi();

  // Tiga bagian penilaian refleksi (PRD.md bagian 4.7). Refleksi Akhir memuat
  // tiga sub-bagian eksplisit: kekuatan, kelemahan, rencana tindak lanjut.
  const subRefleksi = [
    { label: 'Kekuatan', nilai: refleksi?.kekuatan ?? null },
    { label: 'Kelemahan', nilai: refleksi?.kelemahan ?? null },
    { label: 'Rencana Tindak Lanjut', nilai: refleksi?.rencana_tindak_lanjut ?? null },
  ];

  return (
    <div className="space-y-16">
      <FadeIn>
        <section className="pt-4 pb-2 sm:pt-10">
          <Lencana>Refleksi</Lencana>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-normal uppercase leading-[1.04] tracking-normal text-foreground sm:text-5xl lg:text-[4rem]">
            Refleksi Praktik Mengajar
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-[1.6] text-muted sm:text-lg">
            Model guru yang dituju, filosofi mengajar, dan refleksi akhir atas seluruh pengalaman PPL
            Mandiri, disertai kekuatan, kelemahan, dan rencana tindak lanjut.
          </p>
        </section>
      </FadeIn>

      {!refleksi ? (
        <FadeIn delay={0.05}>
          <BelumDiisi pesan="Modul refleksi belum diisi." />
        </FadeIn>
      ) : (
        <>
          <FadeIn delay={0.05}>
            <Panel
              judul="Model Guru yang Dituju"
              deskripsi="Gambaran sosok guru yang ingin dicapai ke depan, beserta alasannya."
            >
              {refleksi.model_guru_dituju ? (
                <Paragraf teks={refleksi.model_guru_dituju} />
              ) : (
                <BelumDiisi pesan="Belum diisi." />
              )}
            </Panel>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Panel
              judul="Filosofi Mengajar"
              deskripsi="Pandangan dan nilai yang dipegang dalam mengajar."
            >
              {refleksi.filosofi_mengajar ? (
                <Paragraf teks={refleksi.filosofi_mengajar} />
              ) : (
                <BelumDiisi pesan="Belum diisi." />
              )}
            </Panel>
          </FadeIn>

          <FadeIn delay={0.15}>
            <Panel
              judul="Refleksi Akhir"
              deskripsi="Refleksi menyeluruh atas pengalaman PPL Mandiri."
            >
              {refleksi.refleksi_akhir ? (
                <Paragraf teks={refleksi.refleksi_akhir} />
              ) : (
                <BelumDiisi pesan="Belum diisi." />
              )}

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {subRefleksi.map((bagian) => (
                  <div
                    key={bagian.label}
                    className="rounded-card border border-border bg-surface-muted px-4 py-4"
                  >
                    <h3 className={LABEL}>{bagian.label}</h3>
                    {bagian.nilai ? (
                      <div className="mt-2 space-y-3 text-sm leading-[1.6] text-muted">
                        {bagian.nilai.split('\n').map((baris, index) => (
                          <p key={index}>{baris}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm leading-[1.6] text-muted">Belum diisi.</p>
                    )}
                  </div>
                ))}
              </div>
            </Panel>
          </FadeIn>
        </>
      )}

      <FadeIn delay={0.2}>
        <nav aria-label="Navigasi modul" className="flex flex-wrap items-center gap-3">
          <Tombol href="/profil" varian="garis">
            Lihat Profil
          </Tombol>
          <Tombol href="/topik-3" varian="garis">
            Modul Topik 3
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
