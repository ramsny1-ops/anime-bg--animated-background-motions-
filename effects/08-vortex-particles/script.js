"use strict";

const canvas = document.querySelector("#scene");
const ctx = canvas.getContext("2d", { alpha: false });
const stage = document.querySelector("#stage");

if (!canvas || !ctx || !stage) {
  throw new Error("anime-bg could not initialize the canvas runtime.");
}

const controls = {
  count: document.querySelector("#count"),
  speed: document.querySelector("#speed"),
  size: document.querySelector("#size"),
  intensity: document.querySelector("#intensity"),
  particleColor: document.querySelector("#particleColor"),
  accentColor: document.querySelector("#accentColor"),
  backgroundColor: document.querySelector("#backgroundColor"),
  pointerEnabled: document.querySelector("#pointerEnabled")
};

const outputs = {
  count: document.querySelector("#countValue"),
  speed: document.querySelector("#speedValue"),
  size: document.querySelector("#sizeValue"),
  intensity: document.querySelector("#intensityValue")
};

const ui = {
  pause: document.querySelector("#pauseButton"),
  reset: document.querySelector("#resetButton"),
  random: document.querySelector("#randomButton"),
  fps: document.querySelector("#fpsStat"),
  frame: document.querySelector("#frameStat"),
  particles: document.querySelector("#particleStat"),
  pointer: document.querySelector("#pointerStat"),
  canvas: document.querySelector("#canvasStat"),
  dpr: document.querySelector("#dprStat"),
  panel: document.querySelector("#controlPanel"),
  panelToggle: document.querySelector("#panelToggleButton"),
  qualityScale: document.querySelector("#qualityScale"),
  savePreset: document.querySelector("#savePresetButton"),
  loadPreset: document.querySelector("#loadPresetButton"),
  exportConfig: document.querySelector("#exportButton"),
  importConfig: document.querySelector("#importButton"),
  importFile: document.querySelector("#importFile"),
  copyConfig: document.querySelector("#copyConfigButton"),
  snapshot: document.querySelector("#snapshotButton"),
  status: document.querySelector("#statusLine")
};

const pointer = {
  x: 0,
  y: 0,
  active: false,
  down: false,
  pointerType: "mouse"
};

const runtime = {
  qualityScale: 1,
  lastFrameMs: 0,
  storageAvailable: true,
  statusTimer: 0,
  panelCollapsed: false
};

let dpr = 1;
let width = 0;
let height = 0;
let running = true;
let frameId = 0;
let lastTime = performance.now();
let fpsTime = performance.now();
let fpsFrames = 0;
let fpsValue = 0;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const random = (min, max) => Math.random() * (max - min) + min;
const randomInt = (min, max) => Math.floor(random(min, max + 1));
const lerp = (a, b, t) => a + (b - a) * t;

function hexToRgb(hex) {
  const clean = String(hex).replace("#", "");
  const normalized = clean.length === 3
    ? clean.split("").map((character) => character + character).join("")
    : clean.padEnd(6, "0").slice(0, 6);
  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  };
}

function rgba(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
}

function resizeCanvas() {
  const rect = stage.getBoundingClientRect();
  width = Math.max(1, rect.width);
  height = Math.max(1, rect.height);
  const deviceScale = window.devicePixelRatio || 1;
  dpr = clamp(deviceScale * runtime.qualityScale, 0.5, 2);

  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  if (!pointer.active) {
    pointer.x = width / 2;
    pointer.y = height / 2;
  }

  if (ui.canvas) ui.canvas.textContent = `${Math.round(width)} × ${Math.round(height)}`;
  if (ui.dpr) ui.dpr.textContent = dpr.toFixed(2);

  onResize();
}

function updatePointer(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = clamp(event.clientX - rect.left, 0, rect.width);
  pointer.y = clamp(event.clientY - rect.top, 0, rect.height);
  pointer.active = true;
  pointer.pointerType = event.pointerType || "mouse";
  ui.pointer.textContent = pointer.down ? "Pressed" : "Tracking";
}

