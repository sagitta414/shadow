import { useState, useRef, useEffect } from "react";
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

function nameToSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-{2,}/g, "-").replace(/^-|-$/g, "");
}

function universeColor(u: string) {
  return u === "Marvel" ? "#FF6060" : u === "CW" ? "#40E090" : u === "TB" ? "#FF3D00" : "#60A0FF";
}

export default function InterrogationRoom({ onBack }: Props) {
  const isMobile = useIsMobile();
  const [phase, setPhase] = useState<Phase>("setup");

  const [heroineName, setHeroineName] = useState("");
  const [heroineSearch, setHeroineSearch] = useState("");
  const [selectedVillain, setSelectedVillain] = useState<typeof QUICK_VILLAINS[0] | null>(null);
  const [customVillain, setCustomVillain] = useState("");
  const [customVillainScheme, setCustomVillainScheme] = useState("");
  const [villainMode, setVillainMode] = useState<"pick" | "custom">("pick");
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
  const [round, setRound] = useState(1);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  const villainLabel = villainMode === "pick"
    ? selectedVillain ? `${selectedVillain.name} — ${selectedVillain.scheme}` : ""
    : customVillain.trim() ? `${customVillain.trim()}${customVillainScheme.trim() ? ` — ${customVillainScheme.trim()}` : ""}` : "";

  const villainName = villainMode === "pick" ? selectedVillain?.name ?? "" : customVillain.trim();

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
          messages: msgs, }),
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

  const accentColor = villainMode === "pick" && selectedVillain
    ? universeColor(selectedVillain.universe)
    : "#FF4060";

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

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              {(["pick", "custom"] as const).map((m) => (
                <button key={m} onClick={() => setVillainMode(m)} style={{ padding: "0.4rem 1rem", background: villainMode === m ? "rgba(200,0,50,0.2)" : "rgba(0,0,0,0.35)", border: `1px solid ${villainMode === m ? "rgba(200,0,50,0.5)" : "rgba(255,255,255,0.07)"}`, borderRadius: "8px", color: villainMode === m ? "#FF4060" : "rgba(200,200,220,0.4)", fontFamily: "'Cinzel', serif", fontSize: "0.7rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s" }}>
                  {m === "pick" ? "Choose from List" : "Custom Villain"}
                </button>
              ))}
            </div>

            {villainMode === "pick" ? (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: "0.4rem", maxHeight: "280px", overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "rgba(200,0,50,0.2) transparent" }}>
                {QUICK_VILLAINS.map((v) => {
                  const isSel = selectedVillain?.name === v.name;
                  const ac = universeColor(v.universe);
                  return (
                    <button key={v.name} onClick={() => setSelectedVillain(v)} style={{ background: isSel ? `rgba(200,0,50,0.2)` : "rgba(0,0,0,0.4)", border: `1px solid ${isSel ? "rgba(200,0,50,0.55)" : "rgba(255,255,255,0.06)"}`, borderRadius: "10px", padding: "0.6rem 0.75rem", cursor: "pointer", textAlign: "left", transition: "all 0.15s", color: "inherit" }}>
                      <div className="font-cinzel" style={{ fontSize: "0.68rem", color: isSel ? "#FF4060" : "#E0E0F0", fontWeight: 700, marginBottom: "0.15rem" }}>{v.name}</div>
                      <div style={{ fontSize: "0.55rem", color: ac, fontFamily: "'Montserrat', sans-serif", letterSpacing: "1px", fontWeight: 700 }}>{v.universe}</div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <input value={customVillain} onChange={(e) => setCustomVillain(e.target.value)} placeholder="Villain name…" style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "0.65rem 1rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(200,0,50,0.5)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />
                <input value={customVillainScheme} onChange={(e) => setCustomVillainScheme(e.target.value)} placeholder="Their scheme / goal (optional)…" style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "0.65rem 1rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }} onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(200,0,50,0.5)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")} />
              </div>
            )}
          </div>

          {/* Weakness notes */}
          <div style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "1.5rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.7rem", color: "rgba(200,200,220,0.4)", letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: "0.75rem" }}>Heroine Weaknesses <span style={{ color: "rgba(200,200,220,0.25)", fontWeight: 400 }}>(optional — the captor knows these and uses them)</span></div>
            <textarea value={weaknessNotes} onChange={(e) => setWeaknessNotes(e.target.value)} placeholder="e.g. Kryptonite exposure, magic-based attacks, emotional manipulation via loved ones…" rows={2} style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "0.65rem 1rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.85rem", outline: "none", resize: "vertical", boxSizing: "border-box" }} onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,100,0,0.4)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")} />
          </div>

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


        <OutfitSelector
          outfitId={outfitId}
          damage={outfitDamage}
          onOutfitChange={setOutfitId}
          onDamageChange={setOutfitDamage}
          accentColor="#A78BFA"
          accentRgb="167,139,250"
        />
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
