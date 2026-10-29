'use client';

import { useEffect, useState } from 'react';

const KUNCI_TEMA = 'tema';
const LAMA_TRANSISI_MS = 300;

/**
 * Pengalih tema gelap/terang. Kelas `.dark` pada <html> jadi sumber kebenaran
 * (sudah diset oleh skrip di layout), komponen ini hanya menyinkronkan label
 * dan memasang kelas `.tema-beralih` sesaat supaya warna ikut memudar.
 */
export default function ThemeToggle() {
  const [gelap, setGelap] = useState(true);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    setGelap(document.documentElement.classList.contains('dark'));
    setSiap(true);
  }, []);

  const gantiTema = () => {
    const berikutnya = !gelap;
    const akar = document.documentElement;
    const bolehBergerak = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (bolehBergerak) {
      akar.classList.add('tema-beralih');
      window.setTimeout(() => akar.classList.remove('tema-beralih'), LAMA_TRANSISI_MS);
    }

    setGelap(berikutnya);
    akar.classList.toggle('dark', berikutnya);
    try {
      localStorage.setItem(KUNCI_TEMA, berikutnya ? 'gelap' : 'terang');
    } catch {
      // localStorage bisa diblokir (mode privasi); tema tetap berganti untuk sesi ini.
    }
  };

  const label = gelap ? 'Aktifkan tema terang' : 'Aktifkan tema gelap';

  return (
    <button
      type="button"
      onClick={gantiTema}
      aria-label={label}
      title={label}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-control border border-border text-muted transition-colors hover:border-primary/50 hover:text-foreground"
    >
      <span aria-hidden className="text-sm leading-none">
        {siap ? (gelap ? '☀' : '☾') : ''}
      </span>
    </button>
  );
}
