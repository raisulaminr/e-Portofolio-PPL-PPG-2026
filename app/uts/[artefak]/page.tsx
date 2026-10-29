import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BelumDiisi from '@/components/BelumDiisi';
import HalamanArtefakSiklus from '@/components/HalamanArtefakSiklus';
import Tombol from '@/components/Tombol';
import { analisisPerField } from '@/lib/analisis';
import { getAnalisisSiklusByNomor, getSiklusByNomor } from '@/lib/queries';
import { getArtefakSiklusBySlug } from '@/lib/siklus';

// Data artefak & analisisnya diisi dari admin panel tanpa deploy ulang.
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ artefak: string }>;
}): Promise<Metadata> {
  const { artefak: slug } = await params;
  const artefak = getArtefakSiklusBySlug(slug);
  if (!artefak) return { title: 'Artefak tidak ditemukan' };

  return { title: `${artefak.judul} · UTS`, description: artefak.deskripsi };
}

/**
 * Satu artefak UTS (siklus 1), sejajar dengan /topik-3/[kategori]: halaman menu
 * /uts menautkan ke sini, bukan menumpuk semua artefak dalam satu halaman.
 */
export default async function UtsArtefakPage({
  params,
}: {
  params: Promise<{ artefak: string }>;
}) {
  const { artefak: slug } = await params;
  const artefak = getArtefakSiklusBySlug(slug);
  if (!artefak) notFound();

  const [siklus, daftarAnalisis] = await Promise.all([
    getSiklusByNomor(1),
    getAnalisisSiklusByNomor(1),
  ]);

  if (!siklus) {
    return (
      <div className="space-y-8 pt-4 sm:pt-10">
        <BelumDiisi pesan="Data modul UTS belum tersedia." />
        <Tombol href="/uts" varian="garis">
          Kembali ke Modul UTS
        </Tombol>
      </div>
    );
  }

  return (
    <HalamanArtefakSiklus
      modul="UTS"
      dasar="/uts"
      siklus={siklus}
      artefak={artefak}
      analisis={analisisPerField(daftarAnalisis)[artefak.field] ?? null}
    />
  );
}
