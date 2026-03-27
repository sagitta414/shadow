import { useState, useRef, useEffect } from "react";
import StoryLengthPicker, { type StoryLength } from "../components/StoryLengthPicker";
import OutfitSelector, { outfitPromptLine } from "../components/OutfitSelector";
import UniversalOptions, { UNIVERSAL_DEFAULTS, universalPromptLines, type UniversalConfig } from "../components/UniversalOptions";
import { getAiProvider } from "../lib/aiProvider";
import { useIsMobile } from "../hooks/useIsMobile";

interface Props {
  onBack: () => void;
}

type Phase = "setup" | "active";

interface Message {
  role: "captor" | "heroine";
  text: string;
}

const QUICK_HEROINES = [
  "Black Widow", "Captain Marvel", "Storm", "Jean Grey", "Scarlet Witch",
  "Wonder Woman", "Supergirl", "Batgirl / Oracle", "Black Canary", "Starfire",
  "Raven", "Power Girl", "Zatanna", "Sara Lance", "Starlight", "Queen Maeve",
  "She-Hulk", "Psylocke", "Emma Frost", "Ghost-Spider", "Rogue", "Hawkgirl",
  "Catwoman", "Huntress", "Silk", "X-23", "Magik", "Shadowcat",
];

const QUICK_VILLAINS = [
  { name: "Thanos",           universe: "Marvel", scheme: "Wield cosmic power to reshape reality" },
  { name: "Doctor Doom",      universe: "Marvel", scheme: "Rule the world through dark science" },
  { name: "Magneto",          universe: "Marvel", scheme: "Forge a world where mutants rule" },
  { name: "Loki",             universe: "Marvel", scheme: "Claim the throne through divine trickery" },
  { name: "Red Skull",        universe: "Marvel", scheme: "Forge a fascist world empire" },
  { name: "Mephisto",         universe: "Marvel", scheme: "Collect souls through damned bargains" },
  { name: "The Enchantress",  universe: "Marvel", scheme: "Enslave heroes through magical seduction" },
  { name: "Darkseid",         universe: "DC",     scheme: "Discover the Anti-Life Equation" },
  { name: "Lex Luthor",       universe: "DC",     scheme: "Prove humanity's superiority over gods" },
  { name: "The Joker",        universe: "DC",     scheme: "Burn civilization into beautiful chaos" },
  { name: "General Zod",      universe: "DC",     scheme: "Rebuild Krypton through conquest of Earth" },
  { name: "Ra's al Ghul",     universe: "DC",     scheme: "Purge humanity to restore ecological balance" },
  { name: "Sinestro",         universe: "DC",     scheme: "Impose order through fear-based control" },
  { name: "Granny Goodness",  universe: "DC",     scheme: "Break heroes through endless torment" },
  { name: "Amanda Waller",    universe: "DC",     scheme: "Control metahumans as weapons for the state" },
  { name: "Zoom",             universe: "CW",     scheme: "Steal every speedster's speed and rule all Earths" },
  { name: "Damien Darhk",     universe: "CW",     scheme: "Embrace Hive's death magic to raze the world" },
  { name: "Homelander",       universe: "TB",     scheme: "Maintain iron control over Vought and all supes" },
  { name: "Stormfront",       universe: "TB",     scheme: "Weaponize supes for ideological supremacy" },
];

