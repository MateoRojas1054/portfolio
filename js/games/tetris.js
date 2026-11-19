/**
 * games/tetris.js
 * Pure vanilla Canvas Tetris styled in Omarchy Batman (0px geometry, Base24 palette).
 * Supports 7-bag randomizer, ghost piece, wall kicks, localStorage high score,
 * keyboard + mobile controls, auto-pause on workspace switch, and clean teardown.
 */

const COLS = 10;
const ROWS = 20;
const BLOCK = 24;
const PREVIEW_BLOCK = 18;
const BEST_KEY = 'krassnyos_tetris_best_v1';

const PIECES = {
  I: { color: '#5fa8a3', matrix: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]] },
  O: { color: '#feed6c', matrix: [[1, 1], [1, 1]] },
  T: { color: '#dadad5', matrix: [[0, 1, 0], [1, 1, 1], [0, 0, 0]] },
  S: { color: '#98b86c', matrix: [[0, 1, 1], [1, 1, 0], [0, 0, 0]] },
  Z: { color: '#e05f65', matrix: [[1, 1, 0], [0, 1, 1], [0, 0, 0]] },
  J: { color: '#649ecb', matrix: [[1, 0, 0], [1, 1, 1], [0, 0, 0]] },
  L: { color: '#f0a830', matrix: [[0, 0, 1], [1, 1, 1], [0, 0, 0]] },
};

const PIECE_KEYS = Object.keys(PIECES);
const LINE_POINTS = [0, 100, 300, 500, 800];

function cloneMatrix(m) {
  return m.map((row) => row.slice());
}

