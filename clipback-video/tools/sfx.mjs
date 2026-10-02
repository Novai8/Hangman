// ---------------------------------------------------------------------------
// Sound design engine.
// Synthesises a library of restrained digital-interface sounds (no game SFX,
// no meme/casino/cash sounds, no music), renders each one to assets/sfx/ and
// then lays them onto a single stereo SFX bus at the cue times stored in the
// .tsrct project. The bus is later side-chain ducked under the narration.
// ---------------------------------------------------------------------------
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SR = 48000;

// ---------------------------------------------------------------------- utils
const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const TAU = Math.PI * 2;
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return (((t ^ (t >>> 14)) >>> 0) / 4294967296) * 2 - 1;
  };
}
/** state-variable filter (12 dB/oct) */
function svf(buf, cutoffFn, qv, mode) {
  const out = new Float32Array(buf.length);
  let low = 0, bandv = 0;
  for (let i = 0; i < buf.length; i++) {
    const fc = clamp(cutoffFn(i / buf.length), 20, SR * 0.45);
    const f = 2 * Math.sin((Math.PI * fc) / SR);
    const q = 1 / Math.max(0.5, qv);
    const high = buf[i] - low - q * bandv;
    bandv += f * high;
    low += f * bandv;
    out[i] = mode === 'lp' ? low : mode === 'hp' ? high : bandv;
  }
  return out;
}
function env(n, { a = 0.004, d = 0.1, s = 0, r = 0.1, curve = 2.2 }) {
  const out = new Float32Array(n);
  const A = Math.max(1, Math.round(a * SR));
  const D = Math.max(1, Math.round(d * SR));
  const R = Math.max(1, Math.round(r * SR));
  const S = Math.max(0, n - A - D - R);
  for (let i = 0; i < n; i++) {
    let v;
    if (i < A) v = i / A;
    else if (i < A + D) v = 1 - (1 - s) * Math.pow((i - A) / D, 1 / curve);
    else if (i < A + D + S) v = s;
    else v = s * Math.pow(1 - clamp((i - A - D - S) / R), curve);
    out[i] = v;
  }
  return out;
}
function noise(n, seed) {
  const r = rng(seed);
  const o = new Float32Array(n);
  for (let i = 0; i < n; i++) o[i] = r();
  return o;
}
const sec = (x) => Math.round(x * SR);

/** mono -> {l,r} with a gentle stereo placement + Haas width */
function place(mono, pan = 0, width = 0.0) {
  const n = mono.length;
  const l = new Float32Array(n), r = new Float32Array(n);
  const p = clamp((pan + 1) / 2, 0, 1);
  const gl = Math.cos(p * Math.PI / 2), gr = Math.sin(p * Math.PI / 2);
  const d = Math.round(width * 0.0008 * SR);
  for (let i = 0; i < n; i++) {
    l[i] = mono[i] * gl;
    r[i] = (i - d >= 0 ? mono[i - d] : 0) * gr;
  }
  return { l, r };
}

function softClipSample(x) {
  return Math.tanh(x * 1.35) / 1.1;
}

// ------------------------------------------------------------------ generators
const G = {};

/** soft UI tick — a short filtered impulse, never clicky-harsh */
G.tick = () => {
  const n = sec(0.055);
  const e = env(n, { a: 0.0008, d: 0.03, s: 0, r: 0.02, curve: 3 });
  const nz = svf(noise(n, 11), (u) => 5200 - 2600 * u, 1.1, 'bp');
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const tt = i / SR;
    out[i] = (nz[i] * 0.55 + Math.sin(TAU * 2100 * tt) * 0.3) * e[i];
  }
  return out;
};

/** a node appears — tiny sine blip with air */
G.nodeBirth = () => {
  const n = sec(0.32);
  const e = env(n, { a: 0.003, d: 0.12, s: 0.04, r: 0.18, curve: 2.6 });
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const tt = i / SR;
    const f = 1180 + 220 * Math.exp(-tt * 22);
    out[i] = (Math.sin(TAU * f * tt) * 0.5 + Math.sin(TAU * f * 2.01 * tt) * 0.12) * e[i];
  }
  const air = svf(noise(n, 23), () => 7200, 0.9, 'bp');
  for (let i = 0; i < n; i++) out[i] += air[i] * e[i] * 0.1;
  return out;
};

