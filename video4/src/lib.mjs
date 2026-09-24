// Core drawing + motion helpers for the Northwind Repairs document intake video.
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const FONT_DIR = path.join(__dir, '..', 'node_modules', 'inter-font', 'ttf');
for (const w of ['Regular', 'Medium', 'SemiBold', 'Bold', 'ExtraBold']) {
  GlobalFonts.registerFromPath(path.join(FONT_DIR, `Inter-${w}.ttf`), 'Inter');
}

export const W = 1920, H = 1080, FPS = 30;
// Title-safe area (8% margins) and the caption band (kept free of UI).
export const SAFE = { x0: 154, y0: 86, x1: 1766, y1: 994 };
export const CAPTION_TOP = 892;

// ---------------------------------------------------------------- palette
export const PAL = {
  A: { bg: '#F7F4F0', text: '#111827', accent: '#FF8A3D', warn: '#EF5B5B', muted: '#6B7280', card: '#FFFFFF' },
  B: { bg: '#F6F9FF', text: '#111827', primary: '#4C6FFF', secondary: '#7C5CFC', success: '#19B89D', muted: '#64748B', card: '#FFFFFF' },
  C: { bg: '#FFF9ED', text: '#111827', accent: '#F5A524', success: '#19B89D', muted: '#6B7280', card: '#FFFFFF' },
  D: { bg: '#0B1220', text: '#F3F6FB', accent: '#46C7FF', success: '#36D399', muted: '#94A3B8', card: '#121B2E' },
};

