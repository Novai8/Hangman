// Section A (manual intake pain) + pivot. Times are seconds in the voiceover (data/captions.json).
import {
  ctx, PAL, E, clamp01, lerp, prog, vis, popScale, hexA, mixHex, text, measure, card, chip, chipWidth, ICON, skel, avatar,
  withAlpha, withT, rrect, sweep, checkBadge, cursor, ripple, cursorAt, pressAt, pressScale, wordsLine,
} from './lib.mjs';
import {
  BIZ, INBOX, DOC_TYPE, FILE, SAM, FIELDS, ASSIGNED, TAG, tag, tagWidth, headline, rollText, typed, caretOn, cardHeader,
  docPage, docFields, smudgeLine, fileTile, connector,
} from './components.mjs';

const A = PAL.A, B = PAL.B;
const INK = '#111827', MUTED = '#6B7280';
const circle = (x, y, r, fill) => { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };
const slideX = (v, d = 60) => (1 - v.e) * d;
const dashed = (x, y, w, h, r, col = 'rgba(17,24,39,0.22)', lw = 1.5) => { ctx.save(); ctx.setLineDash([6, 6]); ctx.strokeStyle = col; ctx.lineWidth = lw; rrect(x, y, w, h, r); ctx.stroke(); ctx.restore(); };
// skeleton label/value pair used by abstract documents
const skelRow = (x, y, lw, vw) => { skel(x, y, lw, 12, 'rgba(17,24,39,0.10)'); skel(x + lw + 40, y, vw, 12, 'rgba(17,24,39,0.16)'); };

// ======================================================================= 1 hook: documents, the hard way
export function sHook(t) {
  headline([['Documents,', 2.40], ['the', 3.27], ['hard', 3.39], ['way', 3.69, A.accent]], t);
  const docs = [
    { title: 'Invoice', dx: -370, rot: -0.09, tin: 0.30 },
    { title: 'Work order', dx: 370, rot: 0.09, tin: 0.78 },
    { title: DOC_TYPE, dx: 0, rot: 0, tin: 1.65 },
  ];
  docs.forEach((d) => {
    const p = prog(t, d.tin, 0.5); if (p <= 0) return;
    const e = E.outExpo(p);
    const w = 380, h = 440;
    withAlpha(e, () => {
      ctx.save(); ctx.translate(960 + d.dx, 555 + (1 - e) * 40); ctx.rotate(d.rot * e); ctx.scale(popScale(p), popScale(p));
      docPage(-w / 2, -h / 2, w, h, { title: d.title, label: 'hook doc ' + d.title });
      for (let i = 0; i < 6; i++) skelRow(-w / 2 + 28, -h / 2 + 110 + i * 50, 90 + (i % 3) * 14, 120 + ((i * 37) % 60));
      ctx.restore();
    });
  });
  const hp = prog(t, 2.07, 0.45);
  if (hp > 0) withAlpha(E.outExpo(hp), () => withT(960, 836, popScale(hp), () => tag('Handled by hand', 0, 0, TAG.warm, { align: 'center', icon: ICON.pencil, dot: false, size: 20, h: 40 })));
}

// ======================================================================= manual steps layer (header shared by scenes 2–3)
const MSTEPS = [['Open PDF', 7.02], ['Find fields', 7.86], ['Type into sheet', 9.57], ['Rename', 12.12], ['File away', 13.65]];
export function sManualSteps(t) {
  headline([['Manual', 4.5], ['intake', 4.62, A.accent]], t, { tout: 14.95 });
  headline([['It', 15.21], ['works,', 15.36], ['but', 16.05], ['it', 16.23], ['is', 16.32], ['slow', 16.41, A.warn]], t);
  const size = 19, h = 40, pad = 16, gap = 44;
  const ws = MSTEPS.map(([l]) => chipWidth(l, { size, h, pad, dot: true }));
  const total = ws.reduce((a, b) => a + b, 0) + gap * (MSTEPS.length - 1);
  let x = 960 - total / 2;
  let act = -1; MSTEPS.forEach(([, tm], i) => { if (t >= tm) act = i; });
  MSTEPS.forEach(([l, tm], i) => {
    const v = vis(t, 4.55 + i * 0.06, 1e9, 0.45);
    const on = i === act, done = i < act;
    const bg = on ? hexA(A.accent, 0.18) : done ? hexA(A.accent, 0.08) : 'rgba(17,24,39,0.05)';
    const fg = on ? '#A34A0E' : done ? '#A34A0E' : '#6B7280';
    const sc = on ? 1 + 0.05 * Math.sin(Math.PI * clamp01(prog(t, tm, 0.5))) : 1;
    withAlpha(v.a, () => withT(x + ws[i] / 2, 140 + v.dy * 0.4, sc, () => chip(l, 0, 0, { align: 'center', size, h, pad, bg, fg, dot: on || done ? A.accent : '#CBD5E1' })));
    if (i < MSTEPS.length - 1) withAlpha(v.a * 0.8, () => ICON.arrow(x + ws[i] + gap / 2, 140, 18, i < act ? A.accent : '#C4C8CF'));
    x += ws[i] + gap;
  });
}

