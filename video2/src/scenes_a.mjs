// Section A (scheduling friction) — scenes 1–9. Times are seconds in the voiceover (data/captions.json).
import {
  ctx, PAL, E, clamp01, lerp, prog, vis, popScale, hexA, mixHex, text, measure, card, chip, chipWidth, ICON, skel,
  withAlpha, withT, rrect, sweep, checkBadge, cursor, ripple, cursorAt, pressAt, hoverAt, pressScale, font,
} from './lib.mjs';
import { SLOTS, TAG, tag, headline, eyebrow, appWindow, emailRow, rollText, bubble } from './components.mjs';

const A = PAL.A, B = PAL.B;
const INK = '#111827', MUTED = '#6B7280';
const circle = (x, y, r, fill) => { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };
const slideX = (v, d = 60) => (1 - v.e) * d;

// ======================================================================= 1 hook: five emails is too much
export function sHook(t) {
  headline([['Five', 1.50], ['emails', 1.80], ['is', 2.67], ['too', 3.12], ['much', 3.39, A.warn]], t, { tout: 4.45 });
  headline([['Just', 5.37], ['pick', 5.82], ['a', 6.00], ['time', 6.03, A.accent]], t);
  const collapse = E.inOutCubic(prog(t, 4.47, 0.55));
  const items = [
    ['Request', 'left', 0.30, ICON.mail], ['Suggest', 'right', 0.63, ICON.clock], ['Reschedule', 'left', 0.95, ICON.refresh],
    ['Slot gone', 'right', 1.50, ICON.x], ['Restart', 'left', 1.80, ICON.refresh],
  ];
  const LX = 700, RX = 1220;
  // zigzag thread (tension) behind the bubbles on "complicated"
  const th = prog(t, 3.0, 0.6);
  if (th > 0 && collapse < 1) withAlpha((1 - collapse) * 0.9, () => {
    ctx.save(); ctx.strokeStyle = hexA(A.warn, 0.35); ctx.lineWidth = 2.5; ctx.setLineDash([3, 9]); ctx.lineCap = 'round';
    ctx.beginPath();
    const pts = items.map((it, i) => [it[1] === 'left' ? LX + 110 : RX - 110, 330 + i * 104]);
    const n = (pts.length - 1) * E.outCubic(th);
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i <= Math.ceil(n); i++) { const k = Math.min(1, n - (i - 1)); ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)); }
    ctx.stroke(); ctx.restore();
  });
  items.forEach(([label, side, tin, icon], i) => {
    const p = prog(t, tin, 0.45); if (p <= 0) return;
    const e = E.outExpo(p);
    const y = 330 + i * 104, x = side === 'left' ? LX : RX;
    const warn = label === 'Slot gone';
    const tense = E.outExpo(prog(t, 3.39, 0.5));
    const cx = lerp(x, 960, collapse), cy = lerp(y + (1 - e) * 24, 560, collapse);
    withAlpha(e * (1 - collapse), () => withT(cx, cy, popScale(p) * lerp(1, 0.85, collapse), () => {
      const fill = warn ? mixHex('#FFFFFF', '#FDECEC', tense) : side === 'right' ? '#FFF3EA' : '#FFFFFF';
      bubble(0, 0, label, { side, icon, iconColor: warn ? A.warn : A.accent, color: fill, fg: INK, size: 24, h: 60 });
      const bx = side === 'left' ? -34 : 34;
      circle(bx, 0, 17, warn ? hexA(A.warn, 0.14) : hexA(A.accent, 0.16));
      text(String(i + 1), bx, 1, { size: 17, weight: 700, color: warn ? '#B42323' : '#A34A0E', align: 'center', qa: false });
    }));
  });
  // "available times" card: pick one and move on
  const cv = vis(t, 4.8, 1e9, 0.5);
  if (cv.a > 0) withAlpha(cv.a, () => {
    ctx.save(); ctx.translate(0, cv.dy);
    const x = 620, y = 380, w = 680, h = 340;
    card(x, y, w, h, { r: 28, shadow: 1.3, label: 'available times card' });
    ICON.calendar(x + 52, y + 60, 28, A.accent);
    text('Available times', x + 82, y + 61, { size: 26, weight: 700, color: INK });
    const size = 24, hh = 60, pad = 22;
    const ws = SLOTS.map((s) => chipWidth(s, { size, h: hh, pad, icon: ICON.clock }));
    const total = ws.reduce((a, b) => a + b, 0) + 24 * 2;
    let sx = 960 - total / 2;
    const picked = t >= 5.82;
    SLOTS.forEach((s, i) => {
      const iv = vis(t, 4.95 + i * 0.1, 1e9);
      const cxx = sx + ws[i] / 2, cy = y + 170;
      const hov = i === 1 ? hoverAt(t, 5.45, 7.5) : 0;
      const pr = i === 1 ? pressScale(t, 5.82) : 1;
      const sel = i === 1 ? E.outExpo(prog(t, 5.82, 0.3)) : 0;
      withAlpha(iv.a * (picked && i !== 1 ? lerp(1, 0.45, E.outExpo(prog(t, 5.9, 0.4))) : 1), () => withT(cxx, cy + iv.dy, pr * (1 + 0.025 * hov), () => {
        chip(s, 0, 0, { align: 'center', size, h: hh, pad, icon: ICON.clock, bg: sel > 0.5 ? A.accent : '#FFFFFF', fg: sel > 0.5 ? '#FFFFFF' : INK, stroke: sel > 0.5 ? null : 'rgba(17,24,39,0.12)', shadow: 0.3 + 0.6 * hov, iconColor: sel > 0.5 ? '#FFFFFF' : A.accent });
        if (hov > 0 && hov < 1) sweep(-ws[i] / 2, -hh / 2, ws[i], hh, hh / 2, hov);
      }));
      sx += ws[i] + 24;
    });
    // confirmed
    const cp = prog(t, 6.51, 0.6);
    if (cp > 0) {
      checkBadge(904, y + 268, 20, cp, '#19B89D');
      withAlpha(E.outExpo(prog(t, 6.66, 0.4)), () => text('Confirmed', 936, y + 269, { size: 24, weight: 700, color: '#0B7A67' }));
    }
    ctx.restore();
  });
  const keys = [{ t: 4.9, x: 1250, y: 800 }, { t: 5.6, x: 972, y: 560 }, { t: 6.6, x: 980, y: 566 }, { t: 7.3, x: 1150, y: 700 }];
  const cp = cursorAt(t, keys);
  ripple(cp.x, cp.y, t, 5.82, A.accent);
  cursor(cp.x, cp.y, pressAt(t, [5.82]), vis(t, 4.95, 6.95).a);
}

