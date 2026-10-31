/**
 * Ubah tautan eksternal menjadi bentuk yang aman disematkan inline
 * (iframe untuk video/dokumen, <img> untuk gambar).
 *
 * Mengembalikan null kalau tautan tidak dikenali — pemanggil sebaiknya
 * menampilkan tautan keluar sebagai gantinya, bukan iframe kosong.
 *
 * Batasan Vercel & TECH-SPEC bagian 4: tidak ada berkas media/dokumen yang
 * diunggah ke server, semuanya tetap tautan (YouTube/Drive/PDF publik).
 */

export type BentukSematan = 'video' | 'gambar' | 'dokumen';

export interface Sematan {
  /** Tebakan terbaik dari URL; pemanggil boleh menimpanya (mis. kolom video_url selalu 'video'). */
  bentuk: BentukSematan;
  url: string;
}

const EKSTENSI_GAMBAR = /\.(png|jpe?g|webp|gif|svg|avif)$/i;
const EKSTENSI_PDF = /\.pdf$/i;

/** Bagian URL yang aman dipakai ulang sebagai ID (hanya huruf, angka, `-`, `_`). */
function id(value: string | null): string | null {
  return value && /^[\w-]+$/.test(value) ? value : null;
}

/** ID berkas Google Drive dari tautan `/file/d/<ID>/…` maupun `/open?id=<ID>`. */
function idDrive(parsed: URL): string | null {
  const dariPath = parsed.pathname.match(/\/file\/d\/([\w-]+)/);
  return id(dariPath?.[1] ?? null) ?? id(parsed.searchParams.get('id'));
}

export function keSematan(url: string | null | undefined): Sematan | null {
  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, '').toLowerCase();

  // Berkas gambar yang tautannya publik → tampil sebagai gambar, bukan iframe.
  if (EKSTENSI_GAMBAR.test(parsed.pathname)) {
    return { bentuk: 'gambar', url: parsed.href };
  }

  // PDF publik biasa → browser sudah punya penampil PDF sendiri.
  if (EKSTENSI_PDF.test(parsed.pathname)) {
    return { bentuk: 'dokumen', url: parsed.href };
  }

  // YouTube
  if (host === 'youtu.be') {
    const videoId = id(parsed.pathname.split('/').filter(Boolean)[0] ?? null);
    return videoId ? { bentuk: 'video', url: `https://www.youtube.com/embed/${videoId}` } : null;
  }

  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    const segmen = parsed.pathname.split('/').filter(Boolean);
    if (parsed.pathname === '/watch') {
      const videoId = id(parsed.searchParams.get('v'));
      return videoId ? { bentuk: 'video', url: `https://www.youtube.com/embed/${videoId}` } : null;
    }
    if (segmen[0] === 'embed' || segmen[0] === 'shorts' || segmen[0] === 'live') {
      const videoId = id(segmen[1] ?? null);
      return videoId ? { bentuk: 'video', url: `https://www.youtube.com/embed/${videoId}` } : null;
    }
    return null;
  }

  // Vimeo: vimeo.com/<ID>
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const segmen = parsed.pathname.split('/').filter(Boolean);
    const videoId = segmen.find((bagian) => /^\d+$/.test(bagian));
    return videoId ? { bentuk: 'video', url: `https://player.vimeo.com/video/${videoId}` } : null;
  }

  // Google Drive: /file/d/<ID>/view atau /open?id=<ID>
  if (host === 'drive.google.com') {
    const fileId = idDrive(parsed);
    if (!fileId) return null;
    return { bentuk: 'dokumen', url: `https://drive.google.com/file/d/${fileId}/preview` };
  }

  // Google Docs/Sheets/Slides → /preview juga bisa disematkan.
  if (host === 'docs.google.com') {
    const cocok = parsed.pathname.match(/\/(document|spreadsheets|presentation)\/d\/([\w-]+)/);
    if (!cocok) return null;
    return { bentuk: 'dokumen', url: `https://docs.google.com/${cocok[1]}/d/${cocok[2]}/preview` };
  }

  // Canva: /design/<ID>/<slug>/view atau /edit → bentuk embed `?embed`.
  // Slug WAJIB ikut: tanpa slug Canva membalas 303 ke /login, jadi iframe hanya
  // menampilkan ikon dokumen rusak. Tautan Canva tanpa slug karena itu tidak
  // disematkan — pemanggil jatuh ke kartu tautan.
  if (host === 'canva.com' || host === 'canva.site') {
    const segmen = parsed.pathname.split('/').filter(Boolean);
    const halaman = segmen[segmen.length - 1];
    const designId = id(segmen[1] ?? null);
    const slug = id(segmen[2] ?? null);

    if (segmen[0] !== 'design' || !designId || !slug) return null;
    if (halaman !== 'view' && halaman !== 'edit') return null;
    if (slug === halaman) return null;

    return {
      bentuk: 'dokumen',
      url: `https://www.canva.com/design/${designId}/${slug}/view?embed`,
    };
  }

  return null;
}

/**
 * Tautan yang bisa dipasang langsung sebagai `src` sebuah <img>.
 *
 * Dipakai untuk hal yang memang berupa FOTO — mis. dokumentasi kegiatan
 * nonmengajar — supaya fotonya tampil di halaman, bukan hanya jadi tautan.
 * Dua bentuk yang dikenali:
 * - berkas gambar publik (.jpg/.png/webp/dsb) → URL-nya apa adanya;
 * - berkas Google Drive → endpoint `thumbnail` yang mengembalikan gambarnya
 *   (berkasnya tetap harus dibagikan publik, sama seperti kalau disematkan).
 *
 * Mengembalikan null kalau tautannya tidak jelas gambar — pemanggil sebaiknya
 * jatuh ke `keSematan`/tautan keluar, bukan menampilkan <img> yang rusak.
 */
export function keGambarLangsung(
  url: string | null | undefined,
  /** Lebar maksimum gambar yang diminta dari Google Drive (piksel). */
  lebarPiksel = 1600,
): string | null {
  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }

  if (EKSTENSI_GAMBAR.test(parsed.pathname)) return parsed.href;

  const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
  if (host === 'drive.google.com') {
    const fileId = idDrive(parsed);
    return fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w${lebarPiksel}` : null;
  }

  return null;
}
