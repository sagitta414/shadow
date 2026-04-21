import { useState, useEffect, useRef } from "react";
import type { ArchivedStory } from "../lib/archive";

interface Props {
  story: ArchivedStory;
  onClose: () => void;
  initialChapter?: number;
  onContinue?: (storyId: string) => void;
}

const MOOD_WORDS: { words: string[]; label: string; color: string }[] = [
  { words: ["scream","agony","terror","horror","nightmare","shriek","panic"], label: "TERROR", color: "#FF2244" },
  { words: ["break","shatter","surrender","submit","helpless","broken","crumbled"], label: "BREAKING", color: "#FF6600" },
  { words: ["hunger","desire","arousal","pleasure","heat","ache"], label: "SURRENDER", color: "#CC44FF" },
  { words: ["struggle","resist","fight","defy","refused","defiance"], label: "DEFIANCE", color: "#4499FF" },
  { words: ["silence","cold","calculating","watch","patient","methodical"], label: "CONTROLLED", color: "#44DDAA" },
  { words: ["despair","hopeless","lost","forgotten","hollow","empty","void"], label: "DESPAIR", color: "#8866BB" },
];

function detectMood(text: string): { label: string; color: string } {
  const lower = text.toLowerCase();
  let best = { label: "TENSION", color: "#FFB800", score: 0 };
  for (const { words, label, color } of MOOD_WORDS) {
    const score = words.filter((w) => lower.includes(w)).length;
    if (score > best.score) best = { label, color, score };
  }
  return best;
}

function estimateReadTime(text: string): string {
  const words = text.split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 230));
  return `${mins} min read`;
}