// ======================================================================= 2 back-and-forth timeline
export function sBackForth(t) {
  eyebrow('Quick question', t, 7.53, 20.2, { dot: A.accent });
  headline([['How', 8.64], ['many', 8.79], ['requests', 9.48], ['turn', 11.46], ['into', 11.76], ['back-and-forth?', 11.97, A.accent]], t);
  // "requests this week" → some turn into back-and-forth (payoff before the timeline)
  {
    const n = 8, tw = 120, gap = 24, x0 = (1920 - (n * tw + (n - 1) * gap)) / 2, y0 = 400;
    const loopIdx = [1, 3, 4, 6];
    for (let i = 0; i < n; i++) {
      const v = vis(t, 9.48 + i * 0.07, 13.25, 0.4); if (v.a <= 0) continue;
      const lp = loopIdx.includes(i) ? E.outExpo(prog(t, 11.97 + loopIdx.indexOf(i) * 0.12, 0.45)) : 0;
      const cx = x0 + i * (tw + gap) + tw / 2, cy = y0 + tw / 2;
      withAlpha(v.a, () => withT(cx, cy + (1 - v.a) * 16, popScale(prog(t, 9.48 + i * 0.07, 0.45)), () => {
        card(-tw / 2, -tw / 2, tw, tw, { r: 24, shadow: 0.7, fill: lp > 0.5 ? '#FFF4EC' : '#FFFFFF', stroke: lp > 0 ? hexA(A.accent, 0.35 * lp) : 'rgba(17,24,39,0.06)', label: 'week tile' });
        ICON.mail(0, 0, 40, mixHex('#9CA3AF', A.accent, lp));
        if (lp > 0) withAlpha(lp, () => withT(tw / 2 - 12, -tw / 2 + 12, popScale(lp), () => { circle(0, 0, 18, A.accent); ICON.refresh(0, 0, 20, '#FFFFFF'); }));
      }));
    }
    const lv = vis(t, 10.86, 13.25, 0.4);
    if (lv.a > 0) withAlpha(lv.a, () => text('Requests this week', 960, y0 + tw + 64, { size: 24, weight: 600, color: MUTED, align: 'center' }));
    const bv = vis(t, 12.3, 13.25, 0.4);
    if (bv.a > 0) withAlpha(bv.a, () => withT(960, y0 + tw + 124, popScale(prog(t, 12.3, 0.45)), () => tag('4 of 8 need back-and-forth', 0, 0, TAG.warm, { align: 'center', icon: ICON.refresh, dot: false })));
  }
  const rows = [
    { tin: 13.71, who: 'Customer', label: 'Asks for a time', meta: 'Mon 9:00', icon: ICON.mail },
    { tin: 15.45, who: 'You', label: 'Suggest Slot A', meta: 'Mon 11:30', icon: ICON.clock },
    { tin: 16.80, who: 'Customer', label: 'Replies late', meta: 'Wed 8:15', icon: ICON.mail, delay: 17.28 },
    { tin: 18.00, who: null, label: 'Slot A taken', meta: '', icon: ICON.x, warn: true },
    { tin: 19.53, who: 'You', label: 'Start over', meta: 'Wed 9:00', icon: ICON.refresh },
  ];
  const X = 200, Wd = 960, H0 = 318;
  // timeline spine
  const sp = E.outExpo(prog(t, 13.5, 6.5));
  ctx.fillStyle = 'rgba(17,24,39,0.1)'; rrect(X + 22, H0 + 36, 3, 400 * sp, 1.5); ctx.fill();
  rows.forEach((r, i) => {
    const v = vis(t, r.tin, 1e9, 0.5); if (v.a <= 0) return;
    const y = H0 + i * 100, cy = y + 36;
    withAlpha(v.a, () => {
      circle(X + 23.5, cy, 9, r.warn ? A.warn : A.accent); circle(X + 23.5, cy, 4, '#FFFFFF');
      ctx.save(); ctx.translate(slideX(v, 40), 0);
      const x = X + 60, w = Wd - 60;
      card(x, y, w, 72, { r: 18, shadow: 0.7, fill: r.warn ? '#FDEFEF' : '#FFFFFF', stroke: r.warn ? hexA(A.warn, 0.35) : 'rgba(17,24,39,0.06)', label: r.label });
      circle(x + 40, cy, 20, r.warn ? hexA(A.warn, 0.14) : hexA(A.accent, 0.13));
      r.icon(x + 40, cy, 22, r.warn ? A.warn : A.accent);
      let tx = x + 76;
      if (r.who) { const tw = tag(r.who, tx, cy, r.who === 'You' ? TAG.warm : TAG.neutral, { size: 16, h: 30, pad: 12, dot: false }); tx += tw.w + 14; }
      text(r.label, tx, cy + 1, { size: 23, weight: 600, color: r.warn ? '#B42323' : INK });
      if (r.meta) text(r.meta, x + w - 24, cy + 1, { size: 19, weight: 500, color: MUTED, align: 'right' });
      if (r.delay) {
        const dp = prog(t, r.delay, 0.5);
        if (dp > 0) withAlpha(E.outExpo(dp), () => withT(x + w - 150, cy, popScale(dp), () => tag('+2 days', 0, 0, TAG.warn, { align: 'right', icon: ICON.clock, dot: false })));
      }
      ctx.restore();
    });
  });
  // counter card
  const cv = vis(t, 13.5, 1e9, 0.5);
  if (cv.a > 0) withAlpha(cv.a, () => {
    ctx.save(); ctx.translate(slideX(cv), 0);
    const x = 1220, y = 318, w = 500, h = 472;
    card(x, y, w, h, { r: 28, shadow: 1.2, label: 'counter card' });
    text('Back-and-forth', x + 48, y + 64, { size: 26, weight: 600, color: MUTED });
    const heat = E.inOutCubic(prog(t, 18.45, 0.8));
    rollText([{ t: 13.71, s: '1' }, { t: 15.45, s: '2' }, { t: 16.80, s: '3' }, { t: 18.45, s: '4' }, { t: 19.71, s: '5' }], t, x + 48, y + 200, { size: 170, color: mixHex(INK, A.warn, heat * 0.85) });
    text('messages', x + 48, y + 312, { size: 24, weight: 500, color: MUTED });
    const tr = prog(t, 20.0, 0.4);
    if (tr > 0) withAlpha(E.outExpo(tr), () => withT(x + 48, y + 400, 1, () => tag('1 → 5', 0, 0, TAG.warn, { size: 22, h: 44, pad: 18 })));
    ctx.restore();
  });
}
export function camBackForth(t) { const p = E.inOutCubic(prog(t, 17.9, 1.0)) * (1 - E.inOutCubic(prog(t, 19.9, 0.5))); return { s: 1 + 0.03 * p, fx: 700, fy: 640 }; }

