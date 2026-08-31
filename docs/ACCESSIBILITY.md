# Accessibility Guide

Particle effects are decorative unless they encode application meaning. Keep real content in semantic HTML outside the canvas.

## Reduced motion

anime-bg checks `prefers-reduced-motion` in CSS and exposes pause controls. If your product has stronger accessibility requirements, start paused when the media query matches.

```js
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduceMotion) pauseAnimation();
```

## Keyboard operation

The professional demo shell provides keyboard shortcuts when focus is not inside an editable control:

- Space: pause or resume;
- R: reset;
- C: collapse or expand controls;
- S: save a canvas snapshot;
- E: export configuration.

All visible buttons remain available, so shortcuts are enhancements rather than the only path.

## Canvas labeling

If the effect is decorative, use `aria-hidden="true"`. If the canvas itself is the demonstration, provide a concise `aria-label` while keeping settings and explanation in real HTML.

## Contrast

The control interface uses high-contrast text and native inputs. Custom effect palettes can still produce poor visual contrast, so evaluate production colors against the page content that overlays the animation.
