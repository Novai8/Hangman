// ---------------------------------------------------------------------------
// The living world: camera, multi-depth network field, particle field and
// floating interface fragments. One continuous system for the whole film —
// scenes reconfigure it, they never replace it.
// ---------------------------------------------------------------------------
import { rgba, PAL, mixHex } from './color.js';
import { blit, dotSprite, glowSprite, roundRectPath } from './gfx.js';
import { clamp, lerp, smoothstep, TAU, fbm2, mulberry32, noise2 } from './math.js';

export const W = 1080;
export const H = 1920;

// --------------------------------------------------------------------------
export class Camera {
  constructor() {
    this.x = 0; this.y = 0; this.zoom = 1; this.rot = 0;
    this.shake = 0;
    this._sx = 0; this._sy = 0;
  }
  set(x, y, zoom, rot = 0) { this.x = x; this.y = y; this.zoom = zoom; this.rot = rot; }
  /** micro handheld-free organic float so the frame is never dead */
  breathe(t, amp = 1) {
    this._sx = fbm2(t * 0.11, 3.2) * 9 * amp;
    this._sy = fbm2(5.7, t * 0.098) * 11 * amp;
  }
  project(px, py, depth = 1) {
    const z = 1 + (this.zoom - 1) * depth;
    const cx = (this.x + this._sx) * depth;
    const cy = (this.y + this._sy) * depth;
    let dx = px - cx;
    let dy = py - cy;
    if (this.rot) {
      const c = Math.cos(this.rot * depth), s = Math.sin(this.rot * depth);
      const rx = dx * c - dy * s;
      dy = dx * s + dy * c; dx = rx;
    }
    return { x: dx * z + W / 2, y: dy * z + H / 2, s: z };
  }
  scaleAt(depth = 1) { return 1 + (this.zoom - 1) * depth; }
}

// --------------------------------------------------------------------------
/** One depth slab of the background network. */
class NetLayer {
  constructor({ count, depth, spread, seed, size, color, edgeDist, maxEdges, alpha, driftAmp, driftSpeed }) {
    this.depth = depth;
    this.alpha = alpha;
    this.color = color;
    this.size = size;
    this.driftAmp = driftAmp;
    this.driftSpeed = driftSpeed;
    const r = mulberry32(seed);
    this.nodes = [];
    for (let i = 0; i < count; i++) {
      // blue-noise-ish scatter via jittered grid
      const cols = Math.ceil(Math.sqrt(count * (spread.w / spread.h)));
      const rows = Math.ceil(count / cols);
      const gx = i % cols, gy = Math.floor(i / cols);
      const x = (-spread.w / 2) + ((gx + 0.5 + (r() - 0.5) * 0.92) / cols) * spread.w;
      const y = (-spread.h / 2) + ((gy + 0.5 + (r() - 0.5) * 0.92) / rows) * spread.h;
      this.nodes.push({
        bx: x, by: y, x, y,
        px: x, py: y,
        ph: r() * TAU,
        sp: 0.5 + r() * 0.9,
        sz: (0.55 + r() * 0.85),
        blink: r(),
        blinkRate: 0.35 + r() * 1.1,
        charge: 0,
        tx: 0, ty: 0, tw: 0, // morph target
        hot: 0,
        id: i,
      });
    }
    // static neighbour graph from base positions
    this.edges = [];
    const n = this.nodes.length;
    for (let i = 0; i < n; i++) {
      const cand = [];
      for (let j = i + 1; j < n; j++) {
        const d = Math.hypot(this.nodes[i].bx - this.nodes[j].bx, this.nodes[i].by - this.nodes[j].by);
        if (d < edgeDist) cand.push({ j, d });
      }
      cand.sort((a, b) => a.d - b.d);
      for (let k = 0; k < Math.min(maxEdges, cand.length); k++) {
        this.edges.push({ a: i, b: cand[k].j, d0: cand[k].d, ph: r() * TAU, sp: 0.18 + r() * 0.42, live: r() });
      }
    }
  }
}

