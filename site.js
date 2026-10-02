/* Art in the Park 2026 — page setup: tab list, drawer, mobile menu, section jumps. */
/* five tabs; the old page ids still work and scroll to their section */
  /* each tab takes the color of its marker on the map: artists coral, shows sky, park info green,
     food mustard (food lives on the map). Sponsors and Team have no map marker, so they stay cream. */
  AITP.nav = [
    { id: "map", label: "Map" },
    { id: "artists", label: "Program" }, { id: "visit", label: "Plan Your Visit" },
    { id: "sponsors", label: "Sponsors & Team" },
    { id: "merch", label: "Merch" }, { id: "contact", label: "Contact" }
  ];

(function () {
  var drawer = document.getElementById("drawer"), body = document.getElementById("drBody");
  function phone() { return window.matchMedia("(max-width: 760px)").matches; }
  var app = AITP.app({
    mapHost: "#mapHost",
    focusOffset: function () { return phone() ? 0 : 0.2; },
    focusOffsetY: function () { return phone() ? 0.31 : 0; },
    alias: { parking: "visit", explore: "visit" },
    openDetail: function (html) {
      body.innerHTML = html;
      body.scrollTop = 0;
      drawer.classList.add("open");
      drawer.removeAttribute("inert");
      document.getElementById("drClose").focus({ preventScroll: true });
    },
    closeDetail: function () {
      drawer.classList.remove("open");
      drawer.setAttribute("inert", "");
    }
  });
  /* credit plaque on the empty green patch of the map (where the printed program's food box sat) */
  (function () {
    var svg = app.map.svg, NS = "http://www.w3.org/2000/svg";
    var a = document.createElementNS(NS, "a");
    a.setAttribute("href", "#sponsors");
    a.setAttribute("class", "map-credit");
    a.innerHTML =
      '<text x="585" y="844" text-anchor="middle">AN EVENT OF</text>' +
      '<image href="assets/logos/mse-white.png" x="487" y="858" width="196" height="52"></image>' +
      '<text x="822" y="844" text-anchor="middle">MAIN EVENT SPONSOR</text>' +
      '<image href="assets/logos/amfam.png" x="729" y="856" width="186" height="55"></image>' +
      '<text x="822" y="952" text-anchor="middle" class="mc-small">SEE ALL SPONSORS →</text>';
    svg.appendChild(a);
  })();

  /* On phones the countdown becomes a bar fixed to the foot of the screen, and pages
     keep clear of it with --cdbar. That was hard-coded at 84px while the bar actually
     measures 87, which the section strip then sat under: publish the real height. */
  (function () {
    var bar = document.querySelector(".hcal-count:not(.mnav-count)[data-countdown]");
    if (!bar) return;
    function sync() {
      var fixed = getComputedStyle(bar).position === "fixed" && getComputedStyle(bar).display !== "none";
      document.documentElement.style.setProperty("--cdbar", fixed ? Math.ceil(bar.getBoundingClientRect().height) + "px" : "0px");
    }
    sync();
    window.addEventListener("resize", sync);
    /* crossing the phone breakpoint is what actually turns the bar on and off */
    var phone = window.matchMedia("(max-width: 760px)");
    if (phone.addEventListener) phone.addEventListener("change", sync);
    else if (phone.addListener) phone.addListener(sync);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sync);
  })();

  /* photo carousels: two slides in view, clickable arrows, and a gentle auto-advance
     that pauses while the pointer or keyboard focus is inside it */
  document.querySelectorAll("[data-carousel]").forEach(function (box) {
    var track = box.querySelector(".sc-track");
    var arrows = [].slice.call(box.querySelectorAll(".sc-arrow"));
    var still = window.matchMedia("(prefers-reduced-motion: reduce)");
    var timer = null;

    function room() { return track.scrollWidth - track.clientWidth; }
    function step() {
      var li = track.querySelector("li");
      return li ? li.getBoundingClientRect().width + 16 : track.clientWidth;
    }
    function go(dir) {
      var max = room(), to = track.scrollLeft + dir * step();
      if (to > max - 2) to = 0; else if (to < 0) to = max;   /* wrap both ways */
      track.scrollTo({ left: to, behavior: "smooth" });
    }
    function sync() {
      var can = room() > 4;
      arrows.forEach(function (a) { a.hidden = !can; });
      if (!can) stop();
    }
    function play() { if (!timer && room() > 4 && !still.matches) timer = setInterval(function () { go(1); }, 5000); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    box.addEventListener("click", function (e) {
      var b = e.target.closest("[data-slide]");
      if (b) { go(+b.getAttribute("data-slide")); stop(); play(); }
    });
    box.addEventListener("pointerenter", stop);
    box.addEventListener("pointerleave", play);
    box.addEventListener("focusin", stop);
    box.addEventListener("focusout", play);
    window.addEventListener("resize", sync);
    sync();
    /* it only drifts while it is actually on screen */
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (rows) {
        rows.forEach(function (r) { if (r.isIntersecting) play(); else stop(); });
      }, { threshold: 0.35 }).observe(box);
    } else {
      play();
    }
  });

  /* the festival film starts itself once it is properly in view. Browsers only allow
     that muted, so it starts muted with the controls showing; scrolling it away pauses
     it, and once someone works the controls themselves we stop interfering. */
  (function () {
    var film = document.querySelector(".v-movie video");
    if (!film || !("IntersectionObserver" in window)) return;
    var still = window.matchMedia("(prefers-reduced-motion: reduce)");
    var unmuted = false, inView = false;

    /* the only signal we treat as "they are watching this deliberately" is unmuting.
       We deliberately do NOT key off the pause event: the browser pauses background
       media on its own, and reading that as intent would kill autoplay for good. */
    film.addEventListener("volumechange", function () { if (!film.muted) unmuted = true; });

    new IntersectionObserver(function (rows) {
      rows.forEach(function (r) {
        var showing = r.intersectionRatio >= 0.5;
        if (showing && !inView && !unmuted && !still.matches) {   /* only on the way IN */
          film.muted = true;
          var p = film.play();
          if (p && p.catch) p.catch(function () { });             /* blocked: leave the poster up */
        }
        if (showing) inView = true;
        if (r.intersectionRatio === 0) {
          inView = false;
          if (!film.paused) film.pause();                         /* nothing plays off screen */
        }
      });
    }, { threshold: [0, 0.5] }).observe(film);
  })();

  var burger = document.getElementById("burger"), mnav = document.getElementById("mnav");
  function setNav(open) {
    mnav.hidden = !open;
    burger.setAttribute("aria-expanded", String(open));
    if (open) mnav.querySelector(".mnav-close").focus();
    else if (mnav.contains(document.activeElement)) burger.focus();
  }
  burger.addEventListener("click", function () { setNav(true); });
  mnav.addEventListener("click", function (e) { if (e.target.closest(".mnav-close, .mnav-link")) setNav(false); });
  window.addEventListener("hashchange", function () { if (!mnav.hidden) setNav(false); });
  window.addEventListener("resize", function () { if (!phone() && !mnav.hidden) setNav(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !mnav.hidden) setNav(false); });
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-jump]");
    if (!b) return;
    var s = b.closest(".page").querySelector('[data-section="' + b.getAttribute("data-jump") + '"]');
    if (s) s.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  });

  /* every slideshow on the page runs itself: the Visit panel and the Explore hero */
  (function () {
    var slow = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    [].slice.call(document.querySelectorAll(".v-photos, [data-slides]")).forEach(function (box, k) {
      var film = box.querySelector("video");
      if (film) {                                /* the aerial loop holds its poster when motion is off */
        if (slow) { film.autoplay = false; film.pause(); }
        return;
      }
      var shots = [].slice.call(box.children);
      if (!shots.length) return;
      shots[0].classList.add("is-on");
      if (shots.length < 2 || slow) return;
      var i = 0;
      setTimeout(function () {
        setInterval(function () {
          shots[i].classList.remove("is-on");
          i = (i + 1) % shots.length;
          shots[i].classList.add("is-on");
        }, 5000);
      }, k * 1200);                              /* stagger, so two slideshows don't flip together */
    });
  })();

  /* the two date lines are scaled so each one spans the width of the wordmark */
  (function () {
    var wm = document.querySelector(".brand .wm");
    var lines = [].slice.call(document.querySelectorAll(".brand .kicker, .brand .mdate > span"));
    if (!wm || !lines.length) return;
    function fit() {
      var target = wm.getBoundingClientRect().width;
      if (!target) return;
      lines.forEach(function (el) {
        if (!el.offsetParent) return;                 /* the short/long version that is hidden */
        el.style.width = "";                                 /* clear the last fit before measuring again */
        el.style.display = "inline-block";                   /* shrink-wrap so we can measure the text */
        el.style.fontSize = "16px";
        var natural = el.getBoundingClientRect().width;
        el.style.display = "";
        if (!natural) return;
        var cap = el.classList.contains("kicker") ? 22 : 38;
        el.style.fontSize = Math.max(9, Math.min(cap, 16 * target / natural)).toFixed(1) + "px";
        el.style.width = Math.round(target) + "px";           /* exactly the wordmark, then justified to it */
      });
    }
    fit();
    window.addEventListener("resize", fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  })();

  /* The countdown bar takes a slice of a phone screen, so it can be dismissed. The
     choice is remembered, and the same countdown is in the menu either way. */
  (function () {
    var bar = document.querySelector(".hcal-count:not(.mnav-count)[data-countdown]");
    if (!bar) return;
    var KEY = "aitp-cd-hidden";
    function hide(remember) {
      /* a class, not the hidden attribute: the X only exists on the phone bar, so the
         dismissal must only apply there — hiding the element outright took the header
         countdown away on a desktop too, with no way to bring it back */
      document.documentElement.classList.add("cd-off");
      document.documentElement.style.setProperty("--cdbar", "0px");
      if (remember) { try { localStorage.setItem(KEY, "1"); } catch (e) { } }
    }
    try { if (localStorage.getItem(KEY) === "1") hide(false); } catch (e) { }
    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-cd-close]")) hide(true);
    });
  })();

  /* countdown, shown inside the calendar graphic in the header */
  (function () {
    var ev = AITP.event, start = new Date(ev.start), end = new Date(ev.end);
    var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-countdown]"));
    if (!boxes.length) return;
    var box = boxes[0];
    var cell = {}, title = boxes.map(function (b) { return b.querySelector("[data-cd-title]"); }),
        note = boxes.map(function (b) { return b.querySelector("[data-cd-note]"); });
    ["d", "h", "m", "s"].forEach(function (k) {
      cell[k] = { textContent: "", set: null };
      var els = boxes.map(function (b) { return b.querySelector('[data-cd="' + k + '"]'); });
      Object.defineProperty(cell, k, { value: { set textContent(v) { els.forEach(function (e) { if (e) e.textContent = v; }); } } });
    });
    function two(n) { return n < 10 ? "0" + n : String(n); }
    function tick() {
      var now = new Date(), left = start - now;
      if (left > 0) {
        var t = Math.floor(left / 1000);
        cell.d.textContent = two(Math.floor(t / 86400));   /* 09, not 9: a lone digit floats in its cell */
        cell.h.textContent = two(Math.floor(t % 86400 / 3600));
        cell.m.textContent = two(Math.floor(t % 3600 / 60));
        cell.s.textContent = two(t % 60);
        return;
      }
      var word = now <= end ? "Happening now" : "Thank you";
      var line = now <= end ? "See you in Founders\u2019 Park" : "See you in 2027";
      boxes.forEach(function (b, i) {
        b.classList.add("is-open");
        if (title[i]) title[i].textContent = word;
        var cells = b.querySelector(".cd-cells"); if (cells) cells.hidden = true;
        if (note[i]) { note[i].hidden = false; note[i].textContent = line; }
      });
    }
    tick();
    setInterval(tick, 1000);
  })();

  /* The parking map is a drawing in a fixed frame. On a wide screen the whole of it
     fits and nothing moves. On a phone or tablet it is far too wide to read at that
     size, so it fills the frame and takes drag, wheel and pinch the way the festival
     map does — the same panZoom, told this drawing's own dimensions. */
  (function () {
    var svg = document.querySelector(".pmap-svg"), host = svg && svg.closest(".pmap-wrap");
    if (!svg || !host || !AITP.panZoom) return;
    var narrow = window.matchMedia("(max-width:1024px)"), pz = null;
    var box = (AITP.parking.map || {});
    var view = { x: 0, y: 0, w: box.w || 1600, h: box.h || 900 };
    var map = {
      svg: svg,
      setViewBox: function (x, y, w, h) { svg.setAttribute("viewBox", x + " " + y + " " + w + " " + h); },
      hideTip: function () { },
      toSvg: function (cx, cy) {
        var m = svg.getScreenCTM();
        if (!m) return { x: 0, y: 0 };
        var p = svg.createSVGPoint();
        p.x = cx; p.y = cy;
        p = p.matrixTransform(m.inverse());
        return { x: p.x, y: p.y };
      }
    };
    function toWide() {                       /* hand the drawing back to the stylesheet */
      svg.setAttribute("viewBox", "0 0 " + view.w + " " + view.h);
      svg.setAttribute("preserveAspectRatio", "xMidYMin meet");
    }
    function sync() {
      if (narrow.matches && !pz) {
        host.classList.add("is-live");
        pz = AITP.panZoom(map, host, { w: view.w, h: view.h, maxZoom: 6 });
        svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
        pz.focus({ cx: view.w * 0.42, cy: view.h * 0.5 });
      } else if (!narrow.matches && pz) {
        pz = null;
        host.classList.remove("is-live");
        toWide();
      }
    }
    sync();
    if (narrow.addEventListener) narrow.addEventListener("change", sync);
    /* panZoom keeps its own resize listener once it has been mounted, so a window that
       is dragged back out to desktop width would be left on the view it was panned to.
       This listener is added after its, and puts the whole drawing back. */
    window.addEventListener("resize", function () { if (!narrow.matches) toWide(); });
    /* Parking is a section of Plan Your Visit, so it is hidden when this runs and the
       frame has no size yet. panZoom decides whether to letterbox or fill from that
       size, so the fit is redone the moment the section is first shown. */
    if (window.ResizeObserver) {
      var had = 0;
      new ResizeObserver(function (rows) {
        var wide = rows[0].contentRect.width;
        if (wide > 0 && !had && pz) pz.fit();
        had = wide;
      }).observe(host);
    }
  })();

  /* The opening screen stays until the page behind it has drawn and the display
     face has loaded, so the first thing anyone sees is the name set properly and
     not a flash of fallback type. It is held briefly so it reads as a pause rather
     than a flicker, and it never waits on a slow asset for more than a moment. */
  (function () {
    var splash = document.getElementById("splash");
    if (!splash) return;
    var MIN = 1400, MAX = 4000, t0 = Date.now(), gone = false;
    function hide() {
      if (gone) return;
      gone = true;
      setTimeout(function () {
        splash.classList.add("is-done");
        setTimeout(function () { if (splash.parentNode) splash.parentNode.removeChild(splash); }, 600);
      }, Math.max(0, MIN - (Date.now() - t0)));
    }
    var waits = [new Promise(function (go) {
      if (document.readyState === "complete") return go();
      window.addEventListener("load", go, { once: true });
    })];
    if (document.fonts && document.fonts.ready) waits.push(document.fonts.ready);
    Promise.all(waits).then(hide);
    setTimeout(hide, MAX);          /* never leave anyone staring at it */
  })();

  /* The two films share one frame and play in turn — the 2024 film, then the aerial.
     When the last one finishes the block goes back to the first one's poster, so the
     pair can be watched again. */
  (function () {
    var reel = document.querySelector("[data-reel]");
    if (!reel) return;
    var films = Array.prototype.slice.call(reel.querySelectorAll("video"));
    var by = reel.querySelector("[data-reel-by]");
    if (films.length < 2) return;
    function show(i, play) {
      films.forEach(function (v, n) {
        if (n === i) return;
        v.hidden = true;
        v.pause();
      });
      var v = films[i];
      v.hidden = false;
      if (by) by.textContent = v.getAttribute("data-by") || "";
      if (play) v.play().catch(function () { });
      else { v.pause(); v.currentTime = 0; v.load(); }
    }
    films.forEach(function (v, i) {
      v.addEventListener("ended", function () {
        var next = (i + 1) % films.length;
        show(next, next !== 0);
      });
    });
  })();

  /* The sponsor wall and the merch page are each meant to be taken in at a glance,
     so on a desktop window they are fitted to the frame instead of scrolled. The
     stylesheet already does most of the work; this closes whatever gap is left, and
     it only runs where the wide layout does — a phone still scrolls. */
  (function () {
    var wide = window.matchMedia("(min-width:1100px)"), tries = 3;
    var ONE_SCREEN = [["sponsors", ".sp"], ["merch", ".merch-page"]];
    function fitOne(id, sel) {
      var page = document.querySelector('.page[data-page="' + id + '"]');
      if (!page) return;
      var wrap = page.querySelector(".pg-wrap"), block = page.querySelector(sel);
      if (!wrap || !block) return;
      block.style.zoom = "";
      if (!wide.matches || page.hasAttribute("inert")) return;
      /* several passes: zooming the block changes the overflow it was measured from */
      for (var i = 0; i < tries; i++) {
        var over = wrap.scrollHeight - wrap.clientHeight;
        if (over <= 0) return;
        var tall = block.getBoundingClientRect().height;
        if (!tall) return;
        block.style.zoom = (parseFloat(block.style.zoom) || 1) * Math.max(0.72, (tall - over) / tall);
      }
    }
    function fit() { ONE_SCREEN.forEach(function (p) { fitOne(p[0], p[1]); }); }
    fit();
    window.addEventListener("hashchange", function () { setTimeout(fit, 0); });
    window.addEventListener("resize", fit);
    window.addEventListener("load", fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  })();

  /* Slide the segmented control's filled block to whichever segment is open. The
     measurement has to be redone whenever the control changes size or appears — a
     control on a hidden page measures zero, and the day switch is rebuilt from
     scratch every time the day or the set changes. */
  (function () {
    function place(seg) {
      var on = seg.querySelector('[aria-pressed="true"]');
      if (!on) { seg.classList.remove("is-set"); return; }
      var w = on.offsetWidth;
      if (!w) { seg.classList.remove("is-set"); return; }
      var first = seg.firstElementChild;
      seg.style.setProperty("--tw", w + "px");
      seg.style.setProperty("--tx", (on.offsetLeft - (first ? first.offsetLeft : 0)) + "px");
      seg.classList.add("is-set");
    }
    function all() { Array.prototype.forEach.call(document.querySelectorAll(".seg"), place); }
    var watched = new WeakSet();
    function watch() {
      if (!window.ResizeObserver) return;
      Array.prototype.forEach.call(document.querySelectorAll(".seg"), function (seg) {
        if (watched.has(seg)) return;
        watched.add(seg);
        new ResizeObserver(function () { place(seg); }).observe(seg);
      });
    }
    /* the thumb should not fly across the screen the first time a control is drawn */
    function settle() { all(); watch(); }
    document.addEventListener("click", function (e) {
      if (!e.target.closest) return;
      if (e.target.closest(".seg") || e.target.closest("[data-day],[data-set],[data-view],[data-goto]")) {
        setTimeout(settle, 0);
      }
    });
    window.addEventListener("resize", all);
    window.addEventListener("hashchange", function () { setTimeout(settle, 0); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(settle);
    settle();
  })();

})();
