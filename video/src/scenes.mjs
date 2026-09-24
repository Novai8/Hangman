// Scene timeline. All times are seconds in the voiceover (word timings from data/captions.json).
import {
  ctx, PAL, E, QA, clamp01, lerp, prog, vis, popScale, hexA, mixHex, text, measure, card, chip, chipWidth, ICON, avatar, skel,
  withAlpha, withT, rrect, sweep, checkBadge, cursor, ripple, cursorAt, pressAt, hoverAt, pressScale, font, wrap, wordsLine,
} from './lib.mjs';
import {
  HEAD_Y, EYEBROW_Y, CUST, CATEGORIES, KB, LINKS, TAG, tag, tagWidth, headline, eyebrow, marker, appWindow, emailRow,
  button, rollText, typed, caretOn, connector, cardHeader,
} from './components.mjs';

const A = PAL.A, B = PAL.B, C = PAL.C, D = PAL.D;
const INK = '#111827', MUTED = '#6B7280';

// ======================================================================= S1+S2 hook / repetition
function sHook(t) {
  // eyebrows
  eyebrow('Quick question', t, 0.06, 11.9, { dot: A.accent });
  eyebrow('Support matters', t, 12.03, 16.0, { dot: A.accent });
  // headline 1 — every word lands as it is spoken
  const w1 = headline([['How', 1.17], ['much', 1.41], ['of', 1.62], ['your', 1.71], ['day', 1.83], ['disappears?', 2.16]], t, { tout: 11.85 });
  {
    // underline marker under "disappears?"
    font(52, 700); const full = ctx.measureText('How much of your day disappears?').width; const dw = ctx.measureText('disappears?').width;
    const x1 = 960 + full / 2, x0 = x1 - dw; const v = vis(t, 2.4, 11.85);
    withAlpha(v.a, () => { ctx.fillStyle = hexA(A.accent, 0.55); rrect(x0, HEAD_Y + 30, dw * E.outExpo(prog(t, 2.4, 0.6)), 7, 3.5); ctx.fill(); });
  }
  headline([['Repetitive', 13.50], ['parts', 14.07], ['take', 15.03], ['over', 15.36]], t, { tout: 16.0 });

  // ---- inbox window (answering the same customer emails over and over)
  const win = vis(t, 2.97, 11.8, 0.5, 0.35);
  const recede = E.inOutCubic(prog(t, 6.45, 0.6)); // depth push-back when chips arrive
  if (win.a > 0) {
    const s = lerp(1, 0.94, recede);
    withT(960, 575 + win.dy, s, () => {
      ctx.translate(-960, -575);
      const x = 460, y = 330, w = 1000, h = 500;
      appWindow(x, y, w, h, 'Northwind Goods · Support inbox');
      const rows = [
        [CUST.sam, 2.97, false], [CUST.taylor, 3.33, false], [CUST.morgan, 3.87, false],
        [CUST.sam, 5.13, true], [CUST.taylor, 5.46, true], [CUST.morgan, 5.62, true],
      ];
      rows.forEach(([c, tin, rep], i) => {
        const v = vis(t, tin, 1e9, 0.45);
        if (v.a <= 0) return;
        const ry = y + 70 + i * 71;
        withAlpha(v.a, () => {
          ctx.save(); ctx.translate(0, v.dy);
          emailRow(x + 12, ry, w - 24, 70, c, {
            unnamed: rep,
            tagInfo: rep ? { label: 'Repeat', style: TAG.warm, a: E.outExpo(prog(t, tin + 0.15, 0.4)), s: popScale(prog(t, tin + 0.15, 0.5)) } : null,
          });
          if (i < rows.length - 1) { ctx.fillStyle = 'rgba(17,24,39,0.05)'; ctx.fillRect(x + 24, ry + 70, w - 48, 1); }
          ctx.restore();
        });
      });
    }, win.a * lerp(1, 0.12, recede));
  }

  // ---- question chips (hook) → move to left column at "Support matters"
  const chips = [['Where is my order?', 6.84, 880, 450], ['Change my address', 8.13, 1030, 555], ['Reset password', 9.93, 930, 660]];
  const mv = E.outExpo(prog(t, 12.03, 0.7));
  chips.forEach(([label, tin, cx, cy], i) => {
    const p = prog(t, tin, 0.5); if (p <= 0) return;
    const out = vis(t, 0, 16.0, 0.01, 0.3);
    const fs = 32, h = 78;
    const w = chipWidth(label, { size: fs, h, pad: 26, icon: ICON.mail });
    // final left-column position (left aligned at 230, scale .82)
    const sc = lerp(1, 0.82, mv);
    const fx = 230 + (w * 0.82) / 2, fy = 440 + i * 100;
    const x = lerp(cx, fx, mv), y = lerp(cy + (1 - E.outExpo(p)) * 40, fy, mv);
    withT(x, y, sc * popScale(p), () => {
      chip(label, 0, 0, { align: 'center', size: fs, h, pad: 26, bg: '#FFFFFF', fg: INK, icon: ICON.mail, iconColor: A.accent, shadow: 1.3 });
    }, E.outExpo(p) * out.a);
  });

  // ---- counter card: Repeats today 1 → 12 → 28
  const cv = vis(t, 12.03, 16.0, 0.5, 0.3);
  if (cv.a > 0) {
    withAlpha(cv.a, () => {
      ctx.save(); ctx.translate((1 - cv.e) * 60, 0);
      const x = 900, y = 330, w = 800, h = 440;
      card(x, y, w, h, { r: 28, shadow: 1.3, label: 'counter card' });
      text('Repeats today', x + 56, y + 70, { size: 28, weight: 600, color: MUTED });
      const warmth = E.inOutCubic(prog(t, 15.03, 0.8));
      const numColor = mixHex(INK, A.warn, warmth * 0.85);
      rollText([{ t: 12.03, s: '1' }, { t: 13.50, s: '12' }, { t: 15.03, s: '28' }], t, x + 56, y + 190, { size: 150, color: numColor });
      // trail 1 → 12 → 28
      const parts = [['1', 12.03], [' → 12', 13.50], [' → 28', 15.03]];
      let tx = x + 60;
      parts.forEach(([s, tin]) => { const a = E.outExpo(prog(t, tin + 0.1, 0.4)); const wv = measure(s, 28, 600); if (a > 0) withAlpha(a, () => text(s, tx, y + 300, { size: 28, weight: 600, color: '#4B5563' })); tx += wv; });
      // pressure bar
      const bx = x + 56, by = y + 362, bw = w - 112;
      ctx.fillStyle = 'rgba(17,24,39,0.07)'; rrect(bx, by, bw, 14, 7); ctx.fill();
      const f = 0.05 + 0.35 * E.outExpo(prog(t, 13.5, 0.6)) + 0.6 * E.outExpo(prog(t, 15.03, 0.7));
      const g = ctx.createLinearGradient(bx, 0, bx + bw, 0); g.addColorStop(0, A.accent); g.addColorStop(1, A.warn);
      ctx.fillStyle = g; rrect(bx, by, bw * f * E.outExpo(prog(t, 12.2, 0.5)), 14, 7); ctx.fill();
      ctx.restore();
    });
  }
}

// ======================================================================= S3 inbox not organized
function sInbox(t) {
  headline([['Inbox', 16.62], ['not', 17.34], ['organized', 18.36]], t);
  const x = 260, y = 290, w = 1400, h = 560;
  appWindow(x, y, w, h, 'Northwind Goods · Support inbox');
  // unsorted chip in the top bar
  const us = vis(t, 17.67, 21.1);
  withAlpha(us.a, () => withT(x + w - 200, y + 30, popScale(prog(t, 17.67, 0.5)), () => tag('Unsorted', 0, 0, TAG.warn, { align: 'right' })));
  const sorted = vis(t, 21.5, 1e9);
  withAlpha(sorted.a, () => withT(x + w - 200, y + 30, popScale(prog(t, 21.5, 0.5)), () => tag('Tagged by type', 0, 0, TAG.warm, { align: 'right' })));
  // panes
  const lw = 580;
  ctx.fillStyle = 'rgba(17,24,39,0.06)'; ctx.fillRect(x + lw, y + 61, 1, h - 61);
  const rows = [CUST.sam, CUST.taylor, CUST.morgan, CUST.casey];
  const messy = [22, -14, 30, -8];
  const settle = E.outExpo(prog(t, 21.21, 0.6));
  const tagT = [21.21, 21.33, 21.45];
  const open = 19.59;
  rows.forEach((c, i) => {
    const v = vis(t, 16.41 + i * 0.09, 1e9, 0.5);
    const ry = y + 76 + i * 92;
    withAlpha(v.a, () => {
      ctx.save(); ctx.translate(messy[i] * (1 - settle), v.dy);
      emailRow(x + 12, ry, lw - 24, 88, c, {
        selected: i === 0 ? E.outExpo(prog(t, open, 0.3)) : 0,
        tagInfo: i < 3 ? { label: c.cat, style: TAG.neutral, a: E.outExpo(prog(t, tagT[i], 0.4)), s: popScale(prog(t, tagT[i], 0.5)) } : null,
        markColor: A.accent,
      });
      ctx.restore();
    });
  });
  // skeleton row
  withAlpha(vis(t, 16.8, 1e9).a, () => { const ry = y + 76 + 4 * 92 + 44; ctx.fillStyle = 'rgba(17,24,39,0.06)'; ctx.beginPath(); ctx.arc(x + 56, ry, 22, 0, Math.PI * 2); ctx.fill(); skel(x + 92, ry - 12, 160); skel(x + 92, ry + 14, 230, 10); });

  // preview pane (after open)
  const pv = vis(t, open + 0.1, 1e9, 0.5);
  if (pv.a > 0) withAlpha(pv.a, () => {
    ctx.save(); ctx.translate((1 - pv.e) * 30, 0);
    const px = x + lw + 48, py = y + 110;
    avatar(px + 28, py + 10, 28, CUST.sam.ini, CUST.sam.color);
    text(CUST.sam.name, px + 72, py - 2, { size: 24, weight: 700, color: INK });
    text(`${CUST.sam.order} · ${CUST.sam.time}`, px + 72, py + 26, { size: 19, weight: 500, color: MUTED });
    text(CUST.sam.subject, px, py + 96, { size: 34, weight: 700, color: INK });
    [620, 560, 420].forEach((sw, k) => skel(px, py + 160 + k * 34, sw, 14));
    // type field
    const fy = py + 320;
    text('Type', px, fy, { size: 21, weight: 600, color: MUTED });
    const q = vis(t, 20.67, 21.42, 0.4, 0.2);
    withAlpha(q.a, () => withT(px + 80, fy, popScale(prog(t, 20.67, 0.5)), () => chip('?', 0, 0, { size: 20, h: 38, pad: 16, bg: 'rgba(17,24,39,0.06)', fg: '#374151' })));
    const tp = prog(t, 21.42, 0.5);
    if (tp > 0) withAlpha(E.outExpo(tp), () => withT(px + 80 + (1 - E.outExpo(tp)) * 14, fy, popScale(tp), () => tag('Order status', 0, 0, TAG.warm, { h: 38, size: 20 })));
    ctx.restore();
  });
  // cursor
  const keys = [{ t: 18.5, x: 1500, y: 820 }, { t: 19.45, x: 540, y: 380 }, { t: 20.3, x: 560, y: 390 }, { t: 21.2, x: 1100, y: 700 }];
  const cp = cursorAt(t, keys);
  ripple(cp.x, cp.y, t, open, A.accent);
  cursor(cp.x, cp.y, pressAt(t, [open]), vis(t, 18.5, 21.6).a);
}
function camInbox(t) { const p = E.inOutCubic(prog(t, 20.5, 1.2)); return { s: 1 + 0.03 * p, fx: 1100, fy: 560 }; }

