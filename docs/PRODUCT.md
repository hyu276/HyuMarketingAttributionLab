# Marketing Attribution Lab: Product Truth

**Users:** performance marketers, marketing analysts, e-commerce owners and workspace administrators.

**Purpose:** compare how observed, consented touchpoints receive credit for legitimate imported orders under explicit attribution models; pair that model output with actual uploaded spend. Help users understand uncertainty as well as attributed results.

**Must remain true:**
- Rule-based attribution is not evidence of incremental sales or a causal lift.
- Browser events are telemetry; a trusted server order or authenticated validated CSV is the revenue source of truth.
- Lack of consent, tracking blockers and missing checkout linkage create real uncertainty. Show unassigned data.
- Coupon fallback is a separate, weaker inference, not a verified click-through path.
- Multiple attribution models are different views of the same orders, not additive revenue.
- GitHub hosts source/CI. Until a server and Postgres are deployed, there is no live SaaS backend.

**MVP:** accounts and workspaces, sites, campaigns/UTM, consent SDK, collector, order/spend imports, checkout linking, first/last models, reconciliation, dashboard and exports.

**Current pilot:** deterministic first-touch versus last-non-direct lab, intentionally labeled synthetic. Not live campaign/commerce analytics. Features awaiting a database should be presented as future stages, never as clickable fake successes.
