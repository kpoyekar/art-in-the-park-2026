/* Page and detail renderers shared by the three site concepts. Each returns an HTML string. */
(function () {
  var D = window.AITP, esc = D.esc;
  var MED = { Painting: "mustard", Drawing: "mustard", Photography: "sky", Glass: "sky", Jewelry: "coral", Fiber: "coral", Ceramics: "green", Wood: "green", "Mixed Media": "green" };

  /* the filters name what they light up; none of them carry a count */
  D.cats = [
    { id: "artists", label: "Artists", color: "coral" },
    { id: "food", label: "Food & Drink", color: "mustard" },
    { id: "stage", label: "Shows & Demos", color: "sky" },
    { id: "info", label: "Park Info", color: "green" }
  ];

  var ICON = {
    /* the f is drawn sitting on a baseline: its ink runs 4.3–22 in the 24 box, so on its
       own it lands low and short beside Instagram's square. The group re-centers it and
       brings it up to the same 18.6 of height the square carries with its stroke. */
    facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><g transform="translate(12 12) scale(1.05) translate(-12.1 -13.15)"><path fill="currentColor" d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.6 1.6-1.6h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.3H7.4V14h2.8v8z"/></g></svg>',
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/></svg>',
    web: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3c2.6 2.8 2.6 15.2 0 18M12 3c-2.6 2.8-2.6 15.2 0 18" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>',
    out: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H5.5A1.5 1.5 0 0 0 4 6.5v12A1.5 1.5 0 0 0 5.5 20h12a1.5 1.5 0 0 0 1.5-1.5V14M14 4h6v6M20 4l-9 9" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8.5 7.3a3.5 3.5 0 0 1 7 0v.5h2.2a1.1 1.1 0 0 1 1.1 1l.9 10.4a1.7 1.7 0 0 1-1.7 1.8H6a1.7 1.7 0 0 1-1.7-1.8l.9-10.4a1.1 1.1 0 0 1 1.1-1h2.2zm1.9.5h3.2v-.5a1.6 1.6 0 0 0-3.2 0z"/></svg>',
    car: '<svg viewBox="0 0 24 24" aria-hidden="true" fill-rule="evenodd"><path fill="currentColor" d="M5.6 11.2 7 7.4A2.7 2.7 0 0 1 9.5 5.6h5a2.7 2.7 0 0 1 2.5 1.8l1.4 3.8h.4A1.7 1.7 0 0 1 20.5 13v3.1a1.2 1.2 0 0 1-1.2 1.2h-.6v.6a1.4 1.4 0 0 1-2.7 0v-.6H8v.6a1.4 1.4 0 0 1-2.7 0v-.6h-.6a1.2 1.2 0 0 1-1.2-1.2V13a1.7 1.7 0 0 1 1.7-1.8zm2.1 0h8.6l-1.1-3a1 1 0 0 0-.9-.6H9.7a1 1 0 0 0-.9.6zM7 13.2a1.4 1.4 0 1 0 1.4 1.4A1.4 1.4 0 0 0 7 13.2zm10 0a1.4 1.4 0 1 0 1.4 1.4 1.4 1.4 0 0 0-1.4-1.4z"/></svg>',
    fork: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.1 2.6v5.1a.7.7 0 0 1-1.4 0V2.6H3.3v5.4a2.2 2.2 0 0 0 1.7 2.1v11.3h1.9V10.1a2.2 2.2 0 0 0 1.7-2.1V2.6H7.2v5.1a.7.7 0 0 1-1.1 0zM17 2.6c-1.9 0-3 2.6-3 5.9 0 2.6.7 4.2 1.8 4.7v8.2h1.9V2.6z"/></svg>',
    bed: '<svg viewBox="0 0 24 24" aria-hidden="true" fill-rule="evenodd"><path fill="currentColor" d="M2.6 5.6h2.1v6.9h13.6a3 3 0 0 1 3 3v4.9h-2.1v-2.4H4.7v2.4H2.6zm3.9 2.6h3.6a2.1 2.1 0 0 1 0 4.2H6.5z"/></svg>',
    building: '<svg viewBox="0 0 24 24" aria-hidden="true" fill-rule="evenodd"><path fill="currentColor" d="M11.6 2.2 4.4 6v14.1H1.9v1.9h20.2v-1.9h-2.5V6zM7.5 9.1h2.2v2.2H7.5zm4.8 0h2.2v2.2h-2.2zM7.5 13.6h2.2v2.2H7.5zm4.8 0h2.2v2.2h-2.2z"/></svg>',
    tree: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.2 5.6 11.5h3.1l-4.3 6.4h6.6v3.9h2v-3.9h6.6l-4.3-6.4h3.1z"/></svg>',
    frame: '<svg viewBox="0 0 24 24" aria-hidden="true" fill-rule="evenodd"><path fill="currentColor" d="M2.6 3.4h18.8v14.2H2.6zm2 2v10.2h14.8V5.4zM1.6 19.5h20.8v2.1H1.6z"/></svg>',
    map: '<svg viewBox="0 0 24 24" aria-hidden="true" fill-rule="evenodd"><path fill="currentColor" d="M9 2.6 2.4 4.9v16.5L9 19.1l6 2.1 6.6-2.3V2.4L15 4.7zM8 5.4v11.6l-3.6 1.3V6.6zm2 0 4 1.4v11.6l-4-1.4zm6 1.4 3.6-1.3v11.7L16 18.4z"/></svg>',
    grid: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3.2 3.2h8v8h-8zm9.6 0h8v8h-8zM3.2 12.8h8v8h-8zm9.6 0h8v8h-8z"/></svg>',
    rows: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3.2 4.6h3.6v3.6H3.2zm5.6.7h12v2.2h-12zM3.2 10.2h3.6v3.6H3.2zm5.6.7h12v2.2h-12zM3.2 15.8h3.6v3.6H3.2zm5.6.7h12v2.2h-12z"/></svg>',
    palette: '<svg viewBox="0 0 24 24" aria-hidden="true" fill-rule="evenodd"><path fill="currentColor" d="M12 2.6a9.4 9.4 0 0 0 0 18.8 1.9 1.9 0 0 0 1.9-1.9 1.8 1.8 0 0 0-.5-1.3 1.8 1.8 0 0 1 1.3-3.1h2.2a5.6 5.6 0 0 0 5.5-5.6c0-3.8-4.7-6.9-10.4-6.9zM6.9 12.7a1.6 1.6 0 1 1 1.6-1.6 1.6 1.6 0 0 1-1.6 1.6zm2.7-4.4a1.6 1.6 0 1 1 1.6-1.6 1.6 1.6 0 0 1-1.6 1.6zm5.2 0a1.6 1.6 0 1 1 1.6-1.6 1.6 1.6 0 0 1-1.6 1.6z"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 2.4 2.9 6.2 6.7.9-4.9 4.7 1.2 6.7L12 17.7l-5.9 3.2 1.2-6.7-4.9-4.7 6.7-.9z"/></svg>',
    compass: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.4A9.6 9.6 0 1 0 21.6 12 9.6 9.6 0 0 0 12 2.4zm4.2 5.4-2.4 5.6a1.4 1.4 0 0 1-.8.8l-5.6 2.4a.6.6 0 0 1-.8-.8l2.4-5.6a1.4 1.4 0 0 1 .8-.8l5.6-2.4a.6.6 0 0 1 .8.8zM12 10.6a1.4 1.4 0 1 0 1.4 1.4A1.4 1.4 0 0 0 12 10.6z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 6.4A1.4 1.4 0 0 1 4.4 5h15.2A1.4 1.4 0 0 1 21 6.4v.5l-9 5.3-9-5.3zM3 9.1l8.5 5a1 1 0 0 0 1 0l8.5-5v8.5a1.4 1.4 0 0 1-1.4 1.4H4.4A1.4 1.4 0 0 1 3 17.6z"/></svg>',
    hand: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7.4 10.6V4.9a1.3 1.3 0 0 1 2.6 0v5.1h.8V3.3a1.3 1.3 0 0 1 2.6 0v6.7h.8V4.6a1.3 1.3 0 0 1 2.6 0v6.9h.8V7.9a1.2 1.2 0 0 1 2.4 0v6.4c0 4-2.7 6.9-6.6 6.9-3.1 0-4.9-1.3-6.4-3.6l-2.6-4a1.3 1.3 0 0 1 1.9-1.7z"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21s-7.6-4.7-9.7-9.2C.6 8.2 2.6 4.5 6.2 4.5c2 0 3.2 1 3.8 1.9l2 2.9 2-2.9c.6-.9 1.8-1.9 3.8-1.9 3.6 0 5.6 3.7 3.9 7.3C19.6 16.3 12 21 12 21z"/></svg>',
    people: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8.6" cy="8" r="3.4" fill="currentColor"/><circle cx="16.4" cy="9.2" r="2.7" fill="currentColor"/><path fill="currentColor" d="M2.6 19.4c0-3.3 2.7-5.6 6-5.6s6 2.3 6 5.6z"/><path fill="currentColor" d="M15.2 13.9c2.9-.5 6.2 1.3 6.2 4.6v.9h-5.1c0-2.1-.4-4-1.1-5.5z"/></svg>'
  };

  /* a tilted marker tile, the booth-number shape, used to label a section */
  function tile(icon, color) { return '<span class="m-tile c-' + color + '" aria-hidden="true">' + icon + "</span>"; }
  /* the way to a place on the map, said in words */
  function goBtn(id, label, cls) {
    return '<button class="d-btn ' + (cls || "d-goto") + '" data-map="' + id + '">' + ICON.pin + esc(label) + "</button>";
  }
  D.icon = ICON;

  D.wordmark = function (cls) {
    return '<span class="wm ' + (cls || "") + '"><span class="sr-only">Art in the Park 2026</span>' +
      '<span class="wm-w wm-1" aria-hidden="true">ART</span> <span class="wm-w wm-2" aria-hidden="true">iN THe</span> ' +
      '<span class="wm-w wm-3" aria-hidden="true">PaRK</span> <span class="wm-w wm-4" aria-hidden="true">2026</span></span>';
  };
  /* the studio behind the site. The mark is drawn in currentColor so it takes the
     festival's own cream wherever it sits, rather than the kit's warmer one. */
  D.poweredBy = function (cls) {
    return '<a class="pwr ' + (cls || "") + '" href="https://www.studiok8ki.com" target="_blank" rel="noopener" aria-label="Site by K8Ki Studio">' +
      '<span class="pwr-by">Powered by</span>' +
      '<svg class="pwr-mark" viewBox="0 0 346.8 95.9" fill="currentColor" aria-hidden="true">' +
      '<path d="M0,0v95.4h44.7v-49.3C44.7,21.1,24.8.8,0,0Z"/>' +
      '<path d="M50.7,50.8v44.6h44.8v-1.7c-1.6-23.6-20.9-42.3-44.8-42.9h0Z"/>' +
      '<path d="M50.7,0v44.7c23.8-.7,43.1-19.4,44.8-42.9V.1h-44.8v-.1Z"/>' +
      '<path d="M100.7,0v.7c1.9,24.7,22.5,44.2,47.7,44.2S194.2,25.4,196.1.7V0h-95.5.1Z"/>' +
      '<path d="M148.4,50.5c-25.2,0-45.8,19.5-47.7,44.2v.7h95.5v-.7c-1.9-24.7-22.5-44.2-47.7-44.2h-.1Z"/>' +
      '<path d="M201.8.5v95.4h44.7v-49.3c0-25-19.9-45.3-44.7-46.1Z"/>' +
      '<path d="M252.5,51.2v44.7h44.8v-1.7c-1.6-23.6-20.9-42.3-44.8-42.9h0v-.1Z"/>' +
      '<path d="M252.5,45.1c23.8-.7,43.1-19.4,44.8-42.9V.5h-44.8v44.7h0v-.1Z"/>' +
      '<path d="M302.1,46.7v49.2h44.7V.5c-24.8.8-44.7,21.1-44.7,46.1h0v.1Z"/>' +
      "</svg></a>";
  };
  D.socials = function (cls) {
    return '<ul class="socials ' + (cls || "") + '">' + D.social.map(function (s) {
      return '<li><a href="' + s.url + '" target="_blank" rel="noopener" aria-label="' + (s.type === "web" ? "Website" : s.label) + '">' + ICON[s.type] + "</a></li>";
    }).join("") + "</ul>";
  };
  D.photosExtra = { carShow: "assets/extras/car-show.jpg", ceramics: "assets/extras/ceramics.jpg" };

  var VIEW_MARK = { gallery: ICON.grid, list: ICON.rows };
  D.viewSwitch = function (view) {
    return [["gallery", "Gallery"], ["list", "List"]].map(function (v) {
      return '<button data-view="' + v[0] + '" aria-pressed="' + (v[0] === view) + '">' +
        VIEW_MARK[v[0]] + "<span>" + v[1] + "</span></button>";
    }).join("");
  };
  var CAT_MARK = { artists: ICON.palette, food: ICON.fork, stage: "\u266a", info: ICON.pin };
  D.strip = function () {
    return '<div class="strip" role="group" aria-label="Light up part of the map">' + D.cats.map(function (c) {
      return '<button class="strip-seg c-' + c.color + '" data-cat="' + c.id + '" aria-pressed="false">' +
        '<span class="strip-i" aria-hidden="true">' + (CAT_MARK[c.id] || "") + '</span><span class="strip-l">' + c.label + "</span></button>";
    }).join("") + "</div>";
  };
  /* each page carries the same mark in the menu as it does on the page itself */
  var NAV_MARK = { map: ICON.pin, artists: ICON.palette, visit: ICON.compass, sponsors: ICON.heart, merch: ICON.bag, contact: ICON.mail };
  D.navLinks = function (cls) {
    var mark = cls === "mnav-link";
    return D.nav.map(function (n) {
      var c = (cls || "") + (n.color ? " c-" + n.color : "") + (n.external ? " is-out" : "");
      var m = mark ? '<span class="mnav-i" aria-hidden="true">' + (NAV_MARK[n.id] || "") + "</span>" : "";
      return n.external
        ? '<a class="' + c + '" href="' + n.url + '" target="_blank" rel="noopener">' + m + n.label + '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></a>'
        : '<a class="' + c + '" href="#' + n.id + '" data-nav="' + n.id + '">' + m + n.label + "</a>";
    }).join("");
  };

  function linkList(list) {
    var KIND = { web: "Web", instagram: "Instagram", facebook: "Facebook", tiktok: "TikTok", name: "Business name" };
    if (!list || !list.length) return "";
    return '<ul class="d-links">' + list.map(function (l) {
      var k = "<em>" + KIND[l.type] + "</em>";
      return "<li>" + (l.url ? '<a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + k + esc(l.label) + "</a>" : "<span>" + k + esc(l.label) + "</span>") + "</li>";
    }).join("") + "</ul>";
  }
  function members(list) {
    return list.map(function (c) {
      return '<li class="member"><div class="member-photo">' + (c.photo ? '<img src="' + c.photo + '" alt="" loading="lazy">' : '<span class="member-art">' + D.wordmark("wm-tile") + "</span>") +
        '</div><p class="member-name">' + esc(c.name) + "</p>" + (c.role ? '<p class="member-role">' + esc(c.role) + "</p>" : "") + "</li>";
    }).join("");
  }
  /* photo grids read best with no half-empty last row: pick column counts that divide the set */
  function evenCols(n) {
    function fit(want) { for (var c = want; c >= 2; c--) if (n % c === 0) return c; return want; }
    return "--cw:" + fit(8) + ";--cm:" + fit(4) + ";--cn:" + fit(2);
  }

  function group(name) { return D.committee.filter(function (c) { return name === "volunteer" ? c.group === "volunteer" : c.group !== "volunteer"; }); }

  /* one line of a schedule in the map panel: picture on the left, time and name beside it */
  function schedRow(photo, when, title, by) {
    var text = "<time>" + when + "</time><b>" + esc(title) + (by ? "<small>" + esc(by) + "</small>" : "") + "</b>";
    return photo
      ? '<li class="has-photo"><img class="act-photo" src="' + photo + '" alt="' + esc(title) + '" loading="lazy"><div>' + text + "</div></li>"
      : "<li>" + text + "</li>";
  }
  function slots(day) {
    return D.music[day].map(function (s) { return schedRow(s.photo, D.span(s.start, s.end), s.act, ""); }).join("");
  }
  function dayLabel(d) { return d.label + " · " + d.date; }

  /* photo sliders crop to fill one frame shaped by the tallest picture in the set */
  function stageAR(r) { return r ? ' style="aspect-ratio:' + r + '"' : ""; }

  /* artwork gets a frame per picture: the shapes are measured at build time, so the
     frame takes the next one before it loads and nothing floats in empty space */
  function stageShape(ars) {
    return ars && ars.length ? ' style="--ar:' + ars[0] + '" data-ars="' + ars.join(",") + '"' : "";
  }

  /* one photo sits on its own; several become the same slider the artwork uses */
  function photoFig(o) {
    var ps = o.photos || (o.photo ? [o.photo] : []);
    var n = ps.length, alt = esc(o.name);
    if (!n) return "";
    if (n === 1) return '<figure class="d-photo"><img src="' + ps[0] + '" alt="' + alt + '" loading="lazy"></figure>';
    return '<figure class="d-gallery d-shots"><div class="d-stage"' + stageAR(o.stage) + '>' +
      '<img class="d-main" data-main data-index="0" src="' + ps[0] + '" alt="' + alt + ', photo 1 of ' + n + '">' +
      '<button class="d-step d-prev" data-step="-1" aria-label="Previous photo">\u2039</button>' +
      '<button class="d-step d-next" data-step="1" aria-label="Next photo">\u203a</button>' +
      '<span class="d-count" data-count>1 / ' + n + '</span></div>' +
      '<div class="d-thumbs">' + ps.map(function (src, i) {
        return '<button data-src="' + src + '" data-i="' + i + '" aria-pressed="' + (i === 0) + '" aria-label="Show photo ' + (i + 1) + '"><img src="' + src + '" alt="" loading="lazy"></button>';
      }).join("") + "</div></figure>";
  }

  /* ---------- detail ---------- */
  D.detail = {
    artist: function (a) {
      var n = a.images.length;
      var gallery = n ? '<figure class="d-gallery"><div class="d-stage"' + stageShape(a.ars) + '><img class="d-main" data-main data-index="0" src="' + a.images[0] + '" alt="Artwork by ' + esc(a.name) + ', image 1 of ' + n + '">' +
        (n > 1 ? '<button class="d-step d-prev" data-step="-1" aria-label="Previous image">‹</button><button class="d-step d-next" data-step="1" aria-label="Next image">›</button><span class="d-count" data-count>1 / ' + n + "</span>" : "") + "</div>" +
        (n > 1 ? '<div class="d-thumbs">' + a.images.map(function (src, i) {
          return '<button data-src="' + src + '" data-i="' + i + '" aria-pressed="' + (i === 0) + '" aria-label="Show image ' + (i + 1) + '"><img src="' + src + '" alt="" loading="lazy"></button>';
        }).join("") + "</div>" : "") + "</figure>" : '<div class="d-noimg c-' + MED[a.medium] + '"><span>' + esc(a.name) + "</span></div>";
      var prev = D.artists[a.booth - 2], next = D.artists[a.booth];
      return '<article class="d d-artist c-' + MED[a.medium] + '">' +
        '<header class="d-head"><span class="d-tile">' + a.booth + '</span><div><p class="d-eyebrow">Booth ' + a.booth + " · " + esc(a.medium) + '</p><h2 class="d-name" id="dTitle">' + esc(a.name) + "</h2>" +
        (a.city ? '<p class="d-city">' + esc(a.city) + "</p>" : "") +
        "</div>" +
        "</header>" + '<div class="d-actions">' + goBtn(a.id, "Show booth " + a.booth + " on the map") + "</div>" + gallery +
        (a.about ? '<h3 class="d-label">In their words</h3><p class="d-text">' + esc(a.about) + "</p>" : "") + linkList(a.links) +
        (a.award ? '<p class="d-award">\u2605 ' + esc(a.award) + "</p>" : "") +
        '<p class="d-vote">★ Loved their work? Write <b>Booth ' + a.booth + "</b> on your People’s Choice ballot at the Main Tent. Voting closes 2 PM Sunday. " +
          '<button class="vote-go" data-map="p-main">' + ICON.pin + "Where is the Main Tent?</button></p>" +
        '<nav class="d-walk" aria-label="Neighboring booths">' +
        (prev ? '<button data-open="' + prev.id + '"><small>← Booth ' + prev.booth + "</small>" + esc(prev.name) + "</button>" : "<span></span>") +
        (next ? '<button data-open="' + next.id + '"><small>Booth ' + next.booth + " →</small>" + esc(next.name) + "</button>" : "<span></span>") + "</nav></article>";
    },
    food: function (f) {
      var word = { food: "Culinary vendor", beer: "Beer", wine: "Wine" }[f.kind];
      return '<article class="d d-food c-mustard"><header class="d-head"><span class="d-tile d-round k-' + f.kind + '">' + esc(f.code) + '</span><div><p class="d-eyebrow">' + word + " · " + esc(f.serves) + '</p><h2 class="d-name" id="dTitle">' + esc(f.name) + "</h2>" +
        (f.town ? '<p class="d-city">' + esc(f.town) + "</p>" : "") + "</div>" + "</header>" +
        '<div class="d-actions">' + goBtn(f.id, "Show " + f.name + " on the map") + "</div>" +
        photoFig(f) +
        '<h3 class="d-label">Where</h3><p class="d-text">' + esc(f.where) + "</p>" +

        '<h3 class="d-label">Food &amp; drink</h3><ul class="d-mini d-others">' + D.food.map(function (o) {
          var here = o.id === f.id;
          return '<li' + (here ? ' class="is-here"' : "") + '><button data-open="' + o.id + '"' + (here ? ' aria-current="true"' : "") + '><span class="d-dot k-' + o.kind + '">' + esc(o.code) + "</span><b>" + esc(o.name) + "</b><small>" + esc(o.serves) + (o.town ? " · " + esc(o.town) : "") + "</small></button></li>";
        }).join("") + "</ul>" +
        '<p class="d-note">Tag your favorite food vendors: <b>@artintheparkelkader</b></p></article>';
    },
    place: function (p) {
      var extra = "";
      if (p.schedule === "music") extra = D.event.days.map(function (d) { return '<h3 class="d-label">' + dayLabel(d) + '</h3><ol class="d-sched">' + slots(d.id) + "</ol>"; }).join("");
      if (p.schedule === "wellness") extra = '<ol class="d-sched">' + D.wellness.map(function (w) {
        return schedRow(w.photo, (w.day === "sat" ? "Sat " : "Sun ") + D.clock(w.start), w.title, w.by);
      }).join("") + "</ol>";
      /* a place that takes some doing spells it out in numbered steps */
      var steps = (p.steps || []).length ? '<ol class="d-steps">' + p.steps.map(function (t) {
        return "<li><b>" + esc(t[0]) + "</b><span>" + esc(t[1]) + "</span></li>";
      }).join("") + "</ol>" : "";
      if (p.list === "food") extra = '<ul class="d-mini">' + D.food.map(function (f) { return '<li><button data-open="' + f.id + '"><span class="d-dot">' + esc(f.code) + "</span><b>" + esc(f.name) + "</b><small>" + esc(f.serves) + "</small></button></li>"; }).join("") + "</ul>";
      var color = { stage: "sky", info: "green", food: "mustard" }[p.cat];
      return '<article class="d d-place c-' + color + '"><header class="d-head"><span class="d-tile d-soft">★</span><div><p class="d-eyebrow">Around the park</p><h2 class="d-name" id="dTitle">' + esc(p.name) + "</h2></div></header>" +
        '<div class="d-actions">' + goBtn(p.id, "Show " + p.name + " on the map", "d-btn") + "</div>" +
        '<p class="d-text">' + esc(p.blurb) + "</p>" + steps + photoFig(p) + extra + "</article>";
    },
    demo: function (w) {
      var day = D.event.days.filter(function (x) { return x.id === w.day; })[0];
      return '<article class="d d-place c-green"><header class="d-head"><span class="d-tile d-soft">\u273f</span><div>' +
        '<p class="d-eyebrow">' + (day ? day.short + " " + day.date + " \u00b7 " : "") + D.clock(w.start) + "</p>" +
        '<h2 class="d-name" id="dTitle">' + esc(w.title) + "</h2>" +
        (w.by ? '<p class="d-city">' + esc(w.by) + "</p>" : "") + "</div></header>" +
        '<div class="d-actions">' + goBtn("p-wellness", "Show the area", "d-btn") + "</div>" +
        (w.about ? '<p class="d-text">' + esc(w.about) + "</p>" : "") +
        (w.photo ? '<figure class="d-photo"><img src="' + w.photo + '" alt="' + esc(w.title) + '" loading="lazy"></figure>' : "") +
        "</article>";
    },
    html: function (it) { return it.kind === "booth" ? this.artist(it.data) : it.kind === "food" ? this.food(it.data) : it.kind === "demo" ? this.demo(it.data) : this.place(it.data); }
  };

  /* ---------- pages ---------- */
  /* the day, the three sets and which one is open — shared by the page body and
     the color strip along the foot of the screen */
  /* every stand in the park, drawn like the act cards it sits beside */
  function foodGrid(asList) {
    if (asList) return '<ul class="set-list food-list">' + D.food.map(function (f) {
      return '<li class="k-' + f.kind + '"><span class="sl-mark">' + esc(f.code) + "</span>" +
        "<b>" + esc(f.name) + '</b><span class="sl-by">' + esc(f.serves) + (f.town ? " \u00b7 " + esc(f.town) : "") +
        " \u00b7 " + esc(f.where) + "</span>" + goBtn(f.id, "Show on map", "d-btn") + "</li>";
    }).join("") + "</ul>";
    return '<ul class="act-grid food-grid" style="--cols:4">' + D.food.map(function (f) {
      var shot = f.photo || (f.photos || [])[0];
      return '<li class="food-card k-' + f.kind + '">' +
        (shot ? '<figure class="act-img"><img src="' + shot + '" alt="' + esc(f.name) + '" loading="lazy"></figure>' : "") +
        '<span class="food-code">' + esc(f.code) + '</span><h2 class="food-name">' + esc(f.name) + '</h2>' +
        '<p class="food-serves">' + esc(f.serves) + (f.town ? " \u00b7 " + esc(f.town) : "") + '</p>' +
        '<p class="food-where">' + esc(f.where) + "</p>" + goBtn(f.id, "Show on map", "d-btn") + "</li>";
    }).join("") + "</ul>";
  }

  function musicSets(view) {
    var dayId = (view && view.day) || D.event.days[0].id;
    var d = D.event.days.filter(function (x) { return x.id === dayId; })[0] || D.event.days[0];
    var statue = { id: "p-abdelkader", when: "Both days", title: "Abdelkader Sculpture", by: "The Emir the town is named for \u2014 a favorite spot for a photo", photo: "assets/event/abdelkader-pose.jpg" };
    var extras = (d.id === "sat"
      ? [{ id: "p-ceramics", when: "10 AM\u20134 PM", title: "Ceramics workshop", by: "Guttenberg Gallery & Creativity Center \u00b7 Art by the River", photo: D.photosExtra.ceramics },
         { id: "p-cars", when: "All day", title: "Concours d\u2019Elegance", by: "Art of the Automobile car show", photo: D.photosExtra.carShow }, statue]
      : [{ id: "p-cars", when: "All day", title: "Concours d\u2019Elegance", by: "Art of the Automobile car show", photo: D.photosExtra.carShow }, statue]);
    var demos = D.wellness.filter(function (w) { return w.day === d.id; })
      .map(function (w) { return { photo: w.photo, mark: "\u273f", when: D.clock(w.start), title: w.title, by: w.by, open: w.id, map: "p-wellness" }; })
      /* everything else going on that day is a demo of a kind, so it sits here too */
      .concat(extras.map(function (e) { return { photo: e.photo, mark: "\u2605", when: e.when, title: e.title, by: e.by, map: e.id }; }));
    var panels = [
      { id: "stage", tab: "Music Stage", color: "sky", mark: "\u266a", note: "Next to the culinary vendors and picnic seating", map: ["p-music", "Show the Music Stage"],
        acts: (D.music[d.id] || []).map(function (s) { return { photo: s.photo, mark: "\u266a", when: D.span(s.start, s.end), title: s.act }; }) },
      /* the stands are the same both days, so they sit outside the day filter */
      { id: "food", tab: "Food &amp; Drinks", color: "mustard", mark: ICON.fork,
        note: "Beside the Music Stage and the picnic seating", acts: [], grid: foodGrid, always: true },
      { id: "wellness", tab: "Wellness &amp; Demo", color: "green", mark: "\u273f",
        note: "In the meadow inside the booth loop, and around the park",
        acts: demos }
    ].filter(function (p) { return p.always || p.acts.length; });
    var here = (view && view.set) || panels[0].id;
    if (!panels.filter(function (p) { return p.id === here; }).length) here = panels[0].id;
    return { day: d, panels: panels, here: here };
  }

  /* the color strip along the foot of a page, built like the map's category filters */
  function footStrip(label, cells) {
    return '<div class="strip" role="group" aria-label="' + label + '">' + cells.map(function (c) {
      return '<button class="strip-seg c-' + c.color + '" ' + c.attr + '="' + c.id + '"' + (c.also || "") + ' aria-pressed="' +
        (c.on ? "true" : "false") + '">' + (c.mark ? '<span class="strip-i">' + c.mark + "</span>" : "") +
        '<span class="strip-l">' + c.label + "</span></button>";
    }).join("") + "</div>";
  }
  var ARTIST_CELL = { attr: "data-goto", id: "artists", color: "coral", label: "Artists", mark: ICON.palette };
  D.foot = {
    music: function (view) {
      var m = musicSets(view);
      return footStrip("What is on", [ARTIST_CELL].concat(m.panels.map(function (p) {
        return { attr: "data-set", id: p.id, color: p.color, label: p.tab, mark: p.mark, on: p.id === m.here };
      })));
    },
    /* the artists sit in the same run of things to see, so they carry the same strip */
    artists: function (view) {
      var m = musicSets(view);
      return footStrip("What is on", [{ attr: "data-goto", id: "artists", color: "coral", label: "Artists", mark: ICON.palette, on: true }]
        .concat(m.panels.map(function (p) {
          return { attr: "data-goto", id: "music", also: ' data-set="' + p.id + '"', color: p.color, label: p.tab, mark: p.mark };
        })));
    }
  };

  function head(kicker, title, lede, tools) {
    return '<header class="pg-head"><div class="pg-titles">' + (kicker ? '<p class="pg-kicker">' + kicker + "</p>" : "") + '<h1 class="pg-title">' + title + "</h1>" +
      (lede ? '<p class="pg-lede">' + lede + "</p>" : "") + "</div>" + (tools || "") + "</header>";
  }
  /* the downtown parking map: streets and the river drawn from OpenStreetMap
     (see _build/parking_map.py), with a numbered button on each public lot */
  function parkingMap(P) {
    var m = P.map, by = {};
    P.lots.forEach(function (l) { by[l.code] = l; });
    function paths(list, attrs) {
      return (list || []).map(function (d) { return "<path " + attrs + ' d="' + d + '"/>'; }).join("");
    }
    return '<section class="pmap"><div class="pmap-wrap"><svg class="pmap-svg" viewBox="0 0 ' + m.w + " " + m.h + '" preserveAspectRatio="xMidYMin meet" role="group" aria-label="Map of public parking in downtown Elkader">' +
      '<rect class="pm-ground" width="' + m.w + '" height="' + m.h + '"/>' +
      paths(m.parks, 'class="pm-park"') + paths(m.water, 'class="pm-water"') +
      (m.river || []).map(function (d) { return '<path class="pm-river" d="' + d + '"/>'; }).join("") +
      paths(m.buildings, 'class="pm-building"') +
      (m.roads || []).map(function (r) { return '<path class="pm-road" stroke-width="' + r.w + '" d="' + r.d + '"/>'; }).join("") +

      (m.river_label ? '<text class="pm-river-label" x="' + m.river_label.x + '" y="' + m.river_label.y +
        '" transform="rotate(' + m.river_label.r + " " + m.river_label.x + " " + m.river_label.y + ')">' + esc(m.river_label.t) + "</text>" : "") +
      (m.labels || []).map(function (l) {
        return '<text class="pm-label" x="' + l.x + '" y="' + l.y + '" transform="rotate(' + l.r + " " + l.x + " " + l.y + ')">' + esc(l.t) + "</text>";
      }).join("") +
      (m.lots || []).map(function (l) {
        var lot = by[l.code] || {};
        return '<g class="pm-pin" role="button" tabindex="0" data-lot="' + l.code + '" aria-label="' + esc(l.code + " " + (lot.name || "")) + '">' +
          (l.d ? '<path class="pm-lot" d="' + l.d + '"/>' : "") +
          '<rect class="pm-tile" x="' + (l.x - 30) + '" y="' + (l.y - 27) + '" width="60" height="54"/>' +
          '<text class="pm-code" x="' + l.x + '" y="' + l.y + '" dy="10">' + l.code + "</text></g>";
      }).join("") +
      (m.marks || []).map(function (k) {
        return '<g class="pm-pin pm-mark" role="button" tabindex="0" data-mark="' + k.id + '" aria-label="' + esc(k.name) + '">' +
          '<rect class="pm-tile pm-tile-mark" x="' + (k.x - 28) + '" y="' + (k.y - 28) + '" width="56" height="56"/>' +
          '<text class="pm-code pm-glyph" x="' + k.x + '" y="' + k.y + '" dy="11">' + k.glyph + "</text></g>";
      }).join("") + "</svg>" +
      '<div class="pmap-pop" data-lotcard hidden></div></div></section>';
  }
  function lotCard(l) {
    if (!l) return "";
    return '<span class="pm-card-code">' + (l.glyph || esc(l.code)) + "</span><div><b>" + esc(l.name) + "</b>" +
      "<span>" + esc(l.where) + "</span>" + (l.walk ? "<em>" + esc(l.walk) + "</em>" : "") +
      (l.note ? '<span class="pm-note">' + esc(l.note) + "</span>" : "") + "</div>" +
      '<button class="pm-pop-x" data-lotclose aria-label="Close">\u00d7</button>';
  }
  D.lotCard = lotCard;

  D.pages = {
    artistsShell: function (st) {
      var tools = '<div class="pg-tools"><label class="pg-search"><span class="sr-only">Search artists</span><input type="search" data-q placeholder="Name, medium or booth #" value="' + esc(st.q) + '"></label>' +
        '<div class="seg view-seg" role="group" aria-label="Choose a view">' + D.viewSwitch(st.view) + "</div></div>";
      var counts = {};
      D.artists.forEach(function (a) { counts[a.medium] = (counts[a.medium] || 0) + 1; });
      var chips = '<div class="chips" role="group" aria-label="Filter by medium">' + ["All"].concat(D.mediums).map(function (m) {
        return '<button class="chip' + (m === "All" ? "" : " c-" + MED[m]) + '" data-medium="' + m + '" aria-pressed="' + (m === st.medium) + '">' + m + " <small>" + (m === "All" ? D.artists.length : counts[m]) + "</small></button>";
      }).join("") + "</div>";
      var vote = '<aside class="vote"><span class="vote-star" aria-hidden="true">★</span><div><b>People’s Choice Award</b><span class="vote-t">Vote for your favorite artist by name or booth number. Ballots are at the Main Tent, and a returned survey earns a free raffle ticket. Voting closes at 2 PM Sunday.</span></div></aside>';
      return head("46 booths · 9 mediums", tile(ICON.palette, "coral") + "Artists", "", tools) + vote + chips + '<div class="pg-body" data-art-results></div>';
    },
    artistsResults: function (st) {
      var q = st.q.trim().toLowerCase();
      var list = D.artists.filter(function (a) {
        if (st.medium !== "All" && a.medium !== st.medium) return false;
        if (!q) return true;
        if (/^\d+$/.test(q)) return String(a.booth) === q;
        return (a.name + " " + a.medium + " " + a.city).toLowerCase().indexOf(q) > -1;
      });
      if (!list.length) return '<p class="empty">No artists match. Try a name, a medium like “glass”, or a booth number from 1 to 46.</p>';
      if (st.view === "gallery") {
        return '<ul class="art-grid">' + list.map(function (a) {
          return '<li><button class="art-card c-' + MED[a.medium] + '" data-open="' + a.id + '"><span class="art-img">' +
            (a.photo || a.images[0] ? '<img src="' + (a.photo || a.images[0]) + '" alt="" loading="lazy">' : '<span class="art-noimg">' + esc(a.name) + "</span>") +
            '<span class="art-n">' + a.booth + "</span>" + (a.images.length > 1 ? '<span class="art-count">' + a.images.length + " photos</span>" : "") +
            (a.award ? '<span class="art-award">\u2605 ' + esc(a.award) + "</span>" : "") + "</span>" +
            '<span class="art-name">' + esc(a.name) + '</span><span class="art-meta">' + esc(a.medium) + (a.city ? " · " + esc(a.city) : "") + "</span></button></li>";
        }).join("") + "</ul>";
      }
      return '<div class="art-cols">' + D.mediums.map(function (m) {
        var rows = list.filter(function (a) { return a.medium === m; });
        if (!rows.length) return "";
        return '<section class="art-col c-' + MED[m] + '"><h2>' + m + "</h2><ul>" + rows.map(function (a) {
          return '<li><button data-open="' + a.id + '"><span class="n">' + a.booth + "</span><b>" + esc(a.name) + "</b>" + (a.city ? '<span class="city">' + esc(a.city) + "</span>" : "") + "</button></li>";
        }).join("") + "</ul></section>";
      }).join("") + "</div>";
    },
    music: function (view) {
      var m = musicSets(view), d = m.day, panels = m.panels, here = m.here;
      /* the day is picked off a pair of the festival's own calendar cards, the same
         object the header and the menu carry, so it reads as choosing a date */
      var MONTH = { Jan: "January", Feb: "February", Mar: "March", Apr: "April", May: "May", Jun: "June",
        Jul: "July", Aug: "August", Sep: "September", Oct: "October", Nov: "November", Dec: "December" };
      var days = '<nav class="jump day-cals" aria-label="Day">' + D.event.days.map(function (x) {
        var bits = x.date.split(" ");
        return '<button class="hcal day-cal" data-day="' + x.id + '" aria-pressed="' + (x.id === d.id) + '">' +
          '<span class="hcal-m">' + (MONTH[bits[0]] || bits[0]) + '</span>' +
          '<span class="hcal-d">' + x.short + " " + bits[1] + '</span>' +
          '<span class="hcal-h">' + D.span(x.open, x.close) + "</span></button>";
      }).join("") + "</nav>";
      var open = panels.filter(function (p) { return p.id === here; })[0];
      var cols = (D.music[d.id] || []).length || 3;
      /* one view setting across the whole site: cards to browse, rows to scan */
      var asList = ((view && view.art) || {}).view === "list";
      /* an act that happens somewhere opens that place's card; the button beside it
         skips the reading and goes straight to the map */
      var cards = open.acts.map(function (a) {
        var body = '<figure class="act-img">' +
          (a.photo ? '<img src="' + a.photo + '" alt="' + esc(a.title) + '" loading="lazy">' : '<span class="act-note">' + a.mark + "</span>") +
          "</figure><time>" + a.when + "</time><h3>" + esc(a.title) + "</h3>" + (a.by ? '<p class="act-by">' + esc(a.by) + "</p>" : "");
        return '<li class="act">' +
          (a.map ? '<button class="act-open" data-open="' + (a.open || a.map) + '">' + body + "</button>" : body) +
          (a.map ? goBtn(a.map, "Show the area", "act-btn") : "") + "</li>";
      }).join("");
      var rows = open.acts.map(function (a) {
        var body = '<span class="sl-mark sl-when">' + a.when + "</span><b>" + esc(a.title) + "</b>" +
          (a.by ? '<span class="sl-by">' + esc(a.by) + "</span>" : "");
        return "<li>" +
          (a.map ? '<button class="sl-open" data-open="' + (a.open || a.map) + '">' + body + "</button>" : body) +
          (a.map ? goBtn(a.map, "Show the area", "d-btn") : "") + "</li>";
      }).join("");
      var body = open.grid ? open.grid(asList)
        : (asList ? '<ul class="set-list">' + rows + "</ul>"
                  : '<ul class="act-grid" style="--cols:' + cols + '">' + cards + "</ul>");
      var panel = '<section class="set-panel c-' + open.color + '">' +
        '<div class="m-head">' + tile(open.mark, open.color) + '<h2 class="card-title">' + open.tab + "</h2></div>" +
        /* the day sits under the title it changes; the view sits on the row of
           controls beside the way to the map */
        (open.grid ? "" : '<div class="set-toggles">' + days + "</div>") +
        '<header class="set-head">' +
        (open.note ? '<p class="set-where">' + esc(open.note) + "</p>" : "") +
        '<div class="seg view-seg" role="group" aria-label="Choose a view">' + D.viewSwitch(asList ? "list" : "gallery") + "</div>" +
        (open.map ? goBtn(open.map[0], open.map[1], "set-btn") : "") +
        '</header>' + body + "</section>";
      return '<h1 class="sr-only">Artists, music, food and demos</h1>' +
        '<div class="pg-body music-page">' + panel + "</div>";
    },
    parking: function () {
      var P = D.parking;
      var lede = P.map && P.map.intro ? P.map.intro : [];
      return '<h1 class="sr-only">Parking</h1><div class="pg-body park-body">' +
        ((P.rules || []).length ? '<ul class="park-rules">' + P.rules.map(function (r) {
          var go = r.places ? ' data-spot="' + r.places.join(",") + '"' : ' data-map="' + r.place + '"';
          var lines = (r.lines || [r.text]).map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("");
          return "<li><h2>" + esc(r.title) + "</h2>" + lines + '<button class="d-btn d-ghost"' + go + ">" + ICON.pin + "Show on map</button></li>";
        }).join("") + "</ul>" : "") +
        (P.map ? parkingMap(P) : "") +
        (lede.length ? '<div class="pm-lede">' + tile(ICON.car, "mustard") +
          "<div><b>" + esc(lede[0]) + "</b>" + (lede[1] ? "<span>" + esc(lede[1]) + "</span>" : "") + "</div></div>" : "") +
        "</div>";
    },
    visit: function () {
      var V = D.visit, C = D.contact;
      var maps = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Founders' Park, 302 S Main St, Elkader, IA 52043");
      /* the town, taken off the address so the heading and the address cannot drift apart */
      var town = V.address.split(",").slice(1).join(",").replace(/\s*\d{5}(-\d{4})?\s*$/, "").trim();
      /* the two films are one block, played in turn: the 2024 film first, the
         aerial after it. The caption changes with whichever is on screen. */
      var films = [];
      if (V.film) films.push({ src: V.film.src, poster: V.film.poster, by: V.film.title });
      if (V.video) films.push({ src: V.video.src, poster: V.video.poster, by: V.video.credit || "", mute: true });
      var reel = films.length
        ? '<div class="v-reel" data-reel>' + films.map(function (f, i) {
            return "<video" + (i ? " hidden" : "") + (f.mute ? " muted" : "") +
              ' controls playsinline preload="' + (i ? "none" : "metadata") + '" poster="' + f.poster +
              '" data-by="' + esc(f.by) + '"><source src="' + f.src + '" type="video/mp4">' +
              'Your browser cannot play this video. <a href="' + f.src + '">Download it instead</a>.</video>';
          }).join("") + '<p class="v-reel-by" data-reel-by>' + esc(films[0].by) + "</p></div>"
        : '<div class="v-photos">' + V.photos.map(function (q) { return '<img src="' + q + '" alt="" loading="lazy">'; }).join("") + "</div>";
      return head("", "Visit", "") + '<div class="pg-body visit-page"><div class="visit-grid">' + reel +
        '<div class="v-cards">' +
        '<section class="card v-where c-sky"><div class="m-head">' + tile(ICON.pin, "coral") + '<h2 class="card-title">' + V.venue + ", " + town + '</h2></div><p class="v-small">' + V.about + '</p><p class="v-small">' + esc(D.about.tagline) + " " + esc(D.about.honors) + '</p><div class="d-actions"><a class="d-btn" href="' + maps + '" target="_blank" rel="noopener">Get directions</a><a class="d-btn d-ghost" href="#parking">Parking</a></div></section>' +
        "</div></div>" +
        (V.shots && V.shots.length ? '<div class="shots" data-carousel>' +
          '<button class="sc-arrow sc-prev" type="button" data-slide="-1" aria-label="Previous photos">\u2039</button>' +
          '<ul class="sc-track">' + V.shots.map(function (src) {
            return '<li><img src="' + src + '" alt="Art in the Park in Founders\u2019 Park" loading="lazy"></li>';
          }).join("") + "</ul>" +
          '<button class="sc-arrow sc-next" type="button" data-slide="1" aria-label="More photos">\u203a</button></div>' : "") + "</div>";
    },
    merch: function () {
      var M = D.merch;
      /* the heading sits in the buying column beside the line-up, not above it */
      return '<div class="pg-body merch-page">' +
        '<section class="mr-hero"><figure class="mr-hero-shot"><img src="' + M.image + '" alt="' + esc(M.alt) + '"></figure>' +
        '<div class="mr-hero-buy">' + head(M.kicker, tile(ICON.bag, "sky") + M.title, M.lede) +
        '<p class="mr-at">' + esc(M.note) + "</p>" +
        '<a class="d-btn mr-cta" href="' + M.shop.url + '" target="_blank" rel="noopener">' + esc(M.shop.label) + ICON.out + "</a>" +
        '<p class="v-small">' + esc(M.shop.by) + "</p></div></section></div>";
    },
    contact: function () {
      var C = D.contact;
      return '<div class="pg-body contact-body">' +
        /* the picture on one side, the asking on the other — title with the form */
        '<div class="contact-cols"><div class="c-ask">' +
        '<div class="m-head">' + tile(ICON.mail, "green") + '<h2 class="card-title">Questions?</h2></div>' +
        /* the two ways to reach a person come first; the form is for anything longer */
        '<div class="c-reach"><a class="c-reach-item" href="mailto:' + C.email + '"><span>Email</span><b>' + C.email + "</b></a>" +
        '<a class="c-reach-item" href="tel:' + C.phone.replace(/[^\d+]/g, "") + '"><span>Call</span><b>' + C.phone + "</b></a></div>" +
        '<p class="c-org">An event of ' + esc(C.orgFull) + "<br>" + C.address + "</p>" + D.socials("socials-lg") + "</div>" +
        '<div class="c-side">' +
        /* the weekend the rain stopped, beside the practical part */
        '<figure class="c-shot"><img src="assets/event/rainbow-letters.jpg" alt="The denim ART IN THE PARK letters standing on the grass, a rainbow arching over the white vendor tents and the Elkader grain elevator behind them" loading="lazy">' +
        '<figcaption class="c-credit">Photo by Brian Gibbs</figcaption></figure>' +
        "</div></div></div>";
    },
    sponsors: function () {
      var T = D.sponsors;
      function tier(t, big, extra) {
        return '<section class="tier t-' + t.color + (big ? " tier-big" : "") + '"><h2 class="tier-name">' + esc(t.tier) + "</h2>" + (t.range ? '<p class="tier-range">' + esc(t.range) + "</p>" : "") +
          (t.logos.length ? '<div class="tier-logos n' + t.logos.length + '">' + t.logos.map(function (l) { return '<img src="' + l.src + '" alt="' + esc(l.alt) + '" width="' + l.w + '" height="' + l.h + '">'; }).join("") +
            t.names.map(function (n) { return '<span class="tier-word">' + esc(n) + "</span>"; }).join("") + "</div>" : "") +
          (t.note ? '<p class="tier-note">' + esc(t.note) + "</p>" : "") +
          (!t.logos.length && t.names.length ? '<ul class="tier-names' + (t.names.length > 10 ? " cols" : "") + '">' + t.names.map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("") + "</ul>" : "") + (extra || "") + "</section>";
      }
      return head("", tile(ICON.heart, "coral") + "Thank you to our sponsors!", "") + '<div class="pg-body sp">' +
        '<div class="sp-row sp-1">' + T.slice(0, 3).map(function (t) { return tier(t, true); }).join("") + "</div>" +
        '<div class="sp-row sp-2">' + tier(T[3]) + tier(T[4]) +
        '<div class="sp-right">' + tier(T[5]) + tier(T[6], false, '<div class="support-logos">' +
        D.funders.map(function (l) { return '<img src="' + l.src + '" alt="' + esc(l.alt) + '">'; }).join("") + '</div>') + "</div></div>" +
        "</div>";
    },
    /* volunteering is a page of its own, reached from the strip beside Sponsors and Team */
    volunteer: function () {
      return '<div class="pg-body team-page team-vol">' + '<section class="vol c-sky"><header class="vol-head"><div>' +
        '<div class="m-head">' + tile(ICON.hand, "sky") + '<h2 class="card-title">Volunteer with us</h2></div>' +
        '<p class="vol-lede">' + esc(D.volunteer.blurb) + '</p><p class="vol-perk">' + esc(D.volunteer.perk) + "</p></div>" +
        '<div class="d-actions"><a class="d-btn" href="' + D.links.volunteers.url + '" target="_blank" rel="noopener">' + esc(D.links.volunteers.label) + ' →</a></div>' + "</header>" +
        (D.volunteer.photos ? '<ul class="vol-shots">' + D.volunteer.photos.map(function (src) {
          return '<li><img src="' + src + '" alt="Art in the Park volunteers at work" loading="lazy"></li>';
        }).join("") + "</ul>" : "") +
        '<ul class="vol-roles">' + D.volunteer.roles.map(function (r) {
          return "<li><h3>" + esc(r.title) + "</h3><p>" + esc(r.text) + "</p></li>";
        }).join("") + "</ul></section>" + "</div>";
    },
    team: function () {
      return head("An event of the Main Street Elkader Cultural &amp; Entertainment District", tile(ICON.people, "mustard") + "Our Team", "The people who put on Art in the Park.") +
        '<div class="pg-body team-page"><ul class="team" style="' + evenCols(D.committee.length) + '">' + members(D.committee) + "</ul>" +

        '<p class="team-note">Questions? Email <a href="mailto:' + D.contact.email + '">' + D.contact.email + "</a> or call " + D.contact.phone + ".</p></div>";
    },
    explore: function () {
      var X = D.explore, V = D.visit;
      var alleyBy = {};
      var CYCLE = ["green", "mustard", "coral", "sky"], fold = 0;
      function foldColor() { return CYCLE[fold++ % CYCLE.length]; }
      var alsoC = foldColor(), alleyC;
      (X.alley.artists || []).forEach(function (a) { alleyBy[a.name] = a; });
      return '<div class="pg-body ex">' +
        '<div class="ex-split"><div class="ex-top"><header class="pg-head ex-hero" style="--img:url(' + X.photo + ')">' +
        ((X.photos || []).length ? '<div class="ex-shots" data-slides>' + X.photos.map(function (src) {
          return '<img src="' + src + '" alt="" loading="lazy">';
        }).join("") + "</div>" : "") + '<div class="pg-titles"><p class="pg-kicker">A short walk from Founders’ Park</p><h1 class="pg-title">' + tile(ICON.compass, "sky") + 'Explore Elkader</h1><p class="pg-lede">' + esc(X.intro) + "</p>" + (X.photoCredit ? '<p class="ex-credit-shot">' + esc(X.photoCredit) + "</p>" : "") + "</div></header>" +
        '<p class="ex-credit">Listings and details from <a href="' + X.contact.url + '" target="_blank" rel="noopener">elkader-iowa.com</a> \u00b7 ' + X.contact.label + " " + X.contact.phone + "</p>" +
        '</div><div class="ex-folds">' +
        '<details class="card v-also ex-fold c-' + alsoC + '"><summary>' + tile(ICON.star, alsoC) + '<h2 class="card-title">Also this weekend</h2></summary><div class="fold-body v-also-grid">' + V.also.map(function (e) {
          var links = e.links || (e.url ? [{ label: e.link || "Details", url: e.url }] : []);
          return '<div class="v-event"><p class="v-big">' + esc(e.title) + "</p><p>" + esc(e.when) + (e.where ? "<br>" + esc(e.where) : "") + "</p>" +
            (e.blurb ? '<p class="v-small">' + esc(e.blurb) + "</p>" : "") +
            (links.length ? '<p class="v-links">' + links.map(function (l) { return '<a class="v-link" href="' + l.url + '" target="_blank" rel="noopener">' + esc(l.label) + " →</a>"; }).join("") + "</p>" : "") + "</div>";
        }).join("") + "</div></details>" +
        X.directory.map(function (g) {
          var dirMark = { "Eat & drink": ICON.fork, "Shop": ICON.bag, "Stay": ICON.bed }[g.title] || ICON.compass;
          var dirC = foldColor();
          return '<details class="ex-fold c-' + dirC + '"><summary>' + tile(dirMark, dirC) + '<h2 class="card-title">' + esc(g.title) + '</h2></summary><div class="fold-body"><ul class="ex-plain">' + g.items.map(function (i) {
            return '<li><a href="' + i.url + '" target="_blank" rel="noopener">' + esc(i.name) + "</a>" +
              (i.addr ? '<p class="ex-where">' + ICON.pin + esc(i.addr) + "</p>" : "") + "</li>";
          }).join("") + "</ul></div></details>";
        }).join("") +
          X.groups.map(function (g) {
          var mark = { "Downtown & history": ICON.building, "River & trails": ICON.tree, "Museums & day trips": ICON.frame }[g.title] || ICON.compass;
          var grpC = foldColor();
          return '<details class="ex-group ex-fold c-' + grpC + '"><summary>' + tile(mark, grpC) + '<h2 class="card-title">' + esc(g.title) + '</h2></summary><div class="fold-body"><ul class="ex-list">' + g.items.map(function (i) {
            return '<li><h3><a href="' + i.url + '" target="_blank" rel="noopener"' + (i.addr ? ' title="' + esc(i.addr) + ' · opens Google Maps"' : "") + ">" + esc(i.name) + "</a></h3><p>" + esc(i.blurb) + '</p><p class="ex-where">' + ICON.pin + esc(i.where) + "</p></li>";
          }).join("") + "</ul></div></details>";
        }).join("") +
        '<details class="ex-alley ex-fold c-' + (alleyC = foldColor()) + '"><summary>' + tile(ICON.palette, alleyC) + '<h2 class="card-title">' + esc(X.alley.title) + '</h2></summary><div class="fold-body"><p class="ex-alley-lede">' + esc(X.alley.blurb) + "</p>" +
        '<ul class="alley-shots">' + (X.alley.photos || []).map(function (m) {
          var a = alleyBy[m.by] || {};
          var name = a.url ? '<a href="' + a.url + '" target="_blank" rel="noopener">' + esc(m.by) + "</a>" : esc(m.by);
          return '<li><img src="' + m.src + '" alt="Alley mural by ' + esc(m.by) + '" loading="lazy"><b>' + name + "</b>" +
            (a.city ? "<small>" + esc(a.city) + "</small>" : "") + "</li>";
        }).join("") + "</ul></div></details></div></div>" +
        "</div>";
    }
  };
})();
