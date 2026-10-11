# EUSA website — demo

A demo website for **EUSA (Endocrinology Undergraduate Students Association, UWaterloo)**,
made to show the founder before building the real thing. Full project brief: [BRIEF.md](BRIEF.md).

**Live demo:** https://thecoder47-noob.github.io/eusa-website/ (GitHub Pages, redeploys on every push to `main`)

## How to open it

Double-click `index.html`. It's plain HTML/CSS/JS, so no install or server is needed.
You do need internet for the Google Fonts.

The yellow **Demo** button (bottom-left) lets you preview the hiring banner and highlight
every "to be included" placeholder. What's still needed from the club is listed in the founder checklist Word document (kept outside this repo).

## Where things are

| File | What it is |
|---|---|
| `assets/js/data.js` | **All editable content**: contact links, hiring banner switch, events, Learn articles (a list of `steps`, each with a `scene`), team |
| `assets/js/main.js` | Shared header/footer, hiring banner, demo panel, page renderers |
| `assets/js/anim.js` | Scroll-driven animations on the home page (gland tour, insulin, stress/HPA, melatonin), hero canvas, About lock-and-key; also exposes helpers for the article scenes |
| `assets/js/games.js` + `assets/css/games.css` | The three mini-games on `games.html` (Guess the Gland, Homeostasis Challenge, Hormone Delivery); best scores in localStorage |
| `assets/js/learn-anim.js` | The animated scenes behind each Learn article (one scene per `scene` id used in `data.js`) |
| `assets/css/styles.css` | All styles; colour tokens at the top |
| `*.html` | One file per page; `article.html?slug=...` renders a Learn article |

## Quick edits (demo)

- **Turn on the hiring banner:** in `data.js`, set `hiring.open: true` and fill in `term`, `deadline`, `formUrl` and `roles`.
- **Add an event:** copy one object in `events`. Past/upcoming is worked out from `date` automatically.
- **Fill in a team member:** add `name`, `program` and `photo` to the member in `team.groups`.
- Any value left as `null` shows a "to be included" tag.

## Next step (after approval)

The brief (§4.3) plans an Astro static site with Markdown content, a GitHub Action deploy, and a
plain-English README for future execs. The CSS, animations and page structure here are meant to
carry straight over.
