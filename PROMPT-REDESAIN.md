# PROMPT REDESAIN — ePortofolio PPG 2026

> Prompt ini dirancang untuk sesi agent baru. Isinya utuh dan mandiri: konteks
> proyek, keputusan desain yang SUDAH dikonfirmasi pemilik, lalu langkah kerja
> sampai verifikasi. Jangan mengajukan lagi pertanyaan keputusan desain —
> semuanya sudah final dan tercatat di bawah.

# Tugas: Redesain penuh seluruh frontend mengikuti DESIGN.md + screenshot sumber

## Konteks proyek

e-Portofolio PPG 2026 — situs Next.js 15 (App Router) + TypeScript + Tailwind v4 +
Framer Motion + NextAuth + SQLite (@libsql/client). Baca dulu `AGENT-BRIEF.md`
(aturan keras), lalu `DESIGN.md` versi "neuform-staff-featured-2026-05-22" —
itu sumber kebenaran TOKEN (warna, tipografi, spacing, radius, motion, guardrails).
`PRD.md`/`TECH-SPEC.md` hanya untuk context fitur.

**Acuan komposisi:** screenshot `space-visual-ideation-workspace.html` (lampiran
percakapan) — sesuai instruksi DESIGN.md: *"Use the attached HTML reference as the
source of truth. Preserve the visible hierarchy, first-screen composition, section
rhythm, density, and interaction tone."* File HTML-nya TIDAK ada di repo, jadi
pegang deskripsi ini sebagai model visual:

- Kanvas **near-black dengan pola grid halus** (garis ~44px, sedikit lebih terang
  dari latar).
- **Nav bar full-width bergaya strip toolbar:** logo di kiri, item label mono
  UPPERCASE berikon kecil, dipisah garis vertikal, item **aktif = blok solid biru
  dengan teks gelap**; di ujung kanan tautan teks + tombol aksi biru.
- **Hero:** eyebrow "↓ VISUAL IDEATION WORKSPACE" + garis bawah biru;
  judul display raksasa "SPACE" (Chewy) putih di dalam **bingkai seleksi biru
  dengan handle kotak** (seperti seleksi tool desain); subjudul handwritten
  (Patrick Hand) putih dengan underline pada kata kunci; **dua CTA**: tombol
  solid biru + tombol outline terang.
- **Sticky note pastel** berselang-seling di sekitar hero — mint "Live syncing",
  peach "Quick templates", biru muda "Co-creation ready", kuning "Infinite area",
  pink "Express ideas visually" — masing-masing punya **strip tape** di atas,
  ikon stroke, teks gelap.
- **Toolbar mengambang** di kiri berisi ikon tool (item aktif blok biru),
  **kursor biru & ungu**, serta **panah putus-putus** sebagai aksen.

Sistem visual saat ini adalah desain LAMA (palet teal #2dd4bf/#14b8a6, font Inter,
kartu radius 8px, aurora teal, nav pill 3-zona). Tugasnya: mengganti SELURUH
tampilan dengan sistem baru — TANPA mengubah logika, data, route, atau perilaku
aplikasi.

## Keputusan desain FINAL (sudah dikonfirmasi pemilik — jangan ditanya lagi)

1. **Mode gelap, mengikuti sumber.** Guardrail DESIGN.md: *"Do not swap the color
   mode unless the source clearly supports it"* — sumber jelas kanvas gelap, jadi
   **default tetap `.dark`**. Keputusan lama "mode terang + kartu gelap" DICABUT.
   - **Mode gelap (resmi), nilai dari screenshot + token DESIGN.md:**
     background `#0A0A0A` (kanvas near-black), surface `#27272A` (panel, toolbar,
     nav — token DESIGN.md), border `#27272A` (garis grid + pemisah), foreground
     `#F1F5F9`, muted `#A1A1AA`, primary `#13A8FF`, accent `#AA71FF`.
   - **Mode terang (turunan kita, kontras dibalik — bukan milik DESIGN.md):**
     background `#F1F5F9`, surface `#FFFFFF`, surface-muted `#ECEEF1`,
     border `#D4D4D8`, foreground `#111827`, muted `#4B5563`, primary/accent
     tetap. Nilai turunan boleh digeser sedikit asal peran warna tetap terpisah
     dan lolos WCAG AA.
