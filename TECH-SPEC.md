# Tech Spec — E-Portofolio PPL

Dokumen ini menerjemahkan PRD.md menjadi keputusan teknis konkret, supaya AI coding agent tidak perlu menebak stack atau struktur data.

## 1. Stack (sudah berjalan, jangan diganti tanpa alasan kuat)

- **Framework:** Next.js 15 (App Router)
- **Bahasa:** TypeScript
- **Styling:** Tailwind CSS
- **Animasi:** Framer Motion
- **Auth:** NextAuth (dipakai untuk login admin panel saja, bukan untuk pengunjung publik)
- **Database:** SQLite via `@libsql/client`
- ⚠️ **Prisma sudah pernah dicoba dan ditinggalkan** karena masalah unduhan binary di environment ini. Jangan sarankan pindah ke Prisma lagi — gunakan query langsung via `@libsql/client` atau query builder ringan (mis. Kysely) yang tidak butuh binary generation.

## 2. Peta Halaman (Route Map)

```
/                          → Beranda
/profil                    → Profil Mahasiswa
/topik-3                   → Landing modul Topik 3 (ringkasan 6 analisis)
/topik-3/[kategori]        → Detail 1 kategori analisis (slug: perencanaan, materi, media, video, nonmengajar, instrumen)
/uts                       → Modul UTS — menu 7 artefak siklus 1 (satu kartu per artefak)
/uts/[artefak]             → Detail 1 artefak siklus 1 + analisis 5 komponennya (slug: rancangan-pembelajaran, materi-pembelajaran, media-pembelajaran, hasil-kerja-siswa, video-praktik-mengajar, instrumen-penilaian, penilaian-guru-pamong)
/uas                       → Modul UAS — menu 7 artefak dari SATU siklus (2/3/4) yang ditandai is_uas_pilihan = 1, bukan daftar ketiganya
/uas/[artefak]             → Detail 1 artefak dari siklus produk UAS + analisis 5 komponennya (slug sama dengan /uts/[artefak])
/refleksi                  → Modul Refleksi (model guru, filosofi mengajar, refleksi akhir) — BARU, kriteria LMS §10
/admin                     → Dashboard admin (login required)
/admin/siklus/[id]         → Form edit satu siklus (termasuk artefak bukti: contoh hasil kerja siswa, penilaian GP)
/admin/siklus/[id]/analisis→ Form analisis artefak per field satu siklus (UTS/UAS, 5 komponen) — BARU
/admin/analisis/[id]       → Form edit satu kategori analisis Topik 3 (5 field analisis)
/admin/profil              → Form edit profil mahasiswa (termasuk kontak)
/admin/refleksi            → Form edit modul Refleksi — BARU
```

Catatan: `/uts` dan `/uas` tidak punya entitas sendiri — keduanya menampilkan ulang satu baris `siklus` (UTS: nomor 1; UAS: baris yang ditandai `is_uas_pilihan = 1`). Sejak revisi terakhir, semua artefak **tidak lagi ditumpuk di satu halaman**: halaman indeks hanya berisi kartu menu, sedangkan isi artefak + analisis 5 komponennya ada di `/uts/[artefak]` atau `/uas/[artefak]` — pola yang sama dengan `/topik-3/[kategori]`. Tujuh artefaknya didefinisikan sekali di `lib/siklus.ts` (`ARTEFAK_SIKLUS`, lengkap dengan `slug` untuk URL), jadi menambah/menghapus artefak cukup di sana. Penilaian DPL tidak lagi termasuk artefak yang ditampilkan.

## 3. Skema Data (SQLite)