canvas.addEventListener("pointermove", updatePointer, { passive: true });
canvas.addEventListener("pointerdown", (event) => {
  pointer.down = true;
  updatePointer(event);
  canvas.setPointerCapture?.(event.pointerId);
});
canvas.addEventListener("pointerup", () => {
  pointer.down = false;
  ui.pointer.textContent = pointer.active ? "Tracking" : "Idle";
});
canvas.addEventListener("pointercancel", () => {
  pointer.down = false;
  pointer.active = false;
  ui.pointer.textContent = "Idle";
});
canvas.addEventListener("pointerleave", () => {
  if (pointer.pointerType === "mouse") {
    pointer.active = false;
    pointer.down = false;
    ui.pointer.textContent = "Idle";
  }
});

function applyControls(config) {
  controls.count.value = config.particleCount;
  controls.speed.value = config.speed;
  controls.size.value = config.particleSize;
  controls.intensity.value = config.intensity;
  controls.particleColor.value = config.particleColor;
  controls.accentColor.value = config.accentColor;
  controls.backgroundColor.value = config.backgroundColor;
  controls.pointerEnabled.checked = config.pointerEnabled;
  syncOutputs();
  updateAccentPreview(config.accentColor);
}

function syncOutputs() {
  outputs.count.value = controls.count.disabled ? "N/A" : controls.count.value;
  outputs.speed.value = `${Number(controls.speed.value).toFixed(1)}x`;
  outputs.size.value = Number(controls.size.value).toFixed(1);
  outputs.intensity.value = Number(controls.intensity.value).toFixed(2);
}

function readCommonConfig(config) {
  if (!controls.count.disabled) {
    config.particleCount = clamp(Number(controls.count.value), 1, 1000);
  }
  config.speed = clamp(Number(controls.speed.value), 0, 10);
  config.particleSize = clamp(Number(controls.size.value), 0.1, 40);
  config.intensity = clamp(Number(controls.intensity.value), 0, 10);
  config.particleColor = controls.particleColor.value;
  config.accentColor = controls.accentColor.value;
  config.backgroundColor = controls.backgroundColor.value;
  config.pointerEnabled = controls.pointerEnabled.checked;
  syncOutputs();
  updateAccentPreview(config.accentColor);
}

function updateAccentPreview(color) {
  document.documentElement.style.setProperty("--accent", color);
}

function updateStats(count) {
  fpsFrames += 1;
  const now = performance.now();
  runtime.lastFrameMs = Math.max(0, now - lastTime);

  if (now - fpsTime >= 500) {
    fpsValue = Math.round((fpsFrames * 1000) / (now - fpsTime));
    fpsFrames = 0;
    fpsTime = now;
    ui.fps.textContent = String(fpsValue);
    if (ui.frame) ui.frame.textContent = `${(1000 / Math.max(1, fpsValue)).toFixed(1)} ms`;
  }

  ui.particles.textContent = String(count);
}

function randomHex() {
  return `#${randomInt(30, 235).toString(16).padStart(2, "0")}${randomInt(30, 235).toString(16).padStart(2, "0")}${randomInt(30, 235).toString(16).padStart(2, "0")}`;
}

function togglePause() {
  running = !running;
  ui.pause.textContent = running ? "Pause" : "Resume";
  if (running) {
    lastTime = performance.now();
    frameId = requestAnimationFrame(loop);
    setStatus("Animation resumed.", "success");
  } else {
    cancelAnimationFrame(frameId);
    setStatus("Animation paused.");
  }
}

function setStatus(message, state = "neutral", timeout = 2600) {
  if (!ui.status) return;
  window.clearTimeout(runtime.statusTimer);
  ui.status.textContent = message;
  ui.status.dataset.state = state;
  if (timeout > 0) {
    runtime.statusTimer = window.setTimeout(() => {
      ui.status.textContent = "";
      ui.status.dataset.state = "neutral";
    }, timeout);
  }
}

function togglePanel(force) {
  runtime.panelCollapsed = typeof force === "boolean" ? force : !runtime.panelCollapsed;
  ui.panel.dataset.collapsed = String(runtime.panelCollapsed);
  ui.panelToggle.setAttribute("aria-expanded", String(!runtime.panelCollapsed));
  ui.panelToggle.textContent = runtime.panelCollapsed ? "Show" : "Controls";
}

function inputKeyToConfigKey(id) {
  const aliases = {
    count: "particleCount",
    size: "particleSize"
  };
  return aliases[id] || id;
}