// ---------------------------------------------------------------- math / easing
export const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const lerp = (a, b, t) => a + (b - a) * t;
export const E = {
  outExpo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  inCubic: (x) => x * x * x,
  outCubic: (x) => 1 - Math.pow(1 - x, 3),
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  inOutSine: (x) => -(Math.cos(Math.PI * x) - 1) / 2,
};
export const prog = (t, t0, d) => clamp01((t - t0) / d);
// Entrance (easeOutExpo, 450ms) / exit (easeInCubic, 300ms) helper.
export function vis(t, tin, tout = 1e9, din = 0.45, dout = 0.3) {
  const e = E.outExpo(prog(t, tin, din));
  const x = E.inCubic(prog(t, tout, dout));
  return { a: e * (1 - x), e, x, dy: (1 - e) * 22 - x * 10, on: t >= tin && t < tout + dout };
}
// Micro-overshoot pop (max 4%) for badges / checkmarks / counters.
export function popScale(p) {
  if (p <= 0) return 0.6;
  if (p < 0.6) return 0.6 + 0.44 * E.outCubic(p / 0.6);
  if (p < 1) return 1.04 - 0.04 * E.inOutCubic((p - 0.6) / 0.4);
  return 1;
}
export function hexA(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
export function mixHex(h1, h2, t) {
  const p = (h) => [0, 2, 4].map((i) => parseInt(h.replace('#', '').slice(i, i + 2), 16));
  const a = p(h1), b = p(h2);
  const c = a.map((v, i) => Math.round(lerp(v, b[i], t)));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------- context + QA
export let ctx = null;
export function setCtx(c) { ctx = c; }
export const QA = { enabled: false, suppress: 0, issues: [], t: 0 };
function qaRect(x, y, w, h, label, bandCheck = true) {
  if (!QA.enabled || QA.suppress > 0 || ctx.globalAlpha < 0.6) return;
  const m = ctx.getTransform();
  const pts = [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].map(([px, py]) => [m.a * px + m.c * py + m.e, m.b * px + m.d * py + m.f]);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const bx0 = Math.min(...xs), bx1 = Math.max(...xs), by0 = Math.min(...ys), by1 = Math.max(...ys);
  const tol = 1;
  const yMax = bandCheck ? CAPTION_TOP : SAFE.y1;
  if (bx0 < SAFE.x0 - tol || bx1 > SAFE.x1 + tol || by0 < SAFE.y0 - tol || by1 > yMax + tol) {
    QA.issues.push(`t=${QA.t.toFixed(2)} out-of-safe "${label}" [${bx0.toFixed(0)},${by0.toFixed(0)} – ${bx1.toFixed(0)},${by1.toFixed(0)}]`);
  }
}
export function qaNote(msg) { if (QA.enabled) QA.issues.push(`t=${QA.t.toFixed(2)} ${msg}`); }

export function withAlpha(a, fn) {
  if (a <= 0.001) return;
  ctx.save(); ctx.globalAlpha *= clamp01(a); fn(); ctx.restore();
}
export function withT(x, y, s, fn, a = 1) {
  if (a <= 0.001) return;
  ctx.save(); ctx.globalAlpha *= clamp01(a); ctx.translate(x, y); ctx.scale(s, s); fn(); ctx.restore();
}

// ---------------------------------------------------------------- text
export function font(size, weight = 500) { ctx.font = `${weight} ${size}px Inter`; }
export function measure(s, size, weight = 500) { font(size, weight); return ctx.measureText(s).width; }
/**
 * Draw single-line text. opt: size, weight, color, align, maxW (overflow is a QA error), baseline.
 */
export function text(s, x, y, opt = {}) {
  const { size = 24, weight = 500, color = '#111827', align = 'left', maxW = null, baseline = 'middle', qa = true, band = true } = opt;
  font(size, weight);
  ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = baseline;
  const w = ctx.measureText(s).width;
  if (maxW != null && w > maxW + 0.5) qaNote(`TEXT OVERFLOW "${s}" ${w.toFixed(0)} > ${maxW}`);
  ctx.fillText(s, x, y);
  if (qa) {
    const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    qaRect(x0, y - size * 0.6, w, size * 1.2, s, band);
  }
  return w;
}
/** Word wrap into lines that fit maxW. */
export function wrap(s, maxW, size, weight = 500) {
  font(size, weight);
  const words = s.split(' '); const lines = []; let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width <= maxW || !cur) cur = test; else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}

// ---------------------------------------------------------------- shapes
export function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
/** Card with soft shadow. */
export function card(x, y, w, h, opt = {}) {
  const { r = 20, fill = '#FFFFFF', shadow = 1, stroke = 'rgba(17,24,39,0.06)', lw = 1, label = 'card', qa = true } = opt;
  ctx.save();
  if (shadow > 0) {
    ctx.shadowColor = opt.shadowColor || `rgba(17,24,39,${0.07 * shadow})`;
    ctx.shadowBlur = 28 * shadow; ctx.shadowOffsetY = 10 * shadow;
  }
  ctx.fillStyle = fill; rrect(x, y, w, h, r); ctx.fill();
  ctx.restore();
  if (stroke) { ctx.save(); ctx.strokeStyle = stroke; ctx.lineWidth = lw; rrect(x + 0.5, y + 0.5, w - 1, h - 1, r); ctx.stroke(); ctx.restore(); }
  if (qa) qaRect(x, y, w, h, label);
}
/** Highlight sweep (hover): a soft diagonal light band that moves across a rounded rect. */
export function sweep(x, y, w, h, r, p, color = 'rgba(255,255,255,0.55)') {
  if (p <= 0 || p >= 1) return;
  ctx.save(); rrect(x, y, w, h, r); ctx.clip();
  const cx = lerp(x - w * 0.4, x + w * 1.4, E.inOutCubic(p));
  const g = ctx.createLinearGradient(cx - 120, y, cx + 120, y + h);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, color); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h); ctx.restore();
}
/** Pill / chip. Returns width. opt: h, size, bg, fg, stroke, icon(fn), dot color, pad. */
export function chipWidth(label, opt = {}) {
  const { size = 22, weight = 600, pad = 18, icon = null, dot = null, h = 44 } = opt;
  return measure(label, size, weight) + pad * 2 + (icon ? h * 0.5 + 10 : 0) + (dot ? 18 : 0);
}
export function chip(label, x, y, opt = {}) {
  const { size = 22, weight = 600, pad = 18, h = 44, bg = '#EEF2FF', fg = '#111827', stroke = null, icon = null, dot = null, align = 'left', shadow = 0, iconColor = null } = opt;
  const w = chipWidth(label, opt);
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  const y0 = y - h / 2;
  if (shadow) card(x0, y0, w, h, { r: h / 2, fill: bg, shadow, stroke: stroke || null, label });
  else { ctx.fillStyle = bg; rrect(x0, y0, w, h, h / 2); ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; rrect(x0 + 0.75, y0 + 0.75, w - 1.5, h - 1.5, h / 2); ctx.stroke(); } qaRect(x0, y0, w, h, label); }
  let cx = x0 + pad;
  if (dot) { ctx.fillStyle = dot; ctx.beginPath(); ctx.arc(cx + 5, y, 5, 0, Math.PI * 2); ctx.fill(); cx += 18; }
  if (icon) { const s = h * 0.5; icon(cx + s / 2, y, s, iconColor || fg); cx += s + 10; }
  text(label, cx, y + 1, { size, weight, color: fg, qa: false });
  return { x: x0, y: y0, w, h };
}

