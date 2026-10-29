/**
 * Definisi tetap 6 kategori analisis Topik 3 (PRD.md bagian 4.3).
 *
 * Slug di sini adalah kontrak URL sekaligus nilai kolom `kategori` di tabel
 * analisis_topik3 (TECH-SPEC.md bagian 3) — dipakai oleh /topik-3/[kategori]
 * dan /admin/analisis/[kategori]. Jangan menambah/mengubah slug di sini tanpa
 * memperbarui PRD.md, TECH-SPEC.md, dan AGENT-BRIEF.md.
 */

import type { KolomSiklus } from './siklus';

export type KategoriSlug =
  | 'perencanaan'
  | 'materi'
  | 'media'
  | 'video'
  | 'nonmengajar'
  | 'instrumen';

/** `KolomSiklus` (lib/siklus.ts) adalah satu-satunya daftar kolom artefak praktik mengajar. */
export type KolomArtefak = KolomSiklus;

export interface DefinisiKategori {
  slug: KategoriSlug;
  /** Urutan 01–06 pada tampilan. */
  nomor: number;
  judul: string;
  ringkasan: string;
  /**
   * Dari mana artefak kategori ini ditarik (PRD.md bagian 5):
   * `terbimbing` = praktik mengajar terbimbing (kolomnya di lib/terbimbing.ts),
   * `nonmengajar` = tabel kegiatan_nonmengajar. Tidak ada kategori yang membaca
   * tabel `siklus` — artefak UTS/UAS memang terpisah dari Topik 3.
   */
  sumber: 'terbimbing' | 'nonmengajar';
  /** Artefak praktik mengajar terbimbing yang ditonjolkan kategori ini — labelnya ada di lib/terbimbing.ts. */
  artefak: KolomSiklus[];
}

export const KATEGORI_TOPIK3: readonly DefinisiKategori[] = [
  {
    slug: 'perencanaan',
    nomor: 1,
    judul: 'Produk Rancangan Pembelajaran',
    ringkasan:
      'Analisis RPP terbaik dari praktik mengajar terbimbing: kejelasan tujuan, keruntutan langkah, dan kesiapan asesmennya.',
    sumber: 'terbimbing',
    artefak: ['rpp_url'],
  },
  {
    slug: 'materi',
    nomor: 2,
    judul: 'Materi Pembelajaran',
    ringkasan:
      'Analisis materi yang disusun dan diterapkan: ketepatan cakupan, kedalaman, dan kesesuaiannya dengan Fase E.',
    sumber: 'terbimbing',
    artefak: ['materi_url'],
  },
  {
    slug: 'media',
    nomor: 3,
    judul: 'Media Pembelajaran',
    ringkasan:
      'Analisis media yang digunakan di kelas: alasan pemilihan, cara pakai, dan dampaknya pada keterlibatan peserta didik.',
    sumber: 'terbimbing',
    artefak: ['media_url'],
  },
  {
    slug: 'video',
    nomor: 4,
    judul: 'Video Praktik Mengajar Terbimbing',
    ringkasan:
      'Analisis rekaman pelaksanaan praktik mengajar terbimbing: pengelolaan kelas, alur pembelajaran, dan hal yang perlu diperbaiki.',
    sumber: 'terbimbing',
    artefak: ['video_url'],
  },
  {
    slug: 'nonmengajar',
    nomor: 5,
    judul: 'Kegiatan Nonmengajar',
    ringkasan:
      'Analisis keterlibatan pada kegiatan sekolah di luar jam mengajar selama masa PPL, tidak terikat siklus mana pun.',
    sumber: 'nonmengajar',
    artefak: [],
  },
  {
    slug: 'instrumen',
    nomor: 6,
    judul: 'Instrumen Penilaian',
    ringkasan:
      'Analisis instrumen yang dirancang: keselarasan dengan tujuan, kejelasan rubrik, dan keadilan penilaiannya.',
    sumber: 'terbimbing',
    artefak: ['instrumen_penilaian_url'],
  },
];

export function getDefinisiKategori(slug: string): DefinisiKategori | undefined {
  return KATEGORI_TOPIK3.find((kategori) => kategori.slug === slug);
}
