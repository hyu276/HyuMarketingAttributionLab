# Implementation Status

## Local MAL-012 upgrade, 18 October 2026

The operational console now separates workspace setup, campaign and UTM work, trusted CSV imports, overview, and attribution analysis. Reports expose both model summaries over the same order ledger, import freshness, separate coupon credit, and a 1/7/30-day lookback shared with CSV export. The introduction page no longer claims the implemented backend is missing.

This branch is a local development artifact. The MAL-012 CI runs below verify this upgrade; they do not approve production, certify accessibility, or replace a security review. No public backend has been deployed.

### Local verification on this branch

- PASSED: `npm ci --no-audit --no-fund`, `npm run db:generate` (no schema drift), `npm run lint`, `npm run typecheck`, `npm test` (9/9), `npx tsx --test tests/integration/imports-report.test.ts` (4/4 pure CSV/report tests), and `npm run build` with nonfunctional local build-time database/auth environment variables.
- PASSED: `npm audit --omit=dev --audit-level=moderate` (0 reported production dependency advisories), repository rule checker, and `git diff --check`.
- UI review: rendered a synthetic, test-only API fixture at 390, 768, 1280 and 1440 CSS pixels. No page-level horizontal overflow or browser exceptions were observed. Tab navigation and a registered UTM link were exercised. This fixture does not verify real database behavior.
- BLOCKED locally: PostgreSQL integration tests, migrated database smoke, and database-backed Playwright E2E, because this machine has no Docker/PostgreSQL service. Full `npm audit` still reports five high advisories through the development-only Next.js ESLint dependency chain; no patched compatible version was available from the registry during this run.

### GitHub CI verification for MAL-012

- [Fullstack build and database smoke run 39126080774](https://github.com/hyu276/HyuMarketingAttributionLab/actions/runs/39126080774): PASSED on commit `381949bffeaed534914bb1da36c3da8434310010`. Covers dependency installation, lint, typecheck, domain tests, migration drift, PostgreSQL 16 migration and integration tests, Next.js production build, Playwright Chromium E2E (5/5), and governance integrity.
- [Domain tests and documentation integrity run 39126080752](https://github.com/hyu276/HyuMarketingAttributionLab/actions/runs/39126080752): PASSED on the same commit.
- The CI database is disposable and the browser flow uses test accounts. Real commerce integration, production privacy decisions, a full accessibility audit, and deployment remain outstanding.

### UI repair record

| Location / evidence | User impact | Decision and change | Verification |
|---|---|---|---|
| Console source placed all operations in one long page and fixed October 2026 dates | Hard to locate tasks; future reports initially empty | Separate task sections, default dates to current month, expose model/lookback/date context | Browser fixture at four widths; source and build checks |
| Intro page claimed backend and reporting were absent | Misstated actual implementation | Replace with local full-stack status and production caveat | Source review and rendered public route |
| Campaign revenue mixed verified and coupon fallback while ROAS used verified credit | Hard to reconcile campaign figures | Add distinct fields, preserve legacy combined field, explain ROAS basis | API contract review; DB integration assertions passed in MAL-012 CI |

## Status as of 17 October 2026

This repo contains a substantial **local-first full-stack implementation candidate** on PR #2. The status of *real user data handling or hosted production* remains **NOT APPROVED**.

| Area | Code implementation | Verification |
|---|---|---|
| P0 measurement specs and golden fixtures | Present | Domain tests pass in GitHub CI |
| P1 Next.js, PostgreSQL, Drizzle, Better Auth, membership | Present | Initial fullstack CI passed install, lint, typecheck, migration and build; E2E pending |
| P2 sites/campaigns, UTM and coupon registry | Present | API and domain code, browser functional tests pending |
| P3 opt-in SDK, collector, touchpoints/session | Present | Unit/browser consent negative checks pending; abuse not production hardened |
| P4 trusted CSV import, spend and checkout tokens | Present | CSV tests passed; complex refund/concurrency and live commerce integration pending |
| P5 first and last-non-direct attribution | Present | Pure golden tests passed; DB golden test added, pending CI |
| P6 persisted analytics report and export UI | Present | Static build passed; E2E and accessibility pending |
| P7 hardening and production | Partial | Real privacy/retention policy, production secrets, monitoring, backups and hosting not approved |

## Observed GitHub evidence

- [Fullstack CI 39033008753](https://github.com/hyu276/HyuMarketingAttributionLab/actions/runs/39033008753): PASS npm dependency install, ESLint, TypeScript, domain tests, CSV tests, Drizzle generate/migrate on PostgreSQL 16 and Next production build.
- [Domain CI 39033008589](https://github.com/hyu276/HyuMarketingAttributionLab/actions/runs/39033008589): PASS domain tests and governance integrity.
- New E2E/database integration tests still require a fresh final-head run. Do not use an older green CI result as proof for newer code.

## Explicit non-goals

No GA4/Ads API OAuth, multi-currency conversion, production cloud, incremental/causal ROAS claims, cross-device identity or probabilistic attribution. No production claim without legal/privacy review and full negative-case testing.

## Latest-head verification requirement

Do not call the project fully verified until the GitHub workflow on the latest commit passes npm ci, lint, typecheck, domain, PostgreSQL integration, migration drift, Next production build and Playwright E2E. Browser review covers functional paths but not a full WCAG audit. Production privacy policy, retention configuration, recovery email, distributed throttling and legitimate commerce backend integration remain pending.

## Historical CI on 6e6f21c6

- GitHub Actions [Fullstack build and database smoke run 39034410067](https://github.com/hyu276/HyuMarketingAttributionLab/actions/runs/39034410067): PASSED on commit 6e6f21c6. npm ci, ESLint, TypeScript, unit tests, checked-in Drizzle migration drift check, migration to disposable PostgreSQL 16, database integration tests, Next.js production build, Playwright E2E (5/5).
- GitHub Actions [Domain tests and documentation integrity run 39034410065](https://github.com/hyu276/HyuMarketingAttributionLab/actions/runs/39034410065): PASSED on the same commit.
- CI test evidence does not constitute a production security audit, full WCAG certification, real-person consent approval or cloud deployment.
