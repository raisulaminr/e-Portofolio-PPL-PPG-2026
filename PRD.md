# PRD — E-Portofolio PPL (Topik 3, UTS, UAS)
**Proyek:** ePortofolio PPG 2026
**Pemilik:** Raisul Amin R — PPG Calon Guru, Pendidikan Informatika, Universitas Islam Makassar
**Konteks PPL:** SMA Negeri 22 Makassar — mapel Informatika & KKA, Kelas X / Fase E

---

## 1. Latar Belakang

Selama mata kuliah PPL, mahasiswa diwajibkan menyusun e-portofolio pada tiga titik penilaian: **Topik 3**, **UTS**, dan **UAS**. Ketiganya biasanya dikumpulkan sebagai dokumen/tautan terpisah, padahal isinya berkaitan dan saling menyambung (siklus 1 muncul di UTS, siklus 2 muncul di UAS, dsb). Tujuan proyek ini adalah menyatukan ketiganya dalam **satu website**, sehingga portofolio terlihat sebagai satu kesatuan perjalanan reflektif, bukan tiga tugas yang berdiri sendiri-sendiri.

## 2. Tujuan Produk

- Menyediakan satu website e-portofolio yang memuat seluruh tagihan Topik 3, UTS, dan UAS.
- Menampilkan artefak (RPP/perencanaan, materi, media, video, instrumen penilaian) secara terstruktur dan mudah ditelusuri per siklus praktik mengajar.
- Menyediakan admin panel agar Raisul bisa mengisi/mengubah konten tanpa perlu deploy ulang kode setiap kali ada revisi dari dosen pembimbing.
- Menghasilkan tampilan yang layak dinilai secara akademis (rapi, terstruktur, dapat diakses dosen penguji/guru pamong via tautan publik).

## 3. Pengguna

| Peran | Kebutuhan |
|---|---|
| Raisul (pemilik/admin) | Mengisi, mengedit, mengorganisir seluruh artefak; melihat progres pengisian per fase |
| Dosen pembimbing / penguji PPG | Membaca & menilai artefak secara berurutan tanpa kebingungan navigasi |
| Guru pamong (opsional) | Melihat refleksi & analisis kegiatan mengajar |

## 4. Struktur Konten (berdasarkan ketentuan PPL)

### 4.1 Beranda
Landing page, wajib memuat (sesuai rubrik LMS §10):
- Profil singkat (ringkasan, bukan narasi penuh — detail lengkap tetap di halaman Profil)
- **Kontak** (email, dan/atau nomor WA/media sosial yang ingin ditampilkan publik)
- **Pengantar e-portfolio** — paragraf singkat yang menjelaskan apa isi portofolio ini dan tujuannya, bukan cuma judul situs
- Ringkasan progres 3 fase (Topik 3 / UTS / UAS)
- Navigasi yang jelas dan terstruktur ke semua bagian (bukan cuma tombol ke 3 modul, tapi juga ke Profil dan Refleksi)

### 4.2 Profil Mahasiswa
Berisi field-field berikut:
- **Program Studi (PPG):** Pendidikan Informatika
- **LPTK:** Universitas Islam Makassar
- **Sekolah PPL:** SMA Negeri 22 Makassar (mapel Informatika & KKA, Kelas X/Fase E)
- **Kontak:** email dan/atau kontak lain yang ditampilkan publik (dipakai juga di Beranda)
- **Tentang Saya:** narasi latar belakang (lulusan S.Kom 2024, pengalaman mengajar sosial di SMP, perjalanan menuju PPG)
- **Filosofi Hidup/Mengajar:** pernyataan identitas profesional ("Informatics Teacher. Lifelong Learner. Professional Work-in-Progress.") beserta nilai/pandangan mengajar yang dipegang — versi ringkas; versi mendalam ada di modul Refleksi (4.7)

Field-field ini ditampilkan sebagai bagian terstruktur (bukan satu paragraf panjang), supaya dosen penguji bisa langsung menemukan info spesifik (mis. LPTK, sekolah PPL) tanpa membaca narasi utuh.

### 4.3 Modul Topik 3 — Artefak & Analisis (6 kategori)

Setiap kategori berisi dua lapis konten, mengikuti rubrik LMS §10 (kriteria "Artefak" dan "Analisis Artefak"):

