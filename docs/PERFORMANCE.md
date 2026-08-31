# Performance Guide

Particle animation performance is mostly determined by work per frame, canvas pixel count, and object count.

## First controls to reduce

1. particle count;
2. connection distance for proximity graphs;
3. quality scale;
4. glow radius for gradient-heavy effects;
5. trail complexity.

## Pairwise algorithms

Spider-style connections can compare every particle with every later particle. The simple form is quadratic:

```text
comparisons = n * (n - 1) / 2
```

At 100 particles this is 4,950 comparisons. At 500 particles it is 124,750 comparisons before drawing.

For very high counts, use a spatial grid or quadtree so particles only inspect nearby regions.

## Pixel cost

A high-DPI canvas may contain several times more pixels than its CSS size. anime-bg caps device pixel ratio and exposes a quality scale so a low-end device can trade sharpness for frame rate.

## Delta time

Movement is multiplied by elapsed seconds rather than assuming a fixed refresh rate:

```js
const delta = Math.min((now - previous) / 1000, 0.033);
particle.x += particle.vx * delta * 60;
```

The clamp prevents a huge jump after a stalled or backgrounded frame.

## Measure before optimizing

The diagnostics panel exposes FPS, approximate frame time, particle count, canvas size, and pixel ratio. Use these together rather than judging performance from FPS alone.
