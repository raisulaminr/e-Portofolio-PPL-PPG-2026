'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import Tombol from '@/components/Tombol';

/** Navigasi utama: tiga modul penilaian + Refleksi — PRD bagian 4.1. */
const NAV_UTAMA = [
  { href: '/', label: 'Beranda' },
  { href: '/topik-3', label: 'Topik 3' },
  { href: '/uts', label: 'UTS' },
  { href: '/uas', label: 'UAS' },
  { href: '/refleksi', label: 'Refleksi' },
] as const;

/** Profil naik jadi tombol aksi kanan, seperti "START FREE" pada acuan visual. */
const NAV_AKSI = { href: '/profil', label: 'Profil' } as const;

const KELAS_ITEM_STRIP =
  'inline-flex items-center border-l border-border px-5 py-4 font-mono text-xs leading-[1.2] font-semibold tracking-wide uppercase transition-colors';

function LogoMark() {
  return (
    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-primary text-primary-foreground">
      <svg
        viewBox="0 0 28 20"
        className="h-3.5 w-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
      >
        <circle cx="9" cy="10" r="6.2" />
        <circle cx="19" cy="10" r="6.2" />
      </svg>
    </span>
  );
}

/**
 * Nav bar strip seperti acuan visual DESIGN.md: satu batang penuh dengan pemisah
 * vertikal antar item, label mono uppercase, dan item aktif berupa BLOK SOLID
 * primary berteks gelap. Tiga zona tetap dipertahankan (logo kiri · nav tengah ·
 * aksi kanan) dan menu mobile masih bisa dibuka-tutup.
 */
export default function SiteHeader() {
  const pathname = usePathname();
  const [terbuka, setTerbuka] = useState(false);

  const isAktif = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-stretch justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3"
          onClick={() => setTerbuka(false)}
          aria-label="Beranda e-Portofolio PPG 2026"
        >
          <LogoMark />
          <span className="hidden text-sm font-medium text-foreground sm:inline">e-Portofolio</span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-stretch md:flex">
          {NAV_UTAMA.map((item) => {
            const aktif = isAktif(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={aktif ? 'page' : undefined}
                className={`${KELAS_ITEM_STRIP} ${
                  aktif
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted hover:bg-surface hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-stretch">
          <div className="flex items-center gap-3 border-l border-border px-4">
            <ThemeToggle />

            <Tombol href={NAV_AKSI.href} varian="utama" className="hidden sm:inline-flex">
              {NAV_AKSI.label}
            </Tombol>

            <button
              type="button"
              onClick={() => setTerbuka((nilai) => !nilai)}
              aria-expanded={terbuka}
              aria-controls="menu-mobile"
              aria-label={terbuka ? 'Tutup menu' : 'Buka menu'}
              className="inline-flex h-10 items-center justify-center rounded-control border border-border px-3 text-muted transition-colors hover:border-primary/50 hover:text-foreground md:hidden"
            >
              <span aria-hidden>{terbuka ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {terbuka ? (
          <motion.nav
            id="menu-mobile"
            aria-label="Navigasi utama (mobile)"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden border-t border-border bg-background md:hidden"
          >
            <div className="mx-auto flex max-w-6xl flex-col">
              {[...NAV_UTAMA, NAV_AKSI].map((item) => {
                const aktif = isAktif(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setTerbuka(false)}
                    aria-current={aktif ? 'page' : undefined}
                    className={`inline-flex min-h-11 items-center border-b border-border px-4 font-mono text-xs leading-[1.2] font-semibold tracking-wide uppercase transition-colors ${
                      aktif
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted hover:bg-surface hover:text-foreground'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}