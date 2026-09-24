"""Sound design + music bed + mix for the Northwind Services daily operations brief video.

All sounds are synthesized here (no third-party samples) so they stay soft, minimal
and license-free. The voiceover is the timing master and stays dominant:
  music bed  ~ -21 dB under the VO (plus gentle ducking while speech is present)
  SFX        ~ -17 dB under the VO (standard), -20 dB (lighter), -15 dB (slightly stronger)

Usage: python3 src/audio.py            -> writes output/mix_standard.wav, mix_lighter.wav, mix_stronger.wav
"""
import os, json, wave, subprocess
import numpy as np
from scipy.signal import butter, sosfilt, sosfiltfilt

SR = 48000
ROOT = os.path.join(os.path.dirname(__file__), '..')
VO_PATH = os.path.join(ROOT, 'data', 'vo.mp3')
OUT = os.path.join(ROOT, 'output')
END_T = 154.4
N = int(END_T * SR)
rng = np.random.default_rng(7)

def db(x): return 10 ** (x / 20)
def t_arr(d): return np.arange(int(d * SR)) / SR
def lp(x, f, order=2): return sosfilt(butter(order, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, order=2): return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x)
def bp(x, f1, f2, order=2): return sosfilt(butter(order, [f1, f2], 'band', fs=SR, output='sos'), x)
def env_ad(n, a, d_tau):
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-4), np.exp(-(t - a) / d_tau))
    return e

# ------------------------------------------------------------------ SFX kit
def s_tick(v=0):
    d = 0.05; t = t_arr(d); f = 2100 * (1 + 0.04 * v)
    x = np.sin(2 * np.pi * f * t) * env_ad(len(t), 0.001, 0.008)
    return lp(x, 5000) * 0.8
def s_click(v=0):
    d = 0.09; t = t_arr(d)
    body = np.sin(2 * np.pi * (700 + 40 * v) * t) * env_ad(len(t), 0.001, 0.014)
    n = lp(rng.standard_normal(len(t)), 2500) * env_ad(len(t), 0.0005, 0.006) * 0.5
    return lp(body + n, 3200)
def s_pop(v=0):
    d = 0.16; t = t_arr(d)
    f = (430 + 30 * v) * np.exp(-t * 7) + 250
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * env_ad(len(t), 0.004, 0.045)
    return lp(x, 2400)
def s_whoosh(d=0.5, v=0, f0=400, f1=2400):
    n = int(d * SR); t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    # sweep a band-pass by blending two filtered versions
    lo = bp(noise, f0, f0 * 2.2); hi = bp(noise, f1 * 0.5, f1)
    m = np.sin(np.pi * t / d) ** 2
    sweep = t / d
    x = (lo * (1 - sweep) + hi * sweep) * m
    return lp(x, 6000) * 0.9
def s_type(d, v=0):
    n = int(d * SR); x = np.zeros(n)
    pos = 0.0
    while pos < d - 0.03:
        i = int(pos * SR); L = int(0.022 * SR)
        k = lp(rng.standard_normal(L), 3000 + rng.uniform(-600, 600)) * env_ad(L, 0.0008, 0.004)
        k *= rng.uniform(0.55, 1.0)
        x[i:i + L] += k[: n - i]
        pos += rng.uniform(0.055, 0.095)
    return hp(x, 300)
def s_chime(v=0):
    d = 1.6; t = t_arr(d)
    x = np.zeros(len(t))
    for k, (f, delay, amp) in enumerate([(659.25, 0.0, 1.0), (987.77, 0.085, 0.7)]):
        i = int(delay * SR); tt = t[: len(t) - i]
        tone = (np.sin(2 * np.pi * f * tt) + 0.18 * np.sin(2 * np.pi * 2 * f * tt)) * env_ad(len(tt), 0.006, 0.42)
        x[i:] += amp * tone
    return lp(x, 4500) * 0.7
