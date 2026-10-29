// Audit tampilan di browser sungguhan lewat CDP (Edge headless).
//
// Pakai: jalankan Edge headless + server produksi dulu, contoh:
//   "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" \
//     --headless=new --disable-gpu --remote-debugging-port=9222 \
//     --user-data-dir=/tmp/edge-cek about:blank &
//   PORT=3400 npm start &
//   node scripts/audit-tampilan.mjs
//
// Mengukur: kontras WCAG tiap teks, overflow horizontal, tap target, token
// warna/tipografi/radius, dan apakah tombol tema benar-benar bekerja.
//
// Cakupan halaman: seluruh rute publik di desktop + mobile (lihat RUTE_PUBLIK),
// lalu halaman /admin setelah login otomatis memakai ADMIN_EMAIL/ADMIN_PASSWORD.
// Supaya bagian admin ikut diperiksa, jalankan:
//   node --env-file=.env.local scripts/audit-tampilan.mjs
// Tambahkan DETAIL=1 untuk mencetak JSON mentah tiap halaman, dan lihat
// .cek-tema/laporan-tampilan.json untuk laporan lengkapnya.
import { writeFileSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3400';
const CDP = process.env.CDP_URL ?? 'http://127.0.0.1:9222';
const OUT = process.env.OUT_DIR ?? './.cek-tema';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cdpTarget() {
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch(`${CDP}/json/list`)).json();
      const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      /* browser belum siap */
    }
    await sleep(500);
  }
  throw new Error('tidak bisa terhubung ke CDP — Edge headless belum jalan?');
}

class Klien {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.tunggu = new Map();
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.id && this.tunggu.has(m.id)) {
        this.tunggu.get(m.id)(m);
        this.tunggu.delete(m.id);
      }
    });
  }

  kirim(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.tunggu.set(id, (m) => (m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result)));
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const r = await this.kirim('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? 'eval gagal');
    return r.result.value;
  }
}

