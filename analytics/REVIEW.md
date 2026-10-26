# Release review follow-up — 26 October 2026

The automated review of PR #8 completed after the initial release. Each actionable finding was evaluated against the running implementation.

| Finding | Resolution |
| --- | --- |
| Distributed collector requests still reach D1 | Added a constant-key admission limiter before D1: 300 requests/minute per Cloudflare edge location, in addition to 60/IP/minute. Both are approximate per-edge protection, not a strict worldwide quota or complete DDoS defense. The 20,000/day insert cap bounds accepted storage. |
| Cleanup failure | Added three bounded attempts. The final PII-free failure is registered through `ctx.waitUntil` for Cloudflare Cron Past Events; the next hourly run retries again. Queries independently exclude expired rows even if physical deletion is delayed by database unavailability. |
| UUID replay after raw-row deletion | Clarified the supported 30-day deduplication window. The browser retries only within the current navigation, with two short delays and the same nonce. Indefinite identifier tombstones were not added: arbitrary historic requests are outside this retry contract, and anonymous senders can also invent new UUIDs. |
| Failed pageviews never retry | Added at most two retries for network failures and transient HTTP failures. Permanent rejection and rate-limit responses do not trigger immediate retry. |
| Browser checks absent from CI | Both PR validation and Pages deployment now install pinned test dependencies and Chromium, and run the actual browser acceptance suite before deployment. |
| Summary and first rows disagree | New authenticated `/api/dashboard` reads both in one D1 batch transaction. Refresh uses this single response. |
| Out-of-order lifetime timestamp | Migration 0002 updates both MIN(first_at) and MAX(last_at), repairs endpoints where retained events provide an earlier/later timestamp, and preserves all counters. |
| Daily retention boundary | Delete the cutoff date too: keep today plus the preceding 364 UTC date buckets. |
| Path/config/UUID coverage gaps | Default browser checks load the real checked-in config, assert exact query-free routes, and require four valid distinct navigation UUIDs. |
| License-scanner warnings on native libraries | These concern optional native packages in the Wrangler development toolchain. They are not dependencies of the browser payload or production Workers. No third-party native binaries are shipped in the public site; no license-policy suppressions were added. npm audit reports zero vulnerabilities. |

Cloudflare scheduled-handler status behavior: https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/
Rate-limiter scope: https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/

Operations: inspect the collector's Cron Trigger **Past Events** in Cloudflare after a failed run. A prolonged database outage requires restoring database service before cleanup can complete; no application can guarantee deletion while its database is unavailable. No external email or messaging notification has been configured.

The repository previously had both legacy branch Pages publishing and a custom Actions publisher. Pages is now configured for the existing Actions workflow, which publishes only `public/`. The initial merged release and the workflow-only rerun both passed, and four real browser navigation events were verified directly in production D1 without printing their IP addresses.
