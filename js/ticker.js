/**
 * ticker.js
 * Dynamically fills the hero ticker strip so it never runs short on any
 * viewport width. Rebuilds on window resize.
 */

/**
 * Populates the ticker track with enough <span> elements to fill the viewport,
 * then duplicates the set once so a CSS translateX(-50%) creates a seamless loop.
 */
function buildTicker() {
  const tickerTrack = document.getElementById('tickerTrack');
  if (!tickerTrack) return;

  // Pause the animation while we rebuild
  tickerTrack.style.animation = 'none';
  tickerTrack.innerHTML = '';

  // Add spans until a single set spans the full viewport width
  let safety = 0;
  while (tickerTrack.scrollWidth < window.innerWidth && safety < 80) {
    tickerTrack.appendChild(document.createElement('span'));
    safety++;
  }

  // Duplicate the set so translateX(-50%) loops with no visible gap
  tickerTrack.innerHTML += tickerTrack.innerHTML;

  // Force a reflow before re-enabling the animation
  void tickerTrack.offsetWidth;
  tickerTrack.style.animation = '';
}

/** Initialises the ticker and sets up a resize listener. */
export function initTicker() {
  buildTicker();
  window.addEventListener('resize', buildTicker);
}
