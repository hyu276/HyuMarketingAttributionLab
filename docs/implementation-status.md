# Implementation Status

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
