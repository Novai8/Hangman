// ---------------------------------------------------------------------------
// Typography system.
// Premium neo-grotesque (Inter) for headlines/labels, Space Grotesk for the
// wordmark, JetBrains Mono for interface micro-data.
// Every visible string is passed in verbatim from the .tsrct project file —
// characters are NEVER synthesised or randomised, so spelling cannot drift.
// ---------------------------------------------------------------------------
import { GlobalFonts, createCanvas } from '@napi-rs/canvas';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rgba } from './color.js';
import { clamp, lerp, CURVE } from './math.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const F = (p) => path.join(ROOT, 'node_modules/@expo-google-fonts', p);

let registered = false;
export function registerFonts() {
  if (registered) return;
  GlobalFonts.registerFromPath(F('inter/900Black/Inter_900Black.ttf'), 'CBSansBlack');
  GlobalFonts.registerFromPath(F('inter/800ExtraBold/Inter_800ExtraBold.ttf'), 'CBSansXBold');
  GlobalFonts.registerFromPath(F('inter/700Bold/Inter_700Bold.ttf'), 'CBSansBold');
  GlobalFonts.registerFromPath(F('inter/600SemiBold/Inter_600SemiBold.ttf'), 'CBSansSemi');
  GlobalFonts.registerFromPath(F('inter/500Medium/Inter_500Medium.ttf'), 'CBSansMed');
  GlobalFonts.registerFromPath(F('inter/400Regular/Inter_400Regular.ttf'), 'CBSans');
  GlobalFonts.registerFromPath(F('space-grotesk/700Bold/SpaceGrotesk_700Bold.ttf'), 'CBDisplay');
  GlobalFonts.registerFromPath(F('space-grotesk/500Medium/SpaceGrotesk_500Medium.ttf'), 'CBDisplayMed');
  GlobalFonts.registerFromPath(F('jetbrains-mono/500Medium/JetBrainsMono_500Medium.ttf'), 'CBMono');
  GlobalFonts.registerFromPath(F('jetbrains-mono/700Bold/JetBrainsMono_700Bold.ttf'), 'CBMonoBold');
  registered = true;
}

export const FONT = {
  display: 'CBDisplay',
  displayMed: 'CBDisplayMed',
  black: 'CBSansBlack',
  xbold: 'CBSansXBold',
  bold: 'CBSansBold',
  semi: 'CBSansSemi',
  med: 'CBSansMed',
  reg: 'CBSans',
  mono: 'CBMono',
  monoBold: 'CBMonoBold',
};

/** Width of a tracked string. */
export function measureTracked(ctx, str, tracking) {
  let w = 0;
  for (let i = 0; i < str.length; i++) {
    w += ctx.measureText(str[i]).width;
    if (i < str.length - 1) w += tracking;
  }
  return w;
}

/**
 * Draw text with explicit letter tracking and optional per-character animation.
 * `perChar(i, n)` -> { dx, dy, alpha, scale, rot } or null.
 * Returns the total advance width.
 */
export function drawTracked(ctx, str, x, y, opts = {}) {
  const {
    font = FONT.semi, size = 40, tracking = 0, color = '#fff', alpha = 1,
    align = 'left', baseline = 'alphabetic', perChar = null, shadow = null,
  } = opts;
  ctx.save();
  ctx.font = `${size}px ${font}`;
  ctx.textBaseline = baseline;
  const total = measureTracked(ctx, str, tracking);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  const n = str.length;
  for (let i = 0; i < n; i++) {
    const ch = str[i];
    const w = ctx.measureText(ch).width;
    const m = perChar ? perChar(i, n) : null;
    const a = (m?.alpha ?? 1) * alpha;
    if (ch !== ' ' && a > 0.004) {
      ctx.save();
      const sc = m?.scale ?? 1;
      const px = cx + w / 2 + (m?.dx ?? 0);
      const py = y + (m?.dy ?? 0);
      ctx.translate(px, py);
      if (m?.rot) ctx.rotate(m.rot);
      if (sc !== 1) ctx.scale(sc, sc);
      if (shadow) {
        ctx.shadowColor = shadow.color;
        ctx.shadowBlur = shadow.blur;
      }
      ctx.globalAlpha = a;
      ctx.fillStyle = color;
      ctx.fillText(ch, -w / 2, 0);
      ctx.restore();
    }
    cx += w + tracking;
  }
  ctx.restore();
  return total;
}

/**
 * Mask-reveal text: renders the string into an offscreen buffer and wipes it in
 * with a soft linear mask. Guarantees pixel-perfect glyphs (no partial letters
 * drawn from half-formed shapes) while still reading as kinetic typography.
 * dir: 'left'|'right'|'up'|'down'
 */