export class NetworkField {
  constructor() {
    this.layers = [
      new NetLayer({ count: 54, depth: 0.34, spread: { w: 2600, h: 3600 }, seed: 1337, size: 2.0,
        color: PAL.indigo, edgeDist: 430, maxEdges: 2, alpha: 0.30, driftAmp: 26, driftSpeed: 0.055 }),
      new NetLayer({ count: 64, depth: 0.62, spread: { w: 2050, h: 2900 }, seed: 8081, size: 2.6,
        color: PAL.indigoSoft, edgeDist: 330, maxEdges: 2, alpha: 0.42, driftAmp: 20, driftSpeed: 0.08 }),
      new NetLayer({ count: 46, depth: 0.95, spread: { w: 1650, h: 2400 }, seed: 5150, size: 3.3,
        color: PAL.blue, edgeDist: 300, maxEdges: 2, alpha: 0.5, driftAmp: 15, driftSpeed: 0.11 }),
    ];
    this.impulses = [];        // {x,y,r0,r1,t0,dur,strength,depth}
    this.attractors = [];      // {x,y,w,radius}
    this.morph = null;         // {points:[{x,y}], weight, layerIdx}
    this.energy = 0;           // 0..1 global activity from the narration envelope
    this.branchMode = 0;       // 0..1 — field reorganises around two branches
    this.branchA = { x: -250, y: 200 };
    this.branchB = { x: 250, y: 600 };
    this.convergence = 0;      // 0..1 pull everything toward convergePoint
    this.convergePoint = { x: 0, y: 0 };
    this.tint = 0;             // 0..1 shift indigo -> violet
  }

  addImpulse(x, y, t0, { dur = 1.1, strength = 1, r1 = 900 } = {}) {
    this.impulses.push({ x, y, t0, dur, strength, r1 });
  }

  /** Assign morph targets (e.g. wordmark point cloud) to the nearest layer nodes. */
  setMorph(points, weight, layerIdx = 2) {
    this.morph = points && weight > 0.001 ? { points, weight, layerIdx } : null;
  }

  update(t) {
    const act = this.energy;
    for (let li = 0; li < this.layers.length; li++) {
      const L = this.layers[li];
      const amp = L.driftAmp * (1 + act * 0.35);
      for (const nd of L.nodes) {
        const nx = fbm2(nd.bx * 0.0016 + 11.3, nd.by * 0.0016 + t * L.driftSpeed, 2);
        const ny = fbm2(nd.by * 0.0016 + 41.7, nd.bx * 0.0016 - t * L.driftSpeed * 0.86, 2);
        let x = nd.bx + nx * amp;
        let y = nd.by + ny * amp;

        // branch reorganisation: pull nodes toward one of two diagonal corridors
        if (this.branchMode > 0.001) {
          const target = nd.id % 10 < 8 ? this.branchA : this.branchB;
          const k = this.branchMode * (0.1 + 0.26 * ((nd.id % 7) / 7)) * (li === 2 ? 1 : 0.55);
          const dx = target.x - x, dy = target.y - y;
          const dist = Math.hypot(dx, dy) || 1;
          const corridor = clamp(1 - dist / 1500);
          x += dx * k * corridor;
          y += dy * k * corridor;
        }

        // convergence
        if (this.convergence > 0.001) {
          const k = this.convergence * (0.25 + 0.65 * ((nd.id % 5) / 5)) * (0.45 + L.depth * 0.75);
          x = lerp(x, this.convergePoint.x, clamp(k));
          y = lerp(y, this.convergePoint.y, clamp(k));
        }

        // impulses push nodes outward briefly then settle
        let hot = 0;
        for (const im of this.impulses) {
          const age = t - im.t0;
          if (age < 0 || age > im.dur) continue;
          const u = age / im.dur;
          const radius = im.r1 * smoothstep(0, 0.85, u);
          const d = Math.hypot(x - im.x, y - im.y);
          const band = Math.exp(-Math.pow((d - radius) / 120, 2));
          const decay = 1 - u;
          const f = band * decay * im.strength;
          if (f > 0.002 && d > 1) {
            x += ((x - im.x) / d) * f * 34;
            y += ((y - im.y) / d) * f * 34;
            hot = Math.max(hot, f);
          }
        }
        nd.hot = hot;

        // morph (wordmark assembly) on the chosen layer
        if (this.morph && this.morph.layerIdx === li) {
          const pts = this.morph.points;
          const p = pts[nd.id % pts.length];
          const w = clamp(this.morph.weight * (0.86 + 0.14 * ((nd.id % 3) / 2)));
          x = lerp(x, p.x, w);
          y = lerp(y, p.y, w);
        }

        nd.x = x; nd.y = y;
      }
    }
    // prune impulses
    this.impulses = this.impulses.filter((im) => t - im.t0 < im.dur + 0.1);
  }

