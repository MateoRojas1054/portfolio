/**
 * desktop.js
 * Hyprland-style floating desktop view controller.
 * Starts completely clean (all windows closed) with desktop icons,
 * centered bottom dock, native <dialog> app launcher, draggable floating windows,
 * live Bogota clock, and desktop status toast.
 */

import { PROFILE, EXPERIENCE, PROJECTS, SKILLS, CERTIFICATIONS } from './data.js';
import { NEOFETCH_EMBLEM, ARCH_CONSTANCIAS, ARCH_SIGMA, BAT_EMBLEM } from './ascii.js';
import { mountTetris } from './games/tetris.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function linkBtn(href, label, className = 'btn', download = false) {
  const a = document.createElement('a');
  a.className = className;
  a.href = href;
  a.textContent = label;
  if (download) {
    a.setAttribute('download', 'Mateo_Rojas_Resume.pdf');
  } else if (href.startsWith('http') || href.endsWith('.pdf')) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }
  return a;
}

function makeSvg(size, paths, strokeColor = 'currentColor') {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', strokeColor);
  svg.setAttribute('stroke-width', '1.9');
  svg.setAttribute('stroke-linecap', 'square');
  svg.setAttribute('stroke-linejoin', 'miter');
  svg.setAttribute('aria-hidden', 'true');

  paths.forEach(([tag, attrs]) => {
    const child = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([k, v]) => child.setAttribute(k, String(v)));
    svg.append(child);
  });

  return svg;
}

const ICONS = {
  launcher: (size = 20) =>
    makeSvg(
      size,
      [
        ['rect', { x: 3, y: 3, width: 4, height: 4, fill: 'currentColor', stroke: 'none' }],
        ['rect', { x: 10, y: 3, width: 4, height: 4, fill: 'currentColor', stroke: 'none' }],
        ['rect', { x: 17, y: 3, width: 4, height: 4, fill: 'currentColor', stroke: 'none' }],
        ['rect', { x: 3, y: 10, width: 4, height: 4, fill: 'currentColor', stroke: 'none' }],
        ['rect', { x: 10, y: 10, width: 4, height: 4, fill: 'currentColor', stroke: 'none' }],
        ['rect', { x: 17, y: 10, width: 4, height: 4, fill: 'currentColor', stroke: 'none' }],
        ['rect', { x: 3, y: 17, width: 4, height: 4, fill: 'currentColor', stroke: 'none' }],
        ['rect', { x: 10, y: 17, width: 4, height: 4, fill: 'currentColor', stroke: 'none' }],
        ['rect', { x: 17, y: 17, width: 4, height: 4, fill: 'currentColor', stroke: 'none' }],
      ],
      'currentColor'
    ),
  terminal: (size = 22) =>
    makeSvg(size, [
      ['rect', { x: 2, y: 3, width: 20, height: 18 }],
      ['polyline', { points: '7 9 11 12 7 15' }],
      ['line', { x1: 13, y1: 15, x2: 17, y2: 15 }],
    ]),
  projects: (size = 22) =>
    makeSvg(size, [
      ['polygon', { points: '12 2 2 7 12 12 22 7 12 2' }],
      ['polyline', { points: '2 12 12 17 22 12' }],
      ['polyline', { points: '2 17 12 22 22 17' }],
    ]),
  about: (size = 22) =>
    makeSvg(size, [
      ['rect', { x: 3, y: 3, width: 18, height: 18 }],
      ['circle', { cx: 12, cy: 10, r: 3 }],
      ['path', { d: 'M7 18c0-2.5 2.2-4 5-4s5 1.5 5 4' }],
    ]),
  experience: (size = 22) =>
    makeSvg(size, [
      ['rect', { x: 2, y: 7, width: 20, height: 14 }],
      ['path', { d: 'M8 7V4h8v3' }],
      ['line', { x1: 2, y1: 12, x2: 22, y2: 12 }],
    ]),
  education: (size = 22) =>
    makeSvg(size, [
      ['polygon', { points: '12 3 2 8 12 13 22 8 12 3' }],
      ['path', { d: 'M6 10.5V16c0 1.8 2.7 3 6 3s6-1.2 6-3v-5.5' }],
      ['line', { x1: 22, y1: 8, x2: 22, y2: 14 }],
    ]),
  skills: (size = 22) =>
    makeSvg(size, [
      ['rect', { x: 6, y: 6, width: 12, height: 12 }],
      ['rect', { x: 9, y: 9, width: 6, height: 6 }],
      ['line', { x1: 9, y1: 2, x2: 9, y2: 6 }],
      ['line', { x1: 15, y1: 2, x2: 15, y2: 6 }],
      ['line', { x1: 9, y1: 18, x2: 9, y2: 22 }],
      ['line', { x1: 15, y1: 18, x2: 15, y2: 22 }],
      ['line', { x1: 2, y1: 9, x2: 6, y2: 9 }],
      ['line', { x1: 2, y1: 15, x2: 6, y2: 15 }],
      ['line', { x1: 18, y1: 9, x2: 22, y2: 9 }],
      ['line', { x1: 18, y1: 15, x2: 22, y2: 15 }],
    ]),
  certs: (size = 22) =>
    makeSvg(size, [
      ['path', { d: 'M12 2L4 5v6c0 5.2 3.4 9.7 8 11 4.6-1.3 8-5.8 8-11V5l-8-3z' }],
      ['polyline', { points: '9 12 11 14 15.5 9.5' }],
    ]),
  resume: (size = 22) =>
    makeSvg(size, [
      ['path', { d: 'M14 2H5v20h14V7l-5-5z' }],
      ['polyline', { points: '14 2 14 7 19 7' }],
      ['line', { x1: 8, y1: 12, x2: 16, y2: 12 }],
      ['line', { x1: 8, y1: 16, x2: 14, y2: 16 }],
    ]),
  contact: (size = 22) =>
    makeSvg(size, [
      ['rect', { x: 2, y: 4, width: 20, height: 16 }],
      ['polyline', { points: '2 5 12 13 22 5' }],
    ]),
  doom: (size = 22) =>
    makeSvg(size, [
      ['circle', { cx: 12, cy: 12, r: 8 }],
      ['circle', { cx: 12, cy: 12, r: 2 }],
      ['line', { x1: 12, y1: 2, x2: 12, y2: 6 }],
      ['line', { x1: 12, y1: 18, x2: 12, y2: 22 }],
      ['line', { x1: 2, y1: 12, x2: 6, y2: 12 }],
      ['line', { x1: 18, y1: 12, x2: 22, y2: 12 }],
    ]),
  tetris: (size = 22) =>
    makeSvg(size, [
      ['rect', { x: 9, y: 4, width: 6, height: 6 }],
      ['rect', { x: 3, y: 10, width: 6, height: 6 }],
      ['rect', { x: 9, y: 10, width: 6, height: 6 }],
      ['rect', { x: 15, y: 10, width: 6, height: 6 }],
    ]),
};

