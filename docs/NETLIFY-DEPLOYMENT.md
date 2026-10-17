# Netlify deployment: Hyu Marketing Attribution Lab

## Project allocation

- Application repository: https://github.com/hyu276/HyuMarketingAttributionLab
- New, separate Netlify project: `hyu-marketing-attribution-lab`, site ID `519b33ea-f64c-4a88-ab52-cbe59584226a`.
- Dashboard: https://app.netlify.com/projects/hyu-marketing-attribution-lab
- Intended origin after first successful deployment: https://hyu-marketing-attribution-lab.netlify.app
- Existing `hyupremium.netlify.app` must NOT be replaced by this project.

## Status and blockers

Project created on the existing Netlify Free team. **No deploy has been initiated.** The connected Netlify tools in this workflow do not expose a Git-link / upload / deploy operation. A Netlify project with no published deploy is NOT a live website.

For production, there is a second blocker: provision an approved persistent PostgreSQL database, apply reviewed Drizzle migrations safely, configure backups and a privacy/security policy. GitHub Actions PostgreSQL is ephemeral and is NOT hosting.

Netlify Next.js 13.5+ integration supports SSR, API routes, App Router and serverless functions via the automatically installed OpenNext runtime. No Vercel adapter is required. Do NOT add `output: 'export'` or `/* /index.html 200` as those break dynamic API routes.

## Finish Git setup (manual Netlify UI)

1. Open the new Netlify project from the dashboard URL above.
2. Choose **Connect Git repository / Link to Git**, select GitHub and `hyu276/HyuMarketingAttributionLab`.
3. Production branch: `main`. Base directory: repository root. Build command `npm ci && npm run build`. Publish directory `.next` (also in committed netlify.toml).
4. Keep project access protected until testing, consent/privacy review and secret configuration pass. Avoid using public tracking or real customer data during setup.
5. Preview feature branch/PR, verify function builds, then publish production only after approval. If Git-connected production auto-deploys on every main push, enable publish lock or merge only after verification.

## Required Netlify environment variables

Configure via Project configuration -> Environment variables. Mark secrets and include Builds + Functions scopes as needed. Set these values independently for production and previews:

| Key | Secret? | Notes |
|---|---|---|
| `DATABASE_URL` | YES | Persistent PostgreSQL connection string, TLS enabled as supported, network access from Netlify Functions. |
| `BETTER_AUTH_SECRET` | YES | Cryptographically generated random string of at least 32 characters, unique per environment. |
| `BETTER_AUTH_URL` | No | `https://hyu-marketing-attribution-lab.netlify.app` once active. Exact HTTPS origin, no trailing slash. |
| `CHECKOUT_SERVER_KEY` | YES | Independent high-entropy server-to-server key. Not exposed to JS, not `NEXT_PUBLIC_`. |
| `NODE_ENV` | No | Let Netlify/Next manage, do not set conflicting development mode for production. |

Do not put these secrets into GitHub code, `netlify.toml`, screenshots, public build logs or browser JS. After changing env variables, trigger a new deploy: already-published functions do not inherit updated values.

## Database options and cost gate

Netlify Functions do not provide an automatically persistent local PostgreSQL volume. The database must be a separate supported managed Postgres service or a protected existing instance. Evaluate a free offer with practical limits, usage, backups, residency and network connection pooling before connecting. **Do not auto-provision a database, sign up for a paid tier, or migrate real data without a fresh owner decision.** Free Netlify hosting does not imply free long-term database hosting.

## Integration: existing websites

- https://hyu.premium.vercel.app
- https://hyupremium.netlify.app

These are **measurement sources**, NOT target deployments for this repository. Confirm whether both domains host the same website before treating them as separate sites: duplicate tracking can split identity and double-count sessions. Use the same site identity only if the analytics owner explicitly decides they are aliases.
- Register exact hostnames on the Lab site allowlist, using existing `/api/v1/sites` or site administration.
- The existing tracker currently initializes consent inside `/store` demo only. It is not automatically injected into either external website. A deployment does NOT enable remote tracking.
- Prefer a reviewed site-specific integration PR that displays an explicit consent choice before initializing the tracking SDK. Only send allowlisted event names and non-PII props.
- For real sale/revenue attribution, a trusted e-commerce backend must issue checkout tokens and ingest paid/refunded orders. Do not count clicks or browser purchase events as authoritative sales.

## Social account sources

Organic profile handles/links can be tracked as campaign metadata and tagged outgoing URLs; historical reach/impressions/engagement, follower trends and ad spend require platform APIs with account authorization or verified exports. Do not scrape private metrics, infer ad spend or fabricate missing series. Start with manual imports and clear labels `manual`, `public`, or `authorized API` and `as-of` timestamps.

## Acceptance gate

- Netlify deploy state is **ready** with actual project URL serving public/app routes.
- Better Auth sign-up/sign-in passes only with correct trusted origin; /api/v1/... session endpoints reject unauthorized requests.
- PostgreSQL migration applied and transactionally tested on a disposable database first.
- Trial visitor rejects analytics -> no identifiers/events; accepts -> event collector stores once for the right site; revocation stops subsequent events.
- Verified order & cost imports reconcile in the real dashboard; no double counting across models.
- Tests, mobile/keyboard/a11y review, backup, secrets, abusive collector/throttling and legal approval checked.
- Only after all gates pass: enable actual tracking on both websites and public availability.

## Known risks before public launch

Current signup lacks verified email/recovery; public collector uses per-process rate limiting, accepts client-asserted consent and is not hardened against non-browser forgery; backend credential rotation and distributed abuse controls are still needed. Do not describe an empty Netlify project as a finished hosted SaaS.
