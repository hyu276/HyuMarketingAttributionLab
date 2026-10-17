# Measurement Contract v0.1: P0 Draft

**Status:** draft for owner validation. Implements a deterministic synthetic test fixture, not a production-grade identity system.

## Units and sources

- Currency: VND for fixture; money as nonnegative integer minor units or explicit decimals in a trusted order feed.
- Time: UTC instants stored, workspace \`Asia/Ho_Chi_Minh\` used for reports, revenue by order date.
- Session: 30 minutes inactivity, created only after analytics consent.
- Eligibility: only trusted paid/fulfilled (or properly accounted partial refund) orders; pending and cancelled excluded.
- Revenue basis: item gross minus discounts minus refunded amount, excluding shipping/tax.
- Verified journey: token-bound, server-verified site + visitor association. Browser-supplied visitor ID alone is NOT evidence of verified identity.
- Without verified visitor linkage, isolated unique coupon association may be labeled \`coupon_fallback\`; ambiguity -> \`unassigned\`.
- No consent / no eligible touch -> \`unassigned\`; never reconstruct identity with IP or User-Agent.

## MVP attribution semantics

- Models: \`first_touch\`, \`last_non_direct_touch\`.
- Window: 1, 7 or 30 days before \`ordered_at\` with inclusive earliest instant and order instant.
- First touch: oldest eligible observed touchpoint; last non-direct: newest eligible non-direct touchpoint, else direct with verified linkage.
- Tie breaker: chronological instant, then stable touchpoint ID lexically to eliminate input-order variance.
- Exactly 1 bucket per eligible order/model; no double attribution of revenue.
- \`model_version\`: first implementation \`mal-attribution-v1\`.
- \`spend=0\` or missing -> \`ROAS N/A\`; attributed ROAS is NOT causal return.

## Golden fixture

Order ORD-A: net revenue 900000 VND at 2026-10-06 12:00Z. Same verified visitor with Facebook paid_social at Oct 1 09:00Z; Google cpc at Oct 3 10:00Z; Direct Oct 5 11:00Z. 7-day first touch -> Facebook; last non-direct -> Google. If verified association is absent, unassigned unless a separate eligible unique coupon is verified. Never add 900000 + 900000 as real revenue.

## Open production decisions

Legal/consent policy, deletion and retention period, exact checkout-token lifecycle, refund semantics, cross-currency accounting, authentication/tenant scopes and cohort denominator. None are approved for real-person tracking merely by creating this document.