function buildAboutContent(body, openApp) {
  body.append(
    el('h1', 'desktop-h1', PROFILE.name),
    el('p', 'desktop-subtitle', `${PROFILE.role} · ${PROFILE.location}`),
    el('p', 'desktop-copy', PROFILE.summary)
  );

  const metrics = el('dl', 'stat-strip');
  [
    ['Experience', PROFILE.experienceYears],
    ['Production', 'constancias (1.5 yrs)'],
    ['Education', `${PROFILE.education.institution} (${PROFILE.education.expected})`],
  ].forEach(([k, v]) => {
    const cell = el('div', 'stat-cell');
    cell.append(el('dt', 'stat-label', k), el('dd', 'stat-value', v));
    metrics.append(cell);
  });
  body.append(metrics);

  const dl = el('dl', 'kv-list');
  [
    ['OS', PROFILE.osName],
    ['WM', PROFILE.wm],
    ['Core Stack', 'PHP 8.2/8.3 · MySQL 8 · Python · TS · Docker'],
    ['GitHub', PROFILE.handle],
    ['LinkedIn', 'mateorojas1054'],
    ['Credly', 'mateorojas1054'],
  ].forEach(([k, v]) => {
    const r = el('div', 'kv-row');
    r.append(el('dt', null, k), el('dd', null, v));
    dl.append(r);
  });
  body.append(dl);

  const actions = el('div', 'action-row');
  const jumpProjects = el('button', 'btn btn-primary', 'Open Projects ->');
  jumpProjects.type = 'button';
  jumpProjects.addEventListener('click', () => openApp('projects'));

  actions.append(
    jumpProjects,
    linkBtn(PROFILE.contact.cvPath, 'Download CV (PDF)', 'btn', true),
    linkBtn(PROFILE.contact.caseStudies, 'Case Studies (GitHub)', 'btn')
  );
  body.append(actions);
}

function buildProjectsContent(body) {
  const stack = el('div', 'win-stack');

  PROJECTS.forEach((proj, idx) => {
    const card = el('article', 'win-card');
    const head = el('div', 'win-card-head');
    head.append(el('h3', 'pane-h2', proj.name), el('span', 'pane-meta', proj.visibility));
    card.append(
      head,
      el('p', 'pane-submeta', `${proj.status} · ${proj.role}`),
      el('p', 'desktop-copy', proj.summary)
    );

    const ul = el('ul', 'pane-list');
    proj.architecturePoints.forEach((pt) => ul.append(el('li', null, pt)));
    card.append(ul);

    if (proj.id === 'constancias' || proj.id === 'sigma') {
      const details = el('details', 'arch-disclosure');
      const summary = el('summary', 'arch-summary', 'View ASCII Architecture Diagram');
      const pre = el(
        'pre',
        'ascii-art ascii-diagram',
        proj.id === 'constancias' ? ARCH_CONSTANCIAS : ARCH_SIGMA
      );
      pre.setAttribute('aria-hidden', 'true');
      details.append(summary, pre);
      card.append(details);
    }

    const tags = el('ul', 'tag-list');
    tags.setAttribute('role', 'list');
    proj.stack.forEach((t) => tags.append(el('li', 'tag-chip', t)));
    card.append(tags);

    const actions = el('div', 'action-row');
    actions.append(linkBtn(proj.url, proj.urlLabel, idx === 0 ? 'btn btn-primary' : 'btn'));
    card.append(actions);
    stack.append(card);
  });

  body.append(stack);
}

