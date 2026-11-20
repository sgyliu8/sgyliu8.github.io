# Private workspace entrance

The English and Chinese portfolio homepages include a lock-marked workspace
link in the main navigation and professional links. The original professional
content and public CV remain the public site’s content authority.

The entrance opens an owner-protected Cloudflare Access destination:

- English: https://photometric-stereo-private.sgyliu.workers.dev/workspace/en/
- Chinese: https://photometric-stereo-private.sgyliu.workers.dev/workspace/

GitHub Pages serves the public entrance. Authentication and private reading are
handled at the destination by Cloudflare Access and its validated owner identity.
The public repository contains no private project catalog, attachments, login
codes or upload credentials. A front-end password dialog would not protect
static files and is deliberately unnecessary here.

## Maintenance

The separate **Opportunity Radar pilot** link on each homepage opens `/emc/`.
During an invited session this page checks the supplied session locator against
its published SHA-256 digest, then opens the app login over HTTPS. After expiry
the public page shows the offline message. The invitation page runs no analytics.

For each new session, from the website checkout run `npm run emc:session -- <digest> <UTC-expiry>`,
then `npm run check`. Commit and publish the two updated `emc/session.json` files
from the canonical and mirror trees. Use the SHA-256 of the lowercase UTF-8 tunnel
slug and a future UTC timestamp ending in `Z`. The homepage and its links already
point to the permanent entry. Share the invitation locator and the application
credential privately.

Edit `public/index.html`, `public/zh/index.html` and
`public/assets/css/site.css`; regenerate the root mirror with
`npm run sync:root`, then run `npm run check`.

Release acceptance covers English and Chinese entrance links, desktop and narrow
viewport layouts, keyboard focus and navigation, the public CV route, and the
live destination’s owner sign-in boundary. A new private project can be added at
the protected destination without changing this public entrance.

## Validation record

- Local site validation: 14 HTML files, 190 public files, zero broken internal
  references; generated branch mirror matches the authoring tree.
- Browser checks: English and Chinese entrance URLs, language switch, public CV
  route, visible keyboard focus, and desktop layout passed.
- The public entrance and workspace render without horizontal overflow in
  actual 375 px iframe viewports. This is a browser layout check; a physical
  mobile-device session was not run.
- The protected destination checks validated owner identity, denies anonymous
  and forged identity headers, and emits private/no-store and noindex headers.
