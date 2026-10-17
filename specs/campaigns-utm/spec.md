# Sites, campaigns and UTM

Status: Implementation in progress, acceptance not yet verified. Owner: repository owner.

## Goal and context
A marketer creates trackable links mapped to one site's campaigns.

## Primary persona and user story
As a product user with the specified role, I want campaigns utm to work end-to-end so I can make a decision without fabricated results.

## Scope in
Workspace/site CRUD; normalized UTM mapping; generated link validation; duplicate handling.

## Non-goals
Official platform sync, automatically verified ad clicks.

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
Given valid member and workspace, when creating campaign, then unique UTM ID persists. Given conflicting UTM URL, generation rejects silently overwriting. Given cross-tenant site, no result or mutation is permitted.

## Data and integration constraints
Read docs/measurement-methodology.md and repository-rules/04-ATTRIBUTION-DATA.md. Backend orders and verified imports are revenue truth; events only partially observed.

## Edge cases and UI states
Loading, empty, error, denied, network failure, retry, duplicate, stale data and mobile view as applicable.

## Dependencies and risks
Duplicate IDs, malformed URLs, unsafe schemes, orphan campaign costs.

## Decisions and assumptions
(assumption - confirm) Local-first private demo only until owner approves real-person data processing.
(open question) Production deployment, privacy policy, retention SLA, email verification and incident procedure.
