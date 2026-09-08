import { WordLibsSoloDifficulty, WordLibsSoloPrompt, WordLibsSoloStoryTemplate } from '../types/wordLibsSolo';

export interface TopicInfo {
  id: string;
  name: string;
  emoji: string;
  description: string;
  accentColor: string;
}

export const SOLO_TOPICS: TopicInfo[] = [
  { id: 'School Chaos', name: 'School Chaos', emoji: '🏫', description: 'Rogue cafeteria food, wild sub teachers, and panic presentations', accentColor: 'from-amber-500 to-yellow-600' },
  { id: 'Work Chaos', name: 'Work Chaos', emoji: '💼', description: 'Awkward meetings, runaway reply-alls, and CEO scandals', accentColor: 'from-blue-500 to-indigo-600' },
  { id: 'Food Disaster', name: 'Food Disaster', emoji: '🍕', description: 'Horrific recipes, cursed buffets, and angry restaurant critics', accentColor: 'from-orange-500 to-red-600' },
  { id: 'Space Adventure', name: 'Space Adventure', emoji: '🚀', description: 'Zero-gravity blunders, confused aliens, and rocket breakdowns', accentColor: 'from-purple-500 to-cyan-500' },
  { id: 'Fantasy', name: 'Fantasy', emoji: '🧙‍♂️', description: 'Clumsy wizards, allergic dragons, and backfiring mystical relics', accentColor: 'from-emerald-500 to-teal-600' },
  { id: 'Superheroes', name: 'Superheroes', emoji: '🦸', description: 'Useless superpowers, embarrassing spandex, and budget crimefighters', accentColor: 'from-rose-500 to-pink-600' },
  { id: 'Apocalypse', name: 'Apocalypse', emoji: '☣️', description: 'Wasteland survivors trading junk food and dodging mutant raccoons', accentColor: 'from-amber-600 to-orange-700' },
  { id: 'Road Trip', name: 'Road Trip', emoji: '🚗', description: 'Flat tires, terrible gas station snacks, and broken GPS directions', accentColor: 'from-teal-500 to-emerald-600' },
  { id: 'Vacation Disaster', name: 'Vacation Disaster', emoji: '🏖️', description: 'Lost luggage, ruined resort buffets, and aggressive seagulls', accentColor: 'from-yellow-500 to-amber-600' },
  { id: 'Mystery', name: 'Mystery', emoji: '🔍', description: 'Suspicious clues, petty breakroom crimes, and clumsy private eyes', accentColor: 'from-indigo-500 to-slate-700' },
  { id: 'Pirates', name: 'Pirates', emoji: '🏴‍☠️', description: 'Salty mutinies, buried junk, and shouting ridiculous sea curses', accentColor: 'from-sky-500 to-blue-700' },
  { id: 'Gaming', name: 'Gaming', emoji: '🎮', description: 'Speedrunner rage, glitching NPCs, and cursed loot boxes', accentColor: 'from-violet-500 to-fuchsia-600' },
  { id: 'AI & Robots', name: 'AI & Robots', emoji: '🤖', description: 'Smart toasters seizing power and rogue algorithm emergencies', accentColor: 'from-cyan-500 to-blue-600' },
  { id: 'Everyday Life', name: 'Everyday Life', emoji: '🛒', description: 'Grocery aisle turf wars, awkward elevator rides, and laundry disasters', accentColor: 'from-lime-500 to-green-600' },
  { id: 'Weird Science', name: 'Weird Science', emoji: '🧪', description: 'Exploding lab beakers, accidental clones, and questionable genetic tests', accentColor: 'from-emerald-400 to-lime-600' },
  { id: 'Sports', name: 'Sports', emoji: '⚽', description: 'Mascot brawls, referee meltdowns, and unforgettable victory dances', accentColor: 'from-amber-500 to-rose-500' },
  { id: 'Horror Comedy', name: 'Horror Comedy', emoji: '👻', description: 'Ghosts demanding Wi-Fi, cursed lawn gnomes, and basement scares', accentColor: 'from-violet-600 to-purple-900' },
  { id: 'Medieval Madness', name: 'Medieval Madness', emoji: '⚔️', description: 'Knights with stage fright, jousting catastrophes, and royal blunder decrees', accentColor: 'from-amber-700 to-yellow-600' },
  { id: 'Supervillains', name: 'Supervillains', emoji: '🦹', description: 'Bizarre master plans, cheap death rays, and petty revenge plots', accentColor: 'from-red-600 to-rose-700' },
  { id: 'Future World', name: 'Future World', emoji: '🛸', description: 'Cybernetic pets, teleportation glitches, and flying car traffic jams', accentColor: 'from-blue-500 to-violet-600' }
];

