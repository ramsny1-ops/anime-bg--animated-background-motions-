// Example values to apply after copying an effect into your own application.
export const brandPreset = {
  particleCount: 110,
  speed: 0.65,
  particleSize: 1.8,
  intensity: 0.8,
  particleColor: "#f8fbff",
  accentColor: "#71d8ff",
  backgroundColor: "#071019",
  pointerEnabled: true
};

// Keep your application-specific settings outside the simulation when possible.
export function mergePreset(defaults, preset) {
  return { ...defaults, ...preset };
}
