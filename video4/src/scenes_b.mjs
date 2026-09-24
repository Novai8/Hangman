// Sections B/C/D — brief generation, contents + flags, batching, safety + controls, audit log, safe failure, outcome, close.
import {
  ctx, PAL, E, clamp01, lerp, prog, vis, popScale, hexA, mixHex, text, measure, card, chip, chipWidth, ICON, avatar, skel,
  withAlpha, withT, rrect, sweep, checkBadge, cursor, ripple, cursorAt, pressAt, hoverAt, pressScale, wordsLine, rollNumber,
} from './lib.mjs';
import {
  BIZ, OWNER, SRC, SOURCES, INBOX_ITEMS, CAL_ITEMS, TASK_ITEMS, FLAGS, BRIEF, BRIEF_TIME, TAG, FLAG_STYLE, tag, tagWidth,
  headline, eyebrow, rollText, typed, caretOn, cardHeader, stepper, toggle, connector, itemRow, srcBadge, srcIcon,
} from './components.mjs';
import { itemChip, itemChipW } from './scenes_a.mjs';

const B = PAL.B, C = PAL.C, D = PAL.D;
const INK = '#111827', MUTED = '#6B7280', AMBER_INK = '#C27C00';
const circle = (x, y, r, fill) => { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };
const slideX = (v, d = 60) => (1 - v.e) * d;
const srcOf = (label) => (INBOX_ITEMS.includes(label) ? 'Inbox' : CAL_ITEMS.includes(label) ? 'Calendar' : 'Tasks');
const popTag = (label, x, y, style, p, o = {}) => { if (p > 0) withAlpha(E.outExpo(p), () => withT(x, y, popScale(p), () => tag(label, 0, 0, style, { align: 'center', ...o }))); };
const rightTag = (label, x, y, style, p, o = {}) => popTag(label, x - tagWidth(label, style, o) / 2, y, style, p, o);

// Pull sources → Summarize → Group → Flag → Deliver
export const STEP_T = [52.86, 58.41, 59.73, 60.48, 61.38];
export function sStepperLayer(t) { stepper(t, STEP_T, vis(t, 48.9, 1e9).a); }

// ======================================================================= 8 workflow pulls from the sources you choose
const SRC_CARD = { x: 200, w: 480, h: 124, ys: [300, 450, 600] };
const CHOOSE_T = [55.14, 56.01, 56.97];
const COUNT_LABEL = { Inbox: `${INBOX_ITEMS.length} items`, Calendar: `${CAL_ITEMS.length} events`, Tasks: `${TASK_ITEMS.length} tasks` };
const BRIEF_CARD = { x: 1040, y: 300, w: 680, h: 460 };
export function sGenerate(t) {
  headline([['Daily', 49.77], ['operations', 50.16], ['brief', 50.85, B.primary]], t);
  const { x, w, h, ys } = SRC_CARD;
  // sources (left)
  SOURCES.forEach((s, i) => {
    const v = vis(t, 48.9 + i * 0.12, 1e9, 0.5); if (v.a <= 0) return;
    const y = ys[i], cy = y + h / 2;
    const on = E.outExpo(prog(t, CHOOSE_T[i], 0.35));
    withAlpha(v.a, () => {
      ctx.save(); ctx.translate(-slideX(v), 0);
      withT(x + w / 2, cy, pressScale(t, CHOOSE_T[i]), () => {
        ctx.translate(-(x + w / 2), -cy);
        card(x, y, w, h, { r: 22, shadow: 1 + 0.4 * on, stroke: on > 0 ? hexA(SRC[s].color, 0.2 + 0.5 * on) : 'rgba(17,24,39,0.06)', lw: on > 0 ? 2 : 1, label: 'src ' + s });
        srcBadge(x + 58, cy, 28, s);
        text(SRC[s].label, x + 102, cy - 14, { size: 24, weight: 700, color: INK });
        text(COUNT_LABEL[s], x + 102, cy + 17, { size: 18, weight: 500, color: MUTED });
        toggle(x + w - 96, cy, on, SRC[s].color);
      });
      ctx.restore();
    });
  });
  // brief card (right)
  const bc = BRIEF_CARD;
  const bv = vis(t, 49.4, 1e9, 0.5);
  const lines = [];
  SOURCES.forEach((s, k) => { const n = { Inbox: INBOX_ITEMS, Calendar: CAL_ITEMS, Tasks: TASK_ITEMS }[s].length; for (let j = 0; j < n; j++) lines.push({ s, k, j, t0: CHOOSE_T[k] + 0.1 + j * 0.14 }); });
  withAlpha(bv.a, () => {
    ctx.save(); ctx.translate(slideX(bv), 0);
    card(bc.x, bc.y, bc.w, bc.h, { r: 26, shadow: 1.3, label: 'brief card' });
    cardHeader(bc.x + 36, bc.y + 54, 'Daily brief', ICON.doc, INK, B.primary);
    rightTag('Automatically', bc.x + bc.w - 36, bc.y + 54, TAG.blue, prog(t, 51.57, 0.45), { icon: ICON.bolt, dot: false });
    ctx.fillStyle = 'rgba(17,24,39,0.07)'; ctx.fillRect(bc.x + 36, bc.y + 96, bc.w - 72, 1);
    lines.forEach((ln, i) => {
      const ly = bc.y + 140 + i * 44;
      const p = E.outExpo(prog(t, ln.t0 + 0.7, 0.4));
      skel(bc.x + 40, ly, bc.w - 80, 12, 'rgba(17,24,39,0.04)');
      if (p > 0) { circle(bc.x + 46, ly, 6 * p, SRC[ln.s].color); skel(bc.x + 64, ly, (160 + ((i * 53) % 220)) * p, 12, hexA(SRC[ln.s].color, 0.25)); }
    });
    ctx.restore();
  });
  // connectors + travelling data tokens
  SOURCES.forEach((s, i) => {
    const y0 = ys[i] + h / 2;
    connector(x + w + 12, y0, bc.x - 12, bc.y + 180 + i * 120, prog(t, 52.86 + i * 0.15, 0.7), hexA(SRC[s].color, 0.55));
  });
  lines.forEach((ln, i) => {
    const p = prog(t, ln.t0, 0.7); if (p <= 0 || p >= 1) return;
    const e = E.inOutCubic(p);
    const x0 = x + w + 12, y0 = ys[ln.k] + h / 2, x1 = bc.x + 46, y1 = bc.y + 140 + i * 44;
    const px = lerp(x0, x1, e), py = lerp(y0, y1, e) - Math.sin(Math.PI * e) * 40;
    ctx.save(); ctx.shadowColor = hexA(SRC[ln.s].color, 0.5); ctx.shadowBlur = 14;
    circle(px, py, 9, SRC[ln.s].color); ctx.restore();
    circle(px, py, 4, '#FFFFFF');
  });
  // cursor chooses each source
  const k = cursorAt(t, [{ t: 54.2, x: 760, y: 840 }, ...CHOOSE_T.flatMap((tm, i) => [{ t: tm - 0.02, x: x + w - 64, y: ys[i] + h / 2 + 4 }, { t: tm + 0.3, x: x + w - 64, y: ys[i] + h / 2 + 4 }]), { t: 57.9, x: 900, y: 760 }]);
  cursor(k.x, k.y, pressAt(t, CHOOSE_T), vis(t, 54.3, 57.8, 0.3, 0.3).a);
  CHOOSE_T.forEach((tm, i) => ripple(x + w - 64, ys[i] + h / 2 + 4, t, tm, SRC[SOURCES[i]].color));
}

