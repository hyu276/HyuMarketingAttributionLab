# Hyu Marketing Attribution Lab

An explainable, local-first marketing attribution application. **Full-stack MVP implementation candidate; not production-certified.** PR #2 contains backend/data collection/auth/reporting modules and the established Hyu Anti Vibe Code slop design contract. No public backend has been deployed.

## Features implemented in code

- Next.js App Router workspace console, Better Auth sessions, admin/analyst membership boundaries.
- Site/campaign/UTM registry and client UTM URL builder.
- Consent-gated first-party tracking SDK with public site collector.
- Trusted checkout token minting for a configured server-to-server demo integration.
- Order and ad spend CSV preview + commit, stable idempotency keys.
- First-touch and last-non-direct attribution, coupon fallback, unassigned reporting.
- Site-scoped reports, funnel event counts, model comparison and sanitized CSV export.
- Drizzle/PostgreSQL schema draft, automated lint/type/build, migration smoke, unit and E2E tests.

## Local Quick Start

Preconditions: Node.js 22, npm with the checked-in package-lock.json, Docker Engine + Compose, a network-enabled package registry. \`BETTER_AUTH_SECRET\` and \`CHECKOUT_SERVER_KEY\` must be independently generated random secrets at least 32 characters each.

1. Copy \`.env.example\` to \`.env.local\` and replace *all* placeholder secrets.
2. Export the chosen \`POSTGRES_PASSWORD\` from \`.env.local\` to your terminal, or invoke \`docker compose --env-file .env.local up -d db\`.
3. Run \`npm install\` (until verified pnpm lockfile exists).
4. Run \`npm run db:generate\`, review generated SQL, and then \`npm run db:migrate\`.
5. Run \`npm run dev\`; open http://localhost:3000/login.
6. Sign up locally; create a workspace, a site with hostname \`localhost\`, and a campaign.
7. To test consent events, open /store?site_key=<site public key>, then explicitly Accept or Reject tracking.
8. To test real report queries, use the admin console to preview and commit valid, synthetic order/spend CSV files. For a verified order journey, a **trusted server** must first mint a checkout token via its secret; browsers may not mint one.

## Verification

- \`npm run lint\`
- \`npm run typecheck\`
- \`npm test\`
- \`npm run test:integration\` (requires migrated test PostgreSQL)
- \`npm run build\`
- \`npm run test:e2e\` (requires Playwright Chromium)
- \`python3 scripts/check_repository_rules.py\`

CI runs these on a disposable GitHub PostgreSQL 16 service. Only report PASS for a check actually verified against the latest commit. Existing GitHub Actions workflow starts with \`npm install\`; a lockfile is still a release blocker.

## Scope limitations

No production email verification/recovery, ad-platform OAuth, multiple currency conversion, pixel-free causal inference, secure cross-device identity, distributed collector rate limiting, public cloud deployment or verified legal policy. The /lab route uses conspicuously synthetic fixtures to teach attribution; /console uses database-backed authorized data when configured.

Read [Product](docs/PRODUCT.md), [Design](docs/DESIGN.md), [Implementation status](docs/implementation-status.md), [API contracts](docs/API.md), [Feature specs](specs/INDEX.md), and [Repository rules](repository-rules/README.md).