export default function StoryReader({ story, onClose, initialChapter = 0, onContinue }: Props) {
  const [chapter, setChapter] = useState(initialChapter);
  const [fontSize, setFontSize] = useState(19);
  const [shown, setShown] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const total = story.chapters.length;
  const currentText = story.chapters[chapter] ?? "";
  const mood = detectMood(currentText);
  const readTime = estimateReadTime(currentText);

  useEffect(() => {
    const t = setTimeout(() => setShown(true), 30);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
  }, [chapter]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goPrev();
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function goNext() { if (chapter < total - 1) setChapter((c) => c + 1); }
  function goPrev() { if (chapter > 0) setChapter((c) => c - 1); }
  function handleClose() {
    setShown(false);
    setTimeout(onClose, 300);
  }

  const progress = total > 1 ? ((chapter + 1) / total) * 100 : 100;
  const heroine = story.characters[0] ?? "";
  const villain = story.characters[1] ?? "";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1200,
      background: "rgba(2,0,8,0.97)",
      display: "flex", flexDirection: "column",
      opacity: shown ? 1 : 0,
      transition: "opacity 0.3s ease",
    }}>
      <style>{`
        @keyframes srGlow { 0%,100%{opacity:0.3;}50%{opacity:0.6;} }
        @keyframes srFadeUp { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
        .sr-chapter-text { animation: srFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .sr-nav-btn:hover { background: rgba(255,255,255,0.06) !important; }
        .sr-close:hover { color: rgba(255,255,255,0.9) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
      `}</style>

      {/* Ambient glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at 50% 20%, ${mood.color}06 0%, transparent 60%)`,
        animation: "srGlow 6s ease-in-out infinite",
      }} />

      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center",
        padding: "0 2rem", height: "56px",
        borderBottom: "1px solid rgba(255,255,255,0.045)",
        background: "rgba(2,0,8,0.95)",
        backdropFilter: "blur(20px)",
        flexShrink: 0, gap: "1rem",
        position: "relative", zIndex: 2,
      }}>
        <button
          className="sr-close"
          onClick={handleClose}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.35)", fontSize: "1.1rem",
            lineHeight: 1, padding: "0.25rem",
            transition: "color 0.15s",
          }}
        >✕</button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "0.65rem", letterSpacing: "2px",
            color: "rgba(255,255,255,0.6)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {story.title}
          </div>
          {(heroine || villain) && (
            <div style={{
              fontSize: "0.5rem", letterSpacing: "1.5px",
              color: "rgba(255,255,255,0.25)",
              marginTop: "0.1rem",
            }}>
              {[heroine, villain].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>

        {/* Mood */}
        <div style={{
          display: "flex", alignItems: "center", gap: "0.4rem",
          padding: "0.25rem 0.75rem",
          background: `${mood.color}10`,
          border: `1px solid ${mood.color}28`,
          borderRadius: "20px",
          flexShrink: 0,
        }}>
          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: mood.color, animation: "srGlow 2s ease-in-out infinite" }} />
          <span style={{ fontSize: "0.48rem", letterSpacing: "2px", color: mood.color, fontFamily: "'Cinzel', serif" }}>
            {mood.label}
          </span>
        </div>

        {/* Font size */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexShrink: 0 }}>
          <button
            onClick={() => setFontSize((s) => Math.max(14, s - 2))}
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: "0.2rem 0.5rem", fontSize: "0.65rem", lineHeight: 1 }}
          >A−</button>
          <button
            onClick={() => setFontSize((s) => Math.min(28, s + 2))}
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: "0.2rem 0.5rem", fontSize: "0.8rem", lineHeight: 1 }}
          >A+</button>
        </div>

        {/* Read time */}
        <div style={{ fontSize: "0.5rem", color: "rgba(255,255,255,0.22)", letterSpacing: "1.5px", flexShrink: 0 }}>
          {readTime}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: "2px", background: "rgba(255,255,255,0.04)", flexShrink: 0, position: "relative", zIndex: 2 }}>
        <div style={{
          height: "100%", width: `${progress}%`,
          background: `linear-gradient(90deg, ${mood.color}88, ${mood.color})`,
          transition: "width 0.4s ease",
          boxShadow: `0 0 8px ${mood.color}44`,
        }} />
      </div>

      {/* Chapter nav strip */}
      {total > 1 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: "0.5rem", padding: "0.6rem 2rem",
          borderBottom: "1px solid rgba(255,255,255,0.03)",
          flexShrink: 0, flexWrap: "wrap",
          position: "relative", zIndex: 2,
        }}>
          {story.chapters.map((_, i) => (
            <button
              key={i}
              onClick={() => setChapter(i)}
              style={{
                padding: "0.18rem 0.6rem",
                background: i === chapter ? "rgba(255,255,255,0.08)" : "transparent",
                border: `1px solid ${i === chapter ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: "12px",
                color: i === chapter ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.28)",
                fontFamily: "'Cinzel', serif",
                fontSize: "0.48rem",
                letterSpacing: "1.5px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Reading area */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, overflowY: "auto",
          padding: "4rem 2rem",
          position: "relative", zIndex: 1,
        }}
      >
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          {/* Chapter label */}
          <div style={{
            textAlign: "center", marginBottom: "3rem",
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "1rem",
            }}>
              <div style={{ width: "40px", height: "1px", background: `linear-gradient(90deg, transparent, ${mood.color}44)` }} />
              <span style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "0.55rem", letterSpacing: "4px",
                color: mood.color, opacity: 0.7,
                textTransform: "uppercase",
              }}>
                Chapter {chapter + 1}{total > 1 ? ` of ${total}` : ""}
              </span>
              <div style={{ width: "40px", height: "1px", background: `linear-gradient(90deg, ${mood.color}44, transparent)` }} />
            </div>
          </div>

          {/* Story text */}
          <div className="sr-chapter-text" key={chapter}>
            {currentText.split(/\n\n+/).map((para, i) => (
              <p key={i} style={{
                fontFamily: "'EB Garamond', Georgia, serif",
                fontSize: `${fontSize}px`,
                lineHeight: 1.9,
                color: "rgba(230,222,240,0.88)",
                marginBottom: "1.6em",
                textAlign: "justify",
                textIndent: "2em",
              }}>
                {para.trim()}
              </p>
            ))}
          </div>

          {/* End of chapter ornament */}
          <div style={{ textAlign: "center", marginTop: "3rem", marginBottom: "1rem" }}>
            <span style={{ color: `${mood.color}44`, fontSize: "1.2rem" }}>◆</span>
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.75rem 1.25rem",
        borderTop: "1px solid rgba(255,255,255,0.045)",
        background: "rgba(2,0,8,0.95)",
        backdropFilter: "blur(20px)",
        flexShrink: 0, gap: "0.6rem",
        position: "relative", zIndex: 2,
        flexWrap: "wrap",
      }}>
        <button
          className="sr-nav-btn"
          onClick={goPrev}
          disabled={chapter === 0}
          style={{
            padding: "0.5rem 1rem",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "10px",
            color: chapter === 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.6)",
            fontFamily: "'Cinzel', serif",
            fontSize: "0.6rem", letterSpacing: "1.5px",
            cursor: chapter === 0 ? "not-allowed" : "pointer",
            transition: "all 0.15s",
          }}
        >
          ← Prev
        </button>

        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: "0.5rem", letterSpacing: "2px",
          color: "rgba(255,255,255,0.2)",
          flexShrink: 0,
        }}>
          {chapter + 1} / {total}
        </div>

        {onContinue && story.id !== "tmp" && (
          <button
            onClick={() => { handleClose(); setTimeout(() => onContinue(story.id), 320); }}
            style={{
              padding: "0.5rem 1rem",
              background: "rgba(52,211,153,0.1)",
              border: "1px solid rgba(52,211,153,0.35)",
              borderRadius: "10px",
              color: "#34D399",
              fontFamily: "'Cinzel', serif",
              fontSize: "0.55rem", letterSpacing: "1.5px",
              cursor: "pointer",
              transition: "all 0.15s",
              flexShrink: 0,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            ➕ Continue
          </button>
        )}

        <button
          className="sr-nav-btn"
          onClick={goNext}
          disabled={chapter === total - 1}
          style={{
            padding: "0.5rem 1rem",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "10px",
            color: chapter === total - 1 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.6)",
            fontFamily: "'Cinzel', serif",
            fontSize: "0.6rem", letterSpacing: "1.5px",
            cursor: chapter === total - 1 ? "not-allowed" : "pointer",
            transition: "all 0.15s",
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
