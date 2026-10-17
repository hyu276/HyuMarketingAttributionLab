# Architecture, Maintainability and Performance

## Defaults

Next.js App Router, strict TypeScript, PostgreSQL in Docker Compose, Drizzle ORM + migrations, Zod, pnpm, Tailwind tokens, accessible component primitives, Vitest, Playwright, GitHub Actions. Do not assume packages are installed before P1. Pin versions via committed lockfile. Verify the actual dependency API before implementation.

## Modular monolith

Separate `app` (routing), `features` (domain UI/actions), `domain` (pure business calculation), `server` (auth, authorization, DB, services), `db` (schema and migrations), `tracker` (browser SDK), `tests` (fixtures), `components` (shared primitives). Names may adapt with an ADR, but boundaries remain explicit. Route handlers are thin transport adapters. UI never implements authoritative attribution rules.

## Contracts

- Validate input with schemas at every API, import, tracking and boundary.
- Authenticate server-side; check workspace/site scope in service queries, not merely in UI.
- Use typed return errors or consistent API error format `{code,message,request_id,details?}`. Never leak stack traces.
- Reuse a single canonical domain definition for money, timestamps, order status, attribution basis and campaign IDs.
- Version exposed tracker/API contracts when incompatible. Document payload limits, error modes and retry semantics.
- Money is integer minor units or NUMERIC/decimal; never binary floating point for booked totals.
- UTC in storage and explicit workspace timezone for grouping/display. Do not depend on local server timezone.

## Pragmatic code quality

- Single-responsibility, clear names, early guards, reasonable function size, testable pure logic. Prefer composition to broad abstractions.
- No broad `any`, silent catches, unused exports, hardcoded credentials, duplicated SQL/business rules or uncontrolled `console.log` in production paths.
- Treat complexity <= 8 as a review heuristic for business logic, not an arbitrary reason to fragment cohesive functions; record deliberate exceptions.
- Avoid speculative generic frameworks, repeated wrappers, premature caches and new dependencies for trivial needs.
- Migrate database schema with reviewed migration files. Never run destructive schema reset against persistent datasets by default.
- One source of truth per record class: trusted orders -> sales; approved cost import -> spend; collector -> observed events; attribution results -> derived projection.

## Reliability and concurrency

- Use unique keys for events (`site_id,event_id`), orders (`site_id,external_order_id`) and stable spend import row IDs.
- Ensure transactional import, retry-safe mutation and recompute/invalidation when orders/refunds or campaign mapping change.
- Ingestion should reject malformed/oversized events without corrupting other records. Rate limit and monitor rejected/duplicate outcomes.
- Do not introduce Redis/Kafka/ClickHouse or background queues without measured need and approval. Evaluate cost, latency, reliability, complexity, reversibility and solo-maintainer fit.

## Performance budgets and evidence

Prioritize fast time-to-interaction for dashboard, indexed filters, paginated tables, batched report queries and no N+1 DB roundtrips. Define numeric SLOs only after representative data/traffic measurement. For expensive paths capture query plans and representative datasets before optimization. Guard against unnecessary `use client` and large client bundles.

## Developer experience

Document `pnpm install`, `docker compose up -d`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm dev`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm build` when scripts actually exist. Local onboarding must not require paid accounts or hidden credentials.

## Done

Code is understandable, tenant-safe, dependency-aware, deterministic on core calculations, tested at module boundaries and reproducible. No fake success path to satisfy CI.