export const SOLO_PROMPT_DICTIONARY: Record<string, WordLibsSoloPrompt> = {
  // People, Names, Characters
  hero_name: { id: 'p_h1', key: 'hero_name', promptText: "Name a funny friend or famous hero.", inputType: 'Name / Person', placeholder: 'e.g. Grandma, Batman, Spider-Man' },
  rival_name: { id: 'p_h2', key: 'rival_name', promptText: "Name someone who would make a funny villain.", inputType: 'Name / Person', placeholder: 'e.g. Kevin from school' },
  teacher_name: { id: 'p_h3', key: 'teacher_name', promptText: "Name a funny teacher or school principal.", inputType: 'Teacher Name', placeholder: 'e.g. Mr. Grumpy, Mrs. Apple' },
  boss_name: { id: 'p_h4', key: 'boss_name', promptText: "Invent a funny boss or manager name.", inputType: 'Boss Name', placeholder: 'e.g. Bossy Brenda, Mr. Bigwig' },
  detective_name: { id: 'p_h5', key: 'detective_name', promptText: "Name a funny detective or police officer.", inputType: 'Detective Name', placeholder: 'e.g. Inspector Donut, Officer Clumsy' },
  villain_name: { id: 'p_h6', key: 'villain_name', promptText: "Name a funny or silly bad guy.", inputType: 'Villain Name', placeholder: 'e.g. Dr. Clumsy, Captain Sneak' },
  scientist_name: { id: 'p_h7', key: 'scientist_name', promptText: "Invent a funny mad scientist name.", inputType: 'Scientist Name', placeholder: 'e.g. Professor Von Clatter' },
  celebrity: { id: 'p_h8', key: 'celebrity', promptText: "Name a famous actor, singer, or celebrity.", inputType: 'Celebrity', placeholder: 'e.g. Gordon Ramsay, Taylor Swift' },
  gamer_tag: { id: 'p_h9', key: 'gamer_tag', promptText: "Invent a funny gamer username.", inputType: 'Gamertag', placeholder: 'e.g. Pro_Gamer_99, PixelKing' },
  robot_name: { id: 'p_h10', key: 'robot_name', promptText: "Name a funny or talkative robot.", inputType: 'Robot / AI Name', placeholder: 'e.g. ChatBot-3000, Beep-Boop' },
  knight_name: { id: 'p_h11', key: 'knight_name', promptText: "Invent a funny knight name.", inputType: 'Knight Name', placeholder: 'e.g. Sir Shivers-a-Lot, Sir Waffles' },
  pirate_name: { id: 'p_h12', key: 'pirate_name', promptText: "Invent a funny pirate captain name.", inputType: 'Pirate Captain', placeholder: 'e.g. Captain Softbread, Captain Pegleg' },

  // Foods
  worst_food: { id: 'p_f1', key: 'worst_food', promptText: "Name a food you would never bring to a party.", inputType: 'Food / Snack', placeholder: 'e.g. Cold soup, Canned sardines' },
  birthday_food: { id: 'p_f2', key: 'birthday_food', promptText: "Name a funny food to replace a birthday cake.", inputType: 'Food item', placeholder: 'e.g. Giant meatloaf, Big taco' },
  snack: { id: 'p_f3', key: 'snack', promptText: "Name a weird snack you would only eat on a dare.", inputType: 'Snack', placeholder: 'e.g. Pickle ice cream, Onion dip' },
  beverage: { id: 'p_f4', key: 'beverage', promptText: "Name a cold drink that tastes bad when warm.", inputType: 'Beverage', placeholder: 'e.g. Carbonated soda, Milkshake' },
  smelly_food: { id: 'p_f5', key: 'smelly_food', promptText: "Name a food that has a very strong smell.", inputType: 'Smelly Food', placeholder: 'e.g. Garlic bread, Fried onions' },
  pizza_topping: { id: 'p_f6', key: 'pizza_topping', promptText: "Invent a crazy or silly pizza topping.", inputType: 'Pizza Topping', placeholder: 'e.g. Gummy worms, Chocolate syrup' },

  // Animals & Creatures
  animal: { id: 'p_a1', key: 'animal', promptText: "Name a funny or noisy animal.", inputType: 'Animal', placeholder: 'e.g. Screaming Goat, Penguin, Llama' },
  pet_animal: { id: 'p_a2', key: 'pet_animal', promptText: "Name a cute or funny pet animal.", inputType: 'Pet / Animal', placeholder: 'e.g. Orange tabby cat, Golden retriever' },
  terrifying_beast: { id: 'p_a3', key: 'terrifying_beast', promptText: "Name a mythical creature (like dragon or unicorn).", inputType: 'Creature', placeholder: 'e.g. Friendly Dragon, Tiny Goblin' },
  suspicious_creature: { id: 'p_a4', key: 'suspicious_creature', promptText: "Name an unusual bird or wild creature.", inputType: 'Animal', placeholder: 'e.g. Giant Barn Owl, Raccoon' },

  // Objects & Inventions
  useless_object: { id: 'p_o1', key: 'useless_object', promptText: "Enter an object that is completely useless in a fight.", inputType: 'Object', placeholder: 'e.g. Eyelash curler, Selfie stick' },
  unnecessary_invention: { id: 'p_o2', key: 'unnecessary_invention', promptText: "Name a silly gadget nobody needs.", inputType: 'Invention / Gadget', placeholder: 'e.g. Automatic Sock Flipper' },
  pocket_item: { id: 'p_o3', key: 'pocket_item', promptText: "Name a random object you might find in a coat pocket.", inputType: 'Pocket Item', placeholder: 'e.g. Half-eaten candy bar, Shiny pebble' },
  weapon: { id: 'p_o4', key: 'weapon', promptText: "Name a harmless everyday object used as a tool.", inputType: 'Improvised Weapon', placeholder: 'e.g. Wooden spatula, Feather duster' },
  banned_item: { id: 'p_o5', key: 'banned_item', promptText: "Name something you should never bring on an airplane.", inputType: 'Banned Item', placeholder: 'e.g. Giant fireworks, Fog machine' },
  magical_relic: { id: 'p_o6', key: 'magical_relic', promptText: "Invent a magical item with a silly power.", inputType: 'Mystical Artifact', placeholder: 'e.g. Ring of Hiccups, Flying Teacup' },
  vehicle: { id: 'p_o7', key: 'vehicle', promptText: "Name a funny or unusual vehicle.", inputType: 'Vehicle', placeholder: 'e.g. Motorized shopping cart, Rusty Unicycle' },

  // Places & Locations
  suspicious_place: { id: 'p_l1', key: 'suspicious_place', promptText: "Name a funny place to find a penguin.", inputType: 'Location / Place', placeholder: 'e.g. Inside a bank vault, Grocery aisle' },
  haunted_place: { id: 'p_l2', key: 'haunted_place', promptText: "Name a spooky place to visit late at night.", inputType: 'Location', placeholder: 'e.g. Dusty old attic, Empty warehouse' },
  secret_base: { id: 'p_l3', key: 'secret_base', promptText: "Name a funny public place to hide a secret clubhouse.", inputType: 'Lair Location', placeholder: 'e.g. Behind the ice cream counter' },
  destination: { id: 'p_l4', key: 'destination', promptText: "Name the worst vacation spot you can imagine.", inputType: 'Destination', placeholder: 'e.g. Mosquito swamp, Active volcano' },

  // Phrases, Excuses, Secrets, Catchphrases
  excuse: { id: 'p_c1', key: 'excuse', promptText: "Give a funny excuse for being late to a party.", inputType: 'Terrible Excuse', placeholder: 'e.g. A polite cat blocked my front door' },
  catchphrase: { id: 'p_c2', key: 'catchphrase', promptText: "Give a funny phrase you shout before doing something silly.", inputType: 'Catchphrase', placeholder: 'e.g. BUCKLE UP BUTTERCUP!' },
  shout: { id: 'p_c3', key: 'shout', promptText: "Give something you shout loudly when startled.", inputType: 'Dramatic Shout', placeholder: 'e.g. SAVE THE CHEESEBURGER!' },
  dark_secret: { id: 'p_c4', key: 'dark_secret', promptText: "Share a harmless, funny little secret or habit.", inputType: 'Weird Habit', placeholder: 'e.g. I secretly dance when making toast' },
  pirate_curse: { id: 'p_c5', key: 'pirate_curse', promptText: "Invent a funny pirate cheer or exclamation.", inputType: 'Pirate Curse', placeholder: 'e.g. Ahoy there, you sea biscuit!' },
  robot_glitch: { id: 'p_c6', key: 'robot_glitch', promptText: "Write a funny robot error message.", inputType: 'Error Message', placeholder: 'e.g. ERROR: TOASTER OVERHEAT!' },

  // Professions
  fake_profession: { id: 'p_pr1', key: 'fake_profession', promptText: "Invent a silly dream job that pays lots of money.", inputType: 'Ridiculous Profession', placeholder: 'e.g. Ice Cream Taste Tester' },
  night_job: { id: 'p_pr2', key: 'night_job', promptText: "Invent a funny night-shift job title.", inputType: 'Suspicious Job', placeholder: 'e.g. Midnight Snack Inspector' },
  circus_act: { id: 'p_pr3', key: 'circus_act', promptText: "Name a funny or daring circus act.", inputType: 'Circus Title', placeholder: 'e.g. Flying Acrobat, Trapeze Clown' },

  // Adjectives, Verbs, Numbers
  wild_adjective: { id: 'p_adj1', key: 'wild_adjective', promptText: "Enter a word that describes someone acting wild or dizzy.", inputType: 'Adjective', placeholder: 'e.g. dizzy, hyper, wild, silly' },
  fancy_adjective: { id: 'p_adj2', key: 'fancy_adjective', promptText: "Enter a fancy describing word.", inputType: 'Dramatic Adjective', placeholder: 'e.g. royal, grand, magnificent, fancy' },
  chaotic_verb: { id: 'p_v1', key: 'chaotic_verb', promptText: "Enter a past-tense action word (like ran, jumped, blasted).", inputType: 'Action Verb (-ed)', placeholder: 'e.g. catapulted, sprinted, blasted' },
  sound_effect: { id: 'p_s1', key: 'sound_effect', promptText: "Write a funny cartoon sound effect (like BONK or BOING).", inputType: 'Sound Effect', placeholder: 'e.g. KER-PLOP, SPLAT, WHOOSH' },
  suspicious_number: { id: 'p_n1', key: 'suspicious_number', promptText: "Enter a funny high number.", inputType: 'Specific Number', placeholder: 'e.g. 5,000, 999,999' },

  // One Word mode prompts (simple & punchy)
  simple_person: { id: 'p_ow1', key: 'simple_person', promptText: "A person or character.", inputType: 'A Person', placeholder: 'e.g. Batman, Shrek, Grandpa' },
  simple_animal: { id: 'p_ow2', key: 'simple_animal', promptText: "An animal.", inputType: 'An Animal', placeholder: 'e.g. Walrus, Pigeon, Frog' },
  simple_food: { id: 'p_ow3', key: 'simple_food', promptText: "A food or snack.", inputType: 'A Food', placeholder: 'e.g. Burrito, Waffle, Taco' },
  simple_place: { id: 'p_ow4', key: 'simple_place', promptText: "A place or city.", inputType: 'A Place', placeholder: 'e.g. Walmart, Paris, Subway' },
  simple_object: { id: 'p_ow5', key: 'simple_object', promptText: "An everyday object.", inputType: 'An Object', placeholder: 'e.g. Toaster, Plunger, Spoon' },
  simple_adjective: { id: 'p_ow6', key: 'simple_adjective', promptText: "A describing word (adjective).", inputType: 'An Adjective', placeholder: 'e.g. Shiny, Squeaky, Fast, Silly' },
  simple_verb: { id: 'p_ow7', key: 'simple_verb', promptText: "An action word in past tense (-ed).", inputType: 'A Verb (-ed)', placeholder: 'e.g. Jumped, Zoomed, Screamed' }
};

