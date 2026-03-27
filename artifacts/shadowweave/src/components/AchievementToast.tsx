import { useEffect, useState, useRef } from "react";
import type { Achievement } from "../lib/achievements";

const RARITY_PALETTE: Record<string, { accent: string; glow: string; label: string }> = {
  common:    { accent: "#94A3B8", glow: "rgba(148,163,184,0.35)", label: "COMMON" },
  rare:      { accent: "#60A5FA", glow: "rgba(96,165,250,0.4)",   label: "RARE" },
  epic:      { accent: "#C084FC", glow: "rgba(192,132,252,0.45)", label: "EPIC" },
  legendary: { accent: "#F5D67A", glow: "rgba(245,214,122,0.5)",  label: "LEGENDARY" },
};

const DISPLAY_MS = 5200;
const PROGRESS_MS = 5000;

interface ToastItem {
  ach: Achievement;
  key: number;
}

export default function AchievementToastManager() {
  const [queue, setQueue] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  useEffect(() => {
    function handler(e: Event) {
      const ach = (e as CustomEvent<Achievement>).detail;
      setQueue((q) => [...q, { ach, key: ++counter.current }]);
    }
    window.addEventListener("sw-achievement-unlocked", handler);
    return () => window.removeEventListener("sw-achievement-unlocked", handler);
  }, []);

  function dismiss(key: number) {
    setQueue((q) => q.filter((item) => item.key !== key));
  }

  return (
    <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 9999, display: "flex", flexDirection: "column-reverse", gap: "0.75rem", pointerEvents: "none" }}>
      {queue.slice(0, 3).map((item) => (
        <AchievementToast key={item.key} item={item} onDismiss={() => dismiss(item.key)} />
      ))}
    </div>
  );
}

function AchievementToast({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const { ach } = item;
  const pal = RARITY_PALETTE[ach.rarity] ?? RARITY_PALETTE.common;
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 30);
    const t2 = setTimeout(() => setVisible(false), DISPLAY_MS - 400);
    const t3 = setTimeout(onDismiss, DISPLAY_MS);

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.max(0, 100 - (elapsed / PROGRESS_MS) * 100));
    }, 40);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearInterval(interval); };
  }, []);

  return (
    <div
      style={{
        pointerEvents: "auto",
        width: "320px",
        background: "rgba(6, 2, 16, 0.97)",
        border: `1px solid rgba(${hexToRgb(pal.accent)}, 0.5)`,
        borderLeft: `3px solid ${pal.accent}`,
        borderRadius: "12px",
        overflow: "hidden",
        backdropFilter: "blur(24px)",
        boxShadow: `0 0 0 1px rgba(${hexToRgb(pal.accent)}, 0.12), 0 8px 40px rgba(0,0,0,0.7), 0 0 60px ${pal.glow}`,
        transform: visible ? "translateX(0)" : "translateX(calc(100% + 2rem))",
        opacity: visible ? 1 : 0,
        transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease",
        cursor: "pointer",
      }}
      onClick={onDismiss}
    >
      {/* Top shimmer */}
      <div style={{ height: "1px", background: `linear-gradient(90deg, transparent, ${pal.accent}, transparent)` }} />

      <div style={{ padding: "0.9rem 1rem 0.75rem" }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.55rem" }}>
          <div style={{
            width: "38px", height: "38px", borderRadius: "10px", flexShrink: 0,
            background: `rgba(${hexToRgb(pal.accent)}, 0.12)`,
            border: `1px solid rgba(${hexToRgb(pal.accent)}, 0.3)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.35rem",
            boxShadow: `0 0 20px ${pal.glow}`,
          }}>
            {ach.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.18rem" }}>
              <span style={{ fontSize: "0.36rem", letterSpacing: "2.5px", color: pal.accent, fontFamily: "'Montserrat', sans-serif", fontWeight: 700, textTransform: "uppercase" }}>
                Achievement Unlocked · {pal.label}
              </span>
            </div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: "0.78rem", fontWeight: 700, color: "#FFF", letterSpacing: "0.02em", lineHeight: 1.2 }}>
              {ach.title}
            </div>
          </div>
          <span style={{ fontSize: "0.7rem", color: pal.accent, fontFamily: "'Cinzel', serif", fontWeight: 700, flexShrink: 0, border: `1px solid rgba(${hexToRgb(pal.accent)},0.3)`, borderRadius: "6px", padding: "2px 6px", background: `rgba(${hexToRgb(pal.accent)},0.1)` }}>
            +{ach.xp} XP
          </span>
        </div>

        {/* Lore */}
        <div style={{ fontSize: "0.6rem", color: "rgba(200,195,235,0.45)", fontFamily: "'Raleway', sans-serif", fontStyle: "italic", lineHeight: 1.5, paddingLeft: "0.15rem" }}>
          "{ach.lore}"
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: "2px", background: "rgba(255,255,255,0.04)" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: pal.accent, transition: "width 0.04s linear", borderRadius: "0 1px 1px 0" }} />
      </div>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r},${g},${b}`;
}
