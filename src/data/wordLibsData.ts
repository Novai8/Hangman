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
  { id: 'p1', key: 'person_name', promptText: "Name a funny friend or famous person.", inputType: 'name', placeholder: 'e.g. Grandma, Batman, Tom Cruise' },
  { id: 'p2', key: 'rival_name', promptText: "Name someone who would make a funny villain.", inputType: 'name', placeholder: 'e.g. Kevin from school' },
  { id: 'p3', key: 'celebrity', promptText: "Name a famous actor, singer, or celebrity.", inputType: 'character', placeholder: 'e.g. Gordon Ramsay, Taylor Swift' },
  { id: 'p4', key: 'fictional_character', promptText: "Name a cartoon or movie character.", inputType: 'character', placeholder: 'e.g. Darth Vader, SpongeBob' },
  { id: 'p5', key: 'historical_figure', promptText: "Name a famous person from history.", inputType: 'character', placeholder: 'e.g. Albert Einstein, Cleopatra' },
  { id: 'p6', key: 'villain_name', promptText: "Name a funny or silly bad guy.", inputType: 'name', placeholder: 'e.g. Dr. Clumsy, Captain Sneak' },
  { id: 'p7', key: 'alien_name', promptText: "Give a funny name for a friendly alien.", inputType: 'name', placeholder: 'e.g. Zog, Blorp, Beep-Boop' },
  { id: 'p8', key: 'teacher_name', promptText: "Name a funny teacher or school principal.", inputType: 'name', placeholder: 'e.g. Mr. Grumpy, Mrs. Apple' },
  { id: 'p9', key: 'influencer_name', promptText: "Name a funny internet star or video streamer.", inputType: 'name', placeholder: 'e.g. Speedy Dan, GamerCat' },
  { id: 'p10', key: 'boss_name', promptText: "Invent a funny boss or manager name.", inputType: 'name', placeholder: 'e.g. Bossy Brenda, Mr. Bigwig' },
  { id: 'p11', key: 'pet_name', promptText: "Give a cute or funny name for a pet.", inputType: 'name', placeholder: 'e.g. Sir Fluffy, Princess Paws' },
  { id: 'p12', key: 'detective_name', promptText: "Name a funny detective or secret agent.", inputType: 'name', placeholder: 'e.g. Inspector Clouseau, Agent Donut' },
  { id: 'p13', key: 'gamer_tag', promptText: "Invent a funny gamer username.", inputType: 'name', placeholder: 'e.g. Pro_Noob_99, PixelKing' },
  { id: 'p14', key: 'secret_agent', promptText: "Name a clumsy spy or secret agent.", inputType: 'name', placeholder: 'e.g. Agent Clumsy, Double-O-Oops' },
  { id: 'p15', key: 'wizard_name', promptText: "Name a funny or clumsy wizard.", inputType: 'character', placeholder: 'e.g. Gandalf the Silly, Merlin Junior' },

  // 16-30: Animals & Creatures
  { id: 'p16', key: 'animal', promptText: "Name a funny or unusual animal.", inputType: 'animal', placeholder: 'e.g. Screaming Goat, Penguin, Llama' },
  { id: 'p17', key: 'dangerous_pet', promptText: "Name an animal you would never want on an airplane.", inputType: 'animal', placeholder: 'e.g. Electric Eel, Grizzly Bear' },
  { id: 'p18', key: 'mythical_beast', promptText: "Name a mythical creature (like a dragon or unicorn).", inputType: 'animal', placeholder: 'e.g. Friendly Dragon, Tiny Goblin' },
  { id: 'p19', key: 'zoo_animal', promptText: "Name an animal you would see at a zoo.", inputType: 'animal', placeholder: 'e.g. Giraffe, Kangaroo, Chimpanzee' },
  { id: 'p20', key: 'insect', promptText: "Name a creepy or noisy bug (insect).", inputType: 'animal', placeholder: 'e.g. Giant Beetle, Flying Mosquito' },
  { id: 'p21', key: 'sea_creature', promptText: "Name an ocean animal or sea creature.", inputType: 'animal', placeholder: 'e.g. Giant Octopus, Clownfish, Shark' },
  { id: 'p22', key: 'swamp_beast', promptText: "Invent a silly swamp monster name.", inputType: 'animal', placeholder: 'e.g. Mud-Monster, Slime-Toad' },
  { id: 'p23', key: 'rideable_animal', promptText: "Name an animal that would be hilarious to ride.", inputType: 'animal', placeholder: 'e.g. Giant Turtle, Ostrich, Pig' },
  { id: 'p24', key: 'fast_animal', promptText: "Name an animal known for moving very slowly.", inputType: 'animal', placeholder: 'e.g. Sleepy Sloth, Garden Snail' },
  { id: 'p25', key: 'guard_animal', promptText: "Name a cute animal that would make a terrible guard.", inputType: 'animal', placeholder: 'e.g. Fluffy Bunny, Baby Hamster' },

  // 31-45: Foods & Beverages
  { id: 'p26', key: 'food', promptText: "Name your favorite funny or messy food.", inputType: 'food', placeholder: 'e.g. Giant Meatball, Spicy Taco' },
  { id: 'p27', key: 'disgusting_snack', promptText: "Name a weird or gross snack you dislike.", inputType: 'food', placeholder: 'e.g. Pickle ice cream, Onion donut' },
  { id: 'p28', key: 'pizza_topping', promptText: "Invent a crazy or silly pizza topping.", inputType: 'food', placeholder: 'e.g. Chocolate chips, Gummy bears' },
  { id: 'p29', key: 'beverage', promptText: "Name a drink that tastes bad when served warm.", inputType: 'food', placeholder: 'e.g. Carbonated soda, Milkshake' },
  { id: 'p30', key: 'dessert', promptText: "Name a sweet dessert, cake, or candy.", inputType: 'food', placeholder: 'e.g. Chocolate Lava Cake, Apple Pie' },
  { id: 'p31', key: 'cereal', promptText: "Invent a sugary morning breakfast cereal.", inputType: 'food', placeholder: 'e.g. Rainbow Marshmallow Crunch' },
  { id: 'p32', key: 'smelly_food', promptText: "Name a food that has a very strong smell.", inputType: 'food', placeholder: 'e.g. Garlic bread, Smoked fish' },
  { id: 'p33', key: 'fancy_dish', promptText: "Name a tiny, super expensive restaurant snack.", inputType: 'food', placeholder: 'e.g. Gold-leaf truffle, Caviar spoon' },
  { id: 'p34', key: 'fast_food', promptText: "Name a greasy fast-food order.", inputType: 'food', placeholder: 'e.g. Double cheeseburger, Loaded fries' },
  { id: 'p35', key: 'comfort_food', promptText: "Name a warm, cozy comfort food.", inputType: 'food', placeholder: 'e.g. Mac and cheese, Warm soup' },

  // 46-60: Professions & Careers
  { id: 'p36', key: 'profession', promptText: "Invent a silly dream job with high pay.", inputType: 'profession', placeholder: 'e.g. Ice Cream Taste Tester' },
  { id: 'p37', key: 'useless_job', promptText: "Invent a funny or very lazy job title.", inputType: 'profession', placeholder: 'e.g. Master Couch Tester' },
  { id: 'p38', key: 'medieval_job', promptText: "Name an old-fashioned medieval job.", inputType: 'profession', placeholder: 'e.g. Royal Jester, Castle Blacksmith' },
  { id: 'p39', key: 'space_job', promptText: "Invent a funny job aboard a spaceship.", inputType: 'profession', placeholder: 'e.g. Asteroid Sweeper, Space Chef' },
  { id: 'p40', key: 'night_job', promptText: "Invent a mysterious night-shift job title.", inputType: 'profession', placeholder: 'e.g. Midnight Snack Inspector' },
  { id: 'p41', key: 'circus_act', promptText: "Name a funny or daring circus act.", inputType: 'profession', placeholder: 'e.g. Flying Acrobat, Trapeze Clown' },
  { id: 'p42', key: 'tech_job', promptText: "Invent a funny computer or internet job title.", inputType: 'profession', placeholder: 'e.g. Chief Emoji Officer' },
  { id: 'p43', key: 'undercover_role', promptText: "Name the worst disguise for an undercover spy.", inputType: 'profession', placeholder: 'e.g. Giant Teddy Bear Mascot' },

  // 61-75: Objects, Gadgets & Inventions
  { id: 'p44', key: 'useless_object', promptText: "Name an object that is useless in an emergency.", inputType: 'object', placeholder: 'e.g. Eyelash curler, Selfie stick' },
  { id: 'p45', key: 'banned_item', promptText: "Name something you should never bring to a fancy party.", inputType: 'object', placeholder: 'e.g. Megaphone, Whoopee cushion' },
  { id: 'p46', key: 'office_item', promptText: "Name a common school or office item.", inputType: 'object', placeholder: 'e.g. Red stapler, Wooden ruler, Eraser' },
  { id: 'p47', key: 'weapon', promptText: "Name a harmless everyday object used as a tool.", inputType: 'object', placeholder: 'e.g. Wooden spatula, Feather duster' },
  { id: 'p48', key: 'invention', promptText: "Invent a silly gadget that nobody needs.", inputType: 'invention', placeholder: 'e.g. Automatic Sock Flipper' },
  { id: 'p49', key: 'pocket_item', promptText: "Name a random object you might find in a jacket pocket.", inputType: 'object', placeholder: 'e.g. Half-eaten candy bar, Shiny pebble' },
  { id: 'p50', key: 'magical_relic', promptText: "Invent a magical item with a silly power.", inputType: 'object', placeholder: 'e.g. Ring of Hiccups, Flying Teacup' },
  { id: 'p51', key: 'vehicle', promptText: "Name a funny or unusual vehicle.", inputType: 'object', placeholder: 'e.g. Rusty Unicycle, Electric Scooter' },
  { id: 'p52', key: 'bedroom_item', promptText: "Name an unexpected object to find under a bed.", inputType: 'object', placeholder: 'e.g. Single rubber boot, Harmonica' },
  { id: 'p53', key: 'holiday_gift', promptText: "Name a funny or disappointing birthday gift.", inputType: 'object', placeholder: 'e.g. Pack of brown socks, Fruitcake' },

  // 76-90: Places & Locations
  { id: 'p54', key: 'place', promptText: "Name a funny or awkward place to get stuck in.", inputType: 'place', placeholder: 'e.g. Crowded elevator, Revolving door' },
  { id: 'p55', key: 'vacation_spot', promptText: "Name the worst vacation spot you can imagine.", inputType: 'place', placeholder: 'e.g. Mosquito swamp, Active volcano' },
  { id: 'p56', key: 'secret_base', promptText: "Name a funny public place to hide a secret base.", inputType: 'place', placeholder: 'e.g. Behind the ice cream counter' },
  { id: 'p57', key: 'haunted_place', promptText: "Name a spooky place to visit at night.", inputType: 'place', placeholder: 'e.g. Dusty old attic, Empty warehouse' },
  { id: 'p58', key: 'planet', promptText: "Invent a funny name for an alien planet.", inputType: 'place', placeholder: 'e.g. Planet Zongo, Moon-Bloop' },
  { id: 'p59', key: 'room_in_house', promptText: "Name a room in a house.", inputType: 'place', placeholder: 'e.g. Kitchen pantry, Basement, Garage' },
  { id: 'p60', key: 'public_place', promptText: "Name a place where people must stay very quiet.", inputType: 'place', placeholder: 'e.g. Public library, Movie theater' },

  // 91-105: Superpowers, Excuses, Secrets, Catchphrases, Verbs & Adjectives
  { id: 'p61', key: 'superpower', promptText: "Invent a silly or completely useless superpower.", inputType: 'superpower', placeholder: 'e.g. Making soup lukewarm, Talking to sponges' },
  { id: 'p62', key: 'villain_power', promptText: "Invent a funny superpower that is slightly annoying.", inputType: 'superpower', placeholder: 'e.g. Untying shoelaces from across the room' },
  { id: 'p63', key: 'terrible_excuse', promptText: "Invent a funny excuse for arriving late to school or work.", inputType: 'excuse', placeholder: 'e.g. A polite cat blocked my front door' },
  { id: 'p64', key: 'dark_secret', promptText: "Share a harmless, funny little secret or silly habit.", inputType: 'secret', placeholder: 'e.g. I secretly dance when making toast' },
  { id: 'p65', key: 'catchphrase', promptText: "Invent a funny hero catchphrase or victory yell.", inputType: 'catchphrase', placeholder: 'e.g. READY OR NOT, HERE I GO!' },
  { id: 'p66', key: 'sound_effect', promptText: "Write a funny cartoon sound effect (like BONK or BOING).", inputType: 'sound', placeholder: 'e.g. KER-PLOP, SPLAT, WHOOSH' },
  { id: 'p67', key: 'ridiculous_verb', promptText: "Enter a past-tense action word (like ran, jumped, danced).", inputType: 'verb', placeholder: 'e.g. catapulted, sprinted, blasted' },
  { id: 'p68', key: 'gross_verb', promptText: "Enter a silly past-tense movement word (like slipped, slid).", inputType: 'verb', placeholder: 'e.g. wobbled, skidded, tripped' },
  { id: 'p69', key: 'wild_adjective', promptText: "Enter a word that describes someone acting wild or energetic.", inputType: 'adjective', placeholder: 'e.g. dizzy, hyper, wild, silly' },
  { id: 'p70', key: 'smelly_adjective', promptText: "Enter a word describing a funny smell.", inputType: 'adjective', placeholder: 'e.g. smelly, funky, sour, stinky' },
  { id: 'p71', key: 'fancy_adjective', promptText: "Enter a fancy describing word.", inputType: 'adjective', placeholder: 'e.g. royal, grand, magnificent, fancy' },
  { id: 'p72', key: 'internet_phrase', promptText: "Enter a popular internet phrase or funny slang word.", inputType: 'internet_phrase', placeholder: 'e.g. Big W, Let him cook, Epic fail' },
  { id: 'p73', key: 'suspicious_number', promptText: "Enter a funny high number.", inputType: 'number', placeholder: 'e.g. 5,000, 999,999' },
  { id: 'p74', key: 'fake_brand', promptText: "Invent a funny name for a discount store brand.", inputType: 'brand', placeholder: 'e.g. SuperSaver Plus, DollarZone' },
  { id: 'p75', key: 'alien_misunderstanding', promptText: "Name something humans do that would confuse an alien.", inputType: 'secret', placeholder: 'e.g. Why we collect decorative pillows' },

  // 106-125: Specialized & Chaos Prompts
  { id: 'p76', key: 'pirate_curse', promptText: "Invent a funny pirate cheer or exclamation.", inputType: 'catchphrase', placeholder: 'e.g. Ahoy there, you sea biscuit!' },
  { id: 'p77', key: 'school_subject', promptText: "Invent a funny new class taught in school.", inputType: 'profession', placeholder: 'e.g. Advanced Nap Taking 101' },
  { id: 'p78', key: 'robot_glitch', promptText: "Write a funny robot error message.", inputType: 'catchphrase', placeholder: 'e.g. ERROR: TOASTER OVERHEAT!' },
  { id: 'p79', key: 'dating_red_flag', promptText: "Name a funny mistake to make on a dinner date.", inputType: 'secret', placeholder: 'e.g. Bringing a stopwatch to dinner' },
  { id: 'p80', key: 'magic_spell', promptText: "Invent a magic spell phrase to make snacks appear.", inputType: 'catchphrase', placeholder: 'e.g. ABRA-CA-PIZZA!' },
  { id: 'p81', key: 'chaotic_noun', promptText: "Name something that does NOT belong in a kitchen blender.", inputType: 'random_object', placeholder: 'e.g. A smartphone, Tennis ball' },
  { id: 'p82', key: 'airport_trouble', promptText: "Name a funny item that would set off airport security.", inputType: 'object', placeholder: 'e.g. A giant jar of salsa' },
  { id: 'p83', key: 'superhero_gadget', promptText: "Invent a silly or useless superhero gadget.", inputType: 'invention', placeholder: 'e.g. The Boomerang Kazoo' },
  { id: 'p84', key: 'terrible_hobby', promptText: "Name a super boring weekend hobby.", inputType: 'profession', placeholder: 'e.g. Watching grass grow' },
  { id: 'p85', key: 'dramatic_exclamation', promptText: "Enter a funny dramatic shout (like NO WAY! or OH NO!).", inputType: 'catchphrase', placeholder: 'e.g. OH DEAR!, CURSES!, YIKES!' },
  { id: 'p86', key: 'fast_transport', promptText: "Name a funny way to ride through a shopping mall.", inputType: 'object', placeholder: 'e.g. Runaway shopping cart, Roller skates' },
  { id: 'p87', key: 'emergency_item', promptText: "Name a funny item you would grab in a hurry.", inputType: 'object', placeholder: 'e.g. Lucky rubber duck, Fluffy slippers' },
  { id: 'p88', key: 'cooking_mistake', promptText: "Name an ingredient you might accidentally mix up while baking.", inputType: 'food', placeholder: 'e.g. Salt instead of sugar' },
  { id: 'p89', key: 'doctor_diagnosis', promptText: "Invent a funny fake illness caused by staring at phone screens.", inputType: 'secret', placeholder: 'e.g. Tired Thumb Syndrome' },
  { id: 'p90', key: 'party_foul', promptText: "Name a funny accident that disrupts a quiet party.", inputType: 'secret', placeholder: 'e.g. Spilling juice on the birthday cake' },
  { id: 'p91', key: 'gym_fail', promptText: "Invent a funny name for an exercise machine.", inputType: 'invention', placeholder: 'e.g. The Super Leg Squatter 3000' },
  { id: 'p92', key: 'unhinged_animal_sound', promptText: "What funny sound does an angry bird make?", inputType: 'sound', placeholder: 'e.g. SQUAWK-CHIRP, HONK!' },
  { id: 'p93', key: 'weird_phobia', promptText: "Invent a silly fear of something harmless.", inputType: 'secret', placeholder: 'e.g. Fear of mismatched socks' },
  { id: 'p94', key: 'bad_gift', promptText: "Name a funny, bad present to receive on a holiday.", inputType: 'object', placeholder: 'e.g. A bag of plain gravel' },
  { id: 'p95', key: 'royal_decree', promptText: "Invent a silly royal law that everyone must obey.", inputType: 'catchphrase', placeholder: 'e.g. ALL DOUGHNUTS ARE NOW FREE!' },
  { id: 'p96', key: 'clumsy_action', promptText: "Enter a past-tense word for tripping or falling.", inputType: 'verb', placeholder: 'e.g. stumbled, tripped, slipped' },
  { id: 'p97', key: 'conspiracy_theory', promptText: "Invent a silly mystery about neighborhood animals.", inputType: 'secret', placeholder: 'e.g. Squirrels run the internet cables' },
  { id: 'p98', key: 'villain_hideout', promptText: "Name a normal shop that secretly hides a villain.", inputType: 'place', placeholder: 'e.g. The local mattress shop' },
  { id: 'p99', key: 'embarrassing_song', promptText: "Name a catchy pop song you love singing aloud.", inputType: 'catchphrase', placeholder: 'e.g. Baby Shark, Dancing Queen' },
  { id: 'p100', key: 'chaos_finale', promptText: "Enter one word for pure wild fun.", inputType: 'adjective', placeholder: 'e.g. CHAOS, PARTY, AWESOME' }
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
