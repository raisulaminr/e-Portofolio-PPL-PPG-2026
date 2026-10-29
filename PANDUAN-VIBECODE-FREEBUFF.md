# Panduan Vibecode di Freebuff — ePortofolio PPG 2026

Gunakan panduan ini berdampingan dengan `PRD.md`, `TECH-SPEC.md`, `AGENT-BRIEF.md`, dan `DESIGN.md`. Semua prompt di bawah tinggal copy-paste, sesuaikan bagian yang bertanda `[...]` kalau perlu.

---

## 0. Persiapan Sekali di Awal

1. Buat project baru di Freebuff (CLI atau Web).
2. Taruh `PRD.md`, `TECH-SPEC.md`, `AGENT-BRIEF.md`, dan `DESIGN.md` di root project (sejajar, semua bisa dibaca agent).
3. Buat akun Turso, buat 1 database, catat `TURSO_DATABASE_URL` dan `TURSO_AUTH_TOKEN` — belum perlu dipasang sekarang, baru dipakai di Fase 1.

### Prompt Onboarding (jalankan di Plan Mode, sekali di awal proyek)

```
Baca AGENT-BRIEF.md, PRD.md, TECH-SPEC.md, dan DESIGN.md di root project ini.

Setelah selesai membaca, ringkas dalam beberapa poin:
1. Apa produk yang sedang dibangun (1-2 kalimat)
2. Stack teknis yang wajib dipakai
3. Aturan keras yang tidak boleh dilanggar (lihat bagian "Aturan keras" di AGENT-BRIEF.md)
4. Urutan fase pengerjaan sesuai bagian 5 PRD.md
5. Sistem visual yang wajib diikuti dari DESIGN.md (warna, tipografi, prinsip layout) — sebutkan poin-poin utamanya saja

Jangan menulis kode apa pun dulu. Tunggu saya konfirmasi ringkasanmu sebelum kita mulai Fase 1.
```

Kalau ringkasan agent sudah benar, balas singkat: `"Oke, lanjut ke Fase 1."` Kalau ada yang meleset, koreksi dulu sebelum lanjut.

---

## 0.5 Menghubungkan Database (Turso) — Langkah Detail

Ini rincian dari poin 3 di atas. Kerjakan sebelum atau tepat di awal Fase 1, karena Fase 1 sudah butuh koneksi database jalan.

### A. Membuat database (lewat dashboard, tanpa install apa pun)
1. Buka `app.turso.tech` dan daftar — gratis, tanpa kartu kredit.
2. Klik **Create Database**, beri nama misalnya `eportofolio-ppg`, pilih region terdekat (Singapura/Asia kalau tersedia, supaya lebih cepat diakses dari Indonesia).
3. Di halaman detail database, salin **Database URL** (formatnya `libsql://<nama-db>-<org>.turso.io`).
4. Buat token akses lewat menu **Tokens** → **Create Token** → salin tokennya (biasanya cuma ditampilkan sekali, langsung simpan).

*(Kalau lebih familiar terminal, bisa juga pakai Turso CLI: `turso auth login`, lalu `turso db create eportofolio-ppg`, `turso db show eportofolio-ppg --url`, dan `turso db tokens create eportofolio-ppg`.)*

### B. Menyimpan kredensial di Freebuff
- **Freebuff Web:** buka pengaturan project → Environment Variables → tambahkan `TURSO_DATABASE_URL` dan `TURSO_AUTH_TOKEN` dengan nilai dari langkah A.
- **Freebuff CLI (folder lokal):** buat file `.env.local` di root project (pastikan masuk `.gitignore`, jangan sampai ter-commit) berisi:
  ```
  TURSO_DATABASE_URL=libsql://...
  TURSO_AUTH_TOKEN=...
  ```

### C. Prompt untuk agent: buat koneksinya

