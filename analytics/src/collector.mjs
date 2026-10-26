import { isIP } from 'node:net';
import { DAY, PATHS, clean, purge, reply } from './common.mjs';

const ORIGIN = 'https://sgyliu8.github.io';
const MAX_BYTES = 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const BOT = /bot\b|spider|crawler|headless|lighthouse|pagespeed|preview|facebookexternalhit|curl\/|wget\//i;
const cors = {'Access-Control-Allow-Origin': ORIGIN, Vary: 'Origin'};

async function readBody(request) {
  if (Number(request.headers.get('content-length')) > MAX_BYTES) throw new Error('size');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('body');
  const chunks = [];
  let size = 0;
  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BYTES) { await reader.cancel(); throw new Error('size'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder('utf-8', {fatal: true}).decode(bytes));
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/collect' || url.search) return reply('Not found', 404);
    if (request.headers.get('origin') !== ORIGIN) return reply('Forbidden', 403);
    if (request.method === 'OPTIONS') {
      if (request.headers.get('access-control-request-method') !== 'POST') return reply('Forbidden', 403);
      return reply(null, 204, {...cors, 'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600'});
    }
    if (request.method !== 'POST') return reply('Method not allowed', 405, {...cors, Allow: 'POST, OPTIONS'});
    if (env.COLLECTION_ENABLED !== 'true' || !env.DB || !env.RATE_LIMITER) return reply('Unavailable', 503, cors);
    if (request.headers.get('sec-gpc') === '1' || request.headers.get('dnt') === '1') return reply(null, 204, cors);
    // Cloudflare supplies this address at the edge. Never trust X-Forwarded-For or the body.
    const ip = request.headers.get('cf-connecting-ip') || '';
    if (!request.cf || !isIP(ip) || request.headers.has('cf-worker')) return reply('Forbidden', 403, cors);
    if (request.cf.botManagement?.verifiedBot || BOT.test(request.headers.get('user-agent') || '')) {
      return reply(null, 204, cors);
    }
    const excluded = (env.EXCLUDED_IPS || '').split(',').map(value => value.trim());
    if (excluded.includes(ip)) return reply(null, 204, cors);
    try {
      const limit = await env.RATE_LIMITER.limit({key: ip});
      if (!limit.success) return reply('Rate limited', 429, {...cors, 'Retry-After': '60'});
      const type = (request.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
      if (!['application/json', 'text/plain'].includes(type)) return reply('Unsupported media type', 415, cors);
      let body;
      try { body = await readBody(request); } catch { return reply('Invalid request', 400, cors); }
      if (!body || Object.keys(body).some(key => !['event_id', 'path'].includes(key))
        || !UUID.test(body.event_id || '') || !PATHS.has(body.path)) return reply('Invalid event', 400, cors);
      const now = Date.now();
      const day = new Date(now).toISOString().slice(0, 10);
      const country = /^[A-Z]{2}$/.test(request.cf.country || '') ? request.cf.country : '';
      // INSERT OR IGNORE + trigger is atomic: network replays never increment counters twice.
      // The global daily cap bounds database growth. It is a safeguard, not proof of human traffic.
      await env.DB.prepare(`INSERT OR IGNORE INTO events
        (event_id, occurred_at, day, path, ip, country, region, city)
        SELECT ?, ?, ?, ?, ?, ?, ?, ?
        WHERE (SELECT COALESCE(SUM(views), 0) FROM daily_counts WHERE day = ?) < 20000`)
        .bind(body.event_id, now, day, body.path, ip, country,
          clean(request.cf.region, 100), clean(request.cf.city, 100), day).run();
      return reply(null, 204, cors);
    } catch {
      // No IP, request body or exception text is written to Worker logs.
      return reply('Unavailable', 503, cors);
    }
  },
  async scheduled(_event, env) { await purge(env.DB); },
};
