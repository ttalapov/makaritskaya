// Pages are built per language at /ua/ and /ru/, so there is no runtime i18n:
// the language switcher is a plain set of links and the browser does the rest.

// ─── SCROLL REVEAL ───────────────────────────────────────────
// .reveal only hides anything under html.js (set inline in <head>), so this
// is pure enhancement: whatever goes wrong here, the content stays visible.
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  // Respect the OS setting, and old browsers: show everything at once.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach((el) => observer.observe(el));
}

// ─── BURGER MENU ─────────────────────────────────────────────
// The open menu covers the whole viewport, so it behaves like a dialog:
// focus moves into it, everything behind it is inert (unreachable by Tab and
// hidden from screen readers), and closing hands focus back to the burger.
function initBurger() {
  const burger = document.querySelector('button.burger');
  const menu = document.getElementById('mobileMenu');
  if (!burger || !menu) return;
  const close = menu.querySelector('button.mobile-close');
  const behind = [...document.body.children].filter((el) => el !== menu && el.tagName !== 'SCRIPT');

  const isOpen = () => burger.classList.contains('open');
  const setOpen = (open, { returnFocus = false } = {}) => {
    burger.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    behind.forEach((el) => { el.inert = open; });
    if (open && close) close.focus();
    if (!open && returnFocus) burger.focus();
  };

  burger.addEventListener('click', () => setOpen(!isOpen()));
  // a link inside navigates away, so focus follows the link, not the burger
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  if (close) close.addEventListener('click', () => setOpen(false, { returnFocus: true }));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) setOpen(false, { returnFocus: true });
  });
  // rotating a tablet past the breakpoint hides the menu; don't leave the page inert
  window.matchMedia('(min-width: 941px)').addEventListener('change', (e) => {
    if (e.matches && isOpen()) setOpen(false);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initBurger();
});
