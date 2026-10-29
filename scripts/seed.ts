import path from 'node:path';
import { config } from 'dotenv';

/**
 * Seed data contoh untuk Fase 1 (MVP).
 *
 * Idempoten: pakai ON CONFLICT DO NOTHING supaya data yang sudah diedit lewat
 * admin panel TIDAK tertimpa kalau script ini dijalankan ulang.
 *
 * Siklus: hanya siklus nomor 1 (status 'lengkap') sebagai contoh — sesuai
 * permintaan Fase 1. Field URL/materi dibiarkan kosong dan diisi di Fase 3.
 *
 * Terbimbing: artefak contoh untuk praktik mengajar terbimbing (sumber Topik 3).
 * Tautannya sengaja berkas demo publik supaya embed langsung terlihat; ganti
 * dengan berkas asli Raisul lewat /admin/terbimbing.
 */

config({ path: path.resolve(process.cwd(), '.env.local') });

const SIKLUS_CONTOH = {
  nomorSiklus: 1,
  judulTopik: 'Pengenalan Algoritma dan Pemrograman Dasar',
  catatanReflektif:
    'Contoh data (dummy) untuk Fase 1: pada siklus ini peserta didik mulai memetakan langkah penyelesaian masalah menjadi urutan algoritma sederhana.',
};

/** Contoh artefak praktik mengajar terbimbing — PDF/gambar/video publik untuk demo embed. */
const TERBIMBING_CONTOH = {
  judulTopik: 'Pengenalan Algoritma dan Pemrograman Dasar',
  rppUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  materiUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
  mediaDeskripsi:
    'Contoh data: media visual yang dipakai saat menjelaskan urutan langkah algoritma di kelas terbimbing.',
  mediaUrl: 'https://www.gstatic.com/webp/gallery/1.webp',
  videoUrl: 'https://vimeo.com/76979871',
  instrumenPenilaianUrl: 'https://pdfobject.com/pdf/sample.pdf',
};

/**
 * Contoh narasi analisis keenam kategori Topik 3. Sengaja dibuka dengan
 * penanda "Contoh narasi" supaya jelas ini bahan awal, bukan tulisan final.
 * Paragraf dipisah \n — halaman publik memecahnya per baris baru.
 */
const NARASI_CONTOH: readonly { kategori: string; narasi: string }[] = [
  {
    kategori: 'perencanaan',
    narasi:
      'Contoh narasi, ganti dengan refleksi sendiri.\n' +
      'Pada RPP praktik terbimbing ini saya menetapkan tujuan yang menuntut peserta didik memetakan ' +
      'langkah penyelesaian masalah, bukan sekadar menghafal definisi algoritma. Saya memecah alur ' +
      'pembelajaran menjadi tiga bagian pendek: demonstrasi, latihan terbimbing, lalu latihan mandiri, ' +
      'supaya pemahaman bisa saya pantau sebelum berpindah bagian.\n' +
      'Yang saya sadari kemudian, bagian penutup terlalu singkat sehingga refleksi bersama hampir tidak ' +
      'terjadi. Pada perencanaan berikutnya saya akan menyediakan waktu khusus untuk menarik kesimpulan bersama.',
  },
  {
    kategori: 'materi',
    narasi:
      'Contoh narasi, ganti dengan refleksi sendiri.\n' +
      'Materi disusun dari dua sumber: buku teks dan contoh kasus sehari-hari di sekitar sekolah. Saya ' +
      'menampilkan dua contoh berbeda untuk konsep yang sama agar peserta didik melihat satu masalah bisa ' +
      'diselesaikan dengan lebih dari satu urutan langkah.\n' +
      'Cakupannya sudah sesuai Fase E, tetapi kedalaman pada bagian struktur perulangan masih dangkal. ' +
      'Baru sekitar separuh kelas yang tampak siap; sisanya butuh contoh tambahan yang lebih konkret.',
  },
  {
    kategori: 'media',
    narasi:
      'Contoh narasi, ganti dengan refleksi sendiri.\n' +
      'Media yang saya pakai adalah slide bergambar sederhana, bukan animasi rumit, karena fokus ' +
      'pembelajaran saat itu adalah urutan langkah. Diagram alur saya tampilkan satu langkah demi satu ' +
      'langkah supaya peserta didik bisa menebak langkah berikutnya sebelum jawabannya muncul.\n' +
      'Dampaknya terasa: peserta didik lebih berani menjawab. Kekurangannya, saya belum menyiapkan versi ' +
      'cetak sehingga peserta didik di baris belakang kesulitan membaca detail diagram di layar.',
  },
  {
    kategori: 'video',
    narasi:
      'Contoh narasi, ganti dengan refleksi sendiri.\n' +
      'Dari rekaman terbimbing ini saya melihat dua hal. Pertama, perpindahan dari penjelasan ke latihan ' +
      'berjalan tanpa kebisingan berarti, jadi pengelolaan kelas cukup terkendali. Kedua, pertanyaan saya ' +
      'masih didominasi pertanyaan tertutup yang jawabannya ya/tidak, sehingga peserta didik tidak terlatih ' +
      'menjelaskan alasan.\n' +
      'Perbaikan yang akan saya coba pada siklus berikutnya: menyiapkan tiga pertanyaan pemancing terbuka ' +
      'sebelum masuk kelas.',
  },
  {
    kategori: 'nonmengajar',
    narasi:
      'Contoh narasi, ganti dengan refleksi sendiri.\n' +
      'Kegiatan nonmengajar membuat saya melihat sekolah dari sisi berbeda: bukan sebagai ruang penyampaian ' +
      'materi, melainkan sebagai komunitas yang dirawat bersama. Mendampingi kegiatan rutin sekolah ' +
      'mengajarkan bahwa kehadiran dan konsistensi saya juga bagian dari pekerjaan guru.\n' +
      'Catatan untuk diri sendiri: saya perlu lebih rapi mendokumentasikan setiap kegiatan, karena bukti ' +
      'visual jauh lebih meyakinkan saat refleksi.',
  },
  {
    kategori: 'instrumen',
    narasi:
      'Contoh narasi, ganti dengan refleksi sendiri.\n' +
      'Instrumen penilaian saya rancang sebagai rubrik tiga tingkat yang menilai ketepatan urutan langkah ' +
      'dan kejelasan penjelasan peserta didik. Kerapian tampilan sengaja tidak dinilai karena fokus ' +
      'pembelajarannya adalah penalaran.\n' +
      'Setelah dipakai, rubrik ini cukup jelas bagi peserta didik, tetapi deskriptor tingkat menengah ' +
      'masih terlalu umum sehingga dua penilai bisa menafsirkannya berbeda. Saya akan memperjelas ' +
      'deskriptornya dengan contoh jawaban nyata.',
  },
];

