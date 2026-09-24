// Sections B/C/D — workflow, safety, outcome, close (scenes 10–20).
import {
  ctx, PAL, E, clamp01, lerp, prog, vis, popScale, hexA, mixHex, text, measure, card, chip, chipWidth, ICON, avatar,
  withAlpha, withT, rrect, sweep, checkBadge, cursor, ripple, cursorAt, pressAt, hoverAt, pressScale, wordsLine,
} from './lib.mjs';
import {
  BIZ, SAM, SERVICES, REQUEST, TZ, CAL, SLOTS, CHOSEN, DAYS, ROWS, TAG, tag, tagWidth, headline, eyebrow, button, rollText,
  typed, caretOn, cardHeader, toggle, stepper6,
} from './components.mjs';

const B = PAL.B, C = PAL.C, D = PAL.D;
const INK = '#111827', MUTED = '#6B7280';
const circle = (x, y, r, fill) => { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };
const slideX = (v, d = 60) => (1 - v.e) * d;
export const STEP_T = [71.73, 80.19, 82.29, 85.59, 90.78, 92.49];
const dashed = (x, y, w, h, r, col = 'rgba(17,24,39,0.22)') => { ctx.save(); ctx.setLineDash([6, 6]); ctx.strokeStyle = col; ctx.lineWidth = 1.5; rrect(x, y, w, h, r); ctx.stroke(); ctx.restore(); };

// ======================================================================= 10 extract details
export function sExtract(t) {
  stepper6(t, STEP_T, vis(t, 69.3, 1e9).a);
  headline([['Extract', 71.73], ['key', 72.39], ['details', 72.69, B.primary]], t);
  // --- request message card (left)
  const mx = 200, my = 300, mw = 700, mh = 330;
  const mv = vis(t, 69.3, 1e9, 0.5);
  const lineY = [my + 170, my + 216, my + 262];
  withAlpha(mv.a, () => {
    ctx.save(); ctx.translate(-slideX(mv), 0);
    card(mx, my, mw, mh, { r: 24, shadow: 1.2, label: 'request card' });
    avatar(mx + 56, my + 60, 26, SAM.ini, SAM.color);
    // name highlight
    const nw = measure(SAM.name, 22, 700);
    const nm = E.outExpo(prog(t, 74.43, 0.4));
    if (nm > 0) { ctx.fillStyle = hexA(B.primary, 0.16); rrect(mx + 96 - 4, my + 46 - 16, (nw + 8) * nm, 32, 6); ctx.fill(); }
    text(SAM.name, mx + 96, my + 47, { size: 22, weight: 700, color: INK });
    text(SAM.email, mx + 96, my + 77, { size: 18, weight: 500, color: MUTED });
    const nr = prog(t, 69.42, 0.5);
    withAlpha(E.outExpo(nr), () => withT(mx + mw - 32, my + 60, popScale(nr), () => tag('New request', 0, 0, TAG.blue, { align: 'right' })));
    ctx.fillStyle = 'rgba(17,24,39,0.07)'; ctx.fillRect(mx + 32, my + 116, mw - 64, 1);
    // phrase markers
    const marks = [
      [0, 'consultation', 75.03], [1, 'Next week', 76.02], [1, 'after 3pm', 76.60], [2, 'urgent', 78.95],
    ];
    marks.forEach(([li, ph, tm]) => {
      const line = REQUEST[li]; const k = line.indexOf(ph);
      const x0 = mx + 40 + measure(line.slice(0, k), 23, 500), w = measure(ph, 23, 500);
      const p = E.outExpo(prog(t, tm, 0.45));
      if (p > 0) { ctx.fillStyle = li === 2 ? hexA('#F5A524', 0.26) : hexA(B.primary, 0.16); rrect(x0 - 4, lineY[li] - 17, (w + 8) * p, 34, 6); ctx.fill(); }
    });
    REQUEST.forEach((l, i) => text(l, mx + 40, lineY[i], { size: 23, weight: 500, color: INK, maxW: mw - 80 }));
    ctx.restore();
  });
  // extracting progress
  const ev = vis(t, 71.73, 1e9, 0.5);
  withAlpha(ev.a, () => {
    const x = 200, y = 700, w = 700;
    const done = t >= 79.42;
    ICON.bolt(x + 14, y, 22, B.secondary);
    text(done ? 'Details extracted' : 'Extracting details', x + 38, y + 1, { size: 20, weight: 600, color: done ? '#0B7A67' : '#4B5563' });
    ctx.fillStyle = 'rgba(17,24,39,0.07)'; rrect(x, y + 34, w, 10, 5); ctx.fill();
    const f = E.inOutCubic(prog(t, 71.73, 7.69));
    const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, B.primary); g.addColorStop(1, B.secondary);
    ctx.fillStyle = g; rrect(x, y + 34, w * f, 10, 5); ctx.fill();
  });
  // --- structured request card (right)
  const sx = 980, sy = 290, sw = 740, sh = 560;
  const fields = [
    ['Name', SAM.name, 74.43, 'name'], ['Service', 'Consultation', 75.03, 'service'], ['Preferred time', 'Next week, after 3pm', 76.02, 'time'],
    ['Location', 'Not provided', 77.88, 'none'], ['Urgency', 'Urgent', 78.95, 'urgent'],
  ];
  const sv = vis(t, 70.6, 1e9, 0.5);
  const rowY = (i) => sy + 110 + i * 88;
  withAlpha(sv.a, () => {
    ctx.save(); ctx.translate(slideX(sv), 0);
    card(sx, sy, sw, sh, { r: 24, shadow: 1.2, label: 'structured card' });
    cardHeader(sx + 32, sy + 52, 'Structured request', ICON.list, INK, B.primary);
    const xp = prog(t, 79.42, 0.5);
    if (xp > 0) withAlpha(E.outExpo(xp), () => withT(sx + sw - 32, sy + 52, popScale(xp), () => tag('Extracted', 0, 0, TAG.green, { align: 'right' })));
    fields.forEach(([label, val, tm], i) => {
      const y = rowY(i);
      ctx.fillStyle = 'rgba(17,24,39,0.03)'; rrect(sx + 24, y, sw - 48, 72, 14); ctx.fill();
      text(label, sx + 48, y + 37, { size: 19, weight: 600, color: MUTED });
      const land = tm + 0.6;
      if (t < land) dashed(sx + 250, y + 16, 200, 40, 20);
    });
    ctx.restore();
  });
  // flying chips (drawn above both cards)
  fields.forEach(([label, val, tm, kind], i) => {
    const y = rowY(i) + 36;
    const style = kind === 'urgent' ? TAG.amber : kind === 'none' ? TAG.neutral : TAG.blue;
    const opt = { size: 20, h: 40, pad: 16, dot: kind === 'urgent' ? undefined : false };
    const w = tagWidth(val, style, opt);
    const tx = sx + 250 + w / 2, ty = y;
    let fx = tx, fy = ty;
    if (kind === 'name') { fx = mx + 96 + measure(SAM.name, 22, 700) / 2; fy = my + 47; }
    if (kind === 'service') { const l = REQUEST[0]; fx = mx + 40 + measure(l.slice(0, l.indexOf('consultation')), 23, 500) + measure('consultation', 23, 500) / 2; fy = lineY[0]; }
    if (kind === 'time') { fx = mx + 40 + measure('Next week works, pre', 23, 500); fy = lineY[1]; }
    if (kind === 'urgent') { fx = mx + 40 + measure('This is ', 23, 500) + measure('urgent', 23, 500) / 2; fy = lineY[2]; }
    const fd = kind === 'urgent' ? 0.38 : 0.5, f0 = kind === 'urgent' ? 0.05 : 0.12;
    const p = prog(t, tm + f0, fd);
    if (p <= 0) return;
    const e = E.inOutCubic(p);
    const x = kind === 'none' ? tx : lerp(fx, tx, e), yy = kind === 'none' ? ty : lerp(fy, ty, e) - Math.sin(Math.PI * e) * 50;
    const snap = popScale(prog(t, tm + f0 + fd - 0.05, 0.45));
    const s = p < 1 ? lerp(0.9, 1.04, e) : snap;
    withAlpha(kind === 'none' ? E.outExpo(p) : 1, () => withT(x, yy, s, () => {
      if (p < 1 && kind !== 'none') { ctx.save(); ctx.shadowColor = 'rgba(76,111,255,0.3)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6; ctx.fillStyle = '#FFFFFF'; rrect(-w / 2, -20, w, 40, 20); ctx.fill(); ctx.restore(); }
      tag(val, 0, 0, kind === 'none' || p >= 1 ? style : { bg: '#FFFFFF', fg: style.fg, dot: style.dot }, { ...opt, align: 'center' });
    }));
  });
}

