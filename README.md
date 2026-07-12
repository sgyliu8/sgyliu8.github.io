# Dr Yang Liu — Engineering Portfolio

Source for [sgyliu8.github.io](https://sgyliu8.github.io/), a lightweight static portfolio for Dr Yang Liu, PhD, CEng.

The site presents a concise, public-safe record of work across gas-turbine performance and diagnostics, advanced measurement, industrial imaging and engineering software. It replaces the former Academic Pages demo content and is intentionally dependency-free at runtime.

## Structure

```text
public/
  index.html              Main portfolio
  cv/index.html           Printable public CV
  assets/css/site.css     Responsive design and print styles
  assets/js/site.js       Navigation and progressive enhancement
  assets/img/             Social preview artwork
  404.html                Custom not-found page
scripts/
  check-site.mjs          HTML, link and privacy guardrails
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

## Content boundary

The portfolio includes only public, independently developed or deliberately high-level professional information. It excludes private contact details, compensation, internal organisation data, unpublished employer intellectual property, internal test evidence and private repositories.
