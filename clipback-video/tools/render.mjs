// ---------------------------------------------------------------------------
// Final render: deterministic frames -> raw RGBA over a pipe -> H.264/AAC MP4.
// No intermediate PNG sequence, no generation loss, no re-scaling.
//   node tools/render.mjs [--out FILE] [--crf 17] [--preset medium]
//                         [--from 0] [--to 44] [--fps 60] [--noaudio]
// ---------------------------------------------------------------------------
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REPO = path.resolve(ROOT, '..');

const argv = process.argv.slice(2);
const arg = (k, d) => {
  const i = argv.indexOf('--' + k);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d;
};
const flag = (k) => argv.includes('--' + k);

const project = JSON.parse(fs.readFileSync(path.join(ROOT, 'project/Clipback_CLIP_Motion_Design.tsrct'), 'utf8'));
const analysis = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/vo-analysis.json'), 'utf8'));

const { registerFonts } = await import('../src/lib/type.js');
registerFonts();
const { createState, renderFrame } = await import('../src/render.js');

const W = project.composition.width;
const H = project.composition.height;
const FPS = Number(arg('fps', project.composition.fps));
const FROM = Number(arg('from', 0));
const TO = Number(arg('to', project.composition.duration));
const CRF = arg('crf', '17');
const PRESET = arg('preset', 'medium');
const OUT = path.resolve(REPO, arg('out', project.render.output));
const AUDIO = path.join(ROOT, 'build/clipback_master_audio.wav');
const useAudio = !flag('noaudio') && fs.existsSync(AUDIO);

const total = Math.round((TO - FROM) * FPS);
fs.mkdirSync(path.dirname(OUT), { recursive: true });

const vArgs = [
  '-y', '-hide_banner', '-v', 'error', '-stats',
  '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', 'pipe:0',
];
if (useAudio) vArgs.push('-i', AUDIO);
vArgs.push(
  '-map', '0:v:0',
  ...(useAudio ? ['-map', '1:a:0'] : []),
  '-c:v', 'libx264', '-preset', PRESET, '-crf', CRF,
  '-profile:v', 'high', '-level', '5.1',
  '-pix_fmt', 'yuv420p',
  '-x264-params', 'ref=4:bframes=3:rc-lookahead=50:aq-mode=3:aq-strength=1.05:psy-rd=1.0,0.12:deblock=-1,-1',
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv',
  '-r', String(FPS), '-vsync', 'cfr',
);
if (useAudio) vArgs.push('-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2');
vArgs.push('-movflags', '+faststart', '-t', String(TO - FROM), OUT);

console.log(`render ${W}x${H} @${FPS} | ${total} frames | ${FROM}s..${TO}s | crf ${CRF} ${PRESET} | audio ${useAudio}`);
const enc = spawn(ffmpeg, vArgs, { stdio: ['pipe', 'inherit', 'inherit'] });
const done = new Promise((res, rej) => {
  enc.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg exit ' + c))));
  enc.on('error', rej);
});

const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');
const S = createState(project, analysis);

const t0 = Date.now();
let i = 0;
async function pump() {
  while (i < total) {
    const t = FROM + i / FPS;
    renderFrame(ctx, t, S);
    const buf = canvas.data();
    i++;
    if (i % 120 === 0 || i === total) {
      const el = (Date.now() - t0) / 1000;
      process.stderr.write(
        `\r  frame ${i}/${total}  ${(i / el).toFixed(1)} fps  eta ${Math.round((total - i) / (i / el))}s      `
      );
    }
    if (!enc.stdin.write(buf)) {
      await new Promise((r) => enc.stdin.once('drain', r));
    }
  }
  enc.stdin.end();
}

await pump();
await done;
process.stderr.write('\n');

const probe = spawnSync(
  require('@ffprobe-installer/ffprobe').path,
  ['-v', 'error', '-show_entries', 'format=duration,size,bit_rate',
   '-show_entries', 'stream=codec_name,codec_type,width,height,r_frame_rate,sample_rate,channels,profile,level',
   '-of', 'json', OUT],
  { encoding: 'utf8' }
);
console.log(probe.stdout);
console.log('-> ' + OUT);
