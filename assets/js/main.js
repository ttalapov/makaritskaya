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

// ─── STAT COUNTERS ───────────────────────────────────────────
// Counts up once, when the block comes into view - these numbers sit on the
// second screen, so animating them on load would finish before anyone looks.
// "10+" counts the 10 and keeps the +; "∞" has nothing to count and is left
// alone, so it just fades in with its card.
function initCounters() {
  const block = document.querySelector('.about-stats');
  if (!block) return;
  const nums = [...block.querySelectorAll('.stat-num')]
    .map((el) => ({ el, m: el.textContent.trim().match(/^(\d+)(.*)$/) }))
    .filter((x) => x.m);
  if (!nums.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  const DURATION = 1500;
  const run = ({ el, m }) => {
    const target = Number(m[1]);
    const suffix = m[2];
    const final = el.textContent;
    // a screen reader passing by mid-count should still hear the real number
    el.setAttribute('aria-hidden', 'true');
    const spoken = document.createElement('span');
    spoken.className = 'visually-hidden';
    spoken.textContent = final;
    el.after(spoken);

    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3);          // ease-out, no overshoot
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) return requestAnimationFrame(step);
      el.textContent = final;
      el.removeAttribute('aria-hidden');
      spoken.remove();
    };
    el.textContent = 0 + suffix;
    requestAnimationFrame(step);
  };

  // the whole block is watched, not each tile, so all four start together
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    observer.disconnect();
    nums.forEach(run);
  }, { threshold: 0.75 });
  observer.observe(block);
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
  initCounters();
  initBurger();
});
