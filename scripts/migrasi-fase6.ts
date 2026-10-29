import path from 'node:path';
import { config } from 'dotenv';

config({ path: path.resolve(process.cwd(), '.env.local') });

/**
 * Migrasi Fase 6 — kriteria penilaian LMS baru (PRD.md bagian 10, TECH-SPEC.md
 * bagian 3 "Catatan migrasi"). Dijalankan SEKALI pada database yang sudah ada
 * (`npm run db:migrasi-fase6`), termasuk Turso.
 *
 * Yang dikerjakan:
 * 1. `ALTER TABLE siklus`  → kolom artefak baru + is_uas_pilihan.
 * 2. `ALTER TABLE profil`  → kontak & pengantar_eportofolio.
 * 3. `CREATE TABLE refleksi` (lewat ensureSchema, idempoten).
 * 4. `ALTER TABLE analisis_topik3` → 5 kolom analisis terstruktur (nullable).
 *    Kolom lama `narasi_analisis` SENGAJA TIDAK dihapus — isinya dipindahkan
 *    manual ke 5 kolom baru lebih dulu.
 *
 * Semua langkah idempoten: kolom yang sudah ada dilewati, jadi aman diulang.
 * Tidak ada tabel yang di-drop dan tidak ada data yang ditimpa.
 */

interface TambahanKolom {
  kolom: string;
  definisi: string;
}

const KOLOM_SIKLUS: readonly TambahanKolom[] = [
  { kolom: 'hasil_kerja_siswa_url', definisi: 'TEXT' },
  { kolom: 'hasil_kerja_siswa_deskripsi', definisi: 'TEXT' },
  { kolom: 'penilaian_gp_url', definisi: 'TEXT' },
  { kolom: 'penilaian_dpl_url', definisi: 'TEXT' },
  { kolom: 'is_uas_pilihan', definisi: 'INTEGER DEFAULT 0' },
];

const KOLOM_PROFIL: readonly TambahanKolom[] = [
  { kolom: 'kontak', definisi: 'TEXT' },
  { kolom: 'pengantar_eportofolio', definisi: 'TEXT' },
];

const KOLOM_ANALISIS: readonly TambahanKolom[] = [
  { kolom: 'konteks', definisi: 'TEXT' },
  { kolom: 'tujuan', definisi: 'TEXT' },
  { kolom: 'kelebihan', definisi: 'TEXT' },
  { kolom: 'kekurangan', definisi: 'TEXT' },
  { kolom: 'kajian_teori', definisi: 'TEXT' },
];

async function main(): Promise<void> {
  const { db, ensureSchema } = await import('../lib/db');

  await ensureSchema();

  /** Daftar nama kolom tabel, atau null kalau tabelnya belum ada. */
  async function namaKolom(table: string): Promise<Set<string> | null> {
    try {
      const info = await db.execute(`PRAGMA table_info(${table})`);
      if (info.rows.length === 0) return null;
      return new Set(info.rows.map((row) => String(row.name)));
    } catch {
      return null;
    }
  }

  /** Tambah kolom yang belum ada; lewati yang sudah ada (idempoten). */
  async function tambahKolom(table: string, tambahan: readonly TambahanKolom[]): Promise<void> {
    const ada = await namaKolom(table);
    if (!ada) {
      console.log(`   ! tabel ${table} tidak ditemukan — dilewati`);
      return;
    }

    for (const { kolom, definisi } of tambahan) {
      if (ada.has(kolom)) {
        console.log(`   = ${table}.${kolom} sudah ada (dilewati)`);
        continue;
      }
      await db.execute(`ALTER TABLE ${table} ADD COLUMN ${kolom} ${definisi}`);
      console.log(`   + ${table}.${kolom} ${definisi}`);
    }
  }

  console.log('1. Memastikan tabel baru (refleksi) dibuat ...');
  await ensureSchema();

  console.log('\n2. ALTER TABLE siklus:');
  await tambahKolom('siklus', KOLOM_SIKLUS);

  console.log('\n3. ALTER TABLE profil:');
  await tambahKolom('profil', KOLOM_PROFIL);

  console.log('\n4. ALTER TABLE analisis_topik3 (narasi_analisis TIDAK dihapus):');
  await tambahKolom('analisis_topik3', KOLOM_ANALISIS);

  // ---- Verifikasi struktur terbaru ----
  console.log('\n===== STRUKTUR TABEL TERBARU =====');
  const tabel = await db.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  );
  for (const row of tabel.rows) {
    const nama = String(row.name);
    const info = await db.execute(`PRAGMA table_info(${nama})`);
    const jumlah = await db.execute(`SELECT COUNT(*) AS n FROM ${nama}`);
    console.log(`\n[${nama}] ${jumlah.rows[0]?.n ?? '?'} baris`);
    console.log(
      '  ' +
        info.rows
          .map((kolom) => `${kolom.name}${kolom.notnull ? '*' : ''}`)
          .join(', '),
    );
  }

  // ---- Tampilkan narasi lama supaya bisa dipindahkan manual ----
  console.log('\n===== ISI narasi_analisis SAAT INI (untuk dipindah manual) =====');
  const narasi = await db.execute(
    'SELECT kategori, narasi_analisis FROM analisis_topik3 ORDER BY kategori',
  );
  for (const row of narasi.rows) {
    console.log(`\n----- kategori: ${row.kategori} -----`);
    console.log(row.narasi_analisis ? String(row.narasi_analisis) : '(kosong)');
  }

  // Konfirmasi kolom baru sudah kosong pada baris lama (belum dipindahkan).
  const terisi = await db.execute(
    `SELECT kategori,
            (konteks IS NOT NULL) AS c_konteks,
            (kajian_teori IS NOT NULL) AS c_teori
     FROM analisis_topik3 ORDER BY kategori`,
  );
  console.log('\n===== STATUS KOLOM BARU (masih kosong = wajar, migrasi belum pindah data) =====');
  for (const row of terisi.rows) {
    console.log(
      `  ${row.kategori}: konteks=${row.c_konteks ? 'terisi' : 'kosong'}, kajian_teori=${row.c_teori ? 'terisi' : 'kosong'}`,
    );
  }

  await db.close();
  console.log('\nSelesai — migrasi Fase 6 berhasil, tidak ada data yang dihapus.');
}

main().catch((error: unknown) => {
  console.error('GAGAL migrasi Fase 6:', error instanceof Error ? error.message : error);
  process.exit(1);
});
