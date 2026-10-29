import { createClient, type Client } from '@libsql/client';
import { SCHEMA_SQL } from './schema';

/**
 * Koneksi database tunggal (singleton) ke Turso/libSQL.
 *
 * Aturan yang dipegang file ini (lihat TECH-SPEC.md bagian 7):
 * - Kredensial HANYA dibaca dari environment variable, tidak pernah di-hardcode.
 * - Tidak memakai file SQLite lokal — serverless Vercel tidak punya filesystem persisten.
 * - Client dibuat sekali dan diekspor, dipakai ulang oleh semua route handler/server component.
 *
 * Catatan: file ini TIDAK memuat .env.local sendiri. Next.js sudah memuatnya
 * otomatis; script di luar Next (mis. scripts/init-db.ts) yang perlu mengurus env.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Environment variable ${name} belum diisi. ` +
        `Isi di .env.local untuk lokal, atau di Environment Variables project Vercel saat deploy ` +
        `(lihat TECH-SPEC.md bagian 7).`,
    );
  }
  return value;
}

function createDbClient(): Client {
  const url = requireEnv('TURSO_DATABASE_URL');

  if (!url.startsWith('libsql://') && !url.startsWith('https://')) {
    throw new Error(
      'TURSO_DATABASE_URL harus diawali "libsql://" (atau "https://"). ' +
        'Pastikan yang disalin adalah Database URL dari dashboard Turso, bukan nama database.',
    );
  }

  return createClient({ url, authToken: requireEnv('TURSO_AUTH_TOKEN') });
}

// Simpan di globalThis supaya hot-reload Next.js dev tidak membuat koneksi baru terus-menerus.
const globalForDb = globalThis as typeof globalThis & { __ePortofolioDb?: Client };

export const db: Client = globalForDb.__ePortofolioDb ?? createDbClient();

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__ePortofolioDb = db;
}

let schemaReady: Promise<void> | null = null;

/**
 * Membuat seluruh tabel dari TECH-SPEC.md bagian 3 (idempoten, pakai IF NOT EXISTS).
 *
 * Sengaja TIDAK dipanggil di jalur request — jalankan sekali saja saat setup:
 * `npm run db:init` (scripts/init-db.ts). Promise-nya di-memoize supaya
 * pemanggilan berulang dalam satu proses tidak mengeksekusi DDL lagi.
 */
export function ensureSchema(): Promise<void> {
  if (schemaReady) return schemaReady;

  schemaReady = (async () => {
    for (const statement of SCHEMA_SQL) {
      await db.execute(statement);
    }
  })();

  // Kalau gagal, reset supaya percobaan berikutnya bisa mengulang (bukan menyimpan error selamanya).
  schemaReady.catch(() => {
    schemaReady = null;
  });

  return schemaReady;
}
