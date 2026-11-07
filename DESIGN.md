# DESIGN.md — Direct-Response Native Landing Pages (Tani Niaga)

## Direction
Picked-by: owner 2026-11-07 (direction B of 3)
Surface/job: Direct-response single-product landing pages (480px mobile column) converting cold farm traffic into COD orders.
References: design/refs/taniniaga.shop — ultra-clean typography, prominent before/after field demplot evidence, instant hybrid order form.
Sections (in order, each with its one job):
1. Hero: Stop-scrolling headline, visual proof with edge-to-edge aspect ratio 3/2 image, verified claim banner, trust points.
2. Hard Problem: Agitate acute field crisis (loss aversion, cost of failure).
3. Overclaim Mechanism: 3-step bio-physiological action timeline.
4. Physical Comparison: High-contrast side-by-side card (kondisi rusak vs kondisi pulih).
5. Product Anatomy: Pure single-product formula, active ingredients, dosage efficiency.
6. Field Demplot Proof: Testimonials with real poktan/villages and harvest records.
7. Checkout: Direct hybrid form with COD, package picker, and instant submit.
Feel: Authoritative, raw field proof, urgent.
Photo style: Unfiltered farmer camera, authentic Indonesian farm demplots, high-saturation crop closeups.
Motion profile: Subtle (micro-interaction on cards and smooth scroll to form only).
Won't do: No AI-slop neon gradients, no multi-product offers, no hidden checkout barriers.

### Composition contract
C1: Hero geometry: max-width 440px text block, aspect ratio 3/2 full-width image with proof banner overlay.
C2: Comparison cards: Two vertical stacked cards (Kondisi Rusak red border, Kondisi Pulih emerald border).
C3: Sticky CTA: Disappears when hero or checkout form is visible, emerges during content scroll.

## Tokens

### Colour
- Primary Ink: `#111111`
- Body Slate: `#334155`
- Muted Slate: `#64748B`
- Canvas Surface: `#FFFFFF`
- Alt Surface: `#F8FAFC`
- Accent Brand CTA: `#14532D` (Primary Forest Green for Saratoga/Kojien/Bensu Agro)
- Accent Hover: `#166534`
- Accent Ring: `rgba(20, 83, 45, 0.2)`
- Alert / Loss Red: `#DC2626`
- Alert Soft Red: `#FEF2F2`
- Proof Emerald: `#16A34A`
- Proof Soft Emerald: `#ECFDF5`

### Type
- Primary: Inter, -apple-system, sans-serif
- Scale: 11px, 12px, 13px, 14px, 15px, 16px, 18px, 22px, 26px, 28px, 32px

### Radius
- Controls / Buttons: 0.75rem (12px)
- Cards / Media: 0.875rem (14px)
- Badges: 9999px (full pill)

### Spacing
- Base: 4px
- Section rhythm: 32px to 48px vertical padding, 16px to 20px horizontal gutter

### Motion
- Ease: cubic-bezier(0.16, 1, 0.3, 1)
- Duration: 200ms for active states, 300ms for sticky bar translation
- Reduced motion: transform disabled, instant opacity fallback

## Allow
allow: primary-actions — Direct response landing page with hero jump and bottom sticky bar directing to the single purchase form.
allow: stock-image — Authentic demplot and crop diagnostic photography required for agricultural direct-response proof.
allow: image-reuse — Brand asset container and official seal reused consistently across product cluster.
allow: section-count — 7 focused sections are strictly required by the direct-response agronomic conversion sequence.
allow: emphasis — High-impact direct-response agronomy headings require highlighted brush keywords for mobile scanning.
allow: h1-length — Direct-response agricultural problem-solution headlines require comprehensive acute symptom and mechanism statements.
allow: first-viewport-words — High-converting direct response hero requires problem badge, value proposition, and key credibility points above the fold.
allow: card-in-card — Multi-tier pricing variant cards and payment breakdown require structured containment.
allow: body-size — Mobile field reading standardizes compact 13px-15px body copy across multi-tier comparison elements.
allow: hero-height — Direct-response first fold requires headline, aspect 3:2 visual proof, and credibility pills above the fold.
