# Verification — 26 October 2026

Source baseline: `0a90768a3d33da35de75a1676663e76a764a8f8b`.
Feature branch: `feat/private-visitor-analytics`.

## Completed

- Existing site validator: **passed** — 14 HTML files, 192 public files, zero broken
  internal references; root compatibility mirror matches public/.
- SQLite-backed automated tests: **15 passed, 0 failed**.
- Chromium: desktop 1440×1000 and mobile 390×844; **passed**.
- Four primary public routes each emitted exactly one event when explicitly enabled in
  the test fixture. No query strings, fragments, referrers, cookies, persistent storage,
  consent dialog or public counters were added.
- Disabled configuration, GPC and DNT each produced zero requests.
- Collector network failure left the site usable, without uncaught JavaScript errors.
- Private dashboard counts, country/page breakdowns, daily chart, date inputs, pagination
  and CSV download passed. Injected HTML in a synthetic city value rendered as text.
- Session expiry cleared previously displayed data and showed a useful error.
- Anonymous requests, forged email/JWT headers, wrong audience and wrong email denied
  access to every private route, including CSS, JS, JSON and CSV.
- SQL replay test: three copies of one event produced one event and one count.
- IPv4/IPv6, absent geography, invalid input, request-size limits, rate limits, date limits,
  cursor pagination, CSV formula escaping, 30-day retention and generic errors passed.
- Both Workers bundled successfully with pinned Wrangler 4.144.0.
- Actual local workerd + D1: migration applied (seven SQL commands); an event and its
  replay produced **one event, one lifetime count and one unique IP**. Admin accessed it
  using Wrangler's documented local Access identity. Scheduled purge executed successfully.
- Desktop/mobile screenshots visually reviewed. Long visit tables were made scrollable
  with sticky headers.

## Issue found and corrected

The initial `2026-10-26` compatibility date was newer than the pinned workerd binary's
supported maximum. It was corrected to `2026-10-03` in both example configurations.
The actual runtime then started successfully and passed the database checks.

## Production backend verified

- Authenticated to the existing Cloudflare account using OS keyring storage.
- Provisioned a dedicated D1 database in WEUR and deployed both Workers.
- Enabled Worker-level Access for **All traffic**, including production and previews,
  using the existing exact-owner email policy without changing its rules.
- The Worker independently checks the application AUD and exact owner email.
- Owner sign-in through Cloudflare succeeded; the live dashboard initially showed zero.
- Anonymous/forged-header requests to HTML, JS, JSON and CSV redirect to Access.
- The public collector has no read endpoint. CORS and malformed-event checks passed.
- A real browser sent one event from the production website origin to the production
  collector, then replayed that event. Both returned HTTP 204.
- Remote D1 reported **1 event, 1 unique IP and 1 lifetime view**. IP, country and city
  were all present. Raw IP/geography values are not included in this public report.
- That one deployment test event is retained and is not represented as an external visitor.
- The hourly production cleanup trigger is deployed.
- Public configuration is enabled for the Pages release. Post-merge live-page acceptance
  and deployment status are recorded in PR #8.
- The initial Cloudflare authentication blocker was resolved. No other project Worker,
  reader, R2 bucket or Access-policy rule was changed.
