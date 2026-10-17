# Consented browser measurement

Status: Implementation in progress, acceptance not yet verified. Owner: repository owner.

## Goal and context
An opted-in visitor generates first-party events, while opt-out creates no browser analytics identity.

## Primary persona and user story
As a product user with the specified role, I want consent collector to work end-to-end so I can make a decision without fabricated results.

## Scope in
Consent accept/reject/revoke; SDK; event schema; collector; session 30m; touchpoints; dedup.

## Non-goals
Fingerprinting, IP stitching, consent proof verified solely by client claim.

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
Given no analytics consent, when opening demo store, no visitor analytics ID is created and no analytics event sent. Given duplicate site/event UUID, storage occurs once. Invalid event names or properties are rejected.

## Data and integration constraints
Read docs/measurement-methodology.md and repository-rules/04-ATTRIBUTION-DATA.md. Backend orders and verified imports are revenue truth; events only partially observed.

## Edge cases and UI states
Loading, empty, error, denied, network failure, retry, duplicate, stale data and mobile view as applicable.

## Dependencies and risks
Fake public site key, replay, missing consent proof, CORS bypass, excessive payload and retention.

## Decisions and assumptions
(assumption - confirm) Local-first private demo only until owner approves real-person data processing.
(open question) Production deployment, privacy policy, retention SLA, email verification and incident procedure.
