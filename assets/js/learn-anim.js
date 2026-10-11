/* =========================================================
   EUSA demo — scroll animations for the Learn articles.
   Each article is one pinned "scene deck": every <div class="step"> carries a
   data-scene id, consecutive steps with the same id share a scene, and scenes
   cross-fade as you scroll. A scene is built once, then
   frame(p, t, age) is called every frame:
     p   = scroll progress inside the scene (0 .. number of steps - 1)
     t   = clock in ms,  age = seconds since the scene faded in
   Uses the helpers exposed by anim.js (window.EUSA_ANIM).
   ========================================================= */
(function () {
  "use strict";
  var A = window.EUSA_ANIM;
  var root = document.querySelector('[data-scrolly="article"]');
  if (!A || !root) return;
  var el = A.el, clamp = A.clamp, seg = A.seg, ease = A.ease, lerp = A.lerp, smooth = A.smooth, interp = A.interp, REDUCED = A.REDUCED;
  var MINT = "#A8D5B4", CREAM = "#F2ECD9", INK = "#1F3229", FOREST = "#3B5B4D", DEEP = "#2B4439";
  var DISP = "800 22px 'Big Shoulders Display',Impact,sans-serif";
  var BODY = "700 14px 'DM Sans',sans-serif";

  function txt(parent, x, y, s, o) {
    o = o || {};
    var t = el("text", { x: x, y: y, "text-anchor": o.anchor || "start", fill: o.fill || CREAM, style: "font:" + (o.font || BODY) + (o.ls ? ";letter-spacing:" + o.ls : "") }, parent);
    t.textContent = s; return t;
  }
  function rect(parent, x, y, w, h, rx, attrs) {
    var a = { x: x, y: y, width: w, height: h, rx: rx || 0 };
    for (var k in attrs) a[k] = attrs[k];
    return el("rect", a, parent);
  }
  function pathOf(fn, h0, h1, hx, vy, step) {
    var d = "";
    for (var h = h0; h <= h1 + 1e-6; h += step || .25) d += (d ? " L" : "M") + hx(h).toFixed(1) + "," + vy(fn(h)).toFixed(1);
    return d;
  }
  function melCurve(h) { return .06 + .9 * smooth(20.5, 26, h) * (1 - smooth(27.5, 31.2, h)); }
  function setOp(node, v) { node.setAttribute("opacity", v.toFixed(3)); }
  var SCENES = {};

  /* ---- shared: a chart axis for the night (6 PM -> 6 AM) ---- */
  function nightAxis(g, x0, x1, yb) {
    el("line", { x1: x0, y1: yb, x2: x1, y2: yb, stroke: "rgba(242,236,217,.4)", "stroke-width": 1.6 }, g);
    [[18, "6 PM"], [21, "9 PM"], [24, "12 AM"], [27, "3 AM"], [30, "6 AM"]].forEach(function (tk) {
      var x = x0 + (tk[0] - 18) / 12 * (x1 - x0);
      el("line", { x1: x, y1: yb, x2: x, y2: yb + 6, stroke: "rgba(242,236,217,.5)" }, g);
      txt(g, x, yb + 22, tk[1], { anchor: "middle", font: "600 11px 'DM Sans',sans-serif", fill: "rgba(242,236,217,.8)" });
    });
  }

  /* ======================= INTRO: 1. what is endocrinology ======================= */
  SCENES.what = function (g) {
    var b = el("g", { transform: "translate(190 10) scale(.84)" }, g);
    b.innerHTML = A.TOUR_SVG;
    [].forEach.call(b.querySelectorAll(".label"), function (l) { l.style.display = "none"; });
    [].forEach.call(b.querySelectorAll(".gland"), function (x) { x.classList.add("on"); });
    var defs = [
      [314, 94, 206, 62, "end", "Pituitary problems"], [336, 134, 452, 112, "start", "Thyroid problems"],
      [286, 246, 206, 232, "end", "Adrenal problems"], [342, 280, 452, 292, "start", "Diabetes"],
      [330, 350, 452, 384, "start", "Infertility"]
    ];
    var calls = defs.map(function (d) {
      var c = el("g", { opacity: 0 }, g), len = Math.hypot(d[2] - d[0], d[3] - d[1]);
      var w = d[5].length * 8.6 + 26, bx = d[4] === "end" ? d[2] - w : d[2];
      var ln = el("line", { x1: d[0], y1: d[1], x2: d[2], y2: d[3], stroke: MINT, "stroke-width": 1.8, "stroke-dasharray": len }, c);
      rect(c, bx, d[3] - 17, w, 34, 17, { fill: CREAM });
      txt(c, bx + w / 2, d[3] + 5, d[5], { anchor: "middle", fill: INK, font: "800 14px 'DM Sans',sans-serif" });
      return { c: c, ln: ln, len: len };
    });
    txt(g, 320, 500, "Disorders of these glands are what endocrinologists diagnose and treat", { anchor: "middle", font: "600 12px 'DM Sans',sans-serif", fill: "rgba(242,236,217,.75)" });
    return { frame: function (p, t, age) {
      calls.forEach(function (o, i) {
        var k = clamp((age - .5 - i * .5) / .5, 0, 1);
        setOp(o.c, k); o.ln.style.strokeDashoffset = (o.len * (1 - k)).toFixed(1);
      });
    } };
  };

  /* ======================= INTRO: 2. glands (exocrine vs endocrine) ======================= */
  SCENES.glands = function (g) {
    txt(g, 160, 58, "EXOCRINE", { anchor: "middle", font: DISP, ls: ".08em", fill: "rgba(242,236,217,.75)" });
    txt(g, 160, 80, "releases through a duct", { anchor: "middle", font: "600 13px 'DM Sans',sans-serif", fill: "rgba(242,236,217,.75)" });
    txt(g, 480, 58, "ENDOCRINE", { anchor: "middle", font: DISP, ls: ".08em", fill: MINT });
    txt(g, 480, 80, "no duct: straight into the blood", { anchor: "middle", font: "700 13px 'DM Sans',sans-serif", fill: MINT });
    el("line", { x1: 320, y1: 44, x2: 320, y2: 490, stroke: "rgba(168,213,180,.25)", "stroke-dasharray": "4 6" }, g);
    el("line", { x1: 40, y1: 130, x2: 280, y2: 130, stroke: "rgba(242,236,217,.55)", "stroke-width": 3 }, g);
    txt(g, 160, 118, "skin / surface", { anchor: "middle", font: "600 11px 'DM Sans',sans-serif", fill: "rgba(242,236,217,.6)" });
    el("path", { d: "M153,340 L153,134 M167,340 L167,134", stroke: "rgba(242,236,217,.55)", "stroke-width": 2.5, fill: "none" }, g);
    var OFF = [[0, -30], [-28, -14], [28, -14], [-28, 18], [28, 18], [0, 34], [0, 2]];
    OFF.forEach(function (o) { el("circle", { cx: 160 + o[0], cy: 385 + o[1], r: 17, fill: "rgba(242,236,217,.14)", stroke: "rgba(242,236,217,.55)", "stroke-width": 2 }, g); });
    OFF.forEach(function (o) { el("circle", { cx: 480 + o[0], cy: 385 + o[1], r: 17, fill: "rgba(168,213,180,.28)", stroke: MINT, "stroke-width": 2 }, g); });
    txt(g, 160, 478, "e.g. sweat, saliva", { anchor: "middle", font: "600 12px 'DM Sans',sans-serif", fill: "rgba(242,236,217,.7)" });
    txt(g, 480, 490, "e.g. thyroid, pituitary, pineal", { anchor: "middle", font: "600 12px 'DM Sans',sans-serif", fill: MINT });
    // vessel
    rect(g, 330, 226, 330, 56, 0, { fill: "rgba(242,236,217,.06)" });
    el("line", { x1: 330, y1: 226, x2: 640, y2: 226, stroke: "rgba(242,236,217,.55)", "stroke-width": 3 }, g);
    el("line", { x1: 330, y1: 282, x2: 640, y2: 282, stroke: "rgba(242,236,217,.55)", "stroke-width": 3 }, g);
    txt(g, 628, 214, "bloodstream → to target cells", { anchor: "end", font: "700 11px 'DM Sans',sans-serif", fill: "rgba(242,236,217,.8)", ls: ".06em" });
    var rbc = []; for (var i = 0; i < 5; i++) rbc.push(el("ellipse", { rx: 11, ry: 6, fill: "rgba(242,236,217,.14)" }, g));
    var L = [], R = [];
    for (i = 0; i < 9; i++) L.push(el("circle", { r: 4, fill: CREAM }, g));
    for (i = 0; i < 14; i++) R.push(el("circle", { r: 4, fill: CREAM }, g));
    return { frame: function (p, t) {
      var ts = t / 1000;
      rbc.forEach(function (e, j) { e.setAttribute("cx", (((ts * 50 + j * 70) % 380) + 330).toFixed(1)); e.setAttribute("cy", [240, 268, 254, 238, 270][j]); });
      L.forEach(function (c, j) {
        var u = (ts * .22 + j / L.length) % 1;
        c.setAttribute("cx", (160 + Math.sin(u * 14 + j) * 3).toFixed(1)); c.setAttribute("cy", lerp(335, 100, u).toFixed(1)); c.setAttribute("opacity", Math.sin(Math.PI * u).toFixed(2));
      });
      R.forEach(function (c, j) {
        var u = (ts * .2 + j / R.length) % 1, x0 = 452 + (j % 3) * 28, x, y;
        if (u < .4) { x = x0; y = lerp(360, 254, u / .4); } else { x = lerp(x0, 640, (u - .4) / .6); y = 254 + Math.sin(u * 20 + j) * 8; }
        c.setAttribute("cx", x.toFixed(1)); c.setAttribute("cy", y.toFixed(1)); c.setAttribute("opacity", (u < .08 ? u / .08 : u > .94 ? (1 - u) / .06 : 1).toFixed(2));
      });
    } };
  };

  /* ======================= INTRO: 3. hormone examples ======================= */
  SCENES.types = function (g) {
    var HEAD = [[85, "STIMULUS"], [245, "GLAND"], [395, "HORMONE"], [545, "TARGET CELLS"]], pills = [];
    HEAD.forEach(function (h, i) {
      pills.push(rect(g, h[0] - 62, 40, 124, 32, 16, { fill: "rgba(168,213,180,.0)", stroke: MINT, "stroke-width": 2 }));
      txt(g, h[0], 62, h[1], { anchor: "middle", font: "800 15px 'Big Shoulders Display',Impact,sans-serif", ls: ".08em" });
      if (i < 3) txt(g, (h[0] + HEAD[i + 1][0]) / 2, 63, "→", { anchor: "middle", fill: MINT, font: "800 20px 'DM Sans',sans-serif" });
    });
    var ROWS = [
      { y: 175, src: "PANCREAS", hor: "glucagon", a: "Raises", b: "blood sugar" },
      { y: 290, src: "ADRENALS", hor: "norepinephrine", a: "Helps regulate", b: "blood pressure" },
      { y: 405, src: "ADRENALS", hor: "epinephrine", a: "Boosts blood flow,", b: "oxygen & heart rate" }
    ];
    var rows = ROWS.map(function (r) {
      rect(g, 30, r.y - 32, 150, 64, 32, { fill: "rgba(31,50,41,.7)", stroke: "rgba(242,236,217,.5)", "stroke-width": 2 });
      txt(g, 105, r.y + 7, r.src, { anchor: "middle", font: "800 19px 'Big Shoulders Display',Impact,sans-serif", ls: ".06em" });
      el("line", { x1: 190, y1: r.y, x2: 430, y2: r.y, stroke: "rgba(168,213,180,.35)", "stroke-width": 2, "stroke-dasharray": "3 7" }, g);
      txt(g, 310, r.y - 14, r.hor, { anchor: "middle", fill: MINT, font: "800 24px 'Big Shoulders Display',Impact,sans-serif", ls: ".04em" });
      rect(g, 440, r.y - 44, 180, 88, 20, { fill: "rgba(31,50,41,.7)", stroke: MINT, "stroke-width": 2 });
      txt(g, 530, r.y - 22, r.a, { anchor: "middle", font: "700 12.5px 'DM Sans',sans-serif" });
      txt(g, 530, r.y - 6, r.b, { anchor: "middle", font: "700 12.5px 'DM Sans',sans-serif" });
      var dots = []; for (var j = 0; j < 5; j++) dots.push(el("circle", { r: 4, fill: CREAM }, g));
      return { y: r.y, dots: dots };
    });
    var bar = rect(g, 465, 183, 130, 10, 5, { fill: MINT });
    rect(g, 465, 183, 130, 10, 5, { fill: "none", stroke: "rgba(242,236,217,.45)" });
    var tubeA = el("path", {}, g), tubeB = el("path", {}, g);
    [tubeA, tubeB].forEach(function (x) { x.setAttribute("fill", "none"); x.setAttribute("stroke", MINT); x.setAttribute("stroke-width", 3); x.setAttribute("stroke-linecap", "round"); });
    var ecg = el("polyline", { fill: "none", stroke: MINT, "stroke-width": 2.5, "stroke-linejoin": "round" }, g);
    var EX = [0, .15, .2, .25, .32, .36, .42, .48, .54, .7, .78, .86, 1], EY = [0, 0, -4, 0, 0, 6, -24, 10, 0, 0, -5, 0, 0];
    return { frame: function (p, t) {
      var ts = t / 1000, act = Math.floor(ts / 1.1) % 4;
      pills.forEach(function (r, i) { r.setAttribute("fill", i === act ? "rgba(168,213,180,.35)" : "rgba(168,213,180,0)"); });
      rows.forEach(function (r) {
        r.dots.forEach(function (c, j) {
          var u = (ts * .45 + j / 5) % 1;
          c.setAttribute("cx", (190 + u * 240).toFixed(1)); c.setAttribute("cy", r.y); c.setAttribute("opacity", Math.sin(Math.PI * u).toFixed(2));
        });
      });
      bar.setAttribute("width", (130 * (.25 + .7 * ease((ts * .3) % 1))).toFixed(1));
      var gap = 11 + 5 * Math.sin(ts * 3);
      var yy = 305 + 10; // second row glyph centre
      tubeA.setAttribute("d", "M465," + (yy - gap).toFixed(1) + " L595," + (yy - gap).toFixed(1));
      tubeB.setAttribute("d", "M465," + (yy + gap).toFixed(1) + " L595," + (yy + gap).toFixed(1));
      var pts = [];
      for (var i = 0; i <= 52; i++) {
        var x = 465 + i * 2.5, uu = (((x - 465) / 65 - ts * .9) % 1 + 1) % 1;
        pts.push(x.toFixed(1) + "," + (425 + interp(uu, EX, EY)).toFixed(1));
      }
      ecg.setAttribute("points", pts.join(" "));
    } };
  };

  /* ======================= INTRO: 4. receptors + reaction ======================= */
  SCENES.how = function (g) {
    var CELLS = [{ x: 120, r: ["A", "A"] }, { x: 320, r: ["A", "B"] }, { x: 520, r: ["B", "B"] }], CY = 335, R = 72, ANG = [-125, -55];
    // legend
    rect(g, 170, 36, 14, 14, 2, { fill: MINT });
    txt(g, 192, 49, "HORMONE A", { font: "800 14px 'DM Sans',sans-serif", ls: ".06em" });
    el("polygon", { points: "366,36 382,36 374,51", fill: CREAM }, g);
    txt(g, 390, 49, "HORMONE B", { font: "800 14px 'DM Sans',sans-serif", ls: ".06em" });
    var cells = CELLS.map(function (c) {
      var body = el("circle", { cx: c.x, cy: CY, r: R, fill: "rgba(168,213,180,.10)", stroke: MINT, "stroke-width": 3 }, g);
      var nuc = el("circle", { cx: c.x + 8, cy: CY + 6, r: 20, fill: "rgba(168,213,180,.35)" }, g);
      var rings = [el("circle", { cx: c.x + 8, cy: CY + 6, r: 20, fill: "none", stroke: MINT, "stroke-width": 2.5 }, g), el("circle", { cx: c.x + 8, cy: CY + 6, r: 20, fill: "none", stroke: MINT, "stroke-width": 2.5 }, g)];
      var socks = c.r.map(function (kind, i) {
        var a = ANG[i], rad = a * Math.PI / 180, px = c.x + R * Math.cos(rad), py = CY + R * Math.sin(rad);
        var gg = el("g", { transform: "translate(" + px.toFixed(1) + " " + py.toFixed(1) + ") rotate(" + (a + 90) + ")" }, g);
        el("path", { d: kind === "A" ? "M-11,-13 L-11,0 L11,0 L11,-13" : "M-12,-14 L0,0 L12,-14", fill: "none", stroke: CREAM, "stroke-width": 4, "stroke-linejoin": "round" }, gg);
        return { kind: kind, px: px, py: py, ox: Math.cos(rad), oy: Math.sin(rad), a: a };
      });
      return { c: c, body: body, nuc: nuc, rings: rings, socks: socks };
    });
    txt(g, 120, 440, "TARGET CELL FOR A", { anchor: "middle", font: "800 13px 'DM Sans',sans-serif", ls: ".05em" });
    txt(g, 320, 440, "TARGET CELL FOR A AND B", { anchor: "middle", font: "800 13px 'DM Sans',sans-serif", ls: ".05em" });
    txt(g, 520, 440, "TARGET CELL FOR B", { anchor: "middle", font: "800 13px 'DM Sans',sans-serif", ls: ".05em" });
    var cap1 = txt(g, 320, 484, "Only the matching hormone fits each receptor", { anchor: "middle", fill: MINT, font: "700 15px 'DM Sans',sans-serif" });
    var cap2 = txt(g, 320, 484, "A chain of reactions changes what the cell does", { anchor: "middle", fill: MINT, font: "700 15px 'DM Sans',sans-serif" });
    // hormones: one per socket
    var hs = [];
    cells.forEach(function (cl, ci) {
      cl.socks.forEach(function (s, si) {
        var node = el("g", {}, g);
        if (s.kind === "A") rect(node, -8, -8, 16, 16, 3, { fill: MINT }); else el("polygon", { points: "-10,-8 10,-8 0,10", fill: CREAM }, node);
        hs.push({ node: node, s: s, sx: cl.c.x + (si ? 28 : -28) + (ci - 1) * 10, sy: 120 + ((ci + si) % 3) * 16, j: ci * 2 + si });
      });
    });
    // decoys that can't dock
    var decoys = [{ kind: "A", x: 560, y: 215 }, { kind: "B", x: 80, y: 215 }].map(function (d) {
      var node = el("g", {}, g);
      if (d.kind === "A") rect(node, -8, -8, 16, 16, 3, { fill: MINT }); else el("polygon", { points: "-10,-8 10,-8 0,10", fill: CREAM }, node);
      var x = txt(g, d.x, d.y + 30, "✕ no match", { anchor: "middle", font: "800 12px 'DM Sans',sans-serif", fill: CREAM });
      return { node: node, d: d, x: x };
    });
    return { frame: function (p, t, age) {
      var ts = t / 1000, c = seg(p, .35, 1);
      hs.forEach(function (h) {
        var d = Math.max(ease(clamp(age * .55 - h.j * .1 - .15, 0, 1)), seg(p, 0, .2));
        var bob = d < 1 ? Math.sin(ts * 2 + h.j) * 5 * (1 - d) : 0;
        var dx = h.s.px + h.s.ox * 9, dy = h.s.py + h.s.oy * 9;
        var x = lerp(h.sx, dx, d), y = lerp(h.sy, dy, d) + bob;
        h.node.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") rotate(" + (h.s.kind === "B" ? lerp(0, h.s.a + 90, d) : lerp(0, h.s.a + 90, d)).toFixed(1) + ")");
      });
      decoys.forEach(function (o, i) {
        var d = ease(clamp(age * .6 - .2, 0, 1)), y = lerp(110, o.d.y, d) + Math.sin(ts * 2.4 + i) * 6;
        o.node.setAttribute("transform", "translate(" + o.d.x + " " + y.toFixed(1) + ")");
        setOp(o.x, clamp((age - 1.6) * 1.5, 0, 1) * (1 - c));
      });
      cells.forEach(function (cl, ci) {
        cl.body.setAttribute("fill", "rgba(168,213,180," + (.1 + .3 * c).toFixed(2) + ")");
        cl.nuc.setAttribute("fill", "rgba(168,213,180," + (.35 + .6 * c).toFixed(2) + ")");
        cl.rings.forEach(function (r, i) {
          var u = ((ts * .7 + i * .5 + ci * .15) % 1);
          r.setAttribute("r", (20 + u * 42).toFixed(1)); r.setAttribute("opacity", (c * (1 - u)).toFixed(2));
        });
      });
      setOp(cap1, 1 - smooth(.3, .5, p)); setOp(cap2, smooth(.5, .7, p));
    } };
  };

  /* ======================= INTRO: 5. insulin / cortisol / melatonin ======================= */
  SCENES.daily = function (g) {
    var b = el("g", { transform: "translate(190 10) scale(.84)" }, g);
    b.innerHTML = A.TOUR_SVG;
    var glands = [].slice.call(b.querySelectorAll(".gland")), KEY = ["pancreas", "adrenal", "pineal"], cur = -1;
    var CH = [["INSULIN", "peptide hormone · pancreas"], ["CORTISOL", "steroid hormone · adrenals"], ["MELATONIN", "the darkness hormone · pineal"]];
    var chips = CH.map(function (c) {
      var gg = el("g", { opacity: 0 }, g);
      rect(gg, 20, 40, 200, 74, 18, { fill: "rgba(31,50,41,.86)", stroke: MINT, "stroke-width": 2 });
      txt(gg, 120, 77, c[0], { anchor: "middle", fill: MINT, font: "900 30px 'Big Shoulders Display',Impact,sans-serif", ls: ".04em" });
      txt(gg, 120, 100, c[1], { anchor: "middle", font: "600 11.5px 'DM Sans',sans-serif" });
      return gg;
    });
    return { frame: function (p) {
      var idx = clamp(Math.round(p), 0, 2);
      if (idx !== cur) { cur = idx; glands.forEach(function (x) { x.classList.toggle("on", x.getAttribute("data-g") === KEY[idx]); }); }
      chips.forEach(function (c, i) { setOp(c, clamp(1 - Math.abs(p - i) * 2, 0, 1)); });
    } };
  };

  /* ======================= INTRO: 6. negative feedback ======================= */
  SCENES.balance = function (g) {
    rect(g, 50, 60, 170, 64, 32, { fill: MINT });
    txt(g, 135, 99, "GLAND", { anchor: "middle", fill: INK, font: "900 24px 'Big Shoulders Display',Impact,sans-serif", ls: ".06em" });
    rect(g, 420, 60, 170, 64, 32, { fill: "rgba(31,50,41,.8)", stroke: MINT, "stroke-width": 2 });
    txt(g, 505, 99, "TARGET CELLS", { anchor: "middle", font: "900 22px 'Big Shoulders Display',Impact,sans-serif", ls: ".06em" });
    el("line", { x1: 225, y1: 92, x2: 415, y2: 92, stroke: "rgba(168,213,180,.35)", "stroke-width": 2, "stroke-dasharray": "3 7" }, g);
    txt(g, 320, 80, "hormone", { anchor: "middle", fill: MINT, font: "800 15px 'DM Sans',sans-serif" });
    var fb = el("path", { d: "M505,128 C505,205 135,205 135,128", fill: "none", stroke: CREAM, "stroke-width": 2.5, "stroke-dasharray": "7 7" }, g);
    el("circle", { cx: 320, cy: 177, r: 15, fill: CREAM }, g);
    rect(g, 313, 175, 14, 4, 2, { fill: INK });
    txt(g, 320, 212, "negative feedback: “enough, slow down”", { anchor: "middle", font: "700 12.5px 'DM Sans',sans-serif", fill: "rgba(242,236,217,.9)" });
    var dots = []; for (var i = 0; i < 4; i++) dots.push(el("circle", { r: 4.5, fill: CREAM }, g));
    // level chart
    var X0 = 40, X1 = 600, YC = 375, AMP = 55;
    txt(g, X0, 262, "HORMONE LEVEL IN THE BLOOD", { font: "800 12px 'DM Sans',sans-serif", fill: "rgba(242,236,217,.85)", ls: ".1em" });
    el("line", { x1: X0, y1: YC, x2: X1, y2: YC, stroke: "rgba(242,236,217,.55)", "stroke-width": 1.5, "stroke-dasharray": "6 6" }, g);
    txt(g, X1, YC - 8, "healthy set point", { anchor: "end", font: "600 11px 'DM Sans',sans-serif", fill: "rgba(242,236,217,.75)" });
    var line = el("path", { fill: "none", stroke: MINT, "stroke-width": 3.5, "stroke-linejoin": "round" }, g);
    var dot = el("circle", { r: 8, fill: CREAM, stroke: MINT, "stroke-width": 3 }, g);
    var tag = rect(g, 0, 0, 200, 30, 15, { fill: CREAM });
    var tagT = txt(g, 0, 0, "", { anchor: "middle", fill: INK, font: "800 13px 'DM Sans',sans-serif" });
    function lvl(x, ts) { var u = (x - X0) / 560 * 6.5 + ts * .6; return YC - AMP * (Math.sin(u) * (.75 + .25 * Math.sin(u * .37 + 1))); }
    return { frame: function (p, t) {
      var ts = t / 1000, d = "";
      for (var x = X0; x <= X1; x += 8) d += (d ? " L" : "M") + x + "," + lvl(x, ts).toFixed(1);
      line.setAttribute("d", d); fb.style.strokeDashoffset = (-ts * 24).toFixed(1);
      var dx = 330, dy = lvl(dx, ts), up = dy < YC, slope = lvl(dx + 6, ts) - dy;
      dot.setAttribute("cx", dx); dot.setAttribute("cy", dy.toFixed(1));
      var label = up ? "too high → gland slows down" : "too low → gland speeds up", ty = up ? dy - 46 : dy + 46;
      tag.setAttribute("x", dx - 100); tag.setAttribute("y", (ty - 21).toFixed(1)); tagT.setAttribute("x", dx); tagT.setAttribute("y", (ty - 1).toFixed(1)); tagT.textContent = label;
      dots.forEach(function (c, j) { var u = (ts * .4 + j / 4) % 1; c.setAttribute("cx", (225 + u * 190).toFixed(1)); c.setAttribute("cy", 92); c.setAttribute("opacity", Math.sin(Math.PI * u).toFixed(2)); });
      void slope;
    } };
  };

  /* ======================= MELATONIN: 1. sky + chart (same scene as the home page) ======================= */
  SCENES.sky = function (g) {
    var inner = el("g", { transform: "translate(0 14)" }, g), m = A.melScene(inner);
    return { frame: function (p, t) { m.frame(lerp(15, 25.5, p), t); } };
  };

  /* ======================= MELATONIN: 2. the messenger chain, then the body winding down ======================= */
  SCENES.messenger = function (g) {
    var chain = el("g", {}, g), chart = el("g", {}, g);
    var N = [["EYES", "detect the light level"], ["SCN", "master clock in the hypothalamus"], ["PINEAL GLAND", "releases melatonin when it's dark"], ["MELATONIN", "travels in the blood"], ["YOUR BODY", "slows down for the day"]];
    var dotsG = el("g", {}, chain);
    var nodes = N.map(function (n, i) {
      var y = 52 + i * 92, gg = el("g", {}, chain);
      var r = rect(gg, 60, y, 290, 62, 31, { fill: FOREST, stroke: MINT, "stroke-width": 2 });
      var a = txt(gg, 205, y + 28, n[0], { anchor: "middle", font: "900 22px 'Big Shoulders Display',Impact,sans-serif", ls: ".08em" });
      var b = txt(gg, 205, y + 48, n[1], { anchor: "middle", font: "500 12.5px 'DM Sans',sans-serif" });
      if (i < 4) el("path", { d: "M205," + (y + 62) + " L205," + (y + 92), stroke: MINT, "stroke-width": 3 }, chain);
      return { r: r, a: a, b: b, y: y };
    });
    // moon + stars (it's dark)
    var moon = el("g", { transform: "translate(500 130)" }, chain);
    el("circle", { r: 36, fill: CREAM }, moon); el("circle", { cx: 16, cy: -12, r: 31, fill: DEEP }, moon);
    [[-30, -50], [40, -36], [52, 20], [-10, 56]].forEach(function (s) { el("circle", { cx: s[0], cy: s[1], r: 2.4, fill: CREAM }, moon); });
    txt(chain, 500, 214, "DARKNESS", { anchor: "middle", font: "800 14px 'DM Sans',sans-serif", ls: ".12em", fill: MINT });
    el("path", { d: "M452,130 C420,118 395,112 352,112", fill: "none", stroke: CREAM, "stroke-width": 2, "stroke-dasharray": "4 6" }, chain);
    var dots = []; for (var i = 0; i < 4; i++) dots.push(el("circle", { r: 4.5, fill: CREAM }, dotsG));
    // chart: temperature + blood pressure dip overnight
    var X0 = 60, X1 = 600, YB = 430;
    function hx(h) { return X0 + (h - 18) / 12 * (X1 - X0); }
    function dip(h) { return smooth(19, 26, h) * (1 - smooth(28, 31, h)); }
    txt(chart, 60, 44, "OVERNIGHT, THE BODY WINDS DOWN (illustrative)", { font: "800 13px 'DM Sans',sans-serif", ls: ".08em", fill: "rgba(242,236,217,.85)" });
    nightAxis(chart, X0, X1, YB);
    el("path", { d: pathOf(melCurve, 18, 30, hx, function (v) { return YB - v * 110; }) + " L" + hx(30) + "," + YB + " L" + hx(18) + "," + YB + " Z", fill: "rgba(168,213,180,.22)" }, chart);
    el("path", { d: pathOf(dip, 18, 30, hx, function (v) { return 150 + 130 * v; }), fill: "none", stroke: MINT, "stroke-width": 4, "stroke-linecap": "round" }, chart);
    el("path", { d: pathOf(dip, 18, 30, hx, function (v) { return 205 + 100 * v; }), fill: "none", stroke: CREAM, "stroke-width": 3.5, "stroke-dasharray": "9 7" }, chart);
    txt(chart, 66, 138, "Body temperature", { fill: MINT, font: "800 14px 'DM Sans',sans-serif" });
    txt(chart, 66, 194, "Blood pressure", { fill: CREAM, font: "800 14px 'DM Sans',sans-serif" });
    txt(chart, hx(24.2), YB - 30, "melatonin rises ↑", { anchor: "middle", font: "800 12px 'DM Sans',sans-serif", fill: CREAM });
    chart.setAttribute("opacity", 0);
    return { frame: function (p, t, age) {
      var ts = t / 1000, stage = Math.min(4, Math.floor(age / .75)), co = smooth(.3, .6, p);
      setOp(chain, 1 - co); setOp(chart, co);
      nodes.forEach(function (n, i) {
        var on = i <= stage;
        n.r.setAttribute("fill", on ? MINT : FOREST); n.a.setAttribute("fill", on ? INK : CREAM); n.b.setAttribute("fill", on ? INK : CREAM);
      });
      dots.forEach(function (c, j) {
        var u = (ts * .5 + j / 4) % 1, y = lerp(114, 114 + 92 * Math.min(3, stage), u);
        c.setAttribute("cx", 205); c.setAttribute("cy", y.toFixed(1)); c.setAttribute("opacity", stage > 0 ? Math.sin(Math.PI * u).toFixed(2) : 0);
      });
    } };
  };

  /* ======================= MELATONIN: 3. supplements + clock shift ======================= */
  SCENES.supp = function (g) {
    var X0 = 50, X1 = 600, YB = 420, H = 150;
    function hx(h) { return X0 + (h - 18) / 12 * (X1 - X0); }
    var TAGS = ["Jet lag", "Some sleep disorders in kids", "Anxiety before surgery"], tx = [64, 190, 440], tw = [100, 210, 190], tags = [];
    TAGS.forEach(function (s, i) {
      var r = rect(g, tx[i], 36, tw[i], 34, 17, { fill: "rgba(168,213,180,0)", stroke: MINT, "stroke-width": 2 });
      var t = txt(g, tx[i] + tw[i] / 2, 58, s, { anchor: "middle", font: "800 13px 'DM Sans',sans-serif" });
      tags.push({ r: r, t: t });
    });
    txt(g, 320, 108, "Research suggests melatonin supplements may help with:", { anchor: "middle", font: "600 12px 'DM Sans',sans-serif", fill: "rgba(242,236,217,.8)" });
    nightAxis(g, X0, X1, YB);
    var nat = el("path", { d: pathOf(melCurve, 18, 30, hx, function (v) { return YB - v * H; }), fill: "none", stroke: CREAM, "stroke-width": 3, "stroke-dasharray": "8 7", opacity: .8 }, g);
    var sh = el("path", { fill: "none", stroke: MINT, "stroke-width": 4.5, "stroke-linecap": "round" }, g);
    var area = el("path", { fill: "rgba(168,213,180,.2)" }, g);
    txt(g, 190, 214, "natural rhythm - - -", { anchor: "middle", font: "700 12px 'DM Sans',sans-serif", fill: CREAM });
    txt(g, 450, 214, "with a well-timed dose ——", { anchor: "middle", font: "700 12px 'DM Sans',sans-serif", fill: MINT });
    var pill = el("g", {}, g);
    el("rect", { x: -16, y: -8, width: 32, height: 16, rx: 8, fill: CREAM }, pill); el("rect", { x: 0, y: -8, width: 16, height: 16, rx: 8, fill: MINT }, pill); rect(pill, -2, -8, 4, 16, 0, { fill: MINT });
    txt(g, 320, 484, "Talk to a healthcare provider before taking melatonin", { anchor: "middle", font: "700 13px 'DM Sans',sans-serif", fill: MINT });
    return { frame: function (p, t, age) {
      var ts = t / 1000, u = REDUCED ? .6 : (age % 8) / 8;
      var shift = -3 * ease(seg(u, .24, .55)) * (1 - ease(seg(u, .88, 1)));
      var fn = function (h) { return melCurve(h - shift); };
      var d = pathOf(fn, 18, 30, hx, function (v) { return YB - v * H; });
      sh.setAttribute("d", d); area.setAttribute("d", d + " L" + hx(30) + "," + YB + " L" + hx(18) + "," + YB + " Z");
      var py = lerp(140, 300, ease(seg(u, .05, .24)));
      pill.setAttribute("transform", "translate(" + hx(21).toFixed(1) + " " + py.toFixed(1) + ") rotate(" + (ts * 40 % 360 * (u > .24 ? 0 : 1)).toFixed(0) + ")");
      setOp(pill, u > .04 && u < .32 ? 1 - seg(u, .24, .32) : 0);
      var act = Math.floor(ts / 1.6) % 3;
      tags.forEach(function (o, i) { o.r.setAttribute("fill", i === act ? "rgba(168,213,180,.35)" : "rgba(168,213,180,0)"); });
      void nat;
    } };
  };

  /* ======================= MELATONIN: 4. too low ======================= */
  SCENES.low = function (g) {
    var X0 = 50, X1 = 600, YB = 440, H = 150;
    function hx(h) { return X0 + (h - 18) / 12 * (X1 - X0); }
    var clock = el("g", { transform: "translate(110 120)" }, g);
    el("circle", { r: 48, fill: "rgba(31,50,41,.7)", stroke: CREAM, "stroke-width": 3 }, clock);
    for (var i = 0; i < 12; i++) { var a = i * Math.PI / 6; el("line", { x1: 40 * Math.sin(a), y1: -40 * Math.cos(a), x2: 45 * Math.sin(a), y2: -45 * Math.cos(a), stroke: CREAM, "stroke-width": 2 }, clock); }
    el("line", { x1: 0, y1: 0, x2: 20 * Math.sin(Math.PI / 3), y2: -20 * Math.cos(Math.PI / 3), stroke: CREAM, "stroke-width": 4, "stroke-linecap": "round" }, clock);
    var minute = el("line", { x1: 0, y1: 0, x2: 0, y2: -32, stroke: MINT, "stroke-width": 3, "stroke-linecap": "round" }, clock);
    txt(g, 190, 100, "2:00 AM", { font: "900 34px 'Big Shoulders Display',Impact,sans-serif" });
    var awake = txt(g, 190, 128, "still wide awake…", { font: "700 15px 'DM Sans',sans-serif", fill: MINT });
    txt(g, 190, 150, "(a clock that runs late)", { font: "500 12px 'DM Sans',sans-serif", fill: "rgba(242,236,217,.75)" });
    txt(g, 590, 62, "HYPOMELATONINEMIA", { anchor: "end", font: "800 13px 'DM Sans',sans-serif", ls: ".12em", fill: MINT });
    nightAxis(g, X0, X1, YB);
    el("path", { d: pathOf(melCurve, 18, 30, hx, function (v) { return YB - v * H; }), fill: "none", stroke: CREAM, "stroke-width": 3, "stroke-dasharray": "8 7", opacity: .85 }, g);
    txt(g, hx(26.2), YB - H - 10, "expected for age", { anchor: "middle", font: "700 12px 'DM Sans',sans-serif", fill: CREAM });
    var act = el("path", { fill: "none", stroke: MINT, "stroke-width": 4.5, "stroke-linecap": "round" }, g);
    var area = el("path", { fill: "rgba(168,213,180,.22)" }, g);
    var br = el("line", { x1: hx(26), x2: hx(26), y1: YB - H * .93, y2: YB - H * .28, stroke: CREAM, "stroke-width": 2, "stroke-dasharray": "3 4", opacity: 0 }, g);
    var brT = txt(g, hx(26) + 10, YB - H * .6, "gap", { font: "800 13px 'DM Sans',sans-serif", fill: CREAM });
    brT.setAttribute("opacity", 0);
    txt(g, hx(26), YB + 44, "actual: lower than expected", { anchor: "middle", font: "700 12px 'DM Sans',sans-serif", fill: MINT });
    function low(h) { return .06 + .22 * smooth(20.5, 26, h) * (1 - smooth(27.5, 31.2, h)) / .9 * .9; }
    return { frame: function (p, t, age) {
      var ts = t / 1000, k = REDUCED ? 1 : seg(age, .4, 2.4), hmax = 18 + 12 * k;
      var d = pathOf(low, 18, hmax, hx, function (v) { return YB - v * H; });
      act.setAttribute("d", d); area.setAttribute("d", d + " L" + hx(hmax) + "," + YB + " L" + hx(18) + "," + YB + " Z");
      setOp(br, seg(k, .8, 1)); setOp(brT, seg(k, .8, 1));
      minute.setAttribute("transform", "rotate(" + (ts * 30 % 360).toFixed(1) + ")");
      setOp(awake, .6 + .4 * Math.sin(ts * 3));
    } };
  };

  /* ======================= MELATONIN: 5. too high ======================= */
  SCENES.high = function (g) {
    var X0 = 230, X1 = 610, YB = 400, H = 105;
    function hx(h) { return X0 + (h - 18) / 12 * (X1 - X0); }
    var bottle = el("g", { transform: "translate(60 150)" }, g);
    rect(bottle, 0, 40, 110, 140, 16, { fill: "#EDE6D0" }); rect(bottle, 10, 6, 90, 38, 8, { fill: "#3B5B4D", stroke: MINT, "stroke-width": 2 });
    el("circle", { cx: 55, cy: 112, r: 34, fill: FOREST }, bottle);
    el("path", { d: "M62,92 a22,22 0 1 0 0,40 a17,17 0 1 1 0,-40z", fill: MINT }, bottle);
    txt(g, 115, 360, "too many supplements", { anchor: "middle", font: "800 13px 'DM Sans',sans-serif", fill: MINT });
    var caps = [0, 1, 2].map(function () {
      var gg = el("g", {}, g);
      el("rect", { x: -13, y: -6, width: 26, height: 12, rx: 6, fill: CREAM }, gg); el("rect", { x: 0, y: -6, width: 13, height: 12, rx: 6, fill: MINT }, gg);
      return gg;
    });
    txt(g, 420, 50, "HYPERMELATONINEMIA", { anchor: "middle", font: "800 13px 'DM Sans',sans-serif", ls: ".12em", fill: MINT });
    el("line", { x1: X0, y1: YB, x2: X1, y2: YB, stroke: "rgba(242,236,217,.4)", "stroke-width": 1.6 }, g);
    var band = rect(g, X0, YB - H, X1 - X0, H, 0, { fill: "rgba(242,236,217,.1)" });
    el("line", { x1: X0, y1: YB - H, x2: X1, y2: YB - H, stroke: CREAM, "stroke-width": 1.6, "stroke-dasharray": "6 6" }, g);
    txt(g, X0 + 6, YB - H + 18, "usual nightly range", { anchor: "start", font: "700 11px 'DM Sans',sans-serif", fill: "rgba(242,236,217,.85)" });
    txt(g, X0, YB + 22, "evening", { font: "600 11px 'DM Sans',sans-serif", fill: "rgba(242,236,217,.8)" });
    txt(g, X1, YB + 22, "morning", { anchor: "end", font: "600 11px 'DM Sans',sans-serif", fill: "rgba(242,236,217,.8)" });
    var line = el("path", { fill: "none", stroke: MINT, "stroke-width": 4.5, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    var area = el("path", { fill: "rgba(168,213,180,.22)" }, g);
    var SE = ["Daytime sleepiness", "Headaches", "Dizziness", "Nausea"], sx = [35, 195, 295, 395], sw = [150, 90, 90, 80], se = [];
    SE.forEach(function (s, i) {
      var r = rect(g, sx[i] + 60, 464, sw[i], 30, 15, { fill: "rgba(168,213,180,0)", stroke: MINT, "stroke-width": 2 });
      se.push({ r: r, t: txt(g, sx[i] + 60 + sw[i] / 2, 484, s, { anchor: "middle", font: "800 12px 'DM Sans',sans-serif" }) });
    });
    txt(g, 320, 452, "possible side effects of too much:", { anchor: "middle", font: "600 11.5px 'DM Sans',sans-serif", fill: "rgba(242,236,217,.75)" });
    return { frame: function (p, t, age) {
      var ts = t / 1000, u = REDUCED ? .7 : (age % 7) / 7;
      var k = 1 + .95 * ease(seg(u, .15, .5)) * (1 - ease(seg(u, .85, 1)));
      var d = pathOf(function (h) { return melCurve(h) * k; }, 18, 30, hx, function (v) { return YB - v * H; });
      line.setAttribute("d", d); area.setAttribute("d", d + " L" + hx(30) + "," + YB + " L" + hx(18) + "," + YB + " Z");
      band.setAttribute("fill", k > 1.25 ? "rgba(242,236,217,.16)" : "rgba(242,236,217,.1)");
      caps.forEach(function (c, i) {
        var q = clamp((u - .02 - i * .05) / .16, 0, 1), x = lerp(110 + i * 4, 150 + i * 36, ease(q)), y = lerp(190, 360, q * q) + Math.sin(i * 3) * 4;
        c.setAttribute("transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") rotate(" + (q * 220 + i * 40).toFixed(0) + ")");
        setOp(c, q > 0 && q < 1 ? 1 : 0);
      });
      var act = Math.floor(ts / 1.3) % 4;
      se.forEach(function (o, i) { o.r.setAttribute("fill", i === act ? "rgba(168,213,180,.35)" : "rgba(168,213,180,0)"); });
    } };
  };

  /* ============================= scene deck ============================= */
  var stepEls = [].slice.call(root.querySelectorAll(".step")), groups = [];
  stepEls.forEach(function (sEl, i) {
    var id = sEl.getAttribute("data-scene"), last = groups[groups.length - 1];
    if (last && last.id === id) last.last = i; else groups.push({ id: id, first: i, last: i });
  });
  A.register("article", function () {
    var svg = root.querySelector(".scrolly__visual svg");
    groups = groups.filter(function (gr) { return SCENES[gr.id]; });
    groups.forEach(function (gr) {
      gr.wrap = el("g", {}, svg); gr.wrap.style.display = "none"; gr.shown = null;
      gr.inst = SCENES[gr.id](el("g", {}, gr.wrap));
    });
    return { frame: function (s, t) {
      groups.forEach(function (gr) {
        var dist = Math.max(gr.first - s, 0, s - gr.last), op = clamp(1 - dist * 2, 0, 1);
        if (op <= .01) { gr.wrap.style.display = "none"; gr.shown = null; return; }
        gr.wrap.style.display = "";
        if (gr.shown === null) gr.shown = t;
        gr.wrap.setAttribute("opacity", op.toFixed(3));
        gr.wrap.setAttribute("transform", "translate(0 " + ((1 - op) * 22).toFixed(1) + ")");
        gr.inst.frame(clamp(s - gr.first, 0, gr.last - gr.first), t, REDUCED ? 99 : (t - gr.shown) / 1000, op);
      });
    } };
  });
  A.refresh();
})();
