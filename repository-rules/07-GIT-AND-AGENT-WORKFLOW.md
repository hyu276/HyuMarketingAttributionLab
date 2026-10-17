# GitHub and AI Agent Working Agreement

## Scope

The single target repository is `hyu276/HyuMarketingAttributionLab`. GitHub is source control and CI, not a dynamic backend or relational database host. Work local-first. Don't provision external infrastructure or advertise an online demo without runtime evidence.

## Agent process

1. Inspect repository state, current branch, rule documents, relevant issue and existing tests.
2. Map task to MAL backlog ID and phase. Do not implement deferred features without explicit scope change.
3. If skill discovery is available, inspect installed skills and choose a compatible subset. `Hyu Vibe Coding` for routing; `Uizze Anti UI Slop` and `Impeccable` for UI; architecture, review, test and security skills as needed. If a skill is absent, continue without false tool claims.
4. Identify assumptions and risks. Plan the smallest independently testable increment, including acceptance and failure cases.
5. Implement with real APIs/data, no fabricated persistence. Keep PR focused. Prefer small atomic commits with meaningful messages.
6. Run appropriate checks and review the final diff. Record commands, outputs, blockers and remaining work.
7. Open PR for owner review on a feature branch when authorized. Do not merge into main, force push, delete branch, deploy, spend money or change real customer data without explicit approval.

## Git conventions

- Branches: `feat/MAL-###-short-name`, `fix/MAL-###-short-name`, `docs/short-name`.
- Conventional commit style preferred: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`.
- PR description: scope; screenshots if UI; schema/API contracts; security/consent implications; commands+results; migration/revert notes; unresolved questions.
- Never weaken tests or branch protections just to obtain a passing indicator.
- Prefer squash merge after review; human owner chooses. No automatic merges.

## Context continuity

A new agent should be able to continue using only tracked files. Keep roadmap and decision log current. Do not rely on chats, ephemeral memories or instructions hidden in private skill installations. An AGENTS.md file cannot force a tool to read it if that agent does not support repository instructions; explicitly verify compliance at task start.

## Non-negotiable final report

Summarize: exact changed paths; phase/backlog ID; acceptance result; actual tests run; security/privacy checks; state of commit/PR/deployment; assumptions; unresolved blockers; next recommended smallest step.
