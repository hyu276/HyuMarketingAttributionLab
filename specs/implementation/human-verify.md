# Human Verification Checklist

## Reproduction

1. On a machine with Node 22, pnpm and Docker, checkout the feature branch, install dependencies with a verified lockfile, configure .env.local, start Postgres, apply migrations, start Next.
2. Open /login and register local-only account; create workspace, site and campaign. Verify sign-out and unauthorized access to console/data.
3. Create a second account/workspace. Attempt to request site ID, campaign ID and report from the first account: every attempt should return 403 or 404, with no leak.
4. Open /store?site_key=<public key>. Before consent there must be no analytics visitor ID/event. Reject and verify zero collection. Accept; inspect page_view stored once. Revoke and verify no further analytics sends.
5. Using trusted backend credentials only, create a checkout token for the same site visitor. Preview a valid order CSV and commit once, then re-import. Verify order remains single. Import spend. Run report for 7-day first and last; compare golden fixture.
6. Change refund status/amount and confirm observed revenue and attribution update.
7. Export CSV and check tenant scoping, spreadsheet formula escaping.
8. Test with mouse and keyboard, 390/768/1024/1440 widths, focus, dialog/retry states and reduced motion.
9. Verify no third-party platform account, real-person dataset or paid cloud resource has been touched.

## Rollback

Do not merge PR until confirmed. For local disposable databases only, recreate data from migrations and fixtures. Back up any non-disposable environment before schema changes. Production deployment requires separate explicit permission.
