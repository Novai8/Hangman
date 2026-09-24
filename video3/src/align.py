"""Map the hand-corrected script (data/script.txt) onto the word timings
measured from the voiceover (data/vosk_words.json). Fails loudly on mismatch."""
import json, re, sys, os
D = os.path.join(os.path.dirname(__file__), '..', 'data')
vw = json.load(open(os.path.join(D, 'vosk_words.json')))
toks = [dict(w=x['word'], s=x['start'], e=x['end']) for x in vw]

# Recognizer corrections (checked against the audio context).
MERGE4 = {('valley', 'at', 'a', 'to'): 'validates'}
MERGE3 = {('twelve', 'hundred', 'minutes'): '1,200 minutes', ('three', 'hundred', 'documents'): '300 documents'}
MERGE2 = {('work', 'flow'): 'workflow', ('follow', 'ups'): 'follow-ups', ('in', 'take'): 'intake',
          ('for', 'four'): '4', ('that', 'has'): "that's", ('duplicate', 'spite'): 'duplicates by'}
SPLIT = {'season': ['saves', 'it', 'in']}
SUB = {'pdf': 'PDF', 'rights': 'writes', 'que': 'queue', 'illustrated': 'illustrative', 'very': 'vary',
       'save': 'saved', 'twenty': '20'}
fixed = []
i = 0
while i < len(toks):
    w = toks[i]['w']; prev = fixed[-1]['w'] if fixed else ''
    nx = [toks[i + k]['w'] if i + k < len(toks) else '' for k in range(1, 4)]
    if (w, *nx) in MERGE4:
        fixed.append(dict(w=MERGE4[(w, *nx)], s=toks[i]['s'], e=toks[i + 3]['e'])); i += 4; continue
    for L, M in ((3, MERGE3), (2, MERGE2)):
        key = tuple([w] + nx[:L - 1])
        if key in M:
            rep = M[key].split(' ')
            if len(rep) == 1: fixed.append(dict(w=rep[0], s=toks[i]['s'], e=toks[i + L - 1]['e']))
            else:
                # first replacement word spans all but the last token; last word keeps the last token
                fixed.append(dict(w=rep[0], s=toks[i]['s'], e=toks[i + L - 2]['e']))
                fixed.append(dict(w=rep[1], s=toks[i + L - 1]['s'], e=toks[i + L - 1]['e']))
            i += L; break
    else:
        t = dict(toks[i])
        if w in SPLIT:
            parts = SPLIT[w]; d = (t['e'] - t['s']) / len(parts)
            for k, p in enumerate(parts): fixed.append(dict(w=p, s=t['s'] + k * d, e=t['s'] + (k + 1) * d))
            i += 1; continue
        if w == 'document' and toks[i + 1]['w'] == 'or': t['w'] = 'documents'
        elif w == 'or' and prev == 'documents': t['w'] = 'are'
        elif w == 'of' and prev == 'address': t['w'] = 'at'
        elif w == 'in' and toks[i + 1]['w'] == 'a' and toks[i + 2]['w'] == 'volume': t['w'] = 'and'
        elif w == 'a' and prev == 'and' and toks[i + 1]['w'] == 'volume': t['w'] = 'as'
        elif w == 'are' and prev == 'missing': t['w'] = 'or'
        elif w == 'is' and prev == 'guessing': t['w'] = "it's"
        elif w == 'five' and toks[i + 1]['w'] == 'minutes': t['w'] = '5'
        elif w == 'one' and toks[i + 1]['w'] == 'minute': t['w'] = '1'
        elif w in SUB: t['w'] = SUB[w]
        fixed.append(t); i += 1
    continue

norm = lambda s: re.sub(r"[^a-z0-9'\-]", '', s.lower().replace('*', '').replace('’', "'"))
lines = [l.strip() for l in open(os.path.join(D, 'script.txt')) if l.strip()]
out = []; k = 0
for li, line in enumerate(lines):
    words = []
    for dw in line.split(' '):
        parts = dw.split('—')
        for pi, p in enumerate(parts):
            disp = p + ('—' if pi < len(parts) - 1 else '')
            key = '*' in p
            tk = fixed[k]
            if norm(p) != norm(tk['w']):
                sys.exit(f'MISMATCH line {li}: script "{p}" vs audio "{tk["w"]}" at {tk["s"]}')
            words.append(dict(t=disp.replace('*', ''), s=tk['s'], e=tk['e'], key=key)); k += 1
    out.append(dict(words=words, s=words[0]['s'], e=words[-1]['e']))
assert k == len(fixed), f'unused audio tokens: {len(fixed)-k}'
json.dump(out, open(os.path.join(D, 'captions.json'), 'w'), indent=1)
print('aligned', k, 'words into', len(out), 'caption lines')
