import { useState, useRef, useEffect } from "react";

interface SuperheroModeProps {
  onBack: () => void;
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
  { name: "Dawnstar",         alias: "Legion Hero",       power: "Cosmic tracking & flight",            icon: "✨" },
  { name: "Argent",           alias: "Toni Monetti",      power: "Alien silver plasma generation",      icon: "🔘" },
  { name: "Arrowette",        alias: "Cissie King-Jones", power: "Olympic-level archery",               icon: "🏹" },
  { name: "Shrinking Violet", alias: "Salu Digby",        power: "Size reduction to microscopic",       icon: "🔬" },
  { name: "Lightning Lass",   alias: "Ayla Ranzz",        power: "Lightning bolt generation",           icon: "⚡" },
];

const VILLAINS = [
  // Marvel
  { name: "Thanos",           universe: "Marvel", scheme: "Wield cosmic power to reshape reality",    icon: "💀" },
  { name: "Doctor Doom",      universe: "Marvel", scheme: "Rule the world through dark science",       icon: "🤖" },
  { name: "Magneto",          universe: "Marvel", scheme: "Forge a world where mutants rule",          icon: "🧲" },
  { name: "Loki",             universe: "Marvel", scheme: "Claim the throne through divine trickery",  icon: "🐍" },
  { name: "Ultron",           universe: "Marvel", scheme: "Eliminate organic life for machine order",  icon: "⚙" },
  { name: "Kang the Conqueror",universe: "Marvel",scheme: "Dominate the entire timeline",              icon: "⏳" },
  { name: "Galactus",         universe: "Marvel", scheme: "Devour worlds to sustain his existence",    icon: "🌌" },
  { name: "Apocalypse",       universe: "Marvel", scheme: "Cull the weak and crown mutant supremacy",  icon: "☠" },
  { name: "Mephisto",         universe: "Marvel", scheme: "Collect souls through damned bargains",     icon: "😈" },
  { name: "Red Skull",        universe: "Marvel", scheme: "Forge a fascist world empire",              icon: "💀" },
  { name: "Dormammu",         universe: "Marvel", scheme: "Merge Earth with the Dark Dimension",       icon: "🌀" },
  { name: "Baron Zemo",       universe: "Marvel", scheme: "Dismantle every hero institution",          icon: "🗡" },
  { name: "MODOK",            universe: "Marvel", scheme: "Rule through superior mechanical intellect", icon: "🧠" },
  { name: "Green Goblin",     universe: "Marvel", scheme: "Destroy Spider-Man through psychological war",icon: "🎃" },
  { name: "Venom / Carnage",  universe: "Marvel", scheme: "Unleash symbiote chaos on the world",      icon: "🖤" },
  // DC
  { name: "Darkseid",         universe: "DC",     scheme: "Discover the Anti-Life Equation",           icon: "💥" },
  { name: "Lex Luthor",       universe: "DC",     scheme: "Prove humanity's superiority over gods",    icon: "💰" },
  { name: "The Joker",        universe: "DC",     scheme: "Burn civilization into beautiful chaos",    icon: "🃏" },
  { name: "Brainiac",         universe: "DC",     scheme: "Collect and miniaturize entire civilizations",icon: "🤖" },
  { name: "General Zod",      universe: "DC",     scheme: "Rebuild Krypton through conquest of Earth", icon: "☀" },
  { name: "Doomsday",         universe: "DC",     scheme: "Destroy all life through pure adaptive rage", icon: "💪" },
  { name: "Ra's al Ghul",     universe: "DC",     scheme: "Purge humanity to restore ecological balance",icon: "🌿" },
  { name: "Sinestro",         universe: "DC",     scheme: "Impose order through fear-based control",   icon: "💛" },
  { name: "Cheetah",          universe: "DC",     scheme: "Destroy Wonder Woman and claim divine power",icon: "🐆" },
  { name: "Circe",            universe: "DC",     scheme: "Wage divine war against all of humanity",   icon: "🔮" },
  { name: "Trigon",           universe: "DC",     scheme: "Consume Earth as another conquered realm",  icon: "😈" },
  { name: "Black Manta",      universe: "DC",     scheme: "Destroy Atlantis and Aquaman's legacy",     icon: "🔱" },
  { name: "Reverse-Flash",    universe: "DC",     scheme: "Shatter the Flash's life across time",      icon: "⚡" },
  { name: "Vandal Savage",    universe: "DC",     scheme: "Rule the world as its immortal king",       icon: "🗡" },
  { name: "Deathstroke",      universe: "DC",     scheme: "Complete any contract with absolute precision",icon: "⚔" },
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

type Step = 1 | 2 | 3 | 4;
type UniverseFilter = "ALL" | "MARVEL" | "DC";

// ── Component ─────────────────────────────────────────────────
export default function SuperheroMode({ onBack }: SuperheroModeProps) {
  const [step, setStep] = useState<Step>(1);
  const [universeFilter, setUniverseFilter] = useState<UniverseFilter>("ALL");
  const [search, setSearch] = useState("");

  // Selections
  const [selectedHero, setSelectedHero] = useState<typeof MARVEL_HEROES[0] & { universe: string } | null>(null);
  const [selectedVillain, setSelectedVillain] = useState<typeof VILLAINS[0] | null>(null);
  const [customVillain, setCustomVillain] = useState("");
  const [villainMode, setVillainMode] = useState<"pick" | "custom">("pick");
  const [selectedSetting, setSelectedSetting] = useState<string>("");
  const [selectedStakes, setSelectedStakes] = useState<string>("");
  const [selectedWeapons, setSelectedWeapons] = useState<string[]>([]);
  const [extraDetails, setExtraDetails] = useState("");

  // Story generation
  const [story, setStory] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const allHeroes = [
    ...MARVEL_HEROES.map((h) => ({ ...h, universe: "MARVEL" })),
    ...DC_HEROES.map((h) => ({ ...h, universe: "DC" })),
  ];

  const filteredHeroes = allHeroes.filter((h) => {
    const matchUniverse = universeFilter === "ALL" || h.universe === universeFilter;
    const matchSearch = !search || h.name.toLowerCase().includes(search.toLowerCase()) || h.alias.toLowerCase().includes(search.toLowerCase());
    return matchUniverse && matchSearch;
  });

  function toggleWeapon(w: string) {
    setSelectedWeapons((prev) => prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]);
  }

  function canProceedStep1() { return !!selectedHero; }
  function canProceedStep2() {
    return villainMode === "pick" ? !!selectedVillain : !!customVillain.trim();
  }
  function canProceedStep3() { return !!selectedSetting && !!selectedStakes; }

  async function generateStory() {
    setLoading(true);
    setStory("");
    setStreamingText("");
    setError("");

    const villain = villainMode === "pick" ? selectedVillain?.name : customVillain;
    const villainScheme = villainMode === "pick" ? selectedVillain?.scheme : "achieve their sinister goal";
    const settingLabel = SETTINGS.find((s) => s.id === selectedSetting)?.label ?? selectedSetting;
    const stakesLabel = STAKES.find((s) => s.id === selectedStakes)?.label ?? selectedStakes;

    const prompt = {
      hero: `${selectedHero?.name} (${selectedHero?.alias}) — Power: ${selectedHero?.power} — Universe: ${selectedHero?.universe}`,
      villain: `${villain} — Scheme: ${villainScheme}`,
      setting: settingLabel,
      stakes: stakesLabel,
      weapons: selectedWeapons.join(", ") || "standard powers",
      details: extraDetails,
    };

    try {
      const res = await fetch("/api/story/superhero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prompt),
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = JSON.parse(line.slice(6));
          if (payload.chunk) {
            accumulated += payload.chunk;
            setStreamingText(accumulated);
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
          }
          if (payload.done) setStory(payload.story);
          if (payload.error) throw new Error(payload.error);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Story generation failed");
    } finally {
      setLoading(false);
      setStreamingText("");
    }
  }

  function exportStory() {
    const text = `SHADOWWEAVE — SUPERHERO STORY\n${"═".repeat(50)}\n\nHERO: ${selectedHero?.name} (${selectedHero?.alias})\nVILLAIN: ${villainMode === "pick" ? selectedVillain?.name : customVillain}\nSETTING: ${SETTINGS.find((s) => s.id === selectedSetting)?.label}\nSTAKES: ${STAKES.find((s) => s.id === selectedStakes)?.label}\n\n${"═".repeat(50)}\n\n${story}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shadowweave_hero_${selectedHero?.name.replace(/\s+/g, "_")}_${Date.now()}.txt`;
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
              {(["ALL", "MARVEL", "DC"] as UniverseFilter[]).map((u) => (
                <button key={u} onClick={() => setUniverseFilter(u)} style={{ padding: "0.5rem 1rem", background: universeFilter === u ? (u === "MARVEL" ? "rgba(220,30,30,0.25)" : u === "DC" ? "rgba(0,100,220,0.25)" : "rgba(255,184,0,0.15)") : "transparent", border: "none", borderRight: u !== "DC" ? "1px solid rgba(255,255,255,0.05)" : "none", color: universeFilter === u ? (u === "MARVEL" ? "#FF6060" : u === "DC" ? "#60A0FF" : "#FFB800") : "rgba(200,200,220,0.35)", fontFamily: "'Cinzel', serif", fontSize: "0.7rem", cursor: "pointer", letterSpacing: "1.5px", transition: "all 0.2s" }}>
                  {u === "ALL" ? "All 100" : u === "MARVEL" ? "Marvel ✦" : "DC ✦"}
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

          {/* Selected preview */}
          {selectedHero && (
            <div style={{ marginBottom: "1.25rem", padding: "0.875rem 1.25rem", background: "linear-gradient(135deg, rgba(255,184,0,0.1), rgba(255,107,0,0.08))", border: "1px solid rgba(255,184,0,0.35)", borderRadius: "12px", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "1.5rem" }}>{selectedHero.icon}</span>
              <div>
                <div className="font-cinzel" style={{ color: "#FFB800", fontWeight: 700, fontSize: "1rem" }}>{selectedHero.name}</div>
                <div style={{ fontSize: "0.75rem", color: "rgba(200,200,220,0.5)", fontFamily: "'Montserrat', sans-serif" }}>{selectedHero.alias} · {selectedHero.power}</div>
              </div>
              <div style={{ marginLeft: "auto", padding: "0.25rem 0.625rem", background: selectedHero.universe === "MARVEL" ? "rgba(220,30,30,0.2)" : "rgba(0,100,220,0.2)", border: `1px solid ${selectedHero.universe === "MARVEL" ? "rgba(220,30,30,0.4)" : "rgba(0,100,220,0.4)"}`, borderRadius: "6px", fontSize: "0.62rem", color: selectedHero.universe === "MARVEL" ? "#FF6060" : "#60A0FF", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1.5px", fontWeight: 700 }}>
                {selectedHero.universe}
              </div>
            </div>
          )}

          {/* Hero grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.625rem", maxHeight: "520px", overflowY: "auto", paddingRight: "4px", scrollbarWidth: "thin", scrollbarColor: "rgba(255,184,0,0.3) transparent" }}>
            {filteredHeroes.map((hero) => {
              const isMarvel = hero.universe === "MARVEL";
              const isSelected = selectedHero?.name === hero.name;
              const accentColor = isMarvel ? "#FF6060" : "#60A0FF";
              const accentBg = isMarvel ? "rgba(220,30,30,0.15)" : "rgba(0,100,220,0.15)";
              return (
                <button
                  key={`${hero.universe}-${hero.name}`}
                  onClick={() => setSelectedHero(hero)}
                  style={{
                    background: isSelected ? (isMarvel ? "rgba(220,30,30,0.2)" : "rgba(0,100,220,0.2)") : "rgba(0,0,0,0.5)",
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
                  {isSelected && <div style={{ position: "absolute", top: "0.5rem", right: "0.5rem", width: "16px", height: "16px", borderRadius: "50%", background: accentColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "#000" }}>✓</div>}
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>{hero.icon}</div>
                  <div className="font-cinzel" style={{ fontSize: "0.8rem", color: isSelected ? accentColor : "#E8E8F0", fontWeight: 700, marginBottom: "0.2rem", lineHeight: 1.3 }}>{hero.name}</div>
                  <div style={{ fontSize: "0.62rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Montserrat', sans-serif", marginBottom: "0.4rem" }}>{hero.alias}</div>
                  <div style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.55)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.4 }}>{hero.power}</div>
                  <div style={{ marginTop: "0.5rem", fontSize: "0.55rem", color: accentColor, fontFamily: "'Montserrat', sans-serif", letterSpacing: "1.5px", fontWeight: 700, opacity: 0.7 }}>{hero.universe}</div>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "0.75rem", maxHeight: "480px", overflowY: "auto", paddingRight: "4px", scrollbarWidth: "thin", scrollbarColor: "rgba(200,0,50,0.3) transparent" }}>
                {VILLAINS.map((villain) => {
                  const isSelected = selectedVillain?.name === villain.name;
                  const isMarvel = villain.universe === "Marvel";
                  const accentColor = isMarvel ? "#FF6060" : "#60A0FF";
                  return (
                    <button
                      key={villain.name}
                      onClick={() => setSelectedVillain(villain)}
                      style={{ background: isSelected ? "rgba(200,0,50,0.18)" : "rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", border: `1px solid ${isSelected ? "rgba(200,0,50,0.6)" : "rgba(255,255,255,0.06)"}`, borderRadius: "12px", padding: "1rem", cursor: "pointer", textAlign: "left", transition: "all 0.2s", color: "inherit", position: "relative", boxShadow: isSelected ? "0 0 16px rgba(200,0,50,0.3)" : "none" }}
                      onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.borderColor = "rgba(200,0,50,0.35)"; e.currentTarget.style.background = "rgba(200,0,50,0.08)"; } }}
                      onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(0,0,0,0.5)"; } }}
                    >
                      {isSelected && <div style={{ position: "absolute", top: "0.5rem", right: "0.5rem", width: "16px", height: "16px", borderRadius: "50%", background: "#FF4060", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "#fff" }}>✓</div>}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.5rem" }}>
                        <span style={{ fontSize: "1.4rem" }}>{villain.icon}</span>
                        <div>
                          <div className="font-cinzel" style={{ fontSize: "0.85rem", color: isSelected ? "#FF4060" : "#E8E8F0", fontWeight: 700 }}>{villain.name}</div>
                          <div style={{ fontSize: "0.58rem", color: accentColor, fontFamily: "'Montserrat', sans-serif", letterSpacing: "1.5px", fontWeight: 700 }}>{villain.universe.toUpperCase()}</div>
                        </div>
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "rgba(200,200,220,0.55)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.5 }}>{villain.scheme}</p>
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

          {/* Extra details */}
          <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "1.5rem" }}>
            <label style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.35)", letterSpacing: "2.5px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", display: "block", marginBottom: "0.5rem" }}>Additional Story Details <span style={{ color: "rgba(200,200,220,0.2)", fontWeight: 400 }}>(optional)</span></label>
            <textarea value={extraDetails} onChange={(e) => setExtraDetails(e.target.value)} placeholder="Any specific plot twists, tone preferences, character backstory, team members, or anything else you want included in the story…" rows={3} style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "0.75rem 1rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.9rem", lineHeight: 1.65, outline: "none", resize: "vertical", boxSizing: "border-box" }}
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
                <div style={{ fontSize: "0.58rem", color: "rgba(255,184,0,0.5)", letterSpacing: "2.5px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginBottom: "0.2rem" }}>HERO</div>
                <div className="font-cinzel" style={{ color: "#FFB800", fontWeight: 700, fontSize: "1rem" }}>{selectedHero?.name}</div>
                <div style={{ fontSize: "0.7rem", color: "rgba(200,200,220,0.5)", fontFamily: "'Montserrat', sans-serif" }}>{selectedHero?.alias}</div>
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

          {/* Story content */}
          {(story || streamingText) && (
            <div style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,184,0,0.15)", borderRadius: "20px", padding: "2.5rem", marginBottom: "1.5rem", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, #FF4060 20%, #FFB800 50%, #C060E0 80%, transparent)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,184,0,0.2), transparent)" }} />
              <div className="font-crimson" style={{ fontSize: "1.1rem", color: "#F0F0FF", lineHeight: 2, whiteSpace: "pre-wrap", letterSpacing: "0.3px" }}>
                {story || streamingText}
                {loading && <span style={{ display: "inline-block", width: "2px", height: "1.1em", background: "#FFB800", marginLeft: "2px", verticalAlign: "text-bottom", animation: "progressGlow 0.8s ease-in-out infinite" }} />}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background: "rgba(139,0,0,0.15)", border: "1px solid rgba(139,0,0,0.4)", borderRadius: "12px", padding: "1rem 1.5rem", marginBottom: "1.5rem", color: "#FF6666", fontSize: "0.9rem" }}>
              ⚠ {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "space-between" }}>
            <button onClick={() => setStep(3)} style={{ padding: "0.75rem 1.5rem", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "rgba(200,200,220,0.4)", fontFamily: "'Cinzel', serif", fontSize: "0.8rem", cursor: "pointer", letterSpacing: "1.5px" }}>← Edit Scenario</button>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {story && (
                <>
                  <button onClick={exportStory} style={{ padding: "0.75rem 1.25rem", background: "rgba(255,184,0,0.12)", border: "1px solid rgba(255,184,0,0.3)", borderRadius: "10px", color: "#FFB800", fontFamily: "'Cinzel', serif", fontSize: "0.8rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s" }}>Export Story</button>
                  <button onClick={() => { setStory(""); generateStory(); }} style={{ padding: "0.75rem 1.5rem", background: "linear-gradient(135deg, rgba(255,184,0,0.2), rgba(255,0,128,0.15))", border: "1px solid rgba(255,184,0,0.45)", borderRadius: "10px", color: "#FFB800", fontFamily: "'Cinzel', serif", fontSize: "0.8rem", cursor: "pointer", letterSpacing: "1.5px", transition: "all 0.2s" }}>⚡ Regenerate</button>
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