// ======================================================================= 2 email with PDF attachment → open → find fields
export function sEmail(t) {
  const x = 200, y = 300, w = 680, h = 330;
  const ev = vis(t, 4.55, 1e9, 0.5);
  const attY = y + 240;
  withAlpha(ev.a, () => {
    ctx.save(); ctx.translate(-slideX(ev), 0);
    card(x, y, w, h, { r: 24, shadow: 1.2, label: 'email card' });
    ICON.inbox(x + 46, y + 46, 26, A.accent);
    text(INBOX, x + 72, y + 47, { size: 20, weight: 600, color: '#374151' });
    const np = prog(t, 4.89, 0.45);
    withAlpha(E.outExpo(np), () => withT(x + w - 32, y + 46, popScale(np), () => tag('New email', 0, 0, TAG.warm, { align: 'right' })));
    ctx.fillStyle = 'rgba(17,24,39,0.07)'; ctx.fillRect(x + 32, y + 84, w - 64, 1);
    avatar(x + 62, y + 134, 26, SAM.ini, SAM.color);
    text(SAM.name, x + 102, y + 122, { size: 22, weight: 700, color: INK });
    text(SAM.email, x + 102, y + 150, { size: 18, weight: 500, color: MUTED });
    text(DOC_TYPE, x + 32, y + 204, { size: 21, weight: 600, color: '#374151' });
    // attachment tile: pops in on "PDF", snap-focus on click
    const ap = prog(t, 5.61, 0.5);
    if (ap > 0) {
      const tw = 420, th = 60;
      const snap = t >= 7.02 ? 1 + 0.05 * (1 - E.outCubic(prog(t, 7.02, 0.55))) : 1;
      const s = popScale(ap) * pressScale(t, 7.0) * snap;
      const focus = E.outExpo(prog(t, 7.02, 0.3));
      withAlpha(E.outExpo(ap), () => withT(x + 32 + tw / 2, attY + th / 2, s, () => {
        fileTile(-tw / 2, -th / 2, tw, th, { name: FILE, border: focus > 0 ? hexA(A.accent, 0.4 + 0.5 * focus) : null, shadow: 0.5 + 0.6 * focus });
        sweep(-tw / 2, -th / 2, tw, th, 14, prog(t, 6.75, 0.5));
      }));
      ripple(x + 32 + tw / 2, attY + th / 2, t, 7.02, A.accent);
    }
    ctx.restore();
  });
  // PDF viewer (opens on click)
  const dx = 940, dy = 300, dw = 780, dh = 500;
  const dv = vis(t, 7.1, 1e9, 0.5);
  withAlpha(dv.a, () => withT(dx + dw / 2, dy + dh / 2, lerp(0.96, 1, dv.e), () => {
    ctx.translate(-(dx + dw / 2), -(dy + dh / 2));
    docPage(dx, dy, dw, dh, { title: DOC_TYPE, label: 'pdf viewer' });
    tag(FILE, dx + dw - 24, dy + 40, TAG.neutral, { align: 'right', size: 16, h: 30, pad: 12 });
    const hl = FIELDS.map((f, i) => (f[0] === 'Address' ? null : 7.9 + i * 0.16));
    docFields(dx + 32, dy + 112, dw - 64, t, { hl, hlColor: hexA(A.accent, 0.22), pitch: 54, labelW: 210 });
  }));
  // cursor: click attachment, then scan the fields
  const cv = vis(t, 6.25, 9.1, 0.3, 0.3);
  const k = cursorAt(t, [{ t: 6.3, x: 700, y: 780 }, { t: 6.95, x: x + 250, y: attY + 34 }, { t: 7.45, x: x + 250, y: attY + 34 }, { t: 7.9, x: dx + 470, y: dy + 120 }, { t: 9.0, x: dx + 520, y: dy + 440 }]);
  cursor(k.x, k.y, pressAt(t, [7.02]), cv.a);
}

