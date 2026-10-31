import type { Metadata } from 'next';
import Link from 'next/link';
import BelumDiisi from '@/components/BelumDiisi';
import FadeIn from '@/components/FadeIn';
import Lencana from '@/components/Lencana';
import Panel from '@/components/Panel';
import PenampilEmbed from '@/components/PenampilEmbed';
import Tombol, { GAYA_TOMBOL, KELAS_DASAR_TOMBOL } from '@/components/Tombol';

export const metadata: Metadata = {
  title: 'RAIN - Rekan AI Informatika',
  description:
    'Slide presentasi seminar PPG RAIN - Rekan AI Informatika: identitas kegiatan, ringkasan materi yang dipaparkan, dan berkas slide yang bisa dibuka serta diunduh.',
};

/**
 * Isi halaman seminar — sengaja statis di kode (pilihan pemilik portofolio),
 * bukan dari database. Cukup ubah nilai di objek ini untuk memperbarui halaman;
 * tidak ada form admin untuk modul ini.
 *
 * `tautanSlide` memakai URL DESAIN Canva (`/design/<ID>/…/view`), bukan tautan
 * pendek `canva.link` — tautan pendek tidak dikenali sematan (lib/embed.ts) dan
 * akan jatuh ke kartu tautan. Desainnya dibagikan publik lewat menu Share Canva.
 * Tautan pendek aslinya: https://canva.link/4pg1co8lt9kxz1p
 *
 * `tautanUnduh` berisi berkas PDF slide di Google Drive (tautan `view`, jadi
 * terbuka di penampil Drive; pengunjung menekan tombol unduh di sana).
 */
const SEMINAR = {
  judul: 'RAIN - Rekan AI Informatika',
  pengantar: '',
  penyaji: 'Raisul Amin R, S.Kom.',
  tanggal: '03 November 2026',
  tempat: 'Rektorat Lt.3',
  penguji: 'Indra Parman, S.Kom., M.Pd & Ali Akbar, S.Kom., M.Pd.',
  moderator: 'Rizka Indahyanti, S.Pd., M.Pd.',
  ringkasan:
    'Tutor AI berbasis Dify + Gemini yang menuntun peserta didik melalui diagnosis, pertanyaan pemantik, bantuan bertahap, percobaan, umpan balik, dan refleksi, bukan memberi jawaban akhir.',
  tautanSlide:
    'https://www.canva.com/design/DAHZjadsY2w/oGnnCQchHedS6oK79nYKNA/view',
  tautanUnduh:
    'https://drive.google.com/file/d/1pt_aPYwF9SC-uHLKAb9FmkfJ_rabD99i/view?usp=sharing',
};

const LABEL = 'font-mono text-xs leading-[1.2] font-semibold tracking-wide text-muted uppercase';

/** Baris identitas yang hanya ditampilkan kalau nilainya sudah diisi. */
function barisIdentitas() {
  return [
    { label: 'Penyaji', nilai: SEMINAR.penyaji },
    { label: 'Tanggal', nilai: SEMINAR.tanggal },
    { label: 'Tempat', nilai: SEMINAR.tempat },
    { label: 'Penguji / Audiens', nilai: SEMINAR.penguji },
    { label: 'Dosen Pengampu / Moderator', nilai: SEMINAR.moderator },
  ].filter((baris) => baris.nilai.trim().length > 0);
}

export default function SeminarPage() {
  const identitas = barisIdentitas();

  return (
    <div className="space-y-16">
      <FadeIn>
        <section className="pt-4 pb-2 sm:pt-10">
          <Lencana>Seminar PPG</Lencana>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-normal uppercase leading-[1.04] tracking-normal text-foreground sm:text-5xl lg:text-[4rem]">
            {SEMINAR.judul}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-[1.6] text-muted sm:text-lg">
            {SEMINAR.pengantar ||
              'Slide presentasi seminar PPG, disajikan langsung di halaman ini agar dosen penguji dapat membacanya tanpa berpindah berkas.'}
          </p>
        </section>
      </FadeIn>

      <FadeIn delay={0.05}>
        <Panel
          judul="Identitas Seminar"
          deskripsi="Keterangan singkat pelaksanaan presentasi seminar."
        >
          {identitas.length === 0 ? (
            <BelumDiisi pesan="Identitas seminar belum diisi." />
          ) : (
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {identitas.map((baris) => (
                <div key={baris.label} className="border-b border-border pb-3">
                  <dt className={LABEL}>{baris.label}</dt>
                  <dd className="mt-1 text-base leading-[1.6] text-foreground">{baris.nilai}</dd>
                </div>
              ))}
            </dl>
          )}
        </Panel>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Panel
          judul="Ringkasan Seminar"
          deskripsi="Gambaran isi presentasi yang dipaparkan pada seminar."
        >
          {SEMINAR.ringkasan ? (
            <div className="space-y-4 text-base leading-[1.6] text-muted">
              {SEMINAR.ringkasan.split('\n').map((paragraf, index) => (
                <p key={index}>{paragraf}</p>
              ))}
            </div>
          ) : (
            <BelumDiisi pesan="Ringkasan seminar belum diisi." />
          )}
        </Panel>
      </FadeIn>

      <FadeIn delay={0.15}>
        <section>
          <h2 className="text-xl font-medium text-foreground sm:text-2xl">Slide Presentasi</h2>
          <p className="mt-2 max-w-2xl text-base leading-[1.6] text-muted">
            Slide dapat digeser dan diperbesar di dalam bingkai ini; tautan aslinya tetap tersedia
            untuk dibuka di tab baru.
          </p>

          <div className="mt-6 space-y-4">
            {SEMINAR.tautanSlide ? (
              <PenampilEmbed
                url={SEMINAR.tautanSlide}
                judul={SEMINAR.judul}
                jenis="dokumen"
                label="slide seminar"
              />
            ) : (
              <BelumDiisi pesan="Tautan slide Canva belum diisi." />
            )}

            {SEMINAR.tautanUnduh ? (
              <a
                href={SEMINAR.tautanUnduh}
                target="_blank"
                rel="noopener noreferrer"
                className={`${KELAS_DASAR_TOMBOL} ${GAYA_TOMBOL.garis}`}
              >
                Buka Slide PDF
                <span aria-hidden>↗</span>
              </a>
            ) : null}
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.2}>
        <nav aria-label="Navigasi modul" className="flex flex-wrap items-center gap-3">
          <Tombol href="/uas" varian="utama">
            Modul UAS
          </Tombol>
          <Tombol href="/refleksi" varian="garis">
            Refleksi
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
