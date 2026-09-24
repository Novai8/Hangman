// Frame renderer. Usage:
//   node src/render.mjs --qa                      layout/spelling QA pass (no encode)
//   node src/render.mjs --stills 3,21.5,64.8      write PNG stills to output/stills
//   node src/render.mjs --out file.mp4 [--from F --to F] [--nocaps]
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { createCanvas, setCtx, ctx, W, H, FPS, QA, PAL, E, prog, lerp, clamp01, hexA, mixHex, measure, text, font, rrect, SAFE, CAPTION_TOP } from './lib.mjs';
import { SCENES, SECTIONS, END_T } from './scenes.mjs';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dir, '..');
const CAPS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'captions.json'), 'utf8'));

const args = process.argv.slice(2);
const arg = (k, d = null) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const has = (k) => args.includes(k);

const canvas = createCanvas(W, H);
const main = canvas.getContext('2d');
const layerCanvas = createCanvas(W, H);
const layer = layerCanvas.getContext('2d');
setCtx(main);
// ------------------------------------------------------------------ background
function sectionState(t) {
  let prev = SECTIONS[0], cur = SECTIONS[0];
  for (let i = 1; i < SECTIONS.length; i++) if (t >= SECTIONS[i].t) { prev = SECTIONS[i - 1]; cur = SECTIONS[i]; }
  if (cur === SECTIONS[0]) return { from: 'A', to: 'A', p: 1 };
  return { from: prev.key, to: cur.key, p: E.inOutSine(prog(t, cur.t, cur.d)) };
}
const BLOBS = { A: ['#FF8A3D', '#EF5B5B'], B: ['#4C6FFF', '#7C5CFC'], C: ['#F5A524', '#19B89D'], D: ['#46C7FF', '#36D399'] };
function bgColorAt(t) { const s = sectionState(t); return mixHex(PAL[s.from].bg, PAL[s.to].bg, s.p); }
function drawDecor(c, key, a, t, px, py) {
  const dark = key === 'D';
  const [c1, c2] = BLOBS[key];
  const blobs = [[0.18, 0.2, 520, c1], [0.85, 0.78, 600, c2]];
  blobs.forEach(([bx, by, r, col], i) => {
    const x = bx * W + Math.sin(t * 0.13 + i * 2) * 40 + px, y = by * H + Math.cos(t * 0.11 + i) * 30 + py;
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, hexA(col, (dark ? 0.16 : 0.09) * a)); g.addColorStop(1, hexA(col, 0));
    c.fillStyle = g; c.fillRect(0, 0, W, H);
  });
}
function drawBackground(t, cam) {
  const s = sectionState(t);
  const px = -cam.dx * 0.18, py = 0;
  main.fillStyle = PAL[s.from].bg; main.fillRect(0, 0, W, H);
  drawDecor(main, s.from, 1, t, px, py);
  if (s.p > 0 && s.from !== s.to) {
    // gradient sweep: the new palette washes in diagonally
    const b = lerp(-0.35, 1.35, s.p);
    const g = main.createLinearGradient(0, 0, W, H * 0.6);
    const col = PAL[s.to].bg;
    const st = (v) => clamp01(v);
    g.addColorStop(0, hexA(col, 1)); g.addColorStop(st(b - 0.18), hexA(col, 1)); g.addColorStop(st(b + 0.18), hexA(col, 0)); g.addColorStop(1, hexA(col, 0));
    if (s.p >= 1) { main.fillStyle = col; main.fillRect(0, 0, W, H); } else { main.fillStyle = g; main.fillRect(0, 0, W, H); }
    drawDecor(main, s.to, s.p, t, px, py);
  }
  // dot grid (parallax 18%)
  const dark = parseInt(bgColorAt(t).slice(1, 3), 16) < 90;
  main.fillStyle = dark ? 'rgba(255,255,255,0.045)' : 'rgba(17,24,39,0.05)';
  const step = 48; const ox = ((px % step) + step) % step;
  main.beginPath();
  for (let y = 24; y < H; y += step) for (let x = ox; x < W; x += step) main.rect(x, y, 2, 2);
  main.fill();
  // mid layer (55%): faint large rounded frames
  const mx = -cam.dx * 0.55;
  main.strokeStyle = dark ? 'rgba(255,255,255,0.035)' : 'rgba(17,24,39,0.035)'; main.lineWidth = 2;
  main.beginPath(); main.roundRect(-120 + mx, 640, 420, 300, 40); main.stroke();
  main.beginPath(); main.roundRect(1640 + mx, 90, 400, 260, 40); main.stroke();
}

