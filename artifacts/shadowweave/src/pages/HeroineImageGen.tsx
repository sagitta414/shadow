import { useState, useRef } from "react";
import { getArchive } from "../lib/archive";
import { useIsMobile } from "../hooks/useIsMobile";

interface Props { onBack: () => void; }

interface GeneratedImage {
  id: string;
  imageBase64: string;
  prompt: string;
  enhancedPrompt: string;
  heroine: string;
  shotType: string;
  timestamp: number;
}

const QUICK_HEROINES = [
  "Black Widow", "Captain Marvel", "Wonder Woman", "Supergirl", "Jean Grey",
  "Scarlet Witch", "Storm", "Rogue", "Psylocke", "Emma Frost",
  "Batgirl / Oracle", "Catwoman", "Starfire", "Raven", "Power Girl",
  "Starlight", "Queen Maeve", "Kimiko", "Sara Lance", "Black Canary",
  "Tifa Lockhart", "Aerith Gainsborough", "Lara Croft", "Jill Valentine",
  "2B (NieR)", "Bayonetta", "Samus Aran", "Aloy", "Ciri", "Widowmaker",
  "Commander Shepard", "Lady Dimitrescu", "Cassie Cage", "Ada Wong",
  "Furiosa", "Trinity", "Beatrix Kiddo", "Selene", "Katniss Everdeen",
  "Buffy Summers", "Arya Stark", "Daenerys Targaryen", "Xena",
  "Ellen Ripley", "Sarah Connor", "Sydney Bristow", "Sarah Walker",
];

const SHOT_TYPES = [
  { id: "portrait",   label: "Portrait",    desc: "Face & shoulders — character focus",       w: 512,  h: 768  },
  { id: "full_body",  label: "Full Body",   desc: "Complete figure — action & costume",       w: 512,  h: 768  },
  { id: "scene",      label: "Scene",        desc: "Widescreen — environment & action",        w: 768,  h: 512  },
  { id: "cinematic",  label: "Cinematic",   desc: "Ultra-wide — dramatic cinematography",     w: 896,  h: 512  },
  { id: "intimate",   label: "Intimate",    desc: "Close-up — emotion & tension",             w: 512,  h: 512  },
  { id: "vertical",   label: "Story",       desc: "Tall portrait — poster / cover art",       w: 512,  h: 896  },
];

const MOODS = [
  { id: "dark_atmospheric", label: "Dark & Atmospheric",  accent: "#6B21A8" },
  { id: "action",           label: "High-Octane Action",   accent: "#DC2626" },
  { id: "psychological",    label: "Psychological",         accent: "#0891B2" },
  { id: "seductive",        label: "Seductive",             accent: "#BE185D" },
  { id: "horror",           label: "Horror",                accent: "#166534" },
  { id: "noir",             label: "Noir",                  accent: "#374151" },
  { id: "fantasy",          label: "Dark Fantasy",          accent: "#7C3AED" },
  { id: "sci_fi",           label: "Sci-Fi",                accent: "#0E7490" },
];

const STYLES = [
  { id: "photorealistic", label: "Photorealistic",   desc: "Hyper-detailed film photography" },
  { id: "cinematic_film", label: "Cinematic Film",   desc: "Movie still — dramatic lighting" },
  { id: "concept_art",    label: "Concept Art",      desc: "Professional illustration" },
  { id: "oil_painting",   label: "Oil Painting",     desc: "Classical painted artwork" },
  { id: "comic_book",     label: "Comic Book",        desc: "Graphic novel panel style" },
];

