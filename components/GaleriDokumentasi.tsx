'use client';

import { useEffect, useState } from 'react';
import BelumDiisi from '@/components/BelumDiisi';
import { GAYA_TOMBOL, KELAS_DASAR_TOMBOL } from '@/components/Tombol';
import { MAKS_FOTO, fotoTunggal, kandidatFoto, pesanBelumAdaFoto } from '@/lib/dokumentasi';

const LABEL = 'font-mono text-xs leading-[1.2] font-semibold tracking-wide text-muted uppercase';

/**
 * Carousel foto dokumentasi satu kegiatan nonmengajar: berkas statis di
 * `public/`, satu folder per kegiatan, bernomor 1.jpg, 2.jpg, 3.jpg, …
 * (aturannya di lib/dokumentasi.ts).
 *
 * Jumlah foto tidak ditulis di mana pun — komponen ini mencoba nomor berikutnya
 * sampai berkasnya tidak ada, jadi menambah foto cukup dengan menaruh berkas
 * bernomor lebih besar di foldernya.
 *
 * Pemeriksaan berkas itu berjalan di browser (hanya browser yang tahu berkas
 * mana yang ada di `public/`), karena itu foto muncul setelah pemeriksaan
 * singkat — halaman tidak pernah menampilkan gambar rusak.
 */
export default function GaleriDokumentasi({
  folder,
  judul,
  label = 'Dokumentasi',
}: {
  /** Jalur folder atau satu berkas di `public/`, mis. `/dokumentasi/piket-pagi`. */
  folder: string;
  /** Nama kegiatan — dipakai menyusun teks alternatif tiap foto. */
  judul: string;
  label?: string;
}) {
  const [foto, setFoto] = useState<string[]>([]);
  const [siap, setSiap] = useState(false);
  const [aktif, setAktif] = useState(0);

  useEffect(() => {
    let dibatalkan = false;

    // Satu berkas gambar (mis. /dokumentasi/piket-pagi/1.jpg): tidak ada yang
    // perlu dicari lagi.
    const tunggal = fotoTunggal(folder);
    if (tunggal) {
      setFoto([tunggal]);
      setSiap(true);
      return;
    }

    /** `true` kalau berkasnya berhasil dimuat browser. */
    const adaGambar = (url: string) =>
      new Promise<boolean>((selesai) => {
        const gambar = new Image();
        gambar.onload = () => selesai(true);
        gambar.onerror = () => selesai(false);
        gambar.src = url;
      });

    (async () => {
      const ketemu: string[] = [];
      let ekstensiDisukai: string | null = null;

      // Berkas dicoba berurutan — itu satu-satunya cara tahu nomor mana yang
      // sudah terisi, dan berhenti begitu nomornya kosong.
      for (let nomor = 1; nomor <= MAKS_FOTO; nomor += 1) {
        let berhasil: string | null = null;

        for (const kandidat of kandidatFoto(folder, nomor, ekstensiDisukai)) {
          if (dibatalkan) return;
          if (await adaGambar(kandidat.url)) {
            berhasil = kandidat.url;
            ekstensiDisukai = kandidat.ekstensi;
            break;
          }
        }

        if (!berhasil) break;
        ketemu.push(berhasil);
      }

      if (dibatalkan) return;
      setFoto(ketemu);
      setSiap(true);
    })();

    return () => {
      dibatalkan = true;
    };
  }, [folder]);

  if (!siap) {
    return <BelumDiisi pesan="Memeriksa foto dokumentasi…" />;
  }

  if (foto.length === 0) {
    return <BelumDiisi pesan={pesanBelumAdaFoto(folder)} />;
  }

  const gambarAktif = foto[Math.min(aktif, foto.length - 1)];

  function geser(arah: number) {
    setAktif((lama) => (lama + arah + foto.length) % foto.length);
  }

  return (
    <div className="space-y-3">
      <figure className="overflow-hidden rounded-card border border-border bg-surface-muted">
        {/* eslint-disable-next-line @next/next/no-img-element -- berkas statis di public/, tanpa optimasi next/image. */}
        <img
          src={gambarAktif}
          alt={`${judul} · foto ${aktif + 1} dari ${foto.length}`}
          decoding="async"
          className="mx-auto max-h-[70vh] w-auto max-w-full object-contain"
        />
      </figure>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className={LABEL}>{label}</span>

        {foto.length > 1 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => geser(-1)}
              aria-label="Foto dokumentasi sebelumnya"
              className={`${KELAS_DASAR_TOMBOL} ${GAYA_TOMBOL.garis} px-3.5 py-1.5`}
            >
              <span aria-hidden>←</span>
            </button>
            <button
              type="button"
              onClick={() => geser(1)}
              aria-label="Foto dokumentasi berikutnya"
              className={`${KELAS_DASAR_TOMBOL} ${GAYA_TOMBOL.garis} px-3.5 py-1.5`}
            >
              <span aria-hidden>→</span>
            </button>
            <span aria-live="polite" className={LABEL}>
              {aktif + 1} / {foto.length}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
