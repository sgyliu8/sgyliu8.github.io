(() => {
  'use strict';
  const config = window.YL_ANALYTICS;
  if (!config?.enabled || location.origin !== 'https://sgyliu8.github.io'
    || navigator.globalPrivacyControl === true || navigator.doNotTrack === '1'
    || window.doNotTrack === '1') return;
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
  function send() {
    if (sent || document.visibilityState !== 'visible' || document.prerendering) return;
    sent = true;
    document.removeEventListener('visibilitychange', send);
    document.removeEventListener('prerenderingchange', send);
    // Per-navigation nonce only; no cookies, localStorage, fingerprint or persistent visitor ID.
    // Only an allowlisted pathname is sent: never a query string, fragment or referrer.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    fetch(endpoint.href, {
      method: 'POST', mode: 'cors', credentials: 'omit', cache: 'no-store',
      referrerPolicy: 'no-referrer', keepalive: true, signal: controller.signal,
      headers: {'Content-Type': 'text/plain;charset=UTF-8'},
      body: JSON.stringify({event_id: crypto.randomUUID(), path}),
    }).catch(() => {}).finally(() => clearTimeout(timeout));
  }
  document.addEventListener('visibilitychange', send);
  document.addEventListener('prerenderingchange', send);
  send();
})();
