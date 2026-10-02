// ---------------------------------------------------------------------------
// Diagram primitives: system nodes, abstract interface cards, flowing data
// ribbons, allocation splitter, token object. All vector, all animatable.
// ---------------------------------------------------------------------------
import { rgba, PAL, mixHex } from './color.js';
import { blit, dotSprite, glowSprite, roundRectPath, ring } from './gfx.js';
import { drawTracked, FONT, measureTracked } from './type.js';
import { clamp, lerp, TAU, cbez, cbezTangent, smoothstep, pulse, impulse, CURVE } from './math.js';

// ---------------------------------------------------------------------------
/** Sample a cubic bezier path into screen points through the camera. */
export function samplePath(cam, p0, p1, p2, p3, n, depth = 1) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const w = cbez(p0, p1, p2, p3, t);
    const s = cam.project(w.x, w.y, depth);
    const tg = cbezTangent(p0, p1, p2, p3, t);
    pts.push({ x: s.x, y: s.y, t, s: s.s, nx: -tg.y, ny: tg.x });
  }
  return pts;
}

/** Tapered ribbon through sampled points. halfW(t) in world units. */
export function ribbon(ctx, pts, halfW, color, alpha, { from = 0, to = 1, soft = true } = {}) {
  if (alpha <= 0.004 || to <= from) return;
  const sel = pts.filter((p) => p.t >= from - 1e-6 && p.t <= to + 1e-6);
  if (sel.length < 2) return;
  const left = [], right = [];
  for (const p of sel) {
    const hw = halfW(p.t) * p.s;
    left.push({ x: p.x + p.nx * hw, y: p.y + p.ny * hw });
    right.push({ x: p.x - p.nx * hw, y: p.y - p.ny * hw });
  }
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(left[0].x, left[0].y);
  for (let i = 1; i < left.length; i++) ctx.lineTo(left[i].x, left[i].y);
  for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
  ctx.closePath();
  if (soft) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = rgba(color, alpha * 0.18);
    ctx.fill();
    ctx.strokeStyle = rgba(color, alpha * 0.5);
    ctx.lineWidth = 1.2;
    ctx.stroke();
  } else {
    ctx.fillStyle = rgba(color, alpha);
    ctx.fill();
  }
  ctx.restore();
}

/** Core line of a stream with additive glow. */
export function streamCore(ctx, pts, color, alpha, width, { from = 0, to = 1 } = {}) {
  const sel = pts.filter((p) => p.t >= from - 1e-6 && p.t <= to + 1e-6);
  if (sel.length < 2 || alpha <= 0.004) return;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(sel[0].x, sel[0].y);
    for (let i = 1; i < sel.length; i++) ctx.lineTo(sel[i].x, sel[i].y);
  };
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = rgba(color, alpha * 0.10);
  ctx.lineWidth = width * 5.0; path(); ctx.stroke();
  ctx.strokeStyle = rgba(color, alpha * 0.20);
  ctx.lineWidth = width * 2.2; path(); ctx.stroke();
  ctx.strokeStyle = rgba(mixHex(color, '#FFFFFF', 0.35), alpha * 0.95);
  ctx.lineWidth = width; path(); ctx.stroke();
  ctx.restore();
}

/** Particles flowing along a sampled path. */
export function flowParticles(ctx, pts, t, {
  color = PAL.blueBright, count = 18, speed = 0.3, size = 4, alpha = 1,
  from = 0, to = 1, spread = 0, seed = 0, head = 1,
} = {}) {
  if (alpha <= 0.004 || pts.length < 2) return;
  const spr = dotSprite(color, 32, 0.55);
  const gspr = glowSprite(color, 96, 3.0);
  for (let i = 0; i < count; i++) {
    const phase = ((i / count) + t * speed + seed * 0.37) % 1;
    const u = from + phase * (to - from);
    if (u > head) continue;
    const idx = clamp(u, 0, 1) * (pts.length - 1);
    const i0 = Math.floor(idx), i1 = Math.min(pts.length - 1, i0 + 1);
    const f = idx - i0;
    const p0 = pts[i0], p1 = pts[i1];
    if (!p0 || !p1) continue;
    const x = lerp(p0.x, p1.x, f), y = lerp(p0.y, p1.y, f);
    const off = spread ? (((i * 37) % 11) / 11 - 0.5) * spread * p0.s : 0;
    const px = x + p0.nx * off, py = y + p0.ny * off;
    const fade = Math.min(1, Math.sin(clamp(phase) * Math.PI) * 2.6);
    const sz = size * p0.s * (0.65 + 0.5 * ((i * 13) % 7) / 7);
    blit(ctx, gspr, px, py, sz * 6.5, alpha * 0.2 * fade);
    blit(ctx, spr, px, py, sz, alpha * 0.95 * fade);
  }
}

