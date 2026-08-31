# Troubleshooting

## The page is blank

Open browser developer tools and check the console. Confirm `script.js` and `style.css` are in the same folder as `index.html`.

## The effect looks blurry

Increase Quality scale. Remember that higher pixel density costs more GPU and CPU time.

## Animation is slow

Reduce particle count, connection distance, glow size, or quality scale. See `PERFORMANCE.md`.

## Pointer interaction does nothing

Confirm Pointer interaction is enabled. Some effects reverse force while the pointer is held down.

## Imported configuration does not change a value

Unknown configuration keys are ignored, and numeric values are clamped to the corresponding control range.

## Direct file opening behaves differently

The demos do not require a server, but browser security rules can differ for `file://` pages. Serving the repository locally is recommended for consistent development:

```bash
bun run serve
```
