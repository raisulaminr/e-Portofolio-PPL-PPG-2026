# Panduan Foto Dokumentasi (Nonmengajar & Hasil Kerja Siswa)

Panduan milik pemilik portofolio: cara menaruh foto dokumentasi kegiatan nonmengajar
dan foto contoh hasil kerja siswa UTS/UAS, mengisinya di panel admin, dan menaikkannya
ke repo supaya tampil di situs.

Dokumen terkait: `PRD.md` bagian 5 (sumber data kategori nonmengajar), `DEPLOY.md` (repo + Vercel),
`AGENT-BRIEF.md` (aturan proyek), `lib/dokumentasi.ts` (kode aturannya),
`components/GaleriDokumentasi.tsx` (carousel-nya).

---

## 1. Aturan singkat

| Hal | Aturan |
|---|---|
| Lokasi foto | `public/dokumentasi/<slug-kegiatan>/` |
| Lokasi foto hasil kerja siswa | `public/dokumentasi/hasil-kerja/siklus-<nomor>/` (bagian 2) |
| Nama folder | huruf kecil + tanda hubung, hasil `npm run dokumentasi:folder` (mis. `piket-pagi`) |
| Nama berkas | `1.jpg`, `2.jpg`, `3.jpg`, … — **angka = urutan tampil di carousel** |
| Urutan nomor | harus berurutan **tanpa bolong** (ada `1.jpg`, `2.jpg`, lalu langsung `4.jpg` → hanya 2 foto yang tampil) |
| Ekstensi | `.jpg`, `.jpeg`, `.png`, `.webp` — wajib **huruf kecil** (`1.JPG` tidak terbaca) |
| Jumlah foto | maksimal 20 per kegiatan (batas `MAKS_FOTO` di `lib/dokumentasi.ts`) |
| Isi kolom admin | **satu** nilai: jalur foldernya, mis. `/dokumentasi/piket-pagi` (bukan tautan Drive, dan bukan beberapa tautan sekaligus) |
| Banyak foto satu kegiatan | taruh semuanya di folder itu dengan nomor berurutan — kolom admin tidak berubah |
| Ukuran berkas | usahakan sisi panjang ≤ 1600 px dan ≤ ~300 KB per foto — repo & situs tetap ringan |

Tidak ada unggah lewat aplikasi: foto adalah berkas statis yang ikut repo, jadi setiap tambah foto
berarti commit + push (dan Vercel deploy ulang otomatis).

---

## 2. Langkah menambahkan foto

1. **Siapkan fotonya di komputer.** Pilih foto terbaiknya saja (3–6 foto per kegiatan sudah cukup),
   lalu beri nama `1.jpg`, `2.jpg`, `3.jpg`, dst. Urutan nomor = urutan tampil, jadi putuskan dari sekarang.
2. **Pastikan foldernya ada.** Di terminal, dari folder proyek:
   ```bash
   npm run dokumentasi:folder
   ```
   Perintah ini membuat `public/dokumentasi/<slug>/` untuk setiap kegiatan yang ada di database dan
   mencetak jalur yang harus diketik di admin. Aman dijalankan berulang — foto yang sudah ada tidak disentuh.
3. **Salin fotonya** ke folder itu (lewat File Explorer pun boleh):
   `public/dokumentasi/piket-pagi/1.jpg`, `2.jpg`, … Folder kosong tetap ikut ter-commit karena ada
   penanda `.gitkeep` di dalamnya.
4. **Isi kolom admin.** Buka `/admin/nonmengajar/<id>` (mis. `/admin/nonmengajar/1`), isi
   **"Tautan atau folder dokumentasi"** dengan jalur folder tadi (`/dokumentasi/piket-pagi`), lalu
   klik **Simpan perubahan**. Setelah kolomnya berupa jalur `/…`, halaman publik otomatis memakai
   carousel dari folder itu.
5. **Naikkan ke repo** (bagian 3), lalu **cek hasilnya** (bagian 4).

### Kalau fotonya lebih dari satu (kegiatan yang sama)