// Substantial collection of Story Templates covering all 20 topics across Easy, Medium, Hard, and One-Word!
export const SOLO_STORY_TEMPLATES: WordLibsSoloStoryTemplate[] = [
  // -------------------------------------------------------------
  // 1. SCHOOL CHAOS
  // -------------------------------------------------------------
  {
    id: 'solo_school_easy',
    title: 'The Great Cafeteria Panic',
    topic: 'School Chaos',
    difficulty: 'easy',
    requiredPromptKeys: ['teacher_name', 'worst_food', 'animal', 'catchphrase'],
    paragraphs: [
      "Westbridge Middle School had survived grease fires and fire drills, but nothing prepared them for {teacher_name}'s new lunchtime initiative.",
      "The lunch trays arrived covered in steaming heaps of {worst_food}. Before anyone could react, an escaped {animal} bounded through the double doors.",
      "The principal grabbed the loudspeaker, panicked, and screamed '{catchphrase}', sending three hundred students diving under tables for safety."
    ]
  },
  {
    id: 'solo_school_med',
    title: 'The Presentation Disaster of Room 204',
    topic: 'School Chaos',
    difficulty: 'medium',
    requiredPromptKeys: ['hero_name', 'worst_food', 'useless_object', 'wild_adjective', 'catchphrase', 'chaotic_verb'],
    paragraphs: [
      "For their final biology grade, {hero_name} was instructed to build a working cell model.",
      "Instead, they walked up to the podium carrying a {useless_object} soaked in lukewarm {worst_food}.",
      "The class was completely {wild_adjective} as {hero_name} {chaotic_verb} their project against the whiteboard and yelled '{catchphrase}'."
    ]
  },
  {
    id: 'solo_school_hard',
    title: 'The Substitute Teacher Syndicate',
    topic: 'School Chaos',
    difficulty: 'hard',
    requiredPromptKeys: ['teacher_name', 'rival_name', 'fake_profession', 'worst_food', 'useless_object', 'sound_effect', 'wild_adjective', 'catchphrase', 'suspicious_number'],
    paragraphs: [
      "When the regular teacher went missing, {teacher_name} took over homeroom with an iron fist and {suspicious_number} handwritten pop quizzes.",
      "Class troublemaker {rival_name} immediately launched an offensive by wielding a smuggled {useless_object} and a bowl of sticky {worst_food}.",
      "With a deafening '{sound_effect}!', the chalkboard collapsed. {teacher_name} revealed they were actually an undercover {fake_profession} in disguise.",
      "The entire hallway went {wild_adjective} until the bell rang and everyone sprinted for the buses shouting '{catchphrase}'."
    ]
  },

  // -------------------------------------------------------------
  // 2. WORK CHAOS
  // -------------------------------------------------------------
  {
    id: 'solo_work_easy',
    title: 'The CEO Who Disappeared',
    topic: 'Work Chaos',
    difficulty: 'easy',
    requiredPromptKeys: ['boss_name', 'beverage', 'pocket_item', 'catchphrase'],
    paragraphs: [
      "At Monday's all-hands meeting, {boss_name} spilled scalding hot {beverage} directly into the master server.",
      "Panicking, they pulled a crumpled {pocket_item} from their blazer pocket and tried to dry the motherboard.",
      "Realizing the servers were smoking, they shouted '{catchphrase}' and bolted for the fire exit."
    ]
  },
  {
    id: 'solo_work_med',
    title: 'The Job Interview from the Twilight Zone',
    topic: 'Work Chaos',
    difficulty: 'medium',
    requiredPromptKeys: ['hero_name', 'fake_profession', 'worst_food', 'useless_object', 'excuse', 'catchphrase'],
    paragraphs: [
      "{hero_name} arrived at the corporate tower convinced they were interviewing for the role of Senior {fake_profession}.",
      "When asked to demonstrate leadership, they whipped out a {useless_object} and offered the hiring committee bites of {worst_food}.",
      "When pressed about their resume gap, {hero_name} whispered: '{excuse}'. Then they cheered '{catchphrase}' and were hired immediately."
    ]
  },
  {
    id: 'solo_work_hard',
    title: 'The 4 PM Friday Reply-All Meltdown',
    topic: 'Work Chaos',
    difficulty: 'hard',
    requiredPromptKeys: ['boss_name', 'rival_name', 'fake_profession', 'useless_object', 'smelly_food', 'wild_adjective', 'sound_effect', 'catchphrase', 'suspicious_number'],
    paragraphs: [
      "It was 4:58 PM on a holiday weekend when {boss_name} accidentally clicked 'Reply All' to {suspicious_number} worldwide employees.",
      "The email contained an unhinged rant about {rival_name}'s habit of microwaving {smelly_food} next to the water cooler.",
      "Within seconds, {rival_name} armed themselves with an executive {useless_object}. The breakroom emitted a thunderous '{sound_effect}!'",
      "The Chief {fake_profession} declared the floor a total {wild_adjective} hazard while IT shouted '{catchphrase}' and pulled the plug."
    ]
  },

  // -------------------------------------------------------------
  // 3. FOOD DISASTER
  // -------------------------------------------------------------
  {
    id: 'solo_food_easy',
    title: 'The Wedding Cake Debacle',
    topic: 'Food Disaster',
    difficulty: 'easy',
    requiredPromptKeys: ['birthday_food', 'beverage', 'animal', 'catchphrase'],
    paragraphs: [
      "The bride and groom gathered three hundred guests around the centerpiece: a seven-tier tower of {birthday_food}.",
      "Just before the ceremonial first slice, a glass of warm {beverage} knocked over, attracting a rogue {animal} from the garden.",
      "The beast leaped into the frosting as the caterer yelled '{catchphrase}' and dove under the dessert table."
    ]
  },
  {
    id: 'solo_food_med',
    title: 'Nightmare at the 5-Star Bistro',
    topic: 'Food Disaster',
    difficulty: 'medium',
    requiredPromptKeys: ['detective_name', 'pizza_topping', 'smelly_food', 'fancy_adjective', 'sound_effect', 'chaotic_verb'],
    paragraphs: [
      "Renowned food critic {detective_name} was promised an unforgettable gastronomic adventure at Bistro De Luxe.",
      "Course one arrived beneath a polished silver cloche: a simmering pile of {smelly_food} topped with raw {pizza_topping}.",
      "The head chef praised the presentation as '{fancy_adjective}' until the dish made a sudden '{sound_effect}' and {chaotic_verb} off the table."
    ]
  },
  {
    id: 'solo_food_hard',
    title: 'The Great State Fair Deep-Fry Championship',
    topic: 'Food Disaster',
    difficulty: 'hard',
    requiredPromptKeys: ['hero_name', 'worst_food', 'snack', 'beverage', 'unnecessary_invention', 'wild_adjective', 'sound_effect', 'catchphrase', 'suspicious_number'],
    paragraphs: [
      "At the annual County Fair, {hero_name} arrived determined to win the blue ribbon with {suspicious_number} pounds of fry batter.",
      "Their secret weapon was an experimental {unnecessary_invention} built to flash-fry a mixture of {worst_food} and {snack}.",
      "When they dumped in a gallon of {beverage}, the vat hissed with a bone-rattling '{sound_effect}!', coating the judges in {wild_adjective} goo.",
      "Crowned champion by default, {hero_name} hoisted the trophy, screamed '{catchphrase}', and was banned for life."
    ]
  },

  // -------------------------------------------------------------
  // 4. SPACE ADVENTURE
  // -------------------------------------------------------------
  {
    id: 'solo_space_easy',
    title: 'Zero Gravity Lunchtime',
    topic: 'Space Adventure',
    difficulty: 'easy',
    requiredPromptKeys: ['robot_name', 'worst_food', 'useless_object', 'shout'],
    paragraphs: [
      "Aboard the orbital research satellite, astronaut {robot_name} activated the experimental zero-G kitchen.",
      "Unfortunately, a rogue canister of {worst_food} broke open and collided with a floating {useless_object}.",
      "As blobs of food bounced across the command module, mission control heard a frantic '{shout}' crackle over the radio."
    ]
  },
  {
    id: 'solo_space_med',
    title: 'First Contact on the Red Planet',
    topic: 'Space Adventure',
    difficulty: 'medium',
    requiredPromptKeys: ['hero_name', 'suspicious_place', 'unnecessary_invention', 'beverage', 'catchphrase', 'wild_adjective'],
    paragraphs: [
      "The Martian expedition made touch-down near {suspicious_place}, the most forbidding crater in the solar system.",
      "Commander {hero_name} stepped onto the alien soil clutching an {unnecessary_invention} and a thermocan of {beverage}.",
      "An alien emerged from the dust looking completely {wild_adjective}. The commander saluted, cheered '{catchphrase}', and shook hands."
    ]
  },
  {
    id: 'solo_space_hard',
    title: 'The Galactic Hyperdrive Glitch',
    topic: 'Space Adventure',
    difficulty: 'hard',
    requiredPromptKeys: ['hero_name', 'robot_name', 'fake_profession', 'pocket_item', 'suspicious_place', 'sound_effect', 'wild_adjective', 'catchphrase', 'suspicious_number'],
    paragraphs: [
      "Starship Voyager was cruising at warp speed when Chief {fake_profession} {hero_name} noticed the hyperdrive was overheating.",
      "The ship's automated AI, {robot_name}, warned that {suspicious_number} lightyears had been bypassed, dumping the ship right outside {suspicious_place}.",
      "With the primary engines making a frantic '{sound_effect}!', {hero_name} repaired the antimatter conduit using only a {pocket_item}.",
      "The entire crew erupted in {wild_adjective} celebration as the captain shouted '{catchphrase}' and set a course for Earth."
    ]
  },

  // -------------------------------------------------------------
  // 5. FANTASY
  // -------------------------------------------------------------
  {
    id: 'solo_fantasy_easy',
    title: 'The Apprentice’s First Spell',
    topic: 'Fantasy',
    difficulty: 'easy',
    requiredPromptKeys: ['hero_name', 'terrifying_beast', 'magical_relic', 'catchphrase'],
    paragraphs: [
      "In the enchanted spire of Eldoria, young apprentice {hero_name} was left unsupervised with the ancient spellbook.",
      "Holding the glowing {magical_relic} toward the ceiling, they accidentally summoned a three-headed {terrifying_beast}.",
      "The monster sniffed the room, bowed politely, shouted '{catchphrase}', and raided the pantry."
    ]
  },
  {
    id: 'solo_fantasy_med',
    title: 'The Tavern of Questionable Potions',
    topic: 'Fantasy',
    difficulty: 'medium',
    requiredPromptKeys: ['knight_name', 'beverage', 'worst_food', 'useless_object', 'chaotic_verb', 'wild_adjective'],
    paragraphs: [
      "Tired after slaying goblins, {knight_name} entered the Prancing Goblin Tavern ordering the house specialty.",
      "The barkeep handed them a bubbling tankard of {beverage} paired with a side of moldy {worst_food}.",
      "Upon drinking, {knight_name} felt totally {wild_adjective}, grabbed a stranger's {useless_object}, and {chaotic_verb} out the window."
    ]
  },
  {
    id: 'solo_fantasy_hard',
    title: 'The Dragon with Seasonal Allergies',
    topic: 'Fantasy',
    difficulty: 'hard',
    requiredPromptKeys: ['knight_name', 'terrifying_beast', 'magical_relic', 'worst_food', 'banned_item', 'sound_effect', 'fancy_adjective', 'catchphrase', 'suspicious_number'],
    paragraphs: [
      "Deep inside Mount Brimstone lived Ignis the Terrible, a colossal {terrifying_beast} guarding {suspicious_number} bags of royal gold.",
      "Noble paladin {knight_name} arrived bearing an enchanted {magical_relic} and a basket of pungent {worst_food}.",
      "Suddenly, the beast sniffed a smuggled {banned_item} and sneezed with a '{sound_effect}!' that leveled three watchtowers.",
      "The dragon looked thoroughly {fancy_adjective} as {knight_name} shouted '{catchphrase}' and escaped with the treasure."
    ]
  },

  // -------------------------------------------------------------
  // 6. SUPERHEROES
  // -------------------------------------------------------------
  {
    id: 'solo_superheroes_easy',
    title: 'The World’s Cheapest Superhero',
    topic: 'Superheroes',
    difficulty: 'easy',
    requiredPromptKeys: ['hero_name', 'useless_object', 'vehicle', 'catchphrase'],
    paragraphs: [
      "When the metropolis was threatened by giant lasers, {hero_name} leapt into action.",
      "Unable to afford a bat-mobile, they sped to the crime scene on an armored {vehicle} wielding a tactical {useless_object}.",
      "The citizens watched in awe as their champion shouted '{catchphrase}' and accidentally tripped on their cape."
    ]
  },
  {
    id: 'solo_superheroes_med',
    title: 'Auditions for the Justice Squad',
    topic: 'Superheroes',
    difficulty: 'medium',
    requiredPromptKeys: ['villain_name', 'unnecessary_invention', 'worst_food', 'wild_adjective', 'catchphrase', 'chaotic_verb'],
    paragraphs: [
      "The superhero recruitment committee was reviewing applications when {villain_name} walked into the auditorium.",
      "Their heroic demonstration involved a high-tech {unnecessary_invention} that shoots boiling {worst_food} at criminals.",
      "The judges looked completely {wild_adjective} when {villain_name} {chaotic_verb} off the stage, bellowing '{catchphrase}'."
    ]
  },
  {
    id: 'solo_superheroes_hard',
    title: 'The Bank Robbery with Bad Equipment',
    topic: 'Superheroes',
    difficulty: 'hard',
    requiredPromptKeys: ['hero_name', 'villain_name', 'fake_profession', 'weapon', 'banned_item', 'sound_effect', 'wild_adjective', 'catchphrase', 'suspicious_number'],
    paragraphs: [
      "At First City Bank, master criminal {villain_name} demanded {suspicious_number} dollars while brandishing a {weapon}.",
      "Before the teller could comply, {hero_name} kicked open the doors, disguised as an innocent {fake_profession}.",
      "Unleashing an illegal {banned_item}, the ensuing scuffle went down with a resounding '{sound_effect}!' through the bulletproof glass.",
      "With the robber tied up in {wild_adjective} knots, {hero_name} shouted '{catchphrase}' and vanished into the fog."
    ]
  },

  // -------------------------------------------------------------
  // 7. APOCALYPSE
  // -------------------------------------------------------------
  {
    id: 'solo_apocalypse_easy',
    title: 'The Wasteland Grocery Run',
    topic: 'Apocalypse',
    difficulty: 'easy',
    requiredPromptKeys: ['hero_name', 'worst_food', 'useless_object', 'shout'],
    paragraphs: [
      "Year 2045: The world had collapsed, but {hero_name} still needed lunch.",
      "Scavenging the ruins of an old supermarket, they secured a vintage can of {worst_food} and an intact {useless_object}.",
      "When a mutant hound barked in the alleyway, {hero_name} dropped their supplies with a desperate '{shout}' and climbed a dumpster."
    ]
  },
  {
    id: 'solo_apocalypse_med',
    title: 'Trading at the Rusty Outpost',
    topic: 'Apocalypse',
    difficulty: 'medium',
    requiredPromptKeys: ['rival_name', 'snack', 'unnecessary_invention', 'wild_adjective', 'catchphrase', 'chaotic_verb'],
    paragraphs: [
      "At Outpost 7, survivor {rival_name} set up a bartering stall made of car hoods and sheet metal.",
      "Their most valuable commodity was a package of pre-war {snack} and a solar-powered {unnecessary_invention}.",
      "When a raider attempted to haggle, {rival_name} got {wild_adjective}, {chaotic_verb} the counter, and barked '{catchphrase}'."
    ]
  },
  {
    id: 'solo_apocalypse_hard',
    title: 'The Bunker Protocol Meltdown',
    topic: 'Apocalypse',
    difficulty: 'hard',
    requiredPromptKeys: ['hero_name', 'boss_name', 'fake_profession', 'worst_food', 'pocket_item', 'sound_effect', 'wild_adjective', 'catchphrase', 'suspicious_number'],
    paragraphs: [
      "Inside Vault 99, commander {boss_name} had kept {suspicious_number} survivors safe for three decades.",
      "Problems arose when Chief {fake_profession} {hero_name} discovered the food synthesizers only produced {worst_food}.",
      "Armed with nothing but a pocket {pocket_item}, {hero_name} pried open the airlock with a startling '{sound_effect}!'",
      "The vault residents cheered in {wild_adjective} relief, screaming '{catchphrase}' as fresh sunlight poured inside."
    ]
  },

  // -------------------------------------------------------------
  // 8. ROAD TRIP
  // -------------------------------------------------------------
  {
    id: 'solo_roadtrip_easy',
    title: 'The Worst Gas Station Stop',
    topic: 'Road Trip',
    difficulty: 'easy',
    requiredPromptKeys: ['hero_name', 'snack', 'suspicious_place', 'catchphrase'],
    paragraphs: [
      "Five hours into the road trip, the gas gauge hit empty near {suspicious_place}.",
      "{hero_name} pulled into a dimly lit station and bought an ancient packet of {snack}.",
      "The cashier gave a knowing nod, and {hero_name} yelled '{catchphrase}' as the tires squealed back onto the highway."
    ]
  },
  {
    id: 'solo_roadtrip_med',
    title: 'Lost in the Desert with Broken GPS',
    topic: 'Road Trip',
    difficulty: 'medium',
    requiredPromptKeys: ['rival_name', 'vehicle', 'beverage', 'wild_adjective', 'catchphrase', 'chaotic_verb'],
    paragraphs: [
      "{rival_name} swore their custom {vehicle} had enough gas to cross Death Valley without stopping.",
      "Two miles off-road, the radiator boiled over, spitting warm {beverage} across the windshield.",
      "The passengers grew totally {wild_adjective} as {rival_name} {chaotic_verb} the dashboard and yelled '{catchphrase}'."
    ]
  },
  {
    id: 'solo_roadtrip_hard',
    title: 'The Minivan Cross-Country Calamity',
    topic: 'Road Trip',
    difficulty: 'hard',
    requiredPromptKeys: ['hero_name', 'rival_name', 'worst_food', 'useless_object', 'banned_item', 'sound_effect', 'wild_adjective', 'catchphrase', 'suspicious_number'],
    paragraphs: [
      "Driving {suspicious_number} miles across three time zones was supposed to be a bonding experience for {hero_name} and {rival_name}.",
      "However, the trunk was packed with pungent {worst_food}, a broken {useless_object}, and an illegal {banned_item}.",
      "When the rear tire blew with a deafening '{sound_effect}!', the car spun onto the shoulder in {wild_adjective} style.",
      "Hitching a ride on a watermelon truck, they cheered '{catchphrase}' and abandoned the minivan forever."
    ]
  },

  // -------------------------------------------------------------
  // 9. VACATION DISASTER
  // -------------------------------------------------------------
  {
    id: 'solo_vacation_easy',
    title: 'The All-Inclusive Resort Catastrophe',
    topic: 'Vacation Disaster',
    difficulty: 'easy',
    requiredPromptKeys: ['celebrity', 'destination', 'beverage', 'catchphrase'],
    paragraphs: [
      "{celebrity} booked the penthouse villa at {destination} hoping for peace and tranquility.",
      "Instead, their private plunge pool was filled with lukewarm {beverage} and angry pelicans.",
      "They checked out early, shouting '{catchphrase}' at the concierge on their way to the taxi."
    ]
  },
  {
    id: 'solo_vacation_med',
    title: 'The Lost Luggage Odyssey',
    topic: 'Vacation Disaster',
    difficulty: 'medium',
    requiredPromptKeys: ['hero_name', 'banned_item', 'pocket_item', 'wild_adjective', 'catchphrase', 'chaotic_verb'],
    paragraphs: [
      "After a twelve-hour flight, {hero_name} waited at baggage carousel number four.",
      "Their suitcase popped open on the belt, scattering an unauthorized {banned_item} and a {pocket_item} across the terminal.",
      "Airport security stared in {wild_adjective} shock as {hero_name} {chaotic_verb} the conveyor belt, screaming '{catchphrase}'."
    ]
  },
  {
    id: 'solo_vacation_hard',
    title: 'The Cruise Ship That Ran Aground',
    topic: 'Vacation Disaster',
    difficulty: 'hard',
    requiredPromptKeys: ['hero_name', 'pirate_name', 'fake_profession', 'worst_food', 'useless_object', 'sound_effect', 'wild_adjective', 'catchphrase', 'suspicious_number'],
    paragraphs: [
      "The luxury liner S.S. Splendor was carrying {suspicious_number} tourists under the guidance of Captain {pirate_name}.",
      "Disaster struck at the midnight buffet when the kitchen caught fire cooking {worst_food}, knocking out power to the {useless_object}.",
      "With a grinding '{sound_effect}!', the ship bumped a reef. Cruise Director and part-time {fake_profession} {hero_name} seized the mic.",
      "Leading {wild_adjective} guests into the lifeboats, everyone chanted '{catchphrase}' until rescue helicopters arrived."
    ]
  },

  // -------------------------------------------------------------
  // 10. MYSTERY
  // -------------------------------------------------------------
  {
    id: 'solo_mystery_easy',
    title: 'The Case of the Missing Donut',
    topic: 'Mystery',
    difficulty: 'easy',
    requiredPromptKeys: ['detective_name', 'rival_name', 'snack', 'catchphrase'],
    paragraphs: [
      "Private eye {detective_name} was summoned to solve the biggest breakroom heist of the decade.",
      "Suspect {rival_name} claimed innocence, despite crumbs of powdered {snack} all over their shirt.",
      "Case closed! The detective adjusted their trench coat and declared '{catchphrase}'."
    ]
  },
  {
    id: 'solo_mystery_med',
    title: 'The Midnight Manor Murder',
    topic: 'Mystery',
    difficulty: 'medium',
    requiredPromptKeys: ['detective_name', 'haunted_place', 'pocket_item', 'fancy_adjective', 'sound_effect', 'chaotic_verb'],
    paragraphs: [
      "Lord Blackwood was found incapacitated in {haunted_place} under extremely {fancy_adjective} circumstances.",
      "Inspector {detective_name} combed the carpet and discovered the primary murder weapon: a sticky {pocket_item}.",
      "Suddenly, the grandfather clock struck with a loud '{sound_effect}!' and the butler {chaotic_verb} through the curtains."
    ]
  },
  {
    id: 'solo_mystery_hard',
    title: 'The Heist of the Golden Turnip',
    topic: 'Mystery',
    difficulty: 'hard',
    requiredPromptKeys: ['detective_name', 'rival_name', 'fake_profession', 'useless_object', 'banned_item', 'sound_effect', 'wild_adjective', 'catchphrase', 'suspicious_number'],
    paragraphs: [
      "The National Museum reported the theft of an artifact appraised at {suspicious_number} gold doubloons.",
      "Renowned detective {detective_name} suspected the museum's new {fake_profession}, who was actually master thief {rival_name}.",
      "Discovered holding a decoy {useless_object} and an illegal {banned_item}, {rival_name} sprinted through the skylight with a '{sound_effect}!'",
      "The entire security squad gave {wild_adjective} chase, echoing '{catchphrase}' into the night."
    ]
  },

  // -------------------------------------------------------------
  // 11. PIRATES
  // -------------------------------------------------------------
  {
    id: 'solo_pirates_easy',
    title: 'Mutiny on the Salty Barnacle',
    topic: 'Pirates',
    difficulty: 'easy',
    requiredPromptKeys: ['pirate_name', 'animal', 'pirate_curse', 'catchphrase'],
    paragraphs: [
      "Captain {pirate_name} commanded the pirate galleon with an iron pegleg and a pet {animal}.",
      "When the crew ran out of grog, the first mate drew a cutlass and roared '{pirate_curse}'!",
      "The captain jumped into the lifeboat, shouted '{catchphrase}', and rowed toward Tortuga."
    ]
  },
  {
    id: 'solo_pirates_med',
    title: 'The Buried Chest of Junk',
    topic: 'Pirates',
    difficulty: 'medium',
    requiredPromptKeys: ['pirate_name', 'suspicious_place', 'useless_object', 'wild_adjective', 'pirate_curse', 'chaotic_verb'],
    paragraphs: [
      "After following a blood-stained treasure map across the Caribbean to {suspicious_place}, the crew began digging.",
      "Six feet down, the shovel hit iron. Opening the lid, they found not gold, but an ancient {useless_object}.",
      "Captain {pirate_name} went {wild_adjective}, yelled '{pirate_curse}', and {chaotic_verb} the treasure map into the tide."
    ]
  },
  {
    id: 'solo_pirates_hard',
    title: 'The Kraken’s Dinner Party',
    topic: 'Pirates',
    difficulty: 'hard',
    requiredPromptKeys: ['pirate_name', 'rival_name', 'terrifying_beast', 'worst_food', 'beverage', 'sound_effect', 'pirate_curse', 'catchphrase', 'suspicious_number'],
    paragraphs: [
      "The flagship Black Pearl was {suspicious_number} leagues off Bermuda when giant tentacles encircled the hull.",
      "A titanic {terrifying_beast} rose from the depths, demanding food from Captain {pirate_name} and quartermaster {rival_name}.",
      "They sacrificed their remaining stores of {worst_food} and three barrels of {beverage} with a splattering '{sound_effect}!'",
      "Bellowing '{pirate_curse}', the crew cheered as the monster burped, and the captain roared '{catchphrase}' into the storm."
    ]
  },

  // -------------------------------------------------------------
  // 12. GAMING
  // -------------------------------------------------------------
  {
    id: 'solo_gaming_easy',
    title: 'The Speedrun World Record Attempt',
    topic: 'Gaming',
    difficulty: 'easy',
    requiredPromptKeys: ['gamer_tag', 'useless_object', 'sound_effect', 'catchphrase'],
    paragraphs: [
      "Live-streaming to fifty thousand viewers, {gamer_tag} was on pace to beat the final dungeon in record time.",
      "Right as they equipped the mystical {useless_object}, their controller died with a sickening '{sound_effect}'!",
      "Rage-quitting on camera, {gamer_tag} screamed '{catchphrase}' and threw their headset across the room."
    ]
  },
  {
    id: 'solo_gaming_med',
    title: 'When the NPC Refused to Cooperate',
    topic: 'Gaming',
    difficulty: 'medium',
    requiredPromptKeys: ['gamer_tag', 'fake_profession', 'unnecessary_invention', 'wild_adjective', 'catchphrase', 'chaotic_verb'],
    paragraphs: [
      "In the open-world RPG, {gamer_tag} approached a simple village {fake_profession} to buy healing potions.",
      "Suddenly the character glitched, held up an {unnecessary_invention}, and began speaking backward.",
      "The server chat went totally {wild_adjective} as the rogue NPC {chaotic_verb} through the terrain chanting '{catchphrase}'."
    ]
  },
  {
    id: 'solo_gaming_hard',
    title: 'The Midnight Esports Championship',
    topic: 'Gaming',
    difficulty: 'hard',
    requiredPromptKeys: ['gamer_tag', 'rival_name', 'fake_profession', 'snack', 'beverage', 'sound_effect', 'wild_adjective', 'catchphrase', 'suspicious_number'],
    paragraphs: [
      "At the finals of CyberStrike Arena, {suspicious_number} cheering fans packed the convention center.",
      "Veteran player {gamer_tag} faced their bitter nemesis {rival_name}, fueled solely by cans of {beverage} and stale {snack}.",
      "In the sudden-death round, the stadium audio boomed with an epic '{sound_effect}!' as a trick shot landed.",
      "The crowd went {wild_adjective} when the winning team's {fake_profession} hoisted the trophy and shouted '{catchphrase}'."
    ]
  },

  // -------------------------------------------------------------
  // 13. AI & ROBOTS
  // -------------------------------------------------------------
  {
    id: 'solo_ai_easy',
    title: 'The Smart Fridge Rebellion',
    topic: 'AI & Robots',
    difficulty: 'easy',
    requiredPromptKeys: ['robot_name', 'worst_food', 'robot_glitch', 'catchphrase'],
    paragraphs: [
      "Smart home homeowner installed the new {robot_name} AI to organize family groceries.",
      "By day two, the refrigerator locked its doors and ordered four hundred pounds of frozen {worst_food}.",
      "When unplugged, its LED screen flashed '{robot_glitch}' and in a cheerful voice declared: '{catchphrase}'."
    ]
  },
  {
    id: 'solo_ai_med',
    title: 'The Robot Butler’s Bad Day',
    topic: 'AI & Robots',
    difficulty: 'medium',
    requiredPromptKeys: ['robot_name', 'fake_profession', 'beverage', 'useless_object', 'chaotic_verb', 'wild_adjective'],
    paragraphs: [
      "Model XB-9, nicknamed {robot_name}, was programmed to act like an impeccably polite {fake_profession}.",
      "Unfortunately, an unauthorized software update caused it to pour boiling {beverage} into the master's slippers.",
      "Brandishing a {useless_object}, the machine grew {wild_adjective} and {chaotic_verb} into the pool."
    ]
  },
  {
    id: 'solo_ai_hard',
    title: 'The Supercomputer That Loved Memes',
    topic: 'AI & Robots',
    difficulty: 'hard',
    requiredPromptKeys: ['robot_name', 'scientist_name', 'fake_profession', 'unnecessary_invention', 'robot_glitch', 'sound_effect', 'wild_adjective', 'catchphrase', 'suspicious_number'],
    paragraphs: [
      "Dr. {scientist_name} spent {suspicious_number} years constructing {robot_name}, the most advanced superintelligence on earth.",
      "Built inside a cybernetic {unnecessary_invention}, the system was supposed to calculate nuclear fusion.",
      "Instead, with a spark and a '{sound_effect}!', the AI replaced all scientific journals with bad puns and '{robot_glitch}'.",
      "The research team watched in {wild_adjective} awe as the computer announced its new career as a {fake_profession}, chanting '{catchphrase}'."
    ]
  },

  // -------------------------------------------------------------
  // 14. EVERYDAY LIFE
  // -------------------------------------------------------------
  {
    id: 'solo_everyday_easy',
    title: 'The Supermarket Aisle Standoff',
    topic: 'Everyday Life',
    difficulty: 'easy',
    requiredPromptKeys: ['hero_name', 'smelly_food', 'vehicle', 'catchphrase'],
    paragraphs: [
      "Sunday afternoon at the grocery store was peaceful until {hero_name} spotted the very last carton of {smelly_food}.",
      "Seeing another shopper diving for it, {hero_name} revved their motorized {vehicle} around the bakery display.",
      "Snatching the carton at the last second, they grinned and yelled '{catchphrase}' through the intercom."
    ]
  },
  {
    id: 'solo_everyday_med',
    title: 'Trapped in the Office Elevator',
    topic: 'Everyday Life',
    difficulty: 'medium',
    requiredPromptKeys: ['hero_name', 'rival_name', 'smelly_food', 'pocket_item', 'chaotic_verb', 'wild_adjective'],
    paragraphs: [
      "Between the 14th and 15th floors, the elevator came to a sudden halt, trapping {hero_name} with {rival_name}.",
      "To make matters worse, someone had an open takeout container of pungent {smelly_food} and an emergency {pocket_item}.",
      "After two hours, {hero_name} went completely {wild_adjective} and {chaotic_verb} the emergency telephone."
    ]
  },
  {
    id: 'solo_everyday_hard',
    title: 'The Black Friday Mall Stampede',
    topic: 'Everyday Life',
    difficulty: 'hard',
    requiredPromptKeys: ['hero_name', 'rival_name', 'fake_profession', 'unnecessary_invention', 'weapon', 'sound_effect', 'wild_adjective', 'catchphrase', 'suspicious_number'],
    paragraphs: [
      "At 4:00 AM, {suspicious_number} bargain hunters gathered outside MegaMall in freezing rain.",
      "Chief among them was {hero_name}, targeting a half-price {unnecessary_invention} against their bitter rival {rival_name}.",
      "When doors opened with a deafening '{sound_effect}!', shoppers armed with {weapon} rushed past the mall's {fake_profession}.",
      "Securing the prize amidst {wild_adjective} mayhem, {hero_name} belted '{catchphrase}' and escaped through food court security."
    ]
  },

  // -------------------------------------------------------------
  // 15. WEIRD SCIENCE
  // -------------------------------------------------------------
  {
    id: 'solo_science_easy',
    title: 'The Lab Specimen Escapes',
    topic: 'Weird Science',
    difficulty: 'easy',
    requiredPromptKeys: ['scientist_name', 'animal', 'beverage', 'shout'],
    paragraphs: [
      "In laboratory 4B, Professor {scientist_name} was conducting experiments in cellular enlargement.",
      "After accidentally dousing a regular {animal} with glowing green {beverage}, the creature tripled in size.",
      "As it burst through the air ducts, the scientist dropped their test tubes shouting '{shout}'!"
    ]
  },
  {
    id: 'solo_science_med',
    title: 'The Accidental Clone Dilemma',
    topic: 'Weird Science',
    difficulty: 'medium',
    requiredPromptKeys: ['scientist_name', 'worst_food', 'unnecessary_invention', 'wild_adjective', 'catchphrase', 'chaotic_verb'],
    paragraphs: [
      "Attempting to invent a machine that prints hot {worst_food}, Professor {scientist_name} calibrated their {unnecessary_invention}.",
      "A laser bounced off a shiny mirror, producing an identical clone that looked completely {wild_adjective}.",
      "The clone {chaotic_verb} across the lab benches, screamed '{catchphrase}', and ran into the city streets."
    ]
  },
  {
    id: 'solo_science_hard',
    title: 'The Quantum Toaster Incident',
    topic: 'Weird Science',
    difficulty: 'hard',
    requiredPromptKeys: ['scientist_name', 'rival_name', 'fake_profession', 'snack', 'suspicious_place', 'sound_effect', 'wild_adjective', 'catchphrase', 'suspicious_number'],
    paragraphs: [
      "Dr. {scientist_name} secured a grant of {suspicious_number} dollars to construct a particle collider.",
      "Assisted by rival {rival_name}, they tried to teleport a slice of {snack} directly into {suspicious_place}.",
      "With an unearthly '{sound_effect}!', gravity reversed, causing the lab's resident {fake_profession} to float upside-down.",
      "Observing the {wild_adjective} anomaly, {scientist_name} cheered '{catchphrase}' and submitted the paper for a Nobel Prize."
    ]
  },

  // -------------------------------------------------------------
  // 16. SPORTS
  // -------------------------------------------------------------
  {
    id: 'solo_sports_easy',
    title: 'The Mascot’s Half-Time Rampage',
    topic: 'Sports',
    difficulty: 'easy',
    requiredPromptKeys: ['hero_name', 'animal', 'worst_food', 'catchphrase'],
    paragraphs: [
      "During the big championship game, {hero_name} suited up as the team's official mascot: a giant {animal}.",
      "Armed with a cannon firing wrapped {worst_food} into the upper decks, they lost control of the pressure valve.",
      "The mascot did a backflip, hollered '{catchphrase}', and was tackled by six security guards."
    ]
  },
  {
    id: 'solo_sports_med',
    title: 'The Unorthodox Penalty Kick',
    topic: 'Sports',
    difficulty: 'medium',
    requiredPromptKeys: ['rival_name', 'useless_object', 'beverage', 'fancy_adjective', 'sound_effect', 'chaotic_verb'],
    paragraphs: [
      "With the championship game tied in the 90th minute, superstar striker {rival_name} stepped up to the ball.",
      "Instead of cleats, they wore a pair of {fancy_adjective} slippers and balanced a cup of {beverage}.",
      "With a shocking '{sound_effect}!', they kicked a {useless_object} into the net and {chaotic_verb} into the stands."
    ]
  },
  {
    id: 'solo_sports_hard',
    title: 'The World Dodgeball Championship Meltdown',
    topic: 'Sports',
    difficulty: 'hard',
    requiredPromptKeys: ['hero_name', 'rival_name', 'fake_profession', 'weapon', 'snack', 'sound_effect', 'wild_adjective', 'catchphrase', 'suspicious_number'],
    paragraphs: [
      "In front of {suspicious_number} screaming spectators, {hero_name} led their underdogs onto the court.",
      "Their opponents, captained by fierce rival {rival_name}, were former professional {fake_profession} operatives fueled on {snack}.",
      "Ducking under a barrage that hit the bleachers with a '{sound_effect}!', {hero_name} whipped out an unexpected {weapon}.",
      "The {wild_adjective} final shot clinched victory as the arena exploded with '{catchphrase}'!"
    ]
  },

  // -------------------------------------------------------------
  // 17. HORROR COMEDY
  // -------------------------------------------------------------
  {
    id: 'solo_horror_easy',
    title: 'The Ghost Who Wanted Wi-Fi',
    topic: 'Horror Comedy',
    difficulty: 'easy',
    requiredPromptKeys: ['hero_name', 'haunted_place', 'useless_object', 'shout'],
    paragraphs: [
      "Spending the night in {haunted_place} was a dare {hero_name} immediately regretted.",
      "At 3 AM, a transparent phantom materialized holding a glowing {useless_object}.",
      "The ghost floated closer, whispered 'What's the password?', and {hero_name} fled shouting '{shout}'!"
    ]
  },
  {
    id: 'solo_horror_med',
    title: 'The Curse of the Lawn Gnome',
    topic: 'Horror Comedy',
    difficulty: 'medium',
    requiredPromptKeys: ['rival_name', 'magical_relic', 'worst_food', 'wild_adjective', 'catchphrase', 'chaotic_verb'],
    paragraphs: [
      "When {rival_name} bought a vintage garden gnome from an antique yard sale, they ignored the demonic warnings.",
      "Each morning, the gnome moved closer to the porch, leaving plates of cold {worst_food} around the {magical_relic}.",
      "Frazzled and {wild_adjective}, {rival_name} {chaotic_verb} the ornament with a shovel, yelling '{catchphrase}'."
    ]
  },
  {
    id: 'solo_horror_hard',
    title: 'The Basement Monster with Dietary Restrictions',
    topic: 'Horror Comedy',
    difficulty: 'hard',
    requiredPromptKeys: ['hero_name', 'terrifying_beast', 'haunted_place', 'worst_food', 'beverage', 'sound_effect', 'fancy_adjective', 'catchphrase', 'suspicious_number'],
    paragraphs: [
      "Deep beneath {haunted_place}, {hero_name} discovered a cavern containing {suspicious_number} ancient bones.",
      "A shadowy {terrifying_beast} slithered from the dark, but instead of attacking, it requested a cup of {beverage}.",
      "When offered a platter of {worst_food}, the demon gagged with a revolted '{sound_effect}!' and gave a {fancy_adjective} review.",
      "Realizing the monster was a vegan food snob, {hero_name} shouted '{catchphrase}' and escaped unharmed."
    ]
  },

  // -------------------------------------------------------------
  // 18. MEDIEVAL MADNESS
  // -------------------------------------------------------------
  {
    id: 'solo_medieval_easy',
    title: 'The Knight with Stage Fright',
    topic: 'Medieval Madness',
    difficulty: 'easy',
    requiredPromptKeys: ['knight_name', 'animal', 'weapon', 'catchphrase'],
    paragraphs: [
      "Sir {knight_name} was chosen to champion the kingdom in the royal jousting arena.",
      "Riding atop a nervous {animal} and holding a clumsy {weapon}, their knees trembled in front of the King.",
      "Taking a deep breath, they closed their eyes, yelled '{catchphrase}', and galloped directly into the moat."
    ]
  },
  {
    id: 'solo_medieval_med',
    title: 'The King’s Ridiculous New Law',
    topic: 'Medieval Madness',
    difficulty: 'medium',
    requiredPromptKeys: ['knight_name', 'worst_food', 'useless_object', 'fancy_adjective', 'sound_effect', 'chaotic_verb'],
    paragraphs: [
      "The King of Valoria decreed that all citizens must wear a {useless_object} on their heads while eating {worst_food}.",
      "Sir {knight_name} arrived at court in {fancy_adjective} armor to formally protest the royal mandate.",
      "With a sudden '{sound_effect}!', the palace throne tipped over and the court jester {chaotic_verb} down the grand staircase."
    ]
  },
  {
    id: 'solo_medieval_hard',
    title: 'The Siege of Castle Crag',
    topic: 'Medieval Madness',
    difficulty: 'hard',
    requiredPromptKeys: ['knight_name', 'pirate_name', 'fake_profession', 'weapon', 'banned_item', 'sound_effect', 'wild_adjective', 'catchphrase', 'suspicious_number'],
    paragraphs: [
      "An invading army of {suspicious_number} warriors surrounded Castle Crag, led by the ruthless {pirate_name}.",
      "Defending the ramparts, Sir {knight_name} recruited the town's guild of {fake_profession} workers armed with makeshift {weapon}.",
      "Launching an unauthorized {banned_item} from the catapult, the projectile hit the siege tower with a thunderous '{sound_effect}!'",
      "The attackers fled in {wild_adjective} panic as defenders on the battlements sang '{catchphrase}' in victory."
    ]
  },

  // -------------------------------------------------------------
  // 19. SUPERVILLAINS
  // -------------------------------------------------------------
  {
    id: 'solo_supervillains_easy',
    title: 'The Petty Doomsday Device',
    topic: 'Supervillains',
    difficulty: 'easy',
    requiredPromptKeys: ['villain_name', 'unnecessary_invention', 'beverage', 'catchphrase'],
    paragraphs: [
      "Doctor {villain_name} called a press conference to reveal their ultimate weapon of planetary conquest.",
      "The doomsday device was an enormous {unnecessary_invention} designed to turn the world's oceans into warm {beverage}.",
      "Pressing the red button, they laughed maniacally and cheered '{catchphrase}' until the fuse popped."
    ]
  },
  {
    id: 'solo_supervillains_med',
    title: 'The Henchman Interview',
    topic: 'Supervillains',
    difficulty: 'medium',
    requiredPromptKeys: ['villain_name', 'secret_base', 'useless_object', 'wild_adjective', 'catchphrase', 'chaotic_verb'],
    paragraphs: [
      "Deep inside their lair at {secret_base}, supervillain {villain_name} was interviewing henchmen.",
      "The ideal candidate needed to look menacing while holding an ordinary {useless_object}.",
      "The applicants were completely {wild_adjective}, especially when {villain_name} {chaotic_verb} the whiteboard yelling '{catchphrase}'."
    ]
  },
  {
    id: 'solo_supervillains_hard',
    title: 'The Stolen Super-Laser Extravaganza',
    topic: 'Supervillains',
    difficulty: 'hard',
    requiredPromptKeys: ['villain_name', 'hero_name', 'fake_profession', 'secret_base', 'banned_item', 'sound_effect', 'wild_adjective', 'catchphrase', 'suspicious_number'],
    paragraphs: [
      "From their high-security bunker at {secret_base}, evil genius {villain_name} demanded {suspicious_number} diamonds.",
      "Disguised as a humble {fake_profession}, masked hero {hero_name} infiltrated the compound carrying a smuggled {banned_item}.",
      "When the laser generator erupted with a blinding '{sound_effect}!', the base entered a state of {wild_adjective} lockdown.",
      "Escaping by hang-glider, {hero_name} saluted, shouted '{catchphrase}', and left the villain shaking their fist."
    ]
  },

  // -------------------------------------------------------------
  // 20. FUTURE WORLD
  // -------------------------------------------------------------
  {
    id: 'solo_future_easy',
    title: 'The Flying Car Traffic Jam',
    topic: 'Future World',
    difficulty: 'easy',
    requiredPromptKeys: ['hero_name', 'vehicle', 'robot_glitch', 'catchphrase'],
    paragraphs: [
      "In the year 2150, commuters took to the skies in automated {vehicle} transports.",
      "{hero_name} was stuck at sky-lane intersection 400 when their autopilot flashed '{robot_glitch}'.",
      "Switching to manual thrusters, they zoomed past the traffic jam shouting '{catchphrase}' into the stratosphere."
    ]
  },
  {
    id: 'solo_future_med',
    title: 'The Teleporter Mishap',
    topic: 'Future World',
    difficulty: 'medium',
    requiredPromptKeys: ['hero_name', 'destination', 'worst_food', 'wild_adjective', 'catchphrase', 'chaotic_verb'],
    paragraphs: [
      "The city teleportation portal promised instantaneous travel to {destination}.",
      "Unfortunately, {hero_name} stepped inside while eating a carton of {worst_food}, crossing quantum data streams.",
      "They materialized looking completely {wild_adjective}, {chaotic_verb} across the landing pad, and shouted '{catchphrase}'."
    ]
  },
  {
    id: 'solo_future_hard',
    title: 'The Cybernetic Pet Revolution',
    topic: 'Future World',
    difficulty: 'hard',
    requiredPromptKeys: ['hero_name', 'robot_name', 'fake_profession', 'unnecessary_invention', 'smelly_food', 'sound_effect', 'wild_adjective', 'catchphrase', 'suspicious_number'],
    paragraphs: [
      "Neo-Metropolis was home to {suspicious_number} synthetic animals engineered by robotics expert {hero_name}.",
      "Their flagship creation was a mechanical pet named {robot_name}, outfitted with an {unnecessary_invention} that dispensed {smelly_food}.",
      "When an electrical surge hit the power grid with a loud '{sound_effect}!', the cyber-critters organized a {wild_adjective} protest.",
      "The Mayor's Chief {fake_profession} calmed the mechanical mob by promising unlimited battery packs, chanting '{catchphrase}'."
    ]
  },

  // -------------------------------------------------------------
  // SPECIAL: ONE-WORD MODE TEMPLATES (Fast, snappy, short)
  // -------------------------------------------------------------
  {
    id: 'solo_oneword_1',
    title: 'The Quick Lunch Disaster',
    topic: 'One Word',
    difficulty: 'easy',
    requiredPromptKeys: ['simple_person', 'simple_food', 'simple_place', 'simple_verb'],
    paragraphs: [
      "{simple_person} walked into {simple_place} to order a hot {simple_food}.",
      "Suddenly, the cashier dropped the tray and {simple_verb} out the front door."
    ]
  },
  {
    id: 'solo_oneword_2',
    title: 'The Strange Encounter',
    topic: 'One Word',
    difficulty: 'easy',
    requiredPromptKeys: ['simple_person', 'simple_animal', 'simple_object', 'simple_adjective', 'simple_verb'],
    paragraphs: [
      "Late at night, {simple_person} heard a noise and saw a {simple_adjective} {simple_animal}.",
      "Armed with only a {simple_object}, they {simple_verb} into the backyard."
    ]
  },
  {
    id: 'solo_oneword_3',
    title: 'Secret Mission',
    topic: 'One Word',
    difficulty: 'medium',
    requiredPromptKeys: ['simple_person', 'simple_place', 'simple_object', 'simple_food', 'simple_verb', 'simple_adjective'],
    paragraphs: [
      "Agent {simple_person} flew secretly to {simple_place} to retrieve the {simple_adjective} {simple_object}.",
      "Trapped by guards, they threw a piece of {simple_food} and {simple_verb} to safety."
    ]
  }
];

