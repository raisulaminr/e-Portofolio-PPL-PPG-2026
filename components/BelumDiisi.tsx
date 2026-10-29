/**
 * Blok keadaan kosong untuk artefak/narasi yang belum diisi.
 * Dipakai bersama oleh halaman Topik 3, UTS, dan UAS supaya nadanya seragam.
 */
export default function BelumDiisi({ pesan }: { pesan: string }) {
  return (
    <p className="rounded-card border border-dashed border-border bg-surface-muted px-4 py-5 text-sm leading-[1.6] text-muted">
      {pesan}
    </p>
  );
}
