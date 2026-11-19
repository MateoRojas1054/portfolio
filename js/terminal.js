/**
 * terminal.js
 * Interactive KrassnyOS shell shared between the primary TTY view
 * and the Hyprland Desktop floating <dialog> terminal drawer.
 */

import {
  PROFILE,
  EXPERIENCE,
  PROJECTS,
  SKILLS,
  CERTIFICATIONS,
  VIRTUAL_FS,
} from './data.js';
import {
  KRASSNY_BANNER_WIDE,
  KRASSNY_BANNER_COMPACT,
  NEOFETCH_EMBLEM,
  ARCH_CONSTANCIAS,
  ARCH_SIGMA,
  BAT_EMBLEM,
  ARCH_EMBLEM,
  COFFEE_ART,
} from './ascii.js';

const COMMAND_LIST = [
  'cat',
  'certs',
  'clear',
  'contact',
  'cv',
  'doom',
  'exit',
  'experience',
  'gui',
  'help',
  'hyprland',
  'ls',
  'neofetch',
  'projects',
  'reboot',
  'skills',
  'startx',
  'tetris',
  'tty',
  'whoami',
];

const CAT_TARGETS = [
  'about.txt',
  'case-studies',
  'certs.txt',
  'constancias',
  'contact.txt',
  'experience.txt',
  'projects/case-studies.md',
  'projects/constancias.md',
  'projects/sigma.md',
  'resume.pdf',
  'sigma',
  'skills.json',
];

const LS_TARGETS = ['projects'];

function longestCommonPrefix(items) {
  if (items.length === 0) return '';
  let prefix = items[0];
  for (let i = 1; i < items.length; i += 1) {
    while (!items[i].startsWith(prefix) && prefix.length > 0) {
      prefix = prefix.slice(0, -1);
    }
  }
  return prefix;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function linkEl(href, label, download = false) {
  const a = document.createElement('a');
  a.className = 'term-link';
  a.href = href;
  a.textContent = label;
  if (download) {
    a.setAttribute('download', 'Mateo_Rojas_Resume.pdf');
  } else if (href.startsWith('http')) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }
  return a;
}