def s_check(v=0):
    d = 0.35; t = t_arr(d)
    x = np.sin(2 * np.pi * (1318.5 + 20 * v) * t) * env_ad(len(t), 0.003, 0.07)
    x += 0.35 * np.sin(2 * np.pi * 1975.5 * t) * env_ad(len(t), 0.003, 0.05)
    return lp(x, 5000) * 0.55
def s_amber(v=0):
    # gentle attention tone: two soft rounded notes (not an alarm)
    x = np.zeros(int(0.7 * SR))
    for f, delay in [(587.33, 0.0), (493.88, 0.16)]:
        i = int(delay * SR); d = 0.5; tt = t_arr(d)
        tone = np.sin(2 * np.pi * f * tt) * np.sin(np.pi * np.clip(tt / 0.02, 0, 0.5)) * np.exp(-tt / 0.16)
        x[i:i + len(tt)] += tone[: len(x) - i]
    return lp(x, 2500) * 0.8
def s_roll(v=0):
    x = np.zeros(int(0.3 * SR))
    for k in range(5):
        i = int(k * 0.045 * SR); tk = s_tick(v + k * 0.5) * (0.5 + 0.1 * k)
        x[i:i + len(tk)] += tk[: len(x) - i]
    return x
def s_snap(v=0):
    return s_click(v) * 0.7 + np.pad(s_pop(v + 2), (0, 0))[: len(s_click(v))] * 0.4

KIT = {'tick': (s_tick, 0.45), 'click': (s_click, 0.8), 'pop': (s_pop, 0.75), 'whoosh': (None, 0.7), 'type': (None, 0.4),
       'chime': (s_chime, 0.85), 'check': (s_check, 0.6), 'amber': (s_amber, 0.75), 'roll': (s_roll, 0.5), 'snap': (s_snap, 0.7)}

# ------------------------------------------------------------------ SFX timeline (seconds in VO time)
E = []
def ev(kind, t, **kw): E.append(dict(kind=kind, t=t, **kw))
def typing(t0, t1): ev('type', t0, d=t1 - t0)

# 1 hook — dashboard, owner, sources
ev('pop', 0.42, g=0.55); ev('tick', 0.99, g=0.4); ev('pop', 1.98, g=0.45)
for t in (2.43, 2.76, 3.06): ev('pop', t, g=0.7)
# 2 switching between tools (clicks + counter flips)
ev('whoosh', 3.6, d=0.45)
for t in (4.20, 5.34, 6.39, 7.47, 8.40, 9.18, 9.95, 10.55, 11.15, 11.75): ev('click', t, g=0.6)
ev('roll', 4.22, g=0.5); ev('pop', 7.5, g=0.45); ev('roll', 9.2, g=0.6); ev('roll', 12.08, g=0.7); ev('pop', 13.89, g=0.55)
# 3 spread across tools
ev('tick', 15.39, g=0.45); ev('whoosh', 17.55, d=0.6, g=0.3, f0=300, f1=1400)
for t in (19.38, 22.20, 25.08): ev('pop', t, g=0.75)
for t in (21.23, 23.07, 24.09, 25.77): ev('tick', t, g=0.5)
# 4 reconstructing (notes drift in)
ev('whoosh', 27.65, d=0.45)
for t0 in (28.05, 28.35, 28.62, 28.96, 29.25, 29.58, 29.9, 30.25): ev('tick', t0 + 0.2, g=0.35)
ev('pop', 30.96, g=0.45); ev('pop', 33.18, g=0.5)
# 5 things slip
ev('whoosh', 33.9, d=0.45); ev('whoosh', 34.8, d=0.8, g=0.25, f0=300, f1=1000)
for t in (36.45, 37.80, 39.72): ev('pop', t, g=0.8)
for t in (36.9, 38.4, 40.53): ev('tick', t, g=0.45)
# 6 repetitive (calm)
ev('whoosh', 41.65, d=0.45, g=0.7); ev('check', 42.55, g=0.6)
for i in range(5): ev('tick', 42.2 + i * 0.72, g=0.28)
ev('pop', 45.6, g=0.5)
# 7 pivot
ev('whoosh', 46.5, d=0.9, g=0.6, f0=300, f1=1800); ev('chime', 47.2, g=0.35)
# 8 generate: choose sources, tokens travel
ev('whoosh', 48.6, d=0.45); ev('pop', 51.57, g=0.5); ev('tick', 52.86, g=0.5)
for t in (55.14, 56.01, 56.97):
    ev('click', t, g=0.65)
    for j in range(3): ev('tick', t + 0.8 + j * 0.14, g=0.25)