// ======================================================================= 9 summarize → group → flag → deliver (one readable brief)
const SUM = { x: 460, y: 290, w: 1000, h: 560 };
const ALL_ITEMS = BRIEF.flatMap(([sec, items], r) => items.map(([l, s, f], j) => ({ l, s, f, r, j })));
function briefHeader(x, y, w, t, delivered) {
  cardHeader(x + 36, y + 54, 'Daily brief', ICON.doc, INK, B.primary);
  const tw = measure('Daily brief', 24, 700);
  text(`For ${OWNER.name}`, x + 36 + 40 + tw + 16, y + 55, { size: 19, weight: 500, color: MUTED });
  const dl = `Delivered ${BRIEF_TIME}`;
  if (delivered <= 0) tag('Summarizing', x + w - 36, y + 54, TAG.blue, { align: 'right' });
  else rightTag(dl, x + w - 36, y + 54, TAG.green, delivered, { icon: ICON.check, dot: false });
  ctx.fillStyle = 'rgba(17,24,39,0.07)'; ctx.fillRect(x + 36, y + 96, w - 72, 1);
}
export function sSummarize(t) {
  headline([['Summarizes', 58.41], ['the', 59.13], ['day', 59.22, B.primary]], t, { tout: 59.95 });
  headline([['Simple,', 60.06], ['readable', 60.48], ['brief', 61.38, B.primary]], t);
  const { x, y, w, h } = SUM;
  const v = vis(t, 58.25, 1e9, 0.45);
  const g = E.inOutCubic(prog(t, STEP_T[2], 0.6));
  const fl = prog(t, STEP_T[3], 0.45);
  withAlpha(v.a, () => withT(x + w / 2, y + h / 2, lerp(0.96, 1, v.e), () => {
    ctx.translate(-(x + w / 2), -(y + h / 2));
    card(x, y, w, h, { r: 28, shadow: 1.4, label: 'daily brief' });
    briefHeader(x, y, w, t, prog(t, STEP_T[4], 0.45));
    BRIEF.forEach(([sec], r) => {
      const ry = y + 150 + r * 84;
      withAlpha(g, () => text(sec, x + 40, ry + 1, { size: 21, weight: 700, color: INK }));
      if (r < BRIEF.length - 1) withAlpha(g, () => { ctx.fillStyle = 'rgba(17,24,39,0.05)'; ctx.fillRect(x + 36, ry + 42, w - 72, 1); });
    });
    // items: jumbled after "summarizes", snap into sections on "Group", tint on "Flag"
    const rowX = {};
    ALL_ITEMS.forEach((it, i) => {
      const p = prog(t, STEP_T[1] + i * 0.07, 0.45); if (p <= 0) return;
      const cw = itemChipW(it.l, 16, 36);
      const key = it.r; rowX[key] = rowX[key] ?? x + 300;
      const tx = rowX[key], ty = y + 150 + it.r * 84; rowX[key] += cw + 12;
      const jx = x + 90 + (i % 2) * 460 + ((i * 53) % 90), jy = y + 170 + Math.floor(i / 2) * 84 + ((i * 29) % 30);
      const cx = lerp(jx, tx, g), cy = lerp(jy, ty, g) + Math.sin(Math.PI * g) * -18;
      withAlpha(E.outExpo(p), () => withT(cx + cw / 2, cy, popScale(p) * (1 + 0.04 * Math.sin(Math.PI * clamp01(prog(t, STEP_T[2] + 0.45, 0.3)))), () => {
        const fs = it.f ? FLAG_STYLE[it.f] : null;
        itemChip(it.l, it.s, 0, 0, { size: 16, h: 36, shadow: 0.45 });
        if (fs && fl > 0) { ctx.save(); ctx.globalAlpha *= E.outExpo(fl); ctx.strokeStyle = fs.dot || fs.fg; ctx.lineWidth = 2.5; rrect(-cw / 2, -18, cw, 36, 12); ctx.stroke(); ctx.restore(); }
      }));
      if (it.f && fl > 0) {
        const fs = FLAG_STYLE[it.f];
        withAlpha(E.outExpo(fl), () => withT(cx + cw - 2, cy - 18, popScale(fl), () => { circle(0, 0, 11, fs.dot || fs.fg); ICON.flag(1, 0, 13, '#FFFFFF'); }));
      }
    });
  }));
}

