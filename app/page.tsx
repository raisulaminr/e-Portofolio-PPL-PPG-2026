import Link from 'next/link';
import BelumDiisi from '@/components/BelumDiisi';
import BingkaiSeleksi from '@/components/BingkaiSeleksi';
import FadeIn from '@/components/FadeIn';
import KartuFoto from '@/components/KartuFoto';
import KartuSiklus from '@/components/KartuSiklus';
import Lencana from '@/components/Lencana';
import ModuleCard from '@/components/ModuleCard';
import Panel from '@/components/Panel';
import StickyNote from '@/components/StickyNote';
import Tombol from '@/components/Tombol';
import { getProfil, getRingkasanProgres, getSiklusList } from '@/lib/queries';

// Data portofolio jarang berubah; render per request supaya build tidak bergantung pada DB.
export const dynamic = 'force-dynamic';

/** Pecah teks menjadi paragraf per baris baru — pola yang sama dipakai halaman lain. */
function Paragraf({ teks }: { teks: string }) {
  return (
    <>
      {teks.split('\n').map((baris, index) => (
        <p key={index}>{baris}</p>
      ))}
    </>
  );
}

/** Ubah satu baris kontak menjadi tautan bila berbentuk email atau URL. */
function BarisKontak({ baris }: { baris: string }) {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(baris)) {
    return (
      <a
        href={`mailto:${baris}`}
        className="font-medium text-accent-teks transition-opacity hover:opacity-80"
      >
        {baris}
      </a>
    );
  }

  if (/^https?:\/\//i.test(baris)) {
    return (
      <a
        href={baris}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-medium text-accent-teks transition-opacity hover:opacity-80"
      >
        {baris}
        <span aria-hidden>↗</span>
      </a>
    );
  }

  return <span>{baris}</span>;
}

