import type { ReactNode } from 'react';

/**
 * Sticky note — motif inti acuan visual DESIGN.md (space-visual-ideation-workspace):
 * kertas pastel dengan strip "tape" di atas, ikon stroke, dan teks gelap.
 *
 * Palet pastel sengaja terpisah dari peran primary/accent (lihat globals.css):
 * note selalu membawa `note-teks` (#111827) supaya kontrasnya lolos AA di atas
 * warna pastel mana pun. Rotasi kecil hanya kesan tempelan — jangan lebih dari 2°
 * supaya grid halaman tetap terbaca.
 */
export type WarnaNote = 'mint' | 'peach' | 'kuning' | 'pink' | 'biru';

const WARNA_NOTE: Record<WarnaNote, string> = {
  mint: 'bg-note-mint',
  peach: 'bg-note-peach',
  kuning: 'bg-note-kuning',
  pink: 'bg-note-pink',
  biru: 'bg-note-biru',
};

export default function StickyNote({
  children,
  warna = 'mint',
  ikon,
  rotasi = 0,
  className = '',
}: {
  children: ReactNode;
  warna?: WarnaNote;
  /** Ikon stroke kecil di kiri atas, seperti note pada acuan visual. */
  ikon?: ReactNode;
  /** Rotasi kecil (derajat) untuk kesan ditempel; sebaiknya -2..2. */
  rotasi?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-card p-6 text-note-teks shadow-card transition-transform duration-200 hover:-translate-y-1 ${WARNA_NOTE[warna]} ${className}`}
      style={rotasi ? { transform: `rotate(${rotasi}deg)` } : undefined}
    >
      {/* Strip tape di tepi atas — isyarat visual "ditempel". */}
      <span
        aria-hidden
        className="absolute -top-2.5 left-1/2 h-5 w-20 -translate-x-1/2 -rotate-2 rounded-[2px] bg-tape"
      />

      {ikon ? (
        <span aria-hidden className="mb-3 inline-flex h-8 w-8 items-center justify-center">
          {ikon}
        </span>
      ) : null}

      {children}
    </div>
  );
}