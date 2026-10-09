/* =========================================================
   EUSA demo — shared layout (header/footer), hiring banner,
   demo panel, reveal-on-scroll, and per-page renderers.
   Content comes from data.js (window.EUSA).
   ========================================================= */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");
  var D = window.EUSA;
  var S = D.site;
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var page = document.body.getAttribute("data-page") || "";

  /* ---------- tiny helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function tbi(text) { return '<span class="tbi">' + esc(text || "to be included") + "</span>"; }
  function store(key, val) {
    try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) { return null; }
  }

  /* ---------- icons ---------- */
  var I = {
    insta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 7l9 6 9-6"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    people: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.5c3 0 6 1.9 6 5.5"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    molecule: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M24 6l14 8v16l-14 8-14-8V14z"/><circle cx="24" cy="6" r="3.5" fill="currentColor"/><circle cx="38" cy="30" r="3.5" fill="currentColor"/><circle cx="10" cy="30" r="3.5" fill="currentColor"/><path d="M24 22v-6M24 22l8 5M24 22l-8 5"/></svg>',
    picnic: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="M6 36l6-18h24l6 18z"/><path d="M12 18l4 18M24 18v18M36 18l-4 18M9 27h30"/><path d="M18 12c0-3 3-3 3-6M27 12c0-3 3-3 3-6"/></svg>',
    community: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><circle cx="24" cy="15" r="6"/><circle cx="10" cy="20" r="4.5"/><circle cx="38" cy="20" r="4.5"/><path d="M13 40c0-6 5-11 11-11s11 5 11 11M3 36c0-4 3-7 7-7M45 36c0-4-3-7-7-7"/></svg>',
    glands: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M24 42c-6-4.6-12-9-12-17 0-5 4-8 7.4-7.4 2.6.4 4 2.4 4.6 4.4.6-2 2-4 4.6-4.4C32 17 36 20 36 25c0 8-6 12.4-12 17z"/><path d="M19 29q5 3 10 0"/><circle cx="10" cy="8" r="2" fill="currentColor"/><circle cx="38" cy="9" r="2.5" fill="currentColor"/><circle cx="42" cy="18" r="1.6" fill="currentColor"/></svg>',
    moon: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M32 36a14 14 0 0 1-12-24 15 15 0 1 0 18 18 14 14 0 0 1-6 6z"/><path d="M34 8l1.5 3 3 1.5-3 1.5L34 17l-1.5-3-3-1.5 3-1.5zM40 22l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="currentColor" stroke="none"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true" width="20" height="20"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
    user: '<svg viewBox="0 0 48 48" fill="currentColor" aria-hidden="true"><circle cx="24" cy="17" r="9"/><path d="M6 44c0-10 8-16 18-16s18 6 18 16z"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 13h7M9 17h7"/></svg>'
  };
  window.EUSA_ICONS = I;

  /* ---------- logo (PLACEHOLDER — swap for the club's real SVG/PNG) ---------- */
  var HEART = "M50 90C28 72 10 56 10 36 10 20 22 10 34 12c8 1 13 7 16 14 3-7 8-13 16-14 12-2 24 8 24 24 0 20-18 36-40 54z";
  function heartSVG(cls) {
    return '<svg class="' + (cls || "") + '" viewBox="0 0 100 100" aria-hidden="true"><path d="' + HEART + '" fill="currentColor"/><path d="M36 52q14 10 28 0" fill="none" stroke="#3B5B4D" stroke-width="5" stroke-linecap="round" opacity=".45"/></svg>';
  }
  function badgeSVG() {
    return '<svg class="brand-badge" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="47" fill="#3B5B4D" stroke="#A8D5B4" stroke-width="4"/><g transform="translate(22 22) scale(.56)"><path d="' + HEART + '" fill="#F2ECD9"/></g></svg>';
  }
  function bigLogoSVG() {
    return '<svg class="hero-logo" viewBox="0 0 400 400" role="img" aria-label="EUSA logo (placeholder)">' +
      '<defs><path id="arcTop" d="M48,200 A152,152 0 0,1 352,200"/><path id="arcBot" d="M35,200 A165,165 0 0,0 365,200"/></defs>' +
      '<circle cx="200" cy="200" r="196" fill="#3B5B4D" stroke="#A8D5B4" stroke-width="5"/>' +
      '<circle cx="200" cy="200" r="178" fill="none" stroke="#A8D5B4" stroke-width="1.5" stroke-dasharray="2 6" opacity=".6"/>' +
      '<text fill="#F2ECD9" font-family="DM Sans, sans-serif" font-weight="700" font-size="16" letter-spacing="2"><textPath href="#arcTop" startOffset="50%" text-anchor="middle">ENDOCRINOLOGY UNDERGRADUATE</textPath></text>' +
      '<text fill="#F2ECD9" font-family="DM Sans, sans-serif" font-weight="700" font-size="16" letter-spacing="2"><textPath href="#arcBot" startOffset="50%" text-anchor="middle">STUDENTS ASSOCIATION</textPath></text>' +
      '<g font-family="Big Shoulders Display, Oswald, Impact, sans-serif" font-weight="900" font-size="150" fill="#A8D5B4">' +
      '<text x="104" y="252" text-anchor="middle">E</text><text x="303" y="252" text-anchor="middle">SA</text></g>' +
      '<g transform="translate(142 140)"><g class="heart"><path d="' + HEART + '" fill="#F2ECD9"/><path d="M36 52q14 10 28 0" fill="none" stroke="#3B5B4D" stroke-width="4" stroke-linecap="round" opacity=".5"/></g></g>' +
      "</svg>";
  }
  window.EUSA_LOGO = { big: bigLogoSVG, heart: heartSVG, badge: badgeSVG };

  /* ---------- dates ---------- */
  function parseDate(s) { if (!s) return null; var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fmtDate(d) { return d.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric", year: "numeric" }); }
  function fmtTime(t) {
    if (!t) return ""; var p = t.split(":"); var h = +p[0], m = p[1]; var ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12;
    return h + ":" + m + " " + ap;
  }
  function splitEvents() {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var up = [], past = [];
    D.events.forEach(function (e) { var d = parseDate(e.date); (!d || d >= today ? up : past).push(e); });
    up.sort(function (a, b) { if (!a.date) return 1; if (!b.date) return -1; return parseDate(a.date) - parseDate(b.date); });
    past.sort(function (a, b) { return parseDate(b.date) - parseDate(a.date); });
    return { up: up, past: past };
  }

  /* ---------- hiring ---------- */
  function hiringOpen() { return D.hiring.open || store("eusa-demo-hiring") === "1"; }
  function hiringDeadline() {
    if (!D.hiring.deadline) return null;
    var d = new Date(D.hiring.deadline);
    return d.toLocaleString("en-CA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }
  function renderHireBanner() {
    var slot = $("#hire-slot"); if (!slot) return;
    if (!hiringOpen()) { slot.innerHTML = ""; return; }
    var h = D.hiring, dl = hiringDeadline();
    slot.innerHTML = '<div class="hire-banner" role="region" aria-label="Hiring announcement"><div class="container">' +
      '<span class="dot" aria-hidden="true"></span><strong>We\'re hiring!</strong>' +
      "<span>" + (h.term ? esc(h.term) + " exec roles" : "Exec roles for " + tbi("term")) + " · Apply by " + (dl ? esc(dl) : tbi("deadline")) + "</span>" +
      (h.formUrl ? '<a href="' + esc(h.formUrl) + '" target="_blank" rel="noopener">Apply now →</a>' : '<a href="get-involved.html#apply">See roles →</a>') +
      "</div></div>";
  }

  /* ---------- header & footer ---------- */
  var NAV = [["index.html", "Home", "home"], ["about.html", "About", "about"], ["events.html", "Events", "events"], ["learn.html", "Learn", "learn"], ["team.html", "Team", "team"], ["get-involved.html", "Get Involved", "involved"], ["contact.html", "Contact", "contact"]];
  function renderChrome() {
    var h = $("#site-header");
    if (h) {
      h.outerHTML = '<a class="skip-link" href="#main">Skip to content</a><div class="page-progress" aria-hidden="true"></div><div id="hire-slot"></div>' +
        '<header class="site-header"><div class="container">' +
        '<a class="brand" href="index.html" aria-label="EUSA — home">' + badgeSVG() +
        '<span class="wordmark" aria-hidden="true">E' + heartSVG("u-heart") + "SA</span></a>" +
        '<button class="nav-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu"><span></span></button>' +
        '<nav id="site-nav" class="nav" aria-label="Main">' +
        NAV.map(function (n) { return '<a href="' + n[0] + '"' + (n[2] === page ? ' aria-current="page"' : "") + ">" + n[1] + "</a>"; }).join("") +
        "</nav></div></header>";
    }
    var f = $("#site-footer");
    if (f) {
      f.outerHTML = '<footer class="site-footer"><div class="container"><div class="footer-grid">' +
        '<div><a class="brand" href="index.html" aria-label="EUSA — home">' + badgeSVG() + '<span class="wordmark" aria-hidden="true">E' + heartSVG("u-heart") + "SA</span></a>" +
        '<p style="margin-top:14px">' + esc(S.name) + ". A student-run club at the " + esc(S.university) + '.</p><p class="script" style="font-size:1.6rem;color:var(--mint);margin:0">' + esc(S.tagline) + "</p></div>" +
        "<div><h4>Explore</h4><ul>" + NAV.slice(1).map(function (n) { return '<li><a href="' + n[0] + '">' + n[1] + "</a></li>"; }).join("") + "</ul></div>" +
        '<div><h4>Say hi</h4><ul><li><a href="mailto:' + S.email + '">' + S.email + '</a></li><li><a href="' + S.instagram + '" target="_blank" rel="noopener">Instagram ' + S.instagramHandle + '</a></li><li><a href="' + S.linktree + '" target="_blank" rel="noopener">Linktree</a></li></ul>' +
        '<p class="disclaimer"><strong>Not medical advice.</strong> This content is for education only. Talk to a healthcare provider about your own health.</p></div>' +
        '</div><div class="footer-bottom"><span>© ' + new Date().getFullYear() + " EUSA · Endocrinology Undergraduate Students Association</span>" +
        '<span>Demo build: items marked <span class="tbi">to be included</span> are still to come.</span></div></div></footer>';
    }
    var toggle = $(".nav-toggle");
    if (toggle) toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open); toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    $all(".nav a").forEach(function (a) { a.addEventListener("click", function () { document.body.classList.remove("nav-open"); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") document.body.classList.remove("nav-open"); });
  }

  /* ---------- demo panel (founder walkthrough) ---------- */
  function renderDemoPanel() {
    var wrap = document.createElement("div");
    wrap.innerHTML = '<button class="demo-fab" aria-expanded="false" aria-controls="demo-panel">Demo ✦</button>' +
      '<div class="demo-panel" id="demo-panel" role="dialog" aria-label="Demo controls"><h4>Demo controls</h4>' +
      "<p>Only visible in this demo. Try the features the real site will have.</p>" +
      '<label class="switch">Preview the "We\'re hiring" banner<input type="checkbox" id="demo-hire"></label>' +
      '<label class="switch">Highlight everything "to be included"<input type="checkbox" id="demo-tbi"></label>' +
      '<a class="btn btn--dark" style="width:100%;margin-top:8px" href="founder-notes.html">Notes for the founder →</a></div>';
    document.body.appendChild(wrap);
    var fab = $(".demo-fab"), panel = $("#demo-panel");
    fab.addEventListener("click", function () { var o = panel.classList.toggle("open"); fab.setAttribute("aria-expanded", o); });
    var hire = $("#demo-hire"), tb = $("#demo-tbi");
    hire.checked = store("eusa-demo-hiring") === "1";
    tb.checked = store("eusa-demo-tbi") === "1";
    if (tb.checked) document.body.classList.add("show-tbi");
    hire.addEventListener("change", function () { store("eusa-demo-hiring", hire.checked ? "1" : "0"); renderHireBanner(); if (page === "involved") renderInvolved(); });
    tb.addEventListener("change", function () { store("eusa-demo-tbi", tb.checked ? "1" : "0"); document.body.classList.toggle("show-tbi", tb.checked); });
  }

  /* ---------- reveal + page progress ---------- */
  var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }) : null;
  function observeReveals(root) {
    $all("[data-reveal]:not(.in)", root).forEach(function (el) { if (io && !REDUCED) io.observe(el); else el.classList.add("in"); });
  }
  window.EUSA_observeReveals = observeReveals;
  function progressBar() {
    var bar = $(".page-progress"); if (!bar) return;
    var ticking = false;
    function upd() { var max = document.documentElement.scrollHeight - innerHeight; bar.style.transform = "scaleX(" + (max > 0 ? scrollY / max : 0) + ")"; ticking = false; }
    addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* ---------- shared card renderers ---------- */
  function posterHTML(ev) {
    if (ev.tba) return '<div class="event__poster"><b aria-hidden="true">TBA</b></div>';
    if (ev.poster === "periodic") {
      return '<div class="event__poster"><div class="periodic" aria-hidden="true">' +
        '<div class="el"><small>1</small><b>Fd</b><em>food</em></div><div class="el"><small>2</small><b>Dr</b><em>drinks</em></div>' +
        '<div class="el"><small>3</small><b>Mu</b><em>music</em></div><div class="el"><small>4</small><b>Bg</b><em>board games</em></div>' +
        '</div><span class="poster-note">' + tbi("original poster") + "</span></div>";
    }
    return '<div class="event__poster">' + tbi("poster") + "</div>";
  }
  function eventCard(ev, past) {
    var d = parseDate(ev.date);
    var meta = '<div class="event__meta">' +
      "<div>" + I.cal + "<span>" + (d ? fmtDate(d) : "Date " + tbi("to be announced")) + "</span></div>" +
      (ev.startTime ? "<div>" + I.clock + "<span>" + fmtTime(ev.startTime) + (ev.endTime ? " – " + fmtTime(ev.endTime) : "") + "</span></div>" : "") +
      "<div>" + I.pin + "<span>" + (ev.location ? esc(ev.location) : "Location " + tbi()) + "</span></div>" +
      (ev.partners && ev.partners.length ? "<div>" + I.people + "<span>With " + ev.partners.map(esc).join(", ") + (ev.partnersTbi ? " + " + tbi("other partners") : "") + "</span></div>" : "") +
      "</div>";
    return '<article class="card event' + (ev.tba ? " event--tba" : "") + '" data-reveal>' + posterHTML(ev) +
      '<div class="event__body"><span class="tag ' + (past ? "tag--past" : "tag--up") + '">' + (past ? "Past event" : "Upcoming") + "</span>" +
      "<h3>" + esc(ev.title) + (ev.tba ? " " + tbi("name & details") : "") + "</h3>" + meta +
      "<p>" + (ev.description ? esc(ev.description) : "Details " + tbi() + ". Follow " + esc(S.instagramHandle) + " to hear first.") + "</p>" +
      (ev.dateNote ? '<p class="muted" style="font-size:.88rem">' + tbi("check") + " " + esc(ev.dateNote) + "</p>" : "") +
      (!past && ev.rsvpUrl ? '<a class="btn btn--dark" href="' + esc(ev.rsvpUrl) + '" target="_blank" rel="noopener">RSVP ' + I.arrow + "</a>" : (!past ? '<span class="tbi">RSVP link</span>' : "")) +
      "</div></article>";
  }
  function learnCard(a, i) {
    return '<a class="card article-card" data-reveal style="--d:' + (i * 0.1) + 's" href="article.html?slug=' + a.slug + '">' +
      '<div class="thumb">' + (I[a.icon] || I.molecule) + "</div>" +
      (a.status === "draft" ? '<span class="tag tag--draft">Draft · in review</span>' : "") +
      a.tags.slice(0, 2).map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") +
      "<h3>" + esc(a.title) + "</h3><p>" + esc(a.summary) + '</p><p class="meta">' + a.readMins + " min read</p></a>";
  }
  function learnPlaceholder(i) {
    return '<div class="card article-card tbi-block" data-reveal style="--d:' + (i * 0.1) + 's;box-shadow:none;background-color:transparent"><div class="thumb" style="margin:-26px -26px 20px;height:150px;background:rgba(59,91,77,.12);display:grid;place-items:center;color:var(--forest)">' + I.molecule + '</div><span class="tag">coming soon</span><h3>Next Endo 101 topic</h3><p>Topic ' + tbi() + ". New explainers from the Academics team land here, and they stay searchable (unlike Instagram).</p></div>";
  }

  /* ---------- page renderers ---------- */
  function renderHome() {
    var heroLogo = $("#hero-logo"); if (heroLogo) heroLogo.innerHTML = bigLogoSVG() + '<p class="logo-note">' + tbi("placeholder logo: real file to be included") + "</p>";
    var ne = $("#next-event");
    if (ne) {
      var s = splitEvents();
      ne.innerHTML = (s.up[0] ? eventCard(s.up[0], false) : "") + (s.past[0] ? eventCard(s.past[0], true) : "");
    }
    var ll = $("#latest-learn");
    if (ll) ll.innerHTML = D.learn.slice(0, 3).map(learnCard).join("") + (D.learn.length < 3 ? learnPlaceholder(D.learn.length) : "");
  }

  function renderEvents() {
    var s = splitEvents();
    $("#upcoming").innerHTML = s.up.length ? s.up.map(function (e) { return eventCard(e, false); }).join("") :
      '<div class="tbi-block">No upcoming events yet. Follow ' + esc(S.instagramHandle) + " to hear first.</div>";
    $("#past").innerHTML = s.past.map(function (e) { return eventCard(e, true); }).join("");
  }

  function renderLearn() {
    var list = $("#learn-list"), q = $("#learn-q"), empty = $("#learn-empty");
    function draw() {
      var term = (q.value || "").trim().toLowerCase();
      var hits = D.learn.filter(function (a) { return !term || (a.title + " " + a.summary + " " + a.tags.join(" ") + " " + a.body).toLowerCase().indexOf(term) > -1; });
      list.innerHTML = hits.map(learnCard).join("") + (!term ? learnPlaceholder(hits.length) : "");
      empty.hidden = hits.length > 0 || !term;
      observeReveals(list);
    }
    q.addEventListener("input", draw); draw();
  }

  function renderArticle() {
    var slug = new URLSearchParams(location.search).get("slug");
    var a = D.learn.filter(function (x) { return x.slug === slug; })[0] || D.learn[0];
    document.title = a.title + " · EUSA Learn";
    $("#a-title").textContent = a.title;
    $("#a-summary").textContent = a.summary;
    $("#a-meta").innerHTML = (a.status === "draft" ? '<span class="tag tag--draft">Draft · pending VP Academics review</span>' : "") +
      a.tags.map(function (t) { return '<span class="tag" style="background:rgba(168,213,180,.2);color:var(--cream)">' + esc(t) + "</span>"; }).join("") +
      '<p style="margin-top:10px">By ' + (a.author ? esc(a.author) : "EUSA Academics team " + tbi("author name")) + " · " + a.readMins + " min read</p>";
    $("#a-icon").innerHTML = I[a.icon] || I.molecule;
    $("#a-body").innerHTML = a.body +
      '<div class="callout callout--warn"><strong>Not medical advice.</strong> This content is for education only and is not medical advice. Talk to a healthcare provider about your own health.</div>' +
      '<div class="sources"><h3>Sources</h3><ol>' + a.sources.map(function (s) { return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.label) + "</a></li>"; }).join("") + "</ol>" +
      (a.sourcesTbi ? '<p style="margin:10px 0 0">' + tbi("more sources + VP Academics check") + "</p>" : "") + "</div>";
    var others = D.learn.filter(function (x) { return x !== a; });
    $("#a-more").innerHTML = others.map(learnCard).join("") + learnPlaceholder(others.length);
  }

  function renderTeam() {
    $("#team-term").textContent = D.team.term + " Executive Team";
    $("#team-groups").innerHTML = D.team.groups.map(function (g) {
      return '<section class="team-group" aria-labelledby="tg-' + g.name + '"><div class="team-group__head" data-reveal><h2 id="tg-' + g.name + '" style="margin:0">' + esc(g.name) + '</h2><span class="muted">' + esc(g.blurb) + "</span></div>" +
        '<div class="team-grid">' + g.members.map(function (m, i) {
          return '<div class="member" tabindex="0" data-reveal style="--d:' + (i * 0.08) + 's"><div class="member__inner">' +
            '<div class="member__face member__front"><div class="avatar">' + (m.photo ? '<img src="' + esc(m.photo) + '" alt="' + esc(m.name || m.role) + '" loading="lazy">' : I.user) + "</div>" +
            '<div class="member__role">' + esc(m.role) + "</div>" +
            "<div>" + (m.name ? "<strong>" + esc(m.name) + "</strong>" : tbi("name")) + "</div>" +
            '<div style="margin-top:4px">' + (m.program ? esc(m.program) : tbi("program & year")) + "</div>" +
            '<div class="member__hint">Hover or tap to see the role ↻</div></div>' +
            '<div class="member__face member__back"><h4>' + esc(m.role) + "</h4><p>" + esc(m.desc) + '</p><p style="font-size:.85rem;opacity:.8;margin:0">' + tbi("fun fact / favourite hormone") + "</p></div>" +
            "</div></div>";
        }).join("") + "</div></section>";
    }).join("");
    $all(".member").forEach(function (m) {
      m.addEventListener("click", function () { m.classList.toggle("flipped"); });
      m.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); m.classList.toggle("flipped"); } });
    });
  }

  function renderInvolved() {
    var box = $("#hire-status"); if (!box) return;
    var open = hiringOpen(), h = D.hiring, dl = hiringDeadline();
    box.className = "status-box" + (open ? " open" : "");
    box.innerHTML = open ?
      '<p class="eyebrow" style="color:inherit"><span class="status-dot"></span>Applications open</p><h3>' + (h.term ? esc(h.term) : "Next term") + " exec applications</h3>" +
      "<p>Roles: " + (h.roles.length ? h.roles.map(esc).join(", ") : tbi("list of open roles")) + "</p><p>Deadline: " + (dl ? esc(dl) : tbi("deadline")) + "</p>" +
      (h.formUrl ? '<a class="btn btn--dark" href="' + esc(h.formUrl) + '" target="_blank" rel="noopener">Apply now ' + I.arrow + "</a>" : '<span class="btn btn--dark" aria-disabled="true">Apply now (form link ' + "to be included)</span>") :
      '<p class="eyebrow" style="color:var(--mint)"><span class="status-dot"></span>Applications closed</p><h3 style="color:var(--cream)">We\'re not hiring right now</h3>' +
      "<p>Fall 2026 applications closed on Aug 21. EUSA hires every term, so check back or follow " + esc(S.instagramHandle) + " for the next round.</p>" +
      '<a class="btn btn--mint" href="' + S.instagram + '" target="_blank" rel="noopener">' + I.insta + " Get notified on Instagram</a>";
    var acc = $("#roles-acc");
    if (acc && !acc.innerHTML.trim()) {
      acc.innerHTML = D.team.groups.map(function (g, i) {
        return "<details" + (i === 0 ? " open" : "") + "><summary>" + esc(g.name) + '</summary><div class="roles">' +
          g.members.map(function (m) { return '<div class="role"><b>' + esc(m.role) + "</b>" + esc(m.desc) + "</div>"; }).join("") + "</div></details>";
      }).join("");
    }
  }

  function initRings() {
    $all(".ring-stat").forEach(function (r) {
      var fg = $(".fg", r), val = +r.getAttribute("data-val"), C = 2 * Math.PI * 62, num = $(".val", r);
      fg.style.strokeDasharray = C; fg.style.strokeDashoffset = C;
      function go() {
        fg.style.strokeDashoffset = C * (1 - val / 100);
        if (REDUCED) { num.textContent = val + "%"; return; }
        var t0 = performance.now();
        (function tick(t) { var k = Math.min(1, (t - t0) / 1600); num.textContent = Math.round(val * (1 - Math.pow(1 - k, 3))) + "%"; if (k < 1) requestAnimationFrame(tick); })(t0);
      }
      if (!io) return go();
      var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { go(); o.disconnect(); } }, { threshold: .5 }); o.observe(r);
    });
  }
  function initTimeline() {
    var tl = $(".timeline"), fill = $(".timeline__fill"); if (!tl || !fill) return;
    function upd() { var r = tl.getBoundingClientRect(); var k = (innerHeight * 0.75 - r.top) / r.height; fill.style.transform = "scaleY(" + Math.max(0, Math.min(1, k)) + ")"; }
    addEventListener("scroll", function () { requestAnimationFrame(upd); }, { passive: true }); upd();
  }

  /* ---------- boot ---------- */
  renderChrome();
  renderHireBanner();
  renderDemoPanel();
  progressBar();
  $all("[data-fill='email']").forEach(function (el) { el.textContent = S.email; if (el.tagName === "A") el.href = "mailto:" + S.email; });
  if (page === "home") renderHome();
  if (page === "events") renderEvents();
  if (page === "learn") renderLearn();
  if (page === "article") renderArticle();
  if (page === "team") renderTeam();
  if (page === "involved") { renderInvolved(); initRings(); initTimeline(); }
  observeReveals();
})();
