// Reusable UI components (inbox rows, windows, headlines, tags, buttons).
import {
  ctx, PAL, E, QA, clamp01, lerp, prog, vis, popScale, hexA, text, measure, card, chip, chipWidth, ICON, avatar, skel,
  withAlpha, withT, wordsLine, rrect, sweep, checkBadge, font,
} from './lib.mjs';

export const HEAD_Y = 205, EYEBROW_Y = 140;

// ---------------------------------------------------------------- locked fictional data
export const BIZ = 'Northwind Repairs';
export const INBOX = 'Intake inbox';
export const DOC_TYPE = 'Service intake form';
export const FILE = 'Intake_Form_NW-2041.pdf';
export const REF = 'NW-2041';
export const SAM = { name: 'Sam Rivera', ini: 'SR', email: 'sam.rivera@clientmail.example', color: '#4C6FFF' };
export const JOB = 'Appliance repair';
export const PHONE = '(555) 014-8821';
export const ADDRESS = '18 Oak Street, Austin, TX';
export const PREF_DATE = 'Next Tuesday';
// Extracted fields (exact labels + values)
export const FIELDS = [
  ['Reference ID', REF], ['Customer name', SAM.name], ['Email', SAM.email], ['Phone', PHONE],
  ['Address', ADDRESS], ['Job type', JOB], ['Preferred date', PREF_DATE],
];
export const REQUIRED = ['Reference ID', 'Email', 'Phone', 'Address'];
export const COLUMNS = ['Reference ID', 'Customer name', 'Job type', 'Status', 'Assigned to', 'File link', 'Notes'];
export const ASSIGNED = 'Intake team';
// ---------------------------------------------------------------- tag styles
export const TAG = {
  neutral: { bg: 'rgba(17,24,39,0.06)', fg: '#374151' },
  amber: { bg: hexA('#F5A524', 0.18), fg: '#8A5300', dot: '#F5A524' },
  amberOutline: { bg: 'rgba(255,255,255,0.0)', fg: '#8A5300', stroke: hexA('#F5A524', 0.7) },
  blue: { bg: hexA('#4C6FFF', 0.1), fg: '#3148C7' },
  green: { bg: hexA('#19B89D', 0.14), fg: '#0B7A67', dot: '#19B89D' },
  warm: { bg: hexA('#FF8A3D', 0.14), fg: '#A34A0E', dot: '#FF8A3D' },
  warn: { bg: hexA('#EF5B5B', 0.12), fg: '#B42323', dot: '#EF5B5B' },
};
export function tag(label, x, y, style, opt = {}) {
  return chip(label, x, y, { size: opt.size || 18, h: opt.h || 34, pad: opt.pad || 14, weight: 600, bg: style.bg, fg: style.fg, stroke: style.stroke || null, dot: opt.dot === false ? null : style.dot || null, align: opt.align || 'left', icon: opt.icon || null });
}
export function tagWidth(label, style, opt = {}) {
  return chipWidth(label, { size: opt.size || 18, h: opt.h || 34, pad: opt.pad || 14, weight: 600, dot: opt.dot === false ? null : style.dot || null, icon: opt.icon || null });
}

// ---------------------------------------------------------------- headline / eyebrow
export function headline(words, t, opt = {}) {
  const { y = HEAD_Y, tout = 1e9, size = 52, color = '#111827', maxW = 1500 } = opt;
  return wordsLine(words, 960, y, { size, color, tout, maxW });
}
export function eyebrow(label, t, tin, tout, opt = {}) {
  const v = vis(t, tin, tout);
  if (v.a <= 0) return;
  const { dot = '#FF8A3D', bg = 'rgba(17,24,39,0.05)', fg = '#374151', y = EYEBROW_Y } = opt;
  withAlpha(v.a, () => chip(label, 960, y + v.dy * 0.6, { align: 'center', size: 22, h: 44, bg, fg, dot }));
}
/** Underline marker that draws under a word range (x0..x1) at y. */
export function marker(x0, x1, y, p, color) {
  if (p <= 0) return;
  ctx.fillStyle = color; rrect(x0, y, (x1 - x0) * E.outExpo(p), 8, 4); ctx.fill();
}

