# Workspace authentication and isolation

Status: Implementation in progress, acceptance not yet verified. Owner: repository owner.

## Goal and context
A workspace admin signs in and manages scoped site data.

## Primary persona and user story
As a product user with the specified role, I want foundation auth to work end-to-end so I can make a decision without fabricated results.

## Scope in
Register/login/logout; session cookie; owner membership; admin versus analyst; all private APIs scoped.

## Non-goals
Email delivery, SSO, public signup abuse defenses until real hosting.

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
Given a valid session and workspace membership, when querying a site, then only same-workspace records are returned. Given no membership, when trying mutations, then 403 with no changes. Given wrong credentials, no session cookie is created.

## Data and integration constraints
Read docs/measurement-methodology.md and repository-rules/04-ATTRIBUTION-DATA.md. Backend orders and verified imports are revenue truth; events only partially observed.

## Edge cases and UI states
Loading, empty, error, denied, network failure, retry, duplicate, stale data and mobile view as applicable.

## Dependencies and risks
Authorization race, leaked cookies, expired session, account enumeration and CSRF.

## Decisions and assumptions
(assumption - confirm) Local-first private demo only until owner approves real-person data processing.
(open question) Production deployment, privacy policy, retention SLA, email verification and incident procedure.
