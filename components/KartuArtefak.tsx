import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { KELAS_NOTE, KELAS_TAPE, KELAS_WARNA_NOTE, warnaNote } from '@/components/gayaKartu';
import type { ArtefakSiklus } from '@/lib/siklus';

/**
 * Kartu satu artefak di menu halaman UTS/UAS — motif sticky note yang sama
 * dengan KartuKategori Topik 3, supaya kedua modul memakai bahasa visual yang
 * konsisten: daftar kartu di halaman indeks, isi artefaknya di halaman sendiri.
 */
export default function KartuArtefak({
  artefak,
  nomor,
  dasar,
  terisi,
  warnaIndex = 0,
}: {
  artefak: ArtefakSiklus;
  /** Urutan tampil artefak ini (01–07). */
  nomor: number;
  /** Basis URL menu: '/uts' atau '/uas'. */
  dasar: string;
  terisi: boolean;
  /** Urutan kartu di daftar — menentukan warna pastelnya. */
  warnaIndex?: number;
}) {
  return (
    <Link
      href={`${dasar}/${artefak.slug}`}
      className={`group flex flex-col justify-between ${KELAS_NOTE} ${KELAS_WARNA_NOTE[warnaNote(warnaIndex)]}`}
    >
      <span aria-hidden className={KELAS_TAPE} />

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-xs leading-[1.2] font-semibold tracking-wide uppercase opacity-80">
            Artefak {String(nomor).padStart(2, '0')}
          </span>
          <StatusBadge status={terisi ? 'terisi' : 'kosong'} diAtasNote />
        </div>

        <h3 className="mt-3 text-lg font-medium">{artefak.judul}</h3>
        <p className="mt-2 text-sm leading-[1.6] opacity-80">{artefak.deskripsi}</p>
      </div>

      <span className="mt-5 inline-flex items-center gap-2 font-mono text-xs leading-[1.2] tracking-wide uppercase opacity-80 transition-opacity group-hover:opacity-100">
        Buka artefak
        <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </Link>
  );
}
