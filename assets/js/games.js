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
     GAME 1: GUESS THE GLAND
     ===================================================================== */
  var GL = {
    hypo: { name: "Hypothalamus", map: "hypo" }, pit: { name: "Pituitary gland", map: "hypo" }, thy: { name: "Thyroid gland", map: "thyroid" },
    para: { name: "Parathyroid glands", map: "para" }, adr: { name: "Adrenal glands", map: "adrenal" }, pan: { name: "Pancreas", map: "pancreas" },
    pin: { name: "Pineal gland", map: "pineal" }, ova: { name: "Ovaries", map: "gonads" }, tes: { name: "Testes", map: "gonads" }
  };
  var QS = [
    ["pin", "I'm a tiny gland deep in your brain. When it gets dark, I release melatonin. Who am I?", "Melatonin helps time your sleep–wake cycle: it rises at night and falls with bright light."],
    ["pin", "I make the “darkness hormone”. Which gland am I?", "Melatonin is nicknamed the darkness hormone because levels rise at night."],
    ["thy", "I'm shaped like a butterfly and sit at the front of your neck. My hormones help set your metabolism. Who am I?", "The thyroid releases T3 and T4, which help set how fast your cells use energy."],
    ["thy", "I need iodine to make my hormones, T3 and T4. Who am I?", "Without enough iodine, the thyroid can't make its hormones properly."],
    ["pit", "I'm pea-sized and sit at the base of your brain. Many call me the “master gland”. Who am I?", "Many pituitary hormones tell other glands what to do. The pituitary itself takes orders from the hypothalamus."],
    ["pit", "I release growth hormone and ACTH. Who am I?", "ACTH from the pituitary tells the adrenal glands to make cortisol."],
    ["hypo", "I link your nervous system to your hormones, and I tell the pituitary what to release. Who am I?", "The hypothalamus makes releasing hormones that control the pituitary."],
    ["hypo", "I make CRH, the hormone that starts the stress chain. Who am I?", "CRH tells the pituitary to release ACTH, which tells the adrenals to release cortisol."],
    ["adr", "I sit on top of your kidneys and release adrenaline when you get a fright. Who am I?", "Adrenaline gives the quick fight-or-flight boost. Cortisol handles the longer stress response."],
    ["adr", "I release cortisol, the “stress hormone”. Who am I?", "Cortisol helps manage blood sugar and inflammation during stress."],
    ["pan", "I'm tucked behind your stomach, and my beta cells release insulin. Who am I?", "Insulin lowers blood sugar by telling cells to take up glucose."],
    ["pan", "I release glucagon to raise blood sugar when it drops too low. Who am I?", "Glucagon tells the liver to release stored glucose into the blood."],
    ["para", "I'm four tiny glands stuck to the back of the thyroid. Who am I?", "The parathyroid glands sit behind the thyroid. Usually there are four."],
    ["para", "I release PTH, which keeps your blood calcium in range. Who am I?", "When blood calcium drops, parathyroid hormone (PTH) raises it again."],
    ["ova", "I'm found in the pelvis and I release estrogen and progesterone. Who am I?", "Ovaries release eggs and make estrogen and progesterone."],
    ["ova", "I release eggs, and I also make hormones. Who am I?", "As well as releasing eggs, the ovaries are an endocrine gland."],
    ["tes", "I make most of the body's testosterone. Who am I?", "Testes make testosterone, which supports sperm production and many body changes at puberty."],
    ["tes", "I sit outside the main body cavity, where it's cooler, and I make sperm and hormones. Who am I?", "Testes sit in the scrotum, where it's cooler, which suits sperm production."]
  ];

  function startGland() {
    stop(); shell("Guess the Gland");
    var qs = shuffle(QS).slice(0, 10), i = 0, streak = 0, correct = 0, locked = false;
    $("#g-body").innerHTML = '<div class="g1"><div><svg class="g1__svg" viewBox="-110 0 520 620" id="g1-map" aria-hidden="true"></svg></div><div><p class="clue" id="g1-clue"></p><div class="answers two" id="g1-ans"></div><div id="g1-fb"></div></div></div>';
    var map = $("#g1-map");
    map.innerHTML = A.TOUR_SVG || "";
    map.insertAdjacentHTML("beforeend", '<g class="gland" data-g="para"><circle class="ring" cx="150" cy="147" r="14"/><ellipse class="shape" cx="134" cy="141" rx="3" ry="4.2"/><ellipse class="shape" cx="134" cy="153" rx="3" ry="4.2"/><ellipse class="shape" cx="166" cy="141" rx="3" ry="4.2"/><ellipse class="shape" cx="166" cy="153" rx="3" ry="4.2"/><g class="label"><line x1="129" y1="150" x2="44" y2="160"/><text x="40" y="165" text-anchor="end">Parathyroids</text></g></g>');
    var glands = [].slice.call(map.querySelectorAll(".gland"));
    function light(key) { glands.forEach(function (g) { var on = g.getAttribute("data-g") === key; g.classList.toggle("on", on); g.classList.toggle("pop", on); }); }

    function ask() {
      var q = qs[i], right = q[0];
      locked = false; light(null);
      setProg("Question " + (i + 1) + " of " + qs.length, i / qs.length);
      $("#g1-clue").textContent = q[1]; $("#g1-fb").innerHTML = "";
      var others = shuffle(Object.keys(GL).filter(function (k) { return k !== right; })).slice(0, 3);
      var opts = shuffle([right].concat(others));
      $("#g1-ans").innerHTML = opts.map(function (k) { return '<button class="ans" type="button" data-k="' + k + '">' + GL[k].name + "</button>"; }).join("");
      [].forEach.call(document.querySelectorAll("#g1-ans .ans"), function (b) { b.addEventListener("click", function () { pick(b); }); });
    }
    function pick(btn) {
      if (locked) return; locked = true;
      var q = qs[i], right = q[0], ok = btn.getAttribute("data-k") === right, gain = 0;
      [].forEach.call(document.querySelectorAll("#g1-ans .ans"), function (b) {
        b.disabled = true;
        if (b.getAttribute("data-k") === right) b.classList.add("ok"); else if (b === btn) b.classList.add("bad"); else b.classList.add("dim");
      });
      light(GL[right].map);
      if (ok) { streak++; correct++; gain = 10 + Math.min(streak - 1, 5) * 2; setScore(score + gain); burst(btn); } else streak = 0;
      var st = $("#g-streak"); st.hidden = streak < 2; st.textContent = "🔥 " + streak + " in a row";
      var last = i === qs.length - 1;
      $("#g1-fb").innerHTML = '<div class="feedback' + (ok ? "" : " bad") + '"><b>' + (ok ? "Correct! +" + gain : "Not quite. It's the " + GL[right].name) + "</b><p>" + q[2] + '</p><button class="btn btn--mint" type="button" id="g1-next">' + (last ? "See results" : "Next question") + "</button></div>";
      $("#g1-next").addEventListener("click", function () { if (last) finish(); else { i++; ask(); } });
      $("#g1-next").focus({ preventScroll: true });
    }
    function finish() {
      var msg = correct >= 9 ? "Gland guru! You really know your endocrine system." : correct >= 7 ? "Hormone hero! Nearly perfect." : correct >= 4 ? "Getting there. Try again for a higher streak." : "Good start. The Learn pages can help with the glands.";
      results("gland", 0, correct + " of " + qs.length + " correct", msg);
    }
    ask();
  }

  /* =====================================================================
     GAME 2: HOMEOSTASIS CHALLENGE
     ===================================================================== */
  var SCEN = [
    { tag: "After a meal", text: "You just ate a meal. Your blood glucose is rising!", start: 86, ins: .15, glu: .15, choices: [
      { t: "Release insulin", ok: 1, end: 50, ins: 1, glu: 0, fb: "Rising glucose tells the pancreas to release insulin. Insulin signals muscle and fat cells to take up glucose and the liver to store it, so glucose settles back into the balanced range." },
      { t: "Release glucagon", end: 97, ins: 0, glu: 1, fb: "Glucagon does the opposite of what's needed here: it tells the liver to release glucose, pushing blood glucose even higher." },
      { t: "Do nothing", end: 84, ins: .15, glu: .15, fb: "Without a response, glucose stays high. A healthy body acts straight away, with the pancreas releasing insulin." }] },
    { tag: "Fasting", text: "It's been many hours since you last ate. Your blood glucose is drifting low!", start: 18, ins: .1, glu: .2, choices: [
      { t: "Release glucagon", ok: 1, end: 50, ins: 0, glu: 1, fb: "Glucagon tells the liver to break down stored glycogen and make new glucose, so glucose is released into the blood and stays in range between meals." },
      { t: "Release insulin", end: 8, ins: 1, glu: 0, fb: "Insulin lowers blood glucose, so it would push it even lower. Not what you want when glucose is already low." },
      { t: "Do nothing", end: 14, ins: .1, glu: .2, fb: "Glucose keeps falling. Between meals the pancreas releases glucagon to help keep it steady." }] },
    { tag: "Insulin resistance · 1 of 2", text: "After a meal, glucose is high and there's plenty of insulin in the blood, yet glucose stays high. What's going on?", start: 88, ins: 1, glu: .1, choices: [
      { t: "There's no insulin at all", end: 88, ins: 1, glu: .1, fb: "Insulin is clearly present (look at the indicator). Having no insulin at all is a different situation, as in type 1 diabetes." },
      { t: "Insulin is there, but cells respond to it poorly", ok: 1, end: 88, ins: 1, glu: .1, fb: "That's insulin resistance. The pancreas makes insulin and it binds its receptors, but the cells' response is weaker, so glucose stays high." },
      { t: "The liver is releasing too little glucagon", end: 88, ins: 1, glu: .1, fb: "Less glucagon would lower glucose, not keep it high. The problem is how well cells respond to the insulin that's already there." }] },
    { tag: "Insulin resistance · 2 of 2", text: "Cells respond weakly to insulin. How can you help bring glucose down?", start: 88, ins: 1, glu: .1, choices: [
      { t: "Move your muscles (exercise)", ok: 1, end: 55, ins: 1, glu: 0, fb: "Working muscles can take up glucose even when the insulin signal is weaker, and regular activity helps cells respond better to insulin over time." },
      { t: "Release even more insulin", partial: 1, end: 74, ins: 1, glu: 0, fb: "That's what the body tries first, and it helps a little. But the cells still respond weakly, so glucose stays on the high side." },
      { t: "Release glucagon", end: 98, ins: 1, glu: 1, fb: "Glucagon tells the liver to release more glucose, which makes high blood glucose even higher." }] }
  ];
  var HEX = '<svg viewBox="-12 -12 24 24" aria-hidden="true"><polygon points="9.5,5.5 0,11 -9.5,5.5 -9.5,-5.5 0,-11 9.5,-5.5" fill="none" stroke="' + INK + '" stroke-width="2.6"/></svg>';

  function startHomeo() {
    stop(); shell("Homeostasis Challenge");
    var r = 0, attempts = 0, tried = {}, max = SCEN.length * 20;
    $("#g-body").innerHTML = '<div class="gmeter" id="meter"><div class="gmeter__zones"><span>Too low</span><span>Balanced</span><span>Too high</span></div><div class="gmeter__track"><div class="gmeter__drop" id="drop">' + HEX + '</div></div><div class="gmeter__state" id="mstate"></div></div>' +
      '<div class="inds"><div class="ind"><b>Insulin</b><i id="ind-ins"></i></div><div class="ind ind--glu"><b>Glucagon</b><i id="ind-glu"></i></div></div>' +
      '<p class="scen-tag" id="scen-tag"></p><p class="clue" id="scen"></p><div class="answers" id="choices"></div><div id="fb"></div>';
    var meter = $("#meter"), drop = $("#drop");
    function zone(g) { return g < 33 ? "low" : g > 67 ? "high" : "ok"; }
    function setMeter(g, ins, glu) {
      drop.style.left = g + "%";
      meter.classList.toggle("is-ok", zone(g) === "ok");
      var z = zone(g); $("#mstate").textContent = z === "ok" ? "Balanced ✓" : z === "low" ? "Too low" : "Too high";
      $("#ind-ins").style.setProperty("--lvl", ins); $("#ind-glu").style.setProperty("--lvl", glu);
    }
    function show() {
      var s = SCEN[r]; attempts = 0; tried = {};
      setProg("Round " + (r + 1) + " of " + SCEN.length, r / SCEN.length);
      $("#scen-tag").textContent = s.tag; $("#scen").textContent = s.text; $("#fb").innerHTML = "";
      setMeter(s.start, s.ins, s.glu);
      renderChoices();
    }
    function renderChoices() {
      var s = SCEN[r];
      if (!s._order) s._order = shuffle(s.choices);
      $("#choices").innerHTML = s._order.map(function (c, i) { return '<button class="ans' + (tried[i] ? " bad" : "") + '" type="button" data-i="' + i + '"' + (tried[i] ? " disabled" : "") + ">" + c.t + "</button>"; }).join("");
      [].forEach.call(document.querySelectorAll("#choices .ans:not(:disabled)"), function (b) { b.addEventListener("click", function () { choose(+b.getAttribute("data-i"), b); }); });
    }
    function choose(i, btn) {
      var s = SCEN[r], c = s._order[i];
      [].forEach.call(document.querySelectorAll("#choices .ans"), function (b) { b.disabled = true; });
      $("#fb").innerHTML = "";
      tried[i] = true; setMeter(c.end, c.ins, c.glu);
      later(function () {
        var good = c.ok || c.partial, gain = 0;
        if (good) { gain = c.partial ? 10 : attempts === 0 ? 20 : 15; setScore(score + gain); if (c.ok) burst(drop); }
        var last = r === SCEN.length - 1;
        var head = c.ok ? (attempts ? "Recovered! +" + gain : "Balanced! +" + gain) : c.partial ? "A little help. +" + gain : "Not quite";
        var buttons = good ? '<button class="btn btn--mint" type="button" id="go">' + (last ? "See results" : "Next round") + "</button>" :
          '<button class="btn btn--mint" type="button" id="retry">Try again</button><button class="btn btn--ghost" type="button" id="go">' + (last ? "Skip and finish" : "Skip") + "</button>";
        $("#fb").innerHTML = '<div class="feedback' + (good ? "" : " bad") + '"><b>' + head + "</b><p>" + c.fb + '</p><div class="btn-row">' + buttons + "</div></div>";
        $("#go").addEventListener("click", function () { if (last) finish(); else { r++; show(); } });
        if (!good) $("#retry").addEventListener("click", function () { attempts++; $("#fb").innerHTML = ""; setMeter(s.start, s.ins, s.glu); renderChoices(); });
        (good ? $("#go") : $("#retry")).focus({ preventScroll: true });
      }, 1500);
    }
    function finish() {
      SCEN.forEach(function (s) { delete s._order; });
      results("homeo", max, "Round complete", score >= 70 ? "Excellent balance! You know your feedback loops." : score >= 45 ? "Nicely done. Mistakes are how feedback loops learn." : "Good effort. Try again and watch which hormone moves glucose which way.");
    }
    SCEN.forEach(function (s) { delete s._order; });
    show();
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
    gland: { title: "Guess the Gland", desc: "Read the clue, name the gland, and watch it light up on the body. Ten questions, with streak bonuses.", icon: "glands", start: startGland },
    homeo: { title: "Homeostasis Challenge", desc: "Keep blood glucose balanced: choose insulin, glucagon or neither, and see what happens to the meter.", icon: "molecule", start: startHomeo },
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
