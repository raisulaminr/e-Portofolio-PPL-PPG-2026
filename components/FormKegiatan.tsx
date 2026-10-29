'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { GAYA_TOMBOL, KELAS_DASAR_TOMBOL } from '@/components/Tombol';
import { KELAS_INPUT_FORM, KELAS_LABEL_FORM } from '@/components/gayaForm';
import type { KegiatanNonmengajar } from '@/lib/queries';

type NilaiForm = Record<'nama_kegiatan' | 'tanggal' | 'dokumentasi_url' | 'deskripsi', string>;

/**
 * Form satu kegiatan nonmengajar. Tabelnya bebas (tidak terikat siklus),
 * jadi form ini bisa dipakai untuk membuat baris baru maupun menyunting
 * baris yang sudah ada — bedanya cuma prop `kegiatan`.
 */
export default function FormKegiatan({ kegiatan }: { kegiatan: KegiatanNonmengajar | null }) {
  const router = useRouter();

  const [nilai, setNilai] = useState<NilaiForm>({
    nama_kegiatan: kegiatan?.nama_kegiatan ?? '',
    tanggal: kegiatan?.tanggal ?? '',
    dokumentasi_url: kegiatan?.dokumentasi_url ?? '',
    deskripsi: kegiatan?.deskripsi ?? '',
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

    if (!nilai.nama_kegiatan.trim()) {
      setPesan({ tipe: 'galat', teks: 'Nama kegiatan wajib diisi.' });
      return;
    }

    setSibuk(true);
    try {
      const response = await fetch('/api/admin/nonmengajar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...nilai, id: kegiatan?.id ?? null }),
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

      if (!kegiatan) {
        setNilai({ nama_kegiatan: '', tanggal: '', dokumentasi_url: '', deskripsi: '' });
      }
      router.refresh();
    } catch {
      setPesan({ tipe: 'galat', teks: 'Tidak bisa menghubungi server.' });
    } finally {
      setSibuk(false);
    }
  }

  async function hapus() {
    if (!kegiatan) return;
    if (!window.confirm(`Hapus kegiatan "${kegiatan.nama_kegiatan}"?`)) return;

    setPesan(null);
    setSibuk(true);
    try {
      const response = await fetch(`/api/admin/nonmengajar?id=${kegiatan.id}`, { method: 'DELETE' });
      const hasil = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

      if (response.status === 401) {
        router.replace('/masuk');
        return;
      }

      if (!response.ok || !hasil?.ok) {
        setPesan({ tipe: 'galat', teks: hasil?.error ?? 'Gagal menghapus.' });
        return;
      }

      router.replace('/admin/nonmengajar');
      router.refresh();
    } catch {
      setPesan({ tipe: 'galat', teks: 'Tidak bisa menghubungi server.' });
    } finally {
      setSibuk(false);
    }
  }

  return (
    <form onSubmit={simpan} className="space-y-6">
      <div>
        <label htmlFor="nama_kegiatan" className={KELAS_LABEL_FORM}>
          Nama kegiatan
        </label>
        <input
          id="nama_kegiatan"
          name="nama_kegiatan"
          type="text"
          required
          value={nilai.nama_kegiatan}
          onChange={(event) => ubah('nama_kegiatan', event.target.value)}
          placeholder="Mis. Pendampingan Upacara Bendera / Piket Literasi"
          className={`mt-2 min-h-11 ${KELAS_INPUT_FORM}`}
        />
      </div>

      <div>
        <label htmlFor="tanggal" className={KELAS_LABEL_FORM}>
          Tanggal
        </label>
        <input
          id="tanggal"
          name="tanggal"
          type="date"
          value={nilai.tanggal}
          onChange={(event) => ubah('tanggal', event.target.value)}
          className={`mt-2 min-h-11 ${KELAS_INPUT_FORM}`}
        />
      </div>

      <div>
        <label htmlFor="deskripsi" className={KELAS_LABEL_FORM}>
          Deskripsi
        </label>
        <textarea
          id="deskripsi"
          name="deskripsi"
          rows={6}
          value={nilai.deskripsi}
          onChange={(event) => ubah('deskripsi', event.target.value)}
          placeholder="Apa yang dikerjakan, peran Anda, dan apa yang dipelajari dari kegiatan ini."
          className={`mt-2 leading-[1.6] ${KELAS_INPUT_FORM}`}
        />
      </div>

      <div>
        <label htmlFor="dokumentasi_url" className={KELAS_LABEL_FORM}>
          Tautan atau folder dokumentasi
        </label>
        {/* type="text", bukan "url": kolom ini juga menerima jalur folder di
            public/ (mis. /dokumentasi/piket-pagi) yang bukan URL berskema. */}
        <input
          id="dokumentasi_url"
          name="dokumentasi_url"
          type="text"
          inputMode="url"
          value={nilai.dokumentasi_url}
          onChange={(event) => ubah('dokumentasi_url', event.target.value)}
          placeholder="https://drive.google.com/… atau /dokumentasi/piket-pagi"
          className={`mt-2 min-h-11 ${KELAS_INPUT_FORM}`}
        />
        <p className="mt-2 text-sm leading-[1.6] text-muted">
          Dua pilihan: (1) folder foto di <code className="font-mono text-xs">public/</code>, isi kolom dengan
          jalurnya — mis. <code className="font-mono text-xs">/dokumentasi/piket-pagi</code> yang berisi
          berkas <code className="font-mono text-xs">1.jpg</code>,{' '}
          <code className="font-mono text-xs">2.jpg</code>, … — dan halaman publik menampilkannya sebagai
          carousel; atau (2) tautan Google Drive/gambar publik yang tampil langsung di halaman. Tautan bukan
          gambar tetap tampil sebagai tautan.
        </p>
        <p className="mt-2 text-sm leading-[1.6] text-muted">
          <strong className="font-medium text-foreground">Satu kegiatan = satu jalur.</strong> Kalau fotonya
          lebih dari satu, jangan diisi beberapa tautan sekaligus — taruh semua fotonya di folder itu dengan
          nama berurutan (<code className="font-mono text-xs">1.jpg</code>,{' '}
          <code className="font-mono text-xs">2.jpg</code>, …) dan halaman publik menampilkannya sebagai
          carousel.
        </p>
      </div>

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
          {sibuk ? 'Menyimpan…' : kegiatan ? 'Simpan perubahan' : 'Tambah kegiatan'}
        </button>

        {kegiatan ? (
          <button
            type="button"
            onClick={hapus}
            disabled={sibuk}
            className={`${KELAS_DASAR_TOMBOL} ${GAYA_TOMBOL.garis}`}
          >
            Hapus
          </button>
        ) : null}
      </div>
    </form>
  );
}
