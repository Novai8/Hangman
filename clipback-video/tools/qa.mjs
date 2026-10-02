// ---------------------------------------------------------------------------
// Automated QA pass over the delivered MP4.
//   node tools/qa.mjs [file]
// Checks: container/stream spec, duration, frame rate, letterboxing, black or
// frozen frames, per-frame motion (the brief forbids static moments), audio
// loudness / true peak / clipping, narration presence, and writes a filmstrip
// contact sheet to qa/ for human review.
// ---------------------------------------------------------------------------
import { spawnSync, spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;
const ffprobe = require('@ffprobe-installer/ffprobe').path;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REPO = path.resolve(ROOT, '..');

const FILE = path.resolve(REPO, process.argv[2] || 'Clipback_CLIP_Motion_Design.mp4');
if (!fs.existsSync(FILE)) { console.error('not found: ' + FILE); process.exit(1); }

const project = JSON.parse(fs.readFileSync(path.join(ROOT, 'project/Clipback_CLIP_Motion_Design.tsrct'), 'utf8'));
const results = [];
const ok = (name, pass, detail) => { results.push({ name, pass, detail }); };

// ------------------------------------------------------------------ 1. probe
const pr = JSON.parse(spawnSync(ffprobe, ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', FILE], { encoding: 'utf8' }).stdout);
const v = pr.streams.find((s) => s.codec_type === 'video');
const a = pr.streams.find((s) => s.codec_type === 'audio');
const dur = Number(pr.format.duration);
const sizeMB = Number(pr.format.size) / 1e6;

ok('container is mp4', /mp4/.test(pr.format.format_name), pr.format.format_name);
ok('video codec h264', v?.codec_name === 'h264', `${v?.codec_name} ${v?.profile} L${(v?.level / 10).toFixed(1)}`);
ok('resolution 1080x1920', v?.width === 1080 && v?.height === 1920, `${v?.width}x${v?.height}`);
ok('frame rate >= 30', eval(v?.r_frame_rate) >= 30, `${eval(v?.r_frame_rate)} fps`);
ok('pixel format yuv420p', v?.pix_fmt === 'yuv420p', v?.pix_fmt);
ok('audio codec aac 48k stereo', a?.codec_name === 'aac' && a?.sample_rate === '48000' && a?.channels === 2,
  `${a?.codec_name} ${a?.sample_rate}Hz ${a?.channels}ch ${Math.round(Number(a?.bit_rate || 0) / 1000)}k`);
ok('duration covers narration + tail',
  dur >= project.audio.narration.duration + 3 && Math.abs(dur - project.composition.duration) < 0.2,
  `${dur.toFixed(3)}s (narration ${project.audio.narration.duration}s)`);
ok('video frame count exact', Number(v?.nb_frames || 0) === Math.round(project.composition.duration * project.composition.fps),
  `${v?.nb_frames} frames`);
ok('bitrate healthy for 1080x1920', Number(pr.format.bit_rate) > 6e6, `${(Number(pr.format.bit_rate) / 1e6).toFixed(2)} Mbps, ${sizeMB.toFixed(1)} MB`);

// -------------------------------------------- 2/3. motion + luminance per frame
// decode a downscaled grayscale copy and measure frame-to-frame change
const SW = 72, SH = 128, STEP = 3; // every 3rd frame -> 20 samples/s
const raw = spawnSync(ffmpeg, ['-v', 'error', '-i', FILE,
  '-vf', `select=not(mod(n\\,${STEP})),scale=${SW}:${SH},format=gray`,
  '-vsync', '0', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 30 }).stdout;
const fsz = SW * SH;
const nF = Math.floor(raw.length / fsz);
const diffs = [], lumas = [];
let prev = null;
for (let f = 0; f < nF; f++) {
  const cur = raw.subarray(f * fsz, (f + 1) * fsz);
  let sum = 0;
  for (let i = 0; i < fsz; i++) sum += cur[i];
  lumas.push(sum / fsz);
  if (prev) {
    let d = 0;
    for (let i = 0; i < fsz; i++) d += Math.abs(cur[i] - prev[i]);
    diffs.push(d / fsz);
  }
  prev = Buffer.from(cur);
}
// letterbox / pillarbox test: a real bar is a band that is black in EVERY frame.
// (cropdetect false-positives on this deliberately dark grade, so measure directly.)
const bandMax = (x0, x1, y0, y1) => {
  let mx = 0;
  for (let f = 0; f < nF; f++) {
    const cur = raw.subarray(f * fsz, (f + 1) * fsz);
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) mx = Math.max(mx, cur[y * SW + x]);
  }
  return mx;
};
const edges = {
  top: bandMax(0, SW, 0, 5),           // top ~75 px
  bottom: bandMax(0, SW, SH - 5, SH),  // bottom ~75 px
  left: bandMax(0, 3, 0, SH),          // left ~45 px
  right: bandMax(SW - 3, SW, 0, SH),   // right ~45 px
};
const barless = Object.values(edges).every((v) => v > 10);
ok('no letterbox / pillarbox bars', barless,
  `edge peak luma T${edges.top} B${edges.bottom} L${edges.left} R${edges.right} (bar would be ~0)`);
ok('frame fully used — no cropping/pad', v?.sample_aspect_ratio === undefined || ['1:1', ''].includes(v.sample_aspect_ratio || '1:1'),
  `SAR ${v?.sample_aspect_ratio ?? '1:1'} DAR ${v?.display_aspect_ratio ?? '9:16'}`);

const fpsSample = project.composition.fps / STEP;
const tOf = (idx) => ((idx + 1) * STEP) / project.composition.fps;
const still = [];
for (let i = 0; i < diffs.length; i++) if (diffs[i] < 0.10) still.push(tOf(i));
const black = [];
for (let i = 0; i < lumas.length; i++) if (lumas[i] < 1.2) black.push((i * STEP) / project.composition.fps);
// group consecutive
const group = (arr) => {
  const out = [];
  for (const x of arr) {
    const l = out[out.length - 1];
    if (l && x - l.end < 0.12) l.end = x; else out.push({ start: x, end: x });
  }
  return out.filter((g) => g.end - g.start >= 0.12);
};
const stillRuns = group(still);
const blackRuns = group(black).filter((g) => g.start > 0.4 && g.end < dur - 0.4);
ok('no static/frozen passages', stillRuns.length === 0,
  stillRuns.length ? stillRuns.map((g) => `${g.start.toFixed(2)}-${g.end.toFixed(2)}s`).join(', ')
    : `min frame delta ${Math.min(...diffs).toFixed(3)} / mean ${(diffs.reduce((x, y) => x + y, 0) / diffs.length).toFixed(3)}`);
ok('no black frames mid-timeline', blackRuns.length === 0,
  blackRuns.length ? blackRuns.map((g) => `${g.start.toFixed(2)}-${g.end.toFixed(2)}s`).join(', ') : `min luma ${Math.min(...lumas).toFixed(2)}`);
// motion continuity: no sudden hard cut (we promised morph transitions, not cuts)
const mean = diffs.reduce((x, y) => x + y, 0) / diffs.length;
const spikes = [];
for (let i = 0; i < diffs.length; i++) if (diffs[i] > mean * 9) spikes.push(tOf(i).toFixed(2) + 's');
ok('no hard cuts between scenes', spikes.length === 0, spikes.length ? spikes.join(', ') : `peak/mean ${(Math.max(...diffs) / mean).toFixed(1)}x`);

// --------------------------------------------------------------- 4. audio QA
const ebAll = spawnSync(ffmpeg, ['-v', 'info', '-nostats', '-i', FILE, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
const eb = ebAll.slice(ebAll.lastIndexOf('Summary:'));
const grab = (re) => { const m = re.exec(eb); return m ? Number(m[1]) : NaN; };
const I = grab(/I:\s*(-?[\d.]+) LUFS/);
const TP = grab(/Peak:\s*(-?[\d.]+) dBFS/);
const LRA = grab(/LRA:\s*([\d.]+) LU/);
ok('programme loudness in spec', I <= -13 && I >= -21, `${I} LUFS`);
ok('no clipping (true peak < -0.5 dBFS)', TP < -0.5, `${TP} dBFS`);
ok('natural dynamics preserved', LRA >= 2, `LRA ${LRA} LU`);

const astats = spawnSync(ffmpeg, ['-v', 'info', '-nostats', '-i', FILE, '-af', 'astats=metadata=1:reset=0', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
const clipCount = (/Number of clipped samples:\s*(\d+)/.exec(astats) || [])[1];
ok('no clipped samples', !clipCount || Number(clipCount) === 0, `clipped=${clipCount ?? 0}`);

// narration present across its whole span (RMS per 0.5 s window of the final mix)
const pcm = spawnSync(ffmpeg, ['-v', 'error', '-i', FILE, '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], { maxBuffer: 1 << 30 }).stdout;
const n16 = pcm.length / 2;
const win = 4000; // 0.5 s
const rms = [];
for (let s = 0; s + win <= n16; s += win) {
  let acc = 0;
  for (let i = 0; i < win; i++) { const x = pcm.readInt16LE((s + i) * 2) / 32768; acc += x * x; }
  rms.push(Math.sqrt(acc / win));
}
const dbs = rms.map((r) => 20 * Math.log10(Math.max(r, 1e-6)));
const voiceEnd = Math.floor(project.audio.narration.duration / 0.5);
const quietInVoice = dbs.slice(0, voiceEnd).filter((d) => d < -52).length;
ok('narration audible for its full span', quietInVoice <= 2, `${quietInVoice} quiet 0.5s windows before ${project.audio.narration.duration}s`);
ok('design bed continues after narration', dbs.slice(voiceEnd + 1, dbs.length - 2).every((d) => d > -60),
  `tail min ${Math.min(...dbs.slice(voiceEnd + 1, dbs.length - 2)).toFixed(1)} dB`);

// ------------------------------------------------------- 5. visual filmstrip
const N = 16;
const strip = path.join(ROOT, 'qa/filmstrip.png');
const tiles = [];
for (let i = 0; i < N; i++) {
  const t = (i + 0.5) * (dur / N);
  const f = path.join(ROOT, `qa/frames/qa_${i}.png`);
  spawnSync(ffmpeg, ['-y', '-v', 'error', '-ss', String(t), '-i', FILE, '-frames:v', '1', '-vf', 'scale=270:480', f]);
  tiles.push({ f, t });
}
{
  const { createCanvas, loadImage } = await import('@napi-rs/canvas');
  const cols = 8, rows = Math.ceil(N / cols), tw = 270, th = 480;
  const c = createCanvas(cols * tw, rows * th);
  const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < N; i++) {
    const img = await loadImage(tiles[i].f);
    const x = (i % cols) * tw, y = Math.floor(i / cols) * th;
    g.drawImage(img, x, y, tw, th);
    g.fillStyle = 'rgba(0,0,0,.72)'; g.fillRect(x, y, 86, 22);
    g.fillStyle = '#fff'; g.font = '14px sans-serif';
    g.fillText(tiles[i].t.toFixed(2) + 's', x + 6, y + 16);
  }
  fs.writeFileSync(strip, c.toBuffer('image/png'));
  tiles.forEach((t) => fs.rmSync(t.f, { force: true }));
}
ok('filmstrip written for human review', fs.existsSync(strip), path.relative(REPO, strip));

// ------------------------------------------------------------------- report
const pad = (s, n) => (s + ' '.repeat(n)).slice(0, n);
let fails = 0;
console.log('\n  QA — ' + path.relative(REPO, FILE) + '\n  ' + '-'.repeat(86));
for (const r of results) {
  if (!r.pass) fails++;
  console.log(`  ${r.pass ? 'PASS' : 'FAIL'}  ${pad(r.name, 38)}  ${r.detail}`);
}
console.log('  ' + '-'.repeat(86));
console.log(`  ${results.length - fails}/${results.length} checks passed\n`);
fs.writeFileSync(path.join(ROOT, 'qa/qa-report.json'), JSON.stringify({ file: path.relative(REPO, FILE), when: new Date().toISOString(), results }, null, 2));
process.exit(fails ? 1 : 0);
