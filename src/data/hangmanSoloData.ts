import {
  HangmanSoloCategory,
  HangmanSoloDifficulty,
  HangmanWordItem,
  HangmanSoloScoreBreakdown
} from '../types/hangmanSolo';
import { WORD_DATABASE } from './words';

export interface CategoryInfo {
  id: HangmanSoloCategory;
  name: string;
  description: string;
  icon: string;
  sample: string;
}

export const HANGMAN_SOLO_CATEGORIES: CategoryInfo[] = [
  {
    id: 'Animals',
    name: 'Animals',
    description: 'Creatures from the deep ocean to the highest mountain peaks',
    icon: '🐾',
    sample: 'TIGER • POLAR BEAR • PLATYPUS'
  },
  {
    id: 'Food',
    name: 'Food & Dining',
    description: 'Delicious culinary dishes, street food, treats, and pastries',
    icon: '🍕',
    sample: 'PIZZA • ICE CREAM • BRUSCHETTA'
  },
  {
    id: 'Countries',
    name: 'Countries',
    description: 'Nations, archipelagoes, and sovereign states around the globe',
    icon: '🌍',
    sample: 'JAPAN • BRAZIL • SWITZERLAND'
  },
  {
    id: 'Cities',
    name: 'Cities',
    description: 'Famous metropolises, historic capitals, and world destinations',
    icon: '🏙️',
    sample: 'TOKYO • NEW YORK • SAN FRANCISCO'
  },
  {
    id: 'Technology',
    name: 'Technology',
    description: 'Computing, coding, robotics, networks, and digital innovation',
    icon: '💻',
    sample: 'PYTHON • DATABASE • MICROPROCESSOR'
  },
  {
    id: 'Sports',
    name: 'Sports & Athletics',
    description: 'Olympic competitions, ball games, and extreme athletic feats',
    icon: '⚽',
    sample: 'SOCCER • BASKETBALL • SNOWBOARDING'
  },
  {
    id: 'Movies',
    name: 'Movies & Cinema',
    description: 'Box office blockbusters, sci-fi classics, and cinema legends',
    icon: '🎬',
    sample: 'AVATAR • STAR WARS • INTERSTELLAR'
  },
  {
    id: 'Games',
    name: 'Video Games',
    description: 'Beloved franchises, retro classics, and gaming universes',
    icon: '🎮',
    sample: 'MINECRAFT • SUPER MARIO • CYBERPUNK'
  },
  {
    id: 'Science',
    name: 'Science & Physics',
    description: 'Chemistry, quantum theories, biology, and scientific breakthroughs',
    icon: '🔬',
    sample: 'ATOM • PHOTOSYNTHESIS • GRAVITATION'
  },
  {
    id: 'Space',
    name: 'Space & Cosmos',
    description: 'Galaxies, nebula, planetary exploration, and cosmic mysteries',
    icon: '🚀',
    sample: 'MARS • BLACK HOLE • SOLAR ECLIPSE'
  },
  {
    id: 'Nature',
    name: 'Nature & Earth',
    description: 'Geological wonders, rainforests, biomes, and natural phenomena',
    icon: '🌲',
    sample: 'VOLCANO • RAINFOREST • GRAND CANYON'
  },
  {
    id: 'Vehicles',
    name: 'Vehicles & Transport',
    description: 'Airplanes, ships, trains, sports cars, and transport machinery',
    icon: '🚗',
    sample: 'BICYCLE • HELICOPTER • SUBMARINE'
  },
  {
    id: 'Everyday Objects',
    name: 'Everyday Objects',
    description: 'Familiar household tools, personal items, and daily gadgets',
    icon: '📦',
    sample: 'KEYBOARD • ALARM CLOCK • TOOTHBRUSH'
  },
  {
    id: 'Professions',
    name: 'Professions & Careers',
    description: 'Skilled trades, medical specialists, engineers, and creators',
    icon: '💼',
    sample: 'DOCTOR • ASTRONAUT • SOFTWARE ENGINEER'
  },
  {
    id: 'Medical',
    name: 'Medical & Healthcare',
    description: 'Doctors, treatments, human anatomy, clinical tools, and pharmaceuticals',
    icon: '🩺',
    sample: 'DOCTOR • STETHOSCOPE • ANESTHESIA'
  },
  {
    id: 'Random',
    name: 'Random Mashup',
    description: 'Surprise mix drawn from all 15 categories for the ultimate challenge',
    icon: '🎲',
    sample: 'ANY CATEGORY • MAXIMUM VARIETY'
  }
];

export const HANGMAN_SOLO_WORD_BANK: Record<
  Exclude<HangmanSoloCategory, 'Random'>,
  Record<HangmanSoloDifficulty, HangmanWordItem[]>