function buildExperienceContent(body) {
  EXPERIENCE.forEach((exp) => {
    const entry = el('section', 'exp-entry');
    entry.append(
      el('h3', 'exp-role', exp.role),
      el('p', 'pane-submeta', `${exp.organization} · ${exp.period} (${exp.badge})`)
    );
    const ul = el('ul', 'pane-list');
    exp.highlights.forEach((h) => ul.append(el('li', null, h)));
    entry.append(ul);

    const tags = el('ul', 'tag-list');
    tags.setAttribute('role', 'list');
    exp.stack.forEach((t) => tags.append(el('li', 'tag-chip', t)));
    entry.append(tags);

    if (exp.caseStudyUrl) {
      const row = el('div', 'action-row');
      row.append(linkBtn(exp.caseStudyUrl, 'View constancias Case Study ->', 'inline-link'));
      entry.append(row);
    }
    body.append(entry);
  });
}

function buildEducationContent(body) {
  const card = el('section', 'win-card');
  card.append(
    el('h3', 'pane-h2', PROFILE.education.institution),
    el('p', 'desktop-subtitle', PROFILE.education.degree),
    el('p', 'pane-submeta', `${PROFILE.education.expected} · ${PROFILE.education.location}`),
    el(
      'p',
      'desktop-copy',
      'Focused on software architecture, databases, distributed systems, algorithms, and applied backend engineering. Serving as an Academic Mentor & Peer Tutor ("Hermano Mayor") supporting incoming engineering cohorts.'
    )
  );
  body.append(card);

  const certSummary = el('section', 'win-card');
  certSummary.append(
    el('h3', 'exp-role', 'Verified Technical Credentials'),
    el(
      'p',
      'desktop-copy',
      'Complemented by verified industry badges from Certiprof (FullStack Mean Expert) and Cisco Networking Academy (Python Essentials 2, Data Science Essentials With Python, JavaScript Essentials 1).'
    )
  );
  const actions = el('div', 'action-row');
  actions.append(linkBtn(PROFILE.contact.credly, 'Open Credly Profile ->', 'btn'));
  certSummary.append(actions);
  body.append(certSummary);
}

function buildSkillsContent(body) {
  SKILLS.forEach((group) => {
    const sec = el('section', 'skill-group');
    sec.append(el('h3', 'skill-cat', group.category));
    const list = el('ul', 'tag-list');
    list.setAttribute('role', 'list');
    group.items.forEach((item) => list.append(el('li', 'tag-chip', item)));
    sec.append(list);
    body.append(sec);
  });
}

function buildCertsContent(body) {
  const list = el('ul', 'cert-list');
  list.setAttribute('role', 'list');

  CERTIFICATIONS.forEach((cert) => {
    const li = el('li', 'cert-item');
    li.append(
      el('p', 'cert-name', cert.name),
      el('p', 'pane-submeta', `${cert.issuer} · ${cert.period}`)
    );
    if (cert.url) {
      li.append(linkBtn(cert.url, `Verify ${cert.name} on Credly ->`, 'inline-link'));
    }
    list.append(li);
  });

  body.append(list);
  const actions = el('div', 'action-row');
  actions.append(linkBtn(PROFILE.contact.credly, 'Open Full Credly Profile', 'btn btn-primary'));
  body.append(actions);
}

function buildResumeContent(body) {
  body.append(
    el('h3', 'pane-h2', 'Mateo_Rojas_Resume.pdf'),
    el('p', 'pane-submeta', '1 Page · US Letter · ATS-Friendly Typst Build'),
    el(
      'p',
      'desktop-copy',
      'Synced across GitHub, LinkedIn, and Credly — covering 3 years of hands-on backend and full-stack experience, production maintenance on constancias, SIGMA architecture, and verified certifications.'
    )
  );

  const actions = el('div', 'action-row');
  actions.append(
    linkBtn(PROFILE.contact.cvPath, 'Download CV (PDF)', 'btn btn-primary', true),
    linkBtn(PROFILE.contact.cvPath, 'Open PDF in New Tab', 'btn')
  );
  body.append(actions);

  const dl = el('dl', 'kv-list contact-kv');
  [
    ['Candidate', PROFILE.name],
    ['Role', PROFILE.role],
    ['Location', PROFILE.location],
    ['Education', `${PROFILE.education.institution} (${PROFILE.education.expected})`],
  ].forEach(([k, v]) => {
    const r = el('div', 'kv-row');
    r.append(el('dt', null, k), el('dd', null, v));
    dl.append(r);
  });
  body.append(dl);
}

