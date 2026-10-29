'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { GAYA_TOMBOL, KELAS_DASAR_TOMBOL } from '@/components/Tombol';
import { KELAS_INPUT_FORM, KELAS_LABEL_FORM } from '@/components/gayaForm';
import type { Profil } from '@/lib/queries';

type NilaiForm = Record<
  | 'nama'
  | 'program_studi'
  | 'lptk'
  | 'sekolah_ppl'
  | 'mapel'
  | 'kelas_fase'
  | 'kontak'
  | 'pengantar_eportofolio'
  | 'tentang_saya'
  | 'filosofi_hidup'
  | 'identitas_profesional',
  string
>;

type Kunci = keyof NilaiForm;

/** Field pendek: satu kolom input. Field naratif ditulis sebagai textarea. */
const FIELD_PENDEK: Array<{ field: Kunci; label: string; contoh: string }> = [
  { field: 'nama', label: 'Nama lengkap', contoh: 'Raisul Amin R, S.Kom.' },
  { field: 'program_studi', label: 'Program studi (PPG)', contoh: 'Pendidikan Informatika' },
  { field: 'lptk', label: 'LPTK', contoh: 'Universitas Islam Makassar' },
  { field: 'sekolah_ppl', label: 'Sekolah PPL', contoh: 'SMA Negeri 22 Makassar' },
  { field: 'mapel', label: 'Mata pelajaran', contoh: 'Informatika & KKA' },
  { field: 'kelas_fase', label: 'Kelas / Fase', contoh: 'Kelas X / Fase E' },
];

const FIELD_NARASI: Array<{ field: Kunci; label: string; baris: number; petunjuk: string }> = [
  {
    field: 'pengantar_eportofolio',
    label: 'Pengantar e-portofolio',
    baris: 6,
    petunjuk:
      'Paragraf pengantar yang tampil di Beranda: jelaskan apa isi portofolio ini dan untuk apa disusun. Pisahkan paragraf dengan Enter.',
  },
  {
    field: 'kontak',
    label: 'Kontak',
    baris: 3,
    petunjuk:
      'Email dan/atau nomor WA/media sosial yang boleh dilihat publik. Tampil di Beranda dan Profil; pisahkan dengan Enter bila lebih dari satu.',
  },
  {
    field: 'identitas_profesional',
    label: 'Identitas profesional',
    baris: 2,
    petunjuk: 'Satu kalimat identitas yang tampil besar di Beranda dan Profil.',
  },
  {
    field: 'tentang_saya',
    label: 'Tentang saya',
    baris: 8,
    petunjuk: 'Latar belakang dan perjalanan menuju PPG. Pisahkan paragraf dengan Enter.',
  },
  {
    field: 'filosofi_hidup',
    label: 'Filosofi hidup / mengajar',
    baris: 8,
    petunjuk: 'Nilai dan pandangan mengajar yang dipegang. Pisahkan paragraf dengan Enter.',
  },
];

/** Form profil mahasiswa — tabel `profil` hanya punya satu baris (id = 1). */
export default function FormProfil({ profil }: { profil: Profil | null }) {
  const router = useRouter();

  const [nilai, setNilai] = useState<NilaiForm>({
    nama: profil?.nama ?? '',
    program_studi: profil?.program_studi ?? '',
    lptk: profil?.lptk ?? '',
    sekolah_ppl: profil?.sekolah_ppl ?? '',
    mapel: profil?.mapel ?? '',
    kelas_fase: profil?.kelas_fase ?? '',
    kontak: profil?.kontak ?? '',
    pengantar_eportofolio: profil?.pengantar_eportofolio ?? '',
    tentang_saya: profil?.tentang_saya ?? '',
    filosofi_hidup: profil?.filosofi_hidup ?? '',
    identitas_profesional: profil?.identitas_profesional ?? '',
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

  async function simpan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPesan(null);

    if (!nilai.nama.trim()) {
      setPesan({ tipe: 'galat', teks: 'Nama wajib diisi.' });
      return;
    }

    setSibuk(true);
    try {
      const response = await fetch('/api/admin/profil', {
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

      setPesan({ tipe: 'sukses', teks: 'Tersimpan. Halaman Beranda dan Profil sudah memakai data ini.' });
      router.refresh();
    } catch {
      setPesan({ tipe: 'galat', teks: 'Tidak bisa menghubungi server.' });
    } finally {
      setSibuk(false);
    }
  }

  return (
    <form onSubmit={simpan} className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        {FIELD_PENDEK.map((item) => (
          <div key={item.field}>
            <label htmlFor={item.field} className={KELAS_LABEL_FORM}>
              {item.label}
            </label>
            <input
              id={item.field}
              name={item.field}
              type="text"
              required={item.field === 'nama'}
              value={nilai[item.field]}
              onChange={(event) => ubah(item.field, event.target.value)}
              placeholder={item.contoh}
              className={`mt-2 min-h-11 ${KELAS_INPUT_FORM}`}
            />
          </div>
        ))}
      </div>

      {FIELD_NARASI.map((item) => (
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
            className={`mt-2 leading-[1.6] ${KELAS_INPUT_FORM}`}
          />
          <p className="mt-2 text-sm leading-[1.6] text-muted">{item.petunjuk}</p>
        </div>
      ))}

      <div aria-live="polite">
        {pesan ? (
          <p
            className={`rounded-card border px-4 py-3 text-sm ${pesan.tipe === 'sukses'
                ? 'border-border bg-success-soft text-success'
                : 'border-border bg-warning-soft text-warning'
              }`}
          >
            {pesan.teks}
          </p>
        ) : null}
      </div>

      <button type="submit" disabled={sibuk} className={`${KELAS_DASAR_TOMBOL} ${GAYA_TOMBOL.utama}`}>
        {sibuk ? 'Menyimpan…' : 'Simpan profil'}
      </button>
    </form>
  );
}
