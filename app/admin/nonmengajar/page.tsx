import type { Metadata } from 'next';
import Link from 'next/link';
import BelumDiisi from '@/components/BelumDiisi';
import FadeIn from '@/components/FadeIn';
import FormKegiatan from '@/components/FormKegiatan';
import Lencana from '@/components/Lencana';
import Panel from '@/components/Panel';
import Tombol from '@/components/Tombol';
import { getKegiatanNonmengajarList } from '@/lib/queries';
import { formatTanggal } from '@/lib/tanggal';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin — Kegiatan Nonmengajar',
};

export default async function AdminNonmengajarPage() {
  const daftarKegiatan = await getKegiatanNonmengajarList();

  return (
    <div className="space-y-12">
      <FadeIn>
        <section className="pt-4 sm:pt-10">
          <Lencana>Admin · Nonmengajar</Lencana>
          <h1 className="mt-6 max-w-3xl text-3xl font-display font-normal uppercase leading-[1.04] tracking-normal text-foreground sm:text-4xl">
            Kegiatan Nonmengajar
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-[1.6] text-muted">
            Kegiatan di luar jam mengajar selama PPL. Datanya muncul di kategori Topik 3 &quot;nonmengajar&quot; —
            tidak terikat siklus mana pun (PRD bagian 5).
          </p>
          <p className="mt-4 font-mono text-xs leading-[1.2] tracking-wide text-muted uppercase">
            {daftarKegiatan.length} kegiatan tercatat
          </p>
        </section>
      </FadeIn>

      <FadeIn delay={0.05}>
        <Panel judul="Tambah Kegiatan" deskripsi="Baris baru langsung bisa dibaca di halaman publik.">
          <FormKegiatan kegiatan={null} />
        </Panel>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section>
          <h2 className="text-xl font-medium text-foreground sm:text-2xl">Daftar Kegiatan</h2>

          {daftarKegiatan.length === 0 ? (
            <div className="mt-6">
              <BelumDiisi pesan="Belum ada kegiatan nonmengajar yang tercatat." />
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {daftarKegiatan.map((kegiatan) => (
                <li
                  key={kegiatan.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-border bg-surface px-5 py-4 shadow-card"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="text-sm font-medium text-foreground">{kegiatan.nama_kegiatan}</p>
                      {kegiatan.tanggal ? (
                        <span className="font-mono text-xs leading-[1.2] tracking-wide text-muted uppercase">
                          {formatTanggal(kegiatan.tanggal)}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 line-clamp-2 max-w-2xl text-sm leading-[1.6] text-muted">
                      {kegiatan.deskripsi ?? 'Tanpa deskripsi.'}
                    </p>
                  </div>

                  <Tombol
                    href={`/admin/nonmengajar/${kegiatan.id}`}
                    varian="garis"
                    className="px-3.5 py-1.5"
                  >
                    Ubah
                  </Tombol>
                </li>
              ))}
            </ul>
          )}
        </section>
      </FadeIn>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin"
          className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">
            ←
          </span>
          Kembali ke dashboard
        </Link>
        <Link
          href="/topik-3/nonmengajar"
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
