# CLAUDE.md — EUSA-Website

Guidance for working in this folder. (The workspace-level `../CLAUDE.md` only has a one-line summary.)

## What this is

A **demo** website for EUSA (Endocrinology Undergraduate Students Association, University of Waterloo),
built to show the club's founder before the real build. The user is *not* the founder and is missing a lot of
club info. Plain multi-page HTML/CSS/JS, no build step, no dependencies. `BRIEF.md` is the full project brief
(the production plan there is Astro + Markdown; this demo is the design/animation prototype for it).

- **Run:** open `index.html` directly (needs internet only for Google Fonts). No server needed.
- **Live:** https://thecoder47-noob.github.io/eusa-website/ — GitHub Pages from `main` (root) of the **public** repo
  `TheCoder47-noob/eusa-website`. **Every push to `main` changes the live site**, so commit deliberately.
- Own git repo (the parent workspace folder is not a repo). Commit trailer: use the attribution line the harness gives.

## Hard rules

1. **Never invent club facts.** Anything unknown (names, photos, dates, partners, WUSA status, membership cost, real
   logo, founding term) is shown as a dashed **"to be included"** tag: `tbi("text")` in `main.js`, or `.tbi` / `.tbi-block`
   in HTML. The Demo button (bottom-left) can highlight them all.
2. Use the name **"Endocrinology Undergraduate Students Association"** (matches the logo), not "Student".
3. Don't call EUSA an "official WUSA club" or use WUSA/UW logos until confirmed.
4. Science content must be accurate. The club's own slides contained errors (see `founder-notes.html` and the `note`
   fields in `data.js`); don't copy them back. Every Learn article keeps its Sources list and the "not medical advice" note.
5. Palette is greens + cream only (tokens at top of `styles.css`); yellow `--sun` is only for the hiring banner / demo UI.
   Caveat script only for the tagline. The cut-out collage heading is used once (Team page).

## Layout

| File | Role |
|---|---|
| `assets/js/data.js` | **All editable content**: `site`, `hiring` (banner on/off), `events`, `learn` articles, `team`. `null` → placeholder. |
| `assets/js/main.js` | Header/footer injection, hiring banner, Demo panel, reveal-on-scroll, per-page renderers (`data-page` on `<body>`), the **logo** (`thyInner`, `badgeSVG`, `bigLogoSVG`) |
| `assets/js/anim.js` | Home-page scroll stories + hero canvas + About lock-and-key. Defines the scrolly engine (`register`) and exposes `window.EUSA_ANIM` helpers |
| `assets/js/learn-anim.js` | Scenes for the Learn articles (loaded only on `article.html`) |
| `assets/css/styles.css` | Everything; later `@media` blocks override earlier rules, so mobile overrides must stay *after* base rules |
| `index/about/events/learn/article/team/get-involved/contact.html` | One page each; `article.html?slug=…` renders any `learn` entry |
| `founder-notes.html` | Demo-only page for the founder (issues + what's still needed). Not part of the real site |

## The scroll-story engine

A `.scrolly` section has a sticky `.scrolly__stage` (with an `<svg>`) and a list of `.step` cards. `register(name, init)`
in `anim.js` finds `[data-scrolly=name]`, computes `s` (screens scrolled into the section; card *i* is centred at `s = i`),
and calls `api.frame(s, t)` every animation frame; visuals are pure functions of `s` and time, so scrolling backwards works.
It also injects the "Keep scrolling" arrow into every card and the progress bar/dots.

- **Home**: four stories (gland tour, insulin, HPA stress axis, melatonin). Their *info text* is the club's approved intro
  content: don't change it without being asked. The thyroid on the body is a deep U (two lobes, valley between) and the
  pancreas is deliberately about half the torso width.
- **Articles**: `renderArticle()` builds one `.scrolly` per article from `learn[].steps`. Each step has `scene`; consecutive
  steps with the same `scene` share one scene. `learn-anim.js` cross-fades scenes by distance from their step range and
  calls `scene.frame(p, t, age)` (`p` = progress within the scene, `age` = seconds since it faded in, for entrance
  animations). To add a scene: add a `SCENES.myScene = function (g) {…return {frame}}` and reference its id from `data.js`.
- `prefers-reduced-motion`: the engine draws on scroll only; scenes get `age = 99`, `t = 0` (static final state).

## Logo

The logo is a **placeholder** rebuilt from a low-res screenshot (circle badge version). The "U" is a thyroid gland
(`THY` / `THY_STALK` in `main.js`): two tall lobes, a deep valley, a narrow isthmus, a tapering stalk, green accents.
The favicon repeats the same paths. Replace with the club's real SVG/PNG when they provide it.

## Testing / screenshots

No test suite. Verify visually with headless Edge driven over CDP (Node 24 has a global `WebSocket`):
launch `msedge.exe --headless=new --remote-debugging-port=9333 --user-data-dir=… about:blank` **from bash** (spawning it from
Node did not open the port), then connect, `Page.navigate`, scroll, `Page.captureScreenshot`. To capture a scroll story step
*i*, set `scrollY = section.getBoundingClientRect().top + scrollY + i * innerHeight` with `behavior:"instant"` (the page uses
`scroll-behavior: smooth`, so override it). Wait ~3 s for time-based scene entrances. Check desktop (1280×800) and phone (375×740).
Ignore console noise from browser extensions (Grammarly, etc.); use `--disable-extensions`.

## Gotchas

- Large inline Python/JS in a bash heredoc has failed here; write the script to a file and run it instead.
- Don't use `localStorage` for anything but the Demo panel toggles (`eusa-demo-*`), wrapped in try/catch.
- Source links in `data.js`: Cleveland Clinic, PMC (Hiller-Sturmhöfel & Bartke), NCCIH and OpenStax were checked (HTTP 200).
  The Johns Hopkins page is not linked because scripted requests are blocked (Cloudflare), so its URL is unverified.
- No Instagram feed widget (per brief); no backend; contact is `mailto:` only.