```
Saya sudah membuat database Turso dan menyimpan TURSO_DATABASE_URL serta TURSO_AUTH_TOKEN sebagai environment variable di project ini.

Buatkan satu file koneksi database (mis. lib/db.ts) yang:
1. Membaca TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN dari environment variable — jangan hardcode nilainya di kode.
2. Membuat client koneksi pakai @libsql/client.
3. Diekspor supaya dipakai ulang di seluruh route handler/server component (jangan bikin koneksi baru di tiap file).
4. Menjalankan CREATE TABLE dari skema di TECH-SPEC.md bagian 3, sekali saja saat setup — bukan di setiap request.

Setelah itu, jalankan satu query test sederhana (SELECT 1) untuk memastikan koneksinya berhasil, dan tunjukkan hasilnya ke saya.
```

### D. Menyalin environment variable ke Vercel (nanti, saat deploy)
Vercel project → Settings → Environment Variables → tambahkan `TURSO_DATABASE_URL` dan `TURSO_AUTH_TOKEN` dengan nilai yang sama. Ini terpisah dari yang di Freebuff — harus diisi manual lagi, tidak otomatis ikut.

### E. Kalau koneksi gagal

```
Koneksi ke database gagal dengan error: [tempel pesan errornya].
Cek dulu apakah TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN terbaca benar dari environment variable, dan apakah formatnya diawali libsql://.
Kalau errornya soal koneksi/kredensial, jangan buat ulang skema tabel — itu masalah berbeda.
```

---

## 1. Fase 1 — MVP (Skema DB, Beranda, Profil)

### Prompt Build

```
Kerjakan Fase 1 sesuai PRD.md bagian 5 (MVP) dan skema tabel di TECH-SPEC.md bagian 3.

Cakupan Fase 1 saja:
1. Buat skema database sesuai TECH-SPEC.md persis (tabel siklus, analisis_topik3, kegiatan_nonmengajar, profil) — jangan ubah nama kolom atau tipe data.
2. Buat koneksi ke database via @libsql/client dengan environment variable TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN (lihat TECH-SPEC.md bagian 7). Jangan gunakan file SQLite lokal.
3. Isi 1 baris data dummy di tabel siklus (nomor_siklus = 1, status = 'lengkap') supaya ada contoh data yang bisa ditampilkan.
4. Buat halaman Beranda (/) dan Profil Mahasiswa (/profil) sesuai PRD.md bagian 4.1 dan 4.2 — field profil: nama, program_studi, lptk, sekolah_ppl, mapel, kelas_fase, tentang_saya, filosofi_hidup, identitas_profesional.

Jangan mengerjakan modul Topik 3, UTS, atau UAS dulu — itu fase berikutnya.
```

### Prompt Setelah Selesai (validasi + update checklist)

```
Fase 1 sudah saya cek dan berjalan baik. Tandai item "Skema DB dibuat" dan "Beranda + Profil selesai" sebagai selesai di bagian "Status saat ini" pada AGENT-BRIEF.md.
```

---

## 1.5 Retrofit Fase 1 dengan DESIGN.md

Fase 1 (Beranda + Profil) dibangun sebelum `DESIGN.md` ada, jadi kemungkinan tampilannya masih pakai styling default/tebakan agent. Sebelum lanjut ke Fase 2, samakan dulu supaya semua halaman berikutnya konsisten sejak awal — bukan "menambal" di Fase 5.

### Prompt Build

```
Baca DESIGN.md sepenuhnya. Lalu tinjau ulang halaman Beranda (/) dan Profil (/profil) yang sudah dibangun di Fase 1.

Sesuaikan warna, tipografi, spacing, dan komponen di kedua halaman itu supaya mengikuti DESIGN.md — tanpa mengubah struktur data, route, atau logika yang sudah ada, murni penyesuaian visual.

Sebelum mengubah kode, sebutkan dulu bagian mana saja yang akan diubah (mis. "warna aksen tombol", "font judul", "jarak antar section"), tunggu saya konfirmasi.
```

### Prompt Setelah Selesai

