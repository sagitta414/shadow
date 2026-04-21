import { useState, useRef } from "react";
import { saveStoryToArchive, updateArchiveStory } from "../lib/archive";
import { buildVoiceInjection } from "../lib/villainVoices";
import StoryReader from "../components/StoryReader";

interface Props { onBack: () => void; }

interface SeasonConfig {
  arcName: string;
  villain: string;
  heroines: string[];
  premise: string;
  tone: string;
  universe: string;
}

const CW_HEROINES = [
  "Sara Lance", "Laurel Lance", "Thea Queen", "Nyssa al Ghul", "Dinah Drake",
  "Felicity Smoak", "Iris West-Allen", "Caitlin Snow", "Jesse Quick",
  "Nora West-Allen", "Kendra Saunders", "Alex Danvers", "Zari Tarazi",
];
const CW_VILLAINS = [
  "Ra's al Ghul", "Malcolm Merlyn", "Prometheus", "Deathstroke",
  "Damien Darhk", "Zoom", "Clifford DeVoe (The Thinker)", "Savitar",
  "Cicada", "Vandal Savage", "Lex Luthor", "Reign", "Dark Arrow",
  "Dr. Deegan", "Neron", "Anti-Monitor",
];
const ARC_TONES = [
  { id: "dark-psychological", label: "DARK PSYCHOLOGICAL", desc: "Slow burn, mind games, identity erosion — maximum psychological depth" },
  { id: "explicit-dominant", label: "EXPLICIT DOMINANT", desc: "Graphic, intense, dominant/submissive dynamic throughout the season arc" },
  { id: "horror-kinky", label: "HORROR & KINKY", desc: "Horror escalation with explicit dark fetish content — the arc gets worse every chapter" },
];

