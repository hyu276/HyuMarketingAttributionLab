# Architecture Decisions and Open Questions

Record important decisions here with date, rationale, alternatives, tradeoffs and owner. Do not invent approval for open matters.

## ADR-001: Local-first modular monolith (provisional baseline)

- Date: 2026-10-17
- Status: Proposed for P0 validation.
- Choice: Next.js App Router, strict TypeScript, PostgreSQL Docker, Drizzle, pnpm; GitHub for source and CI.
- Why: Smallest operational footprint for a solo developer, testable boundaries, reversible deployment choice.
- Cost: Collector and dashboard share resources. Extract only when measurements justify it.
- Revisit if: Collection volume, background processing or deployment needs exceed one process.

## ADR-002: Consent-aware first-party tracking (provisional baseline)

- Date: 2026-10-17
- Status: Proposed, requires policy/legal review before real visitor use.
- Choice: analytics ID and event collection only after valid consent; no fingerprinting.
- Tradeoff: Higher privacy protection and reduced measurement coverage; surface unassigned rate honestly.

## ADR-003: Source of truth and attribution (provisional baseline)

- Date: 2026-10-17
- Status: Proposed for P0 golden fixture approval.
- Choice: trusted orders govern revenue; observed events partial; 7-day first-touch / last-non-direct, one winner per model; coupon fallback distinct.
- Tradeoff: Explainable attribution but not causal lift, cross-device identity or complete visibility.

## ADR-004: Design language (provisional baseline)

- Date: 2026-10-17
- Status: Proposed, final tokens pending P0 UI design decision.
- Choice: high-density analytical Operate UI; semantic numerals, accessible tables and restrained color, no generic SaaS/slop defaults.
- Tradeoff: Less decorative visual spectacle, more clarity for analyst work.

## Decisions requiring owner validation before production

1. Legal basis and policy for consent/cookies across target regions.
2. Data retention, deletion SLAs, purpose limitation and real customer data use.
3. Supported languages, currency handling beyond VND, and workspace reporting timezone.
4. Authentication architecture, email verification and recovery mechanism.
5. Trusted order integrations and authoritative lifecycle/refund meanings.
6. Hosting, cost cap, backup and security incident response.
7. Choice of analytics SDK installation methods and allowed hostnames.

## How to record an ADR

`ADR-### | Date | Status: Proposed/Accepted/Superseded | Context | Decision | Alternatives rejected | Eight-dimension tradeoff where relevant | Validation evidence | Owner | Revisit trigger`.

Never treat proposed decisions as owner-approved production policy.