// ======================================================================= 10 brief contents + priority flags
const BR = { x: 200, y: 290, w: 1520, h: 440 };
const SEC_T = { 'Top priorities': 63.30, 'Today\u2019s schedule': 64.71, 'Next actions': 65.85, 'Waiting on': 71.31, 'Overdue': 69.78 };
const FLAG_T = { 'Due today': 67.23, 'Urgent': 68.52, 'Overdue': 70.05, 'Waiting on reply': 71.79 };
function briefLayout() {
  const { x, y, w } = BR, inner = w - 64;
  const w3 = (inner - 64) / 3, w2 = (inner - 32) / 2;
  return BRIEF.map(([sec, items], i) => i < 3
    ? { sec, items, x: x + 32 + i * (w3 + 32), y: y + 124, w: w3 }
    : { sec, items, x: x + 32 + (i - 3) * (w2 + 32), y: y + 318, w: w2 });
}
export function sBrief(t) {
  headline([['Priorities,', 63.63], ['schedule,', 64.71], ['next', 65.85], ['actions', 66.15, B.primary]], t, { tout: 66.95 });
  headline([['Highlights', 67.23], ['anything', 68.01], ['urgent', 68.52, B.primary]], t);
  const { x, y, w, h } = BR;
  const v = vis(t, 62.3, 1e9, 0.45);
  withAlpha(v.a, () => {
    card(x, y, w, h, { r: 28, shadow: 1.4, label: 'brief detail' });
    briefHeader(x, y, w, t, 1);
    ctx.fillStyle = 'rgba(17,24,39,0.06)'; ctx.fillRect(x + 36, y + 286, w - 72, 1);
    briefLayout().forEach((c) => {
      const sv = vis(t, SEC_T[c.sec], 1e9, 0.45);
      if (sv.a <= 0) { skel(c.x + 4, c.y, 150, 12, 'rgba(17,24,39,0.05)'); return; }
      withAlpha(sv.a, () => {
        ctx.save(); ctx.translate(0, sv.dy * 0.5);
        const nw = text(c.sec, c.x + 4, c.y + 1, { size: 21, weight: 700, color: INK });
        tag(String(c.items.length), c.x + 4 + nw + 12, c.y, TAG.neutral, { size: 15, h: 26, pad: 9, dot: false });
        c.items.forEach(([l, s, f], j) => {
          const ip = prog(t, SEC_T[c.sec] + 0.12 + j * 0.12, 0.45);
          const fp = f ? prog(t, FLAG_T[f], 0.45) : 0;
          withAlpha(E.outExpo(ip), () => itemRow(c.x, c.y + 56 + j * 60, c.w, l, s, { h: 48, size: 18, flag: f, flagA: E.outExpo(fp), flagS: popScale(fp), hl: fp > 0 && fp < 1 ? 1 - fp : 0, hlColor: f ? (FLAG_STYLE[f].dot || FLAG_STYLE[f].fg) : B.primary }));
        });
        ctx.restore();
      });
    });
  });
  // flag key row: each flag appears as it is spoken
  const o = { size: 18, h: 38, pad: 14 };
  const ws = FLAGS.map((f) => tagWidth(f, FLAG_STYLE[f], o));
  let fx = 960 - (ws.reduce((a, b) => a + b, 0) + 16 * (FLAGS.length - 1)) / 2;
  const kv = vis(t, 67.1, 1e9, 0.4);
  withAlpha(kv.a, () => { ICON.flag(fx - 30, 800, 22, MUTED); });
  FLAGS.forEach((f, i) => { popTag(f, fx + ws[i] / 2, 800, FLAG_STYLE[f], prog(t, FLAG_T[f], 0.45), o); fx += ws[i] + 16; });
}
export function camBrief(t) { const p = E.inOutCubic(prog(t, 67.1, 0.9)) * (1 - E.inOutCubic(prog(t, 72.2, 0.9))); return { s: 1 + 0.035 * p, fx: 700, fy: 520 }; }

