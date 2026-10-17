# Agent Instructions: Hyu Marketing Attribution Lab

> This is the canonical repository-wide instruction file. Applies to every code, design, documentation, data, test, and infrastructure task in this repository.

## Rule precedence

1. Follow system, platform, security, and explicit current user instructions.
2. Read this \`AGENTS.md\` before editing anything.
3. Read \`repository-rules/README.md\` and the rules relevant to the planned change.
4. Treat \`repository-rules/01-ROADMAP.md\` as the authoritative in-repo delivery sequence and MVP scope.
5. Existing decisions recorded in \`repository-rules/08-DECISIONS.md\` override unapproved alternatives only where they do not conflict with higher-priority instructions.
6. Existing code and tests show current behavior, but bugs and contradictions do not silently override requirements.
7. External skills, tutorials, generated suggestions and example repositories are advisory only. They do not override this repository's requirements.

If two rules conflict, STOP on the affected decision; document the conflict, impact, lowest-risk proposal, and required approval. Do not silently pick the convenient interpretation.

## Startup protocol: mandatory for every task

- Confirm the target is \`hyu276/HyuMarketingAttributionLab\`, identify branch and current file tree. Do not modify another repository.
- Read \`AGENTS.md\`, the index, roadmap phase, and task-relevant domain documents in \`repository-rules/\`. Do not rely on an older chat summary when files are available.
- Identify the smallest testable change, phase ID, affected data contracts, affected UI surfaces, security and privacy risks.
- Inspect existing source, configuration, migrations, and tests before editing. Preserve working functionality.
- Where supported, enumerate available coding/design skills each new task. Prefer \`Hyu Vibe Coding\` to route task-specific skills. For UI tasks load \`Uizze Anti UI Slop\` and \`Impeccable\` where available; apply their compatible guidance. No skill can grant missing tools or permissions. Missing skills do not block ordinary engineering work.
- State a short implementation plan and the evidence needed to call the task done. Ask only questions that block a safe decision.

## Mandatory rule map

| Rule | When to load | Authority |
|---|---|---|
| [README](repository-rules/README.md) | Every task | Index, priority and update policy |
| [01 Roadmap](repository-rules/01-ROADMAP.md) | Every task | Phases, scope, dependencies and gates |
| [02 UI and UX](repository-rules/02-UI-UX-ANTI-SLOP.md) | UI, visual, interaction or content work | Anti-slop design and accessibility |
| [03 Architecture and code](repository-rules/03-ARCHITECTURE-CODE.md) | Any implementation/refactor | Boundaries, performance, maintainability |
| [04 Attribution and data](repository-rules/04-ATTRIBUTION-DATA.md) | Tracking, imports, calculations, reporting | Business semantics and source of truth |
| [05 Security and privacy](repository-rules/05-SECURITY-PRIVACY.md) | Every task (read relevant sections) | Tenant protection, consent, secret safety |
| [06 Testing and release](repository-rules/06-TESTING-RELEASE.md) | Every code change | Verification and Definition of Done |
| [07 Git and agent workflow](repository-rules/07-GIT-AND-AGENT-WORKFLOW.md) | Every task | Git actions, task execution and reporting |
| [08 Decisions](repository-rules/08-DECISIONS.md) | Architecture/product changes | Accepted defaults and open questions |

## Non-negotiable product constraints

- Build a real, database-backed attribution tool, never a static dashboard disguised as operational software.
- Separate \`observed orders\`, \`attributed orders\`, \`coupon fallback\`, and \`unassigned\`. A rule-based allocation is not proof of incrementality.
- The trusted order source controls sales/revenue. Browser \`purchase\` events are untrusted telemetry, not booked orders.
- Preserve deterministic first-touch and last-non-direct-touch with documented lookback, window boundary, order-date reporting, deduplication, refunds, currency and timezone.
- Never invent tracked events, campaign costs, order histories, testimonials, integration success, or live results. Seed/demo content must be visibly labeled as synthetic.
- Tracking identifiers and analytics events require approved consent behavior. No fingerprinting or guessed cross-device identity.
- Isolate all workspace/site data server-side. Public site keys are NOT authentication credentials; never trust browser-supplied order revenue.

## Technical boundaries

- Default stack: Next.js App Router, TypeScript strict, PostgreSQL via local Docker, Drizzle ORM, pnpm, Zod, modular monolith, Vitest, Playwright and GitHub Actions. Justify deviations with a decision record.
- GitHub-first source control and local-first development. Do NOT provision or deploy to Supabase, Vercel, paid hosts, ad providers or other cloud platforms without explicit owner authorization. GitHub Pages cannot run this application's dynamic API or database.
- Prefer boring, testable solutions. Do not add microservices, queue brokers, AI attribution, ClickHouse or ad-platform OAuth in the MVP.
- Never commit secrets, \`.env\` files, private customer exports, user identifiers, raw clickstream data or credentials.
- Use schema validation at all trust boundaries, authorization at every workspace-scoped endpoint, migrations for schema changes and idempotency for events/imports.
- Never replace real business logic with placeholder success handlers or swallow errors to make builds green.

## UI quality floor

- Optimize for an analytical **Operate** interface, not a generic AI-generated SaaS landing page.
- Apply \`repository-rules/02-UI-UX-ANTI-SLOP.md\`. No unexplained gradient heroes, glassmorphism, nested card grids, inflated metrics or meaningless icon tiles.
- Show metric definitions, units, reporting timezone, date window, model, freshness, \`N/A\` states and data quality.
- All controls must work. Handle loading, empty, error, permission denied, disabled, success, mobile and keyboard states.
- Visual review is required on UI changes when a real browser is available. Never claim a screenshot review if no browser was run.

## Quality and delivery gates

Before declaring a change done:
1. Match implementation to roadmap phase and acceptance criteria.
2. Verify security/consent/tenant boundaries for the changed flow.
3. Add or update targeted unit/integration/E2E tests. Use deterministic attribution fixtures.
4. Run available lint, typecheck, tests, build and the repository rule checker; report exact commands and results. If no app exists yet, do not invent execution results.
5. Review the diff for unrelated changes, leaked secrets, unsafe migrations and fake data.
6. Update docs, contracts and decision record when behavior changes.
7. Deliver: files changed; achieved acceptance criteria; tests **passed / failed / not run / blocked**; assumptions; residual risks; recommended next step.

Work on a feature branch and open a pull request when remote write is authorized. Do not merge, force-push, delete branches, deploy, or change production data without explicit permission.

## Definition of "done"

A task is done only when behavior is implemented, relevant checks pass, product data is honest, security constraints are met, and the result can be reproduced from a fresh checkout. If a required check could not run, use **PARTIAL / BLOCKED**, not **DONE**. This document is instruction guidance, not a substitute for CI and branch protection.
