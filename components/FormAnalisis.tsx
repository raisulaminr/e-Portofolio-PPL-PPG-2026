'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { GAYA_TOMBOL, KELAS_DASAR_TOMBOL } from '@/components/Tombol';
import IsianLimaKomponen from '@/components/IsianLimaKomponen';
import { KELAS_LABEL_FORM } from '@/components/gayaForm';
import { labelKomponenKosong, type KolomAnalisis } from '@/lib/analisis';
import type { DefinisiKategori } from '@/lib/kategori';

type NilaiForm = Record<KolomAnalisis, string>;

const KOSONG: NilaiForm = {
  konteks: '',
  tujuan: '',
  kelebihan: '',
  kekurangan: '',
  kajian_teori: '',
};

/**
 * Form admin satu kategori analisis Topik 3. Lima komponen dianalisis sebagai
 * field terpisah (PRD.md bagian 4.3 & rubrik LMS §10), bukan satu narasi.
 * Artefaknya dibaca dari entitas praktik mengajar terbimbing (atau kegiatan
 * nonmengajar untuk kategori 05), jadi tidak dipilih lagi di sini.
 * Menulis lewat satu route handler dinamis /api/admin/[resource] supaya jumlah
 * serverless function di Vercel Hobby tetap kecil — TECH-SPEC.md bagian 7.
 */
export default function FormAnalisis({
  kategori,
  nilaiAwal,
  sudahAda,
}: {
  kategori: DefinisiKategori;
  nilaiAwal: NilaiForm;
  sudahAda: boolean;
}) {
  const router = useRouter();
  const pakaiTerbimbing = kategori.sumber === 'terbimbing';

  const [nilai, setNilai] = useState<NilaiForm>(nilaiAwal);
  const [pesan, setPesan] = useState<{ tipe: 'sukses' | 'galat'; teks: string } | null>(null);
  const [sibuk, setSibuk] = useState(false);

  function ubah(field: KolomAnalisis, teks: string) {
    setNilai((lama) => ({ ...lama, [field]: teks }));
  }

  const kosong = labelKomponenKosong(nilai);

  async function simpan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPesan(null);

    if (kosong.length > 0) {
      setPesan({ tipe: 'galat', teks: `Lengkapi dulu: ${kosong.join(', ')}.` });
      return;
    }

    setSibuk(true);
    try {
      const response = await fetch('/api/admin/analisis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kategori: kategori.slug, ...nilai }),
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

      setPesan({ tipe: 'sukses', teks: 'Tersimpan. Halaman publik sudah memakai teks ini.' });
      router.refresh();
    } catch {
      setPesan({ tipe: 'galat', teks: 'Tidak bisa menghubungi server.' });
    } finally {
      setSibuk(false);
    }
  }

  async function kosongkan() {
    if (!window.confirm(`Kosongkan analisis kategori "${kategori.judul}"?`)) return;

    setPesan(null);
    setSibuk(true);
    try {
      const response = await fetch(
        `/api/admin/analisis?kategori=${encodeURIComponent(kategori.slug)}`,
        { method: 'DELETE' },
      );
      const hasil = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (response.status === 401) {
        setPesan({ tipe: 'galat', teks: 'Sesi berakhir. Silakan masuk lagi.' });
        router.replace('/masuk');
        return;
      }

      if (!response.ok || !hasil?.ok) {
        setPesan({ tipe: 'galat', teks: hasil?.error ?? 'Gagal menghapus.' });
        return;
      }

      setNilai(KOSONG);
      setPesan({ tipe: 'sukses', teks: 'Analisis dikosongkan.' });
      router.refresh();
    } catch {
      setPesan({ tipe: 'galat', teks: 'Tidak bisa menghubungi server.' });
    } finally {
      setSibuk(false);
    }
  }

  return (
    <form onSubmit={simpan} className="space-y-8">
      <div>
        <p className={KELAS_LABEL_FORM}>Kategori</p>
        <p className="mt-2 inline-flex items-center rounded-full border border-border bg-surface-muted px-3 py-1.5 font-mono text-xs leading-[1.2] font-semibold tracking-wide text-foreground uppercase">
          {String(kategori.nomor).padStart(2, '0')} · {kategori.slug}
        </p>
        <p className="mt-2 text-sm leading-[1.6] text-muted">
          Kategori ini tetap — yang bisa diubah hanya lima komponen analisisnya.
        </p>
      </div>

      <div className="rounded-card border border-border bg-surface-muted px-4 py-3">
        <p className={KELAS_LABEL_FORM}>Artefak</p>
        {pakaiTerbimbing ? (
          <p className="mt-1 text-sm leading-[1.6] text-muted">
            Artefak kategori ini dibaca dari entitas{' '}
            <span className="font-medium text-foreground">praktik mengajar terbimbing</span> — isi RPP,
            materi, media, video, dan instrumen penilaiannya di{' '}
            <Link href="/admin/terbimbing" className="font-medium text-accent-teks hover:opacity-80">
              halaman terbimbing
            </Link>
            . Tidak ada kaitan dengan siklus UTS/UAS.
          </p>
        ) : (
          <p className="mt-1 text-sm leading-[1.6] text-muted">
            Kategori nonmengajar tidak terikat siklus — artefaknya ditarik dari tabel{' '}
            <code className="font-mono text-xs">kegiatan_nonmengajar</code> (PRD.md bagian 5).
          </p>
        )}
      </div>

      <IsianLimaKomponen nilai={nilai} onUbah={ubah} idPrefix={`analisis-${kategori.slug}-`} />

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
          {sibuk ? 'Menyimpan…' : 'Simpan'}
        </button>

        {sudahAda ? (
          <button
            type="button"
            onClick={kosongkan}
            disabled={sibuk}
            className={`${KELAS_DASAR_TOMBOL} ${GAYA_TOMBOL.garis}`}
          >
            Kosongkan
          </button>
        ) : null}
      </div>
    </form>
  );
}
