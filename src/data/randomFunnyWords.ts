export type FunnyWordCategory = 'funny' | 'brainrot' | 'absurd' | 'weird' | 'any';

export const FUNNY_WORDS: string[] = [
  'Goober',
  'Dingus',
  'Noodle',
  'Bamboozled',
  'Flabbergasted',
  'Snickerdoodle',
  'Shenanigans',
  'Kerfuffle',
  'Discombobulated',
  'Blobfish',
  'Hooligan',
  'Wobble',
  'Gobbledygook',
  'Brouhaha',
  'Bazinga',
  'Doohickey',
  'Cattywampus',
  'Nincompoop',
  'Skedaddle',
  'Wiggle-Wagon',
  'Hootenanny',
  'Bumfuzzle',
  'Platypus',
  'Pickle-Juice',
  'Flibbertigibbet',
  'Malarkey',
  'Doodad',
  'Giggle-Water',
  'Balderdash',
  'Whippersnapper',
  'Hullabaloo',
  'Boondoggle',
  'Ballyhoo',
  'Skullduggery',
  'Mumbo-Jumbo'
];

export const BRAINROT_WORDS: string[] = [
  'Skibidi',
  'Rizzler',
  'Sigma',
  'Womp Womp',
  'Bonk',
  'Yeet',
  'Dingus Prime',
  'Yapping',
  'NPC Energy',
  'Ultra Sus',
  'Boop',
  'Gigachad',
  'Pure Brainrot',
  'Aura +1000',
  'Grimace Shake',
  'Ohio Final Boss',
  'Looksmaxxing',
  'Mewing Champion',
  'Fanum Tax',
  'Bussin',
  'No Cap',
  'Emotional Damage',
  'Big Chungus',
  'Skill Issue',
  'Touch Grass',
  'Gyatt',
  'Sneaky Goblin',
  'L Ratio',
  'Giga Brain',
  'Subway Surfers Gameplay',
  'Based and Real',
  'Cringe Patrol',
  'Gamer Moment',
  'Certified Classic',
  'Sussy Baka'
];

export const ABSURD_PHRASES: string[] = [
  'Flying Toaster',
  'Quantum Banana',
  'Exploding Pancake',
  'Laser Hamster',
  'Cursed Sponge',
  'Turbo Snail',
  'Intergalactic Cheese',
  'Invisible Socks',
  'Nuclear Burrito',
  'Space Platypus',
  'Telepathic Muffin',
  'Rocket-Powered Poodle',
  'Neon Pickles',
  'Hyperbolic Waffle',
  'Disco Dinosaur',
  'Caffeine Marshmallow',
  'Spicy Air',
  'Galactic Broccoli',
  'Anti-Gravity Donut',
  'Sentient Roomba',
  'Microscopic T-Rex',
  'Hoverboard Potato',
  'Solar-Powered Kazoo',
  'Tactical Marshmallow',
  'Cursed Sandpaper'
];

export const WEIRD_WORDS: string[] = [
  'Borb',
  'Snek',
  'Floof',
  'Chonker',
  'Bepis',
  'Honk',
  'Blimpy',
  'Sploot',
  'Zoomies',
  'Borf',
  'Snoot',
  'Gloop',
  'Spaghettification',
  'Bloop',
  'Wonky',
  'Zonk',
  'Bingle',
  'Quirk',
  'Bumble-Bee',
  'Squeak-Toy',
  'Giggle-Monster',
  'Glitch-Hop',
  'Scram-Bucket',
  'Boing-Boing',
  'Sploosh'
];

export function getRandomFunnyWord(category: FunnyWordCategory = 'any'): string {
  let pool: string[];
  switch (category) {
    case 'funny':
      pool = FUNNY_WORDS;
      break;
    case 'brainrot':
      pool = BRAINROT_WORDS;
      break;
    case 'absurd':
      pool = ABSURD_PHRASES;
      break;
    case 'weird':
      pool = WEIRD_WORDS;
      break;
    case 'any':
    default: {
      const all = [...FUNNY_WORDS, ...BRAINROT_WORDS, ...ABSURD_PHRASES, ...WEIRD_WORDS];
      pool = all;
      break;
    }
  }

  return pool[Math.floor(Math.random() * pool.length)];
}
