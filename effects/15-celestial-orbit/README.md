# Celestial Orbit

Anime-inspired celestial bodies, stars, orbit trails, parallax dust, and occasional shooting stars.

Part of **anime-bg**, a dependency-free collection of flexible anime-inspired Canvas backgrounds.

## Overview

Celestial Orbit is designed as a production-ready visual background rather than a one-off animation snippet. It keeps rendering, configuration, UI controls, diagnostics, persistence, and export behavior separated enough to customize safely.

Core concepts:

- elliptical orbits
- parallax stars
- procedural celestial bodies
- shooting-star lifecycle
- pointer-based system parallax

## Why this effect exists

Anime interfaces often use motion to imply energy, speed, atmosphere, emotion, or depth. This effect recreates that visual language with browser-native Canvas APIs while keeping the implementation reusable and inspectable.

It is suitable for hero sections, authentication pages, developer portfolios, dashboards, loading states, landing pages, game-adjacent UI, and experimental creative coding.

## Architecture

The effect follows a small runtime pipeline:

```text
configuration -> input -> simulation -> render -> diagnostics -> next frame
```

The professional runtime also handles preset persistence, JSON import and export, snapshots, quality scaling, visibility pausing, keyboard shortcuts, and device-pixel-ratio management.

## File map

```text
15-celestial-orbit/
├── index.html      # standalone laboratory and controls
├── style.css       # isolated responsive UI and canvas styling
├── script.js       # runtime, tools, simulation, and renderer
└── README.md       # this technical guide
```

## Quick start

```bash
git clone <your-repository-url>
cd anime-bg
bun run serve
```

Then open `effects/15-celestial-orbit/index.html` through the local server.

## Configuration model

Every effect exposes a `DEFAULTS` object. Change those values to define your application defaults.

```js
const DEFAULTS = Object.freeze({
  particleCount: 160,
  speed: 1,
  particleSize: 2,
  intensity: 1,
  particleColor: "#ffffff",
  accentColor: "#8d72ff",
  backgroundColor: "#05070c",
  pointerEnabled: true
});
```

## Live controls

| Control | Purpose |
| --- | --- |
| Particle count | Controls simulation density |
| Speed | Multiplies time-based movement |
| Particle size | Changes primary geometry size |
| Intensity | Scales visual force or amplitude |
| Primary color | Main particle or highlight color |
| Accent color | Secondary visual system color |
| Background | Canvas clear color |
| Pointer interaction | Enables cursor or touch reaction |
| Quality scale | Changes internal render resolution |

## Embedding

Minimal markup:

```html
<section class="anime-hero">
  <canvas id="scene"></canvas>
  <div class="anime-hero__content">Your content</div>
</section>
<script src="./script.js" defer></script>
```

Keep the canvas behind content and preserve pointer behavior only when it does not block page interaction.

## JavaScript integration

For an application integration, keep configuration in one place and update controls or configuration values intentionally. Avoid mutating internal particle arrays from unrelated application code.

```js
const theme = {
  particleColor: "#f5f7ff",
  accentColor: "#7c6cff",
  backgroundColor: "#05060a"
};

Object.assign(config, theme);
applyControls(config);
```

## CSS integration

```css
.anime-hero {
  position: relative;
  min-height: 70vh;
  overflow: hidden;
  background: #05060a;
}

.anime-hero canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.anime-hero__content {
  position: relative;
  z-index: 1;
}
```

## Responsive behavior

Canvas dimensions are measured from the containing stage rather than hard-coded viewport values. Rendering resolution is multiplied by a clamped device-pixel ratio and the user-selectable quality scale.

For embedded cards or narrow layouts, set an explicit minimum height on the parent container.

## Pointer interaction

Pointer Events are used so the same input path can support mouse, pen, and touch-capable browsers. Interaction is optional and can be disabled with `pointerEnabled`.

Do not make essential content depend on pointer hover. The effect is decorative and remains useful without interaction.

## Animation timing

Movement uses `requestAnimationFrame` and clamped delta time. This reduces major behavior differences between 60 Hz, 90 Hz, 120 Hz, and throttled environments.

```js
const dt = clamp((time - lastTime) / 1000, 0, 0.033);
lastTime = time;
```

## Performance model

| Tuning action | Expected impact | Visual cost |
| --- | --- | --- |
| Reduce particle count | High | Lower density |
| Set quality to Medium | High on high-DPR screens | Slightly softer output |
| Reduce intensity | Medium | Less motion |
| Disable pointer interaction | Low to medium | Removes interactivity |
| Pause when hidden | High while backgrounded | None while visible |

The runtime already pauses its animation frame scheduling when the document becomes hidden.

## Accessibility