/** two nodes connect — a soft interval, like a latch */
G.connect = () => {
  const n = sec(0.42);
  const e1 = env(n, { a: 0.002, d: 0.1, s: 0.05, r: 0.26, curve: 2.4 });
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const tt = i / SR;
    const second = tt > 0.055 ? 1 : 0;
    out[i] = (Math.sin(TAU * 880 * tt) * 0.34 + second * Math.sin(TAU * 1320 * (tt - 0.055)) * 0.28) * e1[i];
  }
  return out;
};

/** several nodes at once */
G.nodeCluster = () => {
  const n = sec(0.5);
  const out = new Float32Array(n);
  const freqs = [980, 1240, 1480, 1760];
  freqs.forEach((f, k) => {
    const off = sec(0.028 * k);
    const e = env(n - off, { a: 0.002, d: 0.1, s: 0.03, r: 0.22, curve: 2.6 });
    for (let i = 0; i < n - off; i++) {
      out[i + off] += Math.sin(TAU * f * (i / SR)) * e[i] * 0.22;
    }
  });
  return out;
};

/** network expands — airy upward sweep, controlled */
G.expand = () => {
  const n = sec(0.62);
  const e = env(n, { a: 0.03, d: 0.18, s: 0.3, r: 0.34, curve: 2 });
  const nz = svf(noise(n, 41), (u) => 500 + 5200 * Math.pow(u, 1.6), 1.6, 'bp');
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const tt = i / SR;
    out[i] = nz[i] * e[i] * 0.42 + Math.sin(TAU * (260 + 520 * (i / n)) * tt) * e[i] * 0.08;
  }
  return out;
};

/** controlled riser — never a hype build */
G.riser = () => {
  const n = sec(1.05);
  const e = env(n, { a: 0.5, d: 0.3, s: 0.6, r: 0.22, curve: 1.6 });
  const nz = svf(noise(n, 57), (u) => 320 + 3400 * Math.pow(u, 2.2), 2.4, 'bp');
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = nz[i] * e[i] * 0.34;
  return out;
};

/** the wordmark forms — layered soft bells, short */
G.formWord = () => {
  const n = sec(1.25);
  const out = new Float32Array(n);
  const partials = [[392, 1], [588, 0.5], [784, 0.34], [1176, 0.16]];
  partials.forEach(([f, g], k) => {
    const off = sec(0.012 * k);
    const e = env(n - off, { a: 0.004, d: 0.4, s: 0.06, r: 0.6, curve: 2.6 });
    for (let i = 0; i < n - off; i++) out[i + off] += Math.sin(TAU * f * (i / SR)) * e[i] * g * 0.2;
  });
  const air = svf(noise(n, 71), (u) => 4000 + 3000 * (1 - u), 1.2, 'bp');
  const ae = env(n, { a: 0.006, d: 0.3, s: 0, r: 0.4, curve: 3 });
  for (let i = 0; i < n; i++) out[i] += air[i] * ae[i] * 0.1;
  return out;
};

/** soft transition sweep between regions */
G.sweep = () => {
  const n = sec(0.95);
  const e = env(n, { a: 0.14, d: 0.3, s: 0.22, r: 0.4, curve: 1.8 });
  const nz = svf(noise(n, 83), (u) => 2600 - 1800 * u + 900 * Math.sin(u * Math.PI), 1.4, 'bp');
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = nz[i] * e[i] * 0.3;
  return out;
};

/** interface card materialises */
G.cardIn = () => {
  const n = sec(0.42);
  const e = env(n, { a: 0.002, d: 0.08, s: 0.07, r: 0.3, curve: 2.6 });
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const tt = i / SR;
    out[i] = (Math.sin(TAU * 660 * tt) * 0.26 + Math.sin(TAU * 1320 * tt) * 0.1) * e[i];
  }
  const tk = G.tick();
  for (let i = 0; i < tk.length; i++) out[i] += tk[i] * 0.4;
  return out;
};

/** structural plate appears */
G.substrate = () => {
  const n = sec(0.9);
  const e = env(n, { a: 0.02, d: 0.26, s: 0.12, r: 0.5, curve: 2.2 });
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const tt = i / SR;
    out[i] = (Math.sin(TAU * 110 * tt) * 0.3 + Math.sin(TAU * 220 * tt) * 0.12) * e[i];
  }
  const nz = svf(noise(n, 97), (u) => 900 + 400 * u, 1.0, 'lp');
  for (let i = 0; i < n; i++) out[i] += nz[i] * e[i] * 0.12;
  return out;
};

