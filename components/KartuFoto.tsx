import FotoProfil from '@/components/FotoProfil';

/**
 * Kartu foto profil — dipakai bersama oleh Beranda dan Profil supaya tampilannya
 * konsisten. Bingkai matte + pendar primary di belakang subjek, memakai bahasa
 * kartu DESIGN.md (radius card 4px, border tipis, shadow-card).
 */
export default function KartuFoto({
  nama,
  className = '',
}: {
  nama: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-2 -z-10 rounded-card bg-primary/10 blur-3xl sm:-inset-6"
      />

      <figure className="relative overflow-hidden rounded-card border border-border bg-surface p-2.5 shadow-card">
        <span
          aria-hidden
          className="absolute inset-x-6 -top-px h-px bg-linear-to-r from-transparent via-primary/70 to-transparent"
        />
        <div className="relative overflow-hidden rounded-card bg-linear-to-b from-surface-muted to-surface">
          <span
            aria-hidden
            className="pointer-events-none absolute top-[20%] left-1/2 h-52 w-52 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
          />
          <FotoProfil alt={`Foto profil ${nama}`} penuh className="relative" />
        </div>
      </figure>
    </div>
  );
}