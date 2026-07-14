(() => {
  document.documentElement.classList.add('js');

  const body = document.body;
  const header = document.querySelector('[data-header]');
  const menu = document.querySelector('[data-menu]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const brand = header?.querySelector('.brand');
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
    if (restoreFocus) menuToggle.focus({ preventScroll: true });
  };

  const focusSectionHeading = (hash) => {
    if (!hash) return;
    const target = document.querySelector(hash);
    const heading = target?.querySelector('h1, h2');
    if (!heading) return;
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
    heading.addEventListener('blur', () => heading.removeAttribute('tabindex'), { once: true });
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

    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      const wasOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      const target = new URL(link.href, window.location.href);
      const isSamePageAnchor = target.origin === window.location.origin
        && target.pathname === window.location.pathname
        && target.hash;
      closeMenu();
      if (wasOpen && isSamePageAnchor) {
        window.requestAnimationFrame(() => focusSectionHeading(target.hash));
      }
    }));
    brand?.addEventListener('click', closeMenu);

    document.addEventListener('keydown', (event) => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      if (!isOpen) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu({ restoreFocus: true });
        return;
      }

      if (event.key === 'Tab') {
        const focusable = [brand, menuToggle, ...menu.querySelectorAll('a')].filter(Boolean);
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

    const desktopQuery = window.matchMedia('(min-width: 1021px)');
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
  const languageSwitch = document.querySelector('.language-switch');
  const languageBase = languageSwitch?.getAttribute('href').split('#')[0];

  if ('IntersectionObserver' in window && homeSections.length && sectionLinks.length) {
    const linkBySection = new Map(
      [...sectionLinks].map((link) => [link.getAttribute('href').slice(1), link])
    );

    const visibility = new Map();
    const setActiveSection = (sectionId) => {
      sectionLinks.forEach((link) => link.removeAttribute('aria-current'));
      linkBySection.get(sectionId)?.setAttribute('aria-current', 'location');
      if (languageSwitch && languageBase) {
        languageSwitch.setAttribute('href', `${languageBase}#${sectionId}`);
      }
    };

    sectionLinks.forEach((link) => link.addEventListener('click', () => {
      setActiveSection(link.getAttribute('href').slice(1));
    }));

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => visibility.set(entry.target.id, entry));
      const visible = [...visibility.values()]
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;
      setActiveSection(visible.target.id);
    }, { rootMargin: '-25% 0px -60% 0px', threshold: [0.01, 0.2] });

    homeSections.forEach((section) => sectionObserver.observe(section));
  }
})();
