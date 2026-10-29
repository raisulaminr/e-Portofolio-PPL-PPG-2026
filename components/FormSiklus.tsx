'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { GAYA_TOMBOL, KELAS_DASAR_TOMBOL } from '@/components/Tombol';
import { KELAS_INPUT_FORM, KELAS_LABEL_FORM } from '@/components/gayaForm';
import { folderHasilKerjaSiklus } from '@/lib/dokumentasi';
import {
  ARTEFAK_SIKLUS,
  jumlahArtefakTerisi,
  labelWajibYangKosong,
  type ArtefakTerisi,
  type KolomSemuaSiklus,
} from '@/lib/siklus';
import type { Siklus } from '@/lib/queries';

type NilaiForm = Record<
  | 'judul_topik'
  | 'media_deskripsi'
  | 'hasil_kerja_siswa_deskripsi'
  | 'catatan_reflektif'
  | 'status'
  | 'is_uas_pilihan'
  | KolomSemuaSiklus,
  string
>;

/**
 * Form admin satu siklus. Dipakai untuk siklus 1 (UTS) sekarang, dan akan
 * dipakai apa adanya untuk siklus 2 (UAS) — bedanya cuma prop `nomorSiklus`.
 * Menulis lewat satu route handler dinamis /api/admin/[resource] (TECH-SPEC bagian 7).
 */