// ======================================================================= S4 knowledge base search / copy / rewrite
function sSearch(t) {
  headline([['Search', 22.41], ['for', 22.86], ['the', 22.95], ['right', 23.07], ['policy', 23.34]], t, { tout: 25.05 });
  headline([['Copy', 25.29], ['the', 25.62], ['link', 25.74]], t, { tout: 26.3 });
  headline([['Rewrite', 26.55], ['the', 27.09], ['explanation', 27.21]], t, { tout: 30.6 });
  headline([['Again', 30.84], ['and', 31.38], ['again', 31.56]], t);

  // --- knowledge base panel
  const kv = vis(t, 22.3, 1e9, 0.5);
  const x = 200, y = 290, w = 620, h = 560;
  withAlpha(kv.a, () => {
    ctx.save(); ctx.translate(-(1 - kv.e) * 60, 0);
    card(x, y, w, h, { r: 24, shadow: 1.2, label: 'kb panel' });
    cardHeader(x + 32, y + 48, 'Knowledge base', ICON.doc, INK, A.accent);
    // search field
    const sx = x + 32, sy = y + 104, sw = w - 64;
    ctx.fillStyle = 'rgba(17,24,39,0.04)'; rrect(sx, sy - 28, sw, 56, 14); ctx.fill();
    ctx.strokeStyle = hexA(A.accent, 0.5 * E.outExpo(prog(t, 22.41, 0.3))); ctx.lineWidth = 2; rrect(sx + 1, sy - 27, sw - 2, 54, 13); ctx.stroke();
    ICON.search(sx + 30, sy, 24, '#6B7280');
    const q = typed('shipping', t, 22.45, 23.05);
    const qw = text(q || 'Search articles', sx + 56, sy + 1, { size: 21, weight: 500, color: q ? INK : '#9CA3AF' });
    if (q && t < 23.6 && caretOn(t)) { ctx.fillStyle = INK; ctx.fillRect(sx + 58 + qw, sy - 13, 2, 26); }
    // cards
    const expand = E.outExpo(prog(t, 24.95, 0.45));
    const items = ['Shipping policy', 'Returns policy', 'Account help'];
    const hovers = [[23.0, 23.45], [23.45, 23.85], [23.85, 24.25]];
    items.forEach((label, i) => {
      const cy0 = y + 164 + i * 86 + (i > 0 ? 58 * expand : 0);
      const ch = 72 + (i === 0 ? 58 * expand : 0);
      const iv = vis(t, 22.55 + i * 0.1, 1e9, 0.45);
      const hv = Math.max(hoverAt(t, hovers[i][0], hovers[i][1]), i === 0 ? hoverAt(t, 24.75, 25.2) : 0);
      withAlpha(iv.a, () => {
        const s = 1 + 0.025 * hv;
        withT(x + w / 2, cy0 + ch / 2 + iv.dy, s, () => {
          ctx.translate(-(x + w / 2), -(cy0 + ch / 2));
          card(x + 32, cy0, w - 64, ch, { r: 16, shadow: 0.35 + 0.8 * hv, fill: '#FFFFFF', stroke: i === 0 && expand > 0 ? hexA(A.accent, 0.6) : 'rgba(17,24,39,0.08)', lw: i === 0 && expand > 0 ? 2 : 1, label });
          sweep(x + 32, cy0, w - 64, ch, 16, hv > 0 && hv < 1 ? hv : 0);
          ICON.doc(x + 68, cy0 + 36, 24, A.accent);
          text(label, x + 96, cy0 + 37, { size: 22, weight: 600, color: INK });
          if (i === 0 && expand > 0.02) withAlpha(expand, () => {
            ICON.link(x + 68, cy0 + 96, 22, MUTED);
            text(LINKS.shipping.url, x + 96, cy0 + 97, { size: 19, weight: 500, color: '#4B5563', maxW: 360 });
            // copy button
            const bx = x + w - 64 - 20, by = cy0 + 96; const pr = pressScale(t, 25.62);
            const cpd = E.outExpo(prog(t, 25.74, 0.3));
            withT(bx - 56, by, pr * (1 + 0.04 * Math.sin(Math.PI * prog(t, 25.74, 0.4))), () => {
              ctx.fillStyle = cpd > 0.5 ? hexA('#19B89D', 0.16) : hexA(A.accent, 0.12); rrect(-56, -20, 112, 40, 12); ctx.fill();
              if (cpd < 0.5) text('Copy', 0, 1, { size: 18, weight: 600, color: '#A34A0E', align: 'center' });
              else { ICON.check(-30, 0, 18, '#0B7A67'); text('Copied', 10, 1, { size: 18, weight: 600, color: '#0B7A67', align: 'center' }); }
            });
          });
        });
      });
    });
    // past replies
    const pr = vis(t, 23.94, 1e9);
    const py = y + 164 + 3 * 86 + 58 * expand;
    withAlpha(pr.a, () => {
      const hv = hoverAt(t, 24.25, 24.7);
      ctx.save(); ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(17,24,39,0.22)'; ctx.lineWidth = 1.5; rrect(x + 32, py + pr.dy, w - 64, 64, 16); ctx.stroke(); ctx.restore();
      if (hv > 0) { ctx.fillStyle = hexA(A.accent, 0.06 * hv); rrect(x + 32, py + pr.dy, w - 64, 64, 16); ctx.fill(); }
      ICON.refresh(x + 68, py + 32 + pr.dy, 22, MUTED);
      text('Past replies', x + 96, py + 33 + pr.dy, { size: 21, weight: 600, color: '#4B5563' });
    });
    ctx.restore();
  });
  // copied badge

  // --- reply composer
  const cv = vis(t, 22.5, 1e9, 0.5);
  const X = 880, Y = 290, Wd = 840, Hd = 560;
  withAlpha(cv.a, () => {
    ctx.save(); ctx.translate((1 - cv.e) * 60, 0);
    card(X, Y, Wd, Hd, { r: 24, shadow: 1.2, label: 'composer' });
    text(`Reply to ${CUST.sam.name}`, X + 40, Y + 48, { size: 24, weight: 700, color: INK });
    text(`Re: ${CUST.sam.subject}`, X + 40, Y + 84, { size: 19, weight: 500, color: MUTED });
    ctx.fillStyle = 'rgba(17,24,39,0.07)'; ctx.fillRect(X + 40, Y + 112, Wd - 80, 1);
    // rewrite counter chip
    const rc = [{ t: 26.55, s: 'Rewrite 1' }, { t: 28.68, s: 'Rewrite 2' }, { t: 30.84, s: 'Rewrite 3' }, { t: 31.56, s: 'Rewrite 4' }];
    if (t >= 26.55) {
      const a = E.outExpo(prog(t, 26.55, 0.4));
      withAlpha(a, () => { ctx.fillStyle = hexA(A.accent, 0.13); rrect(X + Wd - 40 - 150, Y + 30, 150, 40, 20); ctx.fill(); });
      withAlpha(a, () => rollText(rc, t, X + Wd - 40 - 75, Y + 51, { size: 19, weight: 600, color: '#A34A0E', align: 'center', d: 0.35 }));
    }
    // body lines
    const bx = X + 40;
    const l1 = typed('Hi Sam, thanks for reaching out.', t, 26.55, 27.85);
    if (l1) text(l1, bx, Y + 160, { size: 23, weight: 500, color: INK });
    let l2 = '';
    const sel = t >= 28.68 && t < 28.95;
    if (t < 28.68) l2 = typed('Your order is on its way.', t, 27.96, 28.6);
    else if (t < 28.95) l2 = 'Your order is on its way.';
    else if (t < 30.84) l2 = typed('Your parcel is in transit.', t, 28.95, 29.8);
    else l2 = typed('Your package is on the way.', t, 30.9, 31.5);
    if (l2) {
      const lw2 = measure(l2, 23, 500);
      if (sel) { ctx.fillStyle = hexA(A.accent, 0.22); rrect(bx - 4, Y + 210 - 18, lw2 + 8, 36, 6); ctx.fill(); }
      text(l2, bx, Y + 210, { size: 23, weight: 500, color: INK });
    }
    // caret
    const typingNow = (t > 26.55 && t < 29.9) || (t > 30.85 && t < 31.6);
    if (typingNow && caretOn(t)) { const ln = t < 27.9 ? l1 : l2; const ly = t < 27.9 ? Y + 160 : Y + 210; ctx.fillStyle = INK; ctx.fillRect(bx + measure(ln, 23, 500) + 3, ly - 14, 2, 28); }
    // pasted link chip
    const lp = prog(t, 25.95, 0.5);
    if (lp > 0) {
      const e = E.outExpo(lp);
      const fx = lerp(bx - 50, bx, e), fy = Y + 280;
      withAlpha(e, () => chip(LINKS.shipping.url, fx, fy, { size: 19, h: 42, pad: 16, bg: hexA(A.accent, 0.1), fg: '#A34A0E', icon: ICON.link }));
    }
    // skeleton explanation lines
    [620, 520].forEach((sw, k) => withAlpha(vis(t, 27.2 + k * 0.2, 1e9).a, () => skel(bx, Y + 350 + k * 34, sw, 14)));
    // loop chip
    const lpv = prog(t, 30.84, 0.5);
    if (lpv > 0) withAlpha(E.outExpo(lpv), () => withT(X + Wd / 2, Y + Hd - 70, popScale(lpv), () => {
      const cw = chipWidth('Same reply, again and again', { size: 21, h: 48, pad: 20, icon: ICON.refresh });
      card(-cw / 2, -24, cw, 48, { r: 24, fill: '#FFFFFF', shadow: 0.8, stroke: hexA(A.accent, 0.4), label: 'loop chip' });
      ctx.save(); ctx.translate(-cw / 2 + 20 + 12, 0); ctx.rotate((t - 30.84) * 3.2); ICON.refresh(0, 0, 24, A.accent); ctx.restore();
      text('Same reply, again and again', -cw / 2 + 20 + 34, 1, { size: 21, weight: 600, color: INK });
    }));
    ctx.restore();
  });
  // cursor
  const keys = [{ t: 22.6, x: 1200, y: 760 }, { t: 23.05, x: 560, y: 488 }, { t: 23.45, x: 580, y: 574 }, { t: 23.85, x: 600, y: 660 }, { t: 24.3, x: 610, y: 782 }, { t: 24.8, x: 600, y: 500 }, { t: 25.5, x: 694, y: 552 }, { t: 26.3, x: 1000, y: 640 }, { t: 27.0, x: 1400, y: 760 }];
  const cp = cursorAt(t, keys);
  ripple(cp.x, cp.y, t, 25.62, A.accent);
  cursor(cp.x, cp.y, pressAt(t, [25.62]), vis(t, 22.6, 26.9).a);
}