// ---------------------------------------------------------------------------
/** A system node: ring chrome + core + optional label. */
export function systemNode(ctx, cam, {
  x, y, depth = 1, r = 34, color = PAL.blue, alpha = 1, t = 0, active = 1,
  label = null, labelSize = 22, labelGap = 26, labelColor = PAL.ink, labelAlpha = 1,
  segments = 3, spin = 0.25, coreScale = 1, glow = 1, labelFont = FONT.semi,
  labelTracking = 3, labelAbove = false,
}) {
  if (alpha <= 0.004) return null;
  const p = cam.project(x, y, depth);
  const R = r * p.s;
  const gspr = glowSprite(color, 128, 2.8);
  blit(ctx, gspr, p.x, p.y, R * 7.5 * glow, alpha * 0.2 * active);
  // outer segmented ring
  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * TAU + t * spin;
    const a1 = a0 + (TAU / segments) * 0.58;
    ring(ctx, p.x, p.y, R, Math.max(1, 2.0 * p.s), color, alpha * 0.55 * active, a0, a1);
  }
  // inner ring
  ring(ctx, p.x, p.y, R * 0.62, Math.max(1, 1.4 * p.s), mixHex(color, PAL.ink, 0.3), alpha * 0.45);
  // core
  const core = dotSprite(mixHex(color, '#FFFFFF', 0.4), 48);
  const breathe = 0.86 + 0.14 * Math.sin(t * 1.9 + x * 0.01);
  blit(ctx, core, p.x, p.y, R * 0.52 * coreScale * breathe, alpha * 0.95);
  if (label) {
    const ly = labelAbove ? p.y - R - labelGap * p.s : p.y + R + labelGap * p.s + labelSize * p.s * 0.8;
    drawTracked(ctx, label, p.x, ly, {
      font: labelFont, size: labelSize * p.s, tracking: labelTracking * p.s,
      color: labelColor, alpha: alpha * labelAlpha, align: 'center',
    });
  }
  return p;
}

// ---------------------------------------------------------------------------
/**
 * Abstract interface card. Never a screenshot: a structural module with a
 * header rule, live micro-content and connection ports.
 */
