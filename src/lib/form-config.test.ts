import assert from "node:assert/strict";
import test from "node:test";
import type { Product } from "../data/products.ts";
import {
  buildEmbedFormUrls,
  buildFormUrls,
  getVariantPresentationMeta,
  parseFormMode,
  cheapestVariant,
  resolveFormVariant,
  resolvePreferredFormVariant,
} from "./form-config.ts";

const product = {
  catalogId: 10001,
  productId: "10001",
  variants: [
    {
      catalogId: 20001,
      sku: "AUS-500ML",
      id: "20001",
      label: "Alpha - 500ml",
      price: 150000,
    },
    {
      catalogId: 20002,
      sku: "AUS-1L",
      id: "20002",
      label: "Alpha - 1 Liter",
      price: 300000,
    },
  ],
} as Product;

test("form modes accept only middle, full, and hybrid", () => {
  assert.equal(parseFormMode("middle"), "middle");
  assert.equal(parseFormMode("full"), "full");
  assert.equal(parseFormMode("hybrid"), "hybrid");
  assert.equal(parseFormMode("adaptive"), null);
});

test("form variants resolve only by canonical D1 variant ID and default to first variant for non-scoped products", () => {
  assert.equal(resolveFormVariant(product)?.catalogId, 20001);
  assert.equal(resolveFormVariant(product, "20001")?.catalogId, 20001);
  assert.equal(resolveFormVariant(product, "20002")?.catalogId, 20002);
  assert.equal(resolveFormVariant(product, "AUS-1L"), undefined);
  assert.equal(resolveFormVariant(product, "99999999"), undefined);
  assert.deepEqual(getVariantPresentationMeta(product, product.variants[0]), {});
});

test("generated URLs bind canonical product and variant IDs across all modes", () => {
  assert.deepEqual(buildFormUrls(product, product.variants[1]), {
    middle: "/middle-form?product_id=10001&variant_id=20002",
    full: "/full-form?product_id=10001&variant_id=20002",
    hybrid: "/hybrid-form?product_id=10001&variant_id=20002",
  });
});

test("generated embed URLs keep mode and canonical IDs explicit", () => {
  assert.deepEqual(buildEmbedFormUrls(product, product.variants[1]), {
    middle: "/embed/form?mode=middle&product_id=10001&variant_id=20002",
    full: "/embed/form?mode=full&product_id=10001&variant_id=20002",
    hybrid: "/embed/form?mode=hybrid&product_id=10001&variant_id=20002",
  });
});

test("resolvePreferredFormVariant and getVariantPresentationMeta reflect exact Bensu & Saratoga pricing tiers and isolate other products", () => {
  const saratoga = {
    productId: "50510",
    slug: "saratoga-serum-tanaman-premium",
    variants: [
      { id: "13", label: "250ml", price: 75000, comparePrice: 115000 },
      { id: "1", label: "500ml", price: 135000, comparePrice: 198000 },
      { id: "2", label: "1 Liter", price: 235000, comparePrice: 298000 },
      { id: "14", label: "2 Liter", price: 460000, comparePrice: 596000 },
    ],
  } as Product;

  assert.equal(resolvePreferredFormVariant(saratoga)?.id, "1");
  assert.equal(resolvePreferredFormVariant(saratoga, "13")?.id, "13");
  assert.equal(resolvePreferredFormVariant(saratoga, "2")?.id, "2");
  assert.equal(resolvePreferredFormVariant(saratoga, "14")?.id, "14");

  const meta250 = getVariantPresentationMeta(saratoga, saratoga.variants[0]);
  assert.equal(meta250.badge, "PAKET HEMAT COBA • HEMAT Rp 40.000");
  assert.equal(meta250.badgeTone, "bulk");
  assert.match(meta250.dosageNote || "", /Kemasan Coba Awal/);

  const metaSaratoga2L = getVariantPresentationMeta(saratoga, saratoga.variants[3]);
  assert.equal(metaSaratoga2L.badge, "PAKET GROSIR 2L • DISKON Rp 10.000");

  // Guard against leading-digit false positives (`1250ml`, `1.500ml`, `11 Liter`) and fake 2L discounts
  const edgeProduct = {
    productId: "21329",
    slug: "bensu-pupuk-cair-organik",
    variants: [
      { id: "91", label: "1.500ml", price: 350000 },
      { id: "92", label: "500ml", price: 135000 },
      { id: "93", label: "1 Liter", price: 230000 },
      { id: "94", label: "2 Liter", price: 460000 },
    ],
  } as Product;
  assert.equal(resolvePreferredFormVariant(edgeProduct)?.id, "92");
  assert.deepEqual(getVariantPresentationMeta(edgeProduct, edgeProduct.variants[0]), {});
  assert.equal(getVariantPresentationMeta(edgeProduct, edgeProduct.variants[3]).badge, "PAKET 1 HEKTAR");

  const kojien = {
    productId: "99118",
    slug: "kojien",
    variants: [
      { id: "7", label: "500ml", price: 130000, comparePrice: 198000 },
      { id: "8", label: "1 Liter", price: 215000, comparePrice: 298000 },
    ],
  } as Product;
  assert.equal(resolvePreferredFormVariant(kojien)?.id, "7");
  assert.deepEqual(getVariantPresentationMeta(kojien, kojien.variants[0]), {});

  const bensu = {
    productId: "21329",
    slug: "bensu-pupuk-cair-organik",
    variants: [
      { id: "5", label: "500ml", price: 135000, comparePrice: 198000 },
      { id: "6", label: "1 Liter", price: 235000, comparePrice: 298000 },
      { id: "15", label: "2 Liter", price: 460000, comparePrice: 596000 },
    ],
  } as Product;

  assert.equal(resolvePreferredFormVariant(bensu)?.id, "5");
  assert.equal(resolvePreferredFormVariant(bensu, "6")?.id, "6");
  assert.equal(resolvePreferredFormVariant(bensu, "15")?.id, "15");

  const meta500 = getVariantPresentationMeta(bensu, bensu.variants[0]);
  assert.equal(meta500.badge, "PALING LARIS • HEMAT Rp 63.000");
  assert.equal(meta500.badgeTone, "popular");
  assert.match(meta500.dosageNote || "", /16–20 Tangki/);

  const meta1L = getVariantPresentationMeta(bensu, bensu.variants[1]);
  assert.equal(meta1L.badge, "LEBIH HEMAT • HEMAT Rp 63.000");
  assert.equal(meta1L.badgeTone, "bulk");
  assert.match(meta1L.dosageNote || "", /35–40 Tangki/);

  const meta2L = getVariantPresentationMeta(bensu, bensu.variants[2]);
  assert.equal(meta2L.badge, "PAKET 1 HEKTAR • DISKON Rp 10.000");
  assert.equal(meta2L.badgeTone, "bulk");
  assert.match(meta2L.dosageNote || "", /2 Botol × 1 Liter/);
});