  draw(ctx, cam, t, opts = {}) {
    const gain = opts.gain ?? 1;
    if (gain <= 0.004) return;
    const act = this.energy;
    for (let li = 0; li < this.layers.length; li++) {
      const L = this.layers[li];
      const col = this.tint > 0.01 ? mixHex(L.color, PAL.violet, this.tint * 0.55) : L.color;
      const baseA = L.alpha * gain;
      // --- edges
      ctx.save();
      ctx.lineCap = 'round';
      for (const e of L.edges) {
        const a = L.nodes[e.a], b = L.nodes[e.b];
        const pa = cam.project(a.x, a.y, L.depth);
        const pb = cam.project(b.x, b.y, L.depth);
        if ((pa.x < -220 && pb.x < -220) || (pa.x > W + 220 && pb.x > W + 220)) continue;
        if ((pa.y < -220 && pb.y < -220) || (pa.y > H + 220 && pb.y > H + 220)) continue;
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const stretch = clamp(1 - Math.abs(d - e.d0) / (e.d0 * 1.5 + 60));
        const breath = 0.5 + 0.5 * Math.sin(t * e.sp + e.ph);
        const hot = Math.max(a.hot, b.hot);
        const al = baseA * 0.42 * stretch * (0.35 + 0.45 * breath + 0.5 * hot + 0.18 * act);
        if (al < 0.006) continue;
        ctx.strokeStyle = rgba(hot > 0.05 ? mixHex(col, PAL.blueBright, clamp(hot * 1.6)) : col, al);
        ctx.lineWidth = Math.max(0.5, (0.8 + hot * 1.5) * pa.s);
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      }
      ctx.restore();

      // --- travelling pulses along a deterministic subset of edges
      const spr = dotSprite(mixHex(col, PAL.blueBright, 0.5), 48);
      const pulseCount = Math.min(L.edges.length, Math.round(L.edges.length * (0.22 + 0.3 * act)));
      for (let k = 0; k < pulseCount; k++) {
        const e = L.edges[(k * 7 + 3) % L.edges.length];
        const a = L.nodes[e.a], b = L.nodes[e.b];
        const u = ((t * (0.2 + e.sp * 0.5) + e.live) % 1);
        const fade = Math.sin(u * Math.PI);
        const px = lerp(a.x, b.x, u), py = lerp(a.y, b.y, u);
        const p = cam.project(px, py, L.depth);
        if (p.x < -60 || p.x > W + 60 || p.y < -60 || p.y > H + 60) continue;
        blit(ctx, spr, p.x, p.y, (2.6 + L.size * 0.7) * p.s * (0.7 + 0.5 * fade), baseA * 0.85 * fade * (0.5 + act * 0.6));
      }

      // --- nodes
      const nspr = dotSprite(col, 48);
      const gspr = glowSprite(col, 128, 3.0);
      for (const nd of L.nodes) {
        const p = cam.project(nd.x, nd.y, L.depth);
        if (p.x < -120 || p.x > W + 120 || p.y < -120 || p.y > H + 120) continue;
        const blink = 0.55 + 0.45 * Math.sin(t * nd.blinkRate + nd.ph);
        const a = baseA * (0.5 + 0.5 * blink) * (1 + nd.hot * 2.2);
        const d = L.size * nd.sz * p.s * (1 + nd.hot * 0.9);
        blit(ctx, gspr, p.x, p.y, d * 7.5, a * 0.17 * (0.5 + act * 0.5));
        blit(ctx, nspr, p.x, p.y, d * 2.1, a * 0.95);
      }
    }
  }
}

