import { db } from './db';

/**
 * Helper query untuk data portofolio.
 *
 * Semua SQL mentah dikumpulkan di sini supaya route handler / server component
 * tidak menulis query sendiri-sendiri. Skema kontraknya = TECH-SPEC.md bagian 3.
 */

export type StatusSiklus = 'draft' | 'lengkap';

export interface Profil {
  id: number;
  nama: string | null;
  program_studi: string | null;
  lptk: string | null;
  sekolah_ppl: string | null;
  mapel: string | null;
  kelas_fase: string | null;
  kontak: string | null;
  pengantar_eportofolio: string | null;
  tentang_saya: string | null;
  filosofi_hidup: string | null;
  identitas_profesional: string | null;
}

export interface Siklus {
  id: number;
  nomor_siklus: number;
  judul_topik: string;
  rpp_url: string | null;
  materi_url: string | null;
  media_deskripsi: string | null;
  media_url: string | null;
  hasil_kerja_siswa_url: string | null;
  hasil_kerja_siswa_deskripsi: string | null;
  penilaian_gp_url: string | null;
  penilaian_dpl_url: string | null;
  /**
   * `true` kalau siklus ini ditandai sebagai produk UAS. Admin kini hanya punya
   * dua siklus (1 = UTS, 2 = UAS), jadi satu-satunya kandidatnya adalah siklus 2.
   * Penanda tetap ada dan dipaksa di `simpanSiklus` (TECH-SPEC.md bagian 3),
   * supaya halaman /uas punya syarat tampil yang jelas.
   */
  is_uas_pilihan: boolean;
  video_url: string | null;
  instrumen_penilaian_url: string | null;
  catatan_reflektif: string | null;
  status: StatusSiklus;
  updated_at: string | null;
}

export interface AnalisisTopik3 {
  id: number;
  /** Salah satu slug di lib/kategori.ts. */
  kategori: string;
  konteks: string | null;
  tujuan: string | null;
  kelebihan: string | null;
  kekurangan: string | null;
  kajian_teori: string | null;
  updated_at: string | null;
}

/**
 * Analisis artefak per field siklus (UTS/UAS) — satu baris per (nomor_siklus,
 * field). Terpisah dari `analisis_topik3` karena narasinya memang berbeda per
 * modul (PRD.md bagian 4.4 & 4.5). `field` adalah salah satu kolom artefak di
 * lib/siklus.ts (ARTEFAK_SIKLUS).
 */
export interface AnalisisSiklus {
  id: number;
  nomor_siklus: number;
  field: string;
  konteks: string | null;
  tujuan: string | null;
  kelebihan: string | null;
  kekurangan: string | null;
  kajian_teori: string | null;
  updated_at: string | null;
}

/**
 * Praktik mengajar terbimbing — sesi terbimbing sebelum siklus 1, sumber
 * artefak lima kategori Topik 3. Tabelnya single row (id = 1), sama seperti
 * `profil`, dan sengaja terpisah dari `siklus` (PRD bagian 5).
 */
export interface Terbimbing {
  id: number;
  judul_topik: string | null;
  rpp_url: string | null;
  materi_url: string | null;
  media_deskripsi: string | null;
  media_url: string | null;
  video_url: string | null;
  instrumen_penilaian_url: string | null;
  updated_at: string | null;
}

export interface KegiatanNonmengajar {
  id: number;
  nama_kegiatan: string;
  deskripsi: string | null;
  tanggal: string | null;
  dokumentasi_url: string | null;
}

/** Ringkasan progres tiga fase, dipakai di kartu Beranda (PRD bagian 4.1). */
export interface RingkasanProgres {
  analisisTerisi: number;
  analisisTarget: number;
  utsLengkap: boolean;
  uasLengkap: number;
  uasTarget: number;
}

const JUMLAH_ANALISIS_TOPIK3 = 6;

/**
 * Jumlah siklus yang dikelola admin: 1 untuk UTS dan 2 untuk UAS — hanya dua
 * baris yang ditampilkan (keputusan pemilik portofolio, PRD.md bagian 4.4 & 4.5).
 * Angka ini membatasi rute /admin/siklus dan validasi API, jadi siklus 3 dan 4
 * tidak bisa lagi dibuat. Kolom `is_uas_pilihan` tetap ada di database.
 */
