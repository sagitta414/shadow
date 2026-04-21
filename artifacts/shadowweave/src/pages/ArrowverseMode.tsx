import { useState, useRef, useEffect } from "react";
import AtmosphericLoader from "../components/AtmosphericLoader";
import { saveStoryToArchive, updateArchiveStory } from "../lib/archive";

const _BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ── COLOURS ──────────────────────────────────────────────────────────────────
const ARROW_COLOR = "#4ADE80";
const FLASH_COLOR = "#FCD34D";
const ARROW_DARK  = "#166534";
const FLASH_DARK  = "#92400E";
const CROSS_COLOR = "#C084FC";
const CROSS_DARK  = "#4C1D95";

// ── HEROINES ─────────────────────────────────────────────────────────────────
const CW_HEROINES = [
  { name: "Sara Lance",      alias: "White Canary",        show: "arrow", icon: "🕊", power: "League of Assassins master fighter & temporal agent" },
  { name: "Laurel Lance",    alias: "Black Canary",        show: "arrow", icon: "🎵", power: "Canary Cry sonic device & expert martial artist" },
  { name: "Thea Queen",      alias: "Speedy / Red Arrow",  show: "arrow", icon: "🏹", power: "Olympic archer & League-trained fighter, Lazarus Pit-enhanced" },
  { name: "Nyssa al Ghul",   alias: "Heir to the Demon",   show: "arrow", icon: "🗡", power: "League of Assassins grandmaster — deadliest woman alive" },
  { name: "Dinah Drake",     alias: "Black Canary III",    show: "arrow", icon: "🎤", power: "Metahuman Canary Cry & expert street fighter" },
  { name: "Emiko Queen",     alias: "Green Arrow II",      show: "arrow", icon: "🟢", power: "Master archer & trained assassin — Oliver's sister" },
  { name: "Felicity Smoak",  alias: "Overwatch",           show: "arrow", icon: "💻", power: "World-class hacker & tactical support, Palmer Tech CEO" },
  { name: "Iris West-Allen", alias: "The Flash's Heart",   show: "flash", icon: "⚡", power: "Speed Force conduit — the lightning rod that calls Barry home" },
  { name: "Caitlin Snow",    alias: "Killer Frost",        show: "flash", icon: "❄",  power: "Cryokinesis & frost generation — divided between two identities" },
  { name: "Jesse Quick",     alias: "Speed Force Hero",    show: "flash", icon: "💛", power: "Speedster from Earth-2 & genius-level intellect" },
  { name: "Nora West-Allen", alias: "XS",                  show: "flash", icon: "⚡", power: "Speedster from the future — Barry and Iris's daughter" },
  { name: "Cecile Horton",   alias: "District Attorney",   show: "flash", icon: "⚖",  power: "Metahuman empath — reads emotions and projects fear" },
  { name: "Alex Danvers",    alias: "DEO Director",        show: "both",  icon: "🛡", power: "ARGUS / DEO tactical director — no powers, no mercy" },
];

// ── STANDALONE SCENARIOS (unchanged from v1) ──────────────────────────────────
interface Scenario {
  id: string; show: "arrow" | "flash"; season: number; episodeRef: string;
  title: string; tagline: string; villain: string; villainDetail: string;
  setting: string; tone: string; captureMethod: string; restraints: string;
  stakes: string; details: string; storyContext: string;
}

