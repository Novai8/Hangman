"""Map the hand-corrected script (data/script.txt) onto the word timings
measured from the voiceover (data/vosk_words.json). Fails loudly on mismatch."""
import json, re, sys, os
D = os.path.join(os.path.dirname(__file__), '..', 'data')
vw = json.load(open(os.path.join(D, 'vosk_words.json')))
toks = [dict(w=x['word'], s=x['start'], e=x['end']) for x in vw]

fixed = []
i = 0
MERGE = {('charge','backs'):'chargebacks', ('work','flow'):'workflow', ('follow','up'):'follow-up',
         ('low','risk'):'low-risk', ('high','risk'):'high-risk', ('forty','five'):'45', ('five','hundred'):'500'}
SUB = {'pods':'parts','than':'then','problem':'problems','structures':'structure','files':'fails',
       'three':'3','two':'2','sixteen':'16','seventeen':'17'}
while i < len(toks):
    w = toks[i]['w']
    prev = fixed[-1]['w'] if fixed else ''
    nxt = toks[i+1]['w'] if i+1 < len(toks) else ''
    if w == 'a' and prev == 'tricky': i += 1; continue
    if (w, nxt) in MERGE:
        fixed.append(dict(w=MERGE[(w,nxt)], s=toks[i]['s'], e=toks[i+1]['e'])); i += 2; continue
    t = dict(toks[i])
    if w == 'a' and nxt == 'mixed': t['w'] = 'are'
    elif w == 'and' and prev == 'or' and nxt == 'unavailable': t['w'] = 'an'
    elif w == 'day' and prev == 'structure': t['w'] = 'stay'
    elif w == 'time' and nxt == 'slip': t['w'] = 'times'
    elif w in SUB: t['w'] = SUB[w]
    fixed.append(t); i += 1

norm = lambda s: re.sub(r"[^a-z0-9'\-]", '', s.lower().replace('*','').replace('’',"'"))
lines = [l.strip() for l in open(os.path.join(D, 'script.txt')) if l.strip()]
out = []; k = 0
for li, line in enumerate(lines):
    words = []
    for dw in line.split(' '):
        parts = dw.split('—')  # "question—how" spans two spoken tokens
        for pi, p in enumerate(parts):
            disp = p + ('—' if pi < len(parts)-1 else '')
            key = '*' in p
            tk = fixed[k]
            if norm(p) != norm(tk['w']):
                sys.exit(f'MISMATCH line {li}: script "{p}" vs audio "{tk["w"]}" at {tk["s"]}')
            words.append(dict(t=disp.replace('*',''), s=tk['s'], e=tk['e'], key=key)); k += 1
    out.append(dict(words=words, s=words[0]['s'], e=words[-1]['e']))
assert k == len(fixed), f'unused audio tokens: {len(fixed)-k}'
json.dump(out, open(os.path.join(D, 'captions.json'), 'w'), indent=1)
print('aligned', k, 'words into', len(out), 'caption lines')