// ======================================================================= 3 type into sheet → rename → file away → slow + mistakes
const SHEET = { x: 880, y: 300, w: 840, h: 330, cols: [180, 170, 272, 170], heads: ['Customer name', 'Phone', 'Address', 'Job type'] };
const COPY = [ // [field index in FIELDS, sheet column, start time]
  [1, 0, 9.75], [3, 1, 10.45], [5, 3, 11.15],
];
export function sSheet(t) {
  // source document (left)
  const dx = 200, dy = 300, dw = 640, dh = 500;
  const dv = vis(t, 9.3, 1e9, 0.5);
  const pitch = 54, labelW = 200, fx = dx + 32, fy = dy + 112;
  withAlpha(dv.a, () => {
    docPage(dx, dy, dw, dh, { title: DOC_TYPE, label: 'source doc' });
    const hl = FIELDS.map(() => null); COPY.forEach(([fi, , tm]) => { hl[fi] = tm; });
    docFields(fx, fy, dw - 64, t, { hl, hlColor: hexA(A.accent, 0.22), pitch, labelW });
  });
  // sheet (right)
  const { x, y, w, h, cols, heads } = SHEET;
  const sv = vis(t, 9.45, 1e9, 0.5);
  const colX = (c) => x + 24 + cols.slice(0, c).reduce((a, b) => a + b, 0);
  const rowY = y + 262;
  withAlpha(sv.a, () => {
    ctx.save(); ctx.translate(slideX(sv), 0);
    card(x, y, w, h, { r: 24, shadow: 1.2, label: 'intake sheet' });
    cardHeader(x + 32, y + 50, 'Intake sheet', ICON.list, INK, A.accent);
    // header tags: Works / Slow
    const wp = prog(t, 15.36, 0.45), sp = prog(t, 16.41, 0.45);
    const worksW = tagWidth('Works', TAG.green);
    if (wp > 0) withAlpha(E.outExpo(wp), () => withT(x + w - 32 - worksW / 2, y + 50, popScale(wp), () => tag('Works', 0, 0, TAG.green, { align: 'center' })));
    if (sp > 0) withAlpha(E.outExpo(sp), () => withT(x + w - 32 - worksW - 12 - tagWidth('Slow', TAG.warn, { icon: ICON.clock, dot: false }) / 2, y + 50, popScale(sp), () => tag('Slow', 0, 0, TAG.warn, { align: 'center', icon: ICON.clock, dot: false })));
    heads.forEach((hd, c) => text(hd, colX(c) + 12, y + 104, { size: 16, weight: 700, color: MUTED, maxW: cols[c] - 20 }));
    ctx.fillStyle = 'rgba(17,24,39,0.08)'; ctx.fillRect(x + 24, y + 128, w - 48, 1);
    [y + 156, y + 208].forEach((ry) => {
      cols.forEach((cw, c) => skel(colX(c) + 12, ry, cw * 0.55, 11, 'rgba(17,24,39,0.09)'));
      ctx.fillStyle = 'rgba(17,24,39,0.05)'; ctx.fillRect(x + 24, ry + 26, w - 48, 1);
    });
    // new row
    ctx.fillStyle = hexA(A.accent, 0.07 * E.outExpo(prog(t, 9.6, 0.4))); rrect(x + 16, rowY - 26, w - 32, 52, 12); ctx.fill();
    COPY.forEach(([fi, c, tm]) => {
      const val = FIELDS[fi][1];
      const clickT = tm + 0.3;
      if (t >= clickT - 0.02 && t < clickT + 0.9) { ctx.strokeStyle = hexA(A.accent, 0.7); ctx.lineWidth = 2; rrect(colX(c) + 4, rowY - 22, cols[c] - 8, 44, 8); ctx.stroke(); }
      const s = typed(val, t, tm + 0.35, tm + 0.7);
      if (s) text(s, colX(c) + 12, rowY + 1, { size: 16, weight: 600, color: INK, maxW: cols[c] - 20 });
      if (t > tm + 0.35 && t < tm + 0.85 && caretOn(t * 3)) { const cw2 = measure(s, 16, 600); ctx.fillStyle = A.accent; ctx.fillRect(colX(c) + 13 + cw2, rowY - 11, 2, 22); }
    });
    // mistake: the unreadable Address was skipped
    const mp = prog(t, 17.52, 0.45);
    if (mp > 0) withAlpha(E.outExpo(mp), () => {
      dashed(colX(2) + 4, rowY - 22, cols[2] - 8, 44, 8, hexA(A.warn, 0.8), 2);
      withT(colX(2) + cols[2] / 2, rowY, popScale(mp), () => tag('Missed field', 0, 0, TAG.warn, { align: 'center', size: 15, h: 28, pad: 10 }));
    });
    ctx.restore();
  });
  // rename: "Save as" card types the file name
  const rx = 880, ry = 660, rw = 560, rh = 136;
  const rv = vis(t, 12.12, 13.65, 0.45, 0.25);
  withAlpha(rv.a, () => {
    ctx.save(); ctx.translate(slideX(rv, 40), 0);
    card(rx, ry, rw, rh, { r: 20, shadow: 1, label: 'save as' });
    ICON.pencil(rx + 38, ry + 36, 22, A.accent);
    text('File name', rx + 60, ry + 37, { size: 17, weight: 600, color: MUTED });
    ctx.fillStyle = 'rgba(17,24,39,0.04)'; rrect(rx + 24, ry + 64, rw - 48, 48, 12); ctx.fill();
    ctx.strokeStyle = hexA(A.accent, 0.6); ctx.lineWidth = 2; rrect(rx + 24, ry + 64, rw - 48, 48, 12); ctx.stroke();
    const s = typed(FILE, t, 12.3, 13.35);
    text(s, rx + 42, ry + 89, { size: 19, weight: 600, color: INK, maxW: rw - 84 });
    if (caretOn(t * 1.5)) { ctx.fillStyle = A.accent; ctx.fillRect(rx + 44 + measure(s, 19, 600), ry + 76, 2, 26); }
    ctx.restore();
  });
  // file away: file flies into the folder
  const fx0 = 1480, fy0 = 660, fw = 240, fh = 136;
  const fv = vis(t, 12.3, 1e9, 0.5);
  withAlpha(fv.a, () => {
    ctx.save(); ctx.translate(slideX(fv, 40), 0);
    const bump = 1 + 0.05 * Math.sin(Math.PI * prog(t, 14.1, 0.35));
    withT(fx0 + fw / 2, fy0 + fh / 2, bump, () => {
      card(-fw / 2, -fh / 2, fw, fh, { r: 20, shadow: 1, label: 'folder' });
      ICON.folder(0, -18, 46, A.accent);
      text('Customer files', 0, 38, { size: 18, weight: 700, color: INK, align: 'center' });
    });
    checkBadge(fx0 + fw - 30, fy0 + 30, 15, prog(t, 14.37, 0.6), B.success);
    ctx.restore();
  });
  const fp = prog(t, 13.65, 0.5);
  if (fp > 0 && fp < 1) {
    const e = E.inOutCubic(fp);
    const sx = lerp(rx + rw / 2, fx0 + fw / 2, e), sy = lerp(ry + rh / 2, fy0 + fh / 2, e) - Math.sin(Math.PI * e) * 60;
    withT(sx, sy, lerp(1, 0.45, e), () => fileTile(-150, -28, 300, 56, { name: FILE, size: 15, shadow: 1 }), 1 - 0.6 * e);
  }
  // cursor: copy value → click cell → type (zig-zag between document and sheet)
  const keys = [{ t: 9.45, x: 760, y: 800 }];
  COPY.forEach(([fi, c, tm]) => {
    const vy = fy + fi * pitch, vx = fx + labelW + 60;
    keys.push({ t: tm - 0.05, x: vx, y: vy + 6 }, { t: tm + 0.3, x: colX(c) + 40, y: rowY + 8 }, { t: tm + 0.62, x: colX(c) + 40, y: rowY + 8 });
  });
  keys.push({ t: 12.4, x: 1180, y: 760 }, { t: 13.5, x: 1300, y: 780 });
  const cv = vis(t, 9.45, 13.6, 0.3, 0.3);
  const k = cursorAt(t, keys);
  cursor(k.x, k.y, pressAt(t, COPY.map((c) => c[2] + 0.3)), cv.a);
  COPY.forEach(([, c, tm]) => ripple(colX(c) + 40, rowY + 8, t, tm + 0.3, A.accent));
}

