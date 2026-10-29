import { timingSafeEqual } from 'node:crypto';
import { getServerSession, type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { redirect } from 'next/navigation';

/**
 * Login admin panel (TECH-SPEC.md bagian 4): NextAuth credentials provider,
 * satu user saja, tanpa multi-role.
 *
 * Kredensial HANYA dibaca dari environment variable (ADMIN_EMAIL, ADMIN_PASSWORD)
 * — tidak pernah di-hardcode, sama seperti kredensial Turso di lib/db.ts.
 * Sesi memakai strategi JWT supaya tidak perlu tabel tambahan di database.
 */

/** Bandingkan dua string tanpa membocorkan panjang/isi lewat waktu eksekusi. */
function samaKonstan(nilai: string, harapan: string): boolean {
  const a = Buffer.from(nilai, 'utf8');
  const b = Buffer.from(harapan, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/masuk' },
  providers: [
    CredentialsProvider({
      name: 'Admin',
      credentials: {
        email: { label: 'Email admin', type: 'email' },
        sandi: { label: 'Sandi', type: 'password' },
      },
      async authorize(credentials) {
        const email = process.env.ADMIN_EMAIL?.trim();
        const sandi = process.env.ADMIN_PASSWORD;

        if (!email || !sandi) {
          throw new Error(
            'ADMIN_EMAIL / ADMIN_PASSWORD belum diisi. Isi di .env.local (lokal) atau di ' +
              'Environment Variables project Vercel (lihat TECH-SPEC.md bagian 7).',
          );
        }

        const emailMasuk = String(credentials?.email ?? '').trim();
        const sandiMasuk = String(credentials?.sandi ?? '');

        // Dibandingkan keduanya (bukan early return) supaya kegagalan email dan
        // sandi tidak bisa dibedakan dari sisi waktu respons.
        const emailCocok = samaKonstan(emailMasuk.toLowerCase(), email.toLowerCase());
        const sandiCocok = samaKonstan(sandiMasuk, sandi);

        if (!emailCocok || !sandiCocok) return null;

        return { id: 'admin', name: 'Admin', email };
      },
    }),
  ],
};

/** Sesi admin untuk route handler: null berarti belum login. */
export async function sesiAdmin() {
  return getServerSession(authOptions);
}

/**
 * Untuk server component di bawah /admin: belum login → alihkan ke /masuk.
 * Dipakai sekali di app/admin/layout.tsx supaya semua halaman admin terjaga.
 */
export async function wajibAdmin() {
  const sesi = await sesiAdmin();
  if (!sesi) redirect('/masuk');
  return sesi;
}