The canvas is decorative. Important labels and controls are native HTML elements with visible text. Keyboard shortcuts do not run while a form control is focused.

For production websites, consider disabling or simplifying continuous animation when `prefers-reduced-motion: reduce` is active.

## Customization recipes

### Recipe 1: Subtle hero

Lower particle count, speed, and intensity. Keep contrast low.

Example adjustment:

```js
// Subtle hero
config.speed = Math.max(0.2, config.speed * 0.8);
config.intensity = Math.max(0.3, config.intensity * 0.8);
```

### Recipe 2: High-energy landing page

Increase speed and intensity, then use a bright accent over a dark background.

Example adjustment:

```js
// High-energy landing page
config.speed = Math.max(0.2, config.speed * 0.8);
config.intensity = Math.max(0.3, config.intensity * 0.8);
```

### Recipe 3: Low-end mobile

Use Low or Medium quality and reduce particle count by at least 40 percent.

Example adjustment:

```js
// Low-end mobile
config.speed = Math.max(0.2, config.speed * 0.8);
config.intensity = Math.max(0.3, config.intensity * 0.8);
```

### Recipe 4: Monochrome

Set particle and accent colors to nearby neutral values.

Example adjustment:

```js
// Monochrome
config.speed = Math.max(0.2, config.speed * 0.8);
config.intensity = Math.max(0.3, config.intensity * 0.8);
```

### Recipe 5: Brand palette

Set primary, accent, and background from your design tokens.

Example adjustment:

```js
// Brand palette
config.speed = Math.max(0.2, config.speed * 0.8);
config.intensity = Math.max(0.3, config.intensity * 0.8);
```

### Recipe 6: Static-like ambient

Set speed near 0.2 and intensity below 0.5.

Example adjustment:

```js
// Static-like ambient
config.speed = Math.max(0.2, config.speed * 0.8);
config.intensity = Math.max(0.3, config.intensity * 0.8);
```

### Recipe 7: Interactive showcase

Keep pointer interaction enabled and use a larger interaction region.

Example adjustment:

```js
// Interactive showcase
config.speed = Math.max(0.2, config.speed * 0.8);
config.intensity = Math.max(0.3, config.intensity * 0.8);
```

### Recipe 8: Dashboard background

Reduce contrast so charts and text remain dominant.

Example adjustment:

```js
// Dashboard background
config.speed = Math.max(0.2, config.speed * 0.8);
config.intensity = Math.max(0.3, config.intensity * 0.8);
```

### Recipe 9: Full-screen intro

Increase density carefully and use the highest effect-specific spatial range.

Example adjustment:

```js
// Full-screen intro
config.speed = Math.max(0.2, config.speed * 0.8);
config.intensity = Math.max(0.3, config.intensity * 0.8);
```

### Recipe 10: Embedded card

Reduce count and size, then use a fixed card height.

Example adjustment:

```js
// Embedded card
config.speed = Math.max(0.2, config.speed * 0.8);
config.intensity = Math.max(0.3, config.intensity * 0.8);
```

## Troubleshooting

### Canvas is blank

Verify the script loads after the required HTML IDs exist and inspect the console for initialization errors.

### Animation is slow

Reduce particle count first, then lower quality scale.

### Colors do not update

Use valid six-digit hexadecimal colors when importing JSON.

### Pointer interaction feels too strong

Lower intensity or the effect-specific force control.

### Snapshot fails

Browser security settings may restrict canvas downloads in unusual embedded contexts.

## Testing checklist

- [ ] Open the effect directly through a local static server
- [ ] Resize from desktop width to a narrow mobile width
- [ ] Test pause and resume
- [ ] Test all four named presets
- [ ] Export then import JSON
- [ ] Save and load the local preset
- [ ] Change every color input
- [ ] Test pointer interaction
- [ ] Switch quality levels
- [ ] Run the repository verifier

## Contribution notes

Keep the effect standalone. Do not add a framework dependency for a feature that can be implemented clearly with browser-native APIs. Preserve readable naming, bounded loops, responsive layout, and the shared control contract.

Run `bun run verify` before opening a pull request.

## License

MIT. You may use, modify, redistribute, and integrate the effect in personal and commercial projects subject to the license terms.


## Programmatic controller API

New anime-bg effects expose `window.animeBgEffect` for application-level control without mutating particle arrays directly.

```js
window.animeBgEffect.setPalette({
  primary: "#ffffff",
  accent: "#8c73ff",
  background: "#08090c"
});

window.animeBgEffect.setMotion({
  speed: 0.8,
  intensity: 1.1,
  particleCount: 160
});

console.log(window.animeBgEffect.diagnostics());
```

The controller also exposes `pause`, `resume`, `reset`, `randomize`, `setQuality`, `setPointerInteraction`, and `snapshot`.
