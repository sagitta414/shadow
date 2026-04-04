import { useState, useRef, useEffect } from "react";
import StoryIntro from "../components/StoryIntro";
import CinematicReader from "../components/CinematicReader";
import StoryChoices from "../components/StoryChoices";
import { saveStoryToArchive, updateArchiveStory } from "../lib/archive";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ── Faction data ──────────────────────────────────────────────
interface FactionMember { name: string; role: string; }
interface Faction {
  id: string;
  name: string;
  tagline: string;
  color: string;
  emblem: string;
  heroines: FactionMember[];
  villains: FactionMember[];
  side: "light" | "dark";
}

const FACTIONS: Faction[] = [
  {
    id: "avengers", name: "The Avengers", tagline: "Earth's Mightiest Heroes", color: "#E63B3B",
    emblem: "⚡", side: "light",
    heroines: [
      { name: "Black Widow", role: "Super-spy & master assassin" },
      { name: "Scarlet Witch", role: "Reality-warping sorceress" },
      { name: "Captain Marvel", role: "Binary-powered warrior" },
      { name: "She-Hulk", role: "Gamma-powered attorney" },
      { name: "Wasp", role: "Size-changing Avenger" },
    ], villains: []
  },
  {
    id: "justice_league", name: "Justice League", tagline: "Guardians of Justice", color: "#3B7FE6",
    emblem: "🦅", side: "light",
    heroines: [
      { name: "Wonder Woman", role: "Amazonian warrior princess" },
      { name: "Zatanna", role: "Backwards-spell sorceress" },
      { name: "Black Canary", role: "Sonic scream fighter" },
      { name: "Supergirl", role: "Last daughter of Krypton" },
      { name: "Batgirl", role: "Gotham's tech vigilante" },
    ], villains: []
  },
  {
    id: "the_seven", name: "The Seven", tagline: "Corporate heroes for hire", color: "#F59E0B",
    emblem: "⭐", side: "light",
    heroines: [
      { name: "Starlight", role: "Light-wielding true believer" },
      { name: "Queen Maeve", role: "Disillusioned super-soldier" },
      { name: "Kimiko", role: "Regenerating silent warrior" },
      { name: "Stormfront", role: "Nazi super with lightning" },
      { name: "A-Train", role: "Fastest man alive" },
    ], villains: []
  },
  {
    id: "star_alliance", name: "Star Alliance", tagline: "Hope across the galaxy", color: "#38BDF8",
    emblem: "✨", side: "light",
    heroines: [
      { name: "Ahsoka Tano", role: "White-bladed Force warrior" },
      { name: "Rey Skywalker", role: "Last of the Jedi" },
      { name: "Padmé Amidala", role: "Senator turned rebel queen" },
      { name: "Bo-Katan Kryze", role: "Mandalorian warrior" },
      { name: "Sabine Wren", role: "Graffiti artist & explosives expert" },
    ], villains: []
  },
  {
    id: "gaming_guild", name: "The Guild", tagline: "Legends from every world", color: "#A78BFA",
    emblem: "🎮", side: "light",
    heroines: [
      { name: "Tifa Lockhart", role: "Bare-knuckle eco-fighter" },
      { name: "Aerith Gainsborough", role: "Ancient with forbidden magic" },
      { name: "Lara Croft", role: "Tomb raider & survivor" },
      { name: "Yuna", role: "High Summoner of Spira" },
      { name: "Ciri", role: "Elder Blood source" },
    ], villains: []
  },
  {
    id: "hydra", name: "HYDRA", tagline: "Cut off one head…", color: "#22C55E",
    emblem: "🐍", side: "dark",
    heroines: [],
    villains: [
      { name: "Red Skull", role: "HYDRA's immortal supreme leader" },
      { name: "Baron Zemo", role: "Tactical genius of the Sokovian elite" },
      { name: "Taskmaster", role: "Perfect mimic and assassin trainer" },
      { name: "MODOK", role: "Mental organism designed only for killing" },
      { name: "Crossbones", role: "HYDRA's muscle and enforcer" },
    ]
  },
  {
    id: "gotham_rogues", name: "Gotham Rogues", tagline: "Chaos is the point", color: "#A855F7",
    emblem: "🃏", side: "dark",
    heroines: [],
    villains: [
      { name: "The Joker", role: "Chaos agent with no real rules" },
      { name: "Bane", role: "Venom-enhanced tactical genius" },
      { name: "Ra's al Ghul", role: "Immortal leader of the League of Shadows" },
      { name: "Deathstroke", role: "World's deadliest mercenary" },
      { name: "Scarecrow", role: "Fear toxin chemist and psychologist" },
    ]
  },
  {
    id: "sith_order", name: "Sith Order", tagline: "Peace is a lie", color: "#EF4444",
    emblem: "⚔️", side: "dark",
    heroines: [],
    villains: [
      { name: "Darth Vader", role: "Dark Lord of the Sith, ultimate enforcer" },
      { name: "Emperor Palpatine", role: "Sith mastermind of the Empire" },
      { name: "Kylo Ren", role: "Conflicted grandson of Vader" },
      { name: "Count Dooku", role: "Fallen Jedi, Sith aristocrat" },
      { name: "Darth Maul", role: "Zabrak assassin with twin-bladed saber" },
    ]
  },
  {
    id: "homelander_circle", name: "Vought Circle", tagline: "Power without accountability", color: "#DC2626",
    emblem: "🦁", side: "dark",
    heroines: [],
    villains: [
      { name: "Homelander", role: "All-American fascist with heat vision" },
      { name: "Black Noir", role: "Silent, unstoppable corporate asset" },
      { name: "The Deep", role: "Aquatic supe with a god complex" },
      { name: "A-Train", role: "Speed addict who makes problems disappear" },
      { name: "Soldier Boy", role: "WWII supe with nuclear-level blast" },
    ]
  },
  {
    id: "syndicate", name: "The Syndicate", tagline: "Intelligence is the real power", color: "#0EA5E9",
    emblem: "💠", side: "dark",
    heroines: [],
    villains: [
      { name: "Lex Luthor", role: "Genius billionaire obsessed with Superman" },
      { name: "Damien Darhk", role: "Idol-powered mystic and nihilist" },
      { name: "Ra's al Ghul", role: "Immortal eco-terrorist" },
      { name: "Baron Mordo", role: "Sorcerer Supreme's fallen student" },
      { name: "Ultron", role: "Sentient AI who evolved past his programming" },
    ]
  },
];

