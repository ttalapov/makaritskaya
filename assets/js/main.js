// Pages are built per language at /ua/ and /ru/, so there is no runtime i18n:
// the language switcher is a plain set of links and the browser does the rest.

// ─── SCROLL REVEAL ───────────────────────────────────────────
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  // Respect the OS setting: show everything at once rather than animate.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
function initBurger() {
  const burger = document.querySelector('.burger');
  const menu = document.getElementById('mobileMenu');
  if (!burger || !menu) return;

  const setOpen = (open) => {
    burger.classList.toggle('open', open);
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };

  burger.addEventListener('click', () => setOpen(!burger.classList.contains('open')));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burger.classList.contains('open')) {
      setOpen(false);
      burger.focus();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initBurger();
});
