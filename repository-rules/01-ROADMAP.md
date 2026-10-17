# Marketing Attribution Lab: Executable MVP Roadmap

**Status:** Approved planning baseline, NOT implemented.
**Owners:** Solo developer + task-scoped AI coding agents.
**Delivery mode:** GitHub-first, local-first, no production cloud provisioned.
**Estimate:** 10-12 weeks at roughly 15-20 hours/week for an experienced Next.js/SQL developer. Re-estimate after Phase P0.
**Repository:** https://github.com/hyu276/HyuMarketingAttributionLab

## Product brief

Create a multi-workspace marketing attribution application that captures consented first-party events, registers UTM campaigns, accepts authoritative orders and ad spend, links eligible marketing touchpoints to orders, computes explainable first-touch and last-non-direct-touch credit, and produces reconciled, auditable dashboards.

The user must be able to answer: where eligible traffic came from; which valid orders were observed; which are confidently linked, coupon-linked or unassigned; how different models attribute the SAME revenue; how spend relates to attributed revenue; and what data is missing.

### P0 functional contract

- User authentication; workspace/site separation; Admin and Viewer/Analyst permission boundaries.
- Site and campaign registry with safe UTM builder and \`utm_id\` mapping.
- Privacy-aware tracking SDK with consent gate, allowed event schemas, session and touchpoint capture.
- Authenticated order CSV preview/commit and spend CSV preview/commit; deterministic imports and refunds.
- Server-generated verified checkout links; explicit coupon fallback when no verified journey exists.
- First-touch and last-non-direct-touch, lookback options 1/7/30 days, deterministic credit and \`unassigned\`.
- Overview, acquisition, campaigns, funnel, attribution, orders, spend, site setup, workspace settings.
- Time/source/medium/campaign/model filters; accessible export of safely escaped CSV.
- Data quality/freshness, audit logs, retention/deletion baseline, local Docker database, CI and E2E tests.

### Explicitly out of scope (P1/P2)

Ad platform OAuth/sync, GA4 reconciliation, real-time streaming, probabilistic identity matching, cross-device stitching, algorithmic attribution, MMM/incrementality claims, billing, pricing, Redis/Kafka/ClickHouse, microservices and production deployment.

## Phase sequence

| Phase | Effort | Outcome | Gate |
|---|---:|---|---|
| P0 | 10-16 h | Measurement definitions, risks, fixtures, owner decisions | Golden truth-table, data policies and open questions reviewed |
| P1 | 15-24 h | Local Next.js, PostgreSQL, Drizzle, auth, RBAC, CI | Fresh clone runs; cross-tenant integration tests pass |
| P2 | 12-18 h | Sites, campaigns, URL builder, UTM validation | Link generation and permission tests pass |
| P3 | 22-34 h | Consent SDK, collector, sessions, touchpoints | Consent-denied never creates analytics visitor IDs; dedup/abuse tests pass |
| P4 | 20-30 h | Trusted orders, spend, checkout-linking, imports | Idempotent imports, refund and reconciliation fixtures pass |
| P5 | 16-24 h | Attribution engine and recompute | Golden attribution fixtures and model separation all pass |
| P6 | 22-32 h | Real dashboards, data states, exports | Queries reconcile with source orders/spend; UI review passes |
| P7 | 18-28 h | Security, DX, docs, accessibility, release | Required CI + E2E + manual smoke evidence passes |

Effort is a planning estimate, not a guarantee. Do not skip prerequisite gates to produce a visually complete demo.

## Backlog and dependencies

| ID | Phase | Deliverable | Depends on | Definition of Done |
|---|---|---|---|---|
| MAL-001 | P0 | Definitions, consent policy and attribution fixtures | None | Signed-off methodology and edge cases |
| MAL-002 | P1 | App scaffold, containers, migrations and CI | 001 | Reproducible local start and CI |
| MAL-003 | P1 | Auth and workspace authorization | 002 | Cross-tenant access is rejected |
| MAL-004 | P2 | Sites/campaign CRUD and UTM builder | 003 | Tests for validation and RBAC |
| MAL-005 | P3 | Consent user experience | 002 | Reject/revoke/accept E2E paths |
| MAL-006 | P3 | SDK, ingest API, sessions and touchpoints | 004,005 | Idempotency and collector security |
| MAL-007 | P4 | Signed/opaque checkout-link flow | 006 | Token scope, expiry, replay tests |
| MAL-008 | P4 | Orders CSV and lifecycle | 003,007 | Preview + deterministic commit + refund |
| MAL-009 | P4 | Cost import | 004 | Scoped cost IDs and money math |
| MAL-010 | P5 | First/last model engine | 006,008 | Golden fixture results exactly match |
| MAL-011 | P6 | Aggregate APIs and definitions | 009,010 | Reconciliation and coverage metrics |
| MAL-012 | P6 | Operational dashboard and exports | 011 | DB-backed, responsive, accessible |
| MAL-013 | P7 | Hardening, E2E and developer handoff | All | Release checklist and demo pass |

## Concrete plan for each phase

### P0: Decide before coding

1. Fix revenue basis, allowed order statuses, workspace timezone and VND initial currency; record open questions.
2. Specify event/consent schema and collection trust boundary.
3. Define \`observed\`, \`attributed\`, \`coupon_fallback\`, \`direct\`, \`unassigned\`, \`ROAS\`, \`CPA\`.
4. Prepare deterministic journeys, duplicate imports, refunds, time-boundary and cross-tenant fixtures.
5. Document screen information architecture and one cohesive Operate UI direction.
6. Create acceptance checklist and ADR-style decision entries.

**Exit:** No ambiguity that would cause a model to double count orders or violate consent.

### P1: Reproducible foundation

1. Scaffold strict TypeScript and Next.js App Router with pinned dependencies and pnpm lockfile.
2. Add Docker Compose PostgreSQL, \`.env.example\`, Drizzle schema/migrations/seed.
3. Implement session auth and workspace membership guards used by every private query.
4. Define standard response envelope, request ID, safe logs, error boundaries, simple health endpoint.
5. Add GitHub Actions: lint, typecheck, tests, build and DB smoke checks.
6. Document 1-command local start after installing dependencies.

**Exit:** Fresh clone -> setup -> DB migration -> app -> tests is documented and repeatable.

### P2: Campaign ownership and UTM creation

1. Sites and campaigns CRUD with server-side validation and workspace scope.
2. UTM naming, campaign IDs, conflict checking, normalization preview, safe URL generation.
3. Copy URL, test link, campaign table, empty and permission denied states.
4. Validate escaping, malicious URLs and disabled campaigns.

**Exit:** 10 canonical UTM cases plus RBAC checks pass.

### P3: Consent-aware tracking

1. Build versioned SDK, consent initialization/revoke semantics, allowed event schemas.
2. No analytics identifiers/events before approval; no fingerprinting or IP-based stitching.
3. Collector validation, reasonable size/rate controls, idempotent \`site_id + event_id\`.
4. Server-side event parsing and bounded session window: 30 minutes of inactivity.
5. Touchpoint capture with normalized UTM and direct/referrer semantics; operational ingest diagnostics.

**Exit:** Accept/reject/revoke, duplicate, time skew, malformed payload, missing site and cross-tenant tests pass.

### P4: Trusted transactions and spend

1. Server-origin checkout token: opaque/hashed at rest, expiring and scoped to site/workspace.
2. CSV import preview with column map, row errors, explicit commit and transactional upsert.
3. Distinguish paid/fulfilled vs pending/cancelled/refunded/partially refunded.
4. Cost import with date, source, campaign, currency, stable row identities, reconciliation.
5. Handle ambiguous coupons separately from verified journey attribution.

**Exit:** Re-import is a no-op; changed refunds recompute; bad token never links an unrelated order.

### P5: Attribution computation

1. Implement pure functions over immutable observed paths and authoritative orders.
2. First-touch = earliest eligible; last-non-direct = latest eligible non-direct, with direct fallback only when linked.
3. Apply configurable inclusive lookback (1/7/30 days) and no future touches.
4. Preserve single-winner 100% credit per order per model, versioned results, atomic recompute.
5. Separate coupon-only and unassigned paths; publish coverage indicators.

**Exit:** Golden fixtures pass exactly; switching model does not change observed revenue.

### P6: Real reporting interface

1. Overview, campaigns, acquisition, funnel, orders, costs, attribution comparison and settings.
2. Filters on workspace/date/model; explicit currency, timezone, revenue basis and freshness.
3. Loading, empty, error, revoked access, zero spend and broken integration states.
4. Data tables with pagination, sort, keyboard usability, responsive layout, CSV formula escaping.
5. Test totals against database queries and screenshot/browser review when available.

**Exit:** Every important number has a provenance and can be explained to an analyst.

### P7: Hardening and handoff

1. Threat model and consent audit, session security, rate limits, XSS/CSV injection checks.
2. Migration rollback/restore rehearsal on disposable DB, secret scan, dependency review.
3. Unit/integration/E2E CI clean, dev docs and 12-minute live demonstration path.
4. Publish a truthful implementation status: complete, partial, not run, blocked.

**Exit:** No critical security/privacy/data-correctness bugs remain. Deployment requires separate authorization.

## Golden business fixture

- Consented touchpoint A: 2026-10-01 09:00 UTC, Facebook / paid_social.
- Consented touchpoint B: 2026-10-03 10:00 UTC, Google / cpc.
- Direct touchpoint C: 2026-10-05 11:00 UTC.
- Verified backend order \`ORD-A\`: 2026-10-06 12:00 UTC; net revenue 900000 VND; valid checkout link.
- 7-day first-touch assigns exactly 900000 VND to Facebook.
- 7-day last-non-direct assigns exactly 900000 VND to Google; later direct does not overwrite.
- The sum of the two model views is NOT 1800000 VND of real orders.
- Without verified link and without unique coupon, the order is unassigned.
- Add cases for duplicate event/import, no consent, out-of-window touch, cross-workspace, refund and timezone midnight.

## MVP acceptance and anti-success-theater rules

- All mandatory screens have actual operations, not mock button labels.
- Counts and revenue reconcile; zeros and unavailable values are not conflated.
- Cross-tenant access and consent violations are blocked with tests.
- CI checks run before a completion claim; any skipped test is reported honestly.
- Real ad platform sync, live hosted production, incremental lift and cross-device identity are NEVER claimed without independent proof.
- Synthetic sample data is marked \`DEMO DATA\` and separated from real workspace data.

## Next action

Start only with **P0: MAL-001**. Verify approved rule documents and open decisions, create the minimal fixtures and data-contract specification, then seek/record owner approval for choices that materially change privacy or business calculation.
