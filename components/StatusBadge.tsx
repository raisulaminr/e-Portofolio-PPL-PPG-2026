import type { StatusSiklus } from '@/lib/queries';

/** Status siklus ('draft' | 'lengkap') dipakai di Beranda/UTS/UAS; 'terisi' | 'kosong'
 *  dipakai untuk slot analisis Topik 3 yang belum tentu berisi baris. */
export type StatusTampil = StatusSiklus | 'terisi' | 'kosong';

const LABEL: Record<StatusTampil, string> = {
  lengkap: 'Lengkap',
  draft: 'Draft',
  terisi: 'Terisi',
  kosong: 'Belum diisi',
};

const POSITIF: Record<StatusTampil, boolean> = {
  lengkap: true,
  draft: false,
  terisi: true,
  kosong: false,
};

export default function StatusBadge({
  status,
  diAtasNote = false,
}: {
  status: StatusTampil;
  /** Ditempel di atas sticky note pastel: pakai tinta gelap netral supaya
   *  kontrasnya tetap lolos AA, bukan warna token tema. */
  diAtasNote?: boolean;
}) {
  const positif = POSITIF[status];

  if (diAtasNote) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-note-teks/10 px-2.5 py-1 font-mono text-xs leading-[1.2] font-semibold tracking-wide text-note-teks uppercase">
        <span
          className={`h-1.5 w-1.5 rounded-full ${positif ? 'bg-note-teks' : 'bg-note-teks/45'}`}
          aria-hidden
        />
        {LABEL[status]}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-xs leading-[1.2] font-semibold tracking-wide uppercase ${
        positif ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${positif ? 'bg-success' : 'bg-warning'}`} aria-hidden />
      {LABEL[status]}
    </span>
  );
}