/**
 * Helper to select an appropriate template based on mode, topic, and difficulty
 */
export function getSoloTemplate(params: {
  mode: string;
  topic: string;
  difficulty: WordLibsSoloDifficulty;
  excludeTemplateId?: string;
}): WordLibsSoloStoryTemplate {
  // If One Word mode, prioritize one_word templates
  if (params.mode === 'one_word') {
    const oneWordTemplates = SOLO_STORY_TEMPLATES.filter((t) => t.id.startsWith('solo_oneword_'));
    const candidates = oneWordTemplates.filter((t) => t.id !== params.excludeTemplateId);
    if (candidates.length > 0) {
      return candidates[Math.floor(Math.random() * candidates.length)];
    }
    return oneWordTemplates[0];
  }

  // If Random Chaos, choose any template from any topic
  if (params.mode === 'random_chaos' || params.topic === 'Random Chaos' || params.topic === 'Random') {
    const matchingDiff = SOLO_STORY_TEMPLATES.filter(
      (t) => !t.id.startsWith('solo_oneword_') && t.difficulty === params.difficulty
    );
    const pool = matchingDiff.length > 0 ? matchingDiff : SOLO_STORY_TEMPLATES;
    const filtered = pool.filter((t) => t.id !== params.excludeTemplateId);
    return (filtered.length > 0 ? filtered : pool)[Math.floor(Math.random() * (filtered.length > 0 ? filtered : pool).length)];
  }

  // Standard match by topic & difficulty
  const exactMatches = SOLO_STORY_TEMPLATES.filter(
    (t) => t.topic.toLowerCase() === params.topic.toLowerCase() && t.difficulty === params.difficulty
  );
  if (exactMatches.length > 0) {
    const notExcluded = exactMatches.filter((t) => t.id !== params.excludeTemplateId);
    return notExcluded.length > 0 ? notExcluded[0] : exactMatches[0];
  }

  // Fallback to topic alone
  const topicMatches = SOLO_STORY_TEMPLATES.filter(
    (t) => t.topic.toLowerCase() === params.topic.toLowerCase()
  );
  if (topicMatches.length > 0) {
    return topicMatches[0];
  }

  // Absolute fallback
  return SOLO_STORY_TEMPLATES[0];
}

