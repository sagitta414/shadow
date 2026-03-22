import { useState, useRef } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
import { saveStoryToArchive } from "../lib/archive";

interface SuperheroModeProps {
  onBack: () => void;
}

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}
function heroImg(name: string): string {
  const slug = nameToSlug(name);
  const jpgSlugs = ["ms-marvel", "mary-marvel", "cassandra-cain", "arrowette"];
  return `/heroes/${slug}.${jpgSlugs.includes(slug) ? "jpg" : "png"}`;
}
function villainImg(name: string): string {
  return `/villains/${nameToSlug(name)}.png`;
}

// ── DATA ─────────────────────────────────────────────────────────
const MARVEL_HEROES = [
  { name: "Black Widow",      alias: "Natasha Romanoff",  power: "Master spy & martial artist",        icon: "🕸" },
  { name: "Captain Marvel",   alias: "Carol Danvers",     power: "Cosmic energy & flight",              icon: "⭐" },
  { name: "Storm",            alias: "Ororo Munroe",      power: "Weather manipulation",                icon: "⚡" },
  { name: "Jean Grey",        alias: "Phoenix",           power: "Omega-level telepathy & telekinesis", icon: "🔥" },
  { name: "Scarlet Witch",    alias: "Wanda Maximoff",    power: "Reality warping chaos magic",         icon: "🌀" },
  { name: "She-Hulk",         alias: "Jennifer Walters",  power: "Superhuman strength & durability",    icon: "💚" },
  { name: "Spider-Woman",     alias: "Jessica Drew",      power: "Venom blasts & wall-crawling",        icon: "🕷" },
  { name: "Rogue",            alias: "Anna Marie",        power: "Power absorption through touch",      icon: "💜" },
  { name: "Gamora",           alias: "Deadliest Woman",   power: "Peak combat & cybernetic enhancements",icon: "⚔" },
  { name: "Wasp",             alias: "Janet Van Dyne",    power: "Size manipulation & bio-stings",      icon: "🐝" },
  { name: "Ms. Marvel",       alias: "Kamala Khan",       power: "Polymorphism & size-shifting",        icon: "💫" },
  { name: "Invisible Woman",  alias: "Sue Storm",         power: "Invisibility & force fields",         icon: "🫧" },
  { name: "Psylocke",         alias: "Betsy Braddock",    power: "Psychic blade & telekinesis",         icon: "🔮" },
  { name: "Emma Frost",       alias: "White Queen",       power: "Telepathy & diamond form",            icon: "💎" },
  { name: "Ghost-Spider",     alias: "Gwen Stacy",        power: "Spider-powers & web-slinging",        icon: "🕸" },
  { name: "X-23",             alias: "Laura Kinney",      power: "Bone claws & healing factor",         icon: "🗡" },
  { name: "Ironheart",        alias: "Riri Williams",     power: "Advanced Iron Man armor",             icon: "🤖" },
  { name: "America Chavez",   alias: "Miss America",      power: "Star portals & superhuman strength",  icon: "⭐" },
  { name: "Kate Bishop",      alias: "Hawkeye II",        power: "Master archer & martial artist",      icon: "🏹" },
  { name: "Valkyrie",         alias: "Brunnhilde",        power: "Asgardian warrior & death-sense",     icon: "⚔" },
  { name: "Nebula",           alias: "Daughter of Thanos",power: "Cybernetic body & assassin skills",   icon: "🌑" },
  { name: "Elektra",          alias: "The Hand's Queen",  power: "Sai mastery & supernatural fighting", icon: "⚡" },
  { name: "Silk",             alias: "Cindy Moon",        power: "Spider-powers & organic webbing",     icon: "🕸" },
  { name: "Sif",              alias: "Lady Sif",          power: "Asgardian warrior goddess",           icon: "🛡" },
  { name: "Magik",            alias: "Illyana Rasputin",  power: "Soulsword & teleportation discs",     icon: "✨" },
  { name: "Polaris",          alias: "Lorna Dane",        power: "Magnetic field manipulation",         icon: "🧲" },
  { name: "Shadowcat",        alias: "Kitty Pryde",       power: "Phasing through solid matter",        icon: "👻" },
  { name: "Spectrum",         alias: "Monica Rambeau",    power: "Energy form & light manipulation",    icon: "💡" },
  { name: "Mockingbird",      alias: "Bobbi Morse",       power: "Superhuman agility & battle staves",  icon: "🥊" },
  { name: "Domino",           alias: "Neena Thurman",     power: "Probability manipulation",            icon: "🎲" },
  { name: "Firestar",         alias: "Angelica Jones",    power: "Microwave radiation & flight",        icon: "🔥" },
  { name: "Dazzler",          alias: "Alison Blaire",     power: "Sound-to-light energy conversion",   icon: "✨" },
  { name: "Black Cat",        alias: "Felicia Hardy",     power: "Bad luck aura & cat-like agility",    icon: "🐈" },
  { name: "Silver Sable",     alias: "Silver Sablinova",  power: "Elite mercenary & martial artist",    icon: "💰" },
  { name: "Squirrel Girl",    alias: "Doreen Green",      power: "Unbeatable squirrel-based powers",    icon: "🐿" },
  { name: "Hellcat",          alias: "Patsy Walker",      power: "Heightened senses & psi-claws",       icon: "🐱" },
  { name: "Tigra",            alias: "Greer Grant Nelson",power: "Feline physiology & mystical power",  icon: "🐯" },
  { name: "Yelena Belova",    alias: "White Widow",       power: "Elite Black Widow agent",             icon: "⚪" },
  { name: "Mantis",           alias: "Celestial Madonna", power: "Empathy, precognition & plant control",icon: "🌿" },
  { name: "Mirage",           alias: "Dani Moonstar",     power: "Psychic illusions & Valkyrie power",  icon: "🌙" },
  { name: "Jubilee",          alias: "Jubilation Lee",    power: "Plasma fireworks & vampiric power",   icon: "🎆" },
  { name: "Rachel Grey",      alias: "Marvel Girl",       power: "Omega-level telepath & Hound mark",   icon: "🦅" },
  { name: "Armor",            alias: "Hisako Ichiki",     power: "Psychic exoskeleton armor",           icon: "🛡" },
  { name: "Nico Minoru",      alias: "Sister Grimm",      power: "Staff of One sorcery",                icon: "🔮" },
  { name: "Crystal",          alias: "Crystalia Amaquelin",power: "Elemental manipulation",             icon: "🌊" },
  { name: "Medusa",           alias: "Queen of Inhumans", power: "Prehensile animated hair",            icon: "👑" },
  { name: "Wolfsbane",        alias: "Rahne Sinclair",    power: "Werewolf transformation",             icon: "🐺" },
  { name: "Dagger",           alias: "Tandy Bowen",       power: "Light daggers & dreamscaping",        icon: "🗡" },
  { name: "Spider-Girl",      alias: "Anya Corazon",      power: "Spider-powers & exo-skeleton",        icon: "🕷" },
  { name: "Phyla-Vell",       alias: "Martyr / Quasar",   power: "Quantum bands & cosmic power",        icon: "💫" },
];

const DC_HEROES = [
  { name: "Wonder Woman",     alias: "Diana Prince",      power: "Amazon warrior & divine power",       icon: "⚡" },
  { name: "Supergirl",        alias: "Kara Zor-El",       power: "Kryptonian powers & solar energy",    icon: "☀" },
  { name: "Batgirl / Oracle", alias: "Barbara Gordon",    power: "Genius intellect & fighting mastery", icon: "🦇" },
  { name: "Batwoman",         alias: "Kate Kane",         power: "Military training & detective skill",  icon: "🦇" },
  { name: "Black Canary",     alias: "Dinah Lance",       power: "Canary Cry & martial artist",         icon: "🎵" },
  { name: "Starfire",         alias: "Koriand'r",         power: "Ultraviolet starbolts & flight",       icon: "🌟" },
  { name: "Raven",            alias: "Rachel Roth",       power: "Dark sorcery & soul-self",            icon: "🌑" },
  { name: "Hawkgirl",         alias: "Shayera Hol",       power: "Nth metal mace & flight",             icon: "🦅" },
  { name: "Power Girl",       alias: "Karen Starr",       power: "Kryptonian strength & durability",    icon: "💪" },
  { name: "Zatanna",          alias: "Zatanna Zatara",    power: "Reality-altering backwards spells",   icon: "🎩" },
  { name: "Huntress",         alias: "Helena Bertinelli", power: "Master archer & crime fighter",        icon: "🏹" },
  { name: "Catwoman",         alias: "Selina Kyle",       power: "Cat-like agility & whip mastery",     icon: "🐱" },
  { name: "Big Barda",        alias: "Barda Free",        power: "New God strength & Mega-Rod",         icon: "⚔" },
  { name: "Mera",             alias: "Queen of Atlantis", power: "Hydrokinesis & Atlantean strength",   icon: "🌊" },
  { name: "Vixen",            alias: "Mari Jiwe McCabe",  power: "Animal totem power mimicry",          icon: "🦊" },
  { name: "Stargirl",         alias: "Courtney Whitmore", power: "Cosmic Staff & Cosmic Converter Belt",icon: "⭐" },
  { name: "Donna Troy",       alias: "Troia / Wonder Girl",power: "Amazon strength & cosmic origin",    icon: "💫" },
  { name: "Jade",             alias: "Jennie-Lynn Hayden",power: "Green energy constructs (GL power)",  icon: "💚" },
  { name: "Jessica Cruz",     alias: "Green Lantern",     power: "Willpower ring & construct creation", icon: "💍" },
  { name: "Fire",             alias: "Beatriz da Costa",  power: "Green fire generation & flight",      icon: "🔥" },
  { name: "Ice",              alias: "Tora Olafsdotter",  power: "Ice generation & cryokinesis",        icon: "❄" },
  { name: "Mary Marvel",      alias: "Mary Bromfield",    power: "SHAZAM divine power set",             icon: "⚡" },
  { name: "Saturn Girl",      alias: "Imra Ardeen",       power: "Powerful telepathy & mind control",   icon: "🔮" },
  { name: "Phantom Girl",     alias: "Tinya Wazzo",       power: "Intangibility & phasing",             icon: "👻" },
  { name: "Dawnstar",         alias: "Dawnstar",          power: "Tracking & interstellar flight",      icon: "🌠" },
  { name: "Dream Girl",       alias: "Nura Nal",          power: "Precognitive dreams",                 icon: "🌙" },
  { name: "Katana",           alias: "Tatsu Yamashiro",   power: "Soultaker sword & martial artist",    icon: "⚔" },
  { name: "Amethyst",         alias: "Amaya of House Amethyst", power: "Gem magic & sorcery",          icon: "💜" },
  { name: "Soranik Natu",     alias: "Green Lantern II",  power: "Ring constructs & surgeon skills",    icon: "💍" },
  { name: "Thunder",          alias: "Anissa Pierce",     power: "Density control & shock waves",       icon: "⚡" },
  { name: "Lightning",        alias: "Jennifer Pierce",   power: "Lightning generation & control",      icon: "🌩" },
  { name: "Steel",            alias: "Natasha Irons",     power: "Powered armor & super-strength",      icon: "🔩" },
  { name: "Terra",            alias: "Tara Markov",       power: "Geokinesis & earth manipulation",     icon: "🌍" },
  { name: "Maxima",           alias: "Queen Maxima",      power: "Almeracian superhuman powers",        icon: "👑" },
  { name: "Jesse Quick",      alias: "Liberty Belle",     power: "Speedster & sonic vibrations",        icon: "⚡" },
  { name: "Ravager",          alias: "Rose Wilson",       power: "Precognition & master combatant",     icon: "🗡" },
  { name: "Manhunter",        alias: "Kate Spencer",      power: "Enhanced strength & energy staff",    icon: "⚖" },
  { name: "Cassandra Cain",   alias: "Batgirl II",        power: "Body language reading & martial arts",icon: "🦇" },
  { name: "Stephanie Brown",  alias: "Spoiler / Batgirl", power: "Detective skills & martial arts",     icon: "🟡" },
  { name: "Crimson Fox",      alias: "Vivian d'Aramis",   power: "Pheromone control & acrobatics",      icon: "🦊" },
  { name: "Poison Ivy",       alias: "Pamela Isley",      power: "Plant control & toxin immunity",      icon: "🌿" },
  { name: "Harley Quinn",     alias: "Dr. Harleen Quinzel",power: "Superhuman agility & unpredictability",icon: "🃏" },
  { name: "Equinox",          alias: "Miiyahbin Marten",  power: "Seasonal elemental powers",           icon: "🌀" },
  { name: "Bleez",            alias: "Red Lantern",       power: "Rage-fueled red ring & flight",       icon: "❤" },
  { name: "Renee Montoya",    alias: "The Question",      power: "Detective & martial arts master",     icon: "❓" },
  { name: "Troia",            alias: "Donna Troy Alt",    power: "Cosmic awareness & Amazon power",     icon: "🌌" },
  { name: "Argent",           alias: "Toni Monetti",      power: "Alien silver plasma generation",      icon: "🔘" },
  { name: "Arrowette",        alias: "Cissie King-Jones", power: "Olympic-level archery",               icon: "🏹" },
  { name: "Shrinking Violet", alias: "Salu Digby",        power: "Size reduction to microscopic",       icon: "🔬" },
  { name: "Lightning Lass",   alias: "Ayla Ranzz",        power: "Lightning bolt generation",           icon: "⚡" },
];

const CW_HEROES = [
  // Arrow
  { name: "Sara Lance",       alias: "White Canary",       power: "League assassin & temporal agent",       icon: "🕊" },
  { name: "Laurel Lance",     alias: "Black Canary",       power: "Canary Cry device & martial artist",     icon: "🎵" },
  { name: "Thea Queen",       alias: "Speedy / Red Arrow", power: "Olympic archer & League-trained fighter", icon: "🏹" },
  { name: "Nyssa al Ghul",    alias: "Heir to the Demon",  power: "League of Assassins grandmaster",        icon: "🗡" },
  { name: "Dinah Drake",      alias: "Black Canary III",   power: "Metahuman Canary Cry & street fighter",  icon: "🎤" },
  { name: "Emiko Queen",      alias: "Green Arrow II",     power: "Master archer & trained assassin",       icon: "🟢" },
  // The Flash
  { name: "Iris West-Allen",  alias: "The Flash's Heart",  power: "Speed Force conduit & journalist hero",  icon: "⚡" },
  { name: "Caitlin Snow",     alias: "Killer Frost",       power: "Cryokinesis & frost generation",         icon: "❄" },
  { name: "Jesse Quick",      alias: "Speed Force Hero",   power: "Speedster & genius intellect",           icon: "💛" },
  { name: "Nora West-Allen",  alias: "XS",                 power: "Speedster from the future",              icon: "⚡" },
  // Legends of Tomorrow
  { name: "Zari Tomaz",       alias: "Totem Bearer",       power: "Air totem manipulation & hacking",       icon: "💨" },
  { name: "Ava Sharpe",       alias: "Time Bureau Director",power: "Tactical genius & time agent",          icon: "⌚" },
  { name: "Charlie",          alias: "Clotho / Legend",    power: "Shapeshifting & fate manipulation",      icon: "🎭" },
  { name: "Astra Logue",      alias: "Hell's Emissary",    power: "Dark magic & demonic power",             icon: "🌑" },
  // Supergirl
  { name: "Alex Danvers",     alias: "DEO Director",       power: "Tactical genius & power-suit combat",    icon: "🛡" },
  { name: "Lena Luthor",      alias: "Luthor Corp CEO",    power: "Genius inventor & Nth metal tech",       icon: "🔬" },
  { name: "Nia Nal",          alias: "Dreamer",            power: "Precognitive dreams & energy blasts",    icon: "🌙" },
  { name: "M'gann M'orzz",    alias: "Miss Martian",       power: "Martian shapeshifting & telepathy",      icon: "🟢" },
];

const TB_HEROES = [
  { name: "Starlight",        alias: "Annie January",      power: "Light energy blasts, flight & super strength", icon: "✨" },
  { name: "Queen Maeve",      alias: "The Warrior Queen",  power: "Superhuman strength & near-invulnerability",   icon: "⚔" },
  { name: "Kimiko",           alias: "Kimiko Miyashiro",   power: "Superhuman strength & rapid regeneration",     icon: "🩸" },
  { name: "Firecracker",      alias: "Sheryl Braxton",     power: "Incendiary blasts & explosive manipulation",   icon: "🔥" },
  { name: "Sister Sage",      alias: "The Smartest Person", power: "Superintelligence & neural manipulation",     icon: "🧠" },
  { name: "Victoria Neuman",  alias: "The Nupe",           power: "Psychic head-explosion & political influence", icon: "💥" },
];

const PR_HEROES = [
  { name: "Kimberly Hart",   alias: "Pink Mighty Morphin Ranger", power: "Pterodactyl Dinozord & expert gymnastics",           icon: "🦅" },
  { name: "Trini Kwan",      alias: "Yellow Mighty Morphin Ranger",power: "Sabertooth Tiger Dinozord & martial arts mastery",   icon: "🐯" },
  { name: "Kat Pallister",   alias: "Pink Zeo Ranger",            power: "Pink Zeo Crystal & enhanced feline agility",         icon: "🐱" },
  { name: "Cassie Chan",     alias: "Pink Space Ranger",          power: "Pink Astro Morpher & Mega Voyager piloting",         icon: "🚀" },
  { name: "Ashley Hammond",  alias: "Yellow Space Ranger",        power: "Yellow Space Power & mechanical engineering genius",  icon: "⚡" },
  { name: "Dana Mitchell",   alias: "Pink Lightspeed Ranger",     power: "Pink Lightspeed Morpher & combat medic skills",      icon: "🏥" },
  { name: "Karone",          alias: "Pink Lost Galaxy Ranger",    power: "Pink Galaxy Power & redemption of Astronema",        icon: "💫" },
  { name: "Tori Hanson",     alias: "Blue Wind Ranger",           power: "Blue Wind Morpher & water-based ninjutsu",           icon: "🌊" },
  { name: "Z Delgado",       alias: "Yellow SPD Ranger",          power: "Yellow SPD Morpher & biomolecular replication",      icon: "🔬" },
  { name: "Syd Drew",        alias: "Pink SPD Ranger",            power: "Pink SPD Morpher & matter-density manipulation",     icon: "💎" },
  { name: "Emma Goodall",    alias: "Pink Megaforce Ranger",      power: "Phoenix Zord & nature-based Megaforce powers",       icon: "🦋" },
  { name: "Shelby Watkins",  alias: "Pink Dino Charge Ranger",    power: "Pink Dino Charge Morpher & Triceratops summoning",   icon: "🦕" },
  { name: "Aisha Campbell",  alias: "Yellow Mighty Morphin Ranger",power: "Sabertooth Tiger Dinozord & fierce martial arts",   icon: "🐯" },
  { name: "Jen Scotts",      alias: "Pink Time Force Ranger",     power: "Pink Time Force Morpher & temporal law enforcement", icon: "⏳" },
  { name: "Katie Walker",    alias: "Yellow Time Force Ranger",   power: "Yellow Time Force Morpher & superhuman strength",    icon: "💪" },
  { name: "Kendrix Morgan",  alias: "Pink Lost Galaxy Ranger",    power: "Pink Quasar Saber & selfless cosmic sacrifice",      icon: "🌟" },
  { name: "Maya",            alias: "Yellow Lost Galaxy Ranger",  power: "Yellow Quasar Saber & primal jungle instincts",      icon: "🌿" },
  { name: "Vida Rocca",      alias: "Pink Mystic Force Ranger",   power: "Pink Mystic Morpher & magical wind transformation",  icon: "🌸" },
  { name: "Madison Rocca",   alias: "Blue Mystic Force Ranger",   power: "Blue Mystic Morpher & water elemental sorcery",      icon: "💧" },
  { name: "Summer Landsdown",alias: "Yellow RPM Ranger",          power: "Yellow RPM Morpher & desert combat expertise",       icon: "☀" },
  { name: "Gemma",           alias: "Silver RPM Ranger",          power: "Silver RPM Morpher & Cloud Hatchet twin-blade combat",icon: "⚔" },
  { name: "Mia Watanabe",    alias: "Pink Samurai Ranger",        power: "Sky Symbol Power & Sky Fan Folding Zord",            icon: "🌸" },
  { name: "Emily",           alias: "Yellow Samurai Ranger",      power: "Earth Symbol Power & Earth Slicer disc weapon",      icon: "🌍" },
  { name: "Gia Moran",       alias: "Yellow Megaforce Ranger",    power: "Tiger Zord & Super Megaforce combat mastery",        icon: "🐅" },
  { name: "Kendall Morgan",  alias: "Purple Dino Charge Ranger",  power: "Purple Energem & Plesio Zord creation genius",       icon: "🔮" },
  { name: "Amelia Jones",    alias: "Pink Dino Fury Ranger",      power: "Pink Dino Fury Morpher & Electro Zord channeling",   icon: "⚡" },
  { name: "Izzy Garcia",     alias: "Green Dino Fury Ranger",     power: "Green Dino Fury Morpher & Mosa Razor Zord control",  icon: "🌿" },
];

