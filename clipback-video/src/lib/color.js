// ---------------------------------------------------------------------------
// Palette + colour helpers. Restrained premium: charcoal / near-black /
// off-white / indigo / electric blue / subtle violet. No rainbow, no neon.
// ---------------------------------------------------------------------------

export const PAL = {
  void: '#05060A',
  black: '#07080D',
  charcoal: '#0C0E15',
  charcoal2: '#111420',
  slate: '#1A1E2C',
  line: '#232838',
  dim: '#5C6479',
  mute: '#8A93A8',
  ink: '#EEF1F7',
  white: '#FFFFFF',
  indigo: '#4A5BD6',
  indigoDeep: '#2C3488',
  indigoSoft: '#6C7BEE',
  blue: '#2F9BFF',
  blueBright: '#62C2FF',
  blueDeep: '#17539E',
  violet: '#8B5CF6',
  violetSoft: '#A98BFF',
  ember: '#C7563D',
  emberSoft: '#E0795C',
  teal: '#3FD0C9',
};

export function rgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
export function rgba(hex, a = 1) {
  const [r, g, b] = rgb(hex);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a))})`;
}
export function mixHex(h1, h2, t) {
  const a = rgb(h1), b = rgb(h2);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}
export function shade(hex, amt) {
  const c = rgb(hex).map((v) => Math.round(Math.max(0, Math.min(255, v * (1 + amt)))));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}
