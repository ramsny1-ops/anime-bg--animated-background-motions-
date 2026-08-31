# Architecture

anime-bg uses a deliberately simple architecture: each effect is a self-contained browser application.

## Repository layers

```text
index.html                 Gallery
main.css                   Gallery styles
effects/<effect>/          Standalone demos
docs/                      Cross-project guides
examples/                  Integration examples
scripts/                   Development verification
.github/                    Collaboration automation
```

## Standalone-effect contract

Every effect owns its HTML, CSS, JavaScript, and README. There is intentional duplication in the small runtime helpers because a user should be able to copy one folder without bringing a build system or shared package.

## Runtime lifecycle

```text
HTML loads
  -> query canvas and controls
  -> create configuration
  -> resize canvas
  -> construct simulation objects
  -> requestAnimationFrame loop
      -> calculate delta time
      -> update simulation
      -> render canvas
      -> update diagnostics
  -> schedule next frame
```

## Why Canvas 2D

Canvas 2D keeps the learning surface small. It gives direct access to paths, lines, gradients, text, transforms, and pixels without requiring a scene graph. For tens to hundreds of particles this is an excellent balance between clarity and performance.

## Configuration model

Each effect has immutable `DEFAULTS` and a mutable `config` copy. Controls update `config`; reset restores `DEFAULTS`; export serializes current values; import validates values against the existing controls before applying them.

## Rendering principles

- state updates are time-based;
- expensive operations stay inside bounded loops;
- canvas resolution is separated from CSS size;
- device pixel ratio is capped;
- hidden documents stop rendering;
- effects expose conservative defaults;
- user controls remain outside the canvas for accessibility.
