import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { labelKomponenKosong, type KolomAnalisis } from '@/lib/analisis';
import { KATEGORI_TOPIK3, getDefinisiKategori } from '@/lib/kategori';
import {
  SIKLUS_TOTAL,
  hapusAnalisis,
  hapusAnalisisSiklus,
  hapusKegiatan,
  simpanAnalisis,
  simpanAnalisisSiklus,
  simpanKegiatan,
  simpanProfil,
  simpanRefleksi,
  simpanSiklus,
  simpanTerbimbing,
} from '@/lib/queries';
import { getServerSession } from 'next-auth';
import { ARTEFAK_SIKLUS, labelWajibYangKosong } from '@/lib/siklus';
import type { ArtefakTerisi } from '@/lib/siklus';

/**
 * Satu-satunya route handler admin.
 *
 * Sengaja dinamis (`/api/admin/[resource]`) dan bukan satu file per entitas:
 * Vercel Hobby membatasi 12 serverless function per deployment, dan tiap
 * `route.ts` dihitung sebagai satu fungsi (TECH-SPEC.md bagian 7).
 *
 * Resource yang didukung: `analisis`, `siklus`, `terbimbing`, `nonmengajar`, `profil`.
 * Semuanya wajib punya sesi admin — pengecekannya di bawah, bukan di layout,
 * karena route handler tidak dilewati app/admin/layout.tsx.
 */
export const dynamic = 'force-dynamic';

const RESOURCE_DIDUKUNG = [
  'analisis',
  'analisis-siklus',
  'siklus',
  'terbimbing',
  'nonmengajar',
  'profil',
  'refleksi',
] as const;

/** Dipakai di pesan galat supaya slug yang benar mudah ditemukan. */
const DAFTAR_SLUG = KATEGORI_TOPIK3.map((kategori) => kategori.slug).join(', ');

function balas(ok: boolean, status: number, tambahan: Record<string, unknown> = {}) {
  return NextResponse.json({ ok, ...tambahan }, { status });
}

function segarkanTampilan() {
  revalidatePath('/');
  revalidatePath('/profil');
  revalidatePath('/topik-3');
  revalidatePath('/uts');
  revalidatePath('/uas');
  revalidatePath('/refleksi');
  revalidatePath('/admin');
  revalidatePath('/admin/nonmengajar');
  revalidatePath('/admin/profil');
  revalidatePath('/admin/refleksi');
  revalidatePath('/admin/terbimbing');

  for (const kategori of KATEGORI_TOPIK3) {
    revalidatePath(`/topik-3/${kategori.slug}`);
    revalidatePath(`/admin/analisis/${kategori.slug}`);
  }

  for (let nomor = 1; nomor <= SIKLUS_TOTAL; nomor += 1) {
    revalidatePath(`/admin/siklus/${nomor}`);
    revalidatePath(`/admin/siklus/${nomor}/analisis`);
  }
}

/** Terima angka, atau string angka (nilai <select>/<input> selalu string). */
function keAngkaPositif(nilai: unknown): number | null {
  if (typeof nilai === 'number' && Number.isInteger(nilai) && nilai > 0) return nilai;
  if (typeof nilai === 'string' && /^\d+$/.test(nilai.trim())) return Number(nilai.trim());
  return null;
}

/** Field teks opsional: string kosong dianggap belum diisi (NULL di database). */
function keTeksAtauNull(nilai: unknown): string | null {
  if (typeof nilai !== 'string') return null;
  const teks = nilai.trim();
  return teks === '' ? null : teks;
}

function keTeksWajib(nilai: unknown): string {
  return typeof nilai === 'string' ? nilai.trim() : '';
}

/** Checkbox bisa sampai sebagai boolean, 1/0, atau string "true"/"on". */
function keBoolean(nilai: unknown): boolean {
  if (typeof nilai === 'boolean') return nilai;
  if (typeof nilai === 'number') return nilai === 1;
  if (typeof nilai === 'string') {
    const teks = nilai.trim().toLowerCase();
    return teks === '1' || teks === 'true' || teks === 'on' || teks === 'ya';
  }
  return false;
}

async function cekResource(params: Promise<{ resource: string }>) {
  const { resource } = await params;

  if (!(RESOURCE_DIDUKUNG as readonly string[]).includes(resource)) {
    return {
      resource,
      galat: balas(false, 404, {
        error: `Resource "${resource}" belum didukung. Yang tersedia: ${RESOURCE_DIDUKUNG.join(', ')}.`,
      }),
    };
  }

  return { resource, galat: null };
}