function rotateCW(matrix) {
  const n = matrix.length;
  const out = Array.from({ length: n }, () => Array(n).fill(0));
  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < n; x += 1) {
      out[x][n - 1 - y] = matrix[y][x];
    }
  }
  return out;
}

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function shuffledBag() {
  const bag = PIECE_KEYS.slice();
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function mountTetris(container, { isWindowActive }) {
  const wrap = el('div', 'tetris-wrap');

  const boardCol = el('div', 'tetris-board-col');
  const canvas = document.createElement('canvas');
  canvas.className = 'tetris-canvas';
  canvas.width = COLS * BLOCK;
  canvas.height = ROWS * BLOCK;
  canvas.setAttribute('aria-label', 'Tetris game board');
  canvas.tabIndex = 0;

  const overlay = el('div', 'tetris-overlay');
  overlay.hidden = true;
  boardCol.append(canvas, overlay);

  const side = el('aside', 'tetris-side');

  const nextBox = el('div', 'tetris-panel');
  nextBox.append(el('span', 'tetris-label', 'NEXT'));
  const nextCanvas = document.createElement('canvas');
  nextCanvas.className = 'tetris-next-canvas';
  nextCanvas.width = 4 * PREVIEW_BLOCK;
  nextCanvas.height = 4 * PREVIEW_BLOCK;
  nextBox.append(nextCanvas);

  const statsBox = el('dl', 'tetris-stats');
  const scoreVal = el('dd', 'tetris-val', '0');
  const bestVal = el('dd', 'tetris-val', String(Number(localStorage.getItem(BEST_KEY) || 0)));
  const linesVal = el('dd', 'tetris-val', '0');
  const levelVal = el('dd', 'tetris-val', '1');

  [
    ['SCORE', scoreVal],
    ['BEST', bestVal],
    ['LINES', linesVal],
    ['LEVEL', levelVal],
  ].forEach(([k, valEl]) => {
    const row = el('div', 'tetris-stat-row');
    row.append(el('dt', 'tetris-label', k), valEl);
    statsBox.append(row);
  });

  const btnRow = el('div', 'tetris-actions');
  const pauseBtn = el('button', 'btn tetris-btn', 'Pause [P]');
  pauseBtn.type = 'button';
  const resetBtn = el('button', 'btn tetris-btn', 'Restart [R]');
  resetBtn.type = 'button';
  btnRow.append(pauseBtn, resetBtn);

  const controlsHint = el('div', 'tetris-controls');
  controlsHint.innerHTML =
    '<div><strong>← / →</strong> Move</div>' +
    '<div><strong>↑ / W</strong> Rotate</div>' +
    '<div><strong>↓</strong> Soft Drop</div>' +
    '<div><strong>Space</strong> Hard Drop</div>';

  side.append(nextBox, statsBox, btnRow, controlsHint);

  // Touch controls for mobile / pointer users
  const pad = el('div', 'tetris-pad');
  const padDefs = [
    ['←', 'Move left', () => move(-1)],
    ['↻', 'Rotate', () => rotate()],
    ['↓', 'Soft drop', () => softDrop()],
    ['→', 'Move right', () => move(1)],
    ['⤓', 'Hard drop', () => hardDrop()],
  ];
  padDefs.forEach(([label, aria, fn]) => {
    const b = el('button', 'btn tetris-pad-btn', label);
    b.type = 'button';
    b.setAttribute('aria-label', aria);
    b.addEventListener('click', () => {
      if (!paused && !gameOver) fn();
    });
    pad.append(b);
  });

  wrap.append(boardCol, side, pad);
  container.append(wrap);

  const ctx = canvas.getContext('2d');
  const nextCtx = nextCanvas.getContext('2d');

  let board = createEmptyBoard();
  let bag = shuffledBag();
  let current = null;
  let nextType = null;
  let score = 0;
  let best = Number(localStorage.getItem(BEST_KEY) || 0);
  let lines = 0;
  let level = 1;
  let paused = false;
  let gameOver = false;
  let dropAccumulator = 0;
  let lastTime = 0;
  let rafId = null;
  let destroyed = false;

  function pullFromBag() {
    if (bag.length === 0) bag = shuffledBag();
    return bag.pop();
  }

  function dropIntervalMs() {
    return Math.max(95, 760 - (level - 1) * 65);
  }

  function collides(matrix, px, py) {
    for (let y = 0; y < matrix.length; y += 1) {
      for (let x = 0; x < matrix[y].length; x += 1) {
        if (!matrix[y][x]) continue;
        const bx = px + x;
        const by = py + y;
        if (bx < 0 || bx >= COLS || by >= ROWS) return true;
        if (by >= 0 && board[by][bx]) return true;
      }
    }
    return false;
  }

  function spawnPiece() {
    const type = nextType || pullFromBag();
    nextType = pullFromBag();
    const def = PIECES[type];
    const matrix = cloneMatrix(def.matrix);
    const x = Math.floor((COLS - matrix[0].length) / 2);
    const y = type === 'I' ? -1 : 0;

    current = { type, color: def.color, matrix, x, y };
    if (collides(current.matrix, current.x, current.y)) {
      gameOver = true;
      showOverlay('GAME OVER', 'Press R or Restart to play again');
    }
    drawNext();
  }

  function updateHud() {
    scoreVal.textContent = String(score);
    linesVal.textContent = String(lines);
    levelVal.textContent = String(level);
    if (score > best) {
      best = score;
      bestVal.textContent = String(best);
      try {
        localStorage.setItem(BEST_KEY, String(best));
      } catch {
        // Ignore storage errors in private browsing
      }
    }
    pauseBtn.textContent = paused ? 'Resume [P]' : 'Pause [P]';
  }

  function showOverlay(title, sub) {
    overlay.replaceChildren(
      el('div', 'tetris-overlay-title', title),
      el('div', 'tetris-overlay-sub', sub)
    );
    overlay.hidden = false;
  }

  function hideOverlay() {
    overlay.hidden = true;
  }

  function lockPiece() {
    current.matrix.forEach((row, y) => {
      row.forEach((val, x) => {
        if (!val) return;
        const by = current.y + y;
        if (by >= 0 && by < ROWS) {
          board[by][current.x + x] = current.color;
        }
      });
    });

    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y -= 1) {
      if (board[y].every(Boolean)) {
        board.splice(y, 1);
        board.unshift(Array(COLS).fill(null));
        cleared += 1;
        y += 1;
      }
    }

    if (cleared > 0) {
      lines += cleared;
      score += (LINE_POINTS[cleared] || 800) * level;
      level = Math.floor(lines / 10) + 1;
    }

    updateHud();
    spawnPiece();
  }

  function move(dx) {
    if (!collides(current.matrix, current.x + dx, current.y)) {
      current.x += dx;
      draw();
    }
  }

  function rotate() {
    const rotated = rotateCW(current.matrix);
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      if (!collides(rotated, current.x + kick, current.y)) {
        current.matrix = rotated;
        current.x += kick;
        draw();
        return;
      }
    }
  }

  function softDrop() {
    if (!collides(current.matrix, current.x, current.y + 1)) {
      current.y += 1;
      score += 1;
      dropAccumulator = 0;
      updateHud();
      draw();
    } else {
      lockPiece();
      draw();
    }
  }

  function hardDrop() {
    let dist = 0;
    while (!collides(current.matrix, current.x, current.y + 1)) {
      current.y += 1;
      dist += 1;
    }
    score += dist * 2;
    dropAccumulator = 0;
    lockPiece();
    draw();
  }

  function ghostY() {
    let gy = current.y;
    while (!collides(current.matrix, current.x, gy + 1)) {
      gy += 1;
    }
    return gy;
  }

  function drawCell(context, x, y, size, color, ghost = false) {
    const px = x * size;
    const py = y * size;
    if (ghost) {
      context.strokeStyle = color;
      context.globalAlpha = 0.38;
      context.lineWidth = 1.5;
      context.strokeRect(px + 2, py + 2, size - 4, size - 4);
      context.globalAlpha = 1;
      return;
    }
    context.fillStyle = color;
    context.fillRect(px + 1, py + 1, size - 2, size - 2);
    context.strokeStyle = '#0f0e11';
    context.lineWidth = 1;
    context.strokeRect(px + 1, py + 1, size - 2, size - 2);
  }

  function drawNext() {
    nextCtx.fillStyle = '#0f0e11';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    if (!nextType) return;
    const def = PIECES[nextType];
    const m = def.matrix;
    const ox = (4 - m[0].length) / 2;
    const oy = (4 - m.length) / 2;
    m.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val) drawCell(nextCtx, ox + x, oy + y, PREVIEW_BLOCK, def.color);
      });
    });
  }

  function draw() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid lines
    ctx.strokeStyle = '#1b1d1e';
    ctx.lineWidth = 1;
    for (let x = 1; x < COLS; x += 1) {
      ctx.beginPath();
      ctx.moveTo(x * BLOCK + 0.5, 0);
      ctx.lineTo(x * BLOCK + 0.5, canvas.height);
      ctx.stroke();
    }
    for (let y = 1; y < ROWS; y += 1) {
      ctx.beginPath();
      ctx.moveTo(0, y * BLOCK + 0.5);
      ctx.lineTo(canvas.width, y * BLOCK + 0.5);
      ctx.stroke();
    }

    // Locked blocks
    board.forEach((row, y) => {
      row.forEach((color, x) => {
        if (color) drawCell(ctx, x, y, BLOCK, color);
      });
    });

    if (!current) return;

    // Ghost landing preview
    const gy = ghostY();
    current.matrix.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val && gy + y >= 0) drawCell(ctx, current.x + x, gy + y, BLOCK, current.color, true);
      });
    });

    // Active piece
    current.matrix.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val && current.y + y >= 0) drawCell(ctx, current.x + x, current.y + y, BLOCK, current.color);
      });
    });
  }

  function setPaused(nextState) {
    if (gameOver) return;
    paused = Boolean(nextState);
    if (paused) {
      showOverlay('PAUSED', 'Press P or Resume to continue');
    } else {
      hideOverlay();
      lastTime = performance.now();
    }
    updateHud();
  }

  function resetGame() {
    board = createEmptyBoard();
    bag = shuffledBag();
    nextType = null;
    score = 0;
    lines = 0;
    level = 1;
    paused = false;
    gameOver = false;
    dropAccumulator = 0;
    lastTime = performance.now();
    hideOverlay();
    spawnPiece();
    updateHud();
    draw();
  }

  function tick(now) {
    if (destroyed) return;
    const dt = Math.min(now - lastTime, 120);
    lastTime = now;

    if (!paused && !gameOver && isWindowActive()) {
      dropAccumulator += dt;
      if (dropAccumulator >= dropIntervalMs()) {
        dropAccumulator = 0;
        if (!collides(current.matrix, current.x, current.y + 1)) {
          current.y += 1;
        } else {
          lockPiece();
        }
        draw();
      }
    }

    rafId = window.requestAnimationFrame(tick);
  }

  function handleKeydown(event) {
    if (destroyed || !isWindowActive()) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    const k = event.key;
    if (k === 'p' || k === 'P') {
      event.preventDefault();
      setPaused(!paused);
      return;
    }
    if (k === 'r' || k === 'R') {
      event.preventDefault();
      resetGame();
      return;
    }
    if (paused || gameOver) return;

    if (k === 'ArrowLeft' || k === 'a' || k === 'A') {
      event.preventDefault();
      move(-1);
    } else if (k === 'ArrowRight' || k === 'd' || k === 'D') {
      event.preventDefault();
      move(1);
    } else if (k === 'ArrowDown' || k === 's' || k === 'S') {
      event.preventDefault();
      softDrop();
    } else if (k === 'ArrowUp' || k === 'w' || k === 'W' || k === 'z' || k === 'Z') {
      event.preventDefault();
      rotate();
    } else if (k === ' ') {
      event.preventDefault();
      hardDrop();
    }
  }

  pauseBtn.addEventListener('click', () => setPaused(!paused));
  resetBtn.addEventListener('click', () => resetGame());
  window.addEventListener('keydown', handleKeydown);

  resetGame();
  rafId = window.requestAnimationFrame(tick);

  return {
    setPaused,
    destroy: () => {
      destroyed = true;
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', handleKeydown);
    },
  };
}
