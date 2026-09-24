# AI Document Intake: demo video (Niche 3, Demo #3)

**Email attachment → Save file → Extract fields → Validate → Write to DB/Sheet → Review queue → Log**

This is an independent portfolio prototype. All data is fictional, and the time savings are illustrative assumptions. Results vary. The UI is generic, with no real email, file storage or accounting brands.

## Deliverables (`video3/output/`)

| File | What it is |
|---|---|
| `northwind_repairs_document_intake_final.mp4` | **Main render.** 1920×1080, 30 fps, H.264 with AAC audio. Burned-in captions highlight each word as it is spoken. Uses the standard SFX mix. |
| `northwind_repairs_document_intake_no_captions.mp4` | The same video with no captions. |
| `northwind_repairs_document_intake_captions.srt` | SRT captions (sentence case, 2 lines max, 53 cues). Use these with the no-captions video. |
| `northwind_repairs_document_intake_audio_sfx_lighter.m4a` | Replacement audio track with lighter SFX (−20 dB under the VO). |
| `northwind_repairs_document_intake_audio_sfx_stronger.m4a` | Replacement audio track with slightly stronger SFX (−15 dB under the VO). Still soft. |

To swap in another SFX mix, keep the picture as is and replace the audio track:
```bash
ffmpeg -i northwind_repairs_document_intake_final.mp4 -i northwind_repairs_document_intake_audio_sfx_lighter.m4a \
  -map 0:v -map 1:a -c copy northwind_repairs_document_intake_sfx_lighter.mp4
```
You can also run `VARIANT_MP4=1 ./build.sh` to write both variant MP4s directly.

## How sync works

The voiceover (`data/vo.mp3`, 125.38 s, which is `tmp4ewy0r5z.mp3` from `main`) sets the timing for everything.

1. A speech recognizer measured the start and end time of every spoken word. The raw timings are in `data/vosk_words.json`.
2. `data/script.txt` holds the hand-corrected transcript. `src/align.py` maps it onto the measured timings and stops with an error if any word fails to match. It found 325 words in 53 caption lines and wrote them to `data/captions.json`.
3. Every on-screen cue in `src/scenes_a.mjs` and `src/scenes_b.mjs` is keyed to a word time. Examples:
   - Each manual step chip lights up as it is named ("opens", "finds", "types", "renames", "saves").
   - The attachment pops out on "attachment" and shows "Saved" on "file".
   - "Missing" appears on the Address row on "rules".
   - "Duplicate detected" appears on "record".
   - "~20 hours/month" rolls in on "20".
4. SFX events in `src/audio.py` use the same timestamps.

The video has 21 scenes (plus two persistent header layers) in four colour sections: warm manual intake (0–52 s), cool automation (52–66 s), amber review and safety (66–90 s) and dark outcome (90–127 s). The sections are joined by zoom-through, parallax slide and match-cut transitions, with one soft blur title card at the pivot.

## Story and locked data (identical everywhere)

- Business: **Northwind Repairs**. Inbox: **Intake inbox**.
- Document: **Service intake form** (PDF), file `Intake_Form_NW-2041.pdf`, Reference ID **NW-2041**
- Customer: **Sam Rivera**, `sam.rivera@clientmail.example`, (555) 014-8821, 18 Oak Street, Austin, TX
- Job type: Appliance repair. Preferred date: Next Tuesday.
- The Address on the form is hard to read. In the manual flow it gets skipped ("Missed field"). In the automated flow it fails the "Address required" rule, so:
  1. The record is written with status **Needs review**.
  2. The document is routed to the **Review queue**.
  3. A reviewer enters the address and approves it.
  4. The record shows **Approved**, with the note "Address added in review".
- Extracted fields: Reference ID, Customer name, Email, Phone, Address, Job type, Preferred date
- Validation rules: Reference ID, Email, Phone and Address required
- Record columns: Reference ID, Customer name, Job type, Status, Assigned to, File link, Notes
- Backlog: Queue 12 → 38 → 61. The tile grid shows the same count.
- Estimate math (labelled *Illustrative assumptions*):
  - Manual 5 min/document − Review 1 min/document = ~4 min saved/document
  - 4 min × 300 documents/month = 1,200 min
  - 1,200 min ÷ 60 = **~20 hours/month (estimate)**
- Disclaimers: Independent portfolio prototype · Fictional data · Illustrative assumptions · Results vary

## QA built into the build

- `node src/render.mjs --qa` renders every frame in QA mode. It fails if:
  - any tracked text or card leaves the 8% title-safe area
  - any UI enters the caption band
  - any text overflows its container
  - any caption needs more than 2 lines
- `--qacam` repeats the same checks with camera push-ins applied.
- Both passes report **0 issues**.
- All 379 unique on-screen and caption words were spell-checked. Each locked value (NW-2041, the file name, the phone number and the address) is defined once in `src/components.mjs` and reused everywhere else.

## Sound

Everything is synthesized in `src/audio.py`, so there are no third-party samples.

- **SFX:** muted clicks, hover ticks, airy whooshes, soft pops, gentle typing (only while typing is on screen), a warm confirmation chime, and a gentle two-note amber attention tone. There are no error beeps. 176 events, each with small random variation so nothing sounds repeated.
- **Music bed:** a calm, minimal electronic pad with sparse plucks at 84 bpm, about −21 dB under the VO. It ducks another 3 dB while speech is playing, lifts slightly at the pivot and resolves on the final chord.
- **Master:** loudness is normalized to −16 LUFS with a true peak of −1.5 dBTP.

## Rebuild

```bash
cd video3
npm install              # @napi-rs/canvas + Inter font
pip install numpy scipy  # audio synthesis
./build.sh               # QA → audio → render (captioned + clean) → mux
node src/render.mjs --stills 57.6,72.9   # preview single frames
```
You also need `ffmpeg` on your PATH.
