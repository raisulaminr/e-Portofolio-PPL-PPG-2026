'use client';

import { signOut } from 'next-auth/react';
import { GAYA_TOMBOL, KELAS_DASAR_TOMBOL } from '@/components/Tombol';

/** Keluar dari sesi admin lalu kembali ke halaman login. */
export default function TombolKeluar() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/masuk' })}
      className={`${KELAS_DASAR_TOMBOL} ${GAYA_TOMBOL.garis} px-3.5 py-1.5`}
    >
      Keluar
    </button>
  );
}
