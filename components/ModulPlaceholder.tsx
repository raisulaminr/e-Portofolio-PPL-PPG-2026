import Link from 'next/link';
import FadeIn from '@/components/FadeIn';
import Lencana from '@/components/Lencana';
import Tombol from '@/components/Tombol';

/**
 * Kerangka navigasi untuk modul yang belum masuk cakupan fase saat ini.
 * Sengaja tidak mengambil data apa pun — isi modul dikerjakan di fase berikutnya.
 */
export default function ModulPlaceholder({
  label,
  judul,
  deskripsi,
  faseBerikutnya,
  cakupan,
}: {
  label: string;
  judul: string;
  deskripsi: string;
  faseBerikutnya: string;
  cakupan: string[];
}) {
  return (
    <div className="space-y-20">
      <FadeIn>
        {/* Sinyal pertama modul: badge, judul uppercase, ringkas deskripsi. */}
        <section className="pt-4 pb-2 sm:pt-10">
          <Lencana>{label}</Lencana>
          <h1 className="mt-6 max-w-3xl text-4xl font-display font-normal uppercase leading-[1.04] tracking-normal text-foreground sm:text-5xl lg:text-[4rem]">
            {judul}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-[1.6] text-muted sm:text-lg">
            {deskripsi}
          </p>
        </section>
      </FadeIn>

      <FadeIn delay={0.05}>
        <section className="relative rounded-card border border-dashed border-border bg-surface p-6 shadow-card">
          <p className="text-base font-medium text-warning">
            Halaman ini masih kerangka, kontennya dikerjakan pada {faseBerikutnya}.
          </p>

          <h2 className="mt-8 font-mono text-xs leading-[1.2] font-semibold tracking-wide text-muted uppercase">
            Yang akan tampil di sini
          </h2>
          <ul className="mt-4 space-y-3">
            {cakupan.map((item, index) => (
              <li
                key={item}
                className="flex gap-3 rounded-card border border-border bg-surface-muted px-4 py-3 text-sm leading-[1.6] text-muted"
              >
                <span className="font-mono text-xs leading-[1.2] font-semibold text-accent-teks">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="flex flex-wrap gap-3">
          <Tombol href="/" varian="sekunder">
            Kembali ke Beranda
          </Tombol>
          <Link
            href="/topik-3"
            className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Modul Topik 3
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