```
Retrofit sudah oke. Tandai item "Beranda + Profil disesuaikan ulang dengan DESIGN.md (retrofit)" sebagai selesai di AGENT-BRIEF.md.
```

---

## 2. Fase 2 — Modul Topik 3 (6 Analisis)

### Prompt Build

```
Lanjut ke Fase 2 sesuai PRD.md bagian 5. Cakupan:

1. Buat halaman /topik-3 sebagai landing (ringkasan 6 kategori analisis) dan /topik-3/[kategori] untuk detail tiap kategori, sesuai route map di TECH-SPEC.md bagian 2.
2. 6 kategori (slug): perencanaan, materi, media, video, nonmengajar, instrumen — sesuai PRD.md bagian 4.3.
3. Setiap halaman detail menampilkan: artefak yang direferensikan dari tabel siklus (via siklus_id di analisis_topik3) DAN narasi analisis (narasi_analisis). Kategori "nonmengajar" tidak merujuk ke siklus manapun — tarik datanya dari tabel kegiatan_nonmengajar.
4. Buat admin panel sederhana (CRUD) khusus untuk tabel analisis_topik3 dulu — cukup form untuk mengisi kategori, pilih siklus (dropdown), dan narasi analisis.

Ingat batasan 12 serverless function di Vercel Hobby (TECH-SPEC.md bagian 7) — kalau route admin API mulai banyak, gabungkan jadi satu route handler dinamis, jangan satu file per kategori.

Untuk semua komponen UI baru di fase ini, ikuti DESIGN.md — jangan bikin warna/font/pola komponen baru di luar itu.
```

### Prompt Setelah Selesai

```
Fase 2 sudah oke. Update checklist "Modul Topik 3 (6 analisis) selesai" di AGENT-BRIEF.md.
```

---

## 3. Fase 3 — Modul UTS (Siklus 1 Lengkap)

### Prompt Build

```
Lanjut ke Fase 3 sesuai PRD.md bagian 5. Cakupan:

1. Buat halaman /uts yang menampilkan data siklus dengan nomor_siklus = 1 secara LENGKAP: rpp_url, materi_url, media_url beserta media_deskripsi, video_url (embed, bukan link mentah), dan instrumen_penilaian_url.
2. Ingat: /uts TIDAK membuat tabel atau data baru — dia hanya menampilkan ulang data siklus #1 yang sudah ada dari Fase 1, dengan layout "produk lengkap" (lihat PRD.md bagian 4.4 dan bagian 5 "Model Hubungan Antar-Fase").
3. Tambahkan form admin untuk melengkapi/mengedit data siklus #1 kalau belum lengkap (rpp_url, media, video, instrumen).

Video harus di-embed pakai iframe (YouTube/Drive), bukan cuma tombol link keluar.

Layout halaman "produk lengkap" ini ikuti DESIGN.md — samakan dengan komponen yang sudah dipakai di halaman Topik 3, jangan bikin gaya visual baru.
```

### Prompt Setelah Selesai

```
Fase 3 sudah oke. Update checklist "Modul UTS (siklus 1) selesai" di AGENT-BRIEF.md.
```

---

## 4. Fase 4 — Modul UAS (Satu Siklus Terpilih dari Rentang 2–4)

> Catatan: instruksi UAS sempat salah diasumsikan sebagai "3 paket lengkap siklus 2+3+4". Sudah dikoreksi di PRD.md §4.5 — UAS sebenarnya cuma 1 RPP terbaik + 1 video, polanya sama seperti UTS. Prompt di bawah sudah pakai versi yang benar.

### Prompt Build