```sql
-- Satu siklus praktik mengajar mandiri (1 = UTS, 2 = UAS; hanya dua siklus yang dikelola)
CREATE TABLE siklus (
  id INTEGER PRIMARY KEY,
  nomor_siklus INTEGER UNIQUE NOT NULL,      -- 1 (UTS), 2 (UAS) — hanya dua siklus yang dikelola
  judul_topik TEXT NOT NULL,                  -- topik pembelajaran yang diajarkan
  rpp_url TEXT,                                -- link/file RPP lengkap
  materi_url TEXT,
  media_deskripsi TEXT,
  media_url TEXT,                              -- gambar/slide/link alat media
  hasil_kerja_siswa_url TEXT,                   -- BARU: contoh hasil kerja siswa (kriteria "Artefak") — tautan ATAU jalur folder foto di public/ (mis. /dokumentasi/hasil-kerja/siklus-1) yang tampil sebagai carousel
  hasil_kerja_siswa_deskripsi TEXT,             -- BARU: konteks singkat hasil kerja yang ditampilkan
  penilaian_gp_url TEXT,                        -- BARU: penilaian dari Guru Pamong
  penilaian_dpl_url TEXT,                       -- BARU: penilaian dari Dosen Pembimbing Lapangan (kolom tetap ada di DB, tapi artefaknya tidak lagi ditampilkan/diisi — sudah dihapus dari ARTEFAK_SIKLUS)
  is_uas_pilihan INTEGER DEFAULT 0,             -- BARU: 1 = siklus ini (kini hanya siklus 2) yang jadi produk UAS. Maks 1 baris bernilai 1 di antara nomor_siklus >= 2 — dicek di level aplikasi
  video_url TEXT,                              -- embed YouTube/Drive
  instrumen_penilaian_url TEXT,
  catatan_reflektif TEXT,                      -- refleksi guru untuk siklus ini
  status TEXT DEFAULT 'draft',                 -- draft | lengkap
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 6 kategori analisis Topik 3, masing-masing merujuk ke 1 siklus
-- DIREVISI: narasi_analisis (1 field) dipecah jadi 5 field terstruktur sesuai kriteria "Analisis Artefak"
CREATE TABLE analisis_topik3 (
  id INTEGER PRIMARY KEY,
  kategori TEXT NOT NULL,          -- 'perencanaan' | 'materi' | 'media' | 'video' | 'nonmengajar' | 'instrumen'
  siklus_id INTEGER,               -- FK ke siklus, nullable khusus 'nonmengajar'
  konteks TEXT NOT NULL,           -- BARU: situasi/latar saat artefak dibuat/dipakai
  tujuan TEXT NOT NULL,            -- BARU: untuk apa artefak ini dirancang
  kelebihan TEXT NOT NULL,         -- BARU: apa yang efektif/berhasil
  kekurangan TEXT NOT NULL,        -- BARU: apa yang masih kurang
  kajian_teori TEXT NOT NULL,      -- BARU: kaitan dengan teori mata kuliah PPG
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (siklus_id) REFERENCES siklus(id)
);

-- BARU: analisis artefak per field siklus (UTS/UAS). Satu baris = satu field artefak
-- (rpp_url, materi_url, media_url, hasil_kerja_siswa_url, video_url, instrumen_penilaian_url,
-- penilaian_gp_url). Terpisah dari analisis_topik3 karena narasinya memang
-- berbeda per modul: analisis RPP di siklus UTS/UAS bukan analisis RPP di Topik 3 (PRD.md §4.4 & §4.5).
CREATE TABLE analisis_siklus (
  id INTEGER PRIMARY KEY,
  nomor_siklus INTEGER NOT NULL,   -- 1 (UTS) atau 2 (UAS)
  field TEXT NOT NULL,             -- kolom artefak di ARTEFAK_SIKLUS (lib/siklus.ts)
  konteks TEXT,
  tujuan TEXT,
  kelebihan TEXT,
  kekurangan TEXT,
  kajian_teori TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(nomor_siklus, field)      -- satu analisis per artefak per siklus
);

-- Kegiatan nonmengajar (tidak terikat ke siklus manapun)
CREATE TABLE kegiatan_nonmengajar (
  id INTEGER PRIMARY KEY,
  nama_kegiatan TEXT NOT NULL,
  deskripsi TEXT,
  tanggal TEXT,
  dokumentasi_url TEXT
);

-- Profil mahasiswa (single row / key-value, tidak butuh banyak baris)
CREATE TABLE profil (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  nama TEXT,
  program_studi TEXT,        -- Program Studi PPG, mis. "Pendidikan Informatika"
  lptk TEXT,                  -- mis. "Universitas Islam Makassar"
  sekolah_ppl TEXT,
  mapel TEXT,
  kelas_fase TEXT,
  kontak TEXT,                 -- BARU: email dan/atau kontak publik lain, dipakai di Profil + Beranda
  pengantar_eportofolio TEXT,  -- BARU: paragraf pengantar untuk Beranda (kriteria "Beranda")
  tentang_saya TEXT,           -- narasi "Tentang Saya"
  filosofi_hidup TEXT,         -- versi ringkas filosofi hidup/mengajar (versi mendalam ada di tabel refleksi)
  identitas_profesional TEXT
);

-- BARU: modul Refleksi — kriteria "Refleksi" di rubrik LMS, berdiri sendiri (tidak terkait siklus)
CREATE TABLE refleksi (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  model_guru_dituju TEXT,       -- gambaran sosok guru yang ingin dicapai + alasannya
  filosofi_mengajar TEXT,       -- versi mendalam (profil.filosofi_hidup adalah versi ringkasnya)
  refleksi_akhir TEXT,          -- narasi refleksi menyeluruh atas PPL Mandiri
  kekuatan TEXT,
  kelemahan TEXT,
  rencana_tindak_lanjut TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**Kenapa modelnya begini:** UTS hanya butuh `siklus` nomor 1 dengan status lengkap (otomatis, karena memang cuma 1 baris yang mungkin). UAS **tidak** menampilkan beberapa siklus sekaligus — dia cuma menarik SATU baris `siklus` yang `is_uas_pilihan = 1`, dan sejak revisi keputusan pemilik **admin hanya mengelola dua siklus: nomor 1 (UTS) dan nomor 2 (UAS)** — siklus 3 dan 4 tidak dimasukkan, jadi `SIKLUS_TOTAL` di `lib/queries.ts` kini bernilai 2 dan rute `/admin/siklus/3` dst. mengembalikan 404. Kolom `is_uas_pilihan` tetap dipertahankan sebagai syarat tampil halaman `/uas`, bukan lagi pilihan di antara beberapa kandidat. Topik 3 tidak duplikasi data siklus — dia cuma menambahkan lapisan analisis (`analisis_topik3`) yang menunjuk ke siklus yang sudah ada. UTS dan UAS juga punya lapisan analisis per artefak di `analisis_siklus`, tapi sengaja tabel terpisah dari `analisis_topik3` karena narasinya memang berbeda antar modul meski artefaknya sejenis. `refleksi` sengaja dipisah dari `profil` meski sama-sama single-row, karena rubrik LMS menilainya sebagai kriteria terpisah — memisahkan tabel membuat form admin & halaman publiknya juga alami terpisah, sesuai cara rubrik menilai.

> **Catatan migrasi (bukan bangun dari nol):** karena `siklus` dan `analisis_topik3` sudah ada datanya dari Fase 1, perubahan ini adalah **ALTER TABLE** (tambah kolom baru di `siklus`, termasuk `is_uas_pilihan`, dan di `profil`; untuk `analisis_topik3`, kolom `narasi_analisis` lama sebaiknya di-backup dulu, lalu isinya dipindah manual ke salah satu dari 5 kolom baru — jangan langsung `DROP COLUMN` sebelum datanya aman). Jangan biarkan agent men-drop lalu re-create tabel dari nol — itu akan menghapus data siklus 1 yang sudah diisi di Fase 1. Tabel tambahan `analisis_siklus` dibuat lewat `npm run db:migrasi-analisis-siklus` (`CREATE TABLE IF NOT EXISTS`, tanpa menyentuh data lama).

## 4. Ketentuan Admin Panel

- Login hanya untuk 1 user (Raisul) — NextAuth credentials provider sudah cukup, tidak perlu multi-role.
- Form per entitas (siklus, analisis, profil, kegiatan nonmengajar) dengan validasi minimal (required fields sebelum status bisa diubah ke "lengkap").
- Upload file: simpan sebagai link eksternal (Google Drive/YouTube) dulu untuk MVP — hindari implementasi file storage sendiri di awal supaya tidak memperlambat progres.
- Pengecualian untuk FOTO: dokumentasi kegiatan nonmengajar dan contoh hasil kerja siswa UTS/UAS adalah berkas statis di `public/dokumentasi/…/1.jpg, 2.jpg, …`, bukan unggahan lewat aplikasi. Keduanya diisi di admin sebagai **jalur folder** dan tampil sebagai carousel (`GaleriDokumentasi`); tautan Drive/gambar tetap didukung sebagai fallback.

## 5. Prioritas Implementasi (selaras dengan Fase di PRD)

1. Skema DB + seed data dummy 1 siklus → render halaman publik dasar
2. Halaman Beranda + Profil (statis, data dari tabel `profil`)
3. Admin panel CRUD `siklus` → uji alur isi-lihat-tampil
4. Halaman Topik 3 (6 kategori) + admin CRUD `analisis_topik3`
5. Halaman UTS (menu 7 artefak siklus #1, tiap artefak punya halaman sendiri)
6. Halaman UAS (menu 7 artefak dari SATU siklus yang ditandai `is_uas_pilihan = 1`, tiap artefak punya halaman sendiri; toggle pilihannya ada di admin)
7. Polish: responsif, transisi Framer Motion, aksesibilitas video embed

**— Fase 6 (revisi kriteria LMS, dikerjakan setelah langkah 1-2 di atas selesai) —**

8. Migrasi skema: `ALTER TABLE siklus` tambah kolom artefak baru + `is_uas_pilihan`; `ALTER TABLE profil` tambah `kontak` & `pengantar_eportofolio`; buat tabel `refleksi` baru. Migrasi `analisis_topik3` (narasi_analisis → 5 kolom) dikerjakan hati-hati, data lama di-backup dulu.
9. Update halaman Beranda: tambah Kontak + Pengantar e-portfolio.
10. Update form & halaman Topik 3: 5 kolom analisis terstruktur, field artefak baru di form siklus.
11. Halaman + admin CRUD `refleksi` (baru).
12. Audit tata bahasa pada seluruh konten yang sudah terisi (lihat PRD.md §7).

## 6. Batasan / Non-Fungsional

- Tidak perlu SSR real-time — data portofolio jarang berubah, ISR (Incremental Static Regeneration) atau fetch server component biasa sudah cukup.
- Tidak perlu autentikasi untuk halaman publik.
- Prioritaskan kemudahan Raisul mengedit sendiri (admin panel) di atas fitur visual yang rumit.

## 7. Deployment & Environment

**Target hosting:** Vercel (Hobby/free plan) untuk aplikasi Next.js.

**Target database:** Turso (free tier) sebagai host remote untuk libSQL. **Bukan file SQLite lokal** — serverless function di Vercel tidak punya filesystem persisten, jadi `@libsql/client` harus dikonfigurasi untuk konek ke instance remote, bukan membuka file `.db` di disk.

### Environment variables yang dibutuhkan
```
TURSO_DATABASE_URL=libsql://<nama-db>-<org>.turso.io
TURSO_AUTH_TOKEN=<token>
```
Disimpan sebagai Environment Variables di dashboard project Vercel (bukan hardcode di kode / bukan di-commit ke repo).

### Batasan Vercel Hobby yang wajib diperhatikan agent
- **Maksimal 12 serverless function per deployment.** App Router Next.js menghitung tiap route handler (`route.ts`) sebagai fungsi terpisah. Kalau jumlah route API (termasuk semua endpoint admin CRUD) mendekati/melebihi 12, gabungkan beberapa endpoint jadi satu route handler dinamis (mis. `/api/admin/[resource]/route.ts` yang menangani `siklus`, `analisis`, `nonmengajar`, dst lewat satu handler) alih-alih satu file per resource.
- Timeout default function: 10 detik — hindari query berat atau proses sinkron yang lama di satu request.
- Video pembelajaran **tidak diunggah ke server** — tetap gunakan link embed (YouTube/Google Drive) sesuai ketentuan di bagian 4, supaya tidak membebani bandwidth/storage Vercel maupun Turso.
- Batasan ini berlaku untuk plan gratis; jika suatu saat perlu upgrade (mis. lebih dari 12 fungsi tanpa mau digabung, atau data > 5GB di Turso), itu keputusan biaya yang perlu didiskusikan dulu, bukan diputuskan sendiri oleh agent.
