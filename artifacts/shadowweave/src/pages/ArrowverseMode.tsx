import { useState, useRef, useEffect } from "react";
import AtmosphericLoader from "../components/AtmosphericLoader";
import { saveStoryToArchive, updateArchiveStory } from "../lib/archive";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ── COLOURS ──────────────────────────────────────────────────────────────────
const ARROW_COLOR  = "#4ADE80";
const FLASH_COLOR  = "#FCD34D";
const ARROW_DARK   = "#166534";
const FLASH_DARK   = "#92400E";

// ── HEROINES (CW Only) ───────────────────────────────────────────────────────
const CW_HEROINES = [
  // Arrow
  { name: "Sara Lance",       alias: "White Canary",       show: "arrow",  icon: "🕊",  power: "League of Assassins master fighter & temporal agent" },
  { name: "Laurel Lance",     alias: "Black Canary",       show: "arrow",  icon: "🎵",  power: "Canary Cry sonic device & expert martial artist" },
  { name: "Thea Queen",       alias: "Speedy / Red Arrow", show: "arrow",  icon: "🏹",  power: "Olympic archer & League-trained fighter, Lazarus Pit-enhanced" },
  { name: "Nyssa al Ghul",    alias: "Heir to the Demon",  show: "arrow",  icon: "🗡",  power: "League of Assassins grandmaster — deadliest woman alive" },
  { name: "Dinah Drake",      alias: "Black Canary III",   show: "arrow",  icon: "🎤",  power: "Metahuman Canary Cry & expert street fighter" },
  { name: "Emiko Queen",      alias: "Green Arrow II",     show: "arrow",  icon: "🟢",  power: "Master archer & trained assassin — Oliver's sister" },
  { name: "Felicity Smoak",   alias: "Overwatch",          show: "arrow",  icon: "💻",  power: "World-class hacker & tactical support, Palmer Tech CEO" },
  // The Flash
  { name: "Iris West-Allen",  alias: "The Flash's Heart",  show: "flash",  icon: "⚡",  power: "Speed Force conduit — the lightning rod that calls Barry home" },
  { name: "Caitlin Snow",     alias: "Killer Frost",       show: "flash",  icon: "❄",   power: "Cryokinesis & frost generation — divided between two identities" },
  { name: "Jesse Quick",      alias: "Speed Force Hero",   show: "flash",  icon: "💛",  power: "Speedster from Earth-2 & genius-level intellect" },
  { name: "Nora West-Allen",  alias: "XS",                 show: "flash",  icon: "⚡",  power: "Speedster from the future — Barry and Iris's daughter" },
  { name: "Cecile Horton",    alias: "District Attorney",  show: "flash",  icon: "⚖",   power: "Metahuman empath — reads emotions and projects fear" },
  // Shared
  { name: "Alex Danvers",     alias: "DEO Director",       show: "both",   icon: "🛡",  power: "ARGUS / DEO tactical director — no powers, no mercy" },
];

// ── SCENARIOS ─────────────────────────────────────────────────────────────────
interface Scenario {
  id: string;
  show: "arrow" | "flash";
  season: number;
  episodeRef: string;
  title: string;
  tagline: string;
  villain: string;
  villainDetail: string;
  setting: string;
  tone: string;
  captureMethod: string;
  restraints: string;
  stakes: string;
  details: string;
  storyContext: string;
}