> = {
  Animals: {
    easy: [
      { word: 'LION', hint: 'The legendary king of the savannah' },
      { word: 'BEAR', hint: 'Large furry mammal that hibernates during winter' },
      { word: 'WOLF', hint: 'Wild canine pack hunter that howls at the moon' },
      { word: 'HAWK', hint: 'Sharp-eyed bird of prey that swoops from heights' },
      { word: 'DEER', hint: 'Gentle forest herbivore with branching antlers' },
      { word: 'FROG', hint: 'Amphibian known for leaping and catching flies' },
      { word: 'DUCK', hint: 'Waterbird with waterproof feathers and webbed feet' },
      { word: 'SEAL', hint: 'Sleek marine mammal that sunbathes on ice floes' }
    ],
    medium: [
      { word: 'PANTHER', hint: 'Solitary melanistic big cat with sleek dark coat' },
      { word: 'DOLPHIN', hint: 'Highly intelligent marine mammal that uses echolocation' },
      { word: 'PENGUIN', hint: 'Flightless seabird that thrives in Antarctic cold' },
      { word: 'GIRAFFE', hint: 'Tallest living terrestrial mammal with a long neck' },
      { word: 'CHEETAH', hint: 'Fastest land animal capable of bursts up to 70 mph' },
      { word: 'POLAR BEAR', hint: 'Massive white-furred apex predator of the Arctic ice' },
      { word: 'FLAMINGO', hint: 'Tall wading bird famous for standing on one leg' },
      { word: 'OCTOPUS', hint: 'Eight-limbed cephalopod with camouflaging skin' }
    ],
    hard: [
      { word: 'CHAMELEON', hint: 'Tree-dwelling reptile known for eyes that move independently' },
      { word: 'PLATYPUS', hint: 'Monotreme mammal with a duck-like bill that lays eggs' },
      { word: 'ARMADILLO', hint: 'Nocturnal armored mammal that curls into a protective ball' },
      { word: 'KOMODO DRAGON', hint: 'Largest living species of monitor lizard native to Indonesia' },
      { word: 'KILLER WHALE', hint: 'Formidable apex oceanic predator also known as the orca' },
      { word: 'SALAMANDER', hint: 'Slender amphibian capable of regenerating lost limbs' },
      { word: 'RHINOCEROS', hint: 'Heavy herbivore equipped with one or two keratin horns' }
    ]
  },

  Food: {
    easy: [
      { word: 'TACO', hint: 'Crispy or soft tortilla folded around seasoned fillings' },
      { word: 'PIZZA', hint: 'Oven-baked flatbread topped with tomato sauce and mozzarella' },
      { word: 'SUSHI', hint: 'Japanese staple of seasoned vinegared rice and seafood' },
      { word: 'RAMEN', hint: 'Japanese wheat noodle soup served in rich savory broth' },
      { word: 'STEAK', hint: 'Prime cut of high-quality beef grilled to perfection' },
      { word: 'CURRY', hint: 'Aromatic spiced stew originating across South Asian cuisines' },
      { word: 'MANGO', hint: 'Juicy tropical stone fruit with vibrant golden pulp' },
      { word: 'PASTA', hint: 'Italian staple crafted from durum wheat semolina dough' }
    ],
    medium: [
      { word: 'BURRITO', hint: 'Flour tortilla rolled around rice, black beans, and spiced meat' },
      { word: 'WAFFLE', hint: 'Crispy golden batter cake cooked between grid-patterned plates' },
      { word: 'HUMMUS', hint: 'Creamy Middle Eastern dip made from pureed chickpeas and tahini' },
      { word: 'PAELLA', hint: 'Iconic Spanish saffron-scented pan-cooked seafood and rice' },
      { word: 'FALAFEL', hint: 'Crispy golden deep-fried patties made of spiced ground chickpeas' },
      { word: 'ICE CREAM', hint: 'Sweet frozen dairy dessert churned with cream and sugar' },
      { word: 'APPLE PIE', hint: 'Classic dessert with spiced sliced apples in a flaky golden crust' },
      { word: 'RISOTTO', hint: 'Creamy Northern Italian rice dish cooked slowly in rich broth' }
    ],
    hard: [
      { word: 'CROISSANT', hint: 'Laminated French pastry layered with butter for flaky perfection' },
      { word: 'BRUSCHETTA', hint: 'Grilled rustic bread rubbed with garlic and diced ripe tomatoes' },
      { word: 'GUACAMOLE', hint: 'Traditional Mexican dip made from mashed Hass avocados and lime' },
      { word: 'PROSCIUTTO', hint: 'Delicate Italian dry-cured ham sliced paper-thin' },
      { word: 'COTTON CANDY', hint: 'Spun sugar carnival confection resembling fluffy cloud wool' },
      { word: 'PISTACHIO', hint: 'Nut of the cashew family with a split shell and green edible seed' },
      { word: 'QUESADILLA', hint: 'Toasted corn or flour tortilla packed with melted spiced cheeses' }
    ]
  },

  Countries: WORD_DATABASE.Countries,

  Cities: {
    easy: [
      { word: 'ROME', hint: 'The Eternal City home to the Colosseum and Vatican City' },
      { word: 'PARIS', hint: 'The City of Light along the River Seine with the Eiffel Tower' },
      { word: 'TOKYO', hint: 'Bustling metropolis with neon skyscrapers and Shibuya Crossing' },
      { word: 'SEOUL', hint: 'High-tech South Korean capital blending palaces with pop culture' },
      { word: 'DUBAI', hint: 'Emirate desert metropolis known for Burj Khalifa and palm islands' },
      { word: 'MIAMI', hint: 'Sun-drenched Florida city famous for Art Deco style and beaches' }
    ],
    medium: [
      { word: 'LONDON', hint: 'Historic UK capital centered on the Thames, Big Ben, and Tower Bridge' },
      { word: 'SYDNEY', hint: 'Australian harbour city renowned for its iconic sail-shaped Opera House' },
      { word: 'BERLIN', hint: 'Vibrant German capital famed for its historic wall and techno scene' },
      { word: 'NEW YORK', hint: 'The Big Apple with Times Square, Broadway, and Central Park' },
      { word: 'TORONTO', hint: 'Multicultural Canadian metropolis punctuated by the tall CN Tower' },
      { word: 'MADRID', hint: 'Spanish capital city famous for the Prado Museum and royal squares' }
    ],
    hard: [
      { word: 'SAN FRANCISCO', hint: 'California coastal city famous for the Golden Gate Bridge and cable cars' },
      { word: 'BUENOS AIRES', hint: 'Cosmopolitan South American capital known as Paris of the South' },
      { word: 'AMSTERDAM', hint: 'Dutch capital famous for historic canal rings and bicycle culture' },
      { word: 'JOHANNESBURG', hint: 'South Africa largest financial hub born from a historic gold rush' },
      { word: 'RIO DE JANEIRO', hint: 'Brazilian coastal jewel framed by Christ the Redeemer and beaches' },
      { word: 'COPENHAGEN', hint: 'Danish capital city renowned for cycling, design, and colorful Nyhavn' }
    ]
  },

  Technology: {
    easy: [
      { word: 'CODE', hint: 'Instructions authored by software engineers for computers' },
      { word: 'BYTE', hint: 'Fundamental digital unit of computer data made of 8 bits' },
      { word: 'CHIP', hint: 'Miniaturized silicon wafer packing millions of micro transistors' },
      { word: 'WIFI', hint: 'Wireless radio protocol connecting mobile devices to the Internet' },
      { word: 'DATA', hint: 'Processed facts and statistics collected for calculation' },
      { word: 'ROBOT', hint: 'Autonomous mechanical entity executing programmed tasks' },
      { word: 'CLOUD', hint: 'Distributed server networks hosting services over the web' }
    ],
    medium: [
      { word: 'PYTHON', hint: 'Readable high-level language beloved for AI and automation' },
      { word: 'SERVER', hint: 'Dedicated computer architecture fulfilling network client requests' },
      { word: 'ROUTER', hint: 'Networking device that forwards packets between subnets' },
      { word: 'BINARY', hint: 'Two-digit numbering system consisting entirely of 0 and 1' },
      { word: 'KERNEL', hint: 'Core software engine at the heart of an operating system' },
      { word: 'CIPHER', hint: 'Cryptographic algorithm used to disguise sensitive messages' },
      { word: 'DATABASE', hint: 'Organized relational or document repository of structured records' }
    ],
    hard: [
      { word: 'JAVASCRIPT', hint: 'Dynamic scripting language powering the interactive modern web' },
      { word: 'BLOCKCHAIN', hint: 'Decentralized distributed ledger secured through cryptographic proofs' },
      { word: 'ALGORITHM', hint: 'Deterministic computational procedure formulated to solve a problem' },
      { word: 'MICROPROCESSOR', hint: 'Central processing unit built upon an integrated circuit' },
      { word: 'CYBERSECURITY', hint: 'Discipline of defending digital systems from unauthorized intrusions' },
      { word: 'SUPERCOMPUTER', hint: 'Massively parallel computing cluster operating at petaflop speeds' },
      { word: 'NEURAL NETWORK', hint: 'Interconnected machine learning nodes modeled after animal brains' }
    ]
  },

  Sports: {
    easy: [
      { word: 'GOLF', hint: 'Precision club-and-ball game aimed at sinking holes across greens' },
      { word: 'JUDO', hint: 'Modern martial art founded in Japan focusing on grapples and throws' },
      { word: 'POLO', hint: 'High-speed team game played on horseback with wooden mallets' },
      { word: 'RUGBY', hint: 'Collision sport played with an oval ball and backward lateral passes' },
      { word: 'SURF', hint: 'Athletic art of riding ocean swells atop a buoyant board' },
      { word: 'YOGA', hint: 'Physical and meditative practice cultivating flexibility and balance' }
    ],
    medium: [
      { word: 'SOCCER', hint: 'The beautiful game where eleven players kick a ball toward a net' },
      { word: 'TENNIS', hint: 'Racket duel played across a net on grass, clay, or hardcourts' },
      { word: 'HOCKEY', hint: 'Fast-paced sport played with vulcanized rubber pucks on ice' },
      { word: 'BOXING', hint: 'Combat sport where competitors fight with padded gloves inside a ring' },
      { word: 'CRICKET', hint: 'Bat-and-ball match between teams of eleven centered on a wicket' },
      { word: 'CYCLING', hint: 'Pedal racing contested across velodromes and grueling alpine stages' }
    ],
    hard: [
      { word: 'BASKETBALL', hint: 'Fast hardwood game scored by shooting balls through elevated hoops' },
      { word: 'BADMINTON', hint: 'Speedy court game contested with lightweight rackets and shuttlecocks' },
      { word: 'GYMNASTICS', hint: 'Artistic discipline testing balance on balance beams, rings, and vault' },
      { word: 'SNOWBOARDING', hint: 'Winter sport descending snowy alpine slopes on a single bound board' },
      { word: 'SKATEBOARDING', hint: 'Street and park sport performing ollies and grinds on rolling decks' },
      { word: 'TABLE TENNIS', hint: 'High-reflex racket sport played with hollow balls on a divided table' },
      { word: 'ICE-SKATING', hint: 'Gliding gracefully across frozen ice sheets on thin steel blades' }
    ]
  },

  Movies: {
    easy: [
      { word: 'DUNE', hint: 'Epic desert planet saga chronicling the prophecy of Paul Atreides' },
      { word: 'JAWS', hint: 'Steven Spielberg thriller about a man-eating great white shark' },
      { word: 'TRON', hint: 'Sci-fi classic about a programmer digitized inside a computer grid' },
      { word: 'COCO', hint: 'Pixar journey of a young boy exploring the vibrant Land of the Dead' },
      { word: 'ALIEN', hint: 'Ridley Scott cosmic horror aboard the commercial starship Nostromo' }
    ],
    medium: [
      { word: 'AVATAR', hint: 'James Cameron sci-fi voyage into the lush biosphere of Pandora' },
      { word: 'TITANIC', hint: 'Tragic romance drama set aboard the ill-fated luxury ocean liner' },
      { word: 'SKYFALL', hint: 'Daniel Craig 007 mission defending MI6 headquarters from cyber threats' },
      { word: 'BATMAN', hint: 'The brooding Caped Crusader who protects Gotham from chaos' },
      { word: 'STAR WARS', hint: 'Space opera battle between the Jedi Order and the Galactic Empire' },
      { word: 'THE MATRIX', hint: 'Sci-fi masterwork where Neo swallows the red pill and awakens' }
    ],
    hard: [
      { word: 'INTERSTELLAR', hint: 'Christopher Nolan epic venturing through a wormhole to save humanity' },
      { word: 'INCEPTION', hint: 'Heist thriller infiltrating subconscious mind dreams within dreams' },
      { word: 'GLADIATOR', hint: 'Maximus fights through the Roman Colosseum to avenge his fallen family' },
      { word: 'CASABLANCA', hint: 'Wartime classic featuring Rick Blaine and an unforgettable cafe romance' },
      { word: 'JURASSIC PARK', hint: 'Theme park disaster where cloned prehistoric dinosaurs run amok' },
      { word: 'PULP FICTION', hint: 'Quentin Tarantino nonlinear crime tale set in Los Angeles underworld' }
    ]
  },

  Games: {
    easy: [
      { word: 'PONG', hint: 'Seminal 1972 arcade simulator simulating table tennis paddles' },
      { word: 'DOOM', hint: 'Pioneering 1993 first-person shooter fighting demonic hordes on Mars' },
      { word: 'SIMS', hint: 'Life simulation sandbox managing virtual people and their homes' },
      { word: 'HALO', hint: 'Sci-fi shooter franchise starring Master Chief and the Cortana AI' },
      { word: 'SONIC', hint: 'Sega speedy blue hedgehog collecting gold rings across Green Hill' }
    ],
    medium: [
      { word: 'PAC-MAN', hint: 'Arcade legend navigating mazes while chomping dots and evading ghosts' },
      { word: 'TETRIS', hint: 'Alexey Pajitnov puzzle tile game rotating falling geometric tetrominoes' },
      { word: 'POKEMON', hint: 'Global monster collecting RPG journey to become champion trainer' },
      { word: 'FORTNITE', hint: 'Epic Games battle royale famous for build mechanics and victory royales' },
      { word: 'MINECRAFT', hint: 'Blocky survival sandbox where players mine resources and build worlds' },
      { word: 'SUPER MARIO', hint: 'Nintendo heroic plumber leaping over pipes to rescue Princess Peach' }
    ],
    hard: [
      { word: 'CYBERPUNK', hint: 'Open-world futuristic RPG set in the neon alleys of Night City' },
      { word: 'THE WITCHER', hint: 'Fantasy RPG starring Geralt of Rivia hunting dangerous monsters' },
      { word: 'DARK SOULS', hint: 'Notoriously difficult gothic RPG famous for glowing bonfires and bosses' },
      { word: 'OVERWATCH', hint: 'Team-based hero shooter with payload escorts and unique ultimates' },
      { word: 'WORLD OF WARCRAFT', hint: 'Massive multiplayer fantasy universe dividing Alliance and Horde' }
    ]
  },

  Science: {
    easy: [
      { word: 'ATOM', hint: 'Basic building block of all chemical elements in the universe' },
      { word: 'ACID', hint: 'Chemical substance with pH below 7 that donates hydrogen ions' },
      { word: 'CELL', hint: 'Smallest functional structural unit of all living organisms' },
      { word: 'MASS', hint: 'Measurement of the amount of matter an object contains' },
      { word: 'HEAT', hint: 'Thermal energy transferred between thermodynamic systems' },
      { word: 'WAVE', hint: 'Oscillation that transfers energy progressively through medium' }
    ],
    medium: [
      { word: 'OXYGEN', hint: 'Essential life-giving gas element with atomic number 8' },
      { word: 'GRAVITY', hint: 'Universal physical force that attracts objects toward one another' },
      { word: 'GENOME', hint: 'Complete set of genetic instructions encoded in an organism DNA' },
      { word: 'LASER', hint: 'Intense coherent beam of amplified monochromatic light waves' },
      { word: 'ELECTRON', hint: 'Subatomic particle possessing a negative elementary electric charge' },
      { word: 'DNA HELIX', hint: 'Double-stranded spiral macromolecule carrying genetic heritage' }
    ],
    hard: [
      { word: 'PHOTOSYNTHESIS', hint: 'Biological mechanism converting sunlight into chemical glucose energy' },
      { word: 'SUPERCONDUCTOR', hint: 'Material offering zero electrical resistance at low temperatures' },
      { word: 'THERMODYNAMICS', hint: 'Branch of physics dealing with heat, work, and entropy cycles' },
      { word: 'RADIOACTIVITY', hint: 'Spontaneous emission of radiation particles from unstable atomic nuclei' },
      { word: 'PARTICLE COLLIDER', hint: 'Massive circular tunnel smashing subatomic hadrons near light speed' }
    ]
  },

  Space: {
    easy: [
      { word: 'MOON', hint: 'Earth celestial natural satellite causing ocean tidal bulges' },
      { word: 'MARS', hint: 'The Red Planet targeted by space exploration rovers like Perseverance' },
      { word: 'SUN', hint: 'Yellow dwarf star anchoring our planetary system with radiant fusion' },
      { word: 'STAR', hint: 'Luminous celestial sphere of plasma undergoing core nuclear fusion' },
      { word: 'ORBIT', hint: 'Curved gravitational trajectory of an astronomical body around another' }
    ],
    medium: [
      { word: 'SATURN', hint: 'Magnificent gas giant celebrated for its broad planetary ring systems' },
      { word: 'COMET', hint: 'Icy celestial body releasing a glowing tail when approaching stars' },
      { word: 'GALAXY', hint: 'Gravitationally bound collection of billions of stellar systems' },
      { word: 'NEBULA', hint: 'Vibrant interstellar nursery cloud of dust, hydrogen, and plasma' },
      { word: 'JUPITER', hint: 'Largest planet in our solar system featuring the Great Red Spot' },
      { word: 'BLACK HOLE', hint: 'Astronomical singularity whose gravity traps even light photons' }
    ],
    hard: [
      { word: 'MILKY WAY', hint: 'Barred spiral galaxy containing our solar system and billions of stars' },
      { word: 'SUPERNOVA', hint: 'Cataclysmic stellar explosion marking the dramatic death of massive stars' },
      { word: 'SOLAR ECLIPSE', hint: 'Astrological alignment where the moon passes directly in front of the sun' },
      { word: 'CONSTELLATION', hint: 'Recognizable pattern of celestial stars forming mythological figures' },
      { word: 'SPACE STATION', hint: 'Habitable artificial satellite orbiting Earth for microgravity science' }
    ]
  },

  Nature: {
    easy: [
      { word: 'RAIN', hint: 'Atmospheric liquid water droplets falling under gravitational pull' },
      { word: 'WIND', hint: 'Natural movement of air driven by atmospheric pressure differentials' },
      { word: 'TREE', hint: 'Woody perennial plant with an elongated stem trunk and leafy boughs' },
      { word: 'LEAF', hint: 'Green plant organ that captures solar light for photosynthesis' },
      { word: 'RIVER', hint: 'Natural flowing stream of freshwater heading toward an ocean or sea' }
    ],
    medium: [
      { word: 'FOREST', hint: 'Expansive ecosystem characterized by dense populations of tall trees' },
      { word: 'VOLCANO', hint: 'Rupture in Earth crust that erupts molten lava, ash, and gases' },
      { word: 'DESERT', hint: 'Arid geographical biome receiving minimal annual precipitation' },
      { word: 'GLACIER', hint: 'Massive persistent body of dense ice moving slowly down mountain valleys' },
      { word: 'WATERFALL', hint: 'River water cascading vertically over steep rocky cliffs' },
      { word: 'CORAL REEF', hint: 'Underwater marine structure formed by colonies of calcium coral polyps' }
    ],
    hard: [
      { word: 'RAINFOREST', hint: 'Lush tropical canopy jungle recognized for incredible biodiversity' },
      { word: 'GRAND CANYON', hint: 'Immense carved geological gorge shaped over millennia by the Colorado River' },
      { word: 'NORTHERN LIGHTS', hint: 'Mesmerizing polar auroral glow caused by solar wind hitting magnetosphere' },
      { word: 'AVALANCHE', hint: 'Rapid downhill slide of massive snow and ice masses down a mountain' },
      { word: 'THUNDERSTORM', hint: 'Violent atmospheric disturbance producing lightning and booming thunder' }
    ]
  },

  Vehicles: {
    easy: [
      { word: 'BOAT', hint: 'Small watercraft designed to float and navigate upon waterways' },
      { word: 'TRAIN', hint: 'Series of connected rail cars propelled along a dedicated railroad track' },
      { word: 'BIKE', hint: 'Two-wheeled human-powered velocipede propelled by pedal cranks' },
      { word: 'SHIP', hint: 'Large buoyant sea-going vessel navigating oceans and deep waters' },
      { word: 'TAXI', hint: 'Automobile for hire with driver used by passengers for point trips' }
    ],
    medium: [
      { word: 'BICYCLE', hint: 'Classic two-wheeled transport equipped with handlebars and chain drive' },
      { word: 'AIRPLANE', hint: 'Fixed-wing heavier-than-air aircraft powered by jet or prop engines' },
      { word: 'ROCKET', hint: 'Propulsion vehicle expelling exhaust gases to achieve space flight' },
      { word: 'TRACTOR', hint: 'Heavy farm engineering vehicle providing tractive pulling power' },
      { word: 'FIRE TRUCK', hint: 'Emergency municipal vehicle carrying firefighting crews and hoses' },
      { word: 'AMBULANCE', hint: 'Emergency medically equipped vehicle transporting patients safely' }
    ],
    hard: [
      { word: 'HELICOPTER', hint: 'Rotary-wing aircraft capable of vertical takeoff and hover flight' },
      { word: 'SUBMARINE', hint: 'Naval vessel capable of autonomous underwater submerged operations' },
      { word: 'HOVERCRAFT', hint: 'Amphibious craft traveling over land and water on an air cushion' },
      { word: 'BULLDOZER', hint: 'Heavy tracked earthmoving vehicle fitted with a broad metal blade' },
      { word: 'LOCOMOTIVE', hint: 'Rail transport engine providing motive power for an entire train' }
    ]
  },

  'Everyday Objects': {
    easy: [
      { word: 'CHAIR', hint: 'Furniture designed with a seat and backrest for one person' },
      { word: 'DESK', hint: 'Table surface designed for reading, writing, and computer work' },
      { word: 'BOOK', hint: 'Bound collection of printed pages conveying narrative or knowledge' },
      { word: 'CLOCK', hint: 'Instrument used to measure and indicate the progression of hours' },
      { word: 'LAMP', hint: 'Electric lighting device casting illumination across a room' },
      { word: 'MUG', hint: 'Handled ceramic cylindrical cup used for drinking hot beverages' }
    ],
    medium: [
      { word: 'MIRROR', hint: 'Reflective optical surface showing an accurate image of whatever faces it' },
      { word: 'PILLOW', hint: 'Soft cushion filled with down or foam supporting the head during sleep' },
      { word: 'BOTTLE', hint: 'Narrow-necked container used for storing liquids like water and juice' },
      { word: 'CAMERA', hint: 'Optical instrument capturing still photographs and motion video' },
      { word: 'WALLET', hint: 'Pocket-sized case holding currency, payment cards, and identity' },
      { word: 'KEYBOARD', hint: 'Input device with lettered and numbered keys used to type data' }
    ],
    hard: [
      { word: 'HEADPHONES', hint: 'Pair of small speaker drivers worn over the ears for private audio' },
      { word: 'TOOTHBRUSH', hint: 'Small bristled hygiene brush used to clean teeth and gums' },
      { word: 'ALARM CLOCK', hint: 'Timepiece engineered to awaken people at a specified morning hour' },
      { word: 'SUNGLASSES', hint: 'Tinted protective eyewear shielding human eyes from solar ultraviolet' },
      { word: 'MICROWAVE', hint: 'Kitchen appliance heating food rapidly using electromagnetic waves' },
      { word: 'REFRIGERATOR', hint: 'Insulated cooling appliance preserving perishable foods and dairy' }
    ]
  },

  Professions: {
    easy: [
      { word: 'CHEF', hint: 'Professional culinary artist directing a kitchen and crafting dishes' },
      { word: 'PILOT', hint: 'Licensed aviator responsible for flying airplanes or helicopters' },
      { word: 'NURSE', hint: 'Healthcare professional dedicated to patient treatment and care' },
      { word: 'JUDGE', hint: 'Public official appointed to preside over legal courtroom trials' },
      { word: 'ACTOR', hint: 'Performer portraying characters in theatre, television, and film' }
    ],
    medium: [
      { word: 'DOCTOR', hint: 'Practitioner of medicine licensed to diagnose and heal human illness' },
      { word: 'DENTIST', hint: 'Medical specialist focused on dental health, teeth, and gums' },
      { word: 'TEACHER', hint: 'Educator guiding students through curricula and subject mastery' },
      { word: 'ARCHITECT', hint: 'Professional planner who designs buildings and physical structures' },
      { word: 'LAWYER', hint: 'Practicing advocate representing clients in legal matters and court' },
      { word: 'SCIENTIST', hint: 'Inquirer conducting systematic experiments to uncover natural laws' }
    ],
    hard: [
      { word: 'ASTRONAUT', hint: 'Trained space traveler venturing into Earth orbit and lunar missions' },
      { word: 'FIREFIGHTER', hint: 'Emergency responder trained in suppressing blazes and saving lives' },
      { word: 'NEUROSURGEON', hint: 'Specialized surgeon operating on delicate brain and spinal nerves' },
      { word: 'PHOTOGRAPHER', hint: 'Visual artist capturing images through lenses, light, and composition' },
      { word: 'METEOROLOGIST', hint: 'Scientist analyzing atmospheric pressure to forecast daily weather' },
      { word: 'SOFTWARE ENGINEER', hint: 'Specialist designing and building computer applications and systems' }
    ]
  },
  Medical: {
    easy: [
      { word: 'PILL', hint: 'Oral tablet or capsule used for treating ailments' },
      { word: 'BONE', hint: 'Rigid calcium organ forming the human skeleton' },
      { word: 'LUNG', hint: 'Essential respiratory organ that breathes in oxygen' },
      { word: 'VEIN', hint: 'Blood vessel transporting deoxygenated blood toward heart' },
      { word: 'CAST', hint: 'Rigid plaster shell stabilizing a fractured limb' },
      { word: 'CURE', hint: 'Substance or medical procedure restoring sound health' },
      { word: 'HEAL', hint: 'Natural biological process of recovering from injury' },
      { word: 'GERM', hint: 'Microscopic infectious bacterium or virus' },
      { word: 'SCAR', hint: 'Fibrous mark left behind on skin after tissue mends' },
      { word: 'COLD', hint: 'Common viral contagion causing sniffling and sneezes' }
    ],
    medium: [
      { word: 'DOCTOR', hint: 'Licensed healthcare professional who diagnoses and treats patients' },
      { word: 'SURGEON', hint: 'Physician skilled in performing invasive operative treatments' },
      { word: 'BANDAGE', hint: 'Sterile protective dressing wrapped over a cut or sprain' },
      { word: 'CLINIC', hint: 'Healthcare facility providing outpatient care and checkups' },
      { word: 'IMMUNE', hint: 'Defensive biological network fighting off disease and antigens' },
      { word: 'SYMPTOM', hint: 'Physical indicator or subjective sign of an illness' },
      { word: 'VACCINE', hint: 'Biological dose stimulating immune antibodies against pathogens' },
      { word: 'THERAPY', hint: 'Systematic clinical regimen designed to rehabilitate health' },
      { word: 'NURSE', hint: 'Trained medical caregiver supporting patient recovery and triage' },
      { word: 'BIOPSY', hint: 'Diagnostic extraction of living cellular tissue for lab testing' }
    ],
    hard: [
      { word: 'ANESTHESIA', hint: 'Controlled insensitivity to surgical pain via medical agents' },
      { word: 'ANTIBIOTIC', hint: 'Potent prescription medication that eliminates bacterial infections' },
      { word: 'STETHOSCOPE', hint: 'Acoustic instrument used to listen to internal heart and lung sounds' },
      { word: 'CARDIOLOGY', hint: 'Medical branch devoted to diagnosing and treating heart conditions' },
      { word: 'PHARMACY', hint: 'Dispensary licensed to compound and fulfill medical prescriptions' },
      { word: 'PEDIATRICS', hint: 'Medical specialization centered on children and infants' },
      { word: 'NEUROLOGY', hint: 'Clinical discipline dealing with the brain and nervous system' },
      { word: 'HEMOGLOBIN', hint: 'Iron-rich blood protein carrying oxygen from lungs to muscles' },
      { word: 'RESUSCITATE', hint: 'Emergency resuscitation technique reviving vital signs' },
      { word: 'DIAGNOSIS', hint: 'Formal clinical identification of an underlying medical illness' }
    ]
  }
};