export function uiCard(ctx, cam, {
  x, y, w = 250, h = 150, depth = 1, t = 0, alpha = 1, title = '', sub = null,
  accent = PAL.blue, build = 1, activity = 0.5, kind = 0, rot = 0, scale = 1,
  titleSize = 24, glowAmt = 1,
}) {
  if (alpha <= 0.004 || build <= 0.001) return null;
  const p = cam.project(x, y, depth);
  const s = p.s * scale;
  const W2 = w * s, H2 = h * s;
  const bw = W2 * clamp(build * 1.0);
  ctx.save();
  ctx.translate(p.x, p.y);
  if (rot) ctx.rotate(rot);
  // body
  roundRectPath(ctx, -W2 / 2, -H2 / 2, W2, H2, 14 * s);
  const bg = ctx.createLinearGradient(0, -H2 / 2, 0, H2 / 2);
  bg.addColorStop(0, rgba(PAL.charcoal2, 0.92 * alpha));
  bg.addColorStop(1, rgba(PAL.black, 0.86 * alpha));
  ctx.fillStyle = bg;
  ctx.fill();
  // border
  ctx.strokeStyle = rgba(mixHex(PAL.line, accent, 0.35), alpha * 0.9);
  ctx.lineWidth = Math.max(1, 1.4 * s);
  ctx.stroke();
  // accent top rule (draws in with build)
  ctx.save();
  roundRectPath(ctx, -W2 / 2, -H2 / 2, W2, H2, 14 * s);
  ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  const grd = ctx.createLinearGradient(-W2 / 2, 0, W2 / 2, 0);
  grd.addColorStop(0, rgba(accent, 0));
  grd.addColorStop(0.5, rgba(accent, 0.9 * alpha));
  grd.addColorStop(1, rgba(accent, 0));
  ctx.fillStyle = grd;
  ctx.fillRect(-W2 / 2, -H2 / 2, bw, 2.4 * s);
  // inner sheen
  const sheen = ctx.createLinearGradient(0, -H2 / 2, 0, H2 / 2);
  sheen.addColorStop(0, rgba(accent, 0.09 * alpha));
  sheen.addColorStop(0.6, rgba(accent, 0.0));
  ctx.fillStyle = sheen;
  ctx.fillRect(-W2 / 2, -H2 / 2, W2, H2);
  ctx.restore();

  const padX = 18 * s, padY = 20 * s;
  // title
  if (title) {
    drawTracked(ctx, title, -W2 / 2 + padX, -H2 / 2 + padY + titleSize * s * 0.85, {
      font: FONT.bold, size: titleSize * s, tracking: 2.2 * s, color: PAL.ink, alpha: alpha * clamp(build * 1.6 - 0.25),
      align: 'left',
    });
  }
  if (sub) {
    drawTracked(ctx, sub, -W2 / 2 + padX, -H2 / 2 + padY + titleSize * s * 0.85 + 22 * s, {
      font: FONT.mono, size: 14 * s, tracking: 2.4 * s, color: PAL.dim, alpha: alpha * clamp(build * 1.6 - 0.5),
      align: 'left',
    });
  }
  // live micro content
  const cy = H2 / 2 - padY;
  ctx.save();
  if (kind === 0) {
    // waveform strip
    ctx.strokeStyle = rgba(accent, alpha * 0.8);
    ctx.lineWidth = Math.max(1, 1.6 * s);
    ctx.beginPath();
    const n = 26;
    for (let i = 0; i <= n; i++) {
      const xx = -W2 / 2 + padX + ((W2 - padX * 2) * i) / n;
      const yy = cy - 18 * s + Math.sin(t * 2.4 + i * 0.55) * 9 * s * (0.4 + activity);
      i === 0 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy);
    }
    ctx.stroke();
  } else if (kind === 1) {
    // stacked progress bars
    for (let b = 0; b < 3; b++) {
      const yy = cy - 34 * s + b * 13 * s;
      ctx.fillStyle = rgba(PAL.line, alpha * 0.9);
      ctx.fillRect(-W2 / 2 + padX, yy, W2 - padX * 2, 3.4 * s);
      const v = 0.3 + 0.65 * ((Math.sin(t * 1.3 + b * 2.0) + 1) / 2) * (0.5 + activity);
      ctx.fillStyle = rgba(accent, alpha * 0.95);
      ctx.fillRect(-W2 / 2 + padX, yy, (W2 - padX * 2) * clamp(v) * build, 3.4 * s);
    }
  } else if (kind === 2) {
    // node cluster
    for (let b = 0; b < 7; b++) {
      const ang = (b / 7) * TAU + t * 0.3;
      const rr = 16 * s;
      const xx = -W2 / 2 + padX + 26 * s + Math.cos(ang) * rr;
      const yy = cy - 22 * s + Math.sin(ang) * rr * 0.7;
      ctx.fillStyle = rgba(accent, alpha * (0.4 + 0.6 * ((Math.sin(t * 2 + b) + 1) / 2)));
      ctx.beginPath(); ctx.arc(xx, yy, 2.4 * s, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = rgba(PAL.line, alpha * 0.9);
    ctx.fillRect(-W2 / 2 + padX + 58 * s, cy - 30 * s, W2 - padX * 2 - 58 * s, 3 * s);
    ctx.fillStyle = rgba(accent, alpha * 0.9);
    ctx.fillRect(-W2 / 2 + padX + 58 * s, cy - 30 * s, (W2 - padX * 2 - 58 * s) * (0.45 + 0.4 * Math.sin(t * 1.1)), 3 * s);
    ctx.fillStyle = rgba(PAL.line, alpha * 0.9);
    ctx.fillRect(-W2 / 2 + padX + 58 * s, cy - 18 * s, W2 - padX * 2 - 58 * s, 3 * s);
    ctx.fillStyle = rgba(accent, alpha * 0.7);
    ctx.fillRect(-W2 / 2 + padX + 58 * s, cy - 18 * s, (W2 - padX * 2 - 58 * s) * (0.3 + 0.5 * Math.cos(t * 0.9)), 3 * s);
  } else if (kind === 3) {
    // reward dots grid
    for (let r0 = 0; r0 < 2; r0++) {
      for (let c0 = 0; c0 < 8; c0++) {
        const xx = -W2 / 2 + padX + c0 * 15 * s;
        const yy = cy - 30 * s + r0 * 14 * s;
        const on = (Math.sin(t * 2.2 + c0 * 0.9 + r0 * 1.7) > 0.1) ? 1 : 0.22;
        ctx.fillStyle = rgba(accent, alpha * on * 0.95);
        roundRectPath(ctx, xx, yy, 9 * s, 9 * s, 2 * s);
        ctx.fill();
      }
    }
  }
  ctx.restore();

  // status dot
  const blink = 0.45 + 0.55 * Math.sin(t * 2.6 + x * 0.02);
  ctx.fillStyle = rgba(accent, alpha * blink);
  ctx.beginPath();
  ctx.arc(W2 / 2 - padX * 0.7, -H2 / 2 + padY * 0.75, 3.2 * s, 0, TAU);
  ctx.fill();

  ctx.restore();

  // outer glow
  if (glowAmt > 0.01) {
    const g = glowSprite(accent, 128, 3.2);
    blit(ctx, g, p.x, p.y, Math.max(W2, H2) * 1.9, alpha * 0.055 * glowAmt * (0.6 + activity * 0.5));
  }
  return { p, w: W2, h: H2 };
}

// ---------------------------------------------------------------------------
/** Allocation splitter: a precision aperture that opens and divides a stream. */
export function splitter(ctx, cam, { x, y, depth = 1, r = 46, t = 0, open = 0, alpha = 1, color = PAL.blue, heat = 0 }) {
  if (alpha <= 0.004) return;
  const p = cam.project(x, y, depth);
  const R = r * p.s;
  const g = glowSprite(color, 128, 2.6);
  blit(ctx, g, p.x, p.y, R * 8, alpha * (0.14 + heat * 0.3));
  // rotating outer bracket
  for (let i = 0; i < 4; i++) {
    const a0 = (i / 4) * TAU + t * 0.4;
    ring(ctx, p.x, p.y, R, Math.max(1.2, 2.4 * p.s), color, alpha * 0.6, a0, a0 + 0.42);
  }
  // aperture blades: open outward
  const blades = 6;
  for (let i = 0; i < blades; i++) {
    const a = (i / blades) * TAU - Math.PI / 2 + t * 0.12;
    const inner = R * (0.22 + 0.5 * open);
    const outer = R * 0.78;
    ctx.save();
    ctx.strokeStyle = rgba(mixHex(color, PAL.ink, 0.25), alpha * 0.75);
    ctx.lineWidth = Math.max(1, 2.1 * p.s);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(p.x + Math.cos(a) * inner, p.y + Math.sin(a) * inner);
    ctx.lineTo(p.x + Math.cos(a + 0.5) * outer, p.y + Math.sin(a + 0.5) * outer);
    ctx.stroke();
    ctx.restore();
  }
  const core = dotSprite(mixHex(color, '#FFFFFF', 0.5), 48);
  blit(ctx, core, p.x, p.y, R * (0.5 - 0.22 * open) * (1 + heat * 0.6), alpha);
}

// ---------------------------------------------------------------------------
/**
 * The $CLIP token object — a structural mechanism part, never a coin.
 * `mass` grows on BUY, `burn` contracts and extinguishes it.
 */
export function tokenObject(ctx, cam, {
  x, y, depth = 1, r = 62, t = 0, alpha = 1, form = 1, mass = 0, burn = 0,
  label = null, labelAlpha = 1, color = PAL.violetSoft,
}) {
  if (alpha <= 0.004 || form <= 0.001) return null;
  const contract = 1 - burn * 0.82;
  const p = cam.project(x, y, depth);
  const R = r * p.s * form * contract * (1 + mass * 0.14);
  const col = burn > 0.02 ? mixHex(color, PAL.ember, clamp(burn * 1.15)) : color;
  const g = glowSprite(col, 128, 2.5);
  blit(ctx, g, p.x, p.y, R * 8.5, alpha * (0.16 + mass * 0.12 + burn * 0.26) * (1 - burn * 0.45));

  // hex shell
  const sides = 6;
  const spin = t * 0.16 + burn * 1.4;
  ctx.save();
  ctx.strokeStyle = rgba(col, alpha * 0.85 * (1 - burn * 0.5));
  ctx.lineWidth = Math.max(1.2, 2.6 * p.s);
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let i = 0; i <= sides; i++) {
    const a = (i / sides) * TAU + spin;
    const xx = p.x + Math.cos(a) * R;
    const yy = p.y + Math.sin(a) * R;
    i === 0 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy);
  }
  ctx.closePath();
  ctx.stroke();
  // inner lattice
  ctx.strokeStyle = rgba(col, alpha * 0.3 * (1 - burn * 0.7));
  ctx.lineWidth = Math.max(0.8, 1.2 * p.s);
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * TAU + spin;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + Math.cos(a) * R, p.y + Math.sin(a) * R);
    ctx.stroke();
  }
  // mass ring segments accumulate on BUY
  const segs = 12;
  for (let i = 0; i < segs; i++) {
    const on = i / segs < mass ? 1 : 0.12;
    const a0 = (i / segs) * TAU - Math.PI / 2 - t * 0.3;
    ring(ctx, p.x, p.y, R * 1.3, Math.max(1.4, 3.0 * p.s), col, alpha * 0.55 * on * (1 - burn), a0 + 0.04, a0 + TAU / segs - 0.08);
  }
  ctx.restore();

  const core = dotSprite(mixHex(col, '#FFFFFF', 0.45), 48);
  blit(ctx, core, p.x, p.y, R * 0.42 * (1 + mass * 0.3) * (1 - burn * 0.9), alpha);

  if (label) {
    drawTracked(ctx, label, p.x, p.y + R + 56 * p.s, {
      font: FONT.xbold, size: 44 * p.s, tracking: 3 * p.s, color: PAL.ink,
      alpha: alpha * labelAlpha * (1 - burn * 0.3), align: 'center',
    });
  }
  return p;
}

