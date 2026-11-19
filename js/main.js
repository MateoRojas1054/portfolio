/**
 * main.js
 * Orchestrates KrassnyOS view transitions (Boot -> TTY <-> Hyprland Desktop),
 * programmatic focus routing, and centralized polite announcements.
 */

import { createBootController } from './boot.js';
import { createTerminal } from './terminal.js';
import { initDesktop } from './desktop.js';

document.addEventListener('DOMContentLoaded', () => {
  const viewBoot = document.getElementById('view-boot');
  const viewTty = document.getElementById('view-tty');
  const viewDesktop = document.getElementById('view-desktop');
  const announcer = document.getElementById('sr-announcer');

  let currentView = null;

  function announce(message) {
    if (!announcer) return;
    announcer.textContent = '';
    window.setTimeout(() => {
      announcer.textContent = message;
    }, 30);
  }

  function applyViewState(nextView) {
    currentView = nextView;
    viewBoot.hidden = nextView !== 'boot';
    viewTty.hidden = nextView !== 'tty';
    viewDesktop.hidden = nextView !== 'desktop';
    document.body.dataset.view = nextView;

    if (nextView === 'boot') {
      document.title = 'Booting KrassnyOS | Mateo Rojas Martinez';
    } else if (nextView === 'tty') {
      document.title = 'KrassnyOS TTY | Mateo Rojas Martinez';
      if (location.hash !== '#tty') history.replaceState(null, '', '#tty');
    } else if (nextView === 'desktop') {
      document.title = 'KrassnyOS Desktop | Mateo Rojas Martinez';
      if (location.hash !== '#desktop') history.replaceState(null, '', '#desktop');
    }
  }

  function focusAfterView(nextView) {
    if (nextView === 'tty') {
      ttyTerminal.focus();
    } else if (nextView === 'desktop') {
      desktop.onEnterDesktop();
    }
  }

  let ttyIntroPlayed = false;

  function switchView(nextView) {
    if (nextView === currentView) return;
    if (currentView === 'tty') ttyTerminal.stopIntro();
    applyViewState(nextView);
    if (nextView === 'tty' && !ttyIntroPlayed) {
      ttyIntroPlayed = true;
      ttyTerminal.playIntro();
    } else {
      focusAfterView(nextView);
    }
  }

  const boot = createBootController({
    container: viewBoot,
    logEl: document.getElementById('boot-log'),
    onComplete: () => {
      switchView('tty');
      announce('KrassnyOS terminal ready. Type help for available commands or startx for desktop.');
    },
  });

  const desktop = initDesktop({
    desktopRoot: viewDesktop,
    stageEl: document.getElementById('desktop-stage'),
    workspacesEl: document.getElementById('waybar-workspaces'),
    clockEl: document.getElementById('waybar-clock'),
    activeTitleEl: document.getElementById('waybar-active-window'),
    toastEl: document.getElementById('desktop-toast'),
    wallpaperEl: document.getElementById('wallpaper-emblem'),
    iconsEl: document.getElementById('desktop-icons'),
    windowsLayerEl: document.getElementById('desktop-windows'),
    dockEl: document.getElementById('desktop-dock'),
    launcherDialog: document.getElementById('app-launcher'),
    launcherSearch: document.getElementById('launcher-search'),
    launcherGrid: document.getElementById('launcher-grid'),
    launcherCloseBtn: document.getElementById('launcher-close-btn'),
    waybarLauncherBtn: document.getElementById('waybar-launcher-btn'),
    drawerDialog: document.getElementById('terminal-drawer'),
    closeDrawerBtn: document.getElementById('close-drawer-btn'),
    ttyBtn: document.getElementById('return-tty-btn'),
    onReturnTty: () => {
      switchView('tty');
      announce('Returned to KrassnyOS TTY terminal.');
    },
    onOpenDrawer: () => drawerTerminal.focus(),
    announce,
  });

  const ttyTerminal = createTerminal({
    rootEl: viewTty,
    outputEl: document.getElementById('tty-output'),
    formEl: document.getElementById('tty-form'),
    inputEl: document.getElementById('tty-input'),
    mode: 'tty',
    announce,
    onStartDesktop: () => {
      switchView('desktop');
      announce('Launched KrassnyOS Hyprland desktop.');
    },
    onLaunchApp: (appId) => {
      switchView('desktop');
      desktop.openApp(appId);
    },
    onReboot: () => {
      ttyIntroPlayed = false;
      ttyTerminal.reset({ animate: false });
      switchView('boot');
      boot.start();
    },
  });

  const drawerTerminal = createTerminal({
    rootEl: document.getElementById('drawer-terminal-body'),
    outputEl: document.getElementById('drawer-output'),
    formEl: document.getElementById('drawer-form'),
    inputEl: document.getElementById('drawer-input'),
    mode: 'drawer',
    announce,
    onReturnTty: () => {
      switchView('tty');
      announce('Returned to KrassnyOS TTY terminal.');
    },
    onCloseDrawer: () => desktop.closeDrawer(),
    onLaunchApp: (appId) => {
      desktop.closeDrawer();
      desktop.openApp(appId);
    },
    onReboot: () => {
      ttyIntroPlayed = false;
      ttyTerminal.reset({ animate: false });
      switchView('boot');
      boot.start();
    },
  });

  // Ctrl+` toggles the floating terminal drawer while in Desktop mode
  window.addEventListener('keydown', (event) => {
    if (currentView !== 'desktop') return;
    if (event.ctrlKey && event.key === '`') {
      event.preventDefault();
      const dlg = document.getElementById('terminal-drawer');
      if (dlg.open) desktop.closeDrawer();
      else desktop.openDrawer();
    }
  });

  // Sync browser Back/Forward hash navigation (#tty <-> #desktop)
  window.addEventListener('hashchange', () => {
    if (location.hash === '#desktop' && currentView !== 'desktop') {
      switchView('desktop');
    } else if (location.hash === '#tty' && currentView !== 'tty') {
      switchView('tty');
    }
  });

  // Initial route based on URL hash (allowing direct links to #desktop or #tty)
  if (location.hash === '#desktop') {
    applyViewState('desktop');
    focusAfterView('desktop');
  } else if (location.hash === '#tty') {
    applyViewState('tty');
    ttyIntroPlayed = true;
    ttyTerminal.playIntro();
  } else {
    applyViewState('boot');
    boot.start();
  }
});
