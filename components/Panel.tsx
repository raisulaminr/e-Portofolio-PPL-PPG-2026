import type { ReactNode } from 'react';

/**
 * Permukaan panel standar DESIGN.md: surface + border tipis + radius card (4px)
 * + shadow-card, dipakai untuk semua panel konten agar jarak & hierarkinya seragam.
 * Panel tetap netral (tanpa pastel) supaya teks panjang dan form tetap nyaman dibaca.
 */
export default function Panel({
  judul,
  deskripsi,
  aksi,
  children,
  className = '',
}: {
  judul?: string;
  deskripsi?: string;
  aksi?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-card border border-border bg-surface p-6 shadow-card ${className}`}>
      {judul || aksi ? (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            {judul ? (
              <h2 className="text-xl font-medium text-foreground sm:text-2xl">{judul}</h2>
            ) : null}
            {deskripsi ? <p className="mt-2 text-sm leading-[1.6] text-muted">{deskripsi}</p> : null}
          </div>
          {aksi}
        </div>
      ) : null}
      <div className={judul || aksi ? 'mt-5' : ''}>{children}</div>
    </section>
  );
}