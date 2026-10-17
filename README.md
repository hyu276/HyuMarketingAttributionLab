# Hyu Marketing Attribution Lab

Explainable, rule-based marketing attribution. **Developer preview, not a production SaaS.**

The /lab route compares first-touch vs last-non-direct touch on a fixed synthetic journey. The /utm route builds normalized campaign URLs. Neither records real user behavior. Domain calculations have independent Node tests.

A draft PostgreSQL schema and Docker Compose config are provided, but authentication, migrations, collector, imports and database-backed reports are not implemented.

## Development setup (not yet verified)

Requirements: Node.js 22, pnpm through corepack, network-accessible dependency registry.

1. Run: corepack enable
2. Run: pnpm install
3. Run: pnpm dev
4. Visit http://localhost:3000

IMPORTANT: The pnpm lockfile is NOT present/verified. Resolve and commit a reviewed lockfile before claiming reproducibility. Do not use the optional database compose file without local-only POSTGRES_PASSWORD and DATABASE_URL.

## Dependency-free checks

- node --experimental-strip-types --test tests/unit/*.test.ts
- python3 scripts/check_repository_rules.py

## Documentation

- [Agent rules](AGENTS.md)
- [Repository rules](repository-rules/README.md)
- [Hyu Anti Vibe Code slop design standard](repository-rules/02-UI-UX-ANTI-SLOP.md)
- [Product](docs/PRODUCT.md) and [Design direction](docs/DESIGN.md)
- [Measurement methodology](docs/measurement-methodology.md)
- [Architecture](docs/architecture.md) and [Current status](docs/implementation-status.md)

## Not implemented

Auth/RBAC, persistent campaigns, consent SDK, public event collector, server-verified checkout/order linking, CSV imports, cost reports, attribution persistence, automated dashboard aggregates, full Next/DB/E2E/build verification or deployment. Never present demonstration values as real advertising ROI.
