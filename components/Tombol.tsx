import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Tombol aksi sesuai acuan visual DESIGN.md: aksi utama memakai blok solid
 * primary #13A8FF dengan TEKS GELAP (kontras 6,8:1 — teks putih hanya 2,6:1),
 * aksi sekunder memakai outline terang transparan, aksi netral berbatas.
 * Radiusnya control (12px) seperti rounded-rectangle pada acuan — bukan pill.
 */
export type VarianTombol = 'utama' | 'sekunder' | 'garis';

/** Kelas bersama semua tombol — dipakai juga oleh tombol <button> biasa
 *  (mis. form admin) supaya bentuk dan radiusnya persis sama dengan Tombol. */
export const KELAS_DASAR_TOMBOL =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-60';

export const GAYA_TOMBOL: Record<VarianTombol, string> = {
  utama: 'bg-primary text-primary-foreground hover:brightness-110',
  sekunder: 'border border-foreground/60 bg-transparent text-foreground hover:bg-foreground/10',
  garis: 'border border-border bg-surface text-foreground hover:border-primary/60',
};

export default function Tombol({
  href,
  children,
  varian = 'utama',
  className = '',
}: {
  href: string;
  children: ReactNode;
  varian?: VarianTombol;
  className?: string;
}) {
  return (
    <Link href={href} className={`${KELAS_DASAR_TOMBOL} ${GAYA_TOMBOL[varian]} ${className}`}>
      {children}
    </Link>
  );
}