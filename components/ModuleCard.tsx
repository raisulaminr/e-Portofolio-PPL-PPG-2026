import Link from 'next/link';
import { KELAS_NOTE, KELAS_TAPE, KELAS_WARNA_NOTE, warnaNote } from '@/components/gayaKartu';

/**
 * Kartu satu tagihan (Topik 3 / UTS / UAS) di Beranda.
 * Tampil sebagai sticky note pastel dengan strip tape — motif acuan visual
 * DESIGN.md — dengan teks gelap agar kontras tetap terbaca.
 */
export default function ModuleCard({
  href,
  label,
  judul,
  deskripsi,
  progres,
  target,
  warnaIndex = 0,
}: {
  href: string;
  label: string;
  judul: string;
  deskripsi: string;
  progres: number;
  target: number;
  /** Urutan note di daftar — menentukan warna pastelnya. */
  warnaIndex?: number;
}) {
  const persen = target > 0 ? Math.min(100, Math.round((progres / target) * 100)) : 0;

  return (
    <Link href={href} className={`group ${KELAS_NOTE} ${KELAS_WARNA_NOTE[warnaNote(warnaIndex)]}`}>
      <span aria-hidden className={KELAS_TAPE} />

      <span className="font-mono text-xs leading-[1.2] font-semibold tracking-wide uppercase opacity-80">
        {label}
      </span>
      <h3 className="mt-2 text-lg font-medium">{judul}</h3>
      <p className="mt-2 text-sm leading-[1.6] opacity-80">{deskripsi}</p>

      <div className="mt-5">
        <div className="flex items-center justify-between font-mono text-xs leading-[1.2] tracking-wide uppercase opacity-80">
          <span>Progres</span>
          <span className="font-semibold">
            {progres}/{target}
          </span>
        </div>
        <div
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-note-teks/15"
          role="progressbar"
          aria-valuenow={persen}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progres ${judul}`}
        >
          <div
            className="h-full rounded-full bg-note-teks/70 transition-all duration-300"
            style={{ width: `${persen}%` }}
          />
        </div>
      </div>
    </Link>
  );
}