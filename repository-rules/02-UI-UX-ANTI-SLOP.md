# UI/UX Quality Contract: Hyu Anti Vibe Code Slop

**Primary design reference:** \`Hyu Anti Vibe Code slop\`. Supporting references: \`Uizze Anti UI Slop\` (Operate) and \`Impeccable\` (shape, craft, audit). Their existence in one user's ChatGPT account must not be assumed in every coding environment.

## 0. Scope, authority and modes

This is a **frontend design and UX** contract, not an inference engine for code quality, cybersecurity, authorship or conversion lift. The source brief, observed product behavior and owner-approved brand outrank stylistic heuristics.

Choose a mode for each affected surface: **Build** (new), **Audit** (report observed issues) or **Repair** (implement scoped corrections). If asked to repair, change real code when authorized, not just write a checklist. Do not change backend framework or business models to resolve aesthetics.

Before UI edits, identify:
- Primary user, main job, product value, primary action and any approved brand constraints.
- Source content and data provenance; relevant screenshot/code/component tokens; current breakpoint behavior.
- Which observations are proven, which are only hypotheses, and which must be verified by rendering.
- Design tasks from the roadmap. The dashboard surface is **Operate**, while a future introduction page may be **Persuade**.

**Marketing Attribution Lab user jobs:** audit a number, compare first-touch and last-non-direct attribution, inspect a verified journey, create UTM URLs, import orders/spend, inspect measurement coverage. Build the page hierarchy around these jobs.

## 1. Five enforceable principles from Hyu Anti Vibe Code slop

### A. Color with intent: Màu sắc có điểm nhấn

- Identify first-attention focal content and primary action on every screen.
- Default to one principal interaction accent when no brand design system exists. Define distinct neutral roles (canvas, surface, text, border), focus, and semantic colors (success, warning, destructive, unavailable).
- Check contrast of actual text/background; do not use one hue for chart series, every status or every CTA.
- Avoid default purple/blue gradients across backgrounds, headings and buttons when they flatten hierarchy. **Keep a gradient when it communicates a defensible brand or data meaning.** Gradient presence alone does not prove slop.
- Charts use legible palette, labels and patterns/legend as needed; never encode critical business distinctions by color alone.
- Acceptance: primary task has a clear visual priority, states are distinguishable, interaction colors do not fight chart semantics.

### B. Decoration with purpose: Trang trí có lý do

- For every badge, icon, emoji, glow, floating shape or marketing ornament ask: **what content, status or action becomes clearer?**
- Remove redundant "smart/fast/powerful" decoration, generic icon tiles and animated counters without a genuine data source.
- Preserve meaningful functional icons, verified status tags, alerts, useful brand signatures and interaction affordances.
- Icon-only controls require accessible names and sufficiently visible focus/target size. Decorative icons must not masquerade as controls.
- Never remove legitimate warnings, data quality badges, consent indicators or provenance labels merely to look minimal.
- Acceptance: removing decoration must not lose essential meaning; remaining decoration has a documented role.

### C. Content-led layout: Bố cục theo nội dung

- State each section's job: **read, compare, decide, configure, trace or act**.
- Use tables for campaign/order comparison; ordered steps for UTM and import workflow; timelines for touchpoint sequence; clear filters for reports; actual interactive examples for learning an attribution rule.
- No arbitrary three-card feature rows or repetitive card grids simply because a generic SaaS layout suggests them. Multiple cards are fine when genuinely independent summaries warrant them.
- A dashboard should prioritize reporting context, meaningful aggregates, quality warnings and the drill-down that explains a number. Avoid using chart quantity as a proxy for analytical depth.
- Prefer a single **working, honest scenario** with inputs and visibly derived outputs to speculative "AI insights". If no database exists, label the experience **DEMO DATA / FIXED SCENARIO**, and make clear which future flows are unavailable. Do not fake backend responses, live campaign imports, API sync or a save success.
- Never delete required filters, tables or workflows to differentiate from a template.
- Acceptance: every displayed measure links to a definition and evidence path; fake or unavailable operations are not interactive affordances.

### D. Coherent interface: Đồng bộ giao diện

- Establish tokens for color roles, type scale, spacing, radius, border, motion and chart series. Reuse component vocabulary across pages.
- Audit adjacent equivalents and cross-page controls: buttons, input help/errors, tabs, tables, empty states, dialogs, chart legends, number formatting and status pills.
- Allow meaningful variants such as primary, secondary, destructive, compact and quiet. Consistency follows **semantic role**, not identical dimensions.
- Fix repeated inconsistencies in shared tokens/components, then test all consumers; no broad unscoped CSS overrides.
- Acceptance: the same meaning looks and behaves the same in the same context; exceptions have task-specific reasons.

### E. Concrete value: Câu chữ nói rõ giá trị

- Copy must answer **who benefits, from which action, by what mechanism, with which result**.
- Replace claims like "Unlock marketing intelligence" with true actions such as "Compare first-touch and last-non-direct credit for the same order".
- CTAs say what happens: "Build UTM link", "Preview 26 order rows", "Compare attribution models", not generic "Get started" when a specific action exists.
- Explain \`Observed orders\`, \`Attributed orders\`, \`Coupon fallback\`, \`Unassigned\`, \`ROAS\`, \`CPA\`, lookback, spend coverage and model freshness.
- Do not invent customer logos, testimonials, uplift percentages, certifications, platform connections or product features. Don't rewrite useful brand language gratuitously; add concrete supporting copy.
- Acceptance: a first-time marketer can tell what each screen enables and whether its data is demo, verified, inferred or unavailable.

## 2. Product-specific structure and art direction

Use an **analyst's workbench**, not a landing-page template: compact but readable hierarchy, intentional type/spacing, tabular numerals, tables before decorative card decks, truthful annotated visuals and a deliberate focus state.

### Page information architecture

- **Overview:** selected workspace, date range, timezone, attribution model, ingestion freshness; observed orders, attributed/unassigned coverage and spend status; relevant drill-down.
- **Campaigns/UTM Builder:** campaign registry and functioning link generation, validation and exact copy affordance.
- **Attribution:** one underlying order ledger; model comparison without summing credits across models; journey explanation.
- **Orders/Spend:** authenticated sources of truth, upload preview, specific row errors and idempotent results.
- **Tracking:** site setup, exact installation/consent status and debug state; no false "live" success.
- **Funnel/Acquisition:** explicitly labeled session/event basis, source and time scope, data completeness.

### Required states

Loading, empty, zero, N/A, stale, error/retry, denied permission, partial data, destructive confirmation, selected, disabled, success and small viewport. Empty state includes a real next step. No disabled action pretending to work.

### Accessibility baseline

Semantic HTML, labels, keyboard operation, focus visible, dialog focus management, no color-only meaning, prefers-reduced-motion, WCAG 2.2 AA-oriented implementation. Target >=4.5:1 text contrast (regular), >=3:1 (large), >=3:1 meaningful non-text where applicable. Check 390, 768, 1024 and 1440 CSS pixels, including breakpoint transitions; report unavailable widths honestly. Charts include textual data access.

## 3. Skill collaboration without aesthetic dogma

1. **Hyu Anti Vibe Code slop** supplies the five required review questions and \`Build/Audit/Repair\` mode.
2. **Uizze Anti UI Slop** supplies task-oriented density, tables, interaction/state norms and optional references. Do not claim paid Uizze MCP was accessed unless actually connected.
3. **Impeccable** shapes the design language, checks hierarchy, accessibility, responsive behavior and product-specific polish.
4. If their advice differs, decide with actual content, brand and user goals. Don't force arbitrary limits on gradient count, icon count or card count.
5. Do not adopt a skill's unrelated green/teal palette, font mandate or framework lock-in against this product's design direction.

## 4. Finding and decision record

For every significant UI issue, include:

| Field | Required content |
|---|---|
| Location / evidence | Page/component/viewport and what was actually observed |
| User impact | What becomes harder, misleading or inaccessible |
| Decision | **Keep**, **remove** or **refine** |
| Change | Concrete, bounded implementation |
| Verification | Testable task, viewport, state or tool |
| Status | **Pass**, **Needs fix**, **Unverified** or **N/A** |

Priority: **High** if blocked task, misleading demo, false claim, unreadable text, hidden mobile essentials. **Medium** for vague value, inconsistent controls or visual hierarchy confusion. **Low** for local minor decoration. Avoid aggregate scores that hide severe defects. Never claim layout changes improve conversion rates without measurement.

## 5. Mandatory finish gate

- Inspect actual desktop/mobile rendering with a browser if supported. A successful build or static screenshot does not prove responsive/hover/interaction behavior.
- Recheck one primary task end to end: CTA -> input -> validation -> output -> error/recovery.
- Test focus, tab sequence, icon labels, text legibility, data provenance, content overflow and one breakpoint transition.
- Verify semantic number formatting, attribution caveats and an honest \`DEMO DATA\` label where appropriate.
- Run the relevant code checks and record **PASS / NEEDS FIX / UNVERIFIED** per five principles.
- If runtime/browser unavailable, complete the source-level review, mark visual verification **UNVERIFIED**, and DO NOT claim the UI was inspected.
- Keep reviews evidence-led. Slop appearance is not evidence of AI authorship, low code quality, security flaws or customer conversion loss.
