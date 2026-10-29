import Link from 'next/link';
import AnalisisLimaKomponen from '@/components/AnalisisLimaKomponen';
import FadeIn from '@/components/FadeIn';
import GaleriDokumentasi from '@/components/GaleriDokumentasi';
import Lencana from '@/components/Lencana';
import Panel from '@/components/Panel';
import PenampilEmbed from '@/components/PenampilEmbed';
import StatusBadge from '@/components/StatusBadge';
import Tombol from '@/components/Tombol';
import type { NilaiAnalisis } from '@/lib/analisis';
import { adalahJalurLokal } from '@/lib/dokumentasi';
import type { Siklus } from '@/lib/queries';
import { ARTEFAK_SIKLUS, type ArtefakSiklus } from '@/lib/siklus';

const LABEL = 'font-mono text-xs leading-[1.2] font-semibold tracking-wide text-muted uppercase';

/**
 * Halaman detail SATU artefak siklus — dipakai /uts/[artefak] (siklus 1) dan
 * /uas/[artefak] (siklus yang ditandai produk UAS). Isinya: lampiran artefak
 * plus analisis lima komponennya, pola yang sama dengan halaman /topik-3/[kategori].
 *
 * Komponen ini tidak mengambil data sendiri; pemanggil yang menyiapkan `siklus`
 * dan `analisis`, jadi UTS dan UAS tetap hanya "menampilkan ulang" entitas siklus.
 */
export default function HalamanArtefakSiklus({
  modul,
  dasar,
  siklus,
  artefak,
  analisis,
}: {
  /** Nama modul untuk label: 'UTS' atau 'UAS'. */
  modul: string;
  /** Basis URL modul: '/uts' atau '/uas'. */
  dasar: string;
  siklus: Siklus;
  artefak: ArtefakSiklus;
  /** Analisis artefak ini (null kalau belum ditulis). */
  analisis: NilaiAnalisis | null;
}) {
  const nomor = ARTEFAK_SIKLUS.findIndex((item) => item.field === artefak.field) + 1;
  const sebelumnya = ARTEFAK_SIKLUS[nomor - 2];
  const berikutnya = ARTEFAK_SIKLUS[nomor];
  const nilai = siklus[artefak.field];
  const penjelas = artefak.deskripsiField ? siklus[artefak.deskripsiField] : null;
  // UAS tidak menampilkan nomor siklus apa adanya — di halaman publik ia
  // tampil sebagai siklus terbaik dari rentang 2–4 (keputusan pemilik, PRD.md
  // §4.5). UTS memakai nama modulnya, "UTS", bukan "Siklus 1" (keputusan
  // pemilik: label publik konsisten dengan nama modul, bukan nomor siklus).
  const labelSiklus = modul === 'UAS' ? 'Siklus Terbaik (2–4)' : modul;
  const labelSiklusRendah = modul === 'UAS' ? 'siklus terbaik (2–4)' : modul;

  return (
    <div className="space-y-16">
      <FadeIn>
        <section className="pt-4 pb-2 sm:pt-10">
          <Link
            href={dasar}
            className="group inline-flex items-center gap-2 font-mono text-xs leading-[1.2] tracking-wide text-muted uppercase transition-colors hover:text-foreground"
          >
            <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">
              ←
            </span>
            Semua artefak {modul}
          </Link>

          <div className="mt-6">
            <Lencana>
              {modul} · Artefak {String(nomor).padStart(2, '0')}
            </Lencana>
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-display font-normal uppercase leading-[1.04] tracking-normal text-foreground sm:text-5xl lg:text-[4rem]">
            {artefak.judul}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-[1.6] text-muted sm:text-lg">{artefak.deskripsi}</p>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <StatusBadge status={nilai ? 'terisi' : 'kosong'} />
            <span className={LABEL}>{labelSiklus}</span>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.05}>
        <Panel judul={artefak.judul} deskripsi={`${labelSiklus} · ${siklus.judul_topik}`}>
          <div className="space-y-4">
            {/* Artefak bergaleri foto (contoh hasil kerja siswa) mengikuti pola
                dokumentasi nonmengajar: jalur folder di public/ → carousel.
                Tautan Drive/gambar tetap lewat penampil inline seperti dulu. */}
            {artefak.dukungGaleriFoto && adalahJalurLokal(nilai) ? (
              <GaleriDokumentasi
                folder={nilai}
                judul={`${artefak.judul} · ${labelSiklusRendah}`}
                label="Dokumentasi hasil kerja"
              />
            ) : (
              <PenampilEmbed
                url={nilai}
                judul={`${artefak.judul} · ${labelSiklusRendah}`}
                jenis={artefak.jenis}
                label={artefak.label}
              />
            )}
            {penjelas ? (
              <div className="rounded-card border border-border bg-surface-muted px-4 py-3">
                <p className={LABEL}>{artefak.deskripsiFieldLabel ?? 'Deskripsi'}</p>
                <p className="mt-1 text-sm leading-[1.6] text-muted">{penjelas}</p>
              </div>
            ) : null}
          </div>
        </Panel>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section>
          <h2 className="text-xl font-medium text-foreground sm:text-2xl">Analisis Artefak</h2>
          <p className="mt-2 max-w-2xl text-base leading-[1.6] text-muted">
            Lima komponen analisis artefak ini (konteks, tujuan, kelebihan, kekurangan, dan kajian
            teori) khusus untuk {labelSiklusRendah}, terpisah dari analisis Topik 3.
          </p>

          <div className="mt-6">
            <AnalisisLimaKomponen
              nilai={analisis}
              varian="panel"
              pesanKosong={`Analisis ${artefak.label.toLowerCase()} ${labelSiklusRendah} belum ditulis.`}
            />
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.15}>
        <nav aria-label="Navigasi antar artefak" className="flex flex-wrap items-center justify-between gap-3">
          {sebelumnya ? (
            <Link
              href={`${dasar}/${sebelumnya.slug}`}
              className="group inline-flex max-w-full items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">
                ←
              </span>
              <span className="truncate">{sebelumnya.judul}</span>
            </Link>
          ) : (
            <Tombol href={dasar} varian="garis">
              Semua artefak
            </Tombol>
          )}

          {berikutnya ? (
            <Link
              href={`${dasar}/${berikutnya.slug}`}
              className="group inline-flex max-w-full items-center gap-2 text-right text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              <span className="truncate">{berikutnya.judul}</span>
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          ) : dasar === '/uts' ? (
            <Tombol href="/uas" varian="utama">
              Lanjut ke Modul UAS
            </Tombol>
          ) : (
            <Tombol href="/" varian="utama">
              Kembali ke Beranda
            </Tombol>
          )}
        </nav>
      </FadeIn>
    </div>
  );
}
