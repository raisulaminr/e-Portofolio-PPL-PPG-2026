/**
 * Gaya bersama untuk kartu yang tampil sebagai sticky note (motif acuan visual
 * DESIGN.md). Dipakai ModuleCard, KartuKategori, dan KartuSiklus supaya bahasa
 * "kertas ditempel" konsisten di seluruh situs.
 *
 * Palet pastel hanya untuk note; teksnya selalu `note-teks` (#111827) agar lolos
 * WCAG AA di atas warna pastel mana pun.
 */
export const WARNA_NOTE = ['mint', 'peach', 'kuning', 'pink', 'biru'] as const;

export type WarnaKartu = (typeof WARNA_NOTE)[number];

/** Warna note berulang secara deterministik supaya daftar terasa hidup
 *  tetapi stabil (tidak berubah tiap render). */
export function warnaNote(index: number): WarnaKartu {
  return WARNA_NOTE[index % WARNA_NOTE.length];
}

export const KELAS_WARNA_NOTE: Record<WarnaKartu, string> = {
  mint: 'bg-note-mint',
  peach: 'bg-note-peach',
  kuning: 'bg-note-kuning',
  pink: 'bg-note-pink',
  biru: 'bg-note-biru',
};

/** Kelas dasar sticky note: radius card, teks gelap, terangkat saat hover. */
export const KELAS_NOTE =
  'relative block rounded-card p-6 text-note-teks shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lift';

/** Strip tape di tepi atas note (elemen dekoratif, aria-hidden). */
export const KELAS_TAPE =
  'absolute -top-2.5 left-1/2 h-5 w-20 -translate-x-1/2 -rotate-2 rounded-[2px] bg-tape';