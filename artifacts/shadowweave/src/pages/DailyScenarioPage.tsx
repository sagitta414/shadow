import { useState, useEffect, useRef } from "react";
import { saveStoryToArchive } from "../lib/archive";
import {
  getDailyEntryForToday,
  saveDailyEntry,
  getTodayDateKey,
  DailyEntry,
} from "../lib/archive";

// ── Daily data (mirrors Homepage.tsx) ────────────────────────────────────────
const DAILY_HEROINES = [
  { name: "Black Widow",   color: "#FF6060", power: "master spy, acrobat, martial artist, and weapons expert trained by the Red Room since childhood" },
  { name: "Scarlet Witch", color: "#FF6060", power: "chaos magic wielder capable of rewriting reality on a whim, Avenger-level threat even alone" },
  { name: "Wonder Woman",  color: "#60A0FF", power: "demi-goddess with godlike strength, speed, lasso of truth, and indestructible bracers" },
  { name: "Zatanna",       color: "#60A0FF", power: "reality-bending backwards-spoken magic, one of the most powerful sorcerers in the DC universe" },
  { name: "Black Canary",  color: "#40E090", power: "sonic Canary Cry capable of destroying steel, elite martial artist, and street-level combatant" },
  { name: "Supergirl",     color: "#40E090", power: "Kryptonian power set — flight, heat vision, freeze breath, near-indestructibility under yellow sun" },
  { name: "Elsa",          color: "#C084FC", power: "ice and snow manipulation on a continental scale, immune to cold, capable of creating life from frozen matter" },
  { name: "Megara",        color: "#C084FC", power: "exceptional cunning and psychological insight, survivor of the underworld, leverage over Hercules himself" },
  { name: "Mulan",         color: "#C084FC", power: "elite military strategist, expert warrior, physically trained to surpass every male soldier in the army" },
  { name: "Starlight",     color: "#FF3D00", power: "photon energy blasts, flight, near-invulnerability — and the only moral compass left in the Seven" },
  { name: "Kimiko",        color: "#FF3D00", power: "Compound-V enhanced speed and strength with regenerative healing — and complete silence as her weapon" },
  { name: "Pocahontas",    color: "#C084FC", power: "nature communication, preternatural empathy and wisdom, runs with the wind and understands all living things" },
];

const DAILY_VILLAINS = [
  "The Red Room Director","Baron Mordo","HYDRA Commander","Lex Luthor","Deathstroke","Circe",
  "Malcolm Merlyn","Damien Darhk","Maleficent","Ursula","Hades","Homelander","Black Noir",
];

const DAILY_SETTINGS = [
  "A subterranean black site — no signals in or out",
  "An abandoned cathedral at midnight",
  "A classified research vessel mid-ocean",
  "A forest compound deep in winter",
  "A disused Cold War bunker",
  "The ruins of a fallen empire palace",
  "A silent manor surrounded by fog",
];

const TITLE_TEMPLATES = [
  "{villain} Claims {heroine}","The Last Night — {villain} vs {heroine}",
  "{heroine} at Zero Hour","No Escape: {heroine} & {villain}",
  "{villain}'s Trophy","Into the Dark — {heroine} Falls",
];

function seededRand(seed: number) { const x = Math.sin(seed + 1) * 10000; return x - Math.floor(x); }
function dailySeed() { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }

function getDailyScenario() {
  const s = dailySeed();
  const heroine = DAILY_HEROINES[Math.floor(seededRand(s) * DAILY_HEROINES.length)];
  const villain = DAILY_VILLAINS[Math.floor(seededRand(s + 3) * DAILY_VILLAINS.length)];
  const setting = DAILY_SETTINGS[Math.floor(seededRand(s + 7) * DAILY_SETTINGS.length)];
  const t = TITLE_TEMPLATES[Math.floor(seededRand(s + 11) * TITLE_TEMPLATES.length)];
  return { heroine, villain, setting, title: t.replace("{heroine}", heroine.name).replace("{villain}", villain) };
}

