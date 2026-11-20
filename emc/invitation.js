(() => {
  const invitation = location.hash.slice(1);
  if (location.hash) history.replaceState(null, '', location.pathname);

  document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('invitation');
    const input = document.getElementById('session-code');
    const status = document.getElementById('session-status');
    const closed = () => {
      form.hidden = true;
      input.value = '';
      status.textContent = 'The demo session is offline. Ask your host for the next invitation.';
    };
    try {
      const response = await fetch('/emc/session.json', {cache: 'no-store', credentials: 'omit'});
      if (!response.ok) throw new Error('session unavailable');
      const {slugSha256, expiresAt} = await response.json();
      const expires = Date.parse(expiresAt);
      if (!/^[a-f0-9]{64}$/.test(slugSha256) || !Number.isFinite(expires) || expires <= Date.now()) return closed();
      const openSession = async slug => {
        if (expires <= Date.now()) return closed();
        if (/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(slug)) {
          const bytes = new TextEncoder().encode(slug);
          const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
          const hex = Array.from(hash, byte => byte.toString(16).padStart(2, '0')).join('');
          if (expires <= Date.now()) return closed();
          if (hex === slugSha256) {
            location.replace(`https://${slug}.trycloudflare.com/admin/login`);
            return;
          }
        }
        status.textContent = 'This locator does not match the current session. Check your invitation.';
      };
      form.addEventListener('submit', event => {
        event.preventDefault();
        openSession(input.value).catch(closed);
      });
      form.hidden = false;
      status.textContent = `Session closes ${new Intl.DateTimeFormat('en-GB', {dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/London'}).format(expires)} UK time.`;
      setTimeout(closed, expires - Date.now());
      if (invitation) await openSession(invitation);
    } catch {
      closed();
    }
  });
})();
