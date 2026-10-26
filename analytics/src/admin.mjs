import { DAY, RETENTION_DAYS, headers, json, reply } from './common.mjs';
import { dashboardHTML, dashboardCSS, dashboardJS } from './dashboard.mjs';

export async function authorized(env, ctx) {
  if (!ctx?.access || !env.OWNER_EMAIL || !env.ACCESS_AUD || ctx.access.aud !== env.ACCESS_AUD) return false;
  try {
    const identity = await ctx.access.getIdentity();
    return typeof identity?.email === 'string' && identity.email.toLowerCase() === env.OWNER_EMAIL.toLowerCase();
  } catch { return false; }
}
function day(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) throw new Error('date');
  const time = Date.parse(value + 'T00:00:00Z');
  if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== value) throw new Error('date');
  return time;
}
export function range(url, now = Date.now()) {
  const today = new Date(now).toISOString().slice(0, 10);
  const earliest = new Date(now - RETENTION_DAYS * DAY).toISOString().slice(0, 10);
  const to = url.searchParams.get('to') || today;
  const from = url.searchParams.get('from') || new Date(now - 6 * DAY).toISOString().slice(0, 10);
  const start = day(from), finish = day(to) + DAY;
  if (from < earliest || to > today || start >= finish || finish - start > 31 * DAY) throw new Error('range');
  return {from, to, start: Math.max(start, now - RETENTION_DAYS * DAY), end: Math.min(finish, now + 1),
    earliest, today, retentionDays: RETENTION_DAYS, timezone: 'UTC'};
}
const CSV_FIELDS = ['occurred_at', 'path', 'ip', 'country', 'region', 'city'];
export function csvCell(value) {
  let text = String(value ?? '');
  if (/^[=+\-@\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
export default {
  async fetch(request, env, ctx) {
    if (!(await authorized(env, ctx))) return reply('Sign-in required', 403);
    if (request.method !== 'GET') return reply('Method not allowed', 405, {Allow: 'GET'});
    const url = new URL(request.url);
    const route = url.pathname;
    const assetHeaders = {...headers, 'Cross-Origin-Resource-Policy': 'same-origin',
      'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"};
    if (route === '/') return reply(null, 302, {Location: '/admin/'});
    if (route === '/admin/') return reply(dashboardHTML, 200, {...assetHeaders, 'Content-Type': 'text/html; charset=utf-8'});
    if (route === '/admin/app.css') return reply(dashboardCSS, 200, {...assetHeaders, 'Content-Type': 'text/css; charset=utf-8'});
    if (route === '/admin/app.js') return reply(dashboardJS, 200, {...assetHeaders, 'Content-Type': 'text/javascript; charset=utf-8'});
    if (!['/api/summary', '/api/events', '/api/export.csv'].includes(route)) return reply('Not found', 404);
    if (!env.DB) return json({error: 'Database unavailable'}, 503);
    let dates;
    try { dates = range(url); } catch { return json({error: 'Choose valid UTC dates within the last 30 days.'}, 400); }
    const {start, end, from, to} = dates;
    const country = url.searchParams.get('country');
    if (country !== null && country !== '_unknown' && !/^[A-Z]{2}$/.test(country))
      return json({error: 'Invalid country filter'}, 400);
    const filter = country === null ? '' : ' AND country = ?';
    const args = country === null ? [start, end] : [start, end, country === '_unknown' ? '' : country];
    const where = 'occurred_at >= ? AND occurred_at < ?' + filter;
    try {
      if (route === '/api/summary') {
        // All queries in a D1 batch share a transaction, including the totals and rows.
        const results = await env.DB.batch([
          env.DB.prepare(`SELECT COUNT(*) AS views, COUNT(DISTINCT ip) AS unique_ips,
            COUNT(DISTINCT NULLIF(country, '')) AS countries FROM events WHERE ${where}`).bind(...args),
          env.DB.prepare('SELECT COALESCE(SUM(views), 0) AS views, MIN(first_at) AS first_at FROM lifetime_counts'),
          env.DB.prepare(`SELECT day, COUNT(*) AS views FROM events WHERE ${where} GROUP BY day ORDER BY day`).bind(...args),
          env.DB.prepare(`SELECT country, COUNT(*) AS views FROM events WHERE occurred_at >= ? AND occurred_at < ?
            GROUP BY country ORDER BY views DESC, country`).bind(start, end),
          env.DB.prepare(`SELECT path, COUNT(*) AS views FROM events WHERE ${where}
            GROUP BY path ORDER BY views DESC, path`).bind(...args),
        ]);
        return json({range: dates, country, totals: results[0].results[0], lifetime: results[1].results[0],
          daily: results[2].results, countries: results[3].results, pages: results[4].results});
      }
      if (route === '/api/export.csv') {
        const data = await env.DB.prepare(`SELECT occurred_at, path, ip, country, region, city FROM events
          WHERE ${where} ORDER BY occurred_at DESC, event_id DESC LIMIT 10001`).bind(...args).all();
        if (data.results.length > 10000) return json({error: 'Export exceeds 10,000 rows. Choose a shorter date range.'}, 413);
        const lines = [CSV_FIELDS.join(','), ...data.results.map(row => CSV_FIELDS.map(key =>
          csvCell(key === 'occurred_at' ? new Date(row[key]).toISOString() : row[key])).join(','))];
        return reply('\uFEFF' + lines.join('\r\n'), 200, {'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="visits-' + from + '-to-' + to + '.csv"'});
      }
      const cursor = url.searchParams.get('cursor');
      let beforeTime = end, beforeId = '';
      if (cursor) {
        const match = /^(\d{13}):([0-9a-f-]{36})$/i.exec(cursor);
        if (!match || Number(match[1]) < start || Number(match[1]) >= end) return json({error: 'Invalid cursor'}, 400);
        beforeTime = Number(match[1]); beforeId = match[2];
      }
      const data = await env.DB.prepare(`SELECT event_id, occurred_at, path, ip, country, region, city FROM events
        WHERE ${where} AND (occurred_at < ? OR (occurred_at = ? AND event_id < ?))
        ORDER BY occurred_at DESC, event_id DESC LIMIT 101`).bind(...args, beforeTime, beforeTime, beforeId).all();
      const rows = data.results.slice(0, 100);
      const last = rows.at(-1);
      return json({range: dates, rows, next: data.results.length > 100 ? last.occurred_at + ':' + last.event_id : null});
    } catch { return json({error: 'Statistics are temporarily unavailable. Please retry.'}, 503); }
  },
};
