import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import FormAnalisisArtefak from '@/components/FormAnalisisArtefak';
import Lencana from '@/components/Lencana';
import Panel from '@/components/Panel';
import { SIKLUS_TOTAL, getAnalisisSiklusByNomor, getSiklusByNomor } from '@/lib/queries';
import { ARTEFAK_SIKLUS } from '@/lib/siklus';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin — Analisis Artefak Siklus',
  robots: { index: false, follow: false },
};

/**
 * Analisis artefak untuk satu siklus (UTS = siklus 1, UAS = siklus 2 yang
 * ditandai). Tiap artefak punya analisis 5-komponen sendiri — isinya berbeda
 * dari analisis Topik 3 meski artefaknya sejenis (PRD.md bagian 4.4 & 4.5).
 */
export default async function AdminAnalisisSiklusPage({
  params,
}: {
  params: Promise<{ nomor: string }>;
}) {
  const { nomor } = await params;
  const nomorSiklus = Number(nomor);

  if (!Number.isInteger(nomorSiklus) || nomorSiklus < 1 || nomorSiklus > SIKLUS_TOTAL) {
    notFound();
  }

  const [siklus, daftarAnalisis] = await Promise.all([
    getSiklusByNomor(nomorSiklus),
    getAnalisisSiklusByNomor(nomorSiklus),
  ]);
  const perField = new Map(daftarAnalisis.map((analisis) => [analisis.field, analisis]));
  // Hitung hanya artefak yang masih terdaftar — baris lama untuk artefak yang
  // sudah tidak ditampilkan (mis. Penilaian DPL) tidak ikut dihitung.
  const jumlahTerisi = ARTEFAK_SIKLUS.filter((artefak) => perField.has(artefak.field)).length;
  const modul = nomorSiklus === 1 ? 'UTS' : 'UAS';

  return (
    <div className="space-y-12">
      <section className="pt-4 sm:pt-10">
        <Link
          href={`/admin/siklus/${nomorSiklus}`}
          className="group inline-flex items-center gap-2 font-mono text-xs leading-[1.2] tracking-wide text-muted uppercase transition-colors hover:text-foreground"
        >
          <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">
            ←
          </span>
          Artefak siklus {nomorSiklus}
        </Link>

        <div className="mt-6">
          <Lencana>
            Admin · Siklus {nomorSiklus} · {modul} · Analisis Artefak
          </Lencana>
        </div>

        <h1 className="mt-6 max-w-3xl text-3xl font-display font-normal uppercase leading-[1.04] tracking-normal text-foreground sm:text-4xl">
          Analisis Artefak Siklus {nomorSiklus}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-[1.6] text-muted">
          Setiap artefak siklus ini dianalisis lewat lima komponen — konteks, tujuan, kelebihan, kekurangan,
          dan kajian teori. Narasi di sini khusus untuk siklus ini, berbeda dari analisis Topik 3. Simpan
          per artefak; perubahan langsung tampil di halaman {modul}.
        </p>
        <p className="mt-4 font-mono text-xs leading-[1.2] tracking-wide text-muted uppercase">
          {jumlahTerisi}/{ARTEFAK_SIKLUS.length} analisis artefak terisi
        </p>
      </section>

      {!siklus ? (
        <Panel className="border-warning/40">
          <p className="text-sm leading-[1.6] text-warning">
            Siklus {nomorSiklus} belum ada di database. Isi artefaknya dulu di{' '}
            <Link
              href={`/admin/siklus/${nomorSiklus}`}
              className="font-medium text-accent-teks hover:opacity-80"
            >
              form siklus {nomorSiklus}
            </Link>{' '}
            supaya artefaknya bisa ditampilkan bersama analisis ini.
          </p>
        </Panel>
      ) : null}

      <div className="space-y-8">
        {ARTEFAK_SIKLUS.map((artefak) => {
          const analisis = perField.get(artefak.field);

          return (
            <Panel key={artefak.field} judul={artefak.judul} deskripsi={artefak.deskripsi}>
              <FormAnalisisArtefak
                nomorSiklus={nomorSiklus}
                modul={modul}
                artefak={artefak}
                nilaiAwal={{
                  konteks: analisis?.konteks ?? '',
                  tujuan: analisis?.tujuan ?? '',
                  kelebihan: analisis?.kelebihan ?? '',
                  kekurangan: analisis?.kekurangan ?? '',
                  kajian_teori: analisis?.kajian_teori ?? '',
                }}
                sudahAda={Boolean(analisis)}
              />
            </Panel>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/admin/siklus/${nomorSiklus}`}
          className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">
            ←
          </span>
          Kembali ke artefak siklus
        </Link>
        <Link
          href={nomorSiklus === 1 ? '/uts' : '/uas'}
          className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          Lihat hasil di halaman publik
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            ↗
          </span>
        </Link>
      </div>
    </div>
  );
}
