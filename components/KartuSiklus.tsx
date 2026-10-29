import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { KELAS_NOTE, KELAS_TAPE, KELAS_WARNA_NOTE, warnaNote } from '@/components/gayaKartu';
import { ARTEFAK_SIKLUS, jumlahArtefakTerisi } from '@/lib/siklus';
import type { Siklus } from '@/lib/queries';

/**
 * Tujuan klik sebuah siklus (PRD.md bagian 5): siklus 1 disajikan di halaman
 * UTS; siklus 2 hanya punya halaman publik kalau ditandai sebagai produk UAS,
 * dan halamannya adalah /uas. Siklus yang tidak terpilih tetap tersimpan
 * sebagai data, tapi tidak ditampilkan penuh di halaman publik UAS — jadi
 * kartunya bukan tautan (mengembalikan null).
 */
export function hrefSiklus(siklus: Pick<Siklus, 'nomor_siklus' | 'is_uas_pilihan'>): string | null {
  if (siklus.nomor_siklus === 1) return '/uts';
  return siklus.is_uas_pilihan ? '/uas' : null;
}

/**
 * Satu baris siklus di daftar publik — sticky note pastel dengan strip tape,
 * memakai bahasa kartu yang sama dengan ModuleCard/KartuKategori. Sengaja <li>
 * supaya dipakai langsung di dalam <ul>.
 */
export default function KartuSiklus({ siklus }: { siklus: Siklus }) {
  const tujuan = hrefSiklus(siklus);
  const produkUas = siklus.nomor_siklus >= 2 && siklus.is_uas_pilihan;
  // Label kartu memakai nama MODUL, bukan nomor siklus: siklus 1 = UTS,
  // siklus 2 = UAS (keputusan pemilik). Nomor tetap dipakai sebagai cadangan
  // kalau ada siklus di luar 1–2 (admin hanya mengelola dua siklus).
  const labelModul =
    siklus.nomor_siklus === 1
      ? 'UTS'
      : siklus.nomor_siklus === 2
        ? 'UAS'
        : `Siklus ${siklus.nomor_siklus}`;

  const isi = (
    <>
      <span aria-hidden className={KELAS_TAPE} />

      <div className="min-w-0">
        <p className="font-mono text-xs leading-[1.2] font-semibold tracking-wide uppercase opacity-80">
          {labelModul}
          {produkUas && labelModul !== 'UAS' ? ' · Produk UAS' : ''}
        </p>
        <p className="mt-1 text-sm font-medium">{siklus.judul_topik}</p>
        <p className="mt-1 font-mono text-xs leading-[1.2] tracking-wide uppercase opacity-80">
          {jumlahArtefakTerisi(siklus)}/{ARTEFAK_SIKLUS.length} artefak terisi
        </p>
        {siklus.nomor_siklus >= 2 && !siklus.is_uas_pilihan ? (
          <p className="mt-1 text-xs leading-[1.6] opacity-70">
            Tersimpan sebagai data, bukan produk UAS yang dipilih.
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <StatusBadge status={siklus.status} diAtasNote />
        {tujuan ? (
          <span aria-hidden className="opacity-70 transition-transform group-hover:translate-x-0.5">
            →
          </span>
        ) : null}
      </div>
    </>
  );

  const kelas = `group flex flex-wrap items-center justify-between gap-3 py-4 ${KELAS_NOTE} ${KELAS_WARNA_NOTE[warnaNote(siklus.nomor_siklus)]}`;

  return (
    <li>
      {tujuan ? (
        <Link href={tujuan} className={kelas}>
          {isi}
        </Link>
      ) : (
        <div className={kelas}>{isi}</div>
      )}
    </li>
  );
}