const CELEBRITY_CAPTORS = [
  { name: "Chris Hemsworth",   category: "Actor",      scheme: "The leading man who plays by his own rules — off camera" },
  { name: "Jason Momoa",       category: "Actor",      scheme: "The king who never really left the role behind" },
  { name: "Henry Cavill",      category: "Actor",      scheme: "The man of steel in ways that don't make it to press" },
  { name: "Idris Elba",        category: "Actor",      scheme: "A voice that expects obedience — and receives it" },
  { name: "Tom Hardy",         category: "Actor",      scheme: "Intensity that doesn't stop when the cameras do" },
  { name: "Dwayne Johnson",    category: "Actor",      scheme: "Power that was never just for the screen" },
  { name: "Michael B. Jordan", category: "Actor",      scheme: "Ambition with no ceiling and no oversight" },
  { name: "Ryan Reynolds",     category: "Actor",      scheme: "Charm deployed as a weapon — until it isn't charm anymore" },
  { name: "Dave Bautista",     category: "Actor",      scheme: "Discipline and size applied without apology" },
  { name: "John Cena",         category: "Actor",      scheme: "You cannot see him — until it is already too late" },
  { name: "Pedro Pascal",      category: "Actor",      scheme: "The protector who decides what he protects — and what he keeps" },
  { name: "Oscar Isaac",       category: "Actor",      scheme: "Layered, methodical, with a plan behind every expression" },
  { name: "Conor McGregor",    category: "Fighter",    scheme: "Precision violence, packaged as entertainment" },
  { name: "Jon Jones",         category: "Fighter",    scheme: "Controlled aggression — until the cameras leave" },
  { name: "LeBron James",      category: "Athlete",    scheme: "The greatest closer — in any arena" },
  { name: "Cristiano Ronaldo", category: "Athlete",    scheme: "Obsessive discipline redirected toward one purpose" },
  { name: "Bad Bunny",         category: "Music",      scheme: "Cultural dominance translated into something more personal" },
  { name: "Drake",             category: "Music",      scheme: "The obsessive with the resources to follow through" },
  { name: "The Weeknd",        category: "Music",      scheme: "Dark fantasies that became operational plans" },
  { name: "Elon Musk",         category: "Billionaire",scheme: "The wealthiest man alive — with a very specific agenda" },
  { name: "Jeff Bezos",        category: "Billionaire",scheme: "Empire-builder who decides what is allowed to exist" },
  { name: "Mark Zuckerberg",   category: "Billionaire",scheme: "Every data point weaponised — including hers" },
];

const REALISTIC_CAPTORS = [
  { name: "The Russian Operative", category: "Intelligence", scheme: "Decades of black-site methodology, refined to an art form" },
  { name: "The CIA Handler",       category: "Intelligence", scheme: "Deniable authority, clean paperwork, no witnesses" },
  { name: "The Black Site Director",category:"Intelligence", scheme: "Jurisdiction ends at his door. So does oversight." },
  { name: "The Cartel Boss",       category: "Criminal",    scheme: "An empire built on leverage — she is the latest acquisition" },
  { name: "The Crime Lord",        category: "Criminal",    scheme: "The city answers to him. She is in his city now." },
  { name: "The Arms Dealer",       category: "Criminal",    scheme: "He trades in weapons — and now in something more valuable" },
  { name: "The Mercenary",         category: "Military",    scheme: "The contract specifies delivery, not condition" },
  { name: "The Warden",            category: "Authority",   scheme: "Total institutional control — she is inside his facility" },
  { name: "The Detective",         category: "Authority",   scheme: "He wrote the manual — and discarded its limits long ago" },
  { name: "The Fixer",             category: "Professional",scheme: "Problems disappear. She is the latest problem." },
  { name: "The Surgeon",           category: "Professional",scheme: "Methodical and exact — the precision of a man who removes things" },
  { name: "The Collector",         category: "Private",     scheme: "An obsessive with time, money, and no one to answer to" },
  { name: "The Cult Leader",       category: "Private",     scheme: "He doesn't need force — she will come to believe on her own" },
  { name: "The Senator",           category: "Political",   scheme: "Untouchable immunity applied with quiet precision" },
  { name: "The Tech Mogul",        category: "Corporate",   scheme: "Surveillance capitalism evolved into something unregulated" },
  { name: "The Billionaire Recluse",category:"Private",     scheme: "Wealth old enough that the law forgot to follow it inside" },
];

function nameToSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-{2,}/g, "-").replace(/^-|-$/g, "");
}

function universeColor(u: string) {
  return u === "Marvel" ? "#FF6060" : u === "CW" ? "#40E090" : u === "TB" ? "#FF3D00" : "#60A0FF";
}

function celebColor(cat: string) {
  if (cat === "Actor")       return "#F59E0B";
  if (cat === "Fighter")     return "#EF4444";
  if (cat === "Athlete")     return "#3B82F6";
  if (cat === "Music")       return "#A855F7";
  if (cat === "Billionaire") return "#10B981";
  return "#F59E0B";
}