// ── Stream helper ─────────────────────────────────────────────────────────────
async function streamRequest(
  endpoint: string,
  body: object,
  onChunk: (c: string) => void
): Promise<string> {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const res = await fetch(`${base}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let full = "";
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (!json) continue;
      try {
        const ev = JSON.parse(json);
        if (ev.chunk) { full += ev.chunk; onChunk(ev.chunk); }
        if (ev.error) throw new Error(ev.error);
        if (ev.done) return full;
      } catch {}
    }
  }
  return full;
}

interface Props {
  onBack: () => void;
  onChronicle: () => void;
}

export default function DailyScenarioPage({ onBack, onChronicle }: Props) {
  const scenario = getDailyScenario();
  const { heroine, villain, setting, title } = scenario;
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const [story, setStory] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [alreadySaved, setAlreadySaved] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasGenerated = useRef(false);

  useEffect(() => {
    const existing = getDailyEntryForToday();
    if (existing) {
      setStory(existing.story);
      setAlreadySaved(true);
      return;
    }
    if (!hasGenerated.current) {
      hasGenerated.current = true;
      generate();
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [streamingText, story]);

  async function generate() {
    setLoading(true);
    setStory("");
    setStreamingText("");
    setError("");
    setSavedId(null);
    setAlreadySaved(false);
    let accumulated = "";
    try {
      const full = await streamRequest(
        "/api/story/superhero",
        {
          hero: `${heroine.name} — ${heroine.power}`,
          villain,
          setting,
          stakes: "Total capture — she will not escape this night",
          weapons: "standard powers",
          storyLength: "Standard",
        },
        (c) => {
          accumulated += c;
          setStreamingText(accumulated);
        }
      );
      setStory(full);
      // Auto-save to daily chronicle
      saveDailyEntry({
        dateKey: getTodayDateKey(),
        date: today,
        heroine: heroine.name,
        heroineColor: heroine.color,
        villain,
        setting,
        title,
        story: full,
      });
      setAlreadySaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
      setStreamingText("");
    }
  }

  function saveToMainArchive() {
    if (!story) return;
    const id = saveStoryToArchive({
      title,
      universe: "Daily",
      tool: "Daily Dark Scenario",
      characters: [heroine.name, villain],
      chapters: [story],
    });
    setSavedId(id);
  }

  const displayText = story || streamingText;
  const paragraphs = displayText.split(/\n+/).filter(Boolean);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
            <div style={{ padding: "0.25rem 0.85rem", background: "rgba(200,168,75,0.12)", border: "1px solid rgba(200,168,75,0.35)", borderRadius: "20px", fontSize: "0.62rem", color: "rgba(200,168,75,0.9)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "2px", textTransform: "uppercase" }}>
              ◆ Daily Dark Scenario
            </div>
            <div style={{ fontSize: "0.62rem", color: "rgba(200,168,75,0.4)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1px" }}>
              {today}
            </div>
          </div>
          <h1 style={{ margin: 0, fontFamily: "'Cinzel', serif", fontSize: "clamp(1.2rem, 3vw, 1.8rem)", fontWeight: 900, background: "linear-gradient(135deg, #E8D08A 0%, #C8A830 45%, #A07030 80%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1.25 }}>
            {title}
          </h1>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
          <button onClick={onChronicle} style={{ background: "rgba(200,168,75,0.08)", border: "1px solid rgba(200,168,75,0.2)", borderRadius: "8px", padding: "0.45rem 0.9rem", color: "rgba(200,168,75,0.6)", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(200,168,75,0.5)"; e.currentTarget.style.color = "rgba(200,168,75,0.9)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(200,168,75,0.2)"; e.currentTarget.style.color = "rgba(200,168,75,0.6)"; }}>
            ◈ Chronicle
          </button>
          <button onClick={onBack} style={{ background: "none", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "0.45rem 0.9rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s" }}>
            ← Back
          </button>
        </div>
      </div>

      {/* Scenario brief */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.75rem", flexWrap: "wrap" }}>
        {[
          { label: "HEROINE", value: heroine.name, color: heroine.color },
          { label: "VILLAIN", value: villain, color: "rgba(200,195,220,0.7)" },
          { label: "SETTING", value: setting, color: "rgba(200,195,220,0.45)" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: "0.75rem 1.25rem", background: "rgba(8,4,20,0.7)", border: "1px solid rgba(200,168,75,0.1)", borderRadius: "10px", flex: 1, minWidth: "140px" }}>
            <div style={{ fontSize: "0.45rem", color: "rgba(200,168,75,0.4)", letterSpacing: "3px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginBottom: "0.35rem" }}>{label}</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.82rem", color, lineHeight: 1.4 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Story output */}
      <div style={{ background: "rgba(4,2,12,0.85)", border: "1px solid rgba(200,168,75,0.1)", borderLeft: "3px solid rgba(200,168,75,0.35)", borderRadius: "12px", padding: "2rem 2rem 1.5rem", marginBottom: "1.5rem", minHeight: "300px", position: "relative" }}>
        {loading && !streamingText && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "3rem 0" }}>
            <div style={{ fontSize: "0.52rem", color: "rgba(200,168,75,0.5)", letterSpacing: "4px", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase", animation: "pulse 2s ease-in-out infinite" }}>
              Generating today's story...
            </div>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: "5px", height: "5px", borderRadius: "50%", background: `rgba(200,168,75,0.6)`, animation: `pulseDot 1.4s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div style={{ color: "#FF6060", fontFamily: "'Montserrat', sans-serif", fontSize: "0.78rem", padding: "1rem", background: "rgba(200,0,0,0.08)", border: "1px solid rgba(200,0,0,0.2)", borderRadius: "8px" }}>
            ✗ {error}
          </div>
        )}

        {paragraphs.length > 0 && (
          <div style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: "1.05rem", lineHeight: 1.9, color: "rgba(228,222,210,0.85)" }}>
            {paragraphs.map((p, i) => (
              <p key={i} style={{ margin: "0 0 1.2em", textIndent: "1.5em" }}>{p}</p>
            ))}
            {loading && (
              <span style={{ display: "inline-block", width: "2px", height: "1.1em", background: "rgba(200,168,75,0.7)", verticalAlign: "middle", animation: "pulseDot 1s ease-in-out infinite", marginLeft: "2px" }} />
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Action bar */}
      {story && (
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "2rem" }}>
          {alreadySaved && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", background: "rgba(0,180,80,0.08)", border: "1px solid rgba(0,180,80,0.2)", borderRadius: "8px", fontSize: "0.65rem", color: "rgba(0,200,80,0.7)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1px" }}>
              ✓ Auto-saved to Chronicle
            </div>
          )}
          {!savedId ? (
            <button onClick={saveToMainArchive} style={{ padding: "0.6rem 1.5rem", background: "rgba(200,168,75,0.1)", border: "1px solid rgba(200,168,75,0.3)", borderRadius: "8px", color: "rgba(200,168,75,0.8)", fontFamily: "'Cinzel', serif", fontSize: "0.72rem", cursor: "pointer", letterSpacing: "1.5px", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(200,168,75,0.18)"; e.currentTarget.style.borderColor = "rgba(200,168,75,0.6)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(200,168,75,0.1)"; e.currentTarget.style.borderColor = "rgba(200,168,75,0.3)"; }}>
              ◈ Save to Story Archive
            </button>
          ) : (
            <div style={{ padding: "0.5rem 1rem", background: "rgba(0,100,200,0.08)", border: "1px solid rgba(0,100,200,0.2)", borderRadius: "8px", fontSize: "0.65rem", color: "rgba(100,180,255,0.7)", fontFamily: "'Montserrat', sans-serif" }}>
              ✓ Saved to Story Archive
            </div>
          )}
          <button onClick={() => { hasGenerated.current = false; generate(); }} disabled={loading} style={{ padding: "0.6rem 1.25rem", background: "rgba(100,0,200,0.08)", border: "1px solid rgba(100,0,200,0.2)", borderRadius: "8px", color: loading ? "rgba(200,200,220,0.2)" : "rgba(150,100,255,0.7)", fontFamily: "'Cinzel', serif", fontSize: "0.72rem", cursor: loading ? "not-allowed" : "pointer", letterSpacing: "1px", transition: "all 0.2s" }}>
            ⚡ Regenerate
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulseDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.3; transform:scale(0.5); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  );
}
