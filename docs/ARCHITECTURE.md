# KrassnyOS Architecture & Design Notes

This document describes the internal architecture, state management model, styling strategy, and accessibility design of **KrassnyOS**.

---

## 1. Design Principles

- **Zero Dependencies / Zero Build Step:** Pure semantic HTML5, modern CSS (`@layer`, CSS nesting, custom properties), and native ES Modules (`<script type="module">`) directly deployable on GitHub Pages.
- **Single Source of Truth:** All portfolio content (profile metadata, systemd boot units, projects, experience, skills, verified Credly credentials, and virtual filesystem paths) lives in `js/data.js` and is consumed consistently by both the TTY shell (`js/terminal.js`) and desktop apps (`js/desktop.js`).
- **KrassnyOS Dark Visual System:** Palette tokens and geometry (`0px` corners, zero drop shadows, `#000000` canvas, `#1b1d1e` window surface, `#feed6c` active yellow borders, `JetBrains Mono`) follow a minimalist high-contrast Base24 dark theme.

---

## 2. View State Machine (`js/main.js`)

```text
                    [ Enter ]                   [ gui / startx / doom / tetris ]
  +------------+ -------------> +------------+ ---------------------------------> +--------------+
  | #view-boot |                | #view-tty  |                                    | #view-desktop|
  +------------+ <------------- +------------+ <--------------------------------- +--------------+
                  [ reboot ]                     [ ⏻ TTY button / 'tty' command ]
```

- **Instantaneous Cuts:** Transitions toggle `[hidden]` directly without synthetic crossfades to preserve the raw Linux VT switching feel.
- **Deep Linking:** URL hashes `#tty` and `#desktop` bypass boot on load and stay synchronized via `history.replaceState` and `hashchange`.
- **Programmatic Focus Routing:** Every view transition moves focus cleanly to the appropriate target (`#tty-input` in TTY, `#desktop-stage` in Desktop) and emits polite announcements to `#sr-announcer` (`aria-live="polite"`).

---

## 3. Window Manager & Stateful Workspaces (`js/desktop.js`)

### Workspace Isolation (`1..5`)
Each floating window record in `openWindows` stores:
- `el` — The `.float-win` DOM element (retaining dragged `left`/`top`, dimensions, and internal `<details>` state)
- `bodyEl` — Scrollable `.float-win-body` reference
- `workspace` — Owner workspace index (`1..5`)
- `minimized` — Minimized state flag
- `scrollTop` — Saved internal scroll offset (captured immediately before setting `hidden = true`, because browsers reset `scrollTop` on `display: none` elements, and restored upon unhiding)
- `lifecycle` — Optional `{ onHide, onShow, onDestroy }` hooks for stateful apps like Tetris

`workspaceActiveWin` tracks the last focused window per workspace so switching from `WS 1 -> WS 2 -> WS 1` restores exact focus, visual stack (`z-index`), geometry, and scroll position.

### App Launch & Cross-Workspace Jumping
- Clicking an app already open on the **current workspace** from the dock toggles minimize/focus.
- Clicking an app open on **another workspace** switches automatically to that workspace and focuses it.
- Top-bar indicators mark the current workspace (`.is-active`) and occupied inactive workspaces (`.has-windows`).

---

## 4. Lazy-Loaded Games & Resource Hygiene

### DOOM (`doom.html`)
- Isolated inside an `<iframe>` mounted only when the **DOOM** window is opened.
- Prevents third-party `js-dos.css` rules from colliding with KrassnyOS styles, avoids any network payload on initial page load, and guarantees WebAssembly workers and audio contexts are destroyed when the window closes.
- Keyboard controls displayed in `doom.html` are verified against `DEFAULT.CFG` inside `doom.jsdos` (`WASD`, `Mouse / ← →`, `Click / Ctrl`, `Space`, `Right Shift`, `1–7`, `Tab`).

### Tetris (`js/games/tetris.js`)
- Pure Canvas 2D implementation using `requestAnimationFrame` with clamped frame deltas (`<= 120ms`).
- Implements a 7-bag piece generator, basic horizontal wall kicks, landing ghost preview, and persistent best score via `localStorage` (`krassnyos_tetris_best_v1`).
- Subscribes to window lifecycle hooks: `onHide` automatically pauses gameplay when minimizing or switching workspaces; `onDestroy` cancels `requestAnimationFrame` and removes global keyboard listeners.

---

## 5. CSS Cascade & Accessibility

- **Explicit Cascade Layers:** `@layer reset, tokens, base, components, views, utilities;` avoids global `*` resets and prevents specificity conflicts.
- **Native Modals:** Both the Application Launcher (`<dialog id="app-launcher">`) and the Floating Terminal Drawer (`<dialog id="terminal-drawer">`) use native `.showModal()` for built-in top-layer stacking, backdrop click dismissal, focus trapping, and `Escape` handling.
- **Contrast & Forced Colors:** Muted text uses `#8a8c89` (`>= 5.2:1` on `#1b1d1e`) for WCAG AA readability, `color-scheme: dark` styles native controls and scrollbars, and `@media (forced-colors: active)` preserves active window/button boundaries in high-contrast OS modes.
- **Reduced Motion & IME Safety:** `prefers-reduced-motion: reduce` skips boot and TTY typing animations immediately; terminal and launcher `Enter` handlers guard against `event.isComposing || event.keyCode === 229`.
