// ---------------------------------------------------------------------------
// Low level drawing helpers: cached glow sprites, grain/dither, vignette,
// rounded rects, soft strokes. Sprites are pre-rendered once per process so
// per-frame cost stays low at 1080x1920.
// ---------------------------------------------------------------------------
import { createCanvas } from '@napi-rs/canvas';
import { rgba, PAL } from './color.js';
import { mulberry32, TAU } from './math.js';

const spriteCache = new Map();

/** Radial glow sprite (additive). Returns a canvas of size 2*r. */
export function glowSprite(hex, size = 128, power = 2.6, core = 0.06) {
  const key = `g:${hex}:${size}:${power}:${core}`;
  let s = spriteCache.get(key);
  if (s) return s;
  const c = createCanvas(size, size);
  const x = c.getContext('2d');
  const r = size / 2;
  const g = x.createRadialGradient(r, r, 0, r, r, r);
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    let a = Math.pow(1 - t, power);
    if (t < core) a = 1;
    g.addColorStop(t, rgba(hex, a));
  }
  x.fillStyle = g;
  x.fillRect(0, 0, size, size);
  spriteCache.set(key, c);
  return c;
}

/** Crisp dot sprite with soft edge — used for nodes/particles. */
export function dotSprite(hex, size = 64, softness = 0.42) {
  const key = `d:${hex}:${size}:${softness}`;
  let s = spriteCache.get(key);
  if (s) return s;
  const c = createCanvas(size, size);
  const x = c.getContext('2d');
  const r = size / 2;
  const g = x.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0, rgba(hex, 1));
  g.addColorStop(Math.max(0.01, 1 - softness), rgba(hex, 0.92));
  g.addColorStop(1, rgba(hex, 0));
  x.fillStyle = g;
  x.beginPath();
  x.arc(r, r, r, 0, TAU);
  x.fill();
  spriteCache.set(key, c);
  return c;
}

/** Draw a cached sprite centred at (x,y) with diameter d. */
export function blit(ctx, sprite, x, y, d, alpha = 1, op = 'lighter') {
  if (alpha <= 0.002 || d <= 0.2) return;
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = op;
  ctx.globalAlpha = alpha;
  ctx.drawImage(sprite, x - d / 2, y - d / 2, d, d);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = prev;
}

/** Tileable monochrome grain used to kill banding in dark gradients. */
let grainPattern = null;
export function grain(ctx, w, h, amount = 0.028, seed = 7) {
  if (!grainPattern) {
    const n = 256;
    const c = createCanvas(n, n);
    const x = c.getContext('2d');
    const img = x.createImageData(n, n);
    const r = mulberry32(seed);
    for (let i = 0; i < n * n; i++) {
      const v = 110 + Math.floor(r() * 36);
      img.data[i * 4] = v;
      img.data[i * 4 + 1] = v;
      img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    grainPattern = c;
  }
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = amount;
  const p = ctx.createPattern(grainPattern, 'repeat');
  ctx.fillStyle = p;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = prev;
}

/** Soft cinematic vignette. */
export function vignette(ctx, w, h, strength = 0.55) {
  const g = ctx.createRadialGradient(w / 2, h * 0.46, h * 0.16, w / 2, h * 0.5, h * 0.78);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(0.62, `rgba(0,0,0,${strength * 0.26})`);
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

export function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

/** Polyline through sampled points with smooth joins. */
export function polyline(ctx, pts) {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
  }
  const last = pts[pts.length - 1];
  ctx.lineTo(last.x, last.y);
}

/** Additive line glow (two-pass: wide soft + tight core). */
export function glowLine(ctx, drawPath, hex, width, alpha, spread = 3.2) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = rgba(hex, alpha * 0.1);
  ctx.lineWidth = width * spread;
  drawPath();
  ctx.stroke();
  ctx.strokeStyle = rgba(hex, alpha * 0.22);
  ctx.lineWidth = width * 1.9;
  drawPath();
  ctx.stroke();
  ctx.strokeStyle = rgba(hex, alpha);
  ctx.lineWidth = width;
  drawPath();
  ctx.stroke();
  ctx.restore();
}

/** Small ring / arc used by node chrome. */
export function ring(ctx, x, y, r, width, hex, alpha, a0 = 0, a1 = TAU) {
  if (alpha <= 0.003 || r <= 0) return;
  ctx.save();
  ctx.strokeStyle = rgba(hex, alpha);
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(x, y, r, a0, a1);
  ctx.stroke();
  ctx.restore();
}

export const SPR = {
  glowBlue: () => glowSprite(PAL.blue, 128, 2.8),
  glowIndigo: () => glowSprite(PAL.indigoSoft, 128, 2.8),
  glowViolet: () => glowSprite(PAL.violetSoft, 128, 2.8),
  glowInk: () => glowSprite(PAL.ink, 128, 3.0),
  glowEmber: () => glowSprite(PAL.emberSoft, 128, 2.8),
  dotBlue: () => dotSprite(PAL.blueBright, 48),
  dotIndigo: () => dotSprite(PAL.indigoSoft, 48),
  dotInk: () => dotSprite(PAL.ink, 48),
  dotViolet: () => dotSprite(PAL.violetSoft, 48),
  dotMute: () => dotSprite(PAL.mute, 48),
};
