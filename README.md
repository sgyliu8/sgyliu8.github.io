# Dr Yang Liu — Engineering Portfolio

Source for [sgyliu8.github.io](https://sgyliu8.github.io/), a lightweight static portfolio for Dr Yang Liu, PhD, CEng.

The site presents a concise, public-safe record of work across gas-turbine thermodynamic performance, advanced measurement, industrial imaging, deployable AI/ML and engineering software architecture. It replaces the former Academic Pages demo content and is intentionally dependency-free at runtime.

## Structure

`public/` is the canonical authoring tree. Root-level HTML/assets form a branch-deployment compatibility mirror because the current Pages setup can publish either route. Never edit the mirror separately: run `npm run sync:root`, then `npm run check` before committing.

```text
public/
  index.html              English portfolio
  zh/index.html           Chinese portfolio
  cv/index.html           Printable English public CV
  zh/cv/index.html        Printable Chinese public CV
  assets/css/site.css     Responsive design and print styles
  assets/js/site.js       Navigation and progressive enhancement
  assets/img/             Social preview artwork
  404.html                Custom not-found page
scripts/
  check-site.mjs          HTML, link and privacy guardrails
  sync-root.mjs           Refresh the branch-deployment mirror from public/
docs/
  ui-audit-2026-07.md     UX, visual and accessibility decision record
  ui-audit-2026-07-round-2.md
                           Data-to-decision redesign and release QA record
.github/workflows/
  quality.yml             Pull-request validation
  static.yml              GitHub Pages deployment
```

## Local preview

From the repository root:

```bash
python3 -m http.server 8000 --directory public
```

Then open `http://localhost:8000`.

## Validation

```bash
npm run check
```

The check verifies required metadata, unique HTML IDs, local links and fragments, and a small denylist of sensitive or known-incorrect CV strings.

## Deployment

Pushes to `master` validate the site, upload only `public/`, and deploy through GitHub Pages. The workflow uses current Node 24-compatible official Pages actions.

A merge is not treated as a release until the public URL passes the browser acceptance checks for the English homepage, Chinese switch, CV route and keyboard navigation.

The validator byte-compares every file under `public/` with its root counterpart. This prevents the branch-based Pages path from overwriting a newer Actions deployment with a stale mirror.

## Content boundary

The portfolio includes only public, independently developed or deliberately high-level professional information. It excludes private contact details, compensation, internal organisation data, unpublished employer intellectual property, internal test evidence and private repositories.
