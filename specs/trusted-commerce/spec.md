# Verified order and spend imports

Status: Implementation in progress, acceptance not yet verified. Owner: repository owner.

## Goal and context
An admin previews and commits trusted transactions and cost data without double counting.

## Primary persona and user story
As a product user with the specified role, I want trusted commerce to work end-to-end so I can make a decision without fabricated results.

## Scope in
Authenticated CSV order/spend preview and commit; unique upserts; refunds; secure server-issued checkout token; coupon fallback.

## Non-goals
Client-side purchase revenue as ledger; payments; ad-provider OAuth.

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
Given the same input twice, when committing, totals do not duplicate. Given a refund, recalculation lowers net revenue. Given expired/replayed token, no journey is attached. Given ambiguous coupon, unassigned.

## Data and integration constraints
Read docs/measurement-methodology.md and repository-rules/04-ATTRIBUTION-DATA.md. Backend orders and verified imports are revenue truth; events only partially observed.

## Edge cases and UI states
Loading, empty, error, denied, network failure, retry, duplicate, stale data and mobile view as applicable.

## Dependencies and risks
CSV injection, currency mismatch, oversized files, cross-site records and transaction rollback.

## Decisions and assumptions
(assumption - confirm) Local-first private demo only until owner approves real-person data processing.
(open question) Production deployment, privacy policy, retention SLA, email verification and incident procedure.
