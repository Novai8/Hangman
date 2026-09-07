import { Category, Difficulty, WordItem } from '../types';

export const WORD_DATABASE: Record<Exclude<Category, 'Random'>, Record<Difficulty, WordItem[]>> = {
  Technology: {
    easy: [
      { word: 'CODE', hint: 'Instructions written for a computer' },
      { word: 'BYTE', hint: 'Unit of digital information, 8 bits' },
      { word: 'NODE', hint: 'A point or connection in a network' },
      { word: 'CHIP', hint: 'Silicon integrated circuit' },
      { word: 'DATA', hint: 'Quantities or characters processed by computer' },
      { word: 'WIFI', hint: 'Wireless local networking technology' },
      { word: 'PIXEL', hint: 'The smallest addressable element in a display' },
      { word: 'CLOUD', hint: 'Servers accessed over the Internet' },
      { word: 'ROBOT', hint: 'Automated electro-mechanical machine' },
      { word: 'LINK', hint: 'Hypertext pointer to another resource' }
    ],
    medium: [
      { word: 'ROUTER', hint: 'Hardware device that forwards data packets' },
      { word: 'SERVER', hint: 'Computer providing data to other clients' },
      { word: 'PYTHON', hint: 'High-level readable programming language' },
      { word: 'BINARY', hint: 'Base-2 numerical system of 0s and 1s' },
      { word: 'CIPHER', hint: 'Algorithm for encrypting and decrypting data' },
      { word: 'MATRIX', hint: 'Rectangular array of numbers or cyberspace' },
      { word: 'KERNEL', hint: 'Core component of an operating system' },
      { word: 'MEMORY', hint: 'Computer component for storing working data' },
      { word: 'DOMAIN', hint: 'Identification string defining network control' },
      { word: 'BACKUP', hint: 'Copy of computer data taken to archive' }
    ],
    hard: [
      { word: 'JAVASCRIPT', hint: 'Ubiquitous programming language of the web' },
      { word: 'ALGORITHM', hint: 'Step-by-step procedure for calculations' },
      { word: 'FIREWALL', hint: 'Network security system monitoring traffic' },
      { word: 'QUANTUM', hint: 'Physics-based computing using qubits' },
      { word: 'DATABASE', hint: 'Organized collection of structured data' },
      { word: 'PROTOCOL', hint: 'Official set of rules governing data exchange' },
      { word: 'CYBERNETIC', hint: 'Relating to automatic control systems' },
      { word: 'COMPILER', hint: 'Program that converts source code to machine code' },
      { word: 'INTERFACE', hint: 'Shared boundary where independent systems interact' },
      { word: 'ENCRYPTION', hint: 'Process of encoding information for privacy' }
    ]
  },
  Animals: {
    easy: [
      { word: 'LION', hint: 'The king of the jungle' },
      { word: 'BEAR', hint: 'Large heavy mammal with thick fur' },
      { word: 'WOLF', hint: 'Wild carnivorous canine of pack hunters' },
      { word: 'HAWK', hint: 'Bird of prey with keen eyesight' },
      { word: 'DEER', hint: 'Hoofed ruminant with branching antlers' },
      { word: 'FROG', hint: 'Tailless amphibian capable of leaping' },
      { word: 'SEAL', hint: 'Sleek marine mammal with flippers' },
      { word: 'DUCK', hint: 'Waterbird with a broad blunt bill' },
      { word: 'EAGLE', hint: 'Majestic bird of prey on many emblems' }
    ],
    medium: [
      { word: 'PANTHER', hint: 'Melanistic black leopard or jaguar' },
      { word: 'DOLPHIN', hint: 'Highly intelligent aquatic mammal' },
      { word: 'PENGUIN', hint: 'Flightless marine bird of cold regions' },
      { word: 'MONKEY', hint: 'Agile arboreal primate' },
      { word: 'FALCON', hint: 'Fastest-diving bird of prey' },
      { word: 'GIRAFFE', hint: 'Tallest living terrestrial mammal' },
      { word: 'BADGER', hint: 'Nocturnal burrowing mammal with gray coat' },
      { word: 'CHEETAH', hint: 'Fastest land animal on Earth' },
      { word: 'OTTER', hint: 'Playful semi-aquatic carnivorous mammal' }
    ],
    hard: [
      { word: 'CHAMELEON', hint: 'Lizard known for changing skin pigmentation' },
      { word: 'KANGAROO', hint: 'Large marsupial native to Australia' },
      { word: 'PLATYPUS', hint: 'Egg-laying semi-aquatic mammal with a duck bill' },
      { word: 'OCTOPUS', hint: 'Eight-limbed soft-bodied cephalopod' },
      { word: 'ALLIGATOR', hint: 'Large crocodilian native to Americas and China' },
      { word: 'RHINOCEROS', hint: 'Massive herbivore with one or two horns' },
      { word: 'HEDGEHOG', hint: 'Small spiny mammal that curls into a ball' },
      { word: 'ARMADILLO', hint: 'Mammal with a leathery armor shell' }
    ]
  },
  Movies: {
    easy: [
      { word: 'DUNE', hint: 'Epic sci-fi desert planet saga' },
      { word: 'JAWS', hint: 'Iconic Spielberg thriller with a great white shark' },
      { word: 'TRON', hint: 'Sci-fi classic set inside a computer mainframe' },
      { word: 'COCO', hint: 'Pixar journey through the Land of the Dead' },
      { word: 'ALIEN', hint: 'Ridley Scott horror aboard the Nostromo' },
      { word: 'FROZEN', hint: 'Animated Disney hit featuring Elsa and Anna' }
    ],
    medium: [
      { word: 'AVATAR', hint: 'James Cameron epic on the moon of Pandora' },
      { word: 'MATRIX', hint: 'Neo discovers reality is a simulated construct' },
      { word: 'TITANIC', hint: 'Ill-fated maiden voyage romance' },
      { word: 'SKYFALL', hint: '007 James Bond defense of MI6' },
      { word: 'MEMENTO', hint: 'Christopher Nolan thriller told in reverse' },
      { word: 'BATMAN', hint: 'Dark Knight defender of Gotham City' },
      { word: 'ALADDIN', hint: 'Street urchin finds a magic lamp with a genie' }
    ],
    hard: [
      { word: 'INCEPTION', hint: 'Heist team enters dreams within dreams' },
      { word: 'GLADIATOR', hint: 'Maximus fights for honor in the Roman Colosseum' },
      { word: 'INTERSTELLAR', hint: 'Astronauts travel through a wormhole near Saturn' },
      { word: 'PARASITE', hint: 'Bong Joon-ho Oscar-winning dark social satire' },
      { word: 'CASABLANCA', hint: 'Here is looking at you, kid' },
      { word: 'WHIPLASH', hint: 'Ruthless jazz instructor pushes a drum student' },
      { word: 'OPPENHEIMER', hint: 'Biopic detailing the birth of the atomic bomb' }
    ]
  },
  Countries: {
    easy: [
      { word: 'PERU', hint: 'South American nation home to Machu Picchu' },
      { word: 'IRAN', hint: 'Middle Eastern nation historically known as Persia' },
      { word: 'CHAD', hint: 'Landlocked nation in north-central Africa' },
      { word: 'CUBA', hint: 'Caribbean island nation known for vintage cars' },
      { word: 'FIJI', hint: 'South Pacific archipelago of tropical islands' },
      { word: 'ITALY', hint: 'Boot-shaped European nation famous for pizza & art' },
      { word: 'JAPAN', hint: 'East Asian island nation with Tokyo as capital' }
    ],
    medium: [
      { word: 'BRAZIL', hint: 'Largest country in South America' },
      { word: 'FRANCE', hint: 'European cultural hub known for Eiffel Tower' },
      { word: 'CANADA', hint: 'Second largest country by total land area' },
      { word: 'MEXICO', hint: 'Country south of the United States border' },
      { word: 'GREECE', hint: 'Cradle of Western civilization in the Mediterranean' },
      { word: 'NORWAY', hint: 'Scandinavian country known for fjords and Aurora' },
      { word: 'SWEDEN', hint: 'Nordic nation known for design, forests, and islands' },
      { word: 'POLAND', hint: 'Central European country on the Baltic Sea' }
    ],
    hard: [
      { word: 'PORTUGAL', hint: 'Iberian Peninsula nation facing the Atlantic' },
      { word: 'AUSTRALIA', hint: 'Continental nation known for outback and reefs' },
      { word: 'SINGAPORE', hint: 'Sovereign island city-state in Southeast Asia' },
      { word: 'MOROCCO', hint: 'North African kingdom bordering Atlantic and Mediterranean' },
      { word: 'ARGENTINA', hint: 'South American nation known for tango and Andes' },
      { word: 'MADAGASCAR', hint: 'Massive biodiversity island off Southeast Africa' },
      { word: 'ICELAND', hint: 'Nordic island of geysers, glaciers, and volcanoes' },
      { word: 'SWITZERLAND', hint: 'Alpine country renowned for neutrality and watches' }
    ]
  },
  Food: {
    easy: [
      { word: 'TACO', hint: 'Folded tortilla filled with seasoned meat and toppings' },
      { word: 'RAMEN', hint: 'Japanese noodle soup in rich broth' },
      { word: 'PIZZA', hint: 'Baked crust topped with tomato sauce and cheese' },
      { word: 'SUSHI', hint: 'Japanese prepared vinegared rice with seafood' },
      { word: 'CURRY', hint: 'Spiced dish popular across South Asia' },
      { word: 'PASTA', hint: 'Italian staple made from durum wheat dough' },
      { word: 'STEAK', hint: 'High quality cut of grilled or broiled beef' },
      { word: 'MANGO', hint: 'Sweet tropical stone fruit with golden flesh' }
    ],
    medium: [
      { word: 'BURRITO', hint: 'Cylindrical wrap of flour tortilla with beans & meat' },
      { word: 'WAFFLE', hint: 'Batter cake cooked between patterned hot plates' },
      { word: 'BURGER', hint: 'Ground meat patty served inside a sliced bun' },
      { word: 'HUMMUS', hint: 'Middle Eastern dip made from blended chickpeas' },
      { word: 'PAELLA', hint: 'Traditional Spanish saffron-flavored rice pan' },
      { word: 'NOODLE', hint: 'Staple strip of unleavened rolled dough' },
      { word: 'FALAFEL', hint: 'Deep-fried spiced chickpea balls' },
      { word: 'RISOTTO', hint: 'Creamy slow-cooked Northern Italian rice dish' }
    ],
    hard: [
      { word: 'CROISSANT', hint: 'Buttery, flaky crescent-shaped French pastry' },
      { word: 'AVOCADO', hint: 'Creamy green pear-shaped fruit high in healthy fats' },
      { word: 'CHOCOLATE', hint: 'Sweet confection derived from roasted cacao beans' },
      { word: 'PISTACHIO', hint: 'Member of the cashew family with edible green kernel' },
      { word: 'SPAGHETTI', hint: 'Long, thin, solid cylindrical pasta' },
      { word: 'PROSCIUTTO', hint: 'Italian dry-cured ham thinly sliced' },
      { word: 'BRUSCHETTA', hint: 'Grilled bread rubbed with garlic and topped with tomatoes' },
      { word: 'GUACAMOLE', hint: 'Traditional Mexican mashed avocado dip' }
    ]
  },
  Sports: {
    easy: [
      { word: 'GOLF', hint: 'Club and ball sport aiming for holes on a course' },
      { word: 'JUDO', hint: 'Modern Japanese martial art and Olympic sport' },
      { word: 'POLO', hint: 'Team sport played on horseback with mallets' },
      { word: 'RUGBY', hint: 'Full-contact team sport with an oval ball' },
      { word: 'SKIING', hint: 'Gliding on snow using long narrow runners' },
      { word: 'SURF', hint: 'Riding breaking ocean waves on a board' },
      { word: 'YOGA', hint: 'Ancient discipline of posture and breath control' }
    ],
    medium: [
      { word: 'SOCCER', hint: 'Most popular team sport in the world played with feet' },
      { word: 'TENNIS', hint: 'Racket sport played on grass, clay, or hardcourt' },
      { word: 'BOXING', hint: 'Combat sport where two fighters throw punches with gloves' },
      { word: 'HOCKEY', hint: 'Sport played with curved sticks on ice or field' },
      { word: 'ROWING', hint: 'Propelling a boat on water using oars' },
      { word: 'SURFING', hint: 'Wave riding sport on an ocean surfboard' },
      { word: 'KARATE', hint: 'Martial art emphasizing strikes, kicks, and open-hand blows' },
      { word: 'CYCLING', hint: 'Riding bicycles for sport and endurance' }
    ],
    hard: [
      { word: 'BASKETBALL', hint: 'Hoop and backboard sport created by James Naismith' },
      { word: 'CRICKET', hint: 'Bat-and-ball game played between two teams of eleven' },
      { word: 'BADMINTON', hint: 'Racket sport played using a feathered shuttlecock' },
      { word: 'VOLLEYBALL', hint: 'Teams hit a ball back and forth over a high net' },
      { word: 'ARCHERY', hint: 'Shooting arrows with a bow at a target' },
      { word: 'GYMNASTICS', hint: 'Exercises demonstrating strength, balance, and agility' },
      { word: 'SNOWBOARD', hint: 'Descending snow-covered slopes on a single board' },
      { word: 'SKATEBOARD', hint: 'Riding and performing tricks on an axle-wheeled deck' }
    ]
  },
  Medical: {
    easy: [
      { word: 'PILL', hint: 'Oral tablet or capsule medication' },
      { word: 'BONE', hint: 'Rigid skeletal organ providing bodily framework' },
      { word: 'LUNG', hint: 'Vital respiratory organ inhaling atmospheric oxygen' },
      { word: 'VEIN', hint: 'Vessel circulating deoxygenated blood toward heart' },
      { word: 'CAST', hint: 'Hard protective shell worn over a fractured bone' },
      { word: 'CURE', hint: 'Medical remedy restoring good health' },
      { word: 'HEAL', hint: 'Natural recovery from an ailment or wound' },
      { word: 'GERM', hint: 'Microscopic pathogen that can cause illness' },
      { word: 'SCAR', hint: 'Visible mark left after healed skin tissue' },
      { word: 'COLD', hint: 'Common viral infection causing runny nose and chills' }
    ],
    medium: [
      { word: 'DOCTOR', hint: 'Licensed professional diagnosing and treating illnesses' },
      { word: 'SURGEON', hint: 'Doctor qualified to practice operative surgery' },
      { word: 'BANDAGE', hint: 'Protective fabric strip bound around an injury' },
      { word: 'CLINIC', hint: 'Medical center providing outpatient healthcare' },
      { word: 'IMMUNE', hint: 'Bodily system preventing and resisting disease' },
      { word: 'SYMPTOM', hint: 'Physical indicator of a medical condition' },
      { word: 'VACCINE', hint: 'Preventative medicine building immunity against viruses' },
      { word: 'THERAPY', hint: 'Clinical treatment aimed at healing disorders' },
      { word: 'NURSE', hint: 'Trained professional attending to patient care' },
      { word: 'BIOPSY', hint: 'Removal and clinical analysis of living tissue' }
    ],
    hard: [
      { word: 'ANESTHESIA', hint: 'Medical induction of insensitivity to surgical pain' },
      { word: 'ANTIBIOTIC', hint: 'Drug inhibiting growth of or destroying bacteria' },
      { word: 'STETHOSCOPE', hint: 'Medical instrument used for listening to heartbeat' },
      { word: 'CARDIOLOGY', hint: 'Branch of medical science focusing on the heart' },
      { word: 'PHARMACY', hint: 'Store or dispensary where medications are prepared' },
      { word: 'PEDIATRICS', hint: 'Medical care specializing in infants and children' },
      { word: 'NEUROLOGY', hint: 'Medical specialty devoted to nervous system and brain' },
      { word: 'HEMOGLOBIN', hint: 'Iron-containing oxygen-transport protein in red blood cells' },
      { word: 'RESUSCITATE', hint: 'Revive an individual from unconsciousness or arrest' },
      { word: 'DIAGNOSIS', hint: 'Formal identification of the nature of an illness' }
    ]
  }
};

export const CATEGORIES: Category[] = [
  'Technology',
  'Animals',
  'Movies',
  'Countries',
  'Food',
  'Sports',
  'Medical',
  'Random'
];

export function getRandomWord(category: Category, difficulty: Difficulty): { word: string; category: Category; hint?: string } {
  let selectedCategory = category;
  if (selectedCategory === 'Random') {
    const validCats: Exclude<Category, 'Random'>[] = ['Technology', 'Animals', 'Movies', 'Countries', 'Food', 'Sports', 'Medical'];
    selectedCategory = validCats[Math.floor(Math.random() * validCats.length)];
  }

  const pool = WORD_DATABASE[selectedCategory as Exclude<Category, 'Random'>][difficulty];
  const item = pool[Math.floor(Math.random() * pool.length)];
  return {
    word: item.word.toUpperCase(),
    category: selectedCategory,
    hint: item.hint
  };
}