const AUDIT = `(() => {
  const px = (s) => parseFloat(s) || 0;
  const parse = (c) => {
    const m = String(c).match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const p = m[1].split(/[,\\s/]+/).filter(Boolean).map(Number);
    return p.length >= 3 ? p : null;
  };
  const lum = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const blend = (fg, bg) => (fg.length > 3 && fg[3] < 1 ? [0, 1, 2].map((i) => fg[i] * fg[3] + bg[i] * (1 - fg[3])) : fg.slice(0, 3));
  const kontras = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  const bgEfektif = (el) => {
    let n = el;
    while (n) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && (c.length < 4 || c[3] > 0.9)) return c.slice(0, 3);
      n = n.parentElement;
    }
    return [3, 3, 3];
  };
  const adalahTeksGradasi = (el) => {
    const g = getComputedStyle(el);
    return (g.webkitBackgroundClip || g.backgroundClip) === 'text';
  };

  const terlihat = [...document.querySelectorAll('h1,h2,h3,p,dt,dd,li,span,a,button,blockquote,code')]
    .filter((el) => el.offsetParent !== null && el.textContent.trim().length > 0 && el.children.length === 0);

  const masalah = [];
  const semuaKontras = [];
  for (const el of terlihat) {
    if (adalahTeksGradasi(el)) continue; // warna gradasi diperiksa terpisah
    const cs = getComputedStyle(el);
    const fg = parse(cs.color);
    if (!fg || fg[3] === 0) continue;
    const bg = bgEfektif(el);
    const rasio = kontras(blend(fg, bg), bg);
    const ukuran = px(cs.fontSize);
    const ambang = ukuran >= 24 || (Number(cs.fontWeight) >= 700 && ukuran >= 19) ? 3 : 4.5;
    const catatan = { teks: el.textContent.trim().slice(0, 40), tag: el.tagName.toLowerCase(), rasio: +rasio.toFixed(2), ukuran, ambang };
    semuaKontras.push(catatan);
    if (rasio < ambang) masalah.push({ ...catatan, fg: cs.color, bg: 'rgb(' + bg.join(',') + ')' });
  }

  const doc = document.documentElement;
  const main = document.querySelector('main');
  const gaya = (el) => (el ? getComputedStyle(el) : null);
  const ambil = (el, kunci) => {
    const g = gaya(el);
    if (!g) return null;
    const hasil = {};
    for (const k of kunci) hasil[k] = g[k];
    return hasil;
  };

  const h1 = document.querySelector('h1');
  const h1Biasa = h1?.querySelector('span:not([class*="bg-clip-text"])');
  const h1Gradasi = h1?.querySelector('span[class*="bg-clip-text"]');
  const navPill = document.querySelector('header div');
  const heroKotak = main?.querySelector('section');
  const kartuModul = main?.querySelector('a[href="/uts"], a[href="/uas"]');
  const ctaUtama = main?.querySelector('a[class*="rounded-full"]');
  const aurora = document.querySelector('[aria-hidden].pointer-events-none.fixed');

  const seksi = [...(main?.querySelectorAll('section') ?? [])];
  const gapSeksi = seksi.length > 1 ? Math.round(seksi[1].getBoundingClientRect().top - seksi[0].getBoundingClientRect().bottom) : null;

  const kontrolKecil = [...document.querySelectorAll('button, a')]
    .filter((el) => el.offsetParent !== null && el.getBoundingClientRect().height > 0 && el.getBoundingClientRect().height < 40)
    .map((el) => ({ label: (el.getAttribute('aria-label') || el.textContent.trim()).slice(0, 24), h: Math.round(el.getBoundingClientRect().height) }))
    .slice(0, 5);

  // Apakah ada lapisan dekoratif yang menutupi konten?
  const rectH1 = h1?.getBoundingClientRect();
  const atasH1 = rectH1 ? document.elementFromPoint(rectH1.left + rectH1.width / 2, rectH1.top + rectH1.height / 2) : null;

  return {
    tema: doc.classList.contains('dark') ? 'gelap' : 'terang',
    body: { bg: gaya(document.body).backgroundColor, warna: gaya(document.body).color, font: gaya(document.body).fontFamily.split(',')[0] },
    navPill: navPill ? { radius: gaya(navPill).borderRadius, lebar: Math.round(navPill.getBoundingClientRect().width), viewport: doc.clientWidth, posisi: gaya(navPill).position, atas: Math.round(navPill.getBoundingClientRect().top) } : null,
    h1: ambil(h1, ['fontSize', 'fontWeight', 'lineHeight']),
    h1Baris1: h1Biasa ? { warna: gaya(h1Biasa).color, teks: h1Biasa.textContent.trim().slice(0, 24) } : null,
    h1Gradasi: h1Gradasi ? { teks: h1Gradasi.textContent.trim().slice(0, 24), image: gaya(h1Gradasi).backgroundImage.slice(0, 80), clip: gaya(h1Gradasi).webkitBackgroundClip, warna: gaya(h1Gradasi).color } : null,
    heroKotak: ambil(heroKotak, ['textAlign', 'paddingTop', 'borderTopWidth', 'borderRadius']),
    kartuModul: ambil(kartuModul, ['padding', 'borderRadius', 'backgroundColor', 'borderColor']),
    ctaUtama: ctaUtama ? { teks: ctaUtama.textContent.trim().slice(0, 24), radius: gaya(ctaUtama).borderRadius, bg: gaya(ctaUtama).backgroundColor, warna: gaya(ctaUtama).color } : null,
    auroraAda: !!aurora,
    elemenAtasDiTengahH1: atasH1 ? atasH1.tagName.toLowerCase() + (atasH1.className ? '.' + String(atasH1.className).split(' ')[0] : '') : null,
    gapMaksSection: gapSeksi,
    kontrolDiBawah40px: kontrolKecil,
    kontrasTerendah: semuaKontras.sort((a, b) => a.rasio - b.rasio).slice(0, 5),
    kontrasGagal: masalah,
    overflowHorizontal: doc.scrollWidth - doc.clientWidth,
    totalTeksDiperiksa: semuaKontras.length,
  };
})()`;

async function periksa(k, url, nama) {
  await k.kirim('Page.navigate', { url });
  for (let i = 0; i < 60; i++) {
    await sleep(250);
    if (await k.eval(`document.readyState === 'complete' && !!document.querySelector('h1')`)) break;
  }
  await sleep(900); // animasi masuk selesai
  const hasil = await k.eval(AUDIT);
  hasilSemua.push({ nama, url, hasil });

  // Ringkas satu baris per halaman supaya laporannya enak dibaca;
  // detail lengkap diminta lewat DETAIL=1 atau lihat berkas laporan.
  const gagalKontras = hasil.kontrasGagal.length;
  const kecil = hasil.kontrolDiBawah40px.length;
  const status = gagalKontras === 0 && hasil.overflowHorizontal <= 0 ? 'OK    ' : 'PERIKSA';
  console.log(
    `${status} ${nama.padEnd(28)} overflow=${String(hasil.overflowHorizontal).padStart(4)}px  ` +
      `kontrasGagal=${gagalKontras}  kontrol<40px=${kecil}`,
  );
  if (process.env.DETAIL === '1') console.log(JSON.stringify(hasil, null, 1));
  return hasil;
}

/** Daftar halaman publik yang selalu diperiksa di dua ukuran layar. */
const RUTE_PUBLIK = [
  '/',
  '/profil',
  '/topik-3',
  '/topik-3/perencanaan',
  '/topik-3/media',
  '/topik-3/nonmengajar',
  '/uts',
  '/uas',
  '/masuk',
];