// ======================================================================= S5 tricky emails mixed in
function sTricky(t) {
  headline([['Tricky', 33.48], ['emails', 33.92], ['mixed', 37.23], ['in', 37.62]], t);
  const x = 410, y = 290, w = 1100, h = 560;
  const cv = vis(t, 32.6, 1e9, 0.5);
  withAlpha(cv.a, () => {
    card(x, y, w, h, { r: 24, shadow: 1.2, label: 'tricky inbox' });
    cardHeader(x + 36, y + 46, 'Support inbox', ICON.inbox, INK, A.accent);
    chip('Support Team', x + w - 28, y + 46, { align: 'right', size: 18, h: 36, pad: 14, bg: 'rgba(17,24,39,0.05)', fg: '#374151', icon: ICON.user });
    ctx.fillStyle = 'rgba(17,24,39,0.07)'; ctx.fillRect(x + 28, y + 84, w - 56, 1);
    const slotY = (s) => y + 96 + s * 90;
    const re = E.inOutCubic(prog(t, 37.8, 0.55));
    const rows = [
      { c: CUST.casey, tin: 34.53, s0: 0, s1: 1, tagL: 'Refund request', st: TAG.amber, amber: true },
      { c: CUST.guest, tin: 35.25, s0: 1, s1: 3, tagL: 'Complaint', st: TAG.amber, amber: true, extra: { label: 'Chargeback mention', tin: 36.27 } },
      { c: CUST.sam, tin: 38.01, s0: 0, s1: 0, tagL: 'Order status', st: TAG.neutral },
      { c: CUST.taylor, tin: 38.2, s0: 2, s1: 2, tagL: 'Address change', st: TAG.neutral },
      { c: CUST.morgan, tin: 38.43, s0: 4, s1: 4, tagL: 'Password reset', st: TAG.neutral },
    ];
    rows.forEach((r) => {
      const v = vis(t, r.tin, 1e9, 0.5); if (v.a <= 0) return;
      const ry = lerp(slotY(r.s0), slotY(r.s1), r.amber ? re : 1);
      withAlpha(v.a, () => {
        ctx.save(); ctx.translate(r.amber ? 0 : (1 - v.e) * -40, r.amber ? v.dy : 0);
        emailRow(x + 16, ry, w - 32, 86, r.c, {
          leftBar: r.amber ? A.accent === '' ? null : '#F5A524' : null,
          tagInfo: { label: r.tagL, style: r.st, a: E.outExpo(prog(t, r.tin + 0.12, 0.4)), s: popScale(prog(t, r.tin + 0.12, 0.5)) },
          extraTag: r.extra ? { label: r.extra.label, style: TAG.amberOutline, a: E.outExpo(prog(t, r.extra.tin, 0.4)), s: popScale(prog(t, r.extra.tin, 0.5)) } : null,
        });
        ctx.restore();
      });
    });
  });
}
function camTricky(t) { const p = E.inOutCubic(prog(t, 34.3, 1.4)) * (1 - E.inOutCubic(prog(t, 37.5, 0.8))); return { s: 1 + 0.035 * p, fx: 960, fy: 420 }; }

// ======================================================================= S6 problems
function sProblems(t) {
  headline([['Where', 40.02], ['problems', 40.23, A.warn], ['start', 40.64]], t);
  const cards = [
    { title: 'Slower replies', tin: 41.79, icon: ICON.clock },
    { title: 'Inconsistent tone', tin: 43.47, icon: ICON.tone },
    { title: 'Missed details', tin: 45.21, icon: ICON.list },
  ];
  cards.forEach((c, i) => {
    const p = prog(t, c.tin, 0.5); if (p <= 0) return;
    const x = 200 + i * 530, y = 310, w = 460, h = 230;
    withT(x + w / 2, y + h / 2 + (1 - E.outExpo(p)) * 40, popScale(p) * 0.2 + 0.8 * (1), () => {
      ctx.translate(-(x + w / 2), -(y + h / 2));
      card(x, y, w, h, { r: 24, shadow: 1.2, label: c.title });
      ctx.fillStyle = hexA(A.accent, 0.12); ctx.beginPath(); ctx.arc(x + 64, y + 66, 32, 0, Math.PI * 2); ctx.fill();
      c.icon(x + 64, y + 66, 30, '#C2570C');
      text(c.title, x + 36, y + 140, { size: 30, weight: 700, color: INK, maxW: w - 72 });
      // micro visual
      const vy = y + 188;
      const q = E.outExpo(prog(t, c.tin + 0.3, 0.8));
      if (i === 0) { ctx.fillStyle = 'rgba(17,24,39,0.07)'; rrect(x + 36, vy - 6, w - 72, 12, 6); ctx.fill(); const g = ctx.createLinearGradient(x + 36, 0, x + w - 36, 0); g.addColorStop(0, A.accent); g.addColorStop(1, A.warn); ctx.fillStyle = g; rrect(x + 36, vy - 6, (w - 72) * 0.82 * q, 12, 6); ctx.fill(); }
      if (i === 1) { [[0, 150], [18, 110], [-6, 170]].forEach(([dx, bw], k) => { ctx.fillStyle = k === 1 ? hexA(A.accent, 0.35) : 'rgba(17,24,39,0.1)'; rrect(x + 36 + dx + k * 128, vy - 8 + (k === 1 ? -4 * q : 0), bw * 0.72, 16, 8); ctx.fill(); }); }
      if (i === 2) { for (let k = 0; k < 3; k++) { const bx = x + 36 + k * 130; const miss = k === 2; ctx.strokeStyle = miss ? hexA(A.warn, 0.8) : 'rgba(17,24,39,0.25)'; ctx.lineWidth = 2; rrect(bx, vy - 11, 22, 22, 6); ctx.stroke(); if (!miss) ICON.check(bx + 11, vy, 18, '#4B5563', q); skel(bx + 32, vy, 70, 10); } }
    }, E.outExpo(p));
  });
  // replies feel cold
  const cp = prog(t, 48.30, 0.5);
  if (cp > 0) withAlpha(E.outExpo(cp), () => withT(960, 625, popScale(cp), () => chip('Replies feel cold', 0, 0, { align: 'center', size: 24, h: 54, pad: 24, bg: '#EEF2F7', fg: '#334155', icon: ICON.snow, iconColor: '#64748B' })));
  // not a team issue → inbox scale issue
  const np = prog(t, 50.46, 0.5);
  if (np > 0) withAlpha(E.outExpo(np) * lerp(1, 0.6, E.outExpo(prog(t, 52.4, 0.5))), () => withT(740, 750, popScale(np), () => chip('Not a team issue', 0, 0, { align: 'center', size: 24, h: 58, pad: 24, bg: '#FFFFFF', fg: '#4B5563', shadow: 0.6, stroke: 'rgba(17,24,39,0.08)' })));
  const ap = prog(t, 52.2, 0.5);
  if (ap > 0) withAlpha(E.outExpo(ap), () => ICON.arrow(960, 750, 34, '#9CA3AF'));
  const sp = prog(t, 52.68, 0.5);
  if (sp > 0) {
    const bump = 1 + 0.04 * Math.sin(Math.PI * prog(t, 53.22, 0.4));
    withAlpha(E.outExpo(sp), () => withT(1190, 750, popScale(sp) * bump, () => chip('An inbox scale issue', 0, 0, { align: 'center', size: 24, h: 58, pad: 24, bg: hexA(A.accent, 0.16), fg: '#9A3F07', icon: ICON.inbox, iconColor: '#C2570C' })));
  }
}
function camProblems(t) { const p = E.inOutCubic(prog(t, 52.5, 1.0)); return { s: 1 + 0.04 * p, fx: 960, fy: 740 }; }

// ======================================================================= S7 pivot title card
function sPivot(t) {
  const p = prog(t, 54.63, 0.6);
  font(64, 700);
  const s = 'A cleaner support workflow';
  withAlpha(E.outExpo(p), () => {
    text(s, 960, 520 + (1 - E.outExpo(p)) * 16, { size: 64, weight: 700, color: INK, align: 'center' });
    const lw = ctx.measureText(s).width;
    const lp = E.outExpo(prog(t, 55.02, 0.7));
    const g = ctx.createLinearGradient(960 - lw / 2, 0, 960 + lw / 2, 0); g.addColorStop(0, B.primary); g.addColorStop(1, B.secondary);
    ctx.fillStyle = g; rrect(960 - (lw / 2) * lp, 580, lw * lp, 6, 3); ctx.fill();
  });
}

