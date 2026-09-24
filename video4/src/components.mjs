// Reusable UI components (inbox rows, windows, headlines, tags, buttons).
import {
  ctx, PAL, E, QA, clamp01, lerp, prog, vis, popScale, hexA, text, measure, card, chip, chipWidth, ICON, avatar, skel,
  withAlpha, withT, wordsLine, rrect, sweep, checkBadge, font,
} from './lib.mjs';

export const HEAD_Y = 205, EYEBROW_Y = 140;

// ---------------------------------------------------------------- locked fictional data
export const BIZ = 'Northwind Services';
export const OWNER = { name: 'Alex Rivera', ini: 'AR', role: 'Ops lead', color: '#7C5CFC' };
// Sources (generic labels) with a fixed colour identity across the whole video
export const SRC = {
  Inbox: { label: 'Inbox', color: '#4C6FFF' },
  Calendar: { label: 'Calendar', color: '#7C5CFC' },
  Tasks: { label: 'Tasks', color: '#19B89D' },
};
export const SOURCES = ['Inbox', 'Calendar', 'Tasks'];
export const INBOX_ITEMS = ['Client follow-up: proposal', 'Invoice question', 'Appointment request'];
export const CAL_ITEMS = ['10:00 Client call', '14:30 Team check-in'];
export const TASK_ITEMS = ['Send quote', 'Review invoice', 'Confirm schedule'];
export const FLAGS = ['Urgent', 'Due today', 'Overdue', 'Waiting on reply'];
export const SECTIONS_BRIEF = ['Top priorities', 'Today’s schedule', 'Next actions', 'Waiting on', 'Overdue'];
// Brief content: [section, [[item, source, flag|null]]] (each of the 8 items appears exactly once)
export const BRIEF = [
  ['Top priorities', [['Client follow-up: proposal', 'Inbox', 'Due today'], ['Invoice question', 'Inbox', 'Urgent']]],
  ['Today’s schedule', [['10:00 Client call', 'Calendar', null], ['14:30 Team check-in', 'Calendar', null]]],
  ['Next actions', [['Confirm schedule', 'Tasks', null], ['Appointment request', 'Inbox', null]]],
  ['Waiting on', [['Send quote', 'Tasks', 'Waiting on reply']]],
  ['Overdue', [['Review invoice', 'Tasks', 'Overdue']]],
];
export const BRIEF_TIME = '07:30';
// ---------------------------------------------------------------- tag styles
export const TAG = {
  neutral: { bg: 'rgba(17,24,39,0.06)', fg: '#374151' },
  amber: { bg: hexA('#F5A524', 0.18), fg: '#8A5300', dot: '#F5A524' },
  amberOutline: { bg: 'rgba(255,255,255,0.0)', fg: '#8A5300', stroke: hexA('#F5A524', 0.7) },
  blue: { bg: hexA('#4C6FFF', 0.1), fg: '#3148C7' },
  green: { bg: hexA('#19B89D', 0.14), fg: '#0B7A67', dot: '#19B89D' },
  warm: { bg: hexA('#FF8A3D', 0.14), fg: '#A34A0E', dot: '#FF8A3D' },
  warn: { bg: hexA('#EF5B5B', 0.12), fg: '#B42323', dot: '#EF5B5B' },
  purple: { bg: hexA('#7C5CFC', 0.12), fg: '#5B3FD6', dot: '#7C5CFC' },
};
// Priority flag chips (soft colours, never harsh red)
export const FLAG_STYLE = { 'Urgent': TAG.warm, 'Due today': { ...TAG.blue, dot: '#4C6FFF' }, 'Overdue': TAG.amber, 'Waiting on reply': TAG.purple };
export function srcIcon(name) { return name === 'Inbox' ? ICON.inbox : name === 'Calendar' ? ICON.calendar : ICON.list; }
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
export const STEPS = ['Pull sources', 'Summarize', 'Group', 'Flag', 'Deliver'];
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
/** Item row: source icon + label (+ optional flag chip on the right). */
export function itemRow(x, y, w, label, src, opt = {}) {
  const { h = 52, flag = null, flagA = 1, flagS = 1, size = 19, fill = 'rgba(17,24,39,0.03)', hl = 0, hlColor = '#4C6FFF', iconA = 1 } = opt;
  ctx.fillStyle = fill; rrect(x, y - h / 2, w, h, 12); ctx.fill();
  if (hl > 0) { ctx.save(); ctx.strokeStyle = hexA(hlColor, 0.75 * hl); ctx.lineWidth = 2; rrect(x, y - h / 2, w, h, 12); ctx.stroke(); ctx.restore(); }
  const col = SRC[src].color;
  withAlpha(iconA, () => srcIcon(src)(x + 26, y, 20, col));
  let maxW = w - 64;
  if (flag) maxW -= tagWidth(flag, FLAG_STYLE[flag], { size: 15, h: 28, pad: 10 }) + 12;
  text(label, x + 48, y + 1, { size, weight: 600, color: '#111827', maxW });
  if (flag && flagA > 0) withAlpha(flagA, () => withT(x + w - 12 - tagWidth(flag, FLAG_STYLE[flag], { size: 15, h: 28, pad: 10 }) / 2, y, flagS, () => tag(flag, 0, 0, FLAG_STYLE[flag], { align: 'center', size: 15, h: 28, pad: 10 })));
}
/** Round source badge (icon in a tinted circle). */
export function srcBadge(cx, cy, r, src, a = 1) {
  withAlpha(a, () => { ctx.fillStyle = hexA(SRC[src].color, 0.13); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); srcIcon(src)(cx, cy, r * 1.05, SRC[src].color); });
}