Banyak foto tetap **satu jalur di kolom admin** — yang ditambah adalah berkas di dalam foldernya:

```
public/dokumentasi/piket-pagi/
├── 1.jpg      ← tampil pertama di carousel
├── 2.jpg
├── 3.jpg
└── .gitkeep
```

Kolom "Tautan atau folder dokumentasi" untuk `/admin/nonmengajar/1` tetap diisi satu nilai:
`/dokumentasi/piket-pagi`. Halaman publik lalu menampilkan carousel dengan tombol ←/→ dan penghitung
`1 / 3`.

- **Jangan** mengisi beberapa tautan sekaligus di kolom itu (dipisah koma, spasi, atau baris baru) —
  kolomnya hanya menerima satu tautan **atau** satu jalur folder, dan halaman akan menganggapnya satu
  nilai.
- Foto baru bisa ditambah kapan saja: beri nomor lanjutan (`4.jpg`, `5.jpg`, …), commit, push — tidak
  perlu mengubah kolom admin lagi.
- Kalau ingin menyusun ulang urutan tampil, cukup tukar nomor berkasnya (mis. foto liburan jadi `1.jpg`).

> Catatan: kegiatan bisa juga tetap memakai tautan Drive/gambar publik — isi kolomnya dengan tautan
> seperti biasa dan fotonya tampil inline (satu foto). Carousel hanya untuk mode folder di `public/`.

### Foto contoh hasil kerja siswa (UTS/UAS)

Artefak **Contoh Hasil Kerja Siswa** di `/uts/hasil-kerja-siswa` dan `/uas/hasil-kerja-siswa`
memakai pola yang sama: fotonya berkas statis, ditampilkan sebagai carousel.

| Hal | Aturan |
|---|---|
| Lokasi foto | `public/dokumentasi/hasil-kerja/siklus-<nomor>/` — `siklus-1` untuk UTS, `siklus-2/3/4` untuk sumber UAS |
| Nama berkas | `1.jpg`, `2.jpg`, … — sama seperti dokumentasi nonmengajar: rapat, huruf kecil, maks. 20 |
| Isi kolom admin | **Contoh Hasil Kerja Siswa** di `/admin/siklus/<nomor>`: satu jalur folder, mis. `/dokumentasi/hasil-kerja/siklus-1` |
| Banyak foto | taruh semuanya di folder itu — kolom admin tidak berubah |

Folder-nya dibuat otomatis oleh `npm run dokumentasi:folder` (langkah yang sama dengan bagian 2).
Kalau kolomnya masih berisi tautan Drive/gambar, lampiran tampil sebagai penampil inline seperti
biasa — carousel hanya aktif untuk jalur `/…`. Untuk UAS foldernya `public/dokumentasi/hasil-kerja/siklus-2/`
(karena admin hanya mengelola siklus 1 untuk UTS dan siklus 2 untuk UAS).

---

## 3. Cara "up" ke repo

Pilih salah satu cara. Semua cara berakhir sama: berkas masuk ke repo → Vercel men-deploy ulang.

### A. Lewat terminal (git)

```bash
# 1. lihat apa yang akan naik — .env.local TIDAK boleh muncul di daftar ini
git status --short

# 2. tambahkan foto (folder dokumentasi saja, bukan seluruh repo)
git add public/dokumentasi

# 3. commit + push
git commit -m "Tambah foto dokumentasi Piket Pagi"
git push
```

Kalau repo GitHub-nya belum pernah dibuat, kerjakan dulu bagian **2. Prasyarat** di `DEPLOY.md`
(`git init` → commit pertama → `git remote add origin …` → `git push -u origin main`).

### B. Lewat GitHub di browser (tanpa terminal)

1. Buka repo → masuk ke folder `public/dokumentasi/<slug>`.
2. **Add file → Upload files**, pilih foto dari komputer.
3. **Ganti nama berkasnya** di daftar antrean upload jadi `1.jpg`, `2.jpg`, … (kalau fotonya sudah
   diberi nama di komputer, langkah ini tidak perlu).
4. Tulis pesan commit singkat → **Commit changes** → Vercel otomatis mulai build.