// ---------------------------------------------------------------------------
/** Chip label with a hairline bracket — used for 80% / 20% / BUY / BURN. */
export function chip(ctx, cam, {
  x, y, depth = 1, text = '', size = 30, color = PAL.ink, accent = PAL.blue,
  alpha = 1, build = 1, t = 0, padX = 22, padY = 13, tracking = 3, font = FONT.bold,
  fill = true,
}) {
  if (alpha <= 0.004 || build <= 0.001) return null;
  const p = cam.project(x, y, depth);
  const s = p.s;
  ctx.save();
  ctx.font = `${size * s}px ${font}`;
  const tw = measureTracked(ctx, text, tracking * s);
  const bw = tw + padX * 2 * s;
  const bh = size * s + padY * 2 * s;
  const bx = p.x - bw / 2, by = p.y - bh / 2;
  const grow = CURVE.enter(clamp(build));
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(lerp(0.86, 1, grow), lerp(0.86, 1, grow));
  ctx.translate(-p.x, -p.y);
  if (fill) {
    roundRectPath(ctx, bx, by, bw, bh, 9 * s);
    ctx.fillStyle = rgba(PAL.charcoal2, 0.9 * alpha * grow);
    ctx.fill();
    ctx.strokeStyle = rgba(mixHex(PAL.line, accent, 0.45), alpha * 0.95 * grow);
    ctx.lineWidth = Math.max(1, 1.3 * s);
    ctx.stroke();
  }
  // corner brackets
  const cl = 11 * s;
  ctx.strokeStyle = rgba(accent, alpha * grow * 0.95);
  ctx.lineWidth = Math.max(1.2, 2.0 * s);
  ctx.lineCap = 'round';
  const corners = [[bx, by, 1, 1], [bx + bw, by, -1, 1], [bx, by + bh, 1, -1], [bx + bw, by + bh, -1, -1]];
  for (const [cx, cy, sx, sy] of corners) {
    ctx.beginPath();
    ctx.moveTo(cx + sx * cl, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + sy * cl);
    ctx.stroke();
  }
  drawTracked(ctx, text, p.x, p.y + size * s * 0.36, {
    font, size: size * s, tracking: tracking * s, color, alpha: alpha * clamp(build * 1.8 - 0.3), align: 'center',
  });
  ctx.restore();
  ctx.restore();
  return { p, w: bw, h: bh };
}

