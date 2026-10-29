'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import IsianLimaKomponen from '@/components/IsianLimaKomponen';
import { GAYA_TOMBOL, KELAS_DASAR_TOMBOL } from '@/components/Tombol';
import { KELAS_LABEL_FORM } from '@/components/gayaForm';
import { labelKomponenKosong, type KolomAnalisis } from '@/lib/analisis';
import type { ArtefakSiklus } from '@/lib/siklus';

type NilaiForm = Record<KolomAnalisis, string>;

const KOSONG: NilaiForm = {
  konteks: '',
  tujuan: '',
  kelebihan: '',
  kekurangan: '',
  kajian_teori: '',
};

/**
 * Form admin analisis SATU artefak siklus (UTS/UAS). Halaman /admin/siklus/[nomor]/analisis
 * menampilkan satu form ini per field artefak, jadi tiap artefak bisa disimpan
 * sendiri-sendiri (lima komponen: konteks, tujuan, kelebihan, kekurangan,
 * kajian teori) — pola yang sama dengan form analisis Topik 3, tapi narasinya
 * memang berbeda per modul (PRD.md bagian 4.4 & 4.5).
 *
 * Menulis lewat satu route handler dinamis /api/admin/[resource] (TECH-SPEC bagian 7).
 */
export default function FormAnalisisArtefak({
  nomorSiklus,
  modul,
  artefak,
  nilaiAwal,
  sudahAda,
}: {
  nomorSiklus: number;
  modul: string;
  artefak: ArtefakSiklus;
  nilaiAwal: NilaiForm;
  sudahAda: boolean;
}) {
  const router = useRouter();
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
      const response = await fetch('/api/admin/analisis-siklus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomor_siklus: nomorSiklus, field: artefak.field, ...nilai }),
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
    if (!window.confirm(`Kosongkan analisis "${artefak.label}" siklus ${nomorSiklus}?`)) return;

    setPesan(null);
    setSibuk(true);
    try {
      const response = await fetch(
        `/api/admin/analisis-siklus?nomor_siklus=${nomorSiklus}&field=${encodeURIComponent(artefak.field)}`,
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
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className={KELAS_LABEL_FORM}>
          Siklus {nomorSiklus} · {modul}
        </span>
        <span className={KELAS_LABEL_FORM}>
          {sudahAda ? 'Analisis sudah diisi' : 'Belum diisi'}
        </span>
      </div>

      <IsianLimaKomponen
        nilai={nilai}
        onUbah={ubah}
        idPrefix={`siklus-${nomorSiklus}-${artefak.field}-`}
      />

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
          {sibuk ? 'Menyimpan…' : 'Simpan analisis'}
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
