import { useMemo } from "react";
import { computeDarknessScore, getDarknessRank, getNextRank, getRankProgress, DARKNESS_RANKS } from "../lib/darknessRank";

interface Props {
  compact?: boolean;
}

export default function DarknessRankBadge({ compact = false }: Props) {
  const { score, rank, next, progress } = useMemo(() => {
    const score = computeDarknessScore();
    const rank = getDarknessRank(score);
    const next = getNextRank(rank);
    const progress = getRankProgress(score, rank);
    return { score, rank, next, progress };
  }, []);

  const isMax = rank.tier === 4;

  if (compact) {
    return (
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "0.45rem",
        padding: "0.3rem 0.7rem", borderRadius: "20px",
        background: rank.bg, border: `1px solid ${rank.glowColor}`,
        boxShadow: `0 0 12px ${rank.glowColor}`,
      }}>
        <span style={{ fontSize: "0.9rem" }}>{rank.icon}</span>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: "0.55rem", letterSpacing: "1.5px", color: rank.color, fontWeight: 700 }}>
          {rank.title}
        </span>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes rankGlow { 0%,100%{opacity:0.7;}50%{opacity:1;} }
        @keyframes rankShimmer { 0%{background-position:200% center;}100%{background-position:-200% center;} }
        @keyframes rankPulse { 0%,100%{transform:scale(1);}50%{transform:scale(1.06);} }
        @keyframes rankFloat { 0%,100%{transform:translateY(0);}50%{transform:translateY(-4px);} }
        @keyframes progressFill { from{width:0%;}to{width:var(--pw);} }
        .rank-title-shimmer {
          background: linear-gradient(90deg, ${rank.color}88, ${rank.color}, #fff, ${rank.color}, ${rank.color}88);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: rankShimmer 4s linear infinite;
        }
      `}</style>
      <div style={{
        position: "relative",
        background: `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, ${rank.bg} 100%)`,
        border: `1px solid ${rank.glowColor}`,
        borderRadius: "20px",
        padding: "1.5rem 1.75rem",
        overflow: "hidden",
        boxShadow: `0 0 40px ${rank.glowColor}, inset 0 1px 0 rgba(255,255,255,0.05)`,
        animation: "rankGlow 3s ease-in-out infinite",
      }}>
        {/* Background grid texture */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.03,
          backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 24px,rgba(255,255,255,1) 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,rgba(255,255,255,1) 25px)",
          pointerEvents: "none",
        }} />

        {/* Ambient orb */}
        <div style={{
          position: "absolute", top: "-40px", right: "-40px",
          width: "180px", height: "180px",
          background: `radial-gradient(circle, ${rank.glowColor} 0%, transparent 70%)`,
          pointerEvents: "none",
          animation: "rankFloat 6s ease-in-out infinite",
        }} />

        <div style={{ position: "relative", zIndex: 1, display: "flex", gap: "1.25rem", alignItems: "center", flexWrap: "wrap" }}>
          {/* Icon */}
          <div style={{
            fontSize: "clamp(2.2rem, 6vw, 3rem)",
            lineHeight: 1,
            filter: `drop-shadow(0 0 16px ${rank.glowColor})`,
            animation: "rankPulse 4s ease-in-out infinite",
            flexShrink: 0,
          }}>
            {rank.icon}
          </div>

          {/* Text block */}
          <div style={{ flex: 1, minWidth: "180px" }}>
            <div style={{ fontSize: "0.48rem", letterSpacing: "3px", color: rank.color, fontFamily: "'Cinzel', serif", opacity: 0.7, marginBottom: "0.2rem" }}>
              DARKNESS RANK
            </div>
            <div className="rank-title-shimmer" style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(0.85rem, 3vw, 1.15rem)", fontWeight: 700, letterSpacing: "2px", marginBottom: "0.2rem" }}>
              {rank.title}
            </div>
            <div style={{ fontSize: "0.65rem", color: "rgba(200,190,220,0.55)", fontFamily: "'EB Garamond', serif", fontStyle: "italic", marginBottom: "0.75rem" }}>
              {rank.subtitle}
            </div>

            {/* Progress bar */}
            {!isMax && next && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                  <span style={{ fontSize: "0.52rem", color: "rgba(200,190,220,0.45)", fontFamily: "'Cinzel', serif", letterSpacing: "1px" }}>
                    PROGRESS TO {next.title}
                  </span>
                  <span style={{ fontSize: "0.52rem", color: rank.color, fontFamily: "'Cinzel', serif", opacity: 0.7 }}>
                    {Math.round(progress * 100)}%
                  </span>
                </div>
                <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: "2px",
                    background: `linear-gradient(90deg, ${rank.color}88, ${rank.color})`,
                    width: `${progress * 100}%`,
                    boxShadow: `0 0 8px ${rank.glowColor}`,
                    transition: "width 1s cubic-bezier(0.22,1,0.36,1)",
                  }} />
                </div>
              </div>
            )}
            {isMax && (
              <div style={{ fontSize: "0.58rem", color: rank.color, fontFamily: "'Cinzel', serif", letterSpacing: "2px", opacity: 0.85 }}>
                ∞ MAXIMUM RANK ACHIEVED
              </div>
            )}
          </div>

          {/* Score */}
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.4rem, 4vw, 2rem)", fontWeight: 700, color: rank.color, lineHeight: 1, filter: `drop-shadow(0 0 8px ${rank.glowColor})` }}>
              {score.toLocaleString()}
            </div>
            <div style={{ fontSize: "0.44rem", letterSpacing: "2px", color: "rgba(200,190,220,0.4)", fontFamily: "'Cinzel', serif" }}>
              DARKNESS SCORE
            </div>
          </div>
        </div>

        {/* Tier pips */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", gap: "0.4rem", marginTop: "1rem", justifyContent: "center" }}>
          {DARKNESS_RANKS.map(r => (
            <div key={r.tier} style={{
              height: "3px", flex: 1, borderRadius: "2px", maxWidth: "60px",
              background: r.tier <= rank.tier ? r.color : "rgba(255,255,255,0.07)",
              boxShadow: r.tier <= rank.tier ? `0 0 6px ${r.glowColor}` : "none",
              transition: "all 0.5s ease",
            }} />
          ))}
        </div>
      </div>
    </>
  );
}