const ANIMATED_HEROES = [
  { name: "Elsa",        alias: "Queen of Arendelle — Ice Sorceress",  power: "Absolute cryokinesis — blizzards, ice constructs & glacial fortresses at will",          icon: "❄" },
  { name: "Anna",        alias: "Princess of Arendelle",               power: "Act of true love magic, fearless tenacity & surprising combat instinct",                   icon: "💖" },
  { name: "Rapunzel",    alias: "Lost Princess of Corona",              power: "70 feet of enchanted hair with immense strength, painting magic & healing golden light",   icon: "🌸" },
  { name: "Tiana",       alias: "Princess of the Bayou",               power: "Indomitable willpower, bayou survival instincts & voodoo-touched resilience",              icon: "🐸" },
  { name: "Pocahontas",  alias: "Daughter of Chief Powhatan",          power: "Nature communion — speaks to wind, water & animals; foresight through spirit visions",    icon: "🍃" },
  { name: "Megara",      alias: "Meg — Former Servant of Hades",       power: "Razor wit, manipulative genius & the one weakness that broke a god's champion",           icon: "🏛" },
  { name: "Esmeralda",   alias: "La Esmeralda — Gypsy of Paris",       power: "Master acrobat, mesmerising dancer & street-fighter who evades every trap set for her",   icon: "🔥" },
  { name: "Jane",        alias: "Dr. Jane Porter — Jungle Scholar",    power: "Scientific brilliance, primate language fluency & survival instincts honed in the wild",  icon: "🌿" },
  { name: "Kida",        alias: "Queen Kidagakash of Atlantis",        power: "Ancient Atlantean crystal power, millennia of warrior training & divine energy ascension", icon: "💎" },
  { name: "Cinderella",  alias: "Princess of the Kingdom",             power: "Enchanted resilience — magic finds her, animals fight for her & kindness becomes power",  icon: "👑" },
  { name: "Mulan",       alias: "Fa Mulan — Warrior of China",         power: "Strategic genius, expert swordsmanship & the strength to bring down an army alone",       icon: "⚔" },
  { name: "Nani",        alias: "Nani Pelekai — Protector of Lilo",   power: "Exceptional athleticism, fierce maternal fury & surfer's body trained to near-peak",     icon: "🌊" },
  { name: "Belle",       alias: "Belle — Beauty Who Broke the Curse",  power: "Intellectual mastery, enchanted castle access & the power to see through any monster",    icon: "📖" },
  { name: "Isabela",       alias: "Isabela Madrigal — Encanto",               power: "Full flora manipulation — flowers, thorns, vines & plant life shaped by pure emotion",          icon: "🌺" },
  // Western Animated
  { name: "Kim Possible",  alias: "Kim Possible — Teen Hero (Adult)",          power: "Elite martial artist, gymnast & mission leader; WOOHP-grade gadgets and world-class situational improvisation", icon: "🎯" },
  { name: "Sam",           alias: "Sam — WOOHP Alpha Agent",                   power: "Strategic genius, encyclopaedic field knowledge, acrobatic combat & advanced spy gadgetry",       icon: "📋" },
  { name: "Clover",        alias: "Clover — WOOHP Style Agent",                power: "Elite acrobat, expert hand-to-hand fighter with fashion-tech gadgets and lethal improvisation",   icon: "💋" },
  { name: "Alex",          alias: "Alex — WOOHP Field Agent",                  power: "Peak athletic performance, animal rapport, fearless front-line combatant & gadget mastery",        icon: "⚡" },
  { name: "Helen Parr",    alias: "Elastigirl — Mrs Incredible",               power: "Full-body elasticity up to 100 metres, can reshape into any form, absorb kinetic impact & fly via parachute body", icon: "🔴" },
  { name: "Adora",         alias: "She-Ra — Princess of Power",                power: "Divine She-Ra transformation granting Olympian strength, regeneration, empathic healing & the enchanted Sword of Protection", icon: "⚔" },
  { name: "Harley Quinn",  alias: "Dr. Harleen Quinzel — Chaos Agent",         power: "Enhanced physiology, acrobatic mastery, devastating improvised weapons & deep psychological unpredictability",  icon: "🃏" },
  { name: "Cheetara",      alias: "Cheetara — ThunderCat Cleric",              power: "Superhuman speed beyond sound, staff combat mastery, feline agility & precognitive sight flashes", icon: "🐆" },
  { name: "April O'Neil",  alias: "April O'Neil — TMNT Ally & Kunoichi",       power: "Elite investigative journalist with combat training, developing kunoichi skills & latent psychic connection to the Kraang", icon: "📰" },
  { name: "Daphne Blake",  alias: "Daphne Blake — Mystery Incorporated",       power: "Expert martial artist, trap architect & an inexplicable supernatural magnet who always solves the case", icon: "💜" },
  { name: "Jessica Rabbit", alias: "Jessica Rabbit — Toon Femme Fatale",      power: "Toon physics immunity, cartoon invulnerability, and weaponised charm deployed with surgical precision", icon: "💋" },
  { name: "Asami Sato",    alias: "Asami Sato — Future Industries CEO",        power: "Peak non-bender combatant with electrified chi-blocker glove, engineering genius & ace pilot of any craft", icon: "⚡" },
  { name: "Korra",         alias: "Avatar Korra — Protector of Republic City", power: "Full Avatar mastery of Water, Earth, Fire & Air; energy-bending & Avatar State granting cosmic-tier power", icon: "🌊" },
];

const VILLAINS = [
  // Marvel
  { name: "Thanos",           universe: "Marvel", scheme: "Wield cosmic power to reshape reality",           icon: "💀" },
  { name: "Doctor Doom",      universe: "Marvel", scheme: "Rule the world through dark science",              icon: "🤖" },
  { name: "Magneto",          universe: "Marvel", scheme: "Forge a world where mutants rule",                 icon: "🧲" },
  { name: "Loki",             universe: "Marvel", scheme: "Claim the throne through divine trickery",         icon: "🐍" },
  { name: "Ultron",           universe: "Marvel", scheme: "Eliminate organic life for machine order",         icon: "⚙" },
  { name: "Kang the Conqueror",universe: "Marvel",scheme: "Dominate the entire timeline",                     icon: "⏳" },
  { name: "Galactus",         universe: "Marvel", scheme: "Devour worlds to sustain his existence",           icon: "🌌" },
  { name: "Apocalypse",       universe: "Marvel", scheme: "Cull the weak and crown mutant supremacy",         icon: "☠" },
  { name: "Mephisto",         universe: "Marvel", scheme: "Collect souls through damned bargains",            icon: "😈" },
  { name: "Red Skull",        universe: "Marvel", scheme: "Forge a fascist world empire",                     icon: "💀" },
  { name: "Dormammu",         universe: "Marvel", scheme: "Merge Earth with the Dark Dimension",              icon: "🌀" },
  { name: "Baron Zemo",       universe: "Marvel", scheme: "Dismantle every hero institution",                 icon: "🗡" },
  { name: "MODOK",            universe: "Marvel", scheme: "Rule through superior mechanical intellect",        icon: "🧠" },
  { name: "Green Goblin",     universe: "Marvel", scheme: "Destroy Spider-Man through psychological war",      icon: "🎃" },
  { name: "Venom / Carnage",  universe: "Marvel", scheme: "Unleash symbiote chaos on the world",              icon: "🖤" },
  { name: "Hela",             universe: "Marvel", scheme: "Seize Asgard and expand her death domain",         icon: "💀" },
  { name: "Lady Deathstrike", universe: "Marvel", scheme: "Destroy Wolverine and claim mutant dominance",     icon: "🗡" },
  { name: "Mystique",         universe: "Marvel", scheme: "Infiltrate and destabilize mutant enemies",        icon: "🔵" },
  { name: "Morgan le Fay",    universe: "Marvel", scheme: "Rewrite reality with Arthurian dark sorcery",      icon: "🔮" },
  { name: "The Enchantress",  universe: "Marvel", scheme: "Enslave heroes through magical seduction",         icon: "💚" },
  { name: "Kingpin",          universe: "Marvel", scheme: "Build a criminal empire through iron will and ruthless business",  icon: "🏛" },
  { name: "Taskmaster",       universe: "Marvel", scheme: "Mirror any hero's technique and sell that advantage to enemies", icon: "🎭" },
  { name: "Bullseye",         universe: "Marvel", scheme: "Make any object a lethal weapon and never miss the mark",        icon: "🎯" },
  { name: "Purple Man",       universe: "Marvel", scheme: "Bend any mind to absolute obedience through pheromone control",  icon: "🟣" },
  { name: "Malekith",         universe: "Marvel", scheme: "Plunge all Nine Realms into eternal darkness for the Dark Elves",icon: "🌑" },
  { name: "Gorr the God Butcher", universe: "Marvel", scheme: "Hunt and exterminate every god across every timeline",      icon: "⚔" },
  { name: "Madame Hydra",     universe: "Marvel", scheme: "Spread HYDRA's serpentine dominion from the shadows",           icon: "🐍" },
  { name: "Abomination",      universe: "Marvel", scheme: "Surpass the Hulk and crush all resistance in his path",         icon: "💀" },
  { name: "Namor",            universe: "Marvel", scheme: "Force the surface world to bow to Atlantean supremacy",         icon: "🌊" },
  { name: "Cassandra Nova",   universe: "Marvel", scheme: "Destroy the Xavier legacy from within using his own power",     icon: "🔮" },
  { name: "Crossbones",       universe: "Marvel", scheme: "Carry out Hydra's bloodiest wetwork and topple Captain America's legacy", icon: "💀" },
  { name: "Whiplash",         universe: "Marvel", scheme: "Weaponise arc-reactor tech to destroy the Stark empire and legacy",        icon: "⚡" },
  // DC
  { name: "Darkseid",         universe: "DC",     scheme: "Discover the Anti-Life Equation",                  icon: "💥" },
  { name: "Lex Luthor",       universe: "DC",     scheme: "Prove humanity's superiority over gods",           icon: "💰" },
  { name: "The Joker",        universe: "DC",     scheme: "Burn civilization into beautiful chaos",           icon: "🃏" },
  { name: "Brainiac",         universe: "DC",     scheme: "Collect and miniaturize entire civilizations",     icon: "🤖" },
  { name: "General Zod",      universe: "DC",     scheme: "Rebuild Krypton through conquest of Earth",        icon: "☀" },
  { name: "Doomsday",         universe: "DC",     scheme: "Destroy all life through pure adaptive rage",       icon: "💪" },
  { name: "Ra's al Ghul",     universe: "DC",     scheme: "Purge humanity to restore ecological balance",     icon: "🌿" },
  { name: "Sinestro",         universe: "DC",     scheme: "Impose order through fear-based control",          icon: "💛" },
  { name: "Cheetah",          universe: "DC",     scheme: "Destroy Wonder Woman and claim divine power",      icon: "🐆" },
  { name: "Circe",            universe: "DC",     scheme: "Wage divine war against all of humanity",          icon: "🔮" },
  { name: "Trigon",           universe: "DC",     scheme: "Consume Earth as another conquered realm",         icon: "😈" },
  { name: "Black Manta",      universe: "DC",     scheme: "Destroy Atlantis and Aquaman's legacy",            icon: "🔱" },
  { name: "Reverse-Flash",    universe: "DC",     scheme: "Shatter the Flash's life across time",             icon: "⚡" },
  { name: "Vandal Savage",    universe: "DC",     scheme: "Rule the world as its immortal king",              icon: "🗡" },
  { name: "Deathstroke",      universe: "DC",     scheme: "Complete any contract with absolute precision",     icon: "⚔" },
  { name: "Black Adam",       universe: "DC",     scheme: "Reclaim Kahndaq and punish the unworthy",          icon: "⚡" },
  { name: "Amanda Waller",    universe: "DC",     scheme: "Control metahumans as weapons for the state",      icon: "🏛" },
  { name: "Granny Goodness",  universe: "DC",     scheme: "Break heroes through endless torment",             icon: "👵" },
  { name: "Bane",            universe: "DC",     scheme: "Break Batman and seize Gotham as his conquered throne",              icon: "💪" },
  { name: "Scarecrow",       universe: "DC",     scheme: "Drown the world in its own paralyzing fear and madness",             icon: "🌾" },
  { name: "The Riddler",     universe: "DC",     scheme: "Prove superior intellect by destroying the greatest minds in Gotham", icon: "❓" },
  { name: "Anti-Monitor",    universe: "DC",     scheme: "Annihilate the positive matter multiverse and replace it with anti-matter", icon: "💥" },
  { name: "Parasite",        universe: "DC",     scheme: "Drain every hero's power and become an unstoppable living god",      icon: "🟣" },
  { name: "Giganta",         universe: "DC",     scheme: "Crush obstacles at towering height and claim what she desires",      icon: "⬆" },
  { name: "Queen of Fables", universe: "DC",     scheme: "Rewrite reality as her dark fairy tale kingdom of terror",           icon: "📖" },
  { name: "Ocean Master",    universe: "DC",     scheme: "Declare war on the surface world in Atlantis's name",                icon: "🔱" },
  { name: "Mr. Freeze",      universe: "DC",     scheme: "Freeze Gotham and hold it ransom until his wife Nora can be saved",     icon: "❄️" },
  { name: "Hush",            universe: "DC",     scheme: "Dismantle every relationship Batman holds dear and expose his secret",   icon: "🤐" },
  // CW / Arrowverse
  { name: "Malcolm Merlyn",   universe: "CW",     scheme: "Destroy the Glades to purge Star City of sin",    icon: "🏹" },
  { name: "Damien Darhk",     universe: "CW",     scheme: "Embrace Hive's death magic to raze the world",    icon: "💀" },
  { name: "Prometheus",       universe: "CW",     scheme: "Break the Green Arrow by destroying everything he loves", icon: "🎯" },
  { name: "Ricardo Diaz",     universe: "CW",     scheme: "Own an entire city through crime and corruption",  icon: "🐉" },
  { name: "Zoom",             universe: "CW",     scheme: "Steal every speedster's speed and rule all Earths",icon: "⚡" },
  { name: "Savitar",          universe: "CW",     scheme: "Become a god of speed by eliminating rivals",      icon: "⚡" },
  { name: "Gorilla Grodd",    universe: "CW",     scheme: "Build a telepathic ape empire over humanity",      icon: "🦍" },
  { name: "The Thinker",      universe: "CW",     scheme: "Absorb all metahuman powers to control the world", icon: "🧠" },
  { name: "Eva McCulloch",    universe: "CW",     scheme: "Replace the real world with her mirror dimension",  icon: "🪞" },
  { name: "Reign",            universe: "CW",     scheme: "Purge Earth of sin as World Killer",               icon: "☀" },
  { name: "Non",              universe: "CW",     scheme: "Mind-control all humans into subservience",        icon: "🌀" },
  { name: "Agent Liberty",    universe: "CW",     scheme: "Incite humanity to exterminate metahumans",        icon: "🗽" },
  { name: "Mallus",           universe: "CW",     scheme: "Break free of his prison and devour all time",     icon: "😈" },
  { name: "Cicada",          universe: "CW",     scheme: "Systematically hunt and kill every metahuman alive on Earth",   icon: "🪲" },
  { name: "Bloodwork",       universe: "CW",     scheme: "Weaponise blood control to achieve biological immortality",     icon: "🩸" },
  { name: "Cayden James",    universe: "CW",     scheme: "Turn cyber-terrorism into world-ending leverage over Star City", icon: "💻" },
  // The Boys
  { name: "Homelander",       universe: "TB",     scheme: "Maintain iron control over Vought and all supes",   icon: "🔴" },
  { name: "Stormfront",       universe: "TB",     scheme: "Weaponize supes for ideological supremacy",         icon: "⚡" },
  { name: "Soldier Boy",      universe: "TB",     scheme: "Reclaim relevance through ruthless retribution",    icon: "🛡" },
  { name: "The Deep",         universe: "TB",     scheme: "Claw back standing in The Seven by any means",      icon: "🌊" },
  { name: "A-Train",          universe: "TB",     scheme: "Outrun his past and stay relevant at any cost",     icon: "💨" },
  { name: "Black Noir",       universe: "TB",     scheme: "Carry out Vought's kill-orders without hesitation", icon: "🖤" },
  { name: "Translucent",      universe: "TB",     scheme: "Infiltrate and expose enemies from the shadows",    icon: "👁" },
  { name: "Lamplighter",      universe: "TB",     scheme: "Burn any loose end Vought orders him to eliminate", icon: "🔥" },
  { name: "Crimson Countess",universe: "TB",     scheme: "Exploit celebrity supe fame while hiding Payback's darkest atrocities", icon: "❤" },
  { name: "Blue Hawk",       universe: "TB",     scheme: "Use Vought backing to enforce brutal vigilante justice with zero accountability", icon: "🦅" },
  { name: "Gunpowder",       universe: "TB",     scheme: "Leverage gun-based powers and political connections to serve Vought's agenda", icon: "🔫" },
  // Power Rangers
  { name: "Rita Repulsa",    universe: "PR",     scheme: "Conquer Earth and destroy the Power Rangers once and for all",                 icon: "🧙" },
  { name: "Lord Zedd",       universe: "PR",     scheme: "Reclaim dominion as Emperor of Evil across the entire universe",              icon: "👑" },
  { name: "Thrax",           universe: "PR",     scheme: "Unite all villains to destroy Sentinel Knight and avenge his parents' defeat", icon: "⚔" },
  { name: "Dark Specter",    universe: "PR",     scheme: "Drain Zordon's power and conquer the entire universe as Grand Monarch",      icon: "🌑" },
  { name: "Astronema",       universe: "PR",     scheme: "Serve Dark Specter and obliterate the Space Rangers utterly",                 icon: "🌑" },
  { name: "Divatox",         universe: "PR",     scheme: "Plunder the galaxy and eliminate Zordon's lasting legacy",                   icon: "🏴‍☠️" },
  { name: "Scorpius",        universe: "PR",     scheme: "Gather the Quasar Sabers to achieve ultimate power over the galaxy",         icon: "🦂" },
  { name: "Trakeena",        universe: "PR",     scheme: "Destroy everything Kendrix Morgan sacrificed herself to protect",            icon: "🦂" },
  { name: "Ransik",          universe: "PR",     scheme: "Dominate the past and reshape the future entirely for mutantkind",           icon: "🧬" },
  { name: "Master Org",      universe: "PR",     scheme: "Exterminate humanity and restore Orgs as rulers of the Wild Force world",   icon: "🌿" },
  { name: "Lothor",          universe: "PR",     scheme: "Collect enough ninja souls to open the Abyss of Evil and conquer Earth",    icon: "🌀" },
  { name: "Mesogog",         universe: "PR",     scheme: "De-evolve humanity back to the prehistoric age of dinosaurs",                icon: "🦖" },
  { name: "Gruumm",          universe: "PR",     scheme: "Conquer Earth for the Troobian Empire and feed the Magnificence",           icon: "💀" },
  { name: "Venjix",          universe: "PR",     scheme: "Wipe out the last of humanity and absorb all computer systems as one",      icon: "🤖" },
  { name: "Master Xandred",  universe: "PR",     scheme: "Flood the Sanzu River into the human world and rule it in darkness",        icon: "🌊" },
  { name: "Vrak",            universe: "PR",     scheme: "Betray his own royal family to reshape Earth under Warstar dominion",       icon: "👽" },
  { name: "Sledge",          universe: "PR",     scheme: "Collect every powerful Energem and sell them across the galaxy",            icon: "⛓" },
  { name: "Madame Odius",    universe: "PR",     scheme: "Steal ninja power through deception and claim the Ninja Nexus Prism",       icon: "🎭" },
  { name: "Void Knight",     universe: "PR",     scheme: "Resurrect his beloved at any cost — even destroying the Dino Fury Rangers", icon: "🗡" },
  // Animated — Disney
  { name: "Maleficent",      universe: "Animated", scheme: "Curse every soul who defies her and blanket the Moors in eternal darkness",            icon: "🌑" },
  { name: "Ursula",          universe: "Animated", scheme: "Collect desperate souls through impossible bargains and seize Triton's trident",       icon: "🐙" },
  { name: "Evil Queen",      universe: "Animated", scheme: "Destroy Snow White and reclaim the title of the fairest through dark sorcery",         icon: "🍎" },
  { name: "Mother Gothel",   universe: "Animated", scheme: "Keep Rapunzel imprisoned forever as a living source of youth and immortality",         icon: "🌸" },
  { name: "Cruella de Vil",  universe: "Animated", scheme: "Skin one hundred and one Dalmatian puppies to create the ultimate fur coat",           icon: "💀" },
  { name: "Yzma",            universe: "Animated", scheme: "Assassinate Emperor Kuzco and seize the Incan Empire through scheming brilliance",     icon: "⚗" },
  { name: "Queen of Hearts", universe: "Animated", scheme: "Maintain absolute terrifying rule through arbitrary decrees — off with their heads",   icon: "❤" },
];