// ======================================================================= S8–S12 workflow (cool clarity)
function stepper(t, a) {
  const steps = [['Receive', 56.58], ['Classify', 59.16], ['Look up', 65.01], ['Draft', 68.10]];
  const ws = steps.map(([l]) => chipWidth(l, { size: 21, h: 44, pad: 18, dot: '#000' }));
  const gap = 56; const total = ws.reduce((x, y) => x + y, 0) + gap * 3;
  let x = 960 - total / 2;
  withAlpha(a, () => steps.forEach(([l, tin], i) => {
    const on = E.outExpo(prog(t, tin, 0.4));
    const done = i < 3 ? E.outExpo(prog(t, steps[i + 1][1], 0.4)) : 0;
    if (i > 0) { ctx.fillStyle = 'rgba(17,24,39,0.1)'; ctx.fillRect(x - gap + 8, HEAD_Y - 1, gap - 16, 2); ctx.fillStyle = B.primary; ctx.fillRect(x - gap + 8, HEAD_Y - 1, (gap - 16) * on, 2); }
    const bg = on > 0.5 ? (done > 0.5 ? hexA(B.success, 0.14) : hexA(B.primary, 0.12)) : 'rgba(17,24,39,0.05)';
    const fg = on > 0.5 ? (done > 0.5 ? '#0B7A67' : '#3148C7') : '#6B7280';
    const dot = on > 0.5 ? (done > 0.5 ? B.success : B.primary) : '#C4C9D2';
    withT(x + ws[i] / 2, HEAD_Y, 1 + 0.04 * Math.sin(Math.PI * prog(t, tin, 0.4)), () => chip(l, 0, 0, { align: 'center', size: 21, h: 44, pad: 18, bg, fg, dot }));
    x += ws[i] + gap;
  }));
}
function sWorkflow(t) {
  const phase3 = E.inOutCubic(prog(t, 71.45, 0.7));
  stepper(t, vis(t, 56.5, 71.45, 0.5, 0.3).a);
  headline([['Draft', 71.88], ['matches', 72.30], ['the', 72.66], ['category', 72.78]], t, { tout: 74.0 });
  headline([['Correct', 74.28], ['steps', 74.73], ['and', 75.09], ['links', 75.21]], t, { tout: 76.0 });
  headline([['Designed', 76.44], ['to', 77.01], ['be', 77.13], ['safe', 77.25]], t);

  const pan = -520 * E.inOutCubic(prog(t, 67.55, 0.75));
  const fadeCols = 1 - phase3;
  // ---------------- column 1: inbox
  const c1a = vis(t, 56.5, 67.3, 0.5, 0.3).a;
  const X1 = 200 + pan, Y = 300;
  const rowY = Y + 92;
  withAlpha(c1a, () => {
    card(X1, Y, 460, 500, { r: 24, shadow: 1.2, label: 'col1 inbox' });
    cardHeader(X1 + 32, Y + 46, 'Support inbox', ICON.inbox, INK, B.primary);
    const bp = prog(t, 57.27, 0.5);
    if (bp > 0) withT(X1 + 460 - 50, Y + 46, popScale(bp), () => { ctx.fillStyle = B.primary; ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill(); text('1', 0, 1, { size: 19, weight: 700, color: '#FFFFFF', align: 'center' }); }, E.outExpo(bp) * (1 - E.outExpo(prog(t, 58.3, 0.4))));
    ctx.fillStyle = 'rgba(17,24,39,0.07)'; ctx.fillRect(X1 + 24, Y + 84, 412, 1);
    // new row
    const rv = vis(t, 57.60, 1e9, 0.5);
    withAlpha(rv.a, () => {
      ctx.save(); ctx.translate(0, -(1 - rv.e) * 30);
      emailRow(X1 + 12, rowY, 436, 92, CUST.sam, { selected: E.outExpo(prog(t, 58.3, 0.3)), hover: hoverAt(t, 58.05, 58.5) * 0.6, time: true, subjectMark: prog(t, 58.9, 0.5), markColor: B.primary });
      ctx.restore();
    });
    // older rows (read)
    for (let k = 0; k < 3; k++) { const ry = rowY + 112 + k * 88; ctx.fillStyle = 'rgba(17,24,39,0.05)'; ctx.beginPath(); ctx.arc(X1 + 56, ry + 44, 22, 0, Math.PI * 2); ctx.fill(); skel(X1 + 92, ry + 32, 150, 12); skel(X1 + 92, ry + 58, 220, 10); }
  });
  // ---------------- column 2: categories
  const X2 = 720 + pan;
  const c2a = vis(t, 59.0, 1e9, 0.5).a * fadeCols;
  const chipY = (i) => Y + 104 + i * 64;
  const hl = [[60.39], [61.38], [61.43], [62.40], [63.12], [63.96]];
  const sel = prog(t, 64.45, 0.45);
  withAlpha(c2a, () => {
    card(X2, Y, 420, 500, { r: 24, shadow: 1.2, label: 'col2 categories' });
    cardHeader(X2 + 32, Y + 46, 'Category', ICON.list, INK, B.primary);
    CATEGORIES.forEach((cat, i) => {
      const iv = vis(t, 59.16 + i * 0.08, 1e9, 0.45);
      const h = hl[i][0];
      const pulse = clamp01(Math.min((t - h) / 0.15, (h + 0.7 - t) / 0.3));
      const isSel = i === 0;
      const selE = isSel ? E.outExpo(sel) : 0;
      const dim = !isSel && sel > 0 ? lerp(1, 0.5, E.outExpo(sel)) : 1;
      const magnet = isSel ? Math.sin(Math.PI * clamp01(sel)) * 10 : 0;
      withAlpha(iv.a * dim, () => withT(X2 + 32 + 178 + magnet, chipY(i) + iv.dy, 1 + 0.03 * pulse + 0.02 * Math.sin(Math.PI * clamp01(sel)) * (isSel ? 1 : 0), () => {
        const w = 356, hh = 50;
        const bg = selE > 0.5 ? B.primary : pulse > 0 ? hexA(B.primary, 0.08 + 0.1 * pulse) : 'rgba(17,24,39,0.04)';
        const fg = selE > 0.5 ? '#FFFFFF' : pulse > 0.3 ? '#3148C7' : '#374151';
        ctx.fillStyle = bg; rrect(-w / 2, -hh / 2, w, hh, 14); ctx.fill();
        if (pulse > 0) { ctx.strokeStyle = hexA(B.primary, 0.5 * pulse); ctx.lineWidth = 2; rrect(-w / 2 + 1, -hh / 2 + 1, w - 2, hh - 2, 13); ctx.stroke(); }
        text(cat, -w / 2 + 20, 1, { size: 21, weight: 600, color: fg });
        if (isSel && sel > 0) checkBadge(w / 2 - 28, 0, 15, prog(t, 64.5, 0.6), '#FFFFFF', false);
      }));
    });
  });
  connector(X1 + 448, rowY + 60, X2, chipY(0), prog(t, 59.16, 0.5) * c1a, hexA(B.primary, 0.7));
  // ---------------- column 3: knowledge base
  const X3 = 1200 + pan;
  const c3a = vis(t, 65.0, 1e9, 0.5).a * fadeCols;
  const kbY = (i) => Y + 104 + i * 88;
  const rel = prog(t, 65.67, 0.5);
  withAlpha(c3a, () => {
    card(X3, Y, 520, 500, { r: 24, shadow: 1.2, label: 'col3 kb' });
    cardHeader(X3 + 32, Y + 46, 'Knowledge base', ICON.doc, INK, B.primary);
    KB.forEach((k, i) => {
      const iv = vis(t, 65.22 + i * 0.07, 1e9, 0.45);
      const isRel = i === 0;
      const scan = hoverAt(t, 65.3 + i * 0.1, 65.55 + i * 0.1) * (isRel ? 0 : 1);
      const dim = !isRel && rel > 0 ? lerp(1, 0.55, E.outExpo(rel)) : 1;
      withAlpha(iv.a * dim, () => {
        const x = X3 + 28, y = kbY(i) - 34 + iv.dy, w = 464, h = 68;
        card(x, y, w, h, { r: 16, shadow: 0.3 + (isRel ? 0.8 * E.outExpo(rel) : 0) + scan * 0.6, stroke: isRel && rel > 0 ? hexA(B.primary, 0.8 * E.outExpo(rel)) : 'rgba(17,24,39,0.08)', lw: isRel && rel > 0 ? 2 : 1, label: k });
        ICON.doc(x + 34, y + 34, 24, isRel && rel > 0 ? B.primary : '#94A3B8');
        text(k, x + 62, y + 35, { size: 21, weight: 600, color: INK });
        if (isRel && rel > 0) withT(x + w - 20, y + 34, popScale(prog(t, 65.9, 0.5)), () => tag('Relevant', 0, 0, TAG.green, { align: 'right' }), E.outExpo(prog(t, 65.9, 0.4)));
      });
    });
  });
  connector(X2 + 400, chipY(0), X3 + 28, kbY(0), prog(t, 65.25, 0.5) * c2a * c3a, hexA(B.primary, 0.7));

  // ---------------- column 4: draft reply (then moves left in phase 3)
  const dv = vis(t, 68.10, 1e9, 0.5);
  const X4 = lerp(1780 + pan, 200, phase3);
  const draftBlocks = [
    ['Greeting', 'Hi Sam,', 68.64],
    ['Answer', `${CUST.sam.order} has shipped.`, 68.95],
    ['Link', null, 69.27],
    ['Next step', 'Reply if you need anything else.', 69.60],
  ];
  withAlpha(dv.a, () => {
    ctx.save(); ctx.translate((1 - dv.e) * 50, 0);
    const w = 460, h = 520;
    card(X4, Y, w, h, { r: 24, shadow: 1.3, stroke: hexA(B.primary, 0.25), label: 'draft card' });
    cardHeader(X4 + 32, Y + 46, 'Draft reply', ICON.pencil, INK, B.primary);
    tag('Order status', X4 + w - 24, Y + 46, TAG.blue, { align: 'right' });
    draftBlocks.forEach(([lab, content, tin], i) => {
      const p = prog(t, tin, 0.45); if (p <= 0) return;
      const by = Y + 84 + i * 96, bx = X4 + 24;
      const hl = i === 2 ? hoverAt(t, 75.21, 76.3) : i === 1 ? hoverAt(t, 74.73, 75.6) : 0;
      withAlpha(E.outExpo(p), () => {
        ctx.save(); ctx.translate((1 - E.outExpo(p)) * 40, 0);
        ctx.fillStyle = hl > 0 ? hexA(B.primary, 0.06 + 0.06 * hl) : 'rgba(17,24,39,0.035)'; rrect(bx, by, w - 48, 84, 14); ctx.fill();
        text(lab, bx + 20, by + 26, { size: 17, weight: 600, color: B.muted });
        if (content) text(content, bx + 20, by + 58, { size: 21, weight: 500, color: INK, maxW: w - 88 });
        else chip(LINKS.track.label, bx + 20, by + 58, { size: 18, h: 34, pad: 14, bg: hexA(B.primary, 0.1), fg: '#3148C7', icon: ICON.link });
        ctx.restore();
      });
    });
    const ap = prog(t, 69.84, 0.5);
    if (ap > 0) withAlpha(E.outExpo(ap), () => withT(X4 + w / 2, Y + h - 38, popScale(ap), () => tag('Drafted automatically', 0, 0, TAG.green, { align: 'center', icon: ICON.bolt })));
    ctx.restore();
  });
  connector(X3 + 492, kbY(0), X4, Y + 126, prog(t, 68.3, 0.5) * c3a * dv.a, hexA(B.primary, 0.7));

  // ---------------- phase 3: checks panel
  if (phase3 > 0) {
    const PX = 740, PW = 980;
    withAlpha(phase3, () => {
      ctx.save(); ctx.translate((1 - phase3) * 60, 0);
      card(PX, Y, PW, 520, { r: 24, shadow: 1.2, label: 'checks panel' });
      cardHeader(PX + 36, Y + 46, 'Draft checks', ICON.shield, INK, B.primary);
      const rows = [
        { label: 'Category match', tin: 72.78, right: () => tag('Order status', 0, 0, TAG.blue, { align: 'right' }) },
        { label: 'Correct steps', tin: 74.73, right: null },
        { label: 'Correct links', tin: 75.21, right: null },
      ];
      rows.forEach((r, i) => {
        const ry = Y + 114 + i * 72;
        const a = E.outExpo(prog(t, r.tin - 0.25, 0.4));
        withAlpha(a, () => {
          ctx.fillStyle = 'rgba(17,24,39,0.035)'; rrect(PX + 32, ry - 30, PW - 64, 60, 14); ctx.fill();
          checkBadge(PX + 66, ry, 17, prog(t, r.tin, 0.6), B.success);
          text(r.label, PX + 100, ry + 1, { size: 22, weight: 600, color: INK });
          if (r.right) withT(PX + PW - 52, ry, 1, r.right);
        });
      });
      // link library
      const la = E.outExpo(prog(t, 75.21, 0.4));
      withAlpha(la, () => {
        const ly = Y + 360;
        text('Link library', PX + 36, ly - 42, { size: 18, weight: 600, color: B.muted });
        let lx = PX + 36;
        [LINKS.track, LINKS.address, LINKS.reset].forEach((L, i) => {
          const selL = i === 0;
          const p = prog(t, 75.21 + i * 0.1, 0.45);
          const w = chipWidth(L.label, { size: 20, h: 44, pad: 18, icon: ICON.link });
          withT(lx + w / 2, ly, popScale(p), () => chip(L.label, 0, 0, { align: 'center', size: 20, h: 44, pad: 18, bg: selL ? B.primary : 'rgba(17,24,39,0.05)', fg: selL ? '#FFFFFF' : '#4B5563', icon: ICON.link }), E.outExpo(p) * (selL ? 1 : 0.75));
          lx += w + 14;
        });
        const up = prog(t, 75.6, 0.4);
        withAlpha(E.outExpo(up), () => { ICON.link(PX + 48, ly + 50, 20, B.primary); text(LINKS.track.url, PX + 70, ly + 51, { size: 19, weight: 500, color: '#3148C7' }); });
      });
      // safety badge
      const sp = prog(t, 76.44, 0.5);
      if (sp > 0) withAlpha(E.outExpo(sp), () => withT(PX + PW / 2, Y + 474, popScale(sp), () => tag('Safety checks on', 0, 0, TAG.green, { align: 'center', icon: ICON.shield, size: 20, h: 42 })));
      ctx.restore();
    });
  }
  // cursor (email click → snap focus)
  const keys = [{ t: 57.75, x: 900, y: 760 }, { t: 58.2, x: 560, y: 432 }, { t: 58.9, x: 590, y: 470 }, { t: 59.6, x: 620, y: 760 }];
  const cp = cursorAt(t, keys);
  ripple(cp.x, cp.y, t, 58.3, B.primary);
  cursor(cp.x, cp.y, pressAt(t, [58.3]), vis(t, 57.75, 59.4).a);
}
function camWorkflow(t) {
  // snap-zoom focus on the selected row (105% → settle)
  const snap = E.outExpo(prog(t, 58.3, 0.3)) * (1 - E.inOutCubic(prog(t, 58.75, 0.6)));
  const push = E.inOutCubic(prog(t, 72.0, 5.5));
  return { s: 1 + 0.05 * snap + 0.025 * push, fx: 800, fy: 470 };
}

