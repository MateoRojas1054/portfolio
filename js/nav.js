/**
 * nav.js
 * Controls the floating nav pill:
 *  • Toggle open/closed on the button click.
 *  • Close when a nav link is clicked.
 *  • Close when clicking outside the pill.
 *  • Close on Escape key press.
 *  • Custom slow smooth-scroll for all in-page anchor links.
 */

// ---------- Smooth scroll ----------

/** Cubic ease-in-out easing function. */
function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Scrolls the page to targetY over the given duration (ms) using
 * requestAnimationFrame and easeInOutCubic.
 * @param {number} targetY  - Absolute Y coordinate to scroll to.
 * @param {number} duration - Animation duration in milliseconds.
 */
function smoothScrollTo(targetY, duration) {
  const startY    = window.scrollY;
  const diff      = targetY - startY;
  const startTime = performance.now();

  function step(now) {
    const t = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, startY + diff * easeInOutCubic(t));
    if (t < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// ---------- Module ----------

/** Initialises all nav pill interactions and smooth-scroll behaviour. */
export function initNav() {
  const navPill   = document.getElementById('navPill');
  const navToggle = document.getElementById('navToggle');
  const navLinks  = [...document.querySelectorAll('.nav-menu a')];

  if (!navPill || !navToggle) return;

  // Assign stagger index so CSS transition-delays apply to menu items
  navLinks.forEach((a, i) => a.style.setProperty('--i', i));

  // Open / close the pill on toggle button click
  navToggle.addEventListener('click', e => {
    e.stopPropagation();
    navPill.classList.toggle('open');
  });

  // Close when a menu link is activated
  navLinks.forEach(a => a.addEventListener('click', () => navPill.classList.remove('open')));

  // Close when clicking outside the pill
  document.addEventListener('click', e => {
    if (!navPill.contains(e.target)) navPill.classList.remove('open');
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') navPill.classList.remove('open');
  });

  // Slow smooth scroll for all in-page anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id     = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const targetY = target.getBoundingClientRect().top + window.scrollY;
      smoothScrollTo(targetY, 1800);
    });
  });
}