export default async function BerandaPage() {
  const [profil, progres, daftarSiklus] = await Promise.all([
    getProfil(),
    getRingkasanProgres(),
    getSiklusList(),
  ]);

  const nama = profil?.nama ?? 'Raisul Amin R, S.Kom.';
  const identitas = profil?.identitas_profesional ?? 'Informatics Teacher. Lifelong Learner.';

  return (
    <div className="space-y-20">
      <FadeIn>
        {/* Sinyal pertama halaman: hero kiri + kartu foto kanan, di atas latar berkas cahaya. */}
        <section className="grid items-center gap-10 pt-4 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-14">
          <div className="text-center lg:text-left">
            <Lencana>E-Portofolio PPL · PPG 2026</Lencana>

            {/* Judul hero duduk di dalam bingkai seleksi — focal object acuan visual. */}
            <BingkaiSeleksi className="mt-6 lg:mx-0">
              <h1 className="max-w-2xl font-display text-4xl font-normal uppercase leading-[1.04] tracking-normal sm:text-5xl lg:text-[4rem]">
                <span className="block text-foreground">{nama}</span>
                {profil?.program_studi ? (
                  <span className="block text-muted">{profil.program_studi}</span>
                ) : null}
              </h1>
            </BingkaiSeleksi>

            <p className="mx-auto mt-6 max-w-xl text-base leading-[1.6] text-muted sm:text-lg lg:mx-0">
              {identitas}
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 lg:justify-start">
              <Tombol href="/profil" varian="utama">
                Lihat Profil Lengkap
              </Tombol>

              {/* Lompat cepat ke tiga tagihan — penting di mobile di mana nav atas terlipat. */}
              <nav aria-label="Lompat cepat ke modul">
                <ul className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                  {[
                    { href: '/topik-3', label: 'Topik 3' },
                    { href: '/uts', label: 'UTS' },
                    { href: '/uas', label: 'UAS' },
                    { href: '/refleksi', label: 'Refleksi' },
                  ].map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="inline-flex min-h-10 items-center rounded-control border border-border px-3.5 py-1.5 font-mono text-xs leading-[1.2] font-semibold tracking-wide text-muted uppercase transition-colors hover:border-primary/60 hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <Link
              href="#ringkasan"
              className="group mt-12 inline-flex items-center gap-2 font-mono text-xs leading-[1.2] tracking-wide text-muted uppercase transition-colors hover:text-foreground"
            >
              Scroll Down
              <span aria-hidden className="transition-transform group-hover:translate-y-0.5">
                ↓
              </span>
            </Link>
          </div>

          {/* Satu kartu berisi foto profil saja — utuh, dibingkai matte, tanpa metrik. */}
          <KartuFoto nama={nama} />
        </section>
      </FadeIn>

      {/* Pengantar e-portofolio — PRD bagian 4.1: paragraf singkat isi & tujuan situs. */}
      <FadeIn delay={0.03}>
        <Panel
          judul="Pengantar e-Portofolio"
          deskripsi="Apa isi portofolio ini dan untuk apa disusun."
        >
          {profil?.pengantar_eportofolio ? (
            <div className="space-y-4 text-base leading-[1.6] text-muted">
              <Paragraf teks={profil.pengantar_eportofolio} />
            </div>
          ) : (
            <BelumDiisi pesan="Pengantar e-portofolio belum diisi." />
          )}
        </Panel>
      </FadeIn>

      {/* Catatan tempel singkat — motif acuan visual, mengapit isi halaman. */}
      <FadeIn delay={0.05}>
        <section aria-label="Sorotan portofolio" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StickyNote warna="mint" rotasi={-1}>
            <p className="font-mono text-xs font-semibold tracking-wide uppercase opacity-80">
              Praktik terbimbing
            </p>
            <p className="mt-2 text-sm leading-[1.6]">Sesi sebelum UTS</p>
          </StickyNote>
          <StickyNote warna="peach" rotasi={1}>
            <p className="font-mono text-xs font-semibold tracking-wide uppercase opacity-80">
              UTS
            </p>
            <p className="mt-2 text-sm leading-[1.6]">Lengkap + video</p>
          </StickyNote>
          <StickyNote warna="kuning" rotasi={-1}>
            <p className="font-mono text-xs font-semibold tracking-wide uppercase opacity-80">UAS</p>
            <p className="mt-2 text-sm leading-[1.6]">Satu produk terbaik terpilih</p>
          </StickyNote>
          <StickyNote warna="biru" rotasi={1}>
            <p className="font-mono text-xs font-semibold tracking-wide uppercase opacity-80">
              Diisi sekali
            </p>
            <p className="mt-2 text-sm leading-[1.6]">Tampil konsisten di tiap modul</p>
          </StickyNote>
        </section>
      </FadeIn>

      <FadeIn delay={0.05}>
        <section id="ringkasan" className="scroll-mt-28">
          <h2 className="text-xl font-medium text-foreground sm:text-2xl">Ringkasan Tagihan</h2>
          <p className="mt-2 text-base leading-[1.6] text-muted">
            Tiga titik penilaian PPL: Topik 3 menganalisis praktik mengajar terbimbing, sedangkan UTS dan
            UAS membaca siklus praktik mengajar mandiri.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <ModuleCard
              href="/topik-3"
              label="Topik 3"
              judul="Enam Analisis Reflektif"
              deskripsi="Artefak dan narasi analisis: perencanaan, materi, media, video, kegiatan nonmengajar, dan instrumen penilaian."
              progres={progres.analisisTerisi}
              target={progres.analisisTarget}
              warnaIndex={0}
            />
            <ModuleCard
              href="/uts"
              label="UTS"
              judul="Satu Siklus Lengkap"
              deskripsi="Rancangan pembelajaran lengkap beserta video pelaksanaan praktik mengajar mandiri."
              progres={progres.utsLengkap ? 1 : 0}
              target={1}
              warnaIndex={1}
            />
            <ModuleCard
              href="/uas"
              label="UAS"
              judul="Satu Produk Terbaik Terpilih"
              deskripsi="Satu rancangan terpilih beserta video pelaksanaan praktik mengajar mandiri."
              progres={progres.uasLengkap}
              target={progres.uasTarget}
              warnaIndex={2}
            />
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.08}>
        <Panel
          judul="Refleksi"
          deskripsi="Model guru yang dituju, filosofi mengajar, dan refleksi akhir atas pengalaman PPL Mandiri."
          aksi={
            <Tombol href="/refleksi" varian="garis" className="px-3.5 py-1.5">
              Buka Refleksi
            </Tombol>
          }
        >
          <p className="text-base leading-[1.6] text-muted">
            Kriteria penilaian tersendiri di rubrik LMS menuntut kedalaman di luar field profil, jadi
            disajikan di halaman terpisah.
          </p>
        </Panel>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section>
          <h2 className="text-xl font-medium text-foreground sm:text-2xl">
            Siklus Praktik Mengajar Mandiri
          </h2>

          {daftarSiklus.length === 0 ? (
            <p className="mt-6 rounded-card border border-dashed border-border bg-surface px-5 py-6 text-sm text-muted">
              Belum ada siklus yang terisi.
            </p>
          ) : (
            /* Baris siklus memakai komponen yang sama dengan daftar UAS. */
            <ul className="mt-6 space-y-3">
              {daftarSiklus.map((siklus) => (
                <KartuSiklus key={siklus.id} siklus={siklus} />
              ))}
            </ul>
          )}
        </section>
      </FadeIn>

      {/* Kontak — PRD bagian 4.1: email dan/atau kontak publik lain. */}
      <FadeIn delay={0.15}>
        <Panel judul="Kontak" deskripsi="Email dan/atau kontak lain yang boleh dihubungi publik.">
          {profil?.kontak ? (
            <ul className="space-y-2 text-base leading-[1.6] text-muted">
              {profil.kontak
                .split('\n')
                .map((baris) => baris.trim())
                .filter(Boolean)
                .map((baris, index) => (
                  <li key={index}>
                    <BarisKontak baris={baris} />
                  </li>
                ))}
            </ul>
          ) : (
            <BelumDiisi pesan="Kontak belum diisi." />
          )}
        </Panel>
      </FadeIn>
    </div>
  );
}
