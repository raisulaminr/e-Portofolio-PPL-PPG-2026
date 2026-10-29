'use client';

import { useState } from 'react';
import PenampilEmbed from '@/components/PenampilEmbed';
import { keGambarLangsung } from '@/lib/embed';

/**
 * Foto dokumentasi satu kegiatan nonmengajar — isi panel "Artefak yang
 * Dianalisis" di kategori Topik 3 nonmengajar.
 *
 * Tautan foto (berkas gambar publik atau Google Drive) ditampilkan langsung
 * sebagai <img> supaya fotonya terlihat tanpa pindah tab, dan tautan keluar ke
 * berkas aslinya tetap disediakan sebagai cadangan.
 *
 * Kalau tautannya bukan gambar yang dikenali, atau gambarnya gagal dimuat
 * (mis. berkas Drive belum dibagikan publik), rendering diserahkan ke
 * PenampilEmbed: iframe pratinjau Drive/PDF, atau kartu tautan biasa.
 *
 * Perlu state klien hanya untuk `onError` — server component tidak bisa tahu
 * sebuah <img> gagal dimuat.
 */
export default function FotoDokumentasi({
  url,
  judul,
  label = 'Dokumentasi',
}: {
  url: string | null;
  /** Judul kegiatan — dipakai sebagai alt gambar sekaligus judul iframe. */
  judul: string;
  label?: string;
}) {
  const [gagalDimuat, setGagalDimuat] = useState(false);

  if (!url) {
    return <PenampilEmbed url={null} judul={judul} jenis="dokumen" label={label} />;
  }

  const gambar = gagalDimuat ? null : keGambarLangsung(url);

  if (!gambar) {
    return <PenampilEmbed url={url} judul={judul} jenis="dokumen" label={label} />;
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-card border border-border bg-surface-muted">
        {/* eslint-disable-next-line @next/next/no-img-element -- domain foto bebas, tidak didaftarkan di next.config */}
        <img
          src={gambar}
          alt={judul}
          loading="lazy"
          // Endpoint thumbnail Google Drive membalas 429 kalau permintaannya
          // membawa Referer (paling kentara dari localhost), jadi referrer
          // sengaja tidak dikirim — tanpa Referer gambarnya selalu terkirim.
          referrerPolicy="no-referrer"
          onError={() => setGagalDimuat(true)}
          className="mx-auto max-h-[70vh] w-auto max-w-full object-contain"
        />
      </div>

      <a
        href={url}
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