function buildContactContent(body) {
  body.append(
    el('h3', 'pane-h2', 'Direct Contact & Profiles'),
    el(
      'p',
      'desktop-copy',
      'Open to backend, full-stack, and software engineering opportunities in Bogotá or remote.'
    )
  );

  const dl = el('dl', 'kv-list contact-kv');
  [
    ['Email', PROFILE.contact.email, `mailto:${PROFILE.contact.email}`],
    ['Phone', PROFILE.contact.phone, null],
    ['GitHub', 'github.com/MateoRojas1054', PROFILE.contact.github],
    ['Case Studies', 'github.com/MateoRojas1054/architecture-case-studies', PROFILE.contact.caseStudies],
    ['LinkedIn', 'linkedin.com/in/mateorojas1054', PROFILE.contact.linkedin],
    ['Credly', 'credly.com/users/mateorojas1054', PROFILE.contact.credly],
    ['Location', PROFILE.location, null],
  ].forEach(([k, text, href]) => {
    const r = el('div', 'kv-row');
    r.append(el('dt', null, k));
    const dd = el('dd', null);
    if (href) {
      dd.append(linkBtn(href, text, 'inline-link'));
    } else {
      dd.textContent = text;
    }
    r.append(dd);
    dl.append(r);
  });
  body.append(dl);

  const actions = el('div', 'action-row');
  actions.append(
    linkBtn(`mailto:${PROFILE.contact.email}`, 'Send Email', 'btn btn-primary'),
    linkBtn(PROFILE.contact.linkedin, 'Open LinkedIn', 'btn')
  );
  body.append(actions);
}

