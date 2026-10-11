/* =========================================================
   EUSA demo — three mini-games on games.html.
   #gland  Guess the Gland      #homeo  Homeostasis Challenge      #delivery  Hormone Delivery Simulator
   One page, hash-routed. Best scores live in localStorage (eusa-best-<id>). No accounts, no settings.
   ========================================================= */
(function () {
  "use strict";
  var root = document.getElementById("games-root");
  if (!root) return;
  var A = window.EUSA_ANIM || {};
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";
  var MINT = "#A8D5B4", CREAM = "#F2ECD9", SAGE = "#D3E9C9", INK = "#1F3229";

  /* ---------- helpers ---------- */
  var timers = [], cleanup = null, score = 0;
  function $(s, r) { return (r || document).querySelector(s); }
  function later(fn, ms) { var t = setTimeout(fn, REDUCED ? Math.min(ms, 60) : ms); timers.push(t); return t; }
  function stop() { timers.forEach(clearTimeout); timers = []; if (cleanup) { cleanup(); cleanup = null; } }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } return null; }
  function best(id) { return +store("eusa-best-" + id) || 0; }
  function svgEl(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function ease(k) { return k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }

  function shell(title) {
    score = 0;
    root.innerHTML = '<div class="game-board" id="board"><div class="game-top"><a class="back" href="#">← Back to games</a><div class="game-title">' + title +
      '</div><div class="game-score"><span class="streak" id="g-streak" hidden></span>Score <b id="g-score">0</b></div></div>' +
      '<div class="game-prog"><span id="g-prog"></span><div class="game-prog__bar"><i id="g-bar"></i></div></div><div id="g-body"></div></div>';
  }
  function setScore(n) { score = n; var b = $("#g-score"); b.textContent = n; b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop"); }
  function setProg(text, frac) { $("#g-prog").textContent = text; $("#g-bar").style.width = Math.round(frac * 100) + "%"; }
  function burst(target) {
    if (REDUCED || !target) return;
    var board = $("#board"), br = board.getBoundingClientRect(), r = target.getBoundingClientRect();
    var cx = r.left - br.left + r.width / 2, cy = r.top - br.top + r.height / 2;
    for (var i = 0; i < 14; i++) {
      var s = document.createElement("span"), a = Math.random() * 6.283, d = 40 + Math.random() * 60;
      s.className = "spark"; s.style.left = cx + "px"; s.style.top = cy + "px";
      s.style.setProperty("--dx", Math.cos(a) * d + "px"); s.style.setProperty("--dy", Math.sin(a) * d + "px");
      board.appendChild(s); setTimeout(function (n) { n.remove(); }.bind(null, s), 950);
    }
  }
  function results(id, max, headline, msg) {
    var isBest = score > best(id); if (isBest) store("eusa-best-" + id, String(score));
    $("#g-body").innerHTML = '<div class="results"><h2>' + headline + '</h2><div class="big-score">' + score + (max ? "<small>/ " + max + "</small>" : "") + "</div><p>" + msg + "</p>" +
      (isBest ? '<p><span class="newbest">New best!</span></p>' : "<p>Best: <b>" + best(id) + "</b></p>") +
      '<div class="btn-row" style="justify-content:center"><button class="btn btn--mint" id="again" type="button">Play again</button><a class="btn btn--ghost" href="#">Back to games</a></div></div>';
    setProg("Done", 1);
    $("#again").addEventListener("click", function () { GAMES[id].start(); });
    $("#again").focus();
  }

  /* =====================================================================
     GAME 1: GUESS THE GLAND  (drag each gland to its place on the body; its info pops up)
     ===================================================================== */
  var SHAPES = {   // drawn in a 100x100 box, reused for slots, tokens and placed glands
    hypo: '<path d="M22,26 C34,10 66,10 78,26 C74,52 60,74 50,86 C40,74 26,52 22,26Z"/>',
    pit: '<path d="M30,48 C32,26 68,26 70,48 C72,70 58,82 50,82 C42,82 28,70 30,48Z"/>',
    pin: '<path d="M50,8 C72,30 74,64 50,92 C26,64 28,30 50,8Z"/>',
    thy: '<path d="M50,76 C40,80 24,76 16,62 C8,48 8,28 14,14 C18,6 28,6 31,15 C35,30 40,50 50,56 C60,50 65,30 69,15 C72,6 82,6 86,14 C92,28 92,48 84,62 C76,76 60,80 50,76 Z"/>',
    para: '<ellipse cx="26" cy="32" rx="8" ry="11"/><ellipse cx="26" cy="66" rx="8" ry="11"/><ellipse cx="74" cy="32" rx="8" ry="11"/><ellipse cx="74" cy="66" rx="8" ry="11"/>',
    adr: '<path d="M10,64 C12,40 26,36 36,64Z"/><path d="M64,64 C74,36 88,40 90,64Z"/>',
    pan: '<path d="M4,52 C14,34 36,36 50,42 C66,48 82,32 96,44 C102,56 86,62 70,60 C50,58 30,74 12,68 C6,66 3,60 4,52Z"/>',
    ova: '<ellipse cx="22" cy="50" rx="10" ry="7"/><ellipse cx="78" cy="50" rx="10" ry="7"/>',
    tes: '<ellipse cx="34" cy="50" rx="13" ry="19"/><ellipse cx="66" cy="50" rx="13" ry="19"/>'
  };
  var INFO = {
    hypo: { name: "Hypothalamus", makes: "CRH, TRH, ADH and other signalling hormones", job: "Links your brain to your hormones. It tells the pituitary what to release.", hint: "Deep in the brain, just above the pituitary." },
    pit: { name: "Pituitary gland", makes: "Growth hormone, ACTH, TSH, prolactin and more", job: "The pea-sized “master gland”: many of its hormones tell other glands what to do.", hint: "It hangs just below the hypothalamus on a short stalk." },
    pin: { name: "Pineal gland", makes: "Melatonin", job: "Releases melatonin when it's dark, which helps time your sleep–wake cycle.", hint: "A tiny cone-shaped gland toward the back of the brain." },
    thy: { name: "Thyroid gland", makes: "T3 and T4", job: "Helps set your metabolism: how fast your cells use energy.", hint: "It wraps around the windpipe at the front of the neck." },
    para: { name: "Parathyroid glands", makes: "Parathyroid hormone (PTH)", job: "Keeps blood calcium in range. There are usually four, each about the size of a grain of rice.", hint: "They're tucked on the back of the thyroid. Place the thyroid first!" },
    adr: { name: "Adrenal glands", makes: "Adrenaline, cortisol and aldosterone", job: "Adrenaline gives the quick fight-or-flight boost. Cortisol handles the longer stress response.", hint: "They sit like little hats on top of the kidneys." },
    pan: { name: "Pancreas", makes: "Insulin and glucagon", job: "Keeps blood sugar steady: insulin lowers it and glucagon raises it.", hint: "It lies behind the stomach, across the upper abdomen." },
    ova: { name: "Ovaries", makes: "Estrogen and progesterone", job: "Release eggs and make the hormones that guide puberty and the menstrual cycle.", hint: "A pair of almond-sized glands on either side of the uterus." },
    tes: { name: "Testes", makes: "Testosterone", job: "Make sperm and testosterone. They sit outside the main body cavity, where it's cooler.", hint: "Look lower down, in the scrotum." }
  };
  var BOARDS = [
    { title: "Brain", lead: "three glands live deep inside the brain.", tokens: ["pit", "hypo", "pin"], decoys: [],
      art: '<path class="bgart" d="M80,170 C60,90 130,34 230,32 C330,30 400,86 388,166 C382,206 346,222 316,222 L150,222 C108,222 86,204 80,170Z"/><path class="bgart" d="M262,222 C266,252 270,286 276,320 L312,320 C306,286 302,252 300,222Z"/><ellipse class="bgart" cx="352" cy="248" rx="50" ry="30"/><path class="bgline" d="M118,118 C150,86 196,92 226,70 M150,160 C190,122 290,122 330,160 M300,70 C336,84 360,110 366,140 M120,190 C150,176 180,184 205,172"/>',
      slots: [{ g: "hypo", x: 232, y: 176, sx: .55, sy: .55 }, { g: "pit", x: 238, y: 240, sx: .5, sy: .5 }, { g: "pin", x: 308, y: 160, sx: .45, sy: .45 }] },
    { title: "Neck", lead: "one gland wraps around the windpipe, and some tiny ones hide behind it.", tokens: ["thy", "para"], decoys: ["pan"],
      art: '<path class="bgart" d="M156,10 C150,120 140,240 100,330 L360,330 C320,240 310,120 304,10Z"/><rect class="bgart" x="209" y="30" width="42" height="290" rx="20"/><path class="bgline" d="M209,70 H251 M209,100 H251 M209,130 H251 M209,214 H251 M209,244 H251 M209,274 H251 M209,304 H251 M30,330 C100,296 160,308 212,326 M430,330 C360,296 300,308 248,326"/>',
      slots: [{ g: "thy", x: 230, y: 172, sx: 1.5, sy: 1.5 }, { g: "para", x: 230, y: 172, sx: 1.5, sy: 1.5, after: "thy" }] },
    { title: "Abdomen", lead: "glands near the kidneys and stomach.", tokens: ["pan", "adr"], decoys: ["thy"],
      art: '<path class="bgart" d="M110,10 C92,120 100,260 120,330 L340,330 C360,260 368,120 350,10Z"/><path class="bgart" d="M132,96 C170,76 250,84 252,132 C224,156 164,156 136,136Z"/><path class="bgart" d="M278,96 C332,86 346,140 316,178 C294,192 264,178 266,148Z"/><ellipse class="bgart" cx="165" cy="192" rx="28" ry="40"/><ellipse class="bgart" cx="295" cy="192" rx="28" ry="40"/>',
      slots: [{ g: "adr", x: 230, y: 152, sx: 2.4, sy: 1.3 }, { g: "pan", x: 230, y: 236, sx: 1.7, sy: .95 }] },
    { title: "Pelvis", lead: "the gonads sit in different places in female and male bodies.", tokens: ["tes", "ova"], decoys: [],
      art: '<path class="bgart" d="M30,30 C28,120 60,176 120,196 C180,176 212,120 210,30Z"/><path class="bgart" d="M102,92 C102,72 138,72 138,92 C140,120 130,150 120,160 C110,150 100,120 102,92Z"/><path class="bgline" d="M104,86 C86,72 74,74 64,90 M136,86 C154,72 166,74 176,90"/><path class="bgart" d="M250,30 C248,120 280,176 340,196 C400,176 432,120 430,30Z"/><path class="bgart" d="M300,206 C296,262 322,294 340,294 C358,294 384,262 380,206Z"/><line class="bgline" x1="230" y1="20" x2="230" y2="320"/><text class="bgtext" x="120" y="326">FEMALE</text><text class="bgtext" x="340" y="326">MALE</text>',
      slots: [{ g: "ova", x: 120, y: 92, sx: 1.9, sy: 1 }, { g: "tes", x: 340, y: 250, sx: 1, sy: 1 }] }
  ];

  function startGland() {
    stop(); shell("Guess the Gland");
    var TOTAL = 9, bi = 0, placed = 0, perfect = 0, streak = 0, left = 0, sel = null, drag = null, mistakes = {}, slots = [];
    $("#g-body").innerHTML = '<div class="g1p"><div><p class="objective" id="g1-title"></p><svg class="g1p__svg" viewBox="0 0 460 340" id="g1-board" role="img" aria-label="Body diagram with places for glands"></svg>' +
      '<div class="tray" id="g1-tray"></div><p class="g1msg" id="g1-msg" aria-live="polite"></p></div><div id="g1-info"></div></div>';
    var svg = $("#g1-board"), tray = $("#g1-tray"), info = $("#g1-info"), msg = $("#g1-msg");
    cleanup = function () { if (drag && drag.ghost) drag.ghost.remove(); };

    function tokenHTML(g) { return '<button class="token" type="button" data-g="' + g + '"><svg viewBox="0 0 100 100" aria-hidden="true"><g class="tshape">' + SHAPES[g] + "</g></svg><span>" + INFO[g].name + "</span></button>"; }
    function setInfo(html) { info.innerHTML = html; }
    function drawBoard() {
      var b = BOARDS[bi]; sel = null; mistakes = {}; left = b.tokens.length; slots = [];
      setProg("Part " + (bi + 1) + " of " + BOARDS.length + " · " + b.title, placed / TOTAL);
      $("#g1-title").innerHTML = "<b>" + b.title + "</b>: " + b.lead + "<small>Drag each gland to its place, or tap a gland and then its spot.</small>";
      svg.innerHTML = b.art;
      b.slots.forEach(function (s) {
        var g = svgEl("g", { "class": "slot" + (s.after ? " off" : ""), tabindex: 0, role: "button", "data-g": s.g, "aria-label": "Place a gland here", transform: "translate(" + s.x + " " + s.y + ") scale(" + s.sx + " " + s.sy + ") translate(-50 -50)" }, svg);
        var inner = svgEl("g", { "class": "sshape" }, g); inner.innerHTML = SHAPES[s.g];
        slots.push({ g: s.g, el: g, after: s.after, placed: false, off: !!s.after });
      });
      tray.innerHTML = shuffle(b.tokens.concat(b.decoys)).map(tokenHTML).join("");
      msg.textContent = "";
      setInfo('<div class="gpop gpop--empty"><p>Place a gland on the body and its info pops up here.</p></div>');
    }
    function slotRect(s) { var r = s.el.getBoundingClientRect(); return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, rad: Math.max(42, Math.max(r.width, r.height) / 2 * .9 + 18) }; }
    function nearest(x, y) {
      var best = null, bd = 1e9;
      slots.forEach(function (s) { if (s.placed || s.off) return; var r = slotRect(s), d = Math.hypot(x - r.cx, y - r.cy); if (d < r.rad && d < bd) { bd = d; best = s; } });
      return best;
    }
    function hot(s) { slots.forEach(function (x) { x.el.classList.toggle("hot", x === s); }); }

    function drop(tokenEl, slot) {
      var g = tokenEl.getAttribute("data-g"), b = BOARDS[bi];
      if (slot && slot.g === g) return success(tokenEl, slot, g);
      mistakes[g] = (mistakes[g] || 0) + 1; streak = 0; $("#g-streak").hidden = true;
      tokenEl.classList.remove("sel", "shake"); void tokenEl.offsetWidth; tokenEl.classList.add("shake"); sel = null;
      var onBoard = b.tokens.indexOf(g) > -1;
      msg.textContent = !onBoard ? "The " + INFO[g].name.toLowerCase() + " isn't on this part of the body. Try the other parts!" :
        (slot ? "Not quite. " : "Drop it right on one of the dashed spots. ") + "Hint: " + INFO[g].hint;
      if (onBoard && mistakes[g] >= 2) slots.forEach(function (s) { if (s.g === g && !s.off) s.el.classList.add("hint"); });
    }
    function success(tokenEl, slot, g) {
      slot.placed = true; slot.el.classList.remove("hint", "hot"); slot.el.classList.add("placed");
      var first = !mistakes[g]; if (first) perfect++;
      streak++; var gain = (first ? 20 : 10) + (first ? Math.min(streak - 1, 5) * 2 : 0);
      setScore(score + gain); burst(slot.el);
      var st = $("#g-streak"); st.hidden = streak < 2; st.textContent = "🔥 " + streak + " in a row";
      tokenEl.classList.add("gone"); later(function () { tokenEl.remove(); }, 400);
      placed++; left--; setProg("Part " + (bi + 1) + " of " + BOARDS.length + " · " + BOARDS[bi].title, placed / TOTAL);
      var d = INFO[g], done = left === 0, last = bi === BOARDS.length - 1;
      msg.textContent = (first ? "Perfect! +" : "Placed! +") + gain;
      if (g === "thy" && slots.some(function (s) { return s.g === "para"; })) {   // flip to the back view to reveal the parathyroid spot
        slot.el.classList.add("back");
        slots.forEach(function (s) { if (s.g === "para") { s.off = false; s.el.classList.remove("off"); s.el.classList.add("hint"); } });
        msg.textContent += " · Now look at the back of the thyroid…";
      }
      setInfo('<div class="gpop"><b>' + d.name + '</b><p class="makes"><i>Makes</i>' + d.makes + "</p><p>" + d.job + "</p>" +
        (done ? '<button class="btn btn--mint" type="button" id="g1-next">' + (last ? "See results" : "Next: " + BOARDS[bi + 1].title + " →") + "</button>" : "") + "</div>");
      if (done) {
        [].forEach.call(tray.querySelectorAll(".token"), function (t) { t.classList.add("gone"); });
        $("#g1-next").addEventListener("click", function () { if (last) finish(); else { bi++; drawBoard(); } });
        $("#g1-next").focus({ preventScroll: true });
      }
    }
    function select(t) {
      var was = t.classList.contains("sel");
      [].forEach.call(tray.querySelectorAll(".token"), function (x) { x.classList.remove("sel"); });
      sel = was ? null : t; if (sel) { t.classList.add("sel"); msg.textContent = "Now tap its spot on the body."; } else msg.textContent = "";
    }

    tray.addEventListener("pointerdown", function (e) {
      var t = e.target.closest(".token"); if (!t || drag) return;
      e.preventDefault(); drag = { t: t, id: e.pointerId, sx: e.clientX, sy: e.clientY, moved: false, ghost: null };
      try { t.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }
    });
    tray.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 8) {
        drag.moved = true; drag.ghost = drag.t.cloneNode(true); drag.ghost.classList.add("ghost"); document.body.appendChild(drag.ghost); drag.t.classList.add("lifted"); msg.textContent = "";
      }
      if (drag.moved) { drag.ghost.style.left = e.clientX + "px"; drag.ghost.style.top = e.clientY + "px"; hot(nearest(e.clientX, e.clientY)); }
    });
    function endDrag(e, cancelled) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag; drag = null;
      if (d.moved) { d.ghost.remove(); d.t.classList.remove("lifted"); var s = cancelled ? null : nearest(e.clientX, e.clientY); hot(null); if (!cancelled) drop(d.t, s); }
      else if (!cancelled) select(d.t);
    }
    tray.addEventListener("pointerup", function (e) { endDrag(e, false); });
    tray.addEventListener("pointercancel", function (e) { endDrag(e, true); });
    tray.addEventListener("click", function (e) { var t = e.target.closest(".token"); if (t && e.detail === 0) select(t); });   // keyboard
    function slotActivate(el) {
      var s = slots.filter(function (x) { return x.el === el; })[0];
      if (!s || s.placed || s.off) return;
      if (!sel) { msg.textContent = "Pick a gland from the tray first."; return; }
      var t = sel; drop(t, s);
    }
    svg.addEventListener("click", function (e) { var el = e.target.closest(".slot"); if (el) slotActivate(el); });
    svg.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("slot")) { e.preventDefault(); slotActivate(e.target); } });

    function finish() {
      var msgs = perfect >= 8 ? "Gland guru! Nearly every gland went straight to its place." : perfect >= 6 ? "Hormone hero! You know the body map well." : perfect >= 3 ? "Getting there. Try again for more first-try placements." : "Good start. The Learn pages show where each gland lives.";
      results("gland", 0, perfect + " of " + TOTAL + " placed first try", msgs);
    }
    drawBoard();
  }

  /* =====================================================================
     GAME 2: HOMEOSTASIS CHALLENGE  (tap the pancreas cells; watch hormones travel and glucose respond)
     ===================================================================== */
  var DUR = 26;
  var HSC = [
    { tag: "After a meal", title: "A meal is coming", intro: "Soon you'll eat. When glucose rises, tap the pancreas's beta cells to release insulin and keep glucose in the green zone.", start: 48, drift: 0, insPow: 6, gluPow: 5,
      events: [{ t: 2, rise: 16, dur: 2.4, msg: "You just ate a meal! Glucose is rising." }, { t: 14, rise: 8, dur: 1, msg: "A snack! Glucose ticks up again." }],
      explain: "Rising glucose makes the beta cells release insulin. Insulin binds receptors on muscle and fat cells, telling them to take in glucose, and tells the liver to store it. Too much insulin can push glucose too low, which is why the body adjusts step by step." },
    { tag: "Fasting", title: "Many hours without food", intro: "You haven't eaten for hours, so glucose slowly drifts down. Tap the alpha cells to release glucagon and keep it in the green zone.", start: 50, drift: -2, insPow: 6, gluPow: 5,
      events: [{ t: .5, rise: 0, dur: 0, msg: "It's been hours since you ate. Glucose is slowly falling." }],
      explain: "Between meals, alpha cells release glucagon. Glucagon tells the liver to break down stored glycogen and make new glucose, so blood glucose stays steady. Insulin would have pushed it even lower." },
    { tag: "Insulin resistance", title: "When cells respond weakly", intro: "After a meal your insulin is already high, but your cells respond to it poorly. Insulin helps only a little. What else can help muscles take up glucose?", start: 50, drift: 0, insPow: 1.2, gluPow: 5, exercise: true, baseIns: .9,
      events: [{ t: 1.5, rise: 16, dur: 2.4, msg: "You ate a meal. Glucose is rising, and insulin is already high." }, { t: 15, rise: 8, dur: 1, msg: "Another snack!" }],
      explain: "In insulin resistance, insulin is present and binds its receptors, but the cell's response is weaker, so glucose stays high. That's different from having no insulin at all. Moving muscles helps them take in glucose even when the insulin signal is weak." }
  ];
  var HEX = '<svg viewBox="-12 -12 24 24" aria-hidden="true"><polygon points="9.5,5.5 0,11 -9.5,5.5 -9.5,-5.5 0,-11 9.5,-5.5" fill="none" stroke="' + INK + '" stroke-width="2.6"/></svg>';
  var HEXPTS = (function () { var p = []; for (var i = 0; i < 6; i++) { var a = Math.PI / 3 * i + Math.PI / 6; p.push((9 * Math.cos(a)).toFixed(1) + "," + (9 * Math.sin(a)).toFixed(1)); } return p.join(" "); })();

  function startHomeo() {
    stop(); shell("Homeostasis Challenge");
    var round = 0, alive = true, raf = 0;
    cleanup = function () { alive = false; cancelAnimationFrame(raf); };
    $("#g-body").innerHTML = '<div id="hm"></div>';
    function intro() {
      var s = HSC[round]; setProg("Scenario " + (round + 1) + " of " + HSC.length, round / HSC.length);
      $("#hm").innerHTML = '<div class="interstitial"><p class="scen-tag">' + s.tag + "</p><h3>" + s.title + "</h3><p>" + s.intro + '</p><button class="btn btn--mint" type="button" id="hm-go">Start (' + DUR + " seconds)</button></div>";
      $("#hm-go").addEventListener("click", play); $("#hm-go").focus({ preventScroll: true });
    }
    function play() {
      var sc = HSC[round];
      $("#hm").innerHTML = '<div class="hm__grid"><div class="hm__scene"><svg class="hm-svg" viewBox="0 0 640 420" id="hm-svg" role="img" aria-label="Pancreas, bloodstream, muscle cell and liver cell"></svg><p class="hm__toast" id="hm-toast" aria-live="polite"></p></div>' +
        '<div class="hm__panel"><p class="objective">' + sc.tag + ": keep glucose in the green zone.<small>Tap the pancreas cells to release " + (sc.exercise ? "insulin or glucagon, or tap MOVE." : "hormones.") + "</small></p>" +
        '<div class="hm__meterwrap"><div class="gmeter gmeter--v" id="meter"><div class="gmeter__track"><div class="gmeter__drop" id="drop">' + HEX + '</div></div><div class="gmeter__zones"><span>Too high</span><span>Balanced</span><span>Too low</span></div></div>' +
        '<div class="hm__side"><div class="gmeter__state" id="mstate"></div><div class="hm__stat"><span id="hm-bal">In balance: 0.0 s</span><div class="hm__timer"><i id="hm-tbar"></i></div></div>' +
        '<div class="inds inds--col"><div class="ind"><b>Insulin</b><i id="ind-ins"></i></div><div class="ind ind--glu"><b>Glucagon</b><i id="ind-glu"></i></div></div></div></div></div></div>';
      var svg = $("#hm-svg"), meter = $("#meter"), drop = $("#drop"), toastEl = $("#hm-toast");
      function E(tag, a, p) { return svgEl(tag, a, p || svg); }
      // pancreas + two cell clusters
      var panG = E("g", { transform: "translate(320 62) scale(3.3 1.5) translate(-50 -50)" }); panG.innerHTML = SHAPES.pan; panG.setAttribute("class", "hm-pan");
      function cluster(cx, cls, label, sub, key) {
        var g = E("g", { "class": "hm-cl " + cls, tabindex: 0, role: "button", "aria-label": label + ": " + sub });
        [[0, -10], [-13, 6], [13, 6], [0, 14], [-26, -6], [26, -6]].forEach(function (o) { E("circle", { cx: cx + o[0], cy: 62 + o[1], r: 11 }, g); });
        E("circle", { "class": "hit", cx: cx, cy: 62, r: 50 }, g);
        var t1 = E("text", { x: cx, y: 112, "text-anchor": "middle", "class": "hm-lbl" }, g); t1.textContent = label;
        var t2 = E("text", { x: cx, y: 128, "text-anchor": "middle", "class": "hm-sub" }, g); t2.textContent = sub;
        g.addEventListener("click", function () { release(key); });
        g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); release(key); } });
        return g;
      }
      var beta = cluster(236, "beta", "BETA CELLS", "tap: insulin", "ins"), alpha = cluster(404, "alpha", "ALPHA CELLS", "tap: glucagon", "glu");
      // bloodstream
      E("rect", { x: 0, y: 140, width: 640, height: 86, "class": "hm-blood" });
      var t = E("text", { x: 14, y: 156, "class": "hm-sub" }); t.textContent = "BLOODSTREAM";
      var hexes = []; for (var i = 0; i < 22; i++) { var h = E("polygon", { points: HEXPTS, "class": "hm-hex" }); hexes.push({ el: h, y: 160 + (i * 19 % 52), sp: 12 + (i % 5) * 6, x0: i * 53 }); }
      // cells
      function cell(x, cls, name, recPath, rxs) {
        var g = E("g", { "class": "hm-cell " + cls });
        E("rect", { "class": "body", x: x, y: 292, width: 200, height: 112, rx: 36 }, g);
        var nuc = E("circle", { "class": "nuc", cx: x + 100, cy: 356, r: 20 }, g); void nuc;
        var tx = E("text", { x: x + 100, y: 396, "text-anchor": "middle", "class": "hm-lbl" }, g); tx.textContent = name;
        rxs.forEach(function (rx) { var r = E("path", { d: recPath, transform: "translate(" + rx + " 292)", fill: "none", stroke: CREAM, "stroke-width": 4, "stroke-linejoin": "round" }, g); void r; });
        return g;
      }
      var muscle = cell(60, "muscle", "MUSCLE CELL", "M-11,-14 L-11,0 L11,0 L11,-14", [110, 160, 210]);
      [135, 185].forEach(function (cx) { var c = E("g", { "class": "chan" }, muscle); E("rect", { x: cx - 9, y: 279, width: 7, height: 26, rx: 3 }, c); E("rect", { x: cx + 2, y: 279, width: 7, height: 26, rx: 3 }, c); });
      var liver = cell(380, "liver", "LIVER CELL", "M-12,-16 L0,0 L12,-16", [430, 480, 530]);
      var exBtn = null;
      if (sc.exercise) {
        exBtn = E("g", { "class": "hm-ex", tabindex: 0, role: "button", "aria-label": "Move your muscles" });
        E("circle", { cx: 160, cy: 340, r: 28 }, exBtn);
        var xt = E("text", { x: 160, y: 345, "text-anchor": "middle" }, exBtn); xt.textContent = "MOVE";
        exBtn.addEventListener("click", exercise); exBtn.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); exercise(); } });
      }
      var mols = E("g", {});
      var bars = { ins: null, glu: null };
      // indicators (insulin / glucagon levels) as HTML under the meter
      bars.ins = $("#ind-ins"); bars.glu = $("#ind-glu");

      // ---- simulation state ----
      var g = sc.start, tt = 0, bal = 0, outT = 0, recovered = false, cd = 0, exCd = 0, insL = sc.baseIns || .1, gluL = .1, lastZone = "", seen = {};
      var rising = [], effects = [], molecules = [], uptakes = [], fired = {}, toastUntil = 0, cnt = { ins: 0, glu: 0 };
      function toast(text, secs) { toastEl.textContent = text; toastUntil = tt + (secs || 3.2); }
      function zone(v) { return v < 33 ? "low" : v > 67 ? "high" : "ok"; }
      function spawn(type, delay) {
        var tx, startX = type === "ins" ? 236 : 404, rx = type === "ins" ? [110, 160, 210][cnt.ins++ % 3] : [430, 480, 530][cnt.glu++ % 3];
        var el = E(type === "ins" ? "rect" : "polygon", type === "ins" ? { x: -8, y: -8, width: 16, height: 16, rx: 3, fill: MINT } : { points: "-10,-8 10,-8 0,10", fill: CREAM }, mols); void tx;
        el.setAttribute("opacity", 0);
        var pts = [[startX, 84], [startX, 182], [rx, 182], [rx, 280]], len = 0, seg = [];
        for (var k = 1; k < pts.length; k++) { var d = Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]); seg.push(d); len += d; }
        molecules.push({ type: type, el: el, pts: pts, seg: seg, len: len, d: -delay * 200, rx: rx });
      }
      function release(type) {
        if (cd > 0) return; cd = .35;
        spawn(type, 0); spawn(type, .18);
        if (type === "ins") { insL = Math.min(1, insL + .4); } else { gluL = Math.min(1, gluL + .4); }
        (type === "ins" ? beta : alpha).classList.remove("tap"); void (type === "ins" ? beta : alpha).getBoundingClientRect(); (type === "ins" ? beta : alpha).classList.add("tap");
      }
      function uptake(fromX, fromY, toY, n, cls) {
        for (var k = 0; k < n; k++) { var el = E("polygon", { points: HEXPTS, "class": "hm-hex " + (cls || "") }, mols); uptakes.push({ el: el, x: fromX + (k - (n - 1) / 2) * 22, y0: fromY, y1: toY, t: -k * .18 }); }
      }
      function pulse(c) { c.classList.add("pulse"); setTimeout(function () { c.classList.remove("pulse"); }, 700); }
      function arrive(m) {
        m.el.remove();
        if (m.type === "ins") {
          effects.push({ rate: -sc.insPow / 1.2, left: 1.2 }); pulse(muscle);
          muscle.classList.add(sc.insPow > 3 ? "open" : "weak"); setTimeout(function () { muscle.classList.remove("open", "weak"); }, 1300);
          uptake(m.rx, 190, 340, sc.insPow > 3 ? 2 : 1);
          if (!seen.ins) { seen.ins = 1; toast(sc.insPow > 3 ? "Insulin binds its receptor, and the cell lets glucose in." : "Insulin binds, but the response is weak. Only a little glucose gets in.", 3.6); }
        } else {
          effects.push({ rate: sc.gluPow / 1.2, left: 1.2 }); pulse(liver); uptake(m.rx, 340, 196, 2, "up");
          if (!seen.glu) { seen.glu = 1; toast("Glucagon tells the liver to release stored glucose into the blood.", 3.6); }
        }
      }
      function exercise() {
        if (exCd > 0) return; exCd = 3; effects.push({ rate: -4, left: 2.5 }); pulse(muscle);
        muscle.classList.add("open"); setTimeout(function () { muscle.classList.remove("open"); }, 2500);
        uptake(135, 190, 340, 2); setTimeout(function () { uptake(185, 190, 340, 2); }, 700); setTimeout(function () { uptake(160, 190, 340, 2); }, 1500);
        exBtn.classList.add("cool"); setTimeout(function () { exBtn.classList.remove("cool"); }, 3000);
        toast("Working muscles take up glucose even when the insulin signal is weak.", 3.6);
      }

      var last = performance.now();
      function frame(now) {
        if (!alive || !svg.isConnected) return;
        var dt = Math.min(.06, (now - last) / 1000); last = now; tt += dt; cd = Math.max(0, cd - dt); exCd = Math.max(0, exCd - dt);
        sc.events.forEach(function (ev, i) { if (!fired[i] && tt >= ev.t) { fired[i] = 1; toast(ev.msg, 3.4); if (ev.dur) rising.push({ rate: ev.rise, left: ev.dur }); } });
        g += sc.drift * dt;
        rising.forEach(function (r) { if (r.left > 0) { var u = Math.min(dt, r.left); g += r.rate * u; r.left -= u; } });
        effects.forEach(function (r) { if (r.left > 0) { var u = Math.min(dt, r.left); g += r.rate * u; r.left -= u; } });
        g = Math.max(0, Math.min(100, g));
        var z = zone(g);
        if (z === "ok") { bal += dt; if (outT >= 1.5 && !recovered) { recovered = true; toast("Recovered! Back in balance. +5", 3); } outT = 0; } else outT += dt;
        insL = Math.max(sc.baseIns || 0, insL - dt * .3); gluL = Math.max(0, gluL - dt * .3);
        // visuals
        drop.style.setProperty("--g", g.toFixed(1));
        if (z !== lastZone) { lastZone = z; meter.classList.toggle("is-ok", z === "ok"); $("#mstate").textContent = z === "ok" ? "Balanced ✓" : z === "low" ? "Too low" : "Too high"; }
        bars.ins.style.setProperty("--lvl", insL.toFixed(2)); bars.glu.style.setProperty("--lvl", gluL.toFixed(2));
        $("#hm-bal").textContent = "In balance: " + bal.toFixed(1) + " s"; $("#hm-tbar").style.width = Math.min(100, tt / DUR * 100).toFixed(1) + "%";
        var n = Math.round(g / 100 * 22);
        hexes.forEach(function (h, i) { if (i < n) { h.el.setAttribute("opacity", 1); h.el.setAttribute("transform", "translate(" + (((h.x0 + tt * h.sp) % 700) - 30).toFixed(1) + " " + (h.y + Math.sin(tt * 1.3 + i) * 4).toFixed(1) + ")"); } else h.el.setAttribute("opacity", 0); });
        molecules = molecules.filter(function (m) {
          m.d += 200 * dt; if (m.d < 0) return true;
          if (m.d >= m.len) { arrive(m); return false; }
          var rem = m.d, k = 0; while (rem > m.seg[k]) { rem -= m.seg[k]; k++; }
          var a = m.pts[k], b = m.pts[k + 1], u = rem / m.seg[k];
          m.el.setAttribute("transform", "translate(" + (a[0] + (b[0] - a[0]) * u).toFixed(1) + " " + (a[1] + (b[1] - a[1]) * u).toFixed(1) + ")"); m.el.setAttribute("opacity", 1); return true;
        });
        uptakes = uptakes.filter(function (u) {
          u.t += dt / .9; if (u.t < 0) { u.el.setAttribute("opacity", 0); return true; }
          if (u.t >= 1) { u.el.remove(); return false; }
          u.el.setAttribute("opacity", (1 - Math.max(0, u.t - .7) / .3).toFixed(2)); u.el.setAttribute("transform", "translate(" + u.x + " " + (u.y0 + (u.y1 - u.y0) * u.t).toFixed(1) + ")"); return true;
        });
        if (toastUntil && tt > toastUntil) { toastEl.textContent = ""; toastUntil = 0; }
        if (exBtn && tt > 4 && exCd === 0 && !seen.ex && g > 67) exBtn.classList.add("hint");
        if (tt >= DUR) return finishScenario();
        raf = requestAnimationFrame(frame);
      }
      function finishScenario() {
        var gain = Math.round(bal * 2) + (recovered ? 5 : 0); setScore(score + gain);
        var last = round === HSC.length - 1;
        $("#hm").innerHTML = '<div class="interstitial"><p class="scen-tag">' + sc.tag + " complete</p><h3>" + bal.toFixed(1) + " s in balance · +" + gain + "</h3><p>" + (recovered ? "You recovered from being out of balance. +5 bonus. " : "") + sc.explain + '</p><button class="btn btn--mint" type="button" id="hm-next">' + (last ? "See results" : "Next scenario") + "</button></div>";
        $("#hm-next").addEventListener("click", function () { if (last) done(); else { round++; intro(); } }); $("#hm-next").focus({ preventScroll: true });
      }
      toast("Tap the pancreas cells to release hormones.", 3);
      raf = requestAnimationFrame(frame);
    }
    function done() { results("homeo", 0, "Round complete", score >= 110 ? "Excellent balance! You kept glucose steady and recovered fast." : score >= 70 ? "Nicely done. Feedback loops take practice." : "Good effort. Try again and watch how insulin and glucagon move glucose."); }
    intro();
  }

  /* =====================================================================
     GAME 3: HORMONE DELIVERY SIMULATOR
     ===================================================================== */
  var REC = {
    ins: { name: "insulin", cup: "M-11,-15 L-11,0 L11,0 L11,-15", off: -8 },
    glu: { name: "glucagon", cup: "M-12,-16 L0,0 L12,-16", off: -11 },
    epi: { name: "epinephrine (adrenaline)", cup: "M-12,-14 A12,12 0 0,0 12,-14", off: -12 }
  };
  function hormoneShape(parent, k) {
    var g = svgEl("g", {}, parent);
    if (k === "ins") svgEl("rect", { x: -9, y: -9, width: 18, height: 18, rx: 3, fill: MINT }, g);
    else if (k === "glu") svgEl("polygon", { points: "-11,-9 11,-9 0,11", fill: CREAM }, g);
    else svgEl("circle", { r: 10, fill: SAGE }, g);
    return g;
  }
  var PTS = [["Find the target", 2], ["Multiple hormones", 3], ["Receptor problem", 2]];
  var EXPL_INS = "Insulin binds to its receptor on the cell surface. That starts signalling inside the cell, which tells it to bring glucose transporters to the surface so glucose can enter. Insulin doesn't carry the glucose itself.";

  function startDelivery() {
    stop(); shell("Hormone Delivery");
    var alive = true, stage = 0, doneRounds = 0, totalRounds = 7, raf = 0;
    cleanup = function () { alive = false; cancelAnimationFrame(raf); };
    $("#g-body").innerHTML = '<div class="pips" id="pips"></div><div id="g3"></div>';

    function pips(cur) {
      $("#pips").innerHTML = PTS.map(function (p, i) { return '<span class="pip ' + (i < cur ? "done" : i === cur ? "now" : "") + '" title="' + p[0] + '">' + (i < cur ? "✓ " : i > cur ? "🔒 " : "") + (i + 1) + '<span class="pl"> · ' + p[0] + "</span></span>"; }).join("");
    }
    function prog(label) { setProg(label, doneRounds / totalRounds); }

    /* ---- scene builder: bloodstream on top, cells below ---- */
    function scene(cells, hKey, objective, note, onCell) {
      var n = cells.length, R = n <= 3 ? 60 : 50, xs = n <= 3 ? [120, 320, 520].slice(0, n) : [85, 245, 405, 565], CY = 270;
      $("#g3").innerHTML = '<p class="objective">' + objective + (note ? "<small>" + note + "</small>" : "") + '</p><svg class="stage-svg" viewBox="0 0 640 380" id="stage"></svg><div id="g3-fb"></div>';
      var svg = $("#stage");
      svgEl("rect", { class: "blood", x: 0, y: 8, width: 640, height: 128, rx: 24 }, svg);
      svgEl("text", { x: 20, y: 30, fill: "rgba(242,236,217,.6)", style: "font:700 11px 'DM Sans',sans-serif;letter-spacing:.14em" }, svg).textContent = "BLOODSTREAM";
      var rbc = []; for (var j = 0; j < 7; j++) rbc.push(svgEl("ellipse", { rx: 13, ry: 7, fill: "rgba(242,236,217,.12)" }, svg));
      var S = { cells: [], hs: { x: 320, y: 78, rot: 0, s: 1 }, mode: "float", busy: false };
      cells.forEach(function (def, ci) {
        var cx = xs[ci], g = svgEl("g", { "class": "cell", tabindex: 0, role: "button", "aria-label": def.name }, svg);
        svgEl("circle", { "class": "ring", cx: cx, cy: CY, r: R }, g);
        svgEl("circle", { "class": "body", cx: cx, cy: CY, r: R }, g);
        svgEl("circle", { "class": "nuc", cx: cx + 6, cy: CY + 8, r: R * .3 }, g);
        svgEl("text", { x: cx, y: CY + R + 28 }, g).textContent = def.name;
        var angs = def.rec.length === 1 ? [-90] : def.rec.length === 2 ? [-125, -55] : [-140, -90, -40];
        var socks = def.rec.map(function (k, si) {
          var a = angs[si], rad = a * Math.PI / 180, px = cx + R * Math.cos(rad), py = CY + R * Math.sin(rad);
          var sg = svgEl("g", { transform: "translate(" + px.toFixed(1) + " " + py.toFixed(1) + ") rotate(" + (a + 90) + ")" }, g);
          svgEl("path", { d: REC[k].cup, fill: "none", stroke: CREAM, "stroke-width": 4, "stroke-linejoin": "round" }, sg);
          return { k: k, px: px, py: py, a: a, used: false };
        });
        var cell = { def: def, g: g, cx: cx, cy: CY, r: R, socks: socks, done: false };
        S.cells.push(cell);
        g.addEventListener("click", function () { onCell(cell); });
        g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onCell(cell); } });
      });
      S.dockLayer = svgEl("g", {}, svg);
      S.hel = svgEl("g", {}, svg); S.shape = hormoneShape(S.hel, hKey);
      svgEl("text", { x: 0, y: 30, "text-anchor": "middle", fill: CREAM, style: "font:800 13px 'DM Sans',sans-serif;letter-spacing:.06em;text-transform:uppercase" }, S.hel).textContent = REC[hKey].name.split(" ")[0];
      S.place = function () { S.hel.setAttribute("transform", "translate(" + S.hs.x.toFixed(1) + " " + S.hs.y.toFixed(1) + ") rotate(" + S.hs.rot.toFixed(1) + ")"); };
      S.moveTo = function (x, y, rot, ms, cb) {
        var f = { x: S.hs.x, y: S.hs.y, rot: S.hs.rot }, t0 = performance.now(); S.mode = "move"; ms = REDUCED ? 1 : ms;
        (function step(now) {
          if (!alive) return;
          var k = Math.min(1, (now - t0) / ms), e = ease(k);
          S.hs.x = f.x + (x - f.x) * e; S.hs.y = f.y + (y - f.y) * e; S.hs.rot = f.rot + (rot - f.rot) * e; S.place();
          if (k < 1) requestAnimationFrame(step); else if (cb) cb();
        })(t0);
      };
      S.home = function (cb) { S.moveTo(320, 78, 0, 600, function () { S.mode = "float"; if (cb) cb(); }); };
      S.dock = function (cell, sock) {   // leave a copy of the hormone sitting in the receptor
        var d = svgEl("g", { transform: "translate(" + sock.px.toFixed(1) + " " + sock.py.toFixed(1) + ") rotate(" + (sock.a + 90) + ") translate(0 " + REC[sock.k].off + ")" }, S.dockLayer);
        hormoneShape(d, sock.k); sock.used = true; return d;
      };
      function frame(t) {
        if (!alive || !svg.isConnected) return;
        rbc.forEach(function (e, j) { e.setAttribute("cx", (((t * .03 + j * 100) % 720) - 40).toFixed(1)); e.setAttribute("cy", [60, 100, 80, 50, 112, 72, 92][j]); });
        if (S.mode === "float" && !REDUCED) { S.hs.x = 320 + Math.sin(t / 700) * 22; S.hs.y = 78 + Math.sin(t / 480) * 7; S.hs.rot = Math.sin(t / 900) * 8; }
        S.place(); raf = requestAnimationFrame(frame);
      }
      cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
      S.msg = function (html) { $("#g3-fb").innerHTML = html; };
      return S;
    }
    function bounce(S, cell, text) {
      S.busy = true;
      S.moveTo(cell.cx, cell.cy - cell.r - 30, 0, 450, function () {
        cell.g.classList.add("shake"); later(function () { cell.g.classList.remove("shake"); }, 450);
        S.home(function () { S.busy = false; });
      });
      S.msg('<div class="feedback bad"><b>No match</b><p>' + text + "</p></div>");
    }
    function bind(S, cell, sock, cb) {
      S.busy = true;
      S.moveTo(sock.px + Math.cos(sock.a * Math.PI / 180) * 8, sock.py + Math.sin(sock.a * Math.PI / 180) * 8, sock.a + 90, 600, function () {
        S.dock(cell, sock); cell.g.classList.add("on");
        S.home(function () { S.busy = false; if (cb) cb(); });
      });
    }
    function interstitial(title, text, cb) {
      $("#g3").innerHTML = '<div class="interstitial"><h3>' + title + "</h3><p>" + text + '</p><button class="btn btn--mint" type="button" id="g3-go">Continue</button></div>';
      $("#g3-go").addEventListener("click", cb); $("#g3-go").focus({ preventScroll: true });
    }

    /* ---- Stage 1 + 2: click the cells that carry the matching receptor ---- */
    var S1 = [
      { h: "ins", prompt: "Find the cell that can respond to insulin!", note: "Match the hormone's shape to a receptor.", cells: [{ name: "Muscle cell", rec: ["ins"] }, { name: "Heart cell", rec: ["epi"] }, { name: "Gland cell", rec: ["glu"] }], explain: EXPL_INS },
      { h: "ins", prompt: "Insulin again. Which cell is its target this time?", cells: [{ name: "Heart cell", rec: ["epi"] }, { name: "Fat cell", rec: ["ins"] }, { name: "Gland cell", rec: ["glu"] }], explain: "Fat cells have insulin receptors too, so insulin has more than one kind of target. " + EXPL_INS }
    ];
    var S2cells = [{ name: "Muscle cell", rec: ["ins", "epi"] }, { name: "Liver cell", rec: ["ins", "glu"] }, { name: "Heart cell", rec: ["epi"] }, { name: "Nerve cell", rec: [] }];
    var S2 = [
      { h: "ins", prompt: "Insulin is on its way. Click every cell with an insulin receptor!", explain: "One hormone, several targets: insulin has receptors on muscle, liver and fat cells." },
      { h: "glu", prompt: "Now glucagon! Which cells can respond?", explain: "Glucagon's main target is the liver, where it signals stored glucose to be released." },
      { h: "epi", prompt: "Last one: epinephrine (adrenaline). Click all its targets!", explain: "Epinephrine acts on heart cells (faster heartbeat) and muscle cells (more blood flow), among others." }
    ];

    function playRound(def, cells, stageNo, next) {
      var mistakes = 0, found = 0;
      var targets = cells.filter(function (c) { return c.rec.indexOf(def.h) > -1; }).length;
      var S = scene(cells, def.h, def.prompt + (targets > 1 ? " (" + targets + " targets)" : ""), def.note || (stageNo === 2 ? "Each cell shows only the receptors we care about in this game." : ""), onCell);
      function onCell(cell) {
        if (S.busy || cell.done) return;
        var sock = null; cell.socks.forEach(function (s) { if (s.k === def.h && !s.used) sock = s; });
        if (!sock) {
          mistakes++;
          bounce(S, cell, cell.def.name + " has no " + REC[def.h].name + " receptor, so the hormone can't bind. Only the matching shape fits.");
          return;
        }
        cell.done = true;
        bind(S, cell, sock, function () {
          found++; burst(cell.g.querySelector(".body"));
          var g = stageNo === 1 ? (mistakes ? 10 : 15) : 10;
          setScore(score + g);
          if (found < targets) { S.msg('<div class="feedback"><b>Match! +' + g + "</b><p>" + (targets - found) + " more to find.</p></div>"); return; }
          if (stageNo === 2 && !mistakes) { setScore(score + 5); }
          doneRounds++; prog("Stage " + stageNo);
          S.msg('<div class="feedback"><b>' + (stageNo === 2 && !mistakes ? "Perfect round! +5 bonus" : "Match!") + "</b><p>" + def.explain + '</p><button class="btn btn--mint" type="button" id="g3-next">Next</button></div>');
          $("#g3-next").addEventListener("click", next); $("#g3-next").focus({ preventScroll: true });
        });
      }
    }
    function runStage1(i) {
      if (i >= S1.length) { pips(1); return interstitial("Stage 1 complete! ⭐", "Stage 2 unlocked: Multiple hormones. Some cells have more than one receptor.", function () { runStage2(0, shuffle(S2cells)); }); }
      pips(0); prog("Stage 1 · Round " + (i + 1) + " of 2");
      playRound(S1[i], shuffle(S1[i].cells), 1, function () { runStage1(i + 1); });
    }
    function runStage2(i, cells) {
      if (i >= S2.length) { pips(2); return interstitial("Stage 2 complete! ⭐", "Stage 3 unlocked: Receptor problem. What if a receptor doesn't work properly?", runStage3); }
      pips(1); prog("Stage 2 · Hormone " + (i + 1) + " of 3");
      playRound(S2[i], cells, 2, function () { runStage2(i + 1, cells); });
    }

    /* ---- Stage 3: one receptor malfunctions ---- */
    function runStage3() {
      pips(2); prog("Stage 3 · Deliver insulin to each cell");
      var cells = shuffle([{ name: "Cell A", rec: ["ins"] }, { name: "Cell B", rec: ["ins"], faulty: true }, { name: "Cell C", rec: ["ins"] }].map(function (c, i) { c.id = i; return c; }));
      var tested = 0;
      var S = scene(cells, "ins", "Insulin has arrived! Tap each cell to deliver it and watch the response.", "All three are muscle cells with an insulin receptor.", onCell);
      function respond(cell, strong) {
        var cx = cell.cx, top = cell.cy - cell.r;
        var g = svgEl("g", {}, S.dockLayer);
        var a = svgEl("rect", { x: cx - 24, y: top - 14, width: 8, height: 28, rx: 4, fill: MINT, opacity: strong ? 1 : .3 }, g);
        var b = svgEl("rect", { x: cx + 16, y: top - 14, width: 8, height: 28, rx: 4, fill: MINT, opacity: strong ? 1 : .3 }, g);
        var hx = svgEl("polygon", { points: "9.5,5.5 0,11 -9.5,5.5 -9.5,-5.5 0,-11 9.5,-5.5", fill: "none", stroke: CREAM, "stroke-width": 2.6 }, g);
        var t0 = performance.now(), dur = REDUCED ? 1 : 1500;
        (function step(now) {
          if (!alive) return;
          var k = Math.min(1, (now - t0) / dur), reach = strong ? 1 : .45;
          var y = top - 44 + (cell.r * .8 + 40) * Math.min(k / .9, 1) * reach;
          hx.setAttribute("transform", "translate(" + cx + " " + y.toFixed(1) + ")");
          hx.setAttribute("opacity", strong ? 1 : 1 - Math.max(0, k - .6) * 2.5);
          if (k < 1) requestAnimationFrame(step);
        })(t0);
        return [a, b, hx];
      }
      function onCell(cell) {
        if (S.busy || cell.done) return;
        var sock = cell.socks[0]; cell.done = true; tested++;
        bind(S, cell, sock, function () {
          var weak = !!cell.def.faulty;
          cell.g.classList.add(weak ? "weak" : "on"); respond(cell, !weak);
          setScore(score + 5);
          S.msg('<div class="feedback' + (weak ? " bad" : "") + '"><b>' + cell.def.name + (weak ? ": weak response" : ": responds!") + "</b><p>" + (weak ? "Insulin bound, but the signal inside the cell is weak and glucose barely gets in. Hmm." : "Insulin bound, signalling started, transporters moved to the surface and glucose is entering.") + "</p></div>");
          if (tested === cells.length) { doneRounds++; prog("Stage 3 · Diagnose"); later(diagnose, 2400); }
        });
      }
      function diagnose() {
        var weakName = cells.filter(function (c) { return c.faulty; })[0].name;
        var opts = shuffle([
          { t: "There's no insulin around", ok: 0, fb: "Insulin did arrive and it bound to the receptor, so it isn't missing." },
          { t: "Insulin binds, but the receptor signalling isn't working well", ok: 1, fb: "That's the idea behind insulin resistance: insulin is present and binds, but the cell responds less effectively. It's not the same as having no insulin, as in type 1 diabetes." },
          { t: "The hormone is the wrong shape for the receptor", ok: 0, fb: "The hormone did fit and dock, so the shapes match. The weak response came after binding." }
        ]);
        S.msg('<div class="feedback"><b>What\'s wrong with ' + weakName + "?</b><div class=\"answers\" id=\"g3-opts\" style=\"margin-top:10px\">" +
          opts.map(function (o, i) { return '<button class="ans" type="button" data-i="' + i + '">' + o.t + "</button>"; }).join("") + "</div></div>");
        [].forEach.call(document.querySelectorAll("#g3-opts .ans"), function (b) {
          b.addEventListener("click", function () {
            var o = opts[+b.getAttribute("data-i")];
            [].forEach.call(document.querySelectorAll("#g3-opts .ans"), function (x, xi) { x.disabled = true; x.classList.add(opts[xi].ok ? "ok" : x === b ? "bad" : "dim"); });
            if (o.ok) { setScore(score + 20); burst(b); }
            doneRounds++; prog("Stage 3 · Done");
            S.msg('<div class="feedback' + (o.ok ? "" : " bad") + '"><b>' + (o.ok ? "Right! +20" : "Not quite") + "</b><p>" + opts.filter(function (x) { return x.ok; })[0].fb + (o.ok ? "" : " " + o.fb) + '</p><button class="btn btn--mint" type="button" id="g3-done">See results</button></div>');
            $("#g3-done").addEventListener("click", function () { results("delivery", 130, "All stages complete", score >= 105 ? "Superb delivery! You've mastered how hormones find their targets." : score >= 75 ? "Well done. Hormones only act where the receptor fits." : "Nice try. Replay to learn which cells carry which receptors."); });
          });
        });
      }
    }
    runStage1(0);
  }

  /* =====================================================================
     MENU + ROUTER
     ===================================================================== */
  var GAMES = {
    gland: { title: "Guess the Gland", desc: "Drag each gland to its place on the body, then see what it makes and does.", icon: "glands", start: startGland },
    homeo: { title: "Homeostasis Challenge", desc: "Tap the pancreas to release insulin or glucagon and keep blood glucose in the green zone.", icon: "molecule", start: startHomeo },
    delivery: { title: "Hormone Delivery", desc: "Match hormones to the cells with the right receptor shape. Three short stages unlock one after another.", icon: "community", start: startDelivery }
  };
  function menu() {
    var I = window.EUSA_ICONS || {};
    root.innerHTML = '<div class="grid grid--3">' + Object.keys(GAMES).map(function (id, n) {
      var g = GAMES[id];
      return '<article class="card game-card" data-reveal style="--d:' + n * .1 + 's"><div class="icon">' + (I[g.icon] || "") + "</div><h3>" + g.title + "</h3><p>" + g.desc + '</p><p class="best">Best score: ' + (best(id) || "–") + '</p><a class="btn btn--dark" href="#' + id + '">Start</a></article>';
    }).join("") + "</div>";
    if (window.EUSA_observeReveals) window.EUSA_observeReveals(root);
  }
  function route() {
    stop();
    var id = location.hash.replace("#", "");
    if (GAMES[id]) { GAMES[id].start(); window.scrollTo({ top: Math.max(0, root.getBoundingClientRect().top + scrollY - 84), behavior: "auto" }); }
    else menu();
  }
  window.addEventListener("hashchange", route);
  route();
})();
