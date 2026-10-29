import TautanArtefak from '@/components/TautanArtefak';
import { keSematan } from '@/lib/embed';
import type { JenisArtefak } from '@/lib/siklus';

/**
 * Menyematkan artefak langsung di halaman: video 16:9, dokumen (RPP/materi/
 * instrumen — Drive, Docs, atau PDF publik) dalam bingkai tinggi, dan gambar
 * media sebagai <img>. Tautan yang tidak dikenali jatuh ke kartu tautan
 * (TECH-SPEC bagian 4: tidak ada berkas yang diunggah ke server).
 *
 * Selalu ada tautan "buka di tab baru" sebagai cadangan — penting kalau
 * pengunjung memblokir iframe pihak ketiga atau ingin mengunduh berkasnya.
 */
export default function PenampilEmbed({
  url,
  judul,
  jenis,
  label,
}: {
  url: string | null;
  judul: string;
  /** Jenis artefaknya menurut lib/siklus.ts — kolom video selalu 'video'. */
  jenis: JenisArtefak;
  label: string;
}) {
  const sematan = keSematan(url);

  if (!sematan) {
    // Termasuk saat url kosong: kartu ini yang menampilkan "Belum diisi."
    return <TautanArtefak label={label} url={url} />;
  }

  const bentuk = jenis === 'video' ? 'video' : sematan.bentuk;

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-card border border-border bg-surface-muted">
        {bentuk === 'video' ? (
          <div className="relative aspect-video">
            <iframe
              src={sematan.url}
              title={judul}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        ) : bentuk === 'gambar' ? (
          // eslint-disable-next-line @next/next/no-img-element -- domain gambar bebas, tidak didaftarkan di next.config
          <img
            src={sematan.url}
            alt={judul}
            loading="lazy"
            className="mx-auto max-h-[70vh] w-auto max-w-full object-contain"
          />
        ) : (
          <iframe
            src={sematan.url}
            title={judul}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="h-[70vh] max-h-[900px] min-h-[420px] w-full border-0"
          />
        )}
      </div>

      <a
        href={url ?? sematan.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-teks transition-opacity hover:opacity-80"
      >
        Buka {label} di tab baru
        <span aria-hidden>↗</span>
      </a>
    </div>
  );
}