// ======================================================================= 11 availability → options → confirm → event
const BUSY = { 0: [[0, 2], [2, 6], [6, 8]], 1: [[1, 3], [6, 8]], 2: [[0, 2], [5, 7]], 3: [[2, 5], [7, 8]], 4: [[0, 4], [4, 8]] };
const PICK = [[1, 4], [2, 3], [3, 6]]; // [day, row] for SLOTS
const FREE_AFTER3 = [[1, 3], [1, 5], [2, 2], [2, 4], [2, 7], [3, 5]];
const G = { x: 200, y: 290, w: 900, h: 560, gx0: 312, colW: 150, gy0: 420, rowH: 46 };
const cellC = (d, r) => [G.gx0 + G.colW * d + G.colW / 2, G.gy0 + G.rowH * r + G.rowH / 2];
export function teamCalendar(t, opt = {}) {
  const { scanT = 80.19, glowT = 81.18, checkedT = 81.9, pickA = 1 } = opt;
  const { x, y, w, h, gx0, colW, gy0, rowH } = G;
  card(x, y, w, h, { r: 24, shadow: 1.2, label: 'team calendar' });
  cardHeader(x + 32, y + 50, CAL.team, ICON.calendar, INK, B.primary);
  // header chips (right aligned): Local time, After 3pm
  const lt = chip(TZ, x + w - 32, y + 50, { align: 'right', size: 18, h: 36, pad: 14, bg: 'rgba(17,24,39,0.05)', fg: '#374151', icon: ICON.globe });
  const ap = E.outExpo(prog(t, opt.prefT ?? 80.0, 0.4));
  withAlpha(ap, () => chip('After 3pm', lt.x - 12, y + 50, { align: 'right', size: 18, h: 36, pad: 14, bg: hexA(B.primary, 0.1), fg: '#3148C7', dot: B.primary }));
  // days + rows
  text('pm', gx0 - 20, gy0 - 28, { size: 16, weight: 600, color: '#9CA3AF', align: 'right' });
  DAYS.forEach((d, i) => text(d, gx0 + colW * i + colW / 2, gy0 - 28, { size: 19, weight: 700, color: '#374151', align: 'center' }));
  ROWS.forEach((r, i) => {
    text(r, gx0 - 20, gy0 + rowH * i + rowH / 2 + 1, { size: 16, weight: 500, color: MUTED, align: 'right' });
    ctx.fillStyle = 'rgba(17,24,39,0.05)'; ctx.fillRect(gx0, gy0 + rowH * i, colW * 5, 1);
  });
  ctx.fillStyle = 'rgba(17,24,39,0.05)'; ctx.fillRect(gx0, gy0 + rowH * 8, colW * 5, 1);
  // before-3pm shade
  ctx.fillStyle = 'rgba(17,24,39,0.025)'; ctx.fillRect(gx0, gy0, colW * 5, rowH * 2);
  // busy blocks
  Object.entries(BUSY).forEach(([d, blocks]) => blocks.forEach(([r0, r1]) => {
    const bx = gx0 + colW * d + 6, by = gy0 + rowH * r0 + 4, bw = colW - 12, bh = rowH * (r1 - r0) - 8;
    ctx.fillStyle = 'rgba(17,24,39,0.07)'; rrect(bx, by, bw, bh, 10); ctx.fill();
    text('Busy', bx + 14, by + 19, { size: 15, weight: 600, color: '#9CA3AF', qa: false });
  }));
  // scan bar
  const sp = prog(t, scanT, 1.3);
  const sxp = gx0 + colW * 5 * E.inOutCubic(sp);
  if (sp > 0 && sp < 1) {
    const g = ctx.createLinearGradient(sxp - 80, 0, sxp, 0); g.addColorStop(0, hexA(B.primary, 0)); g.addColorStop(1, hexA(B.primary, 0.14));
    ctx.fillStyle = g; ctx.fillRect(sxp - 80, gy0, 80, rowH * 8);
    ctx.fillStyle = B.primary; rrect(sxp - 2, gy0 - 6, 4, rowH * 8 + 12, 2); ctx.fill();
  }
  // free cells glow as scanned
  FREE_AFTER3.forEach(([d, r]) => {
    const cx = gx0 + colW * d; if (sxp < cx + colW * 0.5 && sp < 1) return;
    const a = E.outExpo(prog(t, glowT + d * 0.05, 0.5)) * 0.8;
    withAlpha(a, () => { ctx.fillStyle = hexA(B.success, 0.1); rrect(cx + 6, gy0 + rowH * r + 4, colW - 12, rowH - 8, 10); ctx.fill(); });
  });
  PICK.forEach(([d, r], i) => {
    const cx = gx0 + colW * d; if (sxp < cx + colW * 0.5 && sp < 1) return;
    const a = E.outExpo(prog(t, glowT + d * 0.05, 0.5)) * pickA;
    const pulse = 0.5 + 0.5 * Math.sin(t * 3 + i);
    withAlpha(a, () => {
      ctx.fillStyle = hexA(B.success, 0.18 + 0.06 * pulse); rrect(cx + 6, gy0 + rowH * r + 4, colW - 12, rowH - 8, 10); ctx.fill();
      ctx.strokeStyle = hexA(B.success, 0.7); ctx.lineWidth = 2; rrect(cx + 7, gy0 + rowH * r + 5, colW - 14, rowH - 10, 9); ctx.stroke();
      text(ROWS[r], cx + 20, gy0 + rowH * r + rowH / 2 + 1, { size: 16, weight: 700, color: '#0B7A67', qa: false });
    });
  });
  // legend + checked
  const ly = y + h - 34;
  ctx.fillStyle = hexA(B.success, 0.25); rrect(x + 40, ly - 9, 18, 18, 5); ctx.fill();
  text(CAL.avail, x + 66, ly + 1, { size: 17, weight: 600, color: '#4B5563' });
  ctx.fillStyle = 'rgba(17,24,39,0.1)'; rrect(x + 200, ly - 9, 18, 18, 5); ctx.fill();
  text('Busy', x + 226, ly + 1, { size: 17, weight: 600, color: '#4B5563' });
  const cp = prog(t, checkedT, 0.6);
  if (cp > 0) {
    const lw = measure('Availability checked', 18, 700);
    checkBadge(x + w - 40 - lw - 22, ly, 13, cp, B.success);
    withAlpha(E.outExpo(cp), () => text('Availability checked', x + w - 40, ly + 1, { size: 18, weight: 700, color: '#0B7A67', align: 'right' }));
  }
}
function slotCard(x, y, w, h, label, t, i, opt = {}) {
  const { hov = 0, press = 1, conf = 0 } = opt;
  withT(x + w / 2, y + h / 2, press * (1 + 0.025 * hov), () => {
    ctx.translate(-(x + w / 2), -(y + h / 2));
    card(x, y, w, h, { r: 20, shadow: 0.8 + 0.8 * hov, stroke: conf > 0 ? hexA(B.success, 0.7) : hov > 0.5 ? hexA(B.primary, 0.5) : 'rgba(17,24,39,0.07)', lw: conf > 0 || hov > 0.5 ? 2 : 1, label });
    if (hov > 0 && hov < 1) sweep(x, y, w, h, 20, hov);
    circle(x + 50, y + h / 2, 24, hexA(B.primary, 0.1)); ICON.clock(x + 50, y + h / 2, 26, B.primary);
    text(label, x + 90, y + h / 2 - 12, { size: 28, weight: 700, color: INK });
    text(TZ, x + 90, y + h / 2 + 20, { size: 17, weight: 500, color: MUTED });
    if (conf <= 0) tag('Available', x + w - 24, y + h / 2, TAG.green, { align: 'right' });
    else {
      checkBadge(x + w - 150, y + h / 2, 15, conf, B.success);
      withAlpha(E.outExpo(clamp01(conf * 1.5)), () => text('Confirmed', x + w - 24, y + h / 2 + 1, { size: 20, weight: 700, color: '#0B7A67', align: 'right' }));
    }
  });
}
export function sAvail(t) {
  stepper6(t, STEP_T, 1);
  headline([['Check', 80.19], ['availability', 81.18, B.primary]], t, { tout: 82.1 });
  headline([['Propose', 82.29], ['time', 83.64], ['options', 83.94, B.primary]], t, { tout: 85.1 });
  headline([['Confirmed', 85.59, B.success], ['and', 86.52], ['booked', 88.20]], t);
  // calendar (exits at the match-cut)
  const out = E.inCubic(prog(t, 86.3, 0.4));
  const cv = vis(t, 79.95, 1e9, 0.5);
  withAlpha(cv.a * (1 - out), () => { ctx.save(); ctx.translate(-slideX(cv) - out * 80, 0); teamCalendar(t); ctx.restore(); });
  // slot cards
  const SX = 1160, SW = 560, SH = 104, SY = [350, 474, 598];
  const tv = vis(t, 82.29, 1e9);
  withAlpha(tv.a * (1 - out), () => text('Proposed times', SX, 316, { size: 20, weight: 700, color: '#4B5563' }));
  const morph = E.inOutCubic(prog(t, 86.45, 0.6));
  SLOTS.forEach((label, i) => {
    const tin = [82.95, 83.34, 83.64][i];
    const p = prog(t, tin, 0.55); if (p <= 0) return;
    const e = E.outExpo(p);
    const [fx, fy] = cellC(PICK[i][0], PICK[i][1]);
    const x = lerp(fx - SW / 2, SX, e), y = lerp(fy - SH / 2, SY[i], e);
    const hov = i === 0 ? hoverAt(t, 84.1, 84.65) : i === 1 ? hoverAt(t, 84.75, 86.1) : 0;
    const press = i === 1 ? pressScale(t, 85.59) : 1;
    const conf = i === 1 ? prog(t, 85.72, 0.6) : 0;
    if (i !== CHOSEN) {
      withAlpha(e * (1 - out) * (t > 85.7 ? lerp(1, 0.5, E.outExpo(prog(t, 85.7, 0.3))) : 1), () => withT(x + SW / 2, y + SH / 2, lerp(0.6, 1, e), () => { ctx.translate(-(x + SW / 2), -(y + SH / 2)); slotCard(x, y, SW, SH, label, t, i, { hov }); }));
    } else if (morph <= 0) {
      withAlpha(e, () => withT(x + SW / 2, y + SH / 2, lerp(0.6, 1, e), () => { ctx.translate(-(x + SW / 2), -(y + SH / 2)); slotCard(x, y, SW, SH, label, t, i, { hov, press, conf }); }));
    }
  });
  // match-cut: chosen slot card → calendar event card
  if (morph > 0) {
    const ex = lerp(SX, 560, morph), ey = lerp(SY[CHOSEN], 330, morph), ew = lerp(SW, 800, morph), eh = lerp(SH, 440, morph);
    card(ex, ey, ew, eh, { r: lerp(20, 28, morph), shadow: 1.4, stroke: hexA(B.success, 0.5 * (1 - morph) + 0.15), lw: 2, label: 'event card' });
    withAlpha(1 - clamp01(morph * 3), () => { text(SLOTS[CHOSEN], ex + 90, ey + 40, { size: 28, weight: 700, color: INK, qa: false }); });
    if (morph >= 1) {
      const x = 560, y = 330, w = 800;
      ctx.fillStyle = hexA(B.primary, 0.08); rrect(x, y, w, 80, [28, 28, 0, 0]); ctx.fill();
      ICON.calendar(x + 48, y + 40, 28, B.primary);
      text('Calendar event', x + 80, y + 41, { size: 22, weight: 700, color: '#3148C7' });
      text(CAL.team, x + w - 32, y + 41, { size: 18, weight: 600, color: MUTED, align: 'right' });
      const rows = [
        [86.95, () => { text('Consultation', x + 48, y + 134, { size: 34, weight: 800, color: INK }); }],
        [87.18, () => { ICON.clock(x + 62, y + 204, 26, B.primary); text(`${SLOTS[CHOSEN]} · ${TZ}`, x + 92, y + 205, { size: 24, weight: 600, color: INK }); }],
        [87.72, () => { avatar(x + 62, y + 274, 22, SAM.ini, SAM.color); text(SAM.name, x + 96, y + 264, { size: 22, weight: 700, color: INK }); text(SAM.email, x + 96, y + 290, { size: 17, weight: 500, color: MUTED }); }],
      ];
      rows.forEach(([tm, fn]) => { const v = vis(t, tm, 1e9, 0.45); withAlpha(v.a, () => { ctx.save(); ctx.translate(slideX(v, 30), 0); fn(); ctx.restore(); }); });
      const bp = prog(t, 88.20, 0.6);
      if (bp > 0) {
        ctx.fillStyle = 'rgba(17,24,39,0.07)'; ctx.fillRect(x + 32, y + 340, w - 64, 1);
        checkBadge(x + 62, y + 392, 18, bp, B.success);
        withAlpha(E.outExpo(bp), () => withT(x + 96, y + 392, popScale(bp), () => tag('Booked', 0, 0, TAG.green, { size: 20, h: 38 })));
      }
    }
  }
  const keys = [{ t: 83.85, x: 1600, y: 790 }, { t: 84.25, x: 1480, y: 410 }, { t: 84.65, x: 1480, y: 412 }, { t: 85.1, x: 1470, y: 534 }, { t: 85.9, x: 1476, y: 538 }, { t: 86.6, x: 1640, y: 760 }];
  const cp = cursorAt(t, keys);
  ripple(cp.x, cp.y, t, 85.59, B.primary);
  cursor(cp.x, cp.y, pressAt(t, [85.59]), vis(t, 83.9, 86.3).a);
}
export function camAvail(t) {
  // snap-zoom on the clicked slot: 100% → 103.5% → settle
  const up = E.outExpo(prog(t, 85.59, 0.18)), settle = E.inOutCubic(prog(t, 85.8, 0.5)), back = E.inOutCubic(prog(t, 86.2, 0.3));
  const s = 1 + (0.035 * up - 0.02 * settle) * (1 - back);
  return { s, fx: 1300, fy: 540 };
}

