/**
 * Lima komponen analisis artefak (PRD.md bagian 4.3 & rubrik LMS §10): setiap
 * artefak dianalisis lewat 5 bagian eksplisit, bukan satu paragraf umum.
 *
 * Slug di sini adalah kontrak kolom sekaligus urutan tampilan di halaman publik
 * dan form admin. Dipakai dua tempat:
 * - `analisis_topik3` (6 kategori Topik 3, dari praktik mengajar terbimbing),
 * - `analisis_siklus` (per field artefak siklus, untuk UTS/UAS).
 *
 * Isinya sengaja tidak boleh dipertukarkan antar modul: analisis RPP di Topik 3
 * berbeda dari analisis RPP di siklus UTS/UAS, jadi mereka disimpan terpisah.
 * Jangan ubah slug tanpa memperbarui skema, form, dan halaman.
 */

import type { KolomSemuaSiklus } from './siklus';

export type KolomAnalisis = 'konteks' | 'tujuan' | 'kelebihan' | 'kekurangan' | 'kajian_teori';

/** Nilai 5 komponen satu analisis (null = belum diisi). */
export type NilaiAnalisis = Record<KolomAnalisis, string | null>;

/** Peta analisis per artefak siklus: field artefak → 5 komponennya. */
export type AnalisisPerField = Partial<Record<KolomSemuaSiklus, NilaiAnalisis>>;

export interface KomponenAnalisis {
  field: KolomAnalisis;
  label: string;
  /** Petunjuk singkat di form admin & penjelas di halaman publik. */
  petunjuk: string;
}

export const KOMPONEN_ANALISIS: readonly KomponenAnalisis[] = [
  {
    field: 'konteks',
    label: 'Konteks',
    petunjuk: 'Situasi/latar saat artefak ini dibuat dan digunakan.',
  },
  {
    field: 'tujuan',
    label: 'Tujuan',
    petunjuk: 'Untuk apa artefak ini dirancang.',
  },
  {
    field: 'kelebihan',
    label: 'Kelebihan',
    petunjuk: 'Apa yang berhasil atau efektif dari artefak ini.',
  },
  {
    field: 'kekurangan',
    label: 'Kekurangan',
    petunjuk: 'Apa yang masih kurang dan perlu diperbaiki.',
  },
  {
    field: 'kajian_teori',
    label: 'Kajian Teori',
    petunjuk: 'Kaitkan dengan teori mata kuliah PPG yang relevan dan terintegrasi dengan PPL.',
  },
];

/**
 * Label komponen yang masih kosong — dipakai bersama oleh form admin dan route
 * handler supaya aturan "lima komponen wajib terisi" hanya ditulis sekali.
 */
export function labelKomponenKosong(nilai: Partial<Record<KolomAnalisis, string | null>>): string[] {
  return KOMPONEN_ANALISIS.filter((komponen) => !(nilai[komponen.field] ?? '').trim()).map(
    (komponen) => komponen.label,
  );
}

/** `true` kalau minimal satu komponen sudah terisi. */
export function adaAnalisis(nilai: NilaiAnalisis | null | undefined): boolean {
  return Boolean(nilai) && KOMPONEN_ANALISIS.some((komponen) => Boolean(nilai?.[komponen.field]));
}

/**
 * Ubah daftar baris analisis siklus (satu baris = satu field) menjadi peta yang
 * siap dipakai `HalamanArtefakSiklus`/`AnalisisLimaKomponen`. Bentuk argumennya minimal
 * (`field` + 5 komponen) supaya helper ini tidak bergantung pada tipe query.
 */
export function analisisPerField(
  daftar: ReadonlyArray<{ field: string } & NilaiAnalisis>,
): AnalisisPerField {
  const peta: AnalisisPerField = {};
  for (const baris of daftar) {
    peta[baris.field as KolomSemuaSiklus] = {
      konteks: baris.konteks,
      tujuan: baris.tujuan,
      kelebihan: baris.kelebihan,
      kekurangan: baris.kekurangan,
      kajian_teori: baris.kajian_teori,
    };
  }
  return peta;
}
