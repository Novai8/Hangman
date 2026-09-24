"""Map the hand-corrected script (data/script.txt) onto the word timings
measured from the voiceover (data/vosk_words.json). Fails loudly on mismatch."""
import json, re, sys, os
D = os.path.join(os.path.dirname(__file__), '..', 'data')
vw = json.load(open(os.path.join(D, 'vosk_words.json')))
toks = [dict(w=x['word'], s=x['start'], e=x['end']) for x in vw]

# Recognizer corrections (checked against the audio context).
MERGE3 = {('back', 'and', 'forth'): 'back-and-forth', ('and', 'so', 'det'): 'instead',
          ('save', 'from', 'off'): 'saved per month'}
MERGE2 = {('work', 'flow'): 'workflow', ('follow', 'up'): 'follow-up', ('no', 'shows'): 'no-shows',
          ('any', 'time'): 'anytime', ('be', 'because'): 'because', ('cow', 'calendar'): 'calendar',
          ('one', 'hundred'): '100', ('five', 'hundred'): '500'}
SUB = {'asked': 'asks', "what's": 'what', 'proposed': 'propose', 'confirmed': 'confirm', 'problem': 'problems',
       'prefer': 'preferred', 'since': 'sends', 'illustrated': 'illustrative', 'six': '6', 'eight': '8'}
fixed = []
i = 0
while i < len(toks):
    w = toks[i]['w']; prev = fixed[-1]['w'] if fixed else ''
    n1 = toks[i+1]['w'] if i+1 < len(toks) else ''; n2 = toks[i+2]['w'] if i+2 < len(toks) else ''
    if (w, n1, n2) in MERGE3:
        rep = MERGE3[(w, n1, n2)].split(' ')
        if len(rep) == 1: fixed.append(dict(w=rep[0], s=toks[i]['s'], e=toks[i+2]['e']))
        else:
            for k, r in enumerate(rep): fixed.append(dict(w=r, s=toks[i+k]['s'], e=toks[i+k]['e']))
        i += 3; continue
    if (w, n1) in MERGE2:
        fixed.append(dict(w=MERGE2[(w, n1)], s=toks[i]['s'], e=toks[i+1]['e'])); i += 2; continue
    t = dict(toks[i])
    if w == 'wanna':  # "want to": split the token evenly
        m = (t['s'] + t['e']) / 2
        fixed.append(dict(w='want', s=t['s'], e=m)); fixed.append(dict(w='to', s=m, e=t['e'])); i += 1; continue
    if w == 'out' and prev == 'starting': t['w'] = 'all'
    elif w == 'were': t['w'] = 'where' if prev == 'is' else 'or'
    elif w == 'check' and prev == 'then': t['w'] = 'checks'
    elif w == 'a' and prev == 'set' and n1 == 'follow': t['w'] = 'of'
    elif w == 'as' and prev == 'goal': t['w'] = 'is'
    elif w == 'five' and n1 == 'minutes': t['w'] = '5'
    elif w == 'one' and n1 == 'minute': t['w'] = '1'
    elif w in SUB: t['w'] = SUB[w]
    fixed.append(t); i += 1

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
