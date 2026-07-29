/**
 * pinStage.js
 * Scroll-driven morph animation: the small hero photo box grows and centres
 * itself while the headline fades out and the bio copy fades in.
 *
 * Relies purely on the native scroll event (no GSAP / ScrollTrigger).
 */

// ---------- Math helpers ----------

/** Clamps a value to [0, 1]. */
function clamp01(t) {
  return Math.min(Math.max(t, 0), 1);
}

/** Linear interpolation between a and b by factor t. */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Smooth Hermite interpolation (Ken Perlin's smoothstep).
 * Returns 0 when x <= e0, 1 when x >= e1.
 */
function smoothstep(e0, e1, x) {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}

// ---------- Layout constants ----------

/** Starting box dimensions and distance from the viewport bottom. */
const START = { w: 210, h: 280, bottomGap: 150 };

/** Ending box dimensions (centred in viewport). */
const END = { w: 400, h: 460 };

// ---------- Module ----------

/**
 * Initialises the pin-stage scroll animation.
 * Wires scroll + resize listeners and runs one initial update.
 */
export function initPinStage() {
  const pinStage  = document.getElementById('pinStage');
  const headline  = document.getElementById('pinHeadline');
  const photoBox  = document.getElementById('photoBox');
  const photoBack = document.getElementById('photoBack');
  const photoFront = document.getElementById('photoFront');
  const ticker    = document.getElementById('pinTicker');
  const cornerL   = document.getElementById('pinCornerL');
  const cornerR   = document.getElementById('pinCornerR');
  const bioCopy   = document.getElementById('bioCopy');

  if (!pinStage) return;

  function update() {
    const rect       = pinStage.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    const p          = clamp01(-rect.top / scrollable);
    const vh         = window.innerHeight;

    // Size & position morph — finishes by ~70 % of the pin scroll
    const grow = smoothstep(0, 0.7, p);

    const w   = lerp(START.w, END.w, grow);
    const hgt = lerp(START.h, END.h, grow);
    const topStart = vh - START.h - START.bottomGap;
    const topEnd   = vh / 2 - END.h / 2;
    const top = lerp(topStart, topEnd, grow);

    photoBox.style.width     = `${w}px`;
    photoBox.style.height    = `${hgt}px`;
    photoBox.style.top       = `${top}px`;
    photoBox.style.transform = 'translateX(-50%)';

    // Crossfade dark back-layer → red front-layer
    const fade = smoothstep(0.35, 0.68, p);
    photoBack.style.opacity  = 1 - fade;
    photoFront.style.opacity = fade;

    // Headline fades + slides up early
    const headOut = smoothstep(0, 0.32, p);
    headline.style.opacity   = 1 - headOut;
    headline.style.transform = `translate(-50%, ${lerp(0, -40, headOut)}px)`;

    // Ticker and corner labels disappear quickly
    const chromeOut = 1 - smoothstep(0, 0.16, p);
    ticker.style.opacity  = chromeOut;
    cornerL.style.opacity = chromeOut;
    cornerR.style.opacity = chromeOut;

    // Bio copy slides in once the photo is mostly grown
    const bioIn = smoothstep(0.55, 0.88, p);
    bioCopy.style.opacity      = bioIn;
    bioCopy.style.transform    = `translateY(${lerp(24, 0, bioIn)}px)`;
    bioCopy.style.pointerEvents = bioIn > 0.5 ? 'auto' : 'none';
  }

  document.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}
