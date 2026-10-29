import path from 'node:path';
import { config } from 'dotenv';

/**
 * Script setup database — dijalankan SEKALI saat setup (`npm run db:init`),
 * bukan di setiap request (sesuai TECH-SPEC.md bagian 7 dan permintaan Fase 1).
 *
 * Langkahnya: muat .env.local → buat tabel dari lib/schema.ts → uji koneksi SELECT 1.
 */

config({ path: path.resolve(process.cwd(), '.env.local') });

async function main(): Promise<void> {
  // Import dinamis supaya .env.local sudah termuat sebelum lib/db.ts membaca process.env.
  const { db, ensureSchema } = await import('../lib/db');

  console.log('1. Menjalankan CREATE TABLE (lib/schema.ts, idempoten) ...');
  await ensureSchema();

  const tables = await db.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  );
  console.log('2. Tabel yang ada di database:', tables.rows.map((row) => String(row.name)).join(', '));

  const ping = await db.execute('SELECT 1 AS ok');
  console.log('3. Hasil query test "SELECT 1":', JSON.stringify(ping.rows[0]));

  await db.close();
  console.log('Selesai — koneksi ke Turso berhasil dan skema siap.');
}

main().catch((error: unknown) => {
  console.error('GAGAL menyiapkan database:', error instanceof Error ? error.message : error);
  process.exit(1);
});
