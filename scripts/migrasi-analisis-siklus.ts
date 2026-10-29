import path from 'node:path';
import { config } from 'dotenv';

config({ path: path.resolve(process.cwd(), '.env.local') });

/**
 * Migrasi tabel `analisis_siklus` — analisis per field artefak untuk UTS/UAS
 * (PRD.md bagian 4.4 & 4.5, TECH-SPEC.md bagian 3).
 *
 * Dijalankan SEKALI pada database yang sudah ada (`npm run db:migrasi-analisis-siklus`),
 * termasuk Turso. Karena ini tabel BARU (bukan kolom baru di tabel berisi data),
 * cukup `ensureSchema()` — `CREATE TABLE ... IF NOT EXISTS` di lib/schema.ts.
 * Tidak ada tabel/kolom yang di-drop dan tidak ada data yang ditimpa; aman diulang.
 */

async function main(): Promise<void> {
  const { db, ensureSchema } = await import('../lib/db');

  console.log('1. MEMBUAT tabel baru (analisis_siklus, idempoten) ...');
  await ensureSchema();

  const info = await db.execute('PRAGMA table_info(analisis_siklus)');
  if (info.rows.length === 0) {
    throw new Error('Tabel analisis_siklus tidak terbentuk — periksa lib/schema.ts.');
  }

  console.log('\n2. Struktur tabel analisis_siklus:');
  console.log(
    '  ' + info.rows.map((kolom) => `${kolom.name}${kolom.notnull ? '*' : ''}`).join(', '),
  );

  const jumlah = await db.execute('SELECT COUNT(*) AS n FROM analisis_siklus');
  console.log(`\n3. Jumlah baris saat ini: ${jumlah.rows[0]?.n ?? 0} (kosong = wajar, belum diisi).`);

  await db.close();
  console.log('\nSelesai — tabel analisis_siklus siap, tidak ada data yang dihapus.');
}

main().catch((error: unknown) => {
  console.error('GAGAL migrasi analisis_siklus:', error instanceof Error ? error.message : error);
  process.exit(1);
});