/** Buat atau perbarui satu kategori analisis Topik 3 (5 komponen terpisah). */
async function tanganiAnalisis(data: Record<string, unknown>) {
  const kategori = keTeksWajib(data.kategori);
  const definisi = getDefinisiKategori(kategori);

  if (!definisi) {
    return balas(false, 400, {
      error: `Kategori "${kategori || '(kosong)'}" tidak dikenali. Pilih salah satu: ${DAFTAR_SLUG}.`,
    });
  }

  const isian: Record<KolomAnalisis, string> = {
    konteks: keTeksWajib(data.konteks),
    tujuan: keTeksWajib(data.tujuan),
    kelebihan: keTeksWajib(data.kelebihan),
    kekurangan: keTeksWajib(data.kekurangan),
    kajian_teori: keTeksWajib(data.kajian_teori),
  };

  const kosong = labelKomponenKosong(isian);
  if (kosong.length > 0) {
    return balas(false, 400, { error: `Lengkapi dulu: ${kosong.join(', ')}.` });
  }

  const tersimpan = await simpanAnalisis({
    kategori: definisi.slug,
    konteks: isian.konteks,
    tujuan: isian.tujuan,
    kelebihan: isian.kelebihan,
    kekurangan: isian.kekurangan,
    kajianTeori: isian.kajian_teori,
  });
  return balas(true, 200, { data: tersimpan });
}

/**
 * Buat atau perbarui analisis SATU artefak siklus (UTS/UAS), 5 komponen.
 * `field` wajib salah satu kolom artefak di ARTEFAK_SIKLUS dan tidak boleh
 * memakai narasi analisis Topik 3 — keduanya memang berbeda (PRD.md 4.4 & 4.5).
 */
async function tanganiAnalisisSiklus(data: Record<string, unknown>) {
  const nomorSiklus = keAngkaPositif(data.nomor_siklus);
  if (nomorSiklus === null || nomorSiklus > SIKLUS_TOTAL) {
    return balas(false, 400, { error: `nomor_siklus wajib angka 1–${SIKLUS_TOTAL}.` });
  }

  const field = keTeksWajib(data.field);
  const daftarField = ARTEFAK_SIKLUS.map((artefak) => artefak.field).join(', ');
  if (!ARTEFAK_SIKLUS.some((artefak) => artefak.field === field)) {
    return balas(false, 400, {
      error: `Field artefak "${field || '(kosong)'}" tidak dikenali. Pilih salah satu: ${daftarField}.`,
    });
  }

  const isian: Record<KolomAnalisis, string> = {
    konteks: keTeksWajib(data.konteks),
    tujuan: keTeksWajib(data.tujuan),
    kelebihan: keTeksWajib(data.kelebihan),
    kekurangan: keTeksWajib(data.kekurangan),
    kajian_teori: keTeksWajib(data.kajian_teori),
  };

  const kosong = labelKomponenKosong(isian);
  if (kosong.length > 0) {
    return balas(false, 400, { error: `Lengkapi dulu: ${kosong.join(', ')}.` });
  }

  const tersimpan = await simpanAnalisisSiklus({
    nomorSiklus,
    field,
    konteks: isian.konteks,
    tujuan: isian.tujuan,
    kelebihan: isian.kelebihan,
    kekurangan: isian.kekurangan,
    kajianTeori: isian.kajian_teori,
  });
  return balas(true, 200, { data: tersimpan });
}

/** Buat atau perbarui artefak praktik mengajar terbimbing (satu baris). */
async function tanganiTerbimbing(data: Record<string, unknown>) {
  const tersimpan = await simpanTerbimbing({
    judulTopik: keTeksAtauNull(data.judul_topik),
    rppUrl: keTeksAtauNull(data.rpp_url),
    materiUrl: keTeksAtauNull(data.materi_url),
    mediaDeskripsi: keTeksAtauNull(data.media_deskripsi),
    mediaUrl: keTeksAtauNull(data.media_url),
    videoUrl: keTeksAtauNull(data.video_url),
    instrumenPenilaianUrl: keTeksAtauNull(data.instrumen_penilaian_url),
  });

  return balas(true, 200, { data: tersimpan });
}