/** continuous data movement — short texture, used as a soft bed */
G.dataFlowIn = () => {
  const n = sec(1.6);
  const e = env(n, { a: 0.18, d: 0.4, s: 0.5, r: 0.7, curve: 1.8 });
  const nz = svf(noise(n, 113), (u) => 1600 + 700 * Math.sin(u * 7), 2.2, 'bp');
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const tt = i / SR;
    out[i] = nz[i] * e[i] * 0.2 * (0.7 + 0.3 * Math.sin(TAU * 3.1 * tt));
  }
  return out;
};

/** small confirmation */
G.confirm = () => {
  const n = sec(0.5);
  const out = new Float32Array(n);
  [[784, 0], [1046, 0.07]].forEach(([f, off]) => {
    const o = sec(off);
    const e = env(n - o, { a: 0.002, d: 0.12, s: 0.02, r: 0.3, curve: 2.6 });
    for (let i = 0; i < n - o; i++) out[i + o] += Math.sin(TAU * f * (i / SR)) * e[i] * 0.24;
  });
  return out;
};

/** elements merge */
G.merge = () => {
  const n = sec(0.85);
  const e = env(n, { a: 0.05, d: 0.26, s: 0.1, r: 0.42, curve: 2.2 });
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const u = i / n;
    const tt = i / SR;
    const f = 760 - 260 * u;
    out[i] = Math.sin(TAU * f * tt) * e[i] * 0.26;
  }
  const nz = svf(noise(n, 131), (u) => 3200 - 2200 * u, 1.3, 'bp');
  for (let i = 0; i < n; i++) out[i] += nz[i] * e[i] * 0.12;
  return out;
};

/** aperture opens */
G.aperture = () => {
  const n = sec(0.7);
  const e = env(n, { a: 0.01, d: 0.2, s: 0.1, r: 0.4, curve: 2.4 });
  const nz = svf(noise(n, 149), (u) => 800 + 2600 * u, 2.8, 'bp');
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = nz[i] * e[i] * 0.3;
  for (let i = 0; i < n; i++) out[i] += Math.sin(TAU * 520 * (i / SR)) * e[i] * 0.1;
  return out;
};

/** the stream divides — one body becoming two */
G.split = () => {
  const n = sec(1.15);
  const out = new Float32Array(n);
  const e0 = env(n, { a: 0.004, d: 0.16, s: 0.08, r: 0.5, curve: 2.4 });
  for (let i = 0; i < n; i++) {
    const tt = i / SR;
    out[i] = Math.sin(TAU * 440 * tt) * e0[i] * 0.2;
  }
  // two diverging voices
  [[523.25, 0.055, 1], [392.0, 0.055, -1]].forEach(([f, off]) => {
    const o = sec(off);
    const e = env(n - o, { a: 0.004, d: 0.22, s: 0.05, r: 0.5, curve: 2.4 });
    for (let i = 0; i < n - o; i++) {
      const tt = i / SR;
      out[i + o] += Math.sin(TAU * f * tt) * e[i] * 0.17;
    }
  });
  const nz = svf(noise(n, 167), (u) => 2400 + 1200 * Math.sin(u * 3), 1.6, 'bp');
  const ne = env(n, { a: 0.004, d: 0.2, s: 0, r: 0.35, curve: 3 });
  for (let i = 0; i < n; i++) out[i] += nz[i] * ne[i] * 0.14;
  return out;
};

/** a branch activates */
G.activate = () => {
  const n = sec(0.62);
  const e = env(n, { a: 0.003, d: 0.14, s: 0.08, r: 0.36, curve: 2.4 });
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const tt = i / SR;
    const f = 300 + 340 * (1 - Math.exp(-tt * 26));
    out[i] = (Math.sin(TAU * f * tt) * 0.3 + Math.sin(TAU * f * 2 * tt) * 0.1) * e[i];
  }
  const tk = G.tick();
  for (let i = 0; i < tk.length; i++) out[i] += tk[i] * 0.45;
  return out;
};

/** the token object forms */
G.tokenForm = () => {
  const n = sec(0.95);
  const out = new Float32Array(n);
  [[466.16, 1], [698.46, 0.42], [932.33, 0.22]].forEach(([f, g], k) => {
    const o = sec(0.02 * k);
    const e = env(n - o, { a: 0.004, d: 0.3, s: 0.05, r: 0.5, curve: 2.6 });
    for (let i = 0; i < n - o; i++) out[i + o] += Math.sin(TAU * f * (i / SR)) * e[i] * g * 0.2;
  });
  return out;
};

