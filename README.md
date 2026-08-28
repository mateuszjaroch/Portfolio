# Portfolio

A temporary, interactive terminal-style portfolio page — a stand-in until
[myWeb](https://github.com/mateuszjaroch/myWeb), a Go static site
generator, is ready to build the real thing.

Pure HTML/CSS/JS, no build step, no dependencies.

## Files

- `index.html` — page shell, terminal container, GUI/installer mount points
- `style.css` — CRT green terminal theme, responsive
- `terminal.js` — static JAROCH ASCII-art banner (no animation, no
  glow) printed above the boot sequence, plus the command loop,
  history, a real IPv4 geolocation lookup (`locate`) via the free
  [ipwho.is](https://ipwho.is) API (no key required), and `apt install
  gui` (a fake package-install animation that hands off to `gui.js`)
- `gui.css` / `gui.js` — a retro desktop for recruiters who'd rather
  click than type: window chrome/taskbar borrow the Windows 98
  3D-bevel look, the top menu bar/clock and left-side window controls
  borrow the classic Mac OS "Platinum" look. Purely a visual homage —
  no real logos or system names. Icons for About/Projects/Contact
  open draggable windows (close + minimize buttons together in the
  title bar); a "Terminal" icon returns to the CLI. Windows go
  full-screen (no dragging) below 700px viewport width. The desktop
  opens with no window pre-opened, so it never covers its own icons.
  An "Internet" app (mock search page with a search-history list,
  `renderBrowser`/`SEARCH_HISTORY` in `gui.js`) is implemented but
  currently not on the desktop — re-add its entry to the `APPS` array
  to bring it back.

## Run locally

Any static file server works, e.g.:

```bash
npx serve .
# or
python -m http.server 8000
```

Then open the printed URL.

## Deploy to GitHub Pages

Repo name determines the URL:

- **Current setup (`Portfolio`)**: enable Pages in Settings → Pages →
  deploy from the default branch. Site will be served at
  `https://mateuszjaroch.github.io/Portfolio/`.
- **Root-domain alternative**: rename the repo to
  `mateuszjaroch.github.io` (Settings → General → Repository name),
  then enable Pages the same way. Site will be served at
  `https://mateuszjaroch.github.io/` directly.


## Commands

`help`, `whoami`/`about`, `ls`/`projects`, `contact`, `locate <ip>`,
`apt install gui`, `clear`.