# 9 summarize → group → flag → deliver
ev('whoosh', 58.1, d=0.45); ev('tick', 58.41, g=0.45)
ev('whoosh', 59.73, d=0.5, g=0.3, f0=300, f1=1400); ev('snap', 60.3, g=0.6); ev('pop', 60.5, g=0.5); ev('chime', 61.4, g=0.6)
# 10 brief contents + flags
ev('whoosh', 62.15, d=0.45)
for t in (63.30, 64.71, 65.85, 69.78, 71.31): ev('pop', t, g=0.6)
for t in (67.23, 68.52, 70.05, 71.79): ev('snap', t, g=0.6)
# 11 groups → batches
ev('whoosh', 73.1, d=0.45)
for k in range(6): ev('tick', 73.5 + k * 0.09, g=0.25)
for t in (76.14, 78.21, 79.02): ev('pop', t, g=0.6)
for t in (76.5, 76.74, 78.5, 78.7, 79.3, 79.5): ev('snap', t + 0.48, g=0.45)
for i in range(3): ev('check', 81.1 + i * 0.12, g=0.55)
# 12 safe
ev('whoosh', 81.8, d=0.45); ev('pop', 82.85, g=0.6); ev('check', 83.15, g=0.6)
for t in (83.76, 84.69): ev('tick', t, g=0.5)
# 13 needs review → link to source
ev('whoosh', 85.4, d=0.45); ev('amber', 88.1, g=0.6); ev('pop', 89.37, g=0.5); ev('tick', 89.8, g=0.4); ev('click', 90.09); ev('whoosh', 90.15, d=0.4, g=0.35); ev('tick', 91.26, g=0.45)
# 14 controls
ev('whoosh', 91.9, d=0.45)
for k in range(3): ev('snap', 93.8 + k * 0.25, g=0.45)
ev('click', 97.08, g=0.7); ev('click', 98.61, g=0.7)
# 15 logged
ev('whoosh', 99.9, d=0.45)
for t0 in (103.62, 105.06, 105.75, 106.9): typing(t0 - 0.15, t0 + 0.2); ev('check', t0 + 0.25, g=0.45)
for k in range(3): ev('tick', 102.97 + k * 0.12, g=0.3)
# 16 safe failure
ev('whoosh', 107.9, d=0.45)
for k in range(3): ev('tick', 109.4 + k * 0.2, g=0.35)
ev('amber', 110.76); ev('check', 112.4, g=0.7); ev('check', 113.4, g=0.7); ev('check', 114.67, g=0.7); ev('tick', 115.14, g=0.4)
# 17 outcome
ev('whoosh', 116.35, d=0.5)
for t in (119.31, 126.51, 131.67): ev('pop', t, g=0.75)
for t in (121.23, 121.95, 122.85, 124.44): ev('tick', t, g=0.4)
ev('pop', 130.11, g=0.8); ev('tick', 133.5, g=0.55); ev('tick', 135.42, g=0.55); ev('roll', 136.4); ev('pop', 138.96, g=0.5)
# 18–19 trust + close
ev('whoosh', 141.4, d=0.6, g=0.5)
for t in (141.76, 144.19, 145.36): ev('check', t, g=0.85)
ev('whoosh', 146.2, d=0.8, g=0.45); ev('pop', 147.03, g=0.45); ev('chime', 148.62, g=0.6); ev('chime', 151.3, g=0.4)

