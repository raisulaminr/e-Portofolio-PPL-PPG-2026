/**
 * Aturan galeri foto dokumentasi kegiatan nonmengajar (PRD bagian 5).
 *
 * Fotonya bukan tautan keluar, melainkan BERKAS STATIS di `public/`: satu
 * folder per kegiatan, isinya bernomor urut — 1.jpg, 2.jpg, 3.jpg, … Nomor itu
 * sekaligus urutan tampil di carousel, jadi tidak ada daftar berkas yang perlu
 * dirawat: jumlah foto diketahui dengan mencoba nomor berikutnya sampai
 * berkasnya tidak ada (lihat components/GaleriDokumentasi.tsx).
 *
 * Kolom `kegiatan_nonmengajar.dokumentasi_url` menerima dua bentuk:
 * - jalur di `public/` yang diawali `/` (mis. `/dokumentasi/piket-pagi` untuk
 *   folder galeri, atau `/dokumentasi/piket-pagi/1.jpg` untuk satu foto)
 *   → ditampilkan sebagai foto/carousel di halaman;
 * - tautan luar (Google Drive/gambar publik) → penampil tautan seperti kategori
 *   lain, aturannya di lib/embed.ts.
 */

/** Ekstensi berkas yang dicoba, berurutan, untuk tiap nomor foto. */
export const EKSTENSI_FOTO = ['jpg', 'jpeg', 'png', 'webp'] as const;

/** Batas jumlah foto per kegiatan — sekaligus batas percobaan saat memuat galeri. */
export const MAKS_FOTO = 20;

const AKHIRAN_GAMBAR = /\.(png|jpe?g|webp|avif|gif)$/i;

/** `true` kalau kolomnya menunjuk berkas di `public/`, bukan tautan luar. */
export function adalahJalurLokal(url: string | null): url is string {
  return typeof url === 'string' && url.trim().startsWith('/');
}

/** Satu berkas gambar (bukan folder galeri) — dipakai apa adanya sebagai satu-satunya slide. */
export function fotoTunggal(url: string): string | null {
  const bersih = url.trim();
  return AKHIRAN_GAMBAR.test(bersih) ? bersih : null;
}

/**
 * Nama folder kegiatan dari `nama_kegiatan` — huruf kecil, spasi dan tanda
 * baca jadi tanda hubung: "Pendampingan Upacara Bendera" →
 * `pendampingan-upacara-bendera`.
 *
 * Dipakai `npm run dokumentasi:folder` supaya nama folder di `public/` dan
 * jalur yang diketik di admin tidak berbeda (di Vercel — Linux — huruf besar
 * dan kecil itu berkas yang berbeda).
 */
export function slugKegiatan(nama: string, cadangan: number | string = 'kegiatan'): string {
  const slug = nama
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || `kegiatan-${cadangan}`;
}

/**
 * Folder foto contoh hasil kerja siswa untuk satu siklus UTS/UAS:
 * `/dokumentasi/hasil-kerja/siklus-1`, `/dokumentasi/hasil-kerja/siklus-2`, …
 *
 * Polanya sama dengan dokumentasi kegiatan nonmengajar (berkas bernomor), jadi
 * `GaleriDokumentasi` bisa dipakai apa adanya. Dipakai juga
 * `npm run dokumentasi:folder` supaya folder dan isi kolom admin tidak berbeda.
 */
export function folderHasilKerjaSiklus(nomorSiklus: number): string {
  return `/dokumentasi/hasil-kerja/siklus-${nomorSiklus}`;
}

/**
 * Pesan keadaan "tidak ada foto", sekaligus menangkap kekeliruan yang paling
 * mudah terjadi: kolom diisi nomor fotonya (`/dokumentasi/piket-pagi/1`),
 * padahal yang dibutuhkan jalur FOLDER-nya.
 *
 * Kalimat bantuannya bersyarat ("kalau angka di ujung itu nomor foto…") supaya
 * tetap benar kalau ada folder yang memang bernama angka, mis. dari id kegiatan.
 */
export function pesanBelumAdaFoto(folder: string): string {
  const bersih = folder.trim().replace(/\/+$/, '');
  const segmenAkhir = bersih.split('/').filter(Boolean).pop() ?? '';
  const induk = bersih.slice(0, bersih.length - segmenAkhir.length).replace(/\/+$/, '');

  const bantuanNomor =
    induk && /^\d+$/.test(segmenAkhir)
      ? ` Kalau angka "${segmenAkhir}" di ujung itu nomor foto dan bukan nama folder, isi kolomnya dengan folder fotonya saja: ${induk}.`
      : '';

  return `Belum ada foto di ${folder}.${bantuanNomor} Taruh berkas 1.jpg, 2.jpg, dan seterusnya di folder itu di dalam public/.`;
}

export interface KandidatFoto {
  /** Jalur berkas yang dicoba dimuat. */
  url: string;
  ekstensi: string;
}

/**
 * Berkas yang dicoba untuk nomor ke-`nomor` (1 = foto pertama). Ekstensi yang
 * sudah terbukti dipakai foto sebelumnya dicoba lebih dulu, supaya tidak ada
 * permintaan yang pasti gagal untuk setiap nomor.
 *
 * Nilai kolomnya dirapikan dulu (spasi/enter di ujung dibuang) — jalur yang
 * disalin dari terminal mudah terbawa spasi, dan itu tidak boleh membuat foto
 * seolah-olah tidak ada.
 */
export function kandidatFoto(
  folder: string,
  nomor: number,
  ekstensiDisukai?: string | null,
): KandidatFoto[] {
  const dasar = folder.trim().replace(/\/+$/, '');
  const urut: readonly string[] =
    ekstensiDisukai && (EKSTENSI_FOTO as readonly string[]).includes(ekstensiDisukai)
      ? [ekstensiDisukai, ...EKSTENSI_FOTO.filter((ekstensi) => ekstensi !== ekstensiDisukai)]
      : EKSTENSI_FOTO;

  return urut.map((ekstensi) => ({ url: `${dasar}/${nomor}.${ekstensi}`, ekstensi }));
}
