// Sections B/C/D — save + extract + validate + write, review queue, duplicates, audit log, safe failure, file link, outcome, close.
import {
  ctx, PAL, E, clamp01, lerp, prog, vis, popScale, hexA, mixHex, text, measure, card, chip, chipWidth, ICON, avatar, skel,
  withAlpha, withT, rrect, sweep, checkBadge, cursor, ripple, cursorAt, pressAt, hoverAt, pressScale, wordsLine, rollNumber,
} from './lib.mjs';
import {
  BIZ, INBOX, DOC_TYPE, FILE, REF, SAM, JOB, PHONE, ADDRESS, FIELDS, REQUIRED, COLUMNS, ASSIGNED, TAG, tag, tagWidth,
  headline, eyebrow, appWindow, emailRow, button, rollText, typed, caretOn, cardHeader, stepper, docPage, docFields, fileTile, connector,
} from './components.mjs';

const B = PAL.B, C = PAL.C, D = PAL.D;
const INK = '#111827', MUTED = '#6B7280', AMBER_INK = '#C27C00';
const circle = (x, y, r, fill) => { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };
const slideX = (v, d = 60) => (1 - v.e) * d;
const dashed = (x, y, w, h, r, col = 'rgba(17,24,39,0.22)', lw = 1.5) => { ctx.save(); ctx.setLineDash([6, 6]); ctx.strokeStyle = col; ctx.lineWidth = lw; rrect(x, y, w, h, r); ctx.stroke(); ctx.restore(); };
// Save → Extract → Validate → Write → Log
export const STEP_T = [56.76, 58.29, 60.15, 63.06, 77.70];

// ======================================================================= stepper layer (persists across scenes 10–12)
export function sStepperLayer(t) { stepper(t, STEP_T, vis(t, 55.98, 1e9).a); }

// ======================================================================= 10 email arrives → attachment → saved
export function sArrive(t) {
  headline([['Email', 53.76], ['arrives', 54.21], ['with', 54.84], ['an', 54.96], ['attachment', 55.05, B.primary]], t);
  const wx = 200, wy = 300, ww = 760, wh = 440;
  const wv = vis(t, 53.6, 1e9, 0.5);
  const rowH = 92;
  const newIn = E.outExpo(prog(t, 54.21, 0.5));
  withAlpha(wv.a, () => {
    ctx.save(); ctx.translate(-slideX(wv), 0);
    appWindow(wx, wy, ww, wh, INBOX);
    ctx.save(); ctx.beginPath(); ctx.rect(wx, wy + 61, ww, wh - 62); ctx.clip();
    const others = [{ subject: 'Invoice' }, { subject: 'Work order' }, { subject: 'Invoice' }];
    others.forEach((c, i) => emailRow(wx + 12, wy + 76 + (i + newIn) * rowH, ww - 24, rowH - 8, c, { unnamed: true }));
    if (newIn > 0) withAlpha(newIn, () => emailRow(wx + 12, wy + 76 + (newIn - 1) * rowH, ww - 24, rowH - 8, { ...SAM, subject: DOC_TYPE }, {
      selected: 1, leftBar: B.primary, tagInfo: { a: E.outExpo(prog(t, 54.5, 0.4)), s: popScale(prog(t, 54.5, 0.45)), label: 'PDF attached', style: TAG.blue },
    }));
    ctx.restore();
    ctx.restore();
  });
  // attachment card pops out (snap focus 105% → settle)
  const ax = 1040, ay = 320, aw = 680, ah = 110;
  const ap = prog(t, 55.05, 0.55);
  connector(wx + ww - 20, wy + 122, ax, ay + ah / 2, prog(t, 55.05, 0.4), hexA(B.primary, 0.6));
  if (ap > 0) {
    const snap = 1 + 0.05 * Math.sin(Math.PI * clamp01(prog(t, 55.05, 0.7))) * (1 - prog(t, 55.4, 0.4));
    withAlpha(E.outExpo(ap), () => withT(ax + aw / 2, ay + ah / 2, popScale(ap) * snap, () => {
      fileTile(-aw / 2, -ah / 2, aw, ah, { name: FILE, sub: 'Attachment · PDF', border: hexA(B.primary, 0.55), shadow: 1.1, size: 22 });
      sweep(-aw / 2, -ah / 2, aw, ah, 14, prog(t, 55.3, 0.6));
    }));
  }
  // saved to "Intake files"
  const sx = 1040, sy = 470, sw = 680, sh = 270;
  const sv = vis(t, 55.6, 1e9, 0.5);
  withAlpha(sv.a, () => {
    ctx.save(); ctx.translate(slideX(sv), 0);
    card(sx, sy, sw, sh, { r: 24, shadow: 1.1, label: 'intake files' });
    cardHeader(sx + 32, sy + 52, 'Intake files', ICON.folder, INK, B.primary);
    const tp = prog(t, 57.33, 0.45);
    if (tp > 0) withAlpha(E.outExpo(tp), () => withT(sx + sw - 32 - tagWidth('Saved', TAG.green) / 2, sy + 52, popScale(tp), () => tag('Saved', 0, 0, TAG.green, { align: 'center' })));
    dashed(sx + 24, sy + 100, sw - 48, 84, 14);
    const lp = prog(t, 57.2, 0.3);
    if (lp > 0) withAlpha(E.outExpo(lp), () => fileTile(sx + 24, sy + 100, sw - 48, 84, { name: FILE, sub: 'Saved to Intake files', shadow: 0.4 }));
    checkBadge(sx + sw - 64, sy + 142, 18, prog(t, 57.33, 0.6), B.success);
    text('Original kept as received', sx + 32, sy + 226, { size: 18, weight: 500, color: MUTED });
    ctx.restore();
  });
  // flight: attachment → saved slot
  const fp = prog(t, 56.76, 0.45);
  if (fp > 0 && fp < 1) {
    const e = E.inOutCubic(fp);
    withT(lerp(ax + aw / 2, sx + sw / 2, e), lerp(ay + ah / 2, sy + 142, e) - Math.sin(Math.PI * e) * 30, lerp(0.8, 0.9, e), () => fileTile(-300, -36, 600, 72, { name: FILE, shadow: 1.2 }), 0.95);
  }
}