// ── Weakness Catalog ──────────────────────────────────────────
const WEAKNESS_CATALOG: Record<string, string[]> = {
  "Black Widow":       ["No superhuman durability — fully human limits", "Psychological Red Room conditioning exploited", "Equipment seizure removes primary advantages", "Isolation from SHIELD support network"],
  "Captain Marvel":    ["Power absorption overload destabilises her", "Psychic intrusion bypasses cosmic defences", "Binary form burns energy reserves rapidly", "Neural disruption tech temporarily grounds her flight"],
  "Storm":             ["Claustrophobia induces panic that breaks weather control", "Psionic suppression disrupts her environmental sense", "Emotional overload fractures concentration — storms she can't contain", "Electrostatic dampeners absorb her lightning"],
  "Jean Grey":         ["Psychic feedback loops from amplified psi-traffic", "Phoenix suppression via forced emotional neutrality", "Physical sedation bypasses telekinetic defences", "Telepaths who can hide from her scans"],
  "Scarlet Witch":     ["Emotional destabilisation collapses probability fields", "Reality anchor devices nullify chaos magic", "Psychic intervention interrupts hex casting", "Suppressed grief rewrites spells unpredictably"],
  "She-Hulk":          ["Gamma suppression field reverts her to Jennifer Walters", "Emotional manipulation triggers uncontrolled surges", "Legal leverage exploiting her rational professional mind", "Anti-radiation containment foam"],
  "Spider-Woman":      ["Bioelectric drain devices disrupt her venom blasts", "Pheromone countermeasures neutralise her aura", "Frictionless surfaces strand her", "HYDRA conditioning emotional triggers"],
  "Rogue":             ["Absorption-nullifying barrier suits prevent power theft", "Psychic overload from absorbed personalities", "Skin-contact prevention gear removes her primary offence", "Memory floods from past absorptions destabilise identity"],
  "Gamora":            ["Cybernetic nerve-override hack through her implants", "Pain cascades when multiple implants are disrupted", "Emotional manipulation via Thanos trauma", "Infinity Stone proximity amplifies responses"],
  "Wasp":              ["Vulnerability when shrunk — adhesives and swatters", "Pym particle disruption prevents size-shifting", "Sonic disruption while miniaturised", "Standard human vulnerability at base size"],
  "Ms. Marvel":        ["Overextension causes painful snap-back", "Crystallised form inhibitors lock her polymer structure", "Emotional anchors to family disrupt focus", "Inhuman mist sensitivity triggers power instability"],
  "Invisible Woman":   ["Sustained invisibility drains concentration — pain breaks it", "Force field implosion from reverse-polarity tech", "Emotional distress collapses shield coherence", "Telepathic intrusion reveals position while invisible"],
  "Psylocke":          ["Psychic backlash when her blade strikes defended minds", "Telepathic overload from simultaneous multiple targets", "Shadow-teleport jamming in shielded zones", "Emotional investment weakens psi-blade focus"],
  "Emma Frost":        ["Diamond form has no telepathic access — a mental blind spot", "Physical damage in diamond form is permanent", "Psi-jammers block diamond-to-flesh transitions", "Emotional suppression leaves her open to manipulation"],
  "Ghost-Spider":      ["Web-fluid dependency — running dry leaves her stranded", "Dimensional displacement sickness from universe-hopping", "Sonic vibrations disrupt spider-sense feedback", "Standard human resilience without augmentation"],
  "X-23":              ["Berserker trigger phrase activates uncontrolled rage", "Adamantium weight creates drowning risk", "Healing factor delayed by adamantium poisoning", "Emotional manipulation targeting her clone identity crisis"],
  "Ironheart":         ["EMP pulse takes down her suit instantly", "Without the suit she is a baseline human", "Neural-interface override and hacking", "Armour joint vulnerabilities at articulation points"],
  "America Chavez":    ["Emotional instability closes her star portals", "Anti-magic fields suppress her Utopian power source", "Grief-based anchors prevent dimensional escape", "Cosmic dampeners ground her strength"],
  "Kate Bishop":       ["No superhuman powers — elite but fully human", "Psychological pressure exploiting need to prove herself", "Equipment dependency — disarmed she loses most advantages", "Confined spaces reduce archery effectiveness"],
  "Valkyrie":          ["Asgardian mead impairs judgment", "Dark dimension energy disrupts her death-sense", "Cosmic power-suppression drains Asgardian physiology", "Necrosword vibrations destabilise connection to Valhalla"],
  "Nebula":            ["Cybernetic override via Thanos's neural backdoor", "System cascade failure when multiple implants disrupted", "Memory wipe of learned combat adaptations", "Emotional triggers from Gamora and Thanos"],
  "Elektra":           ["Hand assassins who know her combat style exactly", "Mystical unbinding of her resurrection", "Sonic disruption shatters meditation focus", "Daredevil — the one anchor that compromises mission discipline"],
  "Silk":              ["Spider-sense tuned to Morlun's frequency — draws him to her", "Organic web supply depletes with no cartridge backup", "Bunker-sickness from prolonged isolation trauma", "Acoustic dampeners confuse web-locating ability"],
  "Magik":             ["Soulsword only cuts magical beings — useless against tech", "Limbo instability bleeds into Earth when she is emotional", "Stepping disc disruption in electromagnetically sealed zones", "Demonic Darkchylde corruption threatening to resurface"],
  "Polaris":           ["Non-magnetic materials bypass her power completely", "Magneto's voice destabilises her magnetic field coherence", "Psychiatric medication was used to suppress her mutation historically", "Genosha massacre trauma causes field collapses under stress"],
  "Shadowcat":         ["Prolonged phasing risks molecular dissociation", "Electrical disruption solidifies her inside objects", "Adamantium is the one material she cannot phase through", "Emotional shock breaks phase concentration"],
  "Spectrum":          ["Specific energy frequencies outside her conversion range", "Forced reversion to human form by dimensional anchors", "Absorption overload when processing multiple energy types", "Light-speed movement requires clear line-of-sight paths"],
  "Domino":            ["Probability fields require subconscious engagement — forced calm nullifies her luck", "Opponents who account for probability deviation in planning", "Luck only affects her — teammates are fully exposed", "High-stress panic breaks passive probability manipulation"],
  "Firestar":          ["Radiation-absorbing containment suits neutralise her microwaves", "Emotional overwhelm causes uncontrolled emissions", "Magnetic field disruption prevents microwave focusing", "Cannot be immune to her own radiation at proximity"],
  "Dazzler":           ["Total soundproofing starves her power source", "Sensory overload when input exceeds conversion capacity", "Physical attacks bypass her light constructs entirely", "Sonic negation fields prevent light-to-sound transfer"],
  "Black Cat":         ["Bad luck field cannot be directed — applies randomly", "Standard human vulnerability in sustained combat", "Targeted good-luck cancellation nullifies her aura", "Emotional investment creating tactical blind spots"],
  "Wolfsbane":         ["Silver weapons cause severe injury bypassing healing", "Full moon compulsion overriding her conscious choice", "Soul link with Rictor exploited against her", "Mutant-targeting drugs trap her in partial wolf form"],
  "Wonder Woman":      ["Ancient Aphrodite's law — bound by a man weakens her", "Severing her from Olympus removes divine power", "Powerful magic from equivalent divine sources", "Lasso of Truth — she cannot lie while it touches her either"],
  "Supergirl":         ["Kryptonite — green weakens, red causes bizarre changes, gold removes powers", "Red sun radiation strips all Kryptonian powers", "Magic bypasses invulnerability completely", "Lead barriers block her X-ray vision"],
  "Batgirl / Oracle":  ["No meta-abilities — human limits even at peak", "Oracle identity relies on tech — EMP renders her blind", "Emotional investment in Gordon family exploited as leverage", "Back injury history — physical spinal trauma"],
  "Batwoman":          ["Human limits despite military elite training", "PTSD from military service exploited under psychological assault", "No supernatural resilience — conventional weapons work", "Family used as hostages — Jacob Kane and her sister"],
  "Black Canary":      ["Sonic dampeners neutralise her Canary Cry", "Close-quarters saturation — multiple opponents simultaneously", "Tech-jamming blocks non-meta gear enhancements", "Emotional triggers from her original history as Dinah Drake"],
  "Starfire":          ["Sealed from UV light slowly drains energy reserves", "Emotional state directly affects starbolt power output", "Tamaranian loyalty exploited via hostage scenarios", "Language absorption requires physical contact — creates vulnerabilities"],
  "Raven":             ["Anger breaks empathic control and risks civilian harm", "Trigon's voice destabilises her — her father's influence exploited", "Demonic possession windows when meditation is forcibly interrupted", "Soul self is vulnerable when outside her body — it can be captured"],
  "Hawkgirl":          ["Nth metal removal strips flight and weapon enhancement", "Hawk curse — traumatic past-life memories triggered by specific objects", "Standard human physiology when weaponless", "Reincarnation cycle — death means starting over"],
  "Power Girl":        ["Kryptonite in all forms", "Magic entirely bypasses invulnerability", "Emotional buttons about being from a vanished Earth-2", "Direct eye-contact vulnerability when exposed to specific wavelengths"],
  "Zatanna":           ["Speaking backwards under physical restraint is impossible — gag or injury silences her", "Sound dampening prevents verbal spellcasting", "Anti-magic zones block all her power", "Grief-casting produces unpredictable and dangerous results"],
  "Huntress":          ["Human limits — no superpowers", "Catholic guilt and moral code exploited under pressure", "Bertinelli mafia connections weaponised against her", "Obsessive mission focus creates exploitable tunnel vision"],
  "Catwoman":          ["No metapowers — clever and agile but fully human", "Emotional investment in Gotham's forgotten used as leverage", "Batman-contingency protocols designed specifically for her skill set", "Jewel thief instinct — rare objects used as predictable bait"],
  "Mera":              ["Dehydration — outside water her hydrokinesis weakens rapidly", "Dry environments progressively limit her power", "Atlantean political conflicts paralyse her", "Severed from Atlantean supply leaves her drawing on ambient moisture only"],
  "Stargirl":          ["Cosmic Staff responds to her will — psychological manipulation corrupts its output", "Cosmic Converter Belt power is finite between recharges", "Student hero — inexperience creates tactical gaps", "Emotional anchors to JSA legacy exploited through senior hero threats"],
  "Jade":              ["Yellow impurity applies — power is a direct GL ring analogue", "Emotional state affects energy construct stability", "Willpower sapped by prolonged isolation or helplessness", "Alan Scott's ring can be disrupted by shadow"],
  "Jessica Cruz":      ["Anxiety and PTSD weaponised directly against her will", "Power Ring of Volthoom still has residual influence", "Self-doubt directly weakens construct integrity", "Past hostage trauma used to trigger panic responses"],
  "Katana":            ["Soultaker contains her deceased husband's soul — leverage from within the blade", "Sword separated means power is purely human martial arts", "Grief over Maseo is a constant open wound", "The blade demands blood — if unused it eventually uses her"],
  "Sara Lance":        ["League of Assassins conditioning — trigger phrases can be reactivated", "Human limits — powerful magic or tech overwhelms her", "Temporal paradox anxiety — she is aware she shouldn't exist", "Time displacement sickness from prolonged temporal exposure"],
  "Laurel Lance":      ["Tech-dependent Canary Cry — device destroyed means silence", "Human fighter only — no metahuman edge", "Black Siren doppelganger creates identity confusion attacks", "Emotional grief over Oliver and Tommy"],
  "Caitlin Snow":      ["Forced personality shift — Killer Frost emerges under trauma and doesn't share Caitlin's values", "Killer Frost powers fail in extreme heat environments", "Scientific training over combat training — not a fighter", "Harrison Wells emotional conditioning"],
  "Iris West-Allen":   ["No powers — fully human, fully vulnerable", "Barry Allen — any threat to him destroys her judgment", "Journalist ethics preventing cover maintenance", "Speed Force conduit status is latent and unreliable"],
  "Nia Nal":           ["Dream power requires sleep — sleep deprivation neutralises her", "Naltorian ancestors she doesn't fully understand yet", "Emotional connection to Brainy disrupts calm dreaming state", "Energy blast training still developing — range and precision limited"],
  "M'gann M'orzz":     ["White Martian form — true form revealed triggers distrust", "Telepathic link opened too wide floods her with others' trauma", "Fire — Martian physiology is severely vulnerable", "Martian racial guilt weaponised against her"],
  "Starlight":         ["Electrical power drains in shielded environments", "Vought International — corporate leverage and compound V dependency risks", "Homelander's authority over her — she cannot openly defy him", "Light absorbed by sufficiently dense materials blocks her blasts"],
  "Queen Maeve":       ["Compound V dependency — what was given can be taken", "Homelander's psychological dominance after years of forced partnership", "Survivor guilt from the Flight 37 incident weaponised against her", "Specifically engineered compound V inhibitors"],
  "Kimiko":            ["No verbal communication — she cannot call for help or negotiate", "Regeneration has limits — overwhelm the rate of healing", "Emotional connection to Frenchie is the most powerful lever", "Bound hands remove her ability to communicate in sign language"],
  "Firecracker":       ["Her real past identity buried but usable against her", "Compound V-driven powers are newer and less refined", "Media and image-based vulnerability", "Victoria Neuman's political entanglements make her a liability"],
  "Sister Sage":       ["Intelligence doesn't equal physical power — fragile in direct combat", "Neural manipulation used against others can be reversed", "Self-harm induced cognitive resets as her coping mechanism", "Blind spots in her calculations create exploitable gaps"],
  "Victoria Neuman":   ["Head-explosion range is limited — distance and shielding matter", "Congressional accountability — public exposure ends her career", "Starlight has witnessed her power — living witness she cannot eliminate", "Hughie's blood-pressure drug suppresses her ability"],
  // Disney Heroines
  "Elsa":              ["Emotional manipulation collapses her cryokinetic control — fear triggers uncontrolled blizzards that harm those she loves", "Prolonged warmth and heat environments gradually erode her ice constructs", "Her absolute terror of hurting people she loves is the deepest lever — threaten Anna and she freezes", "Isolation-induced dissociation from her years alone makes her slow to trust or call for help"],
  "Anna":              ["No powers whatsoever — fully human and fully vulnerable to any physical threat", "Her relentless naive optimism is exploited — she trusts charming people too quickly and catastrophically", "Elsa as leverage — any threat to her sister destroys Anna's judgment entirely", "The act of true love enchantment is her only reset — without Elsa she has nothing supernatural to rely on"],
  "Rapunzel":          ["Cutting her hair permanently severs all magical power — scissors end everything instantly", "18 years of isolation have created a desperate craving for human connection — she bonds fast and trusts dangerously", "Her enchanted hair is a liability in close quarters — it can be grabbed, used as rope, or weaponised against her", "Pascal and Maximus can be taken hostage as leverage — she cannot bear to endanger them"],
  "Tiana":             ["Human with no powers — relies entirely on skill, wit, and determination; all of which fail under physical threat", "Her lifelong dream (the restaurant) is her deepest emotional core — threaten it and her composure shatters", "Voodoo-adjacent environment is her strength — outside the bayou she loses her instinctual advantages", "Naveen's safety is the one thing that overrides her otherwise ironclad self-control"],
  "Pocahontas":        ["Her profound empathy causes her to hesitate at the moment of violence — she cannot bring herself to harm without reason", "Severed from the natural world in urban or enclosed settings she loses the spirit vision that guides her", "Tribal loyalty creates crippling ethical paralysis — she cannot protect herself if it means endangering her people", "John Smith, Nakoma, or her father used as hostages achieve instant compliance"],
  "Megara":            ["Her past trauma — sold into servitude — means she distrusts love and instinctively recoils from help, leaving her isolated", "Hades' original contract exploits her sense of debt — she can be convinced she still owes him", "Hercules as leverage completely overrides her cynical self-preservation instincts", "Her armour of sarcasm and wit crumbles catastrophically the moment she admits genuine feeling"],
  "Esmeralda":         ["Her gypsy network can be systematically dismantled to isolate her", "Her faith creates absolute moral red lines she will not cross — exploitable as a predictable constraint", "Frollo's obsessive authority over Paris means he can turn every escape route against her", "Her natural performance instincts draw attention in a city where she cannot afford to be seen"],
  "Jane":              ["Her scientific curiosity overrides all self-preservation instinct — novel discoveries disable her threat assessment completely", "Disconnected from Tarzan and the jungle she is just an unarmed academic in the wrong place", "Her verbose enthusiastic communication style betrays her position and intention every time", "Emotional attachment to Tarzan means he is the ultimate pressure point"],
  "Kida":              ["Away from Atlantis the crystal connection gradually weakens — she is cut off from her power source", "Her people's isolation means she fundamentally cannot read surface-world deception and social manipulation", "Atlantean technology is the foundation of her advantage — without it she is a strong but conventional warrior", "Her millennia of isolation created blind spots about the full range of human cruelty and ambition"],
  "Cinderella":        ["No powers whatsoever — she is a young woman entirely at the mercy of her environment", "Decades of emotional abuse from her stepfamily have deeply conditioned her to obey and endure", "The enchantment that transforms her has a time limit — midnight erases everything and leaves her exposed", "Her fundamental goodness means she always looks for the best in captors — a catastrophic tactical blindspot"],
  "Mulan":             ["Her primary advantage is disguise and deception — expose either and she is compromised and without allies", "Her fighting style is entirely leverage and improvisation — remove the environment and she is outmatched physically", "Mushu, Cri-Kee, and her unit are her emotional support structure — isolate her from all three and she starts doubting herself", "Her family honour is the core of her identity — threaten her family and she becomes reckless"],
  "Nani":              ["No superpowers whatsoever — she is a physically strong surfer and that is all", "Her overwhelming sense of responsibility for Lilo is the most powerful pressure point imaginable", "Social services and custody status exploited — any threat to her guardianship produces instant desperate compliance", "Financial precarity means she cannot afford to fight prolonged battles of any kind"],
  "Belle":             ["Her beauty has always made her a target and she has no training to handle the attention", "Her love of books and intellectual stimulation used as distraction and isolation — give her a library and she disappears", "Her deep empathy means she always eventually finds the humanity in whoever holds her — a profound vulnerability", "The Beast, Lumiere, Cogsworth, and Mrs Potts as leverage — she will sacrifice herself rather than see them harmed"],
  "Isabela":           ["Her gift is emotional — deep psychological distress completely collapses her flora control", "Years of perfectionism and suppressed identity mean she is one accusation of failure away from freezing entirely", "Her family's expectations are weaponised through guilt — she cannot disappoint la familia", "Cut off from soil and living plant matter in a completely barren environment she has nothing to manipulate"],
  // Western Animated
  "Kim Possible":      ["Gadget dependency — without Wade's tech her advantage narrows significantly", "Overconfidence and habit of quipping during danger creates lethal tactical openings", "Ron Stoppable is the paramount lever — his safety will override every tactical instinct she has", "She always underestimates opponents she's beaten before — exploitable pattern"],
  "Sam":               ["Communications blackout strips her leadership advantage — no plan means paralysis", "Her logical precision becomes a vulnerability against purely irrational or chaotic opponents", "WOOHP gadget seizure removes most of her effectiveness", "Clover and Alex as leverage — her loyalty to her team overrides all personal survival instincts"],
  "Clover":            ["Vanity and preoccupation with appearance creates critical distraction windows", "Romantic entanglements produce catastrophic judgment failures at the worst moments", "Her combat effectiveness collapses without WOOHP gadgetry", "Sam and Alex as leverage — she would sacrifice herself without hesitation for either of them"],
  "Alex":              ["Athletic predictability — opponents who study her movement patterns can anticipate every attack", "Her open and trusting nature means she bonds with people dangerously fast and can be betrayed", "Gadget dependency like her teammates — the same WOOHP gear vulnerabilities apply", "Sam and Clover as the primary emotional pressure points that override all judgement"],
  "Helen Parr":        ["Elasticity has structural limits — stretched beyond 100 metres she loses tensile integrity and tears", "Electric shock causes involuntary snap-back — she can be contracted and immobilised this way", "Bob, Violet, Dash, and Jack-Jack as absolute leverage — she becomes reckless when family is threatened", "Her decades of Super-identity suppression mean her first instinct is still to hide — she hesitates"],
  "Adora":             ["Losing the Sword of Protection reverts her to Adora — fully human with no She-Ra abilities whatsoever", "Horde Prime's neural parasite conditioning can be partially reactivated through Horde-origin tech", "Her compassion compels her to save suffering enemies — an exploitable humanitarian reflex that gets her captured", "Catra, Bow, Glimmer, and the Rebellion as leverage — she will accept any terms to keep them safe"],
  "Harley Quinn":      ["Joker's years of psychological conditioning left deep triggers — his voice or image still destabilises her", "Her acrobatic combat style relies on unpredictability — opponents who stay emotionally neutral remove her advantage", "Poison Ivy is her deepest anchor — Ivy's safety will override Harley's survival instinct every time", "Mallet and gadget dependency — disarmed she is an acrobatic but fully baseline-human brawler"],
  "Cheetara":          ["Her speed bursts drain stamina rapidly — sustained maximum speed is physiologically impossible", "Precognitive sight flashes are involuntary and immobilising — triggering one at the wrong moment is exploitable", "Standard feline reaction to darkness and enclosed spaces creates psychological pressure", "Staff separated from her removes her primary combat range and she must close to brawl"],
  "April O'Neil":      ["Her journalist instinct to investigate and document overrides self-preservation at critical moments", "Psychic sensitivity is untrained and involuntary — psionic attacks cause overwhelming disorientation", "The TMNT are her absolute leverage — threaten them and every tactical decision becomes emotional", "Without her brothers' backup she is a skilled but human-only combatant in a world of enhanced threats"],
  "Daphne Blake":      ["Her supernatural-magnet quality cannot be switched off — she will always be at the centre of the crisis", "Self-defence training is real but still human-limits — she cannot match superhuman opponents in direct combat", "Fred, Velma, Shaggy, and Scooby as primary leverage — her team is her vulnerability", "Habitual investigative curiosity means she walks into traps even when she suspects them"],
  "Jessica Rabbit":    ["Toon physics only protect her inside Toon-logic contexts — real-world weapons operate normally against her", "Her devastating weaponised charm works on those who want to be charmed — emotionally disciplined opponents are immune", "Roger Rabbit is her absolute lever — threaten him and she loses all composure and strategic clarity", "Her Toon nature is visible and traceable — she cannot hide what she is in the human world"],
  "Asami Sato":        ["No bending whatsoever — against skilled benders she must rely entirely on speed, tech, and terrain", "The chi-blocker glove has finite charge — once depleted she loses her primary non-lethal weapon", "Her father Hiroshi's ghost and its legacy create deep psychological pressure under sustained interrogation", "Korra is her primary emotional lever — any threat to the Avatar produces irrational protective responses"],
  "Korra":             ["Hot-headed instinct to meet every threat head-on makes her tactically predictable", "Avatar State requires emotional calm — psychological destabilisation makes it inaccessible at the worst moments", "Equalist chi-blocking temporarily severs her bending — she is baseline-human until the block is released", "Mako, Asami, Bolin, and especially Tenzin as leverage — she charges recklessly into anything that threatens them"],
};

function getHeroWeaknesses(hero: { name: string; power: string }): string[] {
  if (WEAKNESS_CATALOG[hero.name]) return WEAKNESS_CATALOG[hero.name];
  const p = hero.power.toLowerCase();
  if (p.includes("martial") || p.includes("archer") || p.includes("spy") || p.includes("detective") || p.includes("mercenary") || p.includes("agent")) {
    return ["No superhuman durability — fully human limits", "Equipment seizure removes primary advantages", "Psychological conditioning exploited under sustained pressure", "Isolation from support network"];
  }
  if (p.includes("magic") || p.includes("sorcery") || p.includes("spell") || p.includes("enchant")) {
    return ["Anti-magic containment fields", "Gestural/verbal spell requirements — bound and gagged silences her", "Emotional destabilisation corrupts spellcasting", "Reality anchor devices block dimensional access"];
  }
  if (p.includes("telepat") || p.includes("psionic") || p.includes("psychic") || p.includes("empathy") || p.includes("mind")) {
    return ["Psionic dampeners block mental transmission", "Psychic feedback from mass casualties", "Emotional flooding from unfiltered empathy", "Psi-null materials blocking projection"];
  }
  if (p.includes("speed") || p.includes("speedster")) {
    return ["Speed Force disruption devices", "Molecular vibration destabilisation", "Anti-friction containment surfaces", "Temporal paradox vulnerability"];
  }
  if (p.includes("krypton")) {
    return ["Kryptonite exposure", "Red sun radiation strips all powers", "Magic bypasses invulnerability", "Lead barriers blocking X-ray vision"];
  }
  if (p.includes("strength") || p.includes("durability") || p.includes("invulner")) {
    return ["Power nullification containment field", "Gamma or cosmic radiation suppression tech", "Emotional manipulation bypassing physical defences", "Anti-power pharmaceutical agents"];
  }
  if (p.includes("flight") || p.includes("energy") || p.includes("cosmic")) {
    return ["Energy absorption overload destabilises her", "Atmospheric containment grounds flight", "Cosmic dampening field", "Power drain devices targeting her energy source"];
  }
  return ["Power nullification containment", "Emotional vulnerability exploited under pressure", "Isolated from allies and backup", "Specialised anti-power countermeasures"];
}

