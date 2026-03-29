import { useState } from "react";

export interface PsycheEvent {
  event: string;
  sanityDelta: number;
  hopeDelta?: number;
  resistanceDelta?: number;
}

export interface PsycheMeterProps {
  sanity: number;
  hope?: number;
  resistance?: number;
  log: PsycheEvent[];
  heroineName?: string | string[];
}

export default function PsycheMeter({ sanity, hope, resistance, log, heroineName }: PsycheMeterProps) {
  const [expanded, setExpanded] = useState(false);

  const res = resistance ?? hope ?? 100;
  const sClamp = Math.max(0, Math.min(100, sanity));
  const rClamp = Math.max(0, Math.min(100, res));

  const names = heroineName
    ? Array.isArray(heroineName) ? heroineName : [heroineName]
    : [];

  function sanityColor(v: number): string {
    if (v >= 70) return "#44cc77";
    if (v >= 45) return "#e0a030";
    if (v >= 25) return "#e05520";
    return "#cc2222";
  }
  function resistColor(v: number): string {
    if (v >= 70) return "#9d5cee";
    if (v >= 45) return "#c8a030";
    if (v >= 25) return "#887799";
    return "#553366";
  }
  function sanityLabel(v: number): string {
    if (v >= 85) return "Composed";
    if (v >= 65) return "Strained";
    if (v >= 45) return "Fractured";
    if (v >= 25) return "Unraveling";
    if (v >= 10) return "Breaking";
    return "Shattered";
  }
  function resistLabel(v: number): string {
    if (v >= 80) return "Defiant";
    if (v >= 60) return "Straining";
    if (v >= 40) return "Faltering";
    if (v >= 20) return "Crumbling";
    if (v >= 8)  return "Breaking";
    return "Broken";
  }
  function deltaStr(n: number): string { return n > 0 ? `+${n}` : `${n}`; }

  const last = log[log.length - 1];
  const lastRD = last ? (last.resistanceDelta ?? last.hopeDelta ?? 0) : 0;

  const sc = sanityColor(sClamp);
  const rc = resistColor(rClamp);

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(8,4,16,0.97), rgba(16,8,28,0.94))",
      backdropFilter: "blur(28px)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "20px",
      marginBottom: "1.75rem",
      overflow: "hidden",
      boxShadow: "0 8px 48px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04)",
      position: "relative",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "2px",
        background: `linear-gradient(90deg, transparent 0%, ${sc}aa 30%, ${rc}aa 70%, transparent 100%)`,
        transition: "background 1.2s ease",
      }} />

      <button
        onClick={() => setExpanded(e => !e)}
        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", color: "inherit", padding: "1.1rem 1.35rem", textAlign: "left" }}
      >
        {names.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
            <div style={{ width: "3px", height: "16px", background: sc, borderRadius: "2px", boxShadow: `0 0 10px ${sc}`, flexShrink: 0, transition: "background 1.2s ease, box-shadow 1.2s ease" }} />
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.74rem", letterSpacing: "2.5px", color: "rgba(225,220,248,0.88)", textTransform: "uppercase", textShadow: `0 0 24px ${sc}33` }}>
              {names.join("  ·  ")}
            </span>
            <div style={{ flex: 1, height: "1px", background: "linear-gradient(90deg, rgba(255,255,255,0.05), transparent)" }} />
            <span style={{ fontSize: "0.5rem", color: "rgba(200,200,220,0.18)", letterSpacing: "1.5px", fontFamily: "'Montserrat', sans-serif" }}>
              {expanded ? "▲ COLLAPSE" : "▼ LOG"}
            </span>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          {[
            { label: "SANITY", color: sc, clamp: sClamp, bg: `linear-gradient(90deg, #330a0a, ${sc})`, stateLabel: sanityLabel(sClamp), lo: "BROKEN", hi: "STABLE" },
            { label: "RESISTANCE", color: rc, clamp: rClamp, bg: `linear-gradient(90deg, #1a0a2a, ${rc})`, stateLabel: resistLabel(rClamp), lo: "BROKEN", hi: "HOLDING" },
          ].map(({ label, color, clamp, bg, stateLabel, lo, hi }) => (
            <div key={label}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.45rem" }}>
                <span style={{ fontSize: "0.54rem", color: "rgba(200,200,220,0.32)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "2.5px" }}>{label}</span>
                <span style={{ fontSize: "0.66rem", color: color, fontFamily: "'Cinzel', serif", fontWeight: 700, letterSpacing: "1px", transition: "color 1.2s ease" }}>{stateLabel}</span>
              </div>
              <div style={{ height: "11px", background: "rgba(255,255,255,0.04)", borderRadius: "6px", overflow: "hidden", position: "relative" }}>
                <div style={{
                  width: `${clamp}%`, height: "100%",
                  background: bg,
                  borderRadius: "6px",
                  transition: "width 1s cubic-bezier(0.23,1,0.32,1)",
                  boxShadow: `0 0 14px ${color}77`,
                  position: "relative",
                }}>
                  {clamp > 3 && (
                    <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "4px", background: color, boxShadow: `0 0 10px ${color}`, borderRadius: "0 6px 6px 0" }} />
                  )}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.32rem" }}>
                <span style={{ fontSize: "0.53rem", color: "rgba(200,200,220,0.13)", fontFamily: "'Montserrat', sans-serif" }}>{lo}</span>
                <span style={{ fontSize: "0.62rem", color: color, fontFamily: "'Cinzel', serif", fontWeight: 700, transition: "color 1.2s ease" }}>{clamp}</span>
                <span style={{ fontSize: "0.53rem", color: "rgba(200,200,220,0.13)", fontFamily: "'Montserrat', sans-serif" }}>{hi}</span>
              </div>
            </div>
          ))}
        </div>

        {last && (
          <div style={{ marginTop: "0.9rem", padding: "0.5rem 0.9rem", background: "rgba(255,255,255,0.02)", borderRadius: "9px", border: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "0.7rem", color: "rgba(220,215,245,0.5)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.45, flex: 1 }}>{last.event}</span>
            <div style={{ display: "flex", gap: "0.8rem", flexShrink: 0 }}>
              <span style={{ fontSize: "0.6rem", color: sc, fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>S {deltaStr(last.sanityDelta)}</span>
              <span style={{ fontSize: "0.6rem", color: rc, fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>R {deltaStr(lastRD)}</span>
            </div>
          </div>
        )}
      </button>

      {expanded && (
        <div style={{ padding: "0 1.35rem 1.35rem", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ fontSize: "0.5rem", color: "rgba(200,200,220,0.18)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "2.5px", textTransform: "uppercase", paddingTop: "0.9rem", marginBottom: "0.65rem" }}>
            Psychological Event Log
          </div>
          <div style={{ maxHeight: "170px", overflowY: "auto" }}>
            {[...log].reverse().map((entry, i) => {
              const rd = entry.resistanceDelta ?? entry.hopeDelta ?? 0;
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "0.38rem 0", borderBottom: "1px solid rgba(255,255,255,0.03)", gap: "1rem" }}>
                  <span style={{ fontSize: "0.69rem", color: "rgba(200,200,220,0.42)", fontFamily: "'Raleway', sans-serif", lineHeight: 1.4, flex: 1 }}>{entry.event}</span>
                  <div style={{ display: "flex", gap: "0.6rem", flexShrink: 0 }}>
                    <span style={{ fontSize: "0.58rem", color: entry.sanityDelta < 0 ? "#cc4444" : "#44aa66", fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>S {deltaStr(entry.sanityDelta)}</span>
                    <span style={{ fontSize: "0.58rem", color: rd < 0 ? "#aa44bb" : "#886699", fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>R {deltaStr(rd)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
