# Operational analytics dashboard

Status: Implementation in progress, acceptance not yet verified. Owner: repository owner.

## Goal and context
An analyst sees auditable source, campaign, order, spend and attribution measures.

## Primary persona and user story
As a product user with the specified role, I want reporting to work end-to-end so I can make a decision without fabricated results.

## Scope in
Workspace/date/model filters, paid orders and net revenue, attribution coverage, ROAS/CPA, export, freshness, error/empty states.

## Non-goals
AI budget forecasts and cross-currency aggregate without FX policy.

## Workflow
User opens relevant page or endpoint; authenticates/consents where required; validates inputs; commits action; reads database-backed result or explicit error; audits source and status.

## Functional requirements
1. Use server-side authorization for business data.
2. Enforce typed validation and explicit errors.
3. Make user-visible outputs reproducible and auditable.
4. Preserve privacy by design and avoid invented business results.

## Nonfunctional requirements
Responsive, keyboard accessible, predictable errors and retries, safe logs, no secrets in source, versioned contracts where relevant.

## Acceptance criteria (Given / When / Then)
Given the same valid data, when comparing models, ledger order total stays invariant. Given spend 0 or missing, ROAS is N/A. Given export from workspace A, no workspace B rows appear.

## Data and integration constraints
Read docs/measurement-methodology.md and repository-rules/04-ATTRIBUTION-DATA.md. Backend orders and verified imports are revenue truth; events only partially observed.

## Edge cases and UI states
Loading, empty, error, denied, network failure, retry, duplicate, stale data and mobile view as applicable.

## Dependencies and risks
Lag, unassigned categories, CSV formula injection, misleading totals and accessibility.

## Decisions and assumptions
(assumption - confirm) Local-first private demo only until owner approves real-person data processing.
(open question) Production deployment, privacy policy, retention SLA, email verification and incident procedure.