// ======================================================================= 11 groups similar items → batches
const POOL = ['Invoice question', 'Send quote', 'Client follow-up: proposal', 'Appointment request', 'Confirm schedule', 'Review invoice'];
const GROUPS = [
  { name: 'Customer requests', icon: ICON.user, t: 76.29, items: [['Appointment request', 76.5], ['Invoice question', 76.74]] },
  { name: 'Approvals', icon: ICON.check, t: 78.36, items: [['Review invoice', 78.5], ['Send quote', 78.7]] },
  { name: 'Follow-ups', icon: ICON.mail, t: 79.17, items: [['Client follow-up: proposal', 79.3], ['Confirm schedule', 79.5]] },
];
const GX = [200, 716, 1232], GY = 480, GW = 488, GH = 330;
export function sGroups(t) {
  headline([['Groups', 73.83], ['similar', 74.40, B.primary], ['items', 74.94]], t);
  const poolPos = (i) => ({ x: [560, 960, 1360][i % 3], y: i < 3 ? 330 : 400 });
  const flight = {}; GROUPS.forEach((g, gi) => g.items.forEach(([l, tm], j) => { flight[l] = { gi, j, tm }; }));
  // group cards
  GROUPS.forEach((g, gi) => {
    const p = prog(t, g.t - 0.15, 0.5); if (p <= 0) return;
    const x = GX[gi], y = GY;
    const bp = prog(t, 81.03 + gi * 0.12, 0.45);
    withAlpha(E.outExpo(p), () => withT(x + GW / 2, y + GH / 2 + (1 - E.outExpo(p)) * 24, popScale(p), () => {
      ctx.translate(-(x + GW / 2), -(y + GH / 2));
      card(x, y, GW, GH, { r: 24, shadow: 1.2, stroke: bp > 0 ? hexA(B.success, 0.5 * E.outExpo(bp)) : 'rgba(17,24,39,0.06)', lw: bp > 0 ? 2 : 1, label: g.name });
      cardHeader(x + 32, y + 50, g.name, g.icon, INK, B.primary);
      let n = 0; g.items.forEach(([, tm]) => { if (t >= tm + 0.5) n++; });
      rollText([{ t: g.t, s: '0' }, ...g.items.map(([, tm], j) => ({ t: tm + 0.5, s: String(j + 1) }))], t, x + GW - 40, y + 51, { size: 26, weight: 700, color: B.primary, align: 'right', d: 0.3 });
      ctx.fillStyle = 'rgba(17,24,39,0.07)'; ctx.fillRect(x + 24, y + 92, GW - 48, 1);
      g.items.forEach(([l, tm], j) => {
        const ry = y + 140 + j * 64;
        if (t >= tm + 0.5) itemRow(x + 24, ry, GW - 48, l, srcOf(l), { h: 50, size: 19 });
        else { ctx.save(); ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(17,24,39,0.15)'; ctx.lineWidth = 1.5; rrect(x + 24, ry - 25, GW - 48, 50, 12); ctx.stroke(); ctx.restore(); }
      });
      if (bp > 0) withAlpha(E.outExpo(bp), () => withT(x + 24 + tagWidth('Batch ready', TAG.green, { icon: ICON.check, dot: false }) / 2, y + 282, popScale(bp), () => tag('Batch ready', 0, 0, TAG.green, { align: 'center', icon: ICON.check, dot: false })));
    }));
  });
  // loose items → magnetic snap into their group
  POOL.forEach((l, i) => {
    const ap = prog(t, 73.5 + i * 0.09, 0.45); if (ap <= 0) return;
    const f = flight[l], pp = poolPos(i);
    const fp = prog(t, f.tm, 0.5);
    if (fp >= 1) return;
    const e = E.inOutCubic(fp);
    const tx = GX[f.gi] + 24 + itemChipW(l, 19, 50) / 2, ty = GY + 140 + f.j * 64;
    const cx = lerp(pp.x, tx, e), cy = lerp(pp.y, ty, e) - Math.sin(Math.PI * e) * 30;
    withAlpha(E.outExpo(ap), () => withT(cx, cy + (1 - E.outExpo(ap)) * 12, popScale(ap) * (1 + 0.04 * Math.sin(Math.PI * e)), () => itemChip(l, srcOf(l), 0, 0, { size: 18, h: 42 })));
  });
}

// ======================================================================= 12 designed to be safe
export function sSafe(t) {
  headline([['Designed', 82.17], ['to', 82.65], ['be', 82.71], ['safe', 82.83, AMBER_INK]], t);
  const x = 560, y = 310, w = 800, h = 440;
  const v = vis(t, 81.95, 1e9, 0.5);
  withAlpha(v.a, () => withT(960, y + h / 2, lerp(0.96, 1, v.e), () => {
    ctx.translate(-960, -(y + h / 2));
    card(x, y, w, h, { r: 28, shadow: 1.3, label: 'safety card' });
    const sp = prog(t, 82.83, 0.6);
    circle(960, y + 150, 86, hexA(C.accent, 0.10 + 0.06 * E.outExpo(sp)));
    withT(960, y + 150, 1 + 0.06 * Math.sin(Math.PI * sp), () => ICON.shield(0, 0, 96, AMBER_INK));
    checkBadge(1016, y + 206, 18, prog(t, 83.1, 0.6), B.success);
    const chips = [['Your sources only', ICON.link, 83.76], ['No invented information', ICON.x, 84.69]];
    const o = { size: 21, h: 46, pad: 18, dot: false };
    const ws = chips.map(([l, ic]) => tagWidth(l, TAG.amber, { ...o, icon: ic }));
    let cx = 960 - (ws[0] + ws[1] + 16) / 2;
    chips.forEach(([l, ic, tm], i) => { popTag(l, cx + ws[i] / 2, y + 330, TAG.amber, prog(t, tm, 0.45), { ...o, icon: ic }); cx += ws[i] + 16; });
  }));
}

// ======================================================================= 13 unclear → needs review + link to source
export function sReview(t) {
  headline([['If', 85.68], ['unclear,', 86.22], ['needs', 88.08], ['review', 88.44, AMBER_INK]], t);
  const x = 200, y = 300, w = 800, h = 380;
  const v = vis(t, 85.55, 1e9, 0.5);
  const clickT = 90.09;
  const r2y = y + 248;
  withAlpha(v.a, () => {
    ctx.save(); ctx.translate(-slideX(v), 0);
    card(x, y, w, h, { r: 26, shadow: 1.3, label: 'brief section' });
    briefHeader(x, y, w, t, 1);
    text('Next actions', x + 40, y + 132, { size: 21, weight: 700, color: INK });
    itemRow(x + 32, y + 184, w - 64, 'Confirm schedule', 'Tasks', { h: 50, size: 19 });
    const up = E.outExpo(prog(t, 86.22, 0.45));
    itemRow(x + 32, r2y, w - 64, 'Appointment request', 'Inbox', { h: 50, size: 19, hl: up, hlColor: C.accent, fill: up > 0 ? hexA(C.accent, 0.08 * up) : 'rgba(17,24,39,0.03)' });
    rightTag('Needs review', x + w - 44, r2y, TAG.amber, prog(t, 88.08, 0.45));
    const lp = prog(t, 89.37, 0.45);
    const hv = hoverAt(t, 89.75, 90.4);
    if (lp > 0) withAlpha(E.outExpo(lp), () => withT(x + 32 + tagWidth('Link to source', TAG.blue, { icon: ICON.link, dot: false }) / 2, y + 322, popScale(lp) * pressScale(t, clickT) * (1 + 0.03 * hv), () => {
      tag('Link to source', 0, 0, TAG.blue, { align: 'center', icon: ICON.link, dot: false });
    }));
    ctx.restore();
  });
  const lx = x + 32 + tagWidth('Link to source', TAG.blue, { icon: ICON.link, dot: false }) / 2;
  ripple(lx, y + 322, t, clickT, B.primary);
  const k = cursorAt(t, [{ t: 89.0, x: 900, y: 800 }, { t: 89.9, x: lx + 20, y: y + 330 }, { t: 90.5, x: lx + 20, y: y + 330 }, { t: 91.4, x: 1180, y: 760 }]);
  cursor(k.x, k.y, pressAt(t, [clickT]), vis(t, 89.05, 91.3, 0.3, 0.3).a);
  // original email preview
  const px = 1060, py = 300, pw = 660, ph = 380;
  const pv = vis(t, clickT + 0.08, 1e9, 0.45);
  withAlpha(pv.a, () => withT(px + pw / 2, py + ph / 2, lerp(0.95, 1, pv.e), () => {
    ctx.translate(-(px + pw / 2), -(py + ph / 2));
    card(px, py, pw, ph, { r: 26, shadow: 1.3, stroke: hexA(B.primary, 0.3), lw: 2, label: 'source email' });
    srcBadge(px + 58, py + 56, 24, 'Inbox');
    text('Appointment request', px + 96, py + 57, { size: 23, weight: 700, color: INK });
    rightTag('Original email', px + pw - 32, py + 57, TAG.blue, prog(t, 90.57, 0.45), { dot: false, icon: ICON.mail });
    ctx.fillStyle = 'rgba(17,24,39,0.07)'; ctx.fillRect(px + 32, py + 100, pw - 64, 1);
    text('Could we book a visit', px + 40, py + 160, { size: 24, weight: 500, color: '#374151' });
    const hp = E.outExpo(prog(t, 90.9, 0.45));
    const s2 = 'sometime next week?', w2 = measure(s2, 24, 500);
    if (hp > 0) { ctx.fillStyle = hexA(C.accent, 0.28); rrect(px + 34, py + 204 - 19, (w2 + 12) * hp, 38, 8); ctx.fill(); }
    text(s2, px + 40, py + 204, { size: 24, weight: 500, color: '#374151' });
    popTag('Time unclear', px + 40 + tagWidth('Time unclear', TAG.amber, { icon: ICON.question, dot: false }) / 2, py + 290, TAG.amber, prog(t, 91.26, 0.45), { icon: ICON.question, dot: false });
  }));
}

// ======================================================================= 14 control what it reads + exclusions
export function sControls(t) {
  headline([['You', 92.22], ['control', 92.76, AMBER_INK], ['what', 93.30], ['it', 93.45], ['reads', 94.23]], t);
  const x = 460, y = 290, w = 1000, h = 490;
  const v = vis(t, 92.05, 1e9, 0.5);
  const T1 = 97.08, T2 = 98.61;
  const rows = [['Allowed sources', ICON.shield, 460 + 0], ['Exclude sensitive', ICON.lock, 0], ['Exclude senders', ICON.user, 0]];
  withAlpha(v.a, () => {
    ctx.save(); ctx.translate(slideX(v), 0);
    card(x, y, w, h, { r: 28, shadow: 1.3, label: 'controls' });
    cardHeader(x + 36, y + 54, 'Brief settings', ICON.shield, INK, AMBER_INK);
    chip(OWNER.name, x + w - 36, y + 54, { align: 'right', size: 18, h: 36, pad: 14, bg: 'rgba(17,24,39,0.05)', fg: '#374151', icon: ICON.user });
    ctx.fillStyle = 'rgba(17,24,39,0.07)'; ctx.fillRect(x + 36, y + 96, w - 72, 1);
    rows.forEach(([l, ic], i) => {
      const ry = y + 180 + i * 120;
      const rv = vis(t, 92.4 + i * 0.12, 1e9, 0.45);
      withAlpha(rv.a, () => {
        const hl = i === 0 ? hoverAt(t, 93.5, 95.2) : i === 1 ? E.outExpo(prog(t, T1, 0.4)) * 0.6 : E.outExpo(prog(t, T2, 0.4)) * 0.6;
        ctx.fillStyle = hl > 0 ? hexA(C.accent, 0.08 * hl) : 'rgba(17,24,39,0.025)'; rrect(x + 32, ry - 46, w - 64, 92, 18); ctx.fill();
        circle(x + 84, ry, 26, hexA(C.accent, 0.14)); ic(x + 84, ry, 26, AMBER_INK);
        text(l, x + 128, ry + 1, { size: 24, weight: 700, color: INK });
        if (i === 0) {
          let cx = x + w - 60;
          [...SOURCES].reverse().forEach((s, k) => {
            const o = { icon: ICON.check, dot: false };
            const cw = tagWidth(s, TAG.green, o);
            const p = prog(t, 93.8 + (2 - k) * 0.25, 0.45);
            if (p > 0) withAlpha(E.outExpo(p), () => withT(cx - cw / 2 + (1 - E.outExpo(p)) * 20, ry, popScale(p), () => tag(s, 0, 0, TAG.green, { align: 'center', ...o })));
            cx -= cw + 12;
          });
        } else {
          const tt = i === 1 ? T1 : T2;
          toggle(x + w - 124, ry, prog(t, tt, 0.35), AMBER_INK);
          ripple(x + w - 76, ry, t, tt, C.accent);
        }
      });
    });
    ctx.restore();
  });
  const tx = x + w - 76;
  const k = cursorAt(t, [{ t: 96.1, x: 1300, y: 860 }, { t: T1 - 0.05, x: tx, y: y + 306 }, { t: T1 + 0.4, x: tx, y: y + 306 }, { t: T2 - 0.05, x: tx, y: y + 426 }, { t: T2 + 0.4, x: tx, y: y + 426 }, { t: 99.6, x: 1560, y: 800 }]);
  cursor(k.x, k.y, pressAt(t, [T1, T2]), vis(t, 96.2, 99.5, 0.3, 0.3).a);
}

// ======================================================================= 15 everything is logged
const LOG = [['07:30:02', 'Sources checked', 103.62], ['07:30:09', 'Brief generated', 105.06], ['07:30:10', 'Delivered', 105.75], ['07:30:10', 'Errors: none', 106.9]];
export function sLogged(t) {
  headline([['Everything', 100.14], ['is', 100.56], ['logged', 100.80, AMBER_INK]], t);
  const x = 460, y = 290, w = 1000, h = 440;
  const v = vis(t, 100.05, 1e9, 0.5);
  withAlpha(v.a, () => {
    ctx.save(); ctx.translate(slideX(v), 0);
    card(x, y, w, h, { r: 26, shadow: 1.3, label: 'audit log' });
    cardHeader(x + 36, y + 54, 'Audit log', ICON.list, INK, AMBER_INK);
    rightTag('Daily brief', x + w - 36, y + 54, TAG.neutral, 1, { dot: false, icon: ICON.doc });
    const rp = prog(t, 102.21, 0.45);
    if (rp > 0) { const pulse = 0.5 + 0.5 * Math.sin(t * 5); circle(x + w - 36 - tagWidth('Daily brief', TAG.neutral, { dot: false, icon: ICON.doc }) - 22, y + 54, 6, hexA(C.accent, E.outExpo(rp) * (0.5 + 0.5 * pulse))); }
    ctx.fillStyle = 'rgba(17,24,39,0.07)'; ctx.fillRect(x + 36, y + 96, w - 72, 1);
    LOG.forEach(([tm, ev, t0], i) => {
      const ry = y + 150 + i * 80;
      if (t < t0 - 0.3) { skel(x + 52, ry, 110, 12, 'rgba(17,24,39,0.05)'); skel(x + 230, ry, 240, 12, 'rgba(17,24,39,0.05)'); return; }
      const a = E.outExpo(prog(t, t0 - 0.3, 0.3));
      withAlpha(a, () => {
        text(tm, x + 52, ry + 1, { size: 20, weight: 600, color: '#4B5563' });
        const s = typed(ev, t, t0 - 0.15, t0 + 0.2);
        const tw = text(s, x + 230, ry + 1, { size: 23, weight: 700, color: INK });
        if (t < t0 + 0.25 && caretOn(t * 3)) { ctx.fillStyle = AMBER_INK; ctx.fillRect(x + 232 + tw, ry - 12, 2, 24); }
        if (i === 0) SOURCES.forEach((sname, k2) => srcBadge(x + 230 + measure(ev, 23, 700) + 40 + k2 * 48, ry, 18, sname, E.outExpo(prog(t, 102.97 + k2 * 0.12, 0.4))));
        checkBadge(x + w - 64, ry, 15, prog(t, t0 + 0.2, 0.55), B.success);
        if (i < LOG.length - 1) { ctx.fillStyle = 'rgba(17,24,39,0.05)'; ctx.fillRect(x + 36, ry + 40, w - 72, 1); }
      });
    });
    ctx.restore();
  });
}

// ======================================================================= 16 safe failure: calendar unavailable
export function sFailure(t) {
  headline([['If', 108.06], ['something', 108.21], ['fails', 108.57, AMBER_INK]], t, { tout: 111.7 });
  headline([['Stops', 111.93], ['safely,', 112.31, AMBER_INK], ['alerts', 113.31], ['the', 113.64], ['owner', 113.79]], t);
  const x = 360, y = 290, w = 1200, h = 540;
  const v = vis(t, 108.05, 1e9, 0.5);
  const failT = 110.76;
  withAlpha(v.a, () => {
    ctx.save(); ctx.translate(slideX(v), 0);
    card(x, y, w, h, { r: 28, shadow: 1.3, label: 'workflow status' });
    cardHeader(x + 36, y + 56, 'Daily brief', ICON.refresh, INK, AMBER_INK);
    const pp = prog(t, failT, 0.5);
    if (pp <= 0) tag('Running', x + w - 36, y + 56, TAG.green, { align: 'right' });
    else rightTag('Paused', x + w - 36, y + 56, TAG.amber, pp);
    ctx.fillStyle = 'rgba(17,24,39,0.07)'; ctx.fillRect(x + 36, y + 98, w - 72, 1);
    let sx = x + 36;
    SOURCES.forEach((s, i) => {
      const cp = prog(t, 109.4 + i * 0.2, 0.45);
      const bad = s === 'Calendar';
      const style = bad ? (pp > 0 ? TAG.amber : TAG.blue) : TAG.green;
      const o = { size: 19, h: 40, pad: 16, dot: bad ? true : false, icon: bad ? null : ICON.check };
      const cw = tagWidth(s, style, o);
      popTag(s, sx + cw / 2, y + 150, style, cp, o);
      sx += cw + 14;
    });
    if (pp > 0) withAlpha(E.outExpo(pp), () => {
      const yy = y + 240 + (1 - E.outExpo(pp)) * -14;
      ctx.fillStyle = hexA(C.accent, 0.16); rrect(x + 36, yy - 36, w - 72, 72, 18); ctx.fill();
      ICON.alert(x + 76, yy, 30, AMBER_INK);
      text('Calendar unavailable', x + 112, yy + 1, { size: 25, weight: 700, color: '#8A5300' });
      const np = prog(t, 115.14, 0.45);
      if (np > 0) withAlpha(E.outExpo(np), () => text('No misleading summary', x + w - 64, yy + 1, { size: 20, weight: 600, color: '#8A5300', align: 'right' }));
    });
    const rows = [['Stopped safely', ICON.shield, 112.31], ['Owner alerted', ICON.bell, 113.31], ['Retry scheduled', ICON.clock, 114.57]];
    rows.forEach(([l, icon, tm], i) => {
      const p = prog(t, tm, 0.5); if (p <= 0) return;
      const ry = y + 338 + i * 76;
      withAlpha(E.outExpo(p), () => {
        ctx.save(); ctx.translate((1 - E.outExpo(p)) * 30, 0);
        ctx.fillStyle = 'rgba(17,24,39,0.03)'; rrect(x + 36, ry - 32, w - 72, 64, 16); ctx.fill();
        circle(x + 76, ry, 21, hexA(C.accent, 0.14)); icon(x + 76, ry, 23, AMBER_INK);
        text(l, x + 112, ry + 1, { size: 23, weight: 700, color: INK });
        if (i === 1) { avatar(x + w - 250, ry, 18, OWNER.ini, OWNER.color); text(OWNER.name, x + w - 222, ry + 1, { size: 19, weight: 600, color: '#374151' }); }
        checkBadge(x + w - 70, ry, 16, prog(t, tm + 0.1, 0.6), B.success);
        ctx.restore();
      });
    });
    ctx.restore();
  });
}

// ======================================================================= 17 outcome math (dark)
function darkCard(x, y, w, h, label) { card(x, y, w, h, { r: 24, fill: D.card, shadow: 1.4, shadowColor: 'rgba(0,0,0,0.35)', stroke: 'rgba(255,255,255,0.08)', label }); }
export function sOutcome(t) {
  headline([['Illustrative', 117.24, D.accent], ['estimate', 117.84]], t, { color: D.text });
  const lv = vis(t, 116.7, 1e9, 0.5);
  withAlpha(lv.a, () => {
    ctx.save(); ctx.translate(-slideX(lv), 0);
    const x = 200, y = 290, w = 700, h = 520;
    darkCard(x, y, w, h, 'assumptions card');
    text('Assumptions', x + 40, y + 56, { size: 26, weight: 700, color: D.text });
    chip('Illustrative assumptions', x + w - 36, y + 56, { align: 'right', size: 17, h: 36, pad: 14, bg: hexA(D.accent, 0.14), fg: D.accent });
    const rows = [['Manual check:', '15 min/day', 119.31, y + 146], ['Brief review:', '5 min/day', 126.51, y + 330], ['Schedule:', '20 workdays/month', 131.67, y + 430]];
    rows.forEach(([k, val, tm, ry]) => {
      const v = vis(t, tm, 1e9, 0.45); if (v.a <= 0) return;
      withAlpha(v.a, () => {
        ctx.save(); ctx.translate(slideX(v, 30), 0);
        ctx.fillStyle = 'rgba(255,255,255,0.04)'; rrect(x + 36, ry - 36, w - 72, 72, 16); ctx.fill();
        const kw = text(k, x + 64, ry + 1, { size: 22, weight: 500, color: D.muted });
        text(val, x + 64 + kw + 12, ry + 1, { size: 28, weight: 700, color: D.text, maxW: w - 150 - kw });
        ctx.restore();
      });
    });
    // what the manual check covers: inbox, calendar, tasks + mental plan
    const my = y + 226;
    [121.23, 121.95, 122.85].forEach((tm, i) => {
      const p = prog(t, tm, 0.45); if (p <= 0) return;
      const s = SOURCES[i];
      withAlpha(E.outExpo(p), () => withT(x + 84 + i * 56, my, popScale(p), () => { ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill(); srcIcon(s)(0, 0, 22, mixHex(SRC[s].color, '#FFFFFF', 0.35)); }));
    });
    const mp = prog(t, 124.44, 0.45);
    if (mp > 0) withAlpha(E.outExpo(mp), () => withT(x + 84 + 3 * 56 - 22 + chipWidth('Mental plan', { size: 17, h: 36, pad: 14, icon: ICON.pencil }) / 2, my, popScale(mp), () => chip('Mental plan', 0, 0, { align: 'center', size: 17, h: 36, pad: 14, bg: 'rgba(255,255,255,0.08)', fg: D.text, icon: ICON.pencil })));
    ctx.restore();
  });
  const rv = vis(t, 116.9, 1e9, 0.5);
  withAlpha(rv.a, () => {
    ctx.save(); ctx.translate(slideX(rv), 0);
    const x = 980, y = 290, w = 740, h = 520;
    darkCard(x, y, w, h, 'estimate card');
    text('Estimate', x + 40, y + 56, { size: 26, weight: 700, color: D.text });
    [[130.11, 128, 360, 18], [130.45, 176, 220, 10], [133.5, 250, 340, 12], [135.42, 292, 300, 12]].forEach(([tm, yy, ww, hh]) => { if (t < tm) skel(x + 40, y + yy, ww, hh, 'rgba(255,255,255,0.06)'); });
    if (t < 136.3) { ctx.fillStyle = 'rgba(255,255,255,0.03)'; rrect(x + 32, y + 336, w - 64, 128, 20); ctx.fill(); }
    const s1 = vis(t, 130.11, 1e9, 0.45);
    withAlpha(s1.a, () => withT(x + 40, y + 128 + s1.dy * 0.5, popScale(prog(t, 130.11, 0.5)), () => text('Savings: 10 min/day', 0, 0, { size: 40, weight: 800, color: D.success })));
    withAlpha(vis(t, 130.45, 1e9).a, () => text('15 min − 5 min = 10 min', x + 40, y + 176, { size: 19, weight: 500, color: D.muted }));
    withAlpha(vis(t, 131.43, 1e9).a, () => { ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x + 40, y + 208, w - 80, 1); });
    withAlpha(vis(t, 133.50, 1e9).a, () => text('10 min × 20 workdays = 200 min', x + 40, y + 250, { size: 23, weight: 600, color: D.text }));
    withAlpha(vis(t, 135.42, 1e9).a, () => text('200 min ÷ 60 ≈ 3.3 hours', x + 40, y + 292, { size: 23, weight: 600, color: D.text }));
    const bp = vis(t, 136.3, 1e9, 0.5);
    withAlpha(bp.a, () => {
      const bx = x + 32, by = y + 336, bw = w - 64, bh = 128;
      ctx.fillStyle = hexA(D.accent, 0.1); rrect(bx, by, bw, bh, 20); ctx.fill();
      const val = 3.3 * E.outCubic(prog(t, 136.4, 0.8));
      const nw = text(`≈${val.toFixed(1)}`, bx + 32, by + 58, { size: 56, weight: 800, color: D.accent });
      text(' hours/month', bx + 32 + measure('≈3.3', 56, 800), by + 58, { size: 40, weight: 800, color: D.accent });
      withAlpha(vis(t, 137.4, 1e9).a, () => text('(estimate)', bx + 36, by + 104, { size: 20, weight: 600, color: D.muted }));
    });
    ctx.restore();
  });
  const fv = vis(t, 138.96, 1e9, 0.45);
  withAlpha(fv.a, () => text('Based on assumptions · Not a guaranteed result', 960, 848, { size: 21, weight: 600, color: D.muted, align: 'center' }));
}