// --------------------------------------------------------------------------
/** Fine drifting particle haze with parallax depth. */
export class ParticleField {
  constructor(count = 150, seed = 4242) {
    const r = mulberry32(seed);
    this.p = [];
    for (let i = 0; i < count; i++) {
      this.p.push({
        x: (r() - 0.5) * 2400,
        y: (r() - 0.5) * 3400,
        z: 0.28 + r() * 0.82,
        sp: 4 + r() * 16,
        ph: r() * TAU,
        sz: 0.6 + r() * 1.7,
        a: 0.1 + r() * 0.5,
        drift: (r() - 0.5) * 2,
      });
    }
  }
  draw(ctx, cam, t, { gain = 1, converge = 0, cp = { x: 0, y: 0 }, color = PAL.ink } = {}) {
    if (gain <= 0.004) return;
    const spr = dotSprite(color, 32, 0.6);
    for (const q of this.p) {
      let x = q.x + Math.sin(t * 0.17 + q.ph) * 30 * q.drift;
      let y = q.y - ((t * q.sp) % 3400) + 1700;
      if (y < -1700) y += 3400;
      if (converge > 0.001) {
        x = lerp(x, cp.x, converge * (0.3 + 0.6 * q.z));
        y = lerp(y, cp.y, converge * (0.3 + 0.6 * q.z));
      }
      const p = cam.project(x, y, q.z);
      if (p.x < -40 || p.x > W + 40 || p.y < -40 || p.y > H + 40) continue;
      const tw = 0.6 + 0.4 * Math.sin(t * 1.6 + q.ph * 2.3);
      blit(ctx, spr, p.x, p.y, q.sz * 2.4 * p.s, q.a * gain * tw * 0.5);
    }
  }
}