// ---------------------------------------------------------------- app window
export function appWindow(x, y, w, h, title, opt = {}) {
  card(x, y, w, h, { r: 22, shadow: 1.2, label: 'window:' + title });
  // top bar
  ctx.save(); rrect(x, y, w, 60, [22, 22, 0, 0]); ctx.fillStyle = opt.barColor || 'rgba(17,24,39,0.025)'; ctx.fill(); ctx.restore();
  ctx.fillStyle = 'rgba(17,24,39,0.07)'; ctx.fillRect(x, y + 60, w, 1);
  for (let i = 0; i < 3; i++) { ctx.fillStyle = 'rgba(17,24,39,0.14)'; ctx.beginPath(); ctx.arc(x + 30 + i * 20, y + 30, 6, 0, Math.PI * 2); ctx.fill(); }
  text(title, x + 104, y + 31, { size: 20, weight: 600, color: '#374151', maxW: w - 360 });
  if (opt.owner !== false && opt.owner !== null) {
    chip(opt.owner || BIZ, x + w - 20, y + 30, { align: 'right', size: 18, h: 36, pad: 14, bg: 'rgba(17,24,39,0.05)', fg: '#374151', icon: ICON.user });
  }
}

/** Email row. opt: name, ini, color, subject, tag {label, style}, extraTag, selected, hover, dim, showTime */
export function emailRow(x, y, w, h, c, opt = {}) {
  const { tagInfo = null, extraTag = null, selected = 0, hover = 0, unnamed = false, subjectMark = 0, markColor = '#4C6FFF', leftBar = null, time = false } = opt;
  const s = 1 + 0.025 * hover;
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s); ctx.translate(-(x + w / 2), -(y + h / 2));
  if (selected > 0 || hover > 0) {
    ctx.fillStyle = hexA(markColor, 0.07 * Math.max(selected, hover)); rrect(x + 6, y + 4, w - 12, h - 8, 14); ctx.fill();
  }
  if (hover > 0) sweep(x + 6, y + 4, w - 12, h - 8, 14, hover < 1 ? hover : 0);
  if (leftBar) { ctx.fillStyle = leftBar; rrect(x + 8, y + 16, 5, h - 32, 3); ctx.fill(); }
  const cy = y + h / 2;
  if (unnamed) { ctx.fillStyle = 'rgba(17,24,39,0.08)'; ctx.beginPath(); ctx.arc(x + 44, cy, 22, 0, Math.PI * 2); ctx.fill(); skel(x + 80, cy - 13, 140, 12); }
  else { avatar(x + 44, cy, 22, c.ini, c.color); text(c.name, x + 80, cy - 13, { size: 21, weight: 600, color: '#111827' }); }
  const subW = text(c.subject, x + 80, cy + 15, { size: 19, weight: 500, color: '#4B5563' });
  if (subjectMark > 0) { ctx.fillStyle = hexA(markColor, 0.18); rrect(x + 76, cy + 15 - 14, (subW + 8) * E.outExpo(subjectMark), 28, 6); ctx.fill(); }
  let rx = x + w - 20;
  if (time) { text(c.time, rx, cy - 13, { size: 17, weight: 500, color: '#6B7280', align: 'right' }); }
  if (tagInfo && tagInfo.a > 0) {
    withAlpha(tagInfo.a, () => withT(rx, cy + (time ? 13 : 0), tagInfo.s ?? 1, () => { const r = tag(tagInfo.label, 0, 0, tagInfo.style, { align: 'right' }); rx -= 0; }));
    rx -= tagWidth(tagInfo.label, tagInfo.style) + 10;
  }
  if (extraTag && extraTag.a > 0) {
    withAlpha(extraTag.a, () => withT(rx, cy + (time ? 13 : 0), extraTag.s ?? 1, () => tag(extraTag.label, 0, 0, extraTag.style, { align: 'right' })));
  }
  ctx.restore();
}

