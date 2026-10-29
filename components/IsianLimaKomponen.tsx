'use client';

import { KELAS_INPUT_FORM, KELAS_LABEL_FORM } from '@/components/gayaForm';
import { KOMPONEN_ANALISIS, type KolomAnalisis } from '@/lib/analisis';

/**
 * Blok isian lima komponen analisis — dipakai bersama oleh form admin Topik 3
 * (satu kategori) dan form analisis artefak siklus (UTS/UAS, satu field).
 *
 * `idPrefix` penting saat beberapa form tampil di satu halaman (halaman analisis
 * siklus menampilkan 8 artefak sekaligus) supaya `id`/`htmlFor` tiap textarea
 * tetap unik dan tidak bentrok.
 */
export default function IsianLimaKomponen({
  nilai,
  onUbah,
  idPrefix = '',
}: {
  nilai: Record<KolomAnalisis, string>;
  onUbah: (field: KolomAnalisis, teks: string) => void;
  idPrefix?: string;
}) {
  return (
    <div className="space-y-8">
      {KOMPONEN_ANALISIS.map((komponen) => {
        const id = `${idPrefix}${komponen.field}`;
        return (
          <div key={komponen.field}>
            <label htmlFor={id} className={KELAS_LABEL_FORM}>
              {komponen.label}
            </label>
            <textarea
              id={id}
              name={id}
              rows={5}
              value={nilai[komponen.field]}
              onChange={(event) => onUbah(komponen.field, event.target.value)}
              placeholder={komponen.petunjuk}
              className={`mt-2 leading-[1.6] ${KELAS_INPUT_FORM}`}
            />
            <p className="mt-2 text-sm leading-[1.6] text-muted">{komponen.petunjuk}</p>
          </div>
        );
      })}
    </div>
  );
}