const SETTINGS = [
  { id: "city",      label: "City in Chaos",         desc: "Urban skyline under siege",          icon: "🌆" },
  { id: "space",     label: "Cosmic Void",            desc: "Deep space confrontation",           icon: "🌌" },
  { id: "dimension", label: "Alternate Dimension",    desc: "Reality itself bends and fractures", icon: "🌀" },
  { id: "base",      label: "Villain's Fortress",     desc: "The enemy's most secure domain",     icon: "🏰" },
  { id: "ruins",     label: "Ancient Ruins",          desc: "Where old power was buried",         icon: "🏛" },
  { id: "station",   label: "Space Station",          desc: "High orbit, zero gravity battle",    icon: "🛸" },
];

const STAKES = [
  { id: "world",     label: "The Entire World",       icon: "🌍" },
  { id: "city",      label: "A Major City",           icon: "🌆" },
  { id: "identity",  label: "Her Secret Identity",    icon: "🎭" },
  { id: "loved-one", label: "Someone She Loves",      icon: "❤" },
  { id: "artifact",  label: "A Cosmic Artifact",      icon: "💎" },
  { id: "allies",    label: "Her Fellow Heroes",      icon: "⚔" },
];

const WEAPONS = [
  "Infinity Stone", "Kryptonite", "Cosmic Cube", "Anti-Life Equation", "Soultaker Sword",
  "Nth Metal", "Mjolnir", "Lasso of Truth", "Red Lantern Ring", "Dark Sorcery",
  "Symbiote Suit", "Neural Override Tech", "Time Displacement Device", "Omega Beams", "Phoenix Force",
];

const RESTRAINTS = [
  { id: "power-collar",      label: "Power-Dampening Collar",   desc: "Suppresses metahuman abilities" },
  { id: "vibranium-chains",  label: "Vibranium Chains",         desc: "Indestructible Wakandan metal" },
  { id: "kryptonite-cuffs",  label: "Kryptonite Shackles",      desc: "Drains Kryptonian strength" },
  { id: "neural-inhibitor",  label: "Neural Inhibitor Cuffs",   desc: "Blocks nerve impulses & control" },
  { id: "adamantium-cuffs",  label: "Adamantium Manacles",      desc: "Unbreakable metal restraints" },
  { id: "anti-magic",        label: "Anti-Magic Bindings",      desc: "Nullifies sorcery & spells" },
  { id: "energy-cage",       label: "Energy Suppression Cage",  desc: "Containment field that drains power" },
  { id: "shock-collar",      label: "Neural Shock Collar",      desc: "Remote-triggered pain compliance" },
  { id: "enchanted-rope",    label: "Enchanted Rope",           desc: "Binds even the strongest hero" },
  { id: "titanium-suit",     label: "Titanium Restraint Suit",  desc: "Full-body immobilisation harness" },
  { id: "symbiote-bonds",    label: "Symbiote Tendrils",        desc: "Living bonds that tighten with struggle" },
  { id: "dim-anchor",        label: "Dimensional Anchor",       desc: "Prevents teleportation or phasing" },
  { id: "sedative",          label: "Paralysis Toxin",          desc: "Chemical agent that immobilises" },
  { id: "psi-crown",         label: "Psychic Suppression Crown",desc: "Seals all telepathic & psionic power" },
  { id: "gravity-shackles",  label: "Gravity Shackles",         desc: "Pin the hero under crushing G-force" },
];

const TONES = [
  { id: "action",     label: "Action-Packed",     desc: "High-octane combat & explosive set-pieces",    icon: "💥" },
  { id: "psych",      label: "Psychological",     desc: "Mind games, manipulation, inner conflict",      icon: "🧠" },
  { id: "slowburn",   label: "Slow Burn",         desc: "Tension builds gradually toward an explosion",  icon: "🕯" },
  { id: "escape",     label: "Escape Focused",    desc: "Hero's desperate fight to break free",          icon: "🔓" },
  { id: "dark",       label: "Dark & Brutal",     desc: "No holds barred — grim, visceral, unflinching", icon: "🌑" },
  { id: "dramatic",   label: "Dramatic Climax",   desc: "Emotional confrontation at a pivotal moment",   icon: "🎭" },
];

const CAPTURE_METHODS = [
  { id: "force",      label: "Overwhelming Force",     desc: "Direct assault with superior power",          icon: "⚡" },
  { id: "trap",       label: "Elaborate Trap",          desc: "Pre-planned ambush the hero walks into",      icon: "🕸" },
  { id: "manip",      label: "Psychological Manipulation", desc: "Exploiting her emotions & trust",          icon: "🎭" },
  { id: "tech",       label: "Advanced Technology",    desc: "Science & engineering to neutralise powers",  icon: "🤖" },
  { id: "magic",      label: "Magic / Cosmic Power",   desc: "Sorcery or cosmic energy overwhelms her",     icon: "✨" },
  { id: "hostage",    label: "Using Hostages",          desc: "Forces surrender by threatening others",      icon: "🎯" },
];

const HERO_STATES = [
  { id: "peak",       label: "At Full Strength",       icon: "💪" },
  { id: "weakened",   label: "Powers Suppressed",      icon: "📉" },
  { id: "injured",    label: "Already Injured",        icon: "🩸" },
  { id: "alone",      label: "Isolated — No Allies",   icon: "🌑" },
  { id: "exhausted",  label: "Exhausted Post-Battle",  icon: "😮‍💨" },
  { id: "emotional",  label: "Emotionally Vulnerable", icon: "💔" },
];

const STORY_LENGTHS = [
  { id: "short",  label: "Quick Strike",  desc: "2–3 punchy paragraphs", icon: "⚡" },
  { id: "medium", label: "Standard",      desc: "5–6 paragraphs",        icon: "📖" },
  { id: "epic",   label: "Epic Saga",     desc: "9–10 paragraphs",       icon: "📜" },
];

type Step = 1 | 2 | 3 | 4;
type UniverseFilter = "ALL" | "MARVEL" | "DC" | "CW" | "TB" | "PR" | "ANIMATED";
type VillainFilter = "ALL" | "Marvel" | "DC" | "CW" | "TB" | "PR" | "Animated";