export const SIKLUS_TOTAL = 2;

/** libSQL mengembalikan value bertipe luas; normalkan ke string | null. */
function toText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return typeof value === 'string' ? value : String(value);
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'bigint') return Number(value);
  return Number(value ?? 0);
}

function mapSiklus(row: Record<string, unknown>): Siklus {
  return {
    id: toNumber(row.id),
    nomor_siklus: toNumber(row.nomor_siklus),
    judul_topik: toText(row.judul_topik) ?? '',
    rpp_url: toText(row.rpp_url),
    materi_url: toText(row.materi_url),
    media_deskripsi: toText(row.media_deskripsi),
    media_url: toText(row.media_url),
    hasil_kerja_siswa_url: toText(row.hasil_kerja_siswa_url),
    hasil_kerja_siswa_deskripsi: toText(row.hasil_kerja_siswa_deskripsi),
    penilaian_gp_url: toText(row.penilaian_gp_url),
    penilaian_dpl_url: toText(row.penilaian_dpl_url),
    is_uas_pilihan: toNumber(row.is_uas_pilihan) === 1,
    video_url: toText(row.video_url),
    instrumen_penilaian_url: toText(row.instrumen_penilaian_url),
    catatan_reflektif: toText(row.catatan_reflektif),
    status: toText(row.status) === 'lengkap' ? 'lengkap' : 'draft',
    updated_at: toText(row.updated_at),
  };
}

/** Profil mahasiswa — tabel `profil` sengaja hanya berisi satu baris (id = 1). */
export async function getProfil(): Promise<Profil | null> {
  const result = await db.execute('SELECT * FROM profil WHERE id = 1 LIMIT 1');
  const row = result.rows[0];
  if (!row) return null;

  return {
    id: toNumber(row.id),
    nama: toText(row.nama),
    program_studi: toText(row.program_studi),
    lptk: toText(row.lptk),
    sekolah_ppl: toText(row.sekolah_ppl),
    mapel: toText(row.mapel),
    kelas_fase: toText(row.kelas_fase),
    kontak: toText(row.kontak),
    pengantar_eportofolio: toText(row.pengantar_eportofolio),
    tentang_saya: toText(row.tentang_saya),
    filosofi_hidup: toText(row.filosofi_hidup),
    identitas_profesional: toText(row.identitas_profesional),
  };
}

export interface MasukanProfil {
  nama: string;
  programStudi: string | null;
  lptk: string | null;
  sekolahPpl: string | null;
  mapel: string | null;
  kelasFase: string | null;
  kontak: string | null;
  pengantarEportofolio: string | null;
  tentangSaya: string | null;
  filosofiHidup: string | null;
  identitasProfesional: string | null;
}

/**
 * Simpan profil mahasiswa. Tabel `profil` sengaja hanya berisi satu baris
 * (id = 1), jadi ini selalu upsert ke baris yang sama.
 */