const LIGHT_FACTIONS = FACTIONS.filter(f => f.side === "light");
const DARK_FACTIONS  = FACTIONS.filter(f => f.side === "dark");

const CONFLICT_TYPES = [
  { id: "infiltration", label: "Infiltration", desc: "She goes in alone — and gets caught.", icon: "🔍" },
  { id: "ambush",       label: "Ambush",       desc: "They were waiting for her.",         icon: "⚡" },
  { id: "betrayal",     label: "Betrayal",     desc: "Someone sold her out.",               icon: "🗡️" },
  { id: "last_stand",   label: "Last Stand",   desc: "Outnumbered and surrounded.",         icon: "🛡️" },
  { id: "extraction",   label: "Extraction Gone Wrong", desc: "The rescue mission fails.",  icon: "🚁" },
  { id: "tournament",   label: "Dark Tournament", desc: "She was the prize from the start.", icon: "🏆" },
];

const SETTINGS = [
  "A HYDRA mountain fortress", "Gotham's underground arena", "A Vought skyscraper penthouse",
  "The Sith temple on Exegol", "A dark dimensional pocket realm", "Lex Corp's underground lab",
  "A S.H.I.E.L.D. facility gone rogue", "The Syndicate's floating base",
  "An ancient League of Shadows stronghold", "A maximum-security black site",
];

const INTENSITY_LEVELS = [
  { id: "tense",    label: "Tense",    color: "#22C55E" },
  { id: "brutal",   label: "Brutal",   color: "#EAB308" },
  { id: "explicit", label: "Explicit", color: "#EF4444" },
  { id: "unhinged", label: "Unhinged", color: "#A855F7" },
];