const SCENARIOS: Scenario[] = [
  { id: "arrow-s1-undertaking", show: "arrow", season: 1, episodeRef: "S1E22 — 'Darkness on the Edge of Town'", title: "THE UNDERTAKING", tagline: "Malcolm Merlyn's plan to level the Glades. She knows too much.", villain: "Malcolm Merlyn (Dark Archer)", villainDetail: "Malcolm Merlyn — architect of the Undertaking, Dark Archer, League of Assassins veteran. Cold, patrician, absolute.", setting: "Merlyn Global Group sublevel — a private corporate vault below Star City", tone: "Psychological, cold, clinical — Malcolm is never angry, only efficient", captureMethod: "Planned interception — she walked into his building thinking she had leverage.", restraints: "Custom restraint chair with biometric locks — built into the building before she ever arrived", stakes: "The Undertaking goes forward at midnight. If she speaks, 503 city blocks are destroyed.", details: "Malcolm has known about her for weeks. He intercepted her comms, studied her routines, and left a trail she thought she was following.", storyContext: "Based on Arrow Season 1's darkest arc — the Glades Undertaking, Malcolm Merlyn's systematic destruction of Star City's poorest district as revenge for his wife's murder." },
  { id: "arrow-s2-mirakuru", show: "arrow", season: 2, episodeRef: "S2E20 — 'Seeing Red'", title: "MIRAKURU", tagline: "Slade Wilson's army is in the streets. One of them has her.", villain: "Slade Wilson (Deathstroke)", villainDetail: "Slade Wilson — former ASIS soldier, mirakuru-enhanced, consumed by grief and absolute certainty.", setting: "Starling City warzone — a seized industrial warehouse acting as Slade's forward command", tone: "Raw, physical, brutal — mirakuru makes everything harder, faster, more final", captureMethod: "Overwhelming force — three Mirakuru soldiers took her before she could call for backup.", restraints: "Industrial chain restraints — heavy enough that her fighting doesn't help", stakes: "Slade has promised Oliver suffering. She is the suffering.", details: "Slade chose her specifically. She's connected to Oliver in a way that maximises the wound. He's patient.", storyContext: "Based on Arrow Season 2's devastating Deathstroke arc — Slade Wilson on Mirakuru, an army of super-soldiers taking Starling City." },
  { id: "arrow-s3-the-climb", show: "arrow", season: 3, episodeRef: "S3E9 — 'The Climb' / S3 League Arc", title: "NANDA PARBAT", tagline: "Ra's al Ghul has judged her worthy. The League has come for her.", villain: "Ra's al Ghul", villainDetail: "Ra's al Ghul — the Demon's Head, 200-year-old grandmaster of the League of Assassins. Patient as stone.", setting: "Nanda Parbat — the League's fortress city carved into a Himalayan mountain.", tone: "Ritualistic, ancient, patient — no urgency, no rage, just ceremony and inevitability", captureMethod: "League extraction — six assassins and she never saw them.", restraints: "Nanda Parbat stone cell with hand-forged iron shackles", stakes: "The League's judgment is absolute. There is no appeal. Oliver is dead on a cliff.", details: "Ra's believes she has potential for the League. This is not punishment — it is assessment.", storyContext: "Based on Arrow Season 3's League of Assassins arc — Oliver duels Ra's al Ghul and is left for dead." },
  { id: "arrow-s3-al-sahim", show: "arrow", season: 3, episodeRef: "S3E21 — 'Al Sah-him'", title: "AL SAH-HIM", tagline: "Oliver Queen is dead. Al Sah-him has come to prove his loyalty.", villain: "Al Sah-him (Oliver Queen / Green Arrow)", villainDetail: "Al Sah-him — Oliver Queen after weeks of psychological reconditioning by Ra's al Ghul.", setting: "Star City — her own city, her own streets, but they've become hostile territory", tone: "Heartbreaking and clinical — he's thorough, mechanical, and the face she knows shows nothing", captureMethod: "Targeted mission — Al Sah-him was sent specifically for her.", restraints: "League-standard restraint system — lightweight, silent, unescapable", stakes: "If he delivers her, he completes his transformation. If he hesitates, Ra's destroys Star City.", details: "He doesn't explain. He doesn't argue. He doesn't look at her the way Oliver used to.", storyContext: "Based on Arrow Season 3's most harrowing arc — Oliver Queen becomes Al Sah-him, his identity systematically erased." },
  { id: "arrow-s4-darhk", show: "arrow", season: 4, episodeRef: "S4E18 — 'Eleven-Fifty-Nine'", title: "GENESIS", tagline: "Damien Darhk's magic holds her. The countdown to Genesis has begun.", villain: "Damien Darhk", villainDetail: "Damien Darhk — former League assassin who found something older and darker. He draws life force from death.", setting: "HIVE underground facility — Genesis bunker, part military installation, part ark.", tone: "Dark magic, claustrophobic, the horror of being held by something supernatural", captureMethod: "Magic restraint — Darhk's hand closed around her heart from across the room.", restraints: "Darhk's totem suppression — she's unbound but cannot move", stakes: "Laurel Lance is already dead. The Genesis countdown is running.", details: "Darhk is unusual among villains in that he is genuinely cheerful about the apocalypse.", storyContext: "Based on Arrow Season 4's darkest moment — Damien Darhk kills Laurel Lance and prepares to launch Genesis." },
  { id: "arrow-s5-prometheus", show: "arrow", season: 5, episodeRef: "S5E17 — 'Kapiushon'", title: "THE PROMETHEUS CHAMBER", tagline: "Adrian Chase has built this room for exactly one purpose: the truth.", villain: "Adrian Chase (Prometheus)", villainDetail: "Adrian Chase — Star City's District Attorney, secretly Prometheus, the most psychologically sophisticated villain Oliver has ever faced.", setting: "Chase's private facility — soundproofed, purpose-built, containing everything he needs", tone: "Psychological torture, confession, the horror of being truly known by the wrong person", captureMethod: "Meticulous setup — Chase spent weeks arranging this.", restraints: "Precision restraints — designed to be uncomfortable but not injurious", stakes: "Chase will not kill her. He will keep her until she tells him something true.", details: "Chase tortured Oliver for days in this same room. He applies the same methodology to her.", storyContext: "Based on Arrow Season 5's single darkest episode — 'Kapiushon', where Adrian Chase/Prometheus forces Oliver to admit the dark truth about himself." },
  { id: "arrow-s5-lianyu", show: "arrow", season: 5, episodeRef: "S5E23 — 'Lian Yu'", title: "LIAN YU", tagline: "The island. No signal. No rescue. The villain arrived before she did.", villain: "Adrian Chase (Prometheus)", villainDetail: "Adrian Chase on Lian Yu — the island where Oliver Queen was made. Chase has seeded it with traps and allies.", setting: "Lian Yu — a remote island in the North China Sea. Dense jungle, abandoned WWII structures.", tone: "Isolation, survival, the terror of being hunted on terrain the villain owns", captureMethod: "She came to rescue someone. The rescue was the bait.", restraints: "Environmental — the island itself is the prison.", stakes: "Chase has wired the island with dead man's switch explosives.", details: "Lian Yu means 'purgatory'. Chase chose this location deliberately.", storyContext: "Based on Arrow Season 5's finale — Chase brings everyone Oliver loves to Lian Yu and rigs the island with explosives." },
  { id: "arrow-s6-dragon", show: "arrow", season: 6, episodeRef: "S6 — Ricardo Diaz Arc", title: "THE DRAGON", tagline: "Ricardo Diaz owns this city now. And everything in it.", villain: "Ricardo Diaz (The Dragon)", villainDetail: "Ricardo Diaz — not a metahuman, not a mystic. A man who built a criminal empire through patient violence.", setting: "Diaz's controlled territory — could be his penthouse or a SCPD holding cell thoroughly owned by his network", tone: "Methodical, criminal, no supernatural escape routes", captureMethod: "She was arrested by police who work for him.", restraints: "Standard law enforcement restraints — but every person in this building answers to Diaz", stakes: "Diaz controls the city's infrastructure. Her team's identities, their families — he has files on everything.", details: "Diaz doesn't have a villain's monologue. He has leverage. He explains what he wants exactly once.", storyContext: "Based on Arrow Season 6's Ricardo Diaz arc — a non-metahuman criminal who systematically buys Star City's institutions." },
  { id: "arrow-s7-slabside", show: "arrow", season: 7, episodeRef: "S7E7 — 'The Slabside Redemption'", title: "SLABSIDE", tagline: "Iron Heights Maximum Security. He knows exactly who she is.", villain: "Brick (Daniel Brickwell)", villainDetail: "Brick — Iron Heights' unofficial power, a metahuman with near-impenetrable skin who runs the prison's criminal ecosystem.", setting: "Iron Heights Penitentiary — Star City's maximum security prison, filled with Team Arrow's work.", tone: "Brutal, institutional, the horror of being held somewhere built to hold people exactly like her", captureMethod: "Processing — she came in one way. She's not leaving that way.", restraints: "Iron Heights standard — power-suppression collar (if metahuman), otherwise standard institutional restraints", stakes: "Oliver Queen filled this prison. Every person inside it has a reason.", details: "Slabside is not like a villain's lair. There are guards — some of them Diaz's. The institution itself is the threat.", storyContext: "Based on Arrow Season 7's Slabside arc — Oliver Queen in Iron Heights, surrounded by every criminal he put away." },
  { id: "flash-s1-reverse-flash", show: "flash", season: 1, episodeRef: "S1E9 — 'The Man in the Yellow Suit'", title: "THE MAN IN THE YELLOW SUIT", tagline: "Eobard Thawne has been planning this for fifteen years.", villain: "Eobard Thawne (Reverse-Flash / Harrison Wells)", villainDetail: "Eobard Thawne — a man from the 25th century who came back in time to destroy Barry Allen's life.", setting: "STAR Labs — the building she trusted, built by a man whose face is not his own", tone: "Psychological horror, the terror of a threat that has known you for years", captureMethod: "Speed — she didn't see it coming.", restraints: "Speed force containment — Thawne designed something specifically for this", stakes: "Thawne has what he needs from Barry. What he does with her depends on how useful she remains.", details: "Everything about the life she trusted has been engineered by this man.", storyContext: "Based on The Flash Season 1's most chilling episode — Eobard Thawne is revealed to be Harrison Wells, having lived a stolen life inside STAR Labs." },
  { id: "flash-s1-out-of-time", show: "flash", season: 1, episodeRef: "S1E15 — 'Out of Time'", title: "OUT OF TIME", tagline: "The timeline resets. But in this version — she was there when Wells showed his face.", villain: "Eobard Thawne (Harrison Wells)", villainDetail: "Thawne with the mask off — Wells, but not Wells. Moving at speed, killing without hesitation.", setting: "STAR Labs underbelly — the secret rooms beneath the public facade", tone: "Revelation horror — the person you trusted was never real", captureMethod: "She saw something she wasn't supposed to see.", restraints: "Speed-vibration lock — Thawne's hand passes through solid objects", stakes: "A different timeline. The reset isn't coming.", details: "Cisco died in this timeline. She was the variable Thawne didn't account for.", storyContext: "Based on The Flash Season 1's 'Out of Time' — the episode that first revealed Thawne's identity." },
  { id: "flash-s2-enter-zoom", show: "flash", season: 2, episodeRef: "S2E6 — 'Enter Zoom'", title: "ENTER ZOOM", tagline: "Zoom is faster. Zoom is stronger. Zoom made that very clear.", villain: "Zoom (Hunter Zolomon)", villainDetail: "Zoom — the Earth-2 speedster who paralyses Barry in front of the entire city to prove a point.", setting: "Central City streets, then wherever Zoom chooses", tone: "Terror — pure, physical, absolute", captureMethod: "He was standing there when she turned around.", restraints: "Speed-dampening cuffs from Earth-2 — or just Zoom's hand.", stakes: "Barry is in a wheelchair. The team is broken. Zoom has nothing to fear.", details: "Zoom doesn't seem angry. He seems satisfied. This is recreation.", storyContext: "Based on The Flash Season 2's defining episode — Zoom defeats Barry and carries his paralysed body through Central City." },
  { id: "flash-s2-race-of-his-life", show: "flash", season: 2, episodeRef: "S2E23 — 'The Race of His Life'", title: "THE RACE OF HIS LIFE", tagline: "Zoom murdered Henry Allen. Barry is running on grief. She's the leverage.", villain: "Zoom (Hunter Zolomon)", villainDetail: "Zoom in his final, most dangerous form — having murdered Barry's father in front of him.", setting: "Zoom's fortified position — Joe West is also held here.", tone: "Grief-soaked, multiverse stakes", captureMethod: "Taken as leverage — to ensure Barry runs the race.", restraints: "Speed-lock restraints", stakes: "Zoom's race will destroy every parallel earth. If Barry doesn't run, she doesn't survive.", details: "Zoom is wearing Jay Garrick's face. He has taken everything from Barry.", storyContext: "Based on The Flash Season 2 finale — immediately after Zoom murders Henry Allen, he proposes a race to destroy the multiverse." },
  { id: "flash-s3-infantino-street", show: "flash", season: 3, episodeRef: "S3E22 — 'Infantino Street' / S3E23", title: "INFANTINO STREET", tagline: "Savitar has always known this night was coming. He's had years to prepare.", villain: "Savitar (Future Barry Allen)", villainDetail: "Savitar — a time remnant of Barry Allen, abandoned, who became the God of Speed inside the Speed Force.", setting: "The night everything changes — Infantino Street, the kill site fixed in the timeline", tone: "The horror of inevitability", captureMethod: "The night is the trap. Every action she takes has already been accounted for.", restraints: "Speed-force control", stakes: "Team Flash has been building toward this night all season. They fail.", details: "Savitar calls himself a god. He might be. He has lived inside a time loop of this night many times.", storyContext: "Based on The Flash Season 3's darkest episode — 'Infantino Street', ranked as the show's single most harrowing episode." },
  { id: "flash-s3-killer-frost", show: "flash", season: 3, episodeRef: "S3E7 — 'Killer Frost' / S3 Caitlin Arc", title: "WRATH OF SAVITAR", tagline: "Caitlin's powers are emerging. Killer Frost is waking up. One of them has her.", villain: "Killer Frost / Savitar (collaborative threat)", villainDetail: "Killer Frost — Caitlin Snow's dark metahuman identity, cold and precise and contemptuous of everything Caitlin cares about.", setting: "STAR Labs compromised — Killer Frost has turned against the team", tone: "Betrayal horror — she knows all your vulnerabilities", captureMethod: "Frost built the trap from the inside.", restraints: "Ice restraints — Frost's control is absolute", stakes: "Savitar is coming. Frost is his advance force.", details: "Killer Frost is not Caitlin. She has all of Caitlin's memories and none of Caitlin's warmth.", storyContext: "Based on The Flash Season 3's most psychologically complex arc — Caitlin Snow's metahuman powers manifesting as Killer Frost." },
  { id: "flash-s4-thinker", show: "flash", season: 4, episodeRef: "S4E9 — 'Don't Run' / S4E10", title: "THE THINKER", tagline: "DeVoe has planned 4,527 possible outcomes. This is one of them.", villain: "Clifford DeVoe (The Thinker)", villainDetail: "Clifford DeVoe — a man whose intelligence has been artificially elevated past the limits of human cognition.", setting: "DeVoe's constructed scenario — he chose the location, the timing, and the variables.", tone: "Intellectual horror — a villain who is genuinely smarter than the heroes and has already won", captureMethod: "Amunet Black was hired to handle the physical side. DeVoe handled the planning.", restraints: "Amunet's metallic shards — or DeVoe's mental control fields.", stakes: "DeVoe's Enlightenment will lobotomise the entire human population. Barry is being framed for murder.", details: "DeVoe doesn't gloat because gloating wastes processing power.", storyContext: "Based on The Flash Season 4's split-capture episode — DeVoe takes Barry and Amunet takes Caitlin simultaneously." },
  { id: "flash-s5-cicada", show: "flash", season: 5, episodeRef: "S5E11 — 'Seeing Red'", title: "CICADA'S DAGGER", tagline: "One wound from the dagger and every metahuman power switches off. She just found that out.", villain: "Cicada (Orlin Dwyer)", villainDetail: "Cicada — a metahuman serial killer who hunts other metahumans. His dagger negates their powers on contact.", setting: "Wherever Cicada hunts — dark streets, industrial areas, no witnesses", tone: "Stalker horror — a killer who targets the exact population she belongs to", captureMethod: "One throw. The dagger hit her before she knew he was there.", restraints: "The dagger's field — as long as it's near her, her powers are simply absent.", stakes: "Cicada has killed fourteen metahumans. She is number fifteen.", details: "Cicada is grieving and he has weaponised his grief.", storyContext: "Based on The Flash Season 5's most brutal moment — Cicada breaks Nora West-Allen's back, her healing suppressed by the dagger's field." },
  { id: "flash-s6-speed-force", show: "flash", season: 6, episodeRef: "S6 — Death of the Speed Force Arc", title: "DEATH OF THE SPEED FORCE", tagline: "The Speed Force is dying. Her powers are dying with it. He planned for exactly this.", villain: "Bloodwork (Ramsey Rosso)", villainDetail: "Ramsey Rosso — a former physician who infected himself with dark matter and can reanimate the dead.", setting: "Crisis-era Central City — the Speed Force is collapsing, every speedster is losing power", tone: "Apocalyptic, body horror, the terror of losing the power that defined you", captureMethod: "She couldn't run. That's the point.", restraints: "Bloodwork's living darkness — organic, responsive, and utterly alien", stakes: "Crisis on Infinite Earths is happening above them. The Speed Force is dead.", details: "Bloodwork is dying of a degenerative illness and wants immortality.", storyContext: "Based on The Flash Season 6's pre-Crisis arc — the Speed Force begins dying, leaving Barry's powers fluctuating." },
];

// ── SEASON DATA ────────────────────────────────────────────────────────────────
interface Episode {
  number: number;
  title: string;
  subtitle: string;
  premise: string;
  previouslyOn: string;
  cliffhanger: string;
  villain: string;
  villainDetail: string;
  setting: string;
  tone: string;
  captureMethod: string;
  restraints: string;
  stakes: string;
  details: string;
}

interface Season {
  id: string;
  show: "arrow" | "flash" | "crossover";
  seasonNumber: number;
  title: string;
  villain: string;
  logline: string;
  color: string;
  dark: string;
  icon: string;
  episodes: Episode[];
}