```
Lanjut ke Fase 4 sesuai PRD.md bagian 4.5 dan 5 (versi terbaru — UAS itu SATU siklus terpilih, bukan tiga). Cakupan:

1. Pastikan migrasi kolom is_uas_pilihan di tabel siklus sudah ada (lihat TECH-SPEC.md bagian 3) — kalau belum, kerjakan dulu sebagai ALTER TABLE, bukan drop/recreate.
2. Buat halaman /uas yang menampilkan SATU baris siklus dengan is_uas_pilihan = 1, ditampilkan lengkap (RPP, materi, media, video, instrumen penilaian) — pakai ulang komponen yang sudah dibuat di Fase 3 untuk UTS, jangan duplikasi kode dari nol.
3. Di admin panel form siklus (untuk nomor_siklus 2, 3, dan 4), tambahkan toggle/checkbox "Jadikan produk UAS". Terapkan logika: kalau satu siklus di-toggle ON, otomatis matikan is_uas_pilihan di siklus 2/3/4 lainnya (supaya cuma ada 1 yang aktif).

Kalau belum ada siklus 2/3/4 yang datanya lengkap untuk ditandai sebagai pilihan UAS, buat saja halaman /uas menampilkan pesan "belum ada produk UAS yang dipilih" alih-alih error.

Tetap ikuti DESIGN.md dan pakai ulang komponen visual dari Fase 3 — halaman UTS dan UAS harus terlihat satu keluarga, bukan dua gaya berbeda.
```

### Prompt Setelah Selesai

```
Fase 4 sudah oke. Update checklist "Modul UAS (satu siklus terpilih dari rentang 2-4) selesai" di AGENT-BRIEF.md.
```

---

## 5. Fase 5 — Admin Panel Penuh & Polish

### Prompt Build

```
Lanjut ke Fase 5 (final) sesuai PRD.md bagian 5. Cakupan:

1. Lengkapi admin panel supaya semua entitas bisa di-CRUD dari satu dashboard /admin: siklus, analisis_topik3, kegiatan_nonmengajar, profil.
2. Tambahkan login admin pakai NextAuth (credentials provider, 1 user saja — tidak perlu multi-role) sesuai TECH-SPEC.md bagian 4.
3. Cek responsif di ukuran layar HP (dosen mungkin menilai dari HP) dan pastikan video embed tidak overflow.
4. Tambahkan transisi halaman ringan pakai Framer Motion — jangan berlebihan, cukup fade/slide sederhana.
5. Review ulang: apakah ada serverless function yang mendekati limit 12 di Vercel Hobby? Kalau iya, konsolidasikan dulu sebelum deploy.
6. Audit terakhir: cek seluruh halaman (Beranda, Profil, Topik 3, UTS, UAS, Admin) sudah konsisten mengikuti DESIGN.md — laporkan kalau ada halaman yang masih menyimpang.
```

### Prompt Setelah Selesai (menuju deploy)

```
Fase 5 sudah oke, semua checklist di AGENT-BRIEF.md sudah tercentang. Sekarang siapkan project ini untuk deploy:
1. Cek ulang bahwa tidak ada TURSO_DATABASE_URL atau TURSO_AUTH_TOKEN yang ter-hardcode di kode.
2. Buatkan saya daftar environment variable yang perlu saya masukkan manual di dashboard Vercel.
3. Jangan deploy otomatis — beri saya instruksi langkahnya saja, saya yang akan klik deploy di Vercel.
```

---

## 5.5 Fase 6 — Revisi Sesuai Kriteria LMS

Karena websitemu sudah jalan (Fase 1 selesai, sebagian konten tinggal diisi), ini **revisi**, bukan bangun ulang. Jalankan di Freebuff CLI yang sama, folder project yang sama — jangan mulai project baru.

### Langkah 0 — Beri tahu agent dulu bahwa dokumen sudah berubah

```
Dokumen PRD.md, TECH-SPEC.md, dan AGENT-BRIEF.md di project ini baru saya perbarui — ada kriteria penilaian LMS baru yang harus dipenuhi (lihat PRD.md bagian 10). Baca ulang ketiganya dari awal, termasuk bagian yang bertanda "BARU" di TECH-SPEC.md bagian 3.

Setelah baca, ringkas apa saja yang berubah dibanding yang sudah kamu bangun di Fase 1:
1. Field/tabel baru apa yang perlu ditambahkan ke database
2. Halaman baru apa yang perlu dibuat
3. Apakah ada data yang sudah saya isi di Fase 1 yang berisiko hilang kalau skema diubah sembarangan

Jangan ubah kode apa pun dulu. Tunggu konfirmasi saya.
```

Cek ringkasannya — terutama poin 3. Kalau agent tidak menyebut soal risiko kehilangan data, ingatkan secara eksplisit sebelum lanjut.

### Langkah 1 — Migrasi skema (paling berisiko, kerjakan sendirian dulu)

```
Kerjakan migrasi skema sesuai TECH-SPEC.md bagian 3 (bagian "Catatan migrasi"):

1. ALTER TABLE siklus: tambah kolom hasil_kerja_siswa_url, hasil_kerja_siswa_deskripsi, penilaian_gp_url, penilaian_dpl_url.
2. ALTER TABLE profil: tambah kolom kontak, pengantar_eportofolio.
3. Buat tabel baru refleksi persis sesuai skema di TECH-SPEC.md.
4. Untuk analisis_topik3: JANGAN langsung hapus kolom narasi_analisis. Tambah dulu 5 kolom baru (konteks, tujuan, kelebihan, kekurangan, kajian_teori) sebagai nullable. Tunjukkan ke saya isi narasi_analisis yang sudah ada (kalau ada) supaya saya bisa pindahkan manual ke kolom yang sesuai sebelum kolom lama itu dihapus.

Setelah migrasi, jalankan query untuk menunjukkan struktur tabel terbaru, supaya saya bisa verifikasi tidak ada data yang hilang.
```

Baru setelah kamu konfirmasi data aman, baru suruh agent lanjut hapus kolom lama kalau memang sudah tidak dipakai:
```
Data sudah saya pindahkan/verifikasi aman. Sekarang boleh hapus kolom narasi_analisis yang lama dari analisis_topik3, dan jadikan 5 kolom barunya NOT NULL.
```

### Langkah 2 — Update Beranda (Kontak + Pengantar)

```
Update halaman Beranda (/) sesuai PRD.md bagian 4.1 versi terbaru: tambahkan section Kontak dan Pengantar e-portfolio, ambil datanya dari kolom kontak dan pengantar_eportofolio di tabel profil. Juga update form admin profil supaya kedua field itu bisa diisi. Tetap ikuti DESIGN.md untuk stylingnya.
```

### Langkah 3 — Update form & halaman Topik 3 (5 kolom analisis + artefak baru)

```
Update halaman /topik-3/[kategori] dan form admin analisis_topik3 supaya menampilkan dan bisa mengisi 5 field analisis (konteks, tujuan, kelebihan, kekurangan, kajian_teori) sebagai field terpisah — bukan satu textarea besar.

Update juga form admin siklus untuk menambahkan input hasil kerja siswa dan penilaian GP/DPL, dan tampilkan keempatnya di halaman publik (Topik 3, UTS, UAS) sebagai bagian dari daftar artefak per siklus.
```

### Langkah 4 — Modul Refleksi baru

```
Buat halaman /refleksi sesuai PRD.md bagian 4.7: tiga bagian (Model Guru yang Dituju, Filosofi Mengajar, Refleksi Akhir dengan Kekuatan/Kelemahan/Rencana Tindak Lanjut), data dari tabel refleksi. Buat juga form admin di /admin/refleksi. Tambahkan link ke halaman ini di navigasi utama (Beranda dan navbar).
```

### Langkah 5 — Audit tata bahasa (bukan kerjaan agent, tapi bisa dibantu)

Tata bahasa itu soal konten yang kamu tulis sendiri, bukan sesuatu yang dibangun lewat kode. Tapi kamu bisa minta agent bantu mengecek:

```
Tampilkan semua teks yang sudah saya isi di tabel analisis_topik3, refleksi, dan profil (konteks, tujuan, kelebihan, kekurangan, kajian_teori, refleksi_akhir, tentang_saya, dll) dalam satu daftar. Jangan ubah isinya — saya yang akan baca dan revisi sendiri soal ejaan dan istilahnya.
```

### Setelah Fase 6 selesai

```
Fase 6 sudah saya cek dan semua kriteria rubrik LMS sudah ada tempatnya. Tandai 4 item "Fase 6" di AGENT-BRIEF.md sebagai selesai.
```

---

## 6. Prompt untuk Situasi Umum

**Buka sesi baru (bukan lanjutan sesi sebelumnya):**
```
Ini sesi baru. Baca ulang AGENT-BRIEF.md (terutama bagian "Status saat ini"), PRD.md, TECH-SPEC.md, dan DESIGN.md sebelum lanjut kerja. Beri tahu saya kita sudah sampai fase berapa, lalu tunggu instruksi saya.
```

**Kalau UI yang dihasilkan agent tidak sesuai DESIGN.md:**
```
Tampilan ini tidak sesuai DESIGN.md — [sebutkan bagian yang meleset, mis. "warna tombol beda dari token yang ditentukan" atau "font judul bukan yang disebut di DESIGN.md"]. Perbaiki supaya sesuai persis dengan DESIGN.md, jangan bikin variasi baru.
```

**Kalau agent mulai menyimpang dari TECH-SPEC (misal pakai Prisma lagi, atau bikin skema baru sendiri):**
```
Berhenti dulu. Itu melanggar aturan di AGENT-BRIEF.md/TECH-SPEC.md — [sebutkan aturan yang dilanggar, mis. "jangan pakai Prisma" atau "jangan buat tabel baru di luar skema TECH-SPEC.md"]. Batalkan perubahan itu dan kerjakan ulang sesuai dokumen.
```

**Kalau ingin agent menjelaskan dulu sebelum eksekusi (untuk perubahan besar/berisiko):**
```
Sebelum mengerjakan ini, jelaskan dulu rencana teknismu dalam beberapa poin. Jangan tulis kode sampai saya bilang "lanjut".
```

**Kalau butuh menambah fitur di luar cakupan PRD.md (mis. komentar dosen, fitur baru):**
```
Ini permintaan di luar cakupan PRD.md saat ini. Sebelum menambahkan, ringkas dampaknya ke skema data di TECH-SPEC.md — apakah perlu tabel baru? Apakah berisiko menambah jumlah serverless function melewati limit 12? Tunggu konfirmasi saya sebelum eksekusi.
```

---

## 7. Urutan Ringkas (cheat sheet)

| Sesi | Yang dilakukan | Dokumen yang dirujuk |
|---|---|---|
| Awal | Prompt Onboarding | AGENT-BRIEF, PRD, TECH-SPEC, DESIGN |
| 0.5 | Hubungkan database Turso | Panduan §0.5, TECH-SPEC §7 |
| 1 | Fase 1 — MVP | PRD §5, TECH-SPEC §3 & §7 |
| 1.5 | Retrofit Fase 1 dengan DESIGN.md | Panduan §1.5, DESIGN.md |
| 2 | Fase 2 — Topik 3 | PRD §4.3, TECH-SPEC §2, DESIGN.md |
| 3 | Fase 3 — UTS | PRD §4.4, PRD §5 "Model Hubungan Antar-Fase", DESIGN.md |
| 4 | Fase 4 — UAS | PRD §4.5, TECH-SPEC §2, DESIGN.md |
| 5 | Fase 5 — Polish & Deploy | TECH-SPEC §4 & §7, DESIGN.md (audit akhir) |
| 6 | Fase 6 — Revisi Kriteria LMS | Panduan §5.5, PRD §10, TECH-SPEC §3 (catatan migrasi) |
| Tiap sesi baru | Prompt "buka sesi baru" | AGENT-BRIEF "Status saat ini" |