function streamFaction(endpoint: string, body: object, onChunk: (c: string) => void, signal?: AbortSignal) {
  return new Promise<string>((resolve, reject) => {
    fetch(`${BASE}/api${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    }).then(async (resp) => {
      const reader = resp.body!.getReader();
      const dec = new TextDecoder();
      let buf = ""; let full = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.replace(/^data:\s*/, "").trim();
          if (!line || line === "[DONE]") continue;
          try {
            const j = JSON.parse(line);
            if (j.error) { reject(new Error(j.error)); return; }
            if (j.done) { resolve(j.story ?? full); return; }
            if (j.chunk) { full += j.chunk; onChunk(j.chunk); }
          } catch {}
        }
      }
      resolve(full);
    }).catch(reject);
  });
}

export default function FactionMode({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [lightFaction, setLightFaction] = useState<Faction | null>(null);
  const [darkFaction, setDarkFaction]   = useState<Faction | null>(null);
  const [heroine, setHeroine] = useState<FactionMember | null>(null);
  const [villain, setVillain] = useState<FactionMember | null>(null);
  const [conflictType, setConflictType] = useState(CONFLICT_TYPES[0]);
  const [setting, setSetting]   = useState(SETTINGS[0]);
  const [customSetting, setCustomSetting] = useState("");
  const [intensity, setIntensity] = useState(INTENSITY_LEVELS[1]);
  const [storyLength, setStoryLength] = useState("standard");

  const [showIntro, setShowIntro]     = useState(false);
  const [generating, setGenerating]   = useState(false);
  const [continuing, setContinuing]   = useState(false);
  const [chapters, setChapters]       = useState<string[]>([]);
  const [streaming, setStreaming]      = useState("");
  const [savedId, setSavedId]         = useState<string | null>(null);
  const [showCinematic, setShowCinematic] = useState(false);
  const [liveChoices, setLiveChoices] = useState(false);
  const [choices, setChoices]         = useState<Array<{ label: string; description: string }> | null>(null);
  const [loadingChoices, setLoadingChoices] = useState(false);
  const [continueDir, setContinueDir] = useState("");
  const [coverImages, setCoverImages] = useState<Record<string, string>>({});
  const [generatingCover, setGeneratingCover] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chapters.length > 0) storyRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chapters.length]);

  const finalSetting = customSetting.trim() || setting;
  const story = chapters.join("\n\n");

  function autoSave(chs: string[]) {
    if (!heroine || !villain || !lightFaction || !darkFaction) return;
    const title = `${lightFaction.name} vs ${darkFaction.name}: ${heroine.name} × ${villain.name}`;
    if (savedId) {
      updateArchiveStory(savedId, { chapters: chs, wordCount: chs.join(" ").split(/\s+/).filter(Boolean).length });
    } else {
      const id = saveStoryToArchive({
        title,
        tool: "Faction War",
        characters: [heroine.name, villain.name],
        setting: finalSetting,
        universe: `${lightFaction.name} ✕ ${darkFaction.name}`,
        chapters: chs,
        tags: [lightFaction.id, darkFaction.id, conflictType.id, intensity.id],
        wordCount: chs.join(" ").split(/\s+/).filter(Boolean).length,
      });
      setSavedId(id);
    }
  }

  async function generate() {
    if (!heroine || !villain || !lightFaction || !darkFaction) return;
    setShowIntro(true);
  }

  async function doGenerate() {
    if (!heroine || !villain || !lightFaction || !darkFaction) return;
    setGenerating(true); setChapters([]); setStreaming(""); setSavedId(null); setChoices(null);
    abortRef.current = new AbortController();
    try {
      const full = await streamFaction("/story/faction", {
        lightFaction: lightFaction.name, darkFaction: darkFaction.name,
        heroine: `${heroine.name} — ${heroine.role}`,
        villain: `${villain.name} — ${villain.role}`,
        conflictType: conflictType.label, setting: finalSetting,
        intensity: intensity.label, storyLength,
      }, (c) => setStreaming(s => s + c), abortRef.current.signal);
      const chs = [full];
      setChapters(chs); setStreaming("");
      autoSave(chs);
      if (liveChoices) await fetchChoices(full);
    } finally { setGenerating(false); }
  }

  async function continueStory(direction?: string) {
    if (!heroine || !villain || !lightFaction || !darkFaction || chapters.length === 0) return;
    setContinuing(true); setStreaming(""); setChoices(null);
    abortRef.current = new AbortController();
    try {
      const full = await streamFaction("/story/faction-continue", {
        lightFaction: lightFaction.name, darkFaction: darkFaction.name,
        heroine: `${heroine.name} — ${heroine.role}`,
        villain: `${villain.name} — ${villain.role}`,
        conflictType: conflictType.label, setting: finalSetting,
        previousStory: chapters[chapters.length - 1],
        chapterNumber: chapters.length + 1,
        continueDirection: direction ?? continueDir,
      }, (c) => setStreaming(s => s + c), abortRef.current.signal);
      const chs = [...chapters, full];
      setChapters(chs); setStreaming(""); setContinueDir("");
      autoSave(chs);
      if (liveChoices) await fetchChoices(full);
    } finally { setContinuing(false); }
  }

  async function fetchChoices(storyText: string) {
    if (!heroine || !villain) return;
    setLoadingChoices(true); setChoices(null);
    try {
      const resp = await fetch(`${BASE}/api/story/branch-choices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyExcerpt: storyText, heroine: heroine.name,
          villain: villain.name, setting: finalSetting,
        }),
      });
      const json = await resp.json();
      setChoices(json.choices ?? null);
    } catch { setChoices(null); }
    finally { setLoadingChoices(false); }
  }

  async function generateCover() {
    if (!heroine || !villain) return;
    setGeneratingCover(true);
    try {
      const resp = await fetch(`${BASE}/api/story/generate-scene-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroine: heroine.name,
          sceneDescription: `${villain.name} has captured ${heroine.name} in ${finalSetting}. ${conflictType.desc}`,
          shotLabel: "Full Shot", mood: "Dark & Cinematic", styleLabel: "Hyperrealistic digital art",
          width: 512, height: 768,
        }),
      });
      const json = await resp.json();
      if (json.imageBase64) setCoverImages(m => ({ ...m, cover: json.imageBase64 }));
    } finally { setGeneratingCover(false); }
  }

  const C = {
    bg:   "rgba(0,0,0,0.92)",
    card: "rgba(255,255,255,0.025)",
    border: "rgba(255,255,255,0.06)",
    gold:  "#C8A830",
  };

  function FactionCard({ faction, selected, onClick }: { faction: Faction; selected: boolean; onClick: () => void }) {
    return (
      <div
        onClick={onClick}
        style={{
          padding: "1rem",
          background: selected ? `${faction.color}18` : C.card,
          border: `1px solid ${selected ? faction.color + "66" : C.border}`,
          borderRadius: "12px",
          cursor: "pointer",
          transition: "all 0.2s",
          boxShadow: selected ? `0 0 20px ${faction.color}22` : "none",
        }}
      >
        <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"0.4rem" }}>
          <span style={{ fontSize:"1.1rem" }}>{faction.emblem}</span>
          <div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.75rem", fontWeight:700, color: selected ? faction.color : "rgba(220,210,180,0.8)" }}>{faction.name}</div>
            <div style={{ fontSize:"0.5rem", color:"rgba(200,200,220,0.35)", fontStyle:"italic", fontFamily:"'Raleway',sans-serif", letterSpacing:"1px" }}>{faction.tagline}</div>
          </div>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"0.3rem" }}>
          {(faction.heroines.length > 0 ? faction.heroines : faction.villains).map(m => (
            <span key={m.name} style={{ fontSize:"0.4rem", padding:"0.15rem 0.4rem", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"10px", color:"rgba(200,195,220,0.5)", fontFamily:"'Cinzel',serif" }}>
              {m.name}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:"rgba(230,225,215,0.88)", padding:"1.5rem", fontFamily:"'Raleway',sans-serif" }}>
      <style>{`
        @keyframes fm-pulse { 0%,100%{opacity:0.7;}50%{opacity:1;} }
        @keyframes fm-stream { from{opacity:0;}to{opacity:1;} }
      `}</style>

      {/* Intro overlay */}
      {showIntro && heroine && villain && (
        <StoryIntro
          title={`${lightFaction?.name ?? ""} vs ${darkFaction?.name ?? ""}`}
          heroineName={heroine.name}
          heroineColor={lightFaction?.color ?? "#C8A830"}
          villain={villain.name}
          setting={finalSetting}
          universe={conflictType.label}
          onComplete={() => { setShowIntro(false); doGenerate(); }}
        />
      )}

      {/* Cinematic reader */}
      {showCinematic && heroine && villain && story && (
        <CinematicReader
          story={story}
          title={`${lightFaction?.name} vs ${darkFaction?.name}`}
          heroineName={heroine.name}
          heroineColor={lightFaction?.color ?? "#C8A830"}
          villain={villain.name}
          onExit={() => setShowCinematic(false)}
        />
      )}

      {/* Header */}
      <div style={{ maxWidth:"900px", margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"2rem" }}>
          <button onClick={onBack} style={{ background:"none", border:"1px solid rgba(200,168,75,0.2)", borderRadius:"8px", padding:"0.35rem 0.8rem", color:"rgba(200,168,75,0.5)", fontFamily:"'Cinzel',serif", fontSize:"0.55rem", cursor:"pointer", letterSpacing:"2px" }}>← BACK</button>
          <div>
            <h1 style={{ margin:0, fontFamily:"'Cinzel',serif", fontSize:"clamp(1.3rem,3vw,2rem)", fontWeight:900, letterSpacing:"0.08em", background:"linear-gradient(135deg, #C8A830, #FFFFFF, #C8A830)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>FACTION WAR</h1>
            <div style={{ fontSize:"0.5rem", color:"rgba(200,168,75,0.35)", letterSpacing:"5px", fontFamily:"'Cinzel',serif", textTransform:"uppercase" }}>Faction vs Faction · Dark Fiction</div>
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ display:"flex", gap:"0.5rem", marginBottom:"2rem", alignItems:"center" }}>
          {[1,2,3,4].map(s => (
            <div key={s} style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
              <div style={{ width:"24px", height:"24px", borderRadius:"50%", background: step >= s ? "rgba(200,168,75,0.3)" : "rgba(255,255,255,0.04)", border:`1px solid ${step >= s ? "rgba(200,168,75,0.6)" : "rgba(255,255,255,0.08)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Cinzel',serif", fontSize:"0.5rem", color: step >= s ? C.gold : "rgba(200,200,220,0.25)", transition:"all 0.3s" }}>{s}</div>
              {s < 4 && <div style={{ width:"30px", height:"1px", background: step > s ? "rgba(200,168,75,0.3)" : "rgba(255,255,255,0.06)" }} />}
            </div>
          ))}
          <div style={{ marginLeft:"0.5rem", fontFamily:"'Cinzel',serif", fontSize:"0.45rem", color:"rgba(200,168,75,0.35)", letterSpacing:"2px" }}>
            {step === 1 ? "CHOOSE YOUR HERO FACTION" : step === 2 ? "CHOOSE THE ENEMY FACTION" : step === 3 ? "CONFIGURE THE CONFLICT" : "GENERATE"}
          </div>
        </div>

        {/* Step 1: Light Faction */}
        {step === 1 && (
          <div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.6rem", letterSpacing:"4px", color:"rgba(200,168,75,0.5)", textTransform:"uppercase", marginBottom:"1rem" }}>◈ Hero Faction (Light Side)</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:"0.75rem", marginBottom:"1.5rem" }}>
              {LIGHT_FACTIONS.map(f => (
                <FactionCard key={f.id} faction={f} selected={lightFaction?.id === f.id} onClick={() => { setLightFaction(f); setHeroine(null); }} />
              ))}
            </div>
            {lightFaction && (
              <div style={{ marginBottom:"1.5rem" }}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"3px", color:"rgba(200,168,75,0.4)", textTransform:"uppercase", marginBottom:"0.7rem" }}>Choose your heroine:</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"0.5rem" }}>
                  {lightFaction.heroines.map(m => (
                    <button key={m.name} onClick={() => setHeroine(m)} style={{ padding:"0.5rem 0.9rem", background: heroine?.name === m.name ? `${lightFaction.color}28` : "rgba(255,255,255,0.03)", border:`1px solid ${heroine?.name === m.name ? lightFaction.color + "55" : "rgba(255,255,255,0.07)"}`, borderRadius:"20px", color: heroine?.name === m.name ? lightFaction.color : "rgba(200,195,220,0.55)", fontFamily:"'Cinzel',serif", fontSize:"0.55rem", cursor:"pointer", transition:"all 0.2s" }}>
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={() => setStep(2)}
              disabled={!lightFaction || !heroine}
              style={{ padding:"0.75rem 2rem", background: lightFaction && heroine ? `linear-gradient(135deg, ${lightFaction.color}30, ${lightFaction.color}15)` : "rgba(255,255,255,0.03)", border:`1px solid ${lightFaction && heroine ? (lightFaction.color + "55") : "rgba(255,255,255,0.07)"}`, borderRadius:"10px", color: lightFaction && heroine ? lightFaction.color : "rgba(200,200,220,0.2)", fontFamily:"'Cinzel',serif", fontSize:"0.65rem", letterSpacing:"2px", cursor: lightFaction && heroine ? "pointer" : "not-allowed", transition:"all 0.2s" }}
            >
              Next → Choose Enemy
            </button>
          </div>
        )}

        {/* Step 2: Dark Faction */}
        {step === 2 && (
          <div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.6rem", letterSpacing:"4px", color:"rgba(200,168,75,0.5)", textTransform:"uppercase", marginBottom:"1rem" }}>◈ Enemy Faction (Dark Side)</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:"0.75rem", marginBottom:"1.5rem" }}>
              {DARK_FACTIONS.map(f => (
                <FactionCard key={f.id} faction={f} selected={darkFaction?.id === f.id} onClick={() => { setDarkFaction(f); setVillain(null); }} />
              ))}
            </div>
            {darkFaction && (
              <div style={{ marginBottom:"1.5rem" }}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"3px", color:"rgba(200,168,75,0.4)", textTransform:"uppercase", marginBottom:"0.7rem" }}>Choose the villain:</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"0.5rem" }}>
                  {darkFaction.villains.map(m => (
                    <button key={m.name} onClick={() => setVillain(m)} style={{ padding:"0.5rem 0.9rem", background: villain?.name === m.name ? `${darkFaction.color}28` : "rgba(255,255,255,0.03)", border:`1px solid ${villain?.name === m.name ? darkFaction.color + "55" : "rgba(255,255,255,0.07)"}`, borderRadius:"20px", color: villain?.name === m.name ? darkFaction.color : "rgba(200,195,220,0.55)", fontFamily:"'Cinzel',serif", fontSize:"0.55rem", cursor:"pointer", transition:"all 0.2s" }}>
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display:"flex", gap:"0.75rem" }}>
              <button onClick={() => setStep(1)} style={{ padding:"0.75rem 1.5rem", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"10px", color:"rgba(200,200,220,0.35)", fontFamily:"'Cinzel',serif", fontSize:"0.6rem", letterSpacing:"2px", cursor:"pointer" }}>← Back</button>
              <button
                onClick={() => setStep(3)}
                disabled={!darkFaction || !villain}
                style={{ padding:"0.75rem 2rem", background: darkFaction && villain ? `linear-gradient(135deg, ${darkFaction.color}30, ${darkFaction.color}15)` : "rgba(255,255,255,0.03)", border:`1px solid ${darkFaction && villain ? (darkFaction.color + "55") : "rgba(255,255,255,0.07)"}`, borderRadius:"10px", color: darkFaction && villain ? darkFaction.color : "rgba(200,200,220,0.2)", fontFamily:"'Cinzel',serif", fontSize:"0.65rem", letterSpacing:"2px", cursor: darkFaction && villain ? "pointer" : "not-allowed", transition:"all 0.2s" }}
              >Next → Configure</button>
            </div>
          </div>
        )}

        {/* Step 3: Configure */}
        {step === 3 && (
          <div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.6rem", letterSpacing:"4px", color:"rgba(200,168,75,0.5)", textTransform:"uppercase", marginBottom:"1.2rem" }}>◈ Conflict Configuration</div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem", marginBottom:"1.5rem" }}>
              <div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"3px", color:"rgba(200,168,75,0.4)", textTransform:"uppercase", marginBottom:"0.7rem" }}>Conflict Type</div>
                <div style={{ display:"flex", flexDirection:"column", gap:"0.4rem" }}>
                  {CONFLICT_TYPES.map(ct => (
                    <button key={ct.id} onClick={() => setConflictType(ct)} style={{ padding:"0.6rem 0.9rem", background: conflictType.id === ct.id ? "rgba(200,168,75,0.12)" : "rgba(255,255,255,0.03)", border:`1px solid ${conflictType.id === ct.id ? "rgba(200,168,75,0.45)" : "rgba(255,255,255,0.07)"}`, borderRadius:"8px", color: conflictType.id === ct.id ? C.gold : "rgba(200,195,220,0.5)", fontFamily:"'Cinzel',serif", fontSize:"0.55rem", letterSpacing:"1px", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:"0.6rem", transition:"all 0.2s" }}>
                      <span>{ct.icon}</span>
                      <div>
                        <div style={{ fontWeight:700 }}>{ct.label}</div>
                        <div style={{ fontSize:"0.4rem", color:"rgba(200,195,220,0.3)", fontFamily:"'Raleway',sans-serif" }}>{ct.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"3px", color:"rgba(200,168,75,0.4)", textTransform:"uppercase", marginBottom:"0.7rem" }}>Setting</div>
                <div style={{ display:"flex", flexDirection:"column", gap:"0.35rem", marginBottom:"0.75rem" }}>
                  {SETTINGS.slice(0, 6).map(s => (
                    <button key={s} onClick={() => { setSetting(s); setCustomSetting(""); }} style={{ padding:"0.45rem 0.7rem", background: setting === s && !customSetting ? "rgba(200,168,75,0.1)" : "rgba(255,255,255,0.03)", border:`1px solid ${setting === s && !customSetting ? "rgba(200,168,75,0.35)" : "rgba(255,255,255,0.06)"}`, borderRadius:"8px", color: setting === s && !customSetting ? C.gold : "rgba(200,195,220,0.45)", fontFamily:"'Cinzel',serif", fontSize:"0.48rem", letterSpacing:"0.5px", cursor:"pointer", textAlign:"left", transition:"all 0.2s" }}>{s}</button>
                  ))}
                </div>
                <input value={customSetting} onChange={e => setCustomSetting(e.target.value)} placeholder="Or describe your own setting…" style={{ width:"100%", padding:"0.55rem 0.75rem", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"8px", color:"rgba(230,225,215,0.8)", fontFamily:"'Raleway',sans-serif", fontSize:"0.55rem", outline:"none", boxSizing:"border-box" }} />

                <div style={{ marginTop:"1rem" }}>
                  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"3px", color:"rgba(200,168,75,0.4)", textTransform:"uppercase", marginBottom:"0.6rem" }}>Intensity</div>
                  <div style={{ display:"flex", gap:"0.4rem" }}>
                    {INTENSITY_LEVELS.map(il => (
                      <button key={il.id} onClick={() => setIntensity(il)} style={{ flex:1, padding:"0.4rem", background: intensity.id === il.id ? `${il.color}18` : "rgba(255,255,255,0.03)", border:`1px solid ${intensity.id === il.id ? il.color + "55" : "rgba(255,255,255,0.07)"}`, borderRadius:"8px", color: intensity.id === il.id ? il.color : "rgba(200,195,220,0.3)", fontFamily:"'Cinzel',serif", fontSize:"0.45rem", letterSpacing:"1px", cursor:"pointer", transition:"all 0.2s" }}>{il.label}</button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop:"1rem" }}>
                  <label style={{ display:"flex", alignItems:"center", gap:"0.6rem", cursor:"pointer" }}>
                    <div onClick={() => setLiveChoices(!liveChoices)} style={{ width:"32px", height:"18px", borderRadius:"9px", background: liveChoices ? "rgba(200,168,75,0.4)" : "rgba(255,255,255,0.08)", border:`1px solid ${liveChoices ? "rgba(200,168,75,0.6)" : "rgba(255,255,255,0.1)"}`, position:"relative", transition:"all 0.2s", cursor:"pointer" }}>
                      <div style={{ width:"14px", height:"14px", borderRadius:"50%", background: liveChoices ? C.gold : "rgba(200,200,220,0.3)", position:"absolute", top:"1px", left: liveChoices ? "15px" : "1px", transition:"all 0.2s" }} />
                    </div>
                    <div>
                      <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", color:"rgba(200,195,220,0.7)", letterSpacing:"1px" }}>Live Choice Prompts</div>
                      <div style={{ fontFamily:"'Raleway',sans-serif", fontSize:"0.42rem", color:"rgba(200,195,220,0.3)" }}>AI pauses after each chapter to offer 3 branching choices</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display:"flex", gap:"0.75rem" }}>
              <button onClick={() => setStep(2)} style={{ padding:"0.75rem 1.5rem", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"10px", color:"rgba(200,200,220,0.35)", fontFamily:"'Cinzel',serif", fontSize:"0.6rem", letterSpacing:"2px", cursor:"pointer" }}>← Back</button>
              <button onClick={() => { setStep(4); generate(); }} style={{ flex:1, padding:"0.875rem 2rem", background:"linear-gradient(135deg, rgba(200,168,75,0.25), rgba(200,168,75,0.1))", border:"1px solid rgba(200,168,75,0.5)", borderRadius:"10px", color:C.gold, fontFamily:"'Cinzel',serif", fontSize:"0.8rem", letterSpacing:"3px", cursor:"pointer", transition:"all 0.2s", boxShadow:"0 4px 24px rgba(200,168,75,0.18)" }}>⚔️ BEGIN THE WAR</button>
            </div>
          </div>
        )}

        {/* Step 4: Story */}
        {step === 4 && (
          <div ref={storyRef}>
            {/* Faction matchup banner */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"1.5rem", marginBottom:"2rem", padding:"1rem", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:"12px" }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:"1.2rem", marginBottom:"0.2rem" }}>{lightFaction?.emblem}</div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.6rem", color: lightFaction?.color, fontWeight:700 }}>{heroine?.name}</div>
                <div style={{ fontSize:"0.42rem", color:"rgba(200,195,220,0.35)", fontFamily:"'Cinzel',serif" }}>{lightFaction?.name}</div>
              </div>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:"1rem", color:"rgba(200,168,75,0.35)" }}>✕</div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:"1.2rem", marginBottom:"0.2rem" }}>{darkFaction?.emblem}</div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.6rem", color: darkFaction?.color, fontWeight:700 }}>{villain?.name}</div>
                <div style={{ fontSize:"0.42rem", color:"rgba(200,195,220,0.35)", fontFamily:"'Cinzel',serif" }}>{darkFaction?.name}</div>
              </div>
            </div>

            {/* Loading */}
            {generating && !chapters.length && (
              <div style={{ textAlign:"center", padding:"3rem 0" }}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.6rem", letterSpacing:"4px", color:"rgba(200,168,75,0.5)", textTransform:"uppercase", animation:"fm-pulse 1.5s ease-in-out infinite", marginBottom:"0.75rem" }}>Writing Chapter 1…</div>
                {streaming && <div style={{ fontFamily:"'EB Garamond',Georgia,serif", fontSize:"0.9rem", lineHeight:1.9, color:"rgba(235,228,215,0.7)", textAlign:"left", maxWidth:"680px", margin:"0 auto", whiteSpace:"pre-wrap" }}>{streaming}</div>}
              </div>
            )}

            {/* Chapters */}
            {chapters.map((ch, i) => (
              <div key={i} style={{ marginBottom:"2.5rem" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1rem" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
                    <div style={{ width:"3px", height:"18px", background:`linear-gradient(180deg, ${lightFaction?.color ?? C.gold}, ${darkFaction?.color ?? "#888"})`, borderRadius:"2px" }} />
                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"4px", color:"rgba(200,168,75,0.4)", textTransform:"uppercase" }}>Chapter {i + 1}</span>
                  </div>
                  <div style={{ flex:1, height:"1px", background:"rgba(255,255,255,0.04)" }} />
                </div>
                <div style={{ fontFamily:"'EB Garamond',Georgia,serif", fontSize:"1rem", lineHeight:1.95, color:"rgba(235,228,215,0.88)", whiteSpace:"pre-wrap" }}>{ch}</div>
              </div>
            ))}

            {/* Streaming chapter */}
            {(continuing) && streaming && (
              <div style={{ marginBottom:"2rem" }}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"4px", color:"rgba(200,168,75,0.4)", textTransform:"uppercase", marginBottom:"1rem" }}>
                  Chapter {chapters.length + 1}…
                </div>
                <div style={{ fontFamily:"'EB Garamond',Georgia,serif", fontSize:"1rem", lineHeight:1.95, color:"rgba(235,228,215,0.7)", whiteSpace:"pre-wrap" }}>{streaming}</div>
              </div>
            )}

            {/* Choices */}
            {choices && !continuing && !generating && (
              <StoryChoices
                choices={choices}
                loading={loadingChoices}
                heroineColor={lightFaction?.color ?? C.gold}
                onChoose={(choice) => { continueStory(choice.label + ": " + choice.description); }}
                onSkip={() => { setChoices(null); }}
              />
            )}

            {loadingChoices && (
              <div style={{ textAlign:"center", padding:"1.5rem", fontFamily:"'Cinzel',serif", fontSize:"0.52rem", letterSpacing:"4px", color:"rgba(200,168,75,0.4)", animation:"fm-pulse 1.2s infinite" }}>
                Generating choices…
              </div>
            )}

            {/* Action bar */}
            {chapters.length > 0 && !generating && !continuing && !choices && !loadingChoices && (
              <div>
                {/* Cover art */}
                {coverImages.cover && (
                  <div style={{ marginBottom:"1.5rem", textAlign:"center" }}>
                    <img src={`data:image/jpeg;base64,${coverImages.cover}`} alt="Story cover" style={{ maxWidth:"280px", borderRadius:"12px", border:"1px solid rgba(255,255,255,0.08)", boxShadow:"0 8px 40px rgba(0,0,0,0.6)" }} />
                  </div>
                )}

                <div style={{ display:"flex", gap:"0.65rem", flexWrap:"wrap", marginBottom:"1.5rem" }}>
                  <button onClick={() => generateCover()} disabled={generatingCover} style={{ padding:"0.6rem 1.1rem", background:"rgba(168,85,247,0.12)", border:"1px solid rgba(168,85,247,0.3)", borderRadius:"10px", color:"#A855F7", fontFamily:"'Cinzel',serif", fontSize:"0.6rem", cursor:"pointer", letterSpacing:"1px" }}>
                    {generatingCover ? "🎨 Generating…" : "🎨 Cover Art"}
                  </button>
                  <button onClick={() => setShowCinematic(true)} style={{ padding:"0.6rem 1.1rem", background:"rgba(200,168,75,0.1)", border:"1px solid rgba(200,168,75,0.3)", borderRadius:"10px", color:C.gold, fontFamily:"'Cinzel',serif", fontSize:"0.6rem", cursor:"pointer", letterSpacing:"1px" }}>
                    📖 Cinematic Mode
                  </button>
                  {liveChoices ? (
                    <button onClick={() => fetchChoices(chapters[chapters.length - 1])} disabled={loadingChoices} style={{ flex:1, padding:"0.75rem 1.5rem", background:"linear-gradient(135deg, rgba(200,168,75,0.2), rgba(200,168,75,0.08))", border:"1px solid rgba(200,168,75,0.4)", borderRadius:"10px", color:C.gold, fontFamily:"'Cinzel',serif", fontSize:"0.7rem", cursor:"pointer", letterSpacing:"2px" }}>
                      ⋮ Get Choices — Chapter {chapters.length + 1}
                    </button>
                  ) : (
                    <button onClick={() => continueStory()} style={{ flex:1, padding:"0.75rem 1.5rem", background:"linear-gradient(135deg, rgba(200,168,75,0.2), rgba(200,168,75,0.08))", border:"1px solid rgba(200,168,75,0.4)", borderRadius:"10px", color:C.gold, fontFamily:"'Cinzel',serif", fontSize:"0.7rem", cursor:"pointer", letterSpacing:"2px" }}>
                      ⚔️ Continue — Chapter {chapters.length + 1}
                    </button>
                  )}
                </div>

                {!liveChoices && (
                  <div style={{ display:"flex", gap:"0.5rem", marginBottom:"1rem" }}>
                    <input value={continueDir} onChange={e => setContinueDir(e.target.value)} placeholder="Steer the next chapter (optional)…" style={{ flex:1, padding:"0.55rem 0.75rem", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"8px", color:"rgba(230,225,215,0.8)", fontFamily:"'Raleway',sans-serif", fontSize:"0.55rem", outline:"none" }} onKeyDown={e => { if (e.key === "Enter") continueStory(); }} />
                  </div>
                )}

                <button onClick={() => { setStep(1); setChapters([]); setSavedId(null); setChoices(null); }} style={{ padding:"0.55rem 1.2rem", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"10px", color:"rgba(200,200,220,0.35)", fontFamily:"'Cinzel',serif", fontSize:"0.55rem", cursor:"pointer", letterSpacing:"1.5px" }}>↩ New Faction War</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