function realisticColor(cat: string) {
  if (cat === "Intelligence") return "#94A3B8";
  if (cat === "Criminal")     return "#EF4444";
  if (cat === "Military")     return "#78716C";
  if (cat === "Authority")    return "#0EA5E9";
  if (cat === "Professional") return "#A78BFA";
  if (cat === "Private")      return "#C084FC";
  if (cat === "Political")    return "#60A5FA";
  if (cat === "Corporate")    return "#34D399";
  return "#94A3B8";
}

export default function InterrogationRoom({ onBack }: Props) {
  const isMobile = useIsMobile();
  const [phase, setPhase] = useState<Phase>("setup");

  const [heroineName, setHeroineName] = useState("");
  const [heroineSearch, setHeroineSearch] = useState("");
  const [selectedVillain, setSelectedVillain] = useState<typeof QUICK_VILLAINS[0] | null>(null);
  const [selectedCeleb, setSelectedCeleb] = useState<typeof CELEBRITY_CAPTORS[0] | null>(null);
  const [selectedRealistic, setSelectedRealistic] = useState<typeof REALISTIC_CAPTORS[0] | null>(null);
  const [customVillain, setCustomVillain] = useState("");
  const [customVillainScheme, setCustomVillainScheme] = useState("");
  const [villainMode, setVillainMode] = useState<"villains" | "celebrity" | "realistic" | "custom">("villains");
  const [weaknessNotes, setWeaknessNotes] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);
  const [heroineDraft, setHeroineDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [error, setError] = useState("");
  const [outfitId, setOutfitId] = useState("");
  const [universalConfig, setUniversalConfig] = useState<UniversalConfig>(UNIVERSAL_DEFAULTS);
  const [extractionTarget, setExtractionTarget] = useState("");
  const [silenceConsequence, setSilenceConsequence] = useState("");
  const [outfitDamage, setOutfitDamage] = useState(0);
  const [storyLength, setStoryLength] = useState<StoryLength>("standard");
  const [round, setRound] = useState(1);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  const villainLabel =
    villainMode === "villains"  ? (selectedVillain  ? `${selectedVillain.name} — ${selectedVillain.scheme}` : "") :
    villainMode === "celebrity" ? (selectedCeleb    ? `${selectedCeleb.name} — ${selectedCeleb.scheme}` : "") :
    villainMode === "realistic" ? (selectedRealistic? `${selectedRealistic.name} — ${selectedRealistic.scheme}` : "") :
    customVillain.trim() ? `${customVillain.trim()}${customVillainScheme.trim() ? ` — ${customVillainScheme.trim()}` : ""}` : "";

  const villainName =
    villainMode === "villains"  ? (selectedVillain?.name ?? "") :
    villainMode === "celebrity" ? (selectedCeleb?.name ?? "") :
    villainMode === "realistic" ? (selectedRealistic?.name ?? "") :
    customVillain.trim();

  const canBegin = heroineName.trim().length > 0 && villainLabel.length > 0;

  const filteredHeroines = QUICK_HEROINES.filter(h =>
    !heroineSearch || h.toLowerCase().includes(heroineSearch.toLowerCase())
  );

  async function streamInterrogation(msgs: Message[]) {
    setLoading(true);
    setStreamingText("");
    setError("");
    let accumulated = "";
    try {
      const res = await fetch("/api/story/interrogation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: getAiProvider(), outfitContext: outfitPromptLine(outfitId, outfitDamage), universalContext: universalPromptLines(universalConfig), modeContext: (() => { const _extractionTargetMap: Record<string,string> = {"safe_house_locations":"Safe House Locations","access_codes":"Access Codes","ally_identities":"Ally Identities","classified_intel":"Classified Intel","personal_secrets":"Personal Secrets"};
      const _silenceConsequenceMap: Record<string,string> = {"escalating_pain":"Escalating Pain","psychological":"Psychological Pressure","others_harmed":"Others Are Harmed","public_exposure":"Public Exposure","deprivation":"Sensory Deprivation"}; return [extractionTarget ? `Extraction Target: ${_extractionTargetMap[extractionTarget] ?? extractionTarget}` : "", silenceConsequence ? `Consequence for Silence: ${_silenceConsequenceMap[silenceConsequence] ?? silenceConsequence}` : ""].filter(Boolean).join("\n"); })(), extractionTarget, silenceConsequence, heroine: heroineName.trim(),
          villain: villainLabel,
          weaknesses: weaknessNotes.trim() || undefined,
          messages: msgs, storyLength }),
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = JSON.parse(line.slice(6));
          if (payload.chunk) { accumulated += payload.chunk; setStreamingText(accumulated); }
          if (payload.error) throw new Error(payload.error);
        }
      }
      setMessages(prev => [...prev, { role: "captor", text: accumulated }]);
      setStreamingText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  function beginInterrogation() {
    if (!canBegin) return;
    setPhase("active");
    setMessages([]);
    setRound(1);
    streamInterrogation([]);
  }

  function sendResponse() {
    if (!heroineDraft.trim() || loading) return;
    const newMsg: Message = { role: "heroine", text: heroineDraft.trim() };
    const updated = [...messages, newMsg];
    setMessages(updated);
    setHeroineDraft("");
    setRound(r => r + 1);
    streamInterrogation(updated);
    setTimeout(() => textareaRef.current?.focus(), 100);
  }

  const accentColor =
    villainMode === "villains"  && selectedVillain  ? universeColor(selectedVillain.universe) :
    villainMode === "celebrity" && selectedCeleb    ? celebColor(selectedCeleb.category) :
    villainMode === "realistic" && selectedRealistic? realisticColor(selectedRealistic.category) :
    "#FF4060";

  if (phase === "setup") {
    return (
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: isMobile ? "1rem" : "2rem 1rem" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "none", border: "none", color: "rgba(200,200,220,0.4)", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "0.75rem", letterSpacing: "1.5px", marginBottom: "1.5rem", padding: 0 }}>
          ← Back
        </button>

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "0.6rem", color: "rgba(200,0,50,0.5)", letterSpacing: "4px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginBottom: "0.5rem" }}>TOOL 08</div>
          <h1 className="font-cinzel" style={{ fontSize: isMobile ? "1.5rem" : "2.2rem", color: "#FF4060", fontWeight: 900, letterSpacing: "4px", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            Interrogation Room
          </h1>
          <p style={{ fontSize: "0.8rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Montserrat', sans-serif" }}>
            The captor questions. You answer as the heroine. The AI escalates.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Heroine */}
          <div style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,184,0,0.2)", borderRadius: "16px", padding: "1.5rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.7rem", color: "#FFB800", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "1rem" }}>Captured Heroine</div>

            <input
              value={heroineName}
              onChange={(e) => setHeroineName(e.target.value)}
              placeholder="Enter heroine name (e.g. Supergirl, Black Widow, Starlight…)"
              style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,184,0,0.25)", borderRadius: "8px", padding: "0.75rem 1rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.9rem", outline: "none", boxSizing: "border-box", marginBottom: "1rem" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,184,0,0.55)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,184,0,0.25)")}
            />

            <div style={{ marginBottom: "0.6rem" }}>
              <input
                value={heroineSearch}
                onChange={(e) => setHeroineSearch(e.target.value)}
                placeholder="Search quick-pick…"
                style={{ width: "100%", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "0.5rem 0.875rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", maxHeight: "120px", overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "rgba(255,184,0,0.2) transparent" }}>
              {filteredHeroines.map((h) => (
                <button key={h} onClick={() => setHeroineName(h)} style={{ padding: "0.35rem 0.75rem", background: heroineName === h ? "rgba(255,184,0,0.2)" : "rgba(0,0,0,0.4)", border: `1px solid ${heroineName === h ? "rgba(255,184,0,0.5)" : "rgba(255,255,255,0.07)"}`, borderRadius: "20px", color: heroineName === h ? "#FFB800" : "rgba(200,200,220,0.45)", fontFamily: "'Raleway', sans-serif", fontSize: "0.72rem", cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap" }}>
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Villain */}
          <div style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(200,0,50,0.2)", borderRadius: "16px", padding: "1.5rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.7rem", color: "#FF4060", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "1rem" }}>The Captor</div>

            {/* ── Mode tabs ── */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1rem" }}>
              {([
                { key: "villains",  label: "Supervillains", color: "#FF4060" },
                { key: "celebrity", label: "Celebrities",   color: "#F59E0B" },
                { key: "realistic", label: "Realistic",     color: "#94A3B8" },
                { key: "custom",    label: "Custom",        color: "#A78BFA" },
              ] as const).map((m) => (
                <button key={m.key} onClick={() => setVillainMode(m.key)} style={{ padding: "0.4rem 1rem", background: villainMode === m.key ? `rgba(${m.key === "villains" ? "200,0,50" : m.key === "celebrity" ? "245,158,11" : m.key === "realistic" ? "148,163,184" : "167,139,250"},0.18)` : "rgba(0,0,0,0.35)", border: `1px solid ${villainMode === m.key ? `${m.color}88` : "rgba(255,255,255,0.07)"}`, borderRadius: "8px", color: villainMode === m.key ? m.color : "rgba(200,200,220,0.4)", fontFamily: "'Cinzel', serif", fontSize: "0.68rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                  {m.label}
                </button>
              ))}
            </div>

            {/* ── Supervillains grid ── */}
            {villainMode === "villains" && (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: "0.4rem", maxHeight: "280px", overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "rgba(200,0,50,0.2) transparent" }}>
                {QUICK_VILLAINS.map((v) => {
                  const isSel = selectedVillain?.name === v.name;
                  const ac = universeColor(v.universe);
                  return (
                    <button key={v.name} onClick={() => setSelectedVillain(v)} style={{ background: isSel ? "rgba(200,0,50,0.2)" : "rgba(0,0,0,0.4)", border: `1px solid ${isSel ? "rgba(200,0,50,0.55)" : "rgba(255,255,255,0.06)"}`, borderRadius: "10px", padding: "0.6rem 0.75rem", cursor: "pointer", textAlign: "left", transition: "all 0.15s", color: "inherit" }}>
                      <div className="font-cinzel" style={{ fontSize: "0.68rem", color: isSel ? "#FF4060" : "#E0E0F0", fontWeight: 700, marginBottom: "0.15rem" }}>{v.name}</div>
                      <div style={{ fontSize: "0.55rem", color: ac, fontFamily: "'Montserrat', sans-serif", letterSpacing: "1px", fontWeight: 700 }}>{v.universe}</div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Celebrity captors grid ── */}
            {villainMode === "celebrity" && (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: "0.4rem", maxHeight: "300px", overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "rgba(245,158,11,0.2) transparent" }}>
                {CELEBRITY_CAPTORS.map((v) => {
                  const isSel = selectedCeleb?.name === v.name;
                  const ac = celebColor(v.category);
                  return (
                    <button key={v.name} onClick={() => setSelectedCeleb(v)} style={{ background: isSel ? `rgba(245,158,11,0.18)` : "rgba(0,0,0,0.4)", border: `1px solid ${isSel ? "rgba(245,158,11,0.55)" : "rgba(255,255,255,0.06)"}`, borderRadius: "10px", padding: "0.6rem 0.75rem", cursor: "pointer", textAlign: "left", transition: "all 0.15s", color: "inherit" }}>
                      <div className="font-cinzel" style={{ fontSize: "0.68rem", color: isSel ? "#F59E0B" : "#E0E0F0", fontWeight: 700, marginBottom: "0.15rem" }}>{v.name}</div>
                      <div style={{ fontSize: "0.55rem", color: ac, fontFamily: "'Montserrat', sans-serif", letterSpacing: "1px", fontWeight: 700 }}>{v.category}</div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Realistic captors grid ── */}
            {villainMode === "realistic" && (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: "0.4rem", maxHeight: "300px", overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "rgba(148,163,184,0.2) transparent" }}>
                {REALISTIC_CAPTORS.map((v) => {
                  const isSel = selectedRealistic?.name === v.name;
                  const ac = realisticColor(v.category);
                  return (
                    <button key={v.name} onClick={() => setSelectedRealistic(v)} style={{ background: isSel ? "rgba(148,163,184,0.15)" : "rgba(0,0,0,0.4)", border: `1px solid ${isSel ? "rgba(148,163,184,0.5)" : "rgba(255,255,255,0.06)"}`, borderRadius: "10px", padding: "0.6rem 0.75rem", cursor: "pointer", textAlign: "left", transition: "all 0.15s", color: "inherit" }}>
                      <div className="font-cinzel" style={{ fontSize: "0.68rem", color: isSel ? "#E2E8F0" : "#E0E0F0", fontWeight: 700, marginBottom: "0.15rem" }}>{v.name}</div>
                      <div style={{ fontSize: "0.55rem", color: ac, fontFamily: "'Montserrat', sans-serif", letterSpacing: "1px", fontWeight: 700 }}>{v.category}</div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Custom villain ── */}
            {villainMode === "custom" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <input value={customVillain} onChange={(e) => setCustomVillain(e.target.value)} placeholder="Captor name…" style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "0.65rem 1rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(200,0,50,0.5)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />
                <input value={customVillainScheme} onChange={(e) => setCustomVillainScheme(e.target.value)} placeholder="Their scheme / goal (optional)…" style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "0.65rem 1rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(200,0,50,0.5)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />
              </div>
            )}
          </div>

          {/* Weakness notes */}
          <div style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "1.5rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.7rem", color: "rgba(200,200,220,0.4)", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "0.75rem" }}>Heroine Weaknesses <span style={{ color: "rgba(200,200,220,0.25)", fontWeight: 400 }}>(optional — the captor knows these and uses them)</span></div>
            <textarea value={weaknessNotes} onChange={(e) => setWeaknessNotes(e.target.value)} placeholder="e.g. Kryptonite exposure, magic-based attacks, emotional manipulation via loved ones…" rows={2} style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "0.65rem 1rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.85rem", outline: "none", resize: "vertical", boxSizing: "border-box" }} onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,100,0,0.4)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")} />
          </div>

          {/* ── Outfit, Scene & Narrative Controls ── */}
          <OutfitSelector outfitId={outfitId} damage={outfitDamage} onOutfitChange={setOutfitId} onDamageChange={setOutfitDamage} accentColor="#A78BFA" accentRgb="167,139,250" />
          <div style={{marginTop:"1.25rem"}}>
            <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"0.875rem"}}>
              <div style={{width:"3px",height:"18px",borderRadius:"2px",background:"linear-gradient(180deg, #A78BFA, transparent)"}} />
              <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.72rem",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"#A78BFA"}}>Scene Parameters</span>
              <div style={{flex:1,height:"1px",background:"linear-gradient(90deg, rgba(167,139,250,0.25), transparent)"}} />
              <span style={{fontSize:"0.62rem",color:"rgba(200,195,240,0.3)",fontStyle:"italic"}}>optional</span>
            </div>
            <div style={{background:"rgba(15,10,30,0.5)",border:"1px solid rgba(167,139,250,0.18)",borderRadius:"12px",padding:"1rem",backdropFilter:"blur(8px)"}}>
              <div style={{marginBottom:"0.875rem"}}>
                <div style={{fontSize:"0.57rem",fontFamily:"'Montserrat',sans-serif",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"rgba(200,195,240,0.35)",marginBottom:"0.5rem"}}>WHAT'S BEING EXTRACTED</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
                  {[{id:"safe_house_locations",icon:"🏠",label:"Safe House Locations"},{id:"access_codes",icon:"🔑",label:"Access Codes / Passwords"},{id:"ally_identities",icon:"👥",label:"Ally Identities"},{id:"classified_intel",icon:"📁",label:"Classified Intelligence"},{id:"personal_secrets",icon:"💭",label:"Personal Secrets"}].map((opt:{id:string;icon:string;label:string}) => (<button key={opt.id} onClick={() => setExtractionTarget(extractionTarget === opt.id ? "" : opt.id)} style={{display:"flex",alignItems:"center",gap:"0.35rem",padding:"0.4rem 0.8rem",borderRadius:"20px",border:`1px solid ${extractionTarget === opt.id ? "#A78BFA" : "rgba(200,195,240,0.15)"}`,background:extractionTarget === opt.id ? "rgba(167,139,250,0.16)" : "rgba(255,255,255,0.03)",color:extractionTarget === opt.id ? "#A78BFA" : "rgba(200,195,240,0.55)",fontSize:"0.7rem",fontFamily:"'Montserrat',sans-serif",fontWeight:extractionTarget === opt.id ? 700:400,cursor:"pointer",transition:"all 0.18s",minHeight:"36px"}}><span>{opt.icon}</span><span>{opt.label}</span></button>))}
                </div>
              </div>
              <div style={{marginBottom:"0.875rem"}}>
                <div style={{fontSize:"0.57rem",fontFamily:"'Montserrat',sans-serif",fontWeight:700,letterSpacing:"2.5px",textTransform:"uppercase",color:"rgba(200,195,240,0.35)",marginBottom:"0.5rem"}}>CONSEQUENCE FOR SILENCE</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
                  {[{id:"escalating_pain",icon:"⚡",label:"Escalating Pain"},{id:"psychological",icon:"🧠",label:"Psychological Pressure"},{id:"others_harmed",icon:"💔",label:"Others Are Harmed"},{id:"public_exposure",icon:"📢",label:"Public Exposure"},{id:"deprivation",icon:"🚫",label:"Sensory Deprivation"}].map((opt:{id:string;icon:string;label:string}) => (<button key={opt.id} onClick={() => setSilenceConsequence(silenceConsequence === opt.id ? "" : opt.id)} style={{display:"flex",alignItems:"center",gap:"0.35rem",padding:"0.4rem 0.8rem",borderRadius:"20px",border:`1px solid ${silenceConsequence === opt.id ? "#A78BFA" : "rgba(200,195,240,0.15)"}`,background:silenceConsequence === opt.id ? "rgba(167,139,250,0.16)" : "rgba(255,255,255,0.03)",color:silenceConsequence === opt.id ? "#A78BFA" : "rgba(200,195,240,0.55)",fontSize:"0.7rem",fontFamily:"'Montserrat',sans-serif",fontWeight:silenceConsequence === opt.id ? 700:400,cursor:"pointer",transition:"all 0.18s",minHeight:"36px"}}><span>{opt.icon}</span><span>{opt.label}</span></button>))}
                </div>
              </div>
            </div>
          </div>
          <UniversalOptions config={universalConfig} onChange={setUniversalConfig} accentColor="#A78BFA" accentRgb="167,139,250" />
          <StoryLengthPicker value={storyLength} onChange={setStoryLength} accentColor="#A78BFA" accentRgb="167,139,250" />

          <button onClick={beginInterrogation} disabled={!canBegin} style={{ padding: "1rem 2rem", background: canBegin ? "rgba(200,0,50,0.25)" : "rgba(255,255,255,0.04)", border: `1px solid ${canBegin ? "rgba(200,0,50,0.6)" : "rgba(255,255,255,0.07)"}`, borderRadius: "14px", color: canBegin ? "#FF4060" : "rgba(200,200,220,0.2)", fontFamily: "'Cinzel', serif", fontSize: "1rem", letterSpacing: "4px", textTransform: "uppercase", cursor: canBegin ? "pointer" : "not-allowed", transition: "all 0.3s", boxShadow: canBegin ? "0 4px 24px rgba(200,0,50,0.2)" : "none" }}>
            Enter the Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", padding: isMobile ? "0.75rem" : "1.5rem 1rem", display: "flex", flexDirection: "column", minHeight: "85vh" }}>
      {/* Header bar */}
      <div style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(200,0,50,0.25)", borderRadius: "14px", padding: "0.875rem 1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.55rem", color: "rgba(255,184,0,0.5)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}>Heroine</div>
            <div className="font-cinzel" style={{ fontSize: "0.85rem", color: "#FFB800", fontWeight: 700 }}>{heroineName}</div>
          </div>
          <div style={{ color: "rgba(200,200,220,0.2)", fontSize: "1.2rem" }}>⚔</div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.55rem", color: "rgba(200,0,50,0.5)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif" }}>Captor</div>
            <div className="font-cinzel" style={{ fontSize: "0.85rem", color: "#FF4060", fontWeight: 700 }}>{villainName}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ fontSize: "0.6rem", color: "rgba(200,200,220,0.3)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1.5px" }}>Round {round}</div>
          <button onClick={() => { setPhase("setup"); setMessages([]); setStreamingText(""); setRound(1); }} style={{ padding: "0.35rem 0.8rem", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "rgba(200,200,220,0.35)", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", cursor: "pointer", letterSpacing: "1px" }}>
            Exit
          </button>
        </div>
      </div>

      {/* Conversation */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.25rem", paddingRight: "4px", scrollbarWidth: "thin", scrollbarColor: "rgba(200,0,50,0.2) transparent" }}>
        {messages.length === 0 && !streamingText && !loading && (
          <div style={{ textAlign: "center", padding: "3rem 1rem", color: "rgba(200,200,220,0.2)", fontFamily: "'Montserrat', sans-serif", fontSize: "0.8rem" }}>
            Entering the room…
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "captor" ? "flex-start" : "flex-end" }}>
            <div style={{ maxWidth: "78%", background: m.role === "captor" ? "rgba(200,0,50,0.12)" : "rgba(255,184,0,0.1)", border: `1px solid ${m.role === "captor" ? "rgba(200,0,50,0.3)" : "rgba(255,184,0,0.3)"}`, borderRadius: m.role === "captor" ? "4px 16px 16px 16px" : "16px 4px 16px 16px", padding: "0.875rem 1.1rem" }}>
              <div style={{ fontSize: "0.52rem", color: m.role === "captor" ? "rgba(255,80,80,0.55)" : "rgba(255,184,0,0.55)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginBottom: "0.4rem", fontWeight: 700 }}>
                {m.role === "captor" ? villainName : heroineName}
              </div>
              <div style={{ fontSize: "0.88rem", color: m.role === "captor" ? "#E8C0C0" : "#E8E0B0", fontFamily: "'Raleway', sans-serif", lineHeight: 1.65 }}>{m.text}</div>
            </div>
          </div>
        ))}

        {(loading || streamingText) && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ maxWidth: "78%", background: "rgba(200,0,50,0.1)", border: "1px solid rgba(200,0,50,0.25)", borderRadius: "4px 16px 16px 16px", padding: "0.875rem 1.1rem" }}>
              <div style={{ fontSize: "0.52rem", color: "rgba(255,80,80,0.55)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginBottom: "0.4rem", fontWeight: 700 }}>{villainName}</div>
              {streamingText ? (
                <div style={{ fontSize: "0.88rem", color: "#E8C0C0", fontFamily: "'Raleway', sans-serif", lineHeight: 1.65 }}>{streamingText}<span style={{ animation: "orbFloat 1s ease-in-out infinite", display: "inline-block", marginLeft: "2px", color: "rgba(200,0,50,0.6)" }}>▌</span></div>
              ) : (
                <div style={{ display: "flex", gap: "5px", alignItems: "center", padding: "0.3rem 0" }}>
                  {[0, 0.2, 0.4].map((d) => <div key={d} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(200,0,50,0.5)", animation: `orbFloat 1s ease-in-out infinite`, animationDelay: `${d}s` }} />)}
                </div>
              )}
            </div>
          </div>
        )}
                {error && (
          <div style={{ textAlign: "center", padding: "0.75rem", background: "rgba(200,0,50,0.1)", border: "1px solid rgba(200,0,50,0.3)", borderRadius: "8px", color: "#FF4060", fontFamily: "'Montserrat', sans-serif", fontSize: "0.75rem" }}>
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Heroine response input */}
      <div style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,184,0,0.2)", borderRadius: "14px", padding: "1rem" }}>
        <div style={{ fontSize: "0.55rem", color: "rgba(255,184,0,0.45)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginBottom: "0.6rem" }}>
          {heroineName}'s Response
        </div>
        <textarea
          ref={textareaRef}
          value={heroineDraft}
          onChange={(e) => setHeroineDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !loading) { e.preventDefault(); sendResponse(); } }}
          disabled={loading}
          placeholder={loading ? "The captor is speaking…" : "Type her response… (Enter to send, Shift+Enter for new line)"}
          rows={3}
          style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "0.65rem 1rem", color: "#E8E8D0", fontFamily: "'Raleway', sans-serif", fontSize: "0.9rem", lineHeight: 1.65, outline: "none", resize: "none", boxSizing: "border-box", marginBottom: "0.75rem", opacity: loading ? 0.5 : 1 }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,184,0,0.35)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
        />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={sendResponse} disabled={!heroineDraft.trim() || loading} style={{ padding: "0.6rem 1.75rem", background: heroineDraft.trim() && !loading ? "rgba(255,184,0,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${heroineDraft.trim() && !loading ? "rgba(255,184,0,0.5)" : "rgba(255,255,255,0.07)"}`, borderRadius: "10px", color: heroineDraft.trim() && !loading ? "#FFB800" : "rgba(200,200,220,0.2)", fontFamily: "'Cinzel', serif", fontSize: "0.8rem", letterSpacing: "2px", textTransform: "uppercase", cursor: heroineDraft.trim() && !loading ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
            Send Response
          </button>
        </div>
      </div>
    </div>
  );
}
