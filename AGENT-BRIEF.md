# AGENT BRIEF — ePortofolio PPG 2026

> Taruh file ini di root repo. Baca dulu sebelum mengerjakan task apa pun di proyek ini.

## Ringkasan 1 kalimat
Website e-portofolio pribadi untuk PPL (mata kuliah PPG) milik Raisul, menyatukan tagihan **Topik 3, UTS, dan UAS** dalam satu situs Next.js, berpusat pada 4 "siklus" praktik mengajar mandiri di SMA Negeri 22 Makassar (mapel Informatika & KKA, kelas X/Fase E).

## Dokumen rujukan
- `PRD.md` — apa yang dibangun & kenapa, dibagi per fase
- `TECH-SPEC.md` — stack, skema database, peta route
- `DESIGN.md` — sistem visual (warna, tipografi, layout, komponen) yang wajib diikuti untuk semua UI
- `DEPLOY.md` — repo + Vercel + environment variable
- `PANDUAN-FOTO-DOKUMENTASI.md` — cara menaruh & menaikkan foto dokumentasi kegiatan nonmengajar (milik pemilik portofolio)
- `PRD.md` §10 — rubrik penilaian resmi LMS (Beranda, Artefak, Analisis Artefak, Refleksi, Tata Bahasa) yang jadi acuan Fase 6

## Aturan keras (jangan dilanggar)
- **Jangan pakai Prisma.** Sudah dicoba, gagal karena binary download. Pakai `@libsql/client` langsung atau Kysely.
- Stack tetap: Next.js 15 App Router, TypeScript, Tailwind, Framer Motion, NextAuth, SQLite (libsql).
- Video pembelajaran = embed link (YouTube/Drive), bukan upload file video ke server.
- **Foto dokumentasi kegiatan nonmengajar = berkas statis di `public/dokumentasi/<nama-kegiatan>/`** bernomor `1.jpg`, `2.jpg`, … dan ditampilkan sebagai carousel (aturan + batasnya di `lib/dokumentasi.ts`, komponennya `components/GaleriDokumentasi.tsx`). Kolom `kegiatan_nonmengajar.dokumentasi_url` diisi jalur itu (mis. `/dokumentasi/piket-pagi`); kalau dibiarkan berisi tautan (Drive/gambar publik), tampilannya penampil inline biasa lewat `components/FotoDokumentasi.tsx`. Folder per kegiatan disiapkan `npm run dokumentasi:folder` (`scripts/folder-dokumentasi.ts`, slug dari `slugKegiatan()`).
- **Foto contoh hasil kerja siswa UTS/UAS memakai pola yang sama**: `public/dokumentasi/hasil-kerja/siklus-<nomor>/` bernomor `1.jpg`, … (jalur dari `folderHasilKerjaSiklus()` di `lib/dokumentasi.ts`). Artefak `hasil_kerja_siswa_url` ditandai `dukungGaleriFoto` di `lib/siklus.ts`; halaman `/uts/[artefak]` & `/uas/[artefak]` menampilkan `GaleriDokumentasi` kalau kolomnya jalur `/…`, dan tetap `PenampilEmbed` untuk tautan Drive/gambar. Jangan menambah tabel/entri terpisah — tetap satu artefak per siklus. Bagian **Analisis Artefak** untuk artefak ini TAMPIL di halaman publik seperti artefak lainnya (per keputusan pemilik terbaru); datanya tetap dari baris `analisis_siklus` yang diisi lewat admin.
- Entitas `siklus` adalah sumber data tunggal — jangan buat tabel terpisah untuk data UTS/UAS, keduanya hanya menampilkan `siklus` dengan filter nomor. Analisis artefak boleh punya tabel sendiri (`analisis_siklus`) karena ia lapisan narasi, bukan data siklus; narasinya terpisah dari `analisis_topik3`.
- **UAS menampilkan SATU siklus saja** (yang ditandai `is_uas_pilihan = 1`). Sejak revisi keputusan pemilik, **admin hanya mengelola dua siklus: 1 untuk UTS dan 2 untuk UAS** (`SIKLUS_TOTAL = 2`) — siklus 3 dan 4 tidak dimasukkan, jadi jangan menambah form/rute untuk keduanya. Penanda `is_uas_pilihan` tetap dipakai sebagai syarat tampil halaman `/uas`.
- **Halaman UTS & UAS berbentuk menu artefak**, bukan satu halaman panjang: `/uts` dan `/uas` hanya berisi kartu menu (dari `ARTEFAK_SIKLUS` di `lib/siklus.ts`), sedangkan isi artefak + analisis 5 komponennya ada di `/uts/[artefak]` dan `/uas/[artefak]` — pola yang sama dengan `/topik-3/[kategori]`. Jangan menumpuk semua artefak kembali dalam satu halaman.
- **Penilaian DPL tidak ditampilkan.** Entri `penilaian_dpl_url` sudah dihapus dari `ARTEFAK_SIKLUS`; kolomnya masih ada di database (data lama aman) tetapi jangan dipakai lagi di UI, form admin, atau analisis artefak.
- **Semua keputusan visual (warna, font, spacing, komponen, layout) mengikuti `DESIGN.md`.** Jangan menebak/memilih sendiri palet atau font baru — kalau `DESIGN.md` tidak mencakup sesuatu yang dibutuhkan, tanya dulu ke saya sebelum memutuskan sendiri.
- **Jangan pernah `DROP TABLE` atau bikin ulang skema dari nol kalau tabel itu sudah ada isinya.** Perubahan skema setelah Fase 1 harus lewat `ALTER TABLE`/migrasi, dengan data lama di-backup dulu kalau ada kolom yang dipecah/dihapus (lihat TECH-SPEC.md §3, catatan migrasi).

