import KartuArtefak from '@/components/KartuArtefak';
import type { Siklus } from '@/lib/queries';
import { ARTEFAK_SIKLUS } from '@/lib/siklus';

/**
 * Menu pilihan artefak di halaman UTS/UAS: satu kartu per artefak siklus
 * (RPP sampai penilaian Guru Pamong). Tiap kartu membuka halaman detailnya
 * sendiri, sama seperti menu kategori di halaman Topik 3.
 */
export default function MenuArtefakSiklus({
  siklus,
  dasar,
}: {
  siklus: Siklus;
  /** Basis URL menu: '/uts' atau '/uas'. */
  dasar: string;
}) {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {ARTEFAK_SIKLUS.map((artefak, index) => (
        <KartuArtefak
          key={artefak.field}
          artefak={artefak}
          nomor={index + 1}
          dasar={dasar}
          terisi={Boolean(siklus[artefak.field])}
          warnaIndex={index}
        />
      ))}
    </div>
  );
}
