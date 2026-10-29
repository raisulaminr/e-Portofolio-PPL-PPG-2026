/**
 * Sumber tunggal untuk kolom artefak praktik mengajar.
 *
 * Dua entitas memakai kolom dasar yang sama: `siklus` (praktik mengajar
 * mandiri → UTS/UAS) dan `terbimbing` (praktik mengajar terbimbing → Topik 3).
 * lib/terbimbing.ts hanya mengambil kolom DASAR (lima artefak) dari daftar ini.
 *
 * Fase 6 menambah artefak bukti KHUSUS siklus (contoh hasil kerja siswa,
 * penilaian GP, penilaian DPL) — lihat PRD.md bagian 4.3 & 4.5. Artefak ini
 * tidak dimiliki praktik terbimbing, jadi sengaja dipisah dari `KolomSiklus`.
 * Kolomnya HARUS sama dengan TECH-SPEC.md bagian 3.
 *
 * Kolom `penilaian_dpl_url` sengaja TETAP ada di sini (dan di database) supaya
 * data lama tidak hilang, tetapi tidak lagi terdaftar di `ARTEFAK_SIKLUS` —
 * Penilaian DPL sudah tidak ditampilkan/diisi sebagai artefak UTS/UAS.
 */

export type KolomSiklus =
  | 'rpp_url'
  | 'materi_url'
  | 'media_url'
  | 'video_url'
  | 'instrumen_penilaian_url';

/** Artefak bukti tambahan — khusus siklus (UTS/UAS), bukan praktik terbimbing. */
export type KolomSiklusBaru =
  | 'hasil_kerja_siswa_url'
  | 'penilaian_gp_url'
  | 'penilaian_dpl_url';

/** Semua kolom artefak milik entitas `siklus`. */
export type KolomSemuaSiklus = KolomSiklus | KolomSiklusBaru;

/** Bentuk minimal yang dibutuhkan helper di file ini — dipenuhi oleh `Siklus`. */
export type ArtefakTerisi = Record<KolomSemuaSiklus, string | null>;

/** Artefak dokumen ditampilkan dalam bingkai tinggi; video dalam bingkai 16:9. */
export type JenisArtefak = 'dokumen' | 'video';

export interface ArtefakSiklus {
  field: KolomSemuaSiklus;
  /** Potongan URL halaman detail artefak ini: /uts/[slug] dan /uas/[slug]. */
  slug: string;
  /** Nama artefak seperti dibaca dosen penguji (dipakai juga di halaman Topik 3). */
  label: string;
  /** Judul panel di halaman "produk lengkap" (UTS/UAS). */
  judul: string;
  /** Kalimat pengantar panel. */
  deskripsi: string;
  jenis: JenisArtefak;
  /** Kolom penjelas tambahan yang ikut ditampilkan (khusus media & hasil kerja). */
  deskripsiField?: 'media_deskripsi' | 'hasil_kerja_siswa_deskripsi';
  /** Label untuk kolom penjelas di atas. */
  deskripsiFieldLabel?: string;
  /**
   * Artefak yang lampirannya kumpulan FOTO, bukan satu dokumen. Kalau kolomnya
   * diisi jalur folder di `public/` (mis. `/dokumentasi/hasil-kerja/siklus-1`),
   * halaman menampilkan carousel — bukan tautan keluar (lib/dokumentasi.ts).
   */
  dukungGaleriFoto?: boolean;
}

