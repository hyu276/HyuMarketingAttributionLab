# Architecture and implementation boundary

Current modules: (1) Next.js client UI with explicitly synthetic scenario; (2) pure attribution and UTM functions; (3) draft Drizzle PostgreSQL schema and Docker Compose. Schema NOT applied to database; real user tracking NOT running.

## Dependency chain

Trusted orders + consented, verified path -> deterministic model -> attributed result -> reconciled DB reports. Public site key does not prove identity. Browser purchase event never counts as trusted revenue.

## Proposed modules

- Presentation: Next App Router routes /, /lab and /utm.
- Domain: attributeOrder, calculateRoas and buildUtmUrl, unit tested.
- Persistence: Drizzle schema draft, unverified migration.
- Future services: auth/workspaces, campaigns, consent SDK, collector, checkout tokens, orders/spend, recalculation and reporting.

## Blocking prerequisites

Auth/RBAC, consent/legal owner review, database migration smoke, real ingestion, verified order/spend workflow, error recovery, Next build, Playwright E2E and responsive browser review. Domain tests alone cannot certify full-stack readiness.
