/**
 * scrubText.js
 * Word-by-word highlight effect driven by the scroll position of #scrubSection.
 * Each word is wrapped in a <span> and toggled to class "lit" as the user scrolls.
 */

const PHRASE =
  "From idea to production. Clean, scalable software built to move fast, stay maintainable, " +
  "and perform in real-world use — driven by clean architecture, structured systems, and intentional design patterns.";

/** Initialises the scrub text effect. */
export function initScrubText() {
  const scrubText    = document.getElementById('scrubText');
  const scrubSection = document.getElementById('scrubSection');
  if (!scrubText || !scrubSection) return;

  // Split phrase into individually-animatable word spans
  scrubText.innerHTML = PHRASE
    .split(' ')
    .map(word => `<span>${word}</span>`)
    .join(' ');

  const words = scrubText.querySelectorAll('span');

  function update() {
    const rect  = scrubSection.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const p     = Math.min(Math.max(-rect.top / total, 0), 1);
    const litCount = Math.round(p * words.length);

    words.forEach((w, i) => w.classList.toggle('lit', i < litCount));
  }

  document.addEventListener('scroll', update, { passive: true });
  update(); // run once on init
}
