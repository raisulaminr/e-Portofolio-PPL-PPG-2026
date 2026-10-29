import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { KELAS_NOTE, KELAS_TAPE, KELAS_WARNA_NOTE, warnaNote } from '@/components/gayaKartu';
import type { DefinisiKategori } from '@/lib/kategori';

/**
 * Kartu satu kategori analisis di landing /topik-3.
 * Memakai motif sticky note yang sama dengan ModuleCard supaya bahasa visualnya
 * konsisten; StatusBadge tetap dipakai untuk menandai terisi/kosong.
 */
export default function KartuKategori({
  kategori,
  terisi,
  warnaIndex = 0,
}: {
  kategori: DefinisiKategori;
  terisi: boolean;
  /** Urutan kartu di daftar — menentukan warna pastelnya. */
  warnaIndex?: number;
}) {
  return (
    <Link
      href={`/topik-3/${kategori.slug}`}
      className={`group flex flex-col justify-between ${KELAS_NOTE} ${KELAS_WARNA_NOTE[warnaNote(warnaIndex)]}`}
    >
      <span aria-hidden className={KELAS_TAPE} />

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-xs leading-[1.2] font-semibold tracking-wide uppercase opacity-80">
            Kategori {String(kategori.nomor).padStart(2, '0')}
          </span>
          <StatusBadge status={terisi ? 'terisi' : 'kosong'} diAtasNote />
        </div>

        <h3 className="mt-3 text-lg font-medium">{kategori.judul}</h3>
        <p className="mt-2 text-sm leading-[1.6] opacity-80">{kategori.ringkasan}</p>
      </div>

      <span className="mt-5 inline-flex items-center gap-2 font-mono text-xs leading-[1.2] tracking-wide uppercase opacity-80 transition-opacity group-hover:opacity-100">
        Buka analisis
        <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </Link>
  );
}