export const ARTEFAK_SIKLUS: readonly ArtefakSiklus[] = [
  {
    field: 'rpp_url',
    slug: 'rancangan-pembelajaran',
    label: 'Dokumen RPP',
    judul: 'Rancangan Pelaksanaan Pembelajaran',
    deskripsi: 'Perencanaan pembelajaran lengkap yang dipakai pada siklus ini.',
    jenis: 'dokumen',
  },
  {
    field: 'materi_url',
    slug: 'materi-pembelajaran',
    label: 'Bahan / Materi Ajar',
    judul: 'Materi Pembelajaran',
    deskripsi: 'Bahan ajar yang disusun dan dipakai di kelas pada siklus ini.',
    jenis: 'dokumen',
  },
  {
    field: 'media_url',
    slug: 'media-pembelajaran',
    label: 'Media yang Digunakan',
    judul: 'Media Pembelajaran',
    deskripsi: 'Media pendukung pembelajaran beserta catatan cara pakainya.',
    jenis: 'dokumen',
    deskripsiField: 'media_deskripsi',
    deskripsiFieldLabel: 'Deskripsi media',
  },
  {
    field: 'hasil_kerja_siswa_url',
    slug: 'hasil-kerja-siswa',
    label: 'Contoh Hasil Kerja Siswa',
    judul: 'Contoh Hasil Kerja Siswa',
    deskripsi:
      'Contoh pekerjaan peserta didik dari pembelajaran siklus ini, bukti artefak yang bervariasi.',
    jenis: 'dokumen',
    deskripsiField: 'hasil_kerja_siswa_deskripsi',
    deskripsiFieldLabel: 'Konteks hasil kerja',
    dukungGaleriFoto: true,
  },
  {
    field: 'video_url',
    slug: 'video-praktik-mengajar',
    label: 'Video Pelaksanaan',
    judul: 'Video Praktik Mengajar Mandiri',
    deskripsi: 'Rekaman pelaksanaan praktik mengajar, di-embed langsung dari YouTube/Drive.',
    jenis: 'video',
  },
  {
    field: 'instrumen_penilaian_url',
    slug: 'instrumen-penilaian',
    label: 'Instrumen & Rubrik',
    judul: 'Instrumen Penilaian',
    deskripsi: 'Instrumen dan rubrik penilaian yang dirancang untuk siklus ini.',
    jenis: 'dokumen',
  },
  {
    field: 'penilaian_gp_url',
    slug: 'penilaian-guru-pamong',
    label: 'Penilaian Guru Pamong (GP)',
    judul: 'Penilaian Guru Pamong',
    deskripsi: 'Lembar/tautan penilaian dari Guru Pamong untuk siklus ini.',
    jenis: 'dokumen',
  },
];

export function getArtefakSiklus(field: KolomSemuaSiklus): ArtefakSiklus {
  const artefak = ARTEFAK_SIKLUS.find((item) => item.field === field);
  if (!artefak) throw new Error(`Artefak siklus "${field}" tidak dikenal.`);
  return artefak;
}

/** Artefak berdasarkan potongan URL-nya (dipakai /uts/[artefak] & /uas/[artefak]). */
export function getArtefakSiklusBySlug(slug: string): ArtefakSiklus | undefined {
  return ARTEFAK_SIKLUS.find((artefak) => artefak.slug === slug);
}

/**
 * Artefak yang wajib terisi sebelum status siklus boleh diubah ke 'lengkap'
 * (TECH-SPEC.md bagian 4 — validasi minimal). Untuk siklus 1 halaman UTS,
 * inti tagihannya adalah RPP + video (PRD.md bagian 4.4).
 */
export const FIELD_WAJIB_LENGKAP: readonly KolomSiklus[] = ['rpp_url', 'video_url'];

/** Jumlah artefak yang sudah bertaut. `daftar` bisa dipersempit (mis. terbimbing). */
export function jumlahArtefakTerisi(
  nilai: Partial<Record<KolomSemuaSiklus, string | null>>,
  daftar: readonly ArtefakSiklus[] = ARTEFAK_SIKLUS,
): number {
  return daftar.filter((artefak) => Boolean(nilai[artefak.field])).length;
}

/** Label artefak wajib yang masih kosong — dipakai di pesan validasi. */
export function labelWajibYangKosong(
  nilai: Partial<Record<KolomSemuaSiklus, string | null>>,
): string[] {
  return FIELD_WAJIB_LENGKAP.filter((field) => !nilai[field]).map(
    (field) => getArtefakSiklus(field).label,
  );
}
