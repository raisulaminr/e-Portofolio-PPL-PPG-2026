'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { GAYA_TOMBOL, KELAS_DASAR_TOMBOL } from '@/components/Tombol';
import { KELAS_INPUT_FORM, KELAS_LABEL_FORM } from '@/components/gayaForm';

/**
 * Form login admin. Setelah berhasil, halaman diarahkan ke /admin dan
 * direfresh supaya server component-nya membaca sesi baru.
 */
export default function FormMasuk() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sandi, setSandi] = useState('');
  const [pesan, setPesan] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);

  async function masuk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPesan(null);
    setSibuk(true);

    try {
      const hasil = await signIn('credentials', { email, sandi, redirect: false });

      if (!hasil || hasil.error) {
        setPesan('Email atau sandi salah.');
        return;
      }

      router.replace('/admin');
      router.refresh();
    } catch {
      setPesan('Tidak bisa menghubungi server.');
    } finally {
      setSibuk(false);
    }
  }

  return (
    <form onSubmit={masuk} className="space-y-6">
      <div>
        <label htmlFor="email" className={KELAS_LABEL_FORM}>
          Email admin
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={`mt-2 min-h-11 ${KELAS_INPUT_FORM}`}
        />
      </div>

      <div>
        <label htmlFor="sandi" className={KELAS_LABEL_FORM}>
          Sandi
        </label>
        <input
          id="sandi"
          name="sandi"
          type="password"
          autoComplete="current-password"
          required
          value={sandi}
          onChange={(event) => setSandi(event.target.value)}
          className={`mt-2 min-h-11 ${KELAS_INPUT_FORM}`}
        />
      </div>

      <div aria-live="polite">
        {pesan ? (
          <p className="rounded-card border border-border bg-warning-soft px-4 py-3 text-sm text-warning">
            {pesan}
          </p>
        ) : null}
      </div>

      <button type="submit" disabled={sibuk} className={`${KELAS_DASAR_TOMBOL} ${GAYA_TOMBOL.utama}`}>
        {sibuk ? 'Memeriksa…' : 'Masuk'}
      </button>
    </form>
  );
}
