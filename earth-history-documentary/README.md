# Earth: The Planet That Survived Everything

This branch contains an isolated production package for the faceless Earth-history documentary requested in ChatGPT.

## Reference design
The production was visually based on the existing Hangman app's design language without changing any existing Hangman files:
- near-black cinematic background
- purple and white primary palette
- cyan/purple atmospheric glow accents
- particle ambience
- clean geometric typography
- smooth dissolves and slow camera motion

## Video
- Title: Earth: The Planet That Survived Everything
- Runtime: ~27:50
- Resolution: 1280x720
- Frame rate: 12 fps
- Codec: H.264 video + AAC audio
- Voiceover: system TTS documentary narration
- Captions: timed phrase captions with the currently spoken word highlighted in purple
- Sound design: narration + low ambient beds + impact/whoosh/rumble effects
- SHA-256: e66bd9f90fc5e5b6d024516d70ebbd3fd2d5a4411a40d22301ede1f6b49eb6fe

## Source files
The branch is intentionally separate from main. The existing Hangman application files were not modified.

The rendered MP4 is delivered as a separate conversation artifact because the GitHub text-content connector is not a suitable binary uploader for a 74 MB MP4. The source package in this branch documents the render structure and metadata.

## Visual structure
The story is divided into 20 visual beats:
cosmic formation, Moon-forming impact, first life, oxygenation, Snowball Earth, Cambrian life, land plants, Permian extinction, dinosaurs, Chicxulub impact, mammals, Homo sapiens, agriculture/civilization, active geology, alternate-history thought experiment, climate variability, future Earth, geological records, compressed Earth calendar, and the closing perspective.

## Important
Do not merge this branch into main unless you intentionally want the documentary project placed into the Hangman codebase.