// ======================================================================= 11 extract key fields → validate against rules
export function sExtract(t) {
  headline([['Extract', 58.29], ['key', 59.01], ['fields', 59.34, B.primary]], t, { tout: 60.0 });
  headline([['Validate', 60.15], ['against', 61.11], ['rules', 61.98, B.primary]], t);
  // rules chips (under the headline)
  const rules = REQUIRED.map((r) => `${r} required`);
  const rs = { size: 16, h: 32, pad: 12 };
  const rws = rules.map((r) => tagWidth(r, TAG.blue, { ...rs, dot: false }));
  let rx = 960 - (rws.reduce((a, b) => a + b, 0) + 12 * (rules.length - 1)) / 2;
  rules.forEach((r, i) => {
    const p = prog(t, 60.78 + i * 0.12, 0.4);
    if (p > 0) withAlpha(E.outExpo(p), () => withT(rx + rws[i] / 2, 262, popScale(p), () => tag(r, 0, 0, TAG.blue, { ...rs, align: 'center', dot: false })));
    rx += rws[i] + 12;
  });
  // source document (left) with highlights
  const dx = 200, dy = 300, dw = 700, dh = 540;
  const flyT = (i) => 58.35 + i * 0.2;
  const dv = vis(t, 58.0, 1e9, 0.5);
  const fx = dx + 32, fy = dy + 124, pitch = 58, labelW = 200;
  withAlpha(dv.a, () => {
    ctx.save(); ctx.translate(-slideX(dv), 0);
    docPage(dx, dy, dw, dh, { title: DOC_TYPE, label: 'extract doc' });
    tag(FILE, dx + dw - 24, dy + 40, TAG.neutral, { align: 'right', size: 15, h: 28, pad: 10 });
    const hl = FIELDS.map((f, i) => (f[0] === 'Address' ? null : flyT(i) - 0.05));
    docFields(fx, fy, dw - 64, t, { hl, hlColor: hexA(B.primary, 0.14), pitch, labelW });
    ctx.restore();
  });
  // extracted fields card (right)
  const sx = 960, sy = 300, sw = 760, sh = 540;
  const rowY = (i) => sy + 104 + i * 60;
  const sv = vis(t, 58.1, 1e9, 0.5);
  const statusT = { 'Reference ID': 61.11, Email: 61.35, Phone: 61.6, Address: 61.98 };
  withAlpha(sv.a, () => {
    ctx.save(); ctx.translate(slideX(sv), 0);
    card(sx, sy, sw, sh, { r: 24, shadow: 1.2, label: 'extracted fields' });
    cardHeader(sx + 32, sy + 52, 'Extracted fields', ICON.list, INK, B.primary);
    const mp = prog(t, 62.2, 0.45);
    if (mp > 0) withAlpha(E.outExpo(mp), () => withT(sx + sw - 32 - tagWidth('1 missing', TAG.amber) / 2, sy + 52, popScale(mp), () => tag('1 missing', 0, 0, TAG.amber, { align: 'center' })));
    FIELDS.forEach(([lab], i) => {
      const y = rowY(i);
      ctx.fillStyle = 'rgba(17,24,39,0.03)'; rrect(sx + 20, y, sw - 40, 52, 12); ctx.fill();
      text(lab, sx + 40, y + 27, { size: 17, weight: 600, color: MUTED });
      if (lab === 'Address') dashed(sx + 220, y + 8, 200, 36, 18, t >= 61.98 ? hexA(C.accent, 0.9) : 'rgba(17,24,39,0.22)', t >= 61.98 ? 2 : 1.5);
      else if (t < flyT(i) + 0.45) dashed(sx + 220, y + 8, 200, 36, 18);
      const st = statusT[lab];
      if (st != null) {
        if (lab === 'Address') { const p = prog(t, st, 0.45); if (p > 0) withAlpha(E.outExpo(p), () => withT(sx + sw - 40 - tagWidth('Missing', TAG.amber) / 2, y + 26, popScale(p), () => tag('Missing', 0, 0, TAG.amber, { align: 'center', size: 16, h: 30, pad: 12 }))); }
        else checkBadge(sx + sw - 58, y + 26, 15, prog(t, st, 0.6), B.success);
      }
    });
    ctx.restore();
  });
  // chips: highlighted text → data chips → fields (magnetic snap)
  FIELDS.forEach(([lab, val], i) => {
    if (lab === 'Address') return;
    const p = prog(t, flyT(i), 0.45); if (p <= 0) return;
    const e = E.inOutCubic(p);
    const opt = { size: 17, h: 36, pad: 14, dot: false };
    const w = tagWidth(val, TAG.blue, opt);
    const x0 = fx + labelW + measure(val, 19, 600) / 2, y0 = fy + i * pitch;
    const x1 = sx + 220 + w / 2, y1 = rowY(i) + 26;
    const x = lerp(x0, x1, e), y = lerp(y0, y1, e) - Math.sin(Math.PI * e) * 36;
    const s = p < 1 ? lerp(0.92, 1.04, e) : popScale(prog(t, flyT(i) + 0.4, 0.4));
    withT(x, y, s, () => {
      if (p < 1) { ctx.save(); ctx.shadowColor = 'rgba(76,111,255,0.3)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6; ctx.fillStyle = '#FFFFFF'; rrect(-w / 2, -18, w, 36, 18); ctx.fill(); ctx.restore(); }
      tag(val, 0, 0, p >= 1 ? TAG.blue : { bg: '#FFFFFF', fg: '#3148C7' }, { ...opt, align: 'center' });
    });
  });
}

// ======================================================================= 12 write the record (database / sheet)
const COLW = [150, 180, 190, 180, 170, 300, 302];
function tableFrame(x, y, w, t, opt = {}) {
  const colX = (c) => x + 24 + COLW.slice(0, c).reduce((a, b) => a + b, 0);
  COLUMNS.forEach((h, c) => text(h, colX(c) + 12, y, { size: 16, weight: 700, color: MUTED, maxW: COLW[c] - 20 }));
  ctx.fillStyle = 'rgba(17,24,39,0.08)'; ctx.fillRect(x + 24, y + 22, w - 48, 1);
  return colX;
}
function cellValue(c, val, x, y, t, tin, colX, opt = {}) {
  const p = prog(t, tin, 0.45); if (p <= 0) return;
  const settle = E.outCubic(prog(t, tin + 0.35, 0.4));
  const cx = colX(c) + 12;
  withAlpha(E.outExpo(p), () => {
    if (val.tag) { withT(cx + tagWidth(val.tag, val.style, { size: 16, h: 30, pad: 12 }) / 2, y, popScale(p), () => tag(val.tag, 0, 0, val.style, { align: 'center', size: 16, h: 30, pad: 12 })); return; }
    if (val.link) {
      withT(cx, y, popScale(p), () => { ICON.link(10, 0, 18, B.primary); text(FILE, 26, 1, { size: 16, weight: 600, color: '#3148C7', maxW: COLW[c] - 46 }); });
      return;
    }
    const w = measure(val.s, 17, 600);
    if (settle < 1) { ctx.fillStyle = hexA(B.primary, 0.12 * (1 - settle)); rrect(cx - 8, y - 16, w + 16, 32, 16); ctx.fill(); }
    text(val.s, cx, y + (1 - E.outExpo(p)) * 10, { size: 17, weight: 600, color: val.muted ? MUTED : INK, maxW: COLW[c] - 20 });
  });
}
export function sWrite(t) {
  headline([['Writes', 63.06], ['results', 63.39], ['to', 63.81], ['a', 63.93], ['database', 63.99, B.primary]], t);
  const x = 200, y = 320, w = 1520, h = 330;
  const v = vis(t, 62.85, 1e9, 0.5);
  withAlpha(v.a, () => {
    ctx.save(); ctx.translate(slideX(v), 0);
    card(x, y, w, h, { r: 24, shadow: 1.2, label: 'records table' });
    cardHeader(x + 32, y + 50, 'Intake records', ICON.db, INK, B.primary);
    tag('Database / sheet', x + w - 32, y + 50, TAG.neutral, { align: 'right' });
    const colX = tableFrame(x, y + 104, w, t);
    [y + 156, y + 208].forEach((ry) => {
      COLW.forEach((cw, c) => skel(colX(c) + 12, ry, cw * 0.5, 11, 'rgba(17,24,39,0.09)'));
      ctx.fillStyle = 'rgba(17,24,39,0.05)'; ctx.fillRect(x + 24, ry + 26, w - 48, 1);
    });
    const ry = y + 264;
    ctx.fillStyle = hexA(B.primary, 0.07 * E.outExpo(prog(t, 63.1, 0.4))); rrect(x + 16, ry - 28, w - 32, 56, 12); ctx.fill();
    const vals = [{ s: REF }, { s: SAM.name }, { s: JOB }, { tag: 'Needs review', style: TAG.amber }, { s: ASSIGNED }, { s: 'Pending', muted: true }, { s: 'Missing: Address', muted: true }];
    vals.forEach((val, c) => cellValue(c, val, x, ry, t, 63.3 + c * 0.2, colX));
    ctx.restore();
  });
  const rp = prog(t, 64.8, 0.45);
  if (rp > 0) withAlpha(E.outExpo(rp), () => withT(960, 712, popScale(rp), () => tag('Record created', 0, 0, TAG.green, { align: 'center', size: 20, h: 40, icon: ICON.check, dot: false })));
}

// ======================================================================= 13 missing or uncertain → routed to review queue
function validationRows(x, y, w, t, opt = {}) {
  REQUIRED.forEach((lab, i) => {
    const ry = y + i * 72;
    ctx.fillStyle = lab === 'Address' ? hexA(C.accent, 0.12 + 0.06 * Math.sin(Math.PI * clamp01(prog(t, 66.45, 0.8)))) : 'rgba(17,24,39,0.03)';
    rrect(x, ry - 28, w, 56, 14); ctx.fill();
    text(lab, x + 20, ry + 1, { size: 19, weight: 600, color: INK });
    if (lab === 'Address') tag('Missing', x + w - 20, ry, TAG.amber, { align: 'right', size: 16, h: 30, pad: 12 });
    else checkBadge(x + w - 38, ry, 15, 1, B.success);
  });
}
export function sRoute(t) {
  headline([['Missing', 66.45], ['or', 67.02], ['uncertain?', 67.11, AMBER_INK]], t);
  const lx = 200, y = 320, lw = 640, h = 440;
  const lv = vis(t, 65.95, 1e9, 0.5);
  withAlpha(lv.a, () => {
    ctx.save(); ctx.translate(-slideX(lv), 0);
    card(lx, y, lw, h, { r: 24, shadow: 1.2, label: 'validation card' });
    cardHeader(lx + 32, y + 52, 'Validation', ICON.shield, INK, AMBER_INK);
    tag(REF, lx + lw - 32, y + 52, TAG.neutral, { align: 'right' });
    validationRows(lx + 24, y + 130, lw - 48, t);
    ctx.restore();
  });
  const rx = 1080, rw = 640;
  const rv = vis(t, 66.2, 1e9, 0.5);
  withAlpha(rv.a, () => {
    ctx.save(); ctx.translate(slideX(rv), 0);
    card(rx, y, rw, h, { r: 24, shadow: 1.2, label: 'review queue' });
    cardHeader(rx + 32, y + 52, 'Review queue', ICON.list, INK, AMBER_INK);
    rollText([{ t: 66.2, s: '0' }, { t: 68.85, s: '1' }], t, rx + rw - 40, y + 52, { size: 26, weight: 800, color: AMBER_INK, align: 'right', d: 0.4 });
    dashed(rx + 24, y + 110, rw - 48, 110, 16);
    const lp = prog(t, 68.8, 0.35);
    if (lp > 0) withAlpha(E.outExpo(lp), () => queueRow(rx + 24, y + 110, rw - 48, t, {}));
    [y + 250, y + 330].forEach((yy) => { skel(rx + 48, yy, 180, 11, 'rgba(17,24,39,0.07)'); skel(rx + 48, yy + 26, 120, 11, 'rgba(17,24,39,0.05)'); });
    ctx.restore();
  });
  // route: document chip flies from the Address row to the queue
  const cp = prog(t, 68.2, 0.5);
  connector(lx + lw - 16, y + 130 + 3 * 72, rx + 16, y + 165, cp, hexA(C.accent, 0.9));
  const fp = prog(t, 68.34, 0.5);
  if (fp > 0 && fp < 1) {
    const e = E.inOutCubic(fp);
    withT(lerp(lx + lw - 120, rx + rw / 2, e), lerp(y + 130 + 3 * 72, y + 165, e) - Math.sin(Math.PI * e) * 60, lerp(0.9, 1, e), () => fileTile(-150, -30, 300, 60, { name: REF, sub: DOC_TYPE, size: 18, shadow: 1.3 }));
  }
  const gp = prog(t, 67.11, 0.45);
  if (gp > 0) withAlpha(E.outExpo(gp), () => withT(960, 812, popScale(gp), () => tag('Unclear data never guessed', 0, 0, TAG.amber, { align: 'center', size: 19, h: 38, icon: ICON.shield, dot: false })));
}
function queueRow(x, y, w, t, opt = {}) {
  const { approvedT = 1e9, h = 110 } = opt;
  card(x, y, w, h, { r: 16, shadow: 0.8, stroke: hexA(C.accent, 0.5), lw: 1.5, label: 'queue row' });
  ctx.fillStyle = hexA('#EF5B5B', 0.12); rrect(x + 20, y + h / 2 - 22, 60, 44, 10); ctx.fill();
  text('PDF', x + 50, y + h / 2 + 1, { size: 15, weight: 700, color: '#B42323', align: 'center', qa: false });
  text(REF, x + 100, y + 38, { size: 22, weight: 800, color: INK });
  text(SAM.name, x + 100, y + 72, { size: 18, weight: 500, color: MUTED, maxW: w - 300 });
  const ap = prog(t, approvedT, 0.45);
  if (ap <= 0) tag('Missing: Address', x + w - 18, y + 38, TAG.amber, { align: 'right', size: 16, h: 30, pad: 12 });
  else withAlpha(E.outExpo(ap), () => withT(x + w - 18 - tagWidth('Approved', TAG.green, { size: 16, h: 30, pad: 12 }) / 2, y + 38, popScale(ap), () => tag('Approved', 0, 0, TAG.green, { align: 'center', size: 16, h: 30, pad: 12 })));
}

// ======================================================================= 14 review panel: edit the missing field, then approve
export function sReview(t) {
  headline([['Review', 69.69, AMBER_INK], ['queue,', 70.11], ['no', 70.62], ['guessing', 71.10]], t);
  const qx = 200, y = 300, qw = 560, h = 540;
  const qv = vis(t, 69.5, 1e9, 0.5);
  const approveT = 72.2;
  withAlpha(qv.a, () => {
    ctx.save(); ctx.translate(-slideX(qv), 0);
    card(qx, y, qw, h, { r: 24, shadow: 1.2, label: 'queue list' });
    cardHeader(qx + 32, y + 52, 'Review queue', ICON.list, INK, AMBER_INK);
    rollText([{ t: 0, s: '1' }, { t: approveT + 0.2, s: '0' }], t, qx + qw - 40, y + 52, { size: 26, weight: 800, color: AMBER_INK, align: 'right', d: 0.4 });
    ctx.fillStyle = hexA(C.accent, 0.08); rrect(qx + 16, y + 94, qw - 32, 142, 18); ctx.fill();
    queueRow(qx + 24, y + 110, qw - 48, t, { approvedT: approveT + 0.15 });
    const gp = prog(t, 71.10, 0.45);
    if (gp > 0) withAlpha(E.outExpo(gp), () => withT(qx + 32 + tagWidth('No guessing', TAG.amberOutline, { size: 18, h: 36, icon: ICON.shield, dot: false }) / 2, y + 284, popScale(gp), () => tag('No guessing', 0, 0, TAG.amberOutline, { align: 'center', size: 18, h: 36, icon: ICON.shield, dot: false })));
    text('A person confirms unclear fields', qx + 32, y + 340, { size: 18, weight: 500, color: MUTED });
    ctx.restore();
  });
  // review panel
  const px = 800, pw = 920;
  const pv = vis(t, 69.6, 1e9, 0.5);
  const rows = [['Customer name', SAM.name], ['Phone', PHONE], ['Address', null], ['Job type', JOB]];
  const r0 = y + 132, pitch = 76, vx = px + 252;
  const editT = 70.35, typeT0 = 70.55, typeT1 = 71.55;
  const bY = y + 470;
  const editW = chipWidth('Edit', { size: 21, pad: 22, icon: ICON.pencil, h: 52 });
  const approveX = px + 32 + editW + 16;
  const approveW = chipWidth('Approve', { size: 21, pad: 22, icon: ICON.check, h: 52 });
  withAlpha(pv.a, () => {
    ctx.save(); ctx.translate(slideX(pv), 0);
    card(px, y, pw, h, { r: 24, shadow: 1.3, label: 'review panel' });
    text(`${REF} · ${DOC_TYPE}`, px + 32, y + 52, { size: 23, weight: 700, color: INK });
    const ap = prog(t, approveT + 0.15, 0.45);
    if (ap <= 0) tag('Missing: Address', px + pw - 32, y + 52, TAG.amber, { align: 'right' });
    else withAlpha(E.outExpo(ap), () => withT(px + pw - 32 - tagWidth('Approved', TAG.green) / 2, y + 52, popScale(ap), () => tag('Approved', 0, 0, TAG.green, { align: 'center' })));
    ctx.fillStyle = 'rgba(17,24,39,0.07)'; ctx.fillRect(px + 32, y + 88, pw - 64, 1);
    rows.forEach(([lab, val], i) => {
      const ry = r0 + i * pitch;
      text(lab, px + 32, ry + 1, { size: 18, weight: 600, color: MUTED });
      if (val) { text(val, vx, ry + 1, { size: 21, weight: 600, color: INK }); return; }
      const editing = t >= editT;
      const bw = 540;
      if (!editing) { ctx.fillStyle = hexA(C.accent, 0.08); rrect(vx - 12, ry - 24, bw, 48, 12); ctx.fill(); dashed(vx - 12, ry - 24, bw, 48, 12, hexA(C.accent, 0.9), 2); text('Not found', vx + 4, ry + 1, { size: 19, weight: 500, color: '#9CA3AF' }); }
      else {
        ctx.fillStyle = '#FFFFFF'; rrect(vx - 12, ry - 24, bw, 48, 12); ctx.fill();
        ctx.strokeStyle = t < typeT1 + 0.2 ? hexA(B.primary, 0.8) : hexA(B.success, 0.7); ctx.lineWidth = 2; rrect(vx - 12, ry - 24, bw, 48, 12); ctx.stroke();
        const s = typed(ADDRESS, t, typeT0, typeT1);
        text(s, vx + 4, ry + 1, { size: 21, weight: 600, color: INK, maxW: bw - 60 });
        if (t < typeT1 + 0.3 && caretOn(t * 1.5)) { ctx.fillStyle = B.primary; ctx.fillRect(vx + 6 + measure(s, 21, 600), ry - 13, 2, 26); }
        checkBadge(vx + bw - 36, ry, 14, prog(t, typeT1 + 0.1, 0.6), B.success);
      }
    });
    // buttons
    const hvE = hoverAt(t, 70.1, 70.5), hvA = hoverAt(t, 71.95, 72.45);
    button('Edit', px + 32, bY, { kind: 'outline', color: B.primary, icon: ICON.pencil, press: pressScale(t, editT), hover: hvE });
    button('Approve', approveX, bY, { kind: 'filled', color: B.success, icon: ICON.check, press: pressScale(t, approveT), hover: hvA });
    ctx.restore();
  });
  ripple(px + 32 + editW / 2, bY, t, editT, B.primary);
  ripple(approveX + approveW / 2, bY, t, approveT, B.success);
  const cv = vis(t, 69.8, 73.1, 0.3, 0.3);
  const k = cursorAt(t, [{ t: 69.8, x: 1560, y: 800 }, { t: 70.28, x: px + 32 + editW / 2 + 6, y: bY + 6 }, { t: 70.5, x: px + 32 + editW / 2 + 6, y: bY + 6 }, { t: 70.9, x: px + pw - 60, y: r0 + 2 * pitch + 60 }, { t: 71.6, x: px + pw - 80, y: r0 + 2 * pitch + 70 }, { t: 72.12, x: approveX + approveW / 2 + 6, y: bY + 6 }]);
  cursor(k.x, k.y, pressAt(t, [editT, approveT]), cv.a);
}

// ======================================================================= 15 duplicate detected → logged and skipped
export function sDuplicate(t) {
  headline([['Handles', 73.83], ['duplicates', 74.25, AMBER_INK]], t);
  const y = 320;
  // incoming document (left)
  const ix = 200, iw = 620, ih = 260;
  const iv = vis(t, 74.25, 1e9, 0.5);
  withAlpha(iv.a, () => {
    ctx.save(); ctx.translate(-slideX(iv, 90), 0);
    card(ix, y, iw, ih, { r: 24, shadow: 1.2, label: 'incoming doc' });
    cardHeader(ix + 32, y + 52, 'Incoming', ICON.inbox, INK, AMBER_INK);
    const sp = prog(t, 77.0, 0.45);
    if (sp <= 0) tag('New', ix + iw - 32, y + 52, TAG.blue, { align: 'right' });
    else withAlpha(E.outExpo(sp), () => withT(ix + iw - 32 - tagWidth('Skipped', TAG.neutral) / 2, y + 52, popScale(sp), () => tag('Skipped', 0, 0, TAG.neutral, { align: 'center' })));
    fileTile(ix + 24, y + 100, iw - 48, 84, { name: FILE, sub: `Reference ID: ${REF}`, shadow: 0.4 });
    text('Second copy of the same form', ix + 32, y + 222, { size: 18, weight: 500, color: MUTED });
    ctx.restore();
  });
  // existing records (right)
  const rx = 900, rw = 820, rh = 260;
  const rv = vis(t, 73.6, 1e9, 0.5);
  withAlpha(rv.a, () => {
    ctx.save(); ctx.translate(slideX(rv), 0);
    card(rx, y, rw, rh, { r: 24, shadow: 1.2, label: 'records check' });
    cardHeader(rx + 32, y + 52, 'Intake records', ICON.db, INK, B.primary);
    const found = t >= 75.84;
    if (t >= 75.18 && !found) tag('Checking', rx + rw - 32, y + 52, TAG.blue, { align: 'right', icon: ICON.search, dot: false });
    if (found) { const p = prog(t, 75.84, 0.45); withAlpha(E.outExpo(p), () => withT(rx + rw - 32 - tagWidth('Match found', TAG.amber) / 2, y + 52, popScale(p), () => tag('Match found', 0, 0, TAG.amber, { align: 'center' }))); }
    const r1 = y + 132, r2 = y + 200;
    const hp = E.outExpo(prog(t, 75.84, 0.45));
    ctx.fillStyle = hexA(C.accent, 0.12 * hp); rrect(rx + 16, r1 - 28, rw - 32, 56, 12); ctx.fill();
    if (hp > 0) { ctx.strokeStyle = hexA(C.accent, 0.8 * hp); ctx.lineWidth = 2; rrect(rx + 16, r1 - 28, rw - 32, 56, 12); ctx.stroke(); }
    text(REF, rx + 40, r1 + 1, { size: 20, weight: 800, color: INK });
    text(SAM.name, rx + 180, r1 + 1, { size: 19, weight: 600, color: INK });
    text(JOB, rx + 380, r1 + 1, { size: 19, weight: 500, color: '#374151' });
    tag('Approved', rx + rw - 40, r1, TAG.green, { align: 'right', size: 16, h: 30, pad: 12 });
    skel(rx + 40, r2, 90, 11, 'rgba(17,24,39,0.08)'); skel(rx + 180, r2, 130, 11, 'rgba(17,24,39,0.08)'); skel(rx + 380, r2, 150, 11, 'rgba(17,24,39,0.08)');
    // scanning bar while checking
    const sp = prog(t, 75.18, 0.66);
    if (sp > 0 && sp < 1) { const bx = lerp(rx + 24, rx + rw - 40, E.inOutCubic(sp)); const g = ctx.createLinearGradient(bx - 60, 0, bx + 16, 0); g.addColorStop(0, hexA(B.primary, 0)); g.addColorStop(1, hexA(B.primary, 0.25)); ctx.fillStyle = g; ctx.fillRect(bx - 60, y + 96, 76, 140); }
    ctx.restore();
  });
  // banner
  const bp = prog(t, 76.35, 0.5);
  if (bp > 0) withAlpha(E.outExpo(bp), () => {
    const by = 690 + (1 - E.outExpo(bp)) * 16;
    ctx.fillStyle = hexA(C.accent, 0.16); rrect(200, by - 44, 1520, 88, 20); ctx.fill();
    ctx.strokeStyle = hexA(C.accent, 0.5); ctx.lineWidth = 1.5; rrect(200, by - 44, 1520, 88, 20); ctx.stroke();
    ICON.alert(248, by, 30, AMBER_INK);
    text('Duplicate detected', 284, by + 1, { size: 26, weight: 700, color: '#8A5300' });
    tag(REF, 284 + measure('Duplicate detected', 26, 700) + 20, by, TAG.amberOutline, { size: 17, h: 32, pad: 12 });
    const lp = prog(t, 76.8, 0.45);
    if (lp > 0) withAlpha(E.outExpo(lp), () => {
      const lw = measure('Logged and skipped', 22, 700);
      text('Logged and skipped', 1680, by + 1, { size: 22, weight: 700, color: INK, align: 'right' });
      checkBadge(1680 - lw - 30, by, 16, prog(t, 76.8, 0.6), B.success);
    });
  });
}

// ======================================================================= 16 audit log
const LOG = [['09:41:02', 'Received'], ['09:41:03', 'Saved'], ['09:41:05', 'Extracted'], ['09:41:06', 'Validated'], ['09:41:07', 'Written'], ['09:52:18', 'Reviewed']];
export function sAudit(t) {
  stepper(t, STEP_T, vis(t, 77.6, 1e9).a);
  headline([['Audit', 77.70, AMBER_INK], ['log', 78.03]], t);
  const x = 460, y = 300, w = 1000, h = 540;
  const v = vis(t, 77.6, 1e9, 0.5);
  withAlpha(v.a, () => {
    ctx.save(); ctx.translate(slideX(v), 0);
    card(x, y, w, h, { r: 24, shadow: 1.3, label: 'audit log' });
    cardHeader(x + 36, y + 54, 'Audit log', ICON.list, INK, AMBER_INK);
    tag(REF, x + w - 36, y + 54, TAG.neutral, { align: 'right' });
    ctx.fillStyle = 'rgba(17,24,39,0.07)'; ctx.fillRect(x + 36, y + 94, w - 72, 1);
    LOG.forEach(([tm, ev], i) => {
      const t0 = 77.95 + i * 0.33;
      if (t < t0) return;
      const ry = y + 136 + i * 64;
      const mp = E.outExpo(prog(t, 79.77 + i * 0.06, 0.35));
      const tw = measure(tm, 20, 600);
      if (mp > 0) { ctx.fillStyle = hexA(C.accent, 0.2 * mp); rrect(x + 44, ry - 17, (tw + 16) * mp, 34, 8); ctx.fill(); }
      text(tm, x + 52, ry + 1, { size: 20, weight: 600, color: '#4B5563' });
      const s = typed(ev, t, t0, t0 + 0.26);
      text(s, x + 230, ry + 1, { size: 22, weight: 700, color: INK });
      if (t < t0 + 0.3 && caretOn(t * 3)) { ctx.fillStyle = AMBER_INK; ctx.fillRect(x + 232 + measure(s, 22, 700), ry - 12, 2, 24); }
      checkBadge(x + w - 64, ry, 14, prog(t, t0 + 0.2, 0.5), B.success);
      if (i < LOG.length - 1) { ctx.fillStyle = 'rgba(17,24,39,0.05)'; ctx.fillRect(x + 36, ry + 32, w - 72, 1); }
    });
    ctx.restore();
  });
}

// ======================================================================= 17 safe failure: extraction unavailable
export function sFailure(t) {
  headline([['Alerts', 80.85], ['the', 81.15], ['owner', 81.30, AMBER_INK]], t);
  const x = 360, y = 300, w = 1200, h = 520;
  const v = vis(t, 80.5, 1e9, 0.5);
  const failT = 80.75;
  withAlpha(v.a, () => {
    ctx.save(); ctx.translate(slideX(v), 0);
    card(x, y, w, h, { r: 26, shadow: 1.3, label: 'workflow status' });
    cardHeader(x + 36, y + 56, 'Intake workflow', ICON.refresh, INK, AMBER_INK);
    const pp = prog(t, failT, 0.5);
    if (pp <= 0) tag('Running', x + w - 36, y + 56, TAG.green, { align: 'right' });
    else withAlpha(E.outExpo(pp), () => withT(x + w - 36 - tagWidth('Paused', TAG.amber) / 2, y + 56, popScale(pp), () => tag('Paused', 0, 0, TAG.amber, { align: 'center' })));
    const st = ['Save', 'Extract', 'Validate'];
    let sx = x + 36;
    st.forEach((s, i) => {
      const style = i === 0 ? TAG.green : i === 1 ? (pp > 0 ? TAG.amber : TAG.blue) : TAG.neutral;
      const o = { size: 18, h: 38, dot: i === 2 ? false : undefined };
      tag(s, sx, y + 132, style, o);
      sx += tagWidth(s, style, o) + 14;
    });
    if (pp > 0) withAlpha(E.outExpo(pp), () => {
      const yy = y + 222 + (1 - E.outExpo(pp)) * -14;
      ctx.fillStyle = hexA(C.accent, 0.16); rrect(x + 36, yy - 34, w - 72, 68, 16); ctx.fill();
      ICON.alert(x + 72, yy, 28, AMBER_INK);
      text('Extraction unavailable', x + 104, yy + 1, { size: 24, weight: 700, color: '#8A5300' });
      text('Nothing written', x + w - 60, yy + 1, { size: 19, weight: 600, color: '#8A5300', align: 'right' });
    });
    const rows = [['Owner alerted', ICON.bell, 81.30], ['Retry scheduled', ICON.clock, 82.62]];
    rows.forEach(([l, icon, tm], i) => {
      const p = prog(t, tm, 0.5); if (p <= 0) return;
      const ry = y + 326 + i * 88;
      withAlpha(E.outExpo(p), () => {
        ctx.save(); ctx.translate((1 - E.outExpo(p)) * 30, 0);
        ctx.fillStyle = 'rgba(17,24,39,0.03)'; rrect(x + 36, ry - 34, w - 72, 68, 16); ctx.fill();
        circle(x + 76, ry, 22, hexA(C.accent, 0.14)); icon(x + 76, ry, 24, AMBER_INK);
        text(l, x + 112, ry + 1, { size: 23, weight: 700, color: INK });
        checkBadge(x + w - 70, ry, 17, prog(t, tm + 0.1, 0.6), B.success);
        ctx.restore();
      });
    });
    ctx.restore();
  });
}

// ======================================================================= 18 original file linked to the record → verify instantly
export function sLinked(t) {
  headline([['Original', 84.42], ['file', 84.90], ['linked', 85.29, AMBER_INK]], t);
  const x = 200, y = 300, w = 1520, h = 230;
  const v = vis(t, 83.7, 1e9, 0.5);
  const ry = y + 162;
  const colX = (c) => x + 24 + COLW.slice(0, c).reduce((a, b) => a + b, 0);
  const linkT = 85.77, clickT = 87.93;
  withAlpha(v.a, () => {
    ctx.save(); ctx.translate(slideX(v), 0);
    card(x, y, w, h, { r: 24, shadow: 1.2, label: 'records table 2' });
    cardHeader(x + 32, y + 50, 'Intake records', ICON.db, INK, B.primary);
    tableFrame(x, y + 104, w, t);
    ctx.fillStyle = hexA(C.accent, 0.08); rrect(x + 16, ry - 28, w - 32, 56, 12); ctx.fill();
    const vals = [{ s: REF }, { s: SAM.name }, { s: JOB }, { tag: 'Approved', style: TAG.green }, { s: ASSIGNED }, null, { s: 'Address added in review', muted: true }];
    vals.forEach((val, c) => { if (val) cellValue(c, val, x, ry, t, 0, colX); });
    if (t < linkT) dashed(colX(5) + 6, ry - 20, COLW[5] - 12, 40, 10, hexA(C.accent, 0.8), 1.5);
    else {
      const lp = prog(t, linkT, 0.45);
      const hv = hoverAt(t, 87.6, 88.3);
      withT(colX(5) + 12, ry, popScale(lp) * pressScale(t, clickT) * (1 + 0.03 * hv), () => {
        ctx.fillStyle = hexA(B.primary, 0.1 + 0.08 * hv); rrect(-6, -18, COLW[5] - 12, 36, 10); ctx.fill();
        ICON.link(12, 0, 18, B.primary); text(FILE, 28, 1, { size: 16, weight: 600, color: '#3148C7', maxW: COLW[5] - 52 });
      });
    }
    ctx.restore();
  });
  // source file (original, as received)
  const sx = 200, sy = 580, sw = 700, sh = 110;
  const sv = vis(t, 84.42, 1e9, 0.5);
  withAlpha(sv.a, () => {
    ctx.save(); ctx.translate(-slideX(sv), 0);
    fileTile(sx, sy, sw, sh, { name: FILE, sub: 'Original file · Intake files', shadow: 1, size: 21 });
    checkBadge(sx + sw - 44, sy + sh / 2, 16, prog(t, linkT, 0.6), B.success);
    ctx.restore();
  });
  const fp = prog(t, 85.29, 0.5);
  if (fp > 0 && fp < 1) {
    const e = E.inOutCubic(fp);
    withT(lerp(sx + sw / 2, colX(5) + COLW[5] / 2, e), lerp(sy + sh / 2, ry, e) - Math.sin(Math.PI * e) * 40, lerp(1, 0.6, e), () => fileTile(-170, -30, 340, 60, { name: FILE, size: 16, shadow: 1.3 }));
  }
  // preview opens on click → verified
  const px = 960, py = 570, pw = 760, ph = 280;
  const pv = vis(t, clickT + 0.05, 1e9, 0.45);
  withAlpha(pv.a, () => withT(px + pw / 2, py + ph / 2, lerp(0.95, 1, pv.e), () => {
    ctx.translate(-(px + pw / 2), -(py + ph / 2));
    docPage(px, py, pw, ph, { title: DOC_TYPE, label: 'preview' });
    const vp = prog(t, 89.40, 0.45);
    if (vp > 0) withAlpha(E.outExpo(vp), () => withT(px + pw - 24 - tagWidth('Verified', TAG.green) / 2, py + 40, popScale(vp), () => tag('Verified', 0, 0, TAG.green, { align: 'center' })));
    docFields(px + 32, py + 112, pw - 64, t, { rows: [FIELDS[0], FIELDS[1], FIELDS[5]], pitch: 52, labelW: 210 });
  }));
  const cv = vis(t, 87.0, 89.2, 0.3, 0.3);
  const k = cursorAt(t, [{ t: 87.0, x: 1500, y: 720 }, { t: 87.85, x: colX(5) + 120, y: ry + 8 }, { t: 88.4, x: colX(5) + 120, y: ry + 8 }, { t: 89.1, x: 1640, y: 540 }]);
  cursor(k.x, k.y, pressAt(t, [clickT]), cv.a);
  ripple(colX(5) + 120, ry + 8, t, clickT, B.primary);
}

// ======================================================================= 19 outcome math (dark)
function darkCard(x, y, w, h, label) { card(x, y, w, h, { r: 24, fill: D.card, shadow: 1.4, shadowColor: 'rgba(0,0,0,0.35)', stroke: 'rgba(255,255,255,0.08)', label }); }
export function sOutcome(t) {
  headline([['Illustrative', 91.08, D.accent], ['estimate', 91.65]], t, { color: D.text });
  const lv = vis(t, 90.6, 1e9, 0.5);
  withAlpha(lv.a, () => {
    ctx.save(); ctx.translate(-slideX(lv), 0);
    const x = 200, y = 290, w = 700, h = 500;
    darkCard(x, y, w, h, 'assumptions card');
    text('Assumptions', x + 40, y + 56, { size: 26, weight: 700, color: D.text });
    chip('Illustrative assumptions', x + w - 36, y + 56, { align: 'right', size: 17, h: 36, pad: 14, bg: hexA(D.accent, 0.14), fg: D.accent });
    const rows = [['Manual:', '5 min/document', 94.95], ['Review:', '1 min/document', 98.19], ['Volume:', '300 documents/month', 102.42]];
    rows.forEach(([k, val, tm], i) => {
      const v = vis(t, tm, 1e9, 0.45); if (v.a <= 0) return;
      const ry = y + 150 + i * 96;
      withAlpha(v.a, () => {
        ctx.save(); ctx.translate(slideX(v, 30), 0);
        ctx.fillStyle = 'rgba(255,255,255,0.04)'; rrect(x + 36, ry - 36, w - 72, 72, 16); ctx.fill();
        const kw = text(k, x + 64, ry + 1, { size: 22, weight: 500, color: D.muted });
        text(val, x + 64 + kw + 12, ry + 1, { size: 28, weight: 700, color: D.text, maxW: w - 150 - kw });
        ctx.restore();
      });
    });
    ctx.restore();
  });
  const rv = vis(t, 90.8, 1e9, 0.5);
  withAlpha(rv.a, () => {
    ctx.save(); ctx.translate(slideX(rv), 0);
    const x = 980, y = 290, w = 740, h = 500;
    darkCard(x, y, w, h, 'estimate card');
    text('Estimate', x + 40, y + 56, { size: 26, weight: 700, color: D.text });
    const s1 = vis(t, 100.65, 1e9, 0.45);
    withAlpha(s1.a, () => withT(x + 40, y + 128 + s1.dy * 0.5, popScale(prog(t, 100.65, 0.5)), () => text('~4 min saved/document', 0, 0, { size: 40, weight: 800, color: D.success })));
    withAlpha(vis(t, 101.0, 1e9).a, () => text('5 min − 1 min = 4 min', x + 40, y + 176, { size: 19, weight: 500, color: D.muted }));
    withAlpha(vis(t, 104.3, 1e9).a, () => { ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x + 40, y + 208, w - 80, 1); });
    withAlpha(vis(t, 104.85, 1e9).a, () => text('4 min × 300 = 1,200 min', x + 40, y + 250, { size: 23, weight: 600, color: D.text }));
    withAlpha(vis(t, 107.1, 1e9).a, () => text('1,200 min ÷ 60 = 20 hours', x + 40, y + 292, { size: 23, weight: 600, color: D.text }));
    const bp = vis(t, 107.5, 1e9, 0.5);
    withAlpha(bp.a, () => {
      const bx = x + 32, by = y + 336, bw = w - 64, bh = 128;
      ctx.fillStyle = hexA(D.accent, 0.1); rrect(bx, by, bw, bh, 20); ctx.fill();
      const tilde = text('~', bx + 32, by + 58, { size: 56, weight: 800, color: D.accent });
      const nw = rollNumber(20 * E.outCubic(prog(t, 107.7, 0.8)), bx + 32 + tilde, by + 58, 56, D.accent, { weight: 800, digits: 2 });
      text(' hours/month', bx + 32 + tilde + nw, by + 58, { size: 40, weight: 800, color: D.accent });
      withAlpha(vis(t, 108.57, 1e9).a, () => text('(estimate)', bx + 36, by + 104, { size: 20, weight: 600, color: D.muted }));
    });
    ctx.restore();
  });
  const fv = vis(t, 110.67, 1e9, 0.45);
  withAlpha(fv.a, () => text('Based on assumptions · Not a guaranteed result', 960, 840, { size: 21, weight: 600, color: D.muted, align: 'center' }));
}

