(() => {
  'use strict';
  const config = window.YL_ANALYTICS;
  const allowed = () => config?.enabled && navigator.globalPrivacyControl !== true
    && navigator.doNotTrack !== '1' && window.doNotTrack !== '1';
  if (!allowed() || location.origin !== 'https://sgyliu8.github.io') return;
  const routes = new Map([
    ['/', '/'], ['/index.html', '/'], ['/zh/', '/zh/'], ['/zh/index.html', '/zh/'],
    ['/cv/', '/cv/'], ['/cv/index.html', '/cv/'], ['/zh/cv/', '/zh/cv/'], ['/zh/cv/index.html', '/zh/cv/'],
  ]);
  const path = routes.get(location.pathname);
  if (!path || !crypto.randomUUID) return;
  let endpoint;
  try {
    endpoint = new URL(config.endpoint);
    if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password
      || endpoint.pathname !== '/collect' || endpoint.search || endpoint.hash
      || endpoint.hostname !== 'yang-portfolio-events.sgyliu.workers.dev') return;
  } catch { return; }
  let sent = false;
  async function deliver(body, attempt = 0) {
    if (!allowed()) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    let retry = false;
    try {
      const response = await fetch(endpoint.href, {
        method: 'POST', mode: 'cors', credentials: 'omit', cache: 'no-store',
        referrerPolicy: 'no-referrer', keepalive: true, signal: controller.signal,
        headers: {'Content-Type': 'text/plain;charset=UTF-8'}, body,
      });
      retry = [408, 500, 502, 503, 504].includes(response.status);
    } catch { retry = true; } finally { clearTimeout(timeout); }
    // At most two delayed retries, reusing the same UUID. No persistent queue.
    if (retry && attempt < 2) setTimeout(() => {
      if (document.visibilityState === 'visible') deliver(body, attempt + 1);
    }, 1000 * (attempt + 1));
  }
  function send() {
    if (sent || !allowed() || document.visibilityState !== 'visible' || document.prerendering) return;
    sent = true;
    document.removeEventListener('visibilitychange', send);
    document.removeEventListener('prerenderingchange', send);
    // Per-navigation nonce only; no cookies, storage, fingerprint, queries or referrer.
    deliver(JSON.stringify({event_id: crypto.randomUUID(), path}));
  }
  document.addEventListener('visibilitychange', send);
  document.addEventListener('prerenderingchange', send);
  send();
})();
