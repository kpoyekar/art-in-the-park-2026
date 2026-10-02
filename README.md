# Art in the Park 2026 website

A static website. There's no server code or database, so it runs on any web host.

## Look at it on your computer

The fonts and map don't load if you double-click `index.html`, so run a tiny local server from this folder:

```bash
cd "$HOME/Library/CloudStorage/Dropbox/Projects/Art In The Park/AitP 2026/Website" && python3 -m http.server 8770
```

Then open http://localhost:8770 in a browser. Press Ctrl+C in the terminal to stop it.

## What to upload to the web host

Everything in this folder **except** `_build/` and this README.

## What's where

| File | What it holds |
| --- | --- |
| `index.html` | The page: header, tabs, map, pages |
| `data.js` | All content: artists, food, places on the map, music, visit info, sponsors, committee, Elkader listings |
| `pages.js` | How each page and detail panel is laid out |
| `site.css` | All styling |
| `app.js`, `site.js`, `map.js`, `panzoom.js` | Page switching, the clickable map, zoom and drag |
| `assets/` | Map (`map.svg`), artwork, logos, committee photos, page photos, fonts, icons, share image |
| `_build/build_assets.py` | Rebuilds `assets/` from the original files in Dropbox |

Most wording changes happen in `data.js`. After changing any file, bump the `?v=…` numbers at the bottom of `index.html` so visitors don't get an old cached copy. If the map itself is rebuilt, also bump `"src":"assets/map.svg?v=2"` in `data.js`.

## Rebuilding the images

If artist photos, logos or committee photos change in Dropbox:

```bash
cd "$HOME/Library/CloudStorage/Dropbox/Projects/Art In The Park/AitP 2026/Website/_build" && python3 build_assets.py
```

This needs `pip install pillow pillow-heif numpy pymupdf`. It rewrites `assets/` and the artwork lists in `data.js`.

The map (`assets/map.svg`) is drawn from two sources, so it stays sharp at any zoom:

- `2026 AitP Map.ai` in the AitP 2026 folder — the park drawing itself
- `_build/sources/program-page2.pdf` — page 2 of the Canva program, which supplies the labels the drawing doesn't have (Picnic Seating, Culinary Vendors, Dog Park, the food letters, and so on)

The Parking section draws its own downtown map: `_build/parking_map.py` turns one Overpass query (`sources/elkader-overpass.ql`, answer saved as `sources/elkader-osm.json`) into the streets, river, parks and buildings of downtown Elkader, rotates them so the Turkey River runs along the top, and writes the result into `data.js` as `parking.map`. pages.js renders it as an SVG whose nine numbered pins are buttons — tapping one opens a card beside that pin with the lot's name, corner and walk time; two extra markers (accessible parking, loading lot) carry their own notes, and the intro line is drawn in the grass above the water. Nothing north of the river is drawn — the generator clips it away to leave that band clear. Lot positions come from `LOTS` at the top of that script (street corners, points between corners, or a parking area OSM already holds), so nudging a pin is a one-line change followed by `python3 parking_map.py`.

The Explore Elkader hero rotates six town photos saved from mainstreetelkader.org into `_build/sources/elkader/` (`build_elkader()` → `assets/elkader/`), credited on the hero.

The aerial loop on Plan Your Visit is built by `build_video()` from `AitP 2026/Video Clips - Elevated Images` — four four-second pieces joined into a silent 16-second 1280×720 MP4 (about 2 MB) plus a poster frame, written to `assets/video/`. It needs ffmpeg; without it the step is skipped and the page falls back to the photo slideshow (`visit.photos`). Drop `visit.video` from `data.js` to go back to the stills.

The Art in the Alley mural photos are saved from the 2025 site (artintheparkelkader.com/guests) into `_build/sources/murals/`; the script resizes them into `assets/murals/` and the Explore Elkader section credits each artist.

Explore Elkader links straight to Google Maps — the Eat & Drink / Shop / Stay pills and the attractions that have a street address. The addresses came from each business and attraction page on elkader-iowa.com and are stored in `data.js` as `addr`; the link is built from the name plus that address. Update the address and the link together if a place moves. Elkader River Walk and the George Maier Rural Heritage Center have no street address on the source site, so they still link to their elkader-iowa.com page.

Photos for the ceramics workshop and the car show live in `_build/sources/extras/` (any `.jpg`, `.png` or `.webp`); the script crops each one to the picture area and writes `assets/extras/`. They show on the Music & Demo page and inside the map card for those two stops.

Food vendor photos come from the Canva design "AitP Food Vendors 2026" (`DAHUMnQIPGE`), exported as PNGs into `_build/sources/food/`; the script crops the photograph out of each poster.

The program's Food • Beer • Wine list is left out on purpose; the website shows those vendors when a food letter is tapped. If the printed map changes, export page 2 of the Canva program as a PDF again, save it over `program-page2.pdf`, and re-run the script.

## Two things that need a decision at launch

- **Contact form** (Plan Your Visit): with no server behind the site, the form opens the visitor's own email app with the message filled in. If the site ends up on Netlify, Cloudflare Pages or similar, we can switch it to a real form endpoint (and accept attachments) in a few lines — see `AITP.mailtoLink` in `site.js`.
- **Program PDF**: `assets/docs/art-in-the-park-2026-program.pdf` is exported from the Canva program and compressed to about 2 MB. Re-export and replace that file if the program changes.

## Before going live

- **Compression:** turn on gzip/brotli for `.svg` on the web host. The map is 1 MB as text but about 250 KB compressed.
- **Share preview:** once the site has its final address, change `og:image` in `index.html` to the full `https://…/assets/og-image.jpg`.
- **Font license:** Swag Urbano is embedded as a web font. Confirm the license allows web use.