/** stream absorbed into the token (BUY) */
G.absorb = () => {
  const n = sec(0.8);
  const e = env(n, { a: 0.02, d: 0.24, s: 0.1, r: 0.4, curve: 2.2 });
  const nz = svf(noise(n, 181), (u) => 3000 - 2200 * u, 1.8, 'bp');
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const tt = i / SR;
    out[i] = nz[i] * e[i] * 0.26 + Math.sin(TAU * (620 - 220 * (i / n)) * tt) * e[i] * 0.14;
  }
  return out;
};

/** BURN — a contraction, not an explosion */
G.burn = () => {
  const n = sec(1.35);
  const e = env(n, { a: 0.008, d: 0.42, s: 0.08, r: 0.6, curve: 2.0 });
  const nz = svf(noise(n, 199), (u) => 2600 * Math.pow(1 - u, 1.8) + 180, 1.9, 'lp');
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const u = i / n;
    const tt = i / SR;
    const f = 300 * Math.pow(1 - u * 0.75, 1.4) + 60;
    out[i] = nz[i] * e[i] * 0.26 + Math.sin(TAU * f * tt) * e[i] * 0.22;
  }
  return out;
};

/** network ripple after an event */
G.ripple = () => {
  const n = sec(1.1);
  const e = env(n, { a: 0.03, d: 0.4, s: 0.06, r: 0.55, curve: 2.4 });
  const nz = svf(noise(n, 211), (u) => 1400 + 2400 * (1 - u), 2.6, 'bp');
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = nz[i] * e[i] * 0.18;
  return out;
};

/** mechanism engaging */
G.mechanism = () => {
  const n = sec(0.8);
  const out = new Float32Array(n);
  for (let k = 0; k < 3; k++) {
    const o = sec(0.07 * k);
    const e = env(n - o, { a: 0.001, d: 0.05, s: 0, r: 0.1, curve: 3 });
    const nz = svf(noise(n - o, 223 + k), () => 1800 + k * 500, 1.2, 'bp');
    for (let i = 0; i < n - o; i++) out[i + o] += nz[i] * e[i] * 0.2;
  }
  const e2 = env(n, { a: 0.02, d: 0.3, s: 0.05, r: 0.36, curve: 2.2 });
  for (let i = 0; i < n; i++) out[i] += Math.sin(TAU * 196 * (i / SR)) * e2[i] * 0.14;
  return out;
};

/** the system converges */
G.converge = () => {
  const n = sec(1.7);
  const e = env(n, { a: 0.6, d: 0.4, s: 0.5, r: 0.6, curve: 1.7 });
  const nz = svf(noise(n, 239), (u) => 2800 - 2100 * u, 2.2, 'bp');
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const tt = i / SR;
    out[i] = nz[i] * e[i] * 0.22 + Math.sin(TAU * (160 + 90 * (i / n)) * tt) * e[i] * 0.1;
  }
  return out;
};

/** collapse to a point */
G.collapse = () => {
  const n = sec(0.75);
  const e = env(n, { a: 0.004, d: 0.2, s: 0.04, r: 0.4, curve: 2.6 });
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const u = i / n;
    const tt = i / SR;
    const f = 900 * Math.pow(1 - u, 1.5) + 90;
    out[i] = Math.sin(TAU * f * tt) * e[i] * 0.26;
  }
  const nz = svf(noise(n, 251), (u) => 4200 * (1 - u) + 200, 1.4, 'lp');
  for (let i = 0; i < n; i++) out[i] += nz[i] * e[i] * 0.14;
  return out;
};

/** final mark lands — restrained, clean */
G.finalImpact = () => {
  const n = sec(2.4);
  const out = new Float32Array(n);
  const sub = env(n, { a: 0.006, d: 0.5, s: 0.05, r: 1.2, curve: 2.0 });
  for (let i = 0; i < n; i++) {
    const tt = i / SR;
    out[i] += Math.sin(TAU * 74 * tt) * sub[i] * 0.3 + Math.sin(TAU * 148 * tt) * sub[i] * 0.08;
  }
  [[523.25, 1], [784, 0.4], [1046.5, 0.2]].forEach(([f, g], k) => {
    const o = sec(0.016 * k);
    const e = env(n - o, { a: 0.004, d: 0.6, s: 0.03, r: 1.2, curve: 2.6 });
    for (let i = 0; i < n - o; i++) out[i + o] += Math.sin(TAU * f * (i / SR)) * e[i] * g * 0.14;
  });
  const air = svf(noise(n, 263), (u) => 5000 * (1 - u * 0.7) + 600, 1.0, 'bp');
  const ae = env(n, { a: 0.01, d: 0.5, s: 0.02, r: 1.0, curve: 2.8 });
  for (let i = 0; i < n; i++) out[i] += air[i] * ae[i] * 0.08;
  return out;
};

