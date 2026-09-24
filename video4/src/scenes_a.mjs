// Section A (scattered morning) + pivot. Times are seconds in the voiceover (data/captions.json).
import {
  ctx, PAL, E, clamp01, lerp, prog, vis, popScale, hexA, mixHex, text, measure, card, chip, chipWidth, ICON, skel, avatar,
  withAlpha, withT, rrect, sweep, checkBadge, cursor, ripple, cursorAt, pressAt, pressScale, hoverAt, wordsLine,
} from './lib.mjs';
import {
  BIZ, OWNER, SRC, SOURCES, INBOX_ITEMS, CAL_ITEMS, TASK_ITEMS, TAG, FLAG_STYLE, tag, tagWidth, headline, eyebrow, rollText,
  cardHeader, itemRow, srcBadge, srcIcon,
} from './components.mjs';

const A = PAL.A, B = PAL.B;
const INK = '#111827', MUTED = '#6B7280';
const circle = (x, y, r, fill) => { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };
const slideX = (v, d = 60) => (1 - v.e) * d;
const dashedCircle = (x, y, r, col) => { ctx.save(); ctx.setLineDash([8, 10]); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); };
const ITEMS = { Inbox: INBOX_ITEMS, Calendar: CAL_ITEMS, Tasks: TASK_ITEMS };
/** Item chip with its source icon (used for loose "sticky note" items). */
export function itemChip(label, src, x, y, opt = {}) {
  const { size = 18, h = 42, fill = '#FFFFFF', align = 'center', shadow = 0.7 } = opt;
  const w = chipWidth(label, { size, h, pad: 16, icon: ICON.list });
  const x0 = align === 'center' ? x - w / 2 : x;
  card(x0, y - h / 2, w, h, { r: 12, fill, shadow, stroke: 'rgba(17,24,39,0.08)', label: 'item:' + label });
  srcIcon(src)(x0 + 16 + h * 0.25, y, h * 0.5, SRC[src].color);
  text(label, x0 + 16 + h * 0.5 + 10, y + 1, { size, weight: 600, color: INK, qa: false });
  return w;
}
export const itemChipW = (label, size = 18, h = 42) => chipWidth(label, { size, h, pad: 16, icon: ICON.list });

// ======================================================================= 1 hook: same start, every day
export function sHook(t) {
  headline([['Start', 1.98], ['the', 2.34], ['day', 2.43, A.accent]], t);
  const x = 460, y = 300, w = 1000, h = 470;
  const v = vis(t, 0.15, 1e9, 0.5);
  withAlpha(v.a, () => withT(960, y + h / 2, lerp(0.97, 1, v.e), () => {
    ctx.translate(-960, -(y + h / 2));
    card(x, y, w, h, { r: 28, shadow: 1.3, label: 'morning dashboard' });
    const op = prog(t, 0.42, 0.5);
    withAlpha(E.outExpo(op), () => withT(x + 76, y + 76, popScale(op), () => avatar(0, 0, 34, OWNER.ini, OWNER.color)));
    withAlpha(E.outExpo(op), () => {
      text(OWNER.name, x + 128, y + 62, { size: 26, weight: 700, color: INK });
      text(BIZ, x + 128, y + 94, { size: 19, weight: 500, color: MUTED });
    });
    const rp = prog(t, 0.99, 0.45);
    const nameW = measure(OWNER.name, 26, 700);
    withAlpha(E.outExpo(rp), () => withT(x + 128 + nameW + 16 + tagWidth(OWNER.role, TAG.warm) / 2, y + 62, popScale(rp), () => tag(OWNER.role, 0, 0, TAG.warm, { align: 'center' })));
    const mp = prog(t, 1.98, 0.45);
    withAlpha(E.outExpo(mp), () => withT(x + w - 40 - tagWidth('Morning', TAG.neutral, { icon: ICON.clock, dot: false }) / 2, y + 76, popScale(mp), () => tag('Morning', 0, 0, TAG.neutral, { align: 'center', icon: ICON.clock, dot: false })));
    ctx.fillStyle = 'rgba(17,24,39,0.07)'; ctx.fillRect(x + 40, y + 140, w - 80, 1);
    const tw = 280, th = 240, gap = 40, tx0 = x + (w - 3 * tw - 2 * gap) / 2, ty = y + 180;
    SOURCES.forEach((s, i) => {
      const p = prog(t, [2.43, 2.76, 3.06][i], 0.5); if (p <= 0) return;
      const cx = tx0 + i * (tw + gap) + tw / 2;
      withAlpha(E.outExpo(p), () => withT(cx, ty + th / 2 + (1 - E.outExpo(p)) * 20, popScale(p), () => {
        card(-tw / 2, -th / 2, tw, th, { r: 22, fill: '#FBFAF8', shadow: 0.5, label: 'source ' + s });
        srcBadge(0, -24, 50, s);
        text(SRC[s].label, 0, 70, { size: 24, weight: 700, color: INK, align: 'center' });
      }));
    });
  }));
}

