import type { Metadata } from 'next';
import NavAdmin from '@/components/NavAdmin';
import TombolKeluar from '@/components/TombolKeluar';
import { wajibAdmin } from '@/lib/auth';

/**
 * Satu penjaga untuk seluruh halaman /admin (TECH-SPEC.md bagian 4): belum
 * login → dialihkan ke /masuk. Halaman login sendiri sengaja diletakkan di
 * luar /admin supaya tidak ikut terjaga.
 *
 * Route handler API admin tidak memakai layout ini, jadi pengecekan sesinya
 * dilakukan sendiri di app/api/admin/[resource]/route.ts.
 */
export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sesi = await wajibAdmin();

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <NavAdmin />

        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-xs leading-[1.2] tracking-wide text-muted uppercase sm:inline">
            {sesi.user?.email}
          </span>
          <TombolKeluar />
        </div>
      </div>

      {children}
    </div>
  );
}
