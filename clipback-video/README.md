# Clipback ($CLIP) — Motion Design Film

A premium, continuously-animated vertical motion-design film built around the supplied
narration. Everything here is generated from source: there is no stock footage, no
template and no pre-rendered asset library.

```
Clipback_CLIP_Motion_Design.mp4                ← FINAL DELIVERABLE (repo root)
clipback-video/
├─ project/
│  └─ Clipback_CLIP_Motion_Design.tsrct        ← editable scene-graph project (JSON)
├─ src/
│  ├─ render.js                                ← scene renderer (reads the project file)
│  └─ lib/{math,color,gfx,type,world,system}.js← motion, grade, typography & system-diagram kit
├─ tools/
│  ├─ analyze-vo.mjs    → assets/vo-analysis.json   envelope / onsets / voiced segments
│  ├─ preview.mjs       → qa/frames, qa/contact-sheet.png
│  ├─ strip.mjs         → labelled review montages
│  ├─ sfx.mjs           → assets/sfx/*.wav + clipback_sfx_bus.wav
│  ├─ mix.mjs           → build/clipback_master_audio.wav
│  ├─ render.mjs        → the MP4
│  └─ qa.mjs            → qa/qa-report.json + qa/filmstrip.png
├─ assets/
│  ├─ vo-analysis.json
│  └─ sfx/                                     ← 27 synthesised sounds + the mixed design bus
└─ qa/                                         ← filmstrip, contact sheet, review frames, report
```

The master narration is the user-supplied file in the repository root:
`ElevenLabs_2026-10-02T19_04_59_Justin Time - Elearning Narration_pvc_sp90_s50_sb75_se0_b_m2.mp3`
It is used **as-is** — level-matched only. No pitch shift, no time stretch, no second voice.

## Rebuild from scratch

```bash
cd clipback-video
npm i                      # @napi-rs/canvas, ffmpeg/ffprobe installers, fonts
node tools/analyze-vo.mjs  # narration envelope -> assets/vo-analysis.json
node tools/sfx.mjs         # synthesise the sound-design library + bus
node tools/mix.mjs         # narration + ducked design bus -> master audio
node tools/render.mjs      # 1080x1920 @60 H.264 + AAC -> Clipback_CLIP_Motion_Design.mp4
node tools/qa.mjs          # automated spec / motion / loudness QA + filmstrip
```

## Editing

`project/Clipback_CLIP_Motion_Design.tsrct` is the editable project. It is plain JSON, so
every creative decision is addressable without touching renderer code:

| key | what it controls |
| --- | --- |
| `composition` | size, fps, duration, safe margins |
| `palette` | the whole grade (charcoal / indigo / electric blue / violet / ember) |
| `typography` | the three typefaces and their roles |
| `textAssets` | **every visible string** — drawn verbatim, so spelling lives in one place |
| `layout` | world-space position and size of every element |
| `syncMarks` | named time stamps derived from the narration; all animation hangs off these |
| `scenes` | scene list, spans, intent and transition type |
| `camera` | 33 keyframes of `(x, y, zoom)` with per-segment easing |
| `sfxCues` | 56 cues: `{ id, t, gain, pitch }` |
| `render` | codec / quality settings |

Move a `syncMark` and the animation, the camera and the sound all move with it.

## Design rules enforced by the renderer

* **Nothing is ever static.** Background network, particles, grid, HUD and grain run on an
  independent clock for the entire 44 s, including the end card.
* **No cuts.** Scenes are regions of one continuous world; the camera travels between them
  and elements morph, merge or re-form. Transitions are match / data-flow / mask only.
* **Structure before content.** Every content element gets a wireframe socket that builds
  first, and merged elements leave animated ghosts with feed lines, so the system always
  looks like one machine rather than a sequence of slides.
* **Nothing touches the frame edge.** `frameGuard()` fades any text-bearing element before
  its bounding box reaches the safe margin.
* **Sound serves the voice.** The design bus is side-chain ducked by the narration and sits
  ~13 LU underneath it; the sum is limited to −1 dBTP.
