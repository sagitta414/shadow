import { useState } from "react";
import { getHeroineResistanceScore } from "../lib/archive";

interface DossierData {
  weaknessesDiscovered: string[];
  leverageGained: string[];
  resistanceLevel: "High" | "Moderate" | "Low" | "Broken";
  psychologicalProfile: string;
  physicalNotes: string;
  handlingRecommendations: string;
  fieldNote: string;
}

interface Props {
  heroine: string;
  villain: string;
  heroineColor: string;
  dossier: DossierData | null;
  chapterCount: number;
  loading?: boolean;
}

const RESISTANCE_COLORS: Record<string, string> = {
  High: "#34D399",
  Moderate: "#F59E0B",
  Low: "#F87171",
  Broken: "#A855F7",
};

export default function VillainDossier({ heroine, villain, heroineColor, dossier, chapterCount, loading }: Props) {
  const [open, setOpen] = useState(false);

  if (!dossier && !loading) return null;

  const resistColor = dossier ? (RESISTANCE_COLORS[dossier.resistanceLevel] ?? "#888") : "#888";
  const archiveScore = getHeroineResistanceScore(heroine);

  return (
    <div style={{ margin: "1rem 0", background: "rgba(0,0,0,0.6)", border: `1px solid ${heroineColor}18`, borderRadius: "8px", overflow: "hidden" }}>
      <style>{`@keyframes vd-pulse { 0%,100%{opacity:0.7;}50%{opacity:1;} }`}</style>

      {/* Collapsed header */}
      <button onClick={() => setOpen(!open)} style={{ width: "100%", padding: "0.65rem 1rem", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontFamily: "'Courier New',monospace", fontSize: "0.45rem", color: "rgba(200,195,215,0.35)", letterSpacing: "3px", textTransform: "uppercase" }}>📋 VILLAIN DOSSIER</span>
          {dossier && (
            <span style={{ padding: "0.15rem 0.5rem", background: `${resistColor}18`, border: `1px solid ${resistColor}44`, borderRadius: "10px", fontFamily: "'Cinzel',serif", fontSize: "0.42rem", color: resistColor, letterSpacing: "1px" }}>
              {dossier.resistanceLevel}
            </span>
          )}
          {loading && (
            <span style={{ fontFamily: "'Courier New',monospace", fontSize: "0.42rem", color: "rgba(200,195,215,0.3)", animation: "vd-pulse 1.2s infinite" }}>UPDATING…</span>
          )}
          {archiveScore.totalStories > 0 && (
            <span style={{ padding: "0.1rem 0.45rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", fontFamily: "'Courier New',monospace", fontSize: "0.38rem", color: "rgba(200,195,215,0.25)", letterSpacing: "1px" }}>
              ARCHIVE: {archiveScore.dominantOutcome} · {archiveScore.resistanceRating}% RESIST
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontFamily: "'Courier New',monospace", fontSize: "0.4rem", color: "rgba(200,195,215,0.25)", letterSpacing: "1px" }}>CHAPTER {chapterCount}</span>
          <span style={{ color: "rgba(200,195,215,0.3)", fontSize: "0.5rem" }}>{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Expanded content */}
      {open && dossier && (
        <div style={{ padding: "0 1rem 1rem", borderTop: `1px solid ${heroineColor}12` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.75rem" }}>

            {/* Weaknesses */}
            <div style={{ padding: "0.65rem 0.85rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "6px" }}>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: "0.4rem", color: "#F87171", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "0.5rem" }}>WEAKNESSES</div>
              {dossier.weaknessesDiscovered.length ? dossier.weaknessesDiscovered.map((w, i) => (
                <div key={i} style={{ fontFamily: "'Courier New',monospace", fontSize: "0.48rem", color: "rgba(200,195,215,0.6)", lineHeight: 1.7, paddingLeft: "0.5rem", borderLeft: "1px solid rgba(248,113,113,0.3)" }}>— {w}</div>
              )) : <div style={{ fontFamily: "'Courier New',monospace", fontSize: "0.45rem", color: "rgba(200,195,215,0.2)" }}>None identified yet.</div>}
            </div>

            {/* Leverage */}
            <div style={{ padding: "0.65rem 0.85rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "6px" }}>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: "0.4rem", color: "#F59E0B", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "0.5rem" }}>LEVERAGE</div>
              {dossier.leverageGained.length ? dossier.leverageGained.map((l, i) => (
                <div key={i} style={{ fontFamily: "'Courier New',monospace", fontSize: "0.48rem", color: "rgba(200,195,215,0.6)", lineHeight: 1.7, paddingLeft: "0.5rem", borderLeft: "1px solid rgba(245,158,11,0.3)" }}>— {l}</div>
              )) : <div style={{ fontFamily: "'Courier New',monospace", fontSize: "0.45rem", color: "rgba(200,195,215,0.2)" }}>None identified yet.</div>}
            </div>

            {/* Psych Profile */}
            <div style={{ padding: "0.65rem 0.85rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "6px", gridColumn: "1 / -1" }}>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: "0.4rem", color: heroineColor, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "0.35rem" }}>PSYCHOLOGICAL PROFILE</div>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: "0.5rem", color: "rgba(200,195,215,0.65)", lineHeight: 1.7 }}>{dossier.psychologicalProfile}</div>
            </div>

            {/* Handling Recs */}
            <div style={{ padding: "0.65rem 0.85rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "6px" }}>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: "0.4rem", color: "#60A5FA", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "0.35rem" }}>HANDLER RECS</div>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: "0.5rem", color: "rgba(200,195,215,0.6)", lineHeight: 1.7 }}>{dossier.handlingRecommendations}</div>
            </div>

            {/* Field Note */}
            <div style={{ padding: "0.65rem 0.85rem", background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.15)", borderRadius: "6px", borderLeft: "2px solid rgba(168,85,247,0.4)" }}>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: "0.4rem", color: "#A855F7", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "0.35rem" }}>FIELD NOTE</div>
              <div style={{ fontFamily: "'Courier New',monospace", fontSize: "0.5rem", color: "rgba(200,195,215,0.6)", lineHeight: 1.7, fontStyle: "italic" }}>{dossier.fieldNote}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