// ======================================================================= 3 constant coordination
export function sCoord(t) {
  headline([['Not', 21.00], ['difficult', 21.27], ['work', 21.75]], t, { tout: 22.3 });
  headline([['Constant', 22.74], ['coordination', 23.25, A.accent]], t);
  const C0 = { x: 960, y: 560 };
  const sats = [['Customer', 560, 400, ICON.user, 20.79], ['Email', 1360, 400, ICON.mail, 21.0], ['Team calendar', 560, 720, ICON.calendar, 21.27], ['Reminders', 1360, 720, ICON.bell, 21.5]];
  const phase = t < 22.74 ? 0.45 * t : 0.45 * 22.74 + 0.95 * (t - 22.74);
  sats.forEach(([label, x, y, icon, tin], k) => {
    const v = vis(t, tin, 1e9, 0.5); if (v.a <= 0) return;
    withAlpha(v.a, () => {
      ctx.save(); ctx.strokeStyle = hexA(A.accent, 0.35); ctx.lineWidth = 2; ctx.setLineDash([2, 8]); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(C0.x, C0.y); ctx.stroke(); ctx.restore();
      for (let j = 0; j < 2; j++) {
        let u = (phase + k * 0.27 + j * 0.5) % 1; if (j === 1) u = 1 - u;
        circle(lerp(x, C0.x, u), lerp(y, C0.y, u), 6, hexA(A.accent, 0.85));
      }
      const w = chipWidth(label, { size: 24, h: 64, pad: 24, icon });
      withT(x, y + v.dy, popScale(prog(t, tin, 0.5)), () => chip(label, 0, 0, { align: 'center', size: 24, h: 64, pad: 24, icon, iconColor: A.accent, bg: '#FFFFFF', fg: INK, shadow: 1 }));
    });
  });
  const cv = vis(t, 20.6, 1e9, 0.5);
  withAlpha(cv.a, () => {
    const pulse = t > 22.74 ? 0.5 + 0.5 * Math.sin((t - 22.74) * 5) : 0;
    const ring = E.outExpo(prog(t, 23.25, 0.8));
    if (ring > 0) { ctx.save(); ctx.strokeStyle = hexA(A.accent, 0.35 * (1 - ring)); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(C0.x, C0.y, 90 + 90 * ring, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
    withT(C0.x, C0.y, popScale(prog(t, 20.6, 0.5)) * (1 + 0.02 * pulse), () => {
      card(-110, -60, 220, 120, { r: 28, shadow: 1.4, label: 'booking hub' });
      ICON.calendar(0, -18, 34, A.accent);
      text('Booking', 0, 26, { size: 24, weight: 700, color: INK, align: 'center' });
    });
  });
}

// ======================================================================= 4 unstructured requests
export function sUnstructured(t) {
  eyebrow('Incoming requests', t, 24.36, 1e9, { dot: A.accent });
  headline([['Unstructured', 26.40, A.accent], ['messages', 27.06]], t);
  const quotes = [
    ['“Anytime next week”', '“Anytime', 29.07], ['“After 3”', '“After 3”', 30.81], ['“I need this urgently”', 'urgently”', 32.40],
  ];
  quotes.forEach(([q, key, tin], i) => {
    const v = vis(t, tin, 1e9, 0.5); if (v.a <= 0) return;
    const x = 200, y = 318 + i * 176, w = 700, h = 144;
    withAlpha(v.a, () => {
      ctx.save(); ctx.translate(-slideX(v), v.dy * 0.5);
      card(x, y, w, h, { r: 22, shadow: 1, label: 'quote ' + i });
      circle(x + 52, y + 50, 22, 'rgba(17,24,39,0.07)'); ICON.user(x + 52, y + 50, 26, '#9CA3AF');
      text('Customer message', x + 88, y + 51, { size: 18, weight: 600, color: MUTED });
      const qy = y + 100, qx = x + 36;
      const pre = q.slice(0, q.indexOf(key));
      const kx = qx + measure(pre, 30, 600), kw = measure(key, 30, 600);
      const mk = E.outExpo(prog(t, tin + (i === 2 ? 0.69 : 0.25), 0.5));
      if (mk > 0) { ctx.fillStyle = hexA(A.accent, 0.24); rrect(kx - 4, qy - 20, (kw + 8) * mk, 40, 8); ctx.fill(); }
      text(q, qx, qy, { size: 30, weight: 600, color: INK, maxW: w - 72 });
      ctx.restore();
    });
  });
  // requests window: details scattered across emails and forms
  const wv = vis(t, 25.4, 1e9, 0.5);
  if (wv.a > 0) withAlpha(wv.a, () => {
    ctx.save(); ctx.translate(slideX(wv), 0);
    const x = 980, y = 318, w = 740, h = 496;
    appWindow(x, y, w, h, 'Requests', { owner: 'Northwind Studio' });
    const src = [['Email', 35.52], ['Form submission', 36.30], ['Email', 36.45], ['Form submission', 36.60]];
    const miss = [['Service?', 34.11], ['Time?', 34.3], ['Service?', 34.5], ['Time?', 34.7]];
    for (let i = 0; i < 4; i++) {
      const rv = vis(t, 25.62 + i * 0.18, 1e9, 0.45); if (rv.a <= 0) continue;
      const ry = y + 72 + i * 104;
      withAlpha(rv.a, () => {
        ctx.save(); ctx.translate(0, rv.dy);
        emailRow(x + 12, ry, w - 24, 100, { subject: 'New request' }, {
          unnamed: true,
          tagInfo: { label: src[i][0], style: TAG.neutral, a: E.outExpo(prog(t, src[i][1], 0.4)), s: popScale(prog(t, src[i][1], 0.5)) },
          extraTag: { label: miss[i][0], style: TAG.warm, a: E.outExpo(prog(t, miss[i][1], 0.4)), s: popScale(prog(t, miss[i][1], 0.5)) },
        });
        if (i < 3) { ctx.fillStyle = 'rgba(17,24,39,0.05)'; ctx.fillRect(x + 24, ry + 100, w - 48, 1); }
        ctx.restore();
      });
    }
    ctx.restore();
  });
}

// ======================================================================= 5 manual steps (loop)
const MSTEPS = [['Read', 38.40, ICON.mail], ['Clarify', 39.54, ICON.question], ['Check calendar', 41.52, ICON.calendar], ['Propose times', 42.81, ICON.clock], ['Confirm', 43.89, ICON.check], ['Remind', 46.14, ICON.bell]];
export function sManual(t) {
  headline([['Six', 37.65], ['manual', 38.04], ['steps', 38.28, A.accent]], t);
  const cx = 960, cy = 570, rx = 520, ry = 205;
  const ang = (i) => (-150 + i * 60) * Math.PI / 180;
  // ellipse track
  const tv = vis(t, 37.8, 1e9, 0.6);
  withAlpha(tv.a * 0.9, () => { ctx.save(); ctx.strokeStyle = hexA(A.accent, 0.3); ctx.lineWidth = 2; ctx.setLineDash([2, 10]); ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2 * E.outCubic(tv.e)); ctx.stroke(); ctx.restore(); });
  // loop token: one lap after "reminders"
  const lp = prog(t, 46.35, 0.7);
  let tokenAng = null;
  if (lp > 0 && lp < 1) {
    tokenAng = ang(5) + E.inOutCubic(lp) * Math.PI * 2;
    const x = cx + Math.cos(tokenAng) * rx, y = cy + Math.sin(tokenAng) * ry;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 26); g.addColorStop(0, hexA(A.accent, 0.9)); g.addColorStop(1, hexA(A.accent, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI * 2); ctx.fill();
  }
  let active = -1; MSTEPS.forEach((s, i) => { if (t >= s[1]) active = i; });
  MSTEPS.forEach(([label, tin, icon], i) => {
    const p = prog(t, tin, 0.5); if (p <= 0) return;
    const a = ang(i); const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
    const on = i === active && t < 46.35;
    let passed = 0;
    if (tokenAng != null) { const d = Math.abs(((tokenAng - a) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI); passed = clamp01(1 - d / 0.45); }
    const hl = Math.max(on ? 1 : 0, passed);
    withAlpha(E.outExpo(p), () => withT(x, y + (1 - E.outExpo(p)) * 20, popScale(p) * (1 + 0.03 * hl), () => {
      chip(label, 0, 0, { align: 'center', size: 26, h: 66, pad: 26, icon, iconColor: A.accent, bg: hl > 0.5 ? '#FFF3EA' : '#FFFFFF', fg: INK, stroke: hl > 0.5 ? hexA(A.accent, 0.6) : 'rgba(17,24,39,0.08)', shadow: 0.8 + 0.5 * hl });
    }));
  });
  // center counter
  const cv = vis(t, 37.9, 1e9, 0.5);
  withAlpha(cv.a, () => {
    text('Per request', cx, cy - 58, { size: 22, weight: 600, color: MUTED, align: 'center' });
    const seq = MSTEPS.map(([l, tin], i) => ({ t: tin, s: `${i + 1} ${i ? 'steps' : 'step'}` }));
    rollText(seq, t, cx, cy + 4, { size: 56, weight: 800, color: INK, align: 'center' });
    const rp = prog(t, 46.4, 0.5);
    if (rp > 0) withAlpha(E.outExpo(rp), () => withT(cx, cy + 74, popScale(rp), () => {
      const w = chipWidth('Repeat', { size: 20, h: 40, pad: 16, icon: ICON.refresh });
      chip('Repeat', 0, 0, { align: 'center', size: 20, h: 40, pad: 16, icon: ICON.refresh, bg: hexA(A.accent, 0.14), fg: '#A34A0E', iconColor: '#A34A0E' });
    }));
  });
}

// ======================================================================= 6 busy: delays and drop-off
export function sBusy(t) {
  headline([['When', 47.13], ['it', 47.31], ['gets', 47.37], ['busy', 47.61, A.warn]], t, { tout: 48.1 });
  headline([['Replies', 48.30], ['get', 48.84], ['delayed', 49.02, A.warn]], t, { tout: 49.45 });
  headline([['Customers', 49.71], ['drop', 50.22], ['off', 50.55, A.warn]], t);
  const lv = vis(t, 47.4, 1e9, 0.5);
  withAlpha(lv.a, () => {
    ctx.save(); ctx.translate(-slideX(lv), 0);
    const x = 200, y = 330, w = 700, h = 440;
    card(x, y, w, h, { r: 28, shadow: 1.2, label: 'waiting card' });
    ICON.inbox(x + 60, y + 66, 30, A.accent);
    text('Waiting requests', x + 92, y + 67, { size: 26, weight: 600, color: MUTED });
    const heat = E.inOutCubic(prog(t, 49.02, 0.8));
    rollText([{ t: 47.4, s: '3' }, { t: 47.61, s: '7' }, { t: 49.02, s: '12' }], t, x + 56, y + 210, { size: 150, color: mixHex(INK, A.warn, heat * 0.85) });
    const bx = x + 56, by = y + 350, bw = w - 112;
    ctx.fillStyle = 'rgba(17,24,39,0.07)'; rrect(bx, by, bw, 14, 7); ctx.fill();
    const f = 0.25 + 0.3 * E.outExpo(prog(t, 47.61, 0.6)) + 0.4 * E.outExpo(prog(t, 49.02, 0.7));
    const g = ctx.createLinearGradient(bx, 0, bx + bw, 0); g.addColorStop(0, A.accent); g.addColorStop(1, A.warn);
    ctx.fillStyle = g; rrect(bx, by, bw * f, 14, 7); ctx.fill();
    text('Reply delay', bx, by + 44, { size: 20, weight: 500, color: MUTED });
    ctx.restore();
  });
  const rv = vis(t, 47.5, 1e9, 0.5);
  withAlpha(rv.a, () => {
    ctx.save(); ctx.translate(slideX(rv), 0);
    const x = 980, y = 330, w = 740, h = 440;
    card(x, y, w, h, { r: 28, shadow: 1.2, label: 'customers card' });
    ICON.user(x + 60, y + 66, 30, A.accent);
    text('Customers waiting', x + 92, y + 67, { size: 26, weight: 600, color: MUTED });
    for (let i = 0; i < 5; i++) {
      const ax = x + 130 + i * 120, ay = y + 220;
      const drop = i === 3 || i === 4 ? E.inOutCubic(prog(t, 50.22 + (i - 3) * 0.12, 0.6)) : 0;
      const iv = vis(t, 47.55 + i * 0.08, 1e9);
      const reflow = i < 3 ? 120 * E.inOutCubic(prog(t, 50.6, 0.6)) : 0;
      withAlpha(iv.a * (1 - drop), () => {
        ctx.save(); ctx.translate(drop * 60 + reflow, drop * 30);
        circle(ax, ay, 40, 'rgba(17,24,39,0.06)'); ICON.user(ax, ay, 46, '#6B7280');
        const wait = E.outExpo(prog(t, 48.3 + i * 0.1, 0.4));
        if (wait > 0) withAlpha(wait, () => { circle(ax + 30, ay - 30, 15, '#FFFFFF'); ICON.clock(ax + 30, ay - 30, 22, A.accent); });
        ctx.restore();
      });
    }
    const dp = prog(t, 50.55, 0.5);
    if (dp > 0) withAlpha(E.outExpo(dp), () => withT(x + w / 2, y + 350, popScale(dp), () => tag('2 dropped off', 0, 0, TAG.warn, { align: 'center', size: 22, h: 46, pad: 20 })));
    ctx.restore();
  });
}

// ======================================================================= 7 problems
export function sProblems(t) {
  headline([['Where', 51.54], ['problems', 51.69, A.warn], ['show', 52.09], ['up', 52.38]], t);
  const cards = [
    { tin: 52.95, title: 'Slow replies', sub: 'Lost bookings', subT: 53.37, icon: ICON.clock, vis: 'bar', vt: 54.90 },
    { tin: 55.65, title: 'Double booking', sub: 'Checked manually', subT: 58.11, icon: ICON.calendar, vis: 'overlap', vt: 56.31 },
    { tin: 59.40, title: 'No-shows', sub: 'Inconsistent reminders', subT: 60.69, icon: ICON.bell, vis: 'empty', vt: 59.97 },
  ];
  cards.forEach((c, i) => {
    const p = prog(t, c.tin, 0.5); if (p <= 0) return;
    const e = E.outExpo(p);
    const x = 200 + i * 530, y = 318, w = 460, h = 440;
    withAlpha(e, () => withT(x + w / 2, y + h / 2 + (1 - e) * 30, lerp(0.96, 1, e), () => {
      ctx.translate(-(x + w / 2), -(y + h / 2));
      card(x, y, w, h, { r: 28, shadow: 1.2, label: c.title });
      circle(x + 72, y + 76, 36, hexA(A.warn, 0.1)); c.icon(x + 72, y + 76, 36, A.warn);
      text(c.title, x + 40, y + 160, { size: 34, weight: 700, color: INK, maxW: w - 80 });
      withAlpha(E.outExpo(prog(t, c.subT, 0.4)), () => text(c.sub, x + 40, y + 204, { size: 22, weight: 500, color: MUTED, maxW: w - 80 }));
      const vp = E.outExpo(prog(t, c.vt, 0.7));
      const vx = x + 40, vy = y + 300, vw = w - 80;
      if (c.vis === 'bar') {
        text('Response time', vx, vy - 24, { size: 18, weight: 600, color: MUTED });
        ctx.fillStyle = 'rgba(17,24,39,0.07)'; rrect(vx, vy, vw, 16, 8); ctx.fill();
        const g = ctx.createLinearGradient(vx, 0, vx + vw, 0); g.addColorStop(0, A.accent); g.addColorStop(1, A.warn);
        ctx.fillStyle = g; rrect(vx, vy, vw * (0.2 + 0.7 * vp), 16, 8); ctx.fill();
        withAlpha(vp, () => tag('Slow', vx, vy + 62, TAG.warn));
      } else if (c.vis === 'overlap') {
        ctx.fillStyle = hexA('#4C6FFF', 0.12); rrect(vx, vy - 20, vw * 0.7, 48, 12); ctx.fill();
        text('Wed 3:30', vx + 16, vy + 4, { size: 19, weight: 600, color: '#3148C7' });
        withAlpha(vp, () => {
          ctx.fillStyle = hexA(A.warn, 0.12); rrect(vx + vw * 0.3, vy + 16 - 8 * (1 - vp), vw * 0.7, 48, 12); ctx.fill();
          ctx.strokeStyle = hexA(A.warn, 0.6); ctx.lineWidth = 2; rrect(vx + vw * 0.3 + 1, vy + 17 - 8 * (1 - vp), vw * 0.7 - 2, 46, 11); ctx.stroke();
          text('Wed 3:30', vx + vw * 0.3 + 16, vy + 41, { size: 19, weight: 600, color: '#B42323' });
          tag('Conflict', vx, vy + 100, TAG.warn);
        });
      } else {
        ctx.save(); ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(17,24,39,0.25)'; ctx.lineWidth = 2; rrect(vx, vy - 20, vw, 64, 14); ctx.stroke(); ctx.restore();
        withAlpha(1 - 0.6 * vp, () => ICON.user(vx + 36, vy + 12, 30, '#6B7280'));
        text('Empty slot', vx + 68, vy + 13, { size: 20, weight: 600, color: MUTED });
        withAlpha(E.outExpo(prog(t, 60.69, 0.4)), () => tag('No reminder', vx, vy + 90, TAG.warn));
      }
    }));
  });
}
export function camProblems(t) { const p = E.inOutCubic(prog(t, 53.0, 8.5)); return { s: 1 + 0.025 * p, fx: 960, fy: 540 }; }

// ======================================================================= 8 scheduling instead of service
export function sRevenue(t) {
  headline([['Scheduling', 63.69, A.accent], ['instead', 64.59], ['of', 65.01], ['service', 65.16]], t);
  const cv = vis(t, 62.6, 1e9, 0.5);
  withAlpha(cv.a, () => {
    ctx.save(); ctx.translate(0, cv.dy);
    const x = 260, y = 340, w = 1400, h = 440;
    card(x, y, w, h, { r: 28, shadow: 1.2, label: 'time card' });
    ICON.clock(x + 64, y + 70, 30, A.accent);
    text('Where the week goes', x + 96, y + 71, { size: 26, weight: 700, color: INK });
    const bx = x + 64, by = y + 190, bw = w - 128, bh = 84;
    const f = lerp(0.18, 0.46, E.inOutCubic(prog(t, 63.69, 0.9)));
    // scheduling segment
    ctx.fillStyle = hexA(A.accent, 0.85); rrect(bx, by, bw * f, bh, [18, 0, 0, 18]); ctx.fill();
    ctx.fillStyle = '#E9E3DB'; rrect(bx + bw * f + 4, by, bw * (1 - f) - 4, bh, [0, 18, 18, 0]); ctx.fill();
    if (f > 0.3) withAlpha(clamp01((f - 0.3) * 8), () => text('Scheduling work', bx + 28, by + bh / 2 + 1, { size: 24, weight: 700, color: '#FFFFFF' }));
    const sv = E.outExpo(prog(t, 65.16, 0.4));
    withAlpha(0.5 + 0.5 * sv, () => text('Service work', bx + bw * f + 32, by + bh / 2 + 1, { size: 24, weight: 700, color: INK }));
    // earns revenue marker above service segment
    const rp = prog(t, 66.54, 0.5);
    if (rp > 0) withAlpha(E.outExpo(rp), () => withT(bx + bw * f + 32, by + bh + 70, popScale(rp), () => {
      chip('Earns revenue', 0, 0, { size: 22, h: 46, pad: 18, icon: ICON.chart, bg: hexA('#19B89D', 0.14), fg: '#0B7A67', iconColor: '#0B7A67' });
    }));
    const lp = E.outExpo(prog(t, 64.26, 0.4));
    withAlpha(lp, () => withT(bx, by + bh + 70, 1, () => chip('Takes the time', 0, 0, { size: 22, h: 46, pad: 18, icon: ICON.clock, bg: hexA(A.accent, 0.14), fg: '#A34A0E', iconColor: '#A34A0E' })));
    ctx.restore();
  });
}

// ======================================================================= 9 pivot title card
export function sPivot(t) {
  const p = prog(t, 67.62, 0.6);
  const s = 'A cleaner scheduling workflow';
  withAlpha(E.outExpo(p), () => {
    text(s, 960, 520 + (1 - E.outExpo(p)) * 16, { size: 64, weight: 700, color: INK, align: 'center' });
    const lw = measure(s, 64, 700);
    const lp = E.outExpo(prog(t, 68.1, 0.7));
    const g = ctx.createLinearGradient(960 - lw / 2, 0, 960 + lw / 2, 0); g.addColorStop(0, B.primary); g.addColorStop(1, B.secondary);
    ctx.fillStyle = g; rrect(960 - (lw / 2) * lp, 580, lw * lp, 6, 3); ctx.fill();
  });
}