export function initDesktop({
  desktopRoot,
  stageEl,
  workspacesEl,
  clockEl,
  activeTitleEl,
  toastEl,
  wallpaperEl,
  iconsEl,
  windowsLayerEl,
  dockEl,
  launcherDialog,
  launcherSearch,
  launcherGrid,
  launcherCloseBtn,
  waybarLauncherBtn,
  drawerDialog,
  closeDrawerBtn,
  ttyBtn,
  onReturnTty,
  onOpenDrawer,
  announce,
}) {
  const APPS = [
    {
      id: 'projects',
      label: 'Projects',
      winTitle: '~/projects',
      keywords: 'constancias sigma architecture case studies php mysql docker',
      tone: 'accent',
      pinned: true,
      width: 760,
      height: 560,
      render: buildProjectsContent,
    },
    {
      id: 'terminal',
      label: 'Terminal',
      winTitle: 'krassny-sh :: terminal',
      keywords: 'shell bash zsh cli tty command prompt',
      tone: 'bright',
      pinned: true,
      isDrawer: true,
    },
    {
      id: 'about',
      label: 'About Me',
      winTitle: '~/about.md',
      keywords: 'mateo rojas profile bio overview summary',
      tone: 'blue',
      pinned: true,
      width: 650,
      height: 510,
      render: (body) => buildAboutContent(body, openApp),
    },
    {
      id: 'experience',
      label: 'Work History',
      winTitle: '~/experience.log',
      keywords: 'experience work constancias hermano mayor mentoring jobs',
      tone: 'ok',
      pinned: true,
      width: 680,
      height: 520,
      render: buildExperienceContent,
    },
    {
      id: 'education',
      label: 'Education',
      winTitle: '~/education.md',
      keywords: 'university la salle degree systems software engineering 2029',
      tone: 'cyan',
      pinned: false,
      width: 580,
      height: 410,
      render: buildEducationContent,
    },
    {
      id: 'skills',
      label: 'Skills',
      winTitle: '~/skills.json',
      keywords: 'stack php mysql python typescript angular docker linux git',
      tone: 'warn',
      pinned: true,
      width: 620,
      height: 470,
      render: buildSkillsContent,
    },
    {
      id: 'certs',
      label: 'Certs',
      winTitle: '~/certifications.credly',
      keywords: 'credly badges certiprof mean cisco python javascript',
      tone: 'ok',
      pinned: true,
      width: 620,
      height: 490,
      render: buildCertsContent,
    },
    {
      id: 'resume',
      label: 'Resume.pdf',
      winTitle: '~/Mateo_Rojas_Resume.pdf',
      keywords: 'cv pdf download resume',
      tone: 'accent',
      pinned: true,
      width: 560,
      height: 420,
      render: buildResumeContent,
    },
    {
      id: 'contact',
      label: 'Contact',
      winTitle: '~/contact.vcf',
      keywords: 'email phone github linkedin credly bogota',
      tone: 'blue',
      pinned: true,
      width: 580,
      height: 430,
      render: buildContactContent,
    },
    {
      id: 'doom',
      label: 'DOOM',
      winTitle: '/usr/games/doom (1993)',
      keywords: 'game fps play doom shareware dosbox wasm retro',
      tone: 'err',
      pinned: true,
      gameGroup: true,
      flushBody: true,
      width: 740,
      height: 520,
      render: (body) => {
        const frame = document.createElement('iframe');
        frame.className = 'doom-frame';
        frame.src = 'doom.html';
        frame.title = 'DOOM (1993) Shareware via js-dos';
        frame.setAttribute('allow', 'autoplay; fullscreen');
        body.append(frame);
      },
    },
    {
      id: 'tetris',
      label: 'Tetris',
      winTitle: '/usr/games/tetris',
      keywords: 'game arcade play tetris blocks puzzle retro',
      tone: 'cyan',
      pinned: true,
      gameGroup: true,
      width: 530,
      height: 575,
      render: (body, ctx) => {
        const api = mountTetris(body, { isWindowActive: ctx.isWindowActive });
        return {
          onHide: () => api.setPaused(true),
          onDestroy: () => api.destroy(),
        };
      },
    },
  ];

  const appById = new Map(APPS.map((a) => [a.id, a]));
  const openWindows = new Map();
  const dockButtons = new Map();
  const wsButtons = workspacesEl ? Array.from(workspacesEl.querySelectorAll('.ws-dot[data-ws]')) : [];
  const workspaceActiveWin = new Map();
  const wsSpawnCounters = new Map();
  let currentWorkspace = 1;
  let activeWinId = null;
  let zCounter = 20;
  let toastTimer = null;

  if (wallpaperEl) {
    wallpaperEl.textContent = NEOFETCH_EMBLEM.join('\n');
  }

  function updateClock() {
    const now = new Date();
    const day = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Bogota',
      weekday: 'long',
    }).format(now);
    const time = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Bogota',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(now);
    clockEl.textContent = `${day} ${time}`;
  }

  function showToast(message, durationMs = 3400) {
    if (!toastEl) return;
    if (toastTimer) window.clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.hidden = false;
    toastTimer = window.setTimeout(() => {
      toastEl.hidden = true;
      toastTimer = null;
    }, durationMs);
  }

  function syncWorkspaceButtons() {
    const occupied = new Set();
    openWindows.forEach((win) => occupied.add(win.workspace));

    wsButtons.forEach((btn) => {
      const ws = Number(btn.dataset.ws);
      const isCurrent = ws === currentWorkspace;
      const hasWins = occupied.has(ws);
      btn.classList.toggle('is-active', isCurrent);
      btn.classList.toggle('has-windows', hasWins);
      btn.setAttribute('aria-pressed', String(isCurrent));
    });
  }

  function syncDockAndWaybar() {
    syncWorkspaceButtons();

    if (activeTitleEl) {
      if (drawerDialog.open) {
        activeTitleEl.textContent = 'krassny-sh :: terminal';
      } else if (activeWinId && openWindows.has(activeWinId)) {
        const win = openWindows.get(activeWinId);
        activeTitleEl.textContent = win.workspace === currentWorkspace ? appById.get(activeWinId).winTitle : '';
      } else {
        activeTitleEl.textContent = '';
      }
    }

    dockButtons.forEach((btn, appId) => {
      if (appId === 'terminal') {
        btn.classList.toggle('is-open', drawerDialog.open);
        btn.classList.toggle('is-active', drawerDialog.open);
        btn.classList.remove('is-other-ws');
        return;
      }
      const win = openWindows.get(appId);
      const isOpen = Boolean(win);
      const inCurrentWs = isOpen && win.workspace === currentWorkspace;
      const isFocused = inCurrentWs && !win.minimized && activeWinId === appId && !drawerDialog.open;
      btn.classList.toggle('is-open', inCurrentWs);
      btn.classList.toggle('is-other-ws', isOpen && !inCurrentWs);
      btn.classList.toggle('is-active', isFocused);
    });
  }

  function hideWindowElement(win) {
    if (!win.el.hidden) {
      win.scrollTop = win.bodyEl.scrollTop;
      win.el.hidden = true;
      win.lifecycle?.onHide?.();
    }
  }

  function showWindowElement(win) {
    if (win.el.hidden) {
      win.el.hidden = false;
      win.bodyEl.scrollTop = win.scrollTop || 0;
      win.lifecycle?.onShow?.();
    }
  }

  function focusWindow(appId) {
    const target = openWindows.get(appId);
    if (!target) return;

    if (target.workspace !== currentWorkspace) {
      switchWorkspace(target.workspace, { focusTargetId: appId });
      return;
    }

    activeWinId = appId;
    workspaceActiveWin.set(currentWorkspace, appId);

    openWindows.forEach((win, id) => {
      win.el.classList.toggle('is-active', id === appId && win.workspace === currentWorkspace);
    });

    target.minimized = false;
    showWindowElement(target);
    zCounter += 1;
    target.el.style.zIndex = String(zCounter);
    syncDockAndWaybar();
  }

  function clearActiveWindow() {
    activeWinId = null;
    workspaceActiveWin.delete(currentWorkspace);
    openWindows.forEach((win) => win.el.classList.remove('is-active'));
    syncDockAndWaybar();
  }

  function pickTopmostVisibleWindow() {
    let bestId = null;
    let bestZ = -1;
    openWindows.forEach((win, id) => {
      if (win.workspace !== currentWorkspace || win.minimized) return;
      const z = Number(win.el.style.zIndex || 0);
      if (z > bestZ) {
        bestZ = z;
        bestId = id;
      }
    });
    if (bestId) focusWindow(bestId);
    else clearActiveWindow();
  }

  function switchWorkspace(wsNum, { focusTargetId = null } = {}) {
    if (wsNum < 1 || wsNum > 5 || wsNum === currentWorkspace) return;

    if (activeWinId) {
      workspaceActiveWin.set(currentWorkspace, activeWinId);
    }

    currentWorkspace = wsNum;

    openWindows.forEach((win) => {
      win.el.classList.remove('is-active');
      if (win.workspace === currentWorkspace && !win.minimized) {
        showWindowElement(win);
      } else {
        hideWindowElement(win);
      }
    });

    const preferredId = focusTargetId || workspaceActiveWin.get(currentWorkspace);
    const preferredWin = preferredId ? openWindows.get(preferredId) : null;

    if (preferredWin && preferredWin.workspace === currentWorkspace && (!preferredWin.minimized || focusTargetId)) {
      activeWinId = preferredId;
      workspaceActiveWin.set(currentWorkspace, preferredId);
      preferredWin.minimized = false;
      showWindowElement(preferredWin);
      preferredWin.el.classList.add('is-active');
      zCounter += 1;
      preferredWin.el.style.zIndex = String(zCounter);
      syncDockAndWaybar();
    } else {
      pickTopmostVisibleWindow();
    }

    announce?.(`Switched to workspace ${currentWorkspace}`);
  }

  function minimizeWindow(appId) {
    const win = openWindows.get(appId);
    if (!win) return;
    win.minimized = true;
    hideWindowElement(win);
    win.el.classList.remove('is-active');
    if (workspaceActiveWin.get(win.workspace) === appId) {
      workspaceActiveWin.delete(win.workspace);
    }
    if (activeWinId === appId) {
      activeWinId = null;
      pickTopmostVisibleWindow();
    } else {
      syncDockAndWaybar();
    }
    announce?.(`Minimized ${appById.get(appId).label}`);
  }

  function closeWindow(appId) {
    const win = openWindows.get(appId);
    if (!win) return;
    const ownerWs = win.workspace;
    win.lifecycle?.onDestroy?.();
    win.el.remove();
    openWindows.delete(appId);
    if (workspaceActiveWin.get(ownerWs) === appId) {
      workspaceActiveWin.delete(ownerWs);
    }
    if (activeWinId === appId) {
      activeWinId = null;
      pickTopmostVisibleWindow();
    } else {
      syncDockAndWaybar();
    }
    announce?.(`Closed ${appById.get(appId).label}`);
  }

  function attachDrag(winEl, barEl, appId) {
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let originLeft = 0;
    let originTop = 0;

    barEl.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      if (event.target.closest('button')) return;
      if (window.innerWidth <= 768) return;

      focusWindow(appId);
      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      originLeft = winEl.offsetLeft;
      originTop = winEl.offsetTop;
      barEl.setPointerCapture(event.pointerId);
      barEl.classList.add('is-dragging');
    });

    barEl.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      const stageW = stageEl.clientWidth;
      const stageH = stageEl.clientHeight;
      const maxLeft = Math.max(8, stageW - Math.min(winEl.offsetWidth, 220));
      const maxTop = Math.max(8, stageH - 72);

      const nextLeft = Math.min(Math.max(8 - winEl.offsetWidth + 140, originLeft + (event.clientX - startX)), maxLeft);
      const nextTop = Math.min(Math.max(8, originTop + (event.clientY - startY)), maxTop);

      winEl.style.left = `${Math.round(nextLeft)}px`;
      winEl.style.top = `${Math.round(nextTop)}px`;
    });

    const endDrag = (event) => {
      if (!dragging) return;
      dragging = false;
      barEl.classList.remove('is-dragging');
      if (barEl.hasPointerCapture?.(event.pointerId)) {
        barEl.releasePointerCapture(event.pointerId);
      }
    };

    barEl.addEventListener('pointerup', endDrag);
    barEl.addEventListener('pointercancel', endDrag);
  }

  function createFloatingWindow(app) {
    const winEl = el('section', 'float-win');
    winEl.setAttribute('role', 'dialog');
    winEl.setAttribute('aria-modal', 'false');
    winEl.setAttribute('aria-labelledby', `win-title-${app.id}`);
    winEl.dataset.appId = app.id;

    const bar = el('div', 'float-win-bar');
    const barLeft = el('div', 'float-win-ident');
    const iconWrap = el('span', `win-mini-icon tone-${app.tone}`);
    iconWrap.append(ICONS[app.id](14));
    const titleEl = el('h2', 'float-win-title', app.winTitle);
    titleEl.id = `win-title-${app.id}`;
    barLeft.append(iconWrap, titleEl);

    const controls = el('div', 'float-win-controls');
    const minBtn = el('button', 'win-ctrl-btn', '_');
    minBtn.type = 'button';
    minBtn.setAttribute('aria-label', `Minimize ${app.label}`);
    minBtn.addEventListener('click', () => minimizeWindow(app.id));

    const closeBtn = el('button', 'win-ctrl-btn win-ctrl-close', '×');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', `Close ${app.label}`);
    closeBtn.addEventListener('click', () => closeWindow(app.id));

    controls.append(minBtn, closeBtn);
    bar.append(barLeft, controls);

    const body = el('div', app.flushBody ? 'float-win-body is-flush' : 'float-win-body');
    const lifecycle = app.render(body, {
      isWindowActive: () =>
        !desktopRoot.hidden &&
        !launcherDialog.open &&
        !drawerDialog.open &&
        activeWinId === app.id &&
        openWindows.get(app.id)?.workspace === currentWorkspace &&
        !openWindows.get(app.id)?.minimized,
    });

    winEl.append(bar, body);

    const stageW = Math.max(stageEl.clientWidth, 320);
    const stageH = Math.max(stageEl.clientHeight, 360);
    const dockClearance = 82;
    const w = Math.min(app.width || 640, stageW - 32);
    const maxH = Math.max(260, stageH - dockClearance - 24);
    const h = Math.min(app.height || 520, maxH);
    const wsCount = wsSpawnCounters.get(currentWorkspace) || 0;
    const offset = (wsCount % 5) * 24;
    wsSpawnCounters.set(currentWorkspace, wsCount + 1);

    const idealTop = Math.round((stageH - dockClearance - h) / 2) + offset - 20;
    const left = Math.max(16, Math.round((stageW - w) / 2) + offset - 24);
    const top = Math.max(16, Math.min(idealTop, Math.max(16, stageH - dockClearance - h)));

    winEl.style.width = `${w}px`;
    winEl.style.height = `${h}px`;
    winEl.style.maxHeight = `${maxH}px`;
    winEl.style.left = `${Math.min(left, Math.max(16, stageW - w - 16))}px`;
    winEl.style.top = `${top}px`;

    winEl.addEventListener('pointerdown', () => focusWindow(app.id));
    attachDrag(winEl, bar, app.id);

    windowsLayerEl.append(winEl);
    openWindows.set(app.id, {
      el: winEl,
      bodyEl: body,
      minimized: false,
      workspace: currentWorkspace,
      scrollTop: 0,
      lifecycle: lifecycle || null,
    });
    focusWindow(app.id);

    const firstFocus = body.querySelector('canvas, iframe, a, button, summary') || closeBtn;
    firstFocus?.focus({ preventScroll: true });
    announce?.(`Opened ${app.label} on workspace ${currentWorkspace}.`);
  }

  function openDrawer() {
    if (!drawerDialog.open) {
      drawerDialog.showModal();
      syncDockAndWaybar();
      onOpenDrawer?.();
    }
  }

  function closeDrawer() {
    if (drawerDialog.open) {
      drawerDialog.close();
      syncDockAndWaybar();
    }
  }

  function openApp(appId, { fromDock = false } = {}) {
    const app = appById.get(appId);
    if (!app) return;

    if (launcherDialog.open) {
      launcherDialog.close();
    }

    if (app.isDrawer) {
      if (drawerDialog.open && fromDock) closeDrawer();
      else openDrawer();
      return;
    }

    const existing = openWindows.get(appId);
    if (existing) {
      if (existing.workspace !== currentWorkspace) {
        switchWorkspace(existing.workspace, { focusTargetId: appId });
      } else if (fromDock && !existing.minimized && activeWinId === appId) {
        minimizeWindow(appId);
      } else {
        focusWindow(appId);
      }
      return;
    }

    createFloatingWindow(app);
  }

  function buildDesktopIcons() {
    iconsEl.replaceChildren();
    APPS.forEach((app) => {
      const btn = el('button', 'desktop-icon');
      btn.type = 'button';
      btn.setAttribute('role', 'listitem');
      btn.dataset.appId = app.id;

      const tile = el('span', `desktop-icon-tile tone-${app.tone}`);
      tile.append(ICONS[app.id](24));
      const label = el('span', 'desktop-icon-label', app.label);

      btn.append(tile, label);
      btn.addEventListener('click', () => openApp(app.id));
      iconsEl.append(btn);
    });
  }

  function buildDock() {
    dockEl.replaceChildren();
    dockButtons.clear();

    const launcherBtn = el('button', 'dock-btn dock-launcher-btn');
    launcherBtn.type = 'button';
    launcherBtn.setAttribute('aria-label', 'Open application launcher');
    launcherBtn.title = 'Applications';
    launcherBtn.append(ICONS.launcher(20));
    launcherBtn.addEventListener('click', () => openLauncher());
    dockEl.append(launcherBtn);

    const sep = el('span', 'dock-sep');
    sep.setAttribute('aria-hidden', 'true');
    dockEl.append(sep);

    let gameSepAdded = false;
    APPS.filter((a) => a.pinned).forEach((app) => {
      if (app.gameGroup && !gameSepAdded) {
        gameSepAdded = true;
        const gameSep = el('span', 'dock-sep');
        gameSep.setAttribute('aria-hidden', 'true');
        dockEl.append(gameSep);
      }

      const btn = el('button', `dock-btn tone-${app.tone}`);
      btn.type = 'button';
      btn.setAttribute('aria-label', app.label);
      btn.title = app.label;
      btn.dataset.appId = app.id;
      btn.append(ICONS[app.id](20));
      const dot = el('span', 'dock-indicator');
      dot.setAttribute('aria-hidden', 'true');
      btn.append(dot);

      btn.addEventListener('click', () => openApp(app.id, { fromDock: true }));
      dockButtons.set(app.id, btn);
      dockEl.append(btn);
    });
  }

  function renderLauncherItems(filter = '') {
    const q = filter.trim().toLowerCase();
    const matches = APPS.filter((app) => {
      if (!q) return true;
      return (
        app.label.toLowerCase().includes(q) ||
        app.winTitle.toLowerCase().includes(q) ||
        app.keywords.toLowerCase().includes(q)
      );
    });

    launcherGrid.replaceChildren();

    if (matches.length === 0) {
      launcherGrid.append(el('p', 'launcher-empty', `No KrassnyOS apps match "${filter.trim()}".`));
      return;
    }

    matches.forEach((app) => {
      const item = el('button', 'launcher-item');
      item.type = 'button';
      const iconBox = el('span', `launcher-icon tone-${app.tone}`);
      iconBox.append(ICONS[app.id](22));
      const textWrap = el('span', 'launcher-text');
      textWrap.append(el('span', 'launcher-name', app.label), el('span', 'launcher-sub', app.winTitle));
      item.append(iconBox, textWrap);
      item.addEventListener('click', () => openApp(app.id));
      launcherGrid.append(item);
    });
  }

  function openLauncher() {
    if (launcherDialog.open) {
      launcherDialog.close();
      return;
    }
    launcherSearch.value = '';
    renderLauncherItems('');
    launcherDialog.showModal();
    launcherSearch.focus();
  }

  launcherSearch.addEventListener('input', () => {
    renderLauncherItems(launcherSearch.value);
  });

  launcherSearch.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.isComposing && event.keyCode !== 229) {
      const first = launcherGrid.querySelector('.launcher-item');
      if (first) {
        event.preventDefault();
        first.click();
      }
    }
  });

  launcherCloseBtn.addEventListener('click', () => {
    if (launcherDialog.open) launcherDialog.close();
  });

  launcherDialog.addEventListener('click', (event) => {
    if (event.target === launcherDialog) launcherDialog.close();
  });

  waybarLauncherBtn.addEventListener('click', () => openLauncher());

  closeDrawerBtn.addEventListener('click', () => closeDrawer());
  drawerDialog.addEventListener('close', () => syncDockAndWaybar());
  drawerDialog.addEventListener('click', (event) => {
    if (event.target === drawerDialog) closeDrawer();
  });

  stageEl.addEventListener('pointerdown', (event) => {
    if (event.target === stageEl || event.target.closest('.desktop-wallpaper')) {
      clearActiveWindow();
    }
  });

  wsButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      switchWorkspace(Number(btn.dataset.ws));
    });
  });

  const KONAMI = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a',
  ];
  let konamiIdx = 0;
  let batWallpaperOn = false;

  function toggleBatWallpaper() {
    if (!wallpaperEl) return;
    batWallpaperOn = !batWallpaperOn;
    wallpaperEl.textContent = batWallpaperOn ? BAT_EMBLEM : NEOFETCH_EMBLEM.join('\n');
    wallpaperEl.classList.toggle('is-bat', batWallpaperOn);
    showToast(
      batWallpaperOn
        ? 'Batcomputer mode unlocked — I use Arch, btw.'
        : 'Restored default KrassnyOS wallpaper.',
      4000
    );
  }

  clockEl.addEventListener('dblclick', () => {
    showToast('Bogotá (UTC-5) · 2,640m · I use Arch, btw.', 3200);
  });

  window.addEventListener('keydown', (event) => {
    if (desktopRoot.hidden) return;
    if (launcherDialog.open || drawerDialog.open) return;

    const k = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (k === KONAMI[konamiIdx]) {
      konamiIdx += 1;
      if (konamiIdx === KONAMI.length) {
        konamiIdx = 0;
        toggleBatWallpaper();
      }
    } else {
      konamiIdx = k === KONAMI[0] ? 1 : 0;
    }

    if (event.altKey && ['1', '2', '3', '4', '5'].includes(event.key)) {
      event.preventDefault();
      switchWorkspace(Number(event.key));
      return;
    }

    if (event.key === 'Escape' && activeWinId) {
      event.preventDefault();
      closeWindow(activeWinId);
    }
  });

  ttyBtn.addEventListener('click', () => onReturnTty());

  buildDesktopIcons();
  buildDock();
  syncWorkspaceButtons();
  updateClock();
  window.setInterval(updateClock, 30_000);

  return {
    openApp,
    openLauncher,
    openDrawer,
    closeDrawer,
    switchWorkspace,
    onEnterDesktop: () => {
      updateClock();
      syncDockAndWaybar();
      showToast('Workspace layout set to floating — open an app from the dock');
      stageEl.focus({ preventScroll: true });
    },
  };
}