// ======================================================================= 4 documents are not consistent
export function sInconsistent(t) {
  headline([['Documents', 19.68], ['are', 20.16], ['not', 20.34], ['consistent', 20.64, A.accent]], t);
  const forms = [
    { x: 260, tin: 18.95, label: 'Layout A', addrRow: 0, hl: 22.62 },
    { x: 1140, tin: 19.25, label: 'Layout B', addrRow: 5, hl: 24.78 },
  ];
  const w = 520, y = 300, h = 520, pitch = 64, r0 = y + 116;
  const addrY = (f) => r0 + f.addrRow * pitch;
  forms.forEach((f, fi) => {
    const v = vis(t, f.tin, 1e9, 0.5);
    withAlpha(v.a, () => {
      ctx.save(); ctx.translate(fi === 0 ? -slideX(v) : slideX(v), 0);
      docPage(f.x, y, w, h, { title: DOC_TYPE, label: 'form ' + f.label });
      tag(f.label, f.x + w - 24, y + 40, TAG.neutral, { align: 'right', size: 15, h: 28, pad: 10 });
      for (let i = 0; i < 6; i++) {
        const ry = r0 + i * pitch;
        if (i === f.addrRow) {
          const p = E.outExpo(prog(t, f.hl, 0.45));
          if (p > 0) { ctx.fillStyle = hexA(A.accent, 0.12 * p); rrect(f.x + 16, ry - 26, w - 32, 52, 12); ctx.fill(); ctx.strokeStyle = hexA(A.accent, 0.7 * p); ctx.lineWidth = 2; rrect(f.x + 16, ry - 26, w - 32, 52, 12); ctx.stroke(); }
          text('Address', f.x + 32, ry + 1, { size: 18, weight: 700, color: p > 0.5 ? '#A34A0E' : '#374151' });
          skel(f.x + 172, ry, 220, 12, 'rgba(17,24,39,0.16)');
        } else skelRow(f.x + 32, ry, 100 + ((i * 23) % 40), 150 + ((i * 41) % 90));
      }
      ctx.restore();
    });
  });
  const cp = prog(t, 24.95, 0.5);
  connector(forms[0].x + w - 16, addrY(forms[0]), forms[1].x + 16, addrY(forms[1]), cp, hexA(A.accent, 0.8));
  const tp = prog(t, 25.2, 0.45);
  if (tp > 0) withAlpha(E.outExpo(tp), () => withT(960, (addrY(forms[0]) + addrY(forms[1])) / 2, popScale(tp), () => tag('Different place', 0, 0, TAG.warm, { align: 'center', size: 17, h: 34 })));
}

