import { useState } from "react";

export interface PsycheEvent {
  event: string;
  sanityDelta: number;
  hopeDelta: number;
}

export interface PsycheMeterProps {
  sanity: number;
  hope: number;
  log: PsycheEvent[];
}

export default function PsycheMeter({ sanity, hope, log }: PsycheMeterProps) {
  const [expanded, setExpanded] = useState(true);

  function meterColor(val: number): string {
    if (val >= 70) return "#22cc66";
    if (val >= 45) return "#ccaa22";
    if (val >= 25) return "#cc6622";
    return "#cc2222";
  }

  function sanityLabel(val: number): string {
    if (val >= 80) return "Composed";
    if (val >= 60) return "Strained";
    if (val >= 40) return "Fractured";
    if (val >= 20) return "Unraveling";
    return "Broken";
  }

  function hopeLabel(val: number): string {
    if (val >= 75) return "Resolute";
    if (val >= 50) return "Flickering";
    if (val >= 30) return "Dimming";
    if (val >= 15) return "Fading";
    return "Extinguished";
  }

  function deltaStr(n: number) {
    return n >= 0 ? `+${n}` : `${n}`;
  }

  const last = log[log.length - 1];

  return (
    <div style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", marginBottom: "1.5rem", overflow: "hidden", transition: "all 0.3s ease" }}>
      <button onClick={() => setExpanded(!expanded)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.25rem", background: "none", border: "none", cursor: "pointer", color: "inherit", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flex: 1 }}>
          <span className="font-cinzel" style={{ fontSize: "0.6rem", color: "rgba(184,134,11,0.7)", letterSpacing: "3px", textTransform: "uppercase", flexShrink: 0 }}>
            Psychological State
          </span>
          <div style={{ display: "flex", gap: "1rem", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
              <span style={{ fontSize: "0.62rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1.5px", flexShrink: 0 }}>SANITY</span>
              <div style={{ flex: 1, height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden", maxWidth: "100px" }}>
                <div style={{ width: `${sanity}%`, height: "100%", background: meterColor(sanity), borderRadius: "2px", transition: "width 0.6s ease, background 0.6s ease", boxShadow: `0 0 6px ${meterColor(sanity)}` }} />
              </div>
              <span style={{ fontSize: "0.7rem", color: meterColor(sanity), fontFamily: "'Cinzel', serif", fontWeight: 700, flexShrink: 0, minWidth: "28px" }}>{sanity}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
              <span style={{ fontSize: "0.62rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1.5px", flexShrink: 0 }}>HOPE</span>
              <div style={{ flex: 1, height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden", maxWidth: "100px" }}>
                <div style={{ width: `${hope}%`, height: "100%", background: "#4a90d9", borderRadius: "2px", transition: "width 0.6s ease", boxShadow: "0 0 6px rgba(74,144,217,0.6)" }} />
              </div>
              <span style={{ fontSize: "0.7rem", color: "#4a90d9", fontFamily: "'Cinzel', serif", fontWeight: 700, flexShrink: 0, minWidth: "28px" }}>{hope}</span>
            </div>
          </div>
        </div>
        <span style={{ fontSize: "0.6rem", color: "rgba(200,200,220,0.25)", flexShrink: 0 }}>{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div style={{ padding: "0 1.25rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", paddingTop: "1rem" }}>
            {/* Sanity */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                <span className="font-cinzel" style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.4)", letterSpacing: "2px" }}>SANITY</span>
                <span style={{ fontSize: "0.65rem", color: meterColor(sanity), fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>{sanityLabel(sanity)}</span>
              </div>
              <div style={{ height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden", marginBottom: "0.35rem" }}>
                <div style={{ width: `${Math.max(0, Math.min(100, sanity))}%`, height: "100%", background: `linear-gradient(90deg, #cc2222, ${meterColor(sanity)})`, borderRadius: "4px", transition: "width 0.8s cubic-bezier(0.23,1,0.32,1)", boxShadow: `0 0 10px ${meterColor(sanity)}66` }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.62rem", color: "rgba(200,200,220,0.2)", fontFamily: "'Montserrat', sans-serif" }}>Breaking</span>
                <span style={{ fontSize: "0.75rem", color: meterColor(sanity), fontFamily: "'Cinzel', serif", fontWeight: 700 }}>{Math.max(0, Math.min(100, sanity))}/100</span>
                <span style={{ fontSize: "0.62rem", color: "rgba(200,200,220,0.2)", fontFamily: "'Montserrat', sans-serif" }}>Stable</span>
              </div>
            </div>

            {/* Hope */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                <span className="font-cinzel" style={{ fontSize: "0.65rem", color: "rgba(200,200,220,0.4)", letterSpacing: "2px" }}>HOPE</span>
                <span style={{ fontSize: "0.65rem", color: "#4a90d9", fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>{hopeLabel(hope)}</span>
              </div>
              <div style={{ height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden", marginBottom: "0.35rem" }}>
                <div style={{ width: `${Math.max(0, Math.min(100, hope))}%`, height: "100%", background: "linear-gradient(90deg, #1a3a6b, #4a90d9)", borderRadius: "4px", transition: "width 0.8s cubic-bezier(0.23,1,0.32,1)", boxShadow: "0 0 10px rgba(74,144,217,0.4)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.62rem", color: "rgba(200,200,220,0.2)", fontFamily: "'Montserrat', sans-serif" }}>Gone</span>
                <span style={{ fontSize: "0.75rem", color: "#4a90d9", fontFamily: "'Cinzel', serif", fontWeight: 700 }}>{Math.max(0, Math.min(100, hope))}/100</span>
                <span style={{ fontSize: "0.62rem", color: "rgba(200,200,220,0.2)", fontFamily: "'Montserrat', sans-serif" }}>Burning</span>
              </div>
            </div>
          </div>

          {/* Last event */}
          {last && (
            <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: "0.62rem", color: "rgba(200,200,220,0.3)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "1.5px", marginBottom: "0.35rem" }}>LATEST EVENT</div>
              <div style={{ fontSize: "0.78rem", color: "rgba(220,215,245,0.7)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.5, marginBottom: "0.4rem" }}>{last.event}</div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <span style={{ fontSize: "0.65rem", color: meterColor(sanity), fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>SANITY {deltaStr(last.sanityDelta)}</span>
                <span style={{ fontSize: "0.65rem", color: "#4a90d9", fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>HOPE {deltaStr(last.hopeDelta)}</span>
              </div>
            </div>
          )}

          {/* Full log */}
          {log.length > 1 && (
            <div style={{ marginTop: "0.75rem", maxHeight: "120px", overflowY: "auto" }}>
              {[...log].reverse().slice(1).map((entry, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.3rem 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <span style={{ fontSize: "0.68rem", color: "rgba(200,200,220,0.4)", fontFamily: "'Raleway', sans-serif", flex: 1, marginRight: "1rem" }}>{entry.event}</span>
                  <div style={{ display: "flex", gap: "0.75rem", flexShrink: 0 }}>
                    <span style={{ fontSize: "0.6rem", color: "rgba(200,200,220,0.3)", fontFamily: "'Montserrat', sans-serif" }}>S {deltaStr(entry.sanityDelta)}</span>
                    <span style={{ fontSize: "0.6rem", color: "rgba(74,144,217,0.5)", fontFamily: "'Montserrat', sans-serif" }}>H {deltaStr(entry.hopeDelta)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
