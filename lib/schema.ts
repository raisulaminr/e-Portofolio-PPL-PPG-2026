/**
 * Sumber tunggal DDL untuk e-Portofolio PPL.
 *
 * Kolom & tipe HARUS sama persis dengan TECH-SPEC.md bagian 3.
 * Jangan tambah tabel/kolom di luar skema itu tanpa memperbarui dokumennya.
 *
 * Dipakai oleh `ensureSchema()` di lib/db.ts, yang hanya dipanggil sekali
 * saat setup (lihat scripts/init-db.ts) — bukan di setiap request.
 *
 * Catatan Fase 6: kolom baru di bawah hanya berlaku untuk database yang
 * dibuat ulang. Database yang sudah ada dimigrasikan lewat
 * scripts/migrasi-fase6.ts (ALTER TABLE), bukan lewat file ini.
 */
export const SCHEMA_SQL: readonly string[] = [
  // Satu siklus praktik mengajar mandiri (1 = UTS, 2 = UAS; SIKLUS_TOTAL = 2)
  `CREATE TABLE IF NOT EXISTS siklus (
    id INTEGER PRIMARY KEY,
    nomor_siklus INTEGER UNIQUE NOT NULL,
    judul_topik TEXT NOT NULL,
    rpp_url TEXT,
    materi_url TEXT,
    media_deskripsi TEXT,
    media_url TEXT,
    hasil_kerja_siswa_url TEXT,
    hasil_kerja_siswa_deskripsi TEXT,
    penilaian_gp_url TEXT,
    penilaian_dpl_url TEXT,
    is_uas_pilihan INTEGER DEFAULT 0,
    video_url TEXT,
    instrumen_penilaian_url TEXT,
    catatan_reflektif TEXT,
    status TEXT DEFAULT 'draft',
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,

  // Praktik mengajar terbimbing: sesi terbimbing sebelum siklus 1.
  // Sumber artefak lima kategori Topik 3 (bukan tabel `siklus`), single row.
  `CREATE TABLE IF NOT EXISTS terbimbing (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    judul_topik TEXT,
    rpp_url TEXT,
    materi_url TEXT,
    media_deskripsi TEXT,
    media_url TEXT,
    video_url TEXT,
    instrumen_penilaian_url TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,

  // 6 kategori analisis Topik 3 — artefaknya dari tabel `terbimbing`.
  // Fase 6: narasi_analisis (1 field) tetap ada sementara; 5 kolom terstruktur
  // (konteks..kajian_teori) ditambahkan sebagai nullable dan diisi manual
  // sebelum narasi_analisis dihapus (TECH-SPEC.md bagian 3, catatan migrasi).
  `CREATE TABLE IF NOT EXISTS analisis_topik3 (
    id INTEGER PRIMARY KEY,
    kategori TEXT NOT NULL,
    narasi_analisis TEXT NOT NULL,
    konteks TEXT,
    tujuan TEXT,
    kelebihan TEXT,
    kekurangan TEXT,
    kajian_teori TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,

  // Analisis artefak per field siklus (UTS/UAS) — satu baris = satu field
  // (rpp_url, materi_url, …). Terpisah dari `analisis_topik3` karena isinya
  // memang berbeda: analisis RPP di siklus UTS/UAS bukan analisis RPP Topik 3.
  // UNIQUE(nomor_siklus, field) menjamin satu analisis per artefak per siklus.
  `CREATE TABLE IF NOT EXISTS analisis_siklus (
    id INTEGER PRIMARY KEY,
    nomor_siklus INTEGER NOT NULL,
    field TEXT NOT NULL,
    konteks TEXT,
    tujuan TEXT,
    kelebihan TEXT,
    kekurangan TEXT,
    kajian_teori TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(nomor_siklus, field)
  )`,

  // Kegiatan nonmengajar (tidak terikat ke siklus manapun)
  `CREATE TABLE IF NOT EXISTS kegiatan_nonmengajar (
    id INTEGER PRIMARY KEY,
    nama_kegiatan TEXT NOT NULL,
    deskripsi TEXT,
    tanggal TEXT,
    dokumentasi_url TEXT
  )`,

  // Profil mahasiswa (single row / key-value, tidak butuh banyak baris)
  `CREATE TABLE IF NOT EXISTS profil (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    nama TEXT,
    program_studi TEXT,
    lptk TEXT,
    sekolah_ppl TEXT,
    mapel TEXT,
    kelas_fase TEXT,
    kontak TEXT,
    pengantar_eportofolio TEXT,
    tentang_saya TEXT,
    filosofi_hidup TEXT,
    identitas_profesional TEXT
  )`,

  // Fase 6: modul Refleksi — kriteria "Refleksi" di rubrik LMS, berdiri
  // sendiri (tidak terkait siklus). Single row seperti `profil`.
  `CREATE TABLE IF NOT EXISTS refleksi (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    model_guru_dituju TEXT,
    filosofi_mengajar TEXT,
    refleksi_akhir TEXT,
    kekuatan TEXT,
    kelemahan TEXT,
    rencana_tindak_lanjut TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,
];
