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

const DEFAULTS = Object.freeze({particleCount:120,speed:.75,particleSize:5.2,intensity:1,particleColor:"#ffd7e5",accentColor:"#ff8db6",backgroundColor:"#09070c",pointerEnabled:true,wind:.45,sway:1.2,rotationSpeed:1.1,depth:.75});
const config={...DEFAULTS};
const extra={wind:document.querySelector("#wind"),windValue:document.querySelector("#windValue"),sway:document.querySelector("#sway"),swayValue:document.querySelector("#swayValue"),rotationSpeed:document.querySelector("#rotationSpeed"),rotationSpeedValue:document.querySelector("#rotationSpeedValue"),depth:document.querySelector("#depth"),depthValue:document.querySelector("#depthValue")};
let petals=[];
class Petal{
 constructor(){this.reset(true);}
 reset(initial=false){this.x=random(-80,width+80);this.y=initial?random(-height*.1,height):random(-160,-20);this.z=random(Math.max(.15,1-config.depth),1);this.vy=random(.45,1.5);this.phase=random(0,Math.PI*2);this.rotation=random(0,Math.PI*2);this.rotationVelocity=random(-1,1);this.flutter=random(.5,1.7);}
 update(dt,time){const frame=dt*60;const wind=config.wind*config.speed*(.35+this.z);this.x+=wind*frame;this.y+=this.vy*config.speed*(.6+this.z)*frame;this.x+=Math.sin(time*.0018*this.flutter+this.phase)*config.sway*(.4+this.z)*frame*.16;this.rotation+=this.rotationVelocity*config.rotationSpeed*dt*(.5+this.z);
  if(config.pointerEnabled&&pointer.active){const dx=this.x-pointer.x,dy=this.y-pointer.y,d=Math.hypot(dx,dy)||1;if(d<180){const push=(1-d/180)*2.2*config.intensity*(pointer.down?-1:1);this.x+=(dx/d)*push*frame;this.y+=(dy/d)*push*.35*frame;this.rotation+=push*.03;}}
  if(this.y>height+80||this.x>width+140||this.x<-140)this.reset(false);}
 draw(){const s=config.particleSize*(.45+this.z);ctx.save();ctx.translate(this.x,this.y);ctx.rotate(this.rotation);ctx.scale(1,.68+Math.sin(this.phase+this.rotation)*.2);ctx.beginPath();ctx.moveTo(0,-s);ctx.bezierCurveTo(s*.9,-s*.5,s*.85,s*.55,0,s);ctx.bezierCurveTo(-s*.85,s*.55,-s*.9,-s*.5,0,-s);ctx.fillStyle=rgba(config.particleColor,.35+this.z*.65);ctx.fill();ctx.beginPath();ctx.moveTo(0,-s*.75);ctx.lineTo(0,s*.72);ctx.strokeStyle=rgba(config.accentColor,.18+this.z*.35);ctx.lineWidth=Math.max(.4,s*.08);ctx.stroke();ctx.restore();}
}
function syncCount(){while(petals.length<config.particleCount)petals.push(new Petal());if(petals.length>config.particleCount)petals.length=config.particleCount;}
function drawAtmosphere(time){ctx.fillStyle=config.backgroundColor;ctx.fillRect(0,0,width,height);for(let i=0;i<8;i++){const x=((time*.012*config.speed+i*211)% (width+300))-150;ctx.beginPath();ctx.arc(x,height*(.15+i*.09),20+i*4,0,Math.PI*2);ctx.fillStyle=rgba(config.accentColor,.006*config.intensity);ctx.fill();}}
function onResize(){petals.forEach(p=>{p.x=clamp(p.x,-100,width+100);p.y=clamp(p.y,-100,height+50);});}
function loop(time){if(!running)return;const dt=clamp((time-lastTime)/1000,0,.033);lastTime=time;drawAtmosphere(time);for(const p of petals){p.update(dt,time);p.draw();}updateStats(petals.length);frameId=requestAnimationFrame(loop);}
function syncExtra(){extra.wind.value=config.wind;extra.windValue.value=config.wind.toFixed(2);extra.sway.value=config.sway;extra.swayValue.value=config.sway.toFixed(2);extra.rotationSpeed.value=config.rotationSpeed;extra.rotationSpeedValue.value=config.rotationSpeed.toFixed(2);extra.depth.value=config.depth;extra.depthValue.value=config.depth.toFixed(2);}
function readExtra(){config.wind=Number(extra.wind.value);config.sway=Number(extra.sway.value);config.rotationSpeed=Number(extra.rotationSpeed.value);config.depth=Number(extra.depth.value);syncExtra();}
function onInput(){readCommonConfig(config);readExtra();syncCount();}
for(const input of [...Object.values(controls),extra.wind,extra.sway,extra.rotationSpeed,extra.depth])input.addEventListener("input",onInput);
ui.reset.addEventListener("click",()=>{Object.assign(config,DEFAULTS);applyControls(config);syncExtra();petals=[];syncCount();});
ui.random.addEventListener("click",()=>{config.particleColor=randomHex();config.accentColor=randomHex();config.particleCount=randomInt(55,260);config.wind=random(-2.2,2.2);config.sway=random(.2,2.7);config.rotationSpeed=random(.2,3.4);config.depth=random(.3,1);config.speed=random(.35,2);applyControls(config);syncExtra();petals=[];syncCount();});
applyControls(config);syncExtra();resizeCanvas();syncCount();frameId=requestAnimationFrame(loop);installProfessionalFeatures(config);