2. **Motif berlaku DI SELURUH SITUS** (15 rute publik + admin), menyesuaikan
   fungsi tiap halaman — bukan hanya Beranda.
3. **Token pastel BARU untuk sticky note** (di luar daftar warna DESIGN.md, sudah
   disetujui): mint `#C7F3DF`, peach `#FFD9C4`, kuning `#FFF0A6`, pink `#FFC9E6`,
   biru muda `#CFEBFF`. Teks di atasnya **WAJIB `#111827`** (lolos AA). Hanya untuk
   sticky note/aksen — JANGAN menggantikan peran primary/accent.
4. **H1 tetap UPPERCASE**: display-lg 64px / line-height 1.04 / weight 500 /
   letter-spacing 0; H2/H3 tetap sentence case. Judul admin tetap 36–48px.
5. **Tombol:** varian utama = solid primary `#13A8FF` + **teks gelap `#111827`**
   (6,8:1 — teks putih hanya 2,6:1, gagal); varian sekunder = outline terang
   transparan; **radius = control 12px** (tombol di sumber rounded-rectangle,
   BUKAN pill). Pill 9999px tetap untuk badge/lencana.
6. **Toggle tema tetap ada** (ThemeToggle, localStorage key `tema`, skrip
   anti-FOUC, transisi `.tema-beralih`): default gelap, mode terang = turunan.

## Peta motif screenshot → situs

- **Latar kanvas + grid** → rombak `components/AuroraLatar.tsx` + keyframes di
  `globals.css`: near-black + pola grid halus via CSS (gradient), warna memakai
  token border/putih ~5% opasitas, opsional glow samar primary/accent di belakang
  konten. Gantikan berkas cahaya & bintang teal. Grid wajib low-contrast,
  `aria-hidden`, tidak menambah overflow.
- **Nav bar strip** → rombak `components/SiteHeader.tsx`: pemisah vertikal
  antar item, label JetBrains Mono uppercase + ikon, aktif = blok solid primary
  berteks gelap (bukan dot pill), kanan = tautan + tombol aksi. `NAV_UTAMA`,
  perilaku `aria-current`, dan collapse mobile dipertahankan. `components/NavAdmin.tsx`
  mengikuti bahasa yang sama (lebih ringkas).
- **Bingkai seleksi** → komponen dekoratif baru (mis. `components/BingkaiSeleksi.tsx`):
  border primary 1–2px + handle kotak di sudut/tengah sisi, mengelilingi H1 hero.
  Wajib `aria-hidden` + `pointer-events-none`. Versi ringkas (tanpa handle penuh)
  boleh dipakai di H1 halaman detail.
- **Sticky note bertape** → komponen baru `components/StickyNote.tsx` (background
  pastel token, teks `#111827`, radius **4px** (card token), strip "tape"
  semi-transparan di atas, ikon stroke). Dipakai untuk: kartu tagihan di Beranda
  (`ModuleCard`), `KartuKategori` (6 kategori Topik 3), `KartuSiklus` (UTS/UAS),
  dan kartu/ringkasan lain yang sifatnya daftar. Rotasi kecil ±1–2° boleh untuk
  kesan tempelan; hover = lift halus. Jangan sampai merusak grid atau responsif.
- **Toolbar kiri mengambang** → elemen dekoratif desktop-only di hero (`aria-hidden`,
  sembunyikan < lg). Halaman non-hero tidak wajib memakainya.