// ---------------------------------------------------------------------------
/**
 * Wireframe slot — the system scaffold. Structure appears before content
 * populates it, so the frame always has architecture (never an empty stage).
 */
export function slot(ctx, cam, { x, y, w, h, depth = 1, t = 0, alpha = 1, build = 1, accent = PAL.indigo, seed = 0 }) {
  if (alpha <= 0.004 || build <= 0.001) return;
  const p = cam.project(x, y, depth);
  const s = p.s;
  const e = CURVE.enter(clamp(build));
  const W2 = w * s * lerp(0.82, 1, e), H2 = h * s * lerp(0.82, 1, e);
  const bx = p.x - W2 / 2, by = p.y - H2 / 2;
  ctx.save();
  ctx.globalAlpha = 1;
  // hairline body
  ctx.strokeStyle = rgba(accent, alpha * 0.46 * e);
  ctx.lineWidth = Math.max(0.8, 1.2 * s);
  ctx.setLineDash([9 * s, 11 * s]);
  ctx.lineDashOffset = -t * 26 * s;
  roundRectPath(ctx, bx, by, W2, H2, 14 * s);
  ctx.stroke();
  ctx.setLineDash([]);
  // corner ticks
  const cl = 18 * s * e;
  ctx.strokeStyle = rgba(accent, alpha * 0.95 * e);
  ctx.lineWidth = Math.max(1.1, 1.9 * s);
  ctx.lineCap = 'round';
  for (const [cx, cy, sx, sy] of [[bx, by, 1, 1], [bx + W2, by, -1, 1], [bx, by + H2, 1, -1], [bx + W2, by + H2, -1, -1]]) {
    ctx.beginPath(); ctx.moveTo(cx + sx * cl, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + sy * cl); ctx.stroke();
  }
  // pending indicator: slow arc + breathing crosshair
  const ch = 7 * s * (0.7 + 0.3 * Math.sin(t * 1.6 + seed));
  ctx.strokeStyle = rgba(accent, alpha * 0.45 * e);
  ctx.lineWidth = Math.max(0.8, 1.1 * s);
  ctx.beginPath();
  ctx.moveTo(p.x - ch, p.y); ctx.lineTo(p.x + ch, p.y);
  ctx.moveTo(p.x, p.y - ch); ctx.lineTo(p.x, p.y + ch);
  ctx.stroke();
  const ar = 15 * s;
  const a0 = t * 1.25 + seed;
  ctx.strokeStyle = rgba(accent, alpha * 0.55 * e);
  ctx.lineWidth = Math.max(1, 1.5 * s);
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(p.x, p.y, ar, a0, a0 + 1.5); ctx.stroke();
  // scan line sweeping the empty slot
  const sc = ((t * 0.42 + seed * 0.3) % 1);
  const sy = by + H2 * sc;
  const sg = ctx.createLinearGradient(bx, 0, bx + W2, 0);
  sg.addColorStop(0, rgba(accent, 0));
  sg.addColorStop(0.5, rgba(accent, alpha * 0.4 * e * Math.sin(sc * Math.PI)));
  sg.addColorStop(1, rgba(accent, 0));
  ctx.fillStyle = sg;
  ctx.fillRect(bx, sy - 0.8 * s, W2, Math.max(1, 1.4 * s));
  ctx.restore();
}