// ======================================================================= 5 same vendor, different formats
const VENDORS = ['Harbor Parts Co.', 'HARBOR PARTS CO', 'Harbor Parts Company'];
export function sFormats(t) {
  headline([['Same', 26.58], ['vendor,', 27.00], ['different', 28.50], ['formats', 28.80, A.accent]], t);
  const x = 520, w = 880, h = 104;
  const tins = [25.77, 26.34, 27.27];
  VENDORS.forEach((vn, i) => {
    const y = 300 + i * 124;
    const p = prog(t, tins[i], 0.5); if (p <= 0) return;
    withAlpha(E.outExpo(p), () => withT(x + w / 2, y + h / 2 + (1 - E.outExpo(p)) * 20, popScale(p), () => {
      ctx.translate(-(x + w / 2), -(y + h / 2));
      card(x, y, w, h, { r: 20, shadow: 1, label: 'invoice ' + i });
      ctx.fillStyle = hexA('#EF5B5B', 0.12); rrect(x + 24, y + 37, 52, 30, 8); ctx.fill();
      text('PDF', x + 50, y + 53, { size: 15, weight: 700, color: '#B42323', align: 'center', qa: false });
      text('Invoice', x + 100, y + 34, { size: 16, weight: 600, color: MUTED });
      const vw = measure(vn, 26, 700);
      const mp = E.outExpo(prog(t, 27.0 + i * 0.12, 0.4));
      if (mp > 0) { ctx.fillStyle = hexA(A.accent, 0.2); rrect(x + 96, y + 52, (vw + 10) * mp, 38, 8); ctx.fill(); }
      text(vn, x + 100, y + 71, { size: 26, weight: 700, color: INK });
      skel(x + w - 250, y + 40, 200, 12); skel(x + w - 190, y + 66, 140, 12);
    }));
  });
  const tp = prog(t, 28.8, 0.45);
  if (tp > 0) withAlpha(E.outExpo(tp), () => withT(960, 718, popScale(tp), () => tag('1 vendor · 3 formats', 0, 0, TAG.warm, { align: 'center', size: 20, h: 40 })));
}