/** Primary / secondary button. kind: filled|outline|ghost */
export function button(label, x, y, opt = {}) {
  const { kind = 'filled', color = '#19B89D', icon = null, h = 52, size = 21, press = 1, hover = 0, align = 'left' } = opt;
  const w = chipWidth(label, { size, pad: 22, icon, h });
  const x0 = align === 'right' ? x - w : x;
  const s = press * (1 + 0.025 * hover);
  ctx.save(); ctx.translate(x0 + w / 2, y); ctx.scale(s, s); ctx.translate(-(x0 + w / 2), -y);
  const fg = kind === 'filled' ? '#FFFFFF' : kind === 'outline' ? color : '#4B5563';
  if (kind === 'filled') card(x0, y - h / 2, w, h, { r: 14, fill: color, shadow: 0.6 + 0.6 * hover, stroke: null, label });
  else if (kind === 'outline') { card(x0, y - h / 2, w, h, { r: 14, fill: '#FFFFFF', shadow: 0.2 + 0.6 * hover, stroke: hexA(color, 0.8), lw: 2, label }); }
  else { ctx.fillStyle = 'rgba(17,24,39,0.05)'; rrect(x0, y - h / 2, w, h, 14); ctx.fill(); }
  if (hover > 0) sweep(x0, y - h / 2, w, h, 14, hover < 1 ? hover : 0);
  let cx = x0 + 22;
  if (icon) { icon(cx + h * 0.25, y, h * 0.5, fg); cx += h * 0.5 + 10; }
  text(label, cx, y + 1, { size, weight: 600, color: fg, qa: false });
  ctx.restore();
  return { x: x0, w };
}

/** Rolling text (flip/roll counters). seq: [{t, s}] */
export function rollText(seq, t, x, y, opt = {}) {
  const { size = 120, weight = 700, color = '#111827', align = 'left', d = 0.42 } = opt;
  let i = -1; for (let k = 0; k < seq.length; k++) if (t >= seq[k].t) i = k;
  if (i < 0) return;
  const cur = seq[i], prev = seq[i - 1];
  const p = E.outExpo(prog(t, cur.t, d));
  const clipH = size * 1.3;
  ctx.save(); ctx.beginPath(); ctx.rect(x - (align === 'left' ? 10 : 800), y - clipH / 2, 1600, clipH); ctx.clip();
  if (prev && p < 1) withAlpha(1 - p, () => text(prev.s, x, y - p * size * 0.9, { size, weight, color, align }));
  const bump = 1 + 0.035 * Math.sin(Math.PI * clamp01(prog(t, cur.t, d * 1.4)));
  withAlpha(i === 0 ? p : p, () => withT(x, y + (1 - p) * size * 0.9, bump, () => text(cur.s, 0, 0, { size, weight, color, align })));
  ctx.restore();
}

/** Typing text helper: returns visible substring for typing between t0..t1. */
export function typed(s, t, t0, t1) {
  if (t <= t0) return '';
  if (t >= t1) return s;
  return s.slice(0, Math.round(s.length * (t - t0) / (t1 - t0)));
}
export function caretOn(t) { return Math.floor(t * 2.2) % 2 === 0; }

/** Connector curve drawn progressively between two points. */
export function connector(x0, y0, x1, y1, p, color, lw = 2.5) {
  if (p <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.setLineDash([2, 8]);
  const n = 40, pe = E.outCubic(clamp01(p));
  ctx.beginPath();
  for (let i = 0; i <= n * pe; i++) {
    const u = i / n; const mx = (x0 + x1) / 2;
    // cubic bezier (x0,y0) (mx,y0) (mx,y1) (x1,y1)
    const bx = Math.pow(1 - u, 3) * x0 + 3 * Math.pow(1 - u, 2) * u * mx + 3 * (1 - u) * u * u * mx + u * u * u * x1;
    const by = Math.pow(1 - u, 3) * y0 + 3 * Math.pow(1 - u, 2) * u * y0 + 3 * (1 - u) * u * u * y1 + u * u * u * y1;
    if (i === 0) ctx.moveTo(bx, by); else ctx.lineTo(bx, by);
  }
  ctx.stroke(); ctx.restore();
  if (pe >= 0.999) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x1, y1, 4.5, 0, Math.PI * 2); ctx.fill(); }
}