/** quiet settle — carries the end card to the fade */
G.settle = () => {
  const n = sec(3.6);
  const e = env(n, { a: 0.12, d: 1.4, s: 0.22, r: 1.9, curve: 1.9 });
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const tt = i / SR;
    out[i] = (Math.sin(TAU * 261.63 * tt) * 0.1 + Math.sin(TAU * 392 * tt) * 0.045
      + Math.sin(TAU * 130.81 * tt) * 0.05) * e[i];
  }
  const air = svf(noise(n, 409), (u) => 3200 + 1800 * Math.sin(u * 5), 1.1, 'bp');
  for (let i = 0; i < n; i++) out[i] += air[i] * e[i] * 0.08;
  return out;
};

/** soft rounded data pulse */
G.pulseSoft = () => {
  const n = sec(0.55);
  const e = env(n, { a: 0.012, d: 0.16, s: 0.05, r: 0.3, curve: 2.4 });
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const tt = i / SR;
    out[i] = (Math.sin(TAU * 348 * tt) * 0.2 + Math.sin(TAU * 522 * tt) * 0.08) * e[i];
  }
  const nz = svf(noise(n, 419), (u) => 2200 - 1200 * u, 1.5, 'bp');
  for (let i = 0; i < n; i++) out[i] += nz[i] * e[i] * 0.1;
  return out;
};

/** tiny mechanical latch — an element locking into the system */
G.latch = () => {
  const n = sec(0.16);
  const out = new Float32Array(n);
  for (let k = 0; k < 2; k++) {
    const o = sec(0.022 * k);
    const e = env(n - o, { a: 0.0006, d: 0.018, s: 0, r: 0.05, curve: 3.2 });
    const nz = svf(noise(n - o, 431 + k), () => 2600 + k * 1400, 1.1, 'bp');
    for (let i = 0; i < n - o; i++) out[i + o] += nz[i] * e[i] * (0.26 - k * 0.1);
  }
  return out;
};

/** room tone in / out — texture only, not music */
function ambience(dur, seed, fadeIn, fadeOut) {
  const n = sec(dur);
  const nz = svf(noise(n, seed), (u) => 300 + 160 * Math.sin(u * 11), 0.8, 'lp');
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const tt = i / SR;
    const fi = clamp(tt / fadeIn);
    const fo = clamp((dur - tt) / fadeOut);
    const wob = 0.72 + 0.28 * Math.sin(TAU * 0.07 * tt) * Math.sin(TAU * 0.031 * tt + 1.3);
    out[i] = nz[i] * 0.1 * fi * fo * wob;
  }
  return out;
}
G.ambienceIn = () => ambience(22, 311, 2.2, 6.0);
G.ambienceOut = () => ambience(4.0, 337, 1.0, 2.0);

/** continuous low room tone for the whole film — fills every gap, never musical */
G.bedLow = () => {
  const n = sec(45.5);
  const nz = svf(noise(n, 503), (u) => 150 + 90 * Math.sin(u * 17) + 50 * Math.sin(u * 4.3), 0.9, 'lp');
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const tt = i / SR;
    const fi = clamp(tt / 1.6);
    const fo = clamp((45.5 - tt) / 2.0);
    const wob = 0.6 + 0.4 * Math.sin(TAU * 0.041 * tt + 0.7) * Math.sin(TAU * 0.017 * tt);
    out[i] = nz[i] * 0.36 * fi * fo * wob;
  }
  return out;
};

/** continuous air layer — the sense of a live interface */
G.bedAir = () => {
  const n = sec(45.5);
  const nz = svf(noise(n, 521), (u) => 3600 + 1500 * Math.sin(u * 9.4), 2.0, 'bp');
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const tt = i / SR;
    const fi = clamp(tt / 2.4);
    const fo = clamp((45.5 - tt) / 2.4);
    const wob = 0.45 + 0.55 * Math.abs(Math.sin(TAU * 0.029 * tt + 1.9));
    out[i] = nz[i] * 0.1 * fi * fo * wob;
  }
  return out;
};

