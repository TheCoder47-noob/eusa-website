/* =========================================================
   EUSA demo — scroll-driven endocrine animations.
   Each [data-scrolly] section is "pinned" while its step cards
   scroll past; `s` = how many screens we've scrolled into it
   (card i is centred when s === i). Visuals are pure functions
   of `s` (+ time for idle motion), so scrolling back works too.
   ========================================================= */
(function () {
  "use strict";
  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function seg(s, a, b) { return clamp((s - a) / (b - a), 0, 1); }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function interp(x, xs, ys) {
    if (x <= xs[0]) return ys[0];
    for (var i = 1; i < xs.length; i++) if (x <= xs[i]) return lerp(ys[i - 1], ys[i], (x - xs[i - 1]) / (xs[i] - xs[i - 1]));
    return ys[ys.length - 1];
  }
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function hex2rgb(h) { var n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  function mixHex(a, b, t) { var A = hex2rgb(a), B = hex2rgb(b); return "rgb(" + A.map(function (v, i) { return Math.round(lerp(v, B[i], t)); }).join(",") + ")"; }
  function mixRgb(a, b, t) { return a.map(function (v, i) { return lerp(v, b[i], t); }); }
  function rgbStr(c) { return "rgb(" + c.map(Math.round).join(",") + ")"; }
  var HEART = "M50 90C28 72 10 56 10 36 10 20 22 10 34 12c8 1 13 7 16 14 3-7 8-13 16-14 12-2 24 8 24 24 0 20-18 36-40 54z";
  var PANCREAS = "M120,322 C130,312 150,314 165,316 C176,317 186,310 191,317 C194,326 182,329 168,328 C150,327 134,336 122,331 Z";

  /* =========================== scrolly engine =========================== */
  var stories = [];
  function register(name, init) {
    var root = document.querySelector('[data-scrolly="' + name + '"]');
    if (!root) return;
    var st = { root: root, stage: root.querySelector(".scrolly__stage"), steps: [].slice.call(root.querySelectorAll(".step")), s: -1, idx: -1, visible: false };
    var bar = document.createElement("div"); bar.className = "scrolly__bar"; bar.innerHTML = "<i></i>"; st.stage.appendChild(bar); st.bar = bar.firstChild;
    var dots = document.createElement("div"); dots.className = "scrolly__dots"; dots.setAttribute("aria-hidden", "true");
    dots.innerHTML = st.steps.map(function () { return "<i></i>"; }).join(""); st.stage.appendChild(dots); st.dots = [].slice.call(dots.children);
    st.api = init(st) || {};
    stories.push(st);
  }
  function measure() {
    stories.forEach(function (st) {
      var r = st.root.getBoundingClientRect();
      var vh = st.stage.offsetHeight || innerHeight;
      var n = st.steps.length;
      st.s = clamp(-r.top / vh, -1.2, n - 1 + .2);
      st.visible = r.bottom > -50 && r.top < innerHeight + 50;
      var idx = clamp(Math.round(st.s), 0, n - 1);
      if (idx !== st.idx) {
        st.idx = idx;
        st.steps.forEach(function (x, i) { x.classList.toggle("is-active", i === idx); });
        st.dots.forEach(function (x, i) { x.classList.toggle("on", i === idx); });
        if (st.api.step) st.api.step(idx);
      }
      st.bar.style.transform = "scaleX(" + clamp(st.s / (n - 1), 0, 1) + ")";
    });
  }
  var extraFrames = [];
  function loop(t) {
    measure();
    stories.forEach(function (st) { if (st.visible && st.api.frame) st.api.frame(st.s, REDUCED ? 0 : t); });
    extraFrames.forEach(function (f) { f(t); });
    if (!REDUCED) requestAnimationFrame(loop);
  }

  /* =========================== 1. GLAND TOUR =========================== */
  var TOUR_SVG =
    '<defs><filter id="glow" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
    '<g class="body-sil">' +
    '<ellipse cx="150" cy="72" rx="40" ry="50"/><rect x="133" y="110" width="34" height="56" rx="10"/>' +
    '<path d="M95,170 Q150,152 205,170 L215,190 Q205,280 198,330 Q210,380 205,420 L95,420 Q90,380 102,330 Q95,280 85,190 Z"/>' +
    '<path d="M97,172 Q70,180 65,210 L52,330 Q48,380 50,420 L66,420 Q68,380 74,335 L92,232 Z"/>' +
    '<path d="M203,172 Q230,180 235,210 L248,330 Q252,380 250,420 L234,420 Q232,380 226,335 L208,232 Z"/>' +
    '<path d="M97,410 L148,410 L142,520 L138,605 L112,605 L108,520 Z"/><path d="M152,410 L203,410 L192,520 L188,605 L162,605 L158,520 Z"/></g>' +
    '<g class="organs">' +
    '<path class="organ" d="M116,68 Q118,34 150,32 Q182,34 184,68 Q172,86 150,86 Q128,86 116,68 Z"/>' +
    '<path class="organ" transform="translate(150 203) scale(.24)" d="' + HEART + '" style="stroke-width:6"/>' +
    '<path class="organ" d="M104,250 Q130,234 160,246 Q150,268 120,272 Q104,266 104,250 Z"/>' +
    '<ellipse class="organ" cx="126" cy="301" rx="10" ry="15"/><ellipse class="organ" cx="174" cy="301" rx="10" ry="15"/></g>' +
    '<g id="tour-flows"></g>' +
    // hypothalamus + pituitary
    '<g class="gland" data-g="hypo"><circle class="ring" cx="147" cy="90" r="8"/><ellipse class="shape" cx="146" cy="82" rx="9" ry="6"/><path d="M147,87 L148,93" stroke="rgba(242,236,217,.6)" stroke-width="2"/><circle class="shape" cx="148" cy="97" r="5"/>' +
    '<g class="label"><line x1="137" y1="90" x2="44" y2="116"/><text x="40" y="112" text-anchor="end">Hypothalamus</text><text x="40" y="131" text-anchor="end">+ pituitary</text></g></g>' +
    '<g class="gland" data-g="pineal"><circle class="ring" cx="163" cy="66" r="6"/><ellipse class="shape" cx="163" cy="66" rx="5.5" ry="4.2"/>' +
    '<g class="label"><line x1="169" y1="64" x2="258" y2="46"/><text x="262" y="51">Pineal</text></g></g>' +
    '<g class="gland" data-g="thyroid"><circle class="ring" cx="150" cy="146" r="10"/><path class="shape" d="M150,160 C140,156 132,150 131,141 C130,133 137,129 143,133 C146,135 148,138 150,140 C152,138 154,135 157,133 C163,129 170,133 169,141 C168,150 160,156 150,160 Z"/>' +
    '<g class="label"><line x1="170" y1="144" x2="258" y2="140"/><text x="262" y="145">Thyroid</text></g></g>' +
    '<g class="gland" data-g="adrenal"><circle class="ring" cx="124" cy="283" r="7"/><circle class="ring" cx="176" cy="283" r="7"/><path class="shape" d="M115,289 Q124,270 133,289 Z"/><path class="shape" d="M167,289 Q176,270 185,289 Z"/>' +
    '<g class="label"><line x1="114" y1="283" x2="44" y2="252"/><text x="40" y="256" text-anchor="end">Adrenals</text></g></g>' +
    '<g class="gland" data-g="pancreas"><circle class="ring" cx="156" cy="321" r="10"/><path class="shape" d="' + PANCREAS + '"/>' +
    '<g class="label"><line x1="193" y1="320" x2="258" y2="336"/><text x="262" y="341">Pancreas</text></g></g>' +
    '<g class="gland" data-g="gonads"><circle class="ring" cx="136" cy="402" r="7"/><circle class="ring" cx="164" cy="402" r="7"/><ellipse class="shape" cx="136" cy="402" rx="8" ry="6"/><ellipse class="shape" cx="164" cy="402" rx="8" ry="6"/>' +
    '<g class="label"><line x1="127" y1="406" x2="44" y2="440"/><text x="40" y="445" text-anchor="end">Ovaries / testes</text></g></g>' +
    '<g id="tour-parts"></g>';

  var TOUR_FLOWS = {
    intro: ["M150,166 L150,405", "M150,180 C110,190 80,230 62,330", "M150,180 C190,190 220,230 238,330", "M150,405 C130,450 125,500 125,590", "M150,405 C170,450 175,500 175,590"],
    hypo: ["M148,101 C152,120 151,130 150,140", "M147,101 C140,180 128,230 124,277", "M149,101 C162,180 172,230 176,277", "M148,101 C150,250 140,330 136,396", "M149,101 C150,250 160,330 164,396"],
    pineal: ["M164,70 C200,90 208,140 215,190 S 235,300 240,380", "M162,70 C120,95 95,140 85,200 S 65,300 60,380", "M163,70 C160,150 150,260 150,400"],
    thyroid: ["M150,152 C110,180 80,230 62,330", "M150,152 C190,180 220,230 238,330", "M150,152 C148,250 150,350 125,560", "M150,152 C152,250 150,350 175,560", "M150,152 C140,190 130,220 128,252"],
    adrenal: ["M124,280 C140,250 155,230 160,214", "M176,280 C170,250 166,232 162,214", "M124,284 C96,330 76,370 60,405", "M176,284 C172,380 176,450 178,560"],
    pancreas: ["M140,320 C130,300 124,280 126,262", "M160,324 C120,380 115,450 122,560", "M175,322 C205,335 228,365 242,405", "M150,326 C120,340 90,370 58,405"],
    gonads: ["M136,398 C110,330 100,250 108,190", "M164,398 C190,330 200,250 192,190", "M150,402 C150,300 150,200 150,140", "M136,408 C130,470 128,520 125,590", "M164,408 C170,470 172,520 175,590"]
  };
  var TOUR_STEPS = ["intro", "hypo", "pineal", "thyroid", "adrenal", "pancreas", "gonads", "all"];

  register("tour", function (st) {
    var svg = st.root.querySelector("svg");
    svg.innerHTML = TOUR_SVG;
    var glands = [].slice.call(svg.querySelectorAll(".gland"));
    var flowsG = svg.querySelector("#tour-flows"), partG = svg.querySelector("#tour-parts");
    var paths = {};
    Object.keys(TOUR_FLOWS).forEach(function (k) {
      paths[k] = TOUR_FLOWS[k].map(function (d) { var p = el("path", { d: d, "class": "flow" }, flowsG); p._len = p.getTotalLength(); return p; });
    });
    var pool = [];
    for (var i = 0; i < 90; i++) pool.push(el("circle", { r: 3.2, "class": "particle", opacity: 0 }, partG));
    var active = [];
    function step(i) {
      var k = TOUR_STEPS[i];
      glands.forEach(function (g) {
        var key = g.getAttribute("data-g");
        g.classList.toggle("on", k === "all" || key === k);
        g.classList.toggle("soft", k === "intro");
      });
      Object.keys(paths).forEach(function (pk) { paths[pk].forEach(function (p) { p.classList.remove("on"); }); });
      active = k === "all" ? [].concat(paths.hypo, paths.pineal, paths.thyroid, paths.adrenal, paths.pancreas, paths.gonads) : paths[k];
      active.forEach(function (p) { p.classList.add("on"); });
    }
    function frame(s, t) {
      var per = active.length > 10 ? 3 : 4, n = 0;
      for (var pi = 0; pi < active.length; pi++) {
        var p = active[pi];
        for (var j = 0; j < per && n < pool.length; j++, n++) {
          var u = ((t / 1000) * 70 / p._len + j / per + pi * .137) % 1;
          var pt = p.getPointAtLength(u * p._len);
          var c = pool[n];
          c.setAttribute("cx", pt.x); c.setAttribute("cy", pt.y);
          c.setAttribute("opacity", (Math.sin(Math.PI * u) * .95).toFixed(2));
        }
      }
      for (; n < pool.length; n++) pool[n].setAttribute("opacity", 0);
    }
    return { step: step, frame: frame };
  });

  /* =========================== 2. INSULIN =========================== */
  register("insulin", function (st) {
    var svg = st.root.querySelector("svg");
    var meterVal = st.root.querySelector(".meter b"), meterBar = st.root.querySelector(".meter .track i");
    el("defs", {}, svg).innerHTML = '<filter id="glow3" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
    // bloodstream
    el("rect", { x: -20, y: 96, width: 680, height: 128, fill: "rgba(242,236,217,.06)" }, svg);
    el("line", { x1: -20, y1: 96, x2: 660, y2: 96, stroke: "rgba(242,236,217,.45)", "stroke-width": 3 }, svg);
    el("line", { x1: -20, y1: 224, x2: 660, y2: 224, stroke: "rgba(242,236,217,.45)", "stroke-width": 3 }, svg);
    el("text", { x: 626, y: 214, "text-anchor": "end", "class": "svg-label" }, svg).textContent = "Bloodstream →";
    var rbcs = [];
    for (var r = 0; r < 6; r++) rbcs.push(el("ellipse", { rx: 11, ry: 6, fill: "rgba(242,236,217,.13)" }, svg));
    // cell
    el("rect", { x: 20, y: 280, width: 600, height: 230, rx: 50, fill: "rgba(168,213,180,.10)", stroke: "#A8D5B4", "stroke-width": 3 }, svg);
    el("circle", { cx: 560, cy: 455, r: 26, fill: "rgba(168,213,180,.12)", stroke: "rgba(168,213,180,.4)", "stroke-width": 2 }, svg);
    el("text", { x: 50, y: 496, "class": "svg-label" }, svg).textContent = "Muscle / fat cell";
    // pancreas
    var panc = el("g", { transform: "translate(560 46) scale(1.35) translate(-156 -321)" }, svg);
    var pancShape = el("path", { d: PANCREAS, fill: "rgba(242,236,217,.4)", stroke: "#F2ECD9", "stroke-width": 1 }, panc);
    el("text", { x: 546, y: 86, "text-anchor": "middle", "class": "svg-label", style: "font-size:12px" }, svg).textContent = "Pancreas (beta cells)";
    // receptors + channels
    var REC = [150, 330, 510], CH = [208, 388, 568];
    var recs = REC.map(function (x) {
      var g = el("g", { transform: "translate(" + x + " 280)" }, svg);
      var p = el("path", { d: "M-15,0 L-15,-28 L-6,-28 L-6,-12 L6,-12 L6,-28 L15,-28 L15,0", fill: "none", stroke: "#F2ECD9", "stroke-width": 4, "stroke-linejoin": "round" }, g);
      el("path", { d: "M0,0 L0,20", stroke: "#F2ECD9", "stroke-width": 4 }, g);
      return p;
    });
    var chans = CH.map(function (x) {
      var g = el("g", {}, svg);
      return { g: g, x: x, a: el("rect", { y: -20, width: 9, height: 40, rx: 4, fill: "#A8D5B4" }, g), b: el("rect", { y: -20, width: 9, height: 40, rx: 4, fill: "#A8D5B4" }, g) };
    });
    // glucose
    var hexPts = []; for (var h = 0; h < 6; h++) { var a = Math.PI / 3 * h + Math.PI / 6; hexPts.push((11 * Math.cos(a)).toFixed(1) + "," + (11 * Math.sin(a)).toFixed(1)); }
    var gl = [];
    for (var k = 0; k < 12; k++) {
      var g = el("g", {}, svg);
      el("polygon", { points: hexPts.join(" "), fill: "rgba(242,236,217,.18)", stroke: "#F2ECD9", "stroke-width": 2.5 }, g);
      gl.push({ g: g, tx: 34 + k * 50, ty: [126, 162, 198][k % 3], k: k });
    }
    // insulin keys
    var KX = [200, 360, 500];
    var keys = KX.map(function () {
      var g = el("g", { opacity: 0 }, svg);
      el("circle", { cx: -10, cy: 0, r: 8, fill: "#A8D5B4" }, g);
      el("circle", { cx: -10, cy: 0, r: 3, fill: "#2B4439" }, g);
      el("rect", { x: -3, y: -3, width: 20, height: 6, rx: 2, fill: "#A8D5B4" }, g);
      el("rect", { x: 9, y: 3, width: 4, height: 6, fill: "#A8D5B4" }, g);
      el("rect", { x: 14, y: 3, width: 3, height: 4, fill: "#A8D5B4" }, g);
      return g;
    });

    function frame(s, t) {
      var ts = t / 1000;
      rbcs.forEach(function (e, i) { var x = ((ts * 40 + i * 120) % 760) - 60; e.setAttribute("cx", x); e.setAttribute("cy", [118, 202, 160, 132, 188, 174][i]); });
      // glucose enters, then (most of it) moves into the cell
      gl.forEach(function (o) {
        var k = o.k, x, y;
        var ent = k < 3 ? 1 : ease(seg(s, -.95 + (k - 3) * .07, -.35 + (k - 3) * .07));
        var up = k < 3 ? 0 : ease(seg(s, 2.25 + (k - 3) * .05, 2.6 + (k - 3) * .05));
        var cx = CH[k % 3];
        if (up <= 0) {
          x = lerp(-40 - (k - 3) * 25, o.tx, ent) + Math.sin(ts * 1.3 + k) * 5;
          y = o.ty + Math.cos(ts * 1.1 + k * 2) * 4;
        } else if (up < .5) {
          var u1 = up * 2; x = lerp(o.tx, cx, u1); y = lerp(o.ty, 262, u1);
        } else {
          var u2 = (up - .5) * 2; x = lerp(cx, cx - 70 + ((k - 3) * 47) % 140, u2) + Math.sin(ts + k) * 3 * u2; y = lerp(262, 330 + ((k * 3) % 4) * 36, u2);
        }
        o.g.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ")");
        o.g.setAttribute("opacity", k < 3 ? 1 : (ent > 0 ? 1 : 0));
      });
      // insulin release → binding
      keys.forEach(function (g, j) {
        var rel = ease(seg(s, .3 + j * .1, .9 + j * .1));
        var bind = ease(seg(s, 1.3 + j * .1, 1.85 + j * .1));
        var x, y, rot;
        if (bind <= 0) {
          x = lerp(560, KX[j], rel) + (rel >= 1 ? Math.sin(ts * 1.4 + j) * 5 : 0);
          y = lerp(50, 165 + j * 12, rel) + (rel >= 1 ? Math.cos(ts * 1.2 + j) * 4 : 0);
          rot = rel * 25;
        } else {
          x = lerp(KX[j], REC[j], bind); y = lerp(165 + j * 12, 248, bind); rot = lerp(25, 90, bind);
        }
        g.setAttribute("opacity", rel > 0 ? 1 : 0);
        g.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") rotate(" + rot.toFixed(1) + ")");
        var bound = bind >= .98;
        recs[j].setAttribute("stroke", bound ? "#A8D5B4" : "#F2ECD9");
        recs[j].setAttribute("filter", bound ? "url(#glow3)" : "");
      });
      // GLUT4 channels rise to the membrane and open
      var rise = ease(seg(s, 1.8, 2.25)), open = ease(seg(s, 2.15, 2.35));
      chans.forEach(function (c) {
        var y = lerp(430, 280, rise);
        c.g.setAttribute("transform", "translate(" + c.x + " " + y.toFixed(1) + ")");
        c.g.setAttribute("opacity", lerp(.45, 1, rise));
        c.a.setAttribute("x", -10 - open * 5); c.b.setAttribute("x", 1 + open * 5);
      });
      var pancOn = s > .15 && s < 1.25;
      pancShape.setAttribute("fill", pancOn ? "#A8D5B4" : "rgba(242,236,217,.4)");
      pancShape.setAttribute("filter", pancOn ? "url(#glow3)" : "");
      // meter
      var g = 5.0 + 3.2 * ease(seg(s, -.85, .3)) - 3.0 * ease(seg(s, 2.25, 3.0));
      meterVal.firstChild.nodeValue = g.toFixed(1);
      meterBar.style.width = ((g - 3) / 7 * 100).toFixed(1) + "%";
      meterBar.classList.toggle("high", g > 7);
    }
    return { frame: frame };
  });

  /* =========================== 3. STRESS / HPA AXIS =========================== */
  register("hpa", function (st) {
    var svg = st.root.querySelector("svg");
    el("defs", {}, svg).innerHTML = '<filter id="glow2" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
    var NODES = [{ y: 140, t1: "Hypothalamus", t2: "in your brain" }, { y: 275, t1: "Pituitary", t2: "just below it" }, { y: 410, t1: "Adrenal cortex", t2: "on top of each kidney" }, { y: 545, t1: "Your body", t2: "more glucose · energy · focus" }];
    var CONN = [["M270,175 L270,240", "CRH", 214], ["M270,310 L270,375", "ACTH", 349], ["M270,445 L270,510", "Cortisol", 484]];
    var FB = ["M150,545 C34,545 34,140 150,140", "M150,545 C88,540 88,275 150,275"];
    // notification
    var note = el("g", { opacity: 0 }, svg);
    el("rect", { x: -150, y: -27, width: 300, height: 54, rx: 16, fill: "#F2ECD9" }, note);
    el("rect", { x: -134, y: -14, width: 28, height: 28, rx: 7, fill: "#3B5B4D" }, note);
    el("path", { d: "M-127,-4 h14 M-124,-14 v6 M-116,-14 v6", stroke: "#F2ECD9", "stroke-width": 2.5 }, note);
    var nt = el("text", { x: -94, y: 6, fill: "#1F3229", style: "font:700 16px 'DM Sans',sans-serif" }, note); nt.textContent = "Midterm tomorrow · 8:30 AM";
    // feedback arcs
    var fbEls = FB.map(function (d) { return el("path", { d: d, "class": "feedback", opacity: 0 }, svg); });
    fbEls.forEach(function (p) { p._len = p.getTotalLength(); });
    var fbLabel = el("text", { x: 0, y: 0, transform: "translate(40 360) rotate(-90)", "text-anchor": "middle", "class": "svg-label", opacity: 0 }, svg); fbLabel.textContent = "Negative feedback";
    // connectors
    var conns = CONN.map(function (c) {
      el("path", { d: c[0], "class": "conn-ghost" }, svg);
      var p = el("path", { d: c[0], "class": "conn" }, svg);
      p._len = p.getTotalLength(); p.style.strokeDasharray = p._len; p.style.strokeDashoffset = p._len;
      var lab = el("text", { x: 288, y: c[2] + 6, "class": "conn-label" }, svg); lab.textContent = c[1].toUpperCase();
      return { p: p, lab: lab };
    });
    // nodes
    var nodes = NODES.map(function (n) {
      var g = el("g", { "class": "node" }, svg);
      el("rect", { x: 150, y: n.y - 35, width: 240, height: 70, rx: 35 }, g);
      var a = el("text", { x: 270, y: n.y - 2, "class": "t1" }, g); a.textContent = n.t1;
      var b = el("text", { x: 270, y: n.y + 19, "class": "t2" }, g); b.textContent = n.t2;
      var m = el("g", { "class": "minus" }, g);
      el("circle", { cx: 386, cy: n.y - 30, r: 15, fill: "#F2ECD9" }, m);
      el("rect", { x: 379, y: n.y - 32, width: 14, height: 4, rx: 2, fill: "#1F3229" }, m);
      return g;
    });
    // cortisol meter
    el("rect", { x: 466, y: 160, width: 22, height: 370, rx: 11, fill: "rgba(242,236,217,.12)" }, svg);
    var cFill = el("rect", { x: 466, width: 22, rx: 11, fill: "#A8D5B4" }, svg);
    el("text", { x: 477, y: 556, "text-anchor": "middle", "class": "svg-label", style: "font-size:11px" }, svg).textContent = "cortisol";
    // particles
    var parts = []; for (var i = 0; i < 16; i++) parts.push(el("circle", { r: 4.5, fill: "#F2ECD9", opacity: 0 }, svg));

    function frame(s, t) {
      var ts = t / 1000;
      var nIn = seg(s, -.7, -.25);
      var shake = (s > -.3 && s < .5) ? Math.sin(ts * 40) * 2.2 * (1 - seg(s, 0, .5)) : 0;
      note.setAttribute("opacity", nIn);
      note.setAttribute("transform", "translate(" + (270 + shake).toFixed(1) + " " + lerp(20, 44, ease(nIn)).toFixed(1) + ")");
      var calmHP = s >= 3.45, calmA = s >= 3.8;
      var on = [s >= -.15 && !calmHP, s >= .8 && !calmHP, s >= 1.8 && !calmA, s >= 2.8];
      nodes.forEach(function (g, i) {
        g.classList.toggle("on", on[i]);
        g.classList.toggle("calm", (i < 2 && calmHP) || (i === 2 && calmA));
      });
      var draws = [seg(s, .2, .85), seg(s, 1.2, 1.85), seg(s, 2.2, 2.85)];
      conns.forEach(function (c, i) {
        c.p.style.strokeDashoffset = c.p._len * (1 - draws[i]);
        c.lab.classList.toggle("on", draws[i] > .5);
      });
      var fb = seg(s, 3.1, 3.6);
      fbEls.forEach(function (p) { p.setAttribute("opacity", fb); p.style.strokeDashoffset = (-ts * 30).toFixed(1); });
      fbLabel.setAttribute("opacity", fb);
      // hormone particles along each active connector (they quiet down once feedback kicks in)
      var n = 0;
      conns.forEach(function (c, i) {
        var act = draws[i] >= 1 && !(i < 2 && calmHP) && !(i === 2 && calmA);
        for (var j = 0; j < 3; j++, n++) {
          if (!act) { parts[n].setAttribute("opacity", 0); continue; }
          var u = (ts * .7 + j / 3) % 1, pt = c.p.getPointAtLength(u * c.p._len);
          parts[n].setAttribute("cx", pt.x); parts[n].setAttribute("cy", pt.y);
          parts[n].setAttribute("opacity", Math.sin(Math.PI * u).toFixed(2));
        }
      });
      fbEls.forEach(function (p) {
        for (var j = 0; j < 3; j++, n++) {
          if (fb < 1) { parts[n].setAttribute("opacity", 0); continue; }
          var u = (ts * .35 + j / 3) % 1, pt = p.getPointAtLength(u * p._len);
          parts[n].setAttribute("cx", pt.x); parts[n].setAttribute("cy", pt.y);
          parts[n].setAttribute("opacity", Math.sin(Math.PI * u).toFixed(2));
        }
      });
      for (; n < parts.length; n++) parts[n].setAttribute("opacity", 0);
      var lvl = .12 + .72 * ease(seg(s, 2.3, 2.95)) - .46 * ease(seg(s, 3.5, 4));
      cFill.setAttribute("height", (lvl * 370).toFixed(1));
      cFill.setAttribute("y", (530 - lvl * 370).toFixed(1));
    }
    return { frame: frame };
  });

  /* =========================== 4. MELATONIN =========================== */
  register("melatonin", function (st) {
    var svg = st.root.querySelector("svg");
    var defs = el("defs", {}, svg);
    defs.innerHTML = '<linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop id="skyTop" offset="0"/><stop id="skyBot" offset="1"/></linearGradient>' +
      '<clipPath id="skyClip"><rect x="0" y="0" width="640" height="300" rx="24"/></clipPath>' +
      '<filter id="glow4" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '<linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A8D5B4" stop-opacity=".45"/><stop offset="1" stop-color="#A8D5B4" stop-opacity="0"/></linearGradient>';
    var skyTop = defs.querySelector("#skyTop"), skyBot = defs.querySelector("#skyBot");
    var sky = el("g", { "clip-path": "url(#skyClip)" }, svg);
    el("rect", { x: 0, y: 0, width: 640, height: 300, fill: "url(#skyG)" }, sky);
    var stars = [];
    for (var i = 0; i < 34; i++) { var sx = (i * 97.3) % 620 + 10, sy = (i * 53.7) % 220 + 10; stars.push(el("circle", { cx: sx.toFixed(0), cy: sy.toFixed(0), r: (i % 3 === 0 ? 1.8 : 1.1), fill: "#F2ECD9", opacity: 0 }, sky)); }
    var sun = el("g", {}, sky);
    for (var rI = 0; rI < 8; rI++) { var ang = rI * Math.PI / 4; el("line", { x1: (34 * Math.cos(ang)).toFixed(1), y1: (34 * Math.sin(ang)).toFixed(1), x2: (46 * Math.cos(ang)).toFixed(1), y2: (46 * Math.sin(ang)).toFixed(1), stroke: "#F2ECD9", "stroke-width": 4, "stroke-linecap": "round" }, sun); }
    el("circle", { r: 26, fill: "#F2ECD9", stroke: "#3B5B4D", "stroke-width": 2.5 }, sun);
    var moon = el("g", {}, sky);
    el("circle", { r: 20, fill: "#F2ECD9" }, moon);
    var moonCut = el("circle", { cx: 9, cy: -7, r: 17 }, moon);
    var ray = el("line", { stroke: "#F2ECD9", "stroke-width": 3, "stroke-dasharray": "8 8", opacity: 0 }, sky);
    el("path", { d: "M0,262 C120,230 220,280 340,252 C460,226 560,270 640,248 L640,300 L0,300 Z", fill: "#2B4439" }, sky);
    // head in profile, facing left
    el("path", { d: "M600,300 L600,262 C630,240 636,196 624,160 C610,116 560,98 520,106 C486,114 470,142 472,166 L460,190 L474,196 L472,214 C474,228 486,232 500,230 L508,252 L508,300 Z", fill: "#1F3229", stroke: "#A8D5B4", "stroke-width": 2 }, sky);
    el("circle", { cx: 487, cy: 176, r: 3.2, fill: "#F2ECD9" }, sky);
    var nerve = el("path", { d: "M490,178 Q520,196 548,174", fill: "none", stroke: "#F2ECD9", "stroke-width": 2, "stroke-dasharray": "3 5", opacity: 0 }, sky);
    var pineal = el("circle", { cx: 550, cy: 172, r: 7, fill: "#A8D5B4" }, sky);
    var pinLabel = el("text", { x: 562, y: 150, "text-anchor": "middle", fill: "#F2ECD9", style: "font:700 11px 'DM Sans',sans-serif;letter-spacing:.08em" }, sky); pinLabel.textContent = "PINEAL";
    var mels = []; for (var m = 0; m < 14; m++) mels.push(el("circle", { r: 3, fill: "#A8D5B4", opacity: 0 }, sky));
    var clockLbl = el("text", { x: 24, y: 30, style: "font:700 12px 'DM Sans',sans-serif;letter-spacing:.14em" }, svg); clockLbl.textContent = "TIME";
    var clock = el("text", { x: 22, y: 66, style: "font:900 38px 'Big Shoulders Display',Impact,sans-serif" }, svg);
    // chart
    el("rect", { x: 0, y: 316, width: 640, height: 182, rx: 20, fill: "rgba(242,236,217,.06)" }, svg);
    el("text", { x: 24, y: 344, "class": "svg-label", style: "font-size:12px" }, svg).textContent = "Melatonin in your blood (illustrative)";
    var X0 = 40, X1 = 610, H0 = 14, H1 = 31;
    function hx(h) { return X0 + (h - H0) / (H1 - H0) * (X1 - X0); }
    function my(v) { return 466 - v * 104; }
    el("line", { x1: X0, y1: 466, x2: X1, y2: 466, stroke: "rgba(242,236,217,.35)", "stroke-width": 1.5 }, svg);
    [[15, "3 PM"], [18, "6 PM"], [21, "9 PM"], [24, "12 AM"], [27, "3 AM"], [30, "6 AM"]].forEach(function (tk) {
      el("line", { x1: hx(tk[0]), y1: 466, x2: hx(tk[0]), y2: 472, stroke: "rgba(242,236,217,.5)" }, svg);
      el("text", { x: hx(tk[0]), y: 488, "text-anchor": "middle", fill: "rgba(242,236,217,.8)", style: "font:600 11px 'DM Sans',sans-serif" }, svg).textContent = tk[1];
    });
    var area = el("path", { fill: "url(#areaG)" }, svg);
    var line = el("path", { fill: "none", stroke: "#A8D5B4", "stroke-width": 3.5, "stroke-linejoin": "round", "stroke-linecap": "round" }, svg);
    var dot = el("circle", { r: 7, fill: "#F2ECD9", stroke: "#A8D5B4", "stroke-width": 3 }, svg);

    function mel(h) { return .06 + .9 * smooth(20.5, 26, h) * (1 - smooth(27.5, 31.2, h)); }
    var DAY_T = hex2rgb("#BFE0C4"), DAY_B = hex2rgb("#EDF5E6"), NIGHT_T = hex2rgb("#12201A"), NIGHT_B = hex2rgb("#2B4439"), DUSK_T = hex2rgb("#4E7A64"), DUSK_B = hex2rgb("#EBD7AC");

    function frame(s, t) {
      var ts = t / 1000;
      var h = interp(s, [-1, 0, 1, 2, 3], [14, 15, 21, 27, 31]);
      var night = smooth(19, 21.6, h) * (1 - smooth(29, 31, h));
      var dusk = Math.max(0, 1 - Math.abs(h - 20.1) / 1.4, 1 - Math.abs(h - 30.2) / 1.2);
      var top = mixRgb(mixRgb(DAY_T, NIGHT_T, night), DUSK_T, dusk * .75);
      var bot = mixRgb(mixRgb(DAY_B, NIGHT_B, night), DUSK_B, dusk * .75);
      skyTop.setAttribute("stop-color", rgbStr(top)); skyBot.setAttribute("stop-color", rgbStr(bot));
      moonCut.setAttribute("fill", rgbStr(top));
      // sun + moon arcs
      var hh = h >= 24 ? h - 24 : h, sf = (hh - 6) / 14.5;
      var sx = 20 + 600 * sf, sy = 300 - 250 * Math.sin(Math.PI * clamp(sf, 0, 1));
      var sunUp = sf >= 0 && sf <= 1;
      sun.setAttribute("transform", "translate(" + sx.toFixed(1) + " " + (sunUp ? sy : 400).toFixed(1) + ") rotate(" + (ts * 12 % 360).toFixed(1) + ")");
      var mf = (h - 20) / 12, mx = 20 + 600 * mf, myy = 300 - 230 * Math.sin(Math.PI * clamp(mf, 0, 1));
      moon.setAttribute("transform", "translate(" + mx.toFixed(1) + " " + (mf >= 0 && mf <= 1 ? myy : 400).toFixed(1) + ")");
      stars.forEach(function (c, i) { c.setAttribute("opacity", (night * (.45 + .55 * Math.abs(Math.sin(ts * .8 + i)))).toFixed(2)); });
      var day = sunUp ? (1 - night) * clamp(Math.sin(Math.PI * sf) * 3, 0, 1) : 0;
      ray.setAttribute("x1", sx.toFixed(1)); ray.setAttribute("y1", sy.toFixed(1)); ray.setAttribute("x2", 487); ray.setAttribute("y2", 176);
      ray.setAttribute("opacity", (day * .85).toFixed(2)); ray.style.strokeDashoffset = (-ts * 30).toFixed(1);
      nerve.setAttribute("opacity", (day * .9).toFixed(2)); nerve.style.strokeDashoffset = (-ts * 20).toFixed(1);
      var lvl = mel(h);
      pineal.setAttribute("r", (6 + lvl * 5).toFixed(1));
      pineal.setAttribute("filter", lvl > .3 ? "url(#glow4)" : "");
      pineal.setAttribute("fill", lvl > .3 ? "#A8D5B4" : "rgba(168,213,180,.45)");
      mels.forEach(function (c, i) {
        var u = (ts * .25 + i / mels.length) % 1, ang = i * 2.4;
        c.setAttribute("cx", (550 + Math.cos(ang) * u * 60).toFixed(1));
        c.setAttribute("cy", (172 + Math.sin(ang) * u * 30 + u * 90).toFixed(1));
        c.setAttribute("opacity", (lvl * Math.sin(Math.PI * u)).toFixed(2));
      });
      // clock
      var mins = Math.round((hh * 60) / 10) * 10, H = Math.floor(mins / 60) % 24, M = mins % 60;
      clock.textContent = ((H % 12) || 12) + ":" + (M < 10 ? "0" : "") + M + (H >= 12 ? " PM" : " AM");
      var ink = night > .45 ? "#F2ECD9" : "#1F3229";
      clock.setAttribute("fill", ink); clockLbl.setAttribute("fill", ink);
      // chart up to "now"
      var d = "", hCur = clamp(h, H0, H1);
      for (var x = H0; x <= hCur + 1e-6; x += .25) d += (d ? " L" : "M") + hx(x).toFixed(1) + "," + my(mel(x)).toFixed(1);
      d += " L" + hx(hCur).toFixed(1) + "," + my(mel(hCur)).toFixed(1);
      line.setAttribute("d", d);
      area.setAttribute("d", d + " L" + hx(hCur).toFixed(1) + ",466 L" + X0 + ",466 Z");
      dot.setAttribute("cx", hx(hCur).toFixed(1)); dot.setAttribute("cy", my(mel(hCur)).toFixed(1));
    }
    return { frame: frame };
  });

  /* =========================== endo-crying word reel =========================== */
  (function () {
    var root = document.querySelector(".endo"); if (!root) return;
    var reel = root.querySelector(".endo__reel"), cap = root.querySelector(".endo__caption"), chips = [].slice.call(root.querySelectorAll(".endo__chips i"));
    var CAPS = ["The study of hormones. Very serious science.", "When the exam has four pages of feedback loops.", "Office hours, study groups and a little hope.", "Week 12. Enough said.", "…then free food at a EUSA event fixes everything."];
    var last = -1;
    extraFrames.push(function () {
      var r = root.getBoundingClientRect(), total = r.height - innerHeight;
      var p = clamp(-r.top / total, 0, .999), i = Math.floor(p * 5);
      if (i === last) return; last = i;
      reel.style.transform = "translateY(" + (-i) + "em)";
      cap.textContent = CAPS[i];
      chips.forEach(function (c, j) { c.classList.toggle("on", j <= i); });
    });
  })();

  /* =========================== HERO canvas: hormone network + DNA =========================== */
  (function () {
    var cv = document.getElementById("hero-canvas"); if (!cv) return;
    var ctx = cv.getContext("2d"), W = 0, H = 0, dpr = 1, nodes = [], mouse = { x: -999, y: -999 }, visible = true;
    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(clamp(W * H / 22000, 24, 70));
      nodes = [];
      for (var i = 0; i < count; i++) nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: 1.5 + Math.random() * 2.5, hex: Math.random() < .22, rot: Math.random() * 6, vr: (Math.random() - .5) * .01 });
    }
    function hexagon(x, y, r, rot) { ctx.beginPath(); for (var k = 0; k < 6; k++) { var a = rot + k * Math.PI / 3; ctx[k ? "lineTo" : "moveTo"](x + r * Math.cos(a), y + r * Math.sin(a)); } ctx.closePath(); }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      var par = Math.min(scrollY, H) * .25;
      // DNA helix on the edge (skipped on phones, where it would sit under the text)
      var cx = W - 70, A = 42, per = 170;
      for (var y = -20; W > 900 && y < H + 20; y += 13) {
        var ph = (y + par) / per * Math.PI * 2 + t * .0011;
        var x1 = cx + A * Math.sin(ph), x2 = cx + A * Math.sin(ph + Math.PI), z1 = Math.cos(ph), z2 = -z1;
        if (Math.round(y / 13) % 2 === 0) { ctx.strokeStyle = "rgba(168,213,180,.12)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke(); }
        ctx.fillStyle = "rgba(168,213,180," + (.18 + .25 * (z1 + 1) / 2) + ")"; ctx.beginPath(); ctx.arc(x1, y, 2 + 1.6 * (z1 + 1) / 2, 0, 7); ctx.fill();
        ctx.fillStyle = "rgba(242,236,217," + (.14 + .22 * (z2 + 1) / 2) + ")"; ctx.beginPath(); ctx.arc(x2, y, 2 + 1.6 * (z2 + 1) / 2, 0, 7); ctx.fill();
      }
      // molecule network
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (!REDUCED) {
          var dx = n.x - mouse.x, dy = n.y - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < 14000) { var f = (14000 - d2) / 14000 * .6; n.vx += dx / Math.sqrt(d2 + 1) * f * .08; n.vy += dy / Math.sqrt(d2 + 1) * f * .08; }
          n.vx *= .985; n.vy *= .985; n.vx += (Math.random() - .5) * .01; n.vy += (Math.random() - .5) * .01;
          n.x += n.vx; n.y += n.vy; n.rot += n.vr;
          if (n.x < -20) n.x = W + 20; if (n.x > W + 20) n.x = -20; if (n.y < -20) n.y = H + 20; if (n.y > H + 20) n.y = -20;
        }
      }
      ctx.lineWidth = 1;
      for (i = 0; i < nodes.length; i++) for (var j = i + 1; j < nodes.length; j++) {
        var a = nodes[i], b = nodes[j], ddx = a.x - b.x, ddy = a.y - b.y, dd = ddx * ddx + ddy * ddy;
        if (dd < 17000) { ctx.strokeStyle = "rgba(168,213,180," + (.22 * (1 - dd / 17000)).toFixed(3) + ")"; ctx.beginPath(); ctx.moveTo(a.x, a.y - par); ctx.lineTo(b.x, b.y - par); ctx.stroke(); }
      }
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        if (n.hex) { ctx.strokeStyle = "rgba(242,236,217,.38)"; ctx.lineWidth = 1.6; hexagon(n.x, n.y - par, 9 + n.r * 1.5, n.rot); ctx.stroke(); }
        else { ctx.fillStyle = "rgba(168,213,180,.55)"; ctx.beginPath(); ctx.arc(n.x, n.y - par, n.r, 0, 7); ctx.fill(); }
      }
    }
    resize();
    addEventListener("resize", resize);
    cv.parentElement.addEventListener("pointermove", function (e) { var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    cv.parentElement.addEventListener("pointerleave", function () { mouse.x = mouse.y = -999; });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(cv);
    if (REDUCED) { draw(0); addEventListener("resize", function () { draw(0); }); return; }
    extraFrames.push(function (t) { if (visible) draw(t); });
  })();

  /* =========================== About: hormone ↔ receptor (lock & key) =========================== */
  (function () {
    var svg = document.getElementById("lockkey-svg"); if (!svg) return;
    var CELLS = [{ x: 120, shape: "M-12,0 L-12,18 L12,18 L12,0", label: "No match" }, { x: 300, shape: "M-15,0 L0,22 L15,0", label: "Match! Cell responds" }, { x: 480, shape: "M-13,2 A13,13 0 0,0 13,2", label: "No match" }];
    var rings = CELLS.map(function (c) {
      var ring = el("circle", { cx: c.x, cy: 150, r: 50, "class": "cell-ring" }, svg);
      el("path", { d: c.shape, transform: "translate(" + c.x + " 78)", fill: "none", stroke: "#F2ECD9", "stroke-width": 4, "stroke-linejoin": "round" }, svg);
      el("line", { x1: c.x, y1: c.shape.indexOf("22") > -1 ? 100 : 96, x2: c.x, y2: 102, stroke: "#F2ECD9", "stroke-width": 4 }, svg);
      var t = el("text", { x: c.x, y: 228, "text-anchor": "middle", fill: "#F2ECD9", style: "font:700 14px 'DM Sans',sans-serif", opacity: 0 }, svg); t.textContent = c.label;
      return { ring: ring, label: t };
    });
    var hormone = el("polygon", { points: "-13,-2 13,-2 0,19", fill: "#A8D5B4" }, svg);
    var hl = el("text", { x: 0, y: 0, "text-anchor": "middle", fill: "#A8D5B4", style: "font:800 13px 'DM Sans',sans-serif;letter-spacing:.1em" }, svg); hl.textContent = "HORMONE";
    var visible = false;
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(svg); else visible = true;
    function draw(t) {
      var u = REDUCED ? .55 : (t % 7000) / 7000, x, y = 30;
      if (u < .35) x = lerp(-30, 300, u / .35);
      else if (u < .72) x = 300;
      else x = lerp(300, 640, (u - .72) / .28);
      if (u >= .35 && u < .45) y = lerp(30, 80, ease((u - .35) / .1));
      else if (u >= .45 && u < .65) y = 80;
      else if (u >= .65 && u < .72) y = lerp(80, 30, ease((u - .65) / .07));
      var dip = Math.max(0, 1 - Math.abs(x - 120) / 30) + Math.max(0, 1 - Math.abs(x - 480) / 30);
      if (u < .35 || u >= .72) y += dip * 22;
      hormone.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ")");
      hl.setAttribute("x", x.toFixed(1)); hl.setAttribute("y", (y - 10).toFixed(1));
      var docked = u >= .45 && u < .7;
      rings[1].ring.classList.toggle("lit", docked);
      rings[1].label.setAttribute("opacity", docked ? 1 : 0);
      rings[0].label.setAttribute("opacity", Math.max(0, 1 - Math.abs(x - 120) / 40).toFixed(2));
      rings[2].label.setAttribute("opacity", Math.max(0, 1 - Math.abs(x - 480) / 40).toFixed(2));
    }
    if (REDUCED) { draw(0); return; }
    extraFrames.push(function (t) { if (visible) draw(t); });
  })();

  /* =========================== go =========================== */
  if (REDUCED) {
    var redraw = function () { loop(0); };
    addEventListener("scroll", redraw, { passive: true }); addEventListener("resize", redraw); redraw();
  } else {
    requestAnimationFrame(loop);
  }
})();