// ======================================================================= S13–S14 human approval (reassuring)
function sApproval(t) {
  headline([['Low', 78.48], ['risk:', 78.87], ['drafted', 80.01], ['instantly', 80.49]], t, { tout: 81.35 });
  headline([['High', 81.72], ['risk:', 82.02], ['human', 85.98], ['approval', 86.34]], t, { tout: 87.3 });
  headline([['The', 87.48], ['workflow', 87.63], ['does', 88.41], ['not', 88.65], ['guess', 88.98]], t, { tout: 89.75 });
  headline([['Drafts,', 90.03], ['flags,', 90.81], ['and', 91.59], ['waits', 91.77]], t);

  // --- left: low risk (Morgan Chen, password reset)
  const lv = vis(t, 78.2, 1e9, 0.5);
  const focusR = E.inOutCubic(prog(t, 81.5, 0.6));
  const Y = 290;
  withAlpha(lv.a * lerp(1, 0.55, focusR), () => withT(540, 570, lerp(1, 0.97, focusR), () => {
    ctx.translate(-540, -570);
    const x = 200, w = 680, h = 560;
    card(x, Y, w, h, { r: 24, shadow: 1.2, label: 'low risk card' });
    avatar(x + 60, Y + 60, 26, CUST.morgan.ini, CUST.morgan.color);
    text(CUST.morgan.name, x + 100, Y + 48, { size: 24, weight: 700, color: INK });
    text(CUST.morgan.subject, x + 100, Y + 78, { size: 19, weight: 500, color: MUTED });
    const rk = prog(t, 78.87, 0.5);
    withAlpha(E.outExpo(rk), () => withT(x + w - 32, Y + 60, popScale(rk), () => tag('Low risk', 0, 0, TAG.green, { align: 'right' })));
    tag(CUST.morgan.cat, x + 36, Y + 136, TAG.blue);
    // draft area
    ctx.fillStyle = 'rgba(17,24,39,0.035)'; rrect(x + 32, Y + 176, w - 64, 250, 16); ctx.fill();
    text('Draft reply', x + 56, Y + 206, { size: 18, weight: 600, color: MUTED });
    const lines = [['Hi Morgan,', 80.01], ['Use the link below to reset your password.', 80.15]];
    lines.forEach(([s, tin], i) => { const p = prog(t, tin, 0.35); withAlpha(E.outExpo(p), () => text(s, x + 56 + (1 - E.outExpo(p)) * 30, Y + 252 + i * 44, { size: 21, weight: 500, color: INK, maxW: w - 112 })); });
    const lp = prog(t, 80.3, 0.4);
    withAlpha(E.outExpo(lp), () => chip(LINKS.reset.label, x + 56 + (1 - E.outExpo(lp)) * 30, Y + 370, { size: 19, h: 38, pad: 16, bg: hexA(B.primary, 0.1), fg: '#3148C7', icon: ICON.link }));
    // draft ready
    const dr = prog(t, 80.49, 0.6);
    if (dr > 0) {
      checkBadge(x + 66, Y + 486, 22, dr, C.success);
      withAlpha(E.outExpo(prog(t, 80.6, 0.4)), () => text('Draft ready', x + 102, Y + 487, { size: 26, weight: 700, color: '#0B7A67' }));
    }
  }));

  // --- right: approval queue
  const rv = vis(t, 82.85, 1e9, 0.5);
  const x = 940, w = 780, h = 560;
  withAlpha(rv.a, () => {
    ctx.save(); ctx.translate((1 - rv.e) * 60, 0);
    card(x, Y, w, h, { r: 24, shadow: 1.3, stroke: hexA(C.accent, 0.35), label: 'approval card' });
    cardHeader(x + 36, Y + 46, 'Approval queue', ICON.shield, INK, '#C98300');
    // status badge
    const na = prog(t, 86.34, 0.5), ap = prog(t, 95.05, 0.5);
    const flagPulse = Math.sin(Math.PI * prog(t, 90.81, 0.5));
    if (na > 0 && ap < 0.5) withAlpha(E.outExpo(na) * (1 - E.outExpo(ap * 2)), () => withT(x + w - 36, Y + 46, popScale(na) * (1 + 0.04 * flagPulse), () => tag('Needs approval', 0, 0, TAG.amber, { align: 'right', icon: ICON.alert, dot: false })));
    if (ap > 0) withAlpha(E.outExpo(ap), () => withT(x + w - 36, Y + 46, popScale(ap), () => tag('Approved', 0, 0, TAG.green, { align: 'right', icon: ICON.check, dot: false })));
    // queue rows
    const q1 = vis(t, 83.16, 1e9, 0.45), q2 = vis(t, 84.33, 1e9, 0.45);
    const dim2 = lerp(1, 0.5, E.outExpo(prog(t, 86.9, 0.5)));
    withAlpha(q1.a, () => { ctx.save(); ctx.translate(0, q1.dy); emailRow(x + 16, Y + 88, w - 32, 80, { ...CUST.casey, subject: `${CUST.casey.subject} · ${CUST.casey.order}` }, { selected: 1, markColor: C.accent, tagInfo: { label: 'Refund request', style: TAG.amber, a: 1, s: popScale(prog(t, 83.16, 0.5)) } }); ctx.restore(); });
    withAlpha(q2.a * dim2, () => { ctx.save(); ctx.translate(0, q2.dy); emailRow(x + 16, Y + 172, w - 32, 80, CUST.guest, { tagInfo: { label: 'Complaint', style: TAG.amber, a: 1, s: popScale(prog(t, 84.33, 0.5)) } }); ctx.restore(); });
    // draft
    const dv2 = vis(t, 90.03, 1e9, 0.45);
    withAlpha(dv2.a, () => {
      const by = Y + 270;
      ctx.fillStyle = 'rgba(17,24,39,0.035)'; rrect(x + 32, by, w - 64, 170, 16); ctx.fill();
      text('Draft reply', x + 56, by + 30, { size: 18, weight: 600, color: MUTED });
      text('Hi Casey,', x + 56, by + 74, { size: 21, weight: 500, color: INK });
      // edited line
      const base = 'Your refund request is ';
      let tail = 'being reviewed.';
      const editing = t >= 93.66;
      if (t >= 93.8 && t < 94.1) tail = 'being reviewed.'.slice(0, Math.max(0, Math.round(15 * (1 - (t - 93.8) / 0.3))));
      else if (t >= 94.1) tail = typed('under review.', t, 94.1, 94.6);
      const lineY = by + 118;
      const lw = measure(base + tail, 21, 500);
      if (editing) { const ea = E.outExpo(prog(t, 93.66, 0.3)) * (1 - E.outExpo(prog(t, 95.05, 0.3))); ctx.strokeStyle = hexA(C.accent, 0.8 * ea); ctx.lineWidth = 2; rrect(x + 46, lineY - 22, w - 112, 44, 10); ctx.stroke(); }
      text(base + tail, x + 56, lineY, { size: 21, weight: 500, color: INK, maxW: w - 124 });
      if (editing && t < 95.0 && caretOn(t)) { ctx.fillStyle = INK; ctx.fillRect(x + 58 + lw, lineY - 13, 2, 26); }
      const ed = prog(t, 94.7, 0.4);
      if (ed > 0 && t < 95.2) withAlpha(E.outExpo(ed), () => tag('Edited', x + w - 60, by + 30, TAG.amber, { align: 'right', dot: false, icon: ICON.pencil }));
    });
    // waiting label + buttons
    const wv = vis(t, 91.77, 95.0, 0.45, 0.3);
    withAlpha(wv.a, () => { ICON.clock(x + 52, Y + 500, 24, '#C98300'); text('Waiting for review', x + 76, Y + 501, { size: 20, weight: 600, color: '#8A5300' }); });
    const bv = vis(t, 92.28, 1e9, 0.45);
    withAlpha(bv.a, () => {
      const by = Y + 500 + bv.dy * 0.5;
      let rx = x + w - 36;
      const btns = [
        { l: 'Reject', kind: 'ghost', icon: ICON.x, color: '#6B7280', hover: 0, press: 1 },
        { l: 'Edit', kind: 'outline', icon: ICON.pencil, color: '#C98300', hover: hoverAt(t, 93.35, 93.9), press: pressScale(t, 93.66) },
        { l: 'Approve', kind: 'filled', icon: ICON.check, color: C.success, hover: Math.max(hoverAt(t, 92.8, 93.3), hoverAt(t, 94.8, 95.3)), press: pressScale(t, 95.0) },
      ];
      btns.forEach((b) => { const r = button(b.l, rx, by, { kind: b.kind, color: b.color, icon: b.icon, align: 'right', hover: b.hover, press: b.press, size: 20, h: 50 }); rx -= r.w + 12; });
    });
    ctx.restore();
  });
  // cursor: hover Approve → click Edit → edit → click Approve
  const bxApprove = 1318, bxEdit = 1470, byb = 784;
  const keys = [{ t: 92.3, x: 1560, y: 880 }, { t: 92.8, x: bxApprove, y: byb + 6 }, { t: 93.35, x: bxApprove, y: byb + 6 }, { t: 93.6, x: bxEdit, y: byb + 6 }, { t: 94.0, x: bxEdit, y: byb + 6 }, { t: 94.8, x: bxApprove, y: byb + 6 }, { t: 95.8, x: bxApprove + 20, y: byb + 30 }];
  const cp = cursorAt(t, keys);
  ripple(cp.x, cp.y, t, 93.66, C.accent); ripple(cp.x, cp.y, t, 95.0, C.success);
  cursor(cp.x, cp.y, pressAt(t, [93.66, 95.0]), vis(t, 92.3, 95.4).a);
}