// ======================================================================= source tiles (shared by scenes 2–3 → match cut)
const TX = [200, 716, 1232], TY = 300, TW = 488, TH = 330;
function sourceTile(i, t, opt = {}) {
  const { active = 0, dim = 0, spotRow = -1, spot = 0, dx = 0, badge = 0, sweepP = 0 } = opt;
  const s = SOURCES[i], x = TX[i] + dx, y = TY;
  const col = SRC[s].color;
  const sc = 1 + 0.025 * active;
  withAlpha(1 - 0.45 * dim, () => withT(x + TW / 2, y + TH / 2, sc, () => {
    ctx.translate(-(x + TW / 2), -(y + TH / 2));
    card(x, y, TW, TH, { r: 24, shadow: 1 + 0.8 * active, stroke: active > 0 ? hexA(col, 0.25 + 0.55 * active) : 'rgba(17,24,39,0.06)', lw: active > 0 ? 2.5 : 1, label: 'tile ' + s });
    srcBadge(x + 56, y + 50, 26, s);
    text(SRC[s].label, x + 96, y + 51, { size: 26, weight: 700, color: INK });
    if (badge > 0) withAlpha(E.outExpo(badge), () => withT(x + TW - 28 - tagWidth('New message', TAG.blue) / 2, y + 50, popScale(badge), () => tag('New message', 0, 0, TAG.blue, { align: 'center' })));
    ctx.fillStyle = 'rgba(17,24,39,0.07)'; ctx.fillRect(x + 28, y + 96, TW - 56, 1);
    ITEMS[s].forEach((label, r) => {
      const ry = y + 142 + r * 64;
      const isSpot = r === spotRow;
      withAlpha(spotRow >= 0 && !isSpot ? 1 - 0.55 * spot : 1, () => itemRow(x + 24, ry, TW - 48, label, s, { h: 50, size: 19, hl: isSpot ? spot : 0, hlColor: col, fill: isSpot && spot > 0 ? hexA(col, 0.07 * spot) : 'rgba(17,24,39,0.03)' }));
    });
    if (sweepP > 0 && sweepP < 1) sweep(x, y, TW, TH, 24, sweepP);
  }));
}
const tileCenter = (i) => ({ x: TX[i] + TW / 2, y: TY + 50 });