// ======================================================================= 20 trust stack
const TRUST = [['Independent portfolio prototype', 113.52], ['Fictional data', 116.01], ['Results vary', 117.18]];
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

// ======================================================================= 21 final headline + disclaimers
const DISCLAIMERS = ['Independent portfolio prototype', 'Fictional data', 'Illustrative assumptions', 'Results vary'];
export function sFinal(t) {
  wordsLine([['Faster', 118.92], ['intake.', 119.61, D.accent]], 960, 380, { size: 76, weight: 800, color: D.text });
  wordsLine([['Fewer', 120.30], ['mistakes.', 121.32, D.accent]], 960, 480, { size: 76, weight: 800, color: D.text });
  wordsLine([['A', 122.43], ['clear', 122.46], ['review', 122.76], ['process', 123.09], ['when', 123.69], ['something', 123.87], ['is', 124.26], ['unclear.', 124.41]], 960, 600, { size: 30, weight: 500, color: D.muted });
  const br = prog(t, 123.3, 0.6);
  withAlpha(E.outExpo(br) * 0.9, () => text(`${BIZ} · Document intake workflow`, 960, 690, { size: 20, weight: 600, color: D.muted, align: 'center' }));
  const o = { size: 18, h: 40, pad: 16, icon: ICON.check };
  const ws = DISCLAIMERS.map((l) => chipWidth(l, o));
  let x = 960 - (ws.reduce((a, b) => a + b, 0) + 16 * (DISCLAIMERS.length - 1)) / 2;
  DISCLAIMERS.forEach((l, i) => {
    const p = prog(t, 118.45 + i * 0.1, 0.5);
    const cx = x + ws[i] / 2; x += ws[i] + 16;
    if (p <= 0) return;
    withAlpha(E.outExpo(p), () => withT(cx, 812 + (1 - E.outExpo(p)) * 12, 1, () => {
      card(-ws[i] / 2, -20, ws[i], 40, { r: 20, fill: 'rgba(255,255,255,0.06)', shadow: 0, stroke: 'rgba(255,255,255,0.14)', label: l });
      ICON.check(-ws[i] / 2 + 16 + 10, 0, 20, D.success);
      text(l, -ws[i] / 2 + 16 + 30, 1, { size: 18, weight: 600, color: D.text });
    }));
  });
}
export function camFinal(t) { return { s: 1 + 0.03 * E.inOutCubic(prog(t, 118.5, 8)), fx: 960, fy: 540 }; }