/** Horizontal structural band — the "platform" layer a launch passes through. */
export function band(ctx, cam, { y, depth = 1, halfW = 520, t = 0, alpha = 1, build = 1, label = null, accent = PAL.indigoSoft, charge = 0 }) {
  if (alpha <= 0.004 || build <= 0.001) return;
  const e = CURVE.enter(clamp(build));
  const l = cam.project(-halfW, y, depth);
  const r = cam.project(halfW, y, depth);
  const s = l.s;
  const cx = (l.x + r.x) / 2;
  const span = (r.x - l.x) * e;
  const x0 = cx - span / 2, x1 = cx + span / 2;
  ctx.save();
  // glow bar on charge
  if (charge > 0.01) {
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, rgba(accent, 0));
    g.addColorStop(0.5, rgba(accent, 0.5 * charge * alpha));
    g.addColorStop(1, rgba(accent, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x0, l.y - 26 * s * charge, span, 52 * s * charge);
    ctx.globalCompositeOperation = 'source-over';
  }
  const g2 = ctx.createLinearGradient(x0, 0, x1, 0);
  g2.addColorStop(0, rgba(accent, 0));
  g2.addColorStop(0.18, rgba(accent, 0.8 * alpha));
  g2.addColorStop(0.82, rgba(accent, 0.8 * alpha));
  g2.addColorStop(1, rgba(accent, 0));
  ctx.fillStyle = g2;
  ctx.fillRect(x0, l.y - 0.9 * s, span, Math.max(1.2, 1.8 * s));
  // ticks
  const n = 26;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const xx = lerp(x0, x1, u);
    const major = i % 4 === 0;
    const fade = Math.sin(u * Math.PI);
    const hgt = (major ? 13 : 7) * s;
    ctx.fillStyle = rgba(major ? accent : PAL.mute, alpha * (major ? 0.8 : 0.42) * fade * (0.6 + 0.4 * Math.sin(t * 1.1 - i * 0.4)));
    ctx.fillRect(xx - 0.7 * s, l.y + 4 * s, Math.max(1, 1.4 * s), hgt);
  }
  if (label) {
    drawTracked(ctx, label, x0 + 26 * s, l.y - 18 * s, {
      font: FONT.mono, size: 16 * s, tracking: 5 * s, color: PAL.mute, alpha: alpha * 0.85 * e, align: 'left',
    });
  }
  ctx.restore();
}

/** Vertical measure rails flanking a spine segment. */
export function spineRails(ctx, cam, { x, y0, y1, halfW = 150, depth = 1, t = 0, alpha = 1, accent = PAL.indigoSoft }) {
  if (alpha <= 0.004) return;
  const a = cam.project(x - halfW, y0, depth);
  const b = cam.project(x + halfW, y1, depth);
  const s = a.s;
  ctx.save();
  const n = Math.max(2, Math.round(Math.abs(y1 - y0) / 42));
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const yy = lerp(a.y, b.y, u);
    const fade = Math.sin(u * Math.PI) * (0.5 + 0.5 * Math.sin(t * 1.3 - i * 0.5));
    const major = i % 4 === 0;
    ctx.fillStyle = rgba(major ? accent : PAL.mute, alpha * (major ? 0.6 : 0.3) * fade);
    const wdt = (major ? 14 : 7) * s;
    ctx.fillRect(a.x, yy - 0.7 * s, wdt, Math.max(1, 1.3 * s));
    ctx.fillRect(b.x - wdt, yy - 0.7 * s, wdt, Math.max(1, 1.3 * s));
  }
  ctx.restore();
}