// ======================================================================= 2 check email → calendar → tasks → back (context switches)
const CLICKS = [[4.20, 0], [5.34, 1], [6.39, 2], [7.47, 0], [8.40, 1], [9.18, 0], [9.95, 1], [10.55, 2], [11.15, 0], [11.75, 1]];
export function sSwitching(t) {
  headline([['Check', 3.90], ['email,', 4.20], ['calendar,', 5.34], ['tasks', 6.39, A.accent]], t, { tout: 11.85 });
  headline([['Scattered', 12.06, A.accent], ['work', 12.60]], t);
  let cur = -1, ct = -1; CLICKS.forEach(([tm, i]) => { if (t >= tm) { cur = i; ct = tm; } });
  const v = vis(t, 3.7, 1e9, 0.5);
  withAlpha(v.a, () => {
    SOURCES.forEach((s, i) => sourceTile(i, t, { active: i === cur ? E.outExpo(prog(t, ct, 0.35)) : 0, sweepP: i === cur ? prog(t, ct, 0.5) : 0, badge: i === 0 ? prog(t, 7.47, 0.45) : 0 }));
  });
  CLICKS.forEach(([tm, i]) => { const c = tileCenter(i); ripple(c.x + 150, c.y + 2, t, tm, SRC[SOURCES[i]].color); });
  // cursor: hops between tiles, clicking each header
  const keys = [{ t: 3.8, x: 700, y: 820 }];
  CLICKS.forEach(([tm, i]) => { const c = tileCenter(i); keys.push({ t: tm - 0.02, x: c.x + 150, y: c.y + 2 }); keys.push({ t: tm + 0.25, x: c.x + 150, y: c.y + 2 }); });
  keys.push({ t: 12.4, x: 1200, y: 640 });
  const k = cursorAt(t, keys);
  cursor(k.x, k.y, pressAt(t, CLICKS.map((c) => c[0])), vis(t, 3.85, 12.6, 0.3, 0.3).a);
  // context-switch counter (flip): 1 → 9 → 17
  const x = 560, y = 680, w = 800, h = 136;
  const cv = vis(t, 4.0, 1e9, 0.5);
  withAlpha(cv.a, () => {
    ctx.save(); ctx.translate(0, (1 - cv.e) * 24);
    card(x, y, w, h, { r: 24, shadow: 1.1, label: 'switch counter' });
    ICON.refresh(x + 60, y + h / 2, 34, A.accent);
    text('Context switches', x + 100, y + h / 2 + 1, { size: 26, weight: 700, color: INK });
    rollText([{ t: 4.20, s: '1' }, { t: 9.18, s: '9' }, { t: 12.06, s: '17' }], t, x + 420, y + h / 2 + 2, { size: 64, weight: 800, color: mixHex(INK, A.accent, E.outExpo(prog(t, 12.06, 0.6))) });
    const lp = prog(t, 13.89, 0.45);
    if (lp > 0) withAlpha(E.outExpo(lp), () => withT(x + w - 36 - tagWidth('Takes longer', TAG.warm, { icon: ICON.clock, dot: false }) / 2, y + h / 2, popScale(lp), () => tag('Takes longer', 0, 0, TAG.warm, { align: 'center', icon: ICON.clock, dot: false, size: 20, h: 40 })));
    ctx.restore();
  });
}

