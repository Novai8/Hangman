// ---------------------------------------------------------------------------
// Audio mix.
// The supplied narration is the master: it is only level-matched (static gain)
// — never pitched, stretched, re-recorded or replaced. The design bus is
// side-chain ducked beneath it so no effect ever covers a word, and the sum
// goes through a transparent true-peak limiter.
// ---------------------------------------------------------------------------
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REPO = path.resolve(ROOT, '..');

const project = JSON.parse(fs.readFileSync(path.join(ROOT, 'project/Clipback_CLIP_Motion_Design.tsrct'), 'utf8'));
const DUR = project.composition.duration;
const VO = path.resolve(ROOT, project.audio.narration.file);
const SFX = path.resolve(ROOT, project.audio.sfxBus.file);
if (!fs.existsSync(VO)) throw new Error('narration missing: ' + VO);
if (!fs.existsSync(SFX)) throw new Error('sfx bus missing — run tools/sfx.mjs first');

const VO_GAIN = 8.4;   // dB  -25.1 LUFS -> ~-16.7 LUFS
const SFX_GAIN = 4.6;  // dB  -33.9 LUFS -> ~-29.3 LUFS  (≈13 LU under the voice)

const filter = [
  `[0:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,` +
  `volume=${VO_GAIN}dB,apad=pad_len=${Math.round((DUR + 1) * 48000)}[vo]`,
  `[vo]asplit=2[voA][voSC]`,
  `[1:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,volume=${SFX_GAIN}dB,atrim=0:${DUR}[sfx]`,
  // duck the design bus under the narration (gentle, musical timing)
  `[sfx][voSC]sidechaincompress=threshold=0.035:ratio=7:attack=18:release=420:makeup=1:level_sc=1.6[sfxd]`,
  // amix in this build always averages its inputs, so the x2 restores a true sum
  `[voA][sfxd]amix=inputs=2:duration=longest:dropout_transition=0,volume=2.0[mx]`,
  // short fades so nothing starts or ends abruptly
  `[mx]afade=t=in:st=0:d=0.12,afade=t=out:st=${(DUR - 0.5).toFixed(2)}:d=0.5[mxf]`,
  `[mxf]alimiter=level_in=1:level_out=1:limit=0.891:attack=5:release=90:level=disabled[aout]`,
].join(';');

const out = path.join(ROOT, 'build/clipback_master_audio.wav');
fs.mkdirSync(path.dirname(out), { recursive: true });
const args = [
  '-y', '-hide_banner', '-v', 'warning',
  '-i', VO, '-i', SFX,
  '-filter_complex', filter,
  '-map', '[aout]', '-t', String(DUR),
  '-c:a', 'pcm_s24le', '-ar', '48000', '-ac', '2',
  out,
];
const r = spawnSync(ffmpeg, args, { encoding: 'utf8' });
if (r.status !== 0) { console.error(r.stderr); process.exit(1); }
console.log('-> ' + out);

// report
const m = spawnSync(ffmpeg, ['-hide_banner', '-nostats', '-i', out, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' });
console.log(m.stderr.split('Summary:')[1] || m.stderr.slice(-800));