// ======================================================================= 12 confirmation + reminders + log
export function sMessages(t) {
  stepper6(t, STEP_T, 1);
  headline([['Confirmation', 89.31, B.primary], ['email', 90.03]], t, { tout: 90.55 });
  headline([['Reminders', 91.14, B.primary], ['before', 92.04], ['the', 92.37], ['appointment', 92.49]], t);
  const lv = vis(t, 89.45, 1e9, 0.5);
  withAlpha(lv.a, () => {
    ctx.save(); ctx.translate(-slideX(lv), 0);
    const x = 200, y = 290, w = 740, h = 540;
    card(x, y, w, h, { r: 24, shadow: 1.2, label: 'confirmation email' });
    cardHeader(x + 32, y + 50, 'Confirmation email', ICON.mail, INK, B.primary);
    const sent = t >= 90.03;
    const sp = prog(t, 90.03, 0.5);
    if (!sent) tag('Draft', x + w - 32, y + 50, TAG.neutral, { align: 'right' });
    else withAlpha(E.outExpo(sp), () => withT(x + w - 32, y + 50, popScale(sp), () => tag('Sent', 0, 0, TAG.green, { align: 'right' })));
    text('To:', x + 32, y + 116, { size: 19, weight: 600, color: MUTED });
    text(SAM.email, x + 72, y + 116, { size: 19, weight: 500, color: INK });
    text('Subject:', x + 32, y + 152, { size: 19, weight: 600, color: MUTED });
    text('Your consultation is confirmed', x + 116, y + 152, { size: 19, weight: 600, color: INK });
    ctx.fillStyle = 'rgba(17,24,39,0.07)'; ctx.fillRect(x + 32, y + 184, w - 64, 1);
    const body = ['Hi Sam,', `Your consultation is booked for ${SLOTS[CHOSEN]} (${TZ}).`, 'Reply here if you need to reschedule.'];
    const tt = [[89.5, 89.62], [89.62, 89.82], [89.82, 89.95]];
    body.forEach((l, i) => { const s = typed(l, t, tt[i][0], tt[i][1]); if (s) text(s, x + 32, y + 234 + i * 44, { size: 21, weight: 500, color: INK, maxW: w - 64 }); });
    // send button + sent label
    const pr = pressScale(t, 89.96);
    button('Send', x + w - 32, y + h - 60, { kind: 'filled', color: B.primary, icon: ICON.arrow, press: pr, align: 'right' });
    ripple(x + w - 90, y + h - 60, t, 89.96, B.primary);
    const cp = prog(t, 90.03, 0.6);
    if (cp > 0) { checkBadge(x + 52, y + h - 60, 18, cp, B.success); withAlpha(E.outExpo(cp), () => text('Confirmation sent', x + 84, y + h - 59, { size: 22, weight: 700, color: '#0B7A67' })); }
    ctx.restore();
  });
  const rv = vis(t, 89.55, 1e9, 0.5);
  withAlpha(rv.a, () => {
    ctx.save(); ctx.translate(slideX(rv), 0);
    const x = 1000, y = 290, w = 720, h = 540;
    card(x, y, w, h, { r: 24, shadow: 1.2, label: 'reminders card' });
    cardHeader(x + 32, y + 50, 'Reminders', ICON.bell, INK, B.primary);
    const lx = x + 56;
    const nodes = [
      [89.7, 'Booked', null, 'green'], [91.14, '24 hours before', 91.35, 'chip'], [91.62, '2 hours before', 91.85, 'chip'], [92.04, `${SLOTS[CHOSEN]} · Consultation`, null, 'event'],
    ];
    const ys = [y + 126, y + 214, y + 302, y + 390];
    const spine = E.outExpo(prog(t, 89.7, 2.6));
    ctx.fillStyle = 'rgba(17,24,39,0.1)'; rrect(lx - 1.5, ys[0], 3, (ys[3] - ys[0]) * spine, 1.5); ctx.fill();
    nodes.forEach(([tm, label, tog, kind], i) => {
      const p = prog(t, tm, 0.5); if (p <= 0) return;
      const e = E.outExpo(p); const cy = ys[i];
      withAlpha(e, () => {
        circle(lx, cy, 10, kind === 'green' ? B.success : B.primary); circle(lx, cy, 4, '#FFFFFF');
        if (kind === 'chip') {
          withT(lx + 36, cy, popScale(p), () => chip(label, 0, 0, { size: 21, h: 48, pad: 18, icon: ICON.bell, bg: hexA(B.primary, 0.09), fg: '#3148C7', iconColor: '#3148C7' }));
          toggle(x + w - 32 - 64, cy, E.outExpo(prog(t, tog, 0.35)), B.primary);
        } else if (kind === 'event') {
          ICON.calendar(lx + 44, cy, 24, B.primary);
          text(label, lx + 70, cy + 1, { size: 21, weight: 700, color: INK });
        } else text(label, lx + 32, cy + 1, { size: 21, weight: 600, color: '#0B7A67' });
      });
    });
    // log row
    const lg = prog(t, 92.49, 0.6);
    if (lg > 0) {
      ctx.fillStyle = 'rgba(17,24,39,0.07)'; ctx.fillRect(x + 32, y + 450, w - 64, 1);
      checkBadge(x + 52, y + 494, 16, lg, B.success);
      withAlpha(E.outExpo(lg), () => { text('Booking logged', x + 80, y + 495, { size: 21, weight: 700, color: '#0B7A67' }); tag('Log', x + w - 32, y + 494, TAG.neutral, { align: 'right' }); });
    }
    ctx.restore();
  });
}

