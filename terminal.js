"use strict";

const PROMPT = "root@promatheus:~$";
const LOCATE_ENDPOINT = "https://ipwho.is/";

// "#" = front face, "/" = a bevelled bottom/right edge trailing off the
// silhouette (not every stroke) — reads as a flat 3D block, not clutter.
const ASCII_BANNER_LINES = [
  "     ##   ###   ######   #####   #####  ##   ##  ",
  "     ##  ## ##  ##   ## ##   ## ##   ## ##   ##/ ",
  "     ## ##   ## ##   ## ##   ## ##      ##   ##//",
  "     ## ####### ######  ##   ## ##      #######//",
  "##   ## ## //## ## /##  ##   ## ##      ## //##//",
  "##   ## ##  /## ##  /## ##   ## ##   ## ##  /##//",
  " ##### /##   ## ##   ##  ##### / ##### /##   ##//",
  "  ///// ///   // //   //  ///// / ///// ///   ///",
  "   /////  //   // //   //  /////   /////  //   //",
];

function printAsciiBanner() {
  const pre = document.createElement("pre");
  pre.className = "ascii-banner";
  ASCII_BANNER_LINES.forEach((line, idx) => {
    for (const run of line.match(/#+|\/+|[^#/]+/g) || []) {
      if (run[0] === "#" || run[0] === "/") {
        const span = document.createElement("span");
        span.className = run[0] === "#" ? "banner-front" : "banner-depth";
        span.textContent = run;
        pre.appendChild(span);
      } else {
        pre.appendChild(document.createTextNode(run));
      }
    }
    if (idx < ASCII_BANNER_LINES.length - 1) pre.appendChild(document.createTextNode("\n"));
  });
  $output.appendChild(pre);
}

const $output = document.getElementById("output");
const $terminal = document.getElementById("terminal");

const history = [];
let historyIndex = 0;
let activeInput = null;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function scrollToBottom() {
  $output.scrollTop = $output.scrollHeight;
}

// All dynamic/user-derived content goes through textContent, never innerHTML,
// so a typed command (e.g. an IP argument) can never be interpreted as markup.
function printLine(text, className) {
  const div = document.createElement("div");
  div.className = className ? `line ${className}` : "line";
  div.textContent = text;
  $output.appendChild(div);
  scrollToBottom();
}

function printLines(lines, className) {
  lines.forEach((line) => printLine(line, className));
}

function printLinkLine(label, url) {
  const div = document.createElement("div");
  div.className = "line";
  div.appendChild(document.createTextNode(`${label}: `));
  const a = document.createElement("a");
  a.href = url;
  a.textContent = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  div.appendChild(a);
  $output.appendChild(div);
  scrollToBottom();
}

const IPV4_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
function isValidIPv4(str) {
  const match = IPV4_RE.exec(str);
  if (!match) return false;
  return match.slice(1).every((octet) => Number(octet) <= 255);
}

const commands = {
  help: {
    description: "list available commands",
    async run() {
      printLines([
        "Available commands:",
        "  help, man          show this help message",
        "  whoami, about      who I am",
        "  ls, projects       list projects in progress",
        "  contact            how to reach me",
        "  locate <ip>        geolocate an IPv4 address",
        "  clear              clear the screen",
      ]);
    },
  },

  whoami: {
    description: "who I am",
    async run() {
      printLines([
        "Mateusz Jaroch — Telecommunications & IT Engineer",
        "",
        "Passionate about art, history, and cybersecurity. Currently growing",
        "into a systems, network, and cloud engineer. Looking to work",
        "alongside people who share these interests, and to build projects",
        "that make life a little easier for everyone.",
      ]);
    },
  },

  ls: {
    description: "list projects",
    async run() {
      printLines([
        "projects/",
        "  accesslab/               diploma project — a source-of-truth system for",
        "                           tracking the live status of lab equipment.",
        "                           custom REST API (Django) with a Vue frontend.",
        "                           status: complete",
        "",
        "  myNetwork/               home network segmented with VLANs and firewall",
        "                           rules, isolating server, flatmate, and guest",
        "                           traffic from each other.",
        "                           status: live",
        "",
        "  myCloud/                 self-hosted Immich (LXC) for photo backup, plus",
        "                           a Terraform + Ansible IaC setup that rebuilds the",
        "                           homelab from scratch on a second server.",
        "                           status: live",
        "",
        "  k3s-cluster/             two-node k3s cluster running across two",
        "                           repurposed Optiplex minis.",
        "                           status: live",
        "",
        "  netmon/                  network monitoring tool, written in Python.",
        "                           status: complete",
        "",
        "  tcp-proxy/               a TCP proxy, written in C++.",
        "                           status: complete",
        "",
        "  static-site-generator/   a from-scratch static site generator, written",
        "                           in Go — this page is a stand-in until it ships.",
        "                           status: in progress",
        "",
        "  ai-site-agents/          a multi-agent AI system that turns a written",
        "                           architecture into a generated static site.",
        "                           status: in progress",
      ]);
    },
  },

  contact: {
    description: "how to reach me",
    async run() {
      printLine("Reach me at:");
      printLinkLine("GitHub", "https://github.com/mateuszjaroch");
      printLinkLine("LinkedIn", "https://pl.linkedin.com/in/mateusz-jaroch-2ba500353");
      printLinkLine("Email", "mailto:mateusz.jaroch21@gmail.com");
    },
  },

  clear: {
    description: "clear the screen",
    async run() {
      $output.innerHTML = "";
    },
  },

  locate: {
    description: "geolocate an IPv4 address",
    async run(args) {
      if (args.length === 0) {
        printLine("usage: locate <ipv4-address>", "error");
        return;
      }
      const ip = args[0];
      if (!isValidIPv4(ip)) {
        printLine(`locate: "${ip}" is not a valid IPv4 address`, "error");
        return;
      }

      printLine(`Looking up ${ip} ...`, "dim");

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      try {
        const res = await fetch(`${LOCATE_ENDPOINT}${ip}`, { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error(`http ${res.status}`);
        const data = await res.json();

        if (data.success === false) {
          printLine(`locate: lookup failed — ${data.message || "target could not be resolved"}`, "error");
          return;
        }

        printLines([
          `ip:        ${data.ip ?? ip}`,
          `country:   ${data.country ?? "unknown"} (${data.country_code ?? "??"})`,
          `region:    ${data.region ?? "unknown"}`,
          `city:      ${data.city ?? "unknown"}`,
          `coords:    ${data.latitude ?? "?"}, ${data.longitude ?? "?"}`,
          `isp/org:   ${data.connection?.isp ?? data.connection?.org ?? "unknown"}`,
          `timezone:  ${data.timezone?.id ?? "unknown"}`,
        ]);
      } catch (err) {
        clearTimeout(timeout);
        if (err.name === "AbortError") {
          printLine("locate: request timed out — target may be evading detection.", "error");
        } else {
          printLine("locate: lookup failed — network error.", "error");
        }
      }
    },
  },
};

commands.man = commands.help;
commands.about = commands.whoami;
commands.projects = commands.ls;

async function handleCommand(raw) {
  const trimmed = raw.trim();
  if (trimmed === "") return;

  history.push(trimmed);
  historyIndex = history.length;

  const [cmd, ...args] = trimmed.split(/\s+/);
  const key = cmd.toLowerCase();
  const command = commands[key];

  if (!command) {
    printLine(`command not found: ${cmd}`, "error");
    printLine("Type 'help' to see available commands.", "dim");
    return;
  }

  await command.run(args);
}

function finalizeActiveLine(input, raw) {
  const line = input.parentElement;
  const span = document.createElement("span");
  span.textContent = raw;
  input.replaceWith(span);
  line.classList.remove("active-line");
}

function createActiveLine() {
  const line = document.createElement("div");
  line.className = "line active-line";

  const promptSpan = document.createElement("span");
  promptSpan.className = "prompt";
  promptSpan.textContent = `${PROMPT} `;

  const input = document.createElement("input");
  input.type = "text";
  input.className = "cmd-input";
  input.autocomplete = "off";
  input.autocapitalize = "off";
  input.spellcheck = false;
  input.setAttribute("aria-label", "terminal input");

  line.appendChild(promptSpan);
  line.appendChild(input);
  $output.appendChild(line);

  input.addEventListener("keydown", onInputKeydown);

  activeInput = input;
  scrollToBottom();
  return input;
}

async function onInputKeydown(e) {
  const input = e.currentTarget;

  if (e.key === "Enter") {
    e.preventDefault();
    const raw = input.value;
    input.disabled = true;
    finalizeActiveLine(input, raw);
    await handleCommand(raw);
    createActiveLine().focus();
    return;
  }

  if (e.key === "ArrowUp") {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      input.value = history[historyIndex];
    }
    return;
  }

  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (historyIndex < history.length - 1) {
      historyIndex++;
      input.value = history[historyIndex];
    } else {
      historyIndex = history.length;
      input.value = "";
    }
  }
}

$terminal.addEventListener("click", () => {
  const selection = window.getSelection();
  if (selection && selection.toString().length > 0) return;
  if (activeInput) activeInput.focus();
});

async function startTerminal() {
  printAsciiBanner();
  const lines = [
    "Connecting to promatheus...",
    "Initializing terminal session... [OK]",
    `Loading profile: ${PROMPT.replace(":~$", "")}... [OK]`,
    "",
    "Welcome. Type 'help' to see available commands.",
  ];
  for (const line of lines) {
    printLine(line, line.startsWith("Welcome") ? undefined : "dim");
    await delay(140);
  }
  createActiveLine().focus();
}

startTerminal();
