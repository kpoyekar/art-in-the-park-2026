/* Drag, wheel and pinch zoom for the festival map (shared by all concepts). */
(function () {
  var D = window.AITP;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* the drawing's own size: the festival map by default, or whatever `opts.w`/`opts.h`
     say — the parking map is the same kind of SVG at a different shape */
  D.panZoom = function (map, host, opts) {
    opts = opts || {};
    var W = opts.w || D.map.w, H = opts.h || D.map.h;
    var vb = { x: 0, y: 0, w: W, h: H }, anim = 0, minW = W / (opts.maxZoom || 5), userMoved = false;
    /* `vb` is the view the page reasons about: the part of the map below the waves.
       The SVG reaches up over that strip, so the box it is actually given is taller
       by exactly as much map as covers it. Same scale, same place for the drawing —
       the strip just fills with the ground above the map's top edge, which then pans
       and zooms along with it. */
    function apply() {
      var e = edge ? edge / scaleFor(vb) : 0;
      map.setViewBox(vb.x.toFixed(1), (vb.y - e).toFixed(1), vb.w.toFixed(1), (vb.h + e).toFixed(1));
      map.hideTip();
    }
    function scaleFor(v) {
      var r = box(), f = wideEnough() ? Math.min : Math.max;
      return (r.width && r.height && v.w && v.h) ? f(r.width / v.w, r.height / v.h) : 1;
    }
    /* wide screens show the whole map (letterboxed); tall phone screens fill the screen and crop the sides */
    function wideEnough() {
      var r = box();
      return !r.width || !r.height || r.width / r.height >= (W / H) * 0.9;
    }
    function setFitMode() {
      var wide = wideEnough();
      /* a letterboxed map hangs from the top of its frame, so the drawing meets the
         waves and the leftover ground falls to the bottom where the strips are */
      if (map.svg) map.svg.setAttribute("preserveAspectRatio", wide ? "xMidYMin meet" : "xMidYMid slice");
      return wide;
    }
    /* the frame is padded to clear the header waves and the SVG reaches back up over
       that padding, so every measurement is of the part below the waves — the area a
       reader can actually see */
    var edge = 0;
    function measureEdge() { edge = map.svg ? (parseFloat(getComputedStyle(host).paddingTop) || 0) : 0; }
    function box() {
      var e = map.svg || host, r = e.getBoundingClientRect();
      return { width: r.width, height: r.height - (e === map.svg ? edge : 0) };
    }
    function clamp(v) {
      v.w = Math.max(minW, Math.min(W, v.w)); v.h = v.w * H / W;
      /* only part of the view box may be on screen — keep that part over the park */
      var r = box();
      var fit = wideEnough() ? Math.min : Math.max;
      var s = (r.width && r.height) ? fit(r.width / v.w, r.height / v.h) : 1;
      var visW = (r.width || v.w) / s, visH = (r.height || v.h) / s;
      var cx = v.x + v.w / 2, cy = v.y + v.h / 2;
      cx = visW >= W ? W / 2 : Math.min(Math.max(cx, visW / 2), W - visW / 2);
      cy = visH >= H ? H / 2 : Math.min(Math.max(cy, visH / 2), H - visH / 2);
      v.x = cx - v.w / 2; v.y = cy - v.h / 2;
      return v;
    }
    /* the fitted view is always the whole map — wide screens letterbox it, phones fill the screen with it */
    function fitView() { setFitMode(); return { x: 0, y: 0, w: W, h: H }; }
    function animateTo(t) {
      t = clamp(t);
      cancelAnimationFrame(anim);
      if (reduce) { vb = t; apply(); return; }
      var s = { x: vb.x, y: vb.y, w: vb.w, h: vb.h }, t0 = performance.now();
      (function step(now) {
        var k = Math.min(1, (now - t0) / 420), e = 1 - Math.pow(1 - k, 3);
        vb = { x: s.x + (t.x - s.x) * e, y: s.y + (t.y - s.y) * e, w: s.w + (t.w - s.w) * e, h: s.h + (t.h - s.h) * e };
        apply();
        if (k < 1) anim = requestAnimationFrame(step);
      })(t0);
    }
    function zoomAround(f, px, py, animated) {
      var w = vb.w / f, k = w / vb.w;
      var t = { x: px - (px - vb.x) * k, y: py - (py - vb.y) * k, w: w, h: w * H / W };
      if (animated) animateTo(t); else { vb = clamp(t); apply(); }
    }
    function upp() {
      var r = box();
      return 1 / Math.min(r.width / vb.w, r.height / vb.h);
    }
    requestAnimationFrame(function () { measureEdge(); vb = clamp(fitView()); apply(); });
    window.addEventListener("resize", function () { measureEdge(); setFitMode(); if (!userMoved) { vb = clamp(fitView()); apply(); } });
    host.addEventListener("wheel", function (e) {
      e.preventDefault();
      userMoved = true;
      var p = map.toSvg(e.clientX, e.clientY);
      zoomAround(Math.exp(-e.deltaY * 0.0016), p.x, p.y, false);
    }, { passive: false });

    var pts = new Map(), drag = null, pinch = null;
    function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
    host.addEventListener("pointerdown", function (e) {
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, vb: Object.assign({}, vb), moved: false, upp: upp() };
      else if (pts.size === 2) {
        var a = Array.from(pts.values());
        pinch = { d: dist(a[0], a[1]), vb: Object.assign({}, vb), mid: map.toSvg((a[0].x + a[1].x) / 2, (a[0].y + a[1].y) / 2) };
        drag = null;
      }
    });
    host.addEventListener("pointermove", function (e) {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pts.size === 2) {
        var a = Array.from(pts.values()), w = pinch.vb.w / (dist(a[0], a[1]) / pinch.d), k = w / pinch.vb.w;
        vb = clamp({ x: pinch.mid.x - (pinch.mid.x - pinch.vb.x) * k, y: pinch.mid.y - (pinch.mid.y - pinch.vb.y) * k, w: w, h: w * H / W });
        apply();
        userMoved = true;
        map.suppressClick = true;
        return;
      }
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
      if (!drag.moved && Math.hypot(dx, dy) < 6) return;
      if (!drag.moved) { drag.moved = true; userMoved = true; host.setPointerCapture(e.pointerId); host.classList.add("dragging"); cancelAnimationFrame(anim); }
      vb = clamp({ x: drag.vb.x - dx * drag.upp, y: drag.vb.y - dy * drag.upp, w: drag.vb.w, h: drag.vb.h });
      apply();
    });
    function end(e) {
      pts.delete(e.pointerId);
      if (drag && drag.id === e.pointerId) {
        if (drag.moved) { map.suppressClick = true; setTimeout(function () { map.suppressClick = false; }, 0); }
        drag = null;
        host.classList.remove("dragging");
      }
      if (pts.size < 2 && pinch) { pinch = null; setTimeout(function () { map.suppressClick = false; }, 0); }
    }
    host.addEventListener("pointerup", end);
    host.addEventListener("pointercancel", end);

    return {
      zoomIn: function () { userMoved = true; zoomAround(1.6, vb.x + vb.w / 2, vb.y + vb.h / 2, true); },
      zoomOut: function () { userMoved = true; zoomAround(1 / 1.6, vb.x + vb.w / 2, vb.y + vb.h / 2, true); },
      fit: function () { userMoved = false; animateTo(fitView()); },
      /* center an item; offsetX/offsetY (fractions of the visible area) move it clear of a panel */
      focus: function (it, offsetX, offsetY) {
        userMoved = true;
        var r = box(), w = Math.min(vb.w, W / 2.2), h = w * H / W;
        var s = Math.min(r.width / w, r.height / h) || 1;
        animateTo({ x: it.cx - w / 2 + (offsetX || 0) * (r.width / s), y: it.cy - h / 2 + (offsetY || 0) * (r.height / s), w: w, h: h });
      },
      isZoomed: function () { return vb.w < W - 1; }
    };
  };
})();
