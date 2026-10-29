import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AnalisisLimaKomponen from '@/components/AnalisisLimaKomponen';
import BelumDiisi from '@/components/BelumDiisi';
import FadeIn from '@/components/FadeIn';
import FotoDokumentasi from '@/components/FotoDokumentasi';
import GaleriDokumentasi from '@/components/GaleriDokumentasi';
import Lencana from '@/components/Lencana';
import Panel from '@/components/Panel';
import PenampilEmbed from '@/components/PenampilEmbed';
import Tombol from '@/components/Tombol';
import { adalahJalurLokal } from '@/lib/dokumentasi';
import { KATEGORI_TOPIK3, getDefinisiKategori } from '@/lib/kategori';
import { getAnalisisByKategori, getKegiatanNonmengajarList, getTerbimbing } from '@/lib/queries';
import { jumlahArtefakTerisi } from '@/lib/siklus';
import { ARTEFAK_TERBIMBING, getArtefakTerbimbing } from '@/lib/terbimbing';
import { formatTanggal } from '@/lib/tanggal';

export const dynamic = 'force-dynamic';

const LABEL = 'font-mono text-xs leading-[1.2] font-semibold tracking-wide text-muted uppercase';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kategori: string }>;
}): Promise<Metadata> {
  const { kategori } = await params;
  const definisi = getDefinisiKategori(kategori);
  if (!definisi) return { title: 'Kategori tidak ditemukan' };

  return { title: `${definisi.judul} · Topik 3`, description: definisi.ringkasan };
}