### C. Lewat GitHub Desktop atau VS Code

- **GitHub Desktop:** Repository → Show in Explorer → salin fotonya ke `public/dokumentasi/<slug>/` →
  kembali ke aplikasi (perubahan muncul di tab Changes) → isi Summary → **Commit to main** → **Push origin**.
- **VS Code:** panel **Source Control** → salin fotonya lebih dulu → klik `+` di berkas fotonya →
  tulis pesan → **Commit** → **Sync Changes** (push).

> Jangan pakai **Add file → Create new file** untuk memindahkan foto berukuran besar dari HP —
> unggah berkasnya (upload), bukan membuat berkas teks baru.

---

## 4. Cek hasilnya

1. **Vercel:** menu **Deployments** → tunggu status **Ready** (± 1–2 menit setelah push).
2. **Situs:** buka `https://<domain>/topik-3/nonmengajar` — foto dokumentasi muncul sebagai carousel
   (tombol ←/→ dan penghitung `1 / 3`).
3. **Lokal (opsional):** `npm run dev` lalu buka `http://localhost:3000/topik-3/nonmengajar`.
4. Kalau foto baru tidak muncul: **hard refresh** (`Ctrl` + `F5`) — browser dan CDN masih menyimpan versi lama.

---

## 5. Kalau ada masalah

| Gejala | Penyebab yang paling sering |
|---|---|
| Muncul tulisan *"Belum ada foto di /dokumentasi/xxx"* | Nama folder tidak sama dengan jalur di kolom admin (huruf besar/kecil, spasi, typo), atau fotonya belum ter-push. Di Vercel (Linux) huruf besar & kecil berbeda berkas |
| Pesan menyebut *"Kalau angka … di ujung itu nomor foto dan bukan nama folder"* | Kolomnya diisi `…/piket-pagi/1` (nomor foto). Isi jalur **folder**-nya saja: `…/piket-pagi` |
| Hanya sebagian foto tampil (mis. 2 dari 5) | Nomor berkasnya bolong — harus `1.jpg`, `2.jpg`, `3.jpg`, … tanpa lompat |
| Foto tidak terbaca padahal namanya sudah `1.jpg` | Ekstensi huruf besar (`1.JPG`) atau format tidak didukung (mis. `.heic`) |
| Foto ke-1 muncul, sisanya tidak | Berkas lain diberi nama dengan tambahan (mis. `2 - piket.jpg`, `2(1).jpg`) — hanya angka + ekstensi yang dikenali |
| Yang tampil masih foto Drive lama | Kolom dokumentasi masih berisi tautan, bukan jalur `/dokumentasi/…` |
| Perubahan tidak terlihat setelah commit | Commit belum di-push, atau deployment Vercel belum **Ready** |
| Ingin lebih dari 20 foto | Naikkan `MAKS_FOTO` di `lib/dokumentasi.ts` (dan sesuaikan panduan ini) |

---

## 6. Di balik layar (ringkas)

- Halaman `/topik-3/nonmengajar` memeriksa kolom `dokumentasi_url`: kalau diawali `/` → carousel
  (`components/GaleriDokumentasi.tsx`), kalau tautan → penampil inline (`components/FotoDokumentasi.tsx`).
- Artefak **Contoh Hasil Kerja Siswa** di `/uts/[artefak]` dan `/uas/[artefak]` memakai aturan yang
  sama untuk kolom `hasil_kerja_siswa_url`: jalur `/…` → carousel, tautan → `PenampilEmbed`
  (`components/HalamanArtefakSiklus.tsx`; artefaknya ditandai `dukungGaleriFoto` di `lib/siklus.ts`).
- Jumlah foto tidak disimpan di database. Browser mencoba `1.jpg`, lalu `2.jpg`, dan berhenti pada
  nomor pertama yang tidak ada — itulah sebabnya penomoran harus rapat dan huruf kecil.
- `.gitkeep` di dalam setiap folder hanya supaya folder kosong tetap ikut ter-commit (Git tidak
  melacak folder kosong). Boleh dibiarkan.