// ---------------------------------------------------------------------- write
function writeWav(file, chans, sr = SR) {
  const n = chans[0].length;
  const ch = chans.length;
  const buf = Buffer.alloc(44 + n * ch * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * ch * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(ch, 22);
  buf.writeUInt32LE(sr, 24);
  buf.writeUInt32LE(sr * ch * 2, 28);
  buf.writeUInt16LE(ch * 2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * ch * 2, 40);
  let o = 44;
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < ch; c++) {
      const v = Math.max(-1, Math.min(1, chans[c][i]));
      buf.writeInt16LE(Math.round(v * 32767), o);
      o += 2;
    }
  }
  fs.writeFileSync(file, buf);
}

function resample(src, ratio) {
  if (Math.abs(ratio - 1) < 1e-4) return src;
  const n = Math.max(1, Math.round(src.length / ratio));
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = i * ratio;
    const i0 = Math.floor(x), i1 = Math.min(src.length - 1, i0 + 1);
    const f = x - i0;
    out[i] = (src[i0] ?? 0) * (1 - f) + (src[i1] ?? 0) * f;
  }
  return out;
}

// ------------------------------------------------------------------------ main
const project = JSON.parse(fs.readFileSync(path.join(ROOT, 'project/Clipback_CLIP_Motion_Design.tsrct'), 'utf8'));
const DUR = project.composition.duration + 1.2;
const sfxDir = path.join(ROOT, 'assets/sfx');
fs.mkdirSync(sfxDir, { recursive: true });

// render + save the library
const lib = {};
for (const [name, fn] of Object.entries(G)) {
  const mono = fn();
  lib[name] = mono;
  writeWav(path.join(sfxDir, `${name}.wav`), [mono]);
}
console.log('library:', Object.keys(lib).length, 'sounds');

// lay the cues onto the bus
const N = sec(DUR);
const busL = new Float32Array(N);
const busR = new Float32Array(N);
// deterministic, musical-but-not-musical panning per cue index
const panFor = { tick: 0.18, nodeBirth: -0.22, connect: 0.2, nodeCluster: -0.1, expand: 0, riser: 0,
  formWord: 0, sweep: 0, cardIn: -0.16, substrate: 0, dataFlowIn: 0.1, confirm: 0.14, merge: 0,
  aperture: 0, split: 0, activate: -0.3, tokenForm: 0.3, absorb: 0.28, burn: 0.26, ripple: 0,
  mechanism: 0.22, converge: 0, collapse: 0, finalImpact: 0, settle: 0, ambienceIn: 0, ambienceOut: 0,
  bedLow: 0, bedAir: 0, pulseSoft: -0.12, latch: 0.24 };

let placed = 0;
for (const cue of project.sfxCues) {
  const base = lib[cue.id];
  if (!base) { console.warn('missing sfx', cue.id); continue; }
  const mono = cue.pitch ? resample(base, cue.pitch) : base;
  let pan = panFor[cue.id] ?? 0;
  if (cue.id === 'activate' && cue.t > 23) pan = 0.3;          // 20% branch sits right
  if (cue.id === 'cardIn') pan = (cue.t % 2 < 1 ? -0.2 : 0.2);
  const width = cue.id === 'tick' || cue.id === 'latch' ? 0 : cue.id.startsWith('bed') ? 1.0 : 0.35;
  const { l, r } = place(mono, pan, width);
  const off = sec(cue.t);
  const g = cue.gain ?? 0.3;
  for (let i = 0; i < mono.length; i++) {
    const k = off + i;
    if (k < 0 || k >= N) continue;
    busL[k] += l[i] * g;
    busR[k] += r[i] * g;
  }
  placed++;
}

// gentle bus glue: soft clip + dc block + tiny high-pass
let pL = 0, pR = 0, yL = 0, yR = 0;
const R = 1 - 1 / (SR * 0.02);
let peak = 0;
for (let i = 0; i < N; i++) {
  yL = busL[i] - pL + R * yL; pL = busL[i];
  yR = busR[i] - pR + R * yR; pR = busR[i];
  busL[i] = softClipSample(yL * 0.92);
  busR[i] = softClipSample(yR * 0.92);
  peak = Math.max(peak, Math.abs(busL[i]), Math.abs(busR[i]));
}
console.log('cues placed:', placed, 'bus peak:', peak.toFixed(3));
const norm = peak > 0.86 ? 0.86 / peak : 1;
if (norm !== 1) for (let i = 0; i < N; i++) { busL[i] *= norm; busR[i] *= norm; }

writeWav(path.join(sfxDir, 'clipback_sfx_bus.wav'), [busL, busR]);
console.log('-> assets/sfx/clipback_sfx_bus.wav', (N / SR).toFixed(2) + 's');