/** Buat atau perbarui satu siklus praktik mengajar (nomor 1–2: 1 UTS, 2 UAS). */
async function tanganiSiklus(data: Record<string, unknown>) {
  const nomorSiklus = keAngkaPositif(data.nomor_siklus);

  if (nomorSiklus === null || nomorSiklus > SIKLUS_TOTAL) {
    return balas(false, 400, { error: `nomor_siklus wajib angka 1–${SIKLUS_TOTAL}.` });
  }

  const judulTopik = keTeksWajib(data.judul_topik);
  if (!judulTopik) {
    return balas(false, 400, { error: 'Judul topik wajib diisi.' });
  }

  const status = typeof data.status === 'string' ? data.status.trim() : 'draft';
  if (status !== 'draft' && status !== 'lengkap') {
    return balas(false, 400, { error: 'Status harus "draft" atau "lengkap".' });
  }

  const artefak: ArtefakTerisi = {
    rpp_url: keTeksAtauNull(data.rpp_url),
    materi_url: keTeksAtauNull(data.materi_url),
    media_url: keTeksAtauNull(data.media_url),
    hasil_kerja_siswa_url: keTeksAtauNull(data.hasil_kerja_siswa_url),
    penilaian_gp_url: keTeksAtauNull(data.penilaian_gp_url),
    penilaian_dpl_url: keTeksAtauNull(data.penilaian_dpl_url),
    video_url: keTeksAtauNull(data.video_url),
    instrumen_penilaian_url: keTeksAtauNull(data.instrumen_penilaian_url),
  };

  // Validasi minimal TECH-SPEC bagian 4: status "lengkap" menuntut artefak wajib terisi.
  if (status === 'lengkap') {
    const kosong = labelWajibYangKosong(artefak);
    if (kosong.length > 0) {
      return balas(false, 400, {
        error: `Status "lengkap" belum bisa dipakai — lengkapi dulu: ${kosong.join(', ')}.`,
      });
    }
  }

  const tersimpan = await simpanSiklus({
    nomorSiklus,
    judulTopik,
    rppUrl: artefak.rpp_url,
    materiUrl: artefak.materi_url,
    mediaUrl: artefak.media_url,
    mediaDeskripsi: keTeksAtauNull(data.media_deskripsi),
    hasilKerjaSiswaUrl: artefak.hasil_kerja_siswa_url,
    hasilKerjaSiswaDeskripsi: keTeksAtauNull(data.hasil_kerja_siswa_deskripsi),
    penilaianGpUrl: artefak.penilaian_gp_url,
    penilaianDplUrl: artefak.penilaian_dpl_url,
    videoUrl: artefak.video_url,
    instrumenPenilaianUrl: artefak.instrumen_penilaian_url,
    catatanReflektif: keTeksAtauNull(data.catatan_reflektif),
    status,
    // Siklus 1 adalah UTS; `simpanSiklus` mengabaikan flag ini untuk nomor 1.
    isUasPilihan: keBoolean(data.is_uas_pilihan),
  });

  return balas(true, 200, { data: tersimpan });
}

/** Buat atau perbarui satu kegiatan nonmengajar. */
async function tanganiNonmengajar(data: Record<string, unknown>) {
  const namaKegiatan = keTeksWajib(data.nama_kegiatan);
  if (!namaKegiatan) {
    return balas(false, 400, { error: 'Nama kegiatan wajib diisi.' });
  }

  const idMentah = data.id;
  let id: number | null = null;
  if (idMentah !== undefined && idMentah !== null && idMentah !== '') {
    id = keAngkaPositif(idMentah);
    if (id === null) {
      return balas(false, 400, { error: 'id kegiatan tidak valid.' });
    }
  }

  const tanggal = keTeksAtauNull(data.tanggal);
  if (tanggal && !/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
    return balas(false, 400, { error: 'Tanggal harus format YYYY-MM-DD.' });
  }

  const tersimpan = await simpanKegiatan({
    id,
    namaKegiatan,
    deskripsi: keTeksAtauNull(data.deskripsi),
    tanggal,
    dokumentasiUrl: keTeksAtauNull(data.dokumentasi_url),
  });

  return balas(true, 200, { data: tersimpan });
}

/** Perbarui profil mahasiswa (satu baris, id = 1). */
async function tanganiProfil(data: Record<string, unknown>) {
  const nama = keTeksWajib(data.nama);
  if (!nama) {
    return balas(false, 400, { error: 'Nama wajib diisi.' });
  }

  const tersimpan = await simpanProfil({
    nama,
    programStudi: keTeksAtauNull(data.program_studi),
    lptk: keTeksAtauNull(data.lptk),
    sekolahPpl: keTeksAtauNull(data.sekolah_ppl),
    mapel: keTeksAtauNull(data.mapel),
    kelasFase: keTeksAtauNull(data.kelas_fase),
    kontak: keTeksAtauNull(data.kontak),
    pengantarEportofolio: keTeksAtauNull(data.pengantar_eportofolio),
    tentangSaya: keTeksAtauNull(data.tentang_saya),
    filosofiHidup: keTeksAtauNull(data.filosofi_hidup),
    identitasProfesional: keTeksAtauNull(data.identitas_profesional),
  });

  return balas(true, 200, { data: tersimpan });
}

