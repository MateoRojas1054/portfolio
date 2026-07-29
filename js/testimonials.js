/**
 * testimonials.js
 * Renders the testimonials carousel by populating the #testTrack element.
 * Data is duplicated so the CSS marquee animation loops seamlessly.
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
 * Initialises the testimonials carousel.
 * Duplicates the items once so the CSS -50% translate loops without a gap.
 */
export function initTestimonials() {
  const track = document.getElementById('testTrack');
  if (!track) return;

  // Duplicate the list once for a seamless infinite scroll
  const all = [...TESTIMONIALS, ...TESTIMONIALS];
  track.innerHTML = all.map(buildCard).join('');
}
