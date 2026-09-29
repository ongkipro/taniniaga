/**
 * The register of native Astro landing pages.
 *
 * A native landing page is a real route file — `src/pages/<slug>.astro` — built
 * and deployed with the Worker. Adding an entry here is what makes the CMS
 * aware of it: the admin can see it, copy its link, and hand it a product page.
 * Without an entry the route still answers on its URL, but the operator has no
 * way to know it exists.
 *
 * **This is a manifest, not discovery.** Cloudflare Workers bundles routes and
 * cannot enumerate `src/pages/` at runtime, so the list is written down and
 * compiled in. `validateNativeLandingPages` fails the build on a duplicate or
 * an incomplete entry rather than shipping a register that misrepresents the
 * site.
 *
 * To add one:
 *   1. create `src/pages/<slug>.astro` (see `docs/LANDING-PAGES.md`);
 *   2. add its entry below, with `slug` matching the filename exactly;
 *   3. deploy. The CMS picks it up on the next landing-page list load, or
 *      within the hour from the scheduled re-sync — the sitemap with it.
 *
 * To remove one: delete both. Removing only the file leaves a register entry
 * pointing at a 404; removing only the entry leaves an unlisted live URL.
 */
export type NativeLandingPage = {
  /** Must equal the route filename, and is the public path: `/<slug>`. */
  slug: string;
  /** Shown in the CMS list. */
  title: string;
  /** The product this page sells, by product slug. */
  productSlug: string;
  /** Shown in the CMS list beneath the title. */
  description: string;
  /** A page can be registered before it is ready to be linked. */
  isActive?: boolean;
};

export const nativeLandingPages: NativeLandingPage[] = [
  {
    slug: 'anti-layu-mulsa',
    title: 'Anti-Layu Mulsa Panas — 100% Bibit Hidup Tegap',
    productSlug: 'bensu-pupuk-cair-organik',
    description: 'Protokol celup baki semai pelindung bibit dari panas mulsa & anti-stres pindah tanam.',
    isActive: true,
  },
  {
    slug: 'bangkitkan-tanaman-mandek',
    title: 'Bangkitkan Tanaman Mandek — Panic Recovery 72 Jam',
    productSlug: 'bensu-pupuk-cair-organik',
    description: 'Solusi darurat tanaman kerdil, macet tumbuh, dan kaget cuaca pasca hujan atau kemarau.',
    isActive: true,
  },
  {
    slug: 'pertolongan-keracunan-obat',
    title: 'Pertolongan Keracunan Obat & Overdosis Pestisida',
    productSlug: 'bensu-pupuk-cair-organik',
    description: 'Solusi cepat daun keriting gosong melepuh overdosis racun kimia, netralkan racun & picu tunas baru dalam 4 hari.',
    isActive: true,
  },
  {
    slug: 'pengunci-bunga-anti-rontok',
    title: 'Pengunci Bunga & Pencegah Rontok Pentil Buah',
    productSlug: 'saratoga-serum-tanaman-premium',
    description: 'Kunci tangkai bunga dan pentil buah agar tidak rontok kena cuaca ekstrem, 95% sukses jadi buah bernas.',
    isActive: true,
  },
  {
    slug: 'maraton-panen-cabai',
    title: 'Maraton Panen 25-30 Kali Petikan Tanpa Afkir',
    productSlug: 'bensu-pupuk-cair-organik',
    description: 'Formula re-start pertumbuhan agar panen cabai terus mengalir bertingkat tembus 25-30 kali petikan tanpa afkir.',
    isActive: true,
  },
  {
    slug: 'perisai-anti-bulai',
    title: 'Perisai Anti-Bulai Daun Putih Jagung Hibrida',
    productSlug: 'bensu-pupuk-cair-organik',
    description: 'Bentengi daun jagung muda dari spora jamur bulai, daun tegap kaku hijau pekat dan tongkol padat berisi rekor 9.8 ton/Ha.',
    isActive: true,
  },
  {
    slug: 'batang-baja-anti-rebah',
    title: 'Batang Baja Anti-Rebah Padi Sawah & Jagung',
    productSlug: 'bensu-pupuk-cair-organik',
    description: 'Bikin batang padi dan jagung sekeras kawat tahan badai rendeng, batang tegak lurus sampai panen bebas busuk lumpur.',
    isActive: true,
  },
  {
    slug: 'benteng-anti-patek',
    title: 'Benteng Anti-Patek Buah Cabai Lonyot',
    productSlug: 'saratoga-serum-tanaman-premium',
    description: 'Bikin kulit buah cabai liat sekeras perisai baja, jamur antraknosa rontok gagal tembus dan 98% petikan lolos Grade A.',
    isActive: true,
  },
  {
    slug: 'juara-gabah-bernas',
    title: 'Rahasia Gabah Bernas Padi Sawah Sampai Pangkal',
    productSlug: 'saratoga-serum-tanaman-premium',
    description: 'Daun bendera tegak mengawal pengisian susu gabah, bulir padat sampai pangkal malai dan ubinan tembus rekor 9 ton/Ha.',
    isActive: true,
  },
  {
    slug: 'penyelamat-bawang-moler',
    title: 'Penyelamat Bawang Merah Moler Inul & Umbi Jumbo',
    productSlug: 'bensu-pupuk-cair-organik',
    description: 'Hentikan serangan jamur Fusarium tanah becek, tegakkan daun kaku jegrik dan cetak umbi merah merona super jumbo.',
    isActive: true,
  },
  {
    slug: 'perisai-kebal-jamur',
    title: 'Kojien — Perisai Sel Baja Kebal Jamur & Virus Tanaman',
    productSlug: 'kojien',
    description: 'Teknologi Immune Cellactivator Thailand: lapiskan dinding sel dengan Bio-Silika OSA & Sulfur aktif, 99% spora jamur bulai, moler, dan patek gagal tembus.',
    isActive: true,
  },
  {
    slug: 'penyembuh-asem-aseman',
    title: 'Penyelamat Padi Asem-Aseman & Booster 40+ Anakan',
    productSlug: 'bensu-taniniaga',
    description: 'Cuci racun asam tanah & pirit besi pasca hujan atau jerami mentah, daun merah karat pulih hijau royo-royo dan anakan meledak 40+ batang.',
    isActive: true,
  },
  {
    slug: 'penakluk-sawit-ganoderma',
    title: 'Aussie — Penakluk Ganoderma & Penyelamat Sawit Kuning',
    productSlug: 'aussie-pupuk-cair-organik',
    description: 'Hentikan pembusukan batang Ganoderma & pulihkan daun kuning sengkleh, pupus baru membuka tegap dan TBS kembali berbobot lebat.',
    isActive: true,
  },
];

/**
 * Other top-level route files this install serves that are not landing pages —
 * a legacy slug that 301s to a renamed page, say. A CMS landing page on one of
 * these slugs would save and never be reachable, because the route file
 * answers first, so the CMS refuses them. Every entry in `nativeLandingPages`
 * is refused the same way without being repeated here.
 */
export const installRouteSlugs: string[] = [];
