# Security, privacy and release

Status: Implementation in progress, acceptance not yet verified. Owner: repository owner.

## Goal and context
The solo developer can run a reproducible safe local demo with CI checks.

## Primary persona and user story
As a product user with the specified role, I want quality privacy to work end-to-end so I can make a decision without fabricated results.

## Scope in
GitHub CI, migrations, seed fixtures, docs, consent/retention controls, tests, UI audit, backup guidance.

## Non-goals
Production hosting, legal compliance certification.

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
Given fresh clone and stated tools, when running documented setup, tests and demo should reproduce. Given revoked consent, subsequent analytics events are not sent. Critical tenant and data correctness tests must pass.

## Data and integration constraints
Read docs/measurement-methodology.md and repository-rules/04-ATTRIBUTION-DATA.md. Backend orders and verified imports are revenue truth; events only partially observed.

## Edge cases and UI states
Loading, empty, error, denied, network failure, retry, duplicate, stale data and mobile view as applicable.

## Dependencies and risks
Legal basis requires owner review; missing Docker, untested browser behavior and destructive migration risks.

## Decisions and assumptions
(assumption - confirm) Local-first private demo only until owner approves real-person data processing.
(open question) Production deployment, privacy policy, retention SLA, email verification and incident procedure.
