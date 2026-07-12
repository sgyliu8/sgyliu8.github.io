(() => {
  document.documentElement.classList.add('js');

  const body = document.body;
  const header = document.querySelector('[data-header]');
  const menu = document.querySelector('[data-menu]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const pageContent = document.querySelectorAll('main, footer');
  const openLabel = menuToggle?.dataset.openLabel || 'Open navigation';
  const closeLabel = menuToggle?.dataset.closeLabel || 'Close navigation';

  const closeMenu = ({ restoreFocus = false } = {}) => {
    if (!menu || !menuToggle) return;
    menu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.querySelector('.sr-only').textContent = openLabel;
    body.classList.remove('menu-open');
    header?.classList.remove('menu-active');
    pageContent.forEach((element) => element.removeAttribute('inert'));
    if (restoreFocus) menuToggle.focus();
  };

  if (menu && menuToggle) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMenu();
        return;
      }

      menu.classList.add('is-open');
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.querySelector('.sr-only').textContent = closeLabel;
      body.classList.add('menu-open');
      header?.classList.add('menu-active');
      pageContent.forEach((element) => element.setAttribute('inert', ''));
      window.setTimeout(() => menu.querySelector('a')?.focus(), 0);
    });

    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    header?.querySelector('.brand')?.addEventListener('click', closeMenu);

    document.addEventListener('keydown', (event) => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      if (!isOpen) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu({ restoreFocus: true });
        return;
      }

      if (event.key === 'Tab') {
        const focusable = [menuToggle, ...menu.querySelectorAll('a')];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    const desktopQuery = window.matchMedia('(min-width: 901px)');
    const handleDesktop = (event) => {
      if (event.matches) closeMenu();
    };
    if (desktopQuery.addEventListener) desktopQuery.addEventListener('change', handleDesktop);
    else desktopQuery.addListener(handleDesktop);
  }

  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 18);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  document.querySelectorAll('[data-year]').forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  document.querySelectorAll('[data-print]').forEach((button) => {
    button.addEventListener('click', () => window.print());
  });

  const homeSections = document.querySelectorAll('main section[id]');
  const sectionLinks = document.querySelectorAll('.primary-nav a[href^="#"]');

  if ('IntersectionObserver' in window && homeSections.length && sectionLinks.length) {
    const linkBySection = new Map(
      [...sectionLinks].map((link) => [link.getAttribute('href').slice(1), link])
    );

    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      sectionLinks.forEach((link) => link.removeAttribute('aria-current'));
      linkBySection.get(visible.target.id)?.setAttribute('aria-current', 'true');
    }, { rootMargin: '-25% 0px -60% 0px', threshold: [0.01, 0.2] });

    homeSections.forEach((section) => sectionObserver.observe(section));
  }
})();
