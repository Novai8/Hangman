# Appointment Request Automation: demo video (Niche 3, Demo #2)

**Extract details → Check availability → Propose slots → Confirm booking → Reminders → Log**

This is an independent portfolio prototype. All data is fictional, and the time savings are illustrative assumptions. Results vary. The UI is generic, with no real calendar, email or scheduling brands.

## Deliverables (`video2/output/`)

| File | What it is |
|---|---|
| `northwind_studio_appointments_final.mp4` | **Main render.** 1920×1080, 30 fps, H.264 with AAC audio. Burned-in captions highlight each word as it is spoken. Uses the standard SFX mix. |
| `northwind_studio_appointments_no_captions.mp4` | The same video with no captions. |
| `northwind_studio_appointments_captions.srt` | SRT captions (sentence case, 2 lines max, 54 cues). Use these with the no-captions video. |
| `northwind_studio_appointments_audio_sfx_lighter.m4a` | Replacement audio track with lighter SFX (−20 dB under the VO). |
| `northwind_studio_appointments_audio_sfx_stronger.m4a` | Replacement audio track with slightly stronger SFX (−15 dB under the VO). Still soft. |

To swap in another SFX mix, keep the picture as is and replace the audio track:
```bash
ffmpeg -i northwind_studio_appointments_final.mp4 -i northwind_studio_appointments_audio_sfx_lighter.m4a \
  -map 0:v -map 1:a -c copy northwind_studio_appointments_sfx_lighter.mp4
```
You can also run `VARIANT_MP4=1 ./build.sh` to write both variant MP4s directly.

## How sync works

The voiceover (`data/vo.mp3`, 147.26 s, which is `tmpyx4wz7jj.mp3` from `main`) sets the timing for everything.

1. A speech recognizer measured the start and end time of every spoken word. The raw timings are in `data/vosk_words.json`.
2. `data/script.txt` holds the hand-corrected transcript. `src/align.py` maps it onto the measured timings and stops with an error if any word fails to match. It found 396 words in 54 caption lines and wrote them to `data/captions.json`.
3. Every on-screen cue in `src/scenes_a.mjs` and `src/scenes_b.mjs` is keyed to a word time. Examples:
   - Each data chip flies into the structured request as its field is named.
   - The calendar scan runs on "checks the calendar for availability".
   - The cursor clicks **Wed 3:30** on "confirms".
   - "Slot unavailable" appears on "double booking".
   - "~8 hours/month" rolls in on "roughly 8 hours".
4. SFX events in `src/audio.py` use the same timestamps.

The video has 18 scenes in four colour sections: warm problem (0–67 s), cool workflow (67–101 s), amber safety (101–115 s) and dark outcome (115–148 s). The sections are joined by zoom-through, slide and match-cut transitions, with one soft blur title card at the pivot.

## Locked data (identical everywhere)

- Business: **Northwind Studio**
- Services: Consultation, Repair visit, Installation
- Customer: **Sam Rivera**, `sam.rivera@clientmail.example`
- Request: "Hi, I'd like a consultation. Next week works, preferably after 3pm. This is urgent."
- Proposed slots: Tue 4:00, Wed 3:30, Thu 5:00. Wed 3:30 is booked (Local time).
- Reminders: 24 hours before, 2 hours before
- Labels: "Team calendar", "Availability", "Local time"
- Estimate math (labelled *Illustrative assumptions*):
  - Manual 6 min/request − Review 1 min/request = ~5 min saved/request
  - 5 min × 100/month = 500 min
  - 500 min ÷ 60 ≈ 8.3 hours, shown as **~8 hours/month (estimate)**
- Trust stack: Independent portfolio prototype · Fictional data · Results vary

## QA built into the build

- `node src/render.mjs --qa` renders every frame in QA mode. It fails if:
  - any tracked text or card leaves the 8% title-safe area
  - any UI enters the caption band
  - any text overflows its container
  - any caption needs more than 2 lines
- `--qacam` repeats the same checks with camera push-ins applied.
- Both passes report **0 issues**.
- All 450 unique on-screen and caption words were spell-checked.

## Sound

Everything is synthesized in `src/audio.py`, so there are no third-party samples.

- **SFX:** muted clicks, hover ticks, airy whooshes, soft pops, gentle typing (only while typing is on screen), a warm confirmation chime, and a gentle two-note amber attention tone. There are no error beeps. 173 events, each with small random variation so nothing sounds repeated.
- **Music bed:** a calm, minimal electronic pad with sparse plucks at 88 bpm, about −21 dB under the VO. It ducks another 3 dB while speech is playing, lifts slightly at the pivot and resolves on the final chord.
- **Master:** loudness is normalized to −16 LUFS with a true peak of −1.5 dBTP.

## Rebuild

```bash
cd video2
npm install              # @napi-rs/canvas + Inter font
pip install numpy scipy  # audio synthesis
./build.sh               # QA → audio → render (captioned + clean) → mux
node src/render.mjs --stills 79.5,88.2   # preview single frames
```
You also need `ffmpeg` on your PATH.
