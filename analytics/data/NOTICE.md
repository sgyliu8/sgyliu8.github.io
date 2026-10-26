# World map source

The bundled SVG paths in `src/world-map.mjs` derive from Natural Earth 1:110m Admin 0 Countries, pinned to release v5.1.2. Antarctica is omitted to keep the visitor map legible. This generalized dataset omits some small regions; those visits remain available in the country list and records. Areas without a matching ISO code are drawn without assigning traffic to them.

- Source: https://github.com/nvkelso/natural-earth-vector/blob/v5.1.2/geojson/ne_110m_admin_0_countries.geojson
- SHA-256: `6866c877d39cba9c357620878839b336d569f8c662d3cfab4cb1dbe2d39c977f`
- License: public domain. https://www.naturalearthdata.com/about/terms-of-use/
- Natural Earth uses de facto boundaries. The map is a statistical overview, not a statement about sovereignty.
- Projection: Natural Earth I, computed with d3-geo 3.1.1 (ISC license; build dependency only).

Regenerate from the analytics directory: `node scripts/build-map.mjs`. The script fetches this pinned source, verifies its checksum, and writes the same local paths. There are no third-party map requests in the dashboard and no visitor IP addresses are sent to map providers.
