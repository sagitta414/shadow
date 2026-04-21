import { useState, useEffect } from "react";
import { buildHeroineProfiles, upsertLoreRecord, type HeroineArchiveProfile } from "../lib/heroineLore";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

interface Props {
  onBack: () => void;
}

type Tab = "overview" | "lore" | "portrait";

interface ActiveHeroine {
  profile: HeroineArchiveProfile;
  tab: Tab;
}

export default function HeroineLore({ onBack }: Props) {
  const [profiles, setProfiles] = useState<HeroineArchiveProfile[]>([]);
  const [active, setActive] = useState<ActiveHeroine | null>(null);
  const [loreLoading, setLoreLoading] = useState(false);
  const [portraitLoading, setPortraitLoading] = useState(false);
  const [loreError, setLoreError] = useState("");
  const [portraitError, setPortraitError] = useState("");

  function reload() {
    setProfiles(buildHeroineProfiles());
  }

  useEffect(() => { reload(); }, []);

  async function generateLore(profile: HeroineArchiveProfile) {
    setLoreLoading(true);
    setLoreError("");
    try {
      const resp = await fetch(`${BASE}/api/story/heroine-lore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroName: profile.name,
          chapterSamples: profile.chapterSamples,
          universes: profile.universes,
          storyCount: profile.storyCount,
        }),
      });
      const data = await resp.json();
      if (data.fullNarrative) {
        const entry = {
          generatedAt: Date.now(),
          evolution: data.evolution,
          breakingPoints: data.breakingPoints,
          endurance: data.endurance,
          currentState: data.currentState,
          fullNarrative: data.fullNarrative,
        };
        upsertLoreRecord(profile.name, { lore: entry });
        reload();
        setActive(prev => prev ? { ...prev, profile: { ...prev.profile, lore: entry } } : null);
      } else {
        setLoreError(data.error || "Generation failed");
      }
    } catch { setLoreError("Network error"); }
    finally { setLoreLoading(false); }
  }

  async function generatePortrait(profile: HeroineArchiveProfile) {
    setPortraitLoading(true);
    setPortraitError("");
    try {
      const resp = await fetch(`${BASE}/api/story/heroine-portrait`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroName: profile.name,
          universe: profile.universes[0] ?? "",
          chapterSample: profile.chapterSamples[0] ?? "",
        }),
      });
      const data = await resp.json();
      if (data.imageData) {
        upsertLoreRecord(profile.name, { portraitUrl: data.imageData, portraitGeneratedAt: Date.now() });
        reload();
        setActive(prev => prev ? { ...prev, profile: { ...prev.profile, portraitUrl: data.imageData } } : null);
      } else {
        setPortraitError(data.error || "Portrait generation failed");
      }
    } catch { setPortraitError("Network error"); }
    finally { setPortraitLoading(false); }
  }

  const TIER_COLOR = "#C084FC";
  const TIER_GLOW = "rgba(192,132,252,0.35)";

  return (
    <>
      <style>{`
        @keyframes loreFadeIn { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
        @keyframes loreGlow { 0%,100%{opacity:0.6;}50%{opacity:1;} }
        @keyframes portraitReveal { from{opacity:0;transform:scale(0.96);}to{opacity:1;transform:scale(1);} }
        @keyframes scanLine { 0%{transform:translateY(-100%);}100%{transform:translateY(100vh);} }
        .lore-card { animation: loreFadeIn 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .lore-card:hover { transform: translateY(-2px); transition: transform 0.2s ease; }
        @media(max-width:700px){ .lore-two-col{ flex-direction: column !important; } }
      `}</style>

      <div style={{ minHeight: "100vh", padding: "1.5rem 1rem 4rem", maxWidth: "900px", margin: "0 auto" }}>

        {/* Back */}
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: "rgba(200,190,220,0.35)", fontFamily: "'Cinzel', serif", fontSize: "0.72rem", letterSpacing: "2px", cursor: "pointer", padding: "0.5rem 0", marginBottom: "1.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          ← THE ARCHIVE
        </button>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ fontSize: "0.48rem", letterSpacing: "4px", color: TIER_COLOR, fontFamily: "'Cinzel', serif", opacity: 0.7, marginBottom: "0.5rem" }}>
            SHADOWWEAVE · LIVING RECORD
          </div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.5rem, 5vw, 2.2rem)", fontWeight: 700, color: "#fff", margin: "0 0 0.5rem", letterSpacing: "3px", textShadow: `0 0 40px ${TIER_GLOW}` }}>
            HEROINE LORE
          </h1>
          <p style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: "0.95rem", color: "rgba(200,190,220,0.55)", fontStyle: "italic", margin: 0 }}>
            A living chronicle of every heroine who has passed through the dark — tracking how they changed, what broke them, what endured.
          </p>
        </div>

        {profiles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", border: "1px solid rgba(192,132,252,0.12)", borderRadius: "16px", background: "rgba(0,0,0,0.4)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.4 }}>📜</div>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.8rem", color: "rgba(200,190,220,0.35)", letterSpacing: "2px" }}>
              NO HEROINES ARCHIVED YET
            </p>
            <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "0.88rem", color: "rgba(200,190,220,0.3)", fontStyle: "italic", marginTop: "0.5rem" }}>
              Generate and save stories to begin building their lore.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "1.5rem", flexDirection: active ? "row" : "column" }} className="lore-two-col">

            {/* ── Heroine List ── */}
            <div style={{ flex: active ? "0 0 220px" : "1", display: "flex", flexDirection: active ? "column" : "row", flexWrap: "wrap", gap: "0.75rem" }}>
              {profiles.map((p, idx) => {
                const isActive = active?.profile.name === p.name;
                return (
                  <div
                    key={p.name}
                    className="lore-card"
                    onClick={() => setActive(isActive ? null : { profile: p, tab: "overview" })}
                    style={{
                      animationDelay: `${idx * 0.05}s`,
                      cursor: "pointer",
                      padding: "1rem",
                      borderRadius: "12px",
                      border: `1px solid ${isActive ? "rgba(192,132,252,0.45)" : "rgba(192,132,252,0.12)"}`,
                      background: isActive ? "rgba(192,132,252,0.08)" : "rgba(0,0,0,0.4)",
                      boxShadow: isActive ? `0 0 24px rgba(192,132,252,0.15)` : "none",
                      transition: "all 0.22s",
                      flex: active ? "none" : "1 1 200px",
                      minWidth: 0,
                    }}
                  >
                    {p.portraitUrl ? (
                      <img src={p.portraitUrl} alt={p.name} style={{ width: "100%", maxWidth: active ? "100%" : "80px", height: active ? "auto" : "80px", objectFit: "cover", borderRadius: "8px", marginBottom: "0.75rem", display: "block" }} />
                    ) : (
                      <div style={{ width: active ? "100%" : "64px", height: active ? "80px" : "64px", borderRadius: "8px", background: "rgba(192,132,252,0.06)", border: "1px dashed rgba(192,132,252,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.65rem", fontSize: "1.5rem" }}>
                        👤
                      </div>
                    )}
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.7rem", letterSpacing: "1.5px", color: isActive ? TIER_COLOR : "rgba(220,210,230,0.7)", fontWeight: 700, marginBottom: "0.25rem", whiteSpace: active ? "normal" : "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: "0.55rem", color: "rgba(200,190,220,0.4)", fontFamily: "'Cinzel', serif", letterSpacing: "1px" }}>
                      {p.storyCount} {p.storyCount === 1 ? "story" : "stories"} · {(p.totalWords / 1000).toFixed(1)}k words
                    </div>
                    {p.lore && (
                      <div style={{ marginTop: "0.4rem", fontSize: "0.5rem", color: TIER_COLOR, fontFamily: "'Cinzel', serif", letterSpacing: "1px", opacity: 0.7 }}>
                        ✦ LORE RECORDED
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Detail Panel ── */}
            {active && (
              <div style={{ flex: 1, minWidth: 0, animation: "loreFadeIn 0.35s cubic-bezier(0.22,1,0.36,1) both" }}>
                {/* Heroine header */}
                <div style={{ padding: "1.25rem", borderRadius: "14px", border: "1px solid rgba(192,132,252,0.2)", background: "rgba(0,0,0,0.5)", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                    {active.profile.portraitUrl && (
                      <img src={active.profile.portraitUrl} alt={active.profile.name}
                        style={{ width: "90px", height: "120px", objectFit: "cover", borderRadius: "10px", border: `1px solid ${TIER_GLOW}`, animation: "portraitReveal 0.5s ease both", flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.44rem", letterSpacing: "3px", color: TIER_COLOR, fontFamily: "'Cinzel', serif", opacity: 0.7, marginBottom: "0.3rem" }}>HEROINE DOSSIER</div>
                      <div style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1rem, 3vw, 1.4rem)", fontWeight: 700, color: "#fff", letterSpacing: "2px", marginBottom: "0.4rem" }}>
                        {active.profile.name}
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.6rem" }}>
                        {active.profile.universes.slice(0, 3).map(u => (
                          <span key={u} style={{ fontSize: "0.5rem", padding: "0.15rem 0.55rem", borderRadius: "20px", background: "rgba(192,132,252,0.08)", border: "1px solid rgba(192,132,252,0.2)", color: "rgba(192,132,252,0.7)", fontFamily: "'Cinzel', serif", letterSpacing: "1px" }}>
                            {u}
                          </span>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: "1rem" }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", color: TIER_COLOR, fontWeight: 700 }}>{active.profile.storyCount}</div>
                          <div style={{ fontSize: "0.44rem", color: "rgba(200,190,220,0.4)", letterSpacing: "1px", fontFamily: "'Cinzel', serif" }}>CAPTURES</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1rem", color: TIER_COLOR, fontWeight: 700 }}>{(active.profile.totalWords / 1000).toFixed(1)}k</div>
                          <div style={{ fontSize: "0.44rem", color: "rgba(200,190,220,0.4)", letterSpacing: "1px", fontFamily: "'Cinzel', serif" }}>WORDS</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                  {(["overview", "lore", "portrait"] as Tab[]).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActive(prev => prev ? { ...prev, tab } : null)}
                      style={{
                        flex: 1, padding: "0.55rem 0.5rem", borderRadius: "8px", cursor: "pointer",
                        fontFamily: "'Cinzel', serif", fontSize: "0.55rem", letterSpacing: "1.5px",
                        border: `1px solid ${active.tab === tab ? "rgba(192,132,252,0.5)" : "rgba(192,132,252,0.12)"}`,
                        background: active.tab === tab ? "rgba(192,132,252,0.1)" : "rgba(0,0,0,0.3)",
                        color: active.tab === tab ? TIER_COLOR : "rgba(200,190,220,0.4)",
                        transition: "all 0.18s",
                      }}
                    >
                      {tab === "overview" ? "📋 OVERVIEW" : tab === "lore" ? "📜 LORE" : "🎨 PORTRAIT"}
                    </button>
                  ))}
                </div>

                {/* Tab: Overview */}
                {active.tab === "overview" && (
                  <div style={{ padding: "1.25rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.4)" }}>
                    <p style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: "0.95rem", color: "rgba(200,190,220,0.6)", fontStyle: "italic", lineHeight: 1.8, margin: "0 0 1rem" }}>
                      {active.profile.chapterSamples[0]?.slice(0, 300) + "…" || "No story excerpt available."}
                    </p>
                    <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                      <button onClick={() => setActive(prev => prev ? { ...prev, tab: "lore" } : null)} style={{ padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "1.5px", background: "rgba(192,132,252,0.08)", border: "1px solid rgba(192,132,252,0.3)", color: TIER_COLOR }}>
                        📜 Generate Lore Entry
                      </button>
                      <button onClick={() => setActive(prev => prev ? { ...prev, tab: "portrait" } : null)} style={{ padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "1.5px", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.3)", color: "#A855F7" }}>
                        🎨 Generate Portrait
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab: Lore */}
                {active.tab === "lore" && (
                  <div style={{ padding: "1.25rem", borderRadius: "12px", border: "1px solid rgba(192,132,252,0.15)", background: "rgba(0,0,0,0.45)" }}>
                    {active.profile.lore ? (
                      <div>
                        {[
                          { label: "EVOLUTION",       icon: "🔄", text: active.profile.lore.evolution },
                          { label: "BREAKING POINTS", icon: "💔", text: active.profile.lore.breakingPoints },
                          { label: "ENDURANCE",       icon: "🔥", text: active.profile.lore.endurance },
                          { label: "CURRENT STATE",   icon: "🌑", text: active.profile.lore.currentState },
                        ].map(({ label, icon, text }) => (
                          <div key={label} style={{ marginBottom: "1.25rem" }}>
                            <div style={{ fontSize: "0.46rem", letterSpacing: "2.5px", color: TIER_COLOR, fontFamily: "'Cinzel', serif", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                              {icon} {label}
                            </div>
                            <p style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: "0.95rem", color: "rgba(215,205,230,0.82)", lineHeight: 1.85, margin: 0, fontStyle: "italic" }}>
                              {text || "—"}
                            </p>
                          </div>
                        ))}
                        <button
                          onClick={() => generateLore(active.profile)}
                          disabled={loreLoading}
                          style={{ marginTop: "0.5rem", padding: "0.5rem 1rem", borderRadius: "8px", cursor: loreLoading ? "not-allowed" : "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.58rem", letterSpacing: "1.5px", background: "rgba(192,132,252,0.06)", border: "1px solid rgba(192,132,252,0.2)", color: "rgba(192,132,252,0.5)", opacity: loreLoading ? 0.6 : 1 }}>
                          {loreLoading ? "⟳ Rewriting…" : "↺ Regenerate Lore"}
                        </button>
                      </div>
                    ) : (
                      <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "0.75rem", opacity: 0.4 }}>📜</div>
                        <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.72rem", color: "rgba(200,190,220,0.4)", letterSpacing: "2px", marginBottom: "1rem" }}>
                          NO LORE RECORDED
                        </p>
                        {loreError && <p style={{ color: "#F87171", fontSize: "0.72rem", marginBottom: "0.75rem" }}>{loreError}</p>}
                        <button
                          onClick={() => generateLore(active.profile)}
                          disabled={loreLoading}
                          style={{ padding: "0.65rem 1.5rem", borderRadius: "10px", cursor: loreLoading ? "not-allowed" : "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.7rem", letterSpacing: "2px", background: "rgba(192,132,252,0.12)", border: "1px solid rgba(192,132,252,0.45)", color: TIER_COLOR, boxShadow: `0 0 16px ${TIER_GLOW}`, opacity: loreLoading ? 0.6 : 1, transition: "all 0.2s" }}>
                          {loreLoading ? "⟳ Chronicling…" : "📜 Write Her Lore"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Portrait */}
                {active.tab === "portrait" && (
                  <div style={{ padding: "1.25rem", borderRadius: "12px", border: "1px solid rgba(168,85,247,0.15)", background: "rgba(0,0,0,0.45)" }}>
                    {active.profile.portraitUrl ? (
                      <div style={{ textAlign: "center" }}>
                        <img
                          src={active.profile.portraitUrl}
                          alt={active.profile.name}
                          style={{ maxWidth: "100%", maxHeight: "500px", objectFit: "contain", borderRadius: "12px", border: "1px solid rgba(168,85,247,0.3)", boxShadow: "0 0 40px rgba(168,85,247,0.2)", animation: "portraitReveal 0.6s ease both", marginBottom: "1rem" }}
                        />
                        {portraitError && <p style={{ color: "#F87171", fontSize: "0.72rem", marginBottom: "0.75rem" }}>{portraitError}</p>}
                        <button
                          onClick={() => generatePortrait(active.profile)}
                          disabled={portraitLoading}
                          style={{ padding: "0.5rem 1.25rem", borderRadius: "8px", cursor: portraitLoading ? "not-allowed" : "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.6rem", letterSpacing: "1.5px", background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.25)", color: "#A855F7", opacity: portraitLoading ? 0.6 : 1 }}>
                          {portraitLoading ? "⟳ Painting…" : "↺ Regenerate Portrait"}
                        </button>
                      </div>
                    ) : (
                      <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem", opacity: 0.35 }}>🎨</div>
                        <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.72rem", color: "rgba(200,190,220,0.4)", letterSpacing: "2px", marginBottom: "0.5rem" }}>
                          NO PORTRAIT GENERATED
                        </p>
                        <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "0.82rem", color: "rgba(200,190,220,0.3)", fontStyle: "italic", marginBottom: "1.25rem" }}>
                          Venice AI will paint her from your story's darkness.
                        </p>
                        {portraitError && <p style={{ color: "#F87171", fontSize: "0.72rem", marginBottom: "0.75rem" }}>{portraitError}</p>}
                        <button
                          onClick={() => generatePortrait(active.profile)}
                          disabled={portraitLoading}
                          style={{ padding: "0.65rem 1.75rem", borderRadius: "10px", cursor: portraitLoading ? "not-allowed" : "pointer", fontFamily: "'Cinzel', serif", fontSize: "0.7rem", letterSpacing: "2px", background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.45)", color: "#A855F7", boxShadow: "0 0 16px rgba(168,85,247,0.25)", opacity: portraitLoading ? 0.6 : 1, transition: "all 0.2s" }}>
                          {portraitLoading ? "⟳ Painting her…" : "🎨 Paint Her Portrait"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