/** Halaman admin — hanya bisa diperiksa setelah login. */
const RUTE_ADMIN = [
  '/admin',
  '/admin/terbimbing',
  '/admin/nonmengajar',
  '/admin/profil',
  '/admin/siklus/1',
  '/admin/analisis/perencanaan',
];

/**
 * Login lewat form /masuk memakai kredensial dari environment (ADMIN_EMAIL,
 * ADMIN_PASSWORD). Kalau tidak tersedia, bagian /admin dilewati tanpa gagal —
 * jalankan dengan `node --env-file=.env.local scripts/audit-tampilan.mjs`
 * supaya ikut diperiksa.
 */
async function masukAdmin(k) {
  const email = process.env.ADMIN_EMAIL;
  const sandi = process.env.ADMIN_PASSWORD;

  if (!email || !sandi) {
    console.log('\n[login admin] ADMIN_EMAIL/ADMIN_PASSWORD tidak terbaca — halaman /admin dilewati.');
    return false;
  }

  await k.kirim('Page.navigate', { url: `${BASE}/masuk` });
  await sleep(1500);

  const dicoba = await k.eval(`(() => {
    const isi = (el, nilai) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(el, nilai);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    const email = document.querySelector('#email');
    const sandi = document.querySelector('#sandi');
    const tombol = document.querySelector('form button[type="submit"]');
    if (!email || !sandi || !tombol) return 'form-tidak-ada';
    isi(email, ${JSON.stringify(email)});
    isi(sandi, ${JSON.stringify(sandi)});
    tombol.click();
    return 'ok';
  })()`);

  if (dicoba !== 'ok') {
    console.log(`\n[login admin] gagal: ${dicoba}`);
    return false;
  }

  for (let i = 0; i < 40; i++) {
    await sleep(300);
    if (await k.eval(`location.pathname.startsWith('/admin')`)) break;
  }

  const halaman = await k.eval('location.pathname');
  const berhasil = halaman.startsWith('/admin');
  console.log(`\n[login admin] ${berhasil ? 'berhasil' : 'GAGAL'} → ${halaman}`);
  return berhasil;
}