function streamRequest(endpoint: string, body: object, onChunk: (c: string) => void, signal: AbortSignal): Promise<string> {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
  return fetch(`${base}${endpoint}`, {
    method: "POST", signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then(async r => {
    if (!r.ok) throw new Error(`${r.status}`);
    const reader = r.body!.getReader();
    const dec = new TextDecoder();
    let full = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = dec.decode(value, { stream: true });
      full += chunk; onChunk(full);
    }
    return full;
  });
}
function isAbort(e: unknown) { return e instanceof Error && e.name === "AbortError"; }

export default function SeasonArcMode({ onBack }: Props) {
  const [step, setStep] = useState<"setup" | "arc">("setup");
  const [config, setConfig] = useState<SeasonConfig>({
    arcName: "",
    villain: CW_VILLAINS[0],
    heroines: [CW_HEROINES[0]],
    premise: "",
    tone: "dark-psychological",
    universe: "CW Arrowverse",
  });
  const [chapters, setChapters] = useState<string[]>([]);
  const [cliffhangers, setCliffhangers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState("");
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [readingMode, setReadingMode] = useState(false);
  const [activeChapter, setActiveChapter] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  function toggleHeroine(h: string) {
    setConfig(c => ({
      ...c,
      heroines: c.heroines.includes(h)
        ? c.heroines.filter(x => x !== h)
        : [...c.heroines, h].slice(0, 3),
    }));
  }

  async function generateChapter() {
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true); setStreaming(""); setError("");
    const chapterNum = chapters.length + 1;
    const toneObj = ARC_TONES.find(t => t.id === config.tone)!;
    const voiceNote = buildVoiceInjection(config.villain);
    const heroineStr = config.heroines.join(", ");
    const prevCliffhanger = cliffhangers.length > 0 ? cliffhangers[cliffhangers.length - 1] : "";
    const prevSummary = chapters.length > 0
      ? `\n\nPREVIOUS CHAPTER SUMMARY:\n${chapters[chapters.length - 1].slice(0, 600)}…\n\nCLIFFHANGER INTO THIS CHAPTER:\n${prevCliffhanger}`
      : "";

    const chapterDirective = chapterNum === 1
      ? `This is CHAPTER 1 — the opening of the season arc. Establish the threat, establish the villain's plan, and put the heroines in danger. End with a cliffhanger that will carry into Chapter 2. The cliffhanger should be visceral — a caught breath, a door closing, a line crossed.`
      : `This is CHAPTER ${chapterNum}. The arc continues from where we left off. ESCALATE — what has happened already was just the beginning. Go deeper, darker, more explicit, more personal. End with a new cliffhanger that opens into Chapter ${chapterNum + 1}.`;

    try {
      const full = await streamRequest("/api/story/superhero", {
        hero: heroineStr,
        villain: config.villain,
        setting: `Season arc: "${config.arcName}" — ${config.universe}`,
        stakes: config.premise,
        tone: toneObj.label,
        captureMethod: chapterNum === 1 ? "Established in Chapter 1" : "Continued from previous chapter",
        restraints: "Determined by the villain and the arc's established dynamic",
        intensity: config.tone === "dark-psychological" ? "Tense — psychological, deeply character-driven" : "Explicit — graphic, kinky, fully explicit, maximum depravity",
        storyLength: "Epic Saga",
        details: `SEASON ARC: "${config.arcName}"\nSEASON PREMISE: ${config.premise}\nHEROINES: ${heroineStr}\nVILLAIN: ${config.villain}\nTONE DIRECTIVE: ${toneObj.desc}${prevSummary}\n\n${chapterDirective}${voiceNote}\n\nWrite with authentic CW Arrowverse voice — dark, character-driven, grounded. Each heroine has a distinct voice. The villain should feel like a genuine season-long threat.`,
      }, (c) => setStreaming(c), ctrl.signal);

      // extract cliffhanger from end of chapter
      const sentences = full.split(/(?<=[.!?])\s+/);
      const cliffhanger = sentences.slice(-3).join(" ").trim();

      const newChapters = [...chapters, full];
      const newCliffhangers = [...cliffhangers, cliffhanger];
      setChapters(newChapters);
      setCliffhangers(newCliffhangers);
      setActiveChapter(newChapters.length - 1);

      if (savedId) {
        updateArchiveStory(savedId, {
          chapters: newChapters,
          wordCount: newChapters.join(" ").split(/\s+/).filter(Boolean).length,
        });
      } else {
        const id = saveStoryToArchive({
          title: `[SEASON ARC] ${config.arcName}`,
          universe: config.universe,
          tool: "Season Arc Mode",
          characters: [config.heroines[0], config.villain, ...config.heroines.slice(1)],
          chapters: newChapters,
        });
        setSavedId(id);
      }
    } catch (e) {
      if (isAbort(e)) { if (streaming.trim()) { const newChapters = [...chapters, streaming]; setChapters(newChapters); setActiveChapter(newChapters.length - 1); } }
      else setError(e instanceof Error ? e.message : "Generation failed");
    } finally { setLoading(false); setStreaming(""); abortRef.current = null; }
  }

  if (step === "arc") {
    const toneObj = ARC_TONES.find(t => t.id === config.tone)!;
    const accentColor = "#A855F7";
    const fakeStory = savedId ? {
      id: savedId,
      title: `[SEASON ARC] ${config.arcName}`,
      createdAt: Date.now(),
      universe: config.universe,
      tool: "Season Arc Mode",
      characters: [config.heroines[0], config.villain, ...config.heroines.slice(1)],
      chapters,
      tags: [],
      favourite: false,
      wordCount: chapters.join(" ").split(/\s+/).filter(Boolean).length,
    } : null;

    return (
      <div style={{ minHeight: "100vh" }}>
        <style>{`@keyframes saPulse{0%,100%{opacity:.4}50%{opacity:1}}`}</style>
        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "28px 24px" }}>
          {/* Header */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "24px", flexWrap: "wrap" }}>
            <button onClick={onBack} style={{ background: "transparent", border: "1px solid #333", color: "#666", borderRadius: "8px", padding: "8px 14px", cursor: "pointer", fontSize: "12px" }}>←</button>
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "3px", color: accentColor, marginBottom: "2px" }}>SEASON ARC</div>
              <div style={{ fontSize: "18px", fontWeight: 900, color: "#ddd", letterSpacing: "2px" }}>{config.arcName || "UNTITLED ARC"}</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <div style={{ fontSize: "11px", color: "#555", background: "#111", border: "1px solid #222", borderRadius: "4px", padding: "4px 10px" }}>{config.villain}</div>
              <div style={{ fontSize: "11px", color: "#555", background: "#111", border: "1px solid #222", borderRadius: "4px", padding: "4px 10px" }}>{config.heroines.join(" · ")}</div>
              <div style={{ fontSize: "11px", color: "#444", background: `${accentColor}11`, border: `1px solid ${accentColor}33`, borderRadius: "4px", padding: "4px 10px", color: accentColor }}>{toneObj.label}</div>
            </div>
          </div>

          {/* Chapter navigator */}
          {chapters.length > 0 && (
            <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
              {chapters.map((_, i) => (
                <button key={i} onClick={() => setActiveChapter(i)}
                  style={{ background: activeChapter === i ? `${accentColor}18` : "#0a0a12", border: `1px solid ${activeChapter === i ? accentColor : "#222"}`, color: activeChapter === i ? accentColor : "#555", borderRadius: "6px", padding: "6px 14px", cursor: "pointer", fontWeight: 700, fontSize: "11px", letterSpacing: "1px" }}>
                  Ch {i + 1}
                </button>
              ))}
            </div>
          )}

          {/* Chapter display */}
          {chapters.length > 0 && chapters[activeChapter] && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "3px", color: accentColor, marginBottom: "12px", fontWeight: 700 }}>CHAPTER {activeChapter + 1}</div>
              <div style={{ background: "#0e0e18", border: `1px solid ${accentColor}22`, borderRadius: "8px", padding: "32px", lineHeight: 1.85, fontSize: "15px", color: "#ddd", whiteSpace: "pre-wrap", fontFamily: "Georgia, serif", maxHeight: "500px", overflowY: "auto" }}>
                {chapters[activeChapter]}
              </div>
              {cliffhangers[activeChapter] && (
                <div style={{ background: `linear-gradient(135deg, ${accentColor}11, #0a0a14)`, border: `1px solid ${accentColor}33`, borderRadius: "6px", padding: "14px 16px", marginTop: "12px" }}>
                  <div style={{ fontSize: "9px", letterSpacing: "3px", color: accentColor, marginBottom: "6px", fontWeight: 700 }}>CLIFFHANGER INTO CHAPTER {activeChapter + 2}</div>
                  <div style={{ fontSize: "12px", color: "#888", fontStyle: "italic", lineHeight: 1.6 }}>{cliffhangers[activeChapter]}</div>
                </div>
              )}
            </div>
          )}

          {/* Loading streaming view */}
          {loading && streaming && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "10px", letterSpacing: "3px", color: accentColor, marginBottom: "12px", fontWeight: 700, animation: "saPulse 1.5s ease-in-out infinite" }}>WRITING CHAPTER {chapters.length + 1}…</div>
              <div style={{ background: "#0a0a12", border: `1px solid ${accentColor}11`, borderRadius: "8px", padding: "24px", lineHeight: 1.85, fontSize: "14px", color: "#666", whiteSpace: "pre-wrap", fontFamily: "Georgia, serif" }}>
                {streaming}
              </div>
            </div>
          )}

          {error && <div style={{ color: "#f87171", background: "#1a0000", border: "1px solid #7f1d1d", borderRadius: "6px", padding: "12px", marginBottom: "16px" }}>{error}</div>}

          {/* Actions */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {!loading && (
              <button onClick={generateChapter}
                style={{ flex: 1, background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}33)`, border: `1px solid ${accentColor}55`, color: accentColor, borderRadius: "10px", padding: "16px", cursor: "pointer", fontWeight: 900, letterSpacing: "3px", fontSize: "14px" }}>
                {chapters.length === 0 ? "GENERATE CHAPTER 1" : `GENERATE CHAPTER ${chapters.length + 1}`}
              </button>
            )}
            {loading && (
              <button onClick={() => abortRef.current?.abort()}
                style={{ background: "#1a0000", border: "1px solid #7f1d1d", color: "#f87171", borderRadius: "10px", padding: "16px 24px", cursor: "pointer", fontWeight: 700 }}>STOP</button>
            )}
            {fakeStory && chapters.length > 0 && (
              <button onClick={() => setReadingMode(true)}
                style={{ background: "#0a0a14", border: `1px solid ${accentColor}44`, color: accentColor, borderRadius: "10px", padding: "16px 20px", cursor: "pointer", fontWeight: 700, letterSpacing: "1px", fontSize: "12px" }}>📖 READ</button>
            )}
            {chapters.length > 0 && (
              <div style={{ fontSize: "11px", color: "#444", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>{chapters.length} chapter{chapters.length > 1 ? "s" : ""}</span>
                <span style={{ color: "#333" }}>·</span>
                <span>{chapters.join(" ").split(/\s+/).filter(Boolean).length.toLocaleString()} words</span>
              </div>
            )}
          </div>
        </div>

        {readingMode && fakeStory && <StoryReader story={fakeStory} onClose={() => setReadingMode(false)} />}
      </div>
    );
  }

  // Setup view
  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "32px" }}>
          <button onClick={onBack} style={{ background: "transparent", border: "1px solid #333", color: "#666", borderRadius: "8px", padding: "10px 16px", cursor: "pointer", flexShrink: 0 }}>←</button>
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#555", marginBottom: "4px" }}>SHADOWWEAVE</div>
            <div style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "3px", color: "#ddd", marginBottom: "6px" }}>SEASON ARC</div>
            <div style={{ fontSize: "12px", color: "#555", lineHeight: 1.6 }}>Build a multi-chapter arc. Each chapter ends with a cliffhanger that seeds the next. The villain's grip deepens with every episode.</div>
          </div>
        </div>

        {/* Arc Name */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#555", marginBottom: "10px" }}>ARC NAME</div>
          <input
            value={config.arcName}
            onChange={e => setConfig(c => ({ ...c, arcName: e.target.value }))}
            placeholder="e.g. THE DEMON'S CROWN, FLASH POINT, THE LAST NIGHT"
            style={{ width: "100%", background: "#0a0a12", border: "1px solid #222", borderRadius: "8px", padding: "12px 14px", color: "#ccc", fontSize: "14px", fontWeight: 700, letterSpacing: "2px", boxSizing: "border-box", fontFamily: "inherit" }}
          />
        </div>

        {/* Villain */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#555", marginBottom: "12px" }}>SEASON VILLAIN</div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {CW_VILLAINS.map(v => (
              <button key={v} onClick={() => setConfig(c => ({ ...c, villain: v }))}
                style={{ background: config.villain === v ? "rgba(168,85,247,0.12)" : "#0e0e18", border: `1px solid ${config.villain === v ? "#A855F7" : "#222"}`, color: config.villain === v ? "#A855F7" : "#555", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontWeight: 700, fontSize: "11px", letterSpacing: "0.5px" }}>
                {v.split("(")[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* Heroines (up to 3) */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#555", marginBottom: "6px" }}>HEROINES <span style={{ color: "#333", fontWeight: 400 }}>(up to 3)</span></div>
          <div style={{ fontSize: "10px", color: "#444", marginBottom: "10px" }}>Selected: {config.heroines.join(" · ") || "—"}</div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {CW_HEROINES.map(h => {
              const sel = config.heroines.includes(h);
              return (
                <button key={h} onClick={() => toggleHeroine(h)}
                  style={{ background: sel ? "rgba(168,85,247,0.12)" : "#0e0e18", border: `1px solid ${sel ? "#A855F7" : "#222"}`, color: sel ? "#A855F7" : "#555", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontWeight: 700, fontSize: "11px" }}>
                  {h.split(" ")[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Premise */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#555", marginBottom: "10px" }}>SEASON PREMISE</div>
          <textarea
            value={config.premise}
            onChange={e => setConfig(c => ({ ...c, premise: e.target.value }))}
            placeholder="What is the villain's plan? What does this season arc build toward? What is at stake for the heroines?\n\ne.g. 'Ra's al Ghul has taken all three. He intends to break them — not as hostages but as trophies. Each chapter is a stage in the process.'"
            style={{ width: "100%", background: "#0a0a12", border: "1px solid #222", borderRadius: "8px", padding: "12px 14px", color: "#ccc", fontSize: "13px", lineHeight: 1.6, resize: "vertical", minHeight: "100px", fontFamily: "inherit", boxSizing: "border-box" }}
          />
        </div>

        {/* Tone */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#555", marginBottom: "12px" }}>ARC TONE</div>
          <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
            {ARC_TONES.map(t => (
              <button key={t.id} onClick={() => setConfig(c => ({ ...c, tone: t.id }))}
                style={{ background: config.tone === t.id ? "rgba(168,85,247,0.1)" : "#0a0a12", border: `1px solid ${config.tone === t.id ? "#A855F7" : "#1e1e2e"}`, borderRadius: "8px", padding: "12px 16px", cursor: "pointer", textAlign: "left" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: config.tone === t.id ? "#A855F7" : "#666", letterSpacing: "1.5px", marginBottom: "4px" }}>{t.label}</div>
                <div style={{ fontSize: "10px", color: "#444", lineHeight: 1.5 }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => { if (!config.arcName.trim() || !config.premise.trim() || config.heroines.length === 0) return; setStep("arc"); }}
          disabled={!config.arcName.trim() || !config.premise.trim() || config.heroines.length === 0}
          style={{ width: "100%", background: "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(168,85,247,0.3))", border: "1px solid rgba(168,85,247,0.55)", color: "#A855F7", borderRadius: "10px", padding: "18px", cursor: "pointer", fontWeight: 900, letterSpacing: "3px", fontSize: "14px", opacity: (!config.arcName.trim() || !config.premise.trim() || config.heroines.length === 0) ? 0.4 : 1 }}>
          BEGIN THE SEASON
        </button>
      </div>
    </div>
  );
}