// ======================================================================= 3 important items spread across tools
const SPOT = [
  { i: 0, row: 0, t: 19.38, chips: [['Due today', 21.23, 'flag']] },
  { i: 1, row: 0, t: 22.20, chips: [['Prep notes', 23.07, ICON.doc], ['Another thread', 24.09, ICON.link]] },
  { i: 2, row: 0, t: 25.08, chips: [['Waiting on reply', 25.77, 'flag']] },
];
export function sSpread(t) {
  eyebrow('The problem', t, 15.39, 1e9, { dot: A.accent });
  headline([['Spread', 17.55, A.accent], ['across', 18.00], ['tools', 18.45]], t);
  const sp = E.inOutCubic(prog(t, 17.55, 0.7));
  SOURCES.forEach((s, i) => {
    const sd = SPOT.find((q) => q.i === i);
    const spot = sd ? E.outExpo(prog(t, sd.t, 0.45)) : 0;
    sourceTile(i, t, { dx: (i - 1) * 24 * sp, spotRow: sd ? sd.row : -1, spot, active: 0.35 * spot });
  });
  // callouts: one item from each source pops below its tile
  SPOT.forEach((sd) => {
    const p = prog(t, sd.t, 0.5); if (p <= 0) return;
    const s = SOURCES[sd.i], x = TX[sd.i] + (sd.i - 1) * 24 * sp, y = 670, w = TW, h = 128;
    const label = ITEMS[s][sd.row];
    withAlpha(E.outExpo(p), () => withT(x + w / 2, y + h / 2 + (1 - E.outExpo(p)) * 24, popScale(p), () => {
      ctx.translate(-(x + w / 2), -(y + h / 2));
      card(x, y, w, h, { r: 20, shadow: 1.1, label: 'callout ' + label });
      srcIcon(s)(x + 40, y + 40, 24, SRC[s].color);
      text(label, x + 66, y + 41, { size: 22, weight: 700, color: INK, maxW: w - 90 });
      let cx = x + 28;
      sd.chips.forEach(([l, tm, ic]) => {
        const cp = prog(t, tm, 0.45);
        const style = ic === 'flag' ? FLAG_STYLE[l] : TAG.neutral;
        const o = ic === 'flag' ? {} : { icon: ic, dot: false };
        const cw = tagWidth(l, style, o);
        if (cp > 0) withAlpha(E.outExpo(cp), () => withT(cx + cw / 2 + (1 - E.outExpo(cp)) * 14, y + 90, popScale(cp), () => tag(l, 0, 0, style, { align: 'center', ...o })));
        cx += cw + 12;
      });
    }));
  });
}

// ======================================================================= 4 reconstructing what matters (mental list)
const NOTES = [ // [label, source, dx, dy, tin]
  ['Client follow-up: proposal', 'Inbox', 0, -165, 28.05],
  ['10:00 Client call', 'Calendar', -150, -90, 28.35],
  ['Send quote', 'Tasks', 150, -90, 28.62],
  ['Invoice question', 'Inbox', -150, -15, 28.96],
  ['Review invoice', 'Tasks', 150, -15, 29.25],
  ['14:30 Team check-in', 'Calendar', -150, 60, 29.58],
  ['Confirm schedule', 'Tasks', 150, 60, 29.9],
  ['Appointment request', 'Inbox', 0, 135, 30.25],
];
export const NOTE_CX = 960, NOTE_CY = 590;
export function sReconstruct(t) {
  headline([['Reconstructing', 29.58, A.accent], ['what', 30.69], ['matters', 30.96]], t);
  const cv = vis(t, 27.8, 1e9, 0.5);
  withAlpha(cv.a, () => {
    circle(NOTE_CX, NOTE_CY, 262, hexA(A.accent, 0.05));
    dashedCircle(NOTE_CX, NOTE_CY, 262, hexA(A.accent, 0.45));
    const w = tagWidth('Mental list', TAG.warm, { icon: ICON.pencil, dot: false });
    ctx.fillStyle = A.bg; rrect(NOTE_CX - w / 2 - 8, NOTE_CY - 262 - 20, w + 16, 40, 20); ctx.fill();
    tag('Mental list', NOTE_CX, NOTE_CY - 262, TAG.warm, { align: 'center', icon: ICON.pencil, dot: false });
  });
  NOTES.forEach(([l, s, dx, dy, tin], i) => {
    const p = prog(t, tin, 0.6); if (p <= 0) return;
    const e = E.outExpo(p);
    const ang = (i / NOTES.length) * Math.PI * 2 + 0.6;
    const fx = NOTE_CX + Math.cos(ang) * 700, fy = NOTE_CY + Math.sin(ang) * 420;
    const wob = Math.sin(t * 1.6 + i * 1.3);
    const x = lerp(fx, NOTE_CX + dx, e) + wob * 2.5, y = lerp(fy, NOTE_CY + dy, e) + Math.cos(t * 1.3 + i) * 2;
    withAlpha(e, () => { ctx.save(); ctx.translate(x, y); ctx.rotate((i % 2 ? 1 : -1) * 0.035 + wob * 0.012); itemChip(l, s, 0, 0, { fill: '#FFFDF6' }); ctx.restore(); });
  });
  // morning passes while progress stalls
  const cards = [
    { x: 200, title: 'Morning', icon: ICON.clock, tin: 28.44, fill: [28.44, 3.3, 0.78], col: A.accent },
    { x: 1400, title: 'Progress', icon: ICON.chart, tin: 32.04, fill: [32.52, 1.2, 0.08], col: '#9CA3AF', chipT: 33.18 },
  ];
  cards.forEach((c) => {
    const v = vis(t, c.tin, 1e9, 0.5); if (v.a <= 0) return;
    const y = 490, w = 320, h = 200;
    withAlpha(v.a, () => {
      ctx.save(); ctx.translate(c.x < 960 ? -slideX(v, 30) : slideX(v, 30), 0);
      card(c.x, y, w, h, { r: 22, shadow: 1, label: c.title });
      c.icon(c.x + 48, y + 50, 26, c.col === '#9CA3AF' ? MUTED : c.col);
      text(c.title, c.x + 76, y + 51, { size: 23, weight: 700, color: INK });
      ctx.fillStyle = 'rgba(17,24,39,0.07)'; rrect(c.x + 32, y + 104, w - 64, 14, 7); ctx.fill();
      const f = c.fill[2] * E.inOutCubic(prog(t, c.fill[0], c.fill[1]));
      if (f > 0) { ctx.fillStyle = c.col; rrect(c.x + 32, y + 104, Math.max(14, (w - 64) * f), 14, 7); ctx.fill(); }
      if (c.chipT) {
        const cp = prog(t, c.chipT, 0.45);
        if (cp > 0) withAlpha(E.outExpo(cp), () => withT(c.x + 32 + tagWidth('Stalled', TAG.warm) / 2, y + 156, popScale(cp), () => tag('Stalled', 0, 0, TAG.warm, { align: 'center' })));
      } else {
        const cp = prog(t, 30.96, 0.45);
        if (cp > 0) withAlpha(E.outExpo(cp), () => withT(c.x + 32 + tagWidth('Spent sorting', TAG.neutral) / 2, y + 156, popScale(cp), () => tag('Spent sorting', 0, 0, TAG.neutral, { align: 'center' })));
      }
      ctx.restore();
    });
  });
}

