# Particle Trails

> Persistent motion drawing. A standalone anime-bg effect built with semantic HTML, responsive CSS, Canvas 2D, and dependency-free modern JavaScript.

## Overview

Particles use heading-based movement and smooth steering. A translucent background pass preserves part of previous frames to create trails.

This folder is intentionally independent. You can copy only this directory into another project and keep working without a package install, framework, CDN, API key, or build step.

## What this demo includes

- responsive high-DPI Canvas 2D rendering;
- delta-time animation using `requestAnimationFrame`;
- live particle count, speed, size, and intensity controls;
- particle, accent, and background color customization;
- effect-specific controls: `trailLength, turnRate`;
- pointer and touch-aware interaction;
- pause and resume;
- reset to documented defaults;
- randomize;
- Calm, Balanced, Dense, and Energetic presets;
- rendering quality scaling for slower devices;
- FPS, frame-time, particle-count, canvas-size, pointer, and DPR diagnostics;
- local browser preset save and load;
- JSON configuration export and import;
- configuration copy-to-clipboard;
- PNG canvas snapshot download;
- keyboard shortcuts;
- automatic rendering suspension while the document is hidden.

## Folder structure

```text
04-particle-trails/
├── README.md      Technical guide and integration examples
├── index.html     Standalone laboratory interface
├── style.css      Responsive controls and canvas layout
└── script.js      Simulation, rendering, configuration, and tooling
```

## Quick start

### Option A: open directly

Open `index.html` in a current browser.

### Option B: run the complete repository

From the anime-bg root:

```bash
bun run serve
```

Then open this effect from the gallery.

## Default configuration

The canonical defaults are defined in `script.js`:

```js
const DEFAULTS = Object.freeze({
  particleCount: 90,
    speed: 1.35,
    particleSize: 2.2,
    intensity: 1,
    particleColor: "#f5fbff",
    accentColor: "#55ddff",
    backgroundColor: "#04090f",
    pointerEnabled: true,
    trailLength: 0.1,
    turnRate: 1.2
});
```

`DEFAULTS` is never mutated. The runtime works with a separate object:

```js
const config = { ...DEFAULTS };
```

That small distinction makes reset behavior reliable and keeps the original baseline obvious while experimenting.

## Configuration architecture

The flow is:

```text
UI input
  -> validate and clamp
  -> update config
  -> simulation reads config
  -> frame renders new state
  -> diagnostics update
```

Export serializes only primitive configuration values. Import ignores unknown properties and validates incoming values against the actual HTML controls.

## Runtime controls

### Shared controls

| Control | Purpose |
| --- | --- |
| Particle count | Controls simulation density where applicable |
| Speed | Multiplies movement over time |
| Particle size | Changes visual radius or glyph size |
| Animation intensity | Scales effect-specific movement or response |
| Pointer interaction | Enables or disables pointer-driven behavior |
| Particle color | Primary visible particle color |
| Accent color | Lines, glow, pulse, or secondary visual color |
| Background | Canvas clear color |
| Quality scale | Changes internal canvas pixel density |

### Effect-specific controls

This effect additionally exposes `trailLength, turnRate`. Read the corresponding values in `DEFAULTS` and search for each property in `script.js` to see exactly where it enters the math or drawing logic.

## Presets

The professional shell provides four generic starting points:

```text
Calm       fewer particles, slower motion, lower intensity
Balanced   moderate defaults for general use
Dense      more particles with slightly smaller visual size
Energetic  faster motion and stronger animation intensity
```

Effect-specific settings remain intact unless a preset intentionally changes a shared value.

## Save your own preset

Choose values in the panel and press **Save preset**. The configuration is stored under an effect-specific key in browser `localStorage`.

Load it later with **Load preset**.

This saved preset stays local to that browser profile. It is not uploaded anywhere.

## Export configuration

Press **Export JSON** to download a file similar to:

```json
{
  "project": "anime-bg",
  "effect": "04-particle-trails",
  "schemaVersion": 1,
  "exportedAt": "2026-08-31T00:00:00.000Z",
  "config": {
    "speed": 1,
    "particleColor": "#ffffff",
    "pointerEnabled": true
  }
}
```

The timestamp above is only an example. Real exports use the current browser time.

## Import configuration

Press **Import JSON** and choose a previously exported file. You may also import a plain configuration object:

```json
{
  "speed": 0.6,
  "intensity": 0.8,
  "particleColor": "#eafaff"
}
```

Unknown keys are ignored. Numeric values are clamped to the ranges defined by the HTML inputs.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| Space | Pause or resume |
| R | Reset defaults |
| C | Collapse or show controls |
| S | Save PNG snapshot |
| E | Export JSON configuration |

Shortcuts do not fire while you are typing in an input, select, or editable element.

## Core animation loop

The effect follows a standard browser animation loop:

```js
function loop(time) {
  if (!running) return;

  const delta = clamp((time - lastTime) / 1000, 0, 0.033);
  lastTime = time;

  // Clear or fade the canvas.
  // Update simulation objects.
  // Draw the current frame.
  // Update diagnostics.

  frameId = requestAnimationFrame(loop);
}
```

The delta clamp protects the simulation from a huge position jump after the tab stalls or the device becomes busy.

