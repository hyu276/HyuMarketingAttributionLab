# Security, Privacy, Isolation and Responsible Tracking

This application handles potentially sensitive behavioral analytics. Shipping a visually convincing tracker without consent and tenant safety is a failed product.

## Must-have controls

- Default no optional analytics collection before valid consent. Implement clear opt-in/opt-out and revocation state; avoid creating/retaining analytics IDs without required permission.
- Document purpose, lawful basis, scope, cookie/storage behavior, retention, data-subject request procedure and jurisdiction review BEFORE real-person tracking. Review Vietnamese and other applicable law with qualified counsel before production: this file is not legal advice.
- No fingerprinting, probabilistic identity stitching, silent cross-device merging or covert analytics when consent denied.
- Never store full IP addresses long term, full User-Agent, emails, phones, payment credentials or sensitive values in tracking properties. Strictly allowlist event fields.
- User authentication with secure password hashing and sessions, CSRF protections appropriate to auth mechanism, same-site/secure cookies, and brute-force controls.
- RBAC and tenant isolation server-side in all reads/writes; trust membership lookup, not posted workspace/site IDs.
- Browser site key is public routing identifier, NOT a secret. CORS/Origin is browser defense, NOT proof against non-browser forged requests.
- Protect event collector with payload size, event-name allowlist, timestamps, rate limiting, abuse monitoring, and per-site scoping.
- Trusted order intake requires server-side credential/authenticated import; never trust client-generated purchase revenue or coupon to invent a paid order.
- Checkout links must use secure random opaque tokens, hash at rest, enforce TTL/site scope/one-time or controlled-use semantics and reject replay.
- Secrets only through ignored local env or approved secret managers, least-privilege tokens, no tokens in logs/PRs/CI artifacts.
- Report, import, export and logs must reject/escape CSV formula injection; sanitize user-provided text and enforce safe content rendering.
- Enforce explicit retention/deletion policies with audit trail and testable deletion procedure. 90-day raw-event TTL is a proposal pending approval and legal review, not a statutory universal period.
- Define backup, local test DB reset protection and safe migration procedure before non-demo persistent storage.

## Threat review per PR

Check auth bypass, cross-tenant data leakage, authorization by UI alone, invalid upload size/schema, CSV formula injection, XSS, CSRF, SSRF for remote URLs, token leakage, replay/dedup races, abuse of public collector, DoS, information in error bodies, cookie consent bypass and accidentally published real datasets.

## Blockers

Never release while critical vulnerabilities, cross-tenant access, invalid consent behavior, revenue forged from browser events or committed secrets remain unresolved. Stop, disclose the failing surface and request owner decision if necessary.
