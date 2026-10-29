'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { GAYA_TOMBOL, KELAS_DASAR_TOMBOL } from '@/components/Tombol';
import { KELAS_INPUT_FORM, KELAS_LABEL_FORM } from '@/components/gayaForm';
import { ARTEFAK_TERBIMBING } from '@/lib/terbimbing';
import { jumlahArtefakTerisi, type KolomSiklus } from '@/lib/siklus';
import type { Terbimbing } from '@/lib/queries';

type NilaiForm = Record<'judul_topik' | 'media_deskripsi' | KolomSiklus, string>;

/**
 * Form admin praktik mengajar terbimbing — satu entitas berisi lima artefak yang
 * dianalisis Topik 3 (RPP, materi, media, video, instrumen). Sengaja terpisah
 * dari form siklus: sesi terbimbing bukan bagian siklus 1 atau 2 (PRD.md bagian 5).
 * Menulis lewat satu route handler dinamis /api/admin/[resource] (TECH-SPEC bagian 7).
 */
export default function FormTerbimbing({ terbimbing }: { terbimbing: Terbimbing | null }) {
  const router = useRouter();

  const [nilai, setNilai] = useState<NilaiForm>({
    judul_topik: terbimbing?.judul_topik ?? '',
    rpp_url: terbimbing?.rpp_url ?? '',
    materi_url: terbimbing?.materi_url ?? '',
    media_url: terbimbing?.media_url ?? '',
    media_deskripsi: terbimbing?.media_deskripsi ?? '',
    video_url: terbimbing?.video_url ?? '',
    instrumen_penilaian_url: terbimbing?.instrumen_penilaian_url ?? '',
  });
  const [pesan, setPesan] = useState<{ tipe: 'sukses' | 'galat'; teks: string } | null>(null);
  const [sibuk, setSibuk] = useState(false);

  function ubah(field: keyof NilaiForm, teks: string) {
    setNilai((lama) => {
      const baru: NilaiForm = { ...lama };
      baru[field] = teks;
      return baru;
    });
  }

  const terisi: Record<KolomSiklus, string | null> = {
    rpp_url: nilai.rpp_url.trim() || null,
    materi_url: nilai.materi_url.trim() || null,
    media_url: nilai.media_url.trim() || null,
    video_url: nilai.video_url.trim() || null,
    instrumen_penilaian_url: nilai.instrumen_penilaian_url.trim() || null,
  };

  async function simpan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPesan(null);
    setSibuk(true);

    try {
      const response = await fetch('/api/admin/terbimbing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nilai),
      });
      const hasil = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (response.status === 401) {
        setPesan({ tipe: 'galat', teks: 'Sesi berakhir. Silakan masuk lagi.' });
        router.replace('/masuk');
        return;
      }

      if (!response.ok || !hasil?.ok) {
        setPesan({ tipe: 'galat', teks: hasil?.error ?? 'Gagal menyimpan. Coba lagi.' });
        return;
      }

      setPesan({ tipe: 'sukses', teks: 'Tersimpan. Halaman Topik 3 sudah memakai artefak ini.' });
      router.refresh();
    } catch {
      setPesan({ tipe: 'galat', teks: 'Tidak bisa menghubungi server.' });
    } finally {
      setSibuk(false);
    }
  }

  return (
    <form onSubmit={simpan} className="space-y-8">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className={KELAS_LABEL_FORM}>Praktik mengajar terbimbing</span>
        <span className={KELAS_LABEL_FORM}>
          {jumlahArtefakTerisi(terisi, ARTEFAK_TERBIMBING)}/{ARTEFAK_TERBIMBING.length} artefak terisi
        </span>
      </div>

      <div>
        <label htmlFor="judul_topik" className={KELAS_LABEL_FORM}>
          Judul topik pembelajaran (opsional)
        </label>
        <input
          id="judul_topik"
          name="judul_topik"
          type="text"
          value={nilai.judul_topik}
          onChange={(event) => ubah('judul_topik', event.target.value)}
          placeholder="Mis. Pengenalan Algoritma dan Pemrograman Dasar"
          className={`mt-2 min-h-11 ${KELAS_INPUT_FORM}`}
        />
      </div>

      {ARTEFAK_TERBIMBING.map((artefak) => (
        <div key={artefak.field}>
          <label htmlFor={artefak.field} className={KELAS_LABEL_FORM}>
            {artefak.judul}
          </label>
          <input
            id={artefak.field}
            name={artefak.field}
            type="url"
            inputMode="url"
            value={nilai[artefak.field]}
            onChange={(event) => ubah(artefak.field, event.target.value)}
            placeholder={
              artefak.jenis === 'video' ? 'https://youtu.be/… atau Drive' : 'https://drive.google.com/…'
            }
            className={`mt-2 min-h-11 ${KELAS_INPUT_FORM}`}
          />
          <p className="mt-2 text-sm leading-[1.6] text-muted">
            {artefak.deskripsi}
            {artefak.jenis === 'video' ? ' Tautan ini di-embed sebagai iframe, bukan tombol link.' : ''}
          </p>

          {artefak.deskripsiField === 'media_deskripsi' ? (
            <div className="mt-4">
              <label htmlFor="media_deskripsi" className={KELAS_LABEL_FORM}>
                Deskripsi media
              </label>
              <textarea
                id="media_deskripsi"
                name="media_deskripsi"
                rows={3}
                value={nilai.media_deskripsi}
                onChange={(event) => ubah('media_deskripsi', event.target.value)}
                placeholder="Apa medianya, kenapa dipilih, dan bagaimana cara pakainya di kelas."
                className={`mt-2 leading-[1.6] ${KELAS_INPUT_FORM}`}
              />
            </div>
          ) : null}
        </div>
      ))}

      <div aria-live="polite">
        {pesan ? (
          <p
            className={`rounded-card border px-4 py-3 text-sm ${
              pesan.tipe === 'sukses'
                ? 'border-border bg-success-soft text-success'
                : 'border-border bg-warning-soft text-warning'
            }`}
          >
            {pesan.teks}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={sibuk} className={`${KELAS_DASAR_TOMBOL} ${GAYA_TOMBOL.utama}`}>
          {sibuk ? 'Menyimpan…' : 'Simpan artefak terbimbing'}
        </button>
      </div>
    </form>
  );
}
