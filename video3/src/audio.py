"""Sound design + music bed + mix for the Northwind Repairs document intake video.

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
END_T = 127.0
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

# 1 hook — documents fan in
for t in (0.30, 0.78, 1.65): ev('pop', t, g=0.7)
ev('pop', 2.07, g=0.5)
# 2 email → open PDF → find fields
ev('whoosh', 4.1, d=0.45)
for k in range(5): ev('tick', 4.57 + k * 0.06, g=0.3)
ev('pop', 4.89, g=0.55); ev('pop', 5.61, g=0.7); ev('tick', 6.8); ev('click', 7.02); ev('whoosh', 7.1, d=0.4, g=0.35)
for k in range(6): ev('tick', 7.9 + k * 0.16, g=0.35)
# 3 type into sheet → rename → file away → slow + mistake
ev('whoosh', 9.3, d=0.45)
for tm in (9.75, 10.45, 11.15): ev('click', tm + 0.3, g=0.7); typing(tm + 0.35, tm + 0.7)
ev('pop', 12.12, g=0.55); typing(12.3, 13.35)
ev('whoosh', 13.65, d=0.5, g=0.45); ev('pop', 14.12, g=0.6); ev('check', 14.4, g=0.8)
ev('pop', 15.36, g=0.6); ev('pop', 16.41, g=0.7); ev('amber', 17.52, g=0.6)
# 4 inconsistent layouts
ev('whoosh', 18.45, d=0.45); ev('pop', 22.62, g=0.6); ev('pop', 24.78, g=0.6); ev('whoosh', 24.95, d=0.5, g=0.3, f0=300, f1=1400); ev('tick', 25.2, g=0.6)
# 5 vendor formats
ev('whoosh', 25.75, d=0.45)
for t in (25.77, 26.34, 27.27): ev('pop', t + 0.02, g=0.7)
for k in range(3): ev('tick', 27.0 + k * 0.12, g=0.35)
ev('pop', 28.8, g=0.6)
# 6 missing / hard to read → detective work
ev('whoosh', 29.45, d=0.45); ev('pop', 31.11, g=0.7); ev('pop', 32.34, g=0.6); ev('pop', 33.3, g=0.5)
ev('whoosh', 35.8, d=0.8, g=0.25, f0=300, f1=1200); ev('pop', 35.91, g=0.6)
for k in range(6): ev('tick', 36.84 + k * 0.13, g=0.35 + 0.03 * k)
# 7 costs (soft pops only)
ev('whoosh', 38.15, d=0.45)
for t in (40.71, 43.47, 45.84): ev('pop', t, g=0.85)
for t in (41.46, 42.51, 44.31, 46.35): ev('tick', t, g=0.5)
# 8 backlog
ev('whoosh', 47.7, d=0.45); ev('roll', 48.18, g=0.6); ev('roll', 48.66, g=0.6); ev('roll', 50.47, g=0.7); ev('pop', 50.8, g=0.6)
# 9 pivot
ev('whoosh', 51.6, d=0.9, g=0.6, f0=300, f1=1800)
# 10 email arrives → attachment → saved
ev('whoosh', 53.4, d=0.45); ev('pop', 54.25, g=0.6); ev('tick', 54.5, g=0.5); ev('pop', 55.07, g=0.8); ev('tick', 56.0, g=0.4)
ev('whoosh', 56.76, d=0.45, g=0.4); ev('snap', 57.2, g=0.6); ev('check', 57.35)
# 11 extract → validate
ev('whoosh', 58.0, d=0.45)
for i in range(7):
    if i != 4: ev('snap', 58.35 + i * 0.2 + 0.45, g=0.55)
for k in range(4): ev('tick', 60.78 + k * 0.12, g=0.4)
for t in (61.11, 61.35, 61.6): ev('check', t, g=0.65)
ev('amber', 61.98, g=0.6)
# 12 write record
ev('whoosh', 62.7, d=0.45)
for c in range(7): ev('tick', 63.3 + c * 0.2, g=0.4)
ev('chime', 64.8, g=0.55)
# 13 route to review queue
ev('whoosh', 65.7, d=0.45); ev('pop', 66.45, g=0.5); ev('pop', 67.11, g=0.6); ev('whoosh', 68.34, d=0.5, g=0.4); ev('roll', 68.85, g=0.6)
# 14 review: edit → approve
ev('whoosh', 69.4, d=0.45); ev('tick', 70.1); ev('click', 70.35); typing(70.55, 71.55); ev('check', 71.65, g=0.7); ev('pop', 71.1, g=0.5)
ev('tick', 71.95); ev('click', 72.2); ev('chime', 72.35, g=0.7)
# 15 duplicate
ev('whoosh', 73.45, d=0.45); ev('whoosh', 74.25, d=0.4, g=0.35); ev('whoosh', 75.18, d=0.66, g=0.25, f0=300, f1=1200); ev('pop', 75.84, g=0.6)
ev('amber', 76.35, g=0.8); ev('check', 76.85, g=0.8); ev('tick', 77.0, g=0.5)
# 16 audit log
ev('whoosh', 77.55, d=0.45)
for i in range(6): typing(77.95 + i * 0.33, 77.95 + i * 0.33 + 0.26); ev('check', 77.95 + i * 0.33 + 0.25, g=0.45)
for k in range(6): ev('tick', 79.77 + k * 0.06, g=0.3)
# 17 safe failure
ev('whoosh', 80.35, d=0.45); ev('amber', 80.75); ev('check', 81.4, g=0.8); ev('check', 82.72, g=0.8)
# 18 file linked → verify
ev('whoosh', 83.55, d=0.45); ev('pop', 84.42, g=0.55); ev('whoosh', 85.29, d=0.5, g=0.4); ev('snap', 85.77, g=0.8); ev('check', 85.85, g=0.6)
ev('tick', 87.6); ev('click', 87.93); ev('pop', 88.0, g=0.6); ev('chime', 89.40, g=0.55)
# 19 outcome
ev('whoosh', 90.25, d=0.5)
for t in (94.95, 98.19, 102.42): ev('pop', t, g=0.75)
ev('pop', 100.65, g=0.8); ev('tick', 101.0, g=0.5); ev('tick', 104.85, g=0.6); ev('tick', 107.1, g=0.6); ev('roll', 107.7); ev('pop', 110.67, g=0.55)
# 20–21 trust + close
ev('whoosh', 113.2, d=0.6, g=0.5)
for t in (113.62, 116.11, 117.28): ev('check', t, g=0.85)
ev('whoosh', 118.25, d=0.8, g=0.45); ev('chime', 118.92, g=0.6)

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
CHORDS = [  # (bass, voicing) — Dmaj9, Bm9, Gmaj7(9), Asus2
    (38, [54, 57, 61, 64]), (47, [54, 57, 62, 66, 69]), (43, [54, 57, 59, 62, 66]), (45, [57, 59, 64, 69]),
]
BAR = 60 / 84 * 4  # 84 bpm, 4/4
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
            bright = 0.5 if t0 < 51.8 else 0.75
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
    arc = np.clip(t_all / 2.5, 0, 1) * (0.85 + 0.15 * np.clip((t_all - 51.8) / 2, 0, 1))
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
