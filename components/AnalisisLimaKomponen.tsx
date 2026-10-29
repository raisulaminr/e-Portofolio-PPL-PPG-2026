import BelumDiisi from '@/components/BelumDiisi';
import Panel from '@/components/Panel';
import { adaAnalisis, KOMPONEN_ANALISIS, type NilaiAnalisis } from '@/lib/analisis';

const LABEL = 'font-mono text-xs leading-[1.2] font-semibold tracking-wide text-muted uppercase';

/** Paragraf teks analisis — baris baru di hormati, sama seperti catatan reflektif. */
function Isi({ teks, ukuran = 'base' }: { teks: string; ukuran?: 'base' | 'sm' }) {
  const kelas = ukuran === 'sm' ? 'text-sm' : 'text-base';
  return (
    <div className={`space-y-4 ${kelas} leading-[1.6] text-muted`}>
      {teks.split('\n').map((paragraf, index) => (
        <p key={index}>{paragraf}</p>
      ))}
    </div>
  );
}

/**
 * Tampilan lima komponen analisis artefak (konteks, tujuan, kelebihan,
 * kekurangan, kajian teori) — satu tempat untuk semua modul supaya Topik 3, UTS,
 * dan UAS menampilkan analisis dengan cara yang sama.
 *
 * Dua varian:
 * - `panel`  → tiap komponen jadi Panel tersendiri (dipakai halaman Topik 3).
 * - `ringkas`→ satu blok terpadu (dipakai di dalam Panel artefak halaman UTS/UAS,
 *   karena tiap artefak sudah punya Panel-nya sendiri).
 */
export default function AnalisisLimaKomponen({
  nilai,
  varian = 'panel',
  pesanKosong = 'Analisis artefak ini belum diisi.',
}: {
  nilai: NilaiAnalisis | null;
  varian?: 'panel' | 'ringkas';
  pesanKosong?: string;
}) {
  if (!adaAnalisis(nilai)) {
    return <BelumDiisi pesan={pesanKosong} />;
  }

  if (varian === 'panel') {
    return (
      <div className="space-y-6">
        {KOMPONEN_ANALISIS.map((komponen, index) => {
          const teks = nilai?.[komponen.field];
          return (
            <Panel
              key={komponen.field}
              judul={`${String(index + 1).padStart(2, '0')} · ${komponen.label}`}
              deskripsi={komponen.petunjuk}
            >
              {teks ? (
                <Isi teks={teks} />
              ) : (
                <BelumDiisi pesan={`Komponen ${komponen.label} belum diisi.`} />
              )}
            </Panel>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-card border border-border bg-surface-muted p-4">
      {KOMPONEN_ANALISIS.map((komponen) => {
        const teks = nilai?.[komponen.field];
        return (
          <div key={komponen.field}>
            <p className={LABEL}>{komponen.label}</p>
            {teks ? (
              <div className="mt-1">
                <Isi teks={teks} ukuran="sm" />
              </div>
            ) : (
              <p className="mt-1 text-sm leading-[1.6] text-muted">Belum diisi.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