// ======================================================================= 13 unclear → follow-up questions
export function sUnclear(t) {
  eyebrow('If the request is unclear', t, 93.42, 1e9, { dot: B.secondary });
  headline([['Ask', 98.61], ['follow-up', 99.55], ['questions', 100.05, B.primary]], t, { tout: 1e9 });
  const lv = vis(t, 93.5, 1e9, 0.5);
  withAlpha(lv.a, () => {
    ctx.save(); ctx.translate(-slideX(lv), 0);
    const x = 200, y = 290, w = 700, h = 560;
    card(x, y, w, h, { r: 24, shadow: 1.2, label: 'unclear request' });
    cardHeader(x + 32, y + 50, 'Website form', ICON.doc, INK, B.secondary);
    tag('New request', x + w - 32, y + 50, TAG.blue, { align: 'right' });
    ctx.fillStyle = 'rgba(17,24,39,0.035)'; rrect(x + 32, y + 100, w - 64, 84, 16); ctx.fill();
    text('“Hi, can I book something soon?”', x + 56, y + 143, { size: 24, weight: 600, color: INK, maxW: w - 112 });
    const rows = [['Service', 95.55, 'Missing: service type', TAG.amber], ['Preferred time', 96.99, 'Not provided', TAG.neutral]];
    rows.forEach(([label, tm, st, style], i) => {
      const ry = y + 230 + i * 104;
      text(label, x + 32, ry, { size: 19, weight: 600, color: MUTED });
      const hl = E.outExpo(prog(t, tm, 0.4));
      dashed(x + 32, ry + 20, w - 64, 52, 14, hl > 0 ? hexA('#F5A524', 0.3 + 0.5 * hl) : 'rgba(17,24,39,0.22)');
      if (hl > 0) withAlpha(hl, () => withT(x + 48, ry + 46, popScale(prog(t, tm, 0.5)), () => tag(st, 0, 0, style, i === 1 ? { dot: false } : {})));
    });
    const ng = prog(t, 101.04, 0.5);
    if (ng > 0) withAlpha(E.outExpo(ng), () => withT(x + 32, y + h - 64, popScale(ng), () => chip('No guessing', 0, 0, { size: 22, h: 48, pad: 18, icon: ICON.shield, bg: hexA(B.primary, 0.1), fg: '#3148C7', iconColor: '#3148C7' })));
    ctx.restore();
  });
  const rv = vis(t, 98.3, 1e9, 0.5);
  withAlpha(rv.a, () => {
    ctx.save(); ctx.translate(slideX(rv), 0);
    const x = 980, y = 290, w = 740, h = 560;
    card(x, y, w, h, { r: 24, shadow: 1.2, label: 'follow-up card' });
    cardHeader(x + 32, y + 50, 'Follow-up questions', ICON.question, INK, B.primary);
    const hi = typed('Hi, thanks for reaching out.', t, 98.5, 99.1);
    if (hi) text(hi, x + 32, y + 118, { size: 21, weight: 500, color: INK });
    const qs = [['Which service?', 99.27], ['Preferred day?', 99.55], ['Any constraints?', 100.05]];
    qs.forEach(([q, tm], i) => {
      const p = prog(t, tm, 0.5); if (p <= 0) return;
      const e = E.outExpo(p); const ty = y + 186 + i * 76;
      const snap = popScale(prog(t, tm + 0.25, 0.4));
      withAlpha(e, () => withT(x + 32 + (1 - e) * 120, ty, p < 0.5 ? 1 : snap, () => chip(q, 0, 0, { size: 22, h: 52, pad: 20, icon: ICON.question, bg: '#FFFFFF', fg: INK, stroke: hexA(B.primary, 0.35), iconColor: B.primary, shadow: 0.6 })));
    });
    // service options under the first question
    const op = vis(t, 100.4, 1e9);
    withAlpha(op.a, () => {
      text('Options', x + 32, y + 432, { size: 18, weight: 600, color: MUTED });
      let ox = x + 32;
      SERVICES.forEach((s, i) => { const pp = prog(t, 100.45 + i * 0.1, 0.4); withAlpha(E.outExpo(pp), () => { const r = tag(s, ox, y + 476, TAG.neutral, { size: 19, h: 40, dot: false }); }); ox += tagWidth(s, TAG.neutral, { size: 19, h: 40, dot: false }) + 12; });
    });
    ctx.restore();
  });
}

