import type { Product, ProductVariant } from "../data/products";
import type { FormMode } from "./form-mode.ts";

/**
 * The cheapest variant, the first among equals: the "from" price the cards,
 * the Product JSON-LD and both catalog feeds lead with. A form that opened on
 * another variant showed Merchant Center a price its item never had.
 */
export function cheapestVariant<T extends { price: number }>(variants: readonly T[]): T | undefined {
  return variants.reduce<T | undefined>((low, variant) => (!low || variant.price < low.price ? variant : low), undefined);
}

const FORM_PATHS: Record<FormMode, string> = {
  middle: "/middle-form",
  full: "/full-form",
  hybrid: "/hybrid-form",
};

export function parseFormMode(value: unknown): FormMode | null {
  if (value === "middle" || value === "full" || value === "hybrid") {
    return value;
  }
  return null;
}

const RE_250ML = /(?<![\d.,])250\s*ml\b/i;
const RE_500ML = /(?<![\d.,])500\s*ml\b/i;
const RE_1L = /(?<![\d.,])1\s*(?:liter|l)\b/i;
const RE_2L = /(?<![\d.,])2\s*(?:liter|l)\b/i;

type ScopedBrand = "bensu" | "saratoga" | null;

function resolveScopedBrand(
  product: Pick<Product, "slug" | "variants"> & { productId?: string | number },
): ScopedBrand {
  const pid = String(product.productId ?? "").trim();
  const slug = String(product.slug ?? "").trim();
  if (pid === "21329" || pid === "44363" || /^bensu(?:-|$)/i.test(slug)) {
    return "bensu";
  }
  if (pid === "50510" || /^saratoga(?:-|$)/i.test(slug)) {
    return "saratoga";
  }
  return null;
}

export function resolveFormVariant(
  product: Product,
  key?: string,
): ProductVariant | undefined {
  if (!key || !key.trim()) return resolvePreferredFormVariant(product);

  const normalized = key.trim();
  return product.variants.find((variant) => variant.id === normalized);
}

/**
 * Resolves the active checkout form variant:
 * - Explicit `key` (canonical D1 variant ID) wins when matched.
 * - Bensu & Saratoga default to 500ml (`PALING LARIS`) so COD shipping stays
 *   accessible while 250ml serves as a low-friction trial and 1L / 2L as bulk.
 * - All other products (Kojien, Aussie, etc.) preserve upstream `variants[0]`.
 */
export function resolvePreferredFormVariant(
  product: Product,
  key?: string,
): ProductVariant | undefined {
  if (key?.trim()) {
    const matched = resolveFormVariant(product, key);
    if (matched) return matched;
  }

  // A store's preferred size wins; with none to match, the cheapest variant,
  // the price the feeds and cards lead with (product rule, 2026-11-02).
  if (resolveScopedBrand(product)) {
    return (
      product.variants.find((variant) => RE_500ML.test(variant.label)) ??
      cheapestVariant(product.variants)
    );
  }

  return cheapestVariant(product.variants);
}

export type VariantPresentationMeta = {
  badge?: string;
  badgeTone?: "popular" | "bulk";
  dosageNote?: string;
};

export function getVariantPresentationMeta(
  product: Pick<Product, "slug" | "variants"> & { productId?: string | number },
  variant: ProductVariant,
): VariantPresentationMeta {
  const brand = resolveScopedBrand(product);
  if (!brand) return {};

  const label = variant.label || "";
  const compareSavings =
    (variant.comparePrice ?? variant.price) > variant.price
      ? (variant.comparePrice ?? variant.price) - variant.price
      : 0;
  const savingsText =
    compareSavings > 0
      ? ` • HEMAT Rp ${Math.round(compareSavings).toLocaleString("id-ID")}`
      : "";

  if (RE_250ML.test(label)) {
    return {
      badge: `PAKET HEMAT COBA${savingsText}`,
      badgeTone: "bulk",
      dosageNote: "Kemasan Coba Awal (Praktis untuk Koleksi & Uji Coba)",
    };
  }

  if (RE_500ML.test(label)) {
    return {
      badge: `PALING LARIS${savingsText}`,
      badgeTone: "popular",
      dosageNote:
        brand === "saratoga"
          ? "Paket Hemat Rutin (Cukup 16–20 Aplikasi / Tangki)"
          : "Paket Hemat Awal (Cukup 16–20 Tangki Semprot)",
    };
  }

  if (RE_1L.test(label)) {
    return {
      badge: `LEBIH HEMAT${savingsText}`,
      badgeTone: "bulk",
      dosageNote:
        brand === "saratoga"
          ? "Kemasan 1 Liter (Lebih Hemat 35–40 Aplikasi / Tangki)"
          : "Lebih Hemat untuk 1 Musim (Cukup 35–40 Tangki Semprot)",
    };
  }

  if (RE_2L.test(label)) {
    const oneLiter = product.variants.find((v) => RE_1L.test(v.label));
    const extraDiscount =
      oneLiter && oneLiter.price * 2 > variant.price
        ? oneLiter.price * 2 - variant.price
        : 0;
    const discountSuffix =
      extraDiscount > 0
        ? ` • DISKON Rp ${Math.round(extraDiscount).toLocaleString("id-ID")}`
        : savingsText;
    return {
      badge: `${brand === "saratoga" ? "PAKET GROSIR 2L" : "PAKET 1 HEKTAR"}${discountSuffix}`,
      badgeTone: "bulk",
      dosageNote:
        brand === "saratoga"
          ? "2 Botol × 1 Liter (Stok Hemat Kebun & Koleksi Besar)"
          : "2 Botol × 1 Liter (Stok Aman 70–80 Tangki Semprot)",
    };
  }

  return {};
}

export function buildFormUrl(
  mode: FormMode,
  product: Pick<Product, "productId">,
  variant?: Pick<ProductVariant, "id">,
) {
  const params = new URLSearchParams({ product_id: product.productId });
  if (variant) params.set("variant_id", variant.id);
  return `${FORM_PATHS[mode]}?${params.toString()}`;
}

export function buildEmbedFormUrl(
  mode: FormMode,
  product: Pick<Product, "productId">,
  variant?: Pick<ProductVariant, "id">,
) {
  const params = new URLSearchParams({
    mode,
    product_id: product.productId,
  });
  if (variant) params.set("variant_id", variant.id);
  return `/embed/form?${params.toString()}`;
}

export function buildFormUrls(
  product: Pick<Product, "productId">,
  variant?: Pick<ProductVariant, "id">,
) {
  return {
    middle: buildFormUrl("middle", product, variant),
    full: buildFormUrl("full", product, variant),
    hybrid: buildFormUrl("hybrid", product, variant),
  };
}

export function buildEmbedFormUrls(
  product: Pick<Product, "productId">,
  variant?: Pick<ProductVariant, "id">,
) {
  return {
    middle: buildEmbedFormUrl("middle", product, variant),
    full: buildEmbedFormUrl("full", product, variant),
    hybrid: buildEmbedFormUrl("hybrid", product, variant),
  };
}
