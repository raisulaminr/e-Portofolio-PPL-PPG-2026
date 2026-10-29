import type { ReactNode } from 'react';

/**
 * Bingkai seleksi bergaya tool desain — inti komposisi acuan visual DESIGN.md
 * (space-visual-ideation-workspace): judul hero duduk di dalam kotak biru
 * ber-handle, seolah sedang "dipilih" di kanvas.
 *
 * Seluruh hiasan bingkai & handle bersifat dekoratif (`aria-hidden`,
 * `pointer-events-none`) dan diletakkan di luar teks, jadi tidak mengganggu
 * interaksi maupun pembaca layar. Prop `ringkas` menipiskan hiasannya untuk
 * halaman detail supaya tidak terasa berlebihan di setiap judul.
 */
export default function BingkaiSeleksi({
  children,
  ringkas = false,
  className = '',
}: {
  children: ReactNode;
  /** Versi tipis tanpa handle penuh — dipakai di judul halaman detail. */
  ringkas?: boolean;
  className?: string;
}) {
  const handle =
    'absolute h-2 w-2 border border-primary bg-background shadow-[0_0_0_1px_var(--background)]';

  return (
    <span className={`relative inline-block ${className}`}>
      <span aria-hidden className="pointer-events-none absolute -inset-3 rounded-[2px] border border-primary/70 sm:-inset-4" />

      {ringkas ? null : (
        <span aria-hidden className="pointer-events-none absolute -inset-3 sm:-inset-4">
          {/* Empat handle sudut + empat handle tengah sisi, seperti seleksi asli. */}
          <span className={`${handle} -top-1 -left-1`} />
          <span className={`${handle} -top-1 -right-1`} />
          <span className={`${handle} -bottom-1 -left-1`} />
          <span className={`${handle} -bottom-1 -right-1`} />
          <span className={`${handle} -top-1 left-1/2 -translate-x-1/2`} />
          <span className={`${handle} -bottom-1 left-1/2 -translate-x-1/2`} />
          <span className={`${handle} top-1/2 -left-1 -translate-y-1/2`} />
          <span className={`${handle} top-1/2 -right-1 -translate-y-1/2`} />
        </span>
      )}

      <span className="relative">{children}</span>
    </span>
  );
}