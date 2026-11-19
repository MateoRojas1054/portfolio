# KrassnyOS — Developer Portfolio

Interactive developer portfolio for **Mateo Rojas Martinez** (Backend & Full-Stack Developer — Bogotá, Colombia), built as a zero-dependency vanilla HTML, CSS, and ES Modules desktop & terminal environment inspired by Linux TTY shells and an Arch/Hyprland floating desktop aesthetic.

**Live Site:** https://mateorojas.dev/

---

## Overview

KrassnyOS is structured into three native views without frameworks, bundlers, or build pipelines:

1. **Systemd Boot (`#view-boot`)**
   - Sober, keyboard-only (`ENTER / RETURN`) `[  OK  ]` systemd startup log reflecting real projects and services.
   - Automatically bypassed when `prefers-reduced-motion: reduce` is enabled.
2. **Raw Linux TTY Shell (`#view-tty`)**
   - Block-ASCII `KrassnyOS` banner (responsive wide & compact layouts) with character-by-character intro output.
   - Interactive prompt (`guest@krassnyos:~$`) supporting command history (`↑` / `↓`), `Ctrl+L` clear, IME-safe `Enter` submission, and Zsh/Bash-style `Tab` autocompletion (longest common prefix, candidate listing, and cycling across commands and virtual filesystem paths).
   - Running `gui`, `startx`, `hyprland`, or `desktop` clears the TTY and prints staged `[  OK  ]` compositor startup lines before launching the desktop.
3. **Hyprland Floating Desktop (`#view-desktop`)**
   - Opens clean with **all windows closed** on a `#000000` canvas, centered ASCII watermark, `30px` top bar (`1..5` workspaces, live `America/Bogota` clock, `EN` layout, `⏻ TTY` exit), top-right status toast, desktop icons, and a centered bottom dock with a `⊞` Application Launcher.
   - **5 Stateful Workspaces (`1..5`)**: Each workspace isolates and preserves open windows, dragged `(x, y)` coordinates, active focus, minimized states, collapsible ASCII architecture diagrams, and internal scroll positions (`scrollTop`). Switch via top-bar buttons or `Alt+1`–`Alt+5`.
   - **Draggable Floating Windows**: Sharp `0px` Hyprland geometry, `2px solid #feed6c` active yellow borders, Pointer Events titlebar dragging clamped to the viewport, click-to-focus `z-index`, minimize (`_`), close (`×` or `Escape`), and full-width responsive mobile sheets.
   - **Built-in Games**:
     - **DOOM (1993 Shareware)** lazy-loaded inside an isolated `<iframe>` ([doom.html](doom.html)) via `js-dos v8` WebAssembly — zero initial page weight and full CPU/audio teardown on window close.
     - **Tetris** ([js/games/tetris.js](js/games/tetris.js)) built in pure Canvas JS with 7-bag piece randomization, ghost piece preview, `localStorage` high score, mobile touch D-pad, and automatic pause when switching workspaces.

---

## Interactive Terminal Commands

| Command | Description |
| :--- | :--- |
| `help` | List all available commands |
| `whoami` / `about` | Profile summary and current standing |
| `neofetch` | System specs, ASCII emblem, and Base24 palette swatches |
| `projects` | Featured production & institutional systems (`constancias`, `SIGMA`, `architecture-case-studies`) |
| `cat constancias` / `cat sigma` | Detailed project breakdown + ASCII architecture diagram |
| `experience` | Production maintenance & Universidad de La Salle mentoring (`Hermano Mayor`) |
| `skills` | Backend, databases, frontend, and DevOps stack |
| `certs` | Verified Credly certifications (Certiprof, Cisco Networking Academy) |
| `cv` | Download or open `Mateo_Rojas_Resume.pdf` |
| `contact` | GitHub, LinkedIn, Credly, and email links |
| `ls [projects]` | Browse the virtual home directory |
| `startx` / `gui` | Launch the Hyprland floating desktop |
| `doom` / `tetris` | Launch DOOM (1993) or Tetris directly in the desktop |
| `clear` | Clear terminal history (`Ctrl+L`) |
| `reboot` | Replay the systemd boot sequence |

---

## Desktop Shortcuts & Controls

### Window Manager
- **`Alt+1` .. `Alt+5`** — Switch between stateful workspaces `1–5`
- **`Ctrl+\``** — Toggle the floating `<dialog>` terminal drawer
- **`Escape`** — Close the active floating window or open modal (`<dialog>`)
- **Dock icon click** — Open app, focus/jump to its workspace, or minimize if currently active

### Games
- **DOOM (1993)**: `WASD` Move · `Mouse / ← →` Turn · `Click / Ctrl` Fire · `Space` Open · `R-Shift` Run · `1–7` Weapons · `Tab` Map · `Esc` Unlock/Menu
- **Tetris**: `← / →` (or `A / D`) Move · `↑ / W / Z` Rotate · `↓ / S` Soft Drop · `Space` Hard Drop · `P` Pause · `R` Restart

---

## Project Structure

```text
portfolio/
├── index.html                  # Three-view semantic shell + native <dialog> modals
├── doom.html                   # Isolated lazy-loaded DOOM (1993) js-dos v8 runner
├── css/
│   └── styles.css              # Cascade-layered (@layer) KrassnyOS dark theme & responsive layout
├── js/
│   ├── main.js                 # View orchestration, hash routing (#tty <-> #desktop), focus routing
│   ├── data.js                 # Single source of truth for profile, projects, skills, certs & FS
│   ├── ascii.js                # Block-ASCII banners, wallpaper emblem & architecture diagrams
│   ├── boot.js                 # Keyboard-only systemd [  OK  ] boot controller
│   ├── terminal.js             # Shared TTY & drawer shell with Tab autocomplete & history
│   ├── desktop.js              # Floating WM, stateful workspaces (1..5), dock & app launcher
│   └── games/
│       └── tetris.js           # Pure Canvas Tetris engine with workspace auto-pause
├── assets/
│   └── Mateo_Rojas_Resume.pdf  # 1-page ATS-friendly CV
└── docs/
    └── ARCHITECTURE.md         # Detailed architecture, state model & accessibility notes
```

For full technical internals, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Running Locally

No build step or package installation is required — serve the directory with any static HTTP server (ES modules require HTTP rather than `file://`):

```bash
python3 -m http.server 8789 --bind 127.0.0.1
```

Then open:
- `http://127.0.0.1:8789/` — Full flow starting from systemd boot
- `http://127.0.0.1:8789/#tty` — Direct to the raw Linux TTY shell
- `http://127.0.0.1:8789/#desktop` — Direct to the Hyprland floating desktop

---

## Links

- **GitHub:** [github.com/MateoRojas1054](https://github.com/MateoRojas1054)
- **Architecture Case Studies:** [github.com/MateoRojas1054/architecture-case-studies](https://github.com/MateoRojas1054/architecture-case-studies)
- **LinkedIn:** [linkedin.com/in/mateorojas1054](https://www.linkedin.com/in/mateorojas1054/)
- **Credly:** [credly.com/users/mateorojas1054](https://www.credly.com/users/mateorojas1054)
