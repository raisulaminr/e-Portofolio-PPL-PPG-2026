'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { GAYA_TOMBOL, KELAS_DASAR_TOMBOL } from '@/components/Tombol';
import { KELAS_INPUT_FORM, KELAS_LABEL_FORM } from '@/components/gayaForm';
import type { Refleksi } from '@/lib/queries';

type NilaiForm = Record<
  | 'model_guru_dituju'
  | 'filosofi_mengajar'
  | 'refleksi_akhir'
  | 'kekuatan'
  | 'kelemahan'
  | 'rencana_tindak_lanjut',
  string
>;

type Kunci = keyof NilaiForm;

const FIELD: Array<{ field: Kunci; label: string; baris: number; petunjuk: string }> = [
  {
    field: 'model_guru_dituju',
    label: 'Model Guru yang Dituju',
    baris: 6,
    petunjuk: 'Gambaran sosok guru yang ingin dicapai ke depan, beserta alasannya.',
  },
  {
    field: 'filosofi_mengajar',
    label: 'Filosofi Mengajar',
    baris: 6,
    petunjuk:
      'Pandangan dan nilai yang dipegang dalam mengajar (versi mendalam; versi ringkas ada di Profil).',
  },
  {
    field: 'refleksi_akhir',
    label: 'Refleksi Akhir',
    baris: 8,
    petunjuk: 'Refleksi menyeluruh atas seluruh pengalaman PPL Mandiri.',
  },
  {
    field: 'kekuatan',
    label: 'Kekuatan',
    baris: 5,
    petunjuk: 'Apa yang sudah berjalan baik selama praktik mengajar.',
  },
  {
    field: 'kelemahan',
    label: 'Kelemahan',
    baris: 5,
    petunjuk: 'Apa yang masih menjadi tantangan atau kekurangan.',
  },
  {
    field: 'rencana_tindak_lanjut',
    label: 'Rencana Tindak Lanjut',
    baris: 5,
    petunjuk: 'Langkah pengembangan diri ke depan berdasarkan kekuatan dan kelemahan di atas.',
  },
];

/** Form modul Refleksi — tabel `refleksi` hanya punya satu baris (id = 1). */
export default function FormRefleksi({ refleksi }: { refleksi: Refleksi | null }) {
  const router = useRouter();

  const [nilai, setNilai] = useState<NilaiForm>({
    model_guru_dituju: refleksi?.model_guru_dituju ?? '',
    filosofi_mengajar: refleksi?.filosofi_mengajar ?? '',
    refleksi_akhir: refleksi?.refleksi_akhir ?? '',
    kekuatan: refleksi?.kekuatan ?? '',
    kelemahan: refleksi?.kelemahan ?? '',
    rencana_tindak_lanjut: refleksi?.rencana_tindak_lanjut ?? '',
  });
  const [pesan, setPesan] = useState<{ tipe: 'sukses' | 'galat'; teks: string } | null>(null);
  const [sibuk, setSibuk] = useState(false);

  function ubah(field: Kunci, teks: string) {
    setNilai((lama) => ({ ...lama, [field]: teks }));
  }

  const kosong = FIELD.filter((item) => !nilai[item.field].trim()).map((item) => item.label);

  async function simpan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPesan(null);

    if (kosong.length > 0) {
      setPesan({ tipe: 'galat', teks: `Lengkapi dulu: ${kosong.join(', ')}.` });
      return;
    }

    setSibuk(true);
    try {
      const response = await fetch('/api/admin/refleksi', {
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

      setPesan({ tipe: 'sukses', teks: 'Tersimpan. Halaman Refleksi sudah memakai data ini.' });
      router.refresh();
    } catch {
      setPesan({ tipe: 'galat', teks: 'Tidak bisa menghubungi server.' });
    } finally {
      setSibuk(false);
    }
  }

  return (
    <form onSubmit={simpan} className="space-y-8">
      {FIELD.map((item) => (
        <div key={item.field}>
          <label htmlFor={item.field} className={KELAS_LABEL_FORM}>
            {item.label}
          </label>
          <textarea
            id={item.field}
            name={item.field}
            rows={item.baris}
            value={nilai[item.field]}
            onChange={(event) => ubah(item.field, event.target.value)}
            placeholder={item.petunjuk}
            className={`mt-2 leading-[1.6] ${KELAS_INPUT_FORM}`}
          />
          <p className="mt-2 text-sm leading-[1.6] text-muted">{item.petunjuk}</p>
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

      <button type="submit" disabled={sibuk} className={`${KELAS_DASAR_TOMBOL} ${GAYA_TOMBOL.utama}`}>
        {sibuk ? 'Menyimpan…' : 'Simpan refleksi'}
      </button>
    </form>
  );
}