// ======================================================================= 5 that is where things slip
const SLIPS = [
  { title: 'Missed follow-ups', icon: ICON.mail, tin: 36.45, item: ['Client follow-up: proposal', 'Inbox', 36.9] },
  { title: 'Surprise deadlines', icon: ICON.clock, tin: 37.80, item: ['Review invoice', 'Tasks', 38.4] },
  { title: 'Extra mental load', icon: ICON.layers, tin: 39.72, item: ['Context switches: 17', null, 40.53] },
];
export function sSlip(t) {
  headline([['Where', 34.20], ['things', 34.38], ['slip', 34.74, A.accent]], t);
  // an item slips out of the mental list
  const fp = prog(t, 34.74, 1.0);
  if (fp > 0 && fp < 1) {
    const e = E.inCubic(fp);
    withAlpha(1 - E.inCubic(clamp01((fp - 0.35) / 0.65)), () => { ctx.save(); ctx.translate(960, 470 + e * 200); ctx.rotate(e * 0.22); itemChip('Client follow-up: proposal', 'Inbox', 0, 0, { fill: '#FFFDF6' }); ctx.restore(); });
  }
  const xs = [200, 716, 1232], w = 488, y = 340, h = 320;
  SLIPS.forEach((it, i) => {
    const p = prog(t, it.tin, 0.5); if (p <= 0) return;
    const x = xs[i];
    withAlpha(E.outExpo(p), () => withT(x + w / 2, y + h / 2 + (1 - E.outExpo(p)) * 24, popScale(p), () => {
      ctx.translate(-(x + w / 2), -(y + h / 2));
      card(x, y, w, h, { r: 24, shadow: 1.2, label: it.title });
      circle(x + 72, y + 80, 36, hexA(A.accent, 0.13)); it.icon(x + 72, y + 80, 32, '#C2560F');
      text(it.title, x + 40, y + 170, { size: 30, weight: 700, color: INK, maxW: w - 80 });
      const [l, s, tm] = it.item;
      const cp = prog(t, tm, 0.45);
      if (cp > 0) withAlpha(E.outExpo(cp), () => withT(x + 40, y + 256, popScale(cp), () => {
        if (s) itemChip(l, s, 0, 0, { align: 'left', shadow: 0.4, fill: '#FBFAF8' });
        else tag(l, 0, 0, TAG.warm, { icon: ICON.refresh, dot: false, size: 18, h: 42, pad: 16 });
      }));
    }));
  });
}