/** Section header inside a card: icon + title. */
export function cardHeader(x, y, title, icon, color = '#111827', iconColor = '#4C6FFF', size = 24) {
  if (icon) icon(x + 14, y, 26, iconColor);
  text(title, x + (icon ? 40 : 0), y + 1, { size, weight: 700, color });
}

/** Toggle switch. p = 0 (off) .. 1 (on). */
export function toggle(x, y, p, color = '#4C6FFF') {
  const w = 64, h = 36;
  ctx.fillStyle = p > 0 ? `rgba(17,24,39,${0.12 * (1 - p)})` : 'rgba(17,24,39,0.12)'; rrect(x, y - h / 2, w, h, h / 2); ctx.fill();
  if (p > 0) { ctx.fillStyle = hexA(color, p); rrect(x, y - h / 2, w, h, h / 2); ctx.fill(); }
  const kx = lerp(x + h / 2, x + w - h / 2, E.outExpo(clamp01(p)));
  ctx.save(); ctx.shadowColor = 'rgba(17,24,39,0.25)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(kx, y, h / 2 - 4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  return w;
}
/** Horizontal workflow stepper: smooth fill + tick at each step. marks: time each step becomes active. */
export const STEPS = ['Save', 'Extract', 'Validate', 'Write', 'Log'];
export function stepper(t, marks, a = 1, y = 140) {
  if (a <= 0) return;
  const size = 20, h = 42, pad = 18, gap = 56;
  let act = -1; marks.forEach((m, i) => { if (t >= m) act = i; });
  const ws = STEPS.map((l) => chipWidth(l, { size, h, pad, dot: true }));
  const total = ws.reduce((x, y2) => x + y2, 0) + gap * (STEPS.length - 1);
  let x = 960 - total / 2;
  withAlpha(a, () => {
    STEPS.forEach((l, i) => {
      const on = i === act, done = i < act;
      const bg = on ? hexA('#4C6FFF', 0.13) : done ? hexA('#19B89D', 0.13) : 'rgba(17,24,39,0.05)';
      const fg = on ? '#3148C7' : done ? '#0B7A67' : '#6B7280';
      const sc = on ? 1 + 0.04 * Math.sin(Math.PI * clamp01(prog(t, marks[i], 0.5))) : 1;
      withT(x + ws[i] / 2, y, sc, () => chip(l, 0, 0, { align: 'center', size, h, pad, bg, fg, dot: on ? '#4C6FFF' : done ? '#19B89D' : '#CBD5E1' }));
      if (i < STEPS.length - 1) {
        const lx = x + ws[i] + 8, lw = gap - 16;
        ctx.fillStyle = 'rgba(17,24,39,0.12)'; ctx.fillRect(lx, y - 1, lw, 2);
        if (i < act) { ctx.fillStyle = '#19B89D'; ctx.fillRect(lx, y - 1, lw * E.outCubic(prog(t, marks[i + 1], 0.4)), 2); }
      }
      x += ws[i] + gap;
    });
  });
}
/** Abstract PDF page: title bar + label/value rows. rows: [[label, value|null]] */
export function docPage(x, y, w, h, opt = {}) {
  const { title = null, badge = 'PDF', shadow = 1.1, fill = '#FFFFFF', label = 'doc page' } = opt;
  card(x, y, w, h, { r: 20, shadow, fill, label });
  ctx.fillStyle = hexA('#EF5B5B', 0.12); rrect(x + 24, y + 24, 52, 30, 8); ctx.fill();
  text(badge, x + 50, y + 40, { size: 15, weight: 700, color: '#B42323', align: 'center', qa: false });
  if (title) text(title, x + 92, y + 40, { size: 19, weight: 700, color: '#111827', maxW: w - 116 });
}
/** Chat / email bubble. */
export function bubble(x, y, label, opt = {}) {
  const { side = 'left', color = '#FFFFFF', fg = '#111827', size = 22, h = 56, icon = null, iconColor = null, stroke = 'rgba(17,24,39,0.07)', shadow = 0.8 } = opt;
  const w = chipWidth(label, { size, h, pad: 22, icon });
  const x0 = side === 'left' ? x : x - w;
  card(x0, y - h / 2, w, h, { r: 18, fill: color, shadow, stroke, label });
  let cx = x0 + 22;
  if (icon) { icon(cx + h * 0.25, y, h * 0.5, iconColor || fg); cx += h * 0.5 + 10; }
  text(label, cx, y + 1, { size, weight: 600, color: fg, qa: false });
  return { x: x0, w };
}
/** Label/value rows of the intake form. hl[i] = highlight time per row (or null). Address is unreadable when smudge=true. */
export function docFields(x, y, w, t, opt = {}) {
  const { hl = null, hlColor = hexA('#FF8A3D', 0.22), pitch = 56, labelW = 200, valueSize = 19, smudge = true, rows = FIELDS } = opt;
  rows.forEach(([lab, val], i) => {
    const ry = y + i * pitch;
    text(lab, x, ry + 1, { size: 17, weight: 500, color: '#6B7280', maxW: labelW - 16 });
    const vx = x + labelW;
    if (lab === 'Address' && smudge) { smudgeLine(vx + 4, ry, 210); return; }
    const vw = measure(val, valueSize, 600);
    if (hl && hl[i] != null) { const p = E.outExpo(prog(t, hl[i], 0.35)); if (p > 0) { ctx.fillStyle = hlColor; rrect(vx - 6, ry - 17, (vw + 12) * p, 34, 7); ctx.fill(); } }
    text(val, vx, ry + 1, { size: valueSize, weight: 600, color: '#111827', maxW: w - labelW });
  });
}
/** Hard-to-read (smudged) handwriting stroke. */
export function smudgeLine(x, y, w) {
  ctx.save(); ctx.filter = 'blur(2.4px)'; ctx.strokeStyle = 'rgba(17,24,39,0.34)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath();
  for (let k = 0; k <= 28; k++) { const px = x + (w * k) / 28, py = y + Math.sin(k * 1.9) * 4 + Math.sin(k * 0.7) * 2; if (k) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
  ctx.stroke(); ctx.restore();
}
/** PDF file tile (badge + name, optional sub line). */
export function fileTile(x, y, w, h, opt = {}) {
  const { name = FILE, sub = null, border = null, shadow = 0.6, size = 19, fill = '#FFFFFF' } = opt;
  card(x, y, w, h, { r: 14, shadow, fill, stroke: border || 'rgba(17,24,39,0.08)', lw: border ? 2 : 1, label: 'file:' + name });
  const bh = Math.min(30, h - 20);
  ctx.fillStyle = hexA('#EF5B5B', 0.12); rrect(x + 14, y + h / 2 - bh / 2, 48, bh, 8); ctx.fill();
  text('PDF', x + 38, y + h / 2 + 1, { size: 14, weight: 700, color: '#B42323', align: 'center', qa: false });
  if (sub) { text(name, x + 76, y + h / 2 - 12, { size, weight: 600, color: '#111827', maxW: w - 92 }); text(sub, x + 76, y + h / 2 + 15, { size: 16, weight: 500, color: '#6B7280', maxW: w - 92 }); }
  else text(name, x + 76, y + h / 2 + 1, { size, weight: 600, color: '#111827', maxW: w - 92 });
}
