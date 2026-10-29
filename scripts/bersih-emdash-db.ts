/**
 * Membersihkan em dash (—) dari teks di database supaya halaman publik
 * bebas em dash. Defaultnya DRY-RUN (hanya mencetak perbandingan);
 * tambahkan flag `--terapkan` untuk benar-benar menulis.
 *
 * Jalankan:
 *   npx tsx scripts/bersih-emdash-db.ts           # pratinjau
 *   npx tsx scripts/bersih-emdash-db.ts --terapkan
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@libsql/client';

const TERAPKAN = process.argv.includes('--terapkan');

/** Ganti setiap em dash dengan tanda baca yang mengalir natural. */function bersih(teks: string): string {
  return teks
    .replace(/\s*—\s*/g, ', ')      // "A — B", "A—B", "A —B" → "A, B"
    .replace(/ ,/g, ',')              // jaga-jaga: spasi sebelum koma
    .replace(/ {2,}/g, ' ')           // spasi ganda jadi tunggal
    .replace(/,\s*$/, '')            // koma menggantung di akhir dibuang
    .trim();
}

const TARGET: Record<string, string[]> = {
  siklus: ['judul_topik', 'media_deskripsi', 'hasil_kerja_siswa_deskripsi', 'catatan_reflektif'],
  terbimbing: ['judul_topik', 'media_deskripsi'],
  analisis_topik3: ['narasi_analisis', 'konteks', 'tujuan', 'kelebihan', 'kekurangan', 'kajian_teori'],
  analisis_siklus: ['konteks', 'tujuan', 'kelebihan', 'kekurangan', 'kajian_teori'],
  kegiatan_nonmengajar: ['nama_kegiatan', 'deskripsi'],
  profil: ['nama', 'program_studi', 'lptk', 'sekolah_ppl', 'mapel', 'kontak', 'pengantar_eportofolio', 'tentang_saya', 'filosofi_hidup', 'identitas_profesional'],
  refleksi: ['model_guru_dituju', 'filosofi_mengajar', 'refleksi_akhir', 'kekuatan', 'kelemahan', 'rencana_tindak_lanjut'],
};

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) throw new Error('TURSO_DATABASE_URL/TURSO_AUTH_TOKEN tidak ada di .env.local');
  const db = createClient({ url, authToken });

  let ubah = 0;
  for (const [tabel, kolom] of Object.entries(TARGET)) {
    const res = await db.execute(`SELECT id, ${kolom.join(', ')} FROM ${tabel}`);
    for (const row of res.rows) {
      for (const k of kolom) {
        const lama = row[k];
        if (typeof lama !== 'string' || !lama.includes('\u2014')) continue;
        const baru = bersih(lama);
        const i = lama.indexOf('\u2014');
        const cuplik = (s: string) => s.slice(Math.max(0, i - 70), i + 90).replace(/\s+/g, ' ');
        console.log(`\n${tabel}.${k} (id=${row.id})`);
        console.log(`  Lama: …${cuplik(lama)}…`);
        console.log(`  Baru: …${cuplik(baru)}…`);
        if (baru.includes('\u2014')) {
          console.log('  !! masih mengandung em dash, dilewati');
          continue;
        }
        if (TERAPKAN) {
          await db.execute({
            sql: `UPDATE ${tabel} SET ${k} = ? WHERE id = ?`,
            args: [baru, row.id],
          });
        }
        ubah++;
      }
    }
  }

  console.log(
    TERAPKAN
      ? `\nSelesai: ${ubah} sel diperbarui.`
      : `\nPratinjau: ${ubah} sel akan diperbarui. Jalankan dengan --terapkan untuk menyimpan.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