// ======================================================================= 6 missing or hard to read → detective work
export function sMissing(t) {
  headline([['Missing', 31.11, A.warn], ['or', 31.86], ['hard', 31.98], ['to', 32.28], ['read', 32.34]], t);
  const x = 200, y = 300, w = 700, h = 520;
  const rows = ['Customer name', 'Phone', 'Address', 'Job type', 'Preferred date'];
  const r0 = y + 124, pitch = 76;
  const v = vis(t, 29.6, 1e9, 0.5);
  withAlpha(v.a, () => {
    ctx.save(); ctx.translate(-slideX(v), 0);
    docPage(x, y, w, h, { title: DOC_TYPE, label: 'missing doc' });
    rows.forEach((lab, i) => {
      const ry = r0 + i * pitch;
      text(lab, x + 32, ry + 1, { size: 18, weight: 600, color: '#374151' });
      const vx = x + 240;
      if (lab === 'Phone') {
        const p = prog(t, 31.11, 0.45);
        dashed(vx, ry - 20, 220, 40, 10, p > 0 ? hexA(A.warn, 0.4 + 0.5 * E.outExpo(p)) : 'rgba(17,24,39,0.18)', p > 0 ? 2 : 1.5);
        if (p > 0) withAlpha(E.outExpo(p), () => withT(vx + 240 + tagWidth('Missing', TAG.warn) / 2, ry, popScale(p), () => tag('Missing', 0, 0, TAG.warn, { align: 'center' })));
      } else if (lab === 'Address') {
        smudgeLine(vx + 6, ry, 200);
        const p = prog(t, 32.34, 0.45);
        if (p > 0) withAlpha(E.outExpo(p), () => withT(vx + 240 + tagWidth('Hard to read', TAG.amber) / 2, ry, popScale(p), () => tag('Hard to read', 0, 0, TAG.amber, { align: 'center' })));
      } else skel(vx + 6, ry, 150 + ((i * 29) % 50), 12, 'rgba(17,24,39,0.16)');
    });
    ctx.restore();
  });
  // magnifier sweeping the document ("detective work")
  const mv = vis(t, 35.8, 38.0, 0.35, 0.25);
  if (mv.a > 0) {
    const k = cursorAt(t, [{ t: 35.8, x: x + 520, y: r0 + 10 }, { t: 36.5, x: x + 360, y: r0 + pitch * 1.3 }, { t: 37.2, x: x + 470, y: r0 + pitch * 2.2 }, { t: 37.9, x: x + 330, y: r0 + pitch * 3.1 }]);
    withAlpha(mv.a, () => {
      ctx.save(); ctx.strokeStyle = A.accent; ctx.lineWidth = 5; ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath(); ctx.arc(k.x, k.y, 44, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.lineCap = 'round'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(k.x + 32, k.y + 32); ctx.lineTo(k.x + 62, k.y + 62); ctx.stroke(); ctx.restore();
    });
  }
  // manual check panel (right)
  const px = 980, pw = 740;
  const pv = vis(t, 30.0, 1e9, 0.5);
  withAlpha(pv.a, () => {
    ctx.save(); ctx.translate(slideX(pv), 0);
    card(px, y, pw, h, { r: 24, shadow: 1.2, label: 'manual check' });
    cardHeader(px + 32, y + 52, 'Manual check', ICON.search, INK, A.accent);
    const p1 = vis(t, 33.3, 1e9, 0.45);
    withAlpha(p1.a, () => {
      ctx.save(); ctx.translate(slideX(p1, 30), 0);
      ctx.fillStyle = 'rgba(17,24,39,0.03)'; rrect(px + 24, y + 104, pw - 48, 80, 16); ctx.fill();
      circle(px + 72, y + 144, 24, hexA(A.accent, 0.14)); ICON.user(px + 72, y + 144, 28, A.accent);
      text(ASSIGNED, px + 112, y + 134, { size: 22, weight: 700, color: INK });
      text('Doing intake by hand', px + 112, y + 162, { size: 17, weight: 500, color: MUTED });
      ctx.restore();
    });
    const p2 = prog(t, 35.91, 0.45);
    if (p2 > 0) withAlpha(E.outExpo(p2), () => withT(px + 32 + chipWidth('Detective work', { size: 20, h: 42, pad: 16, icon: ICON.search }) / 2, y + 236, popScale(p2), () => chip('Detective work', 0, 0, { align: 'center', size: 20, h: 42, pad: 16, bg: hexA(A.accent, 0.14), fg: '#A34A0E', icon: ICON.search })));
    for (let i = 0; i < 6; i++) {
      const tin = 36.84 + i * 0.13;
      const p = prog(t, tin, 0.4); if (p <= 0) continue;
      const tx = px + 32 + i * 116, ty = y + 300;
      withAlpha(E.outExpo(p), () => withT(tx + 50, ty + 56, popScale(p), () => {
        card(-50, -56, 100, 112, { r: 14, shadow: 0.6, label: 'file tile' });
        ctx.fillStyle = hexA('#EF5B5B', 0.12); rrect(-22, -40, 44, 24, 6); ctx.fill();
        text('PDF', 0, -27, { size: 12, weight: 700, color: '#B42323', align: 'center', qa: false });
        skel(-30, 0, 60, 8); skel(-30, 18, 44, 8);
        circle(34, -40, 15, A.accent); ICON.search(34, -40, 17, '#FFFFFF');
      }));
    }
    const lp = prog(t, 37.23, 0.45);
    if (lp > 0) withAlpha(E.outExpo(lp), () => text('Every file, one by one', px + 32, y + 460, { size: 20, weight: 600, color: MUTED }));
    ctx.restore();
  });
}

// ======================================================================= 7 costs show up
export function sCosts(t) {
  headline([['Costs', 38.76, A.accent], ['show', 39.17], ['up', 39.48]], t);
  const items = [
    { title: 'Data entry errors', icon: ICON.pencil, tin: 40.71, chips: [['Follow-ups', ICON.mail, 41.46], ['Rework', ICON.refresh, 42.51]] },
    { title: 'Missing fields', icon: ICON.doc, tin: 43.47, chips: [['Delayed processing', ICON.clock, 44.31]] },
    { title: 'Duplicates', icon: ICON.copy, tin: 45.84, chips: [['Duplicate records', ICON.copy, 46.35]] },
  ];
  const xs = [200, 716, 1232], w = 488, y = 320, h = 330;
  items.forEach((it, i) => {
    const p = prog(t, it.tin, 0.5); if (p <= 0) return;
    const x = xs[i];
    withAlpha(E.outExpo(p), () => withT(x + w / 2, y + h / 2 + (1 - E.outExpo(p)) * 24, popScale(p), () => {
      ctx.translate(-(x + w / 2), -(y + h / 2));
      card(x, y, w, h, { r: 24, shadow: 1.2, label: it.title });
      circle(x + 64, y + 72, 32, hexA(A.warn, 0.12)); it.icon(x + 64, y + 72, 30, A.warn);
      text(it.title, x + 36, y + 150, { size: 28, weight: 700, color: INK, maxW: w - 72 });
      it.chips.forEach(([l, ic, tm], k) => {
        const cp = prog(t, tm, 0.45); if (cp <= 0) return;
        const cw = chipWidth(l, { size: 19, h: 40, pad: 16, icon: ic });
        withAlpha(E.outExpo(cp), () => withT(x + 36 + cw / 2, y + 222 + k * 56, popScale(cp), () => chip(l, 0, 0, { align: 'center', size: 19, h: 40, pad: 16, bg: hexA(A.warn, 0.1), fg: '#B42323', icon: ic })));
      });
    }));
  });
}

// ======================================================================= 8 backlog grows (Queue: 12 → 38 → 61)
export function sBacklog(t) {
  const ev = vis(t, 47.85, 1e9);
  withAlpha(ev.a, () => chip('As volume increases', 960, 140 + ev.dy * 0.6, { align: 'center', size: 22, h: 44, bg: 'rgba(17,24,39,0.05)', fg: '#374151', dot: A.accent }));
  headline([['The', 49.62], ['backlog', 49.74, A.warn], ['grows', 50.47]], t);
  const x = 360, y = 300, w = 1200, h = 500;
  const v = vis(t, 47.85, 1e9, 0.5);
  const seq = [[48.18, 12], [48.66, 38], [50.47, 61]];
  let n = 0; seq.forEach(([tm, c]) => { if (t >= tm) n = c; });
  const heat = E.inOutCubic(prog(t, 50.47, 0.8));
  withAlpha(v.a, () => {
    ctx.save(); ctx.translate(slideX(v), 0);
    card(x, y, w, h, { r: 28, shadow: 1.3, label: 'queue card' });
    cardHeader(x + 48, y + 64, 'Queue', ICON.inbox, INK, A.accent, 26);
    rollText(seq.map(([tm, c]) => ({ t: tm, s: String(c) })), t, x + 48, y + 230, { size: 150, color: mixHex(INK, A.warn, heat * 0.85) });
    text('documents waiting', x + 52, y + 340, { size: 24, weight: 500, color: MUTED });
    const tp = prog(t, 50.8, 0.45);
    if (tp > 0) withAlpha(E.outExpo(tp), () => withT(x + 48, y + 420, popScale(tp), () => tag('12 → 38 → 61', 0, 0, TAG.warn, { size: 22, h: 44, pad: 18 })));
    // document tiles pile up (count matches the counter)
    const gx = x + 640, gy = y + 120, cols = 11;
    for (let i = 0; i < 61; i++) {
      const band = i < 12 ? 48.18 : i < 38 ? 48.66 : 50.47;
      const base = i < 12 ? 0 : i < 38 ? 12 : 38;
      const p = prog(t, band + (i - base) * 0.012, 0.3); if (p <= 0) continue;
      const cx = gx + (i % cols) * 44, cy = gy + Math.floor(i / cols) * 54;
      withAlpha(E.outExpo(p), () => withT(cx + 16, cy + 20, popScale(p), () => {
        ctx.fillStyle = i >= 38 ? mixHex('#FFFFFF', '#FDECEC', heat) : '#FFFFFF';
        ctx.strokeStyle = i >= 38 ? hexA(A.warn, 0.35) : 'rgba(17,24,39,0.14)'; ctx.lineWidth = 1.5;
        rrect(-16, -20, 32, 40, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(17,24,39,0.14)'; ctx.fillRect(-9, -8, 18, 3); ctx.fillRect(-9, 0, 14, 3); ctx.fillRect(-9, 8, 16, 3);
      }));
    }
    ctx.restore();
  });
}
export function camBacklog(t) { return { s: 1 + 0.035 * E.inOutCubic(prog(t, 49.6, 1.6)), fx: 960, fy: 560 }; }

// ======================================================================= 9 pivot title card
export function sPivot(t) {
  const p = prog(t, 51.95, 0.6);
  const s = 'Document intake workflow';
  withAlpha(E.outExpo(p), () => {
    text(s, 960, 520 + (1 - E.outExpo(p)) * 16, { size: 64, weight: 700, color: INK, align: 'center' });
    const lw = measure(s, 64, 700);
    const lp = E.outExpo(prog(t, 52.4, 0.7));
    const g = ctx.createLinearGradient(960 - lw / 2, 0, 960 + lw / 2, 0); g.addColorStop(0, B.primary); g.addColorStop(1, B.secondary);
    ctx.fillStyle = g; rrect(960 - (lw / 2) * lp, 580, lw * lp, 6, 3); ctx.fill();
  });
}
