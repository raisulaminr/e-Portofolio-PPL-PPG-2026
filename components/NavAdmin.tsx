'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Menu admin: satu dashboard, entitas yang sering dipakai diberi pintasan. */
const NAV_ADMIN = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/terbimbing', label: 'Terbimbing' },
  { href: '/admin/nonmengajar', label: 'Nonmengajar' },
  { href: '/admin/profil', label: 'Profil' },
] as const;

/**
 * Nav admin memakai bahasa yang sama dengan nav bar publik (strip + item aktif
 * blok solid primary), hanya lebih ringkas karena ini alat kerja pemilik.
 */
export default function NavAdmin() {
  const pathname = usePathname();

  const isAktif = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <nav
      aria-label="Navigasi admin"
      className="flex flex-wrap items-stretch overflow-hidden rounded-control border border-border bg-surface"
    >
      {NAV_ADMIN.map((item) => {
        const aktif = isAktif(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={aktif ? 'page' : undefined}
            className={`inline-flex min-h-10 items-center border-r border-border px-3.5 font-mono text-xs leading-[1.2] font-semibold tracking-wide uppercase transition-colors last:border-r-0 ${
              aktif
                ? 'bg-primary text-primary-foreground'
                : 'text-muted hover:bg-surface-muted hover:text-foreground'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}