// ======================================================================= S16 consistent replies
function draftCard(x, y, w, h, c, blocks, catTag, t, tin, opt = {}) {
  const v = vis(t, tin, 1e9, 0.5);
  withAlpha(v.a, () => {
    ctx.save(); ctx.translate(0, v.dy);
    card(x, y, w, h, { r: 24, shadow: 1.2, label: 'draft ' + c.name });
    avatar(x + 56, y + 56, 24, c.ini, c.color);
    text(c.name, x + 94, y + 57, { size: 23, weight: 700, color: INK });
    tag(catTag, x + w - 32, y + 57, TAG.blue, { align: 'right' });
    blocks.forEach(([lab, content, link], i) => {
      const by = y + 110 + i * 84;
      const isAns = i === 1;
      const hl = isAns ? clamp01(Math.min((t - 101.13) / 0.3, (102.5 - t) / 0.4)) : 0;
      ctx.fillStyle = hl > 0 ? hexA(B.primary, 0.05 + 0.08 * hl) : 'rgba(17,24,39,0.035)'; rrect(x + 28, by, w - 56, 70, 14); ctx.fill();
      text(lab, x + 52, by + 36, { size: 18, weight: 600, color: B.muted });
      if (content) text(content, x + 190, by + 36, { size: 21, weight: 500, color: INK, maxW: w - 244 });
      else chip(link, x + 190, by + 36, { size: 18, h: 34, pad: 14, bg: hexA(B.primary, 0.1), fg: '#3148C7', icon: ICON.link });
    });
    ctx.restore();
  });
}
function sConsistent(t) {
  headline([['Consistent', 96.30], ['replies', 96.55]], t);
  const Y = 280, h = 470;
  draftCard(200, Y, 720, h, CUST.sam, [['Greeting', 'Hi Sam,'], ['Answer', `${CUST.sam.order} has shipped.`], ['Link', null, LINKS.track.label], ['Next step', 'Reply if you need anything else.']], 'Order status', t, 95.85);
  draftCard(1000, Y, 720, h, CUST.taylor, [['Greeting', 'Hi Taylor,'], ['Answer', 'You can update your address online.'], ['Link', null, LINKS.address.label], ['Next step', 'Reply if you need anything else.']], 'Address change', t, 96.05);
  // alignment guides across both cards (same structure)
  const gp = prog(t, 98.76, 0.7);
  if (gp > 0) {
    const fade = 1 - E.inOutCubic(prog(t, 100.6, 0.6));
    withAlpha(fade, () => {
      ctx.save(); ctx.setLineDash([8, 8]); ctx.strokeStyle = hexA(B.primary, 0.45); ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) { const gy = Y + 110 + i * 84 + 35; ctx.beginPath(); ctx.moveTo(220, gy); ctx.lineTo(220 + 1480 * E.outExpo(clamp01(gp - i * 0.08)), gy); ctx.stroke(); }
      ctx.restore();
    });
  }
  // pills
  const pills = [['Same policies', 97.53], ['Same tone', 98.13], ['Same structure', 98.76], ['No starting from scratch', 103.71]];
  const ws = pills.map(([l]) => chipWidth(l, { size: 20, h: 46, pad: 18, icon: ICON.check }));
  const total = ws.reduce((a, b) => a + b, 0) + 16 * (pills.length - 1);
  let px = 960 - total / 2;
  pills.forEach(([l, tin], i) => {
    const p = prog(t, tin, 0.5);
    if (p > 0) withAlpha(E.outExpo(p), () => withT(px + ws[i] / 2, 810, popScale(p), () => chip(l, 0, 0, { align: 'center', size: 20, h: 46, pad: 18, bg: '#FFFFFF', fg: INK, icon: ICON.check, iconColor: B.success, shadow: 0.6, stroke: 'rgba(17,24,39,0.06)' })));
    px += ws[i] + 16;
  });
}
function camConsistent(t) { return { s: 1 + 0.02 * E.inOutCubic(prog(t, 96.5, 8)), fx: 960, fy: 520 }; }