// ======================================================================= 14 safety: double booking + time zones
export function sSafe(t) {
  headline([['Designed', 102.00], ['to', 102.48], ['be', 102.54], ['safe', 102.66, '#C27C00']], t);
  const lv = vis(t, 101.8, 1e9, 0.5);
  withAlpha(lv.a, () => {
    ctx.save(); ctx.translate(-slideX(lv), 0);
    const x = 200, y = 290, w = 720, h = 560;
    card(x, y, w, h, { r: 24, shadow: 1.2, label: 'double booking card' });
    cardHeader(x + 32, y + 50, 'Double booking', ICON.shield, INK, C.accent);
    text('Wed', x + 32, y + 112, { size: 19, weight: 700, color: '#374151' });
    const rows = ['3:00', '3:30', '4:00'];
    rows.forEach((r, i) => {
      const ry = y + 140 + i * 76;
      text(r, x + 32, ry + 32, { size: 17, weight: 500, color: MUTED });
      ctx.fillStyle = 'rgba(17,24,39,0.04)'; rrect(x + 100, ry, w - 132, 64, 14); ctx.fill();
    });
    // booked 3:30
    const by = y + 216;
    ctx.fillStyle = hexA(B.primary, 0.12); rrect(x + 100, by, w - 132, 64, 14); ctx.fill();
    ICON.lock(x + 130, by + 32, 22, '#3148C7');
    text(`Consultation · ${SAM.name}`, x + 156, by + 33, { size: 20, weight: 700, color: '#3148C7' });
    // incoming request tries 3:30
    const ip = vis(t, 103.3, 1e9, 0.45);
    const go = E.inOutCubic(prog(t, 103.62, 0.45)), bounce = E.outExpo(prog(t, 104.1, 0.45));
    const iy = lerp(y + 420, by + 32 + 40, go) + (y + 420 - (by + 72)) * bounce * 0.85;
    const blocked = t >= 104.1;
    withAlpha(ip.a, () => withT(x + 100 + 250, iy, 1 - 0.03 * Math.sin(Math.PI * clamp01(prog(t, 104.05, 0.3))), () => {
      chip('New request · Wed 3:30', 0, 0, { align: 'center', size: 20, h: 46, pad: 18, icon: blocked ? ICON.lock : ICON.mail, bg: '#FFFFFF', fg: INK, stroke: blocked ? hexA(C.accent, 0.8) : 'rgba(17,24,39,0.12)', iconColor: blocked ? '#C27C00' : B.primary, shadow: 1 });
    }));
    const bp = prog(t, 104.41, 0.5);
    if (bp > 0) withAlpha(E.outExpo(bp), () => {
      const yy = y + h - 72 + (1 - E.outExpo(bp)) * 16;
      ctx.fillStyle = hexA(C.accent, 0.16); rrect(x + 32, yy - 28, w - 64, 56, 14); ctx.fill();
      ICON.alert(x + 64, yy, 24, '#C27C00');
      text('Slot unavailable', x + 92, yy + 1, { size: 21, weight: 700, color: '#8A5300' });
      withAlpha(E.outExpo(prog(t, 104.9, 0.4)), () => text('Next free: Wed 4:00', x + w - 56, yy + 1, { size: 19, weight: 600, color: '#8A5300', align: 'right' }));
    });
    // next free outline
    const nf = E.outExpo(prog(t, 104.9, 0.4));
    if (nf > 0) withAlpha(nf, () => { ctx.strokeStyle = hexA(B.success, 0.8); ctx.lineWidth = 2; ctx.setLineDash([6, 5]); rrect(x + 101, y + 293, w - 134, 62, 13); ctx.stroke(); ctx.setLineDash([]); });
    ctx.restore();
  });
  const rv = vis(t, 102.0, 1e9, 0.5);
  withAlpha(rv.a, () => {
    ctx.save(); ctx.translate(slideX(rv), 0);
    const x = 1000, y = 290, w = 720, h = 560;
    card(x, y, w, h, { r: 24, shadow: 1.2, label: 'time zones card' });
    cardHeader(x + 32, y + 50, 'Time zones', ICON.globe, INK, C.accent);
    const tp = prog(t, 105.42, 0.35);
    ctx.fillStyle = 'rgba(17,24,39,0.035)'; rrect(x + 32, y + 104, w - 64, 72, 16); ctx.fill();
    text(TZ, x + 60, y + 141, { size: 22, weight: 600, color: INK });
    toggle(x + w - 60 - 64, y + 140, E.outExpo(tp), C.accent);
    text('Booking time', x + 32, y + 236, { size: 19, weight: 600, color: MUTED });
    rollText([{ t: 101.0, s: 'Wed 20:30 UTC' }, { t: 105.5, s: SLOTS[CHOSEN] }], t, x + 32, y + 306, { size: 56, weight: 800, color: INK, d: 0.45 });
    const lp = prog(t, 105.69, 0.5);
    if (lp > 0) withAlpha(E.outExpo(lp), () => withT(x + 32, y + 384, popScale(lp), () => chip(`Converted to ${TZ.toLowerCase()}`, 0, 0, { size: 20, h: 44, pad: 16, icon: ICON.check, bg: hexA(C.accent, 0.16), fg: '#8A5300', iconColor: '#8A5300' })));
    ctx.restore();
  });
}