export default function HeroineImageGen({ onBack }: Props) {
  const isMobile = useIsMobile();
  const [heroine, setHeroine] = useState("");
  const [customHeroine, setCustomHeroine] = useState("");
  const [sceneDescription, setSceneDescription] = useState("");
  const [shotType, setShotType] = useState("portrait");
  const [mood, setMood] = useState("dark_atmospheric");
  const [style, setStyle] = useState("photorealistic");
  const [extraDetail, setExtraDetail] = useState("");
  const [useArchive, setUseArchive] = useState(false);
  const [selectedStory, setSelectedStory] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState<GeneratedImage[]>([]);
  const [activeImg, setActiveImg] = useState<GeneratedImage | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const downloadRef = useRef<HTMLAnchorElement>(null);

  const archive = getArchive();
  const heroineLabel = heroine || customHeroine.trim();
  const shotObj = SHOT_TYPES.find(s => s.id === shotType)!;
  const moodObj = MOODS.find(m => m.id === mood)!;
  const canGenerate = heroineLabel && sceneDescription.trim();

  function getArchiveContext(): string {
    if (!useArchive || !selectedStory) return "";
    const story = archive.find(s => s.id === selectedStory);
    if (!story) return "";
    const text = story.chapters.join(" ").slice(0, 800);
    return `\n\nSTORY CONTEXT (from archive: "${story.title}"):\n${text}`;
  }

  async function generate() {
    if (!canGenerate || generating) return;
    setGenerating(true);
    setError("");
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
      const resp = await fetch(`${base}/api/story/generate-scene-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroine: heroineLabel,
          sceneDescription: sceneDescription.trim() + getArchiveContext(),
          shotType,
          shotLabel: shotObj.label,
          mood: moodObj.label,
          style,
          styleLabel: STYLES.find(s => s.id === style)?.label ?? style,
          extraDetail: extraDetail.trim() || undefined,
          width: shotObj.w,
          height: shotObj.h,
        }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: `HTTP ${resp.status}` }));
        throw new Error(err.error || `HTTP ${resp.status}`);
      }
      const data = await resp.json();
      const img: GeneratedImage = {
        id: Date.now().toString(36),
        imageBase64: data.imageBase64,
        prompt: sceneDescription.trim(),
        enhancedPrompt: data.enhancedPrompt,
        heroine: heroineLabel,
        shotType: shotObj.label,
        timestamp: Date.now(),
      };
      setGenerated(prev => [img, ...prev]);
      setActiveImg(img);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  function download(img: GeneratedImage) {
    const a = downloadRef.current!;
    a.href = `data:image/png;base64,${img.imageBase64}`;
    a.download = `shadowweave-${img.heroine.toLowerCase().replace(/\s+/g, "-")}-${img.id}.png`;
    a.click();
  }

  const ACCENT = "#C084FC";

  return (
    <div style={{ maxWidth: isMobile ? "100%" : "1100px", margin: "0 auto", padding: isMobile ? "0.75rem" : "2rem 1rem" }}>
      <a ref={downloadRef} style={{ display: "none" }} />

      <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(200,200,220,0.4)", cursor: "pointer", fontFamily: "'Montserrat', sans-serif", fontSize: "0.75rem", letterSpacing: "1.5px", marginBottom: "1.5rem", padding: 0 }}>← Back</button>

      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.6rem", color: "rgba(192,132,252,0.5)", letterSpacing: "4px", fontFamily: "'Montserrat', sans-serif", marginBottom: "0.5rem" }}>STUDIO TOOL</div>
        <h1 className="font-cinzel" style={{ fontSize: isMobile ? "1.4rem" : "1.9rem", color: ACCENT, fontWeight: 900, letterSpacing: "4px", textTransform: "uppercase", marginBottom: "0.5rem" }}>Heroine Image Generator</h1>
        <p style={{ fontSize: "0.82rem", color: "rgba(200,200,220,0.45)", fontFamily: "'Montserrat', sans-serif", maxWidth: "560px", margin: "0 auto" }}>
          Describe any scene. The AI writes the perfect prompt — then Venice AI renders it uncensored.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "420px 1fr", gap: "1.25rem", alignItems: "start" }}>

        {/* ── LEFT PANEL — Controls ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Heroine */}
          <div style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(192,132,252,0.2)", borderRadius: "14px", padding: "1.1rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.6rem", color: ACCENT, letterSpacing: "2.5px", marginBottom: "0.85rem" }}>THE HEROINE</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginBottom: "0.7rem" }}>
              {QUICK_HEROINES.map(h => (
                <button key={h} onClick={() => { setHeroine(h); setCustomHeroine(""); }} style={{ padding: "0.25rem 0.6rem", background: heroine === h ? "rgba(192,132,252,0.2)" : "rgba(0,0,0,0.4)", border: `1px solid ${heroine === h ? "rgba(192,132,252,0.5)" : "rgba(255,255,255,0.07)"}`, borderRadius: "20px", color: heroine === h ? ACCENT : "rgba(200,200,220,0.4)", fontFamily: "'Raleway', sans-serif", fontSize: "0.65rem", cursor: "pointer", transition: "all 0.12s", whiteSpace: "nowrap" }}>{h}</button>
              ))}
            </div>
            <input value={customHeroine} onChange={e => { setCustomHeroine(e.target.value); setHeroine(""); }} placeholder="Or type any character…" style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(192,132,252,0.18)", borderRadius: "8px", padding: "0.6rem 0.9rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }} onFocus={e => e.currentTarget.style.borderColor = "rgba(192,132,252,0.5)"} onBlur={e => e.currentTarget.style.borderColor = "rgba(192,132,252,0.18)"} />
          </div>

          {/* Scene Description */}
          <div style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(192,132,252,0.2)", borderRadius: "14px", padding: "1.1rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.6rem", color: ACCENT, letterSpacing: "2.5px", marginBottom: "0.75rem" }}>SCENE DESCRIPTION</div>

            {archive.length > 0 && (
              <div style={{ marginBottom: "0.75rem" }}>
                <button onClick={() => setUseArchive(u => !u)} style={{ fontSize: "0.65rem", fontFamily: "'Montserrat', sans-serif", color: useArchive ? ACCENT : "rgba(200,200,220,0.35)", background: "none", border: "none", cursor: "pointer", padding: 0, letterSpacing: "1px" }}>
                  {useArchive ? "✓" : "○"} Import context from a saved story
                </button>
                {useArchive && (
                  <select value={selectedStory} onChange={e => setSelectedStory(e.target.value)} style={{ display: "block", width: "100%", marginTop: "0.5rem", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(192,132,252,0.25)", borderRadius: "8px", padding: "0.55rem 0.8rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.8rem", outline: "none" }}>
                    <option value="">— select a story —</option>
                    {archive.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                )}
              </div>
            )}

            <textarea value={sceneDescription} onChange={e => setSceneDescription(e.target.value)} placeholder="Describe the specific moment — her expression, what's happening, where she is, who else is present, how it feels…" rows={5} style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(192,132,252,0.18)", borderRadius: "8px", padding: "0.65rem 0.875rem", color: "#E8E8F5", fontFamily: "'EB Garamond', Georgia, serif", fontSize: "0.95rem", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.65 }} onFocus={e => e.currentTarget.style.borderColor = "rgba(192,132,252,0.45)"} onBlur={e => e.currentTarget.style.borderColor = "rgba(192,132,252,0.18)"} />
          </div>

          {/* Shot Type */}
          <div style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(192,132,252,0.15)", borderRadius: "14px", padding: "1.1rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.6rem", color: ACCENT, letterSpacing: "2.5px", marginBottom: "0.8rem" }}>SHOT TYPE</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.4rem" }}>
              {SHOT_TYPES.map(s => (
                <button key={s.id} onClick={() => setShotType(s.id)} style={{ background: shotType === s.id ? "rgba(192,132,252,0.15)" : "rgba(0,0,0,0.4)", border: `1px solid ${shotType === s.id ? "rgba(192,132,252,0.5)" : "rgba(255,255,255,0.06)"}`, borderRadius: "9px", padding: "0.55rem 0.4rem", cursor: "pointer", transition: "all 0.12s", textAlign: "center" }}>
                  <div className="font-cinzel" style={{ fontSize: "0.6rem", color: shotType === s.id ? ACCENT : "#E0E0F0", fontWeight: 700, marginBottom: "0.2rem" }}>{s.label}</div>
                  <div style={{ fontSize: "0.5rem", color: "rgba(200,200,220,0.3)", fontFamily: "'Montserrat', sans-serif", lineHeight: 1.3 }}>{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(192,132,252,0.15)", borderRadius: "14px", padding: "1.1rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.6rem", color: ACCENT, letterSpacing: "2.5px", marginBottom: "0.8rem" }}>MOOD</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {MOODS.map(m => (
                <button key={m.id} onClick={() => setMood(m.id)} style={{ padding: "0.35rem 0.75rem", background: mood === m.id ? `${m.accent}30` : "rgba(0,0,0,0.4)", border: `1px solid ${mood === m.id ? m.accent + "80" : "rgba(255,255,255,0.07)"}`, borderRadius: "20px", color: mood === m.id ? "#E8E8F5" : "rgba(200,200,220,0.4)", fontFamily: "'Raleway', sans-serif", fontSize: "0.68rem", cursor: "pointer", transition: "all 0.12s" }}>{m.label}</button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(192,132,252,0.15)", borderRadius: "14px", padding: "1.1rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.6rem", color: ACCENT, letterSpacing: "2.5px", marginBottom: "0.8rem" }}>RENDER STYLE</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {STYLES.map(s => (
                <button key={s.id} onClick={() => setStyle(s.id)} style={{ padding: "0.35rem 0.75rem", background: style === s.id ? "rgba(192,132,252,0.18)" : "rgba(0,0,0,0.4)", border: `1px solid ${style === s.id ? "rgba(192,132,252,0.5)" : "rgba(255,255,255,0.07)"}`, borderRadius: "20px", color: style === s.id ? ACCENT : "rgba(200,200,220,0.4)", fontFamily: "'Raleway', sans-serif", fontSize: "0.68rem", cursor: "pointer", transition: "all 0.12s" }}>{s.label}</button>
              ))}
            </div>
          </div>

          {/* Extra Detail */}
          <div style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "1rem" }}>
            <div className="font-cinzel" style={{ fontSize: "0.6rem", color: "rgba(200,200,220,0.35)", letterSpacing: "2.5px", marginBottom: "0.65rem" }}>EXTRA DETAIL (Optional)</div>
            <input value={extraDetail} onChange={e => setExtraDetail(e.target.value)} placeholder="Specific clothing, lighting, camera angle, color palette…" style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "0.55rem 0.85rem", color: "#E8E8F5", fontFamily: "'Raleway', sans-serif", fontSize: "0.82rem", outline: "none", boxSizing: "border-box" }} />
          </div>

          {/* Generate */}
          <button onClick={generate} disabled={!canGenerate || generating} style={{ padding: "1rem 2rem", borderRadius: "12px", cursor: canGenerate && !generating ? "pointer" : "not-allowed", fontSize: "0.85rem", fontFamily: "'Cinzel', serif", letterSpacing: "2.5px", fontWeight: 700, textTransform: "uppercase", transition: "all 0.2s", background: canGenerate && !generating ? "rgba(192,132,252,0.2)" : "rgba(255,255,255,0.04)", border: `2px solid ${canGenerate && !generating ? "rgba(192,132,252,0.6)" : "rgba(255,255,255,0.08)"}`, color: canGenerate && !generating ? ACCENT : "rgba(200,200,220,0.3)" }}>
            {generating ? "⟳  Generating…" : "✦  Generate Image"}
          </button>

          {error && (
            <div style={{ background: "rgba(200,60,60,0.1)", border: "1px solid rgba(200,60,60,0.3)", borderRadius: "10px", padding: "0.75rem 1rem", color: "#F87171", fontFamily: "'Montserrat', sans-serif", fontSize: "0.78rem" }}>
              ⚠ {error}
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL — Output ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Loading state */}
          {generating && (
            <div style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(192,132,252,0.2)", borderRadius: "14px", padding: "3rem 2rem", textAlign: "center", minHeight: "400px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
              <div style={{ fontSize: "2rem", animation: "spin 2s linear infinite" }}>✦</div>
              <div className="font-cinzel" style={{ color: ACCENT, fontSize: "0.75rem", letterSpacing: "3px" }}>GENERATING</div>
              <div style={{ fontSize: "0.72rem", color: "rgba(200,200,220,0.3)", fontFamily: "'Montserrat', sans-serif", maxWidth: "260px" }}>
                Writing the perfect prompt, then rendering with Venice AI…
              </div>
              <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
            </div>
          )}

          {/* Active Image */}
          {activeImg && !generating && (
            <div style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(192,132,252,0.2)", borderRadius: "14px", overflow: "hidden" }}>
              <img
                src={`data:image/png;base64,${activeImg.imageBase64}`}
                alt={activeImg.prompt}
                style={{ width: "100%", display: "block" }}
              />
              <div style={{ padding: "0.9rem 1rem", display: "flex", alignItems: "flex-start", gap: "0.75rem", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <span className="font-cinzel" style={{ fontSize: "0.65rem", color: ACCENT, letterSpacing: "2px" }}>{activeImg.heroine.toUpperCase()}</span>
                    <span style={{ fontSize: "0.6rem", color: "rgba(200,200,220,0.3)", fontFamily: "'Montserrat', sans-serif", marginLeft: "0.75rem" }}>{activeImg.shotType}</span>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => setShowPrompt(s => !s)} style={{ padding: "0.4rem 0.8rem", borderRadius: "7px", background: "rgba(192,132,252,0.08)", border: "1px solid rgba(192,132,252,0.25)", color: "rgba(192,132,252,0.7)", fontFamily: "'Cinzel', serif", fontSize: "0.62rem", letterSpacing: "1px", cursor: "pointer" }}>
                      {showPrompt ? "Hide Prompt" : "View Prompt"}
                    </button>
                    <button onClick={() => download(activeImg)} style={{ padding: "0.4rem 0.8rem", borderRadius: "7px", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", color: "#34D399", fontFamily: "'Cinzel', serif", fontSize: "0.62rem", letterSpacing: "1px", cursor: "pointer" }}>
                      ↓ Download
                    </button>
                  </div>
                </div>
                {showPrompt && (
                  <div style={{ width: "100%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "0.65rem 0.85rem" }}>
                    <div style={{ fontSize: "0.55rem", color: "rgba(192,132,252,0.5)", fontFamily: "'Cinzel', serif", letterSpacing: "1.5px", marginBottom: "0.4rem" }}>ENHANCED PROMPT</div>
                    <p style={{ fontSize: "0.72rem", color: "rgba(200,200,220,0.55)", fontFamily: "'Montserrat', sans-serif", lineHeight: 1.6, margin: 0 }}>{activeImg.enhancedPrompt}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!activeImg && !generating && (
            <div style={{ background: "rgba(0,0,0,0.3)", border: "1px dashed rgba(192,132,252,0.15)", borderRadius: "14px", padding: "4rem 2rem", textAlign: "center", minHeight: "360px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
              <div style={{ fontSize: "2.5rem", opacity: 0.25 }}>🎨</div>
              <div className="font-cinzel" style={{ color: "rgba(192,132,252,0.35)", fontSize: "0.7rem", letterSpacing: "3px" }}>YOUR IMAGE APPEARS HERE</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(200,200,220,0.2)", fontFamily: "'Montserrat', sans-serif", maxWidth: "240px" }}>
                Fill in the details on the left and click Generate
              </div>
            </div>
          )}

          {/* Generation history */}
          {generated.length > 1 && (
            <div style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "0.9rem" }}>
              <div className="font-cinzel" style={{ fontSize: "0.58rem", color: "rgba(200,200,220,0.3)", letterSpacing: "2px", marginBottom: "0.7rem" }}>SESSION HISTORY — {generated.length} IMAGES</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: "0.4rem" }}>
                {generated.map(img => (
                  <div key={img.id} onClick={() => setActiveImg(img)} style={{ borderRadius: "8px", overflow: "hidden", cursor: "pointer", border: `2px solid ${activeImg?.id === img.id ? "rgba(192,132,252,0.7)" : "transparent"}`, transition: "border-color 0.15s", position: "relative" }}>
                    <img src={`data:image/png;base64,${img.imageBase64}`} alt={img.heroine} style={{ width: "100%", display: "block", aspectRatio: "2/3", objectFit: "cover" }} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.85))", padding: "0.3rem 0.25rem 0.2rem", fontSize: "0.45rem", color: "rgba(255,255,255,0.65)", fontFamily: "'Cinzel', serif", letterSpacing: "0.5px", textAlign: "center" }}>
                      {img.heroine.split(" ")[0].toUpperCase()}
                    </div>
                    <button onClick={e => { e.stopPropagation(); download(img); }} style={{ position: "absolute", top: "0.2rem", right: "0.2rem", background: "rgba(0,0,0,0.65)", border: "none", borderRadius: "4px", color: "rgba(255,255,255,0.7)", fontSize: "0.55rem", padding: "0.2rem 0.3rem", cursor: "pointer" }}>↓</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
