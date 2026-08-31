# Embedding Effects in Another Website

## Minimal hero example

```html
<section class="hero">
  <canvas id="scene" aria-hidden="true"></canvas>
  <div class="hero-content">
    <h1>Build something memorable.</h1>
    <p>Your real content stays above the particle canvas.</p>
  </div>
</section>
<script src="./particle-effect/script.js" defer></script>
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

## Removing the demo control panel

The supplied `index.html` is a laboratory interface. In production you can remove the `<aside class="panel">` element and keep the canvas plus script. If you remove controls, replace control-dependent setup with fixed values or keep the hidden controls until you refactor the script.

For a cleaner integration, copy the simulation class and render loop into your own module while preserving `DEFAULTS`, resize handling, and visibility handling.

## Layering

Do not put important clickable content behind the canvas. A decorative background can use `pointer-events: none` when pointer interaction is disabled.