// ======================================================================= 15 human approval (edit one detail, approve)
export function sApproval(t) {
  headline([['Special', 106.88], ['cases', 107.34], ['go', 107.79], ['to', 107.94], ['a', 107.94], ['human', 108.03, '#C27C00']], t);
  const x = 460, y = 290, w = 1000, h = 540;
  const v = vis(t, 106.45, 1e9, 0.5);
  withAlpha(v.a, () => {
    ctx.save(); ctx.translate(slideX(v), 0);
    card(x, y, w, h, { r: 26, shadow: 1.3, stroke: hexA(C.accent, 0.35), label: 'approval panel' });
    cardHeader(x + 36, y + 56, 'Needs approval', ICON.shield, INK, C.accent);
    const ap = prog(t, 108.63, 0.5);
    if (ap <= 0) tag('Special case', x + w - 36, y + 56, TAG.amber, { align: 'right' });
    else withAlpha(E.outExpo(ap), () => withT(x + w - 36, y + 56, popScale(ap), () => tag('Approved', 0, 0, TAG.green, { align: 'right' })));
    ctx.fillStyle = 'rgba(17,24,39,0.07)'; ctx.fillRect(x + 36, y + 104, w - 72, 1);
    text('Installation', x + 36, y + 150, { size: 30, weight: 800, color: INK });
    text('Website form', x + 36, y + 188, { size: 18, weight: 500, color: MUTED });
    // detail rows
    const editing = t >= 107.25 && t < 108.0;
    const edited = t >= 107.35;
    const r1 = y + 250;
    ctx.fillStyle = 'rgba(17,24,39,0.03)'; rrect(x + 36, r1 - 32, w - 72, 64, 14); ctx.fill();
    if (editing) { ctx.strokeStyle = hexA(C.accent, 0.8); ctx.lineWidth = 2; rrect(x + 37, r1 - 31, w - 74, 62, 13); ctx.stroke(); }
    text('Time', x + 60, r1 + 1, { size: 19, weight: 600, color: MUTED });
    let val = 'Fri 6:30';
    if (edited) val = typed('Thu 5:00', t, 107.4, 107.85);
    const vw = text(val, x + 220, r1 + 1, { size: 22, weight: 700, color: INK });
    if (editing && caretOn(t * 1.4)) { ctx.fillStyle = INK; ctx.fillRect(x + 223 + vw, r1 - 13, 2, 26); }
    const oh = 1 - E.inCubic(prog(t, 107.3, 0.25));
    if (oh > 0) withAlpha(oh, () => tag('Outside hours', x + w - 60, r1, TAG.amber, { align: 'right' }));
    const ok = prog(t, 107.95, 0.45);
    if (ok > 0) withAlpha(E.outExpo(ok), () => withT(x + w - 60, r1, popScale(ok), () => tag('Available', 0, 0, TAG.green, { align: 'right' })));
    const r2 = y + 330;
    ctx.fillStyle = 'rgba(17,24,39,0.03)'; rrect(x + 36, r2 - 32, w - 72, 64, 14); ctx.fill();
    text('Calendar', x + 60, r2 + 1, { size: 19, weight: 600, color: MUTED });
    text(CAL.team, x + 220, r2 + 1, { size: 22, weight: 600, color: INK });
    // buttons
    const by = y + h - 70;
    const aB = button('Approve', x + 36, by, { kind: 'filled', color: B.success, icon: ICON.check, press: pressScale(t, 108.45), hover: hoverAt(t, 108.15, 108.8) });
    const eX = x + 36 + aB.w + 16;
    const eB = button('Edit', eX, by, { kind: 'outline', color: '#C27C00', icon: ICON.pencil, press: pressScale(t, 107.25), hover: hoverAt(t, 106.95, 107.5) });
    button('Reject', eX + eB.w + 16, by, { kind: 'ghost', icon: ICON.x });
    ripple(eX + eB.w / 2, by, t, 107.25, C.accent);
    ripple(x + 36 + aB.w / 2, by, t, 108.45, B.success);
    const cp = prog(t, 108.63, 0.6);
    if (cp > 0) { checkBadge(x + w - 250, by, 18, cp, B.success); withAlpha(E.outExpo(cp), () => text('Approved by owner', x + w - 36, by + 1, { size: 20, weight: 700, color: '#0B7A67', align: 'right' })); }
    ctx.restore();
  });
  const by = y + h - 70;
  const keys = [{ t: 106.5, x: 1380, y: 800 }, { t: 107.0, x: 735, y: by + 4 }, { t: 107.5, x: 740, y: by + 6 }, { t: 108.2, x: 580, y: by + 4 }, { t: 109.0, x: 600, y: by + 8 }];
  const cp = cursorAt(t, keys);
  cursor(cp.x, cp.y, pressAt(t, [107.25, 108.45]), vis(t, 106.55, 109.1).a);
}

