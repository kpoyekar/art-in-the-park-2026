/* Shared map engine for the Art in the Park 2026 site concepts.
   Draws the program map as an SVG with clickable booths, food stops and places. */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var D = window.AITP, W = D.map.w, H = D.map.h;

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function centroid(pts) {
    var x = 0, y = 0;
    pts.forEach(function (p) { x += p[0]; y += p[1]; });
    return [x / pts.length, y / pts.length];
  }
  function shapeD(s, pad) {
    pad = pad || 0;
    if (s.type === "poly") {
      var c = centroid(s.pts);
      return "M" + s.pts.map(function (p) {
        var dx = p[0] - c[0], dy = p[1] - c[1], l = Math.hypot(dx, dy) || 1, k = 1 + pad / l;
        return (c[0] + dx * k).toFixed(1) + " " + (c[1] + dy * k).toFixed(1);
      }).join("L") + "Z";
    }
    if (s.type === "rect") {
      var x = s.x - pad, y = s.y - pad, w = s.w + 2 * pad, h = s.h + 2 * pad;
      var rr = Math.min(s.r ? s.r + pad : 0, w / 2, h / 2);        /* rounded tiles (the beer stop) keep their corners */
      if (!rr) return "M" + x + " " + y + "h" + w + "v" + h + "h" + (-w) + "Z";
      var a = "a" + rr + " " + rr + " 0 0 1 ";
      return "M" + (x + rr) + " " + y + "h" + (w - 2 * rr) + a + rr + " " + rr +
        "v" + (h - 2 * rr) + a + (-rr) + " " + rr + "h" + (-(w - 2 * rr)) + a + (-rr) + " " + (-rr) +
        "v" + (-(h - 2 * rr)) + a + rr + " " + (-rr) + "Z";
    }
    var r = s.r + pad;
    return "M" + (s.cx - r) + " " + s.cy + "a" + r + " " + r + " 0 1 0 " + 2 * r + " 0a" + r + " " + r + " 0 1 0 " + -2 * r + " 0Z";
  }
  function bounds(shapes) {
    var b = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 };
    shapes.forEach(function (s) {
      var pts = s.type === "poly" ? s.pts : s.type === "rect" ? [[s.x, s.y], [s.x + s.w, s.y + s.h]] : [[s.cx - s.r, s.cy - s.r], [s.cx + s.r, s.cy + s.r]];
      pts.forEach(function (p) {
        b.x0 = Math.min(b.x0, p[0]); b.y0 = Math.min(b.y0, p[1]);
        b.x1 = Math.max(b.x1, p[0]); b.y1 = Math.max(b.y1, p[1]);
      });
    });
    return b;
  }

  var KIND = { food: "Food", beer: "Beer", wine: "Wine" };
  var items = [];
  D.artists.forEach(function (a) {
    items.push({ id: a.id, kind: "booth", cat: "artists", code: String(a.booth), title: a.name, sub: a.medium,
      aria: "Booth " + a.booth + ": " + a.name + ", " + a.medium, shapes: [{ type: "poly", pts: a.poly }], data: a });
  });
  D.food.forEach(function (f) {
    items.push({ id: f.id, kind: "food", cat: "food", code: f.code, title: f.name, sub: f.serves,
      aria: KIND[f.kind] + " " + f.code + ": " + f.name, shapes: f.shapes, data: f });
  });
  D.places.forEach(function (p) {
    items.push({ id: p.id, kind: "place", cat: p.cat, code: "", title: p.name, sub: p.short,
      aria: p.name + ", " + p.short, shapes: p.shapes, data: p });
  });
  /* a demo is a time in the programme, not a spot on the map: it has a card of its
     own, and it borrows the wellness area's outline so opening one looks there */
  (function () {
    var area = D.places.filter(function (p) { return p.id === "p-wellness"; })[0];
    if (!area) return;
    (D.wellness || []).forEach(function (w) {
      if (!w.id) return;
      items.push({ id: w.id, kind: "demo", cat: null, offMap: true, code: "", title: w.title,
        sub: w.by, aria: w.title, shapes: area.shapes, data: w });
    });
  })();
  items.forEach(function (it) {
    it.b = bounds(it.shapes);
    it.cx = (it.b.x0 + it.b.x1) / 2;
    it.cy = (it.b.y0 + it.b.y1) / 2;
  });
  var index = {};
  items.forEach(function (it) { index[it.id] = it; });

  D.items = items;
  D.item = function (id) { return index[id]; };
  D.esc = esc;

  /* "13:30" -> minutes */
  D.mins = function (hm) { var p = hm.split(":"); return +p[0] * 60 + +p[1]; };
  /* minutes or "13:30" -> "1:30 PM" */
  D.clock = function (v, noSuffix) {
    var m = typeof v === "number" ? v : D.mins(v), h = Math.floor(m / 60), mm = m % 60;
    var hh = ((h + 11) % 12) + 1;
    return hh + (mm ? ":" + String(mm).padStart(2, "0") : "") + (noSuffix ? "" : h < 12 ? " AM" : " PM");
  };
  /* "10:00","11:30" -> "10–11:30 AM"; "11:45","13:15" -> "11:45 AM–1:15 PM" */
  D.span = function (a, b) {
    var am = D.mins(a) < 720, bm = D.mins(b) < 720;
    return am === bm ? D.clock(a, true) + "–" + D.clock(b) : D.clock(a) + "–" + D.clock(b);
  };

  D.mountMap = function (container, opts) {
    opts = opts || {};
    var byId = {};
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "xMidYMid meet", "class": "aitp-map", role: "group",
      "aria-label": "Map of Founders’ Park. Booths, food stops and places are buttons." });
    var defs = el("defs", null, svg);
    if (opts.ground) el("rect", { x: -W, y: -H, width: W * 3, height: H * 3, "class": "map-ground" }, svg);
    var image = el("image", { href: D.map.src, x: 0, y: 0, width: W, height: H }, svg);
    /* carry the grass, the meadow and the roads out past the edges of the drawing, so the map
       never looks like a box on screen — the colors come from the map's own edge pixels */
    (function () {
      var b = D.map.bleed;
      if (!b) return;
      var far = W;                                  /* how far past each edge to paint */
      function band(x, y, w, h, fill) { el("rect", { x: x, y: y, width: w, height: h, fill: fill }, svg); }
      (b.left || []).forEach(function (s) { band(-far, s[0], far, s[1] - s[0], s[2]); });
      (b.right || []).forEach(function (s) { band(W, s[0], far, s[1] - s[0], s[2]); });
      (b.top || []).forEach(function (s) { band(s[0], -far, s[1] - s[0], far, s[2]); });
      (b.bottom || []).forEach(function (s) { band(s[0], H, s[1] - s[0], far, s[2]); });
      /* The corners take the color of the band they carry sideways — the top and
         bottom edges, which run the full width — rather than the first sliver of a
         side edge, which is usually a stray pixel of the drawing's own corner. That
         keeps the ground above and below the map one color from screen edge to
         screen edge. */
      function pick(list, first) {
        return list && list.length ? (first ? list[0][2] : list[list.length - 1][2]) : null;
      }
      function corner(x, y, along, side, first) {
        var c = pick(along, first) || pick(side, first);
        if (c) band(x, y, far, far, c);
      }
      corner(-far, -far, b.top, b.left, true);     corner(W, -far, b.top, b.right, false);
      corner(-far, H, b.bottom, b.left, true);     corner(W, H, b.bottom, b.right, false);
    })();
    /* labels nudged along the top road: wipe the original, then draw the same artwork
       again, shifted and clipped to where it should sit (data.js map.moves) */
    (D.map.moves || []).forEach(function (m, i) {
      el("rect", { x: m.x, y: m.y, width: m.w, height: m.h, fill: m.fill }, svg);
      var id = "mapmove" + i;
      var cp = el("clipPath", { id: id }, defs);
      el("rect", { x: m.x + m.dx, y: m.y + m.dy, width: m.w, height: m.h }, cp);
      el("image", { href: D.map.src, x: m.dx, y: m.dy, width: W, height: H, "clip-path": "url(#" + id + ")" }, svg);
    });

    /* spot fixes painted over the drawing: stray marks the printed map carries that a
       redaction cannot lift, because they belong to a larger path (see data.js map.patches) */
    (D.map.patches || []).forEach(function (p) {
      el("rect", { x: p.x, y: p.y, width: p.w, height: p.h, fill: p.fill }, svg);
    });

    /* Freedom Bank sits just off the west edge of the drawing; the ATM arrow on the map points at it */
    (function () {
      var b = D.map.bank;
      if (!b) return;
      el("rect", { x: b.x, y: b.y, width: b.w, height: b.h, fill: "#c4c6c1", "class": "map-bank-box" }, svg);
      var t = el("text", { x: b.x + b.w / 2, y: b.y + b.h / 2, "text-anchor": "middle", "class": "map-bank" }, svg);
      b.label.forEach(function (line, i) {
        var s = el("tspan", { x: b.x + b.w / 2, dy: i ? "1.05em" : (b.label.length > 1 ? "-0.15em" : "0.34em") }, t);
        s.textContent = line;
      });
    })();

    var hs = el("g", { "class": "hs-layer" }, svg);
    var dim = el("path", { "class": "dim-layer", "fill-rule": "evenodd", d: "" }, svg);
    var markers = el("g", { "class": "marker-layer" }, svg);
    var sel = el("g", { "class": "sel-layer" }, svg);

    var onMap = items.filter(function (i) { return !i.offMap; });
    var ordered = onMap.filter(function (i) { return i.kind === "place"; })
      .concat(onMap.filter(function (i) { return i.kind !== "place"; }));
    ordered.forEach(function (it) {
      var g = el("g", { "class": "hs hs-" + it.kind + " cat-" + it.cat, "data-id": it.id, tabindex: "0", role: "button", "aria-label": it.aria }, hs);
      it.shapes.forEach(function (s) { el("path", { "class": "hs-shape", d: shapeD(s, it.kind === "booth" ? 2 : 0) }, g); });
      byId[it.id] = g;
      g.addEventListener("click", function (e) {
        if (api.suppressClick) { api.suppressClick = false; return; }
        if (opts.onSelect) opts.onSelect(it, e);
      });
      g.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (opts.onSelect) opts.onSelect(it, e); }
      });
      g.addEventListener("pointerenter", function (e) { if (e.pointerType !== "touch") showTip(it); });
      g.addEventListener("pointerleave", hideTip);
      g.addEventListener("focus", function () { showTip(it); });
      g.addEventListener("blur", hideTip);
    });
    container.appendChild(svg);

    var tip = document.createElement("div");
    tip.className = "map-tip";
    tip.hidden = true;
    tip.setAttribute("aria-hidden", "true");
    container.appendChild(tip);

    function toScreen(x, y) {
      var m = svg.getScreenCTM(), r = container.getBoundingClientRect();
      if (!m) return { x: 0, y: 0 };
      return { x: m.a * x + m.c * y + m.e - r.left, y: m.b * x + m.d * y + m.f - r.top };
    }
    function toSvg(clientX, clientY) {
      var m = svg.getScreenCTM();
      if (!m) return { x: 0, y: 0 };
      var inv = m.inverse();
      return { x: inv.a * clientX + inv.c * clientY + inv.e, y: inv.b * clientX + inv.d * clientY + inv.f };
    }
    function showTip(it) {
      if (opts.tip === false) return;
      tip.innerHTML = opts.tip ? opts.tip(it) : (it.code ? "<b>" + esc(it.code) + "</b> " : "") + esc(it.title);
      var p = toScreen(it.cx, it.b.y0);
      tip.style.left = p.x + "px";
      tip.style.top = p.y + "px";
      tip.hidden = false;
    }
    function hideTip() { tip.hidden = true; }

    var api = {
      svg: svg, defs: defs, image: image, markers: markers, container: container, selected: null, suppressClick: false,
      toScreen: toScreen, toSvg: toSvg, hideTip: hideTip,
      node: function (id) { return byId[id]; },
      select: function (id) {
        this.clear();
        var it = index[id];
        if (!it || !byId[id]) return;
        byId[id].classList.add("is-selected");
        this.selected = id;
        it.shapes.forEach(function (s) {
          el("path", { "class": "sel-halo", d: shapeD(s, it.kind === "booth" ? 9 : 7) }, sel);
          el("path", { "class": "sel-outline", d: shapeD(s, it.kind === "booth" ? 3 : 2) }, sel);
        });
      },
      clear: function () {
        sel.innerHTML = "";
        if (this.selected && byId[this.selected]) byId[this.selected].classList.remove("is-selected");
        this.selected = null;
      },
      spotlight: function (ids) {
        if (!ids || !ids.length) { dim.setAttribute("d", ""); svg.classList.remove("is-dimmed"); return; }
        var d = "M" + -W + " " + -H + "H" + 2 * W + "V" + 2 * H + "H" + -W + "Z";
        ids.forEach(function (id) {
          var it = index[id];
          if (it) it.shapes.forEach(function (s) { d += shapeD(s, it.kind === "booth" ? 5 : 4); });
        });
        dim.setAttribute("d", d);
        svg.classList.add("is-dimmed");
      },
      setViewBox: function (x, y, w, h) { svg.setAttribute("viewBox", x + " " + y + " " + w + " " + h); }
    };
    return api;
  };
})();