## Canvas sizing

The CSS canvas size and backing pixel resolution are intentionally separate:

```js
const rect = stage.getBoundingClientRect();
const deviceScale = window.devicePixelRatio || 1;
const dpr = Math.min(deviceScale * qualityScale, 2);

canvas.width = Math.round(rect.width * dpr);
canvas.height = Math.round(rect.height * dpr);
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
```

This gives sharper rendering on high-density screens while allowing the quality control to reduce internal pixels on slower hardware.

## Complexity and performance

Default computational profile: **O(n) particle updates and line draws**.

General optimization order:

1. reduce particle count;
2. reduce quality scale;
3. reduce effect-specific search radius, glow, or connection complexity;
4. simplify drawing operations;
5. profile before replacing readable math with complex optimizations.

The defaults are meant to be visually interesting without assuming a high-end GPU.

## Pointer model

The runtime stores pointer state separately from particle state:

```js
const pointer = {
  x: 0,
  y: 0,
  active: false,
  down: false,
  pointerType: "mouse"
};
```

Effect code decides how to interpret that state. Several effects reverse attraction or direction while the pointer is held down.

## Using the effect as a hero background

Start with a semantic hero:

```html
<section class="hero">
  <canvas id="scene" aria-hidden="true"></canvas>

  <div class="hero-content">
    <p class="eyebrow">Creative technology</p>
    <h1>Your actual page content.</h1>
    <p>The animation supports the content instead of replacing it.</p>
  </div>
</section>
```

```css
.hero {
  position: relative;
  overflow: hidden;
  min-height: 70vh;
  background: #071019;
}

#scene {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero-content {
  position: relative;
  z-index: 1;
}
```

When the canvas is only decorative and you do not need pointer interaction, add:

```css
#scene {
  pointer-events: none;
}
```

## Removing the laboratory UI

The supplied HTML is designed for experimentation. For production, you can remove the panel, but the current script expects its controls to exist.

Two professional integration options are:

1. keep the controls in your development version and hide or remove them only after tuning;
2. extract the simulation section into your own module and replace control reads with your application configuration.

The second option gives the cleanest production integration.

## Programmatic configuration pattern

Inside your own refactor, keep configuration explicit:

```js
const settings = {
  ...DEFAULTS,
  speed: 0.55,
  intensity: 0.7,
  particleColor: "#f4fbff",
  accentColor: "#6adfff"
};
```

Then pass `settings` into your simulation rather than scattering magic numbers through update functions.

## Custom brand palette example

```js
const brandPalette = {
  particleColor: "#f7fbff",
  accentColor: "#7bdcff",
  backgroundColor: "#071019"
};

Object.assign(config, brandPalette);
```

If you are using the supplied panel, update the corresponding controls as well so the UI and runtime stay synchronized.

## Mobile considerations

- the panel moves below the visual region on narrow screens;
- pointer events support touch-capable browsers;
- the quality selector can reduce pixel cost;
- the canvas backing scale is capped;
- controls use native inputs with practical touch sizes.

For a production mobile page, reduce default density further if the effect is decorative.

## Accessibility considerations

Canvas animation should not be the only way important information is communicated.

Keep meaningful text and controls in normal HTML. If the canvas is decorative, mark it `aria-hidden="true"` in your integration. Provide a pause mechanism when continuous motion is significant.

The demo supports keyboard operation and includes `prefers-reduced-motion` styling.

## Security model

This demo does not require network requests, credentials, remote code, or runtime dependencies.

Configuration import reads a user-selected local JSON file. It never executes imported strings as JavaScript.

For production embedding, still apply your application's normal Content Security Policy and input-validation rules.

## Browser support

The code targets current evergreen browsers with modern Canvas 2D, Pointer Events, `requestAnimationFrame`, `Blob`, and standard ES2023-era JavaScript support.

## Learning exercises

Try these in order:

1. change only the default palette;
2. create a new preset;
3. change the pointer radius or force behavior;
4. add one new numeric control;
5. display a new diagnostic value;
6. separate update and render responsibilities more strictly;
7. benchmark the effect at several particle counts;
8. add a second visual mode without breaking the default;
9. extract the simulation into a reusable module;
10. write a small test for a pure math helper.

## Suggested production checklist

- [ ] choose conservative defaults for the target devices;
- [ ] test desktop and narrow screens;
- [ ] test with pointer interaction disabled;
- [ ] test keyboard pause;
- [ ] verify contrast behind real page content;
- [ ] run the repository verification script;
- [ ] remove laboratory controls if your product does not need them;
- [ ] keep a copy of the exported configuration that produced the approved design;
- [ ] document any local changes made to the simulation;
- [ ] preserve the MIT license notice when redistributing source.

## Related project documentation

From the repository root:

- `docs/ARCHITECTURE.md`
- `docs/CUSTOMIZATION.md`
- `docs/PERFORMANCE.md`
- `docs/EMBEDDING.md`
- `docs/ACCESSIBILITY.md`
- `docs/TROUBLESHOOTING.md`
- `CONTRIBUTING.md`
- `SECURITY.md`

## License

MIT. You may use, modify, redistribute, and include this effect in personal or commercial work subject to the license terms in the repository root.
