import { useState, useEffect, useCallback } from "react";

interface Props {
  story: string;
  title: string;
  heroineName: string;
  heroineColor: string;
  villain: string;
  onExit: () => void;
}

export default function CinematicReader({ story, title, heroineName, heroineColor, villain, onExit }: Props) {
  const paragraphs = story.split(/\n+/).filter(p => p.trim().length > 20);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [readingTime, setReadingTime] = useState(0);

  const wordCount = (p: string) => p.split(/\s+/).filter(Boolean).length;
  const calcDelay = (p: string) => Math.max(3000, (wordCount(p) / 3.5) * 1000);

  const goTo = useCallback((newIdx: number) => {
    setVisible(false);
    setTimeout(() => { setIdx(newIdx); setVisible(true); }, 350);
  }, []);

  const next = useCallback(() => { if (idx < paragraphs.length - 1) goTo(idx + 1); }, [idx, paragraphs.length, goTo]);
  const prev = useCallback(() => { if (idx > 0) goTo(idx - 1); }, [idx, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, onExit]);

  // Auto-play
  useEffect(() => {
    if (!autoPlay) return;
    const delay = calcDelay(paragraphs[idx] ?? "");
    const t = setTimeout(() => { if (idx < paragraphs.length - 1) next(); else setAutoPlay(false); }, delay);
    return () => clearTimeout(t);
  }, [autoPlay, idx, paragraphs]);

  // Track total reading time
  useEffect(() => {
    const t = setInterval(() => setReadingTime(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const pct = Math.round(((idx + 1) / paragraphs.length) * 100);
  const isLast = idx === paragraphs.length - 1;
  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // Detect chapter break marker
  const current = paragraphs[idx] ?? "";
  const isChapterMark = current.includes("---");

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9998, background:"#000", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
      <style>{`
        @keyframes cr-fadein { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);} }
        @keyframes cr-glow { 0%,100%{box-shadow:0 0 80px ${heroineColor}11;}50%{box-shadow:0 0 160px ${heroineColor}22;} }
        @keyframes cr-pulse { 0%,100%{opacity:1;}50%{opacity:0.45;} }
      `}</style>

      {/* Ambient glow */}
      <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse 70% 50% at 50% 50%, ${heroineColor}08 0%, transparent 70%)`, animation:"cr-glow 6s ease-in-out infinite" }} />

      {/* Top bar */}
      <div style={{ position:"absolute", top:0, left:0, right:0, padding:"1rem 2rem", display:"flex", alignItems:"center", justifyContent:"space-between", background:"linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)", zIndex:10 }}>
        <div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"5px", color:"rgba(200,168,75,0.35)", textTransform:"uppercase", marginBottom:"0.15rem" }}>Cinematic Mode</div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:"0.72rem", color:"rgba(220,210,180,0.6)", fontWeight:700, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"400px" }}>{title}</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            title={autoPlay ? "Pause auto-read" : "Auto-read"}
            style={{ background: autoPlay ? `rgba(${heroineColor},0.1)` : "rgba(255,255,255,0.04)", border:`1px solid ${autoPlay ? heroineColor + "55" : "rgba(255,255,255,0.08)"}`, borderRadius:"20px", padding:"0.3rem 0.85rem", color: autoPlay ? heroineColor : "rgba(200,200,220,0.35)", fontFamily:"'Cinzel',serif", fontSize:"0.45rem", letterSpacing:"2px", cursor:"pointer", textTransform:"uppercase", transition:"all 0.2s", animation: autoPlay ? "cr-pulse 2s ease-in-out infinite" : "none" }}
          >
            {autoPlay ? "⏸ Pause" : "▶ Auto"}
          </button>
          <div style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"0.42rem", color:"rgba(200,168,75,0.3)", letterSpacing:"1px" }}>{fmtTime(readingTime)}</div>
          <button onClick={onExit} style={{ background:"none", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"8px", padding:"0.35rem 0.8rem", color:"rgba(200,200,220,0.35)", fontFamily:"'Cinzel',serif", fontSize:"0.45rem", cursor:"pointer", letterSpacing:"2px", transition:"all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(200,50,50,0.4)"; e.currentTarget.style.color="rgba(220,100,100,0.7)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; e.currentTarget.style.color="rgba(200,200,220,0.35)"; }}
          >✕ Exit</button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"rgba(255,255,255,0.04)", zIndex:11 }}>
        <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg, ${heroineColor}88, ${heroineColor})`, transition:"width 0.4s ease", boxShadow:`0 0 8px ${heroineColor}66` }} />
      </div>

      {/* Main paragraph */}
      <div style={{ maxWidth:"680px", width:"100%", padding:"0 2.5rem", textAlign:"center", position:"relative", zIndex:5 }}>

        {/* Heroine / Villain line */}
        <div style={{ marginBottom:"2.5rem", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.8rem" }}>
          <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", color: heroineColor, letterSpacing:"3px", textTransform:"uppercase", textShadow:`0 0 20px ${heroineColor}66` }}>{heroineName}</span>
          <span style={{ fontSize:"0.45rem", color:"rgba(200,168,75,0.25)" }}>✕</span>
          <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.52rem", color:"rgba(200,190,230,0.4)", letterSpacing:"3px", textTransform:"uppercase" }}>{villain}</span>
        </div>

        {/* Paragraph text */}
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition:"opacity 0.35s ease, transform 0.35s ease" }}>
          {isChapterMark ? (
            <div style={{ display:"flex", alignItems:"center", gap:"1.2rem" }}>
              <div style={{ flex:1, height:"1px", background:"rgba(200,168,75,0.2)" }} />
              <span style={{ fontFamily:"'Cinzel',serif", fontSize:"0.5rem", letterSpacing:"5px", color:"rgba(200,168,75,0.4)", textTransform:"uppercase" }}>New Chapter</span>
              <div style={{ flex:1, height:"1px", background:"rgba(200,168,75,0.2)" }} />
            </div>
          ) : (
            <p style={{ fontFamily:"'EB Garamond',Georgia,serif", fontSize:"clamp(1rem,2.2vw,1.35rem)", lineHeight:2, color:"rgba(235,228,215,0.88)", margin:0, letterSpacing:"0.02em" }}>
              {current}
            </p>
          )}
        </div>

        {/* Paragraph counter */}
        <div style={{ marginTop:"2.5rem", fontFamily:"'Cinzel',serif", fontSize:"0.42rem", letterSpacing:"4px", color:"rgba(200,168,75,0.22)", textTransform:"uppercase" }}>
          {idx + 1} / {paragraphs.length}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ position:"absolute", bottom:"8%", left:0, right:0, display:"flex", alignItems:"center", justifyContent:"center", gap:"1.5rem", zIndex:10 }}>
        <button
          onClick={prev} disabled={idx === 0}
          style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"50%", width:"46px", height:"46px", display:"flex", alignItems:"center", justifyContent:"center", color: idx === 0 ? "rgba(255,255,255,0.1)" : "rgba(200,168,75,0.6)", fontSize:"1rem", cursor: idx === 0 ? "not-allowed" : "pointer", transition:"all 0.2s" }}
          onMouseEnter={e => { if (idx > 0) { e.currentTarget.style.background="rgba(200,168,75,0.1)"; e.currentTarget.style.borderColor="rgba(200,168,75,0.4)"; } }}
          onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; }}
        >‹</button>

        {/* Dot track */}
        <div style={{ display:"flex", alignItems:"center", gap:"4px", maxWidth:"280px", overflow:"hidden" }}>
          {paragraphs.slice(Math.max(0, idx - 5), Math.min(paragraphs.length, idx + 6)).map((_, i) => {
            const actualIdx = Math.max(0, idx - 5) + i;
            return (
              <div key={actualIdx} onClick={() => goTo(actualIdx)} style={{ width: actualIdx === idx ? "18px" : "5px", height:"5px", borderRadius:"3px", background: actualIdx === idx ? heroineColor : actualIdx < idx ? `${heroineColor}44` : "rgba(255,255,255,0.1)", transition:"all 0.3s", cursor:"pointer", flexShrink:0 }} />
            );
          })}
        </div>

        {isLast ? (
          <button
            onClick={onExit}
            style={{ background:`linear-gradient(135deg, ${heroineColor}88, ${heroineColor}55)`, border:"none", borderRadius:"50%", width:"46px", height:"46px", display:"flex", alignItems:"center", justifyContent:"center", color:"#0a0808", fontSize:"0.8rem", fontWeight:900, cursor:"pointer", boxShadow:`0 0 20px ${heroineColor}44`, transition:"all 0.2s" }}
          >✓</button>
        ) : (
          <button
            onClick={next}
            style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"50%", width:"46px", height:"46px", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(200,168,75,0.6)", fontSize:"1rem", cursor:"pointer", transition:"all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(200,168,75,0.1)"; e.currentTarget.style.borderColor="rgba(200,168,75,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; }}
          >›</button>
        )}
      </div>

      {/* Keyboard hint */}
      <div style={{ position:"absolute", bottom:"2%", fontFamily:"'Montserrat',sans-serif", fontSize:"0.38rem", color:"rgba(255,255,255,0.08)", letterSpacing:"2px", textTransform:"uppercase" }}>
        ← → arrow keys · space to advance · esc to exit
      </div>
    </div>
  );
}
