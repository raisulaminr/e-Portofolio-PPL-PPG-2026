import type { ReactNode } from 'react';

/**
 * Eyebrow di atas judul — meniru "↓ VISUAL IDEATION WORKSPACE" pada acuan
 * visual DESIGN.md: label mono uppercase, panah turun, dan garis bawah coretan
 * primary. Tetap memakai warna token supaya ikut dua tema.
 */
export default function Lencana({
  children,
  panah = true,
}: {
  children: ReactNode;
  /** Panah turun di kiri label, seperti acuan visual. */
  panah?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      {panah ? (
        <span aria-hidden className="font-mono text-sm leading-none text-foreground/70">
          ↓
        </span>
      ) : null}

      <span className="relative inline-flex flex-col">
        <span className="font-mono text-xs leading-[1.2] font-semibold tracking-wide text-muted uppercase">
          {children}
        </span>
        {/* Coretan underline primary, sedikit miring seperti goresan tangan. */}
        <span aria-hidden className="mt-1 h-0.5 w-full -rotate-1 rounded-full bg-primary" />
      </span>
    </span>
  );
}