// ------------------------------------------------------------------ scene transitions
function sceneTransform(sc, t) {
  const [inType, inD] = sc.inT, [outType, outD] = sc.outT;
  const ep = prog(t, sc.t0, inD), xp = prog(t, sc.t1 - outD, outD);
  let a = 1, dx = 0, s = 1, blur = 0;
  const ei = E.outExpo(ep), xo = E.inCubic(xp);
  if (ep < 1) {
    a *= ei;
    if (inType === 'slide') dx += (1 - ei) * 200;
    if (inType === 'zoom') { s *= lerp(0.93, 1, ei); blur += (1 - ep) * 12; }
    if (inType === 'blur') blur += (1 - ei) * 16;
  }
  if (xp > 0) {
    a *= 1 - xo;
    if (outType === 'slide') dx -= xo * 200;
    if (outType === 'zoom') { s *= lerp(1, 1.1, xo); blur += xo * 14; }
    if (outType === 'blur') blur += xo * 16;
    if (outType === 'slide') blur += Math.sin(Math.PI * xp) * 1.5; // motion blur during fast move
  }
  if (ep < 1 && inType === 'slide') blur += Math.sin(Math.PI * ep) * 1.5;
  return { a, dx, s, blur, settled: ep >= 1 && xp <= 0 };
}
function applyCam(c, cam) {
  // scene camera push-in (scale about focus, clamped so the content region stays title-safe)
  c.translate(cam.fx, cam.fy); c.scale(cam.s, cam.s); c.translate(-cam.fx, -cam.fy);
}

// ------------------------------------------------------------------ captions
const CAP = { size: 32, weight: 600, lh: 44, maxW: 1400 };
function captionAt(t) {
  for (let i = 0; i < CAPS.length; i++) {
    const c = CAPS[i], n = CAPS[i + 1];
    const start = c.s - 0.2, end = Math.min(n ? n.s - 0.22 : 1e9, c.e + 1.1);
    if (t >= start && t < end) return { c, start, end };
  }
  return null;
}
function layoutCaption(c) {
  font(CAP.size, CAP.weight);
  const sp = main.measureText(' ').width;
  // words ending in an em dash join the next word without a space
  const all = c.words.map((w) => ({ ...w, w: main.measureText(w.t).width, gap: w.t.endsWith('—') ? 0 : sp }));
  const width = (arr) => arr.reduce((s2, x, i) => s2 + x.w + (i < arr.length - 1 ? x.gap : 0), 0);
  if (width(all) <= CAP.maxW) return { lines: [all] };
  let best = null;
  for (let k = 1; k < all.length; k++) {
    if (all[k - 1].gap === 0) continue; // never break right after an em dash
    const A = all.slice(0, k), B2 = all.slice(k); const wa = width(A), wb = width(B2);
    if (wa <= CAP.maxW && wb <= CAP.maxW) { const d = Math.abs(wa - wb); if (!best || d < best.d) best = { d, a: A, b: B2 }; }
  }
  if (best) return { lines: [best.a, best.b] };
  return { lines: [all, [], []] }; // flagged by QA (>2 lines)
}
function drawCaptions(t) {
  const cur = captionAt(t); if (!cur) return;
  const { c, start, end } = cur;
  const a = E.outExpo(prog(t, start, 0.2)) * (1 - E.inCubic(prog(t, end - 0.2, 0.2)));
  if (a <= 0) return;
  const bg = bgColorAt(t);
  const dark = parseInt(bg.slice(1, 3), 16) < 90;
  const s = sectionState(t); const key = s.p > 0.5 ? s.to : s.from;
  const accent = { A: '#FF8A3D', B: '#4C6FFF', C: '#F5A524', D: '#46C7FF' }[key];
  const ink = dark ? '#F3F6FB' : '#111827';
  const { lines } = layoutCaption(c);
  if (lines.length > 2) QA.issues.push(`t=${t.toFixed(2)} CAPTION >2 lines: ${c.words.map((w) => w.t).join(' ')}`);
  const cy = 943, y0 = lines.length === 1 ? cy : cy - CAP.lh / 2;
  main.save(); main.globalAlpha = a;
  lines.forEach((ln, li) => {
    const lw = ln.reduce((s2, x, i) => s2 + x.w + (i < ln.length - 1 ? x.gap : 0), 0);
    let x = 960 - lw / 2; const y = y0 + li * CAP.lh;
    if (x < SAFE.x0 || x + lw > SAFE.x1) QA.issues.push(`t=${t.toFixed(2)} CAPTION out of safe area`);
    ln.forEach((w) => {
      const spoken = clamp01((t - w.s + 0.06) / 0.12);
      if (w.key && spoken > 0) {
        const m = E.outExpo(prog(t, w.s, 0.3));
        if (!dark) { main.fillStyle = hexA(accent, 0.26); rrect(x - 6, y - 21, (w.w + 12) * m, 42, 8); main.fill(); }
      }
      const col = w.key && dark && spoken > 0 ? accent : ink;
      main.save(); main.globalAlpha = a * lerp(0.36, 1, spoken);
      font(CAP.size, CAP.weight); main.fillStyle = col; main.textAlign = 'left'; main.textBaseline = 'middle';
      main.fillText(w.t, x, y + 1);
      main.restore();
      x += w.w + w.gap;
    });
  });
  main.restore();
}

