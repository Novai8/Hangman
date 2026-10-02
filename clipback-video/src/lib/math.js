// ---------------------------------------------------------------------------
// Clipback motion system — math / easing / noise utilities
// ---------------------------------------------------------------------------

export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const mix = lerp;
export const inv = (a, b, v) => (b === a ? 0 : (v - a) / (b - a));
export const smoothstep = (a, b, v) => {
  const t = clamp(inv(a, b, v));
  return t * t * (3 - 2 * t);
};
export const smootherstep = (a, b, v) => {
  const t = clamp(inv(a, b, v));
  return t * t * t * (t * (t * 6 - 15) + 10);
};
export const TAU = Math.PI * 2;
export const deg = (d) => (d * Math.PI) / 180;

// --- Easing curves (organic acceleration / deceleration, no linear robotics) --
export const ease = {
  linear: (t) => t,
  inQuad: (t) => t * t,
  outQuad: (t) => t * (2 - t),
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  inCubic: (t) => t * t * t,
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outQuart: (t) => 1 - Math.pow(1 - t, 4),
  inOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
  outQuint: (t) => 1 - Math.pow(1 - t, 5),
  inOutQuint: (t) => (t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2),
  outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOutExpo: (t) =>
    t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  outSine: (t) => Math.sin((t * Math.PI) / 2),
  inSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  // restrained overshoot — used sparingly, never bouncy
  outBackSoft: (t) => {
    const c1 = 1.12, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  // cinematic settle: fast out, long tail
  settle: (t) => 1 - Math.pow(1 - t, 3.4),
  // anticipate then travel (used for stream launches)
  anticipate: (t) => (t < 0.18 ? -0.08 * Math.sin((t / 0.18) * Math.PI) : ease.outQuint(inv(0.18, 1, t))),
};

/** Cubic bezier timing curve (CSS-style), cached solver. */
export function cubicBezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sampleX = (t) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i++) {
      const dx = sampleX(t) - x;
      if (Math.abs(dx) < 1e-6) return sampleY(t);
      const d = sampleDX(t);
      if (Math.abs(d) < 1e-7) break;
      t -= dx / d;
    }
    let a = 0, b = 1;
    t = x;
    for (let i = 0; i < 24; i++) {
      const v = sampleX(t);
      if (Math.abs(v - x) < 1e-6) break;
      if (v > x) b = t; else a = t;
      t = (a + b) / 2;
    }
    return sampleY(t);
  };
}

// Signature curves used across the piece (consistent motion personality)
export const CURVE = {
  enter: cubicBezier(0.16, 0.84, 0.24, 1.0),     // soft decelerate in
  exit: cubicBezier(0.52, 0.0, 0.78, 0.2),        // accelerate away
  travel: cubicBezier(0.42, 0.0, 0.14, 1.0),      // data travel
  swap: cubicBezier(0.66, 0.0, 0.2, 1.0),         // morph / match cut
  camera: cubicBezier(0.36, 0.0, 0.1, 1.0),       // cinematic camera
  breathe: cubicBezier(0.4, 0.0, 0.6, 1.0),
};

/** Keyframe track: [{t, v, e?}] -> value at time (cubic-eased between keys). */
export function track(keys, time) {
  if (!keys.length) return 0;
  if (time <= keys[0].t) return keys[0].v;
  const last = keys[keys.length - 1];
  if (time >= last.t) return last.v;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (time >= a.t && time <= b.t) {
      const u = inv(a.t, b.t, time);
      const fn = typeof b.e === 'function' ? b.e : CURVE.enter;
      return lerp(a.v, b.v, fn(u));
    }
  }
  return last.v;
}

/** Deterministic hash-based RNG (stable across worker processes). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- value noise (smooth, deterministic, used for organic drift) ---
const PERM = (() => {
  const r = mulberry32(99173);
  const p = new Uint8Array(512);
  const base = new Uint8Array(256);
  for (let i = 0; i < 256; i++) base[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const t = base[i]; base[i] = base[j]; base[j] = t;
  }
  for (let i = 0; i < 512; i++) p[i] = base[i & 255];
  return p;
})();
const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const grad2 = (h, x, y) => {
  switch (h & 3) {
    case 0: return x + y;
    case 1: return -x + y;
    case 2: return x - y;
    default: return -x - y;
  }
};
/** 2D perlin-ish noise in [-1,1]. */
export function noise2(x, y) {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
  const xf = x - Math.floor(x), yf = y - Math.floor(y);
  const u = fade(xf), v = fade(yf);
  const aa = PERM[PERM[X] + Y], ab = PERM[PERM[X] + Y + 1];
  const ba = PERM[PERM[X + 1] + Y], bb = PERM[PERM[X + 1] + Y + 1];
  const x1 = lerp(grad2(aa, xf, yf), grad2(ba, xf - 1, yf), u);
  const x2 = lerp(grad2(ab, xf, yf - 1), grad2(bb, xf - 1, yf - 1), u);
  return lerp(x1, x2, v);
}
export function fbm2(x, y, oct = 3) {
  let a = 0.5, f = 1, s = 0, n = 0;
  for (let i = 0; i < oct; i++) { s += a * noise2(x * f, y * f); n += a; a *= 0.5; f *= 2.03; }
  return s / n;
}

/** Catmull-Rom spline point for smooth camera / path motion. */
export function catmull(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

/** Quadratic bezier helpers for flowing connection paths. */
export function qbez(p0, p1, p2, t) {
  const mt = 1 - t;
  return { x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x, y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y };
}
export function qbezTangent(p0, p1, p2, t) {
  const mt = 1 - t;
  const x = 2 * mt * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
  const y = 2 * mt * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
  const l = Math.hypot(x, y) || 1;
  return { x: x / l, y: y / l };
}
export function cbez(p0, p1, p2, p3, t) {
  const mt = 1 - t, a = mt * mt * mt, b = 3 * mt * mt * t, c = 3 * mt * t * t, d = t * t * t;
  return { x: a * p0.x + b * p1.x + c * p2.x + d * p3.x, y: a * p0.y + b * p1.y + c * p2.y + d * p3.y };
}
export function cbezTangent(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  const x = 3 * mt * mt * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x);
  const y = 3 * mt * mt * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y);
  const l = Math.hypot(x, y) || 1;
  return { x: x / l, y: y / l };
}

/** Window helper: returns 0..1 progress of a time window, eased. */
export function win(time, start, dur, curve = CURVE.enter) {
  if (dur <= 0) return time >= start ? 1 : 0;
  return curve(clamp((time - start) / dur));
}
/** Pulse envelope: 0 -> 1 -> 0 over [start, start+dur]. */
export function pulse(time, start, dur, shape = 1.6) {
  const t = clamp((time - start) / dur);
  if (t <= 0 || t >= 1) return 0;
  return Math.pow(Math.sin(t * Math.PI), shape);
}
/** One-shot decaying impulse starting at `start`. */
export function impulse(time, start, decay = 0.5, attack = 0.04) {
  const d = time - start;
  if (d < 0) return 0;
  if (d < attack) return d / attack;
  return Math.exp(-(d - attack) / decay);
}
