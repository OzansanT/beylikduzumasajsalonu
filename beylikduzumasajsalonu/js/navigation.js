
'use strict';

const MOBILE_MENU_QUERY = '(max-width: 850px)';
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

document.querySelectorAll('.nav-menu').forEach((menu) => {
  const toggle = menu.querySelector('.menu-toggle');
  const backdrop = menu.querySelector('.menu-backdrop');
  const navigation = menu.querySelector('.site-nav');
  const links = menu.querySelectorAll('.site-nav a');
  const media = window.matchMedia(MOBILE_MENU_QUERY);
  const background = [
    document.querySelector('.skip-link'),
    menu.parentElement?.querySelector('.brand'),
    document.querySelector('main'),
    document.querySelector('footer'),
  ].filter(Boolean);
  const inertSupported = 'inert' in HTMLElement.prototype;
  let restoreFocus = false;

  const setBackgroundState = (inactive) => {
    background.forEach((element) => {
      if (inertSupported) element.inert = inactive;
      if (inactive) {
        element.dataset.menuAriaHidden = element.getAttribute('aria-hidden') || '';
        element.setAttribute('aria-hidden', 'true');
      } else {
        const previous = element.dataset.menuAriaHidden;
        if (previous) element.setAttribute('aria-hidden', previous);
        else element.removeAttribute('aria-hidden');
        delete element.dataset.menuAriaHidden;
      }
    });
  };

  const focusableItems = () => [...menu.querySelectorAll(FOCUSABLE_SELECTOR)].filter((element) => {
    return !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true' && element.getClientRects().length > 0;
  });

  const setOpen = (open, returnFocus = false) => {
    const shouldOpen = Boolean(open && media.matches);
    menu.classList.toggle('is-open', shouldOpen);
    toggle?.setAttribute('aria-expanded', String(shouldOpen));
    document.documentElement.classList.toggle('menu-is-open', shouldOpen);
    setBackgroundState(shouldOpen);
    restoreFocus = returnFocus;

    if (shouldOpen) {
      requestAnimationFrame(() => navigation?.querySelector('a, summary')?.focus());
    } else if (restoreFocus) {
      toggle?.focus();
      restoreFocus = false;
    }
  };

  toggle?.addEventListener('click', () => {
    setOpen(!menu.classList.contains('is-open'), true);
  });

  backdrop?.addEventListener('click', () => setOpen(false, true));
  links.forEach((link) => link.addEventListener('click', () => setOpen(false, false)));

  document.addEventListener('keydown', (event) => {
    if (!menu.classList.contains('is-open')) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false, true);
      return;
    }

    if (event.key !== 'Tab') return;
    const items = focusableItems();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const resetForViewport = () => {
    if (!media.matches) setOpen(false, false);
  };

  media.addEventListener?.('change', resetForViewport);
  resetForViewport();
});
