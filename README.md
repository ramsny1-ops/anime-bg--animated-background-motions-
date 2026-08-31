# anime-bg

**anime-bg** is an enterprise-style open-source collection of **15 flexible anime-inspired background effects** built with HTML, CSS, Canvas 2D, and modern vanilla JavaScript.

The project is intentionally dependency-free at runtime. Every effect is a standalone laboratory with its own `index.html`, `style.css`, `script.js`, and detailed `README.md`.

## Documentation website

Open `docs/index.html` after starting the static server. The documentation website includes professionally designed HTML pages for:

- Project README
- Customization
- Performance
- Contributing
- Architecture
- Accessibility
- Security
- Support
- Roadmap
- Code of conduct

## Effect catalog

| No. | Effect | Category | Description |
| ---: | --- | --- | --- |
| 01 | [Spider Network](effects/01-spider-network/README.md) | Network | Proximity links that respond to pointer pressure. |
| 02 | [Particle Constellation](effects/02-particle-constellation/README.md) | Space | Twinkling stars and constrained constellation links. |
| 03 | [Mouse Gravity](effects/03-mouse-gravity/README.md) | Physics | Attraction, repulsion, friction, and bouncing. |
| 04 | [Particle Trails](effects/04-particle-trails/README.md) | Motion | Persistent trails with steering and fading. |
| 05 | [Neural Network](effects/05-neural-network/README.md) | Network | Layered nodes, weighted links, and pulses. |
| 06 | [Firefly Field](effects/06-firefly-field/README.md) | Atmosphere | Organic wandering light and glow. |
| 07 | [Wave Particles](effects/07-wave-particles/README.md) | Math | Layered sine and cosine wave motion. |
| 08 | [Vortex Particles](effects/08-vortex-particles/README.md) | Physics | Radial pull plus tangential spin. |
| 09 | [Digital Rain](effects/09-digital-rain/README.md) | Cyber | Falling glyph streams with persistence. |
| 10 | [Orbital System](effects/10-orbital-system/README.md) | Space | Multiple attractors and orbital particles. |
| 11 | [Aura Energy Field](effects/11-aura-energy-field/README.md) | Anime | Energy rings, arcs, sparks, and pressure waves. |
| 12 | [Sakura Drift](effects/12-sakura-drift/README.md) | Anime | Procedural petals, wind, sway, rotation, and depth. |
| 13 | [Speed-Line Burst](effects/13-speed-line-burst/README.md) | Anime | Radial speed streaks around a movable focus. |
| 14 | [Spirit Flame](effects/14-spirit-flame/README.md) | Anime | Rising luminous wisps with wind and turbulence. |
| 15 | [Celestial Orbit](effects/15-celestial-orbit/README.md) | Anime | Orbit trails, parallax stars, bodies, and shooting stars. |


## Quick start

```bash
unzip anime-bg.zip
cd anime-bg
bun run verify
bun run serve
```

Then open the local address printed by the static server.

## Professional feature layer

Every effect includes:

- live simulation controls
- effect-specific controls
- primary, accent, and background color customization
- four named presets
- pause and resume
- reset and randomize
- local preset save and load
- JSON configuration export and import
- clipboard configuration copy
- PNG canvas snapshot
- quality scaling for low-power devices
- FPS diagnostics
- frame-time diagnostics
- canvas size and DPR diagnostics
- mouse, pen, and touch-capable Pointer Events
- keyboard shortcuts
- document visibility pause behavior
- responsive resize handling
- clamped delta-time animation

## Repository layout

```text
anime-bg/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── workflows/
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/
│   ├── assets/
│   ├── index.html
│   ├── customization.html
│   ├── performance.html
│   ├── contributing.html
│   ├── architecture.html
│   ├── accessibility.html
│   ├── security.html
│   ├── support.html
│   ├── roadmap.html
│   └── code-of-conduct.html
├── effects/
│   ├── 01-spider-network/
│   ├── 02-particle-constellation/
│   ├── 03-mouse-gravity/
│   ├── 04-particle-trails/
│   ├── 05-neural-network/
│   ├── 06-firefly-field/
│   ├── 07-wave-particles/
│   ├── 08-vortex-particles/
│   ├── 09-digital-rain/
│   ├── 10-orbital-system/
│   ├── 11-aura-energy-field/
│   ├── 12-sakura-drift/
│   ├── 13-speed-line-burst/
│   ├── 14-spirit-flame/
│   └── 15-celestial-orbit/
├── examples/
├── scripts/
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── CUSTOMIZATION.md
├── PERFORMANCE.md
├── ROADMAP.md
├── SECURITY.md
├── SUPPORT.md
├── LICENSE
├── index.html
├── main.css
├── main.js
└── package.json
```

## Flexible customization

The core configuration pattern remains readable:

```js
const DEFAULTS = Object.freeze({
  particleCount: 160,
  speed: 1,
  particleSize: 2,
  intensity: 1,
  particleColor: "#f7f8ff",
  accentColor: "#8c73ff",
  backgroundColor: "#08090c",
  pointerEnabled: true
});
```

Each effect then adds parameters appropriate to its own simulation.

## Rendering quality

The internal Canvas resolution is independent from layout size. Users can select Low, Medium, High, or Ultra. Effective device-pixel ratio is clamped to protect memory and fill-rate cost.

## Design philosophy

1. Standalone before clever abstraction.
2. Browser-native APIs before dependencies.
3. Bounded simulation before uncontrolled visual density.
4. Configurable behavior before hard-coded style.
5. Documentation is part of the implementation.
6. Decorative effects must never carry essential information.
7. Performance controls belong in the product, not only in comments.

## Verification

```bash
bun run verify
```

The verifier checks the 15 effect folders, required files, DOM selector contracts, documentation thresholds, root documentation pages, and JavaScript syntax.

## Contributing

Read both [`CONTRIBUTING.md`](CONTRIBUTING.md) and the designed [`docs/contributing.html`](docs/contributing.html) guide before submitting changes.

## Security

See [`SECURITY.md`](SECURITY.md) and [`docs/security.html`](docs/security.html).

## License

MIT. See [`LICENSE`](LICENSE).
