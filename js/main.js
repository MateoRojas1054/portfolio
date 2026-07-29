/**
 * main.js
 * Application entry point.
 *
 * Imports and initialises every feature module.
 * Keeping orchestration here means each module stays free of
 * cross-module coupling and is easy to enable/disable independently.
 */

import { initNav }           from './nav.js';
import { initScrollProgress, initReveal } from './scroll.js';
import { initPinStage }      from './pinStage.js';
import { initScrubText }     from './scrubText.js';
import { initTicker }        from './ticker.js';
import { initTestimonials }  from './testimonials.js';

// Boot all modules once the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollProgress();
  initReveal();
  initTicker();
  initPinStage();
  initScrubText();
  initTestimonials();
});