## Status saat ini (update manual tiap sesi kerja)
- [x] Skema DB dibuat
- [x] Beranda + Profil selesai
- [ ] Beranda + Profil disesuaikan ulang dengan DESIGN.md (retrofit)
- [ ] Admin CRUD `siklus` selesai
- [ ] Modul Topik 3 (6 analisis) selesai
- [x] Modul UTS (siklus 1) selesai — tampilan menu 7 artefak + rute `/uts/[artefak]` (isi data lewat admin)
- [x] Modul UAS (satu siklus = siklus 2) selesai — tampilan menu 7 artefak + rute `/uas/[artefak]` (tandai siklus 2 lewat admin)
- [x] Analisis artefak per field untuk UTS & UAS (tabel `analisis_siklus`, form admin + tampilan publik) selesai — tampil per artefak di halaman detail
- [x] Foto contoh hasil kerja siswa UTS/UAS memakai folder `public/dokumentasi/hasil-kerja/siklus-<nomor>/` + carousel (tautan lama tetap didukung)
- [ ] Polish & responsif
- [ ] **Fase 6 — Revisi Kriteria LMS:** migrasi skema (artefak baru, analisis 5-kolom, kontak, refleksi)
- [ ] Fase 6 — Beranda update (Kontak + Pengantar e-portfolio)
- [ ] Fase 6 — Modul Refleksi baru (halaman + admin)
- [ ] Fase 6 — Audit tata bahasa konten yang sudah terisi

## Cara kerja yang diharapkan dari agent
1. Sebelum menambah fitur baru, cek dulu apakah entitas/route terkait sudah ada di `TECH-SPEC.md` — jangan bikin skema baru yang tumpang tindih.
2. Kerjakan sesuai urutan fase di `PRD.md`, jangan lompat ke UAS kalau MVP/Topik 3 belum solid.
3. Kalau ragu antara menambah kompleksitas vs menyelesaikan fase saat ini dulu — pilih menyelesaikan fase saat ini.
4. Tulis progres yang selesai ke checklist "Status saat ini" di atas setiap kali menyelesaikan bagian besar.
