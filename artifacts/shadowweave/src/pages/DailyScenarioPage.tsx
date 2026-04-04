import { useState, useEffect, useRef } from "react";
import { getAiProvider } from "../lib/aiProvider";
import { saveStoryToArchive } from "../lib/archive";
import PsycheMeter, { type PsycheEvent } from "../components/PsycheMeter";
import StoryIntro from "../components/StoryIntro";
import CinematicReader from "../components/CinematicReader";
import StoryChoices from "../components/StoryChoices";
import {
  getDailyEntryForToday,
  getDailyEntryForDate,
  saveDailyEntry,
  getTodayDateKey,
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

interface ScenarioData {
  heroine: { name: string; color: string; power: string };
  villain: string;
  setting: string;
  title: string;
}

interface Props {
  onBack: () => void;
  onChronicle: () => void;
  dateKey?: string;
  scenarioOverride?: ScenarioData;
  forceGenerate?: boolean;
}

export default function DailyScenarioPage({ onBack, onChronicle, dateKey, scenarioOverride, forceGenerate }: Props) {
  const scenario = scenarioOverride ?? getDailyScenario();
  const { heroine, villain, setting, title } = scenario;

  const effectiveDateKey = dateKey ?? getTodayDateKey();
  const isPastDate = !!dateKey && dateKey !== getTodayDateKey();
  const displayDate = isPastDate
    ? new Date(dateKey + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const today = displayDate;

  const [chapters, setChapters] = useState<string[]>([]);
  const [psycheLog, setPsycheLog] = useState<PsycheEvent[]>([]);
  const psycheLogRef = useRef<PsycheEvent[]>([]);
  const psycheChapRef = useRef(0);
  useEffect(() => { psycheLogRef.current = psycheLog; }, [psycheLog]);
  useEffect(() => {
    if (chapters.length === 0) { psycheChapRef.current = 0; setPsycheLog([]); return; }
    if (chapters.length <= psycheChapRef.current) return;
    psycheChapRef.current = chapters.length;
    const _ch = chapters[chapters.length - 1]; if (!_ch?.trim()) return;
    const _log = psycheLogRef.current;
    const _s = Math.max(0, 100 + _log.reduce((a, e) => a + e.sanityDelta, 0));
    const _r = Math.max(0, 100 + _log.reduce((a, e) => a + (e.resistanceDelta ?? 0), 0));
    fetch("/api/story/psyche-update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chapterText: _ch.slice(0, 2500), heroineName: heroine.name, currentSanity: _s, currentResistance: _r }) })
      .then(r => r.ok ? r.json() : null).then((d: { sanityDelta: number; resistanceDelta: number; event: string } | null) => { if (d) setPsycheLog(prev => [...prev, { sanityDelta: d.sanityDelta, resistanceDelta: d.resistanceDelta, event: d.event }]); }).catch(() => {});
  }, [chapters]);
  const psycheSanity = Math.max(0, 100 + psycheLog.reduce((s, e) => s + e.sanityDelta, 0));
  const psycheResistance = Math.max(0, 100 + psycheLog.reduce((s, e) => s + (e.resistanceDelta ?? 0), 0));
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [continueDir, setContinueDir] = useState("");
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [alreadySaved, setAlreadySaved] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasGenerated = useRef(false);

  const [showIntro, setShowIntro] = useState(false);
  const [pendingRegenerate, setPendingRegenerate] = useState(false);
  const [showCinematic, setShowCinematic] = useState(false);
  const [liveChoices, setLiveChoices] = useState(false);
  const [choices, setChoices] = useState<Array<{ label: string; description: string }> | null>(null);
  const [loadingChoices, setLoadingChoices] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [generatingCover, setGeneratingCover] = useState(false);

  const fullStory = chapters.join("\n\n---\n\n");

  useEffect(() => {
    if (forceGenerate) {
      hasGenerated.current = true;
      generate();
      return;
    }
    const existing = dateKey ? getDailyEntryForDate(dateKey) : getDailyEntryForToday();
    if (existing && existing.story && existing.story.trim().length > 50) {
      setChapters([existing.story]);
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
  }, [streamingText, chapters]);

  async function generate() {
    setLoading(true);
    setChapters([]);
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
      setChapters([full]);
      saveDailyEntry({
        dateKey: effectiveDateKey,
        date: today,
        heroine: heroine.name,
        heroineColor: heroine.color,
        villain,
        setting,
        title,
        story: full,
      });
      setAlreadySaved(true);
      if (liveChoices) fetchBranchChoices(full);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
      setStreamingText("");
    }
  }

  async function continueStory() {
    if (!fullStory) return;
    setContinuing(true);
    setStreamingText("");
    setError("");
    let accumulated = "";
    try {
      const full = await streamRequest(
        "/api/story/daily-continue",
        {
          previousStory: fullStory,
          chapterNumber: chapters.length + 1,
          heroine: `${heroine.name} — ${heroine.power}`,
          villain,
          setting,
          continueDirection: continueDir.trim() || undefined,
        },
        (c) => {
          accumulated += c;
          setStreamingText(accumulated);
        }
      );
      const newChapters = [...chapters, full];
      setChapters(newChapters);
      setContinueDir("");
      // Update chronicle with full accumulated story
      saveDailyEntry({
        dateKey: effectiveDateKey,
        date: today,
        heroine: heroine.name,
        heroineColor: heroine.color,
        villain,
        setting,
        title,
        story: newChapters.join("\n\n---\n\n"),
      });
      if (liveChoices) fetchBranchChoices(full);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Continuation failed");
    } finally {
      setContinuing(false);
      setStreamingText("");
    }
  }

  async function continueWithChoice(choiceLabel: string, choiceDesc: string) {
    setChoices(null);
    const direction = `${choiceLabel}: ${choiceDesc}`;
    setContinueDir(direction);
    if (!fullStory) return;
    setContinuing(true);
    setStreamingText("");
    setError("");
    let accumulated = "";
    try {
      const full = await streamRequest(
        "/api/story/daily-continue",
        {
          previousStory: fullStory,
          chapterNumber: chapters.length + 1,
          heroine: `${heroine.name} — ${heroine.power}`,
          villain, setting,
          continueDirection: direction,
        },
        (c) => { accumulated += c; setStreamingText(accumulated); }
      );
      const newChapters = [...chapters, full];
      setChapters(newChapters);
      setContinueDir("");
      saveDailyEntry({
        dateKey: effectiveDateKey, date: today,
        heroine: heroine.name, heroineColor: heroine.color,
        villain, setting, title,
        story: newChapters.join("\n\n---\n\n"),
      });
      if (liveChoices) fetchBranchChoices(full);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Continuation failed");
    } finally {
      setContinuing(false);
      setStreamingText("");
    }
  }

  function saveToMainArchive() {
    if (!fullStory) return;
    const id = saveStoryToArchive({
      title,
      universe: "Daily",
      tool: "Daily Dark Scenario",
      characters: [heroine.name, villain],
      chapters,
    });
    setSavedId(id);
  }

  async function fetchBranchChoices(text: string) {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    setLoadingChoices(true); setChoices(null);
    try {
      const resp = await fetch(`${base}/api/story/branch-choices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyExcerpt: text, heroine: heroine.name, villain, setting }),
      });
      const json = await resp.json();
      setChoices(json.choices ?? null);
    } catch { setChoices(null); }
    finally { setLoadingChoices(false); }
  }

  async function generateCoverArt() {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    setGeneratingCover(true);
    try {
      const resp = await fetch(`${base}/api/story/generate-scene-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroine: heroine.name,
          sceneDescription: `${villain} has captured ${heroine.name} in ${setting}`,
          shotLabel: "Full Shot", mood: "Dark & Cinematic",
          styleLabel: "Hyperrealistic digital art", width: 512, height: 768,
        }),
      });
      const json = await resp.json();
      if (json.imageBase64) setCoverImage(json.imageBase64);
    } finally { setGeneratingCover(false); }
  }

  const isBusy = loading || continuing;
  const displayParagraphs = (text: string) => text.split(/\n+/).filter(Boolean);

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem", minHeight: "100vh" }}>

      {/* Cinematic intro overlay */}
      {showIntro && (
        <StoryIntro
          title={title}
          heroineName={heroine.name}
          heroineColor={heroine.color}
          villain={villain}
          setting={setting}
          universe="Daily Dark Scenario"
          onComplete={() => {
            setShowIntro(false);
            if (pendingRegenerate) {
              setPendingRegenerate(false);
              hasGenerated.current = false;
              generate();
            }
          }}
        />
      )}

      {/* Cinematic reader overlay */}
      {showCinematic && fullStory && (
        <CinematicReader
          story={fullStory}
          title={title}
          heroineName={heroine.name}
          heroineColor={heroine.color}
          villain={villain}
          onExit={() => setShowCinematic(false)}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
            <div style={{ padding: "0.25rem 0.85rem", background: "rgba(200,168,75,0.12)", border: "1px solid rgba(200,168,75,0.35)", borderRadius: "20px", fontSize: "0.62rem", color: "rgba(200,168,75,0.9)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "2px", textTransform: "uppercase" }}>
              ◆ Daily Dark Scenario
            </div>
            {isPastDate && (
              <div style={{ padding: "0.25rem 0.75rem", background: "rgba(150,100,255,0.12)", border: "1px solid rgba(150,100,255,0.35)", borderRadius: "20px", fontSize: "0.55rem", color: "rgba(180,140,255,0.9)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "2px", textTransform: "uppercase" }}>
                ◈ Past Chronicle
              </div>
            )}
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

      {/* Story output — all chapters */}
      <div style={{ background: "rgba(4,2,12,0.85)", border: "1px solid rgba(200,168,75,0.1)", borderLeft: "3px solid rgba(200,168,75,0.35)", borderRadius: "12px", padding: "2rem 2rem 1.5rem", marginBottom: "1.5rem", minHeight: "300px", position: "relative" }}>
        {isBusy && !streamingText && chapters.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "3rem 0" }}>
            <div style={{ fontSize: "0.52rem", color: "rgba(200,168,75,0.5)", letterSpacing: "4px", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase", animation: "pulse 2s ease-in-out infinite" }}>
              {loading ? "Generating today's story..." : "Continuing the story..."}
            </div>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: "5px", height: "5px", borderRadius: "50%", background: `rgba(200,168,75,0.6)`, animation: `pulseDot 1.4s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        {!isBusy && !streamingText && chapters.length === 0 && !error && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.2rem", padding: "3rem 0" }}>
            <div style={{ fontSize: "0.52rem", color: "rgba(200,168,75,0.3)", letterSpacing: "4px", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase" }}>
              Story not yet generated
            </div>
            <button onClick={() => { hasGenerated.current = false; generate(); }} style={{ padding: "0.7rem 2rem", background: "linear-gradient(135deg, rgba(200,168,75,0.85), rgba(160,120,40,0.85))", border: "none", borderRadius: "10px", color: "#0a0808", fontFamily: "'Cinzel', serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}>
              ◆ Generate Today's Story
            </button>
          </div>
        )}

        {error && (
          <div style={{ color: "#FF6060", fontFamily: "'Montserrat', sans-serif", fontSize: "0.78rem", padding: "1rem", background: "rgba(200,0,0,0.08)", border: "1px solid rgba(200,0,0,0.2)", borderRadius: "8px", marginBottom: "1rem" }}>
            ✗ {error}
          </div>
        )}

        {psycheLog.length > 0 && <PsycheMeter sanity={psycheSanity} resistance={psycheResistance} log={psycheLog} heroineName={heroine.name} />}
        <div style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: "1.05rem", lineHeight: 1.9, color: "rgba(228,222,210,0.85)" }}>
          {chapters.map((chapter, ci) => (
            <div key={ci}>
              {ci > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "2rem 0 1.5rem" }}>
                  <div style={{ flex: 1, height: "1px", background: "rgba(200,168,75,0.15)" }} />
                  <div style={{ fontSize: "0.52rem", color: "rgba(200,168,75,0.4)", letterSpacing: "3px", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                    Chapter {ci + 1}
                  </div>
                  <div style={{ flex: 1, height: "1px", background: "rgba(200,168,75,0.15)" }} />
                </div>
              )}
              {displayParagraphs(chapter).map((p, i) => (
                <p key={i} style={{ margin: "0 0 1.2em", textIndent: "1.5em" }}>{p}</p>
              ))}
            </div>
          ))}

          {/* Streaming text for current in-progress chapter */}
          {streamingText && (
            <div>
              {chapters.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "2rem 0 1.5rem" }}>
                  <div style={{ flex: 1, height: "1px", background: "rgba(200,168,75,0.15)" }} />
                  <div style={{ fontSize: "0.52rem", color: "rgba(200,168,75,0.4)", letterSpacing: "3px", fontFamily: "'Montserrat', sans-serif", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                    Chapter {chapters.length + 1}
                  </div>
                  <div style={{ flex: 1, height: "1px", background: "rgba(200,168,75,0.15)" }} />
                </div>
              )}
              {displayParagraphs(streamingText).map((p, i) => (
                <p key={i} style={{ margin: "0 0 1.2em", textIndent: "1.5em" }}>{p}</p>
              ))}
              <span style={{ display: "inline-block", width: "2px", height: "1.1em", background: "rgba(200,168,75,0.7)", verticalAlign: "middle", animation: "pulseDot 1s ease-in-out infinite", marginLeft: "2px" }} />
            </div>
          )}
        </div>

        <div ref={bottomRef} />
      </div>

      {/* Action bar */}
      {fullStory && (
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
            {alreadySaved && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", background: "rgba(0,180,80,0.08)", border: "1px solid rgba(0,180,80,0.2)", borderRadius: "8px", fontSize: "0.65rem", color: "rgba(0,200,80,0.7)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1px" }}>
                ✓ Saved to Chronicle
              </div>
            )}
            {!savedId ? (
              <button onClick={saveToMainArchive} style={{ padding: "0.6rem 1.5rem", background: "rgba(200,168,75,0.1)", border: "1px solid rgba(200,168,75,0.3)", borderRadius: "8px", color: "rgba(200,168,75,0.8)", fontFamily: "'Cinzel', serif", fontSize: "0.72rem", cursor: "pointer", letterSpacing: "1.5px", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(200,168,75,0.18)"; e.currentTarget.style.borderColor = "rgba(200,168,75,0.6)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(200,168,75,0.1)"; e.currentTarget.style.borderColor = "rgba(200,168,75,0.3)"; }}>
                ◈ Save to Archive
              </button>
            ) : (
              <div style={{ padding: "0.5rem 1rem", background: "rgba(0,100,200,0.08)", border: "1px solid rgba(0,100,200,0.2)", borderRadius: "8px", fontSize: "0.65rem", color: "rgba(100,180,255,0.7)", fontFamily: "'Montserrat', sans-serif" }}>
                ✓ Saved to Archive
              </div>
            )}
            <button onClick={() => setShowCinematic(true)} style={{ padding: "0.6rem 1.1rem", background: "rgba(200,168,75,0.08)", border: "1px solid rgba(200,168,75,0.25)", borderRadius: "8px", color: "rgba(200,168,75,0.7)", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", cursor: "pointer", letterSpacing: "1px", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(200,168,75,0.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(200,168,75,0.08)"; }}>
              📖 Cinematic
            </button>
            <button onClick={generateCoverArt} disabled={generatingCover} style={{ padding: "0.6rem 1.1rem", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.25)", borderRadius: "8px", color: generatingCover ? "rgba(168,85,247,0.35)" : "rgba(168,85,247,0.7)", fontFamily: "'Cinzel', serif", fontSize: "0.65rem", cursor: generatingCover ? "not-allowed" : "pointer", letterSpacing: "1px", transition: "all 0.2s" }}>
              {generatingCover ? "🎨 Generating…" : "🎨 Cover Art"}
            </button>
            <button onClick={() => { setShowIntro(true); setPendingRegenerate(true); }} disabled={isBusy} style={{ padding: "0.6rem 1.25rem", background: "rgba(100,0,200,0.08)", border: "1px solid rgba(100,0,200,0.2)", borderRadius: "8px", color: isBusy ? "rgba(200,200,220,0.2)" : "rgba(150,100,255,0.7)", fontFamily: "'Cinzel', serif", fontSize: "0.72rem", cursor: isBusy ? "not-allowed" : "pointer", letterSpacing: "1px", transition: "all 0.2s" }}>
              ⚡ Regenerate
            </button>
          </div>

          {/* Live Choices toggle */}
          <label style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}>
            <div onClick={() => setLiveChoices(!liveChoices)} style={{ width: "30px", height: "16px", borderRadius: "8px", background: liveChoices ? "rgba(200,168,75,0.4)" : "rgba(255,255,255,0.08)", border: `1px solid ${liveChoices ? "rgba(200,168,75,0.6)" : "rgba(255,255,255,0.1)"}`, position: "relative", transition: "all 0.2s", cursor: "pointer" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: liveChoices ? "#C8A830" : "rgba(200,200,220,0.3)", position: "absolute", top: "1px", left: liveChoices ? "15px" : "1px", transition: "all 0.2s" }} />
            </div>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.52rem", color: "rgba(200,195,220,0.55)", letterSpacing: "1px" }}>Live Choice Prompts</span>
            <span style={{ fontFamily: "'Raleway', sans-serif", fontSize: "0.42rem", color: "rgba(200,195,220,0.3)" }}>— AI offers 3 branches after each chapter</span>
          </label>

          {/* Cover image */}
          {coverImage && (
            <div style={{ marginTop: "1rem" }}>
              <img src={`data:image/jpeg;base64,${coverImage}`} alt="Story cover" style={{ maxWidth: "220px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", display: "block" }} />
            </div>
          )}
        </div>
      )}

      {/* Branch choices */}
      {choices && !isBusy && (
        <StoryChoices
          choices={choices}
          loading={loadingChoices}
          heroineColor={heroine.color}
          onChoose={(c) => continueWithChoice(c.label, c.description)}
          onSkip={() => { setChoices(null); }}
        />
      )}
      {loadingChoices && (
        <div style={{ textAlign: "center", padding: "1.5rem", fontFamily: "'Cinzel', serif", fontSize: "0.52rem", letterSpacing: "4px", color: "rgba(200,168,75,0.4)", animation: "pulse 1.2s infinite" }}>
          Generating choices…
        </div>
      )}

      {/* Continue Story section */}
      {fullStory && !isBusy && (
        <div style={{ background: "rgba(8,4,20,0.6)", border: "1px solid rgba(200,168,75,0.15)", borderRadius: "12px", padding: "1.5rem", marginBottom: "2rem" }}>
          <div style={{ fontSize: "0.52rem", color: "rgba(200,168,75,0.5)", letterSpacing: "3px", textTransform: "uppercase", fontFamily: "'Montserrat', sans-serif", marginBottom: "1rem", fontWeight: 700 }}>
            ◈ Continue the Story — Chapter {chapters.length + 1}
          </div>

          <textarea
            value={continueDir}
            onChange={(e) => setContinueDir(e.target.value)}
            placeholder={`Optional: steer the next chapter… "She attempts escape," "The villain escalates," "She breaks," "Introduce a new threat," or leave blank to let it escalate naturally.`}
            rows={3}
            style={{
              width: "100%",
              background: "rgba(0,0,0,0.5)",
              border: "1px solid rgba(200,168,75,0.2)",
              borderRadius: "8px",
              padding: "0.875rem 1rem",
              color: "#E8E8F5",
              fontFamily: "'Raleway', sans-serif",
              fontSize: "0.875rem",
              lineHeight: 1.6,
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
              marginBottom: "1rem",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(200,168,75,0.5)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(200,168,75,0.2)")}
          />

          <button
            onClick={continueStory}
            disabled={isBusy}
            style={{
              padding: "0.75rem 2rem",
              background: "linear-gradient(135deg, rgba(200,168,75,0.85), rgba(160,120,40,0.85))",
              border: "none",
              borderRadius: "10px",
              color: "#0a0808",
              fontFamily: "'Cinzel', serif",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
              cursor: isBusy ? "not-allowed" : "pointer",
              opacity: isBusy ? 0.5 : 1,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { if (!isBusy) e.currentTarget.style.filter = "brightness(1.15)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = ""; }}
          >
            {continuing ? "Writing..." : `Continue → Chapter ${chapters.length + 1}`}
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
