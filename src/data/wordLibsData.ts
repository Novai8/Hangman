import { WordLibsPrompt, WordLibsStoryTemplate, WordLibsTopic } from '../types/wordLibs';

export const WORD_LIBS_TOPICS: WordLibsTopic[] = [
  'Random',
  'School',
  'Work',
  'Food',
  'Space',
  'Fantasy',
  'Superheroes',
  'Apocalypse',
  'Travel',
  'Mystery',
  'Pirates',
  'Gaming',
  'AI',
  'Everyday Life',
  'Dating Disaster',
  'Family Chaos',
  'Vacation Disaster',
  'Restaurant Disaster',
  'Medieval Chaos',
  'Future Chaos'
];

export const WORD_LIBS_PROMPTS: WordLibsPrompt[] = [
  // 1-15: People & Names & Characters
  { id: 'p1', key: 'person_name', promptText: "Name someone who would cause an instant scandal if seen at your wedding.", inputType: 'name', placeholder: 'e.g. Grandma, Nicholas Cage' },
  { id: 'p2', key: 'rival_name', promptText: "Name a person you would never trust with your unlocked phone.", inputType: 'name', placeholder: 'e.g. Kevin from HR' },
  { id: 'p3', key: 'celebrity', promptText: "Name a celebrity who looks like they eat raw lemons for fun.", inputType: 'character', placeholder: 'e.g. Gordon Ramsay' },
  { id: 'p4', key: 'fictional_character', promptText: "Name a fictional character who would make the world's worst babysitter.", inputType: 'character', placeholder: 'e.g. Darth Vader' },
  { id: 'p5', key: 'historical_figure', promptText: "Name a historical figure who would be completely addicted to TikTok.", inputType: 'character', placeholder: 'e.g. Napoleon Bonaparte' },
  { id: 'p6', key: 'villain_name', promptText: "Invent the worst possible name for a supervillain's clumsy henchman.", inputType: 'name', placeholder: 'e.g. Butterfingers Bob' },
  { id: 'p7', key: 'alien_name', promptText: "Give a 3-letter name to an alien that communicates solely through burps.", inputType: 'name', placeholder: 'e.g. Zog, Blorp' },
  { id: 'p8', key: 'teacher_name', promptText: "Invent a name for a substitute teacher who clearly hates teenagers.", inputType: 'name', placeholder: 'e.g. Mr. Grumpington' },
  { id: 'p9', key: 'influencer_name', promptText: "Name an annoying teenage influencer who live-streams their dentist appointments.", inputType: 'name', placeholder: 'e.g. Chad VibeZ' },
  { id: 'p10', key: 'boss_name', promptText: "Invent a name for a boss whose favorite phrase is 'Per my last email'.", inputType: 'name', placeholder: 'e.g. Brenda Micromanager' },
  { id: 'p11', key: 'pet_name', promptText: "Name a tiny goldfish that behaves like a ruthless mafia boss.", inputType: 'name', placeholder: 'e.g. Don Bubbles' },
  { id: 'p12', key: 'detective_name', promptText: "Invent a pretentious French detective name for someone who solves missing staplers.", inputType: 'name', placeholder: 'e.g. Inspector Baguette' },
  { id: 'p13', key: 'gamer_tag', promptText: "Invent the most embarrassing Xbox gamertag from 2009.", inputType: 'name', placeholder: 'e.g. xX_N00b_S1ayer_Xx' },
  { id: 'p14', key: 'secret_agent', promptText: "Name a spy who gets caught within the first 30 seconds of every mission.", inputType: 'name', placeholder: 'e.g. Agent Clumsy' },
  { id: 'p15', key: 'wizard_name', promptText: "Name an elderly wizard who constantly forgets what spells do.", inputType: 'character', placeholder: 'e.g. Dumble-oops' },

  // 16-30: Animals & Creatures
  { id: 'p16', key: 'animal', promptText: "Name an animal that would make a terrible high school teacher.", inputType: 'animal', placeholder: 'e.g. Screaming Goat' },
  { id: 'p17', key: 'dangerous_pet', promptText: "Name an animal that should NEVER be allowed on an airplane.", inputType: 'animal', placeholder: 'e.g. Electric Eel' },
  { id: 'p18', key: 'mythical_beast', promptText: "Name a mythical creature that is allergic to its own magic.", inputType: 'animal', placeholder: 'e.g. Asthmatic Dragon' },
  { id: 'p19', key: 'zoo_animal', promptText: "Name an animal that acts like it pays rent and owns the house.", inputType: 'animal', placeholder: 'e.g. An orange cat' },
  { id: 'p20', key: 'insect', promptText: "Name an insect that belongs exclusively in horror movies.", inputType: 'animal', placeholder: 'e.g. Flying Cockroach' },
  { id: 'p21', key: 'sea_creature', promptText: "Name a sea creature that looks like it knows all your darkest secrets.", inputType: 'animal', placeholder: 'e.g. Giant Squid' },
  { id: 'p22', key: 'swamp_beast', promptText: "Invent an animal hybrid that smells like old gym socks.", inputType: 'animal', placeholder: 'e.g. Skunk-Hamster' },
  { id: 'p23', key: 'rideable_animal', promptText: "Name an animal that would be humiliating to ride into an epic medieval battle.", inputType: 'animal', placeholder: 'e.g. Paved Penguin' },
  { id: 'p24', key: 'fast_animal', promptText: "Name an animal known for moving painfully slow.", inputType: 'animal', placeholder: 'e.g. Sleep-deprived Sloth' },
  { id: 'p25', key: 'guard_animal', promptText: "Name the least intimidating animal you could post as a guard outside a bank.", inputType: 'animal', placeholder: 'e.g. Fluffy Bunny' },

  // 31-45: Foods & Beverages
  { id: 'p26', key: 'food', promptText: "Name a food that sounds like an explosive military weapon.", inputType: 'food', placeholder: 'e.g. Atomic Meatball' },
  { id: 'p27', key: 'disgusting_snack', promptText: "Name a snack you would only eat if offered 1 million dollars in cash.", inputType: 'food', placeholder: 'e.g. Mayo-dipped Oreo' },
  { id: 'p28', key: 'pizza_topping', promptText: "Invent a pizza topping that would cause an international diplomatic crisis.", inputType: 'food', placeholder: 'e.g. Warm toothpaste' },
  { id: 'p29', key: 'beverage', promptText: "Name a liquid beverage that no sensible human should ever drink warm.", inputType: 'food', placeholder: 'e.g. Pickled milk' },
  { id: 'p30', key: 'dessert', promptText: "Name an over-complicated French dessert that takes 14 hours to make.", inputType: 'food', placeholder: 'e.g. Soufflé of Regret' },
  { id: 'p31', key: 'cereal', promptText: "Invent a sugary children's cereal with 99% pure artificial food coloring.", inputType: 'food', placeholder: 'e.g. Sugar-Coma Crunch' },
  { id: 'p32', key: 'smelly_food', promptText: "Name a food that can clear an entire office floor within 8 seconds.", inputType: 'food', placeholder: 'e.g. Microwaved salmon' },
  { id: 'p33', key: 'fancy_dish', promptText: "Invent a pretentious $200 restaurant appetizer that consists of 2 bites.", inputType: 'food', placeholder: 'e.g. Deconstructed Air' },
  { id: 'p34', key: 'fast_food', promptText: "Name a greasy 3 AM drive-thru order you will immediately regret tomorrow.", inputType: 'food', placeholder: 'e.g. Deep-fried burrito' },
  { id: 'p35', key: 'comfort_food', promptText: "Name a carb-heavy comfort food that puts people instantly to sleep.", inputType: 'food', placeholder: 'e.g. 5-pound lasagna' },

  // 46-60: Professions & Careers
  { id: 'p36', key: 'profession', promptText: "Invent a ridiculous profession that pays $250,000 a year.", inputType: 'profession', placeholder: 'e.g. Professional Banana Straightener' },
  { id: 'p37', key: 'useless_job', promptText: "Invent a job title for someone whose sole task is pressing one button per week.", inputType: 'profession', placeholder: 'e.g. Chief Reboot Officer' },
  { id: 'p38', key: 'medieval_job', promptText: "Name a miserable medieval job that modern history textbooks skip.", inputType: 'profession', placeholder: 'e.g. Royal Leech Washer' },
  { id: 'p39', key: 'space_job', promptText: "Invent a boring desk job aboard a galaxy-class starship.", inputType: 'profession', placeholder: 'e.g. Asteroid Tax Auditor' },
  { id: 'p40', key: 'night_job', promptText: "Invent a suspicious job title for someone who only works between 3 AM and 5 AM.", inputType: 'profession', placeholder: 'e.g. Mystery Meat Transporter' },
  { id: 'p41', key: 'circus_act', promptText: "Name a dangerous circus performer title that nobody ever volunteers for.", inputType: 'profession', placeholder: 'e.g. Human Cannonball Finisher' },
  { id: 'p42', key: 'tech_job', promptText: "Invent a pretentious Silicon Valley tech bro job title.", inputType: 'profession', placeholder: 'e.g. Quantum Synergist' },
  { id: 'p43', key: 'undercover_role', promptText: "Name the worst undercover disguise for an FBI agent.", inputType: 'profession', placeholder: 'e.g. Mall Easter Bunny' },

  // 61-75: Objects, Gadgets & Inventions
  { id: 'p44', key: 'useless_object', promptText: "Name an object that would be completely useless during a zombie apocalypse.", inputType: 'object', placeholder: 'e.g. Heated eyelash curler' },
  { id: 'p45', key: 'banned_item', promptText: "Name something that should NEVER be brought to a high-society royal wedding.", inputType: 'object', placeholder: 'e.g. Fog machine' },
  { id: 'p46', key: 'office_item', promptText: "Name an office supply item that always mysteriously vanishes.", inputType: 'object', placeholder: 'e.g. Red stapler' },
  { id: 'p47', key: 'weapon', promptText: "Invent an absurd improvised weapon you might find in an IKEA showroom.", inputType: 'object', placeholder: 'e.g. Meatball scoop' },
  { id: 'p48', key: 'invention', promptText: "Invent a useless smartphone gadget that solves a problem no one has.", inputType: 'invention', placeholder: 'e.g. Bluetooth dental floss' },
  { id: 'p49', key: 'pocket_item', promptText: "Name something suspicious you would pull out of your coat pocket when asked for ID.", inputType: 'object', placeholder: 'e.g. Half-eaten taco' },
  { id: 'p50', key: 'magical_relic', promptText: "Invent a mystical ancient artifact that is cursed with slight inconvenience.", inputType: 'object', placeholder: 'e.g. Ring of endless itching' },
  { id: 'p51', key: 'vehicle', promptText: "Name an absurd vehicle you would arrive in to intimidate your high school bully.", inputType: 'object', placeholder: 'e.g. Monster Segway' },
  { id: 'p52', key: 'bedroom_item', promptText: "Name an object you should never find under a hotel pillow.", inputType: 'object', placeholder: 'e.g. Live harmonica' },
  { id: 'p53', key: 'holiday_gift', promptText: "Name the absolute worst white elephant gift imaginable.", inputType: 'object', placeholder: 'e.g. Used sandpaper' },

  // 76-90: Places & Locations
  { id: 'p54', key: 'place', promptText: "Name a place you would never want to be trapped in with a clown.", inputType: 'place', placeholder: 'e.g. An elevator at Walmart' },
  { id: 'p55', key: 'vacation_spot', promptText: "Invent the worst possible destination for a romantic honeymoon.", inputType: 'place', placeholder: 'e.g. An active volcano crater' },
  { id: 'p56', key: 'secret_base', promptText: "Name the most conspicuous location for an evil lair.", inputType: 'place', placeholder: 'e.g. Behind the Chuck E. Cheese ball pit' },
  { id: 'p57', key: 'haunted_place', promptText: "Name an everyday location that feels inherently cursed at midnight.", inputType: 'place', placeholder: 'e.g. The 24-hour laundromat' },
  { id: 'p58', key: 'planet', promptText: "Name a planet that smells entirely like burnt toast and sulfur.", inputType: 'place', placeholder: 'e.g. Xylar-7' },
  { id: 'p59', key: 'room_in_house', promptText: "Name a room where you definitely do not want to hear a sinister giggle.", inputType: 'place', placeholder: 'e.g. The basement crawlspace' },
  { id: 'p60', key: 'public_place', promptText: "Name a place where speaking loudly should be punishable by exile.", inputType: 'place', placeholder: 'e.g. The DMV waiting room' },

  // 91-105: Superpowers, Excuses, Secrets, Catchphrases, Verbs & Adjectives
  { id: 'p61', key: 'superpower', promptText: "Invent a completely useless superpower that would barely impress an 8-year-old.", inputType: 'superpower', placeholder: 'e.g. Turning tap water lukewarm' },
  { id: 'p62', key: 'villain_power', promptText: "Invent a superpower that is annoying rather than evil.", inputType: 'superpower', placeholder: 'e.g. Untying strangers shoe laces' },
  { id: 'p63', key: 'terrible_excuse', promptText: "Invent a shameless excuse for showing up 45 minutes late to work.", inputType: 'excuse', placeholder: 'e.g. A pigeon challenged me to chess' },
  { id: 'p64', key: 'dark_secret', promptText: "Confess a harmless but deeply weird secret habit.", inputType: 'secret', placeholder: 'e.g. I secretly sniff new books' },
  { id: 'p65', key: 'catchphrase', promptText: "Invent a corny action-hero catchphrase you shout before doing something reckless.", inputType: 'catchphrase', placeholder: 'e.g. BUCKLE UP BUTTERCUP!' },
  { id: 'p66', key: 'sound_effect', promptText: "Write a ridiculous onomatopoeia sound effect for something falling down stairs.", inputType: 'sound', placeholder: 'e.g. KER-PLOP-DING!' },
  { id: 'p67', key: 'ridiculous_verb', promptText: "Enter an aggressive, chaotic action verb in past tense (-ed).", inputType: 'verb', placeholder: 'e.g. yeeted, drop-kicked' },
  { id: 'p68', key: 'gross_verb', promptText: "Enter an unpleasant bodily or sloppy verb in past tense.", inputType: 'verb', placeholder: 'e.g. slobbered, slithered' },
  { id: 'p69', key: 'wild_adjective', promptText: "Enter an adjective describing someone who hasn't slept in 72 hours.", inputType: 'adjective', placeholder: 'e.g. feral, unhinged' },
  { id: 'p70', key: 'smelly_adjective', promptText: "Enter an adjective describing the smell of an old gym locker.", inputType: 'adjective', placeholder: 'e.g. moldy, pungent' },
  { id: 'p71', key: 'fancy_adjective', promptText: "Enter an overly dramatic Victorian adjective.", inputType: 'adjective', placeholder: 'e.g. scandalous, preposterous' },
  { id: 'p72', key: 'internet_phrase', promptText: "Enter a cringe slang word or meme phrase from the internet.", inputType: 'internet_phrase', placeholder: 'e.g. Skibidi, Big Yikes' },
  { id: 'p73', key: 'suspicious_number', promptText: "Enter a strangely specific high number.", inputType: 'number', placeholder: 'e.g. 43,892' },
  { id: 'p74', key: 'fake_brand', promptText: "Invent the name of a shady, cheap discount store brand.", inputType: 'brand', placeholder: 'e.g. SuperDollar Plus' },
  { id: 'p75', key: 'alien_misunderstanding', promptText: "Name something an alien would misunderstand about humans.", inputType: 'secret', placeholder: 'e.g. Why we collect decorative pillows' },

  // 106-125: Specialized & Chaos Prompts
  { id: 'p76', key: 'pirate_curse', promptText: "Invent a bizarre pirate insult shouted on the high seas.", inputType: 'catchphrase', placeholder: 'e.g. Ye barnacle-brained jelly!' },
  { id: 'p77', key: 'school_subject', promptText: "Invent a school class that would result in immediate detention.", inputType: 'profession', placeholder: 'e.g. Advanced Nap Taking' },
  { id: 'p78', key: 'robot_glitch', promptText: "Write the error message an AI displays right before it goes rogue.", inputType: 'catchphrase', placeholder: 'e.g. ERROR 404: MERCY NOT FOUND' },
  { id: 'p79', key: 'dating_red_flag', promptText: "Name an undeniable red flag on a first date.", inputType: 'secret', placeholder: 'e.g. Brings their mom and a stopwatch' },
  { id: 'p80', key: 'magic_spell', promptText: "Invent a magic spell phrase that accidentally summons snacks.", inputType: 'catchphrase', placeholder: 'e.g. ABRA-CA-PIZZA!' },
  { id: 'p81', key: 'chaotic_noun', promptText: "Name something that definitely doesn't belong in a blender.", inputType: 'random_object', placeholder: 'e.g. A smartphone' },
  { id: 'p82', key: 'airport_trouble', promptText: "Name an item that gets you pulled aside for a 2-hour airport security search.", inputType: 'object', placeholder: 'e.g. A suspicious jar of gravy' },
  { id: 'p83', key: 'superhero_gadget', promptText: "Invent a gadget Batman would immediately throw in the trash.", inputType: 'invention', placeholder: 'e.g. The Bat-Kazoo' },
  { id: 'p84', key: 'terrible_hobby', promptText: "Invent the most boring weekend hobby on earth.", inputType: 'profession', placeholder: 'e.g. Paint drying observation' },
  { id: 'p85', key: 'dramatic_exclamation', promptText: "Enter a dramatic one-word exclamation you scream when dropping your phone.", inputType: 'catchphrase', placeholder: 'e.g. NOOOOO!, CURSES!' },
  { id: 'p86', key: 'fast_transport', promptText: "Name a chaotic method of transportation through a crowded mall.", inputType: 'object', placeholder: 'e.g. A runaway shopping cart' },
  { id: 'p87', key: 'emergency_item', promptText: "Name the last item you would grab if your house caught fire.", inputType: 'object', placeholder: 'e.g. The expired coupon drawer' },
  { id: 'p88', key: 'cooking_mistake', promptText: "Name an ingredient you accidentally confused with powdered sugar.", inputType: 'food', placeholder: 'e.g. Pure table salt' },
  { id: 'p89', key: 'doctor_diagnosis', promptText: "Invent a made-up medical condition caused by staring at phone memes all night.", inputType: 'secret', placeholder: 'e.g. Chronic Thumb Exhaustion' },
  { id: 'p90', key: 'party_foul', promptText: "Name something someone does that instantly ruins a birthday party.", inputType: 'secret', placeholder: 'e.g. Sneezing directly on the cake' },
  { id: 'p91', key: 'gym_fail', promptText: "Invent an exercise machine that looks like a medieval torture device.", inputType: 'invention', placeholder: 'e.g. The Glute Obliterator 3000' },
  { id: 'p92', key: 'unhinged_animal_sound', promptText: "What sound does a furious duck make when denied bread?", inputType: 'sound', placeholder: 'e.g. HONK-SCREEECH' },
  { id: 'p93', key: 'weird_phobia', promptText: "Invent an irrational fear of something completely harmless.", inputType: 'secret', placeholder: 'e.g. Fear of velvet furniture' },
  { id: 'p94', key: 'bad_gift', promptText: "Name an offensive gift to give your significant other on Valentine's Day.", inputType: 'object', placeholder: 'e.g. An ironing board' },
  { id: 'p95', key: 'royal_decree', promptText: "Invent an absurd royal law punishable by standing in the corner.", inputType: 'catchphrase', placeholder: 'e.g. ALL DOUGHNUTS ARE NOW TAXED' },
  { id: 'p96', key: 'clumsy_action', promptText: "Enter a verb for tripping over your own feet in front of a crush.", inputType: 'verb', placeholder: 'e.g. face-planted, careened' },
  { id: 'p97', key: 'conspiracy_theory', promptText: "Invent a conspiracy theory involving pigeons and government WiFi.", inputType: 'secret', placeholder: 'e.g. Birds recharge on power lines' },
  { id: 'p98', key: 'villain_hideout', promptText: "Name a totally public business that is secretly an evil syndicate.", inputType: 'place', placeholder: 'e.g. The local mattress store' },
  { id: 'p99', key: 'embarrassing_song', promptText: "Name a pop song you secretly blast when driving alone with the windows up.", inputType: 'catchphrase', placeholder: 'e.g. Party in the USA' },
  { id: 'p100', key: 'chaos_finale', promptText: "Invent a single word that summarizes pure unadulterated madness.", inputType: 'adjective', placeholder: 'e.g. PANDEMONIUM, GOBLIN-MODE' }
];

