import { useState } from "react";

interface Props {
  heroine: string;
  villain: string;
  setting: string;
  storyText: string;
  heroineColor: string;
  onClose: () => void;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function StoryDebrief({ heroine, villain, setting, storyText, heroineColor, onClose }: Props) {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [coverImg, setCoverImg] = useState<string | null>(null);
  const [genningImg, setGenningImg] = useState(false);

  async function generate() {
    setLoading(true); setError(""); setReport(null);
    try {
      const resp = await fetch(`${BASE}/api/story/debrief`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroine, villain, setting, storyText }),
      });
      const json = await resp.json();
      if (json.error) throw new Error(json.error);
      setReport(json.report);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function generatePhoto() {
    setGenningImg(true);
    try {
      const resp = await fetch(`${BASE}/api/story/generate-scene-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroine,
          sceneDescription: `Surveillance photograph of ${heroine} captured by ${villain}. ${setting}. Candid, documentary style.`,
          shotLabel: "Full Shot", mood: "Dark surveillance photo",
          styleLabel: "Realistic photograph grain", width: 512, height: 512,
        }),
      });
      const json = await resp.json();
      if (json.imageBase64) setCoverImg(json.imageBase64);
    } finally { setGenningImg(false); }
  }

  // Format report text into styled sections
  function renderReport(text: string) {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      if (line.includes("TOP SECRET") || line.includes("EYES ONLY") || line.includes("CLASSIFIED")) {
        return <div key={i} style={{ color: "#EF4444", fontWeight: 900, letterSpacing: "3px", fontSize: "0.6rem", textAlign: "center", marginBottom: "0.5rem", animation: "db-pulse 2s ease-in-out infinite" }}>{line}</div>;
      }
      if (line.match(/^[A-Z\s\/\-]{4,}:?$/) && line.trim().length > 0) {
        return <div key={i} style={{ color: heroineColor, fontFamily: "'Courier New',monospace", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "3px", marginTop: "1.2rem", marginBottom: "0.4rem", borderBottom: `1px solid ${heroineColor}33`, paddingBottom: "0.2rem" }}>{line}</div>;
      }
      if (line.includes("[REDACTED]")) {
        const parts = line.split("[REDACTED]");
        return (
          <div key={i} style={{ fontFamily: "'Courier New',monospace", fontSize: "0.62rem", color: "rgba(200,195,215,0.75)", lineHeight: 1.8, marginBottom: "0.2rem" }}>
            {parts.map((p, j) => (
              <span key={j}>
                {p}
                {j < parts.length - 1 && <span style={{ background: "#111", color: "#111", padding: "0 0.4rem", border: "1px solid rgba(200,195,215,0.15)", borderRadius: "2px", fontWeight: 900, userSelect: "none", cursor: "default" }}>████████████</span>}
              </span>
            ))}
          </div>
        );
      }
      if (line.trim().startsWith("//") || line.trim().startsWith("--")) {
        return <div key={i} style={{ fontFamily: "'Courier New',monospace", fontSize: "0.5rem", color: "rgba(200,195,215,0.35)", lineHeight: 1.6, letterSpacing: "1px" }}>{line}</div>;
      }
      if (!line.trim()) return <div key={i} style={{ height: "0.5rem" }} />;
      return <div key={i} style={{ fontFamily: "'Courier New',monospace", fontSize: "0.62rem", color: "rgba(200,195,215,0.75)", lineHeight: 1.8, marginBottom: "0.2rem" }}>{line}</div>;
    });
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9990, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", backdropFilter: "blur(4px)" }}>
      <style>{`
        @keyframes db-pulse { 0%,100%{opacity:1;}50%{opacity:0.5;} }
        @keyframes db-scan { 0%{transform:translateY(-100%);}100%{transform:translateY(100vh);} }
      `}</style>

      <div style={{ maxWidth: "760px", width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", background: "#080610", border: `1px solid ${heroineColor}22`, borderRadius: "4px", overflow: "hidden", boxShadow: `0 0 80px rgba(0,0,0,0.8), 0 0 40px ${heroineColor}0a` }}>
        {/* Header bar */}
        <div style={{ padding: "0.75rem 1.25rem", background: "rgba(0,0,0,0.8)", borderBottom: `1px solid ${heroineColor}22`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#EF4444", boxShadow: "0 0 8px #EF4444" }} />
            <span style={{ fontFamily: "'Courier New',monospace", fontSize: "0.55rem", color: "rgba(200,195,215,0.5)", letterSpacing: "3px", textTransform: "uppercase" }}>CLASSIFIED DEBRIEF · {heroine.toUpperCase()}</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px", padding: "0.25rem 0.6rem", color: "rgba(200,195,215,0.4)", fontFamily: "'Courier New',monospace", fontSize: "0.5rem", cursor: "pointer", letterSpacing: "2px" }}>CLOSE ✕</button>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          {!report && !loading && (
            <div style={{ textAlign: "center", padding: "3rem 0" }}>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: "0.55rem", color: "rgba(200,195,215,0.35)", letterSpacing: "3px", marginBottom: "2rem", lineHeight: 2 }}>
                TOP SECRET // EYES ONLY<br/>
                OPERATION: [{heroine.toUpperCase().replace(/\s/g, "_")}]<br/>
                HANDLER: [{villain.toUpperCase().replace(/\s/g, "_")}]<br/>
                STATUS: AWAITING GENERATION
              </div>
              {error && <div style={{ color: "#EF4444", fontFamily: "'Courier New',monospace", fontSize: "0.52rem", marginBottom: "1rem" }}>{error}</div>}
              <button onClick={generate} style={{ padding: "0.75rem 2rem", background: "rgba(200,0,0,0.12)", border: "1px solid rgba(200,0,0,0.4)", borderRadius: "4px", color: "#EF4444", fontFamily: "'Courier New',monospace", fontSize: "0.6rem", letterSpacing: "3px", cursor: "pointer", textTransform: "uppercase", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background="rgba(200,0,0,0.22)"; }}
                onMouseLeave={e => { e.currentTarget.style.background="rgba(200,0,0,0.12)"; }}>
                ▶ GENERATE DEBRIEF
              </button>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: "center", padding: "3rem 0" }}>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: "0.52rem", color: "rgba(200,195,215,0.4)", letterSpacing: "3px", animation: "db-pulse 1.2s infinite" }}>
                COMPILING INTELLIGENCE REPORT…
              </div>
            </div>
          )}

          {report && (
            <div>
              {/* Surveillance photo */}
              <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "160px" }}>
                  {coverImg ? (
                    <img src={`data:image/jpeg;base64,${coverImg}`} alt="Surveillance" style={{ width: "100%", maxWidth: "180px", borderRadius: "2px", border: "1px solid rgba(255,255,255,0.1)", filter: "sepia(0.3) contrast(1.1)", display: "block" }} />
                  ) : (
                    <div style={{ width: "140px", height: "180px", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "2px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                      <div style={{ fontFamily: "'Courier New',monospace", fontSize: "0.4rem", color: "rgba(200,195,215,0.2)", textAlign: "center", letterSpacing: "1px" }}>SURVEILLANCE<br/>PHOTO<br/>MISSING</div>
                      <button onClick={generatePhoto} disabled={genningImg} style={{ padding: "0.25rem 0.5rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "2px", color: "rgba(200,195,215,0.3)", fontFamily: "'Courier New',monospace", fontSize: "0.38rem", letterSpacing: "1px", cursor: genningImg ? "not-allowed" : "pointer" }}>
                        {genningImg ? "GENERATING…" : "ADD PHOTO"}
                      </button>
                    </div>
                  )}
                  {coverImg && <button onClick={generatePhoto} disabled={genningImg} style={{ marginTop:"0.4rem", padding: "0.2rem 0.5rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "2px", color: "rgba(200,195,215,0.25)", fontFamily: "'Courier New',monospace", fontSize: "0.38rem", letterSpacing: "1px", cursor: "pointer", display:"block" }}>{genningImg ? "…" : "↺"}</button>}
                </div>
                <div style={{ flex: 2, minWidth: "200px" }}>
                  <div style={{ fontFamily: "'Courier New',monospace", fontSize: "0.45rem", color: "rgba(200,195,215,0.3)", lineHeight: 2, letterSpacing: "1px" }}>
                    <div>TARGET DESIGNATION: <span style={{ color: heroineColor }}>{heroine.toUpperCase()}</span></div>
                    <div>PRIMARY HANDLER: <span style={{ color: "rgba(200,195,215,0.6)" }}>{villain.toUpperCase()}</span></div>
                    <div>ACQUISITION SITE: <span style={{ color: "rgba(200,195,215,0.5)" }}>{setting.toUpperCase()}</span></div>
                    <div>DOCUMENT CLASS: <span style={{ color: "#EF4444" }}>TOP SECRET // EYES ONLY</span></div>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1rem" }}>
                {renderReport(report)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
