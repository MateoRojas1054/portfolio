/**
 * boot.js
 * Sober systemd-style boot sequence for KrassnyOS.
 * Respects prefers-reduced-motion and supports instant skip via key or click.
 */

import { BOOT_LINES } from './data.js';

export function createBootController({ container, logEl, onComplete }) {
  let timers = [];
  let finished = false;

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clearTimers() {
    timers.forEach((id) => window.clearTimeout(id));
    timers = [];
  }

  function finish() {
    if (finished) return;
    finished = true;
    clearTimers();
    detachListeners();
    onComplete();
  }

  function handleKeyDown(event) {
    if (finished || container.hidden) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      finish();
    }
  }

  function attachListeners() {
    window.addEventListener('keydown', handleKeyDown);
  }

  function detachListeners() {
    window.removeEventListener('keydown', handleKeyDown);
  }

  function appendLine(text, isFinalPrompt = false) {
    const li = document.createElement('li');
    li.className = isFinalPrompt ? 'boot-line boot-line-ready' : 'boot-line';

    const bracket = document.createElement('span');
    bracket.className = 'boot-status';
    bracket.textContent = '[  OK  ]';

    const msg = document.createElement('span');
    msg.className = 'boot-msg';
    msg.textContent = text;

    li.append(bracket, ' ', msg);
    logEl.append(li);
    container.scrollTop = container.scrollHeight;
  }

  function start() {
    finished = false;
    clearTimers();
    logEl.replaceChildren();

    if (prefersReducedMotion()) {
      finish();
      return;
    }

    attachListeners();

    const stepMs = 175;
    BOOT_LINES.forEach((line, idx) => {
      const id = window.setTimeout(() => {
        if (!finished) appendLine(line);
      }, idx * stepMs);
      timers.push(id);
    });

    const readyId = window.setTimeout(() => {
      if (finished) return;
      appendLine('Please press ENTER/RETURN to continue', true);
    }, BOOT_LINES.length * stepMs + 160);
    timers.push(readyId);
  }

  function stop() {
    finished = true;
    clearTimers();
    detachListeners();
  }

  return { start, stop };
}
