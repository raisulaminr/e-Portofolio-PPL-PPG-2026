/**
 * Latar kanvas mengikuti acuan visual DESIGN.md
 * (space-visual-ideation-workspace): kanvas near-black dengan pola grid halus,
 * plus dua pendar ambient biru/ungu yang bergerak sangat lambat.
 *
 * Hanya transform/opacity yang dianimasikan — bukan filter blur — supaya murah
 * di GPU. Kelas `motion-safe:` membuat animasi otomatis mati saat pengunjung
 * memilih "kurangi gerak" (prefers-reduced-motion: reduce); lapisan tetap tampil
 * statis. Pola grid digambar dari gradient berulang (kelas `.latar-grid` di
 * globals.css), jadi tidak ada satu elemen per garis.
 */
export default function KanvasLatar() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Pola grid halus — inti bahasa visual acuan. */}
      <div className="latar-grid absolute inset-0" />

      {/* Pendar ambient biru (primary) bawah-kiri. */}
      <div className="absolute top-[34%] -left-[18%] h-[42rem] w-[42rem] rounded-full bg-primary/10 blur-[150px] motion-safe:animate-pendar-a dark:bg-primary/15" />
      {/* Pendar ambient ungu (accent) bawah-kanan. */}
      <div className="absolute top-[54%] -right-[14%] h-[36rem] w-[36rem] rounded-full bg-accent/10 blur-[140px] motion-safe:animate-pendar-b dark:bg-accent/15" />
    </div>
  );
}