// ------------------------------------------------------------------ frame
function renderFrame(t, opt = {}) {
  QA.t = t;
  setCtx(main);
  main.setTransform(1, 0, 0, 1, 0, 0);
  main.globalAlpha = 1; main.filter = 'none';
  const active = SCENES.filter((s) => t >= s.t0 && t < s.t1);
  // dominant camera offset for parallax
  let camDx = 0;
  active.forEach((s) => { const tr = sceneTransform(s, t); camDx += tr.dx * tr.a; });
  drawBackground(t, { dx: camDx });
  for (const sc of active) {
    const tr = sceneTransform(sc, t);
    if (tr.a <= 0.002) continue;
    const cam = sc.cam ? sc.cam(t) : { s: 1, fx: 960, fy: 540 };
    QA.suppress = tr.settled && cam.s <= 1.0001 ? 0 : 1;
    // QA still checks content when camera pushes in: verify in layout space
    if (tr.settled && cam.s > 1.0001) QA.suppress = 0;
    const useLayer = tr.blur > 0.4;
    const c = useLayer ? layer : main;
    if (useLayer) { layer.setTransform(1, 0, 0, 1, 0, 0); layer.clearRect(0, 0, W, H); layer.globalAlpha = 1; setCtx(layer); }
    c.save();
    if (!useLayer) c.globalAlpha = tr.a;
    c.translate(960 + tr.dx, 540); c.scale(tr.s, tr.s); c.translate(-960, -540);
    if (!QA.enabled || has('--qacam')) applyCam(c, cam);
    sc.draw(t);
    c.restore();
    if (useLayer) {
      setCtx(main);
      main.save(); main.globalAlpha = tr.a; main.filter = `blur(${tr.blur.toFixed(1)}px)`; main.drawImage(layerCanvas, 0, 0); main.restore();
      main.filter = 'none';
    }
  }
  QA.suppress = 0;
  setCtx(main);
  if (!opt.nocaps) drawCaptions(t);
  // global fade-out at the very end
  const fo = prog(t, END_T - 1.0, 1.0);
  if (fo > 0) { main.fillStyle = hexA(PAL.D.bg, E.inOutCubic(fo)); main.fillRect(0, 0, W, H); }
}

// ordered-noise dither on the raw RGBA buffer (±1.5 LSB, zero mean) to prevent gradient banding
const NOISE = new Int8Array(W * H * 4);
{ let seed = 987654; for (let i = 0; i < NOISE.length; i++) { if ((i & 3) === 3) continue; seed = (seed * 1103515245 + 12345) & 0x7fffffff; NOISE[i] = ((seed >> 8) % 4) - 1.5 > 0 ? ((seed >> 8) % 4) - 1 : ((seed >> 8) % 4) - 2; } }
function dither(buf) {
  const u = new Uint8ClampedArray(buf.buffer, buf.byteOffset, buf.length);
  for (let i = 0; i < u.length; i++) u[i] = u[i] + NOISE[i];
}

// ------------------------------------------------------------------ modes
const TOTAL = Math.round(END_T * FPS);
if (has('--qa')) {
  QA.enabled = true;
  const step = parseInt(arg('--step', '2'), 10);
  for (let f = 0; f < TOTAL; f += step) renderFrame(f / FPS);
  // dedupe
  const seen = new Map();
  for (const m of QA.issues) { const k = m.replace(/^t=\S+ /, '').replace(/\[.*\]/, ''); if (!seen.has(k)) seen.set(k, m); }
  console.log(`QA: ${QA.issues.length} raw issues, ${seen.size} unique`);
  for (const m of seen.values()) console.log('  ' + m);
  process.exit(seen.size ? 1 : 0);
} else if (arg('--stills')) {
  const dir = path.join(ROOT, 'output', 'stills'); fs.mkdirSync(dir, { recursive: true });
  for (const s of arg('--stills').split(',')) {
    const t = parseFloat(s); renderFrame(t, { nocaps: has('--nocaps') });
    fs.writeFileSync(path.join(dir, `t${t.toFixed(2).padStart(6, '0')}.png`), canvas.toBuffer('image/png'));
  }
  console.log('stills written');
} else if (arg('--out')) {
  const f0 = parseInt(arg('--from', '0'), 10), f1 = parseInt(arg('--to', String(TOTAL)), 10);
  const out = arg('--out');
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-tune', 'animation', '-x264-params', 'aq-mode=3:aq-strength=0.9:deblock=-1,-1', '-pix_fmt', 'yuv420p', '-threads', '1', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  let f = f0;
  const write = () => {
    while (f < f1) {
      renderFrame(f / FPS, { nocaps: has('--nocaps') });
      const buf = Buffer.from(canvas.data());
      dither(buf);
      f++;
      if (f % 300 === 0) console.log(`frame ${f}/${f1} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
      if (!ff.stdin.write(buf)) { ff.stdin.once('drain', write); return; }
    }
    ff.stdin.end();
  };
  ff.on('close', (code) => { console.log(`done ${out} code=${code} in ${((Date.now() - t0) / 1000).toFixed(0)}s`); process.exit(code); });
  write();
}