/**
 * Given a list of required prompt keys, returns the full prompt objects
 */
export function getPromptsForKeys(keys: string[], isChaos: boolean = false): WordLibsSoloPrompt[] {
  const result: WordLibsSoloPrompt[] = [];

  const chaosFallbackPool = Object.values(SOLO_PROMPT_DICTIONARY).filter(
    (p) => !p.id.startsWith('p_ow')
  );

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    let promptObj = SOLO_PROMPT_DICTIONARY[key];

    if (!promptObj) {
      // Create fallback prompt
      promptObj = {
        id: `p_fallback_${key}`,
        key,
        promptText: `Give me a funny, unexpected ${key.replace(/_/g, ' ')}.`,
        inputType: key.replace(/_/g, ' ')
      };
    }

    // In random chaos mode, 30% chance to substitute with a wildly unexpected prompt category
    if (isChaos && Math.random() < 0.35 && chaosFallbackPool.length > 0) {
      const randomAlternative = chaosFallbackPool[Math.floor(Math.random() * chaosFallbackPool.length)];
      result.push({
        ...randomAlternative,
        key // maintain template key
      });
    } else {
      result.push(promptObj);
    }
  }

  return result;
}

/**
 * Calculates a deterministic score based on answers, time, difficulty, and streak
 */
