"""Sound design + music bed + mix for the Northwind Studio scheduling video.

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
END_T = 148.3
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

# 1 hook — five emails stack, collapse, pick a time
for t in (0.30, 0.63, 0.95, 1.50, 1.80): ev('pop', t, g=0.7)
ev('whoosh', 4.47, d=0.5, g=0.5); ev('pop', 4.8, g=0.6); ev('tick', 5.45); ev('click', 5.82); ev('check', 6.51)
# 2 back-and-forth
ev('whoosh', 7.3, d=0.45); ev('pop', 7.53, g=0.45)
for k in range(8): ev('tick', 9.48 + k * 0.07 + 0.02, g=0.35 + 0.03 * k)
for k in range(4): ev('pop', 11.99 + k * 0.12, g=0.45)
ev('pop', 12.3, g=0.55); ev('whoosh', 13.25, d=0.35, g=0.3)
for t in (13.71, 15.45, 16.80, 19.53): ev('pop', t, g=0.75)
for t in (13.71, 15.45, 16.80, 18.45, 19.71): ev('roll', t + 0.03, g=0.55)
ev('tick', 17.28); ev('amber', 18.0, g=0.65); ev('pop', 20.0, g=0.55)
# 3 coordination
ev('whoosh', 20.4, d=0.45); ev('pop', 20.6, g=0.6)
for t in (20.79, 21.0, 21.27, 21.5): ev('tick', t, g=0.7)
ev('pop', 23.25, g=0.5)
# 4 unstructured
ev('whoosh', 24.05, d=0.45); ev('pop', 24.36, g=0.4)
for t in (25.62, 25.8, 25.98, 26.16): ev('tick', t, g=0.55)
for t in (29.07, 30.81, 32.40): ev('pop', t, g=0.8)
for t in (34.11, 34.3, 34.5, 34.7): ev('snap', t, g=0.45)
for t in (35.52, 36.30, 36.45, 36.60): ev('tick', t, g=0.5)
# 5 manual steps + loop
ev('whoosh', 37.35, d=0.45)
for t in (38.40, 39.54, 41.52, 42.81, 43.89, 46.14): ev('pop', t, g=0.75); ev('roll', t + 0.05, g=0.35)
ev('whoosh', 46.35, d=0.7, g=0.35, f0=300, f1=1400); ev('pop', 46.4, g=0.55)
# 6 busy
ev('whoosh', 47.4, d=0.45); ev('roll', 47.61, g=0.6); ev('roll', 49.02, g=0.6); ev('pop', 50.55, g=0.6)
# 7 problems (soft pops only)
ev('whoosh', 51.1, d=0.45)
for t in (52.95, 55.65, 59.40): ev('pop', t, g=0.85)
for t in (54.90, 56.31, 60.69): ev('tick', t, g=0.5)
# 8 scheduling vs service
ev('whoosh', 62.45, d=0.45); ev('tick', 64.26, g=0.5); ev('pop', 66.54, g=0.7)
# 9 pivot
ev('whoosh', 67.3, d=0.9, g=0.6, f0=300, f1=1800)
# 10 extract
ev('whoosh', 69.1, d=0.45); ev('pop', 69.42, g=0.6)
for t in (75.05, 75.65, 76.64): ev('snap', t, g=0.8)
ev('pop', 77.9, g=0.5); ev('snap', 79.38, g=0.8); ev('check', 79.45, g=0.8)
# 11 availability → options → confirm → event
ev('whoosh', 79.8, d=0.45); ev('whoosh', 80.19, d=1.3, g=0.3, f0=300, f1=1200); ev('check', 81.9, g=0.8)
for t in (82.95, 83.34, 83.64): ev('pop', t, g=0.7)
ev('tick', 84.1); ev('tick', 84.75); ev('click', 85.59); ev('check', 85.72)
ev('whoosh', 86.45, d=0.6, g=0.45)
for t in (86.95, 87.18, 87.72): ev('tick', t, g=0.5)
ev('chime', 88.20)
# 12 confirmation + reminders + log
ev('whoosh', 89.45, d=0.45); typing(89.5, 89.95); ev('click', 89.96); ev('check', 90.05)
ev('pop', 91.14, g=0.7); ev('snap', 91.35, g=0.55); ev('pop', 91.62, g=0.7); ev('snap', 91.85, g=0.55)
ev('tick', 92.04, g=0.6); ev('check', 92.52, g=0.8)
# 13 unclear → follow-ups
ev('whoosh', 93.2, d=0.45); ev('pop', 93.42, g=0.4); ev('pop', 95.55, g=0.7); ev('pop', 96.99, g=0.55)
typing(98.5, 99.1)
for t in (99.52, 99.80, 100.30): ev('snap', t, g=0.7)
for t in (100.45, 100.55, 100.65): ev('tick', t, g=0.4)
ev('pop', 101.04, g=0.7)
# 14 safety: double booking + time zones
ev('whoosh', 101.6, d=0.45); ev('whoosh', 103.62, d=0.4, g=0.35); ev('click', 104.1, g=0.5); ev('amber', 104.41)
ev('tick', 104.9, g=0.5); ev('snap', 105.42, g=0.7); ev('roll', 105.5, g=0.6); ev('check', 105.72, g=0.7)
# 15 approval
ev('whoosh', 106.35, d=0.45); ev('tick', 106.95); ev('click', 107.25); typing(107.4, 107.85)
ev('pop', 107.95, g=0.5); ev('tick', 108.15); ev('click', 108.45); ev('chime', 108.63, g=0.7)
# 16 fail safe
ev('whoosh', 109.45, d=0.45); ev('amber', 111.24); ev('check', 113.11, g=0.8); ev('check', 114.88, g=0.8)
# 17 outcome
ev('whoosh', 115.25, d=0.5)
for t in (119.16, 122.22, 126.30): ev('pop', t, g=0.75)
ev('pop', 124.62, g=0.8); ev('tick', 124.98, g=0.5); ev('tick', 128.64, g=0.6); ev('tick', 130.32, g=0.6); ev('roll', 130.95); ev('pop', 134.64, g=0.55)
# 18 close
ev('whoosh', 135.8, d=0.6, g=0.55)
for t in (136.36, 138.64, 139.72): ev('check', t, g=0.85)
ev('whoosh', 140.35, d=0.8, g=0.45); ev('chime', 141.33, g=0.6)

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
CHORDS = [  # (bass, voicing) — Cmaj9, Am9, Fmaj7(9), Gsus2
    (36, [52, 55, 59, 62]), (45, [52, 55, 60, 64, 67]), (41, [52, 55, 57, 60, 64]), (43, [55, 57, 62, 67]),
]
BAR = 60 / 88 * 4  # 88 bpm, 4/4
def music():
    out = np.zeros(N)
    chord_len = 2 * BAR
    n_ch = int(np.ceil(END_T / chord_len))
    t_all = np.arange(N) / SR
    for c in range(n_ch):
        t0 = c * chord_len
        final = t0 + chord_len >= 144.5
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
    while b * beat < 144.8:
        t0 = b * beat
        c = int(t0 // (2 * BAR)) % 4
        notes = CHORDS[c][1]
        pattern = [0, None, 2, 1, None, 3, 2, None]
        idx = pattern[b % 8]
        if idx is not None and rng.random() > 0.15:
            m = notes[idx % len(notes)] + 12
            d = 0.9; tt = t_arr(d)
            x = (np.sin(2 * np.pi * midi(m) * tt) + 0.3 * np.sin(2 * np.pi * 2 * midi(m) * tt)) * env_ad(len(tt), 0.004, 0.28)
            bright = 0.5 if t0 < 67.4 else 0.75
            i = int(t0 * SR); plucks[i:i + len(x)] += x[: N - i] * bright * rng.uniform(0.6, 1.0)
        b += 1
    plucks = lp(plucks, 3200)
    # final resolve: one soft pluck chord on the last Fmaj9
    for k, m in enumerate([60, 64, 67, 71]):
        tt = t_arr(3.0); x = np.sin(2 * np.pi * midi(m) * tt) * env_ad(len(tt), 0.006, 0.9)
        i = int((146.45 + k * 0.07) * SR); plucks[i:i + len(x)] += x[: N - i] * 0.7
    # gentle soft shaker on off-beats (very low)
    shaker = np.zeros(N)
    b = 0
    while b * beat < 144.5:
        if b % 2 == 1:
            L = int(0.06 * SR); x = hp(rng.standard_normal(L), 6000) * env_ad(L, 0.004, 0.015)
            i = int(b * beat * SR); shaker[i:i + L] += x * 0.12
        b += 1
    mix = out * 1.0 + plucks * 0.35 + shaker
    # overall arc: fade in, slight lift at the pivot, calm resolve
    arc = np.clip(t_all / 2.5, 0, 1) * (0.85 + 0.15 * np.clip((t_all - 67.4) / 2, 0, 1))
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
