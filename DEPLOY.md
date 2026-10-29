# Deploy — e-Portofolio PPL PPG 2026

Panduan langkah demi langkah untuk menaikkan proyek ini ke Vercel. **Tidak ada langkah di sini
yang dijalankan otomatis** — semua tombol/simpul ada di tangan pemilik portofolio.

Dokumen terkait: `TECH-SPEC.md` bagian 7 (target hosting, environment variable, batasan Vercel),
`AGENT-BRIEF.md` (kondisi proyek & jebakan teknis), `PRD.md` (kebutuhan non-fungsional),
`PANDUAN-FOTO-DOKUMENTASI.md` (aturan nama berkas & folder foto dokumentasi/hasil kerja).

- **Target hosting:** Vercel (Hobby/free), framework preset Next.js (terdeteksi otomatis).
- **Target database:** Turso (libSQL remote). Produksi membaca database yang **sama** dengan lokal —
  tidak ada langkah migrasi data.
- **Perintah build:** `npm run build` (default Vercel, tidak perlu diubah).

---

## 1. Audit rahasia (hasil 28 September 2026)

Tidak ada kredensial yang ter-hardcode. Rinciannya:

| Pemeriksaan | Hasil |
|---|---|
| Nilai `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `NEXTAUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` muncul di berkas lain | **0 berkas** untuk kelimanya |
| Pola `libsql://` / `turso.io` di kode | Hanya di `lib/db.ts` (validasi awalan URL + pesan galat) dan `PANDUAN-VIBECODE-FREEBUFF.md` (contoh `<nama-db>-<org>.turso.io`) — bukan kredensial |
| Penugasan `TURSO_*` / `NEXTAUTH_SECRET` / `ADMIN_PASSWORD` dengan literal | Tidak ada |
| Blob JWT/base64 mencurigakan (`eyJ…`) | Tidak ada |
| Isi `files.zip` | Hanya 3 dokumen (AGENT-BRIEF, PRD, TECH-SPEC) |
| `.gitignore` | Sudah menutup `.env.local` dan `.env*.local` |

Kredensial dibaca hanya lewat `process.env`: `lib/db.ts` (Turso) dan `lib/auth.ts` (admin).

### Cara memeriksa ulang (aman — nilai rahasia tidak dicetak)

```bash
set -a; . ./.env.local; set +a
for nama in TURSO_DATABASE_URL TURSO_AUTH_TOKEN NEXTAUTH_SECRET ADMIN_EMAIL ADMIN_PASSWORD; do
  nilai="${!nama}"
  [ -z "$nilai" ] && { printf '%-20s → (tidak terbaca)\n' "$nama"; continue; }
  berkas=$(grep -rlF --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git \
    --exclude=.env.local -- "$nilai" . 2>/dev/null | wc -l)
  printf '%-20s → panjang %3s, muncul di %s berkas lain\n' "$nama" "${#nilai}" "$berkas"
done
```

Yang diharapkan: kolom "muncul di N berkas lain" semuanya `0`.

```bash
# pola berbahaya lain (tidak butuh nilai rahasia)
grep -rn --exclude-dir=node_modules --exclude-dir=.next --exclude=.env.local \
  -E 'libsql://|turso\.io|eyJ[A-Za-z0-9_-]{20,}' .
```

---

## 2. Prasyarat

1. **Ganti sandi admin.** Buka `.env.local`, ubah baris `ADMIN_PASSWORD` jadi sandi pilihan sendiri.
   (Nilai yang terpasang sekarang adalah sandi acak yang dibuatkan saat Fase 5.)
2. **Build hijau** di lokal: `npm run build` (atau `npm run typecheck` minimal).
3. **Skema database sudah ada.** `npm run db:init` hanya perlu dijalankan sekali saat setup awal —
   Turso adalah database remote, jadi tidak diulang untuk deploy.
4. **Repo Git + remote.** Vercel mengimpor dari repo, jadi langkah ini wajib lebih dulu.

```bash
git init
git add -A
git status --short          # pastikan .env.local TIDAK ada di daftar ini
git commit -m "e-Portofolio PPL PPG 2026: Topik 3, UTS, UAS, dan admin panel"
git branch -M main
git remote add origin https://github.com/<akun>/<repo>.git
git push -u origin main
```

---

## 3. Environment variable untuk dashboard Vercel