const SEASONS: Season[] = [
  // ─── ARROW SEASON 1 ───────────────────────────────────────────────────────
  {
    id: "arrow-s1", show: "arrow", seasonNumber: 1,
    title: "THE UNDERTAKING", villain: "Malcolm Merlyn", icon: "🏹",
    logline: "Malcolm Merlyn plans to level the Glades. She is standing in the way.",
    color: ARROW_COLOR, dark: ARROW_DARK,
    episodes: [
      { number: 1, title: "Beneath the Surface", subtitle: "She intercepted the wrong communication.", premise: "She's found a reference to something called the Undertaking in a communication from Merlyn Global. It shouldn't exist. The fact that she found it means someone at Merlyn Global knows she found it.", previouslyOn: "", cliffhanger: "He leaves a card on her desk the next morning. His personal number, handwritten. She doesn't call it — but she keeps it.", villain: "Malcolm Merlyn (Dark Archer)", villainDetail: "Malcolm Merlyn — watching, patient, operating three steps ahead of every investigator who has ever looked in his direction. He is not threatened. He is interested.", setting: "Merlyn Global Group — the public floors, the conference rooms, the places where everything looks legitimate", tone: "Cold surveillance, the horror of being watched without knowing it", captureMethod: "She isn't captured yet. She is being studied. He wants to understand exactly what she knows before he acts.", restraints: "None yet — she doesn't know she's already in his trap", stakes: "503 city blocks. The Glades. The poorest people in Starling City. And she may be the only person who can stop it.", details: "Malcolm Merlyn doesn't chase people. He waits for them to walk into the architecture he's built around them. She has already walked in.", },
      { number: 2, title: "The List", subtitle: "She refused. He sent a second message.", premise: "A man she's never met visits her at home. Politely. He explains that a man she's been investigating would like to meet her for lunch. She declines. The man nods and leaves. Two days later, her apartment has been searched. Nothing is missing. They just want her to know they've been there.", previouslyOn: "She found evidence of the Undertaking buried in Merlyn Global's communications — and a card appeared on her desk the next morning.", cliffhanger: "At lunch, Malcolm tells her she can walk away from this entirely. He says it with complete sincerity. She almost believes him.", villain: "Malcolm Merlyn", villainDetail: "Malcolm Merlyn making a polite, final offer. He has done this before. The people who declined are on a different kind of list.", setting: "A private dining room in a Merlyn Global building — completely isolated, no witnesses, impossibly elegant", tone: "The meeting that isn't a threat but is entirely a threat", captureMethod: "She walked through the door. That was all it took.", restraints: "Social — she is outnumbered by men she cannot fight in a room that has no exits she hasn't already been guided away from", stakes: "He's offering her a way out. The window closes at the end of this meal.", details: "Everything Malcolm Merlyn says is precisely true. He does not lie. He simply selects which truths to share.", },
      { number: 3, title: "Dark Archer Rising", subtitle: "The man behind the hood. She finally sees his face.", premise: "She has refused twice. Malcolm Merlyn has stopped being polite. He arrives at her location personally, in civilian clothes, with no team visible, and simply begins talking. This is the conversation he has been building toward.", previouslyOn: "She turned down his offer at lunch. Her apartment has been searched twice since then. She hasn't slept.", cliffhanger: "He tells her the device will activate in seventy-two hours. He tells her where she'll be when it does. He already knows.", villain: "Malcolm Merlyn (Dark Archer)", villainDetail: "Malcolm Merlyn explaining the Undertaking with the calm certainty of a man describing a historical event. In his mind, it has already happened.", setting: "An empty building he has acquired for this purpose — not a cell, not a dungeon, just a room with good acoustics and no listeners", tone: "The horror of ideology — a villain who believes completely in what he is doing", captureMethod: "He doesn't need to restrain her. He needs her to understand. He explains everything because the knowing is the trap.", restraints: "The weight of what she now understands — knowing changes things", stakes: "She knows the plan. She knows the location. She knows the timing. She also knows that everyone who has ever known this and tried to stop it is dead.", details: "Malcolm Merlyn lost his wife in the Glades. Every death he plans is, in his mind, justice. He wants her to understand that.", },
      { number: 4, title: "Undertaking Night", subtitle: "Midnight. The device activates. She is in his vault watching it happen.", premise: "It is midnight. The Undertaking has begun. She is in Merlyn's vault below the city, restrained, watching a screen that shows the tremor sensor data in real time. He stands behind her. He explains, in exact detail, what each number means.", previouslyOn: "Malcolm told her everything — the plan, the timeline, the location. He knew she couldn't stop it. He knew she'd try anyway. She's here now.", cliffhanger: "", villain: "Malcolm Merlyn (Dark Archer)", villainDetail: "Malcolm Merlyn at the moment of his life's work — controlled, present, and in absolute possession of everything including her.", setting: "The Undertaking vault — deep below Merlyn Global, surrounded by the technology that is destroying the city above", tone: "Apocalyptic finality — the villain has won; the only question is what he does with his prize", captureMethod: "She came to stop the device. She failed. The guards had been expecting her.", restraints: "Merlyn's vault restraints — purpose-built, accessed only by his biometrics", stakes: "503 city blocks. The device is already running. This is not a rescue scenario.", details: "Malcolm Merlyn watches the city die and he holds her so that she watches it with him. This is his tribute to his wife. He wants a witness.", },
    ],
  },

  // ─── ARROW SEASON 2 ───────────────────────────────────────────────────────
  {
    id: "arrow-s2", show: "arrow", seasonNumber: 2,
    title: "MIRAKURU", villain: "Slade Wilson / Deathstroke", icon: "🗡",
    logline: "Slade Wilson's enhanced army has taken Starling City. She is what he chose as leverage.",
    color: ARROW_COLOR, dark: ARROW_DARK,
    episodes: [
      { number: 1, title: "The Army Arrives", subtitle: "They're not random. One followed her home.", premise: "Mirakuru-enhanced soldiers are appearing in the city — stronger than anything law enforcement can stop, moving in coordinated patterns. She picks up surveillance on one. It breaks her surveillance first.", previouslyOn: "", cliffhanger: "On the roof of her building, she finds an arrow with a note. Not Oliver's arrow. An arrow left so she'd find it. The note has her home address written on it.", villain: "Slade Wilson's lieutenant", villainDetail: "A Mirakuru soldier acting on Slade's specific orders — not impulsive, not random. Directed.", setting: "Her apartment building — familiar turned hostile", tone: "Escalating dread — the enemy is already inside her safe spaces", captureMethod: "She isn't taken yet. She is being corralled. Slade is narrowing the escape routes.", restraints: "None yet", stakes: "The army is in the city. Team Arrow is stretched thin. She is alone.", details: "Mirakuru soldiers don't feel pain. They don't tire. And they are operating on a plan she doesn't have.", },
      { number: 2, title: "Blood Bath", subtitle: "Three soldiers. She didn't make it to the comms.", premise: "She was walking to a backup location when they stepped out of the shadows. Three soldiers. The first hit threw her twenty feet. She didn't get up fast enough for the second.", previouslyOn: "Someone left her address on a rooftop. She's been trying to reach Team Arrow for forty-eight hours. The comms are jammed.", cliffhanger: "In the cell below the warehouse, a slot opens in the door and a voice says: 'He wants to see you conscious. Try to stay that way.'", villain: "Slade Wilson's soldiers", villainDetail: "Mirakuru-enhanced men following exact orders — take her alive, do not damage her beyond what she can recover from, deliver her to Slade Wilson.", setting: "A seized industrial warehouse serving as Slade's forward operational command", tone: "Physical horror — opponents who cannot be hurt back", captureMethod: "Overwhelming force — three soldiers, no warning, no backup", restraints: "Industrial chain restraints bolted to a wall that she cannot break", stakes: "Slade Wilson wants to see her specifically. That is worse than being taken at random.", details: "The soldiers don't speak to her. They don't need to. They are very precisely carrying out very precise instructions.", },
      { number: 3, title: "Deathstroke Himself", subtitle: "Slade Wilson, personally. Everything he knows. Everything he plans.", premise: "Slade Wilson enters the room alone. He is calm. He sits across from her and he explains, in complete detail, who Oliver Queen is, who she is to Oliver, and what he intends to do with that.", previouslyOn: "She was taken by three soldiers and brought to Slade's warehouse. She hasn't seen anyone since.", cliffhanger: "He shows her a photograph of Oliver. He tells her Oliver knows where she is. Then he tells her Oliver is not coming. 'He's made his choice. He always does.'", villain: "Slade Wilson (Deathstroke)", villainDetail: "Slade Wilson at his most controlled — the grief and mirakuru and rage all running beneath a perfectly composed exterior that occasionally fractures in a way that is far more frightening than outright violence.", setting: "The warehouse's inner room — Slade's personal space in the operation", tone: "The horror of a man whose pain has become a weapon he's pointed at everyone near Oliver Queen", captureMethod: "She's been here since the soldiers brought her. Slade doesn't need to recapture her.", restraints: "Deathstroke's personal restraints — he handles this himself", stakes: "Slade's plan is to make Oliver watch. She is the watching.", details: "Slade Wilson was Oliver's closest ally. That history is audible in every sentence he speaks about him.", },
      { number: 4, title: "City of Blood", subtitle: "The city has fallen. What happens now is entirely his decision.", premise: "The army controls the city. The mayor is dead. SCPD has been overrun. She has been Slade's prisoner through all of it, and Slade has made very clear that what happens next is contingent entirely on whether Oliver Queen makes the right choice.", previouslyOn: "Slade told her Oliver isn't coming. She hasn't been able to tell if that's true. She's been trying to believe it isn't.", cliffhanger: "", villain: "Slade Wilson (Deathstroke)", villainDetail: "Slade Wilson at the moment his plan has succeeded — the city is his, Oliver is on the run, and she is the last piece on the board.", setting: "Slade's central command — now the operational nerve of a city under occupation", tone: "Occupation horror — the institutions are gone, the villain controls the infrastructure", captureMethod: "She has been here the entire fall of the city.", restraints: "Whatever Slade has decided by this point — he is not a man who uses more restraint than necessary", stakes: "The city belongs to him. Oliver must choose. She is the reason for the choice.", details: "Slade Wilson does not want the city. He wants Oliver's pain. She is the mechanism of that pain.", },
    ],
  },

  // ─── ARROW SEASON 3 ───────────────────────────────────────────────────────
  {
    id: "arrow-s3", show: "arrow", seasonNumber: 3,
    title: "LEAGUE OF SHADOWS", villain: "Ra's al Ghul / Al Sah-him", icon: "☪",
    logline: "The League of Assassins has come for her. Ra's al Ghul does not send assassins to kill.",
    color: ARROW_COLOR, dark: ARROW_DARK,
    episodes: [
      { number: 1, title: "The Demon's Reach", subtitle: "The League is in the city. They're not here to kill.", premise: "Six assassins intercepted her during what should have been a routine operation. They didn't attack. They delivered a message: Ra's al Ghul requests her presence. The word 'requests' was not intended to be optional.", previouslyOn: "", cliffhanger: "She's told she has until dawn to respond. At dawn, whether she responds or not, the car will be outside.", villain: "League of Assassins operatives", villainDetail: "League assassins — disciplined, silent, operating under a code so ancient that it predates the institutions she's spent her life respecting. They are not polite. They are precise.", setting: "Star City streets at night — a routine operation that became something else entirely", tone: "The weight of an ancient institution that has never been refused", captureMethod: "Six assassins, professional extraction, no violence used — none was necessary", restraints: "None needed. The League of Assassins is the restraint.", stakes: "Ra's al Ghul does not make requests twice.", details: "League operatives don't explain themselves. They deliver messages. They wait for compliance.", },
      { number: 2, title: "Nanda Parbat", subtitle: "The fortress. Ancient stone. Ra's al Ghul has been waiting.", premise: "She is in Nanda Parbat. The journey took days. The fortress is carved into a mountain in a location that does not appear on maps. Ra's al Ghul sits across from her in a room lit by firelight. He has questions.", previouslyOn: "She complied. The car was there at dawn. She got in.", cliffhanger: "Ra's tells her she will remain in Nanda Parbat until he is satisfied. He says this the same way he would comment on the weather. She asks how long. He says: 'Until I am satisfied.'", villain: "Ra's al Ghul", villainDetail: "Ra's al Ghul — two centuries of patient judgment. He has assessed thousands of people in this room. The assessment is not brief. It is not gentle. And it is not concluded.", setting: "Nanda Parbat — the League's mountain fortress, firelit, stone-cold, impossibly ancient", tone: "The horror of a judgment from which there is no appeal", captureMethod: "She is a guest who cannot leave. The League does not need locks.", restraints: "Nanda Parbat is the restraint — the mountain, the distance, the League in every corridor", stakes: "Ra's is deciding what role she will play. The options are not all survivable.", details: "Ra's al Ghul speaks of death with academic detachment. Life is a resource. The League allocates it.", },
      { number: 3, title: "Al Sah-him", subtitle: "Oliver Queen is gone. He wears his face but the eyes are wrong.", premise: "Oliver has been returned to Nanda Parbat as Al Sah-him — Ra's al Ghul's heir, his old identity erased by weeks of conditioning. Ra's has given Al Sah-him a task. She is the task.", previouslyOn: "She has been in Nanda Parbat for weeks. Ra's judgment continues. And then Al Sah-him arrived — wearing Oliver's face, walking with Oliver's precision, and looking through her like she's a stranger.", cliffhanger: "He completes his task with complete efficiency. At the door, before he leaves, he pauses for one second. Then he continues out.", villain: "Al Sah-him (Oliver Queen)", villainDetail: "Al Sah-him — Oliver Queen's muscle memory and tactical precision with Ra's al Ghul's coldness installed where Oliver's warmth used to be. He has been told who she is. The information does not produce the reaction it should.", setting: "Her cell in Nanda Parbat — the same stone room, different visitor", tone: "The horror of a familiar face with nobody she recognises behind it", captureMethod: "She is already here. He is the next chapter of her stay.", restraints: "Al Sah-him's handling — League-standard, efficient, impersonal", stakes: "If Al Sah-him completes this task, he becomes the heir. If she doesn't comply, he will escalate exactly as the League requires.", details: "The conditioning has not erased Oliver Queen. It has buried him. But burial is not death. This matters.", },
      { number: 4, title: "The Final Test", subtitle: "Ra's has one requirement left. She must decide what she is willing to become.", premise: "Ra's al Ghul tells her the League's final assessment is complete. She has survived Nanda Parbat. She has been tested by Al Sah-him. Now Ra's has a single remaining question, and the answer requires her to demonstrate — not describe — who she is at the core.", previouslyOn: "Al Sah-him completed his task. He paused at the door. She has been thinking about that pause.", cliffhanger: "", villain: "Ra's al Ghul", villainDetail: "Ra's al Ghul in the final ceremony — not a judge but a witness. He has made his assessment. This is the ratification.", setting: "The inner sanctum of Nanda Parbat — a room she has not been permitted to enter until now", tone: "Ceremonial, ancient, the weight of two hundred years of tradition bearing down", captureMethod: "She has been here long enough that capture is no longer the frame.", restraints: "The League's expectation — more binding than any physical restraint", stakes: "Ra's will tell her what the League has decided she is. She has no more moves left.", details: "Ra's al Ghul does not explain himself. He pronounces. What he pronounces is final.", },
    ],
  },

  // ─── ARROW SEASON 5 ───────────────────────────────────────────────────────
  {
    id: "arrow-s5", show: "arrow", seasonNumber: 5,
    title: "PROMETHEUS", villain: "Adrian Chase / Prometheus", icon: "🎭",
    logline: "He has been inside their operation for months. He knows everything. The chamber is only the beginning.",
    color: ARROW_COLOR, dark: ARROW_DARK,
    episodes: [
      { number: 1, title: "So It Begins", subtitle: "Green Arrow has a new enemy. He understands them.", premise: "A vigilante has been leaving bodies. The bodies are arranged — each one a message to Oliver Queen. She's the first person to read the messages correctly. That means she's the first person Prometheus has noticed.", previouslyOn: "", cliffhanger: "She finds a photograph of herself in the most recent crime scene. Taken three days ago. She was home.", villain: "Prometheus (identity unknown)", villainDetail: "Prometheus — methodical, brilliant, operating on a knowledge of Team Arrow that should be impossible. Not a random killer. A message in progress.", setting: "The crime scenes across Star City — each one a sentence in a longer message", tone: "Investigative dread — following a trail laid by someone who knows she's following it", captureMethod: "She isn't taken. She is being studied, as Malcolm studied her, but with more precision.", restraints: "None — the surveillance is the trap", stakes: "Prometheus has been active for months. He is accelerating.", details: "Every body is positioned using knowledge of Team Arrow's protocol. He knows their procedures. He's been inside them.", },
      { number: 2, title: "The DA's Secret", subtitle: "Chase is the DA. He has been inside the whole time.", premise: "She identified Prometheus. It's Adrian Chase — the District Attorney, the man who has had access to every case file she's ever filed, every operation report, every piece of operational intelligence that passed through the city's legal system. He's been inside for months.", previouslyOn: "She found a photograph of herself in a crime scene. She has been investigating. She found him.", cliffhanger: "She confronts Chase in his office. He doesn't deny it. He thanks her for being thorough. He tells her she was the only one who was going to find it.", villain: "Adrian Chase (Prometheus)", villainDetail: "Adrian Chase, the District Attorney who has been playing a long infiltration of everything she and Team Arrow have built — their evidence, their legal strategy, their operational intelligence. His access has been total.", setting: "Chase's DA office — the legitimate space he has occupied while preparing everything", tone: "Revelation horror — every trusted space was already compromised", captureMethod: "She walked into his office to confront him. He was waiting.", restraints: "The situation — she is in a government building, no weapon, no backup, and he has planned for this moment", stakes: "He knows everything. He has always known everything. The question is what he does next.", details: "Chase tells her she was the only variable he found difficult to predict. He says this admiringly.", },
      { number: 3, title: "The Chamber", subtitle: "Kapiushon. He needs one true thing from her.", premise: "She is in Chase's chamber. He has had days to prepare this. He explains, with calm precision, that he is going to be here for as long as it takes. He wants one true thing she has never said out loud. He will know when she's found it.", previouslyOn: "She confronted Chase. She is now in a room that has no windows and he is the only way out.", cliffhanger: "She says the thing. She wasn't going to. He nods. He tells her it took Oliver longer. Then he leaves her alone with it.", villain: "Adrian Chase (Prometheus)", villainDetail: "Adrian Chase in his element — the psychological excavation he has spent his entire career preparing for. He is not violent unless necessary. He prefers the mind.", setting: "Chase's facility — soundproofed, purpose-built, containing everything he needs and nothing she can use", tone: "Psychological horror — the slow excavation of something true and buried", captureMethod: "She's been here since she walked into his office.", restraints: "Precision restraints — designed to keep her present and alert", stakes: "He will not stop until she says it. He has unlimited patience and she does not.", details: "Chase has done this before. Oliver. Others. He learns from each session. He is very good at this.", },
      { number: 4, title: "Lian Yu", subtitle: "The island. Dead man's switch. The villain owns every exit.", premise: "Chase has brought her to Lian Yu — the island where Oliver Queen spent five years becoming what he is. The island is rigged. Chase is wearing a dead man's switch. Every person she cares about is somewhere on this island. This is the final act.", previouslyOn: "She said the thing Chase needed her to say. He nodded. And then, eventually, she came to be here.", cliffhanger: "", villain: "Adrian Chase (Prometheus)", villainDetail: "Adrian Chase on Lian Yu — the island that made Oliver Queen, now the stage for the ending of Oliver's story. Every trap, every landmine, every choice has been set in advance.", setting: "Lian Yu — dense jungle, WWII structures, an ARGUS prison, five years of buried history", tone: "Survival horror on closed terrain — the villain has been here longer than she has", captureMethod: "Transported to the island under conditions she couldn't prevent.", restraints: "The island — the geography is the cell", stakes: "Dead man's switch. Multiple hostages. Every escape route is a trap. There is no winning scenario.", details: "Chase says: 'Every choice Oliver has ever made has been about surviving this island. Now you get to understand why that matters.'", },
    ],
  },

  // ─── FLASH SEASON 1 ───────────────────────────────────────────────────────
  {
    id: "flash-s1", show: "flash", seasonNumber: 1,
    title: "REVERSE", villain: "Eobard Thawne / Harrison Wells", icon: "⚡",
    logline: "The man everyone trusted has been someone else for fifteen years. She is the last variable he didn't account for.",
    color: FLASH_COLOR, dark: FLASH_DARK,
    episodes: [
      { number: 1, title: "The Fastest Man Alive", subtitle: "Yellow lightning. Moving wrong. Watching.", premise: "Central City has a new threat — a yellow blur that moves with Barry Allen's speed but something about it is wrong. She's the first person to notice the wrongness. A camera has appeared in her apartment. She didn't place it.", previouslyOn: "", cliffhanger: "She reviews the STAR Labs security footage and finds three seconds of a yellow blur passing through a corridor. Dr. Wells is not in his office during those three seconds. He was supposed to be.", villain: "Eobard Thawne (Harrison Wells — identity not yet confirmed)", villainDetail: "The threat from the 25th century that has been living inside everyone's trust for fifteen years. He notices when he's noticed.", setting: "Central City — STAR Labs, her apartment, the city streets where the yellow lightning has been seen", tone: "Growing dread — the wrongness she cannot name", captureMethod: "Not yet — she is investigating and she doesn't know she's already been identified as a variable.", restraints: "None", stakes: "She has the footage. She hasn't told Barry yet.", details: "Thawne has been Harrison Wells for fifteen years. He is extraordinarily good at being trusted.", },
      { number: 2, title: "The Man in the Yellow Suit", subtitle: "Christmas. Wells. The face underneath the face.", premise: "Christmas at STAR Labs. She's been carrying the footage for two weeks. Tonight, the Reverse-Flash appears again. Tonight, something slips. She is in the wrong corridor at the wrong moment and she sees Wells move with a speed he shouldn't have.", previouslyOn: "She has the footage of Wells during the yellow lightning appearance. She has been deciding whether to tell Barry.", cliffhanger: "He smiles at her across the lab. A normal smile. But his eyes don't move and she knows he knows she was in that corridor.", villain: "Eobard Thawne (Harrison Wells)", villainDetail: "Harrison Wells in the moment just before the mask cracks — still maintaining the fiction but aware that a flaw has appeared. The calculation has changed.", setting: "STAR Labs — Christmas decorations, warm light, the worst possible place to realise what she's realised", tone: "The horror of the trusted space invaded", captureMethod: "She is still free. But he has identified her.", restraints: "None yet", stakes: "He knows she knows. She doesn't know he knows. The clock has started.", details: "Thawne has been Harrison Wells for fifteen years. He has never had this problem before. He finds it interesting.", },
      { number: 3, title: "Out of Time", subtitle: "The wrong room. The wrong moment. The timeline fractures.", premise: "She was there when Cisco figured it out. Cisco is dead now — in this timeline. And Harrison Wells is standing in the room and the mask is completely off and she is the only remaining variable he has to resolve.", previouslyOn: "Wells knows she suspects. She has been careful. Tonight, something happened and Cisco figured it out and now Cisco is dead and she is in a room with Eobard Thawne.", cliffhanger: "He looks at her for a long moment. He says: 'In every timeline I ran, you were the one I underestimated. I find that interesting.' He reaches for the speed force.", villain: "Eobard Thawne (revealed)", villainDetail: "Thawne with the mask completely removed — no Wells, no performance, no warmth. A man from the 25th century operating in a timeline he has complete knowledge of except for this one variable.", setting: "STAR Labs — the sub-level, the secret rooms, the space beneath the public façade", tone: "Revelation horror combined with physical terror — no more performance, only speed", captureMethod: "She was in the wrong room at the wrong moment and he was already in the room.", restraints: "Speed-vibration containment — Thawne's hand through matter can hold more than a wall", stakes: "Barry is running toward a wormhole. Cisco is dead. This timeline collapses in minutes. What happens in this room happens outside the reset.", details: "The original timeline didn't include her being here. That is the only thing that gives her any advantage.", },
      { number: 4, title: "Fast Enough", subtitle: "The wormhole. The night his mother died. The hour before Barry arrives.", premise: "The wormhole is open. Barry has gone back to the night Nora Allen died. Thawne is about to depart for his own time. She is what he is doing with the hour before Barry comes back.", previouslyOn: "Thawne identified her as the variable. The timeline is collapsing. She has been in his containment since the sub-level.", cliffhanger: "", villain: "Eobard Thawne (Reverse-Flash)", villainDetail: "Thawne in his final hour in this timeline — everything is settled, everything is resolved, he has one hour and she is here and he finds, for the first time in fifteen years, that he has time to spare.", setting: "STAR Labs — the night of the singularity, orange light through the windows, the wormhole humming somewhere above them", tone: "The singularity is the backdrop; the room is the story; he has won and he knows it", captureMethod: "She has been here since the sub-level.", restraints: "Thawne's personal containment — he doesn't need elaborate restraints. He is the restraint.", stakes: "Barry is inside the wormhole. Nobody is coming for her. Thawne has one hour.", details: "Eobard Thawne has spent fifteen years preparing for the moment he could leave. He is using the time before departure as he wishes.", },
    ],
  },

  // ─── FLASH SEASON 2 ───────────────────────────────────────────────────────
  {
    id: "flash-s2", show: "flash", seasonNumber: 2,
    title: "FEAR", villain: "Zoom / Hunter Zolomon", icon: "🌑",
    logline: "The fastest villain alive has one purpose: to prove he is the only thing worth fearing. She is his proof.",
    color: FLASH_COLOR, dark: FLASH_DARK,
    episodes: [
      { number: 1, title: "The Darkness and the Light", subtitle: "Earth-2 is open. Zoom knows she exists.", premise: "The breach between Earth-1 and Earth-2 has been open for weeks. Metahumans have been arriving through it. One of them delivers a message — not from Earth-2 in general, but from Zoom specifically. The message names her.", previouslyOn: "", cliffhanger: "The metahuman's last words before she stops fighting: 'He just wants you to know he sees you. He said to tell you that specifically.'", villain: "Earth-2 metahuman (Zoom's message carrier)", villainDetail: "An Earth-2 metahuman delivering a very specific message as an act of introduction. Zoom does not make random gestures.", setting: "Central City — the breach locations, the places where Earth-2 bleeds through into Earth-1", tone: "The horror of being noticed by something from another world", captureMethod: "She defeats the metahuman but the message is already delivered.", restraints: "None", stakes: "Zoom knows who she is. That is entirely different from not being noticed.", details: "Zoom has studied Earth-1 through the breaches. He has been watching for months. He has selected specific people for specific purposes.", },
      { number: 2, title: "Enter Zoom", subtitle: "He is here. Barry is on the ground. She is what comes next.", premise: "Zoom crossed from Earth-2 in full, in public, to demonstrate something to Central City. Barry Allen is paralysed on the street. Zoom is still in the city. She is on the street two blocks away and he knows exactly where she is.", previouslyOn: "Zoom sent her a message. She has been trying to track the breach patterns since. Tonight, Zoom appeared and Barry is paralysed and the city is silent and she can hear something moving.", cliffhanger: "She wakes up in a location that is not Central City. The architecture is wrong. The sky is the wrong colour. She is on Earth-2.", villain: "Zoom (Hunter Zolomon)", villainDetail: "Zoom at his most purposeful — having demonstrated his superiority to the entire city, now executing the secondary part of his plan.", setting: "Central City streets — post-Zoom, scattered debris, paralysed Flash, silent civilians", tone: "The aftermath of absolute terror — she witnesses what happened and then becomes part of what happens next", captureMethod: "Speed — she didn't see it coming. Speed is an answer to everything.", restraints: "Speed-dampening cuffs from Earth-2, purpose-engineered", stakes: "Barry cannot walk. Team Flash is in shock. She is on Earth-2.", details: "Zoom moves at a speed that reduces preparation to irrelevance.", },
      { number: 3, title: "Earth-2 Cells", subtitle: "Zoom's fortress. The pipeline built to hold speedsters.", premise: "She is in Zoom's Earth-2 fortress. The cells here are designed to contain speedsters — the Earth-2 equivalent of STAR Labs' pipeline, built by someone who understands exactly what powers need to be contained and how. Her cell has a previous occupant's marks on the wall.", previouslyOn: "She was taken to Earth-2. She woke up here. She has been in this cell for what she estimates is three days.", cliffhanger: "The cell across from hers is occupied. The figure inside looks exactly like Harrison Wells.", villain: "Zoom (Hunter Zolomon)", villainDetail: "Zoom as the architect of this space — the fortress, the cells, the system of containment that he has been running for years. Earth-2 is his.", setting: "Zoom's fortress on Earth-2 — cold, industrial, purpose-built, the cells of a man who holds prisoners long-term", tone: "Captivity on a parallel earth — no rescue coming from this direction", captureMethod: "She has been here since arriving on Earth-2.", restraints: "Earth-2 power-dampening cell — designed for speedsters but effective on everything", stakes: "No Flash is coming. Team Flash doesn't know where to open a breach. She is the first thing that has ever breached to this fortress from Earth-1.", details: "The marks on her cell wall are tally marks. Someone was here for a very long time.", },
      { number: 4, title: "The Race of His Life", subtitle: "Henry Allen is dead. The multiverse is the prize. She is the guarantee.", premise: "Zoom murdered Barry's father in front of him and then proposed a race that will destroy every parallel earth. She is held as insurance against Barry's non-participation. Zoom's hold over her ensures Barry runs. Whatever Barry does in that race, she is here.", previouslyOn: "She has been Zoom's prisoner across two earths. Barry is about to race Zoom for the fate of the multiverse. She is why Barry will run.", cliffhanger: "", villain: "Zoom (Hunter Zolomon)", villainDetail: "Zoom at his most absolute — Henry Allen is dead, the race is set, Barry is controlled by grief, and she is the lever. He has everything.", setting: "Zoom's Earth-1 operational base — the location he has chosen for the race and for holding his leverage", tone: "Griefstruck, multiverse-scale, the horror of being used as the mechanism of Barry's compliance", captureMethod: "She has been a prisoner since Earth-2.", restraints: "Zoom's personal handling — he is not using elaborate technology anymore. He is the threat.", stakes: "The entire multiverse. Henry Allen is already gone. If Barry loses, everything dies.", details: "Zoom is wearing Jay Garrick's face. He has taken everything from Barry that Barry allowed himself to need.", },
    ],
  },

  // ─── FLASH SEASON 3 ───────────────────────────────────────────────────────
  {
    id: "flash-s3", show: "flash", seasonNumber: 3,
    title: "THE GOD OF SPEED", villain: "Savitar (Future Barry Allen)", icon: "⚡",
    logline: "He has lived inside this timeline so many times that he knows everything that will happen. He has already won.",
    color: FLASH_COLOR, dark: FLASH_DARK,
    episodes: [
      { number: 1, title: "Flashpoint Ripples", subtitle: "A new timeline. A god who already knows the ending.", premise: "The timeline is different. Details she can't account for. Someone — something — is moving at speeds that leave no trace. A message appears on a surface she was watching: 'I know who you are in every timeline. This one is no different.'", previouslyOn: "", cliffhanger: "She receives a recording. It's her own voice, from a date six months in the future, saying something she would never say. The recording ends with a sound like lightning.", villain: "Savitar (presence only — identity unknown)", villainDetail: "Savitar communicating from inside the Speed Force — a presence felt before it is seen, a god who has been watching this timeline long before anyone in it knew he existed.", setting: "Central City — altered by Flashpoint, subtle differences that accumulate into dread", tone: "Cosmic dread — the feeling of being observed by something that has seen this all before", captureMethod: "Not yet. He is letting her know he is watching.", restraints: "None", stakes: "He already knows how this ends. She doesn't.", details: "Savitar is a time remnant of Barry Allen. He knows every ally's psychology, every weakness, every decision they will make.", },
      { number: 2, title: "Killer Frost", subtitle: "Caitlin's other half answers to Savitar. She knows where you live.", premise: "Killer Frost has emerged — Caitlin Snow's dark metahuman identity, serving Savitar. Frost has used everything Caitlin knew about Team Flash's locations, schedules, and weaknesses. She was waiting in a place she should not have been able to find.", previouslyOn: "Savitar has been sending messages. Team Flash has been investigating. Caitlin's cold powers have been emerging and she has been trying to suppress them.", cliffhanger: "Frost looks at her and says: 'He told me you'd be the hardest to keep. He said to tell you that he said that.' She smiles with Caitlin's mouth.", villain: "Killer Frost (Caitlin Snow) / Savitar", villainDetail: "Killer Frost — Caitlin Snow's body, her memories, none of her warmth. Operating as Savitar's advance operative because Frost believes in what the God of Speed offers.", setting: "A location from Caitlin's memories — a place she described to Team Flash once, in private", tone: "Betrayal horror — the person who built the trap knew the inside of the building", captureMethod: "Ambush in a safe space that was only safe until Frost had access to Caitlin's memories.", restraints: "Ice restraints — Frost's control is absolute at this temperature", stakes: "Savitar has access to a Caitlin Snow who will not stop him.", details: "Frost refers to Caitlin in the third person. She finds the sentiment confusing.", },
      { number: 3, title: "The Wrath of Savitar", subtitle: "He was never truly trapped. Everything was misdirection. She was the plan.", premise: "Team Flash believed they had Savitar contained. They were wrong. Everything they did to trap him was part of his plan to escape. She was the key they didn't know they were holding — and now Savitar is free and he wants the key.", previouslyOn: "Killer Frost ambushed her. She has been held. Team Flash has been trying to trap Savitar and believing they were succeeding.", cliffhanger: "He speaks to her for the first time. His voice is Barry's voice processed through something vast and wrong. He says: 'I watched you in eleven timelines. You never stopped trying. I find that beautiful.' Then he accelerates.", villain: "Savitar (Future Barry Allen)", villainDetail: "Savitar free from containment — the God of Speed in full presence, not a voice or a message but a physical reality moving at the edge of what physics allows.", setting: "Wherever the containment breach occurred — a landscape Savitar has now restructured to his purposes", tone: "The horror of the trap within a trap — every action Team Flash took was part of his plan", captureMethod: "She was the mechanism of his escape without knowing it. Now she is his.", restraints: "Speed Force control — Savitar can stop time relative to anyone he chooses", stakes: "Savitar is free. Infantino Street is four months away. He knows this. She doesn't — yet.", details: "Savitar has lived this timeline so many times that his planning operates beyond anything conventional strategy can counter.", },
      { number: 4, title: "Infantino Street", subtitle: "The night that cannot be changed. The God of Speed arrives for his appointment.", premise: "This is the night. Team Flash has been building toward preventing this moment for the entire season. Every plan has been countered. Every contingency has been addressed. Savitar is here. He has always been here. He has always been at this moment.", previouslyOn: "Savitar is free. He has told her he knows what happens on Infantino Street. Team Flash has tried everything. The night has arrived.", cliffhanger: "", villain: "Savitar (Future Barry Allen)", villainDetail: "Savitar at the fulcrum of his entire existence — this night is why he became what he became. The God of Speed, the time remnant, the abandoned future Barry Allen who turned his grief and rage into godhood.", setting: "Infantino Street — the kill site fixed in the timeline, the location Savitar has been moving toward since the beginning", tone: "Inevitable horror — a night everyone has been trying to change and cannot change", captureMethod: "The night is the trap. Every path leads here.", restraints: "Speed Force absolute control", stakes: "This is the night that cannot be changed. Team Flash tried. They failed. She is in it now.", details: "Savitar says: 'Every time I've watched this, I've tried to feel something I don't. You'd think it would get easier. It doesn't. I find that interesting.' Then the night completes itself.", },
    ],
  },

  // ─── CRISIS CROSSOVER ─────────────────────────────────────────────────────
  {
    id: "crossover-crisis", show: "crossover", seasonNumber: 1,
    title: "CRISIS ON INFINITE EARTHS", villain: "The Anti-Monitor / Mar Novu", icon: "🌌",
    logline: "The anti-matter wave is consuming parallel earths. In the chaos of the multiverse dying, a villain is collecting what the wave will erase.",
    color: CROSS_COLOR, dark: CROSS_DARK,
    episodes: [
      { number: 1, title: "Wave Front", subtitle: "Earth-38 is gone. The Monitor needs something. So does someone else.", premise: "The anti-matter wave destroyed Earth-38. Billions of refugees are crossing to Earth-1 via breaches. In the chaos, a figure is moving through the crowds — not evacuating. Collecting. She is identified as valuable. A breach opens around her without warning.", previouslyOn: "", cliffhanger: "She arrives at an unfamiliar location. The sky has two moons. A voice says: 'You aren't from the earth I wanted. But you're interesting. Stay.'", villain: "Shadow Demon / Anti-Monitor agent", villainDetail: "An operative of the Anti-Monitor using the crisis as cover — in the chaos of multiple earths dying simultaneously, disappearances go unnoticed. He is collecting people with specific qualities for a purpose she hasn't been told.", setting: "The breach-space between earths — a transitional zone that doesn't belong to any specific earth", tone: "Cosmic horror — the multiverse is dying and individual survival is lost in the scale of it", captureMethod: "A breach opened around her during the evacuation chaos. She wasn't able to resist it.", restraints: "Unfamiliar technology from an earth she's never been to", stakes: "The anti-matter wave is coming. She is somewhere between earths. Nobody knows where she is.", details: "In the chaos of Crisis, disappearances are measured in billions. One person is beneath the noise.", },
      { number: 2, title: "Parallel Prisons", subtitle: "Other prisoners. Other earths. The collector has been busy.", premise: "She is not alone in this location — wherever it is. There are others, from earths she recognises and earths she doesn't. The collector has been using the crisis to gather specific people without anyone noticing. She is trying to understand the pattern.", previouslyOn: "A breach took her during the Crisis evacuation. She is in an unfamiliar location with unfamiliar technology. Someone brought her here deliberately.", cliffhanger: "One of the other prisoners says: 'He told me the anti-matter wave would be here in six days. He said that's when he decides what to do with us. He seemed very calm about it.'", villain: "The Collector (Anti-Monitor's agent / original villain)", villainDetail: "The Collector — operating in the margins of the Crisis, exploiting the chaos to acquire people with specific qualities that the Anti-Monitor's reorganisation of the universe will require. Patient, precise, and very aware that the normal rules of consequence have temporarily suspended.", setting: "The Collector's station — positioned between earths, in a location the anti-matter wave has not yet reached", tone: "Claustrophobic multiverse horror — the world outside is ending; the world inside is a controlled experiment", captureMethod: "Breach collection — she is one of multiple acquisitions.", restraints: "Cross-earth containment — technology from five different earths combined into something that works on all of them", stakes: "The anti-matter wave is six days away from this location.", details: "The other prisoners come from earths that no longer exist. She may be the last surviving representative of hers.", },
      { number: 3, title: "Earth-X", subtitle: "The Nazi parallel earth. Her counterpart helped bring her here.", premise: "She has been moved. She is on Earth-X — the parallel earth where the Axis powers won the Second World War. Her Earth-X counterpart is a collaborator. The dark version of herself who has been navigating the Reich's power structure for years has an interest in studying the original.", previouslyOn: "She was in the Collector's station. She was transferred. She is now on Earth-X.", cliffhanger: "Her counterpart sits across from her and says: 'I've been curious about you since I heard about the Crisis. What does it feel like, knowing your version of events was the one worth saving?' She smiles with her face.", villain: "Earth-X doppelganger / Reichsmen", villainDetail: "The Earth-X version of herself — who has survived under the Reich by being useful, who finds the prime-earth version a fascinating case study, and who has access to Earth-X's considerable resources.", setting: "Earth-X — a parallel earth where the Nazis won, the aesthetic of fascism applied to a recognisable world", tone: "The horror of your own face across a table from you", captureMethod: "Transferred from the Collector's station to Earth-X custody.", restraints: "Earth-X Reich detention — cold, efficient, ideological", stakes: "She is on an earth without allies. Her counterpart has the Reich's full resources. Earth-1 doesn't know where she is.", details: "Earth-X is not simply a dark mirror — it is a fully functioning alternate world with its own history, its own loyalties, and its own version of everyone she has ever known.", },
      { number: 4, title: "The Final Night", subtitle: "Crisis resolves. In the chaos of the new multiverse forming, who has her?", premise: "Crisis on Infinite Earths is ending. The multiverse is being reorganised. The anti-matter wave is receding. In the confusion of earths being reborn, the normal coordinates of who has her and where she is have become temporarily meaningless. Whoever holds her at the moment the new multiverse crystallises determines what universe she ends up in.", previouslyOn: "She has been through the Collector's station, Earth-X, and the Crisis itself. The multiverse is resolving around her.", cliffhanger: "", villain: "The Collector / Anti-Monitor's reorganisation", villainDetail: "The Collector in his most dangerous configuration — with the Anti-Monitor defeated and the multiverse reforming, the rules are being written in real time. He intends to write some of them.", setting: "The space where the new multiverse is forming — physics in flux, the geography of reality being negotiated", tone: "Cosmic horror at its most intimate — the universe is ending and restarting and she is caught inside the mechanism", captureMethod: "She has been a prisoner through the entire Crisis.", restraints: "The reorganisation itself — she cannot leave the space she's in because space is currently undefined", stakes: "When the new multiverse crystallises, she will be wherever she is. The question is who else is there.", details: "The Collector's intention is to be positioned correctly when the new universe writes its rules. She is part of the positioning.", },
    ],
  },
];