// ---------------------------------------------------------------- icons (stroke style)
function stroke(color, lw = 2.4) { ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; }
export const ICON = {
  folder(cx, cy, s, c) { stroke(c, s * 0.1); ctx.beginPath(); ctx.moveTo(cx - s * 0.44, cy + s * 0.34); ctx.lineTo(cx - s * 0.44, cy - s * 0.34); ctx.lineTo(cx - s * 0.12, cy - s * 0.34); ctx.lineTo(cx - s * 0.02, cy - s * 0.22); ctx.lineTo(cx + s * 0.44, cy - s * 0.22); ctx.lineTo(cx + s * 0.44, cy + s * 0.34); ctx.closePath(); ctx.stroke(); },
  db(cx, cy, s, c) { stroke(c, s * 0.1); const rx = s * 0.36, ry = s * 0.12; ctx.beginPath(); ctx.ellipse(cx, cy - s * 0.3, rx, ry, 0, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx - rx, cy - s * 0.3); ctx.lineTo(cx - rx, cy + s * 0.3); ctx.ellipse(cx, cy + s * 0.3, rx, ry, 0, Math.PI, 0, true); ctx.lineTo(cx + rx, cy - s * 0.3); ctx.stroke(); ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI); ctx.stroke(); },
  copy(cx, cy, s, c) { stroke(c, s * 0.1); rrect(cx - s * 0.3, cy - s * 0.18, s * 0.5, s * 0.58, s * 0.08); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx - s * 0.14, cy - s * 0.3); ctx.lineTo(cx - s * 0.14, cy - s * 0.4); ctx.lineTo(cx + s * 0.36, cy - s * 0.4); ctx.lineTo(cx + s * 0.36, cy + s * 0.2); ctx.lineTo(cx + s * 0.26, cy + s * 0.2); ctx.stroke(); },
  calendar(cx, cy, s, c) { stroke(c, s * 0.1); rrect(cx - s * 0.42, cy - s * 0.34, s * 0.84, s * 0.74, s * 0.12); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx - s * 0.42, cy - s * 0.08); ctx.lineTo(cx + s * 0.42, cy - s * 0.08); ctx.moveTo(cx - s * 0.2, cy - s * 0.46); ctx.lineTo(cx - s * 0.2, cy - s * 0.26); ctx.moveTo(cx + s * 0.2, cy - s * 0.46); ctx.lineTo(cx + s * 0.2, cy - s * 0.26); ctx.stroke(); },
  globe(cx, cy, s, c) { stroke(c, s * 0.09); ctx.beginPath(); ctx.arc(cx, cy, s * 0.4, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.ellipse(cx, cy, s * 0.17, s * 0.4, 0, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx - s * 0.4, cy); ctx.lineTo(cx + s * 0.4, cy); ctx.stroke(); },
  mail(cx, cy, s, c) { stroke(c, s * 0.1); const w = s, h = s * 0.72; rrect(cx - w / 2, cy - h / 2, w, h, s * 0.12); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx - w / 2 + 2, cy - h / 2 + 3); ctx.lineTo(cx, cy + h * 0.08); ctx.lineTo(cx + w / 2 - 2, cy - h / 2 + 3); ctx.stroke(); },
  search(cx, cy, s, c) { stroke(c, s * 0.11); ctx.beginPath(); ctx.arc(cx - s * 0.08, cy - s * 0.08, s * 0.3, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx + s * 0.14, cy + s * 0.14); ctx.lineTo(cx + s * 0.4, cy + s * 0.4); ctx.stroke(); },
  link(cx, cy, s, c) { stroke(c, s * 0.11); ctx.save(); ctx.translate(cx, cy); ctx.rotate(-Math.PI / 4); rrect(-s * 0.48, -s * 0.17, s * 0.5, s * 0.34, s * 0.17); ctx.stroke(); rrect(-s * 0.02, -s * 0.17, s * 0.5, s * 0.34, s * 0.17); ctx.stroke(); ctx.restore(); },
  check(cx, cy, s, c, p = 1) { stroke(c, s * 0.14); const pts = [[-0.32, 0.02], [-0.08, 0.26], [0.36, -0.22]]; ctx.beginPath(); ctx.moveTo(cx + pts[0][0] * s, cy + pts[0][1] * s); const L1 = 0.34, L2 = 0.66; const q = clamp01(p); if (q <= L1) { const k = q / L1; ctx.lineTo(cx + lerp(pts[0][0], pts[1][0], k) * s, cy + lerp(pts[0][1], pts[1][1], k) * s); } else { ctx.lineTo(cx + pts[1][0] * s, cy + pts[1][1] * s); const k = (q - L1) / L2; ctx.lineTo(cx + lerp(pts[1][0], pts[2][0], k) * s, cy + lerp(pts[1][1], pts[2][1], k) * s); } ctx.stroke(); },
  shield(cx, cy, s, c) { stroke(c, s * 0.1); ctx.beginPath(); ctx.moveTo(cx, cy - s * 0.45); ctx.lineTo(cx + s * 0.38, cy - s * 0.3); ctx.lineTo(cx + s * 0.34, cy + s * 0.08); ctx.quadraticCurveTo(cx + s * 0.25, cy + s * 0.35, cx, cy + s * 0.47); ctx.quadraticCurveTo(cx - s * 0.25, cy + s * 0.35, cx - s * 0.34, cy + s * 0.08); ctx.lineTo(cx - s * 0.38, cy - s * 0.3); ctx.closePath(); ctx.stroke(); },
  clock(cx, cy, s, c) { stroke(c, s * 0.1); ctx.beginPath(); ctx.arc(cx, cy, s * 0.42, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx, cy - s * 0.24); ctx.lineTo(cx, cy); ctx.lineTo(cx + s * 0.18, cy + s * 0.12); ctx.stroke(); },
  bell(cx, cy, s, c) { stroke(c, s * 0.1); ctx.beginPath(); ctx.moveTo(cx - s * 0.34, cy + s * 0.22); ctx.quadraticCurveTo(cx - s * 0.26, cy + s * 0.1, cx - s * 0.26, cy - s * 0.06); ctx.arc(cx, cy - s * 0.06, s * 0.26, Math.PI, 0); ctx.quadraticCurveTo(cx + s * 0.26, cy + s * 0.1, cx + s * 0.34, cy + s * 0.22); ctx.closePath(); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy + s * 0.32, s * 0.08, 0, Math.PI); ctx.stroke(); },
  refresh(cx, cy, s, c) { stroke(c, s * 0.1); ctx.beginPath(); ctx.arc(cx, cy, s * 0.34, -Math.PI * 0.1, Math.PI * 1.45); ctx.stroke(); const a = -Math.PI * 0.1; const ex = cx + Math.cos(a) * s * 0.34, ey = cy + Math.sin(a) * s * 0.34; ctx.beginPath(); ctx.moveTo(ex - s * 0.16, ey - s * 0.04); ctx.lineTo(ex, ey); ctx.lineTo(ex + s * 0.06, ey - s * 0.17); ctx.stroke(); },
  alert(cx, cy, s, c) { stroke(c, s * 0.1); ctx.beginPath(); ctx.moveTo(cx, cy - s * 0.4); ctx.lineTo(cx + s * 0.44, cy + s * 0.36); ctx.lineTo(cx - s * 0.44, cy + s * 0.36); ctx.closePath(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx, cy - s * 0.12); ctx.lineTo(cx, cy + s * 0.1); ctx.stroke(); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(cx, cy + s * 0.22, s * 0.05, 0, Math.PI * 2); ctx.fill(); },
  doc(cx, cy, s, c) { stroke(c, s * 0.1); rrect(cx - s * 0.32, cy - s * 0.42, s * 0.64, s * 0.84, s * 0.1); ctx.stroke(); for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(cx - s * 0.16, cy - s * 0.16 + i * s * 0.17); ctx.lineTo(cx + s * 0.16, cy - s * 0.16 + i * s * 0.17); ctx.stroke(); } },
  inbox(cx, cy, s, c) { stroke(c, s * 0.1); rrect(cx - s * 0.44, cy - s * 0.36, s * 0.88, s * 0.72, s * 0.12); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx - s * 0.44, cy + s * 0.04); ctx.lineTo(cx - s * 0.16, cy + s * 0.04); ctx.lineTo(cx - s * 0.1, cy + s * 0.16); ctx.lineTo(cx + s * 0.1, cy + s * 0.16); ctx.lineTo(cx + s * 0.16, cy + s * 0.04); ctx.lineTo(cx + s * 0.44, cy + s * 0.04); ctx.stroke(); },
  lock(cx, cy, s, c) { stroke(c, s * 0.1); rrect(cx - s * 0.32, cy - s * 0.06, s * 0.64, s * 0.46, s * 0.08); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy - s * 0.06, s * 0.2, Math.PI, 0); ctx.stroke(); },
  user(cx, cy, s, c) { stroke(c, s * 0.1); ctx.beginPath(); ctx.arc(cx, cy - s * 0.14, s * 0.18, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy + s * 0.42, s * 0.34, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); },
  question(cx, cy, s, c) { stroke(c, s * 0.11); ctx.beginPath(); ctx.arc(cx, cy - s * 0.12, s * 0.2, Math.PI * 1.05, Math.PI * 0.45); ctx.lineTo(cx, cy + s * 0.14); ctx.stroke(); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(cx, cy + s * 0.33, s * 0.055, 0, Math.PI * 2); ctx.fill(); },
  bolt(cx, cy, s, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(cx + s * 0.06, cy - s * 0.46); ctx.lineTo(cx - s * 0.26, cy + s * 0.06); ctx.lineTo(cx - s * 0.02, cy + s * 0.06); ctx.lineTo(cx - s * 0.08, cy + s * 0.46); ctx.lineTo(cx + s * 0.26, cy - s * 0.08); ctx.lineTo(cx + s * 0.02, cy - s * 0.08); ctx.closePath(); ctx.fill(); },
  tone(cx, cy, s, c) { stroke(c, s * 0.1); for (let i = 0; i < 3; i++) { const hgt = [0.3, 0.6, 0.42][i] * s; const x = cx - s * 0.28 + i * s * 0.28; ctx.beginPath(); ctx.moveTo(x, cy - hgt / 2); ctx.lineTo(x, cy + hgt / 2); ctx.stroke(); } },
  list(cx, cy, s, c) { stroke(c, s * 0.1); for (let i = 0; i < 3; i++) { const y = cy - s * 0.28 + i * s * 0.28; ctx.beginPath(); ctx.arc(cx - s * 0.3, y, s * 0.04, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx - s * 0.14, y); ctx.lineTo(cx + s * 0.38, y); ctx.stroke(); } },
  pencil(cx, cy, s, c) { stroke(c, s * 0.1); ctx.save(); ctx.translate(cx, cy); ctx.rotate(-Math.PI / 4); rrect(-s * 0.4, -s * 0.11, s * 0.7, s * 0.22, s * 0.04); ctx.stroke(); ctx.beginPath(); ctx.moveTo(s * 0.3, -s * 0.11); ctx.lineTo(s * 0.46, 0); ctx.lineTo(s * 0.3, s * 0.11); ctx.stroke(); ctx.restore(); },
  x(cx, cy, s, c) { stroke(c, s * 0.11); ctx.beginPath(); ctx.moveTo(cx - s * 0.22, cy - s * 0.22); ctx.lineTo(cx + s * 0.22, cy + s * 0.22); ctx.moveTo(cx + s * 0.22, cy - s * 0.22); ctx.lineTo(cx - s * 0.22, cy + s * 0.22); ctx.stroke(); },
  arrow(cx, cy, s, c) { stroke(c, s * 0.1); ctx.beginPath(); ctx.moveTo(cx - s * 0.36, cy); ctx.lineTo(cx + s * 0.36, cy); ctx.moveTo(cx + s * 0.14, cy - s * 0.22); ctx.lineTo(cx + s * 0.36, cy); ctx.lineTo(cx + s * 0.14, cy + s * 0.22); ctx.stroke(); },
  snow(cx, cy, s, c) { stroke(c, s * 0.09); for (let i = 0; i < 3; i++) { const a = (i * Math.PI) / 3; ctx.beginPath(); ctx.moveTo(cx - Math.cos(a) * s * 0.4, cy - Math.sin(a) * s * 0.4); ctx.lineTo(cx + Math.cos(a) * s * 0.4, cy + Math.sin(a) * s * 0.4); ctx.stroke(); } },
  flag(cx, cy, s, c) { stroke(c, s * 0.1); ctx.beginPath(); ctx.moveTo(cx - s * 0.3, cy + s * 0.44); ctx.lineTo(cx - s * 0.3, cy - s * 0.4); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx - s * 0.3, cy - s * 0.4); ctx.lineTo(cx + s * 0.34, cy - s * 0.24); ctx.lineTo(cx - s * 0.3, cy - s * 0.04); ctx.stroke(); },
  layers(cx, cy, s, c) { stroke(c, s * 0.1); for (let i = 0; i < 3; i++) { const y = cy - s * 0.22 + i * s * 0.22; ctx.beginPath(); ctx.moveTo(cx - s * 0.42, y); ctx.lineTo(cx, y + s * 0.16); ctx.lineTo(cx + s * 0.42, y); if (i === 0) { ctx.lineTo(cx, y - s * 0.16); ctx.closePath(); } ctx.stroke(); } },
  chart(cx, cy, s, c) { stroke(c, s * 0.1); ctx.beginPath(); ctx.moveTo(cx - s * 0.4, cy + s * 0.34); ctx.lineTo(cx + s * 0.4, cy + s * 0.34); ctx.stroke(); ctx.beginPath(); ctx.moveTo(cx - s * 0.32, cy + s * 0.14); ctx.lineTo(cx - s * 0.08, cy - s * 0.06); ctx.lineTo(cx + s * 0.08, cy + s * 0.06); ctx.lineTo(cx + s * 0.34, cy - s * 0.26); ctx.stroke(); },
};

