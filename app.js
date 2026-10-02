/* Shared controller: routing, map, strip filters, details and the artists page.
   Each concept calls AITP.app({...}) with hooks for how its detail panel opens and closes. */
(function () {
  var D = window.AITP, esc = D.esc;

  D.app = function (cfg) {
    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var state = { page: null, id: null, cat: null, day: (D.event.days[0] || {}).id, set: "stage", art: { view: "gallery", medium: "All", q: "" } };

    /* slots */
    $$("[data-wordmark]").forEach(function (el) { el.innerHTML = D.wordmark(el.getAttribute("data-wordmark")); });
    $$("[data-nav-slot]").forEach(function (el) { el.innerHTML = D.navLinks(el.getAttribute("data-nav-slot")); });
    $$("[data-strip-slot]").forEach(function (el) { el.innerHTML = D.strip(); });
    $$("[data-socials-slot]").forEach(function (el) { el.innerHTML = D.socials(el.getAttribute("data-socials-slot")); });
    $$("[data-powered]").forEach(function (el) { el.innerHTML = D.poweredBy(el.getAttribute("data-powered")); });
    $$("[data-icon]").forEach(function (el) { el.innerHTML = D.icon[el.getAttribute("data-icon")] || ""; });
    $$("[data-venue]").forEach(function (el) { el.textContent = D.event.venue + ", " + D.event.town; });
    function renderBody(p) {
      var el = $('[data-page-body="' + p + '"]');
      /* the artists page fills its own body (it re-renders on every keystroke) */
      if (el && D.pages[p]) el.innerHTML = D.pages[p](state);
      /* a page whose sub-sections are chosen from the strip along the foot of the
         screen draws that strip beside the body, outside the scrolling wrap */
      var foot = $('[data-page-foot="' + p + '"]');
      if (foot && D.foot[p]) foot.innerHTML = D.foot[p](state);
    }
    ["artists", "music", "parking", "visit", "sponsors", "team", "volunteer", "explore", "merch", "contact"].forEach(renderBody);
    function syncViews() {
      var cur = state.art.view;
      $$("[data-view]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-view") === cur)); });
      $$("[data-goto]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-goto") === state.page)); });
    }
    var artBody = $('[data-page-body="artists"]');
    function renderArtists(full) {
      if (!artBody) return;
      if (full) artBody.innerHTML = D.pages.artistsShell(state.art);
      $("[data-art-results]", artBody).innerHTML = D.pages.artistsResults(state.art);
    }
    renderArtists(true);

    /* map */
    var host = $(cfg.mapHost);
    var map = D.mountMap(host, {
      ground: true,
      onSelect: function (it) { go("map/" + it.id); },
      tip: cfg.tip || function (it) {
        return (it.code ? "<b>" + esc(it.code) + "</b>" : "") + esc(it.title) + (it.kind === "booth" ? "<i>" + esc(it.sub) + "</i>" : "");
      }
    });
    var spotted = false, pendingSpot = null;   /* a group of places is lit up; a place is waiting to be */
    var pz = D.panZoom(map, host);

    function setCat(cat) {
      state.cat = cat;
      $$("[data-cat]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-cat") === cat)); });
      document.body.classList.toggle("has-cat", !!cat);
      map.spotlight(cat ? D.items.filter(function (i) { return i.cat === cat; }).map(function (i) { return i.id; }) : null);
      if (cfg.onCat) cfg.onCat(cat);
    }

    /* routing */
    function go(path) {
      if (location.hash.slice(1) === path) route();
      else location.hash = path;
    }
    function route() {
      var parts = location.hash.slice(1).split("/");
      /* optional aliases let an old page id (e.g. "parking") open as a section inside a combined page */
      var key = parts[0], section = null, alias = cfg.alias || {};
      if (alias[key]) { section = key; key = alias[key]; }
      var page = $('.page[data-page="' + key + '"]') ? key : "map";
      var id = parts[1] && D.item(parts[1]) ? parts[1] : null;
      var prev = state.page;
      if (page !== prev) {
        /* only the page sections — <body> also carries data-page (for styling) and must never go inert */
        $$(".page[data-page]").forEach(function (s) {
          var on = s.getAttribute("data-page") === page;
          s.classList.toggle("is-active", on);
          if (on) s.removeAttribute("inert"); else s.setAttribute("inert", "");
        });
        var navKey = { music: "artists", team: "sponsors" }[page] || page;
        $$("[data-nav]").forEach(function (a) {
          if (a.getAttribute("data-nav") === navKey) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
        });
        document.body.setAttribute("data-page", page);
        state.page = page;
        if (cfg.showPage) cfg.showPage(page, prev);
        var sc = $('.page[data-page="' + page + '"] [data-scroll]') || $('.page[data-page="' + page + '"]');
        if (sc) sc.scrollTop = 0;
      }
      showSection(page, section || key);
      syncViews();
      if (id) openDetail(id);
      else if (state.id) closeDetail();
      /* a "show on map" button asked for a place: light it up once the map is up,
         after any card that was open has been cleared away */
      if (pendingSpot) {
        var ps = pendingSpot, pit = D.item(ps);
        pendingSpot = null;
        if (pit && state.page === "map") { map.select(ps); pz.focus(pit, 0, 0); }
      }
    }
    function showSection(page, want) {
      var secs = $$('.page[data-page="' + page + '"] [data-section]');
      if (!secs.length) return;
      var names = secs.map(function (s) { return s.getAttribute("data-section"); });
      var show = names.indexOf(want) > -1 ? want : names[0];
      secs.forEach(function (s) { s.hidden = s.getAttribute("data-section") !== show; });
      $$('.page[data-page="' + page + '"] [data-sec]').forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-sec") === show));
      });
    }

    function openDetail(id) {
      var it = D.item(id);
      if (!it) { closeDetail(); return; }        /* an old or mistyped link */
      var fresh = state.id !== id;
      state.id = id;
      if (fresh) cfg.openDetail(D.detail.html(it), it);
      map.hideTip();
      if (state.page === "map") {
        if (state.cat && it.cat !== state.cat) setCat(null);
        map.select(id);
        var fx = typeof cfg.focusOffset === "function" ? cfg.focusOffset() : (cfg.focusOffset || 0);
        var fy = typeof cfg.focusOffsetY === "function" ? cfg.focusOffsetY() : (cfg.focusOffsetY || 0);
        pz.focus(it, fx, fy);
      }
    }
    function closeDetail() {
      state.id = null;
      /* the booth stays lit after its card is closed, so a reader who looked one up
         can still see where it was. Opening another one moves the light; asking for
         the whole park again puts it out. */
      if (state.page !== "map") map.clear();
      cfg.closeDetail();
    }

    /* image stepping inside a detail */
    function showImage(root, i) {
      var thumbs = $$("[data-src]", root), main = $("[data-main]", root);
      if (!thumbs.length || !main) return;
      i = (i + thumbs.length) % thumbs.length;
      /* take the next picture's shape before it loads, so the card does not reflow */
      var stage = main.parentNode, ars = stage && stage.getAttribute("data-ars");
      if (ars) stage.style.setProperty("--ar", ars.split(",")[i]);
      main.src = thumbs[i].getAttribute("data-src");
      main.setAttribute("data-index", i);
      thumbs.forEach(function (t, k) { t.setAttribute("aria-pressed", String(k === i)); });
      var c = $("[data-count]", root);
      if (c) c.textContent = (i + 1) + " / " + thumbs.length;
      thumbs[i].scrollIntoView({ block: "nearest", inline: "nearest" });
    }

    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-cat],[data-zoom],[data-open],[data-map],[data-close],[data-view],[data-goto],[data-day],[data-set],[data-sec],[data-spot],[data-lot],[data-mark],[data-lotclose],[data-medium],[data-src],[data-step]");
      if (!t || t.closest(".hs")) {
        /* a click on nothing in particular puts an open card away. Not on a phone,
           where the card fills the screen and the X is the way out; not on the map's
           own hotspots, which open a card of their own; and not at the end of a
           drag, which is how the map gets panned. */
        if (state.id && !map.suppressClick && !e.target.closest("#drawer, .hs") &&
            !window.matchMedia("(max-width:760px)").matches) go(state.page);
        return;
      }
      var root = t.closest(".d") || document;
      if (t.hasAttribute("data-cat")) {
        var c = t.getAttribute("data-cat");
        if (state.id) go(state.page === "map" ? "map" : state.page);
        setCat(state.cat === c ? null : c);
        if (state.page !== "map") go("map");
        pz.fit();
      } else if (t.hasAttribute("data-zoom")) {
        var z = t.getAttribute("data-zoom");
        /* the whole park again: nothing singled out any more */
        if (z === "fit") { map.clear(); if (spotted) { map.spotlight(null); spotted = false; } }
        if (z === "in") pz.zoomIn(); else if (z === "out") pz.zoomOut(); else pz.fit();
      } else if (t.hasAttribute("data-open")) {
        go(state.page + "/" + t.getAttribute("data-open"));
      } else if (t.hasAttribute("data-map")) {
        /* straight to the map with the place lit up — no card in the way of it */
        if (state.cat) setCat(null);
        pendingSpot = t.getAttribute("data-map");
        go("map");
      } else if (t.hasAttribute("data-lotclose")) {
        var pop = $("[data-lotcard]");
        if (pop) pop.hidden = true;
        $$("[data-lot]").forEach(function (g) { g.classList.remove("is-on"); });
      } else if (t.hasAttribute("data-mark")) {
        /* the accessible-parking marker carries its own note */
        var mk = (D.parking.map.marks || []).filter(function (k) { return k.id === t.getAttribute("data-mark"); })[0];
        var pop2 = $("[data-lotcard]");
        var was = t.classList.contains("is-on");
        $$("[data-lot],[data-mark]").forEach(function (g) { g.classList.remove("is-on"); });
        if (pop2 && mk && !was) {
          pop2.innerHTML = D.lotCard(mk);
          pop2.classList.toggle("to-left", mk.x > D.parking.map.w * 0.55);
          pop2.style.left = (mk.x / D.parking.map.w * 100) + "%";
          pop2.style.top = (mk.y / D.parking.map.h * 100) + "%";
          pop2.hidden = false;
          t.classList.add("is-on");
        } else if (pop2) {
          pop2.hidden = true;
        }
      } else if (t.hasAttribute("data-lot")) {
        /* a pin on the parking map: the lot's card opens beside it */
        var code = t.getAttribute("data-lot");
        var lot = D.parking.lots.filter(function (l) { return l.code === code; })[0];
        var spot = (D.parking.map.lots || []).filter(function (l) { return l.code === code; })[0];
        var pop = $("[data-lotcard]");
        var open = t.classList.contains("is-on");
        $$("[data-lot],[data-mark]").forEach(function (g) { g.classList.remove("is-on"); });
        if (pop && lot && spot && !open) {
          pop.innerHTML = D.lotCard(lot);
          pop.classList.toggle("to-left", spot.x > D.parking.map.w * 0.55);
          pop.style.left = (spot.x / D.parking.map.w * 100) + "%";
          pop.style.top = (spot.y / D.parking.map.h * 100) + "%";
          pop.hidden = false;
          t.classList.add("is-on");
        } else if (pop) {
          pop.hidden = true;
        }
      } else if (t.hasAttribute("data-spot")) {
        /* light up a handful of places at once (the parking rules) */
        var ids = t.getAttribute("data-spot").split(",");
        if (state.cat) setCat(null);
        if (state.id) go(state.page === "map" ? "map" : state.page);
        go("map");
        map.spotlight(ids);
        pz.fit();
        spotted = true;
      } else if (t.hasAttribute("data-close")) {
        go(state.page);
      } else if (t.hasAttribute("data-goto")) {
        if (t.hasAttribute("data-set")) { state.set = t.getAttribute("data-set"); renderBody("music"); }
        go(t.getAttribute("data-goto"));
      } else if (t.hasAttribute("data-day")) {
        state.day = t.getAttribute("data-day");
        renderBody("music");
      } else if (t.hasAttribute("data-set")) {
        state.set = t.getAttribute("data-set");
        renderBody("music");
      } else if (t.hasAttribute("data-sec")) {
        go(t.getAttribute("data-sec"));
      } else if (t.hasAttribute("data-view")) {
        state.art.view = t.getAttribute("data-view");
        /* the setting is the site's, so every page that shows it redraws, not just
           the one the reader happened to press it on */
        renderArtists(false);
        renderBody("music");
        if (state.page !== "artists" && state.page !== "music") go("artists");
        syncViews();
      } else if (t.hasAttribute("data-medium")) {
        state.art.medium = t.getAttribute("data-medium");
        $$("[data-medium]").forEach(function (b) { b.setAttribute("aria-pressed", String(b === t)); });
        renderArtists(false);
      } else if (t.hasAttribute("data-src")) {
        showImage(root, +t.getAttribute("data-i"));
      } else if (t.hasAttribute("data-step")) {
        var main = $("[data-main]", root);
        showImage(root, +(main.getAttribute("data-index") || 0) + +t.getAttribute("data-step"));
      }
    });
    document.addEventListener("input", function (e) {
      if (!e.target.matches("[data-q]")) return;
      state.art.q = e.target.value;
      /* the search covers the whole roster — a medium filter would hide matches */
      if (state.art.q.trim() && state.art.medium !== "All") {
        state.art.medium = "All";
        $$("[data-medium]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-medium") === "All")); });
      }
      renderArtists(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { if (state.id) go(state.page); else if (state.page === "map") pz.fit(); }
      if (state.id && (e.key === "ArrowLeft" || e.key === "ArrowRight") && !e.target.closest("input")) {
        var root = document.querySelector(".d");
        var main = root && $("[data-main]", root);
        if (main) showImage(root, +(main.getAttribute("data-index") || 0) + (e.key === "ArrowRight" ? 1 : -1));
      }
    });
    window.addEventListener("hashchange", route);
    route();
    return { go: go, state: state, map: map, pz: pz, setCat: setCat };
  };
})();