async function tangkapLayar(k, file) {
  const { data } = await k.kirim('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  writeFileSync(file, Buffer.from(data, 'base64'));
  console.log(`  → screenshot: ${file}`);
}

const hasilSemua = [];
const ws = new WebSocket(await cdpTarget());
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
const k = new Klien(ws);
await k.kirim('Page.enable');
await k.kirim('Runtime.enable');

async function pakaiTema(mode) {
  await k.kirim('Page.navigate', { url: `${BASE}/` });
  await sleep(900);
  await k.eval(`localStorage.setItem('tema', ${JSON.stringify(mode)})`);
}

const VIEWPORT = [
  { nama: 'desktop', w: 1440, h: 900 },
  { nama: 'mobile', w: 390, h: 844 },
];

async function setViewport(vp) {
  await k.kirim('Emulation.setDeviceMetricsOverride', {
    width: vp.w,
    height: vp.h,
    deviceScaleFactor: 1,
    mobile: vp.nama === 'mobile',
  });
}

// 1. Seluruh halaman publik, tema gelap (default), di desktop + HP.
for (const vp of VIEWPORT) {
  await setViewport(vp);
  await pakaiTema('gelap');
  for (const rute of RUTE_PUBLIK) await periksa(k, `${BASE}${rute}`, `${vp.nama} ${rute}`);

  await tangkapLayar(k, `${OUT}/${vp.nama}-beranda-gelap.png`);

  // Halaman terpanjang & Profil juga diperiksa di tema terang.
  await pakaiTema('terang');
  await periksa(k, `${BASE}/`, `${vp.nama} / tema terang`);
  await periksa(k, `${BASE}/profil`, `${vp.nama} /profil tema terang`);
  await periksa(k, `${BASE}/uts`, `${vp.nama} /uts tema terang`);
  await tangkapLayar(k, `${OUT}/${vp.nama}-beranda-terang.png`);
}

// 2. Halaman admin — perlu login dulu (form diisi lewat CDP).
if (await masukAdmin(k)) {
  for (const vp of VIEWPORT) {
    await setViewport(vp);
    for (const rute of RUTE_ADMIN) await periksa(k, `${BASE}${rute}`, `${vp.nama} ${rute}`);
  }
  await setViewport(VIEWPORT[0]);
  await tangkapLayar(k, `${OUT}/desktop-admin.png`);
}

// 3. Ringkasan + laporan lengkap.
const perluPeriksa = hasilSemua.filter(
  (item) => item.hasil.kontrasGagal.length > 0 || item.hasil.overflowHorizontal > 0,
);
console.log(`\n===== RINGKASAN =====`);
console.log(`halaman diperiksa: ${hasilSemua.length}`);
console.log(`perlu periksa lanjut: ${perluPeriksa.length}`);
for (const item of perluPeriksa) {
  const { nama, url, hasil } = item;
  console.log(`\n- ${nama} (${url})`);
  console.log(`  overflow: ${hasil.overflowHorizontal}px, tema: ${hasil.tema}`);
  if (hasil.kontrasGagal.length > 0) {
    console.log('  kontras gagal:');
    for (const baris of hasil.kontrasGagal.slice(0, 8)) {
      console.log(`    ${baris.tag} "${baris.teks}" rasio=${baris.rasio} (butuh ${baris.ambang}) ${baris.fg} di ${baris.bg}`);
    }
  }
}
writeFileSync(`${OUT}/laporan-tampilan.json`, JSON.stringify(hasilSemua, null, 1));
console.log(`\nlaporan lengkap: ${OUT}/laporan-tampilan.json`);

// Uji tombol tema: satu klik harus membalik tema dan menyimpannya.
await pakaiTema('gelap');
await k.kirim('Page.navigate', { url: `${BASE}/` });
await sleep(1200);
const sebelum = await k.eval(`document.documentElement.classList.contains('dark') ? 'gelap' : 'terang'`);
const diklik = await k.eval(`(() => { const b = document.querySelector('button[aria-label*="tema"]'); if (!b) return 'tombol-tidak-ada'; b.click(); return 'ok'; })()`);
const segeraSetelahKlik = await k.eval(`(() => {
  const kartu = document.querySelector('main a[href="/uts"], main a[href="/uas"]');
  const g = kartu ? getComputedStyle(kartu) : null;
  return {
    kelasBeralih: document.documentElement.classList.contains('tema-beralih'),
    propertiTransisi: g ? g.transitionProperty.split(',').map((s) => s.trim()).join(', ') : null,
    durasiTransisi: g ? g.transitionDuration : null,
  };
})()`);
console.log(`\n[jendela transisi tema] ${JSON.stringify(segeraSetelahKlik)}`);
await sleep(700);
const sesudah = await k.eval(`document.documentElement.classList.contains('dark') ? 'gelap' : 'terang'`);
const tersimpan = await k.eval(`localStorage.getItem('tema')`);
const kelasBersih = await k.eval(`document.documentElement.classList.contains('tema-beralih')`);
console.log(`[uji tombol] klik=${diklik} ${sebelum} -> ${sesudah} localStorage=${tersimpan} kelasMasihTerpasang=${kelasBersih}`);

// Saat kurangi gerak aktif, kelas transisi tidak boleh dipasang sama sekali.
await k.kirim('Emulation.setEmulatedMedia', {
  features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
});
await k.kirim('Page.navigate', { url: `${BASE}/` });
await sleep(1200);
const kelasSaatReduksi = await k.eval(`(() => { document.querySelector('button[aria-label*="tema"]').click(); return document.documentElement.classList.contains('tema-beralih'); })()`);
await k.kirim('Emulation.setEmulatedMedia', { features: [] });
console.log(`[transisi tema · reduced-motion] kelasBeralih=${kelasSaatReduksi} (harus false)`);

// Animasi aurora: harus bergerak saat normal, dan mati saat prefers-reduced-motion: reduce.
const BACA_AURORA = `(() => [...document.querySelectorAll('[class*="aurora-p"]')].map((el) => {
  const g = getComputedStyle(el);
  return { nama: g.animationName, durasi: g.animationDuration, transform: g.transform, opacity: g.opacity };
}))()`;

await pakaiTema('gelap');
await k.kirim('Page.navigate', { url: `${BASE}/` });
await sleep(1500);
const putaranA = await k.eval(BACA_AURORA);
await sleep(3000);
const putaranB = await k.eval(BACA_AURORA);
const bergerak = putaranA.map((a, i) => a.transform !== putaranB[i].transform || a.opacity !== putaranB[i].opacity);
console.log(`\n[aurora normal] jumlah=${putaranA.length} nama=${JSON.stringify(putaranA.map((a) => a.nama))}`);
console.log(`[aurora normal] durasi=${JSON.stringify(putaranA.map((a) => a.durasi))} bergerak=${JSON.stringify(bergerak)}`);

await k.kirim('Emulation.setEmulatedMedia', {
  features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
});
await k.kirim('Page.navigate', { url: `${BASE}/` });
await sleep(1800);
const putaranReduksi = await k.eval(BACA_AURORA);
await k.kirim('Emulation.setEmulatedMedia', { features: [] });
console.log(`[aurora reduced-motion] nama=${JSON.stringify(putaranReduksi.map((a) => a.nama))} semuaMati=${putaranReduksi.every((a) => a.nama === 'none')}`);

ws.close();
console.log('\naudit selesai');