// ======================================================================= S15 missing info → follow-up questions
function sMissing(t) {
  headline([['Something', 105.57], ['unclear?', 106.05]], t, { tout: 108.2 });
  headline([['Ask', 108.39], ['follow-up', 109.65], ['questions', 110.10]], t);
  const Y = 290;
  // email card
  const ev = vis(t, 105.3, 1e9, 0.5);
  withAlpha(ev.a, () => {
    ctx.save(); ctx.translate(0, ev.dy);
    const x = 200, w = 680, h = 500;
    card(x, Y, w, h, { r: 24, shadow: 1.2, label: 'missing email' });
    avatar(x + 60, Y + 60, 26, CUST.taylor.ini, CUST.taylor.color);
    text(CUST.taylor.name, x + 100, Y + 48, { size: 24, weight: 700, color: INK });
    text(`${CUST.taylor.subject} · ${CUST.taylor.time}`, x + 100, Y + 78, { size: 19, weight: 500, color: MUTED });
    tag(CUST.taylor.cat, x + w - 32, Y + 60, TAG.blue, { align: 'right' });
    [560, 500].forEach((sw, k) => skel(x + 40, Y + 142 + k * 32, sw, 14));
    // fields
    const f1 = Y + 250, f2 = Y + 330;
    const miss = prog(t, 107.01, 0.5);
    ctx.fillStyle = miss > 0 ? hexA(C.accent, 0.1 * E.outExpo(miss)) : 'rgba(17,24,39,0.035)'; rrect(x + 32, f1 - 32, w - 64, 64, 14); ctx.fill();
    text('Order number', x + 56, f1 + 1, { size: 21, weight: 600, color: INK });
    ctx.save(); ctx.setLineDash([6, 6]); ctx.strokeStyle = miss > 0 ? hexA('#C98300', 0.9) : 'rgba(17,24,39,0.25)'; ctx.lineWidth = 2; rrect(x + w - 256, f1 - 20, 200, 40, 10); ctx.stroke(); ctx.restore();
    if (miss > 0) withAlpha(E.outExpo(miss), () => text('Not provided', x + w - 156, f1 + 1, { size: 18, weight: 600, color: '#8A5300', align: 'center' }));
    ctx.fillStyle = 'rgba(17,24,39,0.035)'; rrect(x + 32, f2 - 32, w - 64, 64, 14); ctx.fill();
    text('New address', x + 56, f2 + 1, { size: 21, weight: 600, color: INK });
    tag('Provided', x + w - 56, f2, TAG.green, { align: 'right' });
    // banner
    const bp = prog(t, 107.34, 0.5);
    if (bp > 0) withAlpha(E.outExpo(bp), () => withT(x + w / 2, Y + 432, 0.94 + 0.06 * popScale(bp), () => {
      const bw = w - 64; ctx.fillStyle = hexA(C.accent, 0.16); rrect(-bw / 2, -30, bw, 60, 14); ctx.fill();
      ctx.fillStyle = C.accent; rrect(-bw / 2, -30, 6, 60, 3); ctx.fill();
      ICON.alert(-bw / 2 + 36, 0, 26, '#B26A00');
      text('Missing: order number', -bw / 2 + 64, 1, { size: 22, weight: 700, color: '#7A4A00' });
    }));
    ctx.restore();
  });
  connector(880, Y + 432, 960, Y + 60, prog(t, 108.2, 0.4), hexA(B.primary, 0.7));
  // follow-up card
  const fv = vis(t, 108.39, 1e9, 0.5);
  withAlpha(fv.a, () => {
    ctx.save(); ctx.translate((1 - fv.e) * 50, 0);
    const x = 960, w = 760, h = 500;
    card(x, Y, w, h, { r: 24, shadow: 1.3, stroke: hexA(B.primary, 0.25), label: 'follow-up card' });
    cardHeader(x + 36, Y + 50, 'Follow-up questions', ICON.question, INK, B.primary);
    const qs = [['Order number?', 108.96], ['Email used at checkout?', 109.65], ['Delivery postcode?', 110.10]];
    qs.forEach(([q, tin], i) => {
      const p = prog(t, tin, 0.45); if (p <= 0) return;
      const qy = Y + 128 + i * 84;
      withAlpha(E.outExpo(p), () => {
        ctx.save(); ctx.translate((1 - E.outExpo(p)) * 40, 0);
        ctx.fillStyle = 'rgba(17,24,39,0.035)'; rrect(x + 32, qy - 32, w - 64, 64, 14); ctx.fill();
        withT(x + 70, qy, popScale(p), () => { ctx.fillStyle = hexA(B.primary, 0.12); ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill(); text(String(i + 1), 0, 1, { size: 18, weight: 700, color: '#3148C7', align: 'center' }); });
        text(q, x + 104, qy + 1, { size: 22, weight: 600, color: INK });
        ctx.restore();
      });
    });
    const na = prog(t, 111.36, 0.5);
    if (na > 0) withAlpha(E.outExpo(na), () => withT(x + w / 2, Y + 432, popScale(na), () => tag('No assumptions', 0, 0, TAG.green, { align: 'center', icon: ICON.check, dot: false, size: 20, h: 42 })));
    ctx.restore();
  });
}

// ======================================================================= S17 audit log
function sAudit(t) {
  headline([['Everything', 112.65], ['is', 113.13], ['logged', 113.25]], t);
  const x = 360, Y = 290, w = 1200, h = 540;
  const v = vis(t, 112.6, 1e9, 0.5);
  withAlpha(v.a, () => {
    ctx.save(); ctx.translate(0, v.dy);
    card(x, Y, w, h, { r: 24, shadow: 1.2, label: 'audit log' });
    cardHeader(x + 36, Y + 50, 'Audit log', ICON.list, INK, B.primary);
    text(`${CUST.casey.name} · ${CUST.casey.subject} · ${CUST.casey.order}`, x + w - 36, Y + 51, { size: 19, weight: 500, color: MUTED, align: 'right' });
    ctx.fillStyle = 'rgba(17,24,39,0.07)'; ctx.fillRect(x + 32, Y + 92, w - 64, 1);
    const entries = [
      ['09:27:04', 'Received', 'Support inbox', 115.50],
      ['09:27:06', 'Classified', 'Refund request', 117.15],
      ['09:27:09', 'Draft created', 'Returns policy', 118.92],
      ['09:31:40', 'Approved', 'Support Team', 119.88],
      ['09:31:42', 'Sent', 'Email reply', 121.26],
    ];
    entries.forEach(([ts, label, detail, tin], i) => {
      const p = prog(t, tin - 0.1, 0.4); if (p <= 0) return;
      const ey = Y + 142 + i * 84;
      withAlpha(E.outExpo(p), () => {
        ctx.save(); ctx.translate(0, (1 - E.outExpo(p)) * 14);
        if (i > 0) { ctx.fillStyle = hexA(B.primary, 0.25); ctx.fillRect(x + 213, ey - 84 + 20, 2, 44); }
        text(ts, x + 40, ey + 1, { size: 20, weight: 500, color: MUTED });
        checkBadge(x + 214, ey, 17, prog(t, tin + 0.25, 0.6), B.success);
        const lab = typed(label, t, tin - 0.05, tin + 0.3);
        text(lab, x + 252, ey + 1, { size: 24, weight: 600, color: INK });
        withAlpha(E.outExpo(prog(t, tin + 0.3, 0.4)), () => tag(detail, x + w - 40, ey, i === 1 ? TAG.amber : i === 3 ? TAG.green : TAG.blue, { align: 'right' }));
        ctx.restore();
      });
    });
    ctx.restore();
  });
}

// ======================================================================= S18 safe failure
function sFailure(t) {
  headline([['If', 122.67], ['anything', 122.88], ['fails', 123.24]], t, { tout: 127.3 });
  headline([['It', 127.56], ['fails', 127.77], ['safely', 128.16]], t);
  const x = 410, Y = 290, w = 1100, h = 540;
  const v = vis(t, 122.5, 1e9, 0.5);
  withAlpha(v.a, () => {
    ctx.save(); ctx.translate(0, v.dy);
    card(x, Y, w, h, { r: 24, shadow: 1.2, label: 'status panel' });
    cardHeader(x + 36, Y + 50, 'Workflow status', ICON.chart, INK, '#C98300');
    ctx.fillStyle = 'rgba(17,24,39,0.07)'; ctx.fillRect(x + 32, Y + 92, w - 64, 1);
    // missing data row
    const md = prog(t, 124.53, 0.5);
    if (md > 0) withAlpha(E.outExpo(md), () => {
      const ry = Y + 150;
      ctx.fillStyle = 'rgba(17,24,39,0.035)'; rrect(x + 32, ry - 34, w - 64, 68, 14); ctx.fill();
      ICON.alert(x + 70, ry, 26, '#B26A00');
      text('Missing data', x + 104, ry + 1, { size: 23, weight: 600, color: INK });
      tag('Flagged', x + w - 56, ry, TAG.amber, { align: 'right' });
    });
    // banner
    const bp = prog(t, 125.94, 0.5);
    if (bp > 0) withAlpha(E.outExpo(bp), () => withT(x + w / 2, Y + 250, 0.95 + 0.05 * popScale(bp), () => {
      const bw = w - 64; ctx.fillStyle = hexA(C.accent, 0.18); rrect(-bw / 2, -38, bw, 76, 16); ctx.fill();
      ctx.fillStyle = C.accent; rrect(-bw / 2, -38, 6, 76, 3); ctx.fill();
      ICON.alert(-bw / 2 + 42, 0, 30, '#B26A00');
      text('Knowledge base unavailable', -bw / 2 + 76, 1, { size: 26, weight: 700, color: '#7A4A00' });
      tag('Paused safely', bw / 2 - 24, 0, TAG.amberOutline, { align: 'right' });
    }));
    // retry / alert rows
    const rows = [['Retry scheduled', ICON.refresh, 128.16, 'In 5 minutes'], ['Owner alerted', ICON.bell, 129.33, 'Support Team']];
    rows.forEach(([l, icon, tin, detail], i) => {
      const p = prog(t, tin - 0.15, 0.45); if (p <= 0) return;
      const ry = Y + 356 + i * 92;
      withAlpha(E.outExpo(p), () => {
        ctx.save(); ctx.translate((1 - E.outExpo(p)) * 30, 0);
        ctx.fillStyle = 'rgba(17,24,39,0.035)'; rrect(x + 32, ry - 34, w - 64, 68, 14); ctx.fill();
        icon(x + 70, ry, 26, '#374151');
        text(l, x + 104, ry + 1, { size: 23, weight: 600, color: INK });
        text(detail, x + w - 110, ry + 1, { size: 20, weight: 500, color: MUTED, align: 'right' });
        checkBadge(x + w - 70, ry, 17, prog(t, tin + 0.1, 0.6), C.success);
        ctx.restore();
      });
    });
    ctx.restore();
  });
}

