const NAMA_BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Ubah tanggal ISO 'YYYY-MM-DD' (nilai <input type="date">) menjadi
 * '15 Januari 2026' supaya enak dibaca dosen. Teks lain — termasuk nilai
 * lama yang bukan ISO — dikembalikan apa adanya, tidak pernah dikosongkan.
 *
 * Sengaja tanpa Intl supaya hasilnya tidak bergeser karena zona waktu server.
 */
export function formatTanggal(teks: string | null | undefined): string | null {
  if (!teks) return null;

  const cocok = /^(\d{4})-(\d{2})-(\d{2})$/.exec(teks.trim());
  if (!cocok) return teks;

  const [, tahun, bulan, hari] = cocok;
  const namaBulan = NAMA_BULAN[Number(bulan) - 1];
  if (!namaBulan) return teks;

  return `${Number(hari)} ${namaBulan} ${tahun}`;
}