/*
 * Programmatic integration API
 *
 * This controller is intentionally small and browser-native. It lets an embedding
 * application tune an effect without reaching directly into its particle arrays.
 * The visual laboratory uses the same DOM controls, so programmatic and manual
 * configuration remain synchronized.
 */
function createEffectController() {
  function getConfiguration() {
    return Object.freeze({ ...getConfigSnapshot(config) });
  }

  function setConfiguration(values = {}) {
    const applied = applyConfigSnapshot(config, values);
    return {
      applied,
      config: getConfiguration()
    };
  }

  function setPalette({ primary, accent, background } = {}) {
    const next = {};
    if (primary) next.particleColor = primary;
    if (accent) next.accentColor = accent;
    if (background) next.backgroundColor = background;
    return setConfiguration(next);
  }

  function setMotion({ speed, intensity, particleCount, particleSize } = {}) {
    const next = {};
    if (Number.isFinite(speed)) next.speed = speed;
    if (Number.isFinite(intensity)) next.intensity = intensity;
    if (Number.isFinite(particleCount)) next.particleCount = particleCount;
    if (Number.isFinite(particleSize)) next.particleSize = particleSize;
    return setConfiguration(next);
  }

  function pause() {
    if (running) togglePause();
    return !running;
  }

  function resume() {
    if (!running) togglePause();
    return running;
  }

  function reset() {
    ui.reset.click();
    return getConfiguration();
  }

  function randomize() {
    ui.random.click();
    return getConfiguration();
  }

  function diagnostics() {
    return Object.freeze({
      fps: fpsValue,
      frameMs: runtime.lastFrameMs,
      width,
      height,
      dpr,
      qualityScale: runtime.qualityScale,
      pointerActive: pointer.active,
      pointerType: pointer.pointerType,
      running
    });
  }

  function setQuality(value) {
    const input = ui.qualityScale;
    const allowed = [...input.options].map((option) => option.value);
    const normalized = String(value);
    if (!allowed.includes(normalized)) {
      throw new RangeError(`Unsupported quality scale: ${value}`);
    }
    input.value = normalized;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return runtime.qualityScale;
  }

  function setPointerInteraction(enabled) {
    controls.pointerEnabled.checked = Boolean(enabled);
    controls.pointerEnabled.dispatchEvent(new Event("input", { bubbles: true }));
    return config.pointerEnabled;
  }

  function snapshot() {
    saveSnapshot();
  }

  return Object.freeze({
    getConfiguration,
    setConfiguration,
    setPalette,
    setMotion,
    pause,
    resume,
    reset,
    randomize,
    diagnostics,
    setQuality,
    setPointerInteraction,
    snapshot
  });
}

Object.defineProperty(window, "animeBgEffect", {
  configurable: true,
  enumerable: false,
  writable: false,
  value: createEffectController()
});

