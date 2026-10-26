export const DAY = 86400000;
export const RETENTION_DAYS = 30;
export const PATHS = new Set(['/', '/zh/', '/cv/', '/zh/cv/']);
export const headers = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
};
export function reply(body, status = 200, extra = {}) {
  return new Response(body, {status, headers: {...headers, ...extra}});
}
export function json(data, status = 200) {
  return reply(JSON.stringify(data), status, {'Content-Type': 'application/json; charset=utf-8'});
}
export function clean(value, max) {
  return typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, max) : '';
}
export async function purge(db, now = Date.now()) {
  // The query layer independently applies the same cutoff if a cron is delayed.
  return db.batch([
    db.prepare('DELETE FROM events WHERE occurred_at < ?').bind(now - RETENTION_DAYS * DAY),
    db.prepare('DELETE FROM daily_counts WHERE day <= ?').bind(new Date(now - 365 * DAY).toISOString().slice(0, 10)),
  ]);
}

export async function cleanupWithRetry(db, now=Date.now(), pause=ms=>new Promise(resolve=>setTimeout(resolve,ms))) {
  for(let attempt=0;attempt<3;attempt++) {
    try { return await purge(db,now); }
    catch { if(attempt===2)throw new Error('analytics_retention_cleanup_failed'); await pause(250*(attempt+1)); }
  }
}
