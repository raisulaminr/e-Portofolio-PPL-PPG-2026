import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { config } from 'dotenv';

/**
 * Siapkan folder foto untuk semua dokumentasi yang memakai berkas statis:
 *
 *   npm run dokumentasi:folder
 *
 * 1. Kegiatan nonmengajar → `public/dokumentasi/<slug-nama-kegiatan>/`, jalur
 *    yang diisikan ke kolom "Tautan atau folder dokumentasi" di
 *    /admin/nonmengajar/<id>.
 * 2. Contoh hasil kerja siswa tiap siklus → `public/dokumentasi/hasil-kerja/siklus-<n>/`,
 *    jalur yang diisikan ke kolom "Contoh Hasil Kerja Siswa" di
 *    /admin/siklus/<nomor>.
 *
 * Slug kegiatan memakai `slugKegiatan`, dan jalur siklus memakai
 * `folderHasilKerjaSiklus` — sumber yang sama dengan yang dibaca halaman
 * publik, jadi nama folder dan isi kolom tidak pernah beda.
 *
 * Idempoten: folder dan berkas foto yang sudah ada tidak pernah ditimpa atau
 * dihapus. Folder kosong diberi `.gitkeep` supaya tetap ikut ter-commit
 * (Git tidak melacak folder kosong).
 *
 * Susunan lengkapnya ada di PANDUAN-FOTO-DOKUMENTASI.md.
 */

config({ path: path.resolve(process.cwd(), '.env.local') });

const POLA_FOTO = /^\d+\.(jpe?g|png|webp)$/i;

/** Buat folder (beserta `.gitkeep`) dan kembalikan jumlah foto yang sudah ada. */
function siapkanFolder(jalur: string): number {
  const folder = path.join(process.cwd(), 'public', ...jalur.split('/').filter(Boolean));
  mkdirSync(folder, { recursive: true });

  const penanda = path.join(folder, '.gitkeep');
  if (!existsSync(penanda)) writeFileSync(penanda, '');

  return readdirSync(folder).filter((nama) => POLA_FOTO.test(nama)).length;
}

function main(): Promise<void> {
  return (async () => {
    const { getKegiatanNonmengajarList, getSiklusList } = await import('../lib/queries');
    const { folderHasilKerjaSiklus, slugKegiatan } = await import('../lib/dokumentasi');

    const [daftar, daftarSiklus] = await Promise.all([
      getKegiatanNonmengajarList(),
      getSiklusList(),
    ]);

    if (daftar.length === 0) {
      console.log(
        'Belum ada kegiatan nonmengajar. Tambahkan dulu lewat /admin/nonmengajar, lalu jalankan lagi.\n',
      );
    } else {
      console.log(`Menyiapkan folder public/dokumentasi/ untuk ${daftar.length} kegiatan nonmengajar.\n`);

      for (const kegiatan of daftar) {
        const slug = slugKegiatan(kegiatan.nama_kegiatan, kegiatan.id);
        const jalur = `/dokumentasi/${slug}`;
        const jumlahFoto = siapkanFolder(jalur);
        const kolomSudahBenar = kegiatan.dokumentasi_url === jalur;

        console.log(`• ${kegiatan.nama_kegiatan} (id ${kegiatan.id})`);
        console.log(`  folder  : public${jalur}/`);
        console.log(
          `  isi     : ${jumlahFoto} foto terbaca (nama berkas harus 1.jpg, 2.jpg, … huruf kecil)`,
        );
        console.log(
          `  kolom   : ${jalur}${kolomSudahBenar ? '  (sudah diisi di admin)' : `  ← sekarang: ${kegiatan.dokumentasi_url ?? '(kosong)'}`}`,
        );
        console.log('');
      }
    }

    if (daftarSiklus.length === 0) {
      console.log(
        'Belum ada siklus UTS/UAS. Isi siklus dulu lewat /admin/siklus/1, lalu jalankan lagi.',
      );
    } else {
      console.log(`Menyiapkan folder foto contoh hasil kerja siswa untuk ${daftarSiklus.length} siklus.\n`);

      for (const siklus of daftarSiklus) {
        const jalur = folderHasilKerjaSiklus(siklus.nomor_siklus);
        const jumlahFoto = siapkanFolder(jalur);
        const kolomSudahBenar = siklus.hasil_kerja_siswa_url === jalur;
        const modul = siklus.nomor_siklus === 1 ? 'UTS' : 'UAS';

        console.log(`• Siklus ${siklus.nomor_siklus} — ${siklus.judul_topik} (${modul})`);
        console.log(`  folder  : public${jalur}/`);
        console.log(
          `  isi     : ${jumlahFoto} foto terbaca (nama berkas harus 1.jpg, 2.jpg, … huruf kecil)`,
        );
        console.log(
          `  kolom   : ${jalur}${kolomSudahBenar ? '  (sudah diisi di admin)' : `  ← sekarang: ${siklus.hasil_kerja_siswa_url ?? '(kosong)'}`}`,
        );
        console.log('');
      }
    }

    console.log(
      'Langkah berikutnya: taruh fotonya di folder di atas, isi kolomnya di admin\n' +
        '(/admin/nonmengajar/<id> atau /admin/siklus/<nomor>), lalu commit + push supaya\n' +
        'Vercel men-deploy ulang (detail: PANDUAN-FOTO-DOKUMENTASI.md).',
    );

    const { db } = await import('../lib/db');
    await db.close();
  })();
}

main().catch((error: unknown) => {
  console.error('GAGAL menyiapkan folder dokumentasi:', error instanceof Error ? error.message : error);
  process.exit(1);
});