/**
 * Returns mistake limits according to difficulty level.
 * Difficulty actually impacts gameplay:
 * - Easy: 8 mistakes (forgiving)
 * - Medium: 6 mistakes (standard)
 * - Hard: 5 mistakes (strict)
 */
export function getDifficultyMaxMistakes(difficulty: HangmanSoloDifficulty): number {
  switch (difficulty) {
    case 'easy':
      return 8;
    case 'medium':
      return 6;
    case 'hard':
      return 5;
  }
}

/**
 * Difficulty score multiplier:
 * Easy: 1.0x
 * Medium: 1.5x
 * Hard: 2.0x
 */
export function getDifficultyMultiplier(difficulty: HangmanSoloDifficulty): number {
  switch (difficulty) {
    case 'easy':
      return 1.0;
    case 'medium':
      return 1.5;
    case 'hard':
      return 2.0;
  }
}

/**
 * Deterministic Solo Hangman scoring calculator
 */
export function calculateHangmanSoloScore(params: {
  won: boolean;
  difficulty: HangmanSoloDifficulty;
  uniqueCorrectLetters: number;
  remainingAttempts: number;
  mistakes: number;
  durationSeconds: number;
  streak: number;
}): HangmanSoloScoreBreakdown {
  const {
    won,
    difficulty,
    uniqueCorrectLetters,
    remainingAttempts,
    mistakes,
    durationSeconds,
    streak
  } = params;

  const difficultyMultiplier = getDifficultyMultiplier(difficulty);

  if (!won) {
    // Partial points for correct letters found before losing
    const correctLetterPoints = uniqueCorrectLetters * 25;
    const finalScore = Math.max(0, Math.round(correctLetterPoints * difficultyMultiplier));
    return {
      basePoints: 0,
      correctLetterPoints,
      remainingAttemptsBonus: 0,
      speedBonus: 0,
      incorrectPenalty: mistakes * 20,
      streakBonus: 0,
      difficultyMultiplier,
      finalScore
    };
  }

  // Win scoring:
  const basePoints = 500;
  const correctLetterPoints = uniqueCorrectLetters * 50;
  const remainingAttemptsBonus = remainingAttempts * 100;
  // Speed bonus up to 300 pts, diminishing over 60s
  const speedBonus = Math.max(0, Math.round(300 - Math.min(60, durationSeconds) * 4));
  const incorrectPenalty = mistakes * 25;
  const streakBonus = Math.min(500, streak * 50);

  const rawSubtotal = Math.max(
    100,
    basePoints + correctLetterPoints + remainingAttemptsBonus + speedBonus - incorrectPenalty
  );
  const finalScore = Math.round(rawSubtotal * difficultyMultiplier) + streakBonus;

  return {
    basePoints,
    correctLetterPoints,
    remainingAttemptsBonus,
    speedBonus,
    incorrectPenalty,
    streakBonus,
    difficultyMultiplier,
    finalScore
  };
}

