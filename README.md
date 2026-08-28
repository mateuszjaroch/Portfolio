# placeholder-site

A temporary, interactive terminal-style portfolio page — a stand-in until
the Go static site generator (see `../README.md`) is ready to build the
real thing.

Pure HTML/CSS/JS, no build step, no dependencies.

## Files

- `index.html` — page shell, terminal container
- `style.css` — CRT green terminal theme, responsive
- `terminal.js` — static JAROCH ASCII-art banner (no animation, no
  glow) printed above the boot sequence, plus the command loop,
  history, and a real IPv4 geolocation lookup (`locate`) via the free
  [ipwho.is](https://ipwho.is) API (no key required)

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

`help`, `whoami`/`about`, `ls`/`projects`, `contact`, `locate <ip>`, `clear`.
