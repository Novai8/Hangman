# Customer Support Email Agent: demo video (Niche 3, Demo #1)

**Classify → knowledge lookup → draft reply → human approval → log**

This is an independent portfolio prototype. All data is fictional, and the time savings are illustrative assumptions.

## Deliverables (`video/output/`)

| File | What it is |
|---|---|
| `northwind_support_agent_final.mp4` | **Main render.** 1920×1080, 30 fps, H.264 with AAC audio. Burned-in captions highlight each word as it is spoken. Uses the standard SFX mix. |
| `northwind_support_agent_no_captions.mp4` | The same video with no captions. |
| `northwind_support_agent_captions.srt` | SRT captions (sentence case, 2 lines max). Use these with the no-captions video. |
| `northwind_support_agent_audio_sfx_lighter.m4a` | Replacement audio track with lighter SFX (−21 dB under the VO). |
| `northwind_support_agent_audio_sfx_stronger.m4a` | Replacement audio track with stronger SFX (−14 dB under the VO). Still soft. |

To swap in another SFX mix, keep the picture as is and replace the audio track:
```bash
ffmpeg -i northwind_support_agent_final.mp4 -i northwind_support_agent_audio_sfx_lighter.m4a \
  -map 0:v -map 1:a -c copy northwind_support_agent_sfx_lighter.mp4
```
You can also run `VARIANT_MP4=1 ./build.sh` to write both variant MP4s directly.

## How sync works

The voiceover (`server/Quick question—how much.wav`, 170.25 s) sets the timing for everything.

1. A speech recognizer measured the start and end time of every spoken word. The raw timings are in `data/vosk_words.json`.
2. `data/script.txt` holds the hand-corrected transcript. `src/align.py` maps it onto the measured timings and stops with an error if any word fails to match. It found 416 words and wrote them to `data/captions.json`.
3. Every on-screen cue in `src/scenes.mjs` is keyed to a word time. Examples: headline words appear as they are spoken, the counter rolls on "repetitive" and "take over", the cursor clicks **Edit** on "edit", and "~16–17 hours/month" rolls on "sixteen … seventeen".
4. SFX events in `src/audio.py` use the same timestamps.

## Locked data (identical everywhere)

- Business: **Northwind Goods**. Inbox owner: **Support Team**.
- Customers:
  - Sam Rivera: Order status, Order #NW-10482
  - Taylor Nguyen: Address change
  - Morgan Chen: Password reset
  - Casey Jordan: Refund request, Order #NW-10536
  - Guest customer: Complaint, Order #NW-10517
- Categories: Order status, Address change, Password reset, Billing, Return request, Complaint
- Knowledge base: Shipping policy, Returns policy, Account help, Billing help
- Links: `northwind.example/help/...`
- Estimate math:
  - 3:00 − 0:45 = 2:15, rounded down to ~2 min saved per email
  - 2 min × 500 emails = 1,000 min
  - 1,000 min ÷ 60 ≈ 16.7 hours, shown as **~16–17 hours/month (estimate)**

## QA built into the build

- `node src/render.mjs --qa` renders every frame in QA mode. It fails if:
  - any tracked text or card leaves the 8% title-safe area
  - any UI enters the caption band
  - any text overflows its container
  - any caption needs more than 2 lines
- `--qacam` repeats the same checks with camera push-ins applied.
- Both passes report **0 issues**.
- All visible strings were spell-checked by hand.
- A static ±1–2 LSB dither on the raw frames prevents banding in the soft background gradients.

## Sound

Everything is synthesized in `src/audio.py`, so there are no third-party samples and no licensing questions.

- **SFX:** soft hover ticks, muted clicks, airy whooshes, soft pops, gentle typing (only while typing is on screen), warm confirmation chimes, and a gentle two-note amber attention tone. There are no error beeps, harsh pings, glitches, or impacts.
- **Music bed:** a calm lo-fi pad with sparse plucks, about −21 dB under the VO. It ducks another 3 dB while speech is playing and resolves softly on the final chord.
- **Master:** loudness is normalized to −16 LUFS with a true peak of −1.5 dBTP.

## Rebuild

```bash
cd video
npm install              # @napi-rs/canvas + Inter font
pip install numpy scipy  # audio synthesis
./build.sh               # QA → audio → render (captioned + clean) → mux
node src/render.mjs --stills 64.8,95.0   # preview single frames
```
You also need `ffmpeg` on your PATH.
