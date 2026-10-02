// Render single frames (or a contact sheet) for QA / art direction review.
// usage: node tools/preview.mjs 0.5 2.0 5.0 ...
//        node tools/preview.mjs --sheet 24           (contact sheet of N frames)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';
import { createState, renderFrame } from '../src/render.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const project = JSON.parse(fs.readFileSync(path.join(ROOT, 'project/Clipback_CLIP_Motion_Design.tsrct'), 'utf8'));
const analysis = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/vo-analysis.json'), 'utf8'));
const S = createState(project, analysis);
const { width: W, height: H, duration } = project.composition;

const args = process.argv.slice(2);
fs.mkdirSync(path.join(ROOT, 'qa/frames'), { recursive: true });

function renderAt(t) {
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  renderFrame(ctx, t, S);
  return c;
}

if (args[0] === '--sheet') {
  const n = parseInt(args[1] || '24', 10);
  const cols = Math.ceil(Math.sqrt(n * (H / W) / 1.4));
  const rows = Math.ceil(n / cols);
  const tw = 300, th = Math.round((300 * H) / W);
  const sheet = createCanvas(cols * tw, rows * th);
  const sx = sheet.getContext('2d');
  sx.fillStyle = '#121212';
  sx.fillRect(0, 0, sheet.width, sheet.height);
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const t = (duration * (i + 0.5)) / n;
    const c = renderAt(t);
    sx.drawImage(c, (i % cols) * tw, Math.floor(i / cols) * th, tw, th);
    sx.fillStyle = 'rgba(0,0,0,0.65)';
    sx.fillRect((i % cols) * tw, Math.floor(i / cols) * th, 70, 22);
    sx.fillStyle = '#fff';
    sx.font = '14px sans-serif';
    sx.fillText(t.toFixed(2) + 's', (i % cols) * tw + 6, Math.floor(i / cols) * th + 16);
  }
  const out = path.join(ROOT, 'qa/contact-sheet.png');
  fs.writeFileSync(out, sheet.toBuffer('image/png'));
  console.log('sheet ->', out, ((Date.now() - t0) / n).toFixed(1) + ' ms/frame');
} else if (args[0] === '--bench') {
  const n = parseInt(args[1] || '30', 10);
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  renderFrame(ctx, 0.5, S);
  const t0 = Date.now();
  for (let i = 0; i < n; i++) renderFrame(ctx, 10 + i * 0.6, S);
  const ms = (Date.now() - t0) / n;
  console.log('avg', ms.toFixed(1), 'ms/frame ->', (project.composition.fps * project.composition.duration * ms / 1000 / 60).toFixed(1), 'min single-core');
} else {
  for (const a of args) {
    const t = parseFloat(a);
    const c = renderAt(t);
    const out = path.join(ROOT, `qa/frames/f_${t.toFixed(2).replace('.', '_')}.png`);
    fs.writeFileSync(out, c.toBuffer('image/png'));
    console.log('->', out);
  }
}
