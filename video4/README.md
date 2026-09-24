# Daily Executive Operations Brief: demo video (Niche 3, Demo #4)

**Inbox + calendar + tasks → Daily brief → Priority flags → Links → Log → Safe failure**

This is an independent portfolio prototype. All data is fictional, and the time savings are illustrative assumptions. Results vary. The UI is generic, with no real email, calendar, task or chat brands.

## Deliverables (`video4/output/`)

| File | What it is |
|---|---|
| `northwind_services_daily_brief_final.mp4` | **Main render.** 1920×1080, 30 fps, H.264 with AAC audio. Burned-in captions highlight each word as it is spoken. Uses the standard SFX mix. |
| `northwind_services_daily_brief_no_captions.mp4` | The same video with no captions. |
| `northwind_services_daily_brief_captions.srt` | SRT captions (sentence case, 2 lines max, 53 cues). Use these with the no-captions video. |
| `northwind_services_daily_brief_audio_sfx_lighter.m4a` | Replacement audio track with lighter SFX (−20 dB under the VO). |
| `northwind_services_daily_brief_audio_sfx_stronger.m4a` | Replacement audio track with slightly stronger SFX (−15 dB under the VO). Still soft. |

To swap in another SFX mix, keep the picture as is and replace the audio track:
```bash
ffmpeg -i northwind_services_daily_brief_final.mp4 -i northwind_services_daily_brief_audio_sfx_lighter.m4a \
  -map 0:v -map 1:a -c copy northwind_services_daily_brief_sfx_lighter.mp4
```

## How sync works

The voiceover (`data/vo.mp3`, 152.7 s, which is `tmphcferzbm.mp3` from `main`) sets the timing for everything.

1. A speech recognizer measured the start and end time of every spoken word (`data/vosk_words.json`). Unclear passages were re-checked against alternative recognition hypotheses.
2. `data/script.txt` holds the hand-corrected transcript. `src/align.py` maps it onto the measured timings and stops with an error if any word fails to match. It found 398 words in 53 caption lines and wrote them to `data/captions.json`.
3. Every on-screen cue in `src/scenes_a.mjs` and `src/scenes_b.mjs` is keyed to a word time. Examples:
   - The cursor clicks Inbox on "email", Calendar on "calendar" and Tasks on "tasks".
   - The context-switch counter flips 1 → 9 → 17.
   - Each flag pops on its spoken word ("urgent", "overdue", "waiting").
   - "Calendar unavailable" appears on "unavailable".
   - "≈3.3 hours/month" rolls in on "hours".
4. SFX events in `src/audio.py` use the same timestamps.

The video has 19 scenes plus a persistent stepper layer, in four colour sections: warm scattered morning (0–47 s), cool organized brief (47–82 s), amber safety and review (82–116 s) and dark outcome (116–154 s). The sections are joined by zoom-through, parallax slide and match-cut transitions (the source tiles hold still across a cut), with one soft blur title card for the pivot ("Daily operations brief").

## Locked data (identical everywhere)

- Business **Northwind Services**, owner **Alex Rivera** (Ops lead)
- Sources: Inbox, Calendar, Tasks. Each source has a fixed icon and colour throughout.
- Inbox items: Client follow-up: proposal · Invoice question · Appointment request
- Calendar items: 10:00 Client call · 14:30 Team check-in
- Tasks: Send quote · Review invoice · Confirm schedule
- Stepper: Pull sources → Summarize → Group → Flag → Deliver
- Brief (delivered 07:30). Each of the 8 items appears once:
  - Top priorities: Client follow-up: proposal (Due today), Invoice question (Urgent)
  - Today's schedule: 10:00 Client call, 14:30 Team check-in
  - Next actions: Confirm schedule, Appointment request
  - Waiting on: Send quote (Waiting on reply)
  - Overdue: Review invoice (Overdue)
- Groups: Customer requests · Approvals · Follow-ups
- Controls: Allowed sources · Exclude sensitive · Exclude senders
- Audit log (07:30:02 → 07:30:10): Sources checked → Brief generated → Delivered → Errors: none
- Safe failure: Calendar unavailable → Stopped safely → Owner alerted → Retry scheduled
- Estimate math (labelled *Illustrative assumptions*):
  - Manual check 15 min/day − Brief review 5 min/day = Savings: 10 min/day
  - 10 min × 20 workdays = 200 min
  - 200 min ÷ 60 ≈ **3.3 hours/month (estimate)**
- Disclaimers: Independent portfolio prototype · Fictional data · Illustrative assumptions · Results vary

**Note on the VO:** the voiceover says "roughly three and a half hours per month". On screen we show the mathematically correct ≈3.3 hours/month, as specified in the brief. The captions transcribe the VO as spoken.

## QA

- `node src/render.mjs --qa` checks every frame. It fails if:
  - any text or card leaves the 8% title-safe area
  - any UI enters the caption band
  - any text overflows its container
  - any caption needs more than 2 lines
- `--qacam` repeats the same checks with camera push-ins applied.
- Both passes report **0 issues**. Stills from every scene were also reviewed by eye for overlap and spacing.
- All 394 unique on-screen and caption words were spell-checked. All locked data lives in `src/components.mjs` and is reused everywhere else.

## Sound

Everything is synthesized in `src/audio.py`, so there are no third-party samples.

- **SFX:** muted clicks, hover ticks, airy whooshes, soft pops, gentle typing (only while the log types), a warm chime and a gentle amber tone. There are no error beeps. 170 events, each with small random variation.
- **Music:** a calm pad with sparse plucks (F major, 80 bpm), about −21 dB under the VO. It ducks while speech is playing and lifts slightly at the pivot.
- **Master:** loudness is normalized to −16 LUFS.

## Rebuild

```bash
cd video4
npm install && pip install numpy scipy
./build.sh               # QA → audio → render (captioned + clean) → mux
node src/render.mjs --stills 68.9,110.9   # preview single frames
```
