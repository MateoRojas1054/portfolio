/**
 * testimonials.js
 * Renders the testimonials carousel and drives it with requestAnimationFrame
 * for a perfectly seamless infinite loop — no CSS animation jump.
 *
 * Strategy:
 *  1. Render N original cards.
 *  2. Clone them and append once → 2N cards total.
 *  3. Move the track left by `speed` px every frame.
 *  4. When offset reaches exactly the width of the first N cards,
 *     reset to 0 instantly — the view is identical, so no seam is visible.
 */

const TESTIMONIALS = [
  {
    q: "The certification system runs flawlessly in production. The automated deployment pipelines make updates incredibly smooth and reliable.",
    name: "Program Director",
    role: "Universidad de La Salle",
  },
  {
    q: "His implementation of clean architecture and PSR-4 autoloading in the platform makes the codebase highly maintainable.",
    name: "External Auditor",
    role: "Technical Reviewer",
  },
  {
    q: "Setting up GitHub Actions for the university server deployments was a game changer. It's a robust, well-structured solution.",
    name: "System Administrator",
    role: "IT Department",
  },
  {
    q: "Clean object-oriented design and easy to scale. The platform was built with backend best practices from day one.",
    name: "Senior Developer",
    role: "Universidad de La Salle",
  },
];

/** Scroll speed in pixels per frame (at ~60 fps ≈ 0.8 px/frame ≈ same as 32s CSS). */
const SPEED = 0.8;

/**
 * Builds a single testimonial card HTML string.
 * @param {Object} t - Testimonial data object.
 * @returns {string} HTML string for the card.
 */
function buildCard(t) {
  return `
    <div class="test-card">
      <p>"${t.q}"</p>
      <div class="test-who">
        <div class="avatar"></div>
        <div>
          <div class="name">${t.name}</div>
          <div class="role">${t.role}</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Measures the total rendered width of the first N children in the track,
 * including their margin-right (which replaces flexbox gap for clean math).
 *
 * @param {HTMLElement} track
 * @param {number}      count  - Number of original (non-cloned) cards.
 * @returns {number} Width in pixels of one full set.
 */
function measureSetWidth(track, count) {
  let total = 0;
  for (let i = 0; i < count; i++) {
    const el    = track.children[i];
    const style = getComputedStyle(el);
    total += el.offsetWidth + parseFloat(style.marginRight);
  }
  return total;
}

/** Initialises the testimonials carousel. */
export function initTestimonials() {
  const track     = document.getElementById('testTrack');
  const section   = track?.closest('.testimonials');
  if (!track || !section) return;

  // 1. Render original cards
  track.innerHTML = TESTIMONIALS.map(buildCard).join('');

  // 2. Clone and append every original card once
  const originals = [...track.children];
  originals.forEach(card => track.appendChild(card.cloneNode(true)));

  // 3. After layout, measure one full set and start the rAF loop
  let offset   = 0;
  let paused   = false;
  let setWidth = 0;
  let rafId    = null;

  function tick() {
    if (!paused) {
      offset += SPEED;
      // Seamless reset: position 0 and position setWidth look identical
      if (offset >= setWidth) offset -= setWidth;
      track.style.transform = `translateX(-${offset}px)`;
    }
    rafId = requestAnimationFrame(tick);
  }

  // Pause on hover (matching the original CSS behaviour)
  section.addEventListener('mouseenter', () => { paused = true; });
  section.addEventListener('mouseleave', () => { paused = false; });

  // Let the browser perform a full layout pass before measuring
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setWidth = measureSetWidth(track, TESTIMONIALS.length);
      tick();
    });
  });
}
