import type { Metadata } from 'next';
import Link from 'next/link';
import FadeIn from '@/components/FadeIn';
import Lencana from '@/components/Lencana';
import Panel from '@/components/Panel';
import StatusBadge from '@/components/StatusBadge';
import Tombol from '@/components/Tombol';
import { KATEGORI_TOPIK3 } from '@/lib/kategori';
import {
  SIKLUS_TOTAL,
  getAnalisisList,
  getAnalisisSiklusList,
  getKegiatanNonmengajarList,
  getProfil,
  getRefleksi,
  getSiklusList,
  getTerbimbing,
} from '@/lib/queries';
import { ARTEFAK_SIKLUS, jumlahArtefakTerisi } from '@/lib/siklus';
import { ARTEFAK_TERBIMBING } from '@/lib/terbimbing';
import { formatTanggal } from '@/lib/tanggal';

// Selalu baca data terbaru setelah form disimpan.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin — Dashboard',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const [daftarAnalisis, daftarAnalisisSiklus, daftarSiklus, daftarKegiatan, profil, terbimbing, refleksi] =
    await Promise.all([
      getAnalisisList(),
      getAnalisisSiklusList(),
      getSiklusList(),
      getKegiatanNonmengajarList(),
      getProfil(),
      getTerbimbing(),
      getRefleksi(),
    ]);
  const perKategori = new Map(daftarAnalisis.map((analisis) => [analisis.kategori, analisis]));
  const perSiklus = new Map(daftarSiklus.map((siklus) => [siklus.nomor_siklus, siklus]));
  const analisisSiklusPerNomor = new Map<number, number>();
  for (const analisis of daftarAnalisisSiklus) {
    analisisSiklusPerNomor.set(
      analisis.nomor_siklus,
      (analisisSiklusPerNomor.get(analisis.nomor_siklus) ?? 0) + 1,
    );
  }
  const jumlahTerisi = KATEGORI_TOPIK3.filter((kategori) => perKategori.has(kategori.slug)).length;
  const nomorSiklus = Array.from({ length: SIKLUS_TOTAL }, (_, index) => index + 1);
  const jumlahSiklusLengkap = daftarSiklus.filter((siklus) => siklus.status === 'lengkap').length;

  return (
    <div className="space-y-16">
      <FadeIn>
        <section className="pt-4 pb-2 sm:pt-10">
          <Lencana>Admin</Lencana>
          <h1 className="mt-6 max-w-3xl text-4xl font-display font-normal uppercase leading-[1.04] tracking-normal text-foreground sm:text-5xl lg:text-[4rem]">
            Kelola Konten Portofolio
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-[1.6] text-muted sm:text-lg">
            Enam entitas bisa diisi dari sini: profil mahasiswa, praktik mengajar terbimbing, analisis Topik
            3, siklus praktik mengajar (UTS/UAS), kegiatan nonmengajar, dan modul Refleksi. Semua perubahan
            langsung tampil di halaman publik, tanpa deploy ulang.
          </p>
          <p className="mt-4 font-mono text-xs leading-[1.2] tracking-wide text-muted uppercase">
            {jumlahTerisi}/{KATEGORI_TOPIK3.length} kategori analisis terisi ·{' '}
            {jumlahSiklusLengkap}/{SIKLUS_TOTAL} siklus lengkap
          </p>
        </section>
      </FadeIn>

      <FadeIn delay={0.05}>
        <Panel judul="Profil Mahasiswa">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                {profil?.nama ?? 'Belum ada baris profil.'}
              </p>
              <p className="mt-1 text-sm leading-[1.6] text-muted">
                {[profil?.program_studi, profil?.lptk, profil?.sekolah_ppl]
                  .filter(Boolean)
                  .join(' · ') || 'Isi form untuk membuat profil.'}
              </p>
            </div>
            <Tombol href="/admin/profil" varian="garis" className="px-3.5 py-1.5">
              {profil ? 'Ubah profil' : 'Isi profil'}
            </Tombol>
          </div>
        </Panel>
      </FadeIn>

      <FadeIn delay={0.08}>
        <Panel
          judul="Refleksi"
          deskripsi="Model guru yang dituju, filosofi mengajar, dan refleksi akhir (kekuatan, kelemahan, rencana tindak lanjut)."
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                {refleksi ? 'Refleksi sudah diisi.' : 'Belum ada data refleksi.'}
              </p>
              <p className="mt-1 text-sm leading-[1.6] text-muted">
                Tampil di halaman publik /refleksi — kriteria penilaian tersendiri di rubrik LMS.
              </p>
            </div>
            <Tombol href="/admin/refleksi" varian="garis" className="px-3.5 py-1.5">
              {refleksi ? 'Ubah refleksi' : 'Isi refleksi'}
            </Tombol>
          </div>
        </Panel>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Panel
          judul="Praktik Mengajar Terbimbing"
          deskripsi="Sumber artefak lima kategori Topik 3 — sesi terbimbing sebelum siklus 1, terpisah dari siklus UTS/UAS."
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                {terbimbing?.judul_topik ?? 'Belum ada data praktik mengajar terbimbing.'}
              </p>
              <p className="mt-1 font-mono text-xs leading-[1.2] tracking-wide text-muted uppercase">
                {terbimbing ? jumlahArtefakTerisi(terbimbing, ARTEFAK_TERBIMBING) : 0}/
                {ARTEFAK_TERBIMBING.length} artefak terisi
              </p>
            </div>
            <Tombol href="/admin/terbimbing" varian="garis" className="px-3.5 py-1.5">
              {terbimbing ? 'Ubah artefak' : 'Isi artefak'}
            </Tombol>
          </div>
        </Panel>
      </FadeIn>

      <FadeIn delay={0.15}>
        <section>
          <h2 className="text-xl font-medium text-foreground sm:text-2xl">Enam Kategori</h2>
          <p className="mt-2 text-base leading-[1.6] text-muted">
            Pilih satu kategori untuk mengisi atau memperbarui narasi analisisnya. Artefaknya dibaca dari
            praktik mengajar terbimbing (kategori 01–04 & 06) atau kegiatan nonmengajar (kategori 05).
          </p>

          <ul className="mt-6 space-y-3">
            {KATEGORI_TOPIK3.map((kategori) => {
              const analisis = perKategori.get(kategori.slug);

              return (
                <li
                  key={kategori.slug}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-border bg-surface px-5 py-4 shadow-card"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-xs leading-[1.2] font-semibold tracking-wide text-accent-teks uppercase">
                      Kategori {String(kategori.nomor).padStart(2, '0')} · {kategori.slug}
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">{kategori.judul}</p>
                    <p className="mt-1 line-clamp-2 max-w-2xl text-sm leading-[1.6] text-muted">
                      {analisis?.konteks ?? 'Belum diisi.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={analisis ? 'terisi' : 'kosong'} />
                    <Tombol
                      href={`/admin/analisis/${kategori.slug}`}
                      varian="garis"
                      className="px-3.5 py-1.5"
                    >
                      {analisis ? 'Ubah' : 'Isi'}
                    </Tombol>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </FadeIn>

      <FadeIn delay={0.2}>
        <section>
          <h2 className="text-xl font-medium text-foreground sm:text-2xl">Siklus Praktik Mengajar</h2>
          <p className="mt-2 text-base leading-[1.6] text-muted">
            Hanya ada dua siklus yang dikelola: Siklus 1 menjadi tagihan UTS, dan Siklus 2 untuk UAS —
            ditandai lewat toggle di formnya, sehingga halaman /uas menampilkan siklus 2 itu. Semua membaca
            entitas yang sama, tidak ada tabel terpisah.
          </p>

          <ul className="mt-6 space-y-3">
            {nomorSiklus.map((nomor) => {
              const siklus = perSiklus.get(nomor);

              return (
                <li
                  key={nomor}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-border bg-surface px-5 py-4 shadow-card"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-xs leading-[1.2] font-semibold tracking-wide text-accent-teks uppercase">
                      Siklus {nomor} ·{' '}
                      {nomor === 1 ? 'UTS' : siklus?.is_uas_pilihan ? 'UAS · Produk terpilih' : 'UAS'}
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {siklus?.judul_topik ?? 'Belum ada baris siklus.'}
                    </p>
                    <p className="mt-1 text-sm leading-[1.6] text-muted">
                      {siklus
                        ? `${jumlahArtefakTerisi(siklus)}/${ARTEFAK_SIKLUS.length} artefak terisi · `
                        : 'Isi form untuk membuat siklus ini. '}
                      {analisisSiklusPerNomor.get(nomor) ?? 0}/{ARTEFAK_SIKLUS.length} analisis artefak
                    </p>
                    {siklus?.is_uas_pilihan ? (
                      <p className="mt-1 font-mono text-xs leading-[1.2] tracking-wide text-accent-teks uppercase">
                        ✓ Produk UAS terpilih
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={siklus?.status ?? 'kosong'} />
                    <Tombol
                      href={`/admin/siklus/${nomor}/analisis`}
                      varian="garis"
                      className="px-3.5 py-1.5"
                    >
                      Analisis
                    </Tombol>
                    <Tombol
                      href={`/admin/siklus/${nomor}`}
                      varian="garis"
                      className="px-3.5 py-1.5"
                    >
                      {siklus ? 'Ubah' : 'Isi'}
                    </Tombol>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </FadeIn>

      <FadeIn delay={0.25}>
        <section>
          <h2 className="text-xl font-medium text-foreground sm:text-2xl">Kegiatan Nonmengajar</h2>
          <p className="mt-2 text-base leading-[1.6] text-muted">
            Sumber data kategori Topik 3 &quot;nonmengajar&quot; — tidak terikat siklus, jadi dikelola terpisah.
          </p>

          <Panel className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-mono text-xs leading-[1.2] font-semibold tracking-wide text-accent-teks uppercase">
                  {daftarKegiatan.length} kegiatan tercatat
                </p>
                <ul className="mt-2 space-y-1 text-sm leading-[1.6] text-muted">
                  {(daftarKegiatan.length === 0
                    ? ['Belum ada kegiatan.'].map((teks) => ({ id: 0, nama_kegiatan: teks, tanggal: null }))
                    : daftarKegiatan.slice(0, 3)
                  ).map((kegiatan) => (
                    <li key={kegiatan.id} className="flex flex-wrap items-center gap-x-3">
                      <span className="text-foreground">{kegiatan.nama_kegiatan}</span>
                      {kegiatan.tanggal ? (
                        <span className="font-mono text-xs leading-[1.2] tracking-wide uppercase">
                          {formatTanggal(kegiatan.tanggal)}
                        </span>
                      ) : null}
                    </li>
                  ))}
                  {daftarKegiatan.length > 3 ? (
                    <li className="font-mono text-xs leading-[1.2] tracking-wide uppercase">
                      +{daftarKegiatan.length - 3} kegiatan lain
                    </li>
                  ) : null}
                </ul>
              </div>

              <Tombol href="/admin/nonmengajar" varian="garis" className="px-3.5 py-1.5">
                Kelola kegiatan
              </Tombol>
            </div>
          </Panel>
        </section>
      </FadeIn>

      <FadeIn delay={0.3}>
        <Panel judul="Cakupan Admin">
          <ul className="space-y-2 text-sm leading-[1.6] text-muted">
            <li>
              <span className="font-medium text-foreground">Enam entitas:</span> profil, terbimbing
              (praktik mengajar terbimbing → Topik 3), analisis_topik3 (enam kategori Topik 3), siklus 1 & 2
              (siklus 1 untuk UTS; siklus 2 untuk UAS),
              kegiatan_nonmengajar, dan refleksi (modul Refleksi).
            </li>
            <li>
              <span className="font-medium text-foreground">Satu pintu API:</span> semua penulisan lewat{' '}
              <code className="font-mono text-xs">/api/admin/[resource]</code> yang sudah dipagari sesi login
              (TECH-SPEC bagian 7).
            </li>
          </ul>
        </Panel>
      </FadeIn>

      <FadeIn delay={0.35}>
        <div className="flex flex-wrap items-center gap-3">
          <Tombol href="/topik-3" varian="utama">
            Lihat Halaman Publik Topik 3
          </Tombol>
          <Link
            href="/"
            className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Kembali ke Beranda
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
