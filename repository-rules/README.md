# Repository Rules Index

These rules define the engineering contract for **Hyu Marketing Attribution Lab**. The root [AGENTS.md](../AGENTS.md) is the entry point for AI coding agents; this directory is the source of detailed policies and the execution roadmap.

## Required reading protocol

**Every task:** \`../AGENTS.md\`, this index, \`01-ROADMAP.md\`, task-specific rules, relevant entries in \`08-DECISIONS.md\`. **Every code change:** read \`05-SECURITY-PRIVACY.md\`, \`06-TESTING-RELEASE.md\`, and \`07-GIT-AND-AGENT-WORKFLOW.md\` as applicable.

| File | Responsibility |
|---|---|
| [01-ROADMAP.md](01-ROADMAP.md) | MVP requirements, P0-P7 order, risks, measurable exit criteria |
| [02-UI-UX-ANTI-SLOP.md](02-UI-UX-ANTI-SLOP.md) | Product-specific UI, Uizze + Impeccable method, accessibility |
| [03-ARCHITECTURE-CODE.md](03-ARCHITECTURE-CODE.md) | Modular boundaries, performance, DX, code style |
| [04-ATTRIBUTION-DATA.md](04-ATTRIBUTION-DATA.md) | UTM, event/session/order semantics, attribution and money |
| [05-SECURITY-PRIVACY.md](05-SECURITY-PRIVACY.md) | Consent, auth, multi-tenancy, abuse control, data handling |
| [06-TESTING-RELEASE.md](06-TESTING-RELEASE.md) | Quality gates, test matrix, release readiness |
| [07-GIT-AND-AGENT-WORKFLOW.md](07-GIT-AND-AGENT-WORKFLOW.md) | Repository-only actions, PRs, skill use, delivery proof |
| [08-DECISIONS.md](08-DECISIONS.md) | Architecture decisions, assumptions, deferred decisions |

## Rule classes

- **MUST:** Blocking requirement. Violations require code correction or explicit documented approval. Never call the affected task complete.
- **SHOULD:** Default best practice. Deviations require a written rationale.
- **MAY:** Optional and explicitly scoped.
- **P0:** Mandatory for the working MVP; **P1/P2:** deferred unless the owner changes the scope.

## Change control

1. Do not edit governance files to evade a failed check.
2. Change business methodology, security, permission boundaries, stack or deployment assumptions only with explicit user approval, evidence and a short record in \`08-DECISIONS.md\`.
3. Keep changes atomic. Where rules evolve, update this index, \`AGENTS.md\`, tests and PR template together.
4. If an implementation reveals an obsolete rule, propose a revision in its PR rather than silently ignoring it.
5. Human instructions and actual platform/tool availability outrank skill recommendations. Do not claim all agents automatically discover local instructions; confirm the coding environment reads \`AGENTS.md\`.

## Why multiple files?

The long-term project needs enough rigor to protect attribution correctness without requiring every agent to reread a monolithic plan for a one-line UI fix. \`01-ROADMAP.md\` is the authoritative in-repository execution plan; other documents are targeted, enforceable checklists. GitHub Actions verifies presence and links, while code/tests/review validate behavior.