// ======================================================================= 6 even when organized, checking is repetitive (calm)
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
export function sRepetitive(t) {
  const ev = vis(t, 42.51, 1e9);
  withAlpha(ev.a, () => withT(960, 140 + ev.dy * 0.6, popScale(prog(t, 42.51, 0.5)), () => tag('Even when organized', 0, 0, TAG.green, { align: 'center', size: 22, h: 44, pad: 18, icon: ICON.check, dot: false })));
  headline([['Checking', 44.16], ['everything', 44.64], ['is', 45.39], ['repetitive', 45.57, A.accent]], t);
  const x = 360, y = 320, w = 1200, h = 420;
  const v = vis(t, 41.8, 1e9, 0.55);
  withAlpha(v.a, () => {
    ctx.save(); ctx.translate(slideX(v, 40), 0);
    card(x, y, w, h, { r: 26, shadow: 1.2, label: 'week card' });
    const cw = (w - 80) / 5;
    DAYS.forEach((d, i) => {
      const cx = x + 40 + cw * i + cw / 2;
      const d0 = 42.2 + i * 0.72;
      const on = t >= d0;
      text(d, cx, y + 64, { size: 24, weight: 700, color: on ? INK : '#9CA3AF', align: 'center' });
      if (i < 4) { ctx.fillStyle = 'rgba(17,24,39,0.06)'; ctx.fillRect(x + 40 + cw * (i + 1), y + 40, 1, h - 80); }
      SOURCES.forEach((s, k) => {
        const by = y + 150 + k * 88;
        srcBadge(cx - 18, by, 28, s, on ? 1 : 0.35);
        checkBadge(cx + 38, by, 13, prog(t, d0 + k * 0.14, 0.5), B.success);
      });
    });
    ctx.restore();
  });
  const rp = prog(t, 45.57, 0.5);
  if (rp > 0) withAlpha(E.outExpo(rp), () => withT(960, 792, popScale(rp), () => tag('Every morning', 0, 0, TAG.warm, { align: 'center', icon: ICON.refresh, dot: false, size: 20, h: 40 })));
}

// ======================================================================= 7 pivot title card
export function sPivot(t) {
  const ep = prog(t, 47.13, 0.5);
  withAlpha(E.outExpo(ep), () => text('A cleaner approach', 960, 440 + (1 - E.outExpo(ep)) * 10, { size: 26, weight: 600, color: MUTED, align: 'center' }));
  const p = prog(t, 46.85, 0.6);
  const s = 'Daily operations brief';
  withAlpha(E.outExpo(p), () => {
    text(s, 960, 520 + (1 - E.outExpo(p)) * 16, { size: 64, weight: 700, color: INK, align: 'center' });
    const lw = measure(s, 64, 700);
    const lp = E.outExpo(prog(t, 47.3, 0.7));
    const g = ctx.createLinearGradient(960 - lw / 2, 0, 960 + lw / 2, 0); g.addColorStop(0, B.primary); g.addColorStop(1, B.secondary);
    ctx.fillStyle = g; rrect(960 - (lw / 2) * lp, 580, lw * lp, 6, 3); ctx.fill();
  });
}