export default function FormSiklus({
  nomorSiklus,
  modul,
  siklus,
}: {
  nomorSiklus: number;
  modul: string;
  siklus: Siklus | null;
}) {
  const router = useRouter();

  const [nilai, setNilai] = useState<NilaiForm>({
    judul_topik: siklus?.judul_topik ?? '',
    rpp_url: siklus?.rpp_url ?? '',
    materi_url: siklus?.materi_url ?? '',
    media_url: siklus?.media_url ?? '',
    media_deskripsi: siklus?.media_deskripsi ?? '',
    hasil_kerja_siswa_url: siklus?.hasil_kerja_siswa_url ?? '',
    hasil_kerja_siswa_deskripsi: siklus?.hasil_kerja_siswa_deskripsi ?? '',
    penilaian_gp_url: siklus?.penilaian_gp_url ?? '',
    penilaian_dpl_url: siklus?.penilaian_dpl_url ?? '',
    video_url: siklus?.video_url ?? '',
    instrumen_penilaian_url: siklus?.instrumen_penilaian_url ?? '',
    catatan_reflektif: siklus?.catatan_reflektif ?? '',
    status: siklus?.status ?? 'draft',
    // Penanda produk UAS (PRD.md bagian 5) — hanya berlaku untuk siklus 2.
    is_uas_pilihan: siklus?.is_uas_pilihan ? '1' : '0',
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

  const terisi: ArtefakTerisi = {
    rpp_url: nilai.rpp_url.trim() || null,
    materi_url: nilai.materi_url.trim() || null,
    media_url: nilai.media_url.trim() || null,
    hasil_kerja_siswa_url: nilai.hasil_kerja_siswa_url.trim() || null,
    penilaian_gp_url: nilai.penilaian_gp_url.trim() || null,
    penilaian_dpl_url: nilai.penilaian_dpl_url.trim() || null,
    video_url: nilai.video_url.trim() || null,
    instrumen_penilaian_url: nilai.instrumen_penilaian_url.trim() || null,
  };
  const wajibKosong = labelWajibYangKosong(terisi);
  const lengkap = nilai.status === 'lengkap' && wajibKosong.length === 0;

  async function simpan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPesan(null);

    if (!nilai.judul_topik.trim()) {
      setPesan({ tipe: 'galat', teks: 'Judul topik wajib diisi.' });
      return;
    }
    if (nilai.status === 'lengkap' && wajibKosong.length > 0) {
      setPesan({
        tipe: 'galat',
        teks: `Status "lengkap" belum bisa dipakai — lengkapi dulu: ${wajibKosong.join(', ')}.`,
      });
      return;
    }

    setSibuk(true);
    try {
      const response = await fetch('/api/admin/siklus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomor_siklus: nomorSiklus, ...nilai }),
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

      setPesan({ tipe: 'sukses', teks: 'Tersimpan. Halaman publik sudah memakai data ini.' });
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
        <span className={KELAS_LABEL_FORM}>
          Siklus {nomorSiklus} · {modul}
        </span>
        <span className={KELAS_LABEL_FORM}>
          {jumlahArtefakTerisi(terisi)}/{ARTEFAK_SIKLUS.length} artefak terisi
        </span>
        {lengkap ? <span className="text-sm text-success">Siap ditandai lengkap.</span> : null}
      </div>

      <div>
        <label htmlFor="judul_topik" className={KELAS_LABEL_FORM}>
          Judul topik pembelajaran
        </label>
        <input
          id="judul_topik"
          name="judul_topik"
          type="text"
          required
          value={nilai.judul_topik}
          onChange={(event) => ubah('judul_topik', event.target.value)}
          placeholder="Mis. Pengenalan Algoritma dan Pemrograman Dasar"
          className={`mt-2 min-h-11 ${KELAS_INPUT_FORM}`}
        />
      </div>

      {ARTEFAK_SIKLUS.map((artefak) => (
        <div key={artefak.field}>
          <label htmlFor={artefak.field} className={KELAS_LABEL_FORM}>
            {artefak.judul}
          </label>
          <input
            id={artefak.field}
            name={artefak.field}
            type={artefak.dukungGaleriFoto ? 'text' : 'url'}
            inputMode={artefak.dukungGaleriFoto ? 'text' : 'url'}
            value={nilai[artefak.field]}
            onChange={(event) => ubah(artefak.field, event.target.value)}
            placeholder={
              artefak.dukungGaleriFoto
                ? folderHasilKerjaSiklus(nomorSiklus)
                : artefak.jenis === 'video'
                  ? 'https://youtu.be/… atau Drive'
                  : 'https://drive.google.com/…'
            }
            className={`mt-2 min-h-11 ${KELAS_INPUT_FORM}`}
          />
          <p className="mt-2 text-sm leading-[1.6] text-muted">
            {artefak.deskripsi}
            {artefak.dukungGaleriFoto
              ? ` Isi jalur folder foto di public/ (mis. ${folderHasilKerjaSiklus(nomorSiklus)}) supaya foto 1.jpg, 2.jpg, … tampil sebagai carousel — tautan Drive/gambar publik tetap bisa dipakai.`
              : ''}
            {artefak.jenis === 'video' ? ' Tautan ini di-embed sebagai iframe, bukan tombol link.' : ''}
          </p>

          {artefak.deskripsiField ? (
            <div className="mt-4">
              <label htmlFor={artefak.deskripsiField} className={KELAS_LABEL_FORM}>
                {artefak.deskripsiFieldLabel ?? 'Deskripsi'}
              </label>
              <textarea
                id={artefak.deskripsiField}
                name={artefak.deskripsiField}
                rows={3}
                value={nilai[artefak.deskripsiField]}
                onChange={(event) => ubah(artefak.deskripsiField!, event.target.value)}
                placeholder={
                  artefak.deskripsiField === 'media_deskripsi'
                    ? 'Apa medianya, kenapa dipilih, dan bagaimana cara pakainya di kelas.'
                    : 'Konteks singkat hasil kerja yang ditampilkan.'
                }
                className={`mt-2 leading-[1.6] ${KELAS_INPUT_FORM}`}
              />
            </div>
          ) : null}
        </div>
      ))}

      <div>
        <label htmlFor="catatan_reflektif" className={KELAS_LABEL_FORM}>
          Catatan reflektif
        </label>
        <textarea
          id="catatan_reflektif"
          name="catatan_reflektif"
          rows={8}
          value={nilai.catatan_reflektif}
          onChange={(event) => ubah('catatan_reflektif', event.target.value)}
          placeholder="Refleksi setelah siklus ini: apa yang berjalan, apa yang tidak, dan rencana perbaikannya."
          className={`mt-2 leading-[1.6] ${KELAS_INPUT_FORM}`}
        />
      </div>

      <div>
        <label htmlFor="status" className={KELAS_LABEL_FORM}>
          Status
        </label>
        <select
          id="status"
          name="status"
          value={nilai.status}
          onChange={(event) => ubah('status', event.target.value)}
          className={`mt-2 min-h-11 ${KELAS_INPUT_FORM}`}
        >
          <option value="draft">Draft — belum siap dinilai</option>
          <option value="lengkap">Lengkap — siap ditampilkan</option>
        </select>
        {wajibKosong.length > 0 ? (
          <p className="mt-2 text-sm text-warning">
            Status &quot;lengkap&quot; menuntut artefak ini terisi: {wajibKosong.join(', ')}.
          </p>
        ) : null}
      </div>

      {nomorSiklus >= 2 ? (
        <div className="rounded-card border border-border bg-surface-muted p-4">
          <label htmlFor="is_uas_pilihan" className="flex cursor-pointer items-start gap-3">
            <input
              id="is_uas_pilihan"
              name="is_uas_pilihan"
              type="checkbox"
              checked={nilai.is_uas_pilihan === '1'}
              onChange={(event) => ubah('is_uas_pilihan', event.target.checked ? '1' : '0')}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"
            />
            <span className="min-w-0">
              <span className={KELAS_LABEL_FORM}>Jadikan produk UAS</span>
              <span className="mt-1 block text-sm leading-[1.6] text-muted">
                Tandai siklus ini sebagai satu produk terbaik (RPP + video) yang tampil di halaman UAS.
                Menyalakannya membuat halaman /uas menampilkan siklus ini. Karena hanya ada dua siklus,
                toggle ini hanya perlu disekali centang di siklus 2.
              </span>
            </span>
          </label>
          {nilai.is_uas_pilihan === '1' && nilai.status !== 'lengkap' ? (
            <p className="mt-2 text-sm text-warning">
              Siklus ini belum berstatus &quot;lengkap&quot; — lengkapi RPP dan video dulu supaya produk
              UAS-nya tampil utuh.
            </p>
          ) : null}
        </div>
      ) : null}

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
          {sibuk ? 'Menyimpan…' : 'Simpan siklus'}
        </button>
      </div>
    </form>
  );
}
