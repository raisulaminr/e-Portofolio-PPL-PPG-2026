import path from 'node:path';
import { config } from 'dotenv';

/**
 * Migrasi Topik 3 → entitas praktik mengajar terbimbing (`npm run db:migrasi-terbimbing`).
 *
 * Dijalankan SEKALI di database yang sudah ada (termasuk Turso), saat artefak
 * Topik 3 dipindahkan dari tabel `siklus` ke tabel `terbimbing`:
 *
 * 1. Hapus `analisis_topik3` lama (masih punya kolom `siklus_id` + FK ke siklus).
 *    Data analisis memang dikosongkan, jadi tidak ada yang perlu diselamatkan.
 * 2. Jalankan CREATE TABLE idempoten dari lib/schema.ts: membuat tabel
 *    `terbimbing` dan `analisis_topik3` versi baru (tanpa `siklus_id`).
 *
 * Tabel lain (`siklus`, `kegiatan_nonmengajar`, `profil`) tidak disentuh.
 */

config({ path: path.resolve(process.cwd(), '.env.local') });

async function main(): Promise<void> {
  const { db, ensureSchema } = await import('../lib/db');

  console.log('1. Menghapus tabel analisis_topik3 lama (kolom siklus_id) ...');
  await db.execute('DROP TABLE IF EXISTS analisis_topik3');

  console.log('2. Membuat ulang skema (terbimbing + analisis_topik3 versi baru) ...');
  await ensureSchema();

  const tables = await db.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  );
  console.log('3. Tabel yang ada sekarang:', tables.rows.map((row) => String(row.name)).join(', '));

  const kolomAnalisis = await db.execute('PRAGMA table_info(analisis_topik3)');
  console.log(
    '4. Kolom analisis_topik3:',
    kolomAnalisis.rows.map((row) => String(row.name)).join(', '),
  );

  await db.close();
  console.log('Selesai — Topik 3 sekarang memakai entitas praktik mengajar terbimbing.');
}

main().catch((error: unknown) => {
  console.error('GAGAL migrasi:', error instanceof Error ? error.message : error);
  process.exit(1);
});