// ── HELPERS ────────────────────────────────────────────────────────────────────
function streamRequest(endpoint: string, body: object, onChunk: (c: string) => void, signal?: AbortSignal): Promise<string> {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return fetch(`${base}${endpoint}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body), signal,
  }).then(async (res) => {
    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "", full = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n"); buf = lines.pop()!;
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try { const p = JSON.parse(data); const t = p.choices?.[0]?.delta?.content ?? ""; if (t) { full += t; onChunk(t); } } catch {}
        }
      }
    }
    return full;
  });
}
function isAbort(e: unknown) { return e instanceof DOMException && e.name === "AbortError"; }

const PROGRESS_KEY = "sw_arrowverse_progress";
function loadProgress(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "{}"); } catch { return {}; }
}
function markEpisodeDone(seasonId: string, epNum: number) {
  const p = loadProgress();
  p[`${seasonId}_ep${epNum}`] = true;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}
function isEpisodeDone(progress: Record<string, boolean>, seasonId: string, epNum: number) {
  return !!progress[`${seasonId}_ep${epNum}`];
}
function episodesCompleted(progress: Record<string, boolean>, seasonId: string, total: number) {
  return Array.from({ length: total }, (_, i) => isEpisodeDone(progress, seasonId, i + 1)).filter(Boolean).length;
}

// ── COMPONENT ──────────────────────────────────────────────────────────────────
interface Props { onBack: () => void; }

export default function ArrowverseMode({ onBack }: Props) {
  // Main nav
  const [mainView, setMainView] = useState<"scenarios" | "seasons">("scenarios");

  // Standalone scenario state
  const [activeShow, setActiveShow] = useState<"all" | "arrow" | "flash">("all");
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [step, setStep] = useState<"browse" | "configure" | "story">("browse");

  // Season state
  const [seasonShowFilter, setSeasonShowFilter] = useState<"all" | "arrow" | "flash" | "crossover">("all");
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [seasonStep, setSeasonStep] = useState<"seasons" | "episodes" | "configure" | "story">("seasons");
  const [progress, setProgress] = useState<Record<string, boolean>>(loadProgress);

  // Shared generation state
  const [selectedHeroine, setSelectedHeroine] = useState(CW_HEROINES[0]);
  const [customVillain, setCustomVillain] = useState("");
  const [intensity, setIntensity] = useState<1 | 2 | 3>(2);
  const [chapters, setChapters] = useState<string[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Typewriter
  const [displayedText, setDisplayedText] = useState("");
  const typeRef = useRef<number | null>(null);

  useEffect(() => {
    if (chapters.length === 0) return;
    const last = chapters[chapters.length - 1];
    setDisplayedText("");
    let i = 0;
    if (typeRef.current) clearInterval(typeRef.current);
    typeRef.current = setInterval(() => {
      i++;
      setDisplayedText(last.slice(0, i));
      if (i >= last.length && typeRef.current) clearInterval(typeRef.current);
    }, 12) as unknown as number;
    return () => { if (typeRef.current) clearInterval(typeRef.current); };
  }, [chapters]);

  const filteredScenarios = SCENARIOS.filter(s => activeShow === "all" || s.show === activeShow);
  const filteredSeasons   = SEASONS.filter(s => seasonShowFilter === "all" || s.show === seasonShowFilter);

  // Colors
  const storyColor = selectedSeason?.color ?? (selectedScenario?.show === "flash" ? FLASH_COLOR : ARROW_COLOR);
  const storyDark  = selectedSeason?.dark  ?? (selectedScenario?.show === "flash" ? FLASH_DARK  : ARROW_DARK);

  function resetStory() {
    setChapters([]); setStreamingText(""); setError(""); setSavedId(null); setDisplayedText("");
  }

  function selectScenario(s: Scenario) {
    setSelectedScenario(s); setStep("configure"); resetStory();
  }

  function selectSeason(s: Season) {
    setSelectedSeason(s); setSeasonStep("episodes");
  }

  function selectEpisode(ep: Episode) {
    if (!selectedSeason) return;
    const done = isEpisodeDone(progress, selectedSeason.id, ep.number - 1);
    if (ep.number > 1 && !done) return;
    setSelectedEpisode(ep); setSeasonStep("configure"); resetStory();
    setCustomVillain("");
  }

  // ── GENERATION ────────────────────────────────────────────────────────────
  async function generate(isEpisodic = false) {
    const sc = isEpisodic ? null : selectedScenario;
    const ep = isEpisodic ? selectedEpisode : null;
    const season = isEpisodic ? selectedSeason : null;

    if (!sc && !ep) return;

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true); resetStory();

    const villain = customVillain.trim() || (ep ? ep.villain : sc!.villain);
    const villainDetail = ep ? ep.villainDetail : sc!.villainDetail;
    const setting = ep ? ep.setting : sc!.setting;
    const tone = ep ? ep.tone : sc!.tone;
    const captureMethod = ep ? ep.captureMethod : sc!.captureMethod;
    const restraints = ep ? ep.restraints : sc!.restraints;
    const stakes = ep ? ep.stakes : sc!.stakes;
    const details = ep ? ep.details : sc!.details;

    const intensityLabel = intensity === 1 ? "Tense — psychological pressure, power exchange, minimal graphic content"
      : intensity === 3 ? "Brutal — absolute maximum depravity, no limits, extreme explicit detail, full degradation"
      : "Explicit — graphic sexual content and domination, full explicit detail";

    const previouslyOnContext = isEpisodic && ep && ep.previouslyOn
      ? `\n\nPREVIOUSLY ON ${season?.show === "flash" ? "THE FLASH" : "ARROW"}: ${ep.previouslyOn}`
      : "";

    const episodeContext = isEpisodic && ep && season
      ? `ARROWVERSE EPISODIC SEASON: This is Episode ${ep.number} of Season "${season.title}" — "${ep.title}". ${ep.premise}${previouslyOnContext}\n\nEnd the story with a cliffhanger that leads into the next episode: ${ep.cliffhanger || "a final image of unresolved tension that demands continuation."}`
      : `ARROWVERSE EPISODE CONTEXT: ${sc!.storyContext}`;

    let accumulated = "";
    try {
      const full = await streamRequest("/api/story/superhero", {
        hero: `${selectedHeroine.name} (${selectedHeroine.alias}) — Power: ${selectedHeroine.power} — Universe: CW Arrowverse`,
        villain: `${villain} — ${villainDetail}`,
        setting, stakes, tone, captureMethod, restraints,
        intensity: intensityLabel,
        storyLength: "Epic Saga",
        details: `${episodeContext}\n\nKEY DETAILS: ${details}\n\nWrite with authentic Arrowverse tone — dark, character-driven, grounded in the show's specific mythology and locations. Reference Arrowverse locations, organisations, and lore wherever possible.`,
      }, (c) => { accumulated += c; setStreamingText(accumulated); }, ctrl.signal);

      setChapters([full]);
      if (isEpisodic) {
        setSeasonStep("story");
        const newProgress = { ...progress };
        markEpisodeDone(season!.id, ep!.number);
        newProgress[`${season!.id}_ep${ep!.number}`] = true;
        setProgress(newProgress);
      } else {
        setStep("story");
      }

      const id = saveStoryToArchive({
        title: isEpisodic ? `${season?.title} S${season?.seasonNumber}E${ep?.number}: ${ep?.title} — ${selectedHeroine.name}` : `${sc!.title} — ${selectedHeroine.name}`,
        hero: selectedHeroine.name,
        villain,
        mode: isEpisodic ? `Arrowverse Season Mode — ${season?.title} Ep ${ep?.number}` : `Arrowverse Mode — ${sc!.episodeRef}`,
        chapters: [full],
        wordCount: full.split(/\s+/).filter(Boolean).length,
      });
      setSavedId(id);
    } catch (e) {
      if (isAbort(e)) {
        if (accumulated.trim()) { setChapters([accumulated]); isEpisodic ? setSeasonStep("story") : setStep("story"); }
      } else {
        setError(e instanceof Error ? e.message : "Generation failed");
      }
    } finally {
      setLoading(false); setStreamingText(""); abortRef.current = null;
    }
  }

  async function continueStory(isEpisodic = false) {
    if (chapters.length === 0) return;
    const ep = isEpisodic ? selectedEpisode : null;
    const sc = isEpisodic ? null : selectedScenario;
    const villain = customVillain.trim() || (ep ? ep.villain : sc?.villain ?? "");

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true); setStreamingText(""); setError("");

    let accumulated = "";
    try {
      const full = await streamRequest("/api/story/superhero-continue", {
        previousChapters: chapters.join("\n\n"),
        chapterNumber: chapters.length + 1,
        hero: `${selectedHeroine.name} (${selectedHeroine.alias})`,
        villain,
        setting: ep ? ep.setting : sc?.setting ?? "",
        tone: ep ? ep.tone : sc?.tone ?? "",
        intensity: intensity === 1 ? "Tense" : intensity === 3 ? "Brutal" : "Explicit",
        details: `Continue with authentic Arrowverse tone. Escalate — more intense, more psychologically deep, more physically explicit.`,
      }, (c) => { accumulated += c; setStreamingText(accumulated); }, ctrl.signal);

      const newChapters = [...chapters, full];
      setChapters(newChapters);
      if (savedId) updateArchiveStory(savedId, { chapters: newChapters, wordCount: newChapters.join(" ").split(/\s+/).filter(Boolean).length });
    } catch (e) {
      if (isAbort(e)) { if (accumulated.trim()) setChapters([...chapters, accumulated]); }
      else setError(e instanceof Error ? e.message : "Continue failed");
    } finally {
      setLoading(false); setStreamingText(""); abortRef.current = null;
    }
  }

  // ── SHARED CONFIG UI ──────────────────────────────────────────────────────
  function ConfigurePanel({ isEpisodic }: { isEpisodic: boolean }) {
    const ep = isEpisodic ? selectedEpisode : null;
    const sc = isEpisodic ? null : selectedScenario;
    const color = isEpisodic ? (selectedSeason?.color ?? ARROW_COLOR) : (sc?.show === "flash" ? FLASH_COLOR : ARROW_COLOR);
    const dark  = isEpisodic ? (selectedSeason?.dark  ?? ARROW_DARK)  : (sc?.show === "flash" ? FLASH_DARK  : ARROW_DARK);

    return (
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Episode / Scenario card */}
        <div style={{ background: `linear-gradient(135deg, ${dark}33, #0a0a0f)`, border: `1px solid ${color}33`, borderRadius: "12px", padding: "24px", marginBottom: "28px" }}>
          {isEpisodic && ep && selectedSeason && (
            <>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "16px" }}>{selectedSeason.icon}</span>
                <div style={{ background: `${color}18`, border: `1px solid ${color}33`, borderRadius: "4px", padding: "3px 10px", fontSize: "10px", color, letterSpacing: "2px", fontWeight: 700 }}>
                  S{selectedSeason.seasonNumber} E{ep.number}
                </div>
                <div style={{ fontSize: "11px", color: "#555" }}>{selectedSeason.title}</div>
              </div>
              <div style={{ fontSize: "19px", fontWeight: 900, color, letterSpacing: "2px", marginBottom: "4px" }}>{ep.title}</div>
              <div style={{ fontSize: "12px", color: "#888", fontStyle: "italic", marginBottom: "14px" }}>"{ep.subtitle}"</div>
              {ep.previouslyOn && (
                <div style={{ background: "#0a0a14", border: `1px solid ${color}22`, borderRadius: "6px", padding: "12px 14px", marginBottom: "14px" }}>
                  <div style={{ fontSize: "10px", letterSpacing: "2px", color, marginBottom: "6px" }}>PREVIOUSLY ON…</div>
                  <div style={{ fontSize: "12px", color: "#777", lineHeight: 1.7 }}>{ep.previouslyOn}</div>
                </div>
              )}
              <div style={{ fontSize: "13px", color: "#aaa", lineHeight: 1.7 }}>{ep.premise}</div>
            </>
          )}
          {!isEpisodic && sc && (
            <>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ background: `${color}18`, border: `1px solid ${color}33`, borderRadius: "4px", padding: "3px 10px", fontSize: "10px", color, letterSpacing: "2px", fontWeight: 700 }}>
                  {sc.show === "flash" ? "⚡ THE FLASH" : "🏹 ARROW"} S{sc.season}
                </div>
                <div style={{ fontSize: "11px", color: "#555" }}>{sc.episodeRef}</div>
              </div>
              <div style={{ fontSize: "19px", fontWeight: 900, color, letterSpacing: "2px", marginBottom: "4px" }}>{sc.title}</div>
              <div style={{ fontSize: "12px", color: "#aaa", fontStyle: "italic", marginBottom: "14px" }}>"{sc.tagline}"</div>
              <div style={{ fontSize: "12px", color: "#777", lineHeight: 1.7 }}>{sc.storyContext}</div>
            </>
          )}
        </div>

        {/* Heroine */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#555", marginBottom: "12px" }}>CHOOSE HEROINE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "8px" }}>
            {CW_HEROINES.map(h => (
              <button key={h.name} onClick={() => setSelectedHeroine(h)}
                style={{ background: selectedHeroine.name === h.name ? `${color}18` : "#0e0e18", border: `1px solid ${selectedHeroine.name === h.name ? color : "#222"}`, borderRadius: "8px", padding: "10px 12px", cursor: "pointer", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "16px" }}>{h.icon}</span>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: selectedHeroine.name === h.name ? color : "#ddd" }}>{h.name}</div>
                    <div style={{ fontSize: "10px", color: "#555" }}>{h.alias}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Villain override */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#555", marginBottom: "6px" }}>VILLAIN OVERRIDE (optional)</div>
          <div style={{ fontSize: "12px", color: "#555", marginBottom: "8px" }}>Default: <span style={{ color }}>{ep ? ep.villain : sc?.villain}</span></div>
          <input value={customVillain} onChange={e => setCustomVillain(e.target.value)} placeholder="Override villain (leave blank for episode villain)"
            style={{ width: "100%", background: "#0e0e18", border: "1px solid #222", borderRadius: "8px", padding: "10px 14px", color: "#ddd", fontSize: "13px", boxSizing: "border-box" }} />
        </div>

        {/* Intensity */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#555", marginBottom: "12px" }}>INTENSITY</div>
          <div style={{ display: "flex", gap: "8px" }}>
            {([1, 2, 3] as const).map(i => (
              <button key={i} onClick={() => setIntensity(i)}
                style={{ flex: 1, background: intensity === i ? `${color}18` : "#0e0e18", border: `1px solid ${intensity === i ? color : "#222"}`, borderRadius: "8px", padding: "12px 8px", cursor: "pointer", color: intensity === i ? color : "#666", fontWeight: 700, fontSize: "12px", letterSpacing: "1px" }}>
                {i === 1 ? "TENSE" : i === 2 ? "EXPLICIT" : "BRUTAL"}
              </button>
            ))}
          </div>
        </div>

        {error && <div style={{ color: "#f87171", background: "#1a0000", border: "1px solid #7f1d1d", borderRadius: "6px", padding: "12px", marginBottom: "16px" }}>{error}</div>}

        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => generate(isEpisodic)}
            style={{ flex: 1, background: `linear-gradient(135deg, ${dark}aa, ${color}33)`, border: `1px solid ${color}55`, color, borderRadius: "10px", padding: "16px", cursor: "pointer", fontWeight: 900, letterSpacing: "3px", fontSize: "14px" }}>
            GENERATE STORY
          </button>
          <button onClick={() => isEpisodic ? setSeasonStep("episodes") : setStep("browse")}
            style={{ background: "transparent", border: "1px solid #333", color: "#666", borderRadius: "10px", padding: "16px 20px", cursor: "pointer" }}>←</button>
        </div>
      </div>
    );
  }

  // ── STORY VIEW ─────────────────────────────────────────────────────────────
  function StoryView({ isEpisodic }: { isEpisodic: boolean }) {
    const ep = isEpisodic ? selectedEpisode : null;
    const sc = isEpisodic ? null : selectedScenario;
    const color = storyColor;
    const dark  = storyDark;
    const nextEp = isEpisodic && ep && selectedSeason
      ? selectedSeason.episodes.find(e => e.number === ep.number + 1) ?? null
      : null;

    return (
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
          <div style={{ fontSize: "17px", fontWeight: 800, color, letterSpacing: "2px" }}>
            {isEpisodic && ep && selectedSeason ? `S${selectedSeason.seasonNumber}E${ep.number}: ${ep.title}` : sc?.title}
          </div>
          {isEpisodic && ep && selectedSeason && (
            <div style={{ fontSize: "11px", color: "#666", background: "#111", border: `1px solid ${color}33`, borderRadius: "4px", padding: "3px 8px" }}>{selectedSeason.title}</div>
          )}
          {!isEpisodic && sc && (
            <div style={{ fontSize: "11px", color: "#666", background: "#111", border: `1px solid ${color}33`, borderRadius: "4px", padding: "3px 8px" }}>{sc.episodeRef}</div>
          )}
        </div>

        <div style={{ background: "#0e0e18", border: `1px solid ${color}22`, borderRadius: "8px", padding: "32px", lineHeight: 1.85, fontSize: "15px", color: "#ddd", whiteSpace: "pre-wrap", fontFamily: "Georgia, serif" }}>
          {loading && chapters.length === 0 ? streamingText : displayedText}
          {loading && chapters.length > 0 && <span style={{ color: "#555" }}>{streamingText}</span>}
        </div>

        {isEpisodic && ep && ep.cliffhanger && !loading && chapters.length > 0 && (
          <div style={{ background: `linear-gradient(135deg, ${dark}44, #0a0a14)`, border: `1px solid ${color}33`, borderRadius: "8px", padding: "16px 20px", marginTop: "16px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "3px", color, marginBottom: "6px" }}>NEXT TIME ON…</div>
            <div style={{ fontSize: "13px", color: "#aaa", fontStyle: "italic" }}>{ep.cliffhanger}</div>
          </div>
        )}

        {error && <div style={{ color: "#f87171", background: "#1a0000", border: "1px solid #7f1d1d", borderRadius: "6px", padding: "12px", marginTop: "16px" }}>{error}</div>}

        <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap" }}>
          {!loading && (
            <button onClick={() => continueStory(isEpisodic)}
              style={{ background: `linear-gradient(135deg, ${dark}, ${color}33)`, border: `1px solid ${color}55`, color, borderRadius: "8px", padding: "12px 24px", cursor: "pointer", fontWeight: 700, letterSpacing: "1px", fontSize: "13px" }}>
              + NEXT CHAPTER
            </button>
          )}
          {!loading && nextEp && (
            <button onClick={() => { setSelectedEpisode(nextEp); setSeasonStep("configure"); resetStory(); setCustomVillain(""); }}
              style={{ background: `${color}22`, border: `1px solid ${color}55`, color, borderRadius: "8px", padding: "12px 24px", cursor: "pointer", fontWeight: 700, fontSize: "13px", letterSpacing: "1px" }}>
              ▶ NEXT EPISODE: E{nextEp.number}
            </button>
          )}
          {loading && (
            <button onClick={() => abortRef.current?.abort()}
              style={{ background: "#1a0000", border: "1px solid #7f1d1d", color: "#f87171", borderRadius: "8px", padding: "12px 24px", cursor: "pointer", fontWeight: 700 }}>
              STOP
            </button>
          )}
          <button onClick={() => { isEpisodic ? setSeasonStep("configure") : setStep("configure"); setChapters([]); }}
            style={{ background: "transparent", border: "1px solid #333", color: "#888", borderRadius: "8px", padding: "12px 20px", cursor: "pointer" }}>
            Change Setup
          </button>
          <button onClick={() => { isEpisodic ? setSeasonStep("episodes") : setStep("browse"); setSelectedScenario(null); resetStory(); }}
            style={{ background: "transparent", border: "1px solid #333", color: "#888", borderRadius: "8px", padding: "12px 20px", cursor: "pointer" }}>
            {isEpisodic ? "Back to Episodes" : "Pick New Scenario"}
          </button>
        </div>

        {chapters.length > 1 && (
          <div style={{ marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {chapters.map((_, i) => (
              <span key={i} style={{ fontSize: "11px", color: "#666", background: "#111", border: "1px solid #222", borderRadius: "4px", padding: "3px 8px" }}>Ch {i + 1}</span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── SEASONS BROWSE ────────────────────────────────────────────────────────
  function SeasonsBrowse() {
    return (
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "28px", flexWrap: "wrap" }}>
          {(["all", "arrow", "flash", "crossover"] as const).map(f => {
            const c = f === "flash" ? FLASH_COLOR : f === "arrow" ? ARROW_COLOR : f === "crossover" ? CROSS_COLOR : "#aaa";
            return (
              <button key={f} onClick={() => setSeasonShowFilter(f)}
                style={{ background: seasonShowFilter === f ? `${c}18` : "#0e0e18", border: `1px solid ${seasonShowFilter === f ? c : "#222"}`, color: seasonShowFilter === f ? c : "#555", borderRadius: "8px", padding: "9px 18px", cursor: "pointer", fontWeight: 700, letterSpacing: "2px", fontSize: "12px" }}>
                {f === "all" ? "ALL SEASONS" : f === "arrow" ? "🏹 ARROW" : f === "flash" ? "⚡ THE FLASH" : "🌌 CROSSOVER"}
                <span style={{ marginLeft: "8px", fontSize: "10px", opacity: 0.7 }}>
                  {f === "all" ? SEASONS.length : SEASONS.filter(s => s.show === f).length}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "14px" }}>
          {filteredSeasons.map(season => {
            const done = episodesCompleted(progress, season.id, season.episodes.length);
            const pct  = Math.round((done / season.episodes.length) * 100);
            return (
              <button key={season.id} onClick={() => selectSeason(season)}
                style={{ background: "linear-gradient(135deg, #0e0e18, #0a0a12)", border: `1px solid ${season.color}22`, borderRadius: "12px", padding: "20px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${season.color}55`; (e.currentTarget as HTMLElement).style.background = `linear-gradient(135deg, ${season.dark}33, #0a0a12)`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${season.color}22`; (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #0e0e18, #0a0a12)"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "20px" }}>{season.icon}</span>
                  <div style={{ background: `${season.color}18`, border: `1px solid ${season.color}33`, borderRadius: "4px", padding: "2px 10px", fontSize: "10px", color: season.color, letterSpacing: "2px", fontWeight: 700 }}>
                    {season.show === "flash" ? "THE FLASH" : season.show === "crossover" ? "CROSSOVER" : "ARROW"} S{season.seasonNumber}
                  </div>
                  {done > 0 && (
                    <div style={{ marginLeft: "auto", fontSize: "10px", color: season.color }}>{done}/{season.episodes.length} EP</div>
                  )}
                </div>
                <div style={{ fontSize: "16px", fontWeight: 900, color: season.color, letterSpacing: "2px", marginBottom: "6px" }}>{season.title}</div>
                <div style={{ fontSize: "12px", color: "#666", fontWeight: 700, marginBottom: "8px" }}>{season.villain}</div>
                <div style={{ fontSize: "11px", color: "#777", lineHeight: 1.6, marginBottom: "12px" }}>{season.logline}</div>
                <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                  {season.episodes.map(ep => (
                    <div key={ep.number} style={{ flex: 1, height: "3px", borderRadius: "2px", background: isEpisodeDone(progress, season.id, ep.number) ? season.color : "#222" }} />
                  ))}
                </div>
                <div style={{ fontSize: "10px", color: "#444" }}>{season.episodes.length} Episodes · {pct}% Complete</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── EPISODE LIST ──────────────────────────────────────────────────────────
  function EpisodeList() {
    if (!selectedSeason) return null;
    const color = selectedSeason.color;
    const dark  = selectedSeason.dark;
    return (
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "28px 24px" }}>
        <button onClick={() => setSeasonStep("seasons")}
          style={{ background: "none", border: "1px solid #333", color: "#777", borderRadius: "6px", padding: "6px 14px", cursor: "pointer", marginBottom: "20px", fontSize: "13px" }}>
          ← All Seasons
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <span style={{ fontSize: "22px" }}>{selectedSeason.icon}</span>
          <div style={{ fontSize: "20px", fontWeight: 900, color, letterSpacing: "2px" }}>{selectedSeason.title}</div>
        </div>
        <div style={{ fontSize: "12px", color: "#666", marginBottom: "6px" }}>{selectedSeason.villain}</div>
        <div style={{ fontSize: "12px", color: "#777", marginBottom: "24px", lineHeight: 1.6 }}>{selectedSeason.logline}</div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {selectedSeason.episodes.map(ep => {
            const done    = isEpisodeDone(progress, selectedSeason.id, ep.number);
            const unlocked = ep.number === 1 || isEpisodeDone(progress, selectedSeason.id, ep.number - 1);
            return (
              <button key={ep.number} onClick={() => selectEpisode(ep)} disabled={!unlocked}
                style={{ background: done ? `${color}12` : unlocked ? "linear-gradient(135deg, #0e0e18, #0a0a12)" : "#0a0a0f", border: `1px solid ${done ? color : unlocked ? `${color}33` : "#1a1a1a"}`, borderRadius: "10px", padding: "16px 18px", cursor: unlocked ? "pointer" : "not-allowed", textAlign: "left", opacity: unlocked ? 1 : 0.4, transition: "all 0.15s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: done ? color : `${color}22`, border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 900, color: done ? dark : color, flexShrink: 0 }}>
                    {done ? "✓" : ep.number}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: unlocked ? (done ? color : "#ddd") : "#444" }}>{ep.title}</div>
                      {done && <span style={{ fontSize: "10px", color, letterSpacing: "1px", background: `${color}18`, border: `1px solid ${color}33`, borderRadius: "3px", padding: "1px 6px" }}>PLAYED</span>}
                      {!unlocked && <span style={{ fontSize: "10px", color: "#444", letterSpacing: "1px" }}>🔒 LOCKED</span>}
                    </div>
                    <div style={{ fontSize: "11px", color: "#555", fontStyle: "italic" }}>"{ep.subtitle}"</div>
                    {unlocked && (
                      <div style={{ fontSize: "11px", color: "#666", marginTop: "4px", lineHeight: 1.5 }}>{ep.premise.slice(0, 120)}…</div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: "20px", display: "flex", gap: "3px" }}>
          {selectedSeason.episodes.map(ep => (
            <div key={ep.number} style={{ flex: 1, height: "4px", borderRadius: "2px", background: isEpisodeDone(progress, selectedSeason.id, ep.number) ? color : "#1a1a1a" }} />
          ))}
        </div>
        <div style={{ fontSize: "11px", color: "#444", marginTop: "6px" }}>
          {episodesCompleted(progress, selectedSeason.id, selectedSeason.episodes.length)}/{selectedSeason.episodes.length} episodes complete
        </div>
      </div>
    );
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────
  const isLoadingInitial = loading && chapters.length === 0;
  const loaderColor = mainView === "seasons" ? (selectedSeason?.color ?? ARROW_COLOR) : (selectedScenario?.show === "flash" ? FLASH_COLOR : ARROW_COLOR);
  const loaderLabel = mainView === "seasons" && selectedEpisode && selectedSeason
    ? `S${selectedSeason.seasonNumber}E${selectedEpisode.number}: ${selectedEpisode.title}`
    : selectedScenario?.title ?? "GENERATING";
  const loaderSub = mainView === "seasons" && selectedEpisode && selectedSeason
    ? `${selectedSeason.title} · ${selectedHeroine.name}`
    : `${selectedScenario?.episodeRef ?? ""} · ${selectedHeroine.name}`;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#f0f0f0", paddingBottom: "80px" }}>
      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg, #0d1f0d 0%, #0a0a0f 40%, #1a0d00 100%)", borderBottom: "1px solid #1a2a1a", padding: "24px 24px 0" }}>
        <button onClick={onBack} style={{ background: "none", border: "1px solid #333", color: "#999", borderRadius: "6px", padding: "6px 14px", cursor: "pointer", marginBottom: "16px", fontSize: "13px" }}>← Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "28px" }}>🏹</span>
            <div style={{ width: "2px", height: "32px", background: "linear-gradient(to bottom, #4ADE80, #FCD34D)" }} />
            <span style={{ fontSize: "28px" }}>⚡</span>
          </div>
          <div>
            <div style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "3px", background: "linear-gradient(90deg, #4ADE80, #FCD34D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ARROWVERSE</div>
            <div style={{ fontSize: "11px", letterSpacing: "4px", color: "#666", marginTop: "2px" }}>DARK EPISODE STORY ENGINE</div>
          </div>
        </div>

        {/* Main nav tabs */}
        <div style={{ display: "flex", gap: "0" }}>
          {(["scenarios", "seasons"] as const).map(v => (
            <button key={v} onClick={() => setMainView(v)}
              style={{ background: "none", border: "none", borderBottom: `2px solid ${mainView === v ? ARROW_COLOR : "transparent"}`, color: mainView === v ? ARROW_COLOR : "#555", padding: "10px 20px", cursor: "pointer", fontWeight: 700, letterSpacing: "2px", fontSize: "12px", transition: "all 0.15s" }}>
              {v === "scenarios" ? "STANDALONE SCENARIOS" : "📺 SEASON MODE"}
            </button>
          ))}
        </div>
      </div>

      {/* LOADING */}
      {isLoadingInitial && <AtmosphericLoader color={loaderColor} label={loaderLabel} subLabel={loaderSub} />}

      {/* ── STANDALONE SCENARIOS ── */}
      {mainView === "scenarios" && !isLoadingInitial && (
        <>
          {step === "browse" && (
            <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 24px" }}>
              <div style={{ display: "flex", gap: "8px", marginBottom: "28px", flexWrap: "wrap" }}>
                {(["all", "arrow", "flash"] as const).map(show => {
                  const c = show === "flash" ? FLASH_COLOR : show === "arrow" ? ARROW_COLOR : "#aaa";
                  return (
                    <button key={show} onClick={() => setActiveShow(show)}
                      style={{ background: activeShow === show ? `${c}18` : "#0e0e18", border: `1px solid ${activeShow === show ? c : "#222"}`, color: activeShow === show ? c : "#555", borderRadius: "8px", padding: "9px 18px", cursor: "pointer", fontWeight: 700, letterSpacing: "2px", fontSize: "12px" }}>
                      {show === "all" ? "ALL SHOWS" : show === "arrow" ? "🏹 ARROW" : "⚡ THE FLASH"}
                      <span style={{ marginLeft: "8px", fontSize: "10px", opacity: 0.7 }}>{show === "all" ? SCENARIOS.length : SCENARIOS.filter(s => s.show === show).length}</span>
                    </button>
                  );
                })}
              </div>
              {(["arrow", "flash"] as const).filter(show => activeShow === "all" || activeShow === show).map(show => {
                const showScenarios = filteredScenarios.filter(s => s.show === show);
                if (!showScenarios.length) return null;
                const color = show === "flash" ? FLASH_COLOR : ARROW_COLOR;
                const dark  = show === "flash" ? FLASH_DARK  : ARROW_DARK;
                return (
                  <div key={show} style={{ marginBottom: "40px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                      <span style={{ fontSize: "20px" }}>{show === "flash" ? "⚡" : "🏹"}</span>
                      <div style={{ fontSize: "14px", fontWeight: 900, letterSpacing: "4px", color }}>{show === "flash" ? "THE FLASH" : "ARROW"}</div>
                      <div style={{ flex: 1, height: "1px", background: `linear-gradient(to right, ${color}44, transparent)` }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "12px" }}>
                      {showScenarios.map(s => (
                        <button key={s.id} onClick={() => selectScenario(s)}
                          style={{ background: "linear-gradient(135deg, #0e0e18, #0a0a12)", border: `1px solid ${color}22`, borderRadius: "12px", padding: "18px", cursor: "pointer", textAlign: "left", transition: "all 0.2s", display: "flex", flexDirection: "column", gap: "8px" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${color}66`; (e.currentTarget as HTMLElement).style.background = `linear-gradient(135deg, ${dark}33, #0a0a12)`; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${color}22`; (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #0e0e18, #0a0a12)"; }}>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <div style={{ background: `${color}18`, border: `1px solid ${color}33`, borderRadius: "4px", padding: "2px 8px", fontSize: "10px", color, letterSpacing: "1px", fontWeight: 700 }}>S{s.season}</div>
                            <div style={{ fontSize: "10px", color: "#444", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{s.episodeRef.split("—")[1]?.trim() ?? s.episodeRef}</div>
                          </div>
                          <div style={{ fontSize: "15px", fontWeight: 900, color, letterSpacing: "1.5px" }}>{s.title}</div>
                          <div style={{ fontSize: "11px", color: "#777", fontStyle: "italic", lineHeight: 1.5 }}>"{s.tagline}"</div>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "10px", color: "#444", background: "#111", border: "1px solid #1a1a1a", borderRadius: "3px", padding: "2px 6px" }}>{s.villain.split("(")[0].trim()}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {step === "configure" && selectedScenario && <ConfigurePanel isEpisodic={false} />}
          {step === "story" && <StoryView isEpisodic={false} />}
        </>
      )}

      {/* ── SEASON MODE ── */}
      {mainView === "seasons" && !isLoadingInitial && (
        <>
          {seasonStep === "seasons" && <SeasonsBrowse />}
          {seasonStep === "episodes" && <EpisodeList />}
          {seasonStep === "configure" && selectedEpisode && <ConfigurePanel isEpisodic={true} />}
          {seasonStep === "story" && <StoryView isEpisodic={true} />}
        </>
      )}
    </div>
  );
}
