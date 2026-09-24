#!/usr/bin/env bash
# Full build: QA → audio → video (captioned + clean) → mux with loudness normalization.
set -euo pipefail
cd "$(dirname "$0")"
python3 src/align.py
node src/render.mjs --qa --step 2
node src/render.mjs --qa --qacam --step 3
python3 src/audio.py
TOTAL=$(node -e "import('./src/scenes.mjs').then(m=>console.log(Math.round(m.END_T*30)))")
HALF=$((TOTAL/2))
mkdir -p output/tmp
render () { # $1 suffix  $2 extra flags
  node src/render.mjs --out output/tmp/a$1.mp4 --from 0 --to $HALF $2 &
  node src/render.mjs --out output/tmp/b$1.mp4 --from $HALF --to $TOTAL $2 &
  wait
  printf "file 'a$1.mp4'\nfile 'b$1.mp4'\n" > output/tmp/list$1.txt
  ffmpeg -loglevel error -y -f concat -safe 0 -i output/tmp/list$1.txt -c copy output/tmp/video$1.mp4
}
render _caps ""
render _clean "--nocaps"
mux () { # $1 video  $2 audio  $3 out
  ffmpeg -loglevel error -y -i "$1" -i "$2" -map 0:v -map 1:a -c:v copy \
    -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 192k -movflags +faststart -shortest "$3"
}
mux output/tmp/video_caps.mp4  output/mix_standard.wav output/northwind_services_daily_brief_final.mp4
mux output/tmp/video_clean.mp4 output/mix_standard.wav output/northwind_services_daily_brief_no_captions.mp4
# Alternate SFX mixes as drop-in audio tracks (same picture; keeps the repo small)
for v in lighter stronger; do
  ffmpeg -loglevel error -y -i output/mix_$v.wav -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 192k output/northwind_services_daily_brief_audio_sfx_$v.m4a
done
if [ "${VARIANT_MP4:-0}" = "1" ]; then
  mux output/tmp/video_caps.mp4 output/mix_lighter.wav  output/northwind_services_daily_brief_sfx_lighter.mp4
  mux output/tmp/video_caps.mp4 output/mix_stronger.wav output/northwind_services_daily_brief_sfx_stronger.mp4
fi
echo BUILD_DONE
