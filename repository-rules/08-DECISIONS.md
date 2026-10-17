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

## ADR-005: npm ci for verified reproducible dependencies (proposal to owner)

- Date: 2026-10-17
- Status: Proposed, bounded deviation from roadmap default pnpm.
- Decision: Commit the GitHub-generated `package-lock.json` and use `npm ci` in local quick start and CI. The project originally proposed pnpm but the build host did not have pnpm; GitHub Actions successfully installed and validated the npm dependency tree and Drizzle migrations.
- Why: Explicit reproducible dependency versions, observable PostgreSQL and E2E proof now, avoiding an unverified lockfile; no new host provider or paid dependency.
- Alternatives: pin `pnpm-lock.yaml` using a verified Corepack/pnpm install in CI and migrate after owner approval. Do not maintain two divergent lockfiles.
- Costs/tradeoffs: npm may be slower/differ from pnpm in workspace behavior. For a single Next app this is reversible, but document any package manager change and revalidate all CI gates.
- Revisit: User elects pnpm or establishes verified migration. Never call this change owner-approved until confirmed.

## ADR-006: Netlify as intended Next.js host (owner-directed)

- Date: 2026-10-17.
- Status: Accepted for target platform; launch conditions OPEN.
- Decision: Prefer a separate Netlify Free site for Marketing Attribution Lab. Do not repurpose the existing hyupremium Netlify project, and do not use Vercel for the Lab.
- Why: Explicit owner choice. Netlify's modern OpenNext adapter supports Next.js App Router and API routes without rewriting the stack.
- Boundaries: An empty Netlify site does not make the app live. Production requires a persistent Postgres connection, secrets in Functions/Builds environment, correct auth HTTPS origin, Git integration, consent/legal approval and launch security gates.
- Costs: Free team confirmed; no paid service or database was provisioned. A separate database may have usage charges and must be approved first.
- Revisit: Managed database choice, Git connection, preview results and approved public launch.
