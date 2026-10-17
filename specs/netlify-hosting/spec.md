# Netlify hosting and external source integration

Status: PARTIAL. Netlify Free project created, hosting config authored, production deploy and external tracking NOT live.

## User story
As an authorized marketing analyst I want the Lab hosted separately from my current websites, and eventually to receive consented events from those domains, so that I can compare auditable traffic and campaign outcomes.

## Scope
Next.js OpenNext Netlify build configuration, distinct project identity, trusted env/secrets checklist, external domain registration, consent source integration plan and social metrics provenance.

## Non-goals
No paid cloud resource provisioning, auto-import of private social analytics, unconsented tracking, fake paid orders, destructive update to existing sites or public deploy without a working DB/security gate.

## Given / When / Then
Given a repo checkout with the committed Netlify config, when Netlify builds it with valid secrets and reachable persistent Postgres, then SSR/API functions run on Netlify rather than a static export.
Given a visitor has not consented, when the website loads, then no analytics visitor IDs or event sends occur.
Given two hostnames are aliases of one website, when reporting, then campaign/site mapping avoids duplicate counters.
Given missing real social platform credentials or verified exports, when viewing analytics, then metrics show unavailable rather than invented values.

## Open questions
(assumption - confirm) The Vercel and Netlify domains are aliases of one content site; requires verification.
(open question) Approved persistent database vendor and region.
(open question) Domain-specific repository and consent integration changes for both websites.
(open question) Social platform accounts / consented API or export sources.
(open question) Public signup/security and privacy approval.
