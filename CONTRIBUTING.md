# Contributing to anime-bg

For the complete designed contributor manual, open [`docs/contributing.html`](docs/contributing.html).


Thank you for improving anime-bg. Contributions can be code, documentation,
accessibility improvements, performance work, examples, bug reports, or new effects.

## Before opening a pull request

1. Fork the repository and create a focused branch.
2. Keep each effect independently runnable.
3. Do not add a framework or runtime dependency without a strong architectural reason.
4. Preserve keyboard and pointer accessibility.
5. Run the repository verification script.
6. Test at least one desktop browser and one narrow/mobile viewport.
7. Update the relevant README when behavior or configuration changes.

## Development setup

```bash
git clone <your-fork-url>
cd anime-bg
bun run verify
bun run serve
```

Node.js can also run the verification script:

```bash
node scripts/verify.mjs
```

## Effect contract

Every folder inside `effects/` must contain:

```text
README.md
index.html
style.css
script.js
```

A new effect should include:

- a visible live-controls panel;
- pause and resume;
- reset;
- randomize;
- responsive canvas sizing;
- device-pixel-ratio handling;
- document visibility handling;
- pointer interaction when meaningful;
- an FPS readout;
- configuration export and import;
- a screenshot action;
- a professional README with usage and customization examples.

## JavaScript style

Use modern browser JavaScript compatible with current evergreen browsers.

Preferred practices:

```js
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function update(deltaSeconds) {
  // Simulation only.
}

function render(context) {
  // Drawing only when a separation improves clarity.
}
```

Avoid unnecessary abstractions. A helper should make an effect easier to understand,
safer, or more reusable.

## Performance expectations

A pull request should not increase default CPU usage substantially without a clear
visual reason. Prefer bounded loops, capped particle counts, early exits, and cheap
math in hot paths.

If an effect uses pairwise particle comparisons, document the complexity and keep the
default count conservative.

## Commit examples

```text
feat(spider): add spatial-grid connection mode
fix(vortex): prevent respawn loop on tiny canvases
docs(waves): explain phase offset math
perf(gravity): avoid repeated square roots outside force radius
```

## Pull requests

A good pull request explains:

- what changed;
- why the change is useful;
- how it was tested;
- performance or accessibility implications;
- screenshots or recordings for visual changes when practical.

Small, reviewable pull requests are preferred over unrelated bundles of changes.
