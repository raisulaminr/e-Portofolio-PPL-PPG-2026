import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BelumDiisi from '@/components/BelumDiisi';
import HalamanArtefakSiklus from '@/components/HalamanArtefakSiklus';
import Tombol from '@/components/Tombol';
import { analisisPerField } from '@/lib/analisis';
import { getAnalisisSiklusByNomor, getSiklusUasPilihan } from '@/lib/queries';
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

  return { title: `${artefak.judul} · UAS`, description: artefak.deskripsi };
}

/**
 * Satu artefak UAS — dibaca dari SATU siklus yang ditandai produk UAS
 * (`is_uas_pilihan = 1`), bukan dari beberapa siklus sekaligus (PRD.md bagian 5).
 */
export default async function UasArtefakPage({
  params,
}: {
  params: Promise<{ artefak: string }>;
}) {
  const { artefak: slug } = await params;
  const artefak = getArtefakSiklusBySlug(slug);
  if (!artefak) notFound();

  const siklus = await getSiklusUasPilihan();

  if (!siklus) {
    return (
      <div className="space-y-8 pt-4 sm:pt-10">
        <BelumDiisi pesan="Belum ada produk UAS yang ditandai untuk ditampilkan." />
        <Tombol href="/uas" varian="garis">
          Kembali ke Modul UAS
        </Tombol>
      </div>
    );
  }

  const daftarAnalisis = await getAnalisisSiklusByNomor(siklus.nomor_siklus);

  return (
    <HalamanArtefakSiklus
      modul="UAS"
      dasar="/uas"
      siklus={siklus}
      artefak={artefak}
      analisis={analisisPerField(daftarAnalisis)[artefak.field] ?? null}
    />
  );
}
