# MAL API v1, local-first development contract

The current backend requires \`BETTER_AUTH_URL\`, \`BETTER_AUTH_SECRET\`, \`DATABASE_URL\`, and a migrated PostgreSQL instance. All private routes use HttpOnly session cookies issued by Better Auth and require same-origin requests for writes.

## Authentication

- \`/api/auth/[...all]\`: Better Auth, email/password sign-up and sign-in for local workspaces.
- \`GET /api/v1/workspaces\`: list workspaces for the current logged-in user.
- \`POST /api/v1/workspaces\`: JSON \`{"name":"Demo Commerce"}\`; creates owner membership.
- \`GET /api/v1/sites?workspaceId=<uuid>\`: authorized membership required.
- \`POST /api/v1/sites\`: JSON \`{"workspaceId":"<uuid>","name":"Store","domain":"localhost"}\`, admin only.
- \`GET /api/v1/campaigns?siteId=<uuid>\`: scoped campaign list.
- \`POST /api/v1/campaigns\`: JSON \`{"siteId":"<uuid>","name":"Autumn","utmId":"cmp_a","source":"facebook","medium":"paid_social"}\`, admin only.
- \`POST /api/v1/coupons\`: JSON \`{"siteId":"<uuid>","campaignId":"<uuid>","code":"AUTUMN10"}\`, admin only.

## Consent-gated collection

- \`POST /api/v1/collect?site_key=<public_site_key>\`
- JSON: \`site_key, event_id, visitor_id, session_id, event_name, occurred_at, page_path, consent:{analytics:true,policy_version}, utm?, properties?\`.
- Allowed names: \`page_view, view_item, add_to_cart, begin_checkout\`.
- Browser SDK must require explicit opt-in and create random first-party IDs only after consent.
- Public site key, Origin, and browser's consent boolean are **not proof of identity or legal consent**. Collector is untrusted telemetry only, rate limit is in-process and production readiness requires independent review.
- Max request ~8 KiB, site hostname allowlist, event-id idempotency by site.

## Trusted checkout

- \`POST /api/v1/checkout-links\` with \`Authorization: Bearer <CHECKOUT_SERVER_KEY>\`.
- JSON \`{"siteId":"<uuid>","visitorId":"<uuid>"}\`. Only trusted server holds the key.
- A valid consenting visitor must already belong to the site.
- Response \`checkoutToken, linkId, expiresInSeconds\`; token is one-time and expires in 15 minutes, stored as SHA-256 hash.
- A sample/demo browser must never possess \`CHECKOUT_SERVER_KEY\`.

## Order and cost imports

Only workspace admin can call:

- \`POST /api/v1/imports/orders/preview\` JSON \`{"siteId":"<uuid>","csv":"..."}\`.
- \`POST /api/v1/imports/orders/commit\` JSON \`{"siteId":"<uuid>","csv":"...","digest":"<preview_digest>"}\`.
- \`POST /api/v1/imports/spend/preview\` and \`.../commit\` analogous.
- Order CSV columns: \`order_id,ordered_at,status,currency,gross_item_revenue,discount_amount,refunded_amount,checkout_token,discount_code\`. Currency currently VND only. No customer PII fields.
- Spend CSV columns: \`row_key,campaign_id,spend_date,currency,amount\`.
- Content size <= 1,000,000 chars, <= 5,000 rows, validates each row, errors identify row number. Same digest is no-op, stable row key prevents cost doubling.

## Reports

- \`GET /api/v1/reports/overview?siteId=<uuid>&from=YYYY-MM-DD&to=YYYY-MM-DD&model=first_touch&windowDays=7\`.
- \`GET /api/v1/reports/export?siteId=<uuid>&from=YYYY-MM-DD&to=YYYY-MM-DD&model=first_touch\`: CSV with spreadsheet-formula escaping, fixed 7-day model.
- Reports select trusted orders and site-scoped touchpoints; order date grouped in workspace timezone; no multi-currency conversion.
- Every model represents the same observed order revenue. Unassigned and coupon fallback are explicit. Spend absent -> ROAS N/A.
- Large datasets yield explicit \`REPORT_TOO_LARGE\` rather than silently truncated totals.

## Privacy

- \`DELETE /api/v1/privacy/visitors/<uuid>?siteId=<uuid>\`: workspace admin, same-origin, removes first-party analytics visitor/session/events/touches and unlinks any referenced orders without deleting the order ledger.
- Retention period and legal processing policy remain open owner decisions. Do not call production processing compliant solely because this endpoint exists.

## Security limitations before public deployment

- Better Auth sign-up is intended for local workspaces; email verification and recovery are not configured.
- Collector throttling is per-process, not distributed, and consent is browser asserted.
- One trusted checkout secret currently protects the local demo boundary. Production would need per-site credentials, replay controls under concurrency and secret rotation.
- Do not expose live customer data until threat model, legal review, backups, rate limits and E2E negative cases are approved.
