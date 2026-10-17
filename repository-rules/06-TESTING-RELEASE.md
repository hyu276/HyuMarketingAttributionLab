# Testing, Continuous Integration and Release Gates

## Principle

Do not report "done" solely because code was written or a mockup rendered. Evidence is task-specific: static checking cannot prove functionality; a single happy-path test cannot prove isolation.

## Test layers

| Layer | Examples | Minimum proof |
|---|---|---|
| Static | ESLint, strict TypeScript, formatting, dependency/version check | Reproducible commands |
| Unit | UTM normalize, money, model tie-breakers, lookback, session calculation | Deterministic fixtures |
| Integration | DB constraints, imports, auth/RBAC, transactions, re-attribution | Disposable PostgreSQL |
| E2E | consent accept/deny/revoke, tracker -> collector -> report, orders and dashboard | Browser + DB + server |
| Security | cross-tenant reads/writes, forged event/order, bad token, CSV injection | Negative tests |
| Visual/a11y | typography, chart truth, table overflow, keyboard, 360/768/1280/1440 | Observed screenshots/browser review |
| Reliability | duplicate event/order, order mutation/recompute, time-window boundaries | Assertions without flakiness |

## Minimum exit gates by change

- Docs-only changes: links, internal references, markdown consistency and rule file presence.
- UI changes: static checks, UI behavior tests, real viewport/keyboard inspection where available.
- API/DB changes: schema validation, auth/scoping tests, integration tests, migrations and build.
- Attribution changes: all golden fixtures, refund/dedup/reconciliation tests and model version audit.
- Tracking changes: consent-denied and revoked must NOT create tracking IDs or events; malformed/rate-limit/duplicate checks.
- Release candidate: lint, typecheck, unit, integration, E2E, build, privacy/tenant review, reproducible demo and no critical incidents.

## Local and CI convention

After P1, scripts should expose `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm build`, `pnpm db:migrate`. Add GitHub Actions for PR and main; use ephemeral PostgreSQL services. Until actual scripts exist, report these checks as **NOT RUN** instead of making up success.

Use the lightweight `python3 scripts/check_repository_rules.py` to verify governance files exist and references resolve. It is a documentation integrity test, not a full security or quality audit.

## Definition of Done

1. The scoped product behavior works with persistence and proper permissions.
2. Negative/error/empty states covered.
3. Test and build evidence collected; CI shown green or explicitly blocked.
4. Architecture, user-facing metrics and documentation updated when changed.
5. Diff inspected for scope creep, accidental secrets, privacy hazards and dangerous migration.
6. PR includes reproducible manual smoke steps and truthful test status.

Reporting vocabulary: **PASSED** (observed), **FAILED** (observed failure), **NOT RUN** (not executed), **BLOCKED** (cannot run) and **PARTIAL** (incomplete requirement). Never transform a NOT RUN into a pass.