Nilainya disalin dari `.env.local`.

| Nama | Contoh / isi | Scope di Vercel |
|---|---|---|
| `TURSO_DATABASE_URL` | `libsql://<nama-db>-<org>.turso.io` | Production, Preview, Development |
| `TURSO_AUTH_TOKEN` | token dari dashboard Turso | Production, Preview, Development |
| `NEXTAUTH_SECRET` | string acak penanda-tangan sesi | Production, Preview, Development |
| `ADMIN_EMAIL` | email login admin | Production, Preview, Development |
| `ADMIN_PASSWORD` | sandi login admin | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://<nama-project>.vercel.app` | **HANYA Production** |

⚠️ `NEXTAUTH_URL` sengaja hanya untuk Production: kalau diisi juga di Preview, tombol login pada
deployment preview akan melompat ke domain produksi. Perbarui nilainya kalau nanti memasang domain
sendiri.

---

## 4. Langkah di dashboard Vercel

1. **Add New → Project**, lalu import repo GitHub di atas.
2. Biarkan **Framework Preset: Next.js**, Root Directory di root, Build Command & Output default.
3. Buka **Environment Variables** dan masukkan enam baris di tabel bagian 3 (perhatikan scope
   `NEXTAUTH_URL`).
4. Klik **Deploy** dan tunggu build selesai.

Tidak ada konfigurasi lain yang dibutuhkan — `next.config.ts` hanya mengaktifkan
`reactStrictMode`. Video & dokumen tetap berupa tautan; foto dokumentasi dan foto hasil kerja siswa
adalah berkas statis di `public/` yang ikut ter-deploy bersama repo (bukan unggahan lewat aplikasi).

---

## 5. Setelah deploy — lima cek cepat

1. Buka `https://<domain>/masuk`, login dengan `ADMIN_EMAIL` + `ADMIN_PASSWORD`.
2. `/admin` harus terbuka; ulangi di layar HP.
3. Buka `/` — data siklus/profil dari Turso harus tampil.
4. Sunting satu hal kecil (mis. catatan reflektif siklus 1) lalu cek hasilnya di halaman publik.
5. Bagikan tautannya — `/admin` sudah terlindungi login dan `/admin`, `/masuk` sudah `noindex`.

### Kalau ada masalah

| Gejala | Penyebab yang paling sering |
|---|---|
| Tombol login tidak bereaksi / kembali ke `/masuk` | `NEXTAUTH_URL` tidak sama persis dengan URL deploy (termasuk `https://`), atau `NEXTAUTH_SECRET` belum diisi |
| Halaman error `Environment variable TURSO_DATABASE_URL belum diisi` | Env var lupa diisi untuk environment Production, atau deploy belum dijalankan ulang setelah env ditambah |
| `TURSO_DATABASE_URL harus diawali "libsql://"` | Yang tersalin adalah nama database, bukan Database URL dari dashboard Turso |
| Video/dokumen tidak muncul di dalam bingkai | Berkas Drive belum dibagikan "Anyone with the link → Viewer" |

Setiap `git push` ke branch produksi akan memicu deploy ulang otomatis.

---

## 6. Menambah foto hasil kerja siswa (UTS/UAS)

Foto **Contoh Hasil Kerja Siswa** bukan diunggah lewat admin dan bukan tautan Drive: berkasnya ikut
repo, lalu halaman menampilkannya sebagai carousel. Aturan nama berkas lengkap ada di
`PANDUAN-FOTO-DOKUMENTASI.md` bagian 2 (subbagian foto hasil kerja siswa); langkah deploy-nya:

1. **Siapkan berkasnya.** Beri nama `1.jpg`, `2.jpg`, `3.jpg`, … — nomor = urutan tampil, harus rapat,
   ekstensi huruf kecil (`.jpg`/`.jpeg`/`.png`/`.webp`), maksimal 20 foto. Usahakan sisi panjang ≤ 1600 px
   dan ± 300 KB per foto supaya repo & situs tetap ringan.
2. **Pastikan folder tujuannya ada** (dari root repo):
   ```bash
   npm run dokumentasi:folder
   ```

   | Modul | Folder foto | Kolom admin |
   |---|---|---|
   | UTS (siklus 1) | `public/dokumentasi/hasil-kerja/siklus-1/` | `/admin/siklus/1` |
   | UAS (siklus 2 yang ditandai produk) | `public/dokumentasi/hasil-kerja/siklus-2/` | `/admin/siklus/2` |

   Salin fotonya ke folder itu. Nomor folder harus sama dengan nomor siklus yang ditampilkan — untuk
   UAS, siklus yang dicentang **Jadikan produk UAS**.
