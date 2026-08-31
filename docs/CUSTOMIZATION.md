# Customization Guide

There are three customization levels.

## 1. Live controls

Open any effect and change color, speed, size, density, intensity, interaction, and effect-specific values. Use Save preset to keep a configuration in browser storage.

## 2. JavaScript defaults

Edit `DEFAULTS` in the effect's `script.js`:

```js
const DEFAULTS = Object.freeze({
  particleCount: 120,
  speed: 0.8,
  particleSize: 2,
  intensity: 1,
  particleColor: "#e8fbff",
  accentColor: "#61dfff",
  backgroundColor: "#071019",
  pointerEnabled: true
});
```

The object is frozen to make the baseline explicit. Runtime changes happen in `config`.

## 3. Simulation behavior

Modify the effect-specific update rules. Example: stronger pointer attraction:

```js
const dx = pointer.x - particle.x;
const dy = pointer.y - particle.y;
const distance = Math.hypot(dx, dy) || 1;
const strength = 1 - distance / interactionRadius;

particle.vx += (dx / distance) * strength * 0.15;
particle.vy += (dy / distance) * strength * 0.15;
```

## Color palettes

A professional palette normally uses one particle color, one accent color, and one quiet background. Avoid making every visual element equally bright.

## Presets

The toolbar provides Calm, Balanced, Dense, and Energetic presets. These are starting points, not locked themes.

## Configuration files

Export produces JSON similar to:

```json
{
  "effect": "01-spider-network",
  "version": 1,
  "config": {
    "particleCount": 150,
    "speed": 0.85,
    "particleColor": "#a9f4ff"
  }
}
```

Import validates against the controls that already exist in the page. Unknown keys are ignored.
