# MAL Engineering Tasks and Evidence Ledger

State indicates code presence, not production certification.

| ID | Change | Test / exit gate | Status |
|---|---|---|---|
| MAL-001 | Measurement glossary and fixtures | 1/7/30 day deterministic unit tests | Partial |
| MAL-002 | Next + Postgres + auth schema | GitHub full CI and migration in disposable DB | In verification |
| MAL-003 | Better Auth, membership, scoped API | Browser registration + cross-tenant negative cases | In verification |
| MAL-004 | Sites, campaigns, UTM, coupons | CRUD + duplicate validation | In verification |
| MAL-005 | Consent UI and storage | Rejection/revocation leaves no visitor ID | In verification |
| MAL-006 | Collector + session + dedup | DB integration, abuse and replay tests | Partial |
| MAL-007 | Opaque checkout tokens | TTL/replay and origin protection | Partial |
| MAL-008 | Orders CSV preview and commit | Idempotency, refunds and atomic rollback | Partial |
| MAL-009 | Spend CSV | Stable row key + reconciliation | Partial |
| MAL-010 | Attribution | Golden journey in DB and isolated unit | In verification |
| MAL-011 | Reporting APIs | Site-scoped counts + model reconciliation | In verification |
| MAL-012 | Console/dashboard & CSV export | Browser flows, accessibility, mobile | Partial |
| MAL-013 | Security, deletion, docs | Full CI, threat review, owner privacy approval | Partial |

## Blockers

- Production privacy/legal and retention decisions remain open.
- Lockfile and committed migration artifacts need a reproducible generation/review process.
- Backend checkout must be integrated with a trusted commerce source before real customer data.
- Rate limits currently in memory; this is not suitable for multi-instance production.
- Need full Playwright/browser results before calling UX complete.
