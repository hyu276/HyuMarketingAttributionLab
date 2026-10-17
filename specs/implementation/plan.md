# Marketing Attribution Lab, Executable Implementation Plan

**Source of truth:** repository-rules/01-ROADMAP.md and specs/INDEX.md. This file is an execution ledger, not a substitute for observed CI evidence.

## Sequence and file boundaries

1. MAL-001: Measurement contract. Inspect docs/measurement-methodology.md and domain tests; stabilize observed/attributed/coupon/unassigned semantics; verify golden cases.
2. MAL-002: Next.js + Postgres. package.json, compose.yaml, drizzle.config.ts, src/db/schema.ts and src/db/auth-schema.ts. Generate reviewed migrations, apply to disposable DB; check build.
3. MAL-003: Auth/RBAC. src/server/auth.ts, authz.ts and API workspace/site endpoints. Browser signup, workspace owner, unauthorized GET/POST, cross-workspace checks.
4. MAL-004: Registry. campaigns and coupons API, UTM code and console UI. Duplicate UTM/foreign site negative cases.
5. MAL-005/006: Consent. src/tracker/client.ts, public collect endpoint, store UI. Denied/revoked creates no analytics identifiers; malformed payload/retries/session isolation tests.
6. MAL-007/008/009: Orders, checkout links, spend. Preview/commit, bounded input, sha digest, replay-safe tokens, lifecycle/refund, rollback and zero-spend semantics.
7. MAL-010: Attribution engine. Pure domain fixtures and linked order reporting reconciliation. Model outputs must never multiply order totals.
8. MAL-011/012: Database reports and operations UI. Auth-scoped KPIs, data provenance, date filtering, model and export. Empty/error/mobile state tests.
9. MAL-013: Hardening. CI full-stack build/DB migration/tests, Playwright flows, accessibility, security review, privacy policy owner gate. Never deploy without explicit approval.

## Architecture choices and alternatives

- **Local modular monolith (selected):** single deployable Next/Node and PostgreSQL. Pros: traceability, maintainability for solo owner. Cons: collector and dashboard share runtime. Alternative microservices would increase operational complexity with no measured scale requirement.
- **Authoritative CSV orders and costs (selected):** deterministic and reviewable. Alternative direct ad/store OAuth demands cloud credentials and API operations, postponed.
- **Consent SDK (selected):** transparent first-party opt-in; loses visibility when declined, reflected as unassigned. Alternative fingerprinting or nonconsensual tracking rejected.
- **Predefined attribution models (selected):** explainable but not causal proof. Algorithmic attribution deferred.

## Rollback and change management

All changes are on PR #2 branch; do not merge into main until passing full CI and approval. DB tests use disposable PostgreSQL. Before deploying outside local, store backups, review migrations and privacy obligations. Any failed pipeline gate requires an evidence-based patch, not deleting tests.

## Verification evidence to gather

- Domain and CSV tests via GitHub Actions.
- Drizzle generate/migrate on Postgres 16 temporary CI service.
- ESLint, tsc strict, Next production build.
- Browser tests: UTM, model switch, consent denial, signup -> workspace -> site -> campaign, import -> report.
- Security negative tests: auth bypass, tenant access, expired token, unknown coupon, dangerous CSV cells.
- Manual contrast/keyboard/responsive review at 390/768/1024/1440; screenshots only if actual browser executed.
