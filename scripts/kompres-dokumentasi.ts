/**
 * Kompres & resize foto dokumentasi di `public/dokumentasi/` — dijalankan manual
 * kalau ada foto baru yang berat (`npx tsx scripts/kompres-dokumentasi.ts`).
 *
 * Aturan:
 * - Orientasi EXIF diterapkan lalu metadata dibuang (privasi + ukuran).
 * - Lebar maksimal LEBAR_MAKS px (foto lebih kecil tidak diperbesar).
 * - Disimpan ulang sebagai JPEG kualitas KUALITAS.
 * - Nama berkas dinormalkan ke huruf kecil (`.JPG` → `.jpg`): server produksi
 *   (Linux/Vercel) membedakan huruf besar-kecil, sedangkan pencarian foto di
 *   lib/dokumentasi.ts memakai ekstensi huruf kecil — jadi `.JPG` tidak akan
 *   pernah ditemukan di produksi.
 *
 * Beras ditimpa langsung (keputusan pemilik); berjalan idempoten, foto yang
 * sudah ringan tidak akan menyusut kualitasnya secara drastis karena ukurannya
 * sudah di bawah batas dan dikompres ulang sekali saja bila dijalankan ulang
 * sebelum kompresi.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

// Folder yang diproses — default `public/dokumentasi`, bisa dioverride argumen
// pertama (dipakai untuk uji coba aman di folder sementara).
 const AKAR = path.resolve(process.cwd(), process.argv[2] ?? 'public/dokumentasi');
const LEBAR_MAKS = 1600;
const KUALITAS = 80;

const EKSTENSI_GAMBAR = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function formatUkuran(bait: number): string {
  return bait >= 1024 * 1024 ? `${(bait / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(bait / 1024)} KB`;
}

async function cariGambar(dir: string): Promise<string[]> {
  const entri = await fs.readdir(dir, { withFileTypes: true });
  const hasil: string[] = [];
  for (const entriSatu of entri) {
    const jalur = path.join(dir, entriSatu.name);
    if (entriSatu.isDirectory()) hasil.push(...(await cariGambar(jalur)));
    else if (EKSTENSI_GAMBAR.has(path.extname(entriSatu.name).toLowerCase())) hasil.push(jalur);
  }
  return hasil;
}

async function kompres(jalur: string): Promise<{ sebelum: number; sesudah: number; namaBaru: string }> {
  const sebelum = (await fs.stat(jalur)).size;
  const dir = path.dirname(jalur);

  // Nama berkas hasil: huruf kecil + ekstensi .jpg.
  const namaBaru = path.join(dir, `${path.basename(jalur, path.extname(jalur)).toLowerCase()}.jpg`);

  // Berkas sementara SELALU beda nama dengan aslinya, supaya tidak pernah
  // menimpa berkas sumber saat proses encode berjalan.
  const sementara = path.join(dir, `.kompres-${path.basename(namaBaru)}.tmp`);

  try {
    await sharp(jalur)
      .rotate() // ikuti orientasi EXIF sebelum metadata dibuang
      .resize({ width: LEBAR_MAKS, withoutEnlargement: true })
      .jpeg({ quality: KUALITAS, progressive: true, mozjpeg: true })
      .toFile(sementara);
  } catch (err) {
    await fs.rm(sementara, { force: true });
    throw err;
  }

  const sesudah = (await fs.stat(sementara)).size;

  // Windows tidak membedakan huruf besar-kecil, jadi `1.JPG` dan `1.jpg`
  // adalah berkas YANG SAMA. Kalau dianggap berbeda, file sumber dulu baru
  // hasilnya dipindah — kalau salah urut, berkas bisa hilang.
  const namaSamaDenganAsli = jalur.toLowerCase() === namaBaru.toLowerCase();
  if (!namaSamaDenganAsli) {
    await fs.rm(jalur, { force: true });
  }
  await fs.rename(sementara, namaBaru);

  return { sebelum, sesudah, namaBaru };
}

async function main(): Promise<void> {
  const daftar = await cariGambar(AKAR);
  let totalSebelum = 0;
  let totalSesudah = 0;
  let diubah = 0;

  for (const jalur of daftar.sort()) {
    const { sebelum, sesudah } = await kompres(jalur);
    totalSebelum += sebelum;
    totalSesudah += sesudah;
    diubah += 1;
    const tanda = sesudah < sebelum ? '↓' : '=';
    console.log(
      `${tanda} ${path.relative(process.cwd(), jalur).replace(/\\/g, '/')}: ` +
        `${formatUkuran(sebelum)} → ${formatUkuran(sesudah)}`,
    );
  }

  console.log(
    `\n${diubah} berkas. Total ${formatUkuran(totalSebelum)} → ${formatUkuran(totalSesudah)} ` +
      `(${Math.round((1 - totalSesudah / totalSebelum) * 100)}% lebih ringan).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
