# Poly Orb

Interactive, zero-dependency 3D living polyhedron & orbital satellite generator built with pure HTML5 Canvas and custom 3D projection math.

**Live demo:** <https://enguicode.github.io/poly-orb/>

Every reload generates a new organic 3D entity with its own geometry, color palette, orbital satellites, rings, and breathing cadence — encoded in a reversible DNA seed.

## Features

- **19 Exact 3D Solids (`4` to `80` faces):** Scrub continuously from a Tetrahedron (`4`), Hexahedron (`6`), Octahedron (`8`), Dodecahedron (`12`), and Icosahedron (`20`) through brilliant-cut crystals/gems (`10–72`) up to an 80-face geodesic organic polyform.
- **Reversible 10-hex Seed:** Every entity is a 10-character code (e.g. `afe60f5893`) that packs faces, palette or exact custom color, satellites, rings and breathing; changing any control recomputes it live. Paste a code back to rebuild the exact entity. Older `32c-a87bff-5s-1r-38m` seeds and any free text still open an entity.
- **Shareable links:** `↗ COMPARTIR` shares `https://enguicode.github.io/poly-orb/?seed=<seed>`; `/poly-orb/<seed>` also works (redirected by `404.html`).
- **Tactile 3D Physics:** Drag to spin in 3D with inertia, tap to trigger a reactive shockwave & satellite impulse, and long-press (or click `⛶ MANTENER`) for fullscreen presentation mode.
- **Reactive States:** Preview distinct visual behaviors without altering the entity's identity:
  - **Working:** Syllabic voice-cadence core pulses, radial acoustic wave rings, and satellite trails in the entity's own palette.
  - **Waiting:** Warm amber sonar ripples.
  - **Blocked:** Pulsing crimson warning halo, rotating dashed lock ring, and red alert waves.
  - **Resting:** Slow dimmed breathing and dashed orbital rings.
- **Random Batch Explorer (`LOTE AZAR (12)`):** Inspect 12 simultaneously animated random entities and pick any to fine-tune.
- **Responsive Mobile & Desktop UI:** Adapts smoothly between a `412×915` mobile frame and a two-column desktop studio, with a `MÓVIL / PC` preview toggle. Controls are grouped into **Cuerpo** (shape, color with palettes and a free hue bar, breathing) and **Órbita** (satellites, rings), with the code and `↗ Compartir` in one bar.

## Usage

No build step or dependencies required.

1. Open `index.html` directly in any modern browser, **or**
2. Serve locally:
   ```sh
   python3 -m http.server 8080
   ```
   and visit `http://localhost:8080`.

## License

[MIT](LICENSE)