/** Check badge: circle draws, then check stroke. p in 0..1 over ~0.6s. */
export function checkBadge(cx, cy, r, p, color, fillAfter = true) {
  if (p <= 0) return;
  const pc = clamp01(p / 0.5), pk = clamp01((p - 0.35) / 0.5);
  const s = popScale(clamp01(p / 0.9));
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  if (fillAfter) { ctx.fillStyle = hexA(color, 0.14 * pc); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(2, r * 0.13); ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 0, r - ctx.lineWidth / 2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * E.outCubic(pc)); ctx.stroke();
  if (pk > 0) ICON.check(0, 0, r * 1.1, color, E.outCubic(pk));
  ctx.restore();
}
/** Avatar with initials. */
export function avatar(cx, cy, r, initials, bg, fg = '#FFFFFF') {
  ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  text(initials, cx, cy + 1, { size: Math.round(r * 0.78), weight: 700, color: fg, align: 'center', qa: false });
}
/** Placeholder skeleton line. */
export function skel(x, y, w, h = 12, color = 'rgba(17,24,39,0.08)') { ctx.fillStyle = color; rrect(x, y - h / 2, w, h, h / 2); ctx.fill(); }

/** Mouse cursor (arrow) with press scale. */
export function cursor(x, y, press = 0, a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); const s = 1 - 0.1 * press; ctx.scale(s, s);
  ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 30); ctx.lineTo(8, 23); ctx.lineTo(14, 36); ctx.lineTo(19, 34); ctx.lineTo(13, 21.5); ctx.lineTo(23, 21.5); ctx.closePath();
  ctx.fillStyle = '#111827'; ctx.fill(); ctx.shadowColor = 'transparent'; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.restore();
}
/** Click ripple. */
export function ripple(x, y, t, tc, color = '#4C6FFF') {
  const p = prog(t, tc, 0.5); if (p <= 0 || p >= 1) return;
  ctx.save(); ctx.strokeStyle = hexA(color, 0.45 * (1 - p)); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 8 + 34 * E.outCubic(p), 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = hexA(color, 0.14 * (1 - p)); ctx.fill(); ctx.restore();
}
/** Cursor path from keyframes [{t,x,y}] with eased motion; clicks: [times]. */
export function cursorAt(t, keys) {
  if (t <= keys[0].t) return { x: keys[0].x, y: keys[0].y };
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t <= b.t) { const p = E.inOutCubic(clamp01((t - a.t) / (b.t - a.t))); return { x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p) }; }
  }
  const l = keys[keys.length - 1]; return { x: l.x, y: l.y };
}
export function pressAt(t, clicks) {
  let pr = 0;
  for (const c of clicks) { const d = t - c; if (d > -0.08 && d < 0.2) pr = Math.max(pr, d < 0 ? (d + 0.08) / 0.08 : 1 - d / 0.2); }
  return clamp01(pr);
}
/** Hover factor 0..1 between times (ease in/out 0.2s). */
export function hoverAt(t, t0, t1) { return clamp01(Math.min((t - t0) / 0.2, (t1 - t) / 0.2)); }
/** Click press factor for a button: 0..1 (scale to 0.97 then spring back). */
export function pressScale(t, tc) { const d = t - tc; if (d < -0.07 || d > 0.35) return 1; if (d < 0) return 1 - 0.03 * ((d + 0.07) / 0.07); const k = d / 0.35; return 1 - 0.03 * Math.cos(k * Math.PI * 0.5) * (1 - k) + 0.006 * Math.sin(k * Math.PI) ; }