export async function simpanProfil(input: MasukanProfil): Promise<Profil> {
  const kolom = [
    input.nama,
    input.programStudi,
    input.lptk,
    input.sekolahPpl,
    input.mapel,
    input.kelasFase,
    input.kontak,
    input.pengantarEportofolio,
    input.tentangSaya,
    input.filosofiHidup,
    input.identitasProfesional,
  ];

  const hasilUpdate = await db.execute({
    sql: `UPDATE profil
          SET nama = ?, program_studi = ?, lptk = ?, sekolah_ppl = ?, mapel = ?, kelas_fase = ?,
              kontak = ?, pengantar_eportofolio = ?,
              tentang_saya = ?, filosofi_hidup = ?, identitas_profesional = ?
          WHERE id = 1`,
    args: kolom,
  });

  if (hasilUpdate.rowsAffected === 0) {
    await db.execute({
      sql: `INSERT INTO profil (
              id, nama, program_studi, lptk, sekolah_ppl, mapel, kelas_fase,
              kontak, pengantar_eportofolio,
              tentang_saya, filosofi_hidup, identitas_profesional
            )
            VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: kolom,
    });
  }

  const tersimpan = await getProfil();
  if (!tersimpan) throw new Error('Gagal menyimpan profil.');
  return tersimpan;
}

/**
 * Modul Refleksi (PRD.md bagian 4.7) — tabel single row (id = 1), berdiri
 * sendiri (tidak terkait siklus), dinilai sebagai kriteria tersendiri di rubrik LMS.
 */
export interface Refleksi {
  id: number;
  model_guru_dituju: string | null;
  filosofi_mengajar: string | null;
  refleksi_akhir: string | null;
  kekuatan: string | null;
  kelemahan: string | null;
  rencana_tindak_lanjut: string | null;
  updated_at: string | null;
}

function mapRefleksi(row: Record<string, unknown>): Refleksi {
  return {
    id: toNumber(row.id),
    model_guru_dituju: toText(row.model_guru_dituju),
    filosofi_mengajar: toText(row.filosofi_mengajar),
    refleksi_akhir: toText(row.refleksi_akhir),
    kekuatan: toText(row.kekuatan),
    kelemahan: toText(row.kelemahan),
    rencana_tindak_lanjut: toText(row.rencana_tindak_lanjut),
    updated_at: toText(row.updated_at),
  };
}

/** Refleksi — tabel `refleksi` sengaja hanya berisi satu baris (id = 1). */
export async function getRefleksi(): Promise<Refleksi | null> {
  const result = await db.execute('SELECT * FROM refleksi WHERE id = 1 LIMIT 1');
  const row = result.rows[0];
  return row ? mapRefleksi(row) : null;
}

export interface MasukanRefleksi {
  modelGuruDituju: string | null;
  filosofiMengajar: string | null;
  refleksiAkhir: string | null;
  kekuatan: string | null;
  kelemahan: string | null;
  rencanaTindakLanjut: string | null;
}

/**
 * Simpan modul refleksi. Tabel `refleksi` sengaja hanya berisi satu baris
 * (id = 1), jadi ini selalu upsert ke baris yang sama.
 */
export async function simpanRefleksi(input: MasukanRefleksi): Promise<Refleksi> {
  const kolom = [
    input.modelGuruDituju,
    input.filosofiMengajar,
    input.refleksiAkhir,
    input.kekuatan,
    input.kelemahan,
    input.rencanaTindakLanjut,
  ];

  const hasilUpdate = await db.execute({
    sql: `UPDATE refleksi
          SET model_guru_dituju = ?, filosofi_mengajar = ?, refleksi_akhir = ?,
              kekuatan = ?, kelemahan = ?, rencana_tindak_lanjut = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = 1`,
    args: kolom,
  });

  if (hasilUpdate.rowsAffected === 0) {
    await db.execute({
      sql: `INSERT INTO refleksi (
              id, model_guru_dituju, filosofi_mengajar, refleksi_akhir,
              kekuatan, kelemahan, rencana_tindak_lanjut, updated_at
            )
            VALUES (1, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      args: kolom,
    });
  }

  const tersimpan = await getRefleksi();
  if (!tersimpan) throw new Error('Gagal menyimpan refleksi.');
  return tersimpan;
}

export async function getSiklusByNomor(nomor: number): Promise<Siklus | null> {
  const result = await db.execute({
    sql: 'SELECT * FROM siklus WHERE nomor_siklus = ? LIMIT 1',
    args: [nomor],
  });
  const row = result.rows[0];
  return row ? mapSiklus(row) : null;
}

export async function getSiklusList(): Promise<Siklus[]> {
  const result = await db.execute('SELECT * FROM siklus ORDER BY nomor_siklus ASC');
  return result.rows.map(mapSiklus);
}

/**
 * Satu-satunya siklus yang ditandai sebagai produk UAS (is_uas_pilihan = 1) —
 * halaman /uas hanya menampilkan baris ini, bukan tiga siklus sekaligus
 * (PRD.md bagian 4.5 & 5). Mengembalikan null kalau belum ada yang dipilih.
 */
export async function getSiklusUasPilihan(): Promise<Siklus | null> {
  const result = await db.execute(
    'SELECT * FROM siklus WHERE is_uas_pilihan = 1 ORDER BY nomor_siklus ASC LIMIT 1',
  );
  const row = result.rows[0];
  return row ? mapSiklus(row) : null;
}

function mapAnalisisSiklus(row: Record<string, unknown>): AnalisisSiklus {
  return {
    id: toNumber(row.id),
    nomor_siklus: toNumber(row.nomor_siklus),
    field: toText(row.field) ?? '',
    konteks: toText(row.konteks),
    tujuan: toText(row.tujuan),
    kelebihan: toText(row.kelebihan),
    kekurangan: toText(row.kekurangan),
    kajian_teori: toText(row.kajian_teori),
    updated_at: toText(row.updated_at),
  };
}

function mapAnalisis(row: Record<string, unknown>): AnalisisTopik3 {
  return {
    id: toNumber(row.id),
    kategori: toText(row.kategori) ?? '',
    konteks: toText(row.konteks),
    tujuan: toText(row.tujuan),
    kelebihan: toText(row.kelebihan),
    kekurangan: toText(row.kekurangan),
    kajian_teori: toText(row.kajian_teori),
    updated_at: toText(row.updated_at),
  };
}

function mapTerbimbing(row: Record<string, unknown>): Terbimbing {
  return {
    id: toNumber(row.id),
    judul_topik: toText(row.judul_topik),
    rpp_url: toText(row.rpp_url),
    materi_url: toText(row.materi_url),
    media_deskripsi: toText(row.media_deskripsi),
    media_url: toText(row.media_url),
    video_url: toText(row.video_url),
    instrumen_penilaian_url: toText(row.instrumen_penilaian_url),
    updated_at: toText(row.updated_at),
  };
}

function mapKegiatan(row: Record<string, unknown>): KegiatanNonmengajar {
  return {
    id: toNumber(row.id),
    nama_kegiatan: toText(row.nama_kegiatan) ?? '',
    deskripsi: toText(row.deskripsi),
    tanggal: toText(row.tanggal),
    dokumentasi_url: toText(row.dokumentasi_url),
  };
}

export interface MasukanSiklus {
  nomorSiklus: number;
  judulTopik: string;
  rppUrl: string | null;
  materiUrl: string | null;
  mediaDeskripsi: string | null;
  mediaUrl: string | null;
  hasilKerjaSiswaUrl: string | null;
  hasilKerjaSiswaDeskripsi: string | null;
  penilaianGpUrl: string | null;
  penilaianDplUrl: string | null;
  videoUrl: string | null;
  instrumenPenilaianUrl: string | null;
  catatanReflektif: string | null;
  status: StatusSiklus;
  /** Ingin menandai siklus ini sebagai produk UAS (hanya berlaku untuk siklus 2). */
  isUasPilihan: boolean;
}

/**
 * Simpan satu siklus berdasarkan nomor_siklus (yang unik di skema) — dipakai
 * form admin /admin/siklus/[nomor]. Kalau barisnya belum ada, dibuat baru;
 * ini juga jalan pintas untuk membuat baris siklus 2 kalau belum ada.
 *
 * Kalau siklus ini ditandai sebagai produk UAS, penanda di siklus lain
 * otomatis dimatikan supaya hanya ada satu produk UAS (PRD.md bagian 5).
 */
export async function simpanSiklus(input: MasukanSiklus): Promise<Siklus> {
  const lama = await getSiklusByNomor(input.nomorSiklus);

  // Siklus 1 adalah tagihan UTS — tidak pernah bisa jadi produk UAS.
  const isUas = input.nomorSiklus >= 2 && input.isUasPilihan ? 1 : 0;

  const kolom = [
    input.judulTopik,
    input.rppUrl,
    input.materiUrl,
    input.mediaDeskripsi,
    input.mediaUrl,
    input.hasilKerjaSiswaUrl,
    input.hasilKerjaSiswaDeskripsi,
    input.penilaianGpUrl,
    input.penilaianDplUrl,
    input.videoUrl,
    input.instrumenPenilaianUrl,
    input.catatanReflektif,
    input.status,
    isUas,
  ];

  if (lama) {
    await db.execute({
      sql: `UPDATE siklus
            SET judul_topik = ?, rpp_url = ?, materi_url = ?, media_deskripsi = ?,
                media_url = ?, hasil_kerja_siswa_url = ?, hasil_kerja_siswa_deskripsi = ?,
                penilaian_gp_url = ?, penilaian_dpl_url = ?,
                video_url = ?, instrumen_penilaian_url = ?,
                catatan_reflektif = ?, status = ?, is_uas_pilihan = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
      args: [...kolom, lama.id],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO siklus (
              judul_topik, rpp_url, materi_url, media_deskripsi, media_url,
              hasil_kerja_siswa_url, hasil_kerja_siswa_deskripsi, penilaian_gp_url, penilaian_dpl_url,
              video_url, instrumen_penilaian_url, catatan_reflektif, status, is_uas_pilihan,
              nomor_siklus, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      args: [...kolom, input.nomorSiklus],
    });
  }

  // Aturan "maksimum satu produk UAS": menyalakan siklus ini otomatis
  // mematikan penanda di siklus lainnya.
  if (isUas === 1) {
    await db.execute({
      sql: `UPDATE siklus
            SET is_uas_pilihan = 0
            WHERE nomor_siklus >= 2 AND nomor_siklus <> ?`,
      args: [input.nomorSiklus],
    });
  }

  const tersimpan = await getSiklusByNomor(input.nomorSiklus);
  if (!tersimpan) throw new Error(`Gagal menyimpan siklus ${input.nomorSiklus}.`);
  return tersimpan;
}

/**
 * Analisis Topik 3. Skemanya sengaja tanpa UNIQUE(kategori) (TECH-SPEC bagian 3),
 * jadi baris pertama per kategori yang dianggap berlaku — lihat `simpanAnalisis`.
 */
export async function getAnalisisList(): Promise<AnalisisTopik3[]> {
  const result = await db.execute('SELECT * FROM analisis_topik3 ORDER BY id ASC');
  return result.rows.map(mapAnalisis);
}

export async function getAnalisisByKategori(kategori: string): Promise<AnalisisTopik3 | null> {
  const result = await db.execute({
    sql: 'SELECT * FROM analisis_topik3 WHERE kategori = ? ORDER BY id ASC LIMIT 1',
    args: [kategori],
  });
  const row = result.rows[0];
  return row ? mapAnalisis(row) : null;
}

/** Semua analisis artefak siklus — dipakai dashboard admin untuk menghitung progres. */
export async function getAnalisisSiklusList(): Promise<AnalisisSiklus[]> {
  const result = await db.execute('SELECT * FROM analisis_siklus ORDER BY nomor_siklus ASC, id ASC');
  return result.rows.map(mapAnalisisSiklus);
}

/** Analisis seluruh field artefak satu siklus (UTS/UAS). */
export async function getAnalisisSiklusByNomor(nomor: number): Promise<AnalisisSiklus[]> {
  const result = await db.execute({
    sql: 'SELECT * FROM analisis_siklus WHERE nomor_siklus = ? ORDER BY id ASC',
    args: [nomor],
  });
  return result.rows.map(mapAnalisisSiklus);
}

/** Analisis satu field artefak pada satu siklus (null kalau belum diisi). */
export async function getAnalisisSiklusByField(
  nomor: number,
  field: string,
): Promise<AnalisisSiklus | null> {
  const result = await db.execute({
    sql: 'SELECT * FROM analisis_siklus WHERE nomor_siklus = ? AND field = ? ORDER BY id ASC LIMIT 1',
    args: [nomor, field],
  });
  const row = result.rows[0];
  return row ? mapAnalisisSiklus(row) : null;
}

/** Kegiatan nonmengajar — sumber artefak untuk kategori 'nonmengajar'. */
export async function getKegiatanNonmengajarList(): Promise<KegiatanNonmengajar[]> {
  const result = await db.execute(
    'SELECT * FROM kegiatan_nonmengajar ORDER BY (tanggal IS NULL), tanggal ASC, id ASC',
  );
  return result.rows.map(mapKegiatan);
}

export async function getKegiatanById(id: number): Promise<KegiatanNonmengajar | null> {
  const result = await db.execute({
    sql: 'SELECT * FROM kegiatan_nonmengajar WHERE id = ? LIMIT 1',
    args: [id],
  });
  const row = result.rows[0];
  return row ? mapKegiatan(row) : null;
}

export interface MasukanKegiatan {
  /** Kosong = buat baris baru; ada isinya = perbarui baris itu. */
  id?: number | null;
  namaKegiatan: string;
  deskripsi: string | null;
  tanggal: string | null;
  dokumentasiUrl: string | null;
}

/** Buat/perbarui satu kegiatan nonmengajar (tabel bebas, tidak terikat siklus). */
export async function simpanKegiatan(input: MasukanKegiatan): Promise<KegiatanNonmengajar> {
  const kolom = [input.namaKegiatan, input.deskripsi, input.tanggal, input.dokumentasiUrl];

  if (input.id) {
    await db.execute({
      sql: `UPDATE kegiatan_nonmengajar
            SET nama_kegiatan = ?, deskripsi = ?, tanggal = ?, dokumentasi_url = ?
            WHERE id = ?`,
      args: [...kolom, input.id],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO kegiatan_nonmengajar (nama_kegiatan, deskripsi, tanggal, dokumentasi_url)
            VALUES (?, ?, ?, ?)`,
      args: kolom,
    });
  }

  const hasil = await db.execute(
    input.id
      ? { sql: 'SELECT * FROM kegiatan_nonmengajar WHERE id = ? LIMIT 1', args: [input.id] }
      : 'SELECT * FROM kegiatan_nonmengajar ORDER BY id DESC LIMIT 1',
  );
  const row = hasil.rows[0];
  if (!row) throw new Error('Gagal menyimpan kegiatan nonmengajar.');
  return mapKegiatan(row);
}

/** Hapus satu kegiatan nonmengajar; mengembalikan jumlah baris yang terhapus. */
export async function hapusKegiatan(id: number): Promise<number> {
  const result = await db.execute({
    sql: 'DELETE FROM kegiatan_nonmengajar WHERE id = ?',
    args: [id],
  });
  return result.rowsAffected;
}

/**
 * Simpan (buat baru atau perbarui) satu kategori analisis Topik 3.
 * Karena `kategori` adalah slot tetap, baris yang sudah ada di-update — bukan
 * menambah baris kedua untuk kategori yang sama. Artefaknya dibaca dari tabel
 * `terbimbing`, jadi tidak ada lagi relasi per kategori di sini.
 */
export interface MasukanAnalisis {
  kategori: string;
  konteks: string;
  tujuan: string;
  kelebihan: string;
  kekurangan: string;
  kajianTeori: string;
}

export async function simpanAnalisis(input: MasukanAnalisis): Promise<AnalisisTopik3> {
  const lama = await getAnalisisByKategori(input.kategori);
  const kolom = [input.konteks, input.tujuan, input.kelebihan, input.kekurangan, input.kajianTeori];

  if (lama) {
    await db.execute({
      sql: `UPDATE analisis_topik3
            SET konteks = ?, tujuan = ?, kelebihan = ?, kekurangan = ?, kajian_teori = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
      args: [...kolom, lama.id],
    });
  } else {
    // Kolom lama `narasi_analisis` masih NOT NULL di DB (dihapus di migrasi
    // terpisah). Diisi '' supaya INSERT tetap lolos selama masa transisi.
    await db.execute({
      sql: `INSERT INTO analisis_topik3 (
              kategori, narasi_analisis, konteks, tujuan, kelebihan, kekurangan, kajian_teori, updated_at
            )
            VALUES (?, '', ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      args: [input.kategori, ...kolom],
    });
  }

  const tersimpan = await getAnalisisByKategori(input.kategori);
  if (!tersimpan) throw new Error(`Gagal menyimpan analisis kategori "${input.kategori}".`);
  return tersimpan;
}

/** Praktik mengajar terbimbing — tabel single row (id = 1). */
export async function getTerbimbing(): Promise<Terbimbing | null> {
  const result = await db.execute('SELECT * FROM terbimbing WHERE id = 1 LIMIT 1');
  const row = result.rows[0];
  return row ? mapTerbimbing(row) : null;
}

export interface MasukanTerbimbing {
  judulTopik: string | null;
  rppUrl: string | null;
  materiUrl: string | null;
  mediaDeskripsi: string | null;
  mediaUrl: string | null;
  videoUrl: string | null;
  instrumenPenilaianUrl: string | null;
}

/**
 * Simpan artefak praktik mengajar terbimbing. Tabel `terbimbing` sengaja hanya
 * berisi satu baris (id = 1), jadi ini selalu upsert ke baris yang sama.
 */
export async function simpanTerbimbing(input: MasukanTerbimbing): Promise<Terbimbing> {
  const kolom = [
    input.judulTopik,
    input.rppUrl,
    input.materiUrl,
    input.mediaDeskripsi,
    input.mediaUrl,
    input.videoUrl,
    input.instrumenPenilaianUrl,
  ];

  const hasilUpdate = await db.execute({
    sql: `UPDATE terbimbing
          SET judul_topik = ?, rpp_url = ?, materi_url = ?, media_deskripsi = ?,
              media_url = ?, video_url = ?, instrumen_penilaian_url = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = 1`,
    args: kolom,
  });

  if (hasilUpdate.rowsAffected === 0) {
    await db.execute({
      sql: `INSERT INTO terbimbing (
              id, judul_topik, rpp_url, materi_url, media_deskripsi, media_url,
              video_url, instrumen_penilaian_url, updated_at
            )
            VALUES (1, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      args: kolom,
    });
  }

  const tersimpan = await getTerbimbing();
  if (!tersimpan) throw new Error('Gagal menyimpan praktik mengajar terbimbing.');
  return tersimpan;
}

/** Hapus analisis satu kategori; mengembalikan jumlah baris yang terhapus. */
export async function hapusAnalisis(kategori: string): Promise<number> {
  const result = await db.execute({
    sql: 'DELETE FROM analisis_topik3 WHERE kategori = ?',
    args: [kategori],
  });
  return result.rowsAffected;
}

/** Nilai form analisis satu artefak siklus (5 komponen). */
export interface MasukanAnalisisSiklus {
  nomorSiklus: number;
  field: string;
  konteks: string;
  tujuan: string;
  kelebihan: string;
  kekurangan: string;
  kajianTeori: string;
}

/**
 * Simpan (buat/perbarui) analisis satu artefak pada satu siklus. Karena tabelnya
 * UNIQUE(nomor_siklus, field), baris yang sudah ada di-update — bukan menambah
 * baris kedua untuk artefak yang sama. Dipakai form admin /admin/siklus/[nomor]/analisis.
 */
export async function simpanAnalisisSiklus(input: MasukanAnalisisSiklus): Promise<AnalisisSiklus> {
  const lama = await getAnalisisSiklusByField(input.nomorSiklus, input.field);
  const kolom = [input.konteks, input.tujuan, input.kelebihan, input.kekurangan, input.kajianTeori];

  if (lama) {
    await db.execute({
      sql: `UPDATE analisis_siklus
            SET konteks = ?, tujuan = ?, kelebihan = ?, kekurangan = ?, kajian_teori = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
      args: [...kolom, lama.id],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO analisis_siklus (
              nomor_siklus, field, konteks, tujuan, kelebihan, kekurangan, kajian_teori, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      args: [input.nomorSiklus, input.field, ...kolom],
    });
  }

  const tersimpan = await getAnalisisSiklusByField(input.nomorSiklus, input.field);
  if (!tersimpan) throw new Error(`Gagal menyimpan analisis artefak "${input.field}" siklus ${input.nomorSiklus}.`);
  return tersimpan;
}

/** Hapus analisis satu artefak siklus; mengembalikan jumlah baris yang terhapus. */
export async function hapusAnalisisSiklus(nomor: number, field: string): Promise<number> {
  const result = await db.execute({
    sql: 'DELETE FROM analisis_siklus WHERE nomor_siklus = ? AND field = ?',
    args: [nomor, field],
  });
  return result.rowsAffected;
}

export async function getRingkasanProgres(): Promise<RingkasanProgres> {
  const [analisis, uts, uas] = await Promise.all([
    db.execute('SELECT COUNT(*) AS jumlah FROM analisis_topik3'),
    db.execute("SELECT COUNT(*) AS jumlah FROM siklus WHERE nomor_siklus = 1 AND status = 'lengkap'"),
    // UAS = SATU produk terbaik yang ditandai (is_uas_pilihan = 1), bukan tiga siklus.
    db.execute("SELECT COUNT(*) AS jumlah FROM siklus WHERE is_uas_pilihan = 1 AND status = 'lengkap'"),
  ]);

  return {
    analisisTerisi: toNumber(analisis.rows[0]?.jumlah),
    analisisTarget: JUMLAH_ANALISIS_TOPIK3,
    utsLengkap: toNumber(uts.rows[0]?.jumlah) > 0,
    uasLengkap: toNumber(uas.rows[0]?.jumlah),
    uasTarget: 1,
  };
}
