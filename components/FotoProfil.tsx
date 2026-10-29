'use client';

import { useState } from 'react';

/**
 * Foto profil dari `public/`.
 *
 * Berkas ditaruh di `public/` dengan salah satu nama berikut (huruf kecil),
 * dicoba berurutan sampai ketemu — PNG didahulukan karena bisa punya latar transparan:
 *   /foto-profil.png · /foto-profil.webp · /foto-profil.jpg · /foto-profil.jpeg
 *
 * Selama berkasnya belum ada, komponen menampilkan ikon panel seperti semula —
 * jadi tampilan tidak pernah muncul sebagai gambar rusak.
 *
 * Dua mode:
 * - biasa (bawaan): kotak kecil tetap; foto ditampilkan UTUH (`object-contain`).
 * - `penuh`: foto tampil UTUH & terpusat di dalam bingkai (tanpa dipotong),
 *   tingginya dibatasi supaya proporsinya tetap enak dilihat.
 */
const KANDIDAT_FOTO = [
  '/foto-profil.png',
  '/foto-profil.webp',
  '/foto-profil.jpg',
  '/foto-profil.jpeg',
] as const;

function IkonPanel() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="6" rx="1.5" />
      <rect x="3" y="14" width="18" height="6" rx="1.5" />
      <path d="M7 7h.01M7 17h.01" />
    </svg>
  );
}

export default function FotoProfil({
  alt,
  className = '',
  penuh = false,
}: {
  alt: string;
  className?: string;
  penuh?: boolean;
}) {
  const [indeks, setIndeks] = useState(0);
  const fotoHabis = indeks >= KANDIDAT_FOTO.length;

  if (penuh) {
    return (
      <span
        className={`flex w-full items-center justify-center overflow-hidden text-primary-teks ${className}`}
      >
        {fotoHabis ? (
          <span className="flex aspect-[3/4] w-full items-center justify-center">
            <IkonPanel />
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- berkas statis publik, tanpa optimasi next/image.
          <img
            src={KANDIDAT_FOTO[indeks]}
            alt={alt}
            onError={() => setIndeks((nilai) => nilai + 1)}
            decoding="async"
            draggable={false}
            className="mx-auto block h-auto max-h-[30rem] w-auto max-w-full object-contain"
          />
        )}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-control border border-border bg-surface-muted text-primary-teks ${className}`}
    >
      {fotoHabis ? (
        <IkonPanel />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- berkas statis publik, tanpa optimasi next/image.
        <img
          src={KANDIDAT_FOTO[indeks]}
          alt={alt}
          onError={() => setIndeks((nilai) => nilai + 1)}
          className="h-full w-full object-contain"
        />
      )}
    </span>
  );
}