/**
 * Selects a random word from the local word bank for a given category & difficulty.
 * Avoids repeating the last word if possible.
 */
export function getRandomSoloWord(
  category: HangmanSoloCategory,
  difficulty: HangmanSoloDifficulty,
  excludeWord?: string,
  usedWords?: string[]
): { word: string; category: HangmanSoloCategory; resolvedCategory: string; hint: string } {
  let resolvedCat: Exclude<HangmanSoloCategory, 'Random'>;

  if (category === 'Random') {
    const validKeys = Object.keys(HANGMAN_SOLO_WORD_BANK) as Exclude<HangmanSoloCategory, 'Random'>[];
    resolvedCat = validKeys[Math.floor(Math.random() * validKeys.length)];
  } else {
    resolvedCat = category;
  }

  const pool = HANGMAN_SOLO_WORD_BANK[resolvedCat][difficulty];
  let eligible = pool;

  // If usedWords is provided, prioritize unused words
  if (usedWords && usedWords.length > 0) {
    const usedUpper = new Set(usedWords.map((w) => w.toUpperCase().trim()));
    const unselected = pool.filter((item) => !usedUpper.has(item.word.toUpperCase().trim()));
    if (unselected.length > 0) {
      eligible = unselected;
    } else {
      // Pool exhausted: exclude only the most recent word if possible
      const lastWord = usedWords[usedWords.length - 1]?.toUpperCase().trim();
      const fresh = pool.filter((item) => item.word.toUpperCase().trim() !== lastWord);
      eligible = fresh.length > 0 ? fresh : pool;
    }
  } else if (excludeWord && pool.length > 1) {
    eligible = pool.filter((item) => item.word.toUpperCase() !== excludeWord.toUpperCase());
    if (eligible.length === 0) eligible = pool;
  }

  const selected = eligible[Math.floor(Math.random() * eligible.length)];

  return {
    word: selected.word.toUpperCase(),
    category,
    resolvedCategory: resolvedCat,
    hint: selected.hint
  };
}
