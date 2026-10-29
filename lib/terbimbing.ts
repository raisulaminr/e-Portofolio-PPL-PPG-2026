/**
 * Artefak milik praktik mengajar terbimbing — sesi terbimbing sebelum siklus 1
 * yang menjadi sumber artefak lima kategori Topik 3 (PRD.md bagian 5).
 *
 * Sesi ini SENGAJA terpisah dari tabel `siklus` (praktik mengajar mandiri yang
 * dipakai UTS/UAS). Daftar kolomnya diturunkan dari `ARTEFAK_SIKLUS` di
 * lib/siklus.ts, tetapi DISARING hanya lima kolom dasar: artefak bukti tambahan
 * (contoh hasil kerja siswa, penilaian GP/DPL) khusus siklus dan tidak ada di
 * tabel `terbimbing`.
 */

import { ARTEFAK_SIKLUS, type ArtefakSiklus, type KolomSiklus } from './siklus';

/** Lima kolom artefak yang dimiliki praktik mengajar terbimbing. */
const KOLOM_TERBIMBING: readonly KolomSiklus[] = [
  'rpp_url',
  'materi_url',
  'media_url',
  'video_url',
  'instrumen_penilaian_url',
];

/** Bagian tampilan yang boleh berbeda dari versi siklus — kolomnya tetap sama. */
type PenyesuaianArtefak = Partial<
  Omit<ArtefakSiklus, 'field' | 'jenis' | 'deskripsiField' | 'deskripsiFieldLabel'>
>;

const PENYESUAIAN: Partial<Record<KolomSiklus, PenyesuaianArtefak>> = {
  video_url: {
    label: 'Video Praktik',
    judul: 'Video Praktik Mengajar Terbimbing',
    deskripsi:
      'Rekaman pelaksanaan praktik mengajar terbimbing, di-embed langsung dari YouTube/Drive.',
  },
};

/** Artefak terbimbing — hanya kolom dasar, tanpa artefak khusus siklus. */
export type ArtefakTerbimbing = Omit<ArtefakSiklus, 'field' | 'deskripsiField'> & {
  field: KolomSiklus;
  deskripsiField?: 'media_deskripsi';
};

/** Lima artefak praktik mengajar terbimbing, dengan urutan sama seperti siklus. */
export const ARTEFAK_TERBIMBING: readonly ArtefakTerbimbing[] = ARTEFAK_SIKLUS.filter((artefak) =>
  (KOLOM_TERBIMBING as readonly string[]).includes(artefak.field),
).map(
  (artefak) =>
    ({ ...artefak, ...PENYESUAIAN[artefak.field as KolomSiklus] }) as ArtefakTerbimbing,
);

export function getArtefakTerbimbing(field: KolomSiklus): ArtefakTerbimbing {
  const artefak = ARTEFAK_TERBIMBING.find((item) => item.field === field);
  if (!artefak) throw new Error(`Artefak terbimbing "${field}" tidak dikenal.`);
  return artefak;
}