// --------------------------------------------------------------------------
/** Small floating interface fragments (never readable copy — pure chrome). */
export class FragmentField {
  constructor(count = 14, seed = 909) {
    const r = mulberry32(seed);
    this.f = [];
    for (let i = 0; i < count; i++) {
      this.f.push({
        x: (r() - 0.5) * 2000,
        y: (r() - 0.5) * 3000,
        z: 0.4 + r() * 0.45,
        w: 54 + r() * 86,
        h: 26 + r() * 40,
        ph: r() * TAU,
        sp: 0.1 + r() * 0.22,
        bars: 2 + Math.floor(r() * 3),
        seed: r(),
        kind: Math.floor(r() * 3),
      });
    }
  }
  draw(ctx, cam, t, { gain = 1 } = {}) {
    if (gain <= 0.004) return;
    for (const q of this.f) {
      const y = q.y + Math.sin(t * q.sp + q.ph) * 26;
      const x = q.x + Math.cos(t * q.sp * 0.8 + q.ph) * 18;
      const p = cam.project(x, y, q.z);
      const s = p.s;
      const w = q.w * s, h = q.h * s;
      if (p.x < -w - 40 || p.x > W + w + 40 || p.y < -h - 40 || p.y > H + h + 40) continue;
      const a = gain * (0.1 + 0.08 * Math.sin(t * 0.7 + q.ph));
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = rgba(PAL.indigoSoft, a * 0.9);
      ctx.lineWidth = Math.max(0.6, 1.0 * s);
      roundRectPath(ctx, p.x - w / 2, p.y - h / 2, w, h, 5 * s);
      ctx.stroke();
      ctx.fillStyle = rgba(PAL.indigo, a * 0.22);
      ctx.fill();
      // mini data
      const pad = 7 * s;
      if (q.kind === 0) {
        for (let b = 0; b < q.bars; b++) {
          const bw = (w - pad * 2) * (0.3 + 0.6 * ((Math.sin(t * 0.9 + b * 1.7 + q.ph) + 1) / 2));
          ctx.fillStyle = rgba(PAL.blueBright, a * 1.5);
          ctx.fillRect(p.x - w / 2 + pad, p.y - h / 2 + pad + b * (5.2 * s), bw, 2.0 * s);
        }
      } else if (q.kind === 1) {
        const n = 5;
        for (let b = 0; b < n; b++) {
          const on = (Math.sin(t * 1.3 + b * 2.1 + q.ph) > 0.2) ? 1 : 0.25;
          ctx.fillStyle = rgba(PAL.indigoSoft, a * 1.8 * on);
          ctx.beginPath();
          ctx.arc(p.x - w / 2 + pad + b * (6.5 * s), p.y, 1.7 * s, 0, TAU);
          ctx.fill();
        }
      } else {
        ctx.strokeStyle = rgba(PAL.blue, a * 1.7);
        ctx.lineWidth = Math.max(0.6, 1.1 * s);
        ctx.beginPath();
        const n = 10;
        for (let b = 0; b <= n; b++) {
          const xx = p.x - w / 2 + pad + ((w - pad * 2) * b) / n;
          const yy = p.y + Math.sin(t * 1.1 + b * 0.8 + q.ph) * (h * 0.2);
          b === 0 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
  }
}

// --------------------------------------------------------------------------
/** Deep structural grid — far layer, gives the frame architecture. */
export function drawGrid(ctx, cam, t, { gain = 1, cell = 190, color = PAL.line } = {}) {
  if (gain <= 0.004) return;
  const depth = 0.22;
  const s = cam.scaleAt(depth);
  const cs = cell * s;
  const ox = ((-(cam.x + cam._sx) * depth * s) % cs + cs) % cs;
  const oy = ((-(cam.y + cam._sy) * depth * s) % cs + cs) % cs;
  ctx.save();
  ctx.lineWidth = 1;
  const drift = Math.sin(t * 0.09) * 6;
  for (let x = ox - cs; x < W + cs; x += cs) {
    const fade = 1 - Math.abs(x - W / 2) / (W * 0.95);
    ctx.strokeStyle = rgba(color, 0.4 * gain * clamp(fade));
    ctx.beginPath(); ctx.moveTo(x + drift, 0); ctx.lineTo(x + drift, H); ctx.stroke();
  }
  for (let y = oy - cs; y < H + cs; y += cs) {
    const fade = 1 - Math.abs(y - H * 0.46) / (H * 0.78);
    ctx.strokeStyle = rgba(color, 0.38 * gain * clamp(fade));
    ctx.beginPath(); ctx.moveTo(0, y - drift * 0.6); ctx.lineTo(W, y - drift * 0.6); ctx.stroke();
  }
  // intersection ticks
  ctx.fillStyle = rgba(PAL.indigo, 0.3 * gain);
  for (let x = ox - cs; x < W + cs; x += cs) {
    for (let y = oy - cs; y < H + cs; y += cs) {
      const d = Math.hypot(x - W / 2, y - H * 0.46);
      const a = clamp(1 - d / (H * 0.62));
      if (a < 0.03) continue;
      ctx.globalAlpha = a;
      ctx.fillRect(x + drift - 1.4, y - drift * 0.6 - 1.4, 2.8, 2.8);
    }
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

/**
 * Frame guard — returns an alpha multiplier that reaches 0 BEFORE a bounding
 * box can touch the frame edge. Nothing with text ever renders clipped.
 */
export function frameGuard(px, py, hw, hh, margin = 86) {
  const inside = Math.min(px - hw, W - (px + hw), py - hh, H - (py + hh));
  return clamp(inside / margin);
}

/**
 * Minimal instrument chrome: a measure rail and corner ticks. Low contrast,
 * always moving, gives the vertical frame architecture without clutter.
 */
export function drawHUD(ctx, t, { gain = 1, progress = 0, accent = PAL.indigoSoft } = {}) {
  if (gain <= 0.004) return;
  const a = gain;
  const mx = 46;
  ctx.save();
  // left measure rail
  const railTop = 300, railBot = H - 300;
  ctx.strokeStyle = rgba(PAL.dim, 0.5 * a);
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(mx, railTop); ctx.lineTo(mx, railBot); ctx.stroke();
  const ticks = 22;
  for (let i = 0; i <= ticks; i++) {
    const y = lerp(railTop, railBot, i / ticks);
    const major = i % 5 === 0;
    const w = major ? 15 : 8;
    const phase = 0.5 + 0.5 * Math.sin(t * 0.8 - i * 0.35);
    ctx.strokeStyle = rgba(major ? accent : PAL.mute, (major ? 0.85 : 0.42) * a * (0.55 + 0.45 * phase));
    ctx.beginPath(); ctx.moveTo(mx, y); ctx.lineTo(mx + w, y); ctx.stroke();
  }
  // travelling marker on the rail
  const my = lerp(railTop, railBot, clamp(progress));
  ctx.fillStyle = rgba(accent, 0.95 * a);
  ctx.beginPath();
  ctx.moveTo(mx - 7, my); ctx.lineTo(mx - 1, my - 5); ctx.lineTo(mx - 1, my + 5);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = rgba(accent, 0.45 * a);
  ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + 34, my); ctx.stroke();

  // right-side drifting data column
  const rx = W - mx;
  for (let i = 0; i < 9; i++) {
    const y = 430 + i * 118 + Math.sin(t * 0.33 + i) * 7;
    const w = 10 + 24 * (0.5 + 0.5 * Math.sin(t * 0.9 + i * 1.6));
    ctx.fillStyle = rgba(i % 3 === 0 ? accent : PAL.mute, 0.38 * a);
    ctx.fillRect(rx - w, y, w, 2);
  }

  // corner ticks
  const c = 46, off = 30;
  ctx.strokeStyle = rgba(accent, 0.46 * a);
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  const pts = [[off, off, 1, 1], [W - off, off, -1, 1], [off, H - off, 1, -1], [W - off, H - off, -1, -1]];
  for (const [x, y, sx, sy] of pts) {
    ctx.beginPath();
    ctx.moveTo(x + sx * c, y); ctx.lineTo(x, y); ctx.lineTo(x, y + sy * c);
    ctx.stroke();
  }
  ctx.restore();
}

/** Base atmosphere: graded charcoal with a slow-moving indigo bloom. */
export function drawAtmosphere(ctx, t, { energy = 0, tint = 0, lift = 0 } = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, PAL.void);
  g.addColorStop(0.42, PAL.black);
  g.addColorStop(0.72, PAL.charcoal);
  g.addColorStop(1, PAL.void);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const bx = W / 2 + Math.sin(t * 0.13) * 180;
  const by = H * 0.42 + Math.cos(t * 0.1) * 230;
  const rad = H * (0.45 + 0.05 * Math.sin(t * 0.21));
  const bloom = ctx.createRadialGradient(bx, by, 0, bx, by, rad);
  const c = tint > 0.01 ? mixHex(PAL.indigoDeep, PAL.violet, tint * 0.42) : PAL.indigoDeep;
  bloom.addColorStop(0, rgba(c, 0.24 + energy * 0.1 + lift * 0.12));
  bloom.addColorStop(0.55, rgba(c, 0.08 + energy * 0.04));
  bloom.addColorStop(1, rgba(c, 0));
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, W, H);

  const b2x = W * (0.22 + 0.1 * Math.sin(t * 0.08 + 2));
  const b2y = H * (0.74 + 0.06 * Math.cos(t * 0.11 + 1));
  const bloom2 = ctx.createRadialGradient(b2x, b2y, 0, b2x, b2y, H * 0.34);
  bloom2.addColorStop(0, rgba(PAL.blueDeep, 0.15 + energy * 0.07));
  bloom2.addColorStop(1, rgba(PAL.blueDeep, 0));
  ctx.fillStyle = bloom2;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