3. **Isi kolom di admin.** Buka `/admin/siklus/<nomor>`, isi **Contoh Hasil Kerja Siswa** dengan
   jalur foldernya saja, mis. `/dokumentasi/hasil-kerja/siklus-1` — bukan tautan per foto. Simpan.
4. **Naikkan ke repo.**
   ```bash
   git status --short          # pastikan .env.local TIDAK ada di daftar ini
   git add public/dokumentasi/hasil-kerja
   git commit -m "Tambah foto hasil kerja siswa siklus 1"
   git push
   ```
   Lewat GitHub pun boleh: buka folder di repo → **Add file → Upload files** → beri nama `1.jpg`, dst
   → commit. Vercel otomatis memulai deploy ulang.
5. **Cek hasilnya.** Tunggu status **Ready** di dashboard Vercel, lalu buka
   `https://<domain>/uts/hasil-kerja-siswa` (atau `/uas/hasil-kerja-siswa`). Foto tampil sebagai
   carousel dengan tombol ←/→ dan penghitung `1 / N`. Kalau foto lama masih tampil, hard refresh
   (`Ctrl` + `F5`).

> Menambah foto belakangan cukup menaruh berkas bernomor lanjutan (`4.jpg`, `5.jpg`, …) lalu commit
> + push — kolom admin tidak perlu diubah. Mengganti urutan tampil = menukar nomor berkasnya.

| Gejala | Penyebab yang paling sering |
|---|---|
| Muncul *"Belum ada foto di …"* | Jalur di admin beda dengan nama folder (typo, spasi, huruf besar/kecil — Vercel/Linux membedakan), atau foto belum ter-push |
| Hanya sebagian foto tampil | Nomor berkasnya bolong (mis. `1.jpg`, `2.jpg`, lalu `4.jpg`) |
| Foto tidak muncul sama sekali | Kolom admin masih berisi tautan Drive, atau deployment belum **Ready** |
| Foto UAS tidak berganti | Folder/kolom masih milik siklus lama — isi ulang di siklus yang kini ditandai produk UAS |

---

## 7. Catatan & jebakan

- **Jangan menjalankan `next dev` dan `next start` bersamaan** di repo ini. Keduanya memakai folder
  `.next` yang sama dan build produksi rusak dengan pesan
  `Could not find the module "app/template.tsx#default" in the React Client Manifest`.
  Urutannya: hentikan dev server → `rm -rf .next` → `npm run build` → `next start`.
- **Batas 12 serverless function** yang disebut `TECH-SPEC.md` bagian 7: dokumentasi Vercel yang
  berlaku sejak Fluid compute (dicek 28 September 2026) **tidak lagi mencantumkan batas itu** untuk
  Hobby — batasnya kini soal invocation, CPU, dan memori. Deploy ini punya **2 route handler**
  (`/api/admin/[resource]` untuk empat entitas, dan `/api/auth/[...nextauth]`) plus 14 route halaman
  dinamis. Verifikasi ulang sebelum menambah fungsi baru.
- **`npm audit`**: ada 2 peringatan (1 moderate, 1 high) pada **postcss bawaan Next 15**, bukan dari
  `next-auth`. Perbaikannya menuntut lompat ke Next 16 (breaking), jadi jangan pakai
  `npm audit fix --force` tanpa keputusan sadar.
- **Ganti sandi admin kapan saja**: ubah `ADMIN_PASSWORD` di Environment Variables Vercel lalu
  deploy ulang. Catatan penting: mengganti sandi **tidak** membatalkan sesi login yang sudah aktif —
  token sesi (JWT) hanya ditandatangani oleh `NEXTAUTH_SECRET` dan berlaku sampai kedaluwarsa
  (default 30 hari). Kalau ingin memaksa semua perangkat keluar, ganti juga `NEXTAUTH_SECRET`.
- **Kebersihan repo (opsional)**: `auth` dan `auth-wal` adalah berkas 0 byte sisa percobaan awal, dan
  `files.zip` adalah salinan usang dokumen 27 September. Keduanya boleh dihapus.