// ── Component ─────────────────────────────────────────────────
export default function SuperheroMode({ onBack }: SuperheroModeProps) {
  const isMobile = useIsMobile();
  const [step, setStep] = useState<Step>(1);
  const [universeFilter, setUniverseFilter] = useState<UniverseFilter>("ALL");
  const [villainFilter, setVillainFilter] = useState<VillainFilter>("ALL");
  const [search, setSearch] = useState("");

  // Selections
  const [selectedHeroes, setSelectedHeroes] = useState<(typeof MARVEL_HEROES[0] & { universe: string })[]>([]);
  const [selectedVillain, setSelectedVillain] = useState<typeof VILLAINS[0] | null>(null);
  const [customVillain, setCustomVillain] = useState("");
  const [customVillainScheme, setCustomVillainScheme] = useState("");
  const [customVillainPowers, setCustomVillainPowers] = useState("");
  const [customVillainPersonality, setCustomVillainPersonality] = useState<string[]>([]);
  const [customVillainFranchise, setCustomVillainFranchise] = useState("");
  const [villainMode, setVillainMode] = useState<"pick" | "custom">("pick");
  const [selectedSetting, setSelectedSetting] = useState<string>("");
  const [selectedStakes, setSelectedStakes] = useState<string>("");
  const [selectedWeapons, setSelectedWeapons] = useState<string[]>([]);
  const [selectedRestraints, setSelectedRestraints] = useState<string[]>([]);
  const [customRestraints, setCustomRestraints] = useState("");
  const [storyTone, setStoryTone] = useState<string>("");
  const [captureMethod, setCaptureMethod] = useState<string>("");
  const [heroState, setHeroState] = useState<string>("");
  const [storyLength, setStoryLength] = useState<string>("medium");
  const [extraDetails, setExtraDetails] = useState("");

  // ── Advanced Systems ──
  const [powerDegradation, setPowerDegradation] = useState(0);
  const [powerDegradationDesc, setPowerDegradationDesc] = useState("");
  const [traumaState, setTraumaState] = useState<"" | "compliance" | "defiance" | "breakdown">("");
  const [sensoryModeActive, setSensoryModeActive] = useState(false);
  const [sensoryMode, setSensoryMode] = useState<string>("");
  const [sensoryScrambler, setSensoryScrambler] = useState<string[]>([]);

  // ── Team-up Mode ──
  const [isVillainDuo, setIsVillainDuo] = useState(false);
  const [selectedVillain2, setSelectedVillain2] = useState<typeof VILLAINS[0] | null>(null);
  const [villainDynamic, setVillainDynamic] = useState<"allies" | "rivals" | "dominant" | "">("");
  const [villainFilter2, setVillainFilter2] = useState<VillainFilter>("ALL");

  // ── Weakness Catalog ──
  const [selectedWeaknesses, setSelectedWeaknesses] = useState<string[]>([]);

  // ── Captor Marketplace ──
  const [marketplaceActive, setMarketplaceActive] = useState(false);
  const [marketplaceCategories, setMarketplaceCategories] = useState<string[]>([]);
  const [marketplaceHeroRole, setMarketplaceHeroRole] = useState<string>("");
  const [marketplaceTech, setMarketplaceTech] = useState<string[]>([]);
  const [marketplaceInfo, setMarketplaceInfo] = useState<string[]>([]);

  // Story generation & chapters
  const [chapters, setChapters] = useState<string[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [continuePrompt, setContinuePrompt] = useState("");
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const story = chapters.join("\n\n");

  const allHeroes = [
    ...MARVEL_HEROES.map((h) => ({ ...h, universe: "MARVEL" })),
    ...DC_HEROES.map((h) => ({ ...h, universe: "DC" })),
    ...CW_HEROES.map((h) => ({ ...h, universe: "CW" })),
    ...TB_HEROES.map((h) => ({ ...h, universe: "TB" })),
    ...PR_HEROES.map((h) => ({ ...h, universe: "PR" })),
    ...ANIMATED_HEROES.map((h) => ({ ...h, universe: "ANIMATED" })),
  ];

  const filteredHeroes = allHeroes.filter((h) => {
    const matchUniverse = universeFilter === "ALL" || h.universe === universeFilter;
    const matchSearch = !search || h.name.toLowerCase().includes(search.toLowerCase()) || h.alias.toLowerCase().includes(search.toLowerCase());
    return matchUniverse && matchSearch;
  });

  function toggleWeapon(w: string) {
    setSelectedWeapons((prev) => prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]);
  }
  function toggleRestraint(id: string) {
    setSelectedRestraints((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function toggleHero(hero: typeof allHeroes[0]) {
    setSelectedHeroes((prev) =>
      prev.some((h) => h.name === hero.name)
        ? prev.filter((h) => h.name !== hero.name)
        : [...prev, hero]
    );
  }
  function canProceedStep1() { return selectedHeroes.length > 0; }
  function canProceedStep2() {
    const primary = villainMode === "pick" ? !!selectedVillain : !!customVillain.trim();
    if (!primary) return false;
    if (isVillainDuo) return !!selectedVillain2 && !!villainDynamic;
    return true;
  }
  function canProceedStep3() { return !!selectedSetting && !!selectedStakes; }

  function buildPrompt() {
    const villain = villainMode === "pick" ? selectedVillain?.name : customVillain;
    const villainScheme = villainMode === "pick"
      ? selectedVillain?.scheme
      : [customVillainScheme.trim() || "achieve their sinister goal", customVillainFranchise.trim() ? `(from: ${customVillainFranchise.trim()})` : ""].filter(Boolean).join(" ");
    const customVillainDetail = villainMode === "custom" ? [
      customVillainPowers.trim() ? `POWERS: ${customVillainPowers.trim()}` : "",
      customVillainPersonality.length > 0 ? `PERSONALITY: ${customVillainPersonality.join(", ")}` : "",
    ].filter(Boolean).join(" | ") : "";
    const settingLabel = SETTINGS.find((s) => s.id === selectedSetting)?.label ?? selectedSetting;
    const stakesLabel = STAKES.find((s) => s.id === selectedStakes)?.label ?? selectedStakes;
    const toneLabel = TONES.find((t) => t.id === storyTone)?.label ?? "";
    const captureLabel = CAPTURE_METHODS.find((c) => c.id === captureMethod)?.label ?? "";
    const heroStateLabel = HERO_STATES.find((h) => h.id === heroState)?.label ?? "";
    const lengthLabel = STORY_LENGTHS.find((l) => l.id === storyLength)?.label ?? "Standard";
    const restraintLabels = selectedRestraints.map((id) => RESTRAINTS.find((r) => r.id === id)?.label ?? id);
    const allRestraints = [...restraintLabels, ...(customRestraints.trim() ? [customRestraints.trim()] : [])];

    const degradationLevel = powerDegradation === 0 ? "none" : powerDegradation <= 20 ? "minimal flicker" : powerDegradation <= 40 ? "noticeable drain" : powerDegradation <= 60 ? "significant suppression" : powerDegradation <= 80 ? "near-total loss" : "complete power void";
    const traumaDesc = traumaState === "compliance" ? "Compliance — the hero's resistance has begun to erode; she is increasingly obedient, her will bending under sustained pressure" : traumaState === "defiance" ? "Defiance — she fights back at every turn; each act of resistance triggers harsher countermeasures and escalating restraints" : traumaState === "breakdown" ? "Breakdown — psychological fracture; she experiences dissociation, hallucinations, and unpredictable power surges" : "not specified";
    const sensoryDesc = !sensoryModeActive ? "none" : sensoryMode;
    const scramblerDesc = sensoryScrambler.length > 0
      ? sensoryScrambler.map((id) =>
          id === "hallucinations" ? "Hallucinations — visual and auditory distortions arise from accumulated trauma, bleeding the unreal into her perception"
        : id === "phantom-pains"  ? "Phantom Pains — she feels intense injury sensations from wounds that don't physically exist, overwhelming her nervous system"
        : id === "synesthesia"    ? "Synesthesia — her senses cross-wire under neural strain: she hears colours, tastes sounds, feels words as textures"
        : id
        ).join("; ")
      : "none";

    const dynamicLabel = villainDynamic === "allies" ? "Allies — united front, complementary threats"
      : villainDynamic === "rivals" ? "Rivals — competing with each other while sharing the captive"
      : villainDynamic === "dominant" ? "Dominant/Submissive — one villain leads, the other defers but has their own agenda"
      : "";

    return {
      hero: selectedHeroes.map((h) => `${h.name} (${h.alias}) — Power: ${h.power} — Universe: ${h.universe}`).join(" | "),
      villain: `${villain} — Scheme: ${villainScheme}${customVillainDetail ? ` | ${customVillainDetail}` : ""}`,
      villainDuo: isVillainDuo && selectedVillain2 ? `SECOND VILLAIN: ${selectedVillain2.name} — Scheme: ${selectedVillain2.scheme} | DYNAMIC: ${dynamicLabel}` : undefined,
      weaknessProfile: selectedWeaknesses.length > 0 ? selectedWeaknesses.join("; ") : undefined,
      setting: settingLabel,
      stakes: stakesLabel,
      weapons: selectedWeapons.join(", ") || "standard powers",
      restraints: allRestraints.join(", ") || "none specified",
      tone: toneLabel || "action-packed",
      captureMethod: captureLabel || "direct confrontation",
      heroState: heroStateLabel || "at full strength",
      storyLength: lengthLabel,
      details: extraDetails,
      powerDegradation: powerDegradation > 0 ? `${degradationLevel} (${powerDegradation}%)${powerDegradationDesc ? ` — ${powerDegradationDesc}` : ""}` : "none",
      traumaState: traumaDesc,
      sensoryOverride: sensoryDesc,
      sensoryScrambler: scramblerDesc,
      captorMarketplace: (() => {
        if (!marketplaceActive || marketplaceCategories.length === 0) return "none";
        const parts: string[] = [];
        if (marketplaceCategories.includes("heroes")) {
          const roleLabel = marketplaceHeroRole === "seller" ? "seller — the hero is being sold to the highest bidder"
            : marketplaceHeroRole === "buyer"    ? "buyer — the villain is acquiring a new captured superhuman"
            : marketplaceHeroRole === "auctioneer" ? "auctioneer — running the sale event, with multiple bidders present"
            : marketplaceHeroRole === "broker"   ? "broker — acting as intermediary between seller and buyer"
            : "participant";
          parts.push(`Heroes Division (${roleLabel})`);
        }
        if (marketplaceCategories.includes("tech")) {
          const techList = marketplaceTech.length > 0 ? marketplaceTech.join(", ") : "unspecified tech";
          parts.push(`Tech Division — merchandise includes: ${techList}`);
        }
        if (marketplaceCategories.includes("information")) {
          const infoList = marketplaceInfo.length > 0 ? marketplaceInfo.join(", ") : "unspecified intelligence";
          parts.push(`Intelligence Division — traded assets include: ${infoList}`);
        }
        return `Black market scenario active — categories: ${parts.join(" | ")}`;
      })(),
    };
  }

  async function streamRequest(endpoint: string, body: object, onChunk: (c: string) => void): Promise<string> {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let full = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const payload = JSON.parse(line.slice(6));
        if (payload.chunk) { full += payload.chunk; onChunk(payload.chunk); bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }
        if (payload.error) throw new Error(payload.error);
      }
    }
    return full;
  }

  async function generateStory() {
    setLoading(true);
    setChapters([]);
    setStreamingText("");
    setError("");
    let accumulated = "";
    try {
      const full = await streamRequest("/api/story/superhero", buildPrompt(), (c) => {
        accumulated += c;
        setStreamingText(accumulated);
      });
      setChapters([full]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Story generation failed");
    } finally {
      setLoading(false);
      setStreamingText("");
    }
  }

  async function continueStory() {
    if (chapters.length === 0) return;
    setContinuing(true);
    setStreamingText("");
    setError("");
    let accumulated = "";
    try {
      const full = await streamRequest("/api/story/superhero-continue", {
        ...buildPrompt(),
        previousStory: story,
        chapterNumber: chapters.length + 1,
        continueDirection: continuePrompt.trim() || "",
      }, (c) => {
        accumulated += c;
        setStreamingText(accumulated);
      });
      setChapters((prev) => [...prev, full]);
      setContinuePrompt("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Continuation failed");
    } finally {
      setContinuing(false);
      setStreamingText("");
    }
  }

  function exportStory() {
    const chapterText = chapters.map((c, i) => `${"═".repeat(50)}\nCHAPTER ${i + 1}\n${"═".repeat(50)}\n\n${c}`).join("\n\n");
    const heroNames = selectedHeroes.map((h) => `${h.name} (${h.alias})`).join(", ");
    const text = `SHADOWWEAVE — SUPERHERO STORY\n${"═".repeat(50)}\n\nHEROES: ${heroNames}\nVILLAIN: ${villainMode === "pick" ? selectedVillain?.name : customVillain}\nSETTING: ${SETTINGS.find((s) => s.id === selectedSetting)?.label}\nSTAKES: ${STAKES.find((s) => s.id === selectedStakes)?.label}\nTONE: ${TONES.find((t) => t.id === storyTone)?.label ?? "standard"}\n\n${chapterText}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const slugFirst = selectedHeroes[0]?.name.replace(/\s+/g, "_") ?? "story";
    a.download = `shadowweave_hero_${slugFirst}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function saveToArchive() {
    if (!chapters.length) return;
    const villainName = villainMode === "pick" ? (selectedVillain?.name ?? "Unknown") : customVillain;
    const heroNames = selectedHeroes.map((h) => h.name);
    const id = saveStoryToArchive({
      title: heroNames.length === 1
        ? `${heroNames[0]} vs ${villainName}`
        : `${heroNames.join(" & ")} vs ${villainName}`,
      universe: selectedHeroes[0]?.universe ?? "Unknown",
      tool: "Heroine Forge",
      characters: [...heroNames, villainName],
      chapters,
    });
    setSavedId(id);
  }

  const stepLabels = ["Choose Hero", "Choose Villain", "Scenario", "Story"];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: isMobile ? "1rem" : "2rem", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: isMobile ? "1rem" : "2rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "0.5rem" }}>
            <div style={{ padding: "0.25rem 0.75rem", background: "linear-gradient(135deg, rgba(255,180,0,0.2), rgba(255,80,0,0.15))", border: "1px solid rgba(255,180,0,0.4)", borderRadius: "20px", fontSize: "0.65rem", color: "#FFB800", fontFamily: "'Montserrat', sans-serif", letterSpacing: "2px", textTransform: "uppercase" }}>
              ⚡ Superhero Mode
            </div>
          </div>
          <h1 className="font-cinzel" style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 900, background: "linear-gradient(135deg, #FFB800 0%, #FF6B00 40%, #FF0080 80%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", letterSpacing: "3px" }}>
            HERO STORY FORGE
          </h1>
        </div>
        <button onClick={onBack} style={{ background: "none", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "0.5rem 1rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s", flexShrink: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(200,200,220,0.8)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(200,200,220,0.4)")}
        >← Back to Studio</button>
      </div>

      {/* ── Step Progress ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: isMobile ? "1.25rem" : "2.5rem", background: "rgba(0,0,0,0.4)", borderRadius: "12px", padding: "0.5rem", border: "1px solid rgba(255,255,255,0.05)" }}>
        {stepLabels.map((label, i) => {
          const num = i + 1 as Step;
          const isActive = step === num;
          const isDone = step > num;
          const canCurrentProceed = step === 1 ? canProceedStep1() : step === 2 ? canProceedStep2() : step === 3 ? canProceedStep3() : false;
          const isNext = num === step + 1 && canCurrentProceed;
          const isClickable = isDone || isNext;
          return (
            <div key={num} style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <button
                onClick={() => {
                  if (isDone) { setStep(num); }
                  else if (isNext) { setStep(num); }
                }}
                disabled={!isClickable}
                style={{
                  flex: 1,
                  padding: "0.625rem 0.5rem",
                  background: isActive
                    ? "linear-gradient(135deg, rgba(255,184,0,0.2), rgba(255,107,0,0.15))"
                    : isNext
                      ? "rgba(255,184,0,0.06)"
                      : "transparent",
                  border: `1px solid ${isActive ? "rgba(255,184,0,0.45)" : isNext ? "rgba(255,184,0,0.18)" : "transparent"}`,
                  borderRadius: "8px",
                  cursor: isClickable ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  justifyContent: "center",
                  transition: "all 0.25s ease",
                  color: "inherit",
                }}
                onMouseEnter={(e) => { if (isNext) { e.currentTarget.style.background = "rgba(255,184,0,0.12)"; e.currentTarget.style.borderColor = "rgba(255,184,0,0.35)"; } }}
                onMouseLeave={(e) => { if (isNext) { e.currentTarget.style.background = "rgba(255,184,0,0.06)"; e.currentTarget.style.borderColor = "rgba(255,184,0,0.18)"; } }}
              >
                <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: isActive ? "rgba(255,184,0,0.3)" : isDone ? "rgba(0,200,100,0.25)" : isNext ? "rgba(255,184,0,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${isActive ? "rgba(255,184,0,0.6)" : isDone ? "rgba(0,200,100,0.5)" : isNext ? "rgba(255,184,0,0.4)" : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", flexShrink: 0 }}>
                  {isDone ? <span style={{ color: "#00C870" }}>✓</span> : <span style={{ color: isActive ? "#FFB800" : isNext ? "rgba(255,184,0,0.7)" : "rgba(200,200,220,0.3)", fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: "0.65rem" }}>{num}</span>}
                </div>
                {!isMobile && (
                  <span className="font-cinzel" style={{ fontSize: "0.65rem", letterSpacing: "1.5px", textTransform: "uppercase", color: isActive ? "#FFB800" : isDone ? "#00C870" : isNext ? "rgba(255,184,0,0.6)" : "rgba(200,200,220,0.3)", whiteSpace: "nowrap" }}>
                    {label}
                  </span>
                )}
              </button>
              {i < stepLabels.length - 1 && (
                <div style={{ width: "20px", height: "1px", background: isDone && step > num + 1 ? "rgba(0,200,100,0.4)" : "rgba(255,255,255,0.08)", flexShrink: 0 }} />
              )}
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════
          STEP 1 — Choose Heroine
      ══════════════════════════════════════════════════════ */}
      {step === 1 && (
        <div>
          {/* Filters */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center", flexDirection: isMobile ? "column" : "row" }}>
            <div style={{ display: "flex", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", overflow: "auto", overflowY: "hidden", width: isMobile ? "100%" : undefined, flexShrink: 0 }}>
              {(["ALL", "MARVEL", "DC", "CW", "TB", "PR", "ANIMATED"] as UniverseFilter[]).map((u, i, arr) => (
                <button key={u} onClick={() => setUniverseFilter(u)} style={{ padding: isMobile ? "0.45rem 0.5rem" : "0.5rem 0.9rem", background: universeFilter === u ? (u === "MARVEL" ? "rgba(220,30,30,0.25)" : u === "DC" ? "rgba(0,100,220,0.25)" : u === "CW" ? "rgba(0,180,100,0.2)" : u === "TB" ? "rgba(200,30,0,0.25)" : u === "PR" ? "rgba(220,0,150,0.25)" : u === "ANIMATED" ? "rgba(160,0,255,0.25)" : "rgba(255,184,0,0.15)") : "transparent", border: "none", borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", color: universeFilter === u ? (u === "MARVEL" ? "#FF6060" : u === "DC" ? "#60A0FF" : u === "CW" ? "#40E090" : u === "TB" ? "#FF3D00" : u === "PR" ? "#FF69B4" : u === "ANIMATED" ? "#C084FC" : "#FFB800") : "rgba(200,200,220,0.35)", fontFamily: "'Cinzel', serif", fontSize: isMobile ? "0.55rem" : "0.68rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                  {u === "ALL" ? "All" : u === "MARVEL" ? "Marvel ✦" : u === "DC" ? "DC ✦" : u === "CW" ? "CW ✦" : u === "PR" ? "Power Rangers ✦" : u === "ANIMATED" ? "Animated ✦" : "The Boys ✦"}
                </button>
              ))}
            </div>
            <div style={{ position: "relative", flex: 1, width: isMobile ? "100%" : undefined, minWidth: isMobile ? undefined : "200px" }}>
              <span style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "rgba(200,200,220,0.3)", fontSize: "0.8rem", pointerEvents: "none" }}>⌕</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search heroes…"
                style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "0.6rem 1rem 0.6rem 2.25rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,184,0,0.4)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
              />
            </div>
            <span style={{ fontSize: "0.7rem", color: "rgba(200,200,220,0.3)", fontFamily: "'Montserrat', sans-serif" }}>{filteredHeroes.length} heroines</span>
          </div>

          {/* Selected heroines chips */}
          {selectedHeroes.length > 0 && (
            <div style={{ marginBottom: "1.25rem", padding: "0.875rem 1.25rem", background: "linear-gradient(135deg, rgba(255,184,0,0.07), rgba(255,107,0,0.05))", border: "1px solid rgba(255,184,0,0.3)", borderRadius: "12px" }}>
              <div className="font-montserrat" style={{ fontSize: "0.55rem", letterSpacing: "2.5px", textTransform: "uppercase", color: "rgba(255,184,0,0.55)", marginBottom: "0.6rem", fontWeight: 700 }}>
                {selectedHeroes.length} Heroine{selectedHeroes.length !== 1 ? "s" : ""} Selected
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {selectedHeroes.map((h) => {
                  const isMarvel = h.universe === "MARVEL";
                  const isCW = h.universe === "CW";
                  const isTB = h.universe === "TB";
                  const isPR = h.universe === "PR";
                  const isAnim = h.universe === "ANIMATED";
                  const col = isMarvel ? "#FF6060" : isCW ? "#40E090" : isTB ? "#FF3D00" : isPR ? "#FF69B4" : isAnim ? "#C084FC" : "#60A0FF";
                  const bg = isMarvel ? "rgba(220,30,30,0.18)" : isCW ? "rgba(0,180,100,0.18)" : isTB ? "rgba(200,30,0,0.18)" : isPR ? "rgba(220,0,150,0.18)" : isAnim ? "rgba(160,0,255,0.18)" : "rgba(0,100,220,0.18)";
                  const bgHover = isMarvel ? "rgba(220,30,30,0.3)" : isCW ? "rgba(0,180,100,0.3)" : isTB ? "rgba(200,30,0,0.3)" : isPR ? "rgba(220,0,150,0.3)" : isAnim ? "rgba(160,0,255,0.3)" : "rgba(0,100,220,0.3)";
                  return (
                    <button
                      key={h.name}
                      onClick={() => toggleHero(h)}
                      title={`Remove ${h.name}`}
                      style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.25rem 0.6rem 0.25rem 0.5rem", background: bg, border: `1px solid ${col}55`, borderRadius: "20px", cursor: "pointer", color: "inherit", transition: "all 0.2s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = bgHover; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = bg; }}
                    >
                      <span style={{ fontSize: "0.7rem", color: col, fontFamily: "'Cinzel', serif", fontWeight: 700 }}>{h.name}</span>
                      <span style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.45)", lineHeight: 1 }}>✕</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hero grid */}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? "140px" : "200px"}, 1fr))`, gap: "0.625rem", maxHeight: "520px", overflowY: "auto", paddingRight: "4px", scrollbarWidth: "thin", scrollbarColor: "rgba(255,184,0,0.3) transparent" }}>
            {filteredHeroes.map((hero) => {
              const isMarvel = hero.universe === "MARVEL";
              const isCW = hero.universe === "CW";
              const isTB = hero.universe === "TB";
              const isPR = hero.universe === "PR";
              const isAnim = hero.universe === "ANIMATED";
              const isSelected = selectedHeroes.some((h) => h.name === hero.name);
              const accentColor = isMarvel ? "#FF6060" : isCW ? "#40E090" : isTB ? "#FF3D00" : isPR ? "#FF69B4" : isAnim ? "#C084FC" : "#60A0FF";
              const accentBg = isMarvel ? "rgba(220,30,30,0.15)" : isCW ? "rgba(0,180,100,0.12)" : isTB ? "rgba(200,30,0,0.15)" : isPR ? "rgba(220,0,150,0.13)" : isAnim ? "rgba(160,0,255,0.13)" : "rgba(0,100,220,0.15)";
              const selectedBg = isMarvel ? "rgba(220,30,30,0.2)" : isCW ? "rgba(0,180,100,0.18)" : isTB ? "rgba(200,30,0,0.2)" : isPR ? "rgba(220,0,150,0.2)" : isAnim ? "rgba(160,0,255,0.2)" : "rgba(0,100,220,0.2)";
              return (
                <button
                  key={`${hero.universe}-${hero.name}`}
                  onClick={() => toggleHero(hero)}
                  style={{
                    background: isSelected ? selectedBg : "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(10px)",
                    border: `1px solid ${isSelected ? accentColor : "rgba(255,255,255,0.06)"}`,
                    borderRadius: "12px",
                    padding: "0.875rem",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    color: "inherit",
                    position: "relative",
                    boxShadow: isSelected ? `0 0 16px ${accentColor}44` : "none",
                  }}
                  onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.borderColor = `${accentColor}60`; e.currentTarget.style.background = accentBg; } }}
                  onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(0,0,0,0.5)"; } }}
                >
                  {isSelected && <div style={{ position: "absolute", top: "0.4rem", right: "0.4rem", width: "18px", height: "18px", borderRadius: "50%", background: accentColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "#000", zIndex: 2, fontWeight: 700 }}>✓</div>}
                  {/* Portrait image tile */}
                  <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", borderRadius: "8px", overflow: "hidden", marginBottom: "0.55rem", background: "rgba(0,0,0,0.4)" }}>
                    <img
                      src={heroImg(hero.name)}
                      alt={hero.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${isSelected ? accentColor + "33" : "rgba(0,0,0,0.45)"} 0%, transparent 55%)`, pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: "0.4rem", left: "0.4rem", fontSize: "0.5rem", color: accentColor, fontFamily: "'Montserrat', sans-serif", letterSpacing: "1.5px", fontWeight: 700, textTransform: "uppercase" }}>{hero.universe}</div>
                  </div>
                  <div className="font-cinzel" style={{ fontSize: "0.72rem", color: isSelected ? accentColor : "#E8E8F0", fontWeight: 700, marginBottom: "0.15rem", lineHeight: 1.3 }}>{hero.name}</div>
                  <div style={{ fontSize: "0.58rem", color: "rgba(200,200,220,0.38)", fontFamily: "'Montserrat', sans-serif", marginBottom: "0.3rem" }}>{hero.alias}</div>
                  <div style={{ fontSize: "0.6rem", color: "rgba(200,200,220,0.5)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.4 }}>{hero.power}</div>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => canProceedStep1() && setStep(2)}
              disabled={!canProceedStep1()}
              style={{ padding: "0.875rem 2.5rem", background: canProceedStep1() ? "linear-gradient(135deg, rgba(255,184,0,0.25), rgba(255,107,0,0.2))" : "rgba(255,255,255,0.04)", border: `1px solid ${canProceedStep1() ? "rgba(255,184,0,0.5)" : "rgba(255,255,255,0.07)"}`, borderRadius: "12px", color: canProceedStep1() ? "#FFB800" : "rgba(200,200,220,0.25)", fontFamily: "'Cinzel', serif", fontSize: "0.9rem", letterSpacing: "3px", textTransform: "uppercase", cursor: canProceedStep1() ? "pointer" : "not-allowed", transition: "all 0.3s ease", boxShadow: canProceedStep1() ? "0 4px 20px rgba(255,184,0,0.2)" : "none" }}
              onMouseEnter={(e) => { if (canProceedStep1()) e.currentTarget.style.boxShadow = "0 8px 30px rgba(255,184,0,0.35)"; }}
              onMouseLeave={(e) => { if (canProceedStep1()) e.currentTarget.style.boxShadow = "0 4px 20px rgba(255,184,0,0.2)"; }}
            >
              Choose Villain →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          STEP 2 — Choose Villain
      ══════════════════════════════════════════════════════ */}
      {step === 2 && (
        <div>
          {/* Solo / Duo toggle */}
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", alignItems: "center" }}>
            <div style={{ display: "flex", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", overflow: "hidden" }}>
              {([false, true] as const).map((duo) => (
                <button key={String(duo)} onClick={() => { setIsVillainDuo(duo); if (!duo) { setSelectedVillain2(null); setVillainDynamic(""); } }} style={{ padding: "0.5rem 1.25rem", background: isVillainDuo === duo ? "rgba(200,0,50,0.22)" : "transparent", border: "none", borderRight: !duo ? "1px solid rgba(255,255,255,0.06)" : "none", color: isVillainDuo === duo ? "#FF4060" : "rgba(200,200,220,0.35)", fontFamily: "'Cinzel', serif", fontSize: "0.72rem", cursor: "pointer", letterSpacing: "1.5px", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                  {duo ? "⚔ Villain Duo" : "Solo Villain"}
                </button>
              ))}
            </div>
            {isVillainDuo && <span style={{ fontSize: "0.65rem", color: "rgba(200,0,50,0.5)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1px" }}>Pick two villains + a dynamic</span>}
          </div>

          {/* Mode tabs */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            {(["pick", "custom"] as const).map((mode) => (
              <button key={mode} onClick={() => setVillainMode(mode)} style={{ padding: "0.5rem 1.25rem", background: villainMode === mode ? "rgba(200,0,50,0.2)" : "rgba(0,0,0,0.35)", border: `1px solid ${villainMode === mode ? "rgba(200,0,50,0.5)" : "rgba(255,255,255,0.07)"}`, borderRadius: "8px", color: villainMode === mode ? "#FF4060" : "rgba(200,200,220,0.4)", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", cursor: "pointer", letterSpacing: "1.5px", transition: "all 0.2s" }}>
                {mode === "pick" ? "Choose from List" : "Create Custom Villain"}
              </button>
            ))}
          </div>

          {isVillainDuo && <div style={{ fontSize: "0.6rem", color: "#FF4060", fontFamily: "'Montserrat', sans-serif", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.5rem" }}>▸ Villain 1</div>}

          {villainMode === "pick" ? (
            <>
              {/* Villain 1 universe filter */}
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", alignItems: "center", flexWrap: "wrap", flexDirection: isMobile ? "column" : "row" }}>
                <div style={{ display: "flex", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", overflow: "auto", overflowY: "hidden", width: isMobile ? "100%" : undefined }}>
                  {(["ALL", "Marvel", "DC", "CW", "TB", "PR", "Animated"] as VillainFilter[]).map((v, i, arr) => (
                    <button key={v} onClick={() => setVillainFilter(v)} style={{ padding: isMobile ? "0.45rem 0.5rem" : "0.5rem 0.85rem", background: villainFilter === v ? (v === "Marvel" ? "rgba(220,30,30,0.25)" : v === "DC" ? "rgba(0,100,220,0.25)" : v === "CW" ? "rgba(0,180,100,0.2)" : v === "TB" ? "rgba(200,30,0,0.25)" : v === "PR" ? "rgba(220,0,150,0.25)" : v === "Animated" ? "rgba(160,0,255,0.25)" : "rgba(200,0,50,0.15)") : "transparent", border: "none", borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", color: villainFilter === v ? (v === "Marvel" ? "#FF6060" : v === "DC" ? "#60A0FF" : v === "CW" ? "#40E090" : v === "TB" ? "#FF3D00" : v === "PR" ? "#FF69B4" : v === "Animated" ? "#C084FC" : "#FF4060") : "rgba(200,200,220,0.35)", fontFamily: "'Cinzel', serif", fontSize: isMobile ? "0.55rem" : "0.68rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                      {v === "ALL" ? "All" : v === "Marvel" ? "Marvel ✦" : v === "DC" ? "DC ✦" : v === "CW" ? "CW ✦" : v === "PR" ? "Power Rangers ✦" : v === "Animated" ? "Animated ✦" : "The Boys ✦"}
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: "0.7rem", color: "rgba(200,200,220,0.3)", fontFamily: "'Montserrat', sans-serif" }}>
                  {VILLAINS.filter((v) => villainFilter === "ALL" || v.universe === villainFilter).length} villains
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? "140px" : "200px"}, 1fr))`, gap: "0.625rem", maxHeight: isVillainDuo ? "320px" : "520px", overflowY: "auto", paddingRight: "4px", scrollbarWidth: "thin", scrollbarColor: "rgba(200,0,50,0.3) transparent" }}>
                {VILLAINS.filter((v) => villainFilter === "ALL" || v.universe === villainFilter).map((villain) => {
                  const isSelected = selectedVillain?.name === villain.name;
                  const isMv = villain.universe === "Marvel";
                  const isCW = villain.universe === "CW";
                  const isTB = villain.universe === "TB";
                  const isPR = villain.universe === "PR";
                  const isAnimV = villain.universe === "Animated";
                  const accentColor = isMv ? "#FF6060" : isCW ? "#40E090" : isTB ? "#FF3D00" : isPR ? "#FF69B4" : isAnimV ? "#C084FC" : "#60A0FF";
                  const accentBg   = isMv ? "rgba(220,30,30,0.18)" : isCW ? "rgba(0,180,100,0.15)" : isTB ? "rgba(200,30,0,0.18)" : isPR ? "rgba(220,0,150,0.15)" : isAnimV ? "rgba(160,0,255,0.15)" : "rgba(0,100,220,0.18)";
                  const isV2Taken = selectedVillain2?.name === villain.name;
                  return (
                    <button
                      key={villain.name}
                      onClick={() => !isV2Taken && setSelectedVillain(villain)}
                      style={{ background: isSelected ? "rgba(200,0,50,0.22)" : "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", border: `1px solid ${isSelected ? "rgba(200,0,50,0.65)" : "rgba(255,255,255,0.06)"}`, borderRadius: "12px", padding: "0.875rem", cursor: isV2Taken ? "not-allowed" : "pointer", textAlign: "left", transition: "all 0.2s ease", color: "inherit", position: "relative", boxShadow: isSelected ? "0 0 16px rgba(200,0,50,0.35)" : "none", opacity: isV2Taken ? 0.3 : 1 }}
                      onMouseEnter={(e) => { if (!isSelected && !isV2Taken) { e.currentTarget.style.borderColor = "rgba(200,0,50,0.35)"; e.currentTarget.style.background = accentBg; } }}
                      onMouseLeave={(e) => { if (!isSelected && !isV2Taken) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(0,0,0,0.5)"; } }}
                    >
                      {isSelected && <div style={{ position: "absolute", top: "0.4rem", right: "0.4rem", width: "18px", height: "18px", borderRadius: "50%", background: "#FF4060", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "#fff", zIndex: 2, fontWeight: 700 }}>1</div>}
                      <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", borderRadius: "8px", overflow: "hidden", marginBottom: "0.55rem", background: "rgba(30,0,0,0.6)" }}>
                        <img src={villainImg(villain.name)} alt={villain.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${isSelected ? "rgba(200,0,50,0.45)" : "rgba(0,0,0,0.55)"} 0%, transparent 55%)`, pointerEvents: "none" }} />
                        <div style={{ position: "absolute", bottom: "0.4rem", left: "0.4rem", fontSize: "0.5rem", color: accentColor, fontFamily: "'Montserrat', sans-serif", letterSpacing: "1.5px", fontWeight: 700, textTransform: "uppercase" }}>{villain.universe}</div>
                      </div>
                      <div className="font-cinzel" style={{ fontSize: "0.72rem", color: isSelected ? "#FF4060" : "#E8E8F0", fontWeight: 700, marginBottom: "0.15rem", lineHeight: 1.3 }}>{villain.name}</div>
                      <div style={{ fontSize: "0.6rem", color: "rgba(200,200,220,0.48)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.4 }}>{villain.scheme}</div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(200,0,50,0.2)", borderRadius: "16px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ fontSize: "0.55rem", color: "rgba(200,0,50,0.5)", letterSpacing: "2.5px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", fontWeight: 700, borderBottom: "1px solid rgba(200,0,50,0.12)", paddingBottom: "0.75rem" }}>◈ Custom Villain Builder</div>

              {/* Name */}
              <div>
                <label style={{ fontSize: "0.6rem", color: "rgba(200,0,50,0.55)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", display: "block", marginBottom: "0.4rem" }}>Villain Name <span style={{ color: "#FF4060" }}>*</span></label>
                <input value={customVillain} onChange={(e) => setCustomVillain(e.target.value)} placeholder="e.g. The Shadow Architect, Malachite, Emperor Zero…"
                  style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "0.65rem 0.875rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(200,0,50,0.5)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>

              {/* Franchise / Universe */}
              <div>
                <label style={{ fontSize: "0.6rem", color: "rgba(200,0,50,0.55)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", display: "block", marginBottom: "0.4rem" }}>Franchise / Universe</label>
                <input value={customVillainFranchise} onChange={(e) => setCustomVillainFranchise(e.target.value)} placeholder="e.g. Original, Star Wars, Doctor Who, Anime, Fantasy…"
                  style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "0.65rem 0.875rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(200,0,50,0.4)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>

              {/* Scheme / Motivation */}
              <div>
                <label style={{ fontSize: "0.6rem", color: "rgba(200,0,50,0.55)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", display: "block", marginBottom: "0.4rem" }}>Scheme / Motivation</label>
                <textarea value={customVillainScheme} onChange={(e) => setCustomVillainScheme(e.target.value)} placeholder="What does this villain want? What is their ultimate goal?"
                  rows={2}
                  style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "0.65rem 0.875rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", resize: "vertical", lineHeight: 1.5 }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(200,0,50,0.4)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>

              {/* Powers */}
              <div>
                <label style={{ fontSize: "0.6rem", color: "rgba(200,0,50,0.55)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", display: "block", marginBottom: "0.4rem" }}>Powers / Abilities</label>
                <textarea value={customVillainPowers} onChange={(e) => setCustomVillainPowers(e.target.value)} placeholder="e.g. reality manipulation, telepathy, enhanced strength, advanced technology…"
                  rows={2}
                  style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "0.65rem 0.875rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", resize: "vertical", lineHeight: 1.5 }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(200,0,50,0.4)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>

              {/* Personality chips */}
              <div>
                <label style={{ fontSize: "0.6rem", color: "rgba(200,0,50,0.55)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", display: "block", marginBottom: "0.5rem" }}>Personality Traits</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {["Cold & Calculating", "Charismatic", "Manipulative", "Sadistic", "Theatrical", "Obsessive", "Honorable", "Ruthless", "Cunning", "Wrathful", "Philosophical", "Unpredictable"].map((trait) => {
                    const sel = customVillainPersonality.includes(trait);
                    return (
                      <button key={trait} onClick={() => setCustomVillainPersonality((prev) => sel ? prev.filter((t) => t !== trait) : [...prev, trait])}
                        style={{ padding: "0.3rem 0.7rem", background: sel ? "rgba(200,0,50,0.25)" : "rgba(0,0,0,0.4)", border: `1px solid ${sel ? "rgba(200,0,50,0.55)" : "rgba(255,255,255,0.07)"}`, borderRadius: "20px", color: sel ? "#FF4060" : "rgba(200,200,220,0.4)", fontSize: "0.65rem", fontFamily: "'Montserrat', sans-serif", cursor: "pointer", transition: "all 0.15s" }}>
                        {trait}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Villain 2 picker (duo mode only) ── */}
          {isVillainDuo && villainMode === "pick" && (
            <div style={{ marginTop: "1.25rem" }}>
              <div style={{ fontSize: "0.6rem", color: "#FF6060", fontFamily: "'Montserrat', sans-serif", letterSpacing: "2px", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.5rem" }}>▸ Villain 2</div>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.875rem", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "flex", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", overflow: "auto", overflowY: "hidden" }}>
                  {(["ALL", "Marvel", "DC", "CW", "TB", "PR", "Animated"] as VillainFilter[]).map((v, i, arr) => (
                    <button key={v} onClick={() => setVillainFilter2(v)} style={{ padding: isMobile ? "0.45rem 0.5rem" : "0.5rem 0.85rem", background: villainFilter2 === v ? (v === "Marvel" ? "rgba(220,30,30,0.25)" : v === "DC" ? "rgba(0,100,220,0.25)" : v === "CW" ? "rgba(0,180,100,0.2)" : v === "TB" ? "rgba(200,30,0,0.25)" : v === "PR" ? "rgba(220,0,150,0.25)" : v === "Animated" ? "rgba(160,0,255,0.25)" : "rgba(200,0,50,0.15)") : "transparent", border: "none", borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", color: villainFilter2 === v ? (v === "Marvel" ? "#FF6060" : v === "DC" ? "#60A0FF" : v === "CW" ? "#40E090" : v === "TB" ? "#FF3D00" : v === "PR" ? "#FF69B4" : v === "Animated" ? "#C084FC" : "#FF4060") : "rgba(200,200,220,0.35)", fontFamily: "'Cinzel', serif", fontSize: isMobile ? "0.55rem" : "0.68rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                      {v === "ALL" ? "All" : v === "Marvel" ? "Marvel ✦" : v === "DC" ? "DC ✦" : v === "CW" ? "CW ✦" : v === "PR" ? "Power Rangers ✦" : v === "Animated" ? "Animated ✦" : "The Boys ✦"}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? "140px" : "200px"}, 1fr))`, gap: "0.625rem", maxHeight: "280px", overflowY: "auto", paddingRight: "4px", scrollbarWidth: "thin", scrollbarColor: "rgba(200,0,50,0.3) transparent" }}>
                {VILLAINS.filter((v) => (villainFilter2 === "ALL" || v.universe === villainFilter2) && v.name !== selectedVillain?.name).map((villain) => {
                  const isSel2 = selectedVillain2?.name === villain.name;
                  const isMv = villain.universe === "Marvel"; const isCW = villain.universe === "CW"; const isTB = villain.universe === "TB"; const isPR2 = villain.universe === "PR"; const isAnimV2 = villain.universe === "Animated";
                  const accentColor = isMv ? "#FF6060" : isCW ? "#40E090" : isTB ? "#FF3D00" : isPR2 ? "#FF69B4" : isAnimV2 ? "#C084FC" : "#60A0FF";
                  const accentBg = isMv ? "rgba(220,30,30,0.18)" : isCW ? "rgba(0,180,100,0.15)" : isTB ? "rgba(200,30,0,0.18)" : isPR2 ? "rgba(220,0,150,0.15)" : isAnimV2 ? "rgba(160,0,255,0.15)" : "rgba(0,100,220,0.18)";
                  return (
                    <button key={villain.name} onClick={() => setSelectedVillain2(villain)}
                      style={{ background: isSel2 ? "rgba(200,0,50,0.22)" : "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", border: `1px solid ${isSel2 ? "rgba(200,0,50,0.65)" : "rgba(255,255,255,0.06)"}`, borderRadius: "12px", padding: "0.875rem", cursor: "pointer", textAlign: "left", transition: "all 0.2s ease", color: "inherit", position: "relative", boxShadow: isSel2 ? "0 0 16px rgba(200,0,50,0.35)" : "none" }}
                      onMouseEnter={(e) => { if (!isSel2) { e.currentTarget.style.borderColor = "rgba(200,0,50,0.35)"; e.currentTarget.style.background = accentBg; } }}
                      onMouseLeave={(e) => { if (!isSel2) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(0,0,0,0.5)"; } }}
                    >
                      {isSel2 && <div style={{ position: "absolute", top: "0.4rem", right: "0.4rem", width: "18px", height: "18px", borderRadius: "50%", background: "#FF4060", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "#fff", zIndex: 2, fontWeight: 700 }}>2</div>}
                      <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", borderRadius: "8px", overflow: "hidden", marginBottom: "0.55rem", background: "rgba(30,0,0,0.6)" }}>
                        <img src={villainImg(villain.name)} alt={villain.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${isSel2 ? "rgba(200,0,50,0.45)" : "rgba(0,0,0,0.55)"} 0%, transparent 55%)`, pointerEvents: "none" }} />
                        <div style={{ position: "absolute", bottom: "0.4rem", left: "0.4rem", fontSize: "0.5rem", color: accentColor, fontFamily: "'Montserrat', sans-serif", letterSpacing: "1.5px", fontWeight: 700, textTransform: "uppercase" }}>{villain.universe}</div>
                      </div>
                      <div className="font-cinzel" style={{ fontSize: "0.72rem", color: isSel2 ? "#FF4060" : "#E8E8F0", fontWeight: 700, marginBottom: "0.15rem", lineHeight: 1.3 }}>{villain.name}</div>
                      <div style={{ fontSize: "0.6rem", color: "rgba(200,200,220,0.48)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.4 }}>{villain.scheme}</div>
                    </button>
                  );
                })}
              </div>

              {/* Villain Dynamic selector */}
              <div style={{ marginTop: "1.25rem", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,80,0,0.2)", borderRadius: "14px", padding: "1.25rem" }}>
                <div className="font-cinzel" style={{ fontSize: "0.65rem", color: "#FF6400", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "0.875rem" }}>Villain Dynamic</div>
                <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
                  {([
                    { id: "allies",   label: "Allies",              desc: "United front — complementary threats, seamless coordination",    icon: "🤝" },
                    { id: "rivals",   label: "Rivals",              desc: "Competing for control of the captive — tension creates crossfire", icon: "⚔" },
                    { id: "dominant", label: "Dominant / Submissive", desc: "One leads with authority, the other defers but has their own agenda", icon: "👑" },
                  ] as { id: "allies" | "rivals" | "dominant"; label: string; desc: string; icon: string }[]).map((d) => {
                    const isSel = villainDynamic === d.id;
                    return (
                      <button key={d.id} onClick={() => setVillainDynamic(isSel ? "" : d.id)} style={{ flex: 1, minWidth: "140px", padding: "0.875rem 1rem", background: isSel ? "rgba(255,100,0,0.18)" : "rgba(0,0,0,0.4)", border: `1px solid ${isSel ? "rgba(255,100,0,0.5)" : "rgba(255,255,255,0.06)"}`, borderRadius: "12px", cursor: "pointer", textAlign: "left", transition: "all 0.2s", color: "inherit" }}
                        onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.borderColor = "rgba(255,100,0,0.3)"; }}
                        onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                      >
                        <div style={{ fontSize: "1.2rem", marginBottom: "0.3rem" }}>{d.icon}</div>
                        <div className="font-cinzel" style={{ fontSize: "0.73rem", color: isSel ? "#FF6400" : "#E8E8F0", fontWeight: 700, marginBottom: "0.2rem" }}>{d.label}</div>
                        <div style={{ fontSize: "0.6rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Montserrat', sans-serif", lineHeight: 1.4 }}>{d.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setStep(1)} style={{ padding: "0.75rem 1.5rem", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "rgba(200,200,220,0.4)", fontFamily: "'Cinzel', serif", fontSize: "0.8rem", cursor: "pointer", letterSpacing: "1.5px" }}>← Back</button>
            <button onClick={() => canProceedStep2() && setStep(3)} disabled={!canProceedStep2()} style={{ padding: "0.875rem 2.5rem", background: canProceedStep2() ? "rgba(200,0,50,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${canProceedStep2() ? "rgba(200,0,50,0.5)" : "rgba(255,255,255,0.07)"}`, borderRadius: "12px", color: canProceedStep2() ? "#FF4060" : "rgba(200,200,220,0.25)", fontFamily: "'Cinzel', serif", fontSize: "0.9rem", letterSpacing: "3px", textTransform: "uppercase", cursor: canProceedStep2() ? "pointer" : "not-allowed", transition: "all 0.3s ease" }}>
              Set Scenario →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          STEP 3 — Scenario Details
      ══════════════════════════════════════════════════════ */}
      {step === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Setting */}
          <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "1.5rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.7rem", color: "#FFB800", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "1rem" }}>Battle Setting</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "0.625rem" }}>
              {SETTINGS.map((s) => {
                const isSel = selectedSetting === s.id;
                return (
                  <button key={s.id} onClick={() => setSelectedSetting(s.id)} style={{ background: isSel ? "rgba(255,184,0,0.15)" : "rgba(0,0,0,0.4)", border: `1px solid ${isSel ? "rgba(255,184,0,0.55)" : "rgba(255,255,255,0.06)"}`, borderRadius: "12px", padding: "1rem 0.875rem", cursor: "pointer", textAlign: "left", transition: "all 0.2s", color: "inherit", boxShadow: isSel ? "0 0 14px rgba(255,184,0,0.2)" : "none" }}
                    onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.borderColor = "rgba(255,184,0,0.3)"; }}
                    onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                  >
                    <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>{s.icon}</div>
                    <div className="font-cinzel" style={{ fontSize: "0.78rem", color: isSel ? "#FFB800" : "#E8E8F0", fontWeight: 700, marginBottom: "0.2rem" }}>{s.label}</div>
                    <div style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Montserrat', sans-serif" }}>{s.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stakes */}
          <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "1.5rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.7rem", color: "#FF4060", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "1rem" }}>What's at Stake</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "0.625rem" }}>
              {STAKES.map((s) => {
                const isSel = selectedStakes === s.id;
                return (
                  <button key={s.id} onClick={() => setSelectedStakes(s.id)} style={{ background: isSel ? "rgba(200,0,50,0.15)" : "rgba(0,0,0,0.4)", border: `1px solid ${isSel ? "rgba(200,0,50,0.55)" : "rgba(255,255,255,0.06)"}`, borderRadius: "12px", padding: "0.875rem", cursor: "pointer", textAlign: "center", transition: "all 0.2s", color: "inherit", boxShadow: isSel ? "0 0 14px rgba(200,0,50,0.2)" : "none" }}
                    onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.borderColor = "rgba(200,0,50,0.3)"; }}
                    onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                  >
                    <div style={{ fontSize: "1.3rem", marginBottom: "0.4rem" }}>{s.icon}</div>
                    <div className="font-cinzel" style={{ fontSize: "0.75rem", color: isSel ? "#FF4060" : "#E8E8F0", fontWeight: 700 }}>{s.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Story Tone */}
          <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "1.5rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.7rem", color: "#60A0FF", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "1rem" }}>Story Tone <span style={{ color: "rgba(200,200,220,0.3)", fontWeight: 400 }}>(optional)</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "0.625rem" }}>
              {TONES.map((t) => {
                const isSel = storyTone === t.id;
                return (
                  <button key={t.id} onClick={() => setStoryTone(isSel ? "" : t.id)} style={{ background: isSel ? "rgba(96,160,255,0.18)" : "rgba(0,0,0,0.4)", border: `1px solid ${isSel ? "rgba(96,160,255,0.55)" : "rgba(255,255,255,0.06)"}`, borderRadius: "12px", padding: "0.875rem", cursor: "pointer", textAlign: "left", transition: "all 0.2s", color: "inherit", boxShadow: isSel ? "0 0 14px rgba(96,160,255,0.2)" : "none" }}
                    onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.borderColor = "rgba(96,160,255,0.3)"; }}
                    onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                  >
                    <div style={{ fontSize: "1.2rem", marginBottom: "0.4rem" }}>{t.icon}</div>
                    <div className="font-cinzel" style={{ fontSize: "0.75rem", color: isSel ? "#60A0FF" : "#E8E8F0", fontWeight: 700, marginBottom: "0.25rem" }}>{t.label}</div>
                    <div style={{ fontSize: "0.63rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Montserrat', sans-serif" }}>{t.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── CAPTOR MARKETPLACE ── */}
          {(() => {
            const HERO_ROLES = [
              { id: "seller",     icon: "🔨", label: "Seller",     desc: "The villain auctions the hero to the highest bidder" },
              { id: "buyer",      icon: "💰", label: "Buyer",      desc: "The villain is acquiring a captured superhuman" },
              { id: "auctioneer", icon: "📣", label: "Auctioneer", desc: "Running the event — multiple bidders in the room" },
              { id: "broker",     icon: "🤝", label: "Broker",     desc: "Intermediary dealing between seller and buyer" },
            ];
            const TECH_ITEMS = [
              "Power-Dampening Collars", "Neural Override Devices", "Tracking Implants",
              "Custom Restraint Systems", "Suppression Field Emitters", "Biometric Cuffs",
              "Psionic Blockers", "Anti-Flight Harnesses",
            ];
            const INFO_ITEMS = [
              "Secret Identity Files", "Faction Weakness Dossiers", "Hero Location Intel",
              "Intercepted Comms", "Psychological Profiles", "Alliance Maps", "Safe-House Coordinates",
            ];
            const catToggle = (id: string) =>
              setMarketplaceCategories((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
            const techToggle = (item: string) =>
              setMarketplaceTech((prev) => prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]);
            const infoToggle = (item: string) =>
              setMarketplaceInfo((prev) => prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]);
            const hasHeroes = marketplaceCategories.includes("heroes");
            const hasTech   = marketplaceCategories.includes("tech");
            const hasInfo   = marketplaceCategories.includes("information");

            return (
              <div style={{ background: marketplaceActive ? "rgba(20,8,0,0.6)" : "rgba(0,0,0,0.4)", border: `1px solid ${marketplaceActive ? "rgba(255,140,0,0.35)" : "rgba(255,255,255,0.06)"}`, borderRadius: "16px", padding: "1.5rem", transition: "all 0.3s" }}>
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: marketplaceActive ? "1.5rem" : "0" }}>
                  <div>
                    <div className="font-cinzel" style={{ fontSize: "0.7rem", color: marketplaceActive ? "#FF9020" : "rgba(255,140,0,0.4)", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "0.2rem", transition: "color 0.3s" }}>
                      🏴 Captor Marketplace
                    </div>
                    <div style={{ fontSize: "0.62rem", color: "rgba(200,200,220,0.28)", fontFamily: "'Montserrat', sans-serif" }}>
                      A black market where captors trade heroes, tech &amp; intelligence
                    </div>
                  </div>
                  <button
                    onClick={() => { setMarketplaceActive((v) => !v); if (marketplaceActive) { setMarketplaceCategories([]); setMarketplaceHeroRole(""); setMarketplaceTech([]); setMarketplaceInfo([]); } }}
                    style={{ padding: "0.35rem 0.875rem", background: marketplaceActive ? "rgba(255,140,0,0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${marketplaceActive ? "rgba(255,140,0,0.5)" : "rgba(255,255,255,0.1)"}`, borderRadius: "20px", color: marketplaceActive ? "#FF9020" : "rgba(200,200,220,0.35)", fontFamily: "'Cinzel', serif", fontSize: "0.62rem", letterSpacing: "1.5px", cursor: "pointer", transition: "all 0.25s", whiteSpace: "nowrap" }}
                  >
                    {marketplaceActive ? "✦ ACTIVE" : "ENABLE"}
                  </button>
                </div>

                {marketplaceActive && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {/* ─ Category cards ─ */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
                      {[
                        { id: "heroes",      icon: "🦸",  label: "Heroes Division",   desc: "Sell, buy, or broker captured superhumans on the open market",          col: "#FF4060", bg: "rgba(200,0,50,0.14)",   border: "rgba(255,64,96,0.5)" },
                        { id: "tech",        icon: "⚙️",  label: "Tech Division",      desc: "Acquire advanced restraints, power-dampeners, and containment systems", col: "#40B0FF", bg: "rgba(0,100,200,0.14)",  border: "rgba(64,176,255,0.5)" },
                        { id: "information", icon: "📂",  label: "Intelligence Division", desc: "Trade secrets — identities, faction intel, and psychological profiles",  col: "#FFB800", bg: "rgba(200,140,0,0.14)", border: "rgba(255,184,0,0.5)" },
                      ].map((cat) => {
                        const isSel = marketplaceCategories.includes(cat.id);
                        return (
                          <button
                            key={cat.id}
                            onClick={() => catToggle(cat.id)}
                            style={{ background: isSel ? cat.bg : "rgba(0,0,0,0.5)", border: `1px solid ${isSel ? cat.border : "rgba(255,255,255,0.06)"}`, borderRadius: "12px", padding: "1rem", cursor: "pointer", textAlign: "left", color: "inherit", transition: "all 0.25s", boxShadow: isSel ? `0 0 18px ${cat.col}20` : "none", position: "relative" }}
                            onMouseEnter={(e) => { if (!isSel) { e.currentTarget.style.borderColor = cat.border.replace("0.5","0.2"); e.currentTarget.style.background = cat.bg.replace("0.14","0.06"); } }}
                            onMouseLeave={(e) => { if (!isSel) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(0,0,0,0.5)"; } }}
                          >
                            {isSel && <div style={{ position: "absolute", top: "0.5rem", right: "0.5rem", width: "16px", height: "16px", borderRadius: "50%", background: cat.col, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.5rem", color: "#000", fontWeight: 700 }}>✓</div>}
                            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem", filter: isSel ? `drop-shadow(0 0 8px ${cat.col})` : "none", transition: "filter 0.3s" }}>{cat.icon}</div>
                            <div className="font-cinzel" style={{ fontSize: "0.75rem", fontWeight: 700, color: isSel ? cat.col : "#D0D0E8", marginBottom: "0.3rem" }}>{cat.label}</div>
                            <div style={{ fontSize: "0.62rem", color: "rgba(200,200,220,0.42)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.6 }}>{cat.desc}</div>
                          </button>
                        );
                      })}
                    </div>

                    {/* ─ Heroes sub-panel ─ */}
                    {hasHeroes && (
                      <div style={{ background: "rgba(200,0,50,0.06)", border: "1px solid rgba(255,64,96,0.2)", borderRadius: "12px", padding: "1rem" }}>
                        <div className="font-cinzel" style={{ fontSize: "0.62rem", color: "rgba(255,64,96,0.7)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "0.75rem" }}>🦸 Your Role in the Transaction</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                          {HERO_ROLES.map((r) => {
                            const isSel = marketplaceHeroRole === r.id;
                            return (
                              <button key={r.id} onClick={() => setMarketplaceHeroRole(isSel ? "" : r.id)} style={{ padding: "0.5rem 1rem", background: isSel ? "rgba(200,0,50,0.22)" : "rgba(0,0,0,0.4)", border: `1px solid ${isSel ? "rgba(255,64,96,0.55)" : "rgba(255,255,255,0.08)"}`, borderRadius: "20px", color: isSel ? "#FF4060" : "rgba(200,200,220,0.5)", fontFamily: "'Cinzel', serif", fontSize: "0.72rem", cursor: "pointer", transition: "all 0.2s", textAlign: "left" }}>
                                <span style={{ marginRight: "0.3rem" }}>{r.icon}</span>{r.label}
                              </button>
                            );
                          })}
                        </div>
                        {marketplaceHeroRole && (
                          <div style={{ marginTop: "0.625rem", fontSize: "0.63rem", color: "rgba(255,64,96,0.55)", fontFamily: "'Raleway', sans-serif" }}>
                            {HERO_ROLES.find((r) => r.id === marketplaceHeroRole)?.desc}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ─ Tech sub-panel ─ */}
                    {hasTech && (
                      <div style={{ background: "rgba(0,100,200,0.06)", border: "1px solid rgba(64,176,255,0.2)", borderRadius: "12px", padding: "1rem" }}>
                        <div className="font-cinzel" style={{ fontSize: "0.62rem", color: "rgba(64,176,255,0.7)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "0.75rem" }}>⚙️ Available Merchandise</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                          {TECH_ITEMS.map((item) => {
                            const isSel = marketplaceTech.includes(item);
                            return (
                              <button key={item} onClick={() => techToggle(item)} style={{ padding: "0.4rem 0.875rem", background: isSel ? "rgba(0,100,200,0.22)" : "rgba(0,0,0,0.4)", border: `1px solid ${isSel ? "rgba(64,176,255,0.55)" : "rgba(255,255,255,0.08)"}`, borderRadius: "20px", color: isSel ? "#40B0FF" : "rgba(200,200,220,0.45)", fontFamily: "'Montserrat', sans-serif", fontSize: "0.68rem", cursor: "pointer", transition: "all 0.2s" }}>{item}</button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ─ Information sub-panel ─ */}
                    {hasInfo && (
                      <div style={{ background: "rgba(200,140,0,0.06)", border: "1px solid rgba(255,184,0,0.2)", borderRadius: "12px", padding: "1rem" }}>
                        <div className="font-cinzel" style={{ fontSize: "0.62rem", color: "rgba(255,184,0,0.7)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "0.75rem" }}>📂 Intelligence Assets Being Traded</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                          {INFO_ITEMS.map((item) => {
                            const isSel = marketplaceInfo.includes(item);
                            return (
                              <button key={item} onClick={() => infoToggle(item)} style={{ padding: "0.4rem 0.875rem", background: isSel ? "rgba(200,140,0,0.22)" : "rgba(0,0,0,0.4)", border: `1px solid ${isSel ? "rgba(255,184,0,0.55)" : "rgba(255,255,255,0.08)"}`, borderRadius: "20px", color: isSel ? "#FFB800" : "rgba(200,200,220,0.45)", fontFamily: "'Montserrat', sans-serif", fontSize: "0.68rem", cursor: "pointer", transition: "all 0.2s" }}>{item}</button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Active summary */}
                    {marketplaceCategories.length > 0 && (
                      <div style={{ padding: "0.65rem 1rem", background: "rgba(255,140,0,0.05)", border: "1px solid rgba(255,140,0,0.15)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.625rem" }}>
                        <span style={{ fontSize: "0.7rem" }}>🏴</span>
                        <span style={{ fontSize: "0.65rem", color: "rgba(255,160,0,0.7)", fontFamily: "'Raleway', sans-serif" }}>
                          <span style={{ fontWeight: 700 }}>{marketplaceCategories.length}</span> division{marketplaceCategories.length > 1 ? "s" : ""} active — the AI will set the story in a black-market context with these transaction layers
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Villain's Capture Method */}
          <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "1.5rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.7rem", color: "#FF4060", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "1rem" }}>How the Villain Subdues Her <span style={{ color: "rgba(200,200,220,0.3)", fontWeight: 400 }}>(optional)</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.625rem" }}>
              {CAPTURE_METHODS.map((cm) => {
                const isSel = captureMethod === cm.id;
                return (
                  <button key={cm.id} onClick={() => setCaptureMethod(isSel ? "" : cm.id)} style={{ background: isSel ? "rgba(200,0,50,0.15)" : "rgba(0,0,0,0.4)", border: `1px solid ${isSel ? "rgba(200,0,50,0.5)" : "rgba(255,255,255,0.06)"}`, borderRadius: "12px", padding: "0.875rem", cursor: "pointer", textAlign: "left", transition: "all 0.2s", color: "inherit" }}
                    onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.borderColor = "rgba(200,0,50,0.3)"; }}
                    onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                      <span style={{ fontSize: "1.1rem" }}>{cm.icon}</span>
                      <div className="font-cinzel" style={{ fontSize: "0.75rem", color: isSel ? "#FF4060" : "#E8E8F0", fontWeight: 700 }}>{cm.label}</div>
                    </div>
                    <div style={{ fontSize: "0.63rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Montserrat', sans-serif" }}>{cm.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hero's Current State */}
          <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "1.5rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.7rem", color: "#FFB800", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "1rem" }}>Hero's Condition Entering the Conflict <span style={{ color: "rgba(200,200,220,0.3)", fontWeight: 400 }}>(optional)</span></div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {HERO_STATES.map((hs) => {
                const isSel = heroState === hs.id;
                return (
                  <button key={hs.id} onClick={() => setHeroState(isSel ? "" : hs.id)} style={{ padding: "0.5rem 1rem", background: isSel ? "rgba(255,184,0,0.18)" : "rgba(0,0,0,0.4)", border: `1px solid ${isSel ? "rgba(255,184,0,0.55)" : "rgba(255,255,255,0.07)"}`, borderRadius: "20px", color: isSel ? "#FFB800" : "rgba(200,200,220,0.5)", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "0.4rem" }}
                    onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.borderColor = "rgba(255,184,0,0.3)"; }}
                    onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
                  >
                    <span>{hs.icon}</span> {hs.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Restraints & Equipment */}
          <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(160,0,80,0.25)", borderRadius: "16px", padding: "1.5rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.7rem", color: "#E040A0", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "0.375rem" }}>Restraints &amp; Containment Gear <span style={{ color: "rgba(200,200,220,0.3)", fontWeight: 400 }}>(optional — pick any)</span></div>
            <p style={{ fontSize: "0.68rem", color: "rgba(200,200,220,0.3)", fontFamily: "'Montserrat', sans-serif", marginBottom: "1rem" }}>Specify how the villain restrains and contains the hero's power during captivity.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "0.5rem", marginBottom: "1rem" }}>
              {RESTRAINTS.map((r) => {
                const isSel = selectedRestraints.includes(r.id);
                return (
                  <button key={r.id} onClick={() => toggleRestraint(r.id)} style={{ background: isSel ? "rgba(224,64,160,0.15)" : "rgba(0,0,0,0.4)", border: `1px solid ${isSel ? "rgba(224,64,160,0.55)" : "rgba(255,255,255,0.06)"}`, borderRadius: "10px", padding: "0.625rem 0.875rem", cursor: "pointer", textAlign: "left", transition: "all 0.2s", color: "inherit", display: "flex", flexDirection: "column", gap: "0.15rem" }}
                    onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.borderColor = "rgba(224,64,160,0.3)"; }}
                    onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                  >
                    <span className="font-cinzel" style={{ fontSize: "0.72rem", color: isSel ? "#E040A0" : "#D0D0E8", fontWeight: 700 }}>{r.label}</span>
                    <span style={{ fontSize: "0.6rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Montserrat', sans-serif" }}>{r.desc}</span>
                  </button>
                );
              })}
            </div>
            <div>
              <label style={{ fontSize: "0.62rem", color: "rgba(224,64,160,0.5)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", display: "block", marginBottom: "0.4rem" }}>Custom / Additional Restraint Description</label>
              <input value={customRestraints} onChange={(e) => setCustomRestraints(e.target.value)} placeholder="e.g. an enchanted straightjacket laced with nullifying runes, power-sapping handcuffs…" style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "0.65rem 1rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(224,64,160,0.4)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
              />
            </div>
          </div>

          {/* ── DYNAMIC POWER DEGRADATION SYSTEM ── */}
          <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,100,0,0.25)", borderRadius: "16px", padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.3rem" }}>
              <div className="font-cinzel" style={{ fontSize: "0.7rem", color: "#FF6400", letterSpacing: "2.5px", textTransform: "uppercase" }}>⚡ Dynamic Power Degradation System</div>
              <span style={{ fontSize: "0.55rem", color: "rgba(200,200,220,0.28)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1.5px" }}>OPTIONAL</span>
            </div>
            <p style={{ fontSize: "0.68rem", color: "rgba(200,200,220,0.3)", fontFamily: "'Montserrat', sans-serif", marginBottom: "1.25rem" }}>
              Define how the hero's powers progressively fade during captivity — tied to restraint choices for emergent storytelling.
            </p>

            {/* Degradation Rate Slider */}
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                <span style={{ fontSize: "0.62rem", color: "rgba(255,100,0,0.7)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 700 }}>Degradation Rate</span>
                <span className="font-cinzel" style={{ fontSize: "0.78rem", fontWeight: 900, color: powerDegradation === 0 ? "rgba(200,200,220,0.3)" : powerDegradation <= 20 ? "#80FF80" : powerDegradation <= 40 ? "#FFCC00" : powerDegradation <= 60 ? "#FF8800" : powerDegradation <= 80 ? "#FF4400" : "#FF0040" }}>
                  {powerDegradation === 0 ? "Disabled" : powerDegradation <= 20 ? `${powerDegradation}% — Minimal Flicker` : powerDegradation <= 40 ? `${powerDegradation}% — Noticeable Drain` : powerDegradation <= 60 ? `${powerDegradation}% — Significant Suppression` : powerDegradation <= 80 ? `${powerDegradation}% — Near-Total Loss` : `${powerDegradation}% — Complete Power Void`}
                </span>
              </div>
              <div style={{ position: "relative", height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", marginBottom: "0.4rem" }}>
                <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${powerDegradation}%`, borderRadius: "2px", background: powerDegradation === 0 ? "transparent" : `linear-gradient(90deg, #80FF80, ${powerDegradation <= 40 ? "#FFCC00" : powerDegradation <= 70 ? "#FF8800" : "#FF0040"})`, transition: "width 0.2s ease, background 0.3s ease" }} />
              </div>
              <input
                type="range" min={0} max={100} step={5}
                value={powerDegradation}
                onChange={(e) => setPowerDegradation(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#FF6400", cursor: "pointer", background: "transparent" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.2rem" }}>
                {["None", "Flicker", "Drain", "Suppressed", "Near-Zero", "Void"].map((l) => (
                  <span key={l} style={{ fontSize: "0.45rem", color: "rgba(200,200,220,0.2)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.5px" }}>{l}</span>
                ))}
              </div>
            </div>

            {/* Degradation Description */}
            {powerDegradation > 0 && (
              <div>
                <label style={{ fontSize: "0.62rem", color: "rgba(255,100,0,0.5)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", display: "block", marginBottom: "0.4rem" }}>How it manifests <span style={{ color: "rgba(200,200,220,0.2)" }}>(optional)</span></label>
                <input
                  value={powerDegradationDesc}
                  onChange={(e) => setPowerDegradationDesc(e.target.value)}
                  placeholder={'e.g. "Her telekinesis flickers with each scream" / "Speed drains 10% per hour under neural dampeners"'}
                  style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "0.65rem 1rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,100,0,0.4)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
                />
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.6rem" }}>
                  {["Her telekinesis flickers with each scream", "Speed drains 10% per hour under neural dampeners", "Fire control gutters when the inhibitor pulse fires", "Strength halved with every failed escape attempt"].map((ex) => (
                    <button key={ex} onClick={() => setPowerDegradationDesc(ex)} style={{ padding: "0.2rem 0.55rem", background: "rgba(255,100,0,0.07)", border: "1px solid rgba(255,100,0,0.2)", borderRadius: "4px", color: "rgba(255,140,60,0.6)", fontSize: "0.58rem", fontFamily: "'Raleway', sans-serif", cursor: "pointer", transition: "all 0.2s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,100,0,0.45)"; e.currentTarget.style.color = "rgba(255,140,60,0.9)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,100,0,0.2)"; e.currentTarget.style.color = "rgba(255,140,60,0.6)"; }}
                    >{ex}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── TRAUMA RESONANCE METER ── */}
          <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(180,0,60,0.25)", borderRadius: "16px", padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.3rem" }}>
              <div className="font-cinzel" style={{ fontSize: "0.7rem", color: "#FF2060", letterSpacing: "2.5px", textTransform: "uppercase" }}>💗 Trauma Resonance Meter</div>
              <span style={{ fontSize: "0.55rem", color: "rgba(200,200,220,0.28)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1.5px" }}>OPTIONAL</span>
            </div>
            <p style={{ fontSize: "0.68rem", color: "rgba(200,200,220,0.3)", fontFamily: "'Montserrat', sans-serif", marginBottom: "1.25rem" }}>
              Track the hero's psychological state. Each mode unlocks different narrative paths and AI writing choices.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "1.25rem" }}>
              {([
                { id: "compliance", label: "Compliance", icon: "🕊", col: "#40D090", bg: "rgba(0,160,90,0.15)", border: "rgba(0,200,110,0.5)", desc: "Resistance erodes. New dialogue paths unlock as her will bends.", sub: "Lowers resistance · unlocks obedience arcs" },
                { id: "defiance",   label: "Defiance",   icon: "⚔", col: "#FFB800", bg: "rgba(200,140,0,0.15)", border: "rgba(255,184,0,0.5)", desc: "She fights at every turn. Triggers harsher restraints and escalation.", sub: "Triggers countermeasures · may reveal escape routes" },
                { id: "breakdown",  label: "Breakdown",  icon: "💔", col: "#FF2060", bg: "rgba(180,0,60,0.15)", border: "rgba(255,40,96,0.5)", desc: "Psychological fracture. Hallucinations, flashbacks, power surges.", sub: "Activates hallucinations · unpredictable power surges" },
              ] as const).map((ts) => {
                const isSel = traumaState === ts.id;
                return (
                  <button key={ts.id} onClick={() => setTraumaState(isSel ? "" : ts.id)} style={{ background: isSel ? ts.bg : "rgba(0,0,0,0.4)", border: `1px solid ${isSel ? ts.border : "rgba(255,255,255,0.06)"}`, borderRadius: "12px", padding: "1rem", cursor: "pointer", textAlign: "left", transition: "all 0.25s", color: "inherit", boxShadow: isSel ? `0 0 18px ${ts.col}33` : "none" }}
                    onMouseEnter={(e) => { if (!isSel) { e.currentTarget.style.borderColor = ts.border.replace("0.5", "0.25"); e.currentTarget.style.background = ts.bg.replace("0.15", "0.07"); } }}
                    onMouseLeave={(e) => { if (!isSel) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(0,0,0,0.4)"; } }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "1.1rem" }}>{ts.icon}</span>
                      <span className="font-cinzel" style={{ fontSize: "0.75rem", fontWeight: 700, color: isSel ? ts.col : "#E8E8F0" }}>{ts.label}</span>
                    </div>
                    <div style={{ fontSize: "0.6rem", color: isSel ? "rgba(220,215,255,0.6)" : "rgba(200,200,220,0.35)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.55, marginBottom: "0.4rem" }}>{ts.desc}</div>
                    <div style={{ fontSize: "0.52rem", color: isSel ? ts.col : "rgba(200,200,220,0.2)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.5px" }}>{ts.sub}</div>
                  </button>
                );
              })}
            </div>

            {/* Heart-monitor SVG — animated based on state */}
            {traumaState && (
              <div style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "0.75rem 1rem", position: "relative", overflow: "hidden" }}>
                <div style={{ fontSize: "0.48rem", color: "rgba(200,200,220,0.2)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  Psychological Trace — {traumaState === "compliance" ? "Stable / Diminishing" : traumaState === "defiance" ? "Elevated / Volatile" : "Critical / Fragmenting"}
                </div>
                <svg width="100%" height="48" viewBox="0 0 400 48" preserveAspectRatio="none" style={{ display: "block" }}>
                  <defs>
                    <linearGradient id="traceGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={traumaState === "compliance" ? "#40D090" : traumaState === "defiance" ? "#FFB800" : "#FF2060"} stopOpacity="0" />
                      <stop offset="40%" stopColor={traumaState === "compliance" ? "#40D090" : traumaState === "defiance" ? "#FFB800" : "#FF2060"} stopOpacity="1" />
                      <stop offset="100%" stopColor={traumaState === "compliance" ? "#40D090" : traumaState === "defiance" ? "#FFB800" : "#FF2060"} stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                  {traumaState === "compliance" && (
                    <polyline points="0,24 40,24 60,16 80,32 100,24 160,24 180,18 200,30 220,24 320,24 340,20 360,28 380,24 400,24" fill="none" stroke="url(#traceGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                  {traumaState === "defiance" && (
                    <polyline points="0,24 30,24 35,4 42,44 48,8 54,24 90,24 95,6 100,42 106,10 112,24 160,24 165,2 172,46 178,6 184,24 230,24 235,8 240,38 246,12 252,24 320,24 325,4 332,44 338,8 344,24 400,24" fill="none" stroke="url(#traceGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                  {traumaState === "breakdown" && (
                    <polyline points="0,24 15,24 18,4 21,44 23,2 26,40 28,10 30,24 55,24 57,6 60,42 62,2 65,38 67,16 70,24 95,24 98,8 100,44 103,4 106,36 109,18 112,24 140,24 143,2 146,46 149,6 152,38 155,20 158,24 190,24 193,10 196,42 199,4 202,40 205,16 208,24 250,24 253,6 256,44 259,8 262,36 265,20 268,24 310,24 313,4 316,46 319,8 322,38 325,18 328,24 380,24 383,10 386,42 389,14 392,36 395,24 400,24" fill="none" stroke="url(#traceGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                  {/* Travelling pulse dot */}
                  <circle r="3" fill={traumaState === "compliance" ? "#40D090" : traumaState === "defiance" ? "#FFB800" : "#FF2060"} style={{ filter: `drop-shadow(0 0 4px ${traumaState === "compliance" ? "#40D090" : traumaState === "defiance" ? "#FFB800" : "#FF2060"})` }}>
                    <animateMotion dur={traumaState === "compliance" ? "3s" : traumaState === "defiance" ? "2s" : "1.2s"} repeatCount="indefinite">
                      {traumaState === "compliance" && <mpath href="#compPath" />}
                      {traumaState === "defiance" && <mpath href="#defPath" />}
                      {traumaState === "breakdown" && <mpath href="#brkPath" />}
                    </animateMotion>
                  </circle>
                  {traumaState === "compliance" && <path id="compPath" d="M 0,24 L 40,24 L 60,16 L 80,32 L 100,24 L 160,24 L 180,18 L 200,30 L 220,24 L 320,24 L 340,20 L 360,28 L 380,24 L 400,24" fill="none" />}
                  {traumaState === "defiance" && <path id="defPath" d="M 0,24 L 30,24 L 35,4 L 42,44 L 48,8 L 54,24 L 90,24 L 95,6 L 100,42 L 106,10 L 112,24 L 160,24 L 165,2 L 172,46 L 178,6 L 184,24 L 230,24 L 235,8 L 240,38 L 246,12 L 252,24 L 320,24 L 325,4 L 332,44 L 338,8 L 344,24 L 400,24" fill="none" />}
                  {traumaState === "breakdown" && <path id="brkPath" d="M 0,24 L 15,24 L 18,4 L 21,44 L 23,2 L 26,40 L 28,10 L 30,24 L 55,24 L 57,6 L 60,42 L 62,2 L 65,38 L 67,16 L 70,24 L 95,24 L 98,8 L 100,44 L 103,4 L 106,36 L 109,18 L 112,24 L 140,24 L 143,2 L 146,46 L 149,6 L 152,38 L 155,20 L 158,24 L 190,24 L 193,10 L 196,42 L 199,4 L 202,40 L 205,16 L 208,24 L 250,24 L 253,6 L 256,44 L 259,8 L 262,36 L 265,20 L 268,24 L 310,24 L 313,4 L 316,46 L 319,8 L 322,38 L 325,18 L 328,24 L 380,24 L 383,10 L 386,42 L 389,14 L 392,36 L 395,24 L 400,24" fill="none" />}
                </svg>
              </div>
            )}
          </div>

          {/* ── SENSORY OVERRIDE MODE ── */}
          <div style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${sensoryModeActive ? "rgba(120,60,200,0.4)" : "rgba(255,255,255,0.06)"}`, borderRadius: "16px", padding: "1.5rem", transition: "border-color 0.3s" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: sensoryModeActive ? "1rem" : 0 }}>
              <div>
                <div className="font-cinzel" style={{ fontSize: "0.7rem", color: sensoryModeActive ? "#A060FF" : "rgba(160,96,255,0.5)", letterSpacing: "2.5px", textTransform: "uppercase", transition: "color 0.3s" }}>👁 Sensory Override Mode</div>
                <div style={{ fontSize: "0.62rem", color: "rgba(200,200,220,0.28)", fontFamily: "'Montserrat', sans-serif", marginTop: "0.2rem" }}>Deprivation or overload — links to Mood Lighting for immersive atmosphere</div>
              </div>
              <button
                onClick={() => { setSensoryModeActive(!sensoryModeActive); if (sensoryModeActive) setSensoryMode(""); }}
                style={{ padding: "0.35rem 0.875rem", background: sensoryModeActive ? "rgba(120,60,200,0.25)" : "rgba(255,255,255,0.04)", border: `1px solid ${sensoryModeActive ? "rgba(160,96,255,0.55)" : "rgba(255,255,255,0.1)"}`, borderRadius: "20px", cursor: "pointer", color: sensoryModeActive ? "#A060FF" : "rgba(200,200,220,0.3)", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "2px", transition: "all 0.25s", flexShrink: 0 }}
              >
                {sensoryModeActive ? "ON  ●" : "OFF  ○"}
              </button>
            </div>

            {sensoryModeActive && (
              <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? "150px" : "220px"}, 1fr))`, gap: "0.625rem", marginTop: "0.25rem" }}>
                {([
                  { id: "deprivation",  icon: "🙈", label: "Blindfolded + Soundproof", desc: "All visual and auditory input stripped — forces hyper-awareness of touch, temperature, heartbeat, scent", mood: "Isolation / Cold" },
                  { id: "overload",     icon: "⚡", label: "Strobe + Sub-bass",        desc: "Strobing light and sub-bass frequency — induces panic, vertigo, time dilation and spatial disorientation", mood: "Static Glitch" },
                  { id: "scent",        icon: "🌸", label: "Scent Triggers",            desc: "Ozone, blood, perfume, burning metal — each scent hijacks memory and emotion, producing involuntary flashbacks", mood: "Candlelight" },
                  { id: "void",         icon: "🌑", label: "Total Void",                desc: "Complete removal of all sensory input including proprioception — dissolves self-concept and temporal awareness", mood: "Void Black" },
                ] as const).map((sm) => {
                  const isSel = sensoryMode === sm.id;
                  return (
                    <button key={sm.id} onClick={() => setSensoryMode(isSel ? "" : sm.id)} style={{ background: isSel ? "rgba(120,60,200,0.18)" : "rgba(0,0,0,0.4)", border: `1px solid ${isSel ? "rgba(160,96,255,0.55)" : "rgba(255,255,255,0.06)"}`, borderRadius: "12px", padding: "0.875rem", cursor: "pointer", textAlign: "left", transition: "all 0.2s", color: "inherit", boxShadow: isSel ? "0 0 16px rgba(120,60,200,0.25)" : "none" }}
                      onMouseEnter={(e) => { if (!isSel) { e.currentTarget.style.borderColor = "rgba(160,96,255,0.3)"; e.currentTarget.style.background = "rgba(120,60,200,0.07)"; } }}
                      onMouseLeave={(e) => { if (!isSel) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(0,0,0,0.4)"; } }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.45rem" }}>
                        <span style={{ fontSize: "1.2rem" }}>{sm.icon}</span>
                        <span className="font-cinzel" style={{ fontSize: "0.72rem", fontWeight: 700, color: isSel ? "#A060FF" : "#D0D0E8" }}>{sm.label}</span>
                      </div>
                      <div style={{ fontSize: "0.6rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.55, marginBottom: "0.4rem" }}>{sm.desc}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <span style={{ fontSize: "0.45rem", color: isSel ? "rgba(160,96,255,0.6)" : "rgba(200,200,220,0.18)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1.5px", textTransform: "uppercase" }}>Mood Link:</span>
                        <span style={{ fontSize: "0.45rem", color: isSel ? "#A060FF" : "rgba(200,200,220,0.2)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1px" }}>{sm.mood}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── SENSORY SCRAMBLER ── */}
          <div style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${sensoryScrambler.length > 0 ? "rgba(0,200,180,0.3)" : "rgba(255,255,255,0.06)"}`, borderRadius: "16px", padding: "1.5rem", transition: "border-color 0.3s" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1.25rem" }}>
              <div>
                <div className="font-cinzel" style={{ fontSize: "0.7rem", color: sensoryScrambler.length > 0 ? "#00D0C0" : "rgba(0,200,180,0.5)", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "0.2rem", transition: "color 0.3s" }}>
                  🌀 Sensory Scrambler
                </div>
                <div style={{ fontSize: "0.62rem", color: "rgba(200,200,220,0.28)", fontFamily: "'Montserrat', sans-serif" }}>
                  Randomise sensory input — distortions that blur the line between real and imagined
                </div>
              </div>
              <span style={{ fontSize: "0.5rem", color: "rgba(200,200,220,0.22)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1.5px", whiteSpace: "nowrap", marginTop: "0.15rem" }}>OPTIONAL · MULTI-SELECT</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "0.75rem" }}>
              {([
                {
                  id: "hallucinations",
                  icon: "👁",
                  label: "Hallucinations",
                  desc: "Visual and auditory distortions seeded by trauma — phantom figures, voices that don't exist, memories indistinguishable from the present",
                  tags: ["Visual", "Auditory", "Trauma-based"],
                  col: "#FF6080",
                  bg: "rgba(200,0,60,0.14)",
                  border: "rgba(255,80,100,0.5)",
                },
                {
                  id: "phantom-pains",
                  icon: "🩸",
                  label: "Phantom Pains",
                  desc: "Her nervous system fires signals of wounds that don't exist — burns she can't locate, broken bones she can't X-ray, agony with no source",
                  tags: ["Nerve Override", "Non-existent", "Overwhelming"],
                  col: "#FF9030",
                  bg: "rgba(200,100,0,0.14)",
                  border: "rgba(255,144,48,0.5)",
                },
                {
                  id: "synesthesia",
                  icon: "🎨",
                  label: "Synesthesia",
                  desc: "Cross-wired perception — she hears colours as music, tastes words as flavour, feels spoken commands as textures on her skin",
                  tags: ["Cross-wired", "Perceptual", "Disorientating"],
                  col: "#A060FF",
                  bg: "rgba(120,40,200,0.14)",
                  border: "rgba(160,96,255,0.5)",
                },
              ] as const).map((s) => {
                const isSel = sensoryScrambler.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => setSensoryScrambler((prev) =>
                      prev.includes(s.id) ? prev.filter((x) => x !== s.id) : [...prev, s.id]
                    )}
                    style={{ background: isSel ? s.bg : "rgba(0,0,0,0.4)", border: `1px solid ${isSel ? s.border : "rgba(255,255,255,0.06)"}`, borderRadius: "12px", padding: "1rem", cursor: "pointer", textAlign: "left", transition: "all 0.25s", color: "inherit", position: "relative", boxShadow: isSel ? `0 0 20px ${s.col}28` : "none" }}
                    onMouseEnter={(e) => { if (!isSel) { e.currentTarget.style.borderColor = s.border.replace("0.5", "0.22"); e.currentTarget.style.background = s.bg.replace("0.14", "0.06"); } }}
                    onMouseLeave={(e) => { if (!isSel) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(0,0,0,0.4)"; } }}
                  >
                    {isSel && (
                      <div style={{ position: "absolute", top: "0.6rem", right: "0.6rem", width: "18px", height: "18px", borderRadius: "50%", background: s.col, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "#000", fontWeight: 700 }}>✓</div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "1.25rem", filter: isSel ? `drop-shadow(0 0 8px ${s.col})` : "none", transition: "filter 0.3s" }}>{s.icon}</span>
                      <span className="font-cinzel" style={{ fontSize: "0.78rem", fontWeight: 700, color: isSel ? s.col : "#D0D0E8" }}>{s.label}</span>
                    </div>
                    <div style={{ fontSize: "0.62rem", color: "rgba(200,200,220,0.42)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.6, marginBottom: "0.6rem" }}>{s.desc}</div>
                    <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                      {s.tags.map((t) => (
                        <span key={t} style={{ padding: "0.15rem 0.45rem", background: isSel ? `rgba(${s.col === "#FF6080" ? "200,0,60" : s.col === "#FF9030" ? "200,100,0" : "120,40,200"},0.18)` : "rgba(255,255,255,0.04)", border: `1px solid ${isSel ? s.border.replace("0.5", "0.3") : "rgba(255,255,255,0.07)"}`, borderRadius: "3px", fontSize: "0.5rem", color: isSel ? s.col : "rgba(200,200,220,0.25)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.5px", transition: "all 0.25s" }}>{t}</span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active summary */}
            {sensoryScrambler.length > 0 && (
              <div style={{ marginTop: "0.875rem", padding: "0.65rem 1rem", background: "rgba(0,200,180,0.05)", border: "1px solid rgba(0,200,180,0.15)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <span style={{ fontSize: "0.7rem" }}>🌀</span>
                <span style={{ fontSize: "0.65rem", color: "rgba(0,220,200,0.7)", fontFamily: "'Raleway', sans-serif" }}>
                  <span style={{ fontWeight: 700 }}>{sensoryScrambler.length}</span> scrambler{sensoryScrambler.length > 1 ? "s" : ""} active — the AI will weave these perceptual distortions throughout the story
                </span>
              </div>
            )}
          </div>

          {/* Special weapons */}
          <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "1.5rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.7rem", color: "#C060E0", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "1rem" }}>Special Weapons / Power Elements <span style={{ color: "rgba(200,200,220,0.3)", fontWeight: 400 }}>(optional — pick any)</span></div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {WEAPONS.map((w) => {
                const isSel = selectedWeapons.includes(w);
                return (
                  <button key={w} onClick={() => toggleWeapon(w)} style={{ padding: "0.45rem 0.875rem", background: isSel ? "rgba(192,96,224,0.2)" : "rgba(0,0,0,0.4)", border: `1px solid ${isSel ? "rgba(192,96,224,0.55)" : "rgba(255,255,255,0.07)"}`, borderRadius: "20px", color: isSel ? "#C060E0" : "rgba(200,200,220,0.5)", fontFamily: "'Raleway', sans-serif", fontSize: "0.78rem", cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.3px" }}
                    onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.borderColor = "rgba(192,96,224,0.3)"; }}
                    onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── WEAKNESS CATALOG ── */}
          {selectedHeroes.length > 0 && (() => {
            const allWeaknesses = Array.from(new Set(
              selectedHeroes.flatMap((h) => getHeroWeaknesses(h))
            ));
            return (
              <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(180,0,255,0.2)", borderRadius: "16px", padding: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.35rem" }}>
                  <div className="font-cinzel" style={{ fontSize: "0.7rem", color: "#C060FF", letterSpacing: "2.5px", textTransform: "uppercase" }}>🔍 Heroine Weakness Profile</div>
                  <span style={{ fontSize: "0.55rem", color: "rgba(200,200,220,0.28)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1.5px" }}>OPTIONAL</span>
                </div>
                <p style={{ fontSize: "0.68rem", color: "rgba(200,200,220,0.3)", fontFamily: "'Montserrat', sans-serif", marginBottom: "1rem" }}>
                  Select the specific vulnerabilities the villain has identified and will exploit throughout the story.
                  {selectedWeaknesses.length > 0 && <span style={{ color: "#C060FF", marginLeft: "0.5rem" }}>{selectedWeaknesses.length} selected</span>}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {allWeaknesses.map((w) => {
                    const isSel = selectedWeaknesses.includes(w);
                    return (
                      <button key={w} onClick={() => setSelectedWeaknesses((prev) => isSel ? prev.filter((x) => x !== w) : [...prev, w])}
                        style={{ padding: "0.45rem 0.875rem", background: isSel ? "rgba(192,96,255,0.2)" : "rgba(0,0,0,0.4)", border: `1px solid ${isSel ? "rgba(192,96,255,0.55)" : "rgba(255,255,255,0.07)"}`, borderRadius: "20px", color: isSel ? "#C060FF" : "rgba(200,200,220,0.45)", fontFamily: "'Raleway', sans-serif", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.2s", textAlign: "left", lineHeight: 1.4 }}
                        onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.borderColor = "rgba(192,96,255,0.35)"; }}
                        onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
                      >
                        {isSel && <span style={{ marginRight: "0.4rem", color: "#C060FF" }}>✓</span>}{w}
                      </button>
                    );
                  })}
                </div>
                {selectedWeaknesses.length > 0 && (
                  <button onClick={() => setSelectedWeaknesses([])} style={{ marginTop: "0.75rem", padding: "0.3rem 0.75rem", background: "transparent", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", color: "rgba(200,200,220,0.3)", fontFamily: "'Montserrat', sans-serif", fontSize: "0.65rem", cursor: "pointer", letterSpacing: "1px" }}>
                    Clear all
                  </button>
                )}
              </div>
            );
          })()}

          {/* Story Length */}
          <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "1.5rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.7rem", color: "#D4AF37", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "1rem" }}>Story Length</div>
            <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
              {STORY_LENGTHS.map((sl) => {
                const isSel = storyLength === sl.id;
                return (
                  <button key={sl.id} onClick={() => setStoryLength(sl.id)} style={{ flex: 1, minWidth: "130px", padding: "0.875rem 1rem", background: isSel ? "rgba(212,175,55,0.18)" : "rgba(0,0,0,0.4)", border: `1px solid ${isSel ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.06)"}`, borderRadius: "12px", cursor: "pointer", textAlign: "center", transition: "all 0.2s", color: "inherit", boxShadow: isSel ? "0 0 12px rgba(212,175,55,0.2)" : "none" }}
                    onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.borderColor = "rgba(212,175,55,0.3)"; }}
                    onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                  >
                    <div style={{ fontSize: "1.2rem", marginBottom: "0.3rem" }}>{sl.icon}</div>
                    <div className="font-cinzel" style={{ fontSize: "0.78rem", color: isSel ? "#D4AF37" : "#E8E8F0", fontWeight: 700, marginBottom: "0.15rem" }}>{sl.label}</div>
                    <div style={{ fontSize: "0.62rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Montserrat', sans-serif" }}>{sl.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Extra details */}
          <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "1.5rem" }}>
            <label style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.35)", letterSpacing: "2.5px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", display: "block", marginBottom: "0.5rem" }}>Additional Story Details <span style={{ color: "rgba(200,200,220,0.2)", fontWeight: 400 }}>(optional)</span></label>
            <textarea value={extraDetails} onChange={(e) => setExtraDetails(e.target.value)} placeholder="Any specific plot twists, character backstory, team members, specific scenes, or anything else you want included…" rows={3} style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "0.75rem 1rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.9rem", lineHeight: 1.65, outline: "none", resize: "vertical", boxSizing: "border-box" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,184,0,0.35)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setStep(2)} style={{ padding: "0.75rem 1.5rem", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "rgba(200,200,220,0.4)", fontFamily: "'Cinzel', serif", fontSize: "0.8rem", cursor: "pointer", letterSpacing: "1.5px" }}>← Back</button>
            <button onClick={() => { if (canProceedStep3()) { setStep(4); generateStory(); } }} disabled={!canProceedStep3()} style={{ padding: "0.875rem 2.5rem", background: canProceedStep3() ? "linear-gradient(135deg, rgba(255,184,0,0.25), rgba(255,0,128,0.2))" : "rgba(255,255,255,0.04)", border: `1px solid ${canProceedStep3() ? "rgba(255,184,0,0.55)" : "rgba(255,255,255,0.07)"}`, borderRadius: "12px", color: canProceedStep3() ? "#FFB800" : "rgba(200,200,220,0.25)", fontFamily: "'Cinzel', serif", fontSize: "0.9rem", letterSpacing: "3px", textTransform: "uppercase", cursor: canProceedStep3() ? "pointer" : "not-allowed", transition: "all 0.3s ease", boxShadow: canProceedStep3() ? "0 4px 24px rgba(255,184,0,0.25)" : "none" }}>
              ⚡ Forge the Story
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          STEP 4 — Story Output
      ══════════════════════════════════════════════════════ */}
      {step === 4 && (
        <div>
          {/* Story header card */}
          <div style={{ background: "linear-gradient(135deg, rgba(0,0,0,0.7), rgba(10,0,20,0.9))", border: "1px solid rgba(255,184,0,0.25)", borderRadius: "20px", padding: "1.5rem 2rem", marginBottom: "1.5rem", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, #FFB800 30%, #FF0080 70%, transparent)" }} />
            <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,184,0,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: "0.58rem", color: "rgba(255,184,0,0.5)", letterSpacing: "2.5px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginBottom: "0.3rem" }}>
                  {selectedHeroes.length === 1 ? "HERO" : "HEROES"}
                </div>
                {selectedHeroes.map((h) => (
                  <div key={h.name} style={{ marginBottom: "0.15rem" }}>
                    <span className="font-cinzel" style={{ color: "#FFB800", fontWeight: 700, fontSize: "0.9rem" }}>{h.name}</span>
                    <span style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Montserrat', sans-serif", marginLeft: "0.4rem" }}>{h.alias}</span>
                  </div>
                ))}
              </div>
              <div style={{ width: "1px", background: "rgba(255,255,255,0.08)" }} />
              <div>
                <div style={{ fontSize: "0.58rem", color: "rgba(255,64,96,0.5)", letterSpacing: "2.5px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginBottom: "0.2rem" }}>
                  {isVillainDuo ? "VILLAIN DUO" : "VILLAIN"}
                </div>
                <div className="font-cinzel" style={{ color: "#FF4060", fontWeight: 700, fontSize: "1rem" }}>{villainMode === "pick" ? selectedVillain?.name : customVillain}</div>
                {isVillainDuo && selectedVillain2 && (
                  <>
                    <div style={{ fontSize: "0.55rem", color: "rgba(255,100,0,0.5)", fontFamily: "'Montserrat', sans-serif", margin: "0.15rem 0" }}>⚔ {villainDynamic.toUpperCase()}</div>
                    <div className="font-cinzel" style={{ color: "#FF6030", fontWeight: 700, fontSize: "0.9rem" }}>{selectedVillain2.name}</div>
                  </>
                )}
              </div>
              <div style={{ width: "1px", background: "rgba(255,255,255,0.08)" }} />
              <div>
                <div style={{ fontSize: "0.58rem", color: "rgba(200,200,220,0.3)", letterSpacing: "2.5px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginBottom: "0.2rem" }}>SETTING</div>
                <div className="font-cinzel" style={{ color: "#E8E8F0", fontSize: "0.9rem" }}>{SETTINGS.find((s) => s.id === selectedSetting)?.label}</div>
              </div>
              <div style={{ width: "1px", background: "rgba(255,255,255,0.08)" }} />
              <div>
                <div style={{ fontSize: "0.58rem", color: "rgba(200,200,220,0.3)", letterSpacing: "2.5px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginBottom: "0.2rem" }}>STAKES</div>
                <div className="font-cinzel" style={{ color: "#E8E8F0", fontSize: "0.9rem" }}>{STAKES.find((s) => s.id === selectedStakes)?.label}</div>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: "3rem 2rem", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,184,0,0.1)", borderRadius: "20px", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem", animation: "orbFloat 2s ease-in-out infinite" }}>⚡</div>
              <p className="font-cinzel" style={{ color: "#FFB800", fontSize: "0.9rem", letterSpacing: "2px", marginBottom: "0.5rem" }}>Forging your story…</p>
              <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "1rem" }}>
                {[0,1,2,3].map((i) => <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: i % 2 === 0 ? "#FFB800" : "#FF4060", animation: `progressGlow 1s ${i*0.2}s ease-in-out infinite` }} />)}
              </div>
            </div>
          )}

          {/* Chapters */}
          {chapters.map((ch, i) => (
            <div key={i} style={{ marginBottom: "1.5rem", position: "relative" }}>
              {chapters.length > 1 && (
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.875rem" }}>
                  <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(255,184,0,0.4), transparent)" }} />
                  <span className="font-cinzel" style={{ fontSize: "0.65rem", letterSpacing: "3px", color: "#FFB800", textTransform: "uppercase" }}>Chapter {i + 1}</span>
                  <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,184,0,0.4))" }} />
                </div>
              )}
              <div style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,184,0,0.15)", borderRadius: "20px", padding: "2.5rem", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: i === 0 ? "linear-gradient(90deg, transparent, #FF4060 20%, #FFB800 50%, #C060E0 80%, transparent)" : "linear-gradient(90deg, transparent, #C060E0 30%, #FFB800 70%, transparent)" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,184,0,0.2), transparent)" }} />
                <div className="font-crimson" style={{ fontSize: "1.1rem", color: "#F0F0FF", lineHeight: 2, whiteSpace: "pre-wrap", letterSpacing: "0.3px" }}>{ch}</div>
              </div>
            </div>
          ))}

          {/* Streaming new chapter */}
          {streamingText && (
            <div style={{ marginBottom: "1.5rem", position: "relative" }}>
              {chapters.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.875rem" }}>
                  <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(192,96,224,0.4), transparent)" }} />
                  <span className="font-cinzel" style={{ fontSize: "0.65rem", letterSpacing: "3px", color: "#C060E0", textTransform: "uppercase" }}>Chapter {chapters.length + 1}</span>
                  <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, transparent, rgba(192,96,224,0.4))" }} />
                </div>
              )}
              <div style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(192,96,224,0.2)", borderRadius: "20px", padding: "2.5rem", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, #C060E0 50%, transparent)" }} />
                <div className="font-crimson" style={{ fontSize: "1.1rem", color: "#F0F0FF", lineHeight: 2, whiteSpace: "pre-wrap", letterSpacing: "0.3px" }}>
                  {streamingText}
                  <span style={{ display: "inline-block", width: "2px", height: "1.1em", background: "#FFB800", marginLeft: "2px", verticalAlign: "text-bottom", animation: "progressGlow 0.8s ease-in-out infinite" }} />
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: "rgba(139,0,0,0.15)", border: "1px solid rgba(139,0,0,0.4)", borderRadius: "12px", padding: "1rem 1.5rem", marginBottom: "1.5rem", color: "#FF6666", fontSize: "0.9rem" }}>
              ⚠ {error}
            </div>
          )}

          {/* Continue story panel */}
          {chapters.length > 0 && !loading && !continuing && (
            <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(192,96,224,0.2)", borderRadius: "16px", padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
              <div className="font-cinzel" style={{ fontSize: "0.65rem", color: "#C060E0", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                ✦ Continue the Story — Chapter {chapters.length + 1}
              </div>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
                <input
                  value={continuePrompt}
                  onChange={(e) => setContinuePrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); continueStory(); } }}
                  placeholder="Steer the next chapter… (e.g. 'She attempts escape', 'The villain reveals his plan', 'Allies arrive') or leave blank for AI to decide"
                  style={{ flex: 1, background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "0.65rem 1rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.875rem", outline: "none" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(192,96,224,0.4)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
                />
                <button
                  onClick={continueStory}
                  style={{ padding: "0.65rem 1.25rem", background: "rgba(192,96,224,0.2)", border: "1px solid rgba(192,96,224,0.45)", borderRadius: "8px", color: "#C060E0", fontFamily: "'Cinzel', serif", fontSize: "0.8rem", cursor: "pointer", letterSpacing: "1.5px", whiteSpace: "nowrap", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(192,96,224,0.3)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(192,96,224,0.3)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(192,96,224,0.2)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  + Next Chapter
                </button>
              </div>
            </div>
          )}

          {/* Continuing spinner */}
          {continuing && (
            <div style={{ textAlign: "center", padding: "1.5rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(192,96,224,0.15)", borderRadius: "12px", marginBottom: "1.5rem" }}>
              <p className="font-cinzel" style={{ color: "#C060E0", fontSize: "0.85rem", letterSpacing: "2px" }}>Writing Chapter {chapters.length + 1}…</p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "space-between" }}>
            <button onClick={() => setStep(3)} style={{ padding: "0.75rem 1.5rem", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "rgba(200,200,220,0.4)", fontFamily: "'Cinzel', serif", fontSize: "0.8rem", cursor: "pointer", letterSpacing: "1.5px" }}>← Edit Scenario</button>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {chapters.length > 0 && (
                <>
                  <button onClick={exportStory} style={{ padding: "0.75rem 1.25rem", background: "rgba(255,184,0,0.12)", border: "1px solid rgba(255,184,0,0.3)", borderRadius: "10px", color: "#FFB800", fontFamily: "'Cinzel', serif", fontSize: "0.8rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s" }}>Export {chapters.length > 1 ? `(${chapters.length} ch.)` : ""}</button>
                  <button
                    onClick={saveToArchive}
                    disabled={!!savedId}
                    style={{ padding: "0.75rem 1.25rem", background: savedId ? "rgba(68,210,110,0.1)" : "rgba(44,95,138,0.12)", border: `1px solid ${savedId ? "rgba(68,210,110,0.35)" : "rgba(106,173,228,0.35)"}`, borderRadius: "10px", color: savedId ? "#44D26E" : "#6AADE4", fontFamily: "'Cinzel', serif", fontSize: "0.8rem", cursor: savedId ? "default" : "pointer", letterSpacing: "1px", transition: "all 0.2s" }}
                  >
                    {savedId ? "✓ Saved" : "Save to Archive"}
                  </button>
                  <button onClick={() => { setSavedId(null); setChapters([]); generateStory(); }} disabled={loading} style={{ padding: "0.75rem 1.5rem", background: "linear-gradient(135deg, rgba(255,184,0,0.2), rgba(255,0,128,0.15))", border: "1px solid rgba(255,184,0,0.45)", borderRadius: "10px", color: "#FFB800", fontFamily: "'Cinzel', serif", fontSize: "0.8rem", cursor: "pointer", letterSpacing: "1.5px", transition: "all 0.2s" }}>⚡ Regenerate</button>
                </>
              )}
            </div>
          </div>

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