const maskCache = new Map();
export function drawMaskReveal(ctx, str, x, y, opts = {}) {
  const {
    font = FONT.bold, size = 64, tracking = 0, color = '#fff', progress = 1,
    align = 'center', dir = 'left', feather = 0.26, alpha = 1, pad = 40, blurUp = 0,
  } = opts;
  if (progress <= 0.001 || alpha <= 0.003) return 0;
  const key = `${str}|${font}|${size}|${tracking}|${color}`;
  let buf = maskCache.get(key);
  if (!buf) {
    const probe = createCanvas(8, 8).getContext('2d');
    probe.font = `${size}px ${font}`;
    const w = Math.ceil(measureTracked(probe, str, tracking)) + pad * 2;
    const h = Math.ceil(size * 1.9) + pad * 2;
    const c = createCanvas(Math.max(8, w), Math.max(8, h));
    const g = c.getContext('2d');
    g.textBaseline = 'alphabetic';
    drawTracked(g, str, pad, pad + size * 1.06, { font, size, tracking, color, align: 'left' });
    buf = { canvas: c, w: c.width, h: c.height, pad, baseY: pad + size * 1.06, textW: w - pad * 2 };
    maskCache.set(key, buf);
  }
  // build mask
  const mc = createCanvas(buf.w, buf.h);
  const mx = mc.getContext('2d');
  mx.drawImage(buf.canvas, 0, 0);
  mx.globalCompositeOperation = 'destination-in';
  const p = clamp(progress);
  let g;
  const fw = Math.max(0.02, feather);
  if (dir === 'left' || dir === 'right') {
    g = mx.createLinearGradient(dir === 'left' ? 0 : buf.w, 0, dir === 'left' ? buf.w : 0, 0);
  } else {
    g = mx.createLinearGradient(0, dir === 'up' ? buf.h : 0, 0, dir === 'up' ? 0 : buf.h);
  }
  const edge = lerp(-fw, 1 + fw, p);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(clamp(edge - fw, 0, 1), 'rgba(255,255,255,1)');
  g.addColorStop(clamp(edge, 0.0001, 1), 'rgba(255,255,255,0)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  mx.fillStyle = g;
  mx.fillRect(0, 0, buf.w, buf.h);

  const drawX = align === 'center' ? x - buf.textW / 2 - buf.pad : align === 'right' ? x - buf.textW - buf.pad : x - buf.pad;
  const drawY = y - buf.baseY;
  ctx.save();
  ctx.globalAlpha = alpha;
  if (blurUp > 0.01) {
    ctx.filter = `blur(${blurUp.toFixed(2)}px)`;
  }
  ctx.drawImage(mc, drawX, drawY);
  ctx.restore();
  return buf.textW;
}

/**
 * Sample the glyph coverage of a string into a point cloud (world units).
 * Used so the background network can physically assemble a wordmark.
 * The *rendered* word is always real text drawn on top — the cloud only
 * carries nodes into place, so letterforms can never be malformed.
 */
export function sampleTextPoints(str, opts = {}) {
  const { font = FONT.display, size = 180, tracking = 6, step = 7, jitter = 0.5, seedScale = 1 } = opts;
  const probe = createCanvas(8, 8).getContext('2d');
  probe.font = `${size}px ${font}`;
  const w = Math.ceil(measureTracked(probe, str, tracking)) + 40;
  const h = Math.ceil(size * 1.8);
  const c = createCanvas(w, h);
  const g = c.getContext('2d');
  g.fillStyle = '#000';
  g.fillRect(0, 0, w, h);
  drawTracked(g, str, 20, size * 1.2, { font, size, tracking, color: '#fff', align: 'left' });
  const data = g.getImageData(0, 0, w, h).data;
  const pts = [];
  const edges = [];
  for (let yy = 0; yy < h; yy += step) {
    for (let xx = 0; xx < w; xx += step) {
      const a = data[(yy * w + xx) * 4];
      if (a > 120) {
        // edge detection: neighbour darkness
        let isEdge = false;
        for (const [ox, oy] of [[-step, 0], [step, 0], [0, -step], [0, step]]) {
          const nx = xx + ox, ny = yy + oy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h || data[(ny * w + nx) * 4] < 100) { isEdge = true; break; }
        }
        const p = {
          x: (xx - w / 2 + (Math.random() - 0.5) * jitter * step) * seedScale,
          y: (yy - size * 0.78 + (Math.random() - 0.5) * jitter * step) * seedScale,
          edge: isEdge,
        };
        pts.push(p);
        if (isEdge) edges.push(p);
      }
    }
  }
  return { points: pts, edges, width: w, height: h, size, tracking, font, str };
}

/** Section eyebrow: small tracked mono label with a leading tick. */
export function eyebrow(ctx, str, x, y, opts = {}) {
  const { size = 20, color = '#8A93A8', alpha = 1, tracking = 7, align = 'center', progress = 1, tick = true } = opts;
  if (alpha <= 0.004) return;
  const n = Math.max(0, Math.min(str.length, Math.round(str.length * clamp(progress * 1.15))));
  const shown = str.slice(0, n);
  ctx.save();
  ctx.font = `${size}px ${FONT.mono}`;
  const wTotal = measureTracked(ctx, str, tracking);
  const startX = align === 'center' ? x - wTotal / 2 : x;
  if (tick) {
    ctx.fillStyle = rgba(color, alpha * 0.9);
    ctx.fillRect(startX - size * 1.35, y - size * 0.62, size * 0.5, 2.2);
  }
  drawTracked(ctx, shown, startX, y, { font: FONT.mono, size, tracking, color, alpha, align: 'left' });
  ctx.restore();
}
