# EUSA Website — Project Brief

> Saved copy of the brief the user provided (2026-10-09). Anything marked **[TODO]** is unknown —
> use a clear "to be included" placeholder, never invent it.

## 1. The club

**EUSA — Endocrinology Undergraduate Students Association**, a student-led club at the **University of
Waterloo**. Makes endocrine science (hormones, glands, metabolism, sleep, stress, disease) easy and
interesting for undergrads through **educational content, interactive events, and community**. Aimed at
science-minded students interested in **medicine, research and wellness**. Tagline: **"By Students, for Science!"**

New and small: ~12 Instagram posts, ~290 followers (Oct 2026). Linktree created May 2026; first public
term looks like Spring 2026.

## 2. Facts

| Item | Value |
|---|---|
| Email | eusauw@gmail.com |
| Instagram | https://www.instagram.com/uw_eusa/ |
| Linktree | https://linktr.ee/uw_eusa |
| WUSA-ratified? | **[TODO]** — don't say "official WUSA club" or use WUSA/UW logos until confirmed |
| Founded | **[TODO]** — evidence points to Spring 2026 |

**Mission (cleaned version for the site, needs club approval):**
> EUSA is a student-led club that makes endocrine science engaging, accessible, and relevant. We explore
> everything from health and performance to metabolism, stress, sleep, and disease through education,
> interactive events, and community. EUSA is a place to learn beyond the classroom, meet science-minded
> peers, and get real exposure to medicine, research, and wellness.

**Pillars:** Education (explainer posts: *Introduction to Endocrinology*, *Melatonin: How does it work?*;
workshops planned), Events (**The Periodic Picnic** — SLC Green Space, 5–7 pm, free food/drinks, music,
board games; posts show July 16 and July 29, 2026; co-hosted incl. Science Society, **[TODO]** other
partners; RSVP form used), Community (First-Year Reps). Tone mixes serious science with student humour
(reel: "endocrine → endocrying → endotrying → endodying → endofrying").

**Exec structure:** Admin (President, VP Internal, VP Finance) · Academics (VP Academics, Academics
Coordinator) · Events (VP Events, Events Coordinator) · Marketing (VP Marketing, Marketing Coordinator /
Graphic Designer) · Outreach (First-Year Reps). All execs: attend ≥80% of exec meetings and ≥80% of
events, help set up/clean up, promote events on personal accounts.

**Recruitment cycle:** Spring 2026 hiring (closed May 6) · Summer 2026 elections for President/VP
Internal/VP Finance (nominations closed July 24, voting July 25–26) · Fall 2026 hiring (closed Aug 21).
Fall 2026 form: https://forms.gle/bHPZozprP9zYSgeb6 (closed). Roles doc:
https://docs.google.com/document/d/129ZLSRT3OtHFzKKCxsQ9HZYobVwiQKfEzJSH-pYHsT4/edit
→ Site needs a **hiring banner toggled by one setting** (deadline + form link).

**Team members:** **[TODO]** — names/roles/programs/headshots only with each person's consent.

## 3. Brand

- Logo: dark-green circle, "EUSA" in chunky condensed font, the "U" replaced by a cream thyroid-gland
  shape forming a heart; "ENDOCRINOLOGY UNDERGRADUATE" above, "STUDENTS ASSOCIATION" below.
  **[TODO]** get the real SVG/PNG — don't trace from a screenshot.
- Colours: `--forest #3B5B4D`, `--mint #A8D5B4`, `--sage #D3E9C9`, `--leaf #2D4A22`, `--cream #F2ECD9`.
  Greens + cream only; one small accent (warm yellow) for the hiring banner. WCAG AA contrast.
- Type: chunky condensed display (Big Shoulders Display / Oswald), DM Sans body, Caveat script **only**
  for the tagline.
- Motifs: rounded pill headers and cards, faint DNA/molecule/gland line art; cut-out magazine-letter
  collage used **once**, as the Team page heading.

## 4. Recommended website

Goals: explain EUSA in ~5 s; get people to join/follow/apply; show upcoming events; host educational
content in a lasting, searchable form; stay easy for future execs to update.

Pages: Home · About · Events (auto upcoming/past split by date) · Learn (articles with sources +
"not medical advice" note) · Team · Get Involved · Contact (`mailto:` only, no backend form). Footer on
every page: logo, email, Instagram, "student-run club at the University of Waterloo", medical disclaimer, © year.

Stack (production): **Astro** static site; `src/content/events/*.md`, `src/content/learn/*.md`,
`src/data/team.json`, `src/data/site.json` (with `hiring: { open, deadline, formUrl, roles[] }`); plain
CSS with the tokens; no DB/login/CMS; GitHub Pages or Netlify with a build-on-push GitHub Action; a
**required** plain-English README for future execs.

Requirements: mobile-first (test at 375 px), accessible (alt text, heading order, keyboard nav, visible
focus, AA), fast (WebP, lazy posters), SEO basics + OG image from the logo, no Instagram embed widget,
favicon from the logo.

## 5. Problems to fix before launch

1. Name inconsistency ("Students" vs "Student") — use **Endocrinology Undergraduate Students Association**.
2. Mission text has a broken sentence — use the cleaned version once approved.
3. The *Intro to Endocrinology* post wrongly says the endocrine system is the *only* system whose organs
   aren't adjacent (the immune system is also distributed) and calls it "niche" — don't copy that slide.
4. Medical disclaimer: "This content is for education only and is not medical advice. Talk to a
   healthcare provider about your own health."
5. Build with the club's approval: real logo, approved photos, each exec's consent.
6. Don't claim official WUSA status or use WUSA/UW logos unless confirmed.
7. Don't overbuild.

## 6. Assets still needed

Logo files · exec list with consent · original event posters · original educational slides + sources ·
WUSA ratification status · membership eligibility/cost · domain decision · who maintains the site.
