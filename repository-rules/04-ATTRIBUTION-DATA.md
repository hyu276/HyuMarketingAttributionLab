# Attribution, Measurement and Data Integrity

## Measurement hierarchy

1. Trust verified backend/validated CSV orders for order IDs, states, monetary values, refunds and time.
2. Trust approved spend imports for campaign costs; never infer costs from UTM clicks.
3. Treat consented SDK events and touchpoints as partial observations, not omniscient customer journeys.
4. Registry holds canonical campaign metadata; attribution is derived and recomputable, versioned output.

## UTM conventions

`utm_source`, `utm_medium`, `utm_campaign` required for generated links; `utm_content`, `utm_term`, `utm_id` optional fields, with stable `utm_id` strongly recommended. Lowercase/slug-safe normalization with preview; never silently overwrite existing URL parameters. UTM alone does not prove paid media spend, identity or actual ad clicks.

## Identity, sessions and consent

Create first-party analytics visitor identifiers only when analytics consent is valid; no fingerprinting. Inactivity timeout 30 minutes. Do not reset sessions automatically on every new UTM; instead record additional eligible touchpoint and version future changes. Do not probabilistically stitch users via IP or browser attributes.

## Core definitions

- `observed order`: authoritative eligible order in the ledger.
- `attributed order`: valid observed order with eligible verified journey.
- `coupon_fallback`: coupon association absent a verified journey; isolated from click-based credit.
- `direct`: visit with no recognized referral/campaign; can receive last-non-direct fallback only with verified identity linkage.
- `unassigned`: missing/insufficient evidence. Do not guess campaign from nearby timestamps.
- `incrementality`: causal lift; NOT inferred from rule-based attribution.

## MVP models

- `first_touch`: earliest eligible touch in lookback interval.
- `last_non_direct_touch`: latest eligible non-direct touch; if only direct exists and linkage verified, attribute direct; otherwise unassigned.
- Lookback: 1, 7, 30 days, default 7; lower bound inclusive, touch time <= order time, no future touches.
- Compute 100% order credit for one winner per selected model/version/window. Never add revenues across model comparisons.
- `model_version`, `computed_at`, `window_days`, `attribution_basis`, and freshness must be available for audit.

## Revenue and metrics

Default eligible order statuses `paid` / `fulfilled`; exclude cancelled/pending; account for partial/full refunds under written lifecycle rules. `net_revenue = gross_item_revenue - discounts - refunded_amount`, excluding taxes and shipping. Use deterministic decimal/integer money math; include currency.

`ROAS = attributed_net_revenue / campaign_spend` when compatible currency, timeframe and spend > 0. Otherwise N/A (not zero, infinity, nor profit). Use order-date reporting for MVP revenue. Do not call CPA `CAC` without a valid new-customer identification method. Disclose cohort/denominator for conversion rate.

## Golden fixture (required test)

UTC journey: Facebook paid_social Oct 1 09:00, Google cpc Oct 3 10:00, Direct Oct 5 11:00; valid linked order `ORD-A`, 900000 VND net, Oct 6 12:00 UTC. 7-day first-touch = Facebook 900000. 7-day last-non-direct = Google 900000. Direct does not override the latter. Removing verified link and leaving no unique coupon -> unassigned. Tests must cover duplicate event, refund, non-consent, timestamp boundary, coupon reuse, cross-workspace and invalid token.

## Data pipeline acceptance

- Event identity uniqueness and replay safety.
- Preview CSV errors, approve commit explicitly, atomic or clearly documented per-batch outcome.
- Import same file twice is idempotent; changed refund status updates derived reports.
- Tenant-scoped joins at each step; no cross-site order linkage.
- Model switch never alters authoritative observed revenue.
- Dashboard totals reconcile against source-of-truth SQL and expose coverage/unassigned rate.