// ======================================================================= 16 fail safe
export function sFailure(t) {
  headline([['If', 109.53], ['anything', 109.71], ['fails,', 110.13], ['it', 112.86], ['stops', 113.01], ['safely', 113.42, '#C27C00']], t);
  const x = 360, y = 290, w = 1200, h = 540;
  const v = vis(t, 109.6, 1e9, 0.5);
  withAlpha(v.a, () => {
    ctx.save(); ctx.translate(slideX(v), 0);
    card(x, y, w, h, { r: 26, shadow: 1.3, label: 'workflow status' });
    cardHeader(x + 36, y + 56, 'Booking workflow', ICON.refresh, INK, C.accent);
    const paused = t >= 111.24;
    const pp = prog(t, 111.24, 0.5);
    if (!paused) tag('Running', x + w - 36, y + 56, TAG.green, { align: 'right' });
    else withAlpha(E.outExpo(pp), () => withT(x + w - 36, y + 56, popScale(pp), () => tag('Paused', 0, 0, TAG.amber, { align: 'right' })));
    // mini steps
    const st = ['Extract details', 'Check availability', 'Propose slots'];
    let sx = x + 36;
    st.forEach((s, i) => {
      const style = i === 0 ? TAG.green : i === 1 ? (paused ? TAG.amber : TAG.blue) : TAG.neutral;
      tag(s, sx, y + 134, style, { size: 18, h: 38, dot: i === 2 ? false : undefined });
      sx += tagWidth(s, style, { size: 18, h: 38, dot: i === 2 ? false : undefined }) + 14;
    });
    // banner
    const bp = prog(t, 111.24, 0.5);
    if (bp > 0) withAlpha(E.outExpo(bp), () => {
      const yy = y + 222 + (1 - E.outExpo(bp)) * -14;
      ctx.fillStyle = hexA(C.accent, 0.16); rrect(x + 36, yy - 34, w - 72, 68, 16); ctx.fill();
      ICON.alert(x + 72, yy, 28, '#C27C00');
      text('Calendar access unavailable', x + 104, yy + 1, { size: 24, weight: 700, color: '#8A5300' });
    });
    const rows = [['Retry scheduled', ICON.clock, 113.01], ['Owner alerted', ICON.bell, 114.78]];
    rows.forEach(([l, icon, tm], i) => {
      const p = prog(t, tm, 0.5); if (p <= 0) return;
      const ry = y + 326 + i * 88;
      withAlpha(E.outExpo(p), () => {
        ctx.save(); ctx.translate((1 - E.outExpo(p)) * 30, 0);
        ctx.fillStyle = 'rgba(17,24,39,0.03)'; rrect(x + 36, ry - 34, w - 72, 68, 16); ctx.fill();
        circle(x + 76, ry, 22, hexA(C.accent, 0.14)); icon(x + 76, ry, 24, '#C27C00');
        text(l, x + 112, ry + 1, { size: 23, weight: 700, color: INK });
        checkBadge(x + w - 70, ry, 17, prog(t, tm + 0.1, 0.6), B.success);
        ctx.restore();
      });
    });
    ctx.restore();
  });
}