/** Headline where each word enters exactly when it is spoken. words: [[word, time, color?]] */
export function wordsLine(words, x, y, opt = {}) {
  const { size = 52, weight = 700, color = '#111827', align = 'center', tout = 1e9, gap = null, maxW = 1500 } = opt;
  font(size, weight);
  const sp = gap ?? ctx.measureText(' ').width;
  const ws = words.map((w) => ctx.measureText(w[0]).width);
  const total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  if (total > maxW) qaNote(`HEADLINE OVERFLOW "${words.map((w) => w[0]).join(' ')}" ${total.toFixed(0)} > ${maxW}`);
  let cx = align === 'center' ? x - total / 2 : x;
  words.forEach((w, i) => {
    const v = vis(QA.t, w[1], tout, 0.42, 0.28);
    if (v.a > 0.001) withAlpha(v.a, () => text(w[0], cx, y + v.dy * 0.8, { size, weight, color: w[2] || color }));
    cx += ws[i] + sp;
  });
  return total;
}

/** Rolling counter digit strip. value may be fractional between integers during roll. */
export function rollNumber(value, x, y, size, color, opt = {}) {
  const { weight = 700, align = 'left', digits = null } = opt;
  const v = Math.max(0, value);
  const intPart = Math.floor(v + 1e-6), frac = v - intPart;
  const str = String(Math.round(v >= intPart + 0.999 ? intPart + 1 : intPart));
  const nd = digits || Math.max(str.length, String(Math.ceil(v)).length);
  font(size, weight);
  const dw = ctx.measureText('0').width;
  const totalW = dw * nd;
  let x0 = align === 'center' ? x - totalW / 2 : align === 'right' ? x - totalW : x;
  ctx.save(); ctx.beginPath(); ctx.rect(x0 - 10, y - size * 0.62, totalW + 20, size * 1.24); ctx.clip();
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  // Each digit rolls; lower digits roll with fraction.
  for (let i = 0; i < nd; i++) {
    const place = Math.pow(10, nd - 1 - i);
    const dv = v / place; // continuous
    const d = Math.floor(dv) % 10; const f = place === 1 ? frac : (Math.floor(v) % place === place - 1 ? frac : 0);
    const cx = x0 + dw * i + dw / 2;
    const lead = Math.floor(dv) === 0 && i < nd - 1 && f === 0;
    if (!lead) ctx.fillText(String(d), cx, y - f * size * 1.1);
    if (f > 0) ctx.fillText(String((d + 1) % 10), cx, y + (1 - f) * size * 1.1);
  }
  ctx.restore();
  return totalW;
}

export { createCanvas };
