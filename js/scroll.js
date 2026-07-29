/**
 * scroll.js
 * Two independent scroll-driven utilities:
 *
 *  • initScrollProgress — updates the fixed red progress bar at the top of the page.
 *  • initReveal         — uses IntersectionObserver to animate .reveal elements into view,
 *                         and assigns stagger indices to children of .stagger groups.
 */

/**
 * Wires the scroll progress bar to the page scroll position.
 * Expects an element with id="progress".
 */
export function initScrollProgress() {
  const progressBar = document.getElementById('progress');
  if (!progressBar) return;

  function onScroll() {
    const h = document.documentElement;
    const pct = h.scrollTop / (h.scrollHeight - h.clientHeight) * 100;
    progressBar.style.width = `${pct}%`;
  }

  document.addEventListener('scroll', onScroll, { passive: true });
}

/**
 * Observes every .reveal element and adds the "in" class when it enters the
 * viewport, triggering its CSS transition.
 * Also sets CSS custom property --i on each child of a .stagger group so the
 * stylesheet can apply staggered transition-delays.
 */
export function initReveal() {
  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('in');
    }),
    { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
  );

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Assign stagger index to children so CSS transition-delay works
  document.querySelectorAll('.stagger').forEach(group => {
    [...group.children].forEach((child, i) => child.style.setProperty('--i', i));
  });
}