def render_sfx():
    out = np.zeros(N)
    for k, e in enumerate(E):
        kind = e['kind']; v = rng.uniform(-1, 1)  # per-event variation keeps it non-repetitive
        if kind == 'whoosh': x = s_whoosh(e.get('d', 0.5), v, e.get('f0', 400), e.get('f1', 2400))
        elif kind == 'type': x = s_type(e['d'], v)
        else: x = KIT[kind][0](v)
        x = x / (np.sqrt(np.mean(x[: max(1, int(0.05 * SR))] ** 2)) + 1e-9) if kind not in ('whoosh', 'type') else x / (np.sqrt(np.mean(x ** 2)) + 1e-9)
        x *= KIT[kind][1] * e.get('g', 1.0) * rng.uniform(0.9, 1.05)
        i = int(e['t'] * SR)
        if i >= N: continue
        out[i:i + len(x)] += x[: N - i]
    return out

# ------------------------------------------------------------------ music bed (calm lo-fi tech)
def midi(m): return 440 * 2 ** ((m - 69) / 12)
CHORDS = [  # (bass, voicing) — Fmaj9, Dm9, Bbmaj9, Csus2
    (41, [57, 60, 64, 67]), (38, [53, 57, 60, 64]), (46, [53, 57, 60, 62]), (48, [55, 60, 62, 67]),
]
BAR = 60 / 80 * 4  # 80 bpm, 4/4
def music():
    out = np.zeros(N)
    chord_len = 2 * BAR
    n_ch = int(np.ceil(END_T / chord_len))
    t_all = np.arange(N) / SR
    for c in range(n_ch):
        t0 = c * chord_len
        final = t0 + chord_len >= 123.5
        bass, notes = CHORDS[c % 4] if not final else CHORDS[0]
        dur = chord_len + 1.5 if not final else END_T - t0
        i0 = int(t0 * SR); n = min(int(dur * SR), N - i0)
        if n <= 0: break
        tt = np.arange(n) / SR
        att = np.clip(tt / 1.2, 0, 1)
        rel = np.clip((dur - tt) / 1.5, 0, 1) if not final else np.clip((dur - tt) / 2.6, 0, 1)
        e = att * rel
        pad = np.zeros(n)
        for m in notes:
            f = midi(m)
            for det in (-0.12, 0.0, 0.12):
                ff = f * 2 ** (det / 12)
                pad += np.sin(2 * np.pi * ff * tt + rng.uniform(0, 6.28))
                pad += 0.25 * np.sin(2 * np.pi * 2 * ff * tt)
        pad *= e / len(notes)
        sub = 0.55 * np.sin(2 * np.pi * midi(bass) * tt) * e
        out[i0:i0 + n] += pad * 0.5 + sub * 0.6
        if final: break
    out = lp(out, 1800)
    # soft plucked keys (sparse arpeggio), from the workflow section on a touch brighter
    plucks = np.zeros(N)
    beat = BAR / 4
    b = 0
    while b * beat < 123.6:
        t0 = b * beat
        c = int(t0 // (2 * BAR)) % 4
        notes = CHORDS[c][1]
        pattern = [0, None, 2, 1, None, 3, 2, None]
        idx = pattern[b % 8]
        if idx is not None and rng.random() > 0.15:
            m = notes[idx % len(notes)] + 12
            d = 0.9; tt = t_arr(d)
            x = (np.sin(2 * np.pi * midi(m) * tt) + 0.3 * np.sin(2 * np.pi * 2 * midi(m) * tt)) * env_ad(len(tt), 0.004, 0.28)
            bright = 0.5 if t0 < 46.75 else 0.75
            i = int(t0 * SR); plucks[i:i + len(x)] += x[: N - i] * bright * rng.uniform(0.6, 1.0)
        b += 1
    plucks = lp(plucks, 3200)
    # final resolve: one soft pluck chord on the last Fmaj9
    for k, m in enumerate([62, 66, 69, 73]):
        tt = t_arr(3.0); x = np.sin(2 * np.pi * midi(m) * tt) * env_ad(len(tt), 0.006, 0.9)
        i = int((124.5 + k * 0.07) * SR); plucks[i:i + len(x)] += x[: N - i] * 0.7
    # gentle soft shaker on off-beats (very low)
    shaker = np.zeros(N)
    b = 0
    while b * beat < 123.3:
        if b % 2 == 1:
            L = int(0.06 * SR); x = hp(rng.standard_normal(L), 6000) * env_ad(L, 0.004, 0.015)
            i = int(b * beat * SR); shaker[i:i + L] += x * 0.12
        b += 1
    mix = out * 1.0 + plucks * 0.35 + shaker
    # overall arc: fade in, slight lift at the pivot, calm resolve
    arc = np.clip(t_all / 2.5, 0, 1) * (0.85 + 0.15 * np.clip((t_all - 46.75) / 2, 0, 1))
    fade = np.clip((END_T - t_all) / 2.2, 0, 1)
    return mix * arc * fade

# ------------------------------------------------------------------ mix
def read_vo():
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', VO_PATH, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.int16).astype(np.float64) / 32768
    out = np.zeros(N); out[: min(len(x), N)] = x[:N]
    return out

def speech_rms(vo):
    win = int(0.05 * SR); frames = vo[: len(vo) // win * win].reshape(-1, win)
    r = np.sqrt((frames ** 2).mean(1)); thr = r.max() * db(-30)
    return np.sqrt((r[r > thr] ** 2).mean()), r, win

def rms(x):
    return np.sqrt(np.mean(x[np.abs(x) > 1e-6] ** 2))

def write_wav(path, stereo):
    s = np.clip(stereo, -1, 1); pcm = (s * 32767).astype(np.int16)
    w = wave.open(path, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()

def main():
    os.makedirs(OUT, exist_ok=True)
    vo = read_vo()
    vr, r, win = speech_rms(vo)
    print(f'VO speech RMS {20*np.log10(vr):.1f} dBFS')
    m = music(); m *= vr * db(-21) / rms(m)
    # ducking: -3 dB extra while speech is present (smoothed)
    act = np.repeat((r > r.max() * db(-32)).astype(float), win); act = np.pad(act, (0, N - len(act)))[:N]
    act = sosfiltfilt(butter(1, 2.0, 'low', fs=SR, output='sos'), act)
    m *= 1 - (1 - db(-3)) * np.clip(act, 0, 1)
    sfx = render_sfx()
    # reference: level of a typical short event (pop) → match to target below VO
    ref = np.sqrt(np.mean(s_pop(0)[: int(0.05 * SR)] ** 2)); ref = 1.0  # events are pre-normalized to unit short-term RMS
    for name, rel in (('standard', -17), ('lighter', -20), ('stronger', -15)):
        s = sfx * vr * db(rel) / ref
        # subtle stereo: music slightly wide, SFX centered, VO centered
        mL = m + 0.0; mR = lp(m, 1700) * 0.3 + m * 0.7
        L = vo + s + mL; R = vo + s + mR
        st = np.stack([L, R], 1)
        pk = np.abs(st).max()
        if pk > db(-1.0): st *= db(-1.0) / pk
        write_wav(os.path.join(OUT, f'mix_{name}.wav'), st)
        print(name, 'peak', f'{20*np.log10(np.abs(st).max()):.1f} dBFS')
    json.dump(E, open(os.path.join(ROOT, 'data', 'sfx_events.json'), 'w'), indent=0)
    print('events', len(E))

if __name__ == '__main__':
    main()