- **Kursor & panah** → aksen kursor primary (#13A8FF) & accent (#AA71FF) + panah
  putus-putus melengkung di sekitar hero. Dekoratif, `aria-hidden`, tidak boleh
  menutupi konten atau tap target.
- **Eyebrow "↓ LABEL + garis bawah biru"** → rombak `components/Lencana.tsx` /
  gaya judul section: label mono uppercase + panah/underline coretan primary.
- **Footer** (`app/layout.tsx`) → bar gelap full-width dengan pemisah border,
  teks mono uppercase (sudah ada — sesuaikan warna ke token baru).

## Tahap 1 — Token & tipografi (fundamental, kerjakan pertama)

`app/globals.css`:
- Tulis ulang `:root` (mode terang, keputusan #1) dan `.dark` (mode resmi,
  keputusan #1). Pertahankan peta `@theme inline` sehingga kelas token
  (`bg-background`, `bg-surface`, `bg-surface-muted`, `border-border`,
  `text-foreground`, `text-muted`, `bg-primary`, `text-accent`, success/warning,
  `rounded`/radius, shadow) tetap berfungsi di dua mode. **Semua warna di
  komponen WAJIB lewat kelas token — dilarang hardcode warna Tailwind/default.**
- Tambahkan token pastel (keputusan #3) ke `@theme` supaya bisa dipakai sebagai
  `bg-note-mint`, dll. (nama terserah, asal konsisten).
- Radius sesuai token `rounded` DESIGN.md: **card = 4px** (saat ini `rounded-lg`
  8px di banyak komponen → seragamkan), **control = 12px** (input, tombol),
  **pill = 9999px** (badge/lencana saja).
- Spacing: base 8px, gap 16px, card-padding 24px, section-padding 80px.
- Bayangan `shadow-card`/`shadow-lift` mengikuti "HTML-matched shadow depth"
  DESIGN.md untuk dua mode.

`app/layout.tsx` + `@theme inline`:
- Font via next/font/google: **Chewy** → variabel display (judul, gaya "SPACE"),
  **Patrick Hand** → variabel body (wajah utama teks + subjudul hero),
  pertahankan **JetBrains Mono** untuk label/badge/nav. Inter harus hilang
  sepenuhnya. Sesuaikan `--font-sans`/`--font-display`/`--font-mono` dan
  `body { font-family }`.
- Judul publik ikut `display-lg`: 64px / 1.04 / 500 / letter-spacing 0.
- Label/badge/nav tetap mono 12px / 600 / 1.2.
- Body ikut `body-md`: Patrick Hand 16px / 1.6. Pastikan Patrick Hand terbaca di
  teks panjang (narasi analisis, "Tentang Saya") — kalau ada masalah keterbacaan,
  laporkan ke pemilik sebelum mengganti font.

## Tahap 2 — Komponen bersama (ubah di sini, bukan per halaman)

- `components/Tombol.tsx` — varian `utama` = primary + teks gelap, `sekunder` =
  outline terang, `garis` = berbatas; radius control 12px (keputusan #5).
  `KELAS_DASAR_TOMBOL`/`GAYA_TOMBOL` tetap satu-satunya sumber gaya tombol.
- `components/gayaForm.ts` — `KELAS_INPUT_FORM`/`KELAS_LABEL_FORM` ikut radius
  12px + warna token (input di atas surface `#27272A`, kontras benar). Semua form
  admin otomatis ikut; jangan mengedit gaya per form.
- `components/Panel.tsx`, `ModuleCard.tsx`, `KartuKategori.tsx`, `KartuSiklus.tsx`,
  `KartuFoto.tsx`, `ModulPlaceholder.tsx`, `BelumDiisi.tsx`, `TautanArtefak.tsx`,
  `PenampilEmbed.tsx` — daftar kartu memakai sticky note (pastel + tape + radius
  4px) atau panel surface bila memang butuh tampilan netral; teks gelap di atas
  pastel, teks terang di atas surface; hover lift dipertahankan.
- `components/Lencana.tsx`, `StatusBadge.tsx` — label mono + aksen underline/eyebrow
  gaya sumber; StatusBadge tetap terbaca (boleh latar pastel/gelap, teks lolos AA).
- `components/SiteHeader.tsx`, `NavAdmin.tsx` — lihat peta motif (nav bar strip).
- `components/AuroraLatar.tsx` — lihat peta motif (kanvas grid).
- `components/ThemeToggle.tsx`, `FotoProfil.tsx`, `KartuFoto.tsx`, `FadeIn.tsx`,
  semua `Form*.tsx`, footer — ikut token baru; ThemeToggle tetap berfungsi penuh.
- Komponen motif baru (StickyNote, BingkaiSeleksi, toolbar/kursor bila dipisah)
  boleh ditambah di `components/` — jangan menumpuk gaya bespoke per halaman.

## Tahap 3 — Seluruh halaman (15 rute)

- **Landing** (Beranda, `/topik-3`, `/uts`, `/uas`): motif penuh — grid, nav bar
  strip, hero dengan eyebrow + H1 dalam bingkai seleksi + subjudul Patrick Hand
  + dua CTA, sticky note untuk kartu daftar/tagihan, toolbar + kursor + panah
  sebagai aksen. Komposisi first-screen pertahankan hierarki sumber (focal object
  = judul berbingkai seleksi).
- **Detail & lainnya** (`/topik-3/[kategori]`, `/uas/siklus/[nomor]`, `/profil`,
  `/masuk`): grid + nav bar + token; H1 memakai versi ringkas bingkai seleksi
  (boleh tanpa handle penuh); kartu daftar memakai sticky note.
- **Admin** (`/admin/*`): motif minimal — grid samar + nav bar + token + radius
  seragam; form/panel tetap surface netral (jangan pastel di atas input supaya
  kontras terjaga); judul admin 36–48px tetap (keputusan lama yang disengaja).
- Pastikan **tidak ada sisa gaya lama**: teal, Inter, radius 8px, warna
  hardcoded, dot pill nav aktif, aurora bintang.

## Tahap 4 — Motion

Pertahankan cue DESIGN.md: masked reveals, staggered entrance (sticky notes masuk
berurutan), hover lift, scroll-triggered (`FadeIn`, `app/template.tsx`), ambient
sangat lambat (grid glow — hanya transform/opacity). Easing halus dan restrained;
semua animasi wajib mati saat `prefers-reduced-motion: reduce` (pola
`motion-safe:`/media query sudah dipakai). Jangan tambah lapisan animasi ketiga.

## Tahap 5 — Verifikasi (wajib)

1. `npm run typecheck` harus 0 error.
2. Build produksi: JANGAN menjalankan `next dev` dan `next start` bersamaan.
   Hentikan dev server → `rm -rf .next` → `npm run build`.
3. Audit visual: `node --env-file=.env.local scripts/audit-tampilan.mjs`
   (Edge headless + server produksi — lihat header file). Audit mencoba dua mode
   tema — target: **0 kontras gagal, 0 overflow horizontal**, tap target ≥24px,
   radius/padding sesuai token. Perbaiki semua temuan sampai hijau. Khusus
   perhatikan: teks di atas sticky note pastel, teks tombol primary, label nav.
4. Cek manual: toggle tema bekerja tanpa FOUC, default buka = mode gelap, form
   admin tetap submit, navigasi aktif benar di semua rute, motif dekoratif tidak
   menutupi konten di mobile.
5. Perbarui checklist "Status saat ini" di `AGENT-BRIEF.md`.

## Larangan

- Jangan ubah: `lib/`, route API, skema/queries DB, NextAuth, logika form/CRUD,
  isi teks konten, URL/route.
- Jangan hardcode warna/font/px di komponen — semua lewat token.
- Jangan menambah dependency baru (font lewat next/font sudah cukup).
- Elemen dekoratif wajib `aria-hidden` dan tidak boleh menghalangi interaksi
  atau tap target.
- Jangan jalankan `next dev` dan `next start` bersamaan (folder `.next` bentrok).
- Keputusan visual di luar DESIGN.md + 6 keputusan final di atas → tanya pemilik
  dulu, jangan memilih sendiri.
