/**
 * Kelas bersama untuk semua form admin, supaya input di form mana pun tampil
 * identik dan tetap memakai token DESIGN.md (surface-muted, border, foreground).
 * Radius input memakai token `control` (12px) sesuai DESIGN.md bagian rounded.
 */
export const KELAS_INPUT_FORM =
  'w-full rounded-control border border-border bg-surface-muted px-3.5 py-2.5 text-sm text-foreground transition-colors placeholder:text-muted hover:border-primary/50 focus:border-primary';

export const KELAS_LABEL_FORM =
  'font-mono text-xs leading-[1.2] font-semibold tracking-wide text-muted uppercase';