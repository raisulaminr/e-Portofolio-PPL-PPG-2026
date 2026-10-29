/**
 * Satu artefak (RPP/materi/media/instrumen) milik siklus yang dianalisis.
 * URL eksternal (Google Drive/dsb) dibuka di tab baru — cukup untuk MVP,
 * sesuai TECH-SPEC.md bagian 4 (hindari file storage sendiri dulu).
 */
export default function TautanArtefak({ label, url }: { label: string; url: string | null }) {
  if (!url) {
    return (
      <div className="rounded-card border border-dashed border-border bg-surface-muted px-4 py-3">
        <p className="font-mono text-xs leading-[1.2] font-semibold tracking-wide text-muted uppercase">
          {label}
        </p>
        <p className="mt-1 text-sm text-muted">Belum diisi.</p>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface-muted px-4 py-3 transition-colors hover:border-primary/60"
    >
      <span className="min-w-0">
        <span className="block font-mono text-xs leading-[1.2] font-semibold tracking-wide text-muted uppercase">
          {label}
        </span>
        <span className="mt-1 block truncate text-sm font-medium text-foreground">{url}</span>
      </span>
      <span aria-hidden className="text-accent-teks">
        ↗
      </span>
    </a>
  );
}