**Lapis 1 — Artefak (bukti ajar):** tidak cukup satu jenis lampiran. Per siklus, kumpulan artefak idealnya mencakup: RPP, media pembelajaran, **contoh hasil kerja siswa**, **penilaian dari Guru Pamong (GP)**, dan video. Variasi ini yang membuat artefak "komprehensif" di mata penilai, bukan cuma RPP+video saja.

**Lapis 2 — Analisis (narasi reflektif terstruktur):** setiap artefak dianalisis dengan 5 komponen eksplisit, bukan satu paragraf umum:
1. **Konteks** — situasi/latar saat artefak ini dibuat/digunakan
2. **Tujuan** — untuk apa artefak ini dirancang
3. **Kelebihan** — apa yang berhasil/efektif
4. **Kekurangan** — apa yang masih kurang/perlu diperbaiki
5. **Kajian teori** — dikaitkan dengan teori dari mata kuliah PPG yang relevan (bukan sekadar deskripsi praktis)

> Catatan lintas modul: lima komponen analisis yang sama juga dipakai untuk **setiap artefak di UTS dan UAS** (lihat 4.4 & 4.5). Yang membedakan hanya sumber artefaknya dan isi narasinya — analisis Topik 3, UTS, dan UAS disimpan terpisah dan tidak boleh saling menyalin.

6 kategori analisis:
1. Analisis produk rancangan/perencanaan pembelajaran (RPP terbaik dari praktik mandiri)
2. Analisis materi pembelajaran yang disusun & diterapkan
3. Analisis media pembelajaran yang digunakan
4. Analisis video pelaksanaan praktik mengajar mandiri
5. Analisis kegiatan nonmengajar
6. Analisis instrumen penilaian yang dirancang (termasuk penilaian dari GP sebagai bagian dari instrumen/bukti penilaian)

### 4.4 Modul UTS — Siklus 1
- Rancangan/perencanaan pembelajaran **lengkap** (versi terbaik siklus 1)
- Video pelaksanaan praktik mengajar mandiri dari rancangan tersebut
- **Tujuh artefak siklus 1** ditampilkan sebagai menu kartu di `/uts`: Rancangan Pelaksanaan Pembelajaran, Materi Pembelajaran, Media Pembelajaran, Contoh Hasil Kerja Siswa, Video Praktik Mengajar Mandiri, Instrumen Penilaian, dan Penilaian Guru Pamong. Tiap kartu membuka halaman sendiri (`/uts/[artefak]`) — pola yang sama dengan menu kategori Topik 3, bukan satu halaman panjang berisi semua artefak.
- **Analisis artefak** untuk setiap artefak siklus 1 memakai 5 komponen yang sama seperti Topik 3 — tapi narasinya khusus UTS, tidak diambil dari analisis Topik 3. Contoh Hasil Kerja Siswa juga menampilkan analisisnya di halaman publik, sama seperti artefak lain (keputusan pemilik terbaru).
- Penilaian Dosen Pembimbing Lapangan (DPL) **tidak** termasuk artefak yang ditampilkan maupun diisi di modul UTS/UAS (keputusan pemilik portofolio).

### 4.5 Modul UAS — Satu Siklus (Siklus 2)

> **Koreksi dari instruksi resmi LMS** (sebelumnya dokumen ini mengira UAS butuh 3 paket lengkap — satu per siklus 2, 3, 4. Instruksi asli ternyata lebih ringkas, sama persis pola UTS): UAS **bukan** tiga paket terpisah, tapi hanya:
> 1. **Satu** rancangan/perencanaan pembelajaran lengkap
> 2. **Satu** video pelaksanaan praktik mengajar mandiri dari rancangan tersebut
>
> **Keputusan pemilik portofolio (revisi terbaru):** input UAS cukup **satu siklus**, yaitu **siklus 2** — siklus 3 dan 4 tidak dimasukkan. Admin hanya menampilkan dua form (Siklus 1 untuk UTS, Siklus 2 untuk UAS), dan penanda `is_uas_pilihan` tetap dipertahankan supaya halaman `/uas` baru tampil setelah siklus 2 ditandai.

Jadi polanya identik dengan UTS (4.4): satu RPP terbaik + satu video. Bedanya hanya modulnya — UTS memakai siklus 1, UAS memakai siklus 2.

Tata letak halaman `/uas` juga sama dengan UTS: satu menu berisi tujuh artefak (RPP, materi, media, contoh hasil kerja siswa, video praktik mengajar mandiri, instrumen penilaian, penilaian Guru Pamong) dari siklus 2, dan tiap artefak punya halaman sendiri di `/uas/[artefak]`. Kalau siklus 2 belum ditandai, halaman hanya menampilkan pesan agar admin menandainya.

Seperti UTS, setiap artefak siklus yang ditampilkan di halaman UAS juga punya **analisis artefak** 5 komponen (konteks, tujuan, kelebihan, kekurangan, kajian teori). Narasinya berbeda dari analisis Topik 3 maupun UTS — ketiganya harus bisa dibaca sebagai analisis yang berdiri sendiri, termasuk Contoh Hasil Kerja Siswa.

### 4.6 Admin Panel
CRUD untuk seluruh entitas di atas: profil, 6 analisis Topik 3, 2 siklus (siklus 1 UTS + siklus 2 UAS), modul Refleksi (4.7), upload/tempel tautan video, unggah dokumen (PDF/gambar media pembelajaran, hasil kerja siswa, penilaian GP).

### 4.7 Refleksi (modul baru — wajib berdasarkan rubrik LMS §10)

Halaman tersendiri, terpisah dari Profil, karena rubrik menilai ini sebagai kriteria sendiri ("Refleksi") dan menuntut kedalaman yang tidak muat di field profil biasa. Berisi:

1. **Model Guru yang Dituju** — gambaran sosok guru yang ingin dicapai Raisul ke depan, beserta alasannya
2. **Filosofi Mengajar** — pandangan/nilai yang dipegang dalam mengajar (versi mendalam; versi ringkas tetap tampil di Profil sebagai kutipan)
3. **Refleksi Akhir** — refleksi menyeluruh atas seluruh pengalaman PPL Mandiri, disertai tiga bagian eksplisit:
   - **Kekuatan** — apa yang sudah berjalan baik selama praktik mengajar
   - **Kelemahan** — apa yang masih jadi tantangan/kekurangan
   - **Rencana Tindak Lanjut** — langkah pengembangan diri ke depan berdasarkan kekuatan & kelemahan tersebut

Ini bukan sekadar "tentang saya" versi panjang — strukturnya harus terlihat sebagai refleksi profesional yang jujur dan reflektif, sesuai kriteria penilaian.

## 5. Model Hubungan Antar-Fase (penting)

Topik 3, UTS, dan UAS **bukan tiga silo terpisah** — mereka mengacu ke entitas siklus yang sama:

- Siklus 1 → dipakai di **Topik 3** (sebagai salah satu contoh analisis) dan juga jadi tagihan utama **UTS** (versi lengkap, otomatis — karena memang cuma siklus 1 yang ada di rentang UTS).
- Siklus 2 → **satu-satunya input UAS**: ditandai sebagai "produk terbaik" lewat `is_uas_pilihan` dan ditampilkan lengkap di halaman UAS. Siklus 3 dan 4 tidak dipakai dan tidak bisa dibuat lagi (admin hanya punya dua form).
- 6 kategori analisis Topik 3 bisa mengacu ke artefak dari siklus mana pun (pilih yang paling representatif), tidak harus siklus 1 saja.

Implikasi desain data: entitas **Siklus** berdiri sendiri (siklus 1 & 2, masing-masing punya RPP, materi, media, **hasil kerja siswa, penilaian GP**, video, dan instrumen penilaian; kolom `penilaian_dpl_url` masih ada di database tetapi tidak lagi ditampilkan — lihat TECH-SPEC.md §3 untuk field lengkapnya), lalu entitas **AnalisisTopik3** (6 record) masing-masing punya *relasi* ke satu siklus + 5 field analisis terstruktur (konteks, tujuan, kelebihan, kekurangan, kajian teori — bukan satu field narasi lagi). Siklus punya satu penanda (flag) `is_uas_pilihan` untuk menandai siklus 2 sebagai "produk UAS" — halaman UAS cukup menarik satu baris data itu. Entitas **Refleksi** (4.7) berdiri sendiri, tidak terkait siklus manapun.

## 6. Fase Pengembangan (Roadmap)

| Fase | Cakupan | Definisi selesai |
|---|---|---|
| **Fase 1 — MVP** | Beranda, Profil Mahasiswa, kerangka navigasi 3 modul (Topik 3/UTS/UAS), 1 entitas Siklus terisi penuh sebagai contoh | Situs bisa di-deploy, terlihat utuh secara struktur meski konten belum lengkap |
| **Fase 2** | Modul Topik 3 — 6 analisis lengkap dengan narasi | Semua 6 kategori analisis tampil dengan artefak + teks reflektif |
| **Fase 3** | Modul UTS — Siklus 1 lengkap + video | Tujuh artefak siklus 1 beserta analisisnya bisa dibuka per artefak dari menu halaman UTS |
| **Fase 4** | Modul UAS — siklus 2 ditandai sebagai produk UAS & ditampilkan lengkap + video | Tujuh artefak siklus 2 beserta analisisnya tampil lewat menu yang sama di halaman UAS, sesuai instruksi resmi |
| **Fase 5** | Admin panel penuh, polish visual, cek responsif & aksesibilitas link video | Admin bisa CRUD semua entitas tanpa sentuh kode; siap dibagikan ke dosen |
| **Fase 6 — Revisi Kriteria LMS** *(status proyek saat ini: Fase 1 selesai, revisi ini dikerjakan sebelum lanjut Fase 2-5)* | Migrasi skema (field artefak baru + analisis 5-komponen), tambah Kontak & Pengantar di Beranda, buat modul Refleksi baru, audit tata bahasa konten yang sudah ada | Seluruh 5 kriteria di rubrik LMS (§10) terpenuhi secara struktural di setiap halaman |

## 7. Kebutuhan Non-Fungsional

- Bisa diakses publik via tautan (tanpa perlu login untuk dosen/penguji).
- Video: disarankan embed dari YouTube/Google Drive (bukan hosting file video besar sendiri) — hemat biaya storage.
- Dokumen (RPP, instrumen penilaian): PDF viewer inline atau tombol unduh, bukan cuma tautan mentah.
- Responsif (dosen mungkin membuka dari HP saat menilai).
- **Tata bahasa & ejaan:** ini kriteria penilaian tersendiri (§10), bukan cuma gaya tulisan. Semua teks (narasi analisis, refleksi, profil) harus memakai ejaan dan istilah pendidikan yang baku, dengan gaya bahasa yang disesuaikan ke pembaca (dosen/penguji) — formal, bukan santai. Ini hal konten yang Raisul isi sendiri, bukan sesuatu yang bisa "dibangun" lewat kode — tapi admin panel sebaiknya punya area teks yang cukup lega (textarea, bukan input sempit) supaya nyaman menulis narasi panjang dengan baik.

## 8. Di Luar Cakupan (Out of Scope untuk saat ini)

- Sistem multi-user/multi-mahasiswa (situs ini untuk satu portofolio pribadi).
- Fitur komentar/diskusi dari dosen di dalam situs.
- Analitik pengunjung.

## 9. Kriteria Sukses

- Satu URL bisa menunjukkan seluruh tagihan Topik 3 + UTS + UAS tanpa dosen perlu berpindah dokumen.
- Navigasi jelas: dosen bisa langsung lompat ke "UTS", "UAS", atau "Refleksi" tanpa scroll panjang.
- Konten bisa diperbarui Raisul sendiri lewat admin panel, tanpa bantuan developer.
- Setiap poin di rubrik LMS (§10) bisa ditunjuk langsung ke satu bagian situs — tidak ada kriteria yang "tercecer" tanpa tempat.

## 10. Kriteria Penilaian LMS (rubrik resmi)

Rubrik ini jadi acuan utama revisi Fase 6 dan QA sebelum submit:

| Kriteria | Rincian |
|---|---|
| **Beranda (Homepage)** | Semua informasi awal tersaji (profil, kontak, pengantar e-portfolio), desain profesional, navigasi jelas dan terstruktur |
| **Artefak (bukti ajar)** | Artefak bervariasi (RPP, media, contoh hasil kerja siswa, penilaian dari GP dan DPL, video, dll), sesuai tujuan e-portfolio, komprehensif merepresentasikan PPL Mandiri |
| **Analisis Artefak** | Setiap artefak dijelaskan mendalam (konteks, tujuan, kelebihan, kekurangan) dan dianalisis lewat kajian teori dari mata kuliah yang terintegrasi dengan PPL Mandiri |
| **Refleksi** | Refleksi terhadap model guru yang dituju, filosofi mengajar, dan refleksi akhir — mendalam, disertai kekuatan, kelemahan, dan rencana tindak lanjut |
| **Tata Bahasa** | Ejaan dan istilah akurat sesuai konteks pendidikan; gaya bahasa sesuai target pembaca |
