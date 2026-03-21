import { useState, useRef } from "react";

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
];

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
type UniverseFilter = "ALL" | "MARVEL" | "DC" | "CW";
type VillainFilter = "ALL" | "Marvel" | "DC" | "CW";

// ── Component ─────────────────────────────────────────────────
export default function SuperheroMode({ onBack }: SuperheroModeProps) {
  const [step, setStep] = useState<Step>(1);
  const [universeFilter, setUniverseFilter] = useState<UniverseFilter>("ALL");
  const [villainFilter, setVillainFilter] = useState<VillainFilter>("ALL");
  const [search, setSearch] = useState("");

  // Selections
  const [selectedHeroes, setSelectedHeroes] = useState<(typeof MARVEL_HEROES[0] & { universe: string })[]>([]);
  const [selectedVillain, setSelectedVillain] = useState<typeof VILLAINS[0] | null>(null);
  const [customVillain, setCustomVillain] = useState("");
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

  // Story generation & chapters
  const [chapters, setChapters] = useState<string[]>([]);
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
    return villainMode === "pick" ? !!selectedVillain : !!customVillain.trim();
  }
  function canProceedStep3() { return !!selectedSetting && !!selectedStakes; }

  function buildPrompt() {
    const villain = villainMode === "pick" ? selectedVillain?.name : customVillain;
    const villainScheme = villainMode === "pick" ? selectedVillain?.scheme : "achieve their sinister goal";
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

    return {
      hero: selectedHeroes.map((h) => `${h.name} (${h.alias}) — Power: ${h.power} — Universe: ${h.universe}`).join(" | "),
      villain: `${villain} — Scheme: ${villainScheme}`,
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

  const stepLabels = ["Choose Hero", "Choose Villain", "Scenario", "Story"];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
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
      <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "2.5rem", background: "rgba(0,0,0,0.4)", borderRadius: "12px", padding: "0.5rem", border: "1px solid rgba(255,255,255,0.05)" }}>
        {stepLabels.map((label, i) => {
          const num = i + 1 as Step;
          const isActive = step === num;
          const isDone = step > num;
          return (
            <div key={num} style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <button
                onClick={() => isDone && setStep(num)}
                disabled={!isDone}
                style={{
                  flex: 1,
                  padding: "0.625rem 0.5rem",
                  background: isActive ? "linear-gradient(135deg, rgba(255,184,0,0.2), rgba(255,107,0,0.15))" : "transparent",
                  border: `1px solid ${isActive ? "rgba(255,184,0,0.45)" : "transparent"}`,
                  borderRadius: "8px",
                  cursor: isDone ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  justifyContent: "center",
                  transition: "all 0.25s ease",
                  color: "inherit",
                }}
              >
                <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: isActive ? "rgba(255,184,0,0.3)" : isDone ? "rgba(0,200,100,0.25)" : "rgba(255,255,255,0.05)", border: `1px solid ${isActive ? "rgba(255,184,0,0.6)" : isDone ? "rgba(0,200,100,0.5)" : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", flexShrink: 0 }}>
                  {isDone ? <span style={{ color: "#00C870" }}>✓</span> : <span style={{ color: isActive ? "#FFB800" : "rgba(200,200,220,0.3)", fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: "0.65rem" }}>{num}</span>}
                </div>
                <span className="font-cinzel" style={{ fontSize: "0.65rem", letterSpacing: "1.5px", textTransform: "uppercase", color: isActive ? "#FFB800" : isDone ? "#00C870" : "rgba(200,200,220,0.3)", whiteSpace: "nowrap" }}>
                  {label}
                </span>
              </button>
              {i < stepLabels.length - 1 && (
                <div style={{ width: "20px", height: "1px", background: step > num + 1 ? "rgba(0,200,100,0.4)" : "rgba(255,255,255,0.08)", flexShrink: 0 }} />
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
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", overflow: "hidden" }}>
              {(["ALL", "MARVEL", "DC", "CW"] as UniverseFilter[]).map((u, i, arr) => (
                <button key={u} onClick={() => setUniverseFilter(u)} style={{ padding: "0.5rem 1rem", background: universeFilter === u ? (u === "MARVEL" ? "rgba(220,30,30,0.25)" : u === "DC" ? "rgba(0,100,220,0.25)" : u === "CW" ? "rgba(0,180,100,0.2)" : "rgba(255,184,0,0.15)") : "transparent", border: "none", borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", color: universeFilter === u ? (u === "MARVEL" ? "#FF6060" : u === "DC" ? "#60A0FF" : u === "CW" ? "#40E090" : "#FFB800") : "rgba(200,200,220,0.35)", fontFamily: "'Cinzel', serif", fontSize: "0.7rem", cursor: "pointer", letterSpacing: "1.5px", transition: "all 0.2s" }}>
                  {u === "ALL" ? "All" : u === "MARVEL" ? "Marvel ✦" : u === "DC" ? "DC ✦" : "CW ✦"}
                </button>
              ))}
            </div>
            <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
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
                  const col = isMarvel ? "#FF6060" : isCW ? "#40E090" : "#60A0FF";
                  const bg = isMarvel ? "rgba(220,30,30,0.18)" : isCW ? "rgba(0,180,100,0.18)" : "rgba(0,100,220,0.18)";
                  const bgHover = isMarvel ? "rgba(220,30,30,0.3)" : isCW ? "rgba(0,180,100,0.3)" : "rgba(0,100,220,0.3)";
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.625rem", maxHeight: "520px", overflowY: "auto", paddingRight: "4px", scrollbarWidth: "thin", scrollbarColor: "rgba(255,184,0,0.3) transparent" }}>
            {filteredHeroes.map((hero) => {
              const isMarvel = hero.universe === "MARVEL";
              const isCW = hero.universe === "CW";
              const isSelected = selectedHeroes.some((h) => h.name === hero.name);
              const accentColor = isMarvel ? "#FF6060" : isCW ? "#40E090" : "#60A0FF";
              const accentBg = isMarvel ? "rgba(220,30,30,0.15)" : isCW ? "rgba(0,180,100,0.12)" : "rgba(0,100,220,0.15)";
              const selectedBg = isMarvel ? "rgba(220,30,30,0.2)" : isCW ? "rgba(0,180,100,0.18)" : "rgba(0,100,220,0.2)";
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
          {/* Mode tabs */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
            {(["pick", "custom"] as const).map((mode) => (
              <button key={mode} onClick={() => setVillainMode(mode)} style={{ padding: "0.5rem 1.25rem", background: villainMode === mode ? "rgba(200,0,50,0.2)" : "rgba(0,0,0,0.35)", border: `1px solid ${villainMode === mode ? "rgba(200,0,50,0.5)" : "rgba(255,255,255,0.07)"}`, borderRadius: "8px", color: villainMode === mode ? "#FF4060" : "rgba(200,200,220,0.4)", fontFamily: "'Cinzel', serif", fontSize: "0.75rem", cursor: "pointer", letterSpacing: "1.5px", transition: "all 0.2s" }}>
                {mode === "pick" ? "Choose from List" : "Create Custom Villain"}
              </button>
            ))}
          </div>

          {villainMode === "pick" ? (
            <>
              {/* Villain universe filter */}
              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "flex", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", overflow: "hidden" }}>
                  {(["ALL", "Marvel", "DC", "CW"] as VillainFilter[]).map((v, i, arr) => (
                    <button key={v} onClick={() => setVillainFilter(v)} style={{ padding: "0.5rem 1rem", background: villainFilter === v ? (v === "Marvel" ? "rgba(220,30,30,0.25)" : v === "DC" ? "rgba(0,100,220,0.25)" : v === "CW" ? "rgba(0,180,100,0.2)" : "rgba(200,0,50,0.15)") : "transparent", border: "none", borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", color: villainFilter === v ? (v === "Marvel" ? "#FF6060" : v === "DC" ? "#60A0FF" : v === "CW" ? "#40E090" : "#FF4060") : "rgba(200,200,220,0.35)", fontFamily: "'Cinzel', serif", fontSize: "0.7rem", cursor: "pointer", letterSpacing: "1.5px", transition: "all 0.2s" }}>
                      {v === "ALL" ? "All" : v === "Marvel" ? "Marvel ✦" : v === "DC" ? "DC ✦" : "CW ✦"}
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: "0.7rem", color: "rgba(200,200,220,0.3)", fontFamily: "'Montserrat', sans-serif" }}>
                  {VILLAINS.filter((v) => villainFilter === "ALL" || v.universe === villainFilter).length} villains
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.625rem", maxHeight: "520px", overflowY: "auto", paddingRight: "4px", scrollbarWidth: "thin", scrollbarColor: "rgba(200,0,50,0.3) transparent" }}>
                {VILLAINS.filter((v) => villainFilter === "ALL" || v.universe === villainFilter).map((villain) => {
                  const isSelected = selectedVillain?.name === villain.name;
                  const isMv = villain.universe === "Marvel";
                  const isCW = villain.universe === "CW";
                  const accentColor = isMv ? "#FF6060" : isCW ? "#40E090" : "#60A0FF";
                  const accentBg   = isMv ? "rgba(220,30,30,0.18)" : isCW ? "rgba(0,180,100,0.15)" : "rgba(0,100,220,0.18)";
                  return (
                    <button
                      key={villain.name}
                      onClick={() => setSelectedVillain(villain)}
                      style={{ background: isSelected ? "rgba(200,0,50,0.22)" : "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", border: `1px solid ${isSelected ? "rgba(200,0,50,0.65)" : "rgba(255,255,255,0.06)"}`, borderRadius: "12px", padding: "0.875rem", cursor: "pointer", textAlign: "left", transition: "all 0.2s ease", color: "inherit", position: "relative", boxShadow: isSelected ? "0 0 16px rgba(200,0,50,0.35)" : "none" }}
                      onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.borderColor = "rgba(200,0,50,0.35)"; e.currentTarget.style.background = accentBg; } }}
                      onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(0,0,0,0.5)"; } }}
                    >
                      {isSelected && <div style={{ position: "absolute", top: "0.4rem", right: "0.4rem", width: "18px", height: "18px", borderRadius: "50%", background: "#FF4060", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "#fff", zIndex: 2, fontWeight: 700 }}>✓</div>}
                      {/* Portrait image */}
                      <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", borderRadius: "8px", overflow: "hidden", marginBottom: "0.55rem", background: "rgba(30,0,0,0.6)" }}>
                        <img
                          src={villainImg(villain.name)}
                          alt={villain.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />
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
            <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(200,0,50,0.2)", borderRadius: "16px", padding: "1.5rem" }}>
              <label style={{ fontSize: "0.65rem", color: "rgba(200,0,50,0.6)", letterSpacing: "2.5px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", display: "block", marginBottom: "0.5rem" }}>Villain Name</label>
              <input value={customVillain} onChange={(e) => setCustomVillain(e.target.value)} placeholder="e.g. The Shadow Architect, Malachite, Ares, Emperor Zero…" style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "0.75rem 1rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.95rem", outline: "none", boxSizing: "border-box", marginBottom: "0.5rem" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(200,0,50,0.5)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
              />
              <p style={{ fontSize: "0.75rem", color: "rgba(200,200,220,0.3)", fontFamily: "'Montserrat', sans-serif" }}>The AI will develop their scheme and personality from the scenario you build.</p>
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "1.25rem" }}>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.625rem", marginTop: "0.25rem" }}>
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
                <div style={{ fontSize: "0.58rem", color: "rgba(255,64,96,0.5)", letterSpacing: "2.5px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginBottom: "0.2rem" }}>VILLAIN</div>
                <div className="font-cinzel" style={{ color: "#FF4060", fontWeight: 700, fontSize: "1rem" }}>{villainMode === "pick" ? selectedVillain?.name : customVillain}</div>
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
                  <button onClick={() => { setChapters([]); generateStory(); }} disabled={loading} style={{ padding: "0.75rem 1.5rem", background: "linear-gradient(135deg, rgba(255,184,0,0.2), rgba(255,0,128,0.15))", border: "1px solid rgba(255,184,0,0.45)", borderRadius: "10px", color: "#FFB800", fontFamily: "'Cinzel', serif", fontSize: "0.8rem", cursor: "pointer", letterSpacing: "1.5px", transition: "all 0.2s" }}>⚡ Regenerate</button>
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
