# placeholder-site

A temporary, interactive terminal-style portfolio page — a stand-in until
the Go static site generator (see `../README.md`) is ready to build the
real thing.

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

Two earlier animated-intro iterations (matrix-rain letter lock-in, and
a rotating Lambert-shaded word) are kept in `../placeholder-site-versions/`
in case you want to revisit them.

## Run locally

Any static file server works, e.g.:

```bash
npx serve .
# or
python -m http.server 8000
```

Then open the printed URL.

## Deploy to GitHub Pages

To serve at the root of `https://<username>.github.io`, push the
contents of this folder as the root of a repo named exactly
`<username>.github.io`, then enable Pages for that repo (Settings →
Pages → deploy from the default branch).

## Commands

`help`, `whoami`/`about`, `ls`/`projects`, `contact`, `locate <ip>`,
`apt install gui`, `clear`.