/** Perbarui modul Refleksi (satu baris, id = 1). Keenam bagian wajib diisi. */
async function tanganiRefleksi(data: Record<string, unknown>) {
  const nilai = {
    modelGuruDituju: keTeksWajib(data.model_guru_dituju),
    filosofiMengajar: keTeksWajib(data.filosofi_mengajar),
    refleksiAkhir: keTeksWajib(data.refleksi_akhir),
    kekuatan: keTeksWajib(data.kekuatan),
    kelemahan: keTeksWajib(data.kelemahan),
    rencanaTindakLanjut: keTeksWajib(data.rencana_tindak_lanjut),
  };

  const bagian: Array<[string, string]> = [
    ['Model guru yang dituju', nilai.modelGuruDituju],
    ['Filosofi mengajar', nilai.filosofiMengajar],
    ['Refleksi akhir', nilai.refleksiAkhir],
    ['Kekuatan', nilai.kekuatan],
    ['Kelemahan', nilai.kelemahan],
    ['Rencana tindak lanjut', nilai.rencanaTindakLanjut],
  ];
  const kosong = bagian.filter(([, isi]) => !isi).map(([label]) => label);
  if (kosong.length > 0) {
    return balas(false, 400, { error: `Lengkapi dulu: ${kosong.join(', ')}.` });
  }

  const tersimpan = await simpanRefleksi(nilai);
  return balas(true, 200, { data: tersimpan });
}

export async function POST(request: Request, context: { params: Promise<{ resource: string }> }) {
  const sesi = await getServerSession(authOptions);
  if (!sesi) {
    return balas(false, 401, { error: 'Harus login sebagai admin.' });
  }

  const { resource, galat } = await cekResource(context.params);
  if (galat) return galat;

  let muatan: unknown;
  try {
    muatan = await request.json();
  } catch {
    return balas(false, 400, { error: 'Body permintaan harus berupa JSON.' });
  }

  const data = (muatan ?? {}) as Record<string, unknown>;

  const penangan: Record<string, (d: Record<string, unknown>) => Promise<NextResponse>> = {
    analisis: tanganiAnalisis,
    'analisis-siklus': tanganiAnalisisSiklus,
    siklus: tanganiSiklus,
    terbimbing: tanganiTerbimbing,
    nonmengajar: tanganiNonmengajar,
    profil: tanganiProfil,
    refleksi: tanganiRefleksi,
  };

  const jawaban = await penangan[resource](data);

  // Hanya segarkan cache kalau penulisan benar-benar berhasil.
  if (jawaban.status === 200) segarkanTampilan();
  return jawaban;
}

/** Hapus satu baris: analisis per kategori, atau kegiatan nonmengajar per id. */
export async function DELETE(request: Request, context: { params: Promise<{ resource: string }> }) {
  const sesi = await getServerSession(authOptions);
  if (!sesi) {
    return balas(false, 401, { error: 'Harus login sebagai admin.' });
  }

  const { resource, galat } = await cekResource(context.params);
  if (galat) return galat;

  const params = new URL(request.url).searchParams;

  if (resource === 'analisis') {
    const definisi = getDefinisiKategori(params.get('kategori') ?? '');

    if (!definisi) {
      return balas(false, 400, {
        error: `Parameter "kategori" wajib diisi dengan salah satu dari: ${DAFTAR_SLUG}.`,
      });
    }

    const dihapus = await hapusAnalisis(definisi.slug);
    segarkanTampilan();
    return balas(true, 200, { dihapus });
  }

  if (resource === 'analisis-siklus') {
    const nomorSiklus = keAngkaPositif(params.get('nomor_siklus'));
    if (nomorSiklus === null || nomorSiklus > SIKLUS_TOTAL) {
      return balas(false, 400, { error: `Parameter "nomor_siklus" wajib angka 1–${SIKLUS_TOTAL}.` });
    }

    const field = params.get('field') ?? '';
    if (!ARTEFAK_SIKLUS.some((artefak) => artefak.field === field)) {
      return balas(false, 400, { error: 'Parameter "field" bukan artefak siklus yang dikenal.' });
    }

    const dihapus = await hapusAnalisisSiklus(nomorSiklus, field);
    segarkanTampilan();
    return balas(true, 200, { dihapus });
  }

  if (resource === 'nonmengajar') {
    const id = keAngkaPositif(params.get('id'));

    if (id === null) {
      return balas(false, 400, { error: 'Parameter "id" kegiatan wajib diisi.' });
    }

    const dihapus = await hapusKegiatan(id);
    segarkanTampilan();
    return balas(true, 200, { dihapus });
  }

  return balas(false, 400, {
    error: `Resource "${resource}" belum mendukung DELETE.`,
  });
}
