"""Sound design + music bed + mix for the Northwind Goods support-agent video.

All sounds are synthesized here (no third-party samples) so they stay soft, minimal
and license-free. The voiceover is the timing master and stays dominant:
  music bed  ~ -21 dB under the VO (plus gentle ducking while speech is present)
  SFX        ~ -17 dB under the VO (standard), -21 dB (lighter), -14 dB (stronger)

Usage: python3 src/audio.py            -> writes output/mix_standard.wav, mix_lighter.wav, mix_stronger.wav
"""
import os, json, wave
import numpy as np
from scipy.signal import butter, sosfilt, sosfiltfilt

SR = 48000
ROOT = os.path.join(os.path.dirname(__file__), '..')
VO_PATH = os.path.join(ROOT, '..', 'server', 'Quick question\u2014how much.wav')
OUT = os.path.join(ROOT, 'output')
END_T = 172.6
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

# Group A — the repetition
ev('tick', 0.10); ev('whoosh', 2.85, d=0.45)
for t in (2.97, 3.33, 3.87): ev('tick', t)
for t in (5.13, 5.46, 5.62): ev('tick', t, g=0.7)
for t in (6.84, 8.13, 9.93): ev('pop', t)
ev('whoosh', 12.0, d=0.55); ev('pop', 12.1); ev('roll', 13.50); ev('roll', 15.03)
ev('whoosh', 16.1, d=0.5)  # slide
for t in (16.45, 16.55, 16.65): ev('tick', t, g=0.6)
ev('pop', 17.67, g=0.7); ev('tick', 19.45); ev('click', 19.59); ev('pop', 20.67, g=0.6)
for t in (21.21, 21.33, 21.45): ev('snap', t, g=0.7)
ev('whoosh', 22.1, d=0.5); typing(22.45, 23.05)
for t in (23.05, 23.45, 23.85, 24.3, 24.8): ev('tick', t, g=0.8)
ev('click', 25.62); ev('check', 25.74); ev('pop', 25.95, g=0.7)
typing(26.55, 27.85); typing(27.96, 28.6); typing(28.95, 29.8); typing(30.9, 31.5)
for t in (26.55, 28.68, 30.84, 31.56): ev('roll', t, g=0.8)
ev('whoosh', 32.3, d=0.5); ev('amber', 34.53); ev('pop', 35.25); ev('pop', 36.27, g=0.6)
ev('whoosh', 37.8, d=0.4, g=0.5)
for t in (38.01, 38.2, 38.43): ev('tick', t, g=0.7)
# Group B — problems
ev('whoosh', 39.3, d=0.5)
for t in (41.79, 43.47, 45.21, 48.30, 50.46, 52.68): ev('pop', t, g=0.85)
ev('whoosh', 54.3, d=1.0, g=0.8, f0=250, f1=1800)  # soft blur title card
ev('whoosh', 56.35, d=0.45)
# Group C — workflow
ev('pop', 57.27); ev('pop', 57.60, g=0.7); ev('tick', 58.05); ev('click', 58.30)
for i in range(6): ev('tick', 59.16 + i * 0.08, g=0.5)
for t in (60.39, 61.38, 62.40, 63.12, 63.96): ev('tick', t, g=0.65)
ev('snap', 64.45); ev('check', 64.6)
for i in range(4): ev('tick', 65.22 + i * 0.07, g=0.5)
ev('pop', 65.9, g=0.8); ev('whoosh', 67.55, d=0.7, g=0.8); ev('pop', 68.10)
for t in (68.64, 68.95, 69.27, 69.60): ev('tick', t, g=0.7)
ev('check', 69.9)
ev('whoosh', 71.45, d=0.6, g=0.7)
for t in (72.78, 74.73, 75.21): ev('check', t)
ev('pop', 76.44, g=0.8)
ev('whoosh', 77.8, d=0.45)
# Group D — human approval
ev('pop', 78.87, g=0.8)
for t in (80.01, 80.15, 80.3): ev('tick', t, g=0.6)
ev('chime', 80.49, g=0.8)
ev('whoosh', 82.85, d=0.45, g=0.6); ev('pop', 83.16); ev('pop', 84.33)
ev('amber', 86.34); ev('pop', 90.03, g=0.7); ev('tick', 90.81); ev('tick', 91.77, g=0.7); ev('pop', 92.28, g=0.7)
ev('tick', 92.8); ev('click', 93.66); typing(93.8, 94.1); typing(94.1, 94.6); ev('tick', 94.8); ev('click', 95.0); ev('chime', 95.05)
# Group E — consistency, follow-up, logging, safe failure
ev('whoosh', 95.45, d=0.5); ev('pop', 95.85, g=0.7); ev('pop', 96.05, g=0.7)
for t in (97.53, 98.13, 98.76, 103.71): ev('check', t, g=0.8)
ev('whoosh', 98.76, d=0.6, g=0.35)
ev('whoosh', 104.95, d=0.5); ev('pop', 107.01, g=0.6); ev('amber', 107.34, g=0.8); ev('pop', 108.39)
for t in (108.96, 109.65, 110.10): ev('tick', t)
ev('check', 111.36)
ev('whoosh', 112.2, d=0.5)
for t in (115.50, 117.15, 118.92, 119.88, 121.26): typing(t - 0.05, t + 0.3); ev('check', t + 0.3, g=0.8)
ev('whoosh', 122.15, d=0.5); ev('pop', 124.53, g=0.8); ev('amber', 125.94); ev('check', 128.3); ev('check', 129.45)
# Group F — outcome + close
ev('whoosh', 130.1, d=0.5)
for t in (135.18, 140.07, 145.92): ev('pop', t, g=0.8)
ev('roll', 143.88); ev('tick', 146.61); ev('tick', 147.63); ev('roll', 148.23); ev('roll', 148.98, g=0.7); ev('pop', 153.96, g=0.7)
ev('whoosh', 154.9, d=0.6, g=0.6)
for t in (155.62, 158.14, 159.46): ev('check', t)
ev('whoosh', 160.9, d=0.8, g=0.5); ev('chime', 163.29, g=0.6)

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
CHORDS = [  # (bass, voicing) — Fmaj9, Dm9, Bbmaj7(#11), Csus2
    (41, [53, 57, 60, 64, 67]), (38, [50, 53, 57, 60, 64]), (46, [50, 53, 57, 58, 64]), (48, [55, 60, 62, 67]),
]
BAR = 3.0  # 80 bpm, 4/4
def music():
    out = np.zeros(N)
    chord_len = 2 * BAR
    n_ch = int(np.ceil(END_T / chord_len))
    t_all = np.arange(N) / SR
    for c in range(n_ch):
        t0 = c * chord_len
        final = t0 + chord_len >= 168.0
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
    while b * beat < 168.5:
        t0 = b * beat
        c = int(t0 // (2 * BAR)) % 4
        notes = CHORDS[c][1]
        pattern = [0, None, 2, 1, None, 3, 2, None]
        idx = pattern[b % 8]
        if idx is not None and rng.random() > 0.15:
            m = notes[idx % len(notes)] + 12
            d = 0.9; tt = t_arr(d)
            x = (np.sin(2 * np.pi * midi(m) * tt) + 0.3 * np.sin(2 * np.pi * 2 * midi(m) * tt)) * env_ad(len(tt), 0.004, 0.28)
            bright = 0.55 if t0 < 56 else 0.8
            i = int(t0 * SR); plucks[i:i + len(x)] += x[: N - i] * bright * rng.uniform(0.6, 1.0)
        b += 1
    plucks = lp(plucks, 3200)
    # final resolve: one soft pluck chord on the last Fmaj9
    for k, m in enumerate([65, 69, 72, 76]):
        tt = t_arr(3.0); x = np.sin(2 * np.pi * midi(m) * tt) * env_ad(len(tt), 0.006, 0.9)
        i = int((169.9 + k * 0.07) * SR); plucks[i:i + len(x)] += x[: N - i] * 0.7
    # gentle soft shaker on off-beats (very low)
    shaker = np.zeros(N)
    b = 0
    while b * beat < 168:
        if b % 2 == 1:
            L = int(0.06 * SR); x = hp(rng.standard_normal(L), 6000) * env_ad(L, 0.004, 0.015)
            i = int(b * beat * SR); shaker[i:i + L] += x * 0.12
        b += 1
    mix = out * 1.0 + plucks * 0.35 + shaker
    # overall arc: fade in, slight lift at the pivot, calm resolve
    arc = np.clip(t_all / 2.5, 0, 1) * (0.85 + 0.15 * np.clip((t_all - 54.6) / 2, 0, 1))
    fade = np.clip((END_T - t_all) / 2.2, 0, 1)
    return mix * arc * fade

# ------------------------------------------------------------------ mix
def read_vo():
    w = wave.open(VO_PATH); assert w.getframerate() == SR
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    if w.getnchannels() == 2: x = x.reshape(-1, 2).mean(1)
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
    for name, rel in (('standard', -17), ('lighter', -21), ('stronger', -14)):
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