// ======================================================================= 17 outcome math (dark)
function darkCard(x, y, w, h, label) { card(x, y, w, h, { r: 24, fill: D.card, shadow: 1.4, shadowColor: 'rgba(0,0,0,0.35)', stroke: 'rgba(255,255,255,0.08)', label }); }
export function sOutcome(t) {
  headline([['Illustrative', 116.01, D.accent], ['estimate', 116.55]], t, { color: D.text });
  const lv = vis(t, 116.3, 1e9, 0.5);
  withAlpha(lv.a, () => {
    ctx.save(); ctx.translate(-slideX(lv), 0);
    const x = 200, y = 290, w = 700, h = 500;
    darkCard(x, y, w, h, 'assumptions card');
    text('Assumptions', x + 40, y + 56, { size: 26, weight: 700, color: D.text });
    chip('Illustrative assumptions', x + w - 36, y + 56, { align: 'right', size: 17, h: 36, pad: 14, bg: hexA(D.accent, 0.14), fg: D.accent });
    const rows = [['Manual:', '6 min/request', 119.16], ['Review:', '1 min/request', 122.22], ['Volume:', '100/month', 126.30]];
    rows.forEach(([k, val, tm], i) => {
      const v = vis(t, tm, 1e9, 0.45); if (v.a <= 0) return;
      const ry = y + 150 + i * 96;
      withAlpha(v.a, () => {
        ctx.save(); ctx.translate(slideX(v, 30), 0);
        ctx.fillStyle = 'rgba(255,255,255,0.04)'; rrect(x + 36, ry - 36, w - 72, 72, 16); ctx.fill();
        const kw = text(k, x + 64, ry + 1, { size: 22, weight: 500, color: D.muted });
        text(val, x + 64 + kw + 12, ry + 1, { size: 28, weight: 700, color: D.text });
        ctx.restore();
      });
    });
    ctx.restore();
  });
  const rv = vis(t, 116.5, 1e9, 0.5);
  withAlpha(rv.a, () => {
    ctx.save(); ctx.translate(slideX(rv), 0);
    const x = 980, y = 290, w = 740, h = 500;
    darkCard(x, y, w, h, 'estimate card');
    text('Estimate', x + 40, y + 56, { size: 26, weight: 700, color: D.text });
    const s1 = vis(t, 124.62, 1e9, 0.45);
    withAlpha(s1.a, () => withT(x + 40, y + 128 + s1.dy * 0.5, popScale(prog(t, 124.62, 0.5)), () => text('~5 min saved/request', 0, 0, { size: 40, weight: 800, color: D.success })));
    withAlpha(vis(t, 124.98, 1e9).a, () => text('6 min − 1 min = 5 min', x + 40, y + 176, { size: 19, weight: 500, color: D.muted }));
    withAlpha(vis(t, 128.1, 1e9).a, () => { ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x + 40, y + 208, w - 80, 1); });
    withAlpha(vis(t, 128.64, 1e9).a, () => text('5 min × 100 = 500 min', x + 40, y + 250, { size: 23, weight: 600, color: D.text }));
    withAlpha(vis(t, 130.32, 1e9).a, () => text('500 min ÷ 60 ≈ 8.3 hours', x + 40, y + 292, { size: 23, weight: 600, color: D.text }));
    const bp = vis(t, 130.8, 1e9, 0.5);
    withAlpha(bp.a, () => {
      const bx = x + 32, by = y + 336, bw = w - 64, bh = 128;
      ctx.fillStyle = hexA(D.accent, 0.1); rrect(bx, by, bw, bh, 20); ctx.fill();
      const v = 8 * E.outCubic(prog(t, 130.95, 0.7));
      const tilde = text('~', bx + 32, by + 58, { size: 56, weight: 800, color: D.accent });
      const nw = measure('8', 56, 800);
      ctx.save(); ctx.beginPath(); ctx.rect(bx + 32 + tilde, by + 18, nw + 4, 84); ctx.clip();
      const iv = Math.floor(v), f = v - iv;
      text(String(iv), bx + 32 + tilde, by + 58 - f * 60, { size: 56, weight: 800, color: D.accent, qa: false });
      if (f > 0) text(String(iv + 1), bx + 32 + tilde, by + 58 + (1 - f) * 60, { size: 56, weight: 800, color: D.accent, qa: false });
      ctx.restore();
      text(' hours/month', bx + 32 + tilde + nw, by + 58, { size: 40, weight: 800, color: D.accent });
      withAlpha(vis(t, 131.55, 1e9).a, () => text('(estimate)', bx + 36, by + 104, { size: 20, weight: 600, color: D.muted }));
    });
    ctx.restore();
  });
  const fv = vis(t, 134.64, 1e9, 0.45);
  withAlpha(fv.a, () => text('Based on assumptions · Not a guaranteed result', 960, 840, { size: 21, weight: 600, color: D.muted, align: 'center' }));
}

// ======================================================================= 18 transparent close
export function sClose(t) {
  const collapse = E.inOutCubic(prog(t, 140.35, 0.8));
  const trust = [['Independent portfolio prototype', 136.26], ['Fictional data', 138.54], ['Results vary', 139.62]];
  const smW = trust.map(([l]) => chipWidth(l, { size: 19, h: 42, pad: 16, icon: ICON.check }));
  const rowTotal = smW.reduce((a, b) => a + b, 0) + 16 * 2;
  let rx = 960 - rowTotal / 2;
  trust.forEach(([l, tin], i) => {
    const p = prog(t, tin, 0.5);
    const sx = rx + smW[i] / 2; rx += smW[i] + 16;
    if (p <= 0) return;
    const x = lerp(960, sx, collapse), y = lerp(420 + i * 96, 820, collapse);
    const size = lerp(28, 19, collapse), h = lerp(64, 42, collapse), pad = lerp(26, 16, collapse);
    withAlpha(E.outExpo(p), () => withT(x, y + (1 - E.outExpo(p)) * 24, popScale(p), () => {
      const w = chipWidth(l, { size, h, pad, icon: ICON.check });
      card(-w / 2, -h / 2, w, h, { r: h / 2, fill: 'rgba(255,255,255,0.06)', shadow: 0, stroke: 'rgba(255,255,255,0.16)', label: l });
      const s = h * 0.5; const cx = -w / 2 + pad;
      checkBadge(cx + s / 2, 0, s * 0.55, prog(t, tin + 0.1, 0.6), D.success, true);
      text(l, cx + s + 10, 1, { size, weight: 600, color: D.text });
    }));
  });
  wordsLine([['Faster', 141.33], ['bookings.', 141.81]], 960, 380, { size: 72, weight: 800, color: D.text });
  wordsLine([['Fewer', 143.67], ['no-shows.', 144.00, D.accent]], 960, 474, { size: 72, weight: 800, color: D.text });
  wordsLine([['Fewer', 142.50], ['mistakes.', 142.86]], 960, 590, { size: 30, weight: 500, color: D.muted });
  wordsLine([['More', 144.96], ['time', 145.14], ['spent', 145.50], ['delivering', 145.86], ['the', 146.28], ['service.', 146.37]], 960, 640, { size: 30, weight: 500, color: D.muted });
  const br = prog(t, 141.9, 0.6);
  withAlpha(E.outExpo(br) * 0.9, () => text(`${BIZ} · Scheduling workflow`, 960, 730, { size: 20, weight: 600, color: D.muted, align: 'center' }));
}
export function camClose(t) { return { s: 1 + 0.03 * E.inOutCubic(prog(t, 141.0, 7)), fx: 960, fy: 540 }; }
