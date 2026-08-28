"use strict";

(function () {
  const PROJECTS = [
    { name: "accesslab", status: "complete", desc: "Diploma project — a source-of-truth system for tracking the live status of lab equipment. Custom REST API (Django) with a Vue frontend." },
    { name: "myNetwork", status: "live", desc: "Home network segmented with VLANs and firewall rules, isolating server, flatmate, and guest traffic from each other." },
    { name: "myCloud", status: "live", desc: "Self-hosted Immich (LXC) for photo backup, plus a Terraform + Ansible IaC setup that rebuilds the homelab from scratch on a second server." },
    { name: "k3s-cluster", status: "live", desc: "Two-node k3s cluster running across two repurposed Optiplex minis." },
    { name: "netmon", status: "complete", desc: "Network monitoring tool, written in Python." },
    { name: "tcp-proxy", status: "complete", desc: "A TCP proxy, written in C++." },
    { name: "static-site-generator", status: "in progress", desc: "A from-scratch static site generator, written in Go — this page is a stand-in until it ships." },
    { name: "ai-site-agents", status: "in progress", desc: "A multi-agent AI system that turns a written architecture into a generated static site." },
  ];

  const BIO_LINES = [
    "Mateusz Jaroch — Telecommunications & IT Engineer",
    "Passionate about art, history, and cybersecurity. Currently growing into a systems, network, and cloud engineer. Looking to work alongside people who share these interests, and to build projects that make life a little easier for everyone.",
  ];

  const CONTACT_LINKS = [
    { label: "GitHub", href: "https://github.com/mateuszjaroch" },
    { label: "LinkedIn", href: "https://pl.linkedin.com/in/mateusz-jaroch-2ba500353" },
    { label: "Email", href: "mailto:mateusz.jaroch21@gmail.com" },
  ];

  function renderAbout(container) {
    BIO_LINES.forEach((text) => {
      const p = document.createElement("p");
      p.textContent = text;
      container.appendChild(p);
    });
  }

  function renderProjects(container) {
    PROJECTS.forEach((p) => {
      const row = document.createElement("div");
      row.className = "gui-list-row";

      const top = document.createElement("div");
      top.className = "gui-list-toprow";
      const name = document.createElement("span");
      name.textContent = p.name;
      const status = document.createElement("span");
      status.className = "gui-list-status";
      status.textContent = p.status;
      top.appendChild(name);
      top.appendChild(status);

      const desc = document.createElement("div");
      desc.className = "gui-list-desc";
      desc.textContent = p.desc;

      row.appendChild(top);
      row.appendChild(desc);
      container.appendChild(row);
    });
  }

  function renderContact(container) {
    CONTACT_LINKS.forEach((l) => {
      const row = document.createElement("div");
      row.className = "gui-contact-row";
      row.appendChild(document.createTextNode(`${l.label}: `));
      const a = document.createElement("a");
      a.href = l.href;
      a.textContent = l.href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      row.appendChild(a);
      container.appendChild(row);
    });
  }

  // Only the first entry is a real link; the rest are decorative flavor
  // text (no fabricated URLs) until there are more real ones to add.
  const SEARCH_HISTORY = [
    {
      title: "Moment Napięcia — ZPAF Poznań",
      url: "www.zpafpoznan.pl/momentnapiecie",
      href: "https://www.zpafpoznan.pl/momentnapiecie",
    },
    { title: "best homelab setups 2026", url: "search history" },
    { title: "k3s two-node cluster tutorial", url: "search history" },
  ];

  function renderBrowser(container) {
    const bar = document.createElement("div");
    bar.className = "browser-searchbar";
    const icon = document.createElement("span");
    icon.className = "browser-search-icon";
    const input = document.createElement("input");
    input.type = "text";
    input.readOnly = true;
    input.value = "moment napięcia zpaf poznań";
    bar.appendChild(icon);
    bar.appendChild(input);

    const label = document.createElement("div");
    label.className = "browser-history-label";
    label.textContent = "Recent searches";

    const list = document.createElement("div");
    list.className = "browser-history-list";

    SEARCH_HISTORY.forEach((h) => {
      const row = document.createElement(h.href ? "a" : "div");
      row.className = "browser-history-item";
      if (h.href) {
        row.href = h.href;
        row.target = "_blank";
        row.rel = "noopener noreferrer";
      }
      const dot = document.createElement("span");
      dot.className = "history-icon";
      const text = document.createElement("div");
      const title = document.createElement("div");
      title.className = "history-title";
      title.textContent = h.title;
      const url = document.createElement("div");
      url.className = "history-url";
      url.textContent = h.url;
      text.appendChild(title);
      text.appendChild(url);
      row.appendChild(dot);
      row.appendChild(text);
      list.appendChild(row);
    });

    container.appendChild(bar);
    container.appendChild(label);
    container.appendChild(list);
  }

  const APPS = [
    { id: "about", title: "About Me", iconClass: "icon-about", render: renderAbout },
    { id: "projects", title: "Projects", iconClass: "icon-projects", render: renderProjects },
    { id: "contact", title: "Contact", iconClass: "icon-contact", render: renderContact, width: "min(460px, 92vw)" },
    // "Internet" (globe icon, renderBrowser) removed from the desktop for
    // now — renderBrowser/SEARCH_HISTORY above are kept so it's a one-line
    // re-add: { id: "browser", title: "Internet", iconClass: "icon-globe", render: renderBrowser, width: "min(480px, 92vw)" },
    { id: "terminal", title: "Terminal", iconClass: "icon-terminal", glyph: ">_", returnToCli: true },
  ];

  const $installer = document.getElementById("gui-installer");
  const $desktop = document.getElementById("gui-desktop");

  let desktopBuilt = false;
  let $topbarTitle = null;
  let $clock = null;
  let $icons = null;
  let $windows = null;
  let $taskbarWindows = null;
  let $menuPopup = null;
  let $menuButton = null;

  const openWindows = new Map(); // id -> { el, titlebar, title, minimized }
  let zCounter = 10;

  function isMobile() {
    return window.innerWidth < 700;
  }

  function returnToTerminal() {
    $desktop.hidden = true;
    document.getElementById("terminal").hidden = false;
    if (typeof window.focusTerminalInput === "function") window.focusTerminalInput();
  }

  function openApp(app) {
    if (app.returnToCli) {
      returnToTerminal();
      return;
    }
    if (openWindows.has(app.id)) {
      const w = openWindows.get(app.id);
      w.minimized = false;
      w.el.hidden = false;
      focusWindow(app.id);
      updateTaskbar();
      return;
    }
    const record = buildWindow(app);
    $windows.appendChild(record.el);
    openWindows.set(app.id, record);
    focusWindow(app.id);
    updateTaskbar();
  }

  function buildWindow(app) {
    const el = document.createElement("div");
    el.className = "gui-window";
    if (isMobile()) {
      // full-screen on small viewports — inline left/top/width below would
      // otherwise override the "maximized" class's positioning, since
      // inline styles always beat an external stylesheet rule
      el.classList.add("maximized");
    } else {
      const offset = 24 * (openWindows.size % 6);
      el.style.left = `${40 + offset}px`;
      el.style.top = `${30 + offset}px`;
      if (app.width) el.style.width = app.width;
    }

    const titlebar = document.createElement("div");
    titlebar.className = "gui-titlebar";

    const closeBtn = document.createElement("button");
    closeBtn.className = "gui-win-btn gui-win-close";
    closeBtn.setAttribute("aria-label", "close");
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeApp(app.id);
    });

    const minimizeBtn = document.createElement("button");
    minimizeBtn.className = "gui-win-btn gui-win-minimize";
    minimizeBtn.setAttribute("aria-label", "minimize");
    minimizeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      minimizeOrRestore(app.id);
    });

    const titleText = document.createElement("span");
    titleText.className = "gui-titlebar-text";
    titleText.textContent = app.title;

    titlebar.appendChild(closeBtn);
    titlebar.appendChild(minimizeBtn);
    titlebar.appendChild(titleText);

    const content = document.createElement("div");
    content.className = "gui-window-content";
    app.render(content);

    el.appendChild(titlebar);
    el.appendChild(content);

    el.addEventListener("pointerdown", () => focusWindow(app.id));
    makeDraggable(el, titlebar);

    return { el, titlebar, title: app.title, minimized: false };
  }

  function makeDraggable(el, handle) {
    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    handle.addEventListener("pointerdown", (e) => {
      // don't hijack clicks on the close/minimize buttons — capturing the
      // pointer here would reroute their click event away from them
      if (isMobile() || e.target.closest(".gui-win-btn")) return;
      dragging = true;
      offsetX = e.clientX - el.offsetLeft;
      offsetY = e.clientY - el.offsetTop;
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      el.style.left = `${Math.max(0, e.clientX - offsetX)}px`;
      el.style.top = `${Math.max(0, e.clientY - offsetY)}px`;
    });
    const stop = () => {
      dragging = false;
    };
    handle.addEventListener("pointerup", stop);
    handle.addEventListener("pointercancel", stop);
  }

  function focusWindow(id) {
    const w = openWindows.get(id);
    if (!w) return;
    zCounter += 1;
    w.el.style.zIndex = String(zCounter);
    openWindows.forEach((other) => other.titlebar.classList.remove("active"));
    w.titlebar.classList.add("active");
    $topbarTitle.textContent = w.title;
  }

  function closeApp(id) {
    const w = openWindows.get(id);
    if (!w) return;
    w.el.remove();
    openWindows.delete(id);
    if ($topbarTitle.textContent === w.title) $topbarTitle.textContent = "Desktop";
    updateTaskbar();
  }

  function minimizeOrRestore(id) {
    const w = openWindows.get(id);
    if (!w) return;
    w.minimized = !w.minimized;
    w.el.hidden = w.minimized;
    if (!w.minimized) focusWindow(id);
    updateTaskbar();
  }

  function updateTaskbar() {
    while ($taskbarWindows.firstChild) $taskbarWindows.removeChild($taskbarWindows.firstChild);
    openWindows.forEach((w, id) => {
      const btn = document.createElement("button");
      btn.className = "gui-taskbar-btn" + (w.minimized ? "" : " active");
      btn.textContent = w.title;
      btn.addEventListener("click", () => minimizeOrRestore(id));
      $taskbarWindows.appendChild(btn);
    });
  }

  function toggleMenu(forceClose) {
    const willOpen = forceClose ? false : $menuPopup.hidden;
    $menuPopup.hidden = !willOpen;
    $menuButton.classList.toggle("open", willOpen);
  }

  const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function updateClock() {
    const now = new Date();
    const weekday = WEEKDAYS[now.getDay()];
    const month = MONTHS[now.getMonth()];
    const day = now.getDate();
    let hours = now.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const mm = String(now.getMinutes()).padStart(2, "0");
    $clock.textContent = `${weekday} ${month} ${day}  ${hours}:${mm} ${ampm}`;
  }

  function buildDesktop() {
    const topbar = document.createElement("div");
    topbar.className = "gui-topbar";
    $topbarTitle = document.createElement("span");
    $topbarTitle.textContent = "Desktop";
    $clock = document.createElement("span");
    $clock.className = "gui-clock";
    topbar.appendChild($topbarTitle);
    topbar.appendChild($clock);

    const body = document.createElement("div");
    body.className = "gui-body";

    $icons = document.createElement("div");
    $icons.className = "gui-icons";
    APPS.forEach((app) => {
      const btn = document.createElement("button");
      btn.className = "gui-icon";
      const glyph = document.createElement("div");
      glyph.className = `gui-icon-glyph ${app.iconClass}`;
      if (app.glyph) {
        const glyphText = document.createElement("span");
        glyphText.className = "gui-icon-glyph-text";
        glyphText.textContent = app.glyph;
        glyph.appendChild(glyphText);
      }
      const label = document.createElement("div");
      label.className = "gui-icon-label";
      label.textContent = app.title;
      btn.appendChild(glyph);
      btn.appendChild(label);
      btn.addEventListener("click", () => openApp(app));
      $icons.appendChild(btn);
    });

    $windows = document.createElement("div");
    $windows.className = "gui-windows";

    body.appendChild($icons);
    body.appendChild($windows);

    const taskbar = document.createElement("div");
    taskbar.className = "gui-taskbar";

    $menuButton = document.createElement("button");
    $menuButton.className = "gui-menu-button";
    $menuButton.textContent = "Menu";
    $menuButton.addEventListener("click", () => toggleMenu());

    $menuPopup = document.createElement("div");
    $menuPopup.className = "gui-menu-popup";
    $menuPopup.hidden = true;
    APPS.forEach((app) => {
      const item = document.createElement("button");
      item.textContent = app.returnToCli ? "Return to Terminal" : app.title;
      item.addEventListener("click", () => {
        toggleMenu(true);
        openApp(app);
      });
      $menuPopup.appendChild(item);
    });

    $taskbarWindows = document.createElement("div");
    $taskbarWindows.className = "gui-taskbar-windows";

    taskbar.appendChild($menuButton);
    taskbar.appendChild($menuPopup);
    taskbar.appendChild($taskbarWindows);

    document.addEventListener("pointerdown", (e) => {
      if (!$menuPopup.hidden && !$menuPopup.contains(e.target) && e.target !== $menuButton) {
        toggleMenu(true);
      }
    });

    $desktop.appendChild(topbar);
    $desktop.appendChild(body);
    $desktop.appendChild(taskbar);

    updateClock();
    setInterval(updateClock, 15000);

    desktopBuilt = true;
  }

  function showDesktop() {
    if (!desktopBuilt) buildDesktop();
    $desktop.hidden = false;
    // no auto-opened window — one used to cover the desktop icons
    // underneath it, making About/Projects/Contact seem unclickable
  }

  window.launchGuiInstaller = function launchGuiInstaller() {
    return new Promise((resolve) => {
      while ($installer.firstChild) $installer.removeChild($installer.firstChild);

      const box = document.createElement("div");
      box.className = "installer-box";

      const title = document.createElement("div");
      title.className = "installer-title";
      title.textContent = "Setting up your new desktop...";

      const track = document.createElement("div");
      track.className = "installer-progress-track";
      const fill = document.createElement("div");
      fill.className = "installer-progress-fill";
      track.appendChild(fill);

      const log = document.createElement("div");
      log.className = "installer-log";

      box.appendChild(title);
      box.appendChild(track);
      box.appendChild(log);
      $installer.appendChild(box);
      $installer.hidden = false;

      const FILES = [
        "GUI32.DLL", "WIDGETS.SYS", "DESKTOP.CPL", "SHELL32.OCX", "PLATINUM.RSRC",
        "ICONLIB.BIN", "WINMGR.EXE", "FONTS.PFB", "TASKBAR.DLL", "SOUND.DRV",
        "CHROME.RES", "BEVEL.DAT",
      ];
      const DURATION = 4200;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const pct = Math.min(100, (elapsed / DURATION) * 100);
        fill.style.width = `${pct}%`;

        if (Math.random() > 0.45) {
          const line = document.createElement("div");
          line.textContent = `Copying: ${FILES[Math.floor(Math.random() * FILES.length)]}`;
          log.appendChild(line);
          log.scrollTop = log.scrollHeight;
          while (log.children.length > 30) log.removeChild(log.firstChild);
        }

        if (elapsed < DURATION) {
          requestAnimationFrame(tick);
        } else {
          setTimeout(() => {
            $installer.hidden = true;
            document.getElementById("terminal").hidden = true;
            showDesktop();
            resolve();
          }, 250);
        }
      }
      requestAnimationFrame(tick);
    });
  };
})();
