# Explainable model credit

Status: Implementation in progress, acceptance not yet verified. Owner: repository owner.

## Goal and context
An analyst switches first and last non-direct model without changing real order revenue.

## Primary persona and user story
As a product user with the specified role, I want attribution to work end-to-end so I can make a decision without fabricated results.

## Scope in
7-day default 1/7/30 lookback; pure deterministic functions; verified linkage; coupon fallback; model version; recomputation.

## Non-goals
Algorithmic causality, MMM, probabilistic identity.

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
Given Facebook Oct 1, Google Oct 3, Direct Oct 5, verified paid order Oct 6 900000 VND, first-touch assigns Facebook, last-non-direct Google; observed revenue stays 900000 VND. No verified link and no unique coupon means unassigned.

## Data and integration constraints
Read docs/measurement-methodology.md and repository-rules/04-ATTRIBUTION-DATA.md. Backend orders and verified imports are revenue truth; events only partially observed.

## Edge cases and UI states
Loading, empty, error, denied, network failure, retry, duplicate, stale data and mobile view as applicable.

## Dependencies and risks
Time-zone boundary, duplicate events, missing spend, refunds, attribution sum mismatch.

## Decisions and assumptions
(assumption - confirm) Local-first private demo only until owner approves real-person data processing.
(open question) Production deployment, privacy policy, retention SLA, email verification and incident procedure.