export function createTerminal({
  rootEl,
  outputEl,
  formEl,
  inputEl,
  mode = 'tty',
  announce,
  onStartDesktop,
  onLaunchApp,
  onReturnTty,
  onReboot,
  onCloseDrawer,
}) {
  const history = [];
  let historyIdx = -1;
  let introTimers = [];
  let introSkipHandler = null;
  let introActive = false;

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function scrollToBottom() {
    window.requestAnimationFrame(() => {
      if (mode === 'tty') {
        const scroller = document.scrollingElement || document.documentElement;
        window.scrollTo({ top: scroller.scrollHeight, behavior: 'instant' });
        if (!formEl.hidden) {
          formEl.scrollIntoView({ block: 'end', behavior: 'instant' });
        }
      } else {
        rootEl.scrollTop = rootEl.scrollHeight;
      }
    });
  }

  function clearIntroAnimation() {
    introTimers.forEach((id) => window.clearTimeout(id));
    introTimers = [];
    if (introSkipHandler) {
      window.removeEventListener('keydown', introSkipHandler);
      introSkipHandler = null;
    }
    introActive = false;
  }

  function renderWelcome({ animate = false } = {}) {
    clearIntroAnimation();
    outputEl.replaceChildren();

    if (mode === 'drawer') {
      formEl.hidden = false;
      const intro = el('div', 'term-block');
      intro.append(
        el('p', 'term-muted', "KrassnyOS Desktop Shell — type 'help' for commands, 'tty' for full TTY, or 'exit' to close.")
      );
      outputEl.append(intro);
      return;
    }

    const welcome = el('div', 'term-welcome');

    const bannerWide = el('pre', 'ascii-art ascii-wide', KRASSNY_BANNER_WIDE);
    bannerWide.setAttribute('aria-hidden', 'true');

    const bannerCompact = el('pre', 'ascii-art ascii-compact', KRASSNY_BANNER_COMPACT);
    bannerCompact.setAttribute('aria-hidden', 'true');

    const srHeading = el('h1', 'visually-hidden', 'KrassnyOS — Mateo Rojas Martinez, Backend & Full-Stack Developer');

    const bio = el('div', 'term-intro');
    welcome.append(srHeading, bannerWide, bannerCompact, bio);
    outputEl.append(welcome);

    const lines = [
      { text: `Hello, my name is ${PROFILE.shortName}`, className: null, charMs: 42 },
      { text: "I'm a backend & full-stack software developer", className: null, charMs: 36 },
      { text: `and this is ${PROFILE.osName} — my personal site`, className: null, charMs: 36 },
      { text: '. . .', className: 'term-dots', charMs: 140 },
      { text: 'To see available commands', className: null, charMs: 32 },
      { text: "type 'help' and hit ENTER or RETURN", className: null, charMs: 32 },
      { text: "(or type 'startx' to launch the Hyprland desktop GUI)", className: 'term-muted', charMs: 28 },
    ];

    const renderInstant = () => {
      clearIntroAnimation();
      bio.replaceChildren();
      lines.forEach((l) => bio.append(el('p', l.className, l.text)));
      formEl.hidden = false;
      inputEl.focus({ preventScroll: true });
      scrollToBottom();
    };

    if (!animate || prefersReducedMotion()) {
      renderInstant();
      return;
    }

    introActive = true;
    formEl.hidden = true;

    introSkipHandler = (event) => {
      if (!introActive) return;
      if (event.key === 'Enter' || event.key === 'Escape') {
        event.preventDefault();
        renderInstant();
      }
    };

    let lineIdx = 0;
    let charIdx = 0;
    let currentP = null;

    const step = () => {
      if (!introActive) return;
      if (lineIdx >= lines.length) {
        clearIntroAnimation();
        formEl.hidden = false;
        inputEl.focus({ preventScroll: true });
        scrollToBottom();
        return;
      }

      const spec = lines[lineIdx];
      if (!currentP) {
        currentP = el('p', spec.className, '');
        bio.append(currentP);
      }

      charIdx += 1;
      currentP.textContent = spec.text.slice(0, charIdx);
      scrollToBottom();

      if (charIdx < spec.text.length) {
        introTimers.push(window.setTimeout(step, spec.charMs));
      } else {
        lineIdx += 1;
        charIdx = 0;
        currentP = null;
        introTimers.push(window.setTimeout(step, 240));
      }
    };

    introTimers.push(window.setTimeout(() => {
      if (!introActive) return;
      window.addEventListener('keydown', introSkipHandler);
      step();
    }, 180));
  }

  function appendCommandEcho(rawCmd) {
    const row = el('div', 'term-echo');
    const prompt = el('span', 'term-prompt-label', 'guest@krassnyos:~$');
    const cmd = el('span', 'term-echo-cmd', rawCmd);
    row.append(prompt, ' ', cmd);
    outputEl.append(row);
  }

  function appendBlock(builder) {
    const block = el('div', 'term-block');
    builder(block);
    outputEl.append(block);
    scrollToBottom();
  }

  function renderHelp(block) {
    block.append(el('p', 'term-heading', 'Available commands:'));
    const rows = [
      ['whoami', 'Profile summary & current standing'],
      ['neofetch', 'System specs + ASCII emblem'],
      ['projects', 'Featured production & institutional systems'],
      ['cat constancias', 'Production architecture diagram & Case Study'],
      ['cat sigma', 'SIGMA multi-role architecture & Case Study'],
      ['experience', 'Work experience & university mentoring'],
      ['skills', 'Backend, databases, frontend & DevOps stack'],
      ['certs', 'Verified Credly certifications'],
      ['cv', 'Download / open Mateo_Rojas_Resume.pdf'],
      ['contact', 'GitHub, LinkedIn, Credly & email links'],
      ['ls [projects]', 'List virtual home directory files'],
      ['startx / gui', 'Launch KrassnyOS floating desktop & dock'],
      ['doom / tetris', 'Play DOOM (1993) or Tetris in KrassnyOS'],
      ['clear', 'Clear terminal output'],
      ['reboot', 'Replay systemd boot sequence'],
    ];

    const list = el('ul', 'term-cmd-list');
    rows.forEach(([cmd, desc]) => {
      const li = el('li', 'term-cmd-row');
      li.append(el('span', 'term-cmd-name', cmd), el('span', 'term-muted', desc));
      list.append(li);
    });
    block.append(list);
  }

  function renderWhoami(block) {
    block.append(
      el('p', 'term-heading', `${PROFILE.name} — ${PROFILE.role}`),
      el('p', null, `${PROFILE.location} · ${PROFILE.experienceYears} hands-on experience`),
      el('p', 'term-spacer', PROFILE.summary),
      el('p', 'term-muted', `${PROFILE.education.institution} · ${PROFILE.education.degree} (${PROFILE.education.expected})`)
    );
  }

  function renderNeofetch(block) {
    const grid = el('div', 'neofetch-grid');
    const emblem = el('pre', 'ascii-art neofetch-emblem', NEOFETCH_EMBLEM.join('\n'));
    emblem.setAttribute('aria-hidden', 'true');

    const info = el('dl', 'neofetch-specs');
    const specs = [
      ['OS', `${PROFILE.osName} x86_64`],
      ['Kernel', PROFILE.kernel],
      ['WM', PROFILE.wm],
      ['Host', PROFILE.location],
      ['User', PROFILE.name],
      ['Role', PROFILE.role],
      ['Uptime', `${PROFILE.experienceYears} hands-on dev`],
      ['Packages', 'PHP 8.2/8.3, MySQL 8, Slim 4, Python, TS, Docker'],
      ['Education', `${PROFILE.education.institution} (${PROFILE.education.expected})`],
      ['Theme', 'KrassnyOS Dark (Base24)'],
    ];

    specs.forEach(([k, v]) => {
      const row = el('div', 'neofetch-row');
      row.append(el('dt', 'neofetch-key', `${k}:`), el('dd', 'neofetch-val', v));
      info.append(row);
    });

    const swatches = el('div', 'neofetch-swatches');
    swatches.setAttribute('aria-hidden', 'true');
    ['--bg-surface', '--err', '--ok', '--accent', '--info-blue', '--info-cyan', '--fg-primary', '--fg-bright'].forEach(
      (token) => {
        const s = el('span', 'swatch');
        s.style.backgroundColor = `var(${token})`;
        swatches.append(s);
      }
    );
    info.append(swatches);

    grid.append(emblem, info);
    block.append(grid);
  }

  function renderProjects(block) {
    block.append(el('p', 'term-heading', 'Featured Production & Institutional Systems:'));
    PROJECTS.forEach((p, idx) => {
      const card = el('div', 'term-item');
      card.append(
        el('p', 'term-item-title', `0${idx + 1}. ${p.name}`),
        el('p', 'term-meta', `${p.status} · ${p.role} · [${p.visibility}]`),
        el('p', null, p.summary),
        el('p', 'term-tags', `Stack: ${p.stack.join(' · ')}`)
      );
      const links = el('p', 'term-actions');
      links.append('-> ', linkEl(p.url, p.urlLabel));
      if (p.id === 'constancias' || p.id === 'sigma') {
        links.append(`   |   run 'cat ${p.id}' for ASCII diagram`);
      }
      card.append(links);
      block.append(card);
    });
  }

  function renderProjectDetail(block, projectId) {
    const project = PROJECTS.find((p) => p.id === projectId);
    if (!project) return;

    block.append(
      el('p', 'term-heading', project.name),
      el('p', 'term-meta', `${project.status} · ${project.role}`)
    );

    if (projectId === 'constancias' || projectId === 'sigma') {
      const diag = el(
        'pre',
        'ascii-art ascii-diagram',
        projectId === 'constancias' ? ARCH_CONSTANCIAS : ARCH_SIGMA
      );
      diag.setAttribute('aria-hidden', 'true');
      block.append(diag);
    }

    const ul = el('ul', 'term-bullets');
    project.architecturePoints.forEach((pt) => ul.append(el('li', null, pt)));
    block.append(ul);

    const linkRow = el('p', 'term-actions');
    linkRow.append('Case Study -> ', linkEl(project.url, project.url));
    block.append(linkRow);
  }

  function renderExperience(block) {
    block.append(el('p', 'term-heading', 'Experience & Leadership:'));
    EXPERIENCE.forEach((exp) => {
      const item = el('div', 'term-item');
      item.append(
        el('p', 'term-item-title', `${exp.role} — ${exp.organization}`),
        el('p', 'term-meta', `${exp.period} · ${exp.badge}`)
      );
      const ul = el('ul', 'term-bullets');
      exp.highlights.forEach((h) => ul.append(el('li', null, h)));
      item.append(ul);
      if (exp.caseStudyUrl) {
        const ref = el('p', 'term-actions');
        ref.append('Case Study -> ', linkEl(exp.caseStudyUrl, 'constancias/README.md'));
        item.append(ref);
      }
      block.append(item);
    });
  }

  function renderSkills(block) {
    block.append(el('p', 'term-heading', 'Technical Stack:'));
    SKILLS.forEach((group) => {
      const p = el('p', 'term-skill-line');
      p.append(
        el('span', 'term-accent', `${group.category}: `),
        document.createTextNode(group.items.join(', '))
      );
      block.append(p);
    });
  }

  function renderCerts(block) {
    block.append(el('p', 'term-heading', 'Certifications & Verified Credly Badges:'));
    CERTIFICATIONS.forEach((cert) => {
      const row = el('p', 'term-cert-row');
      row.append(
        el('span', 'term-accent', `* ${cert.name}`),
        ` — ${cert.issuer} (${cert.period})`
      );
      if (cert.url) {
        row.append('  ', linkEl(cert.url, '[Verify on Credly]'));
      }
      block.append(row);
    });
  }

  function renderContact(block) {
    block.append(el('p', 'term-heading', 'Contact & Verified Profiles:'));
    const items = [
      ['Email', `mailto:${PROFILE.contact.email}`, PROFILE.contact.email],
      ['GitHub', PROFILE.contact.github, 'github.com/MateoRojas1054'],
      ['Case Studies', PROFILE.contact.caseStudies, 'github.com/MateoRojas1054/architecture-case-studies'],
      ['LinkedIn', PROFILE.contact.linkedin, 'linkedin.com/in/mateorojas1054'],
      ['Credly', PROFILE.contact.credly, 'credly.com/users/mateorojas1054'],
    ];
    items.forEach(([label, href, text]) => {
      const p = el('p', 'term-contact-row');
      p.append(el('span', 'term-accent', `${label.padEnd(13, ' ')} `), linkEl(href, text));
      block.append(p);
    });
    block.append(el('p', 'term-muted', `Phone: ${PROFILE.contact.phone} · ${PROFILE.location}`));
  }

  function renderCv(block) {
    block.append(
      el('p', 'term-heading', 'Resume / Curriculum Vitae (PDF · 1 Page US-Letter):'),
      el('p', null, 'Includes production experience (constancias), SIGMA architecture, technical stack, La Salle (Expected 2029), and verified Credly badges.')
    );
    const actions = el('p', 'term-actions');
    actions.append(
      linkEl(PROFILE.contact.cvPath, '[Download Mateo_Rojas_Resume.pdf]', true),
      '   |   ',
      linkEl(PROFILE.contact.cvPath, '[Open PDF in New Tab]', false)
    );
    const openLink = actions.querySelectorAll('a')[1];
    if (openLink) {
      openLink.target = '_blank';
      openLink.rel = 'noopener noreferrer';
    }
    block.append(actions);
  }

  function renderLs(block, arg) {
    const clean = (arg || '').replace(/\/$/, '');
    const key = clean === 'projects' || clean === '/home/mateo/projects'
      ? '/home/mateo/projects'
      : '/home/mateo';

    if (clean && clean !== '.' && clean !== '~' && clean !== 'projects' && clean !== '/home/mateo/projects') {
      block.append(el('p', 'term-error', `[ ERR ] ls: cannot access '${arg}': No such file or directory`));
      return;
    }

    const row = el('div', 'term-ls-grid');
    VIRTUAL_FS[key].forEach((entry) => {
      const isDir = entry.endsWith('/');
      row.append(el('span', isDir ? 'term-ls-entry term-ls-dir' : 'term-ls-entry', entry));
    });
    block.append(row);
  }

  function handleCat(block, target) {
    if (!target) {
      block.append(el('p', 'term-error', "[ ERR ] cat: missing file operand. Try 'cat constancias' or 'cat sigma'."));
      return;
    }
    const normalized = target.toLowerCase().replace(/^projects\//, '').replace(/\.(md|txt|json)$/, '');
    if (normalized === 'constancias') return renderProjectDetail(block, 'constancias');
    if (normalized === 'sigma') return renderProjectDetail(block, 'sigma');
    if (normalized === 'case-studies') return renderProjectDetail(block, 'case-studies');
    if (normalized === 'about') return renderWhoami(block);
    if (normalized === 'experience') return renderExperience(block);
    if (normalized === 'skills') return renderSkills(block);
    if (normalized === 'certs' || normalized === 'certifications') return renderCerts(block);
    if (normalized === 'contact') return renderContact(block);
    if (normalized === 'resume' || target.toLowerCase() === 'resume.pdf') return renderCv(block);

    block.append(
      el('p', 'term-error', `[ ERR ] cat: ${target}: No such file or directory. Run 'ls' or 'ls projects'.`)
    );
  }

  let launchTimers = [];

  function clearLaunchTimers() {
    launchTimers.forEach((id) => window.clearTimeout(id));
    launchTimers = [];
  }

  function launchDesktopSequence() {
    clearLaunchTimers();
    outputEl.replaceChildren();

    const steps = [
      'Starting Hyprland Wayland compositor (KrassnyOS)...',
      'Loading KrassnyOS dark theme (#0f0e11 / #feed6c)...',
      'Starting top status bar & workspaces [1..5]...',
      'Initializing floating desktop, dock & app launcher...',
      'Graphical session ready — switching to VT2...',
    ];

    if (prefersReducedMotion()) {
      const list = el('ol', 'boot-log');
      steps.forEach((msg) => {
        const li = el('li', 'boot-line');
        li.append(el('span', 'boot-status', '[  OK  ]'), ' ', el('span', 'boot-msg', msg));
        list.append(li);
      });
      outputEl.append(list);
      onStartDesktop?.();
      return;
    }

    formEl.hidden = true;
    const list = el('ol', 'boot-log');
    outputEl.append(list);

    const stepMs = 310;
    steps.forEach((msg, idx) => {
      const id = window.setTimeout(() => {
        const li = el('li', 'boot-line');
        li.append(el('span', 'boot-status', '[  OK  ]'), ' ', el('span', 'boot-msg', msg));
        list.append(li);
        scrollToBottom();
      }, idx * stepMs);
      launchTimers.push(id);
    });

    const switchId = window.setTimeout(() => {
      formEl.hidden = false;
      onStartDesktop?.();
    }, steps.length * stepMs + 280);
    launchTimers.push(switchId);
  }

  function runCommand(rawInput) {
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    if (history[history.length - 1] !== trimmed) {
      history.push(trimmed);
    }
    historyIdx = history.length;

    appendCommandEcho(trimmed);

    const [cmdRaw, ...rest] = trimmed.split(/\s+/);
    const cmd = cmdRaw.toLowerCase();
    const arg = rest.join(' ');

    switch (cmd) {
      case 'help':
      case '?':
        appendBlock(renderHelp);
        announce?.('Displayed available KrassnyOS commands.');
        break;
      case 'whoami':
      case 'about':
        appendBlock(renderWhoami);
        announce?.('Displayed profile summary.');
        break;
      case 'neofetch':
      case 'fastfetch':
        appendBlock(renderNeofetch);
        announce?.('Displayed KrassnyOS system summary.');
        break;
      case 'projects':
        appendBlock(renderProjects);
        announce?.('Displayed featured projects.');
        break;
      case 'experience':
      case 'exp':
        appendBlock(renderExperience);
        announce?.('Displayed work experience.');
        break;
      case 'skills':
      case 'stack':
        appendBlock(renderSkills);
        announce?.('Displayed technical skills.');
        break;
      case 'certs':
      case 'certifications':
      case 'credly':
        appendBlock(renderCerts);
        announce?.('Displayed verified certifications.');
        break;
      case 'contact':
      case 'links':
        appendBlock(renderContact);
        announce?.('Displayed contact links.');
        break;
      case 'cv':
      case 'resume':
        appendBlock(renderCv);
        announce?.('Displayed resume download links.');
        break;
      case 'ls':
        appendBlock((b) => renderLs(b, arg));
        break;
      case 'cat':
        appendBlock((b) => handleCat(b, arg));
        break;
      case 'clear':
      case 'cls':
        outputEl.replaceChildren();
        announce?.('Cleared terminal output.');
        break;
      case 'doom':
      case 'tetris':
        if (mode === 'drawer') {
          onCloseDrawer?.();
        }
        onLaunchApp?.(cmd);
        break;
      case 'startx':
      case 'gui':
      case 'hyprland':
      case 'desktop':
        if (mode === 'drawer') {
          onCloseDrawer?.();
        } else {
          launchDesktopSequence();
        }
        break;
      case 'tty':
        if (mode === 'drawer') {
          onCloseDrawer?.();
          onReturnTty?.();
        } else {
          appendBlock((b) => b.append(el('p', 'term-muted', 'Already running in KrassnyOS TTY1.')));
        }
        break;
      case 'exit':
        if (mode === 'drawer') {
          onCloseDrawer?.();
        } else {
          appendBlock((b) =>
            b.append(el('p', 'term-muted', "Use 'startx' to launch Desktop GUI or 'reboot' to restart KrassnyOS."))
          );
        }
        break;
      case 'reboot':
        if (mode === 'drawer') onCloseDrawer?.();
        onReboot?.();
        break;
      /* Hidden Easter Eggs (intentionally omitted from help & Tab autocomplete) */
      case 'batman':
      case 'gotham':
      case 'wayne':
        appendBlock((b) => {
          const pre = el('pre', 'ascii-art term-accent', BAT_EMBLEM);
          pre.setAttribute('aria-hidden', 'true');
          b.append(
            pre,
            el('p', 'term-heading', '[ BATCOMPUTER ] Gotham status: secure.'),
            el('p', 'term-muted', '"It\'s not who I am underneath, but what I do that defines me."')
          );
        });
        break;
      case 'arch':
      case 'btw':
        appendBlock((b) => {
          const pre = el('pre', 'ascii-art term-meta', ARCH_EMBLEM);
          pre.setAttribute('aria-hidden', 'true');
          b.append(
            pre,
            el('p', 'term-heading', 'I use Arch, btw.'),
            el('p', 'term-muted', `Kernel ${PROFILE.kernel} · Hyprland · 0 broken packages (today).`)
          );
        });
        break;
      case 'pacman':
        appendBlock((b) => {
          b.append(
            el('p', 'term-accent', ':: Synchronizing package databases...'),
            el('p', null, ' core is up to date'),
            el('p', null, ' extra is up to date'),
            el('p', null, ' krassny is up to date'),
            el('p', 'term-accent', ':: Starting full system upgrade...'),
            el('p', 'term-ok', ' there is nothing to do — I use Arch, btw.')
          );
        });
        break;
      case 'sudo':
        appendBlock((b) => {
          const lowerArg = arg.toLowerCase();
          if (lowerArg.includes('rm -rf')) {
            b.append(el('p', 'term-error', '[ DENIED ] Alfred locked the Batcomputer. Nice try.'));
          } else if (lowerArg.includes('make me a sandwich')) {
            b.append(el('p', 'term-ok', 'Okay. Here is your sandwich.'));
          } else {
            b.append(el('p', 'term-error', 'guest is not in the sudoers file. This incident will be reported to Mateo.'));
          }
        });
        break;
      case 'coffee':
      case 'cafe':
      case 'bogota':
        appendBlock((b) => {
          const pre = el('pre', 'ascii-art term-accent', COFFEE_ART);
          pre.setAttribute('aria-hidden', 'true');
          b.append(
            pre,
            el('p', 'term-heading', 'Brewing Colombian coffee at 2,640m altitude (Bogotá)...'),
            el('p', 'term-muted', 'Status: 418 I\'m a teapot — compiling PHP, Python & TypeScript anyway.')
          );
        });
        break;
      case 'vim':
      case 'nvim':
      case 'vi':
        appendBlock((b) => {
          b.append(
            el('p', 'term-accent', 'Launching Neovim...'),
            el('p', 'term-muted', 'Hint: :q! — returning you safely to krassny-sh before you get trapped.')
          );
        });
        break;
      default:
        appendBlock((b) => {
          b.append(
            el('p', 'term-error', `[ ERR ] krassny-sh: command not found: '${cmdRaw}'. Type 'help' to list available commands.`)
          );
        });
        announce?.(`Command not found: ${cmdRaw}`);
    }
  }

  let tabState = null;

  function resetTabState() {
    tabState = null;
  }

  function handleAutocomplete() {
    const raw = inputEl.value;
    const hasTrailingSpace = /\s$/.test(raw);
    const trimmedStart = raw.trimStart();

    // If cycling an existing multi-match Tab session, advance to next candidate
    if (tabState && inputEl.value === tabState.lastApplied) {
      tabState.index = (tabState.index + 1) % tabState.matches.length;
      const nextVal = `${tabState.prefix}${tabState.matches[tabState.index]}`;
      inputEl.value = nextVal;
      tabState.lastApplied = nextVal;
      return;
    }

    resetTabState();

    // Determine command vs argument completion context
    const tokens = trimmedStart ? trimmedStart.split(/\s+/) : [];
    let prefix = '';
    let fragment = '';
    let pool = [];

    if (tokens.length === 0 || (tokens.length === 1 && !hasTrailingSpace)) {
      fragment = (tokens[0] || '').toLowerCase();
      pool = COMMAND_LIST;
    } else {
      const cmd = tokens[0].toLowerCase();
      fragment = hasTrailingSpace ? '' : (tokens[tokens.length - 1] || '').toLowerCase();
      if (cmd === 'cat') {
        prefix = 'cat ';
        pool = CAT_TARGETS;
      } else if (cmd === 'ls') {
        prefix = 'ls ';
        pool = LS_TARGETS;
      } else {
        return;
      }
    }

    const matches = pool.filter((item) => item.startsWith(fragment));
    if (matches.length === 0) return;

    if (matches.length === 1) {
      const single = matches[0];
      const suffix = prefix === '' && (single === 'cat' || single === 'ls') ? ' ' : '';
      inputEl.value = `${prefix}${single}${suffix}`;
      return;
    }

    const lcp = longestCommonPrefix(matches);
    if (lcp.length > fragment.length) {
      inputEl.value = `${prefix}${lcp}`;
      return;
    }

    // Multiple matches at current prefix: print candidates like Bash/Zsh and cycle on next Tab
    appendCommandEcho(raw || '');
    appendBlock((b) => {
      const row = el('div', 'term-ls-grid');
      matches.forEach((m) => row.append(el('span', 'term-muted', m)));
      b.append(row);
    });

    const firstVal = `${prefix}${matches[0]}`;
    inputEl.value = firstVal;
    tabState = { prefix, matches, index: 0, lastApplied: firstVal };
  }

  // IME-safe Enter handling per modern-web-guidance (ime-safe-enter-submit)
  inputEl.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') {
      resetTabState();
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (event.isComposing || event.keyCode === 229) return;
      formEl.requestSubmit();
      return;
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      handleAutocomplete();
      return;
    }

    if (event.key === 'ArrowUp') {
      if (history.length === 0) return;
      event.preventDefault();
      historyIdx = Math.max(0, historyIdx - 1);
      inputEl.value = history[historyIdx] ?? '';
      return;
    }

    if (event.key === 'ArrowDown') {
      if (history.length === 0) return;
      event.preventDefault();
      historyIdx = Math.min(history.length, historyIdx + 1);
      inputEl.value = history[historyIdx] ?? '';
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      outputEl.replaceChildren();
    }
  });

  formEl.addEventListener('submit', (event) => {
    event.preventDefault();
    const cmd = inputEl.value;
    inputEl.value = '';
    runCommand(cmd);
  });

  rootEl.addEventListener('click', (event) => {
    const interactive = event.target.closest('a, button, input');
    if (interactive) return;
    if (window.getSelection()?.toString()) return;
    inputEl.focus({ preventScroll: true });
  });

  renderWelcome({ animate: false });

  return {
    runCommand,
    reset: (opts) => renderWelcome(opts),
    playIntro: () => renderWelcome({ animate: true }),
    stopIntro: () => {
      clearIntroAnimation();
      clearLaunchTimers();
      formEl.hidden = false;
    },
    focus: () => {
      if (!formEl.hidden) inputEl.focus({ preventScroll: true });
    },
  };
}