// ======================================================================= S19 outcome (dark)
function darkCard(x, y, w, h, label) { card(x, y, w, h, { r: 24, fill: D.card, shadow: 1.4, shadowColor: 'rgba(0,0,0,0.35)', stroke: 'rgba(255,255,255,0.08)', label }); }
function sOutcome(t) {
  headline([['Illustrative', 131.25, D.accent], ['estimate', 131.82]], t, { color: D.text });
  const Y = 290;
  // assumptions
  const av = vis(t, 132.3, 1e9, 0.5);
  withAlpha(av.a, () => {
    ctx.save(); ctx.translate(0, av.dy);
    const x = 200, w = 680, h = 540;
    darkCard(x, Y, w, h, 'assumptions');
    text('Assumptions', x + 40, Y + 56, { size: 26, weight: 700, color: D.text });
    chip('Illustrative assumptions', x + w - 36, Y + 56, { align: 'right', size: 18, h: 36, pad: 14, bg: hexA(D.accent, 0.14), fg: D.accent });
    const rows = [['Manual:', '3 min/email', 135.18], ['Review:', '0:45/email', 140.07], ['Volume:', '500 emails/month', 145.92]];
    rows.forEach(([k, val, tin], i) => {
      const p = prog(t, tin, 0.5); if (p <= 0) return;
      const ry = Y + 150 + i * 92;
      withAlpha(E.outExpo(p), () => {
        ctx.save(); ctx.translate((1 - E.outExpo(p)) * 30, 0);
        ctx.fillStyle = 'rgba(255,255,255,0.04)'; rrect(x + 32, ry - 36, w - 64, 72, 16); ctx.fill();
        const kw = text(k, x + 60, ry + 1, { size: 24, weight: 500, color: D.muted });
        text(val, x + 60 + kw + 12, ry + 1, { size: 28, weight: 700, color: D.text });
        ctx.restore();
      });
    });
    const ng = prog(t, 153.96, 0.5);
    if (ng > 0) withAlpha(E.outExpo(ng), () => withT(x + w / 2, Y + 470, popScale(ng), () => chip('Not a guaranteed result', 0, 0, { align: 'center', size: 20, h: 44, pad: 18, bg: 'rgba(255,255,255,0.06)', fg: D.text, stroke: 'rgba(255,255,255,0.18)' })));
    ctx.restore();
  });
  // estimate
  const ev = vis(t, 143.6, 1e9, 0.5);
  withAlpha(ev.a, () => {
    ctx.save(); ctx.translate((1 - ev.e) * 50, 0);
    const x = 960, w = 760, h = 540;
    darkCard(x, Y, w, h, 'estimate');
    text('Estimate', x + 40, Y + 56, { size: 26, weight: 700, color: D.text });
    // ~2 min saved/email
    const p2 = prog(t, 143.88, 0.5);
    const tilde = measure('~', 44, 700);
    withAlpha(E.outExpo(p2), () => {
      text('~', x + 40, Y + 140, { size: 44, weight: 700, color: D.success });
      rollText([{ t: 143.6, s: '0' }, { t: 143.88, s: '2' }], t, x + 40 + tilde + 2, Y + 140, { size: 44, color: D.success });
      text('min saved/email', x + 40 + tilde + 2 + measure('2', 44, 700) + 12, Y + 140, { size: 44, weight: 700, color: D.success });
    });
    withAlpha(E.outExpo(prog(t, 144.3, 0.5)), () => text('3:00 − 0:45 = 2:15, rounded down', x + 40, Y + 190, { size: 20, weight: 500, color: D.muted }));
    // math
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x + 40, Y + 226, w - 80, 1);
    withAlpha(E.outExpo(prog(t, 146.61, 0.5)), () => text('2 min × 500 emails = 1,000 min', x + 40, Y + 268, { size: 26, weight: 600, color: D.text }));
    withAlpha(E.outExpo(prog(t, 147.63, 0.5)), () => text('1,000 min ÷ 60 ≈ 16.7 hours', x + 40, Y + 314, { size: 26, weight: 600, color: D.text }));
    // result
    const pr = prog(t, 148.23, 0.5);
    if (pr > 0) {
      withAlpha(E.outExpo(pr), () => {
        ctx.fillStyle = hexA(D.accent, 0.1); rrect(x + 32, Y + 360, w - 64, 104, 18); ctx.fill();
        const tl = measure('~', 50, 800);
        text('~', x + 60, Y + 412, { size: 50, weight: 800, color: D.accent });
        rollText([{ t: 148.0, s: '0' }, { t: 148.23, s: '16' }, { t: 148.98, s: '16–17' }], t, x + 60 + tl + 2, Y + 412, { size: 50, weight: 800, color: D.accent });
        const hw = measure('16–17', 50, 800);
        withAlpha(E.outExpo(prog(t, 149.55, 0.45)), () => text('hours/month', x + 60 + tl + 2 + hw + 14, Y + 414, { size: 34, weight: 700, color: D.text }));
      });
      withAlpha(E.outExpo(prog(t, 150.39, 0.45)), () => text('(estimate)', x + 40, Y + 500, { size: 20, weight: 500, color: D.muted }));
    }
    ctx.restore();
  });
}

// ======================================================================= S20 transparent close
function sClose(t) {
  const collapse = E.inOutCubic(prog(t, 160.9, 0.8));
  const trust = [['Independent portfolio prototype', 155.52], ['Fictional data', 158.04], ['Results vary', 159.36]];
  // stacked (large) → row (small)
  const bigW = trust.map(([l]) => chipWidth(l, { size: 28, h: 64, pad: 26, icon: ICON.check }));
  const smW = trust.map(([l]) => chipWidth(l, { size: 19, h: 42, pad: 16, icon: ICON.check }));
  const rowTotal = smW.reduce((a, b) => a + b, 0) + 16 * 2;
  let rx = 960 - rowTotal / 2;
  trust.forEach(([l, tin], i) => {
    const p = prog(t, tin, 0.5); if (p <= 0) return;
    const bx = 960, by = 420 + i * 96;
    const sx = rx + smW[i] / 2, sy = 820;
    rx += smW[i] + 16;
    const x = lerp(bx, sx, collapse), y = lerp(by, sy, collapse);
    const size = lerp(28, 19, collapse), h = lerp(64, 42, collapse), pad = lerp(26, 16, collapse);
    withAlpha(E.outExpo(p), () => withT(x, y + (1 - E.outExpo(p)) * 24, popScale(p), () => {
      const w = chipWidth(l, { size, h, pad, icon: ICON.check });
      card(-w / 2, -h / 2, w, h, { r: h / 2, fill: 'rgba(255,255,255,0.06)', shadow: 0, stroke: 'rgba(255,255,255,0.16)', label: l });
      const s = h * 0.5; const cx = -w / 2 + pad;
      checkBadge(cx + s / 2, 0, s * 0.55, prog(t, tin + 0.1, 0.6), D.success, true);
      text(l, cx + s + 10, 1, { size, weight: 600, color: D.text });
    }));
  });
  // final headline
  wordsLine([['Faster', 161.97], ['replies.', 162.45]], 960, 380, { size: 72, weight: 800, color: D.text });
  wordsLine([['More', 163.29], ['consistent', 163.59, D.accent], ['support.', 164.13]], 960, 474, { size: 72, weight: 800, color: D.text });
  wordsLine([['Less', 165.12], ['time', 165.42], ['typing', 165.72], ['the', 166.02], ['same', 166.11], ['answers.', 166.44]], 960, 590, { size: 30, weight: 500, color: D.muted });
  wordsLine([['Focus', 167.88], ['on', 168.33], ['customers', 168.48], ['who', 168.99], ['need', 169.14], ['a', 169.44], ['human.', 169.50]], 960, 640, { size: 30, weight: 500, color: D.muted });
  const br = prog(t, 162.8, 0.6);
  withAlpha(E.outExpo(br) * 0.9, () => text('Northwind Goods · Support Team', 960, 730, { size: 20, weight: 600, color: D.muted, align: 'center' }));
}
function camClose(t) { return { s: 1 + 0.03 * E.inOutCubic(prog(t, 161.2, 9)), fx: 960, fy: 540 }; }

// ======================================================================= timeline
// in/out: transition type + duration. Times include the transition windows.
export const SCENES = [
  { id: 'hook', t0: 0, t1: 16.45, sec: 'A', inT: ['fade', 0.01], outT: ['slide', 0.45], draw: sHook },
  { id: 'inbox', t0: 16.15, t1: 22.6, sec: 'A', inT: ['slide', 0.45], outT: ['slide', 0.45], draw: sInbox, cam: camInbox },
  { id: 'search', t0: 22.15, t1: 32.8, sec: 'A', inT: ['slide', 0.45], outT: ['slide', 0.45], draw: sSearch },
  { id: 'tricky', t0: 32.35, t1: 39.8, sec: 'A', inT: ['slide', 0.45], outT: ['slide', 0.45], draw: sTricky, cam: camTricky },
  { id: 'problems', t0: 39.35, t1: 54.6, sec: 'A', inT: ['slide', 0.45], outT: ['blur', 0.4], draw: sProblems, cam: camProblems },
  { id: 'pivot', t0: 54.4, t1: 56.75, sec: 'AB', inT: ['blur', 0.5], outT: ['blur', 0.4], draw: sPivot },
  { id: 'workflow', t0: 56.4, t1: 78.05, sec: 'B', inT: ['zoom', 0.45], outT: ['zoom', 0.4], draw: sWorkflow, cam: camWorkflow },
  { id: 'approval', t0: 77.85, t1: 95.9, sec: 'C', inT: ['zoom', 0.45], outT: ['slide', 0.45], draw: sApproval },
  { id: 'consistent', t0: 95.5, t1: 105.4, sec: 'B', inT: ['slide', 0.45], outT: ['slide', 0.45], draw: sConsistent, cam: camConsistent },
  { id: 'missing', t0: 105.0, t1: 112.65, sec: 'B', inT: ['slide', 0.45], outT: ['slide', 0.45], draw: sMissing },
  { id: 'audit', t0: 112.25, t1: 122.6, sec: 'B', inT: ['slide', 0.45], outT: ['slide', 0.45], draw: sAudit },
  { id: 'failure', t0: 122.2, t1: 130.35, sec: 'C', inT: ['slide', 0.45], outT: ['zoom', 0.4], draw: sFailure },
  { id: 'outcome', t0: 130.15, t1: 155.25, sec: 'D', inT: ['zoom', 0.45], outT: ['fade', 0.45], draw: sOutcome },
  { id: 'close', t0: 154.95, t1: 173.0, sec: 'D', inT: ['fade', 0.5], outT: ['fade', 0.9], draw: sClose, cam: camClose },
];
export const END_T = 172.6;

// Section background keyframes (gradient sweep between palettes).
export const SECTIONS = [
  { t: 0, key: 'A' },
  { t: 54.6, d: 1.7, key: 'B' },
  { t: 77.6, d: 0.8, key: 'C' },
  { t: 95.35, d: 0.7, key: 'B' },
  { t: 122.15, d: 0.7, key: 'C' },
  { t: 129.95, d: 0.7, key: 'D' },
];