function configKeyToInputId(key) {
  const aliases = {
    particleCount: "count",
    particleSize: "size"
  };
  return aliases[key] || key;
}

function getConfigSnapshot(config) {
  const clean = {};
  for (const [key, value] of Object.entries(config)) {
    if (["string", "number", "boolean"].includes(typeof value)) clean[key] = value;
  }
  return clean;
}

function setInputSafely(input, value) {
  if (!input) return false;

  if (input.type === "checkbox") {
    input.checked = Boolean(value);
    return true;
  }

  if (input.type === "color") {
    if (typeof value !== "string" || !/^#[0-9a-f]{6}$/i.test(value)) return false;
    input.value = value;
    return true;
  }

  if (input.type === "range" || input.type === "number") {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return false;
    const min = input.min === "" ? -Infinity : Number(input.min);
    const max = input.max === "" ? Infinity : Number(input.max);
    input.value = String(clamp(numeric, min, max));
    return true;
  }

  if (input.tagName === "SELECT") {
    const allowed = [...input.options].some((option) => option.value === String(value));
    if (!allowed) return false;
    input.value = String(value);
    return true;
  }

  input.value = String(value);
  return true;
}

function applyConfigSnapshot(config, snapshot) {
  if (!snapshot || typeof snapshot !== "object") {
    throw new TypeError("Configuration must be an object.");
  }

  const changedInputs = [];
  for (const [key, value] of Object.entries(snapshot)) {
    if (!(key in config)) continue;
    const input = document.querySelector(`#${CSS.escape(configKeyToInputId(key))}`);
    if (!input || input.disabled) continue;
    if (setInputSafely(input, value)) changedInputs.push(input);
  }

  for (const input of changedInputs) {
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  return changedInputs.length;
}

function createDownload(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  queueMicrotask(() => URL.revokeObjectURL(url));
}

function effectSlug() {
  const parts = location.pathname.split("/").filter(Boolean);
  return parts.at(-2) || "particle-effect";
}

function exportConfiguration(config) {
  const payload = {
    project: "anime-bg",
    effect: effectSlug(),
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    config: getConfigSnapshot(config)
  };
  createDownload(`${effectSlug()}-config.json`, `${JSON.stringify(payload, null, 2)}\n`, "application/json");
  setStatus("Configuration exported.", "success");
}

async function copyConfiguration(config) {
  const text = JSON.stringify(getConfigSnapshot(config), null, 2);
  try {
    await navigator.clipboard.writeText(text);
    setStatus("Configuration copied to clipboard.", "success");
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand?.("copy");
    textarea.remove();
    setStatus(copied ? "Configuration copied." : "Clipboard access is unavailable.", copied ? "success" : "error");
  }
}

function saveSnapshot() {
  try {
    const link = document.createElement("a");
    link.download = `${effectSlug()}-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.append(link);
    link.click();
    link.remove();
    setStatus("Canvas snapshot saved.", "success");
  } catch (error) {
    console.error(error);
    setStatus("Snapshot could not be created.", "error");
  }
}

function storageKey() {
  return `anime-bg:${effectSlug()}:preset:v1`;
}

function saveLocalPreset(config) {
  try {
    localStorage.setItem(storageKey(), JSON.stringify(getConfigSnapshot(config)));
    setStatus("Preset saved in this browser.", "success");
  } catch (error) {
    runtime.storageAvailable = false;
    console.error(error);
    setStatus("Browser storage is unavailable.", "error");
  }
}

function loadLocalPreset(config) {
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) {
      setStatus("No saved preset exists yet.");
      return;
    }
    const snapshot = JSON.parse(raw);
    const count = applyConfigSnapshot(config, snapshot);
    setStatus(`Loaded preset and applied ${count} values.`, "success");
  } catch (error) {
    console.error(error);
    setStatus("Saved preset is invalid or unavailable.", "error");
  }
}

function applyNamedPreset(config, name) {
  const current = getConfigSnapshot(config);
  const presets = {
    calm: {
      particleCount: Math.min(90, Number(current.particleCount ?? 90)),
      speed: 0.45,
      intensity: 0.55,
      particleSize: Math.max(1, Number(current.particleSize ?? 2))
    },
    balanced: {
      particleCount: 140,
      speed: 0.9,
      intensity: 1,
      particleSize: 2
    },
    dense: {
      particleCount: 240,
      speed: 0.7,
      intensity: 1.15,
      particleSize: 1.6
    },
    energetic: {
      particleCount: 180,
      speed: 2,
      intensity: 1.8,
      particleSize: 2.3
    }
  };
  const preset = presets[name];
  if (!preset) return;
  const count = applyConfigSnapshot(config, preset);
  setStatus(`${name[0].toUpperCase()}${name.slice(1)} preset applied (${count} values).`, "success");
}

function installProfessionalFeatures(config) {
  ui.pause.addEventListener("click", togglePause);
  ui.panelToggle.addEventListener("click", () => togglePanel());

  ui.qualityScale.addEventListener("change", () => {
    runtime.qualityScale = clamp(Number(ui.qualityScale.value), 0.5, 1.25);
    resizeCanvas();
    setStatus(`Rendering quality set to ${ui.qualityScale.options[ui.qualityScale.selectedIndex].text}.`, "success");
  });

  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => applyNamedPreset(config, button.dataset.preset));
  });

  ui.savePreset.addEventListener("click", () => saveLocalPreset(config));
  ui.loadPreset.addEventListener("click", () => loadLocalPreset(config));
  ui.exportConfig.addEventListener("click", () => exportConfiguration(config));
  ui.copyConfig.addEventListener("click", () => copyConfiguration(config));
  ui.snapshot.addEventListener("click", saveSnapshot);
  ui.importConfig.addEventListener("click", () => ui.importFile.click());

  ui.importFile.addEventListener("change", async () => {
    const [file] = ui.importFile.files;
    if (!file) return;
    try {
      const raw = await file.text();
      const payload = JSON.parse(raw);
      const snapshot = payload?.config && typeof payload.config === "object" ? payload.config : payload;
      const count = applyConfigSnapshot(config, snapshot);
      setStatus(`Imported configuration and applied ${count} values.`, "success");
    } catch (error) {
      console.error(error);
      setStatus("Import failed. Choose a valid anime-bg JSON file.", "error");
    } finally {
      ui.importFile.value = "";
    }
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const editable = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target?.isContentEditable;
    if (editable) return;

    const key = event.key.toLowerCase();
    if (event.code === "Space") {
      event.preventDefault();
      togglePause();
    } else if (key === "r") {
      ui.reset.click();
    } else if (key === "c") {
      togglePanel();
    } else if (key === "s") {
      event.preventDefault();
      saveSnapshot();
    } else if (key === "e") {
      exportConfiguration(config);
    }
  });
}

function installEnvironmentHooks() {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && running) {
      cancelAnimationFrame(frameId);
    } else if (!document.hidden && running) {
      lastTime = performance.now();
      frameId = requestAnimationFrame(loop);
    }
  });

  window.addEventListener("resize", resizeCanvas, { passive: true });
}

installEnvironmentHooks();

const DEFAULTS = Object.freeze({
  particleCount: 220,
  speed: 1,
  particleSize: 1.6,
  intensity: 1,
  particleColor: "#e5fbff",
  accentColor: "#7d6bff",
  backgroundColor: "#050914",
  pointerEnabled: true,
  pull: 0.24,
  spin: 0.52,
  trail: 0.12
});

const config = { ...DEFAULTS };
const extra = {
  pull: document.querySelector("#pull"),
  pullValue: document.querySelector("#pullValue"),
  spin: document.querySelector("#spin"),
  spinValue: document.querySelector("#spinValue"),
  trail: document.querySelector("#trail"),
  trailValue: document.querySelector("#trailValue")
};

let particles = [];

class VortexParticle {
  constructor() {
    this.spawn();
  }

  spawn() {
    const cx = width / 2;
    const cy = height / 2;
    const angle = random(0, Math.PI * 2);
    const radius = random(40, Math.max(width, height) * 0.62);
    this.x = cx + Math.cos(angle) * radius;
    this.y = cy + Math.sin(angle) * radius;
    this.vx = random(-0.15, 0.15);
    this.vy = random(-0.15, 0.15);
    this.age = random(0, 20);
    this.maxAge = random(8, 24);
    this.scale = random(0.7, 1.5);
  }

  update(dt) {
    const cx = config.pointerEnabled && pointer.active ? pointer.x : width / 2;
    const cy = config.pointerEnabled && pointer.active ? pointer.y : height / 2;
    const dx = cx - this.x;
    const dy = cy - this.y;
    const distance = Math.hypot(dx, dy) || 1;
    const nx = dx / distance;
    const ny = dy / distance;

    const radial = config.pull * config.intensity;
    const tangentX = -ny;
    const tangentY = nx;
    const spin = config.spin * config.intensity * (pointer.down ? -1 : 1);

    const frame = dt * 60;
    this.vx += (nx * radial + tangentX * spin) * 0.055 * frame;
    this.vy += (ny * radial + tangentY * spin) * 0.055 * frame;

    this.vx *= 0.993;
    this.vy *= 0.993;

    const max = 4.5 * config.speed + 0.4;
    const v = Math.hypot(this.vx, this.vy);
    if (v > max) {
      this.vx = this.vx / v * max;
      this.vy = this.vy / v * max;
    }

    this.x += this.vx * config.speed * frame;
    this.y += this.vy * config.speed * frame;
    this.age += dt;

    if (
      this.age > this.maxAge ||
      distance < 14 ||
      this.x < -150 ||
      this.x > width + 150 ||
      this.y < -150 ||
      this.y > height + 150
    ) {
      this.spawn();
    }
  }

  draw() {
    const velocity = Math.hypot(this.vx, this.vy);
    const alpha = clamp(0.3 + velocity * 0.13, 0.3, 1);
    ctx.beginPath();
    ctx.arc(this.x, this.y, config.particleSize * this.scale, 0, Math.PI * 2);
    ctx.fillStyle = rgba(config.particleColor, alpha);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 4, this.y - this.vy * 4);
    ctx.strokeStyle = rgba(config.accentColor, alpha * 0.3);
    ctx.lineWidth = Math.max(0.5, config.particleSize * 0.45);
    ctx.stroke();
  }
}

function syncCount() {
  while (particles.length < config.particleCount) particles.push(new VortexParticle());
  if (particles.length > config.particleCount) particles.length = config.particleCount;
}

function onResize() {}

function loop(time) {
  if (!running) return;
  const dt = clamp((time - lastTime) / 1000, 0, 0.033);
  lastTime = time;

  ctx.fillStyle = rgba(config.backgroundColor, config.trail);
  ctx.fillRect(0, 0, width, height);

  for (const particle of particles) {
    particle.update(dt);
    particle.draw();
  }

  updateStats(particles.length);
  frameId = requestAnimationFrame(loop);
}

function syncExtra() {
  extra.pull.value = config.pull;
  extra.pullValue.value = config.pull.toFixed(2);
  extra.spin.value = config.spin;
  extra.spinValue.value = config.spin.toFixed(2);
  extra.trail.value = config.trail;
  extra.trailValue.value = config.trail.toFixed(2);
}

function readExtra() {
  config.pull = Number(extra.pull.value);
  config.spin = Number(extra.spin.value);
  config.trail = Number(extra.trail.value);
  syncExtra();
}

function onInput() {
  readCommonConfig(config);
  readExtra();
  syncCount();
}

for (const input of [...Object.values(controls), extra.pull, extra.spin, extra.trail]) {
  input.addEventListener("input", onInput);
}

ui.reset.addEventListener("click", () => {
  Object.assign(config, DEFAULTS);
  applyControls(config);
  syncExtra();
  particles = [];
  syncCount();
});

ui.random.addEventListener("click", () => {
  config.particleColor = randomHex();
  config.accentColor = randomHex();
  config.pull = random(0.08, 0.8);
  config.spin = random(-1.2, 1.2);
  config.trail = random(0.05, 0.3);
  config.particleCount = randomInt(90, 300);
  applyControls(config);
  syncExtra();
  particles = [];
  syncCount();
});

applyControls(config);
syncExtra();
resizeCanvas();
ctx.fillStyle = config.backgroundColor;
ctx.fillRect(0, 0, width, height);
syncCount();
frameId = requestAnimationFrame(loop);

installProfessionalFeatures(config);
