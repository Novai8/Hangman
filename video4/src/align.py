"""Map the hand-corrected script (data/script.txt) onto the word timings
measured from the voiceover (data/vosk_words.json). Fails loudly on mismatch."""
import json, re, sys, os
D = os.path.join(os.path.dirname(__file__), '..', 'data')
vw = json.load(open(os.path.join(D, 'vosk_words.json')))
toks = [dict(w=x['word'], s=x['start'], e=x['end']) for x in vw]

# Recognizer corrections by token index (checked with alternative hypotheses).
# value: list of replacement words spanning tokens [i, i+n)
EDIT = {3: (1, ['ops', 'leads']), 15: (1, ['then']), 56: (1, ['a', 'reply']),
        75: (2, ['So', 'you', 'spend']), 79: (1, ['part', 'of']), 95: (2, ['follow-ups']),
        106: (2, ['context']), 128: (3, ['the', 'workflow']), 131: (1, ['creates']), 140: (1, ['the']),
        152: (1, ['it']), 159: (2, ['readable']), 179: (1, ['overdue']), 199: (2, ['follow-ups']),
        201: (2, ['so', 'you', 'can']), 207: (1, ["It's"]), 213: (1, ['does']), 255: (1, ['senders']),
        261: (1, ['logged']), 263: (2, ['workflow']), 293: (1, ['alerts']), 305: (1, ['illustrative']),
        311: (1, ['15']), 329: (1, ['that', 'to']), 331: (1, ['5']), 335: (3, ['a', 'ready-made']),
        342: (1, ['10']), 347: (1, ['20']), 353: (2, ['200']), 357: (1, ['or']), 376: (2, ['result'])}
fixed = []
i = 0
while i < len(toks):
    if i in EDIT:
        n, rep = EDIT[i]; s0, e0 = toks[i]['s'], toks[i + n - 1]['e']; d = (e0 - s0) / len(rep)
        for k, p in enumerate(rep): fixed.append(dict(w=p, s=s0 + k * d, e=s0 + (k + 1) * d))
        i += n; continue
    fixed.append(dict(toks[i])); i += 1

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