export default async function DetailKategoriPage({
  params,
}: {
  params: Promise<{ kategori: string }>;
}) {
  const { kategori } = await params;
  const definisi = getDefinisiKategori(kategori);
  if (!definisi) notFound();

  const nonmengajar = definisi.sumber === 'nonmengajar';

  // Hanya tarik data yang relevan dengan kategori ini. Artefak Topik 3 berasal
  // dari entitas `terbimbing` (praktik mengajar terbimbing) — bukan tabel siklus
  // yang dipakai UTS/UAS (PRD.md bagian 5).
  const [analisis, daftarKegiatan, terbimbing] = await Promise.all([
    getAnalisisByKategori(definisi.slug),
    nonmengajar ? getKegiatanNonmengajarList() : Promise.resolve([]),
    nonmengajar ? Promise.resolve(null) : getTerbimbing(),
  ]);

  const jumlahArtefak = terbimbing ? jumlahArtefakTerisi(terbimbing) : 0;

  const sebelumnya = KATEGORI_TOPIK3[definisi.nomor - 2];
  const berikutnya = KATEGORI_TOPIK3[definisi.nomor];

  return (
    <div className="space-y-16">
      <FadeIn>
        <section className="pt-4 pb-2 sm:pt-10">
          <Link
            href="/topik-3"
            className="group inline-flex items-center gap-2 font-mono text-xs leading-[1.2] tracking-wide text-muted uppercase transition-colors hover:text-foreground"
          >
            <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">
              ←
            </span>
            Semua kategori analisis
          </Link>

          <div className="mt-6">
            <Lencana>
              Topik 3 · Kategori {String(definisi.nomor).padStart(2, '0')}
            </Lencana>
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-display font-normal uppercase leading-[1.04] tracking-normal text-foreground sm:text-5xl lg:text-[4rem]">
            {definisi.judul}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-[1.6] text-muted sm:text-lg">
            {definisi.ringkasan}
          </p>
        </section>
      </FadeIn>

      <FadeIn delay={0.05}>
        <Panel
          judul="Artefak yang Dianalisis"
          deskripsi={
            nonmengajar
              ? 'Dokumentasi kegiatan nonmengajar selama masa PPL, tidak terikat sesi praktik mengajar. Fotonya tampil langsung di halaman.'
              : 'Diambil dari entitas praktik mengajar terbimbing, terpisah dari siklus UTS/UAS, jadi tidak diinput ulang di halaman ini.'
          }
        >
          {nonmengajar ? (
            daftarKegiatan.length === 0 ? (
              <BelumDiisi pesan="Belum ada kegiatan nonmengajar yang tercatat." />
            ) : (
              <ul className="space-y-3">
                {daftarKegiatan.map((kegiatan) => (
                  <li key={kegiatan.id} className="space-y-3">
                    <div className="rounded-card border border-border bg-surface-muted px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-medium text-foreground">
                          {kegiatan.nama_kegiatan}
                        </h3>
                        {kegiatan.tanggal ? (
                          <span className={LABEL}>{formatTanggal(kegiatan.tanggal)}</span>
                        ) : null}
                      </div>
                      {kegiatan.deskripsi ? (
                        <p className="mt-2 text-sm leading-[1.6] text-muted">{kegiatan.deskripsi}</p>
                      ) : null}
                    </div>

                    {/* Foto dokumentasi tampil langsung di halaman — bukan cuma tautan
                        ke tab baru. Jalur di public/ (mis. /dokumentasi/piket-pagi)
                        menjadi carousel foto; tautan Drive/gambar tetap ditampilkan
                        inline lewat FotoDokumentasi. */}
                    {adalahJalurLokal(kegiatan.dokumentasi_url) ? (
                      <GaleriDokumentasi
                        folder={kegiatan.dokumentasi_url}
                        judul={`Dokumentasi ${kegiatan.nama_kegiatan}`}
                      />
                    ) : (
                      <FotoDokumentasi
                        url={kegiatan.dokumentasi_url}
                        judul={`Dokumentasi ${kegiatan.nama_kegiatan}`}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface-muted px-4 py-3">
                <div className="min-w-0">
                  <p className={LABEL}>Praktik Mengajar Terbimbing</p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {terbimbing?.judul_topik ?? 'Judul topik belum diisi.'}
                  </p>
                </div>
                <span className={LABEL}>
                  {jumlahArtefak}/{ARTEFAK_TERBIMBING.length} artefak terisi
                </span>
              </div>

              {definisi.artefak.map((field) => {
                const artefak = getArtefakTerbimbing(field);
                const nilai = terbimbing?.[field] ?? null;
                const penjelas = artefak.deskripsiField
                  ? (terbimbing?.[artefak.deskripsiField] ?? null)
                  : null;

                return (
                  <div key={field} className="space-y-3">
                    <PenampilEmbed
                      url={nilai}
                      judul={artefak.judul}
                      jenis={artefak.jenis}
                      label={artefak.label}
                    />
                    {penjelas ? (
                      <div className="rounded-card border border-border bg-surface-muted px-4 py-3">
                        <p className={LABEL}>Deskripsi media</p>
                        <p className="mt-1 text-sm leading-[1.6] text-muted">{penjelas}</p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section>
          <h2 className="text-xl font-medium text-foreground sm:text-2xl">Analisis Artefak</h2>
          <p className="mt-2 max-w-2xl text-base leading-[1.6] text-muted">
            Lima komponen analisis (konteks, tujuan, kelebihan, kekurangan, dan kajian teori)
            disajikan sebagai bagian tersendiri agar setiap sisi analisis terbaca jelas, bukan
            menyatu dalam satu narasi.
          </p>

          <div className="mt-6">
            <AnalisisLimaKomponen
              nilai={analisis}
              varian="panel"
              pesanKosong="Analisis untuk kategori ini belum ditulis."
            />
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.15}>
        <nav aria-label="Navigasi antar kategori" className="flex flex-wrap items-center justify-between gap-3">
          {sebelumnya ? (
            <Link
              href={`/topik-3/${sebelumnya.slug}`}
              className="group inline-flex max-w-full items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">
                ←
              </span>
              <span className="truncate">{sebelumnya.judul}</span>
            </Link>
          ) : (
            <Tombol href="/topik-3" varian="garis">
              Semua kategori
            </Tombol>
          )}

          {berikutnya ? (
            <Link
              href={`/topik-3/${berikutnya.slug}`}
              className="group inline-flex max-w-full items-center gap-2 text-right text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              <span className="truncate">{berikutnya.judul}</span>
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          ) : (
            <Tombol href="/uts" varian="utama">
              Lanjut ke Modul UTS
            </Tombol>
          )}
        </nav>
      </FadeIn>
    </div>
  );
}