// 30+ Original, Multi-paragraph Story Templates across varied topics
export const WORD_LIBS_STORIES: WordLibsStoryTemplate[] = [
  // 1: WORK CHAOS - Worst Job Interview
  {
    id: 's_work_1',
    title: 'The Worst Job Interview in Human History',
    topic: 'Work',
    requiredPromptKeys: ['person_name', 'profession', 'food', 'useless_object', 'terrible_excuse', 'catchphrase', 'wild_adjective'],
    paragraphs: [
      "Yesterday morning, {person_name} put on their cleanest suit and walked into MegaCorp for a high-stakes interview as a {profession}.",
      "Things unraveled instantly when they pulled a {useless_object} from their briefcase and offered the hiring manager a bite of cold {food}.",
      "When asked why they were 45 minutes late, {person_name} leaned in and whispered: '{terrible_excuse}'. The manager looked totally {wild_adjective}.",
      "Without warning, {person_name} stood atop the conference table, shouted '{catchphrase}', and was immediately offered the position of Senior Vice President."
    ]
  },

  // 2: WORK CHAOS - The Intern Takes Over
  {
    id: 's_work_2',
    title: 'The Day the Intern Replaced the CEO',
    topic: 'Work',
    requiredPromptKeys: ['boss_name', 'tech_job', 'office_item', 'beverage', 'catchphrase', 'ridiculous_verb'],
    paragraphs: [
      "At exactly 9:02 AM, {boss_name} spilled scalding hot {beverage} all over the master server and fled the building in panic.",
      "Left alone in the boardroom, the unpaid intern seized the sacred {office_item} and declared themselves the new {tech_job}.",
      "Within forty-five minutes, they {ridiculous_verb} the company payroll, doubled company stock, and sent an all-staff memo reading: '{catchphrase}'."
    ]
  },

  // 3: SCHOOL CHAOS - Cafeteria Disaster
  {
    id: 's_school_1',
    title: 'The Great Cafeteria Catastrophe',
    topic: 'School',
    requiredPromptKeys: ['teacher_name', 'food', 'animal', 'weapon', 'ridiculous_verb', 'sound_effect'],
    paragraphs: [
      "Nobody expected lunch period at Westbridge High to turn into a full-scale battleground, until {teacher_name} introduced the mystery {food}.",
      "It started with a lone whisper, but suddenly someone brandished a {weapon} made entirely out of plastic spoons.",
      "An escaped {animal} {ridiculous_verb} across the salad bar with a deafening '{sound_effect}!', leaving the cafeteria under emergency quarantine for three weeks."
    ]
  },

  // 4: SCHOOL CHAOS - The Worst School Presentation
  {
    id: 's_school_2',
    title: 'The Biology Presentation Gone Wrong',
    topic: 'School',
    requiredPromptKeys: ['person_name', 'animal', 'disgusting_snack', 'wild_adjective', 'catchphrase'],
    paragraphs: [
      "For their final semester grade, {person_name} was supposed to deliver a five-minute lecture on photosynthesis.",
      "Instead, they carried a live {animal} inside a gym duffel and revealed a cardboard model made out of {disgusting_snack}.",
      "The teacher looked completely {wild_adjective} as {person_name} concluded the presentation by screaming '{catchphrase}' and dropping the microphone."
    ]
  },

  // 5: FOOD CHAOS - World's Worst Restaurant
  {
    id: 's_food_1',
    title: 'Dinner at Le Petit Disaster',
    topic: 'Food',
    requiredPromptKeys: ['detective_name', 'pizza_topping', 'smelly_food', 'fancy_adjective', 'sound_effect'],
    paragraphs: [
      "Food critic {detective_name} booked a corner table at the city's newest five-star establishment expecting culinary excellence.",
      "Course one arrived under a silver dome: a steaming pile of {smelly_food} garnished with raw {pizza_topping}.",
      "The head chef declared the recipe '{fancy_adjective}'. Suddenly, the plate emitted a distinct '{sound_effect}' and began moving toward the kitchen doors."
    ]
  },

  // 6: SPACE - First Day on Mars
  {
    id: 's_space_1',
    title: 'First Contact at the Red Planet',
    topic: 'Space',
    requiredPromptKeys: ['alien_name', 'space_job', 'useless_object', 'planet', 'alien_misunderstanding', 'catchphrase'],
    paragraphs: [
      "Commander Nova landed the reconnaissance rover on the dusty surface of {planet}, ready to begin their mission as Chief {space_job}.",
      "Within seconds, an alien leader named {alien_name} emerged from a crater brandishing a mysterious {useless_object}.",
      "The extraterrestrial attempted to explain {alien_misunderstanding}, but Commander Nova simply nodded, saluted, and shouted '{catchphrase}'."
    ]
  },

  // 7: FANTASY - The Worst Wizard in the Realm
  {
    id: 's_fantasy_1',
    title: 'The Apprentice with Zero Discipline',
    topic: 'Fantasy',
    requiredPromptKeys: ['wizard_name', 'mythical_beast', 'magical_relic', 'magic_spell', 'ridiculous_verb'],
    paragraphs: [
      "In the obsidian tower of Eldoria, {wizard_name} prepared to cast the ancient incantation of ultimate wisdom.",
      "Holding the enchanted {magical_relic} high above their head, they accidentally uttered the forbidden words: '{magic_spell}'!",
      "A gigantic {mythical_beast} immediately manifested in the pantry and {ridiculous_verb} every block of cheese before vanishing into thin air."
    ]
  },

  // 8: SUPERHEROES - The Worst Superhero Audition
  {
    id: 's_heroes_1',
    title: 'Auditions for the Justice Syndicate',
    topic: 'Superheroes',
    requiredPromptKeys: ['villain_name', 'superpower', 'useless_object', 'catchphrase', 'wild_adjective'],
    paragraphs: [
      "The Avengers had an open audition slot this morning, and {villain_name} arrived determined to prove their worth.",
      "When asked about their heroic gift, they demonstrated the rare ability of {superpower}, using only an ordinary {useless_object}.",
      "The committee stared in {wild_adjective} silence until {villain_name} winked, cheered '{catchphrase}', and flew through a closed window."
    ]
  },

  // 9: APOCALYPSE - Grocery Run in the Wasteland
  {
    id: 's_apocalypse_1',
    title: 'Supplies at the End of the World',
    topic: 'Apocalypse',
    requiredPromptKeys: ['person_name', 'useless_object', 'disgusting_snack', 'animal', 'ridiculous_verb'],
    paragraphs: [
      "Day 47 after the Great Collapse: {person_name} strapped on their tactical boots and raided the abandoned mega-mart.",
      "While other survivors fought over clean water and batteries, {person_name} filled their shopping cart with a {useless_object} and seven boxes of {disgusting_snack}.",
      "A mutant {animal} blocked the exit aisle, but {person_name} simply {ridiculous_verb} across the checkout counter and vanished into the wasteland."
    ]
  },

  // 10: TRAVEL - Vacation from Hell
  {
    id: 's_travel_1',
    title: 'The Five-Star Resort Catastrophe',
    topic: 'Travel',
    requiredPromptKeys: ['celebrity', 'vacation_spot', 'banned_item', 'beverage', 'catchphrase'],
    paragraphs: [
      "Hoping for a quiet weekend of relaxation, {celebrity} booked an all-inclusive VIP suite at {vacation_spot}.",
      "Things went south at baggage claim when customs confiscated their personal {banned_item} and an open gallon of {beverage}.",
      "By Sunday morning, they were seen sprinting down the beach in flip-flops, screaming '{catchphrase}' as hotel security gave chase on golf carts."
    ]
  },

  // 11: MYSTERY - The Case of the Missing Lunch
  {
    id: 's_mystery_1',
    title: 'The Breakroom Crime of the Century',
    topic: 'Mystery',
    requiredPromptKeys: ['detective_name', 'rival_name', 'food', 'pocket_item', 'sound_effect'],
    paragraphs: [
      "At 12:15 PM, someone mercilessly stole a brown paper bag containing an artisanal {food} from the refrigerator.",
      "Private eye {detective_name} was summoned to interrogate the prime suspect, {rival_name}, who claimed to have an airtight alibi.",
      "However, when a {pocket_item} tumbled out of their jacket with a loud '{sound_effect}', the case was officially closed."
    ]
  },

  // 12: PIRATES - Mutiny on the Salty Barnacle
  {
    id: 's_pirates_1',
    title: 'Mutiny Over Morning Oatmeal',
    topic: 'Pirates',
    requiredPromptKeys: ['rival_name', 'pirate_curse', 'animal', 'weapon', 'ridiculous_verb'],
    paragraphs: [
      "Captain {rival_name} commanded the seas with an iron fist and a very loud mouth.",
      "The crew tolerated the scurvy, the damp hammocks, and the storms, but when the captain served porridge made with {animal} milk, they rebelled.",
      "The first mate drew a rusty {weapon}, bellowed '{pirate_curse}', and {ridiculous_verb} the captain straight off the plank into the Caribbean."
    ]
  },

  // 13: GAMING - The NPC That Woke Up
  {
    id: 's_gaming_1',
    title: 'When the Blacksmith Went Rogue',
    topic: 'Gaming',
    requiredPromptKeys: ['gamer_tag', 'useless_object', 'magic_spell', 'internet_phrase', 'ridiculous_verb'],
    paragraphs: [
      "Top-ranked speedrunner {gamer_tag} was attempting a world record in 'Kingdom of Pixels'.",
      "They approached the simple village blacksmith to buy arrows, but the NPC suddenly refused to trade, brandishing a {useless_object}.",
      "The rogue character muttered '{magic_spell}', whispered '{internet_phrase}', and {ridiculous_verb} out of the game map entirely."
    ]
  },

  // 14: AI / ROBOTS - The Smart Fridge Goes Rogue
  {
    id: 's_ai_1',
    title: 'The Smart Refrigerator Uprising',
    topic: 'AI',
    requiredPromptKeys: ['robot_glitch', 'food', 'wild_adjective', 'catchphrase', 'profession'],
    paragraphs: [
      "Homeowner Jordan purchased an ultra-smart AI appliance programmed to act like an energetic {profession}.",
      "By day three, the refrigerator began locking its doors and ordering 400 pounds of frozen {food} on overnight delivery.",
      "When Jordan tried to pull the power cord, the display flashed '{robot_glitch}' and in a {wild_adjective} robotic voice announced: '{catchphrase}'."
    ]
  },

  // 15: EVERYDAY LIFE - The Grocery Store Showdown
  {
    id: 's_life_1',
    title: 'Chaos in Aisle 4',
    topic: 'Everyday Life',
    requiredPromptKeys: ['person_name', 'smelly_food', 'fast_transport', 'catchphrase', 'wild_adjective'],
    paragraphs: [
      "Sunday afternoon at the local supermarket is normally peaceful, until {person_name} spotted the last carton of discount {smelly_food}.",
      "Spotting a rival shopper twenty yards away, {person_name} commandeered a {fast_transport} and drifted around the bakery display.",
      "Employees watched in {wild_adjective} awe as {person_name} seized the prize and echoed '{catchphrase}' through the intercom system."
    ]
  }
];

export function getRandomChaosEvent(): string {
  const events = [
    'double_points',
    'speed_round',
    'one_word_only',
    'jackpot',
    'reverse_story',
    'secret_bonus',
    'everyone_is_a_villain'
  ];
  return events[Math.floor(Math.random() * events.length)];
}