// ======================================================================= 18 trust stack
const TRUST = [['Independent portfolio prototype', 141.66], ['Fictional data', 144.09], ['Results vary', 145.26]];
export function sTrust(t) {
  TRUST.forEach(([l, tin], i) => {
    const p = prog(t, tin, 0.5); if (p <= 0) return;
    const size = 28, h = 64, pad = 26;
    withAlpha(E.outExpo(p), () => withT(960, 400 + i * 104 + (1 - E.outExpo(p)) * 24, popScale(p), () => {
      const w = chipWidth(l, { size, h, pad, icon: ICON.check });
      card(-w / 2, -h / 2, w, h, { r: h / 2, fill: 'rgba(255,255,255,0.06)', shadow: 0, stroke: 'rgba(255,255,255,0.16)', label: l });
      const s = h * 0.5; const cx = -w / 2 + pad;
      checkBadge(cx + s / 2, 0, s * 0.55, prog(t, tin + 0.1, 0.6), D.success, true);
      text(l, cx + s + 10, 1, { size, weight: 600, color: D.text });
    }));
  });
}

// ======================================================================= 19 final headline + disclaimers
const DISCLAIMERS = ['Independent portfolio prototype', 'Fictional data', 'Illustrative assumptions', 'Results vary'];
export function sFinal(t) {
  const ep = prog(t, 147.03, 0.5);
  if (ep > 0) withAlpha(E.outExpo(ep), () => withT(960, 290, popScale(ep), () => chip('Fewer missed actions', 0, 0, { align: 'center', size: 22, h: 44, pad: 18, bg: 'rgba(255,255,255,0.06)', fg: D.text, icon: ICON.check })));
  wordsLine([['Clearer', 148.62], ['priorities.', 148.98, D.accent]], 960, 400, { size: 76, weight: 800, color: D.text });
  wordsLine([['Calmer', 151.23], ['mornings.', 151.58, D.accent]], 960, 500, { size: 76, weight: 800, color: D.text });
  const br = prog(t, 150.0, 0.6);
  withAlpha(E.outExpo(br) * 0.9, () => text(`${BIZ} · Daily operations brief`, 960, 620, { size: 22, weight: 600, color: D.muted, align: 'center' }));
  const o = { size: 18, h: 40, pad: 16, icon: ICON.check };
  const ws = DISCLAIMERS.map((l) => chipWidth(l, o));
  let x = 960 - (ws.reduce((a, b) => a + b, 0) + 16 * (DISCLAIMERS.length - 1)) / 2;
  DISCLAIMERS.forEach((l, i) => {
    const p = prog(t, 146.5 + i * 0.1, 0.5);
    const cx = x + ws[i] / 2; x += ws[i] + 16;
    if (p <= 0) return;
    withAlpha(E.outExpo(p), () => withT(cx, 812 + (1 - E.outExpo(p)) * 12, 1, () => {
      card(-ws[i] / 2, -20, ws[i], 40, { r: 20, fill: 'rgba(255,255,255,0.06)', shadow: 0, stroke: 'rgba(255,255,255,0.14)', label: l });
      ICON.check(-ws[i] / 2 + 16 + 10, 0, 20, D.success);
      text(l, -ws[i] / 2 + 16 + 30, 1, { size: 18, weight: 600, color: D.text });
    }));
  });
}
export function camFinal(t) { return { s: 1 + 0.03 * E.inOutCubic(prog(t, 146.5, 8)), fx: 960, fy: 540 }; }
