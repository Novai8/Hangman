"""Write SRT captions (sentence case, max 2 lines) from data/captions.json."""
import json, os
ROOT = os.path.join(os.path.dirname(__file__), '..')
caps = json.load(open(os.path.join(ROOT, 'data', 'captions.json')))
def ts(t):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f'{h:02}:{m:02}:{s:02},{ms:03}'
def join(ws): return ' '.join(ws).replace('— ', '—')
def two_lines(words, maxc=42):
    s = join(words)
    if len(s) <= maxc: return s
    best = None
    for k in range(1, len(words)):
        if words[k - 1].endswith('—'): continue
        a, b = join(words[:k]), join(words[k:])
        d = max(len(a), len(b))
        if best is None or d < best[0]: best = (d, a + '\n' + b)
    return best[1]
out = []
for i, c in enumerate(caps):
    nxt = caps[i + 1]['s'] if i + 1 < len(caps) else 1e9
    start = max(0, c['s'] - 0.2); end = min(nxt - 0.22, c['e'] + 1.1)
    out.append(f"{i+1}\n{ts(start)} --> {ts(end)}\n{two_lines([w['t'] for w in c['words']])}\n")
p = os.path.join(ROOT, 'output', 'northwind_studio_appointments_captions.srt')
open(p, 'w').write('\n'.join(out)); print('wrote', p, len(out), 'cues')