const SCENARIOS: Scenario[] = [
  // ── ARROW ──────────────────────────────────────────────────────────────────
  {
    id: "arrow-s1-undertaking",
    show: "arrow", season: 1,
    episodeRef: "S1E22 — 'Darkness on the Edge of Town'",
    title: "THE UNDERTAKING",
    tagline: "Malcolm Merlyn's plan to level the Glades. She knows too much.",
    villain: "Malcolm Merlyn (Dark Archer)",
    villainDetail: "Malcolm Merlyn — architect of the Undertaking, Dark Archer, League of Assassins veteran. Cold, patrician, absolute. He doesn't torture for pleasure — he removes problems with surgical precision.",
    setting: "Merlyn Global Group sublevel — a private corporate vault below Star City",
    tone: "Psychological, cold, clinical — Malcolm is never angry, only efficient",
    captureMethod: "Planned interception — she walked into his building thinking she had leverage. She had none.",
    restraints: "Custom restraint chair with biometric locks — built into the building before she ever arrived",
    stakes: "The Undertaking goes forward at midnight. If she speaks, 503 city blocks are destroyed. If she stays silent, she watches it happen from his office.",
    details: "Malcolm has known about her for weeks. He intercepted her comms, studied her routines, and left a trail she thought she was following. This is the trap closing.",
    storyContext: "Based on Arrow Season 1's darkest arc — the Glades Undertaking, Malcolm Merlyn's systematic destruction of Star City's poorest district as revenge for his wife's murder. The heroine has uncovered the plan but walked straight into Malcolm's prepared response.",
  },
  {
    id: "arrow-s2-mirakuru",
    show: "arrow", season: 2,
    episodeRef: "S2E20 — 'Seeing Red'",
    title: "MIRAKURU",
    tagline: "Slade Wilson's army is in the streets. One of them has her.",
    villain: "Slade Wilson (Deathstroke)",
    villainDetail: "Slade Wilson — former ASIS soldier, mirakuru-enhanced, consumed by the hallucination of Shado demanding Oliver's pain. Physically superhuman, tactically brilliant, grief-driven into absolute certainty that what he's doing is justice.",
    setting: "Starling City streets turned warzone — a seized industrial warehouse acting as Slade's forward command",
    tone: "Raw, physical, brutal — mirakuru makes everything harder, faster, more final",
    captureMethod: "Overwhelming force — three Mirakuru soldiers took her before she could call for backup. She's not hurt. Yet. Slade wants her conscious.",
    restraints: "Industrial chain restraints — heavy enough that her fighting doesn't help",
    stakes: "Slade has promised Oliver suffering. She is the suffering.",
    details: "Slade chose her specifically. She's connected to Oliver in a way that maximises the wound. He's patient. He's been planning this for months. The mirakuru has made him stronger but it has also made him terrible.",
    storyContext: "Based on Arrow Season 2's devastating Deathstroke arc — Slade Wilson on Mirakuru, an army of super-soldiers taking Starling City, and his methodical campaign of psychological warfare against Oliver Queen through the people he loves.",
  },
  {
    id: "arrow-s3-the-climb",
    show: "arrow", season: 3,
    episodeRef: "S3E9 — 'The Climb' / S3 League Arc",
    title: "NANDA PARBAT",
    tagline: "Ra's al Ghul has judged her worthy. The League has come for her.",
    villain: "Ra's al Ghul",
    villainDetail: "Ra's al Ghul — the Demon's Head, 200-year-old grandmaster of the League of Assassins. Patient as stone. He doesn't want to break her. He wants to discover whether she has what the League requires — and the discovering is its own ordeal.",
    setting: "Nanda Parbat — the League's fortress city carved into a Himalayan mountain. Ancient stone, firelight, the sound of wind through corridors that have held prisoners for centuries.",
    tone: "Ritualistic, ancient, patient — no urgency, no rage, just ceremony and inevitability",
    captureMethod: "League extraction — six assassins and she never saw them. By the time she understood what was happening, she was already in the air.",
    restraints: "Nanda Parbat stone cell with hand-forged iron shackles — the same cell that has held dozens of candidates before her",
    stakes: "The League's judgment is absolute. There is no appeal. There is no rescue. Oliver is dead on a cliff.",
    details: "Ra's believes she has potential for the League. This is not punishment — it is assessment. The distinction matters because assessment is slower and far more thorough.",
    storyContext: "Based on Arrow Season 3's League of Assassins arc — Oliver duels Ra's al Ghul and is left for dead on a Swiss mountain. With Team Arrow broken and Oliver gone, the League turns its attention to those he left behind.",
  },
  {
    id: "arrow-s3-al-sahim",
    show: "arrow", season: 3,
    episodeRef: "S3E21 — 'Al Sah-him'",
    title: "AL SAH-HIM",
    tagline: "Oliver Queen is dead. Al Sah-him has come to prove his loyalty.",
    villain: "Al Sah-him (Oliver Queen / Green Arrow)",
    villainDetail: "Al Sah-him — Oliver Queen after weeks of psychological reconditioning by Ra's al Ghul. He fights with Oliver's precision but without Oliver's mercy. His conditioning requires him to capture and deliver someone from his former life as proof of his completed transformation.",
    setting: "Star City — her own city, her own streets, but they've become hostile territory since the League arrived",
    tone: "Heartbreaking and clinical — he's thorough, mechanical, and the face she knows shows nothing she recognises",
    captureMethod: "Targeted mission — Al Sah-him was sent specifically for her. He knows every move she'll make because he was the one who trained her.",
    restraints: "League-standard restraint system — lightweight, silent, unescapable",
    stakes: "If he delivers her, he completes his transformation into the League's heir. If he hesitates, Ra's destroys Star City.",
    details: "He doesn't explain. He doesn't argue. He doesn't look at her the way Oliver used to. That might be the worst part.",
    storyContext: "Based on Arrow Season 3's most harrowing arc — Oliver Queen becomes Al Sah-him, heir to the Demon, his identity systematically erased through isolation, conditioning, and repeated identity suppression by the League of Assassins.",
  },
  {
    id: "arrow-s4-darhk",
    show: "arrow", season: 4,
    episodeRef: "S4E18 — 'Eleven-Fifty-Nine'",
    title: "GENESIS",
    tagline: "Damien Darhk's magic holds her. The countdown to Genesis has begun.",
    villain: "Damien Darhk",
    villainDetail: "Damien Darhk — former League assassin who found something older and darker than Ra's al Ghul's code. He draws life force from death, commands an army called HIVE, and has an almost cheerful sadism about the fact that the world is ending and he has a bunker.",
    setting: "HIVE underground facility — Genesis bunker, part military installation, part ark. Hermetically sealed from the surface world it plans to destroy.",
    tone: "Dark magic, claustrophobic, the horror of being held by something supernatural",
    captureMethod: "Magic restraint — Darhk's hand closed around her heart from across the room. She couldn't breathe. She couldn't fight. She could only stop.",
    restraints: "Darhk's totem suppression — she's unbound but cannot move; the magic sits in her chest like a held breath",
    stakes: "Laurel Lance is already dead. The Genesis countdown is running. What happens to the heroine is, in Darhk's words, 'entirely a question of how entertaining she makes the remaining hours.'",
    details: "Darhk is unusual among villains in that he is genuinely cheerful about the apocalypse. He has a bunker, a wife, and a daughter. The end of the world is his plan, not his fear.",
    storyContext: "Based on Arrow Season 4's darkest moment — Damien Darhk kills Laurel Lance (Black Canary) in front of Team Arrow, and his HIVE organisation prepares to launch nuclear missiles as part of 'Genesis', a plan to destroy the surface world and rebuild it from a protected underground ark.",
  },
  {
    id: "arrow-s5-prometheus",
    show: "arrow", season: 5,
    episodeRef: "S5E17 — 'Kapiushon'",
    title: "THE PROMETHEUS CHAMBER",
    tagline: "Adrian Chase has built this room for exactly one purpose: the truth.",
    villain: "Adrian Chase (Prometheus)",
    villainDetail: "Adrian Chase — Star City's District Attorney, secretly Prometheus, and the most psychologically sophisticated villain Oliver has ever faced. He doesn't want her body. He wants what she knows about herself. He wants her to say the thing she has never said out loud.",
    setting: "Chase's private facility — soundproofed, purpose-built, containing everything he needs and nothing she can use",
    tone: "Psychological torture, confession, the horror of being truly known by the wrong person",
    captureMethod: "Meticulous setup — Chase spent weeks arranging this. She thought she was following a lead. She was following a script he wrote.",
    restraints: "Precision restraints — designed to be uncomfortable but not injurious. Chase needs her alert, lucid, and present for what comes next.",
    stakes: "Chase will not kill her. He will keep her until she tells him something true about herself that she has never admitted. And he has endless patience.",
    details: "Chase tortured Oliver for days in this same room until Oliver admitted why he actually killed. He applies the same methodology to her. He's learned from every previous session. He knows which approaches work on which psychology. He has already profiled her completely.",
    storyContext: "Based on Arrow Season 5's single darkest episode — 'Kapiushon', where Adrian Chase/Prometheus captures Oliver Queen and subjects him to days of psychological and physical torture until Oliver admits the dark truth about himself. Stephen Amell called it his finest work on the show.",
  },
  {
    id: "arrow-s5-lianyu",
    show: "arrow", season: 5,
    episodeRef: "S5E23 — 'Lian Yu'",
    title: "LIAN YU",
    tagline: "The island. No signal. No rescue. The villain arrived before she did.",
    villain: "Adrian Chase (Prometheus)",
    villainDetail: "Adrian Chase on Lian Yu — the island where Oliver Queen was made. Chase has seeded the island with traps, landmines, and allies. He knows the geography better than she does. He has prepared for this.",
    setting: "Lian Yu — a remote island in the North China Sea. Dense jungle, abandoned WWII structures, an ARGUS prison, and five years of Oliver Queen's darkest memories buried in the soil.",
    tone: "Isolation, survival, the terror of being hunted on terrain the villain owns",
    captureMethod: "She came to rescue someone. The rescue was the bait. By the time she understood, the island had already closed around her.",
    restraints: "Environmental — the island itself is the prison. Chain if she's been caught. The jungle if she's still loose.",
    stakes: "Chase has wired the island with dead man's switch explosives. There is no winning. There is only surviving long enough for the choice to be made.",
    details: "Lian Yu means 'purgatory' in Mandarin. That's not an accident. Chase chose this location because every step Oliver took to become what he is, she might take to become something else.",
    storyContext: "Based on Arrow Season 5's finale — Chase brings everyone Oliver loves to Lian Yu, the island where Oliver was stranded for five years, and rigs the entire island with explosives connected to a dead man's switch keyed to his heartbeat.",
  },
  {
    id: "arrow-s6-dragon",
    show: "arrow", season: 6,
    episodeRef: "S6 — Ricardo Diaz Arc",
    title: "THE DRAGON",
    tagline: "Ricardo Diaz owns this city now. And everything in it.",
    villain: "Ricardo Diaz (The Dragon)",
    villainDetail: "Ricardo Diaz — not a metahuman, not a mystic. A man who built a criminal empire through patient violence, strategic corruption, and an absolute refusal to lose. He has bought every judge, every cop, and the mayor. The city belongs to him.",
    setting: "Diaz's controlled territory — could be his penthouse, a SCPD holding cell, or a location so thoroughly owned by his network that crying for help would be answered by his people",
    tone: "Methodical, criminal, no supernatural escape routes — just a man who has thought of everything",
    captureMethod: "She was arrested by police who work for him. She didn't resist. There was nothing to resist.",
    restraints: "Standard law enforcement restraints — but every person in this building answers to Diaz",
    stakes: "Diaz controls the city's infrastructure. Her identity, her team's identities, their families — he has files on everything. This is a negotiation, but she's not the one negotiating.",
    details: "Diaz is dangerous in a way that is hard to explain. He doesn't have a villain's monologue. He has leverage. He has research. He has patience. He explains what he wants exactly once.",
    storyContext: "Based on Arrow Season 6's Ricardo Diaz arc — a non-metahuman criminal who systematically buys and corrupts Star City's institutions, ultimately owning the mayor, police department, and judiciary while Team Arrow fractures around him.",
  },
  {
    id: "arrow-s7-slabside",
    show: "arrow", season: 7,
    episodeRef: "S7E7 — 'The Slabside Redemption'",
    title: "SLABSIDE",
    tagline: "Iron Heights Maximum Security. He knows exactly who she is.",
    villain: "Brick (Daniel Brickwell)",
    villainDetail: "Brick — Iron Heights' unofficial power, a metahuman with near-impenetrable skin who runs the prison's criminal ecosystem. He knows Team Arrow's faces. He's been patient.",
    setting: "Iron Heights Penitentiary — Star City's maximum security prison, which Oliver Queen filled with the city's worst criminals. All of whom know who she is.",
    tone: "Brutal, institutional, the horror of being held somewhere built to hold people exactly like her",
    captureMethod: "Processing — she came in one way. She's not leaving that way.",
    restraints: "Iron Heights standard — power-suppression collar (if metahuman), otherwise standard institutional restraints",
    stakes: "Oliver Queen filled this prison. Every person inside it has a reason to want the people close to him. She is inside it now.",
    details: "Slabside is not like a villain's lair. There are guards — some of them Diaz's. There are prisoners — many of them Team Arrow's work. The institution itself is the threat.",
    storyContext: "Based on Arrow Season 7's Slabside arc — Oliver Queen in Iron Heights Maximum Security, surrounded by every criminal he put away, leading to the show's most brutal fight sequence: 'The Slabside Redemption', forty minutes of unbroken prison combat.",
  },

  // ── THE FLASH ──────────────────────────────────────────────────────────────
  {
    id: "flash-s1-reverse-flash",
    show: "flash", season: 1,
    episodeRef: "S1E9 — 'The Man in the Yellow Suit'",
    title: "THE MAN IN THE YELLOW SUIT",
    tagline: "Eobard Thawne has been planning this for fifteen years.",
    villain: "Eobard Thawne (Reverse-Flash / Harrison Wells)",
    villainDetail: "Eobard Thawne — a man from the 25th century who came back in time to destroy Barry Allen's life and has been living inside it as Harrison Wells for fifteen years. He knows every person Barry loves. He knows their weaknesses. He engineered this moment.",
    setting: "STAR Labs — the building she trusted, built by a man whose face is not his own",
    tone: "Psychological horror, the terror of a threat that has known you for years",
    captureMethod: "Speed — she didn't see it coming. Speed is an answer to everything except more speed.",
    restraints: "Speed force containment — Thawne designed something specifically for this",
    stakes: "Thawne has what he needs from Barry. What he does with her depends on how useful she remains. And Thawne is very good at making use of people.",
    details: "Everything about the life she trusted has been engineered by this man. The building. The people. The accidents. The friendships. All of it calculated toward this night.",
    storyContext: "Based on The Flash Season 1's most chilling episode — Eobard Thawne is revealed to be Harrison Wells, having lived an entire stolen life inside STAR Labs, Barry's family, and his city for fifteen years, all while planning the endgame of his obsession with destroying Barry Allen.",
  },
  {
    id: "flash-s1-out-of-time",
    show: "flash", season: 1,
    episodeRef: "S1E15 — 'Out of Time'",
    title: "OUT OF TIME",
    tagline: "The timeline resets. But in this version — she was there when Wells showed his face.",
    villain: "Eobard Thawne (Harrison Wells)",
    villainDetail: "Thawne with the mask off — Wells, but not Wells. Moving at speed, killing without hesitation, explaining to Cisco exactly why he has to die. She was there. He didn't expect that. He doesn't like unexpected variables.",
    setting: "STAR Labs underbelly — the secret rooms beneath the public facade",
    tone: "Revelation horror — the person you trusted was never real",
    captureMethod: "She saw something she wasn't supposed to see. In the original timeline, it gets erased. In this one, it doesn't.",
    restraints: "Speed-vibration lock — Thawne's hand passes through solid objects; conventional escape routes don't apply",
    stakes: "A different timeline. The reset isn't coming. What happens in this room stays in this room.",
    details: "Cisco died in this timeline. She was the variable Thawne didn't account for — and he has spent fifteen years accounting for every variable.",
    storyContext: "Based on The Flash Season 1's 'Out of Time' — the episode that first revealed Thawne's identity, showing him kill Cisco before Barry accidentally resets the timeline. The darkest implication of the episode: in the original version of events, what did Thawne do with the hour before Barry arrived?",
  },
  {
    id: "flash-s2-enter-zoom",
    show: "flash", season: 2,
    episodeRef: "S2E6 — 'Enter Zoom'",
    title: "ENTER ZOOM",
    tagline: "Zoom is faster. Zoom is stronger. Zoom made that very clear.",
    villain: "Zoom (Hunter Zolomon)",
    villainDetail: "Zoom — the Earth-2 speedster who paralyses Barry in front of the entire city to prove a point. Not interested in victory. Interested in breaking people in front of witnesses. He has no code, no rules, no mercy — only speed and the absolute need to establish that he is the fastest thing alive.",
    setting: "Central City streets, then wherever Zoom chooses to take her — he doesn't need a facility. He is the facility.",
    tone: "Terror — pure, physical, absolute. Zoom moves at speeds that make resistance a concept, not a reality.",
    captureMethod: "He was standing there when she turned around. He has been here for a while.",
    restraints: "Speed-dampening cuffs from Earth-2 — or just Zoom's hand. That's usually enough.",
    stakes: "Barry is in a wheelchair. The team is broken. Zoom has nothing to fear from anyone in this city. He's doing this because he wants to.",
    details: "Zoom's most chilling quality: he doesn't seem angry. He seems satisfied. The paralysing of Barry Allen was a demonstration, not a triumph. This is recreation.",
    storyContext: "Based on The Flash Season 2's most defining episode — Zoom crosses from Earth-2, defeats Barry in battle, and carries his paralysed body through the streets of Central City to display him publicly, establishing Zoom as the most terrifying villain the show had produced.",
  },
  {
    id: "flash-s2-race-of-his-life",
    show: "flash", season: 2,
    episodeRef: "S2E23 — 'The Race of His Life'",
    title: "THE RACE OF HIS LIFE",
    tagline: "Zoom murdered Henry Allen. Barry is running on grief. She's the leverage.",
    villain: "Zoom (Hunter Zolomon)",
    villainDetail: "Zoom in his final, most dangerous form — having murdered Barry's father in front of him, he now proposes a race to destroy the multiverse. He holds hostages to guarantee Barry's participation. She is one of them.",
    setting: "Zoom's fortified position — Joe West is also held here. Both are collateral in a speedster's power game.",
    tone: "Grief-soaked, multiverse stakes, the horror of being a pawn in something that has already cost too much",
    captureMethod: "Taken as leverage — to ensure Barry runs the race. Zoom needs compliance, not sport.",
    restraints: "Speed-lock restraints — and the knowledge that Zoom just killed someone Barry loved with his bare hands in front of him",
    stakes: "Zoom's race will destroy every parallel earth. If Barry doesn't run, she doesn't survive. If Barry runs and loses, everything dies.",
    details: "Zoom is wearing Jay Garrick's face. He has taken everything from Barry that Barry let himself need. She is what's left. And he holds her like a card to be played.",
    storyContext: "Based on The Flash Season 2 finale — immediately after Zoom murders Henry Allen in front of Barry, he proposes a race that will destroy the multiverse, holding Joe West and others hostage to ensure participation. The cruelest villain motivation in the show's run.",
  },
  {
    id: "flash-s3-infantino-street",
    show: "flash", season: 3,
    episodeRef: "S3E22 — 'Infantino Street' / S3E23 — 'Finish Line'",
    title: "INFANTINO STREET",
    tagline: "Savitar has always known this night was coming. He's had years to prepare.",
    villain: "Savitar (Future Barry Allen)",
    villainDetail: "Savitar — a time remnant of Barry Allen, abandoned and broken, who became the God of Speed inside the Speed Force and spent years planning this exact night. He knows everything that will happen because he has already lived it. Every rescue attempt, every contingency — he's seen them all.",
    setting: "The night everything changes — Infantino Street, the kill site Savitar has kept fixed in the timeline",
    tone: "The horror of inevitability — everyone knows what's coming and cannot stop it",
    captureMethod: "The night is the trap. Every action she takes to prevent this has already been accounted for.",
    restraints: "Speed-force control — Savitar moves so fast that conventional physics become irrelevant in his presence",
    stakes: "Team Flash has been building toward this night all season. They fail. This is the night they fail.",
    details: "Savitar calls himself a god. He might be. He has lived inside a time loop of this night so many times that his planning has surpassed anything Barry's team can counter. The scariest thing about him: he's still Barry Allen underneath it. He knows exactly how they think.",
    storyContext: "Based on The Flash Season 3's darkest episode — 'Infantino Street', ranked by many as the show's single most harrowing episode. The entire season built toward this night: Savitar killing Iris West-Allen. Every plan Team Flash conceived was one Savitar had already seen and countered.",
  },
  {
    id: "flash-s3-killer-frost",
    show: "flash", season: 3,
    episodeRef: "S3E7 — 'Killer Frost' / S3 Caitlin Arc",
    title: "WRATH OF SAVITAR",
    tagline: "Caitlin's powers are emerging. Killer Frost is waking up. One of them has her.",
    villain: "Killer Frost / Savitar (collaborative threat)",
    villainDetail: "Killer Frost — Caitlin Snow's dark metahuman identity, cold and precise and contemptuous of everything Caitlin cares about. Savitar has called to Frost because Frost will do what Caitlin would never do. She answers to the God of Speed.",
    setting: "STAR Labs compromised — Killer Frost has turned against the team and is using everything she knows about their facility and their weaknesses",
    tone: "Betrayal horror — she knows all your vulnerabilities because she was your friend",
    captureMethod: "Frost built the trap from the inside. She knows every system, every escape route, every person's weakness.",
    restraints: "Ice restraints — Frost's control is absolute and the cold makes everything slower",
    stakes: "Savitar is coming. Frost is his advance force. Whatever happens here happens before the God of Speed arrives.",
    details: "Killer Frost is not Caitlin. She has all of Caitlin's memories and none of Caitlin's warmth. She refers to Caitlin in the third person and finds the sentiment distasteful.",
    storyContext: "Based on The Flash Season 3's most psychologically complex arc — Caitlin Snow's metahuman powers manifesting as Killer Frost, an alter-ego with contempt for human connection who is drawn to Savitar's vision of an ice-cold world.",
  },
  {
    id: "flash-s4-thinker",
    show: "flash", season: 4,
    episodeRef: "S4E9 — 'Don't Run' / S4E10 — 'The Trial of The Flash'",
    title: "THE THINKER",
    tagline: "DeVoe has planned 4,527 possible outcomes. This is one of them.",
    villain: "Clifford DeVoe (The Thinker)",
    villainDetail: "Clifford DeVoe — a man whose intelligence has been artificially elevated past the limits of human cognition by the Thinking Cap. He has mapped every possible response to every possible action. He thinks at a speed that makes speedsters look slow. He's been planning the Enlightenment for years.",
    setting: "DeVoe's constructed scenario — he chose the location, the timing, and the variables. She is a variable he chose deliberately.",
    tone: "Intellectual horror — a villain who is genuinely smarter than the heroes and has already won",
    captureMethod: "Amunet Black was hired to handle the physical side. DeVoe handled the planning. Neither of them is improvising.",
    restraints: "Amunet's metallic shards — the same tech she used on Caitlin. Or DeVoe's mental control fields.",
    stakes: "DeVoe's Enlightenment will lobotomise the entire human population. Barry is being framed for murder. No one is coming for her.",
    stakes2: "",
    details: "DeVoe doesn't gloat because gloating wastes processing power. He simply informs her of the outcome he has selected for her, the reasons he selected it, and the timeline. Then he proceeds exactly as stated.",
    storyContext: "Based on The Flash Season 4's split-capture episode — 'Don't Run', where Barry is taken by DeVoe and Caitlin by Amunet simultaneously, and Team Flash cannot save both. DeVoe then frames Barry for murder, sending the Flash to Iron Heights.",
  },
  {
    id: "flash-s5-cicada",
    show: "flash", season: 5,
    episodeRef: "S5E11 — 'Seeing Red'",
    title: "CICADA'S DAGGER",
    tagline: "One wound from the dagger and every metahuman power switches off. She just found that out.",
    villain: "Cicada (Orlin Dwyer)",
    villainDetail: "Cicada — a metahuman serial killer who hunts other metahumans. His dagger negates their powers on contact. He's not politically motivated. He's not building an empire. He lost his niece to a metahuman attack and he's eliminating the threat, one at a time, methodically.",
    setting: "Wherever Cicada hunts — dark streets, industrial areas, places where there are no witnesses",
    tone: "Stalker horror — a killer who targets the exact population she belongs to",
    captureMethod: "One throw. The dagger hit her before she knew he was there. She felt her powers go. That was when she understood.",
    restraints: "The dagger's field — as long as it's near her, her powers are simply absent. No collar. No tech. Just a wound and silence where her abilities used to be.",
    stakes: "Cicada has killed fourteen metahumans. She is number fifteen on the list.",
    details: "Cicada is grieving and he has weaponised his grief. He's not a spectacle. He doesn't want witnesses. He is very, very thorough.",
    storyContext: "Based on The Flash Season 5's most brutal moment — Cicada uses his power-negating dagger to break Nora West-Allen's back, her speedster healing suppressed by the dagger's field, leaving a future Flash temporarily paralysed and the team shattered.",
  },
  {
    id: "flash-s6-speed-force",
    show: "flash", season: 6,
    episodeRef: "S6 — Death of the Speed Force Arc",
    title: "DEATH OF THE SPEED FORCE",
    tagline: "The Speed Force is dying. Her powers are dying with it. He planned for exactly this.",
    villain: "Bloodwork (Ramsey Rosso)",
    villainDetail: "Ramsey Rosso — a former physician who infected himself with dark matter and can now reanimate the dead, control organic matter, and spread a living darkness that converts living beings into extensions of his will. He's been waiting for the Speed Force to weaken.",
    setting: "Crisis-era Central City — the anti-matter wave is approaching, the Speed Force is collapsing, and every speedster on Earth is losing power",
    tone: "Apocalyptic, body horror, the terror of losing the power that defined you",
    captureMethod: "She couldn't run. That's the point. She's never had to fight without her speed before. She didn't know how.",
    restraints: "Bloodwork's living darkness — organic, responsive, and utterly alien",
    stakes: "Crisis on Infinite Earths is happening above them. The Speed Force is dead. No cavalry is coming because the cavalry is occupied with the literal end of the multiverse.",
    details: "Bloodwork is dying of a degenerative illness and wants immortality. The living darkness is his solution. He finds a speedster without speed to be a fascinating case study.",
    storyContext: "Based on The Flash Season 6's pre-Crisis arc — the Speed Force begins dying due to Nora West-Allen's destruction of the Reverse-Flash dagger, leaving Barry's powers fluctuating. Bloodwork's infection spreads through Central City as Crisis on Infinite Earths approaches.",
  },
];

