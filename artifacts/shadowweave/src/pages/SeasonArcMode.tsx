import { useState, useRef } from "react";
import { saveStoryToArchive, updateArchiveStory } from "../lib/archive";
import { buildVoiceInjection } from "../lib/villainVoices";
import StoryReader from "../components/StoryReader";
import { useIsMobile } from "../hooks/useIsMobile";

interface Props { onBack: () => void; }

interface SeasonConfig {
  arcName: string; villain: string; heroines: string[];
  premise: string; tone: string; universe: string;
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

const accent = "#A855F7";

export default function SeasonArcMode({ onBack }: Props) {
  const isMobile = useIsMobile(640);
  const [step, setStep] = useState<"setup" | "arc">("setup");
  const [config, setConfig] = useState<SeasonConfig>({
    arcName: "", villain: CW_VILLAINS[0], heroines: [CW_HEROINES[0]],
    premise: "", tone: "dark-psychological", universe: "CW Arrowverse",
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

  const px = isMobile ? "16px" : "24px";

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
      ? `This is CHAPTER 1 — the opening of the season arc. Establish the threat, establish the villain's plan, and put the heroines in danger. End with a cliffhanger that will carry into Chapter 2.`
      : `This is CHAPTER ${chapterNum}. The arc continues from where we left off. ESCALATE — what has happened already was just the beginning. Go deeper, darker, more explicit, more personal. End with a new cliffhanger that opens into Chapter ${chapterNum + 1}.`;

    try {
      const full = await streamRequest("/api/story/superhero", {
        hero: heroineStr, villain: config.villain,
        setting: `Season arc: "${config.arcName}" — ${config.universe}`,
        stakes: config.premise, tone: toneObj.label,
        captureMethod: chapterNum === 1 ? "Established in Chapter 1" : "Continued from previous chapter",
        restraints: "Determined by the villain and the arc's established dynamic",
        intensity: config.tone === "dark-psychological" ? "Tense — psychological, deeply character-driven" : "Explicit — graphic, kinky, fully explicit, maximum depravity",
        storyLength: "Epic Saga",
        details: `SEASON ARC: "${config.arcName}"\nSEASON PREMISE: ${config.premise}\nHEROINES: ${heroineStr}\nVILLAIN: ${config.villain}\nTONE DIRECTIVE: ${toneObj.desc}${prevSummary}\n\n${chapterDirective}${voiceNote}\n\nWrite with authentic CW Arrowverse voice — dark, character-driven, grounded. Each heroine has a distinct voice. The villain should feel like a genuine season-long threat.`,
      }, (c) => setStreaming(c), ctrl.signal);

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
      if (isAbort(e)) { if (streaming.trim()) { const nc = [...chapters, streaming]; setChapters(nc); setActiveChapter(nc.length - 1); } }
      else setError(e instanceof Error ? e.message : "Generation failed");
    } finally { setLoading(false); setStreaming(""); abortRef.current = null; }
  }

  /* ── ARC VIEW ── */
  if (step === "arc") {
    const toneObj = ARC_TONES.find(t => t.id === config.tone)!;
    const fakeStory = savedId ? {
      id: savedId, title: `[SEASON ARC] ${config.arcName}`,
      createdAt: Date.now(), universe: config.universe, tool: "Season Arc Mode",
      characters: [config.heroines[0], config.villain, ...config.heroines.slice(1)],
      chapters, tags: [], favourite: false,
      wordCount: chapters.join(" ").split(/\s+/).filter(Boolean).length,
    } : null;

    return (
      <div style={{ minHeight: "100vh" }}>
        <style>{`
          @keyframes saPulse{0%,100%{opacity:.4}50%{opacity:1}}
          .sa-btn{transition:all 0.15s;}.sa-btn:active{opacity:0.75;transform:scale(0.97);}
          .sa-ch-scroll::-webkit-scrollbar{height:3px;}.sa-ch-scroll::-webkit-scrollbar-thumb{background:rgba(168,85,247,0.3);border-radius:4px;}
          .sa-story-scroll::-webkit-scrollbar{width:3px;}.sa-story-scroll::-webkit-scrollbar-thumb{background:rgba(168,85,247,0.2);border-radius:4px;}
        `}</style>
        <div style={{ maxWidth: "960px", margin: "0 auto", padding: `20px ${px}` }}>

          {/* Header */}
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "20px" }}>
            <button className="sa-btn" onClick={onBack}
              style={{ background: "transparent", border: "1px solid #2a2a2a", color: "#555", borderRadius: "8px", padding: "8px 12px", cursor: "pointer", fontSize: "14px", flexShrink: 0, WebkitTapHighlightColor: "transparent" }}>
              ←
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "9px", letterSpacing: "3px", color: accent, marginBottom: "2px" }}>SEASON ARC</div>
              <div style={{ fontSize: isMobile ? "16px" : "18px", fontWeight: 900, color: "#ddd", letterSpacing: "1.5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{config.arcName || "UNTITLED ARC"}</div>
            </div>
          </div>

          {/* Arc meta pills */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "18px" }}>
            <div style={{ fontSize: "10px", color: "#555", background: "#111", border: "1px solid #222", borderRadius: "20px", padding: "4px 10px" }}>{config.villain.split("(")[0].trim()}</div>
            <div style={{ fontSize: "10px", color: "#555", background: "#111", border: "1px solid #222", borderRadius: "20px", padding: "4px 10px" }}>{config.heroines.map(h => h.split(" ")[0]).join(" · ")}</div>
            <div style={{ fontSize: "10px", color: accent, background: `${accent}11`, border: `1px solid ${accent}33`, borderRadius: "20px", padding: "4px 10px" }}>{toneObj.label}</div>
            {chapters.length > 0 && (
              <div style={{ fontSize: "10px", color: "#444", background: "transparent", borderRadius: "20px", padding: "4px 10px" }}>
                {chapters.join(" ").split(/\s+/).filter(Boolean).length.toLocaleString()} words
              </div>
            )}
          </div>

          {/* Chapter navigator */}
          {chapters.length > 0 && (
            <div className="sa-ch-scroll" style={{ display: "flex", gap: "6px", marginBottom: "16px", overflowX: "auto", paddingBottom: "4px" }}>
              {chapters.map((_, i) => (
                <button key={i} className="sa-btn" onClick={() => setActiveChapter(i)}
                  style={{ background: activeChapter === i ? `${accent}18` : "rgba(255,255,255,0.03)", border: `1px solid ${activeChapter === i ? accent : "#252525"}`, color: activeChapter === i ? accent : "#555", borderRadius: "6px", padding: "7px 14px", cursor: "pointer", fontWeight: 700, fontSize: "11px", letterSpacing: "1px", flexShrink: 0, WebkitTapHighlightColor: "transparent" }}>
                  Ch {i + 1}
                </button>
              ))}
            </div>
          )}

          {/* Chapter text */}
          {chapters.length > 0 && chapters[activeChapter] && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "9px", letterSpacing: "3px", color: accent, marginBottom: "10px", fontWeight: 700 }}>CHAPTER {activeChapter + 1}</div>
              <div className="sa-story-scroll" style={{
                background: "linear-gradient(180deg, #0e0e1c 0%, #09090f 100%)",
                border: `1px solid ${accent}22`,
                borderRadius: "10px",
                padding: isMobile ? "18px 16px" : "28px 32px",
                lineHeight: 1.9,
                fontSize: isMobile ? "14px" : "15px",
                color: "#d8d4e8",
                whiteSpace: "pre-wrap",
                fontFamily: "Georgia, 'Times New Roman', serif",
                maxHeight: isMobile ? "55vh" : "480px",
                overflowY: "auto",
              }}>
                {chapters[activeChapter]}
              </div>
              {cliffhangers[activeChapter] && (
                <div style={{ background: `linear-gradient(135deg, ${accent}0d, #0a0a14)`, border: `1px solid ${accent}33`, borderRadius: "8px", padding: "12px 14px", marginTop: "10px" }}>
                  <div style={{ fontSize: "8px", letterSpacing: "3px", color: accent, marginBottom: "5px", fontWeight: 700 }}>CLIFFHANGER → CHAPTER {activeChapter + 2}</div>
                  <div style={{ fontSize: "12px", color: "#777", fontStyle: "italic", lineHeight: 1.6 }}>{cliffhangers[activeChapter]}</div>
                </div>
              )}
            </div>
          )}

          {/* Streaming view */}
          {loading && streaming && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "9px", letterSpacing: "3px", color: accent, marginBottom: "10px", fontWeight: 700, animation: "saPulse 1.5s ease-in-out infinite" }}>
                WRITING CHAPTER {chapters.length + 1}…
              </div>
              <div style={{ background: "#09090e", border: `1px solid ${accent}11`, borderRadius: "8px", padding: isMobile ? "16px" : "24px", lineHeight: 1.85, fontSize: "14px", color: "#555", whiteSpace: "pre-wrap", fontFamily: "Georgia, serif", maxHeight: "50vh", overflowY: "auto" }}>
                {streaming}
              </div>
            </div>
          )}

          {error && <div style={{ color: "#f87171", background: "#1a0000", border: "1px solid #7f1d1d", borderRadius: "6px", padding: "12px", marginBottom: "16px", fontSize: "13px" }}>{error}</div>}

          {/* Action row */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
            {!loading && (
              <button className="sa-btn" onClick={generateChapter}
                style={{ flex: 1, minWidth: isMobile ? "100%" : "0", background: `linear-gradient(135deg, ${accent}1a, ${accent}28)`, border: `1px solid ${accent}55`, color: accent, borderRadius: "10px", padding: isMobile ? "14px" : "15px", cursor: "pointer", fontWeight: 900, letterSpacing: "2px", fontSize: isMobile ? "13px" : "14px", WebkitTapHighlightColor: "transparent" }}>
                {chapters.length === 0 ? "GENERATE CHAPTER 1" : `GENERATE CHAPTER ${chapters.length + 1}`}
              </button>
            )}
            {loading && (
              <button className="sa-btn" onClick={() => abortRef.current?.abort()}
                style={{ background: "#1a0000", border: "1px solid #7f1d1d", color: "#f87171", borderRadius: "10px", padding: "14px 20px", cursor: "pointer", fontWeight: 700, fontSize: "12px", WebkitTapHighlightColor: "transparent" }}>
                STOP
              </button>
            )}
            {fakeStory && chapters.length > 0 && (
              <button className="sa-btn" onClick={() => setReadingMode(true)}
                style={{ background: `${accent}14`, border: `1px solid ${accent}44`, color: accent, borderRadius: "10px", padding: "14px 18px", cursor: "pointer", fontWeight: 700, letterSpacing: "1px", fontSize: "12px", WebkitTapHighlightColor: "transparent" }}>
                📖 READ
              </button>
            )}
          </div>
        </div>

        {readingMode && fakeStory && <StoryReader story={fakeStory} onClose={() => setReadingMode(false)} />}
      </div>
    );
  }

  /* ── SETUP VIEW ── */
  const canBegin = config.arcName.trim() && config.premise.trim() && config.heroines.length > 0;
  return (
    <div style={{ minHeight: "100vh" }}>
      <style>{`.sa-btn{transition:all 0.15s;}.sa-btn:active{opacity:0.75;transform:scale(0.97);}`}</style>
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: `20px ${px} 40px` }}>

        {/* Header */}
        <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "28px" }}>
          <button className="sa-btn" onClick={onBack}
            style={{ background: "transparent", border: "1px solid #2a2a2a", color: "#555", borderRadius: "8px", padding: "10px 14px", cursor: "pointer", fontSize: "14px", flexShrink: 0, WebkitTapHighlightColor: "transparent" }}>
            ←
          </button>
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "4px", color: "#555", marginBottom: "4px" }}>SHADOWWEAVE</div>
            <div style={{ fontSize: isMobile ? "18px" : "22px", fontWeight: 900, letterSpacing: "2px", color: "#ddd", marginBottom: "6px" }}>SEASON ARC</div>
            <div style={{ fontSize: "12px", color: "#555", lineHeight: 1.6 }}>Build a multi-chapter arc. Each chapter ends with a cliffhanger that seeds the next.</div>
          </div>
        </div>

        {/* Arc Name */}
        <div style={{ marginBottom: "22px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#555", marginBottom: "8px" }}>ARC NAME</div>
          <input
            value={config.arcName}
            onChange={e => setConfig(c => ({ ...c, arcName: e.target.value }))}
            placeholder="e.g. THE DEMON'S CROWN, FLASH POINT, THE LAST NIGHT"
            style={{ width: "100%", background: "#0a0a12", border: "1px solid #222", borderRadius: "8px", padding: "12px 14px", color: "#ccc", fontSize: isMobile ? "13px" : "14px", fontWeight: 700, letterSpacing: "1.5px", boxSizing: "border-box", fontFamily: "inherit" }}
          />
        </div>

        {/* Villain */}
        <div style={{ marginBottom: "22px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#555", marginBottom: "10px" }}>SEASON VILLAIN</div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {CW_VILLAINS.map(v => (
              <button key={v} className="sa-btn" onClick={() => setConfig(c => ({ ...c, villain: v }))}
                style={{ background: config.villain === v ? `${accent}14` : "rgba(255,255,255,0.03)", border: `1px solid ${config.villain === v ? accent : "#252525"}`, color: config.villain === v ? accent : "#555", borderRadius: "20px", padding: isMobile ? "5px 10px" : "6px 12px", cursor: "pointer", fontWeight: 700, fontSize: isMobile ? "10px" : "11px", WebkitTapHighlightColor: "transparent" }}>
                {v.split("(")[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* Heroines */}
        <div style={{ marginBottom: "22px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "8px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#555" }}>HEROINES</div>
            <div style={{ fontSize: "10px", color: "#333" }}>up to 3 · {config.heroines.map(h => h.split(" ")[0]).join(", ") || "none selected"}</div>
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {CW_HEROINES.map(h => {
              const sel = config.heroines.includes(h);
              return (
                <button key={h} className="sa-btn" onClick={() => toggleHeroine(h)}
                  style={{ background: sel ? `${accent}14` : "rgba(255,255,255,0.03)", border: `1px solid ${sel ? accent : "#252525"}`, color: sel ? accent : "#555", borderRadius: "20px", padding: isMobile ? "5px 10px" : "6px 12px", cursor: "pointer", fontWeight: 700, fontSize: isMobile ? "10px" : "11px", WebkitTapHighlightColor: "transparent" }}>
                  {h.split(" ")[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Premise */}
        <div style={{ marginBottom: "22px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#555", marginBottom: "8px" }}>SEASON PREMISE</div>
          <textarea
            value={config.premise}
            onChange={e => setConfig(c => ({ ...c, premise: e.target.value }))}
            placeholder={"What is the villain's plan? What does this season arc build toward?\n\ne.g. \"Ra's al Ghul has taken all three. He intends to break them — not as hostages but as trophies. Each chapter is a stage in the process.\""}
            style={{ width: "100%", background: "#0a0a12", border: "1px solid #222", borderRadius: "8px", padding: "12px 14px", color: "#ccc", fontSize: "13px", lineHeight: 1.6, resize: "vertical", minHeight: isMobile ? "90px" : "110px", fontFamily: "inherit", boxSizing: "border-box" }}
          />
        </div>

        {/* Arc Tone */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#555", marginBottom: "10px" }}>ARC TONE</div>
          <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
            {ARC_TONES.map(t => (
              <button key={t.id} className="sa-btn" onClick={() => setConfig(c => ({ ...c, tone: t.id }))}
                style={{ background: config.tone === t.id ? `${accent}0d` : "rgba(255,255,255,0.02)", border: `1px solid ${config.tone === t.id ? accent : "#1e1e2a"}`, borderRadius: "8px", padding: "12px 14px", cursor: "pointer", textAlign: "left", WebkitTapHighlightColor: "transparent" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: config.tone === t.id ? accent : "#555", letterSpacing: "1.5px", marginBottom: "3px" }}>{t.label}</div>
                <div style={{ fontSize: "10px", color: "#444", lineHeight: 1.5 }}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button className="sa-btn"
          onClick={() => { if (!canBegin) return; setStep("arc"); }}
          disabled={!canBegin}
          style={{ width: "100%", background: canBegin ? `linear-gradient(135deg, ${accent}1a, ${accent}2a)` : "rgba(255,255,255,0.02)", border: `1px solid ${canBegin ? accent + "55" : "#1e1e1e"}`, color: canBegin ? accent : "#333", borderRadius: "10px", padding: "16px", cursor: canBegin ? "pointer" : "not-allowed", fontWeight: 900, letterSpacing: "3px", fontSize: isMobile ? "13px" : "14px", transition: "all 0.2s", WebkitTapHighlightColor: "transparent" }}>
          BEGIN THE SEASON
        </button>
      </div>
    </div>
  );
}