const PROFIL_CONTOH = {
  nama: 'Raisul Amin R, S.Kom.',
  programStudi: 'Pendidikan Informatika',
  lptk: 'Universitas Islam Makassar',
  sekolahPpl: 'SMA Negeri 22 Makassar',
  mapel: 'Informatika & KKA',
  kelasFase: 'Kelas X / Fase E',
  tentangSaya:
    'Lulusan S.Kom tahun 2024 yang menempuh jalur PPG Calon Guru untuk menjadi guru Informatika. ' +
    'Sebelumnya aktif mendampingi kegiatan belajar di tingkat SMP, dan dari pengalaman sosial itu saya menemukan ' +
    'bahwa mengajar bukan sekadar menyampaikan materi, melainkan mendampingi peserta didik berpikir runtut.',
  filosofiHidup:
    'Saya memandang kelas sebagai ruang berlatih berpikir, bukan ruang menghafal. ' +
    'Informatika bagi saya adalah cara melatih nalar: memecah masalah, mencoba, lalu memperbaiki.',
  identitasProfesional: 'Informatics Teacher. Lifelong Learner. Professional Work-in-Progress.',
};

async function main(): Promise<void> {
  const { db } = await import('../lib/db');

  await db.execute({
    sql: `INSERT INTO siklus (nomor_siklus, judul_topik, catatan_reflektif, status)
          VALUES (?, ?, ?, 'lengkap')
          ON CONFLICT(nomor_siklus) DO NOTHING`,
    args: [SIKLUS_CONTOH.nomorSiklus, SIKLUS_CONTOH.judulTopik, SIKLUS_CONTOH.catatanReflektif],
  });

  for (const item of NARASI_CONTOH) {
    await db.execute({
      sql: `INSERT INTO analisis_topik3 (kategori, narasi_analisis, updated_at)
            SELECT ?, ?, CURRENT_TIMESTAMP
            WHERE NOT EXISTS (SELECT 1 FROM analisis_topik3 WHERE kategori = ?)`,
      args: [item.kategori, item.narasi, item.kategori],
    });
  }

  await db.execute({
    sql: `INSERT INTO terbimbing (
            id, judul_topik, rpp_url, materi_url, media_deskripsi, media_url,
            video_url, instrumen_penilaian_url, updated_at
          )
          VALUES (1, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO NOTHING`,
    args: [
      TERBIMBING_CONTOH.judulTopik,
      TERBIMBING_CONTOH.rppUrl,
      TERBIMBING_CONTOH.materiUrl,
      TERBIMBING_CONTOH.mediaDeskripsi,
      TERBIMBING_CONTOH.mediaUrl,
      TERBIMBING_CONTOH.videoUrl,
      TERBIMBING_CONTOH.instrumenPenilaianUrl,
    ],
  });

  await db.execute({
    sql: `INSERT INTO profil (
            id, nama, program_studi, lptk, sekolah_ppl, mapel, kelas_fase,
            tentang_saya, filosofi_hidup, identitas_profesional
          )
          VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO NOTHING`,
    args: [
      PROFIL_CONTOH.nama,
      PROFIL_CONTOH.programStudi,
      PROFIL_CONTOH.lptk,
      PROFIL_CONTOH.sekolahPpl,
      PROFIL_CONTOH.mapel,
      PROFIL_CONTOH.kelasFase,
      PROFIL_CONTOH.tentangSaya,
      PROFIL_CONTOH.filosofiHidup,
      PROFIL_CONTOH.identitasProfesional,
    ],
  });

  const siklus = await db.execute('SELECT nomor_siklus, judul_topik, status FROM siklus ORDER BY nomor_siklus');
  const profil = await db.execute('SELECT nama, program_studi, sekolah_ppl FROM profil WHERE id = 1');
  const terbimbing = await db.execute('SELECT judul_topik, rpp_url FROM terbimbing WHERE id = 1');
  const analisis = await db.execute('SELECT kategori FROM analisis_topik3 ORDER BY kategori');

  console.log('Siklus di database:');
  for (const row of siklus.rows) {
    console.log(`  - siklus ${row.nomor_siklus}: ${row.judul_topik} [${row.status}]`);
  }
  console.log('Profil:', JSON.stringify(profil.rows[0]));
  console.log('Terbimbing:', JSON.stringify(terbimbing.rows[0]));
  console.log(
    'Analisis Topik 3 terisi:',
    analisis.rows.map((row) => String(row.kategori)).join(', ') || '(kosong)',
  );

  await db.close();
  console.log('Seed selesai.');
}

main().catch((error: unknown) => {
  console.error('GAGAL menjalankan seed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