// ── HELPERS ──────────────────────────────────────────────────────────────────
function streamRequest(endpoint: string, body: object, onChunk: (c: string) => void, signal?: AbortSignal): Promise<string> {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return fetch(`${base}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  }).then(async (res) => {
    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "", full = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop()!;
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

// ── COMPONENT ─────────────────────────────────────────────────────────────────
interface Props { onBack: () => void; }

export default function ArrowverseMode({ onBack }: Props) {
  const [activeShow, setActiveShow] = useState<"all" | "arrow" | "flash">("all");
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [selectedHeroine, setSelectedHeroine] = useState(CW_HEROINES[0]);
  const [customVillain, setCustomVillain] = useState("");
  const [intensity, setIntensity] = useState<1 | 2 | 3>(2);

  const [step, setStep] = useState<"browse" | "configure" | "story">("browse");
  const [chapters, setChapters] = useState<string[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

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

  function selectScenario(s: Scenario) {
    setSelectedScenario(s);
    setStep("configure");
    setChapters([]);
    setError("");
    setSavedId(null);
  }

  async function generate() {
    if (!selectedScenario) return;
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setChapters([]);
    setStreamingText("");
    setError("");

    const villain = customVillain.trim() || selectedScenario.villain;
    const intensityLabel = intensity === 1 ? "Tense — psychological pressure, power exchange, minimal graphic content"
      : intensity === 3 ? "Brutal — absolute maximum depravity, no limits, extreme explicit detail, full degradation"
      : "Explicit — graphic sexual content and domination, full explicit detail";

    const episodeContext = `ARROWVERSE EPISODE CONTEXT: ${selectedScenario.storyContext}`;

    let accumulated = "";
    try {
      const full = await streamRequest("/api/story/superhero", {
        hero: `${selectedHeroine.name} (${selectedHeroine.alias}) — Power: ${selectedHeroine.power} — Universe: CW Arrowverse`,
        villain: `${villain} — ${selectedScenario.villainDetail}`,
        setting: `${selectedScenario.setting}`,
        stakes: selectedScenario.stakes,
        tone: selectedScenario.tone,
        captureMethod: selectedScenario.captureMethod,
        restraints: selectedScenario.restraints,
        intensity: intensityLabel,
        storyLength: "Epic Saga",
        details: `${episodeContext}\n\nSCENARIO: ${selectedScenario.title} (${selectedScenario.episodeRef})\n\nKEY DETAILS: ${selectedScenario.details}\n\nWrite this with the authentic tone of the CW Arrowverse — dark, character-driven, and grounded in the show's specific mythology, locations, villain psychology, and the heroine's established relationships with the world around her. Reference specific Arrowverse locations, organisations, and lore wherever possible.`,
      }, (c) => { accumulated += c; setStreamingText(accumulated); }, ctrl.signal);

      setChapters([full]);
      setStep("story");

      const id = saveStoryToArchive({
        title: `${selectedScenario.title} — ${selectedHeroine.name}`,
        hero: selectedHeroine.name,
        villain,
        mode: `Arrowverse Mode — ${selectedScenario.episodeRef}`,
        chapters: [full],
        wordCount: full.split(/\s+/).filter(Boolean).length,
      });
      setSavedId(id);
    } catch (e) {
      if (isAbort(e)) {
        if (accumulated.trim()) { setChapters([accumulated]); setStep("story"); }
      } else {
        setError(e instanceof Error ? e.message : "Generation failed");
      }
    } finally {
      setLoading(false);
      setStreamingText("");
      abortRef.current = null;
    }
  }

  async function continueStory() {
    if (chapters.length === 0 || !selectedScenario) return;
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setStreamingText("");
    setError("");

    let accumulated = "";
    try {
      const full = await streamRequest("/api/story/superhero-continue", {
        previousChapters: chapters.join("\n\n"),
        chapterNumber: chapters.length + 1,
        hero: `${selectedHeroine.name} (${selectedHeroine.alias})`,
        villain: customVillain.trim() || selectedScenario.villain,
        setting: selectedScenario.setting,
        tone: selectedScenario.tone,
        intensity: intensity === 1 ? "Tense" : intensity === 3 ? "Brutal" : "Explicit",
        details: `Continue with authentic Arrowverse tone. Reference ${selectedScenario.episodeRef} context. Escalate — more intense, more psychologically deep, more physically explicit than the previous chapter.`,
      }, (c) => { accumulated += c; setStreamingText(accumulated); }, ctrl.signal);

      const newChapters = [...chapters, full];
      setChapters(newChapters);
      if (savedId) updateArchiveStory(savedId, { chapters: newChapters, wordCount: newChapters.join(" ").split(/\s+/).filter(Boolean).length });
    } catch (e) {
      if (isAbort(e)) { if (accumulated.trim()) setChapters([...chapters, accumulated]); }
      else setError(e instanceof Error ? e.message : "Continue failed");
    } finally {
      setLoading(false);
      setStreamingText("");
      abortRef.current = null;
    }
  }

  const showColor = selectedScenario?.show === "flash" ? FLASH_COLOR : ARROW_COLOR;
  const showDark  = selectedScenario?.show === "flash" ? FLASH_DARK  : ARROW_DARK;

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#f0f0f0", padding: "0 0 80px" }}>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg, #0d1f0d 0%, #0a0a0f 40%, #1a0d00 100%)", borderBottom: "1px solid #1a2a1a", padding: "24px 24px 20px" }}>
        <button onClick={onBack} style={{ background: "none", border: "1px solid #333", color: "#999", borderRadius: "6px", padding: "6px 14px", cursor: "pointer", marginBottom: "16px", fontSize: "13px" }}>← Back</button>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
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
        <p style={{ color: "#888", fontSize: "13px", margin: "12px 0 0", maxWidth: "600px" }}>
          Every scenario drawn from the darkest episodes of Arrow and The Flash — season by season, episode by episode, faithfully rendered.
        </p>
      </div>

      {/* STORY VIEW */}
      {step === "story" && (
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: showColor, letterSpacing: "2px" }}>{selectedScenario?.title}</div>
            <div style={{ fontSize: "11px", color: "#666", letterSpacing: "1px", background: "#111", border: `1px solid ${showColor}33`, borderRadius: "4px", padding: "3px 8px" }}>{selectedScenario?.episodeRef}</div>
          </div>

          <div style={{ background: "#0e0e18", border: `1px solid ${showColor}22`, borderRadius: "8px", padding: "32px", lineHeight: 1.85, fontSize: "15px", color: "#ddd", whiteSpace: "pre-wrap", fontFamily: "Georgia, serif" }}>
            {loading && chapters.length === 0 ? streamingText : displayedText}
            {loading && chapters.length > 0 && <span style={{ color: "#555" }}>{streamingText}</span>}
          </div>

          {error && <div style={{ color: "#f87171", background: "#1a0000", border: "1px solid #7f1d1d", borderRadius: "6px", padding: "12px", marginTop: "16px" }}>{error}</div>}

          <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap" }}>
            {!loading && (
              <button onClick={continueStory} style={{ background: `linear-gradient(135deg, ${showDark}, ${showColor}33)`, border: `1px solid ${showColor}55`, color: showColor, borderRadius: "8px", padding: "12px 24px", cursor: "pointer", fontWeight: 700, letterSpacing: "1px", fontSize: "13px" }}>
                + NEXT CHAPTER
              </button>
            )}
            {loading && (
              <button onClick={() => abortRef.current?.abort()} style={{ background: "#1a0000", border: "1px solid #7f1d1d", color: "#f87171", borderRadius: "8px", padding: "12px 24px", cursor: "pointer", fontWeight: 700 }}>
                STOP
              </button>
            )}
            <button onClick={() => { setStep("configure"); setChapters([]); }} style={{ background: "transparent", border: "1px solid #333", color: "#888", borderRadius: "8px", padding: "12px 20px", cursor: "pointer" }}>
              Change Setup
            </button>
            <button onClick={() => { setStep("browse"); setSelectedScenario(null); setChapters([]); }} style={{ background: "transparent", border: "1px solid #333", color: "#888", borderRadius: "8px", padding: "12px 20px", cursor: "pointer" }}>
              Pick New Scenario
            </button>
          </div>

          {chapters.length > 1 && (
            <div style={{ marginTop: "20px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {chapters.map((_, i) => (
                <span key={i} style={{ fontSize: "11px", color: "#666", background: "#111", border: "1px solid #222", borderRadius: "4px", padding: "3px 8px" }}>Chapter {i + 1}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LOADING */}
      {loading && chapters.length === 0 && (
        <AtmosphericLoader
          color={selectedScenario?.show === "flash" ? "#FCD34D" : "#4ADE80"}
          label={selectedScenario?.title ?? "GENERATING"}
          subLabel={`${selectedScenario?.episodeRef} · ${selectedHeroine.name}`}
        />
      )}

      {/* CONFIGURE STEP */}
      {step === "configure" && selectedScenario && !loading && (
        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "32px 24px" }}>
          {/* Scenario card */}
          <div style={{ background: selectedScenario.show === "flash" ? "linear-gradient(135deg, #1a1200, #0a0a0f)" : "linear-gradient(135deg, #0d1f0d, #0a0a0f)", border: `1px solid ${showColor}33`, borderRadius: "12px", padding: "24px", marginBottom: "28px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "12px" }}>
              <div style={{ background: `${showColor}18`, border: `1px solid ${showColor}33`, borderRadius: "6px", padding: "4px 10px", fontSize: "11px", color: showColor, letterSpacing: "2px", fontWeight: 700, whiteSpace: "nowrap" }}>
                {selectedScenario.show === "flash" ? "⚡ THE FLASH" : "🏹 ARROW"} S{selectedScenario.season}
              </div>
              <div style={{ fontSize: "11px", color: "#555", paddingTop: "4px" }}>{selectedScenario.episodeRef}</div>
            </div>
            <div style={{ fontSize: "20px", fontWeight: 900, color: showColor, letterSpacing: "2px", marginBottom: "6px" }}>{selectedScenario.title}</div>
            <div style={{ fontSize: "13px", color: "#aaa", fontStyle: "italic", marginBottom: "14px" }}>"{selectedScenario.tagline}"</div>
            <div style={{ fontSize: "12px", color: "#777", lineHeight: 1.7 }}>{selectedScenario.storyContext}</div>
          </div>

          {/* Heroine picker */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#555", marginBottom: "12px" }}>CHOOSE HEROINE</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "8px" }}>
              {CW_HEROINES.map(h => (
                <button key={h.name} onClick={() => setSelectedHeroine(h)}
                  style={{ background: selectedHeroine.name === h.name ? `${showColor}18` : "#0e0e18", border: `1px solid ${selectedHeroine.name === h.name ? showColor : "#222"}`, borderRadius: "8px", padding: "10px 12px", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "16px" }}>{h.icon}</span>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: selectedHeroine.name === h.name ? showColor : "#ddd" }}>{h.name}</div>
                      <div style={{ fontSize: "10px", color: "#555" }}>{h.alias}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom villain override */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#555", marginBottom: "8px" }}>VILLAIN OVERRIDE (optional)</div>
            <div style={{ fontSize: "12px", color: "#555", marginBottom: "8px" }}>Default: <span style={{ color: showColor }}>{selectedScenario.villain}</span></div>
            <input value={customVillain} onChange={e => setCustomVillain(e.target.value)} placeholder="Override villain name (leave blank to use episode villain)"
              style={{ width: "100%", background: "#0e0e18", border: "1px solid #222", borderRadius: "8px", padding: "10px 14px", color: "#ddd", fontSize: "13px", boxSizing: "border-box" }} />
          </div>

          {/* Intensity */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#555", marginBottom: "12px" }}>INTENSITY</div>
            <div style={{ display: "flex", gap: "8px" }}>
              {([1, 2, 3] as const).map(i => (
                <button key={i} onClick={() => setIntensity(i)}
                  style={{ flex: 1, background: intensity === i ? `${showColor}18` : "#0e0e18", border: `1px solid ${intensity === i ? showColor : "#222"}`, borderRadius: "8px", padding: "12px 8px", cursor: "pointer", color: intensity === i ? showColor : "#666", fontWeight: 700, fontSize: "12px", letterSpacing: "1px" }}>
                  {i === 1 ? "TENSE" : i === 2 ? "EXPLICIT" : "BRUTAL"}
                </button>
              ))}
            </div>
          </div>

          {error && <div style={{ color: "#f87171", background: "#1a0000", border: "1px solid #7f1d1d", borderRadius: "6px", padding: "12px", marginBottom: "16px" }}>{error}</div>}

          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={generate} style={{ flex: 1, background: `linear-gradient(135deg, ${showDark}aa, ${showColor}33)`, border: `1px solid ${showColor}55`, color: showColor, borderRadius: "10px", padding: "16px", cursor: "pointer", fontWeight: 900, letterSpacing: "3px", fontSize: "14px" }}>
              GENERATE STORY
            </button>
            <button onClick={() => { setStep("browse"); setSelectedScenario(null); }} style={{ background: "transparent", border: "1px solid #333", color: "#666", borderRadius: "10px", padding: "16px 20px", cursor: "pointer" }}>
              ←
            </button>
          </div>
        </div>
      )}

      {/* BROWSE STEP */}
      {step === "browse" && (
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 24px" }}>

          {/* Show filter */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "28px", flexWrap: "wrap" }}>
            {(["all", "arrow", "flash"] as const).map(show => (
              <button key={show} onClick={() => setActiveShow(show)}
                style={{
                  background: activeShow === show
                    ? show === "flash" ? `${FLASH_COLOR}22` : show === "arrow" ? `${ARROW_COLOR}22` : "#1a1a2a"
                    : "#0e0e18",
                  border: `1px solid ${activeShow === show ? (show === "flash" ? FLASH_COLOR : show === "arrow" ? ARROW_COLOR : "#7c7cff") : "#222"}`,
                  color: activeShow === show ? (show === "flash" ? FLASH_COLOR : show === "arrow" ? ARROW_COLOR : "#aaa") : "#555",
                  borderRadius: "8px", padding: "9px 18px", cursor: "pointer", fontWeight: 700, letterSpacing: "2px", fontSize: "12px",
                }}>
                {show === "all" ? "ALL SHOWS" : show === "arrow" ? "🏹 ARROW" : "⚡ THE FLASH"}
                <span style={{ marginLeft: "8px", fontSize: "10px", opacity: 0.7 }}>
                  {show === "all" ? SCENARIOS.length : SCENARIOS.filter(s => s.show === show).length}
                </span>
              </button>
            ))}
          </div>

          {/* Season groups */}
          {(["arrow", "flash"] as const).filter(show => activeShow === "all" || activeShow === show).map(show => {
            const showScenarios = filteredScenarios.filter(s => s.show === show);
            if (showScenarios.length === 0) return null;
            const color = show === "flash" ? FLASH_COLOR : ARROW_COLOR;
            const dark = show === "flash" ? FLASH_DARK : ARROW_DARK;
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
                        <div style={{ background: `${color}18`, border: `1px solid ${color}33`, borderRadius: "4px", padding: "2px 8px", fontSize: "10px", color, letterSpacing: "1px", fontWeight: 700 }}>
                          S{s.season}
                        </div>
                        <div style={{ fontSize: "10px", color: "#444", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{s.episodeRef.split("—")[1]?.trim() ?? s.episodeRef}</div>
                      </div>

                      <div style={{ fontSize: "15px", fontWeight: 900, color, letterSpacing: "1.5px" }}>{s.title}</div>
                      <div style={{ fontSize: "11px", color: "#777", fontStyle: "italic", lineHeight: 1.5 }}>"{s.tagline}"</div>

                      <div style={{ marginTop: "4px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "10px", color: "#444", background: "#111", border: "1px solid #1a1a1a", borderRadius: "3px", padding: "2px 6px" }}>{s.villain.split("(")[0].trim()}</span>
                        <span style={{ fontSize: "10px", color: "#444", background: "#111", border: "1px solid #1a1a1a", borderRadius: "3px", padding: "2px 6px" }}>{s.setting.split("—")[0].trim()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
