/**
 * Voiceover analysis.
 * Decodes the master narration to mono f32 PCM and derives:
 *   - duration
 *   - RMS envelope (10 ms hop)  -> used to drive reactive motion energy
 *   - voiced segments (phrases) -> used as scene / beat boundaries
 *   - onset peaks               -> used to place accent hits
 * Writes assets/vo-analysis.json
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REPO = path.resolve(ROOT, '..');

const VO = path.join(REPO, 'ElevenLabs_2026-10-02T19_04_59_Justin Time - Elearning Narration_pvc_sp90_s50_sb75_se0_b_m2.mp3');
if (!fs.existsSync(VO)) throw new Error('voiceover not found: ' + VO);

const SR = 44100;
const res = spawnSync(ffmpeg, ['-v', 'error', '-i', VO, '-f', 'f32le', '-ac', '1', '-ar', String(SR), '-'], {
  maxBuffer: 1024 * 1024 * 512,
  encoding: 'buffer',
});
if (res.status !== 0) throw new Error('ffmpeg decode failed: ' + res.stderr.toString());
const buf = res.stdout;
const n = Math.floor(buf.length / 4);
const pcm = new Float32Array(n);
for (let i = 0; i < n; i++) pcm[i] = buf.readFloatLE(i * 4);
const duration = n / SR;

// ---- RMS envelope, 10 ms hop / 25 ms window
const hop = Math.round(SR * 0.01);
const win = Math.round(SR * 0.025);
const frames = Math.floor((n - win) / hop) + 1;
const rms = new Float32Array(frames);
for (let f = 0; f < frames; f++) {
  let s = 0;
  const o = f * hop;
  for (let i = 0; i < win; i++) {
    const v = pcm[o + i];
    s += v * v;
  }
  rms[f] = Math.sqrt(s / win);
}
let peak = 0;
for (let i = 0; i < frames; i++) peak = Math.max(peak, rms[i]);
const env = Array.from(rms, (v) => +(v / peak).toFixed(5));

// smoothed envelope (one-pole attack/release) for motion energy
const smooth = new Float32Array(frames);
let acc = 0;
for (let i = 0; i < frames; i++) {
  const t = env[i];
  const k = t > acc ? 0.45 : 0.06; // fast attack, slow release
  acc += (t - acc) * k;
  smooth[i] = acc;
}

// ---- voiced segments (hysteresis gate on the envelope)
const hi = 0.055;
const lo = 0.022;
const segsRaw = [];
let on = false;
let start = 0;
for (let i = 0; i < frames; i++) {
  const v = env[i];
  if (!on && v > hi) {
    on = true;
    start = i;
  } else if (on && v < lo) {
    // require 160 ms of continuous sub-threshold to close
    let quiet = true;
    for (let j = i; j < Math.min(frames, i + 16); j++) if (env[j] > hi) { quiet = false; break; }
    if (quiet) {
      on = false;
      segsRaw.push([start, i]);
    }
  }
}
if (on) segsRaw.push([start, frames - 1]);

// merge segments separated by < 220 ms
const merged = [];
for (const s of segsRaw) {
  const last = merged[merged.length - 1];
  if (last && (s[0] - last[1]) * 0.01 < 0.22) last[1] = s[1];
  else merged.push([...s]);
}
const segments = merged
  .map(([a, b]) => ({ start: +(a * 0.01).toFixed(3), end: +((b + 2) * 0.01).toFixed(3) }))
  .filter((s) => s.end - s.start > 0.12)
  .map((s) => ({ ...s, dur: +(s.end - s.start).toFixed(3) }));

// ---- onsets: positive spectral-free energy flux peaks
const flux = new Float32Array(frames);
for (let i = 1; i < frames; i++) flux[i] = Math.max(0, env[i] - env[i - 1]);
const onsets = [];
const minGap = 12; // 120 ms
let lastOnset = -999;
for (let i = 2; i < frames - 2; i++) {
  if (flux[i] > 0.035 && flux[i] >= flux[i - 1] && flux[i] > flux[i + 1] && env[i] > 0.10 && i - lastOnset > minGap) {
    onsets.push(+(i * 0.01).toFixed(3));
    lastOnset = i;
  }
}

// ---- per-segment local minima (word boundary candidates)
const valleys = segments.map((s) => {
  const a = Math.round(s.start * 100);
  const b = Math.round(s.end * 100);
  const out = [];
  for (let i = a + 6; i < b - 6; i++) {
    let isMin = true;
    for (let j = i - 5; j <= i + 5; j++) if (env[j] < env[i]) { isMin = false; break; }
    if (isMin && env[i] < 0.09) out.push({ t: +(i * 0.01).toFixed(3), v: env[i] });
  }
  return { start: s.start, end: s.end, valleys: out };
});

const out = {
  file: path.basename(VO),
  sampleRate: SR,
  duration: +duration.toFixed(4),
  hop: 0.01,
  frames,
  peak: +peak.toFixed(5),
  env,
  envSmooth: Array.from(smooth, (v) => +v.toFixed(5)),
  segments,
  onsets,
  valleys,
};
fs.mkdirSync(path.join(ROOT, 'assets'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'assets', 'vo-analysis.json'), JSON.stringify(out));
console.log('duration', out.duration);
console.log('segments:');
for (const s of segments) console.log('  ', s.start.toFixed(3), '->', s.end.toFixed(3), '(' + s.dur.toFixed(2) + 's)');
console.log('onsets', onsets.length);
console.log(JSON.stringify(onsets));