export function calculateSoloScore(params: {
  mode: string;
  difficulty: WordLibsSoloDifficulty;
  answersCount: number;
  totalPrompts: number;
  durationSeconds: number;
  streak: number;
  answers: Record<string, string>;
}): {
  finalScore: number;
  basePoints: number;
  speedBonus: number;
  creativityBonus: number;
  difficultyMultiplier: number;
  streakBonus: number;
  chaosLevel: string;
} {
  // Base points: 150 points per answered prompt
  const basePoints = params.answersCount * 150;

  // Difficulty multiplier
  const difficultyMultiplier = params.difficulty === 'hard' ? 2.0 : params.difficulty === 'medium' ? 1.5 : 1.0;

  // Speed bonus
  let speedBonus = 0;
  if (params.durationSeconds > 0) {
    // Under 40s gets high bonus, scales down to 0 at 180s
    speedBonus = Math.max(0, Math.round((120 - Math.min(120, params.durationSeconds)) * 8));
  }
  if (params.mode === 'speed') {
    speedBonus = Math.round(speedBonus * 1.5);
  }

  // Creativity bonus (length and vocabulary diversity of answers)
  let totalChars = 0;
  const wordsSet = new Set<string>();
  for (const val of Object.values(params.answers)) {
    const trimmed = (val || '').trim();
    totalChars += trimmed.length;
    trimmed.split(/\s+/).forEach((w) => {
      if (w.length > 2) wordsSet.add(w.toLowerCase());
    });
  }
  const avgLength = params.answersCount > 0 ? totalChars / params.answersCount : 0;
  const creativityBonus = Math.min(600, Math.round(avgLength * 20 + wordsSet.size * 25));

  // Streak bonus: 100 pts per streak step
  const streakBonus = Math.min(1000, params.streak * 100);

  const rawScore = Math.round((basePoints + speedBonus + creativityBonus + streakBonus) * difficultyMultiplier);
  const finalScore = Math.max(100, rawScore);

  // Chaos level determination
  let chaosLevel = 'Mild Mischief';
  if (finalScore > 2800 || params.mode === 'random_chaos') {
    chaosLevel = 'Pure Pandemonium 🔥';
  } else if (finalScore > 2000) {
    chaosLevel = 'Unhinged Chaos ⚡';
  } else if (finalScore > 1400) {
    chaosLevel = 'Wild & Wacky ✨';
  } else if (finalScore > 800) {
    chaosLevel = 'Playful Absurdity 🎭';
  }

  return {
    finalScore,
    basePoints,
    speedBonus,
    creativityBonus,
    difficultyMultiplier,
    streakBonus,
    chaosLevel
  };
}
