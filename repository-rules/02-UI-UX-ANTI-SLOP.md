# UI/UX: Uizze Anti UI Slop + Impeccable

## Objective

Build a credible **analytical workstation** for performance marketers. Primary mode is Operate, not Persuade. An expressive website is not useful if attribution, date range, source and revenue are unclear.

## Mandatory workflow for UI work

1. Read product brief, current screens, tokens and components. Consult Uizze Anti UI Slop (dashboard/operate guidance) and Impeccable (shape, craft, audit) when skills exist. Treat skills as guidance, not prerequisites or authority higher than product rules.
2. Identify the user's job, focal data, primary action, data volume, dangerous actions and full state matrix.
3. Create a single visual direction and reusable semantic tokens before adding screens. Preserve established brand if present; do not impose another skill's default colors/fonts/components.
4. Build with semantic HTML and accessible, proven primitives. Custom components are permitted when justified and tested. Avoid forced dependencies.
5. Review actual rendered desktop + mobile where browser tools exist; fix clipping, semantics, focus, real interactions and states, not merely screenshot aesthetics.

## Anti-slop prohibitions

- No universal giant gradient hero, glassmorphism, glow, oversized decorative statistics, generic AI dashboard icons, nested card soup, card-in-card repetition or motion on every element without a product-specific purpose.
- No endless rows of equal-sized cards where a table, list or focused comparison conveys data better.
- No fake charts, invented uplift, implied live feeds, fake integrations or success toasts without persistence.
- No unreadable miniature labels, color-only category indicators, metric acronyms without a description, misleading truncated amounts or unbounded table width.
- No contradictory interaction patterns, placeholder click actions, broken tab order or menus clipped by scroll containers.

## Design direction (starting hypothesis, refine at P0)

- Compact but breathable visual density, deliberate typography, tabular numerals, strong table and trend hierarchy.
- Neutral canvas, restrained semantic accent roles, explicit danger/warning/success colors; avoid decorative color.
- Desktop side navigation + top reporting context; mobile navigation collapse with critical actions retained.
- Filter context always makes selected workspace, timeframe, timezone and attribution model identifiable.
- Percent, money, units, date grouping and number precision remain consistent.
- Charts require legends, accessible underlying values, tooltip meaning, empty/error states and truthful axes.
- Tables require logical sort, search/filter when warranted, scoped actions, stable pagination, keyboard navigation and clear mobile strategy.

## Required surfaces

Overview; Acquisition; Campaigns and UTM Builder; Attribution Model Comparison; Funnel; Orders and Imports; Spend; Tracking Setup; Workspace Settings. A screen is incomplete without functional or explicitly blocked state transitions.

## Data trust and copy

- Label `Observed orders`, `Attributed revenue`, `Coupon fallback`, `Unassigned` without ambiguity.
- Show a methodology description or accessible info affordance for ROAS, CPA, coverage, conversion rate and lookback.
- Mark synthetic data `DEMO DATA`, display last-updated/data-freshness, and never use attractive fake percentages.
- Spend = 0 / missing spend must not show Infinity or deceptively show 0 ROAS. Render N/A with explanation.
- Always reflect consent-denied and insufficient-data scenarios; these are legitimate product states.

## Accessibility and interaction requirements

- Target WCAG 2.2 AA patterns; measure text contrast >= 4.5:1 normal and >= 3:1 large; non-text critical controls >= 3:1 in applicable states.
- Keyboard focus visible; semantic headings; labels and descriptive errors; dialogs focus-managed; meaningful touch targets.
- Respect reduced motion, zoom, text expansion and localization.
- Support at least 360, 768, 1280 and 1440 CSS-pixel review widths, or report unavailable viewport verification.
- Buttons need hover/focus/disabled/loading; workflows need empty/error/success/retry states.
- Preserve data density without hiding material information from mobile users. Prefer appropriate reflow or intentional horizontal data scrolling with context.

## UI acceptance

A UI PR must state user job, screenshot/browser evidence if available, screen sizes, data state coverage, keyboard checks, failures and corrected issues. Static lint alone does not prove visual quality.
