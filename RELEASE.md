# Release and Deployment — AdsBookCMS

> Verified against disk: 2026-08-18 @ `09812c7` + the current working tree on `feat/admin-access-dashboard`

This document is the single owner of how a change reaches production. It replaces the previous `VERSION.md` runbook and the deleted `AUTO_UPDATE_DEPLOY.md`, which between them described three mutually exclusive release models, none of which matched the one workflow that exists.

---

## 1. The one release path

```
this repo:   push to main → .github/workflows/ci.yml → npm ci → npm run check → npm test → npm run build → stop
an install:  push to main → its own deploy workflow → …same gates… → npx wrangler deploy → live traffic
```

**In this repository, pushing to `main` deploys nothing.** CI runs check, test and build only; there are no Cloudflare credentials here and no deploy target.

Releasing means an install pulls this code into its own repository and deploys from there, against its own Worker, D1, KV, R2 and domain. In an install repository that carries the deploy workflow, **pushing to `main` does reach live traffic with no staging and no approval step**, so a merge there carries the same weight as running a deploy by hand.

The workflow triggers on push to `main`, on pull requests, and on manual
dispatch. It declares **no GitHub environment and no secrets** — those three
lines are the whole trigger block in `ci.yml`.

> The previous version of this section described a `CLOUDFLARE_API_TOKEN` GitHub
> environment and two Cloudflare secrets as if they existed here. They never
> did: that text belonged to the deleted `deploy.yml` and survived six lines
> below the sentence saying it had been removed. Keeping Cloudflare credentials
> out of this repository is the entire point of ADR-012, so a line implying they
> are already present is the most expensive kind of wrong — someone reconciling
> the document against reality would have *added* them.

### Manual deploy

`npx wrangler deploy` (or `npm run deploy`) deploys the working tree to whatever
Worker `wrangler.jsonc` names. In **this** repository that file is placeholders
(`example.com`, placeholder binding ids), so there is no production Worker to
reach; the command belongs in an install, run against that install's own
resources.

---

## 2. Gates before merging to `main`

Run in this order — it is the order CI runs them, so a failure here is a failure there:

```bash
npm test          # node --test over src/lib/*.test.ts
npm run check     # astro check && tsc --noEmit
npm run build     # astro build
```

Current verified working-tree baseline: **403 tests passing**, `tsc` clean, `astro check` 350 files, 0 errors / 0 warnings / 0 hints, and the Cloudflare server build complete. The branch push itself has no hosted CI result because this workflow runs only for `main`, pull requests, or manual dispatch.

### Current production-readiness assessment

The current working tree at `09812c7` is a **release candidate**, not an unconditional full-production
release. The local automated and browser gates are green. Worker `taniniaga`
was deployed to both production custom domains on 2026-08-18 as Version ID
`12a51aa8-c86d-41de-8001-4627d704e108`; the remote D1 migration preflight
subsequently reported no migrations to apply. The deployment source was the
local install checkout at `~/Projects/taniniaga`. The following release
evidence is still missing:

- a hosted CI run for the exact commit;
- read-only or approved sandbox/live smoke evidence for the active Mengantar
  account's tracking, pickup, and insufficient-wallet responses;
- the canonical AutoLaris transaction-inquiry endpoint and paid/pending/expired/
  failed schemas required by the scheduled reconciliation job.

COD and manual seller-bank transfer can be considered for a controlled canary
after install-specific configuration, backup/rollback preparation, and provider
smoke checks. AutoLaris QRIS/VA must remain disabled for production checkout
until authoritative scheduled payment reconciliation is implemented and proven.

A green build is not proof the storefront works. For any browser-visible change, open the affected page before merging. Neither `tsc` nor `astro check` catches a route that fails to compose — an unterminated `.astro` frontmatter block silently produced a 404 on `/disclaimer` while every static check stayed green.

---

## 3. Database migrations

The Worker bundle contains the exact SQL from `src/db/migrations/`. Before a
database-backed request reaches route code, middleware validates `d1_migrations`
against that chain and atomically applies a valid missing suffix. Each migration's
statements and claim row execute in one D1 batch, so concurrent first requests
cannot claim success around a partial schema.

Operators may still apply the same chain explicitly as a preflight:

```bash
npm run db:migrate:local
npm run db:migrate:remote   # production D1 — approval required
```

Rules:

- **Never edit an applied migration in place.** Corrections ship as a new forward migration.
- **Write migrations by hand.** There is no generator; Drizzle was retired (ADR-005).
- **Keep every migration backward-compatible with the previous Worker bundle.** A Worker rollback cannot roll schema back.
- `src/db/migrations/` is the only migration directory.
- Invalid, unknown, or ahead history fails closed with `SCHEMA_UPGRADE_*`; never bypass the gate.

---

## 4. Version registry

Two registries, currently in step:

| Source | Field | Value |
| --- | --- | --- |
| `src/lib/version.ts` | `version` | `1.2.0` |
| `src/lib/version.ts` | `releaseTag` | `2026.08-hardened` |
| `src/lib/version.ts` | `schemaVersion` | `43` |
| `package.json` | `version` | `1.2.0` |

`src/lib/version.ts` is what the admin sidebar renders and is the value users
see. Keep it and `package.json` in step when bumping.

`schemaVersion` counts migration files, and the tree holds 43 (`0000`–`0042`).
`schema-version.test.ts` fails CI on drift; middleware enforces the same chain at
runtime; `operational-health.ts` and the dashboard expose applied version.

> This section previously declared the two drifted (`34` against `36`) and said
> `schemaVersion` was "read by nothing in `src/`". Both were false, and acting on
> them meant editing a correct constant until the test guarding it went red.

### Bumping a release

1. Update `src/lib/version.ts` (`version`, `releaseTag`, `lastUpdated`, and `schemaVersion` if migrations were added).
2. Record the change in `BUILD-LOG.md` as a new entry.
3. Update `STATUS.md` if the system state changed.
4. Merge to `main`. In this repository that ships nothing; an install picks the change up through §7.

---

## 5. Rollback

There is no automated rollback. Options, in order of preference:

1. **Revert the commit and merge** — goes through the same gates, and an install redeploys the previous behaviour when it next follows §7.
2. **Cloudflare dashboard rollback** to a previous Worker version — immediate, but the repository no longer matches production until you also revert in git.

**Migrations do not roll back.** A schema change that must be undone requires a new forward migration written for that purpose. Plan destructive schema changes accordingly.

---

## 6. What deploying does not do

- It does not require a separate migration command; runtime applies a valid missing suffix on the first database-backed request. An explicit preflight is still a separate approved production action.
- It does not seed or modify catalog data beyond forward migration logic.
- It does not rotate secrets. Worker secrets are set out of band and are never in `wrangler.jsonc`.
- It does not touch provider state at Mengantar or AutoLaris.

---

## 7. Updating an install from the product

AdsBookCMS is the upstream product; Tani Niaga is a local install checkout. On this workstation, product changes originate in `~/Projects/adsbookcms`, are pulled or merged into `~/Projects/taniniaga`, adjusted there for the Tani Niaga install, and only then deployed to Cloudflare from `~/Projects/taniniaga`. Never deploy Tani Niaga directly from the upstream AdsBookCMS checkout.

### The procedure, in this order

For Tani Niaga specifically, every command from merge conflict resolution
through `wrangler deploy` runs inside `~/Projects/taniniaga`. Its
`wrangler.jsonc`, bindings, routes, runtime fallbacks, and install-specific
changes must survive the upstream merge.

```bash
cd ~/Projects/taniniaga
git fetch origin
git merge origin/main                    # keep and reconcile Tani Niaga config
npm ci                                  # only if the lockfile moved
npm run check && npm test               # gates, before touching anything live
npm run build                           # identity is runtime-owned; this is code only
npx wrangler deploy
# optional before deploy, when the operator wants explicit schema preflight:
npm run db:migrate:remote               # separate production approval
```

### Why the order is safe

**Runtime owns schema readiness.** A newly deployed Worker validates and applies
the bundled missing suffix before route code sees D1. Explicit migration remains
useful as a pre-deploy failure check, but it is not a hidden prerequisite for a
working install.

**Identity is not in the build.** It was, and gap G1 tracked that; the `stores`
row now owns it (migration `0036`, `readStoreIdentity`), resolved per request in
middleware. The `PUBLIC_SITE_*` vars in `wrangler.jsonc` are a fallback for a
store that has none, so a build carrying the product's placeholders no longer
produces a bundle stuck calling itself "Your Store" — but keep them accurate
anyway, because they are what an install shows before the wizard runs.

**Confirm the target before deploying.** `npx wrangler deploy --dry-run` prints the resolved Worker name, bindings and routes. If it prints `adsbookcms-your-store`, or a database id of all zeros, the merge overwrote the install's configuration — stop and restore it.

### What this procedure does not solve

It is manual, and nothing verifies that an install ran it. Drift between the product and its installs is the accepted cost of ADR-012, and closing it properly is task **A-51**; making the product an installable, versioned artifact is **A-52**.

---

## 8. Approval boundary

`main` is **not** production here (§1), but everything downstream of it is.
These require explicit approval before they happen:

- merging or pushing to `main` **in an install repository**, where it deploys;
- `npx wrangler deploy` / `npm run deploy`;
- `npm run db:migrate:remote` or any `--remote` D1 command;
- creating or deleting Cloudflare resources (D1, KV, R2, custom domains);
- any operation that mutates provider state at Mengantar or AutoLaris.

Read-only local work — tests, typecheck, build, local D1 — needs no approval.
