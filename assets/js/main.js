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

// ─── CONTACT FORM ────────────────────────────────────────────
// No endpoint is configured yet (contact.formAction is empty in content/*.json).
// Without this guard the form would POST to the current URL and the visitor
// would land on a GitHub Pages error page.
function initForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;
  if (!form.getAttribute('action')) {
    form.addEventListener('submit', (e) => e.preventDefault());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initBurger();
  initForm